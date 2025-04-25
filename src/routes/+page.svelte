<script lang="ts">
	import { browser } from '$app/environment';
	import { ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';
	import { checkConnected, redirectToConnexion, STORE } from '$lib/store.svelte';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let DEVOIRS = [];
	let devoirs_deja_fait = [];
	let devoirs_a_faire = [];
	let devoirsGroupes = {};
	let activePage = 'accueil'; // 'accueil' ou 'historique'

	// Utilisation du localStorage par utilisateur (clé unique par id utilisateur)
	function getStorageKey() {
		const id = STORE.utilisateur?.id;
		return id ? `devoirs_deja_fait_${id}` : 'devoirs_deja_fait';
	}

	onMount(async () => {
		const response = await fetch('/api/devoirs');
		const devoirs = await response.json();
		DEVOIRS = devoirs;
		devoirsGroupes = regrouperParPromotionEtTrier(devoirs);

		const storageKey = getStorageKey();
		const _devoirs_deja_fait = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
		devoirs_deja_fait = _devoirs_deja_fait;
		devoirs_a_faire = DEVOIRS.filter((devoir) => !_devoirs_deja_fait.includes(devoir.id));
	});

	const AfficherOuNon = new Promise(async (resolve, reject) => {
		if (!browser) return;
		await checkConnected();

		if (STORE.connected === false) {
			redirectToConnexion();
			reject(false);
		} else {
			resolve(true);
		}
	});

	// Regrouper les devoirs par promotion et trier par date d'expiration
	function regrouperParPromotionEtTrier(devoirs) {
		const groupes = {
			'1ère Année (BUT1)': [],
			'2ème Année (BUT2)': [],
			'3ème Année (BUT3)': []
		};

		devoirs.forEach((devoir) => {
			if (groupes[devoir.promotion]) {
				groupes[devoir.promotion].push(devoir);
			}
		});

		// Trier chaque groupe par date d'expiration (le plus proche en premier)
		Object.keys(groupes).forEach((promotion) => {
			groupes[promotion].sort((a, b) => a.expire_le_timestamp - b.expire_le_timestamp);
		});

		return groupes;
	}

	function handleVoirPlus(devoir_id: number) {
		window.location.href = `/devoir/${devoir_id}`;
	}

	function handleDejaFait(devoir) {
		const storageKey = getStorageKey();
		if (!devoirs_deja_fait.includes(devoir.id)) {
			devoirs_deja_fait = [...devoirs_deja_fait, devoir.id];
			devoirs_a_faire = devoirs_a_faire.filter((d) => d.id !== devoir.id);
			window.localStorage.setItem(storageKey, JSON.stringify(devoirs_deja_fait));
		}
	}

	function handleAFaire(devoir) {
		const storageKey = getStorageKey();
		if (devoirs_deja_fait.includes(devoir.id)) {
			devoirs_deja_fait = devoirs_deja_fait.filter((id) => id !== devoir.id);
			devoirs_a_faire = [...devoirs_a_faire, devoir];
			window.localStorage.setItem(storageKey, JSON.stringify(devoirs_deja_fait));
		}
	}

	async function RecupereHistorique() {
		const response = await fetch('/api/historique');
		const historique = await response.json();
		return historique;
	}

	function setActivePage(page) {
		activePage = page;
	}

	async function getUtilisateur(id: number): Promise<{ nom: string; prenom: string }> {
		const response = await fetch(`/api/utilisateur/${id}`);
		const utilisateur = await response.json();
		return { nom: utilisateur.nom, prenom: utilisateur.prenom };
	}
</script>

<svelte:head>
	<title>Accueil | Agenda MMI</title>
	<meta
		name="description"
		content="Bienvenue sur l'agenda MMI : retrouvez vos devoirs à faire, l'historique des actions et toutes les informations importantes pour les étudiants et enseignants MMI."
	/>
</svelte:head>

{#await AfficherOuNon then value}
	{#if STORE.connected === true}
		<!-- Barre de navigation responsive mobile : chaque bouton est indépendant -->
		{#if activePage === 'accueil'}
			<div
				class="w-full flex md:hidden bg-gray-100 shadow-md z-40"
				style="position:fixed; top:95px; left:0; right:0;"
			>
				<button
					class="flex-1 py-4 text-center font-bold text-[#4D3677] bg-white shadow-md border-b-4 border-yellow-500 rounded-t-lg"
					aria-current="page"
					style="width:100vw;"
				>
					Accueil
				</button>
				<button
					class="flex-1 py-4 text-center font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border-b-4 border-transparent rounded-t-lg"
					on:click={() => setActivePage('historique')}
					style="width:100vw;"
				>
					Historique
				</button>
			</div>
		{:else if activePage === 'historique'}
			<div
				class="w-full flex md:hidden bg-gray-100 shadow-md z-40"
				style="position:fixed; top:100px; left:0; right:0;"
			>
				<button
					class="flex-1 py-4 text-center font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border-b-4 border-transparent rounded-t-lg"
					on:click={() => setActivePage('accueil')}
					style="width:100vw;"
				>
					Accueil
				</button>
				<button
					class="flex-1 py-4 text-center font-bold text-[#4D3677] bg-white shadow-md border-b-4 border-yellow-500 rounded-t-lg"
					aria-current="page"
					style="width:100vw;"
				>
					Historique
				</button>
			</div>
		{/if}
		<div class="flex flex-col md:flex-row mt-[70px] md:mt-0">
			<!-- Menu de navigation à gauche (historique) -->
			<nav
				class="w-64 h-screen bg-gray-100 text-black flex-col fixed left-0 overflow-y-auto shadow-lg z-10 hidden md:flex"
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
															<span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"
															></span>
															Création
														{:else if histItem.action === 'update'}
															<span class="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"
															></span>
															Modification
														{:else if histItem.action === 'delete'}
															<span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"
															></span>
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
													{histItem.type === 'devoir' ? 'un devoir' : histItem.type}
													{#if histItem.devoir?.titre}
														: <a
															href={`/devoir/${histItem.devoir.id}`}
															class="font-bold text-[#705B97]">{histItem.devoir.titre}</a
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

			<!-- Contenu principal -->
			<div class="flex-1 md:ml-64 mx-auto p-4 md:p-8 mt-0 md:mt-6 bg-white min-h-screen">
				{#if activePage === 'accueil'}
					<!-- Section Accueil -->
					{#if STORE.utilisateur?.role === ERoleUtilisateur.PROFESSEUR}
						<h1 class="text-4xl font-bold mb-10">
							Bienvenue {STORE.utilisateur?.nom}, voici les devoirs organisés par promotion.
						</h1>
						{#each Object.entries(devoirsGroupes) as [promotion, devoirs]}
							<div class="mb-10">
								<h2 class="text-2xl font-bold mb-4 text-[#4D3677]">{promotion}</h2>
								{#if devoirs.length > 0}
									<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
										{#each devoirs as devoir}
											<div
												class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
											>
												<div class="bg-[#4D3677] text-white p-4">
													<h3 class="text-lg font-bold truncate">{devoir.titre}</h3>
													<p class="text-sm">{devoir.matiere}</p>
												</div>
												<div class="p-4">
													<p class="text-gray-600 text-sm mb-2">
														<strong>Expire le :</strong>
														{new Date(devoir.expire_le_timestamp).toLocaleDateString()}
													</p>
													<p class="text-gray-600 text-sm mb-4 truncate">
														<strong>Description :</strong>
														{devoir.markdown || 'Aucune description'}
													</p>
													<a
														href={`/devoir/${devoir.id}`}
														class="block text-center bg-[#705B97] text-white py-2 rounded-md hover:bg-opacity-90 transition"
													>
														Voir les détails
													</a>
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-gray-500 italic">Aucun devoir disponible pour cette promotion.</p>
								{/if}
							</div>
						{/each}
					{:else}
						<h1 class="text-4xl font-bold mb-10">
							Bienvenue {STORE.utilisateur?.nom}, {#if devoirs_a_faire.length > 0}vous avez {devoirs_a_faire.length}
								devoirs à rendre.{:else}vous n'avez pas de devoirs à rendre.{/if}
						</h1>

						<!-- Section des devoirs à faire -->
						<div>
							<h2 class="text-2xl font-bold mb-4 text-[#4D3677]">Devoirs à faire</h2>
							{#if devoirs_a_faire.length > 0}
								<div class="space-y-4 mb-8">
									{#each devoirs_a_faire as devoir (devoir.id)}
										{#await getUtilisateur(devoir.utilisateur_id_createur)}
											<!-- promise is pending -->
										{:then utilisateur}
											<div
												class="shadow-md rounded-lg p-8 border-t border-b border-gray-300 flex justify-between items-center transition-opacity duration-300"
											>
												<div class="flex items-center">
													<div
														class="w-16 h-16 rounded-full bg-[#4D3677] flex items-center justify-center text-white font-bold"
													>
														{devoir.matiere.slice(0, 2).toUpperCase()}
													</div>
													<div class="ml-4">
														<h2 class="text-3xl font-semibold mb-2">
															{devoir.matiere} - {devoir.titre}
														</h2>
														<p class="text-gray-500 text-sm">
															Ajouté par <span class="font-bold"
																>{utilisateur.nom} {utilisateur.prenom}</span
															>
															le
															<span class="font-bold"
																>{new Date(devoir.timestamp).toLocaleDateString('fr-FR')}</span
															>
															à
															<span class="font-bold"
																>{new Date(devoir.timestamp).toLocaleTimeString('fr-FR')}</span
															>
														</p>
														<p class="text-gray-500 text-lg mt-4">
															Rendu prévu pour le <span class="font-bold"
																>{new Date(devoir.expire_le_timestamp).toLocaleDateString(
																	'fr-FR'
																)}</span
															>
															à
															<span class="font-bold"
																>{new Date(devoir.expire_le_timestamp).toLocaleTimeString(
																	'fr-FR'
																)}</span
															>
														</p>
													</div>
												</div>
												<div class="flex space-x-2">
													<button
														on:click={() => handleDejaFait(devoir)}
														class="px-4 py-2 flex items-center bg-[#DDD4EC] text-[#3B2A5B] font-bold rounded-md transition duration-150 ease-in-out hover:bg-[#B5ADC4]"
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															class="h-5 w-5 mr-2"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M5 13l4 4L19 7"
															/>
														</svg>
														Marquer comme fait
													</button>
												</div>
											</div>
										{/await}
									{/each}
								</div>
							{:else}
								<div class="text-center text-gray-500 italic py-10">
									<p>Aucun devoir à faire pour le moment. Profitez de votre temps libre !</p>
								</div>
							{/if}
						</div>

						<!-- Section des devoirs déjà faits -->
						<div>
							<h2 class="text-2xl font-bold mb-4 text-[#4D3677]">Devoirs déjà faits</h2>
							{#if DEVOIRS.filter((devoir) => devoirs_deja_fait.includes(devoir.id)).length > 0}
								<div class="space-y-4 mb-8">
									{#each DEVOIRS.filter( (devoir) => devoirs_deja_fait.includes(devoir.id) ) as devoir (devoir.id)}
										{#await getUtilisateur(devoir.utilisateur_id_createur)}
											<!-- promise is pending -->
										{:then utilisateur}
											<div
												class="shadow-md rounded-lg p-8 border-t border-b border-gray-300 flex justify-between items-center opacity-75 transition-opacity duration-300"
											>
												<div class="flex items-center">
													<div
														class="w-16 h-16 rounded-full bg-[#4D3677] flex items-center justify-center text-white font-bold"
													>
														{devoir.matiere.slice(0, 2).toUpperCase()}
													</div>
													<div class="ml-4">
														<h2 class="text-3xl font-semibold mb-2">
															{devoir.matiere} - {devoir.titre}
														</h2>
														<p class="text-gray-500 text-sm">
															Ajouté par <span class="font-bold"
																>{utilisateur.nom} {utilisateur.prenom}</span
															>
															le
															<span class="font-bold"
																>{new Date(devoir.timestamp).toLocaleDateString('fr-FR')}</span
															>
															à
															<span class="font-bold"
																>{new Date(devoir.timestamp).toLocaleTimeString('fr-FR')}</span
															>
														</p>
														<p class="text-gray-500 text-lg mt-4">
															Rendu prévu pour le <span class="font-bold"
																>{new Date(devoir.expire_le_timestamp).toLocaleDateString(
																	'fr-FR'
																)}</span
															>
															à
															<span class="font-bold"
																>{new Date(devoir.expire_le_timestamp).toLocaleTimeString(
																	'fr-FR'
																)}</span
															>
														</p>
													</div>
												</div>
												<div class="flex space-x-2">
													<button
														on:click={() => handleAFaire(devoir)}
														class="px-4 py-2 flex items-center bg-[#F7B000] text-[#3B2A5B] font-bold rounded-md transition duration-150 ease-in-out hover:bg-[#D69A00]"
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															class="h-5 w-5 mr-2"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2v6"
															/>
														</svg>
														Remettre à faire
													</button>
												</div>
											</div>
										{/await}
									{/each}
								</div>
							{:else}
								<div class="text-center text-gray-500 italic py-10">
									<p>Aucun devoir marqué comme fait. Commencez à travailler sur vos tâches !</p>
								</div>
							{/if}
						</div>
					{/if}
				{:else if activePage === 'historique'}
					<!-- Section Historique (mobile & desktop) -->
					<div class="block md:hidden">
						<h2 class="text-2xl font-bold mb-4">Historique</h2>
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
																<span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"
																></span>
																Création
															{:else if histItem.action === 'update'}
																<span class="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"
																></span>
																Modification
															{:else if histItem.action === 'delete'}
																<span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"
																></span>
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
														{histItem.type === 'devoir' ? 'un devoir' : histItem.type}
														{#if histItem.devoir?.titre}
															: <a
																href={`/devoir/${histItem.devoir.id}`}
																class="font-bold text-[#705B97]">{histItem.devoir.titre}</a
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
		</div>
	{/if}
{/await}

<style>
	:global(body) {
		@apply bg-gray-100;
	}
	/* Ajout d'une animation pour les cartes */
	.bg-white {
		transition:
			transform 0.2s ease-in-out,
			box-shadow 0.2s ease-in-out;
	}
	.bg-white:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
	}
	/* Ajout d'un style pour permettre le défilement dans la section historique */
	nav .overflow-y-auto {
		scrollbar-width: thin; /* Pour les navigateurs compatibles */
		scrollbar-color: #705b97 #f7fafc; /* Couleurs personnalisées */
	}
	nav .overflow-y-auto::-webkit-scrollbar {
		width: 8px; /* Largeur de la barre de défilement */
	}
	nav .overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: #705b97; /* Couleur violette */
		border-radius: 4px; /* Coins arrondis */
	}
	nav .overflow-y-auto::-webkit-scrollbar-track {
		background-color: #f7fafc; /* Couleur de l'arrière-plan */
	}
	/* Responsive: cacher le menu latéral sur mobile, afficher la barre du haut */
	@media (max-width: 767px) {
		nav {
			display: none !important;
		}
	}
	@media (min-width: 768px) {
		.sticky-top-nav {
			display: none !important;
		}
	}
</style>