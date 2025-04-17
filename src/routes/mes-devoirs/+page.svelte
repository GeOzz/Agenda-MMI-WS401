<script lang="ts">
	import type { IDevoir } from '$lib/interfaces/IUtilisateur';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let devoirs: IDevoir[] = $state([]);
	let VOTES = new SvelteMap();
	let INTERVAL;

	onMount(async () => {
		const response = await fetch('/api/devoirs');
		devoirs = await response.json();

		// Trier les devoirs par date de rendu (les plus proches en premier)
		devoirs.sort((a, b) => a.expire_le_timestamp - b.expire_le_timestamp);

		INTERVAL = setInterval(() => {
			devoirs = devoirs
				.filter((devoir: IDevoir) => Number(devoir.expire_le_timestamp) > new Date().getTime())
				.map((devoir: IDevoir) => {
					const mettreAjourDevoir = async () => {
						try {
							const RESPONSE_VOTES = await fetch(`/api/devoirs/${devoir.id}/votes`);
							const VOTES_REPONSE = await RESPONSE_VOTES.json();
							VOTES.set(devoir.id, VOTES_REPONSE);
							const time = getTimeRemaining(Number(devoir.expire_le_timestamp));
							return {
								...devoir,
								time
							};
						} catch (error) {
							console.error(error);
							return devoir;
						}
					};

					mettreAjourDevoir();

					const time = getTimeRemaining(Number(devoir.expire_le_timestamp));
					return { ...devoir, time };
				});
		}, 1000);

		return () => {
			clearInterval(INTERVAL);
		};
	});

	async function handleVote(devoir_id: number, vote: number) {
		try {
			const response = await fetch('/api/devoirs/vote', {
				method: 'POST',
				body: JSON.stringify({ devoir_id, vote })
			});
			const data = await response.json();
			const VOTE = VOTES.get(devoir_id);

			VOTES.set(devoir_id, [...VOTE, { vote, timestamp: new Date().getTime() }]);
		} catch (error) {
			console.error('Erreur lors du vote', error);
		}
	}

	async function RecupereHistorique() {
		const response = await fetch('/api/historique');
		const historique = await response.json();
		return historique;
	}

	function getTimeRemaining(expire_le_timestamp: number) {
		const total = expire_le_timestamp - Date.now();
		const days = Math.floor(total / (1000 * 60 * 60 * 24));
		const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
		const minutes = Math.floor((total / (1000 * 60)) % 60);
		const seconds = Math.floor((total / 1000) % 60);
		return { total, days, hours, minutes, seconds };
	}
</script>

