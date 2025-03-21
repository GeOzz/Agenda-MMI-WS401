<script lang="ts">
	import { browser } from '$app/environment';
	import { ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';
	import { checkConnected, redirectToConnexion, STORE } from '$lib/store.svelte';
	import { onMount } from 'svelte';
	let DEVOIRS = $state([]);
	let devoirs_deja_fait = $state([]);
	onMount(async () => {
		const response = await fetch('/api/devoirs');
		const devoirs = await response.json();
		DEVOIRS = devoirs;
		const _devoirs_deja_fait = JSON.parse(window.localStorage.getItem('devoirs_deja_fait') || '[]');
		devoirs_deja_fait = _devoirs_deja_fait;
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

	function handleDejaFait(devoir_id: number) {
		const _devoirs_deja_fait = window.localStorage.getItem('devoirs_deja_fait');
		if (_devoirs_deja_fait) {
			const JSON_devoirs_deja_fait = JSON.parse(_devoirs_deja_fait || '[]');
			if (JSON_devoirs_deja_fait.includes(devoir_id)) {
				return;
			}
			devoirs_deja_fait = [...devoirs_deja_fait, devoir_id];
			window.localStorage.setItem(
				'devoirs_deja_fait',
				JSON.stringify([...JSON_devoirs_deja_fait, devoir_id])
			);
		} else {
			window.localStorage.setItem('devoirs_deja_fait', JSON.stringify([devoir_id]));
		}
	}

	function handleAFaire(devoir_id: number) {
		let _devoirs_deja_fait = window.localStorage.getItem('devoirs_deja_fait');
		if (_devoirs_deja_fait) {
			const JSON_devoirs_deja_fait = JSON.parse(_devoirs_deja_fait || '[]');
			devoirs_deja_fait = JSON_devoirs_deja_fait.filter((id) => id !== devoir_id);
			window.localStorage.setItem('devoirs_deja_fait', JSON.stringify([...devoirs_deja_fait]));
		} else {
			window.localStorage.setItem('devoirs_deja_fait', JSON.stringify([devoir_id]));
		}
	}
</script>

{#await AfficherOuNon then value}
	{#if STORE.connected === true}
		<div class="flex">
			<!-- Menu de navigation à gauche -->
			<nav
				class="w-64 h-screen bg-gray-100 text-black flex flex-col fixed left-0 overflow-y-auto shadow-lg"
			>
				<div class="p-4">
					<h2 class="text-2xl font-bold">Action</h2>
					<!-- Titre ajouté -->
				</div>
				<ul class="flex-1 p-4 space-y-4">
					<li>
						<select
							class="block w-full px-4 py-2 rounded border border-gray-300 bg-white text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
							on:change={(e) => toggleDarkMode(e.target.value === 'dark')}
						>
							<option value="light">☀️ Mode Clair</option>
							<option value="dark">🌙 Mode Sombre</option>
						</select>
					</li>
					<li>
						<select
							class="block w-full px-4 py-2 rounded border border-gray-300 bg-white text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
							on:change={(e) => switchToLanguage(e.target.value)}
						>
							<option value="fr">🇫🇷 Français</option>
							<option value="en">🇬🇧 English</option>
						</select>
					</li>
				</ul>
				<div class="p-4 mt-auto">
					<button
						class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-150 ease-in-out"
						>Mode sombre</button
					>
					<!-- Bouton ajouté -->
				</div>
			</nav>

			<!-- Contenu principal -->
			<div class="flex-1 ml-64 max-w-7xl mx-auto p-8 mt-6 bg-white">
				{#if STORE.utilisateur?.role === ERoleUtilisateur.PROFESSEUR}
					<h1 class="text-4xl font-bold mb-10">
						Bienvenue {STORE.utilisateur?.nom}, il y a {DEVOIRS.length} devoirs en ligne.
					</h1>
				{:else}
					<h1 class="text-4xl font-bold mb-10">
						Bienvenue {STORE.utilisateur?.nom}, vous avez {DEVOIRS.length} devoirs à rendre.
					</h1>
				{/if}
				<div class="space-y-4 mb-8">
					{#each DEVOIRS.toSorted((a, b) => a.timestamp - b.timestamp).slice(0, 3) as devoir}
						<div
							class="shadow-md rounded-lg p-8 border-t border-b border-gray-300 flex justify-between items-center"
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
										Ajouté par <span class="font-bold"
											>{STORE.utilisateur?.nom} {STORE.utilisateur?.prenom}</span
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
											>{new Date(devoir.expire_le_timestamp).toLocaleDateString('fr-FR')}</span
										>
										à
										<span class="font-bold"
											>{new Date(devoir.expire_le_timestamp).toLocaleTimeString('fr-FR')}</span
										>
									</p>
								</div>
							</div>
							<div class="border-l border-gray-300 h-full mx-4"></div>
							<div class="flex-1">
								<div class="flex justify-between items-center mt-2">
									<button
										on:click={() => handleVoirPlus(devoir?.id)}
										class="px-4 py-2 bg-[#4D3677] bg-opacity-90 text-[#3B2A5B] font-bold rounded-md hover:bg-opacity-100 transition duration-150 ease-in-out"
										>Voir plus</button
									>
									<div class="flex space-x-2">
										<button
											on:click={() => handleAFaire(devoir?.id)}
											class="px-4 py-2 bg-[#F7B000] text-[#3B2A5B] font-bold rounded-md hover:bg-[#D69A00] transition duration-150 ease-in-out {!devoirs_deja_fait?.includes(
												devoir?.id
											)
												? 'opacity-50'
												: ''}">À faire</button
										>
										<button
											on:click={() => handleDejaFait(devoir?.id)}
											class="px-4 py-2 bg-[#DDD4EC] text-[#3B2A5B] font-bold rounded-md transition duration-150 ease-in-out {devoirs_deja_fait?.includes(
												devoir?.id
											)
												? 'opacity-50'
												: ''}">Déjà fait</button
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
