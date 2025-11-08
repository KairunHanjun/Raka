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
</svelte:head>

<style lang="postcss">
  :global(body) {
    background-color:  #141517;
	overscroll-behavior-y: contain;
  }
  
</style>



{@render children?.()}
