<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import SvelteMarkdown from 'svelte-markdown';
	import { marked } from 'marked';
	import { ERoleUtilisateur, MATIERES, type IDevoir } from '$lib/interfaces/IUtilisateur';
	import { STORE } from '$lib/store.svelte';

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
	let expire_dans = $state(0);
	let loading = $state(true);
	let error = $state(null);
	let INTERVAL;
	onMount(async () => {
		INTERVAL = setInterval(() => {
			expire_dans = getTimeRemaining(devoir.expire_le_timestamp);
		}, 1000);
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
		return () => {
			clearInterval(INTERVAL);
		};
	});

	function getTimeRemaining(expire_le_timestamp: number) {
		const total = expire_le_timestamp - Date.now();
		const days = Math.floor(total / (1000 * 60 * 60 * 24));
		const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
		const minutes = Math.floor((total / (1000 * 60)) % 60);
		const seconds = Math.floor((total / 1000) % 60);
		return { total, days, hours, minutes, seconds };
	}

	async function handleSupprimerDevoir() {
		const CONFIRMATION = confirm('Voulez-vous vraiment supprimer ce devoir ?');
		if (!CONFIRMATION) return;
		const response = await fetch(`/api/devoirs/${devoir.id}`, {
			method: 'DELETE'
		});
		if (response.ok) {
			window.location.href = '/mes-devoirs';
		} else {
			error = 'Erreur lors de la suppression du devoir';
		}
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
		<div class="flex">
			<!-- Left sidebar with actions -->
			<div
				class="w-16 bg-gray-100 rounded-l-lg shadow-md flex flex-col items-center py-4 space-y-4"
			>
				<a
					href={`/devoir/${devoir.id}/editer`}
					class="p-2 hover:bg-gray-200 rounded-full tooltip"
					data-tooltip="Modifier"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-gray-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				</a>
				{#if devoir.utilisateur_id_createur === STORE?.utilisateur?.id || STORE.utilisateur?.role === ERoleUtilisateur.PROFESSEUR || STORE.utilisateur?.role === ERoleUtilisateur.DELEGUE}
					<button
						onclick={() => handleSupprimerDevoir()}
						class="p-2 hover:bg-gray-200 rounded-full tooltip"
						data-tooltip="Supprimer"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 text-red-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					</button>
				{/if}
			</div>

			<!-- Main content -->
			<div class="flex-1 bg-white shadow-lg rounded-r-lg overflow-hidden border border-gray-300">
				<div class="relative">
					<div class="w-full h-40 bg-[#4D3677]">
						<div class="flex justify-center items-center h-full w-full">
							<h1 class="text-2xl font-bold text-white inline">
								{MATIERES.find((_matiere) => _matiere.id === devoir.matiere)?.nom}
							</h1>
						</div>
					</div>
					<div class="absolute top-0 right-0 bg-white px-3 py-1 m-4 rounded-lg shadow">
						{#if expire_dans.total > 0}
							<span class="text-gray-700 text-xs">
								{expire_dans.days}j {expire_dans.hours}h {expire_dans.minutes}m {expire_dans.seconds}s
							</span>
						{/if}
					</div>
				</div>

				<div class="p-6">
					<div class="mb-6">
						<div class="text-sm text-gray-600 mb-2">
							<span class="font-semibold">Créé par:</span>
							{createur_du_devoir.nom}
							{createur_du_devoir.prenom}
						</div>
						<div class="text-sm text-gray-600 mb-2">
							<span class="font-semibold">Promotion:</span>
							{devoir.promotion}
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
