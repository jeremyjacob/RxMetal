/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import {
	Subject,
	fromEvent,
	map,
	merge,
	scan,
	startWith,
	withLatestFrom,
} from 'rxjs';
import { html } from './lib';
import { If, Switch, shadow } from './lib/std';
import { Router, location$, route } from './lib/std/router';

const CounterExample = () => {
	const Increment = html`<button>Increment</button>`;
	const Decrement = html`<button>Decrement</button>`;

	const count$ = merge(
		fromEvent(Increment, 'click').pipe(map(() => 1)),
		fromEvent(Decrement, 'click').pipe(map(() => -1))
	).pipe(
		scan((count, change) => count + change, 0),
		startWith(0)
	);

	return html`<div>
		${Increment} ${Decrement}
		<p>Count: ${count$}</p>
	</div>`;
};

const CollapseExample = () => {
	const toggle$ = new Subject<Event>();
	const open$ = toggle$.pipe(
		scan((open) => !open, true),
		startWith(true)
	);

	return html`
		<div>
			<button on:click=${toggle$}>
				${open$.pipe(map((open) => (open ? 'Close' : 'Open')))}
			</button>
			${If(open$, html`<p>This is an example collapseable.</p>`)}
		</div>
	`;
};

/** Sync input value from two inputs using rxjs observables */
const InputExample = () => {
	const InputA = html<HTMLInputElement>` <input type="text" /> `;
	const InputB = html<HTMLInputElement>` <input type="text" /> `;

	const setValues = (value: string) => {
		InputA.value = value;
		InputB.value = value;
	};
	fromEvent(InputA, 'input')
		.pipe(
			map((e) => (e.target as HTMLInputElement).value),
			startWith('')
		)
		.subscribe(setValues);

	fromEvent(InputB, 'input')
		.pipe(
			map((e) => (e.target as HTMLInputElement).value),
			startWith('')
		)
		.subscribe(setValues);

	return html`
		<div>
			<h2>Input Example</h2>
			${InputA} ${InputB}
		</div>
	`;
};

const ShadowStylingExample = () => {
	const Shadow = shadow(
		html`<div>
			<p style="">Test</h2>
		</div>`,
		html`
			<style>
				p {
					color: lightblue;
				}
			</style>
		`
	);

	return Shadow;
};

const Sidebar = () => {
	const activeClass = (path: string) =>
		location$.pipe(map((loc) => (loc.pathname === path ? 'active' : '')));
	return shadow(
		html`<nav>
			<h2>Examples</h2>
			<ul>
				<li class="${activeClass('/')}">
					${route(html`<a href="/">Home</a>`)}
				</li>
				<li class="${activeClass('/counter')}">
					${route(html`<a href="/counter">Counter</a>`)}
				</li>
				<li class="${activeClass('/input')}">
					${route(html`<a href="/input">Input</a>`)}
				</li>
				<li class="${activeClass('/collapse')}">
					${route(html`<a href="/collapse">Collapse</a>`)}
				</li>
				<li class="${activeClass('/shadow')}">
					${route(html`<a href="/shadow">Shadow Styling</a>`)}
				</li>
			</ul>
		</nav>`,
		html`<style>
			nav {
				padding: 0.25rem 1.25rem;
				background-color: rgba(var(--color), 0.05);
				border: 1px solid rgba(var(--color), 0.1);
				border-radius: 10px;
				min-width: 12rem;
			}

			h2 {
				font-size: 0.75rem;
				opacity: 0.6;
				text-transform: uppercase;
				letter-spacing: 0.05rem;
				font-weight: 600;
				margin-bottom: 0.5rem;
			}

			ul {
				display: flex;
				flex-direction: column;
				list-style: none;
				margin-top: 0;
				padding-left: 0;
				gap: 0.25rem;
			}
			a {
				text-decoration: none;
				color: inherit;
			}
			a:hover {
				text-decoration: underline;
			}

			.active {
				font-weight: 600;
			}
		</style>`
	);
};

const Main = shadow(
	html`<main>
		${Sidebar()}
		${Router({
			'/': () =>
				html`<div>
					<h1>RxMetal</h1>
					<p>Click an example on the left</p>
				</div>`,
			'/counter': CounterExample,
			'/collapse': CollapseExample,
			'/input': InputExample,
			'/shadow': ShadowStylingExample,
		})}
	</main>`,
	html`<style>
		main {
			display: flex;
			gap: 1.75rem;
		}
		h1 {
			margin-top: 0;
			margin-bottom: 0;
		}
	</style>`
);

document.body.appendChild(Main);

fetch('/reload').finally(() => location.reload());
