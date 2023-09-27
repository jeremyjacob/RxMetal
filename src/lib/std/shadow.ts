/**
 * Creates a shadow DOM tree with the given nodes. Useful for scoepd styling.
 * 
 * By default will copy all styles from the document head into the shadow DOM for intuitive global styling.
 * 
 * @returns a `shadow-root` element with `display: contents`.
 * 
 * @example
 * ```ts
 * shadow(
 *     html`<p>Hello</h2>`,
 *     html`<style>
 *         p {
 *             color: lightblue;
 *         }
*      </style>`
*  );
```
 */
export function shadow(...nodes: ChildNode[]) {
	const stylesElements = document.head.querySelectorAll('style');
	const styleLinks = document.head.querySelectorAll('link[rel="stylesheet"]');
	const styles = [...stylesElements, ...styleLinks].map((node) =>
		node.cloneNode(true)
	);

	const shadow = document.createElement('shadow-root');
	shadow.style.display = 'contents';
	const shadowRoot = shadow.attachShadow({ mode: 'open' });
	shadowRoot.append(...styles);
	nodes.forEach((node) => shadowRoot.appendChild(node));
	return shadow;
}
