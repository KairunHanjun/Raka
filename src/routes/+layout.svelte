<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

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
  	<meta name="theme-color" content="#0d9488" />
</svelte:head>

<style lang="postcss">
  :global(body) {
    background-color:  #141517;
  }
</style>



{@render children?.()}
