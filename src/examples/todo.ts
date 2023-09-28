import { BehaviorSubject, Observable, map } from "rxjs";
import { html } from "../lib";
import { shadow } from "../lib/std";

export function Todo() {
    type Todo = {
        text: string;
        checked: boolean;
    };

    const todos$ = new BehaviorSubject([
        { text: "Learn about RxJs", checked: true },
        { text: "Learn about RxMetal", checked: false },
        { text: "Build something awesome", checked: false },
    ]);

    const TodoItem = (todo: Observable<Todo>) =>
        html`<div>
            <input type="checkbox" />
            <input type="text" value=${todo.text} />
        </div>`;

    return shadow(
        html`<div>
            ${todos$.pipe(
                map((todos) => todos.map((todo) => html`${TodoItem(todo)}`)),
            )}
        </div>`,
        html`<style>
            /*  */
        </style>`,
    );
}
