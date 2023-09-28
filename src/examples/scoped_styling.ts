import { html } from "../lib";
import { shadow } from "../lib/std";

export function ScopedStyling() {
    const Shadow = shadow(
        html`<div>
            <p style="">Test</p>
        </div>`,
        html`<style>
            p {
                color: lightblue;
            }
        </style>`,
    );

    return Shadow;
}
