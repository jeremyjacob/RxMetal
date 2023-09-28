import { Observable, Subject, isObservable } from "rxjs";
import { walk } from "./utils";

export type BasicProp =
    | string // Static string
    | boolean // Static boolean
    | number // Static number
    | ChildNode // Node binding
    | ChildNode[] // Node bindings
    | Subject<Event> // Event binding with on:
    | Subject<string> // Attribute binding with bind:
    | null // Nothing rendered
    | undefined; // Nothing rendered
export type Prop = BasicProp | Observable<BasicProp>;

export function html<T = ChildNode>(
    strings: TemplateStringsArray,
    ...values: Prop[]
): T {
    const result = constructHTMLResult(strings, values);
    const parser = new DOMParser();
    const doc = parser.parseFromString(result, "text/html");

    const insertEls = doc.querySelectorAll("framework-insert-element");
    for (let i = 0; i < insertEls.length; i++) {
        const id = insertEls[i].getAttribute("data-id");
        if (id === null) {
            throw new Error(
                "Missing `data-id` attribute on <framework-insert-element>",
            );
        }
        replaceDOMElement(insertEls[i], values[Number(id)]);
    }

    const bodyChild: Node | undefined = doc.body.childNodes[0];
    const headChild: Node | undefined = doc.head.childNodes[0];
    const child = bodyChild ?? headChild;

    if (doc.body.childNodes.length > 1) {
        console.warn(
            `html template may only have a single root node, found ${doc.body.childNodes.length} nodes: ${doc.body.innerHTML}`,
        );
    } else if (!child) {
        throw new Error(`html template must have a root node`);
    }

    walk(doc.body, (node) => {
        if (!(node instanceof HTMLElement)) return;
        replaceAttributeValues(node, values);
    });

    if (headChild && bodyChild) {
        console.warn(
            "html template contains both head and body elements, ignoring head",
        );
    }

    return child as T;
}

function constructHTMLResult(
    templateStringsArray: TemplateStringsArray,
    values: Prop[],
) {
    const strings = templateStringsArray.raw;

    let result = "";
    let inOpeningTag = false;

    for (let i = 0; i < strings.length; i++) {
        const string = strings[i];
        for (let i = 0; i < string?.length; i++) {
            if (string[i] === "<" && string[i + 1] !== "/") inOpeningTag = true;
            else if (string[i] === ">") inOpeningTag = false;
        }

        result += templateStringsArray.raw[i];
        if (inOpeningTag) {
            result += `framework-insert-attr=${i}$`;
        } else {
            if (i < values.length) {
                result += `<framework-insert-element data-id="${i}"></framework-insert-element>`;
            }
        }
    }
    return result.trim();
}

function replaceDOMElement(element: Element, prop: Prop) {
    if (prop instanceof Node) {
        element.replaceWith(prop);
    } else if (Array.isArray(prop)) {
        element.replaceWith(...prop);
    } else if (prop == null) {
        element.replaceWith(document.createComment(""));
    } else if (
        typeof prop === "string" ||
        typeof prop === "number" ||
        typeof prop === "boolean"
    ) {
        element.replaceWith(document.createTextNode(prop.toString()));
    } else if (isObservable(prop)) {
        handleObservableProp(element, prop as Observable<BasicProp>);
    }
}

function handleObservableProp(element: Element, prop$: Observable<BasicProp>) {
    let currentNodes: Array<ChildNode | Comment> = [
        document.createTextNode(""),
    ];
    prop$.subscribe((value) => {
        currentNodes = replaceNodeValue(currentNodes, value);
    });
    // TODO: unsubscribe
    element.replaceWith(...currentNodes);
}

function replaceNodeValue(
    node: Array<ChildNode | Comment>,
    prop: BasicProp,
): Array<ChildNode | Comment> {
    if (prop instanceof Node) {
        node[0].replaceWith(prop);
        node.forEach((n, i) => i !== 0 && n.remove());
        return [prop];
    } else if (Array.isArray(prop)) {
        node[0].replaceWith(...prop);
        node.forEach((n, i) => i !== 0 && n.remove());
        // TODO: better algorithm
        return prop;
    } else if (prop == null) {
        const comment = document.createComment("");
        node[0].replaceWith(comment);
        node.forEach((n, i) => i !== 0 && n.remove());
        return [comment];
    } else {
        const textNode = document.createTextNode(prop.toString());
        node[0].replaceWith(textNode);
        node.forEach((n, i) => i !== 0 && n.remove());
        return [textNode];
    }
}

function replaceAttributeValues(element: HTMLElement, values: Prop[]) {
    for (const attr of element.attributes) {
        const search = "framework-insert-attr=";
        const startIndex = attr.value.indexOf(search);
        if (startIndex === -1) continue;
        const start = startIndex + search.length;
        const sliced = attr.value.slice(start);
        const end = sliced.indexOf("$");
        const valueIndex = Number(sliced.slice(0, end));
        const restBefore = attr.value.slice(0, start - search.length);
        const restAfter = sliced.slice(end + 1);

        if (isNaN(valueIndex)) {
            throw new Error(
                `Missing attribute value for ${attr.name} on ${element.outerHTML}`,
            );
        }

        const value = values[valueIndex];

        if (!isObservable(value)) {
            if (value != null) {
                element.setAttribute(attr.name, value.toString());
            }
            continue;
        }

        if ("next" in value) {
            // Event binding
            if (attr.name.startsWith("on:")) {
                bindEvent(element, attr, value as Subject<Event>);
            }
            // Property binding
            else if (attr.name.startsWith("bind:")) {
                bindProperty(element, attr, value as Subject<string>);
            }
        } else {
            // Attribute binding
            value.subscribe((value) => {
                const newValue =
                    value != null ? restBefore + value + restAfter : "";
                element.setAttribute(attr.name, newValue);
            });
        }
    }
}

function bindEvent(el: HTMLElement, attr: Attr, value: Subject<Event>) {
    const event = attr.name.slice("on:".length);
    el.addEventListener(event, (e) => value.next(e));
    el.removeAttribute(attr.name);
}

function bindProperty(el: HTMLElement, attr: Attr, value: Subject<string>) {
    const prop = attr.name.slice("bind:".length);
    if (
        prop === "value" &&
        (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
    ) {
        el.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            value.next(target.value);
        });
        // TODO: unsubscribe
        value.subscribe((value) => {
            el.value = value;
        });
        // TODO: unsubscribe
    }
}
