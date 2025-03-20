<script lang="ts">
	import { browser } from '$app/environment';
	import { EPromotion } from '$lib/interfaces/IUtilisateur';
	import { checkConnected, redirectToConnexion, STORE } from '$lib/store.svelte';
	import { onMount } from 'svelte';

	let devoirs = [
		{
			id: 1,
			titre: 'Ergonomie et Accessibilité',
			matiere: 'WR203',
			date: '26/03/2025',
			heure: '20h',
			description:
				'Réaliser une maquette responsive d’un site déjà existant en utilisant les principes d’ergonomie et d’accessibilité vus en cours.',
			rendu: 'Professeur'
		},
		{
			id: 2,
			titre: 'Anglais',
			matiere: 'WR207',
			date: '26/03/2025',
			heure: '14h',
			description: 'Réaliser une présentation en anglais sur le sujet de votre choix.',
			rendu: 'Professeur'
		},
		{
			id: 3,
			titre: 'Anglais Renforcé',
			matiere: 'WR202',
			date: '26/03/2025',
			heure: '10h',
			description: 'Réaliser une présentation en anglais sur le sujet de votre choix.',
			rendu: 'Professeur'
		}
	];

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
</script>

{#await AfficherOuNon then value}
	{#if STORE.connected === true}
		<div class="max-w-7xl mx-auto p-6">
			<h1 class="text-4xl font-bold mb-6">
				Bienvenue ETUDIANT, vous avez {devoirs.length} devoirs à rendre.
			</h1>

			<div class="space-y-4 mb-8">
				{#each devoirs as devoir}
					<div class="bg-white shadow-md rounded-lg p-6 border border-gray-300">
						<div class="flex justify-between items-center mb-4">
							<div>
								<h2 class="text-xl font-semibold">{devoir.matiere} - {devoir.titre}</h2>
								<p class="text-gray-500">Rendu prévu pour le {devoir.date} à {devoir.heure}</p>
							</div>
							<div class="flex space-x-2">
								<button class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
									>À faire</button
								>
								<button class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
									>Voir</button
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
							<p class="text-gray-400 text-sm">
								Dernière modification effectuée le {semester.lastUpdate} par {semester.updatedBy}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/await}
