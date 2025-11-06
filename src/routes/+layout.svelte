<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	let { children } = $props();
	let data = null;
  	let error = null;
	if ('serviceWorker' in navigator) {

		const registration = navigator.serviceWorker.register('/service-worker.ts')
		.then((event) => {
			if (event.installing)
				console.log('Service Worker is installing')
			else if (event.waiting)
				console.log('Service Worker is installed and waiting')
			else if (event.active)
				console.log('Service Worker is active')
		})
		.catch((err) => console.error('SW registration failed:', err));
		
	
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
  	<meta name="theme-color" content="#F4E6D8" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#5D4037" media="(prefers-color-scheme: dark)" />
</svelte:head>

<style lang="postcss">
  :global(body) {
    background-color:  #141517;
	overscroll-behavior-y: contain;
  }
  
</style>



{@render children?.()}
