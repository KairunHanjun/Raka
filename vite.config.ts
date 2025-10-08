import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), enhancedImages()],
	server: {
		port: 80
	}
});
