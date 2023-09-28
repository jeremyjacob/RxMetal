import { Subject, fromEvent, map, scan, startWith } from "rxjs";
import { html } from "../lib";

export function BasicReactivity() {
    const click$ = new Subject<Event>();

    const count$ = click$.pipe(
        scan((count) => count + 1, 0),
        startWith(0),
    );

    return html`<button on:click=${click$}>
        Clicked ${count$}
        ${count$.pipe(map((count) => (count === 1 ? "time" : "times")))}
    </button>`;
}
