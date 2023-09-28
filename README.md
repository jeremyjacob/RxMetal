![RxMetal Frame 1](https://github.com/jeremyjacob/RxMetal/assets/44799944/debba470-8b2c-4a58-9023-64b4dc974930)

## What is RxMetal

RxMetal is an efficent, minimal library for creating reactive HTML components using RxJS. RxMetal works without a virtual DOM, instead keepign reference to and updating elements and text nodes directly.

## Examples

# Counter

`html` tagged template literals just return regular `Element`s, so you can use them anywhere you would use a DOM element.

```ts
import { html } from "rxmetal";
import { scan, fromEvent } from "rxjs";

const Counter = () => {
    const Button = html`<button>Increment</button>`;
    fromEvent(Button, "click").pipe(scan((count) => count + 1, 0));

    return html`<div>
        ${Button}
        <p>Count: ${count$}</p>
    </div>`;
};
```

Events listeners can also be registered using the `on:` directive:

```ts
import { Subject } from "rxjs";

const Counter = () => {
    const click$ = new Subject<Event>();
    const count$ = click$.pipe(scan((count) => count + 1, 0));

    return html`<div>
        <button on:click=${click$}>Increment</button>
        <p>Count: ${count$}</p>
    </div>`;
};
```

# Scoped styling

The `shadow` utility from `rxmetal/std` can be used encapsulate elements in a shadow root. It's most useful for styling components without leaking styles to the global scope.

```ts
import { html } from "rxmetal";
import { shadow } from "rxmetal/std";

const ShadowStyling = () => {
    return shadow(
        html`<p>Test</p>`,
        html`<style>
            p {
                color: cadetblue;
            }
        </style>`,
    );
};
```

## Usage

# npm

RxMetal is (not yet) available on npm:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