<div class="flex">
	<!-- Menu de navigation à gauche -->
	<nav
		class="w-64 h-screen bg-gray-100 text-black flex flex-col fixed left-0 overflow-y-auto shadow-lg"
	>
		<div class="p-4">
			<h2 class="text-2xl font-bold">Historique</h2>
			<div class="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
				{#await RecupereHistorique() then historique}
					{#if historique && historique.length > 0}
						<div class="space-y-3">
							{#each historique as item}
								{#if item.json}
									{@const histItem = JSON.parse(item.json)}
									<div
										class="p-3 bg-white rounded-lg shadow-sm border border-gray-200 text-sm hover:shadow-md transition-shadow duration-200"
									>
										<div class="flex flex-wrap justify-between items-center gap-1">
											<span class="font-semibold inline-flex items-center">
												{#if histItem.action === 'create'}
													<span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
													Création
												{:else if histItem.action === 'update'}
													<span class="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
													Modification
												{:else if histItem.action === 'delete'}
													<span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
													Suppression
												{:else}
													{histItem.action}
												{/if}
											</span>
											<span class="text-xs text-gray-500 whitespace-nowrap">
												{new Date(histItem.timestamp).toLocaleString('fr-FR')}
											</span>
										</div>
										<div class="mt-2 text-gray-700 text-sm">
											<span class="font-bold"
												>{histItem.utilisateur?.nom} {histItem.utilisateur?.prenom}</span
											>
											a
											{histItem.action === 'create'
												? 'créé'
												: histItem.action === 'update'
													? 'modifié'
													: histItem.action === 'delete'
														? 'supprimé'
														: histItem.action}
											{histItem.type === 'devoir' ? 'un devoir' : histItem.type}
											{#if histItem.devoir?.titre}
												: <a href={`/devoir/${histItem.devoir.id}`} class="font-bold text-[#705B97]"
													>{histItem.devoir.titre}</a
												>
											{/if}
										</div>
									</div>
								{/if}
							{/each}
						</div>
					{:else}
						<div
							class="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center"
						>
							<p class="text-gray-500 italic flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 mr-2 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								Aucun historique disponible.
							</p>
						</div>
					{/if}
				{:catch error}
					<div class="p-4 bg-red-100 rounded-lg border border-red-300 flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 mr-2 text-red-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p class="text-red-700">
							Erreur lors du chargement de l'historique: {error.message}
						</p>
					</div>
				{/await}
			</div>
		</div>
	</nav>

	{#if devoirs.length === 0}
		<div class="flex-1 ml-64 mx-auto p-6 mt-6 bg-white flex flex-col items-center justify-center">
			<img src="/empty.svg" alt="Aucun devoir" class="w-40 h-40 mb-4 opacity-75" />
			<p class="text-gray-500 text-lg font-semibold">Aucun devoir trouvé pour le moment.</p>
		</div>
	{:else}
		<!-- Contenu principal -->
		<div class="flex-1 ml-64 mx-auto p-6 mt-6 bg-white">
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
				{#each devoirs as devoir (devoir.id)}
					<div
						class="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300 w-full max-w-xl mx-auto"
					>
						<div class="relative">
							<img src="/fond-devoirs.jpeg" alt="Devoir" class="w-full h-40 object-cover" />
						</div>
						<div class="p-4">
							<h2 class="text-lg font-bold">{devoir.matiere}</h2>
							<div class="flex justify-between items-center mt-2">
								<p class="text-gray-900 text-sm font-bold">{devoir.titre}</p>
								<span class="text-gray-700 text-xs bg-gray-200 px-3 py-1 rounded-lg">
									{devoir.time?.days}j {devoir.time?.hours}h {devoir.time?.minutes}m {devoir.time
										?.seconds}s
								</span>
							</div>
							<div class="flex justify-center items-center mt-4 space-x-4">
								<a
									class="w-full text-center bg-[#4B3B7C] text-white px-3 py-3 rounded-lg shadow transition-opacity duration-300 opacity-100 hover:opacity-75"
									href={`/devoir/${devoir.id}`}
								>
									Consulter
								</a>
							</div>
							<div class="flex justify-center items-center mt-4 space-x-4">
								<button
									on:click={() => handleVote(devoir.id, 1)}
									class="flex items-center bg-[#FDEFCC] text-black px-3 py-1 rounded-lg shadow transition-opacity duration-300 opacity-100 hover:opacity-75"
								>
									<img
										src="/verifier.png"
										alt="Vérifier"
										class="w-4 h-4 mr-2 opacity-80 hover:opacity-65 transition-opacity duration-300"
									/>
									{VOTES.get(devoir.id)?.filter((vote) => vote.vote === 1).length}
								</button>
								<button
									on:click={() => handleVote(devoir.id, -1)}
									class="flex items-center bg-[#DBD7E3] text-black px-3 py-1 rounded-lg shadow transition-opacity duration-300 opacity-100 hover:opacity-75"
								>
									<img
										src="/refuser.png"
										alt="Refuser"
										class="w-4 h-4 mr-2 opacity-80 hover:opacity-65 transition-opacity duration-300"
									/>
									{VOTES.get(devoir.id)?.filter((vote) => vote.vote === -1).length}
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		@apply bg-gray-100;
	}
	/* Ajout d'une animation pour les cartes */
	.bg-white {
		transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
	}
	.bg-white:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
	}
	nav {
		overflow-y: auto; /* Permet le défilement vertical */
		height: 100%; /* Assure que le menu occupe toute la hauteur */
	}
	/* Ajout d'un style pour permettre le défilement dans la section historique */
	nav .overflow-y-auto {
		scrollbar-width: thin; /* Pour les navigateurs compatibles */
		scrollbar-color: #705B97 #f7fafc; /* Couleurs personnalisées */
	}

	nav .overflow-y-auto::-webkit-scrollbar {
		width: 8px; /* Largeur de la barre de défilement */
	}

	nav .overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: #705B97; /* Couleur violette */
		border-radius: 4px; /* Coins arrondis */
	}

	nav .overflow-y-auto::-webkit-scrollbar-track {
		background-color: #f7fafc; /* Couleur de l'arrière-plan */
	}
</style>

