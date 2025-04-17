import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import path from 'path';

export default defineConfig({
	plugins: [
		UnoCSS(),
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	resolve: {
		alias: {
			$routes: path.resolve('./src/routes'),
			$lib: path.resolve('./src/lib')
		}
	}
});
