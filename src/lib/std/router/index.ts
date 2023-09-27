import { BehaviorSubject, Observable, map } from 'rxjs';
import { html } from '../..';

const locationSubject = new BehaviorSubject<Location>(window.location);
/**
 * Observable of the browser's current location/path.
 */
export const location$ = locationSubject.asObservable();

/**
 * Tells the router to listen for clicks on this anchor tag or its children.
 */
export function route(node: ChildNode) {
	if (node instanceof HTMLAnchorElement) {
		node.addEventListener('click', (e) => {
			e.preventDefault();
			history.pushState(null, '', node.href);
			locationSubject.next(window.location);
		});
		// TODO unsubscribe
	} else {
		for (let child of node.childNodes) {
			route(child);
		}
	}
	return node;
}

interface Routes {
	[key: `/${string}`]:
		| ((params: Record<string, string>) => ChildNode)
		| Routes;
}

/**
 * Router component
 * @example
 * Router({
 * 	'/': () => html``,
 * 	'/collapse': () => CollapseExample(),
 * 	'/post/:id': ({ id }) => html`<p>${id}</p>`,
 * 	'/nested1': {
 * 		'/': () => html`<p>Nested 1</p>`,
 * 		'/nested2': () => html`<p>Nested 2</p>`,
 * 	}
 * })
 */
export function Router(
	routes: Routes,
	fallback: () => ChildNode = () => html`<p>404</p>`
): Observable<ChildNode> {
	const entries = Object.entries(routes);
	const paramKeys = Object.fromEntries(
		entries.map(([route]) => [
			route,
			route.match(/:[a-zA-Z]+/g)?.map((s) => s.slice(1)) ?? [],
		])
	);
	const regexs = Object.fromEntries(
		entries.map(([route]) => [
			route,
			new RegExp(`^${route.replace(/:[a-zA-Z]+/g, '([a-zA-Z0-9]+)')}$`),
		])
	);

	function parseRoute(path: string, routes: Routes): ChildNode {
		for (let [route, handler] of Object.entries(routes)) {
			const match = path.match(regexs[route]);
			if (!match) continue;

			if (typeof handler == 'function') {
				const params = Object.fromEntries(
					paramKeys[route].map((key, i) => [key, match[i + 1]])
				);
				return handler(params);
			} else if (typeof handler == 'object') {
				return parseRoute(path, handler);
			}
		}
		return fallback();
	}

	return location$.pipe(
		map((location) => parseRoute(location.pathname, routes))
	);
}

addEventListener('popstate', () => {
	console.log('popstate');
	locationSubject.next(window.location);
});
