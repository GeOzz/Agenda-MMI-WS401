<script lang="ts">
	import { browser } from '$app/environment';
	import '@unocss/reset/tailwind.css';
	import 'virtual:uno.css';

	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';
	import { checkConnected } from '$lib/store.svelte';

	let { children } = $props();

	onMount(async () => {
		if (!browser) return;
		await checkConnected();
	});
</script>

<ParaglideJS {i18n}>
	<Header />
	<div class="mt-40 sm:mt-18">
		{@render children()}
	</div>
</ParaglideJS>
