<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	let data = null;
  	let error = null;
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
