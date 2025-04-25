<svelte:head>
	<title>Mes devoirs | Agenda MMI</title>
	<meta name="description" content="Consultez la liste de vos devoirs à faire et déjà faits sur l'agenda MMI." />
</svelte:head>

<script lang="ts">
	import type { IDevoir } from '$lib/interfaces/IUtilisateur';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let devoirs: IDevoir[] = $state([]);
	let VOTES = new SvelteMap();
	let INTERVAL;
	let tab = $state<'devoirs' | 'historique'>('devoirs');

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

<div class="flex flex-col sm:flex-row min-h-screen bg-gray-50">
	<!-- Navigation mobile/tab style -->
	<div class="w-full bg-white shadow-md px-2 sm:hidden mt-16 mb-4">
		<div class="flex">
			<button
				class="flex-1 text-center py-3 font-semibold text-sm transition relative
					{tab === 'devoirs' ? 'text-[#4B3B7C] border-b-2 border-yellow-400' : 'text-gray-700'}"
				on:click={() => tab = 'devoirs'}
				aria-current={tab === 'devoirs' ? 'page' : undefined}
			>
				Mes devoirs
			</button>
			<button
				class="flex-1 text-center py-3 font-semibold text-sm transition relative
					{tab === 'historique' ? 'text-[#4B3B7C] border-b-2 border-yellow-400' : 'text-gray-700'}"
				on:click={() => tab = 'historique'}
				aria-current={tab === 'historique' ? 'page' : undefined}
			>
				Historique
			</button>
		</div>
	</div>

	<!-- Menu de navigation à gauche (desktop) -->
	<nav
		class="hidden sm:flex w-64 h-screen bg-gray-100 text-black flex-col fixed left-0 overflow-y-auto shadow-lg"
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

	{#if tab === 'devoirs'}
		{#if devoirs.length === 0}
			<div class="flex-1 sm:ml-64 mx-auto p-4 sm:p-10 mt-4 sm:mt-10 flex flex-col items-center justify-center">
				<!-- Nouveau SVG friendly -->
				<svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-6">
					<circle cx="110" cy="110" r="100" fill="#FDEFCC"/>
					<ellipse cx="110" cy="170" rx="60" ry="18" fill="#DBD7E3"/>
					<rect x="60" y="80" width="100" height="60" rx="18" fill="#fff" stroke="#705B97" stroke-width="3"/>
					<rect x="75" y="95" width="70" height="10" rx="5" fill="#DBD7E3"/>
					<rect x="75" y="112" width="40" height="8" rx="4" fill="#FDEFCC"/>
					<circle cx="150" cy="116" r="6" fill="#DBD7E3"/>
					<path d="M90 150 Q110 160 130 150" stroke="#705B97" stroke-width="3" fill="none"/>
				</svg>
				<h2 class="text-2xl font-bold text-gray-700 mb-2">Aucun devoir à venir !</h2>
				<p class="text-gray-500 text-base mb-6 text-center max-w-md">
					Vous êtes à jour dans vos devoirs. Profitez-en pour vous reposer ou anticiper vos prochaines tâches !
				</p>
				<a href="/" class="inline-flex items-center px-5 gap-2 py-3 bg-[#705B97] text-white rounded-lg shadow hover:bg-[#4B3B7C] transition-colors font-semibold">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M224 120v96a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8v-52a4 4 0 0 0-4-4h-40a4 4 0 0 0-4 4v52a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a16 16 0 0 1 4.69-11.31l80-80a16 16 0 0 1 22.62 0l80 80A16 16 0 0 1 224 120"/></svg>
					Retour à l'accueil
				</a> 
			</div>
		{:else}
			<!-- Contenu principal -->
			<div class="flex-1 sm:ml-64 mx-auto p-2 sm:p-6 mt-4 sm:mt-6 bg-white">
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-2 sm:p-6">
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
	{:else if tab === 'historique'}
		<div class="flex-1 sm:ml-64 mx-auto p-2 sm:p-6 mt-4 sm:mt-6 bg-white">
			<div class="p-2 sm:p-6">
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
	@media (max-width: 640px) {
		.sm\:flex { display: none !important; }
		.sm\:ml-64 { margin-left: 0 !important; }
		.sm\:p-10 { padding: 1rem !important; }
		.sm\:p-6 { padding: 1rem !important; }
		.sm\:mt-10, .sm\:mt-6 { margin-top: 1rem !important; }
		.sm\:gap-6 { gap: 1rem !important; }
		.sm\:grid-cols-2 { grid-template-columns: 1fr !important; }
		.lg\:grid-cols-4 { grid-template-columns: 1fr !important; }
		.p-6 { padding: 1rem !important; }
		.p-10 { padding: 1rem !important; }
		.mt-16 { margin-top: 4rem !important; }
		.mb-4 { margin-bottom: 1rem !important; }
	}
</style>

