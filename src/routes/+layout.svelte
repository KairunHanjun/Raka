<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/service-worker.ts')
		.then(() => console.log('Service Worker registered'))
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
