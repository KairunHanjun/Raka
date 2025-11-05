import adapter from '@sveltejs/adapter-auto';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	},
	vite:{
		plugins: [
                SvelteKitPWA({
                    // PWA options like manifest, icons, workbox configuration
                    // Example:
                    manifest: {
                        name: 'My SvelteKit PWA',
                        short_name: 'Svelte PWA',
                        theme_color: '#ffffff',
                        icons: [
                            {
                                src: '/pwa-192x192.png',
                                sizes: '192x192',
                                type: 'image/png'
                            },
                            {
                                src: '/pwa-512x512.png',
                                sizes: '512x512',
                                type: 'image/png'
                            }
                        ]
                    }
                })
            ]
	}
};

export default config;
