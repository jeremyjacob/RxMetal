import { Observable, Subject, isObservable } from 'rxjs';
import { walk } from './utils';

export type BasicProp =
	| string
	| boolean
	| number
	| ChildNode
	| Subject<Event>
	| null
	| undefined;
export type Prop = BasicProp | Observable<BasicProp>;

export function html<T = ChildNode>(
	strings: TemplateStringsArray,
	...values: Prop[]
): T {
	const result = constructHTMLResult(strings, values);
	const parser = new DOMParser();
	const doc = parser.parseFromString(result, 'text/html');

	const insertEls = doc.querySelectorAll('framework-insert-element');
	for (let i = 0; i < insertEls.length; i++) {
		const id = insertEls[i].getAttribute('data-id');
		if (id === null) {
			throw new Error(
				'Missing `data-id` attribute on <framework-insert-element>'
			);
		}
		replaceDOMElement(insertEls[i], values[Number(id)]);
	}

	const bodyChild: Node | undefined = doc.body.childNodes[0];
	const headChild: Node | undefined = doc.head.childNodes[0];
	const child = bodyChild ?? headChild;

	if (doc.body.childNodes.length > 1) {
		console.warn(
			`html template may only have a single root node, found ${doc.body.childNodes.length} nodes: ${doc.body.innerHTML}`
		);
	} else if (!child) {
		throw new Error(`html template must have a root node`);
	}

	replaceAttributeValues(doc.body, values);

	if (headChild && bodyChild) {
		console.warn(
			'html template contains both head and body elements, ignoring head'
		);
	}

	return child as T;
}

function constructHTMLResult(
	templateStringsArray: TemplateStringsArray,
	values: Prop[]
) {
	const strings = templateStringsArray.raw;

	let result = '';
	let inOpeningTag = false;

	for (let i = 0; i < strings.length; i++) {
		const string = strings[i];
		for (let i = 0; i < string?.length; i++) {
			if (string[i] == '<' && string[i + 1] != '/') inOpeningTag = true;
			else if (string[i] == '>') inOpeningTag = false;
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
	} else if (prop == null) {
		element.replaceWith(document.createComment(''));
	} else if (
		typeof prop === 'string' ||
		typeof prop === 'number' ||
		typeof prop === 'boolean'
	) {
		element.replaceWith(document.createTextNode(prop.toString()));
	} else if (isObservable(prop)) {
		console.log(prop);
		handleObservableProp(element, prop as Observable<BasicProp>);
	}
}

function handleObservableProp(element: Element, prop$: Observable<BasicProp>) {
	let currentNode: ChildNode | Comment = document.createTextNode('');
	prop$.subscribe((value) => {
		currentNode = replaceNodeValue(currentNode, value);
	});
	// TODO: unsubscribe
	element.replaceWith(currentNode);
}

function replaceNodeValue(
	node: ChildNode | Comment,
	value: BasicProp
): ChildNode | Comment {
	if (value instanceof Node) {
		node.replaceWith(value);
		return value;
	} else if (value == null) {
		const comment = document.createComment('');
		node.replaceWith(comment);
		return comment;
	} else {
		node.textContent = value.toString();
		return node;
	}
}

function replaceAttributeValues(body: HTMLElement, values: Prop[]) {
	walk(body, (node) => {
		if (!(node instanceof HTMLElement)) return;

		for (const attr of node.attributes) {
			const search = 'framework-insert-attr=';
			const start = attr.value.indexOf(search) + search.length;
			const sliced = attr.value.slice(start);
			const end = sliced.indexOf('$');
			const number = Number(sliced.slice(0, end));
			const restBefore = attr.value.slice(0, start - search.length);
			const restAfter = sliced.slice(end + 1);

			if (isNaN(number)) {
				throw new Error(
					`Missing attribute value for ${attr.name} on ${node.outerHTML}`
				);
			}

			const value = values[number];
			if (!isObservable(value)) continue;

			if ('next' in value) {
				// Event binding
				if (attr.name.startsWith('on:')) {
					const event = attr.name.slice(3);
					node.addEventListener(event, (e) => value.next(e));
					node.removeAttribute(attr.name);
				}
			} else {
				// Attribute binding
				value.subscribe((value) => {
					const newValue =
						value != null ? restBefore + value + restAfter : '';
					node.setAttribute(attr.name, newValue);
				});
			}
		}
	});
}
