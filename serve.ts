import { readdir } from 'fs/promises';
import { watch } from 'chokidar';

let resolvers: Array<(value: Response | PromiseLike<Response>) => void> = [];
const awaitReload = () => {
	return new Promise<Response>((resolve) => resolvers.push(resolve));
};
function notifyReload() {
	resolvers.forEach((resolve) => resolve(new Response('hi')));
	resolvers = [];
}

async function rebuild() {
	{
		console.log('Changes detected, rebuilding...');

		await Bun.build({
			entrypoints: ['./src/index.ts'],
			outdir: './build',
		});

		const staticFolder = await readdir('./src/static');
		for (const path of staticFolder) {
			const file = Bun.file('./src/static/' + path);
			await Bun.write('./build/' + path, file);
		}

		notifyReload();
	}
}

Bun.serve({
	development: false,
	port: 4000,
	async fetch(req) {
		const url = new URL(req.url);
		if (url.pathname == '/reload') return await awaitReload();
		if (url.pathname == '/') url.pathname = '/index.html';

		const filePath = './build' + url.pathname;
		const file = Bun.file(filePath);
		if (await file.exists()) return new Response(file);
		else {
			const filePath = './build/index.html';
			const file = Bun.file(filePath);
			return new Response(file);
		}
	},
});

const watcher = watch(import.meta.dir + '/src', {});
watcher.on('change', rebuild);
rebuild();
