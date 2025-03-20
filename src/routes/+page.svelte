<script lang="ts">
	import { browser } from '$app/environment';
	import { EPromotion } from '$lib/interfaces/IUtilisateur';
	import { checkConnected, redirectToConnexion, STORE } from '$lib/store.svelte';
	import { onMount } from 'svelte';
	let DEVOIRS = [];
	onMount(async () => {
		const response = await fetch('/api/devoirs');
		const devoirs = await response.json();
		DEVOIRS = devoirs;
	});

	const semesters = [
		{
			title: 'BUT1 - Semestre 1',
			subtitle: 'Septembre - Janvier',
			lastUpdate: '15/03/2024',
			updatedBy: 'Professeur'
		},
		{
			title: 'BUT1 - Semestre 2',
			subtitle: 'Septembre - Janvier',
			lastUpdate: '11/03/2024',
			updatedBy: 'Délégué'
		}
	];

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

	function getTimeRemaining(expire_le_timestamp: number) {
		const total = expire_le_timestamp - Date.now();
		const days = Math.floor(total / (1000 * 60 * 60 * 24));
		const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
		const minutes = Math.floor((total / (1000 * 60)) % 60);
		const seconds = Math.floor((total / 1000) % 60);
		return { total, days, hours, minutes, seconds };
	}

	function handleVoirPlus(devoir_id: number) {
		window.location.href = `/devoir/${devoir_id}`;
	}

	function handleAFaire(devoir_id: number) {
		const index = DEVOIRS.findIndex((d) => d.id === devoir_id);
		if (index !== -1) {
			DEVOIRS[index].status = 'a_faire';
			DEVOIRS.sort((a, b) => (a.status === 'a_faire' ? -1 : 1));
		}
	}

	function handleDejaFait(devoir_id: number) {
		const index = DEVOIRS.findIndex((d) => d.id === devoir_id);
		if (index !== -1) {
			DEVOIRS[index].status = 'deja_fait';
			DEVOIRS.sort((a, b) => (a.status === 'deja_fait' ? 1 : -1));
		}
	}
</script>

{#await AfficherOuNon then value}
	{#if STORE.connected === true}
		<div class="flex">
			<!-- Menu de navigation à gauche -->
			<nav
				class="w-64 h-screen bg-gray-100 text-black flex flex-col fixed top-0 left-0 overflow-y-auto"
			>
				<div class="p-4">
					<h2 class="text-2xl font-bold">Menu</h2>
				</div>
				<ul class="flex-1 p-4 space-y-2">
					<li><a href="/" class="block px-4 py-2 rounded hover:bg-gray-300 hover:bg-opacity-85">Accueil</a></li>
					<li>
						<a href="/mes-devoirs" class="block px-4 py-2 rounded hover:bg-gray-300 hover:bg-opacity-85">Mes Devoirs</a>
					</li>
					<li>
						<a href="/ajouter-devoir" class="block px-4 py-2 rounded hover:bg-gray-300 hover:bg-opacity-85"
							>Ajouter Devoir</a
						>
					</li>
					<li><a href="/profil" class="block px-4 py-2 rounded hover:bg-gray-300 hover:bg-opacity-85">Profil</a></li>
				</ul>
			</nav>

			<!-- Contenu principal -->
			<div class="flex-1 ml-64 max-w-7xl mx-auto p-8 mt-6 bg-white">
				<h1 class="text-4xl font-bold mb-10">
					Bienvenue {STORE.utilisateur?.nom}, vous avez {DEVOIRS.length} devoirs à rendre.
				</h1>

				<div class="space-y-4 mb-8">
					{#each DEVOIRS as devoir}
						<div
							class="bg-white shadow-md rounded-lg p-8 border-t border-b border-gray-300 flex justify-between items-center {devoir.status ===
							'deja_fait'
								? 'opacity-50'
								: ''}"
						>
							<div class="flex items-center">
								<div
									class="w-16 h-16 rounded-full bg-[#4D3677] flex items-center justify-center text-white font-bold"
								>
									{devoir.matiere.slice(0, 2).toUpperCase()}
								</div>
								<div class="ml-4">
									<h2 class="text-3xl font-semibold mb-2">{devoir.matiere} - {devoir.titre}</h2>
									<p class="text-gray-500 text-sm">
										Ajouté par <span class="font-bold">{STORE.utilisateur?.nom} {STORE.utilisateur?.prenom}</span> le <span class="font-bold">{new Date(devoir.timestamp).toLocaleDateString('fr-FR')}</span> à <span class="font-bold">{new Date(devoir.timestamp).toLocaleTimeString('fr-FR')}</span>
									</p>
									<p class="text-gray-500 text-lg mt-4">
										Rendu prévu pour le <span class="font-bold">{new Date(devoir.expire_le_timestamp).toLocaleDateString(
											'fr-FR'
										)}</span> à <span class="font-bold">{new Date(devoir.expire_le_timestamp).toLocaleTimeString('fr-FR')}</span>
									</p>
								</div>
							</div>
							<div class="border-l border-gray-300 h-full mx-4"></div>
							<div class="flex-1">
								<div class="flex justify-between items-center mt-2">
									<button
										on:click={() => handleVoirPlus(devoir.id)}
										class="px-4 py-2 bg-[#9385AB] bg-opacity-90 text-[#3B2A5B] font-bold rounded-md hover:bg-opacity-100"
										>Voir plus</button
									>
									<div class="flex space-x-2">
										<button
											on:click={() => handleAFaire(devoir.id)}
											class="px-4 py-2 bg-[#F7B000] text-[#3B2A5B] font-bold rounded-md hover:bg-[#D69A00]"
											>À faire</button
										>
										<button
											on:click={() => handleDejaFait(devoir.id)}
											class="px-4 py-2 bg-[#DDD4EC] text-[#3B2A5B] font-bold rounded-md"
											>Déjà fait</button
										>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
{/await}

<style>
	:global(body) {
		@apply bg-gray-100;
	}
</style>
