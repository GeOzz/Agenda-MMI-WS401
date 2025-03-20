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
</script>

{#await AfficherOuNon then value}
	{#if STORE.connected === true}
		<div class="max-w-7xl mx-auto p-6">
			<h1 class="text-4xl font-bold mb-6">
				Bienvenue ETUDIANT, vous avez {DEVOIRS.length} devoirs à rendre.
			</h1>

			<div class="space-y-4 mb-8">
				{#each DEVOIRS as devoir}
					<div class="bg-white shadow-md rounded-lg p-6 border border-gray-300">
						<div class="flex justify-between items-center mb-4">
							<div>
								<h2 class="text-xl font-semibold">{devoir.matiere} - {devoir.titre}</h2>
								<p class="text-gray-500">
									Rendu prévu pour le {new Date(devoir.expire_le_timestamp).toLocaleDateString(
										'fr-FR'
									)}
									à {new Date(devoir.expire_le_timestamp).toLocaleTimeString('fr-FR')}
								</p>
							</div>
							<div class="flex space-x-2">
								<button class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
									>À faire</button
								>
								<a
									href={`/devoir/${devoir.id}`}
									class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">Voir</a
								>
							</div>
						</div>
						<p class="text-gray-700">{devoir.description}</p>
					</div>
				{/each}
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{#each semesters as semester}
					<div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300">
						<img src="/fond-devoirs.jpeg" alt="Semestre" class="w-full h-40 object-cover" />
						<div class="p-4">
							<h3 class="text-xl font-semibold mb-2">{semester.title}</h3>
							<p class="text-gray-500 mb-2">{semester.subtitle}</p>
							<p class="text-gray-400 text-sm"></p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/await}
