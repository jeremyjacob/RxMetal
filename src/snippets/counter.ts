import { fromEvent, scan, startWith } from 'rxjs';
import { html } from '../lib';

const Button = html`<button>Click me</button>`;
const clickCount$ = fromEvent(Button, 'click').pipe(
	scan((count) => count + 1, 0),
	startWith(0)
);
const ClickCount = html`<p>Click count: ${clickCount$}</p>`;
const Main = html` <div>${Button} ${ClickCount}</div> `;
