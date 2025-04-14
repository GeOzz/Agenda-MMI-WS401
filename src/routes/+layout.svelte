<script lang="ts">
	import { browser } from '$app/environment';
	import '@unocss/reset/tailwind.css';
	import 'virtual:uno.css';

	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import Header from '$lib/components/Header.svelte';
	import NavMenu from '$lib/components/NavMenu.svelte';
	import { onMount } from 'svelte';
	import { checkConnected } from '$lib/store.svelte';
	import { page } from '$app/stores';

	let utilisateur;

	// Utilisez `$page` correctement pour accéder aux données utilisateur
	$: utilisateur = $page.data?.utilisateur;

	$: console.log('Utilisateur dans layout:', utilisateur); // Log pour vérifier les données utilisateur

	onMount(async () => {
		if (!browser) return;
		await checkConnected();
	});
</script>

<ParaglideJS {i18n}>
	<Header />
	{#if utilisateur?.role === 'PROFESSEUR'} <!-- Conditionnez l'affichage --> <!-- Cette div est rendue sur toutes les pages -->
		<div class="relative">
			<NavMenu {utilisateur} />
		</div>
	{/if}
	<div class="mt-40 sm:mt-18">
		<slot />
	</div>
</ParaglideJS>
