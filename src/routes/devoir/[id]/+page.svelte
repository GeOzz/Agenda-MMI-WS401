<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import SvelteMarkdown from 'svelte-markdown';
	import { marked } from 'marked';
	import type { IDevoir } from '$lib/interfaces/IUtilisateur';

	let devoir: IDevoir = $state({
		id: 0,
		promotion: '',
		matiere: '',
		utilisateur_id_createur: 0,
		expire_le_timestamp: 0,
		groupes: '',
		markdown: '',
		titre: ''
	});
	let createur_du_devoir = $state({
		id: 0,
		nom: '',
		prenom: ''
	});

	let loading = $state(true);
	let error = $state(null);

	onMount(async () => {
		try {
			const id = page.params.id;
			const response = await fetch(`/api/devoirs/${id}`);

			if (!response.ok) {
				throw new Error(`Erreur lors de la récupération du devoir: ${response.statusText}`);
			}
			const reponseDevoir = await response.json();
			const responseUtilisateur = await fetch(
				`/api/utilisateur/${reponseDevoir.utilisateur_id_createur}`
			);
			if (!responseUtilisateur.ok) {
				throw new Error(
					`Erreur lors de la récupération de l'utilisateur: ${responseUtilisateur.statusText}`
				);
			}

			const utilisateur = await responseUtilisateur.json();
			devoir = reponseDevoir;
			createur_du_devoir = {
				id: utilisateur.id,
				nom: utilisateur.nom,
				prenom: utilisateur.prenom
			};

			loading = false;
		} catch (err) {
			error = err.message;
			loading = false;
		}
	});

	function getTimeRemaining(expire_le_timestamp: number) {
		const total = expire_le_timestamp - Date.now();
		const days = Math.floor(total / (1000 * 60 * 60 * 24));
		const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
		const minutes = Math.floor((total / (1000 * 60)) % 60);
		const seconds = Math.floor((total / 1000) % 60);
		return { total, days, hours, minutes, seconds };
	}
</script>

<div class="container mx-auto p-6">
	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
		</div>
	{:else if error}
		<div
			class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
			role="alert"
		>
			<strong class="font-bold">Erreur!</strong>
			<span class="block sm:inline">{error}</span>
		</div>
	{:else if devoir}
		<div class="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
			<div class="relative">
				<img src="/fond-devoirs.jpeg" alt="Devoir" class="w-full h-40 object-cover" />
				<div class="absolute top-0 right-0 bg-white px-3 py-1 m-4 rounded-lg shadow">
					{#if devoir?.expire_le_timestamp}
						{@const time = getTimeRemaining(devoir.expire_le_timestamp)}
						<span class="text-gray-700 text-xs">
							{time.days}j {time.hours}h {time.minutes}m {time.seconds}s
						</span>
					{/if}
				</div>
			</div>

			<div class="p-6">
				<div class="flex justify-between items-center mb-4">
					<h1 class="text-2xl font-bold text-gray-900">{devoir?.titre}</h1>
					<span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-lg">
						{devoir?.matiere}
					</span>
				</div>

				<div class="mb-6">
					<div class="text-sm text-gray-600 mb-2">
						<span class="font-semibold">Créé par:</span>
						{createur_du_devoir.nom}
						{createur_du_devoir.prenom}
					</div>
					{#if devoir.timestamp}
						<div class="text-sm text-gray-600">
							<span class="font-semibold">Date de création:</span>
							{new Date(devoir.timestamp).toLocaleDateString('fr-FR')}
						</div>
					{/if}
				</div>

				<div class="prose! max-w-none">
					{#if devoir?.markdown}
						<SvelteMarkdown source={devoir?.markdown} />
					{:else}
						<p class="text-gray-500 italic">Aucun contenu disponible pour ce devoir.</p>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div
			class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
			role="alert"
		>
			<strong class="font-bold">Attention!</strong>
			<span class="block sm:inline">Aucun devoir trouvé avec cet identifiant.</span>
		</div>
	{/if}
</div>

<style>
	.markdown-content :global(h1) {
		font-size: 1.8rem;
		font-weight: bold;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
	}

	.markdown-content :global(h2) {
		font-size: 1.5rem;
		font-weight: bold;
		margin-top: 1.2rem;
		margin-bottom: 0.8rem;
	}

	.markdown-content :global(h3) {
		font-size: 1.3rem;
		font-weight: bold;
		margin-top: 1rem;
		margin-bottom: 0.6rem;
	}

	.markdown-content :global(p) {
		margin-bottom: 1rem;
	}

	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		margin-left: 1.5rem;
		margin-bottom: 1rem;
	}

	.markdown-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.markdown-content :global(code) {
		background-color: #f1f1f1;
		padding: 0.2rem 0.4rem;
		border-radius: 0.2rem;
		font-family: monospace;
	}

	.markdown-content :global(pre) {
		background-color: #f5f5f5;
		padding: 1rem;
		border-radius: 0.3rem;
		overflow-x: auto;
		margin-bottom: 1rem;
	}

	.markdown-content :global(blockquote) {
		border-left: 4px solid #e2e8f0;
		padding-left: 1rem;
		font-style: italic;
		margin: 1rem 0;
	}

	.markdown-content :global(a) {
		color: #3182ce;
		text-decoration: underline;
	}
</style>
