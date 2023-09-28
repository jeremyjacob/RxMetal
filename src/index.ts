/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import {
    Subject,
    fromEvent,
    interval,
    map,
    merge,
    scan,
    startWith,
} from "rxjs";
import { html } from "./lib";
import { If, shadow } from "./lib/std";
import { Router, location$, route } from "./lib/std/router";
import { BasicReactivity } from "./examples/basic_reactivity";
import { ScopedStyling } from "./examples/scoped_styling";
import { InputBinding } from "./examples/input_binding";
import { Todo } from "./examples/todo";

const Sidebar = () => {
    const activeClass = (path: string) =>
        location$.pipe(map((loc) => (loc.pathname === path ? "active" : "")));

    return shadow(
        html`<nav>
            <h2>Examples</h2>
            <ul>
                <li class="${activeClass("/")}">
                    ${route(html`<a href="/">Home</a>`)}
                </li>
                <li class="${activeClass("/counter")}">
                    ${route(html`<a href="/counter">Counter</a>`)}
                </li>
                <li class="${activeClass("/inputs")}">
                    ${route(html`<a href="/inputs">Input</a>`)}
                </li>
                <li class="${activeClass("/if")}">
                    ${route(html`<a href="/if">Conditional Rendering</a>`)}
                </li>
                <li class="${activeClass("/styling")}">
                    ${route(html`<a href="/styling">Shadow Styling</a>`)}
                </li>
                <li class="${activeClass("/todo")}">
                    ${route(html`<a href="/todo">Todo List</a>`)}
                </li>
                <li class="${activeClass("/testing")}">
                    ${route(html`<a href="/testing">Testing</a>`)}
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
        </style>`,
    );
};

const Testing = () => {
    const X = () => (console.log("hi"), "element 1");

    const arr$ = interval(10).pipe(
        startWith(0),
        map((i) => [X(), "element 2", `counter ${i}`]),
    );

    return shadow(
        html`<div>
            ${arr$.pipe(map((arr) => arr.map((el) => html`<div>${el}</div>`)))}
        </div>`,
        html`<style>
            /*  */
        </style>`,
    );
};

const Main = shadow(
    html`<div id="app">
        ${Sidebar()}
        <main>
            ${Router({
                "/": () =>
                    html`<div>
                        <h1>RxMetal</h1>
                        <p>Click an example on the left</p>
                    </div>`,
                "/counter": () => BasicReactivity(),
                "/styling": () => ScopedStyling(),
                "/inputs": () => InputBinding(),
                "/todo": () => Todo(),
                "/testing": () => Testing(),
            })}
        </main>
    </div>`,
    html`<style>
        div#app {
            display: flex;
            gap: 1.75rem;
        }
        h1 {
            margin-top: 0;
            margin-bottom: 0;
        }
    </style>`,
);

document.body.appendChild(Main);

fetch("/reload").finally(() => location.reload());
