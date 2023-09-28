import { Subject, map, scan, startWith } from "rxjs";
import { html } from "../lib";
import { If } from "../lib/std";

export function IfExample() {
    const toggle$ = new Subject<Event>();
    const open$ = toggle$.pipe(
        scan((open) => !open, true),
        startWith(true),
    );

    return html`
        <div>
            <button on:click=${toggle$}>
                ${open$.pipe(map((open) => (open ? "Close" : "Open")))}
            </button>
            ${If(open$, html`<p>Hi there!</p>`)}
        </div>
    `;
}
