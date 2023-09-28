import { Subject, fromEvent, map, scan, startWith } from "rxjs";
import { html } from "../lib";
import { shadow } from "../lib/std";

export function InputBinding() {
    const value$ = new Subject<string>();

    return shadow(
        html`
            <div>
                <p>Text entered in one input will be reflected in the other.</p>
                <input type="text" bind:value=${value$} />
                <input type="text" bind:value=${value$} />
            </div>
        `,
        html`<style>
            input {
                border: 1px solid rgba(var(--color), 0.2);
                display: block;
                border-radius: 8px;
                padding: 0.35rem 0.4rem;
                margin-top: 0.5rem;
            }
        </style>`,
    );
}

/*
Svelte equivalent:

<script>
    let value = "";
</script>

<h2>Input Example</h2>

<input bind:value={value} />
<input bind:value={value} />
*/
