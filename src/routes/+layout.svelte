<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<style lang="postcss">
  :global(body) {
    background-color:  #141517;
  }
</style>

{@render children?.()}
