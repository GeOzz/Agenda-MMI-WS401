<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Error from '../error.svelte';

	let utilisateurs = [];
	let recherche = '';
	let tri = 'Nom';
	let pageActuelle = 1;
	const utilisateursParPage = 5;
	let utilisateur = $page.data.utilisateur; // Données de l'utilisateur connecté
	let erreur = null;

	// Vérification des droits d'accès
	if (utilisateur.role !== 'PROFESSEUR') {
		erreur = { status: 403, message: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page." };
	}

	// Charger les utilisateurs depuis l'API
	onMount(async () => {
		await chargerUtilisateurs();
	});

	async function chargerUtilisateurs() {
		try {
			const response = await fetch('/api/utilisateur');
			if (response.ok) {
				utilisateurs = await response.json();
			} else {
				console.error('Erreur lors du chargement des utilisateurs:', await response.text());
			}
		} catch (error) {
			console.error('Erreur réseau:', error);
		}
	}

	// Fonction pour rediriger vers la page de confirmation de suppression
	function confirmerSuppressionUtilisateur(id: number) {
		goto(`/menu-admin/supprimer/${id}`); // Redirection vers la page de confirmation
	}

	// Fonction pour rediriger vers la page d'édition
	function editerUtilisateur(id: number) {
		goto(`/menu-admin/editer/${id}`);
	}

	function allerAjouterUtilisateur() {
		goto('/menu-admin/ajouter-utilisateur');
	}

	// Filtrer et trier les utilisateurs
	$: utilisateursFiltres = utilisateurs
		.filter((utilisateur) =>
			utilisateur.nom.toLowerCase().includes(recherche.toLowerCase()) ||
			utilisateur.email.toLowerCase().includes(recherche.toLowerCase())
		)
		.sort((a, b) => {
			if (tri === 'Nom') return a.nom.localeCompare(b.nom);
			if (tri === 'Email') return a.email.localeCompare(b.email);
			return 0;
		});

	// Pagination
	$: utilisateursAffiches = utilisateursFiltres.slice(
		(pageActuelle - 1) * utilisateursParPage,
		pageActuelle * utilisateursParPage
	);

	$: nombreDePages = Math.ceil(utilisateursFiltres.length / utilisateursParPage);
</script>

{#if erreur}
	<Error status={erreur.status} message={erreur.message} />
{:else}
	<div class="p-8 bg-gray-50 min-h-screen">
		<h1 class="text-4xl font-bold mb-6 text-gray-800">Gestion des Utilisateurs</h1>
		<p class="text-gray-600 mb-8">
			Gérez les comptes utilisateur, modifiez leurs informations ou supprimez-les si nécessaire.
		</p>

		<div class="flex items-center justify-between mb-6">
			<input
				type="text"
				placeholder="Rechercher un utilisateur..."
				bind:value={recherche}
				class="w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
			/>
			<div class="flex flex-wrap items-center justify-center gap-4 mb-6">
				<span class="text-gray-600 font-semibold">Trier par :</span>
				<select
					bind:value={tri}
					class="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none pr-8"
				>
					<option value="Nom">Nom</option>
					<option value="Email">Email</option>
				</select>
			</div>
		</div>

		<table class="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
			<thead class="bg-purple-100 text-gray-800">
				<tr>
					<th class="px-6 py-3 text-left font-semibold">Nom</th>
					<th class="px-6 py-3 text-left font-semibold">Email</th>
					<th class="px-6 py-3 text-left font-semibold">Rôle</th>
					<th class="px-6 py-3 text-center font-semibold">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each utilisateursAffiches as utilisateur}
					<tr class="hover:bg-gray-50">
						<td class="px-6 py-4 border-b">{utilisateur.nom}</td>
						<td class="px-6 py-4 border-b">{utilisateur.email}</td>
						<td class="px-6 py-4 border-b">{utilisateur.role}</td>
						<td class="px-6 py-4 border-b text-center">
							{#if utilisateur.role !== 'PROFESSEUR'}
								<button
									class="px-4 py-2 bg-[#FDB813] text-white rounded-md hover:bg-[#EAA10D] mr-2 font-semibold"
									onclick={() => editerUtilisateur(utilisateur.id)}
								>
									Éditer
								</button>
								<button
									class="px-4 py-2 bg-[#CAC3D6] text-[#3B2A5B] rounded-md hover:bg-[#B5ADC4] font-semibold"
									onclick={() => confirmerSuppressionUtilisateur(utilisateur.id)}
								>
									Supprimer
								</button>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="text-center text-gray-500 py-6">Aucun utilisateur trouvé</td>
					</tr>
				{/each}
			</tbody>
		</table>

			<!-- Bouton pour ajouter un utilisateur (visible uniquement pour les professeurs) -->
			{#if utilisateur.role === 'PROFESSEUR'}
			<div class="mt-10 mb-6 flex justify-end">
				<button
					class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-semibold"
					onclick={allerAjouterUtilisateur}
				>
					Ajouter un utilisateur
				</button>
			</div>
		{/if}

		<div class="flex justify-between items-center mt-6">
			{#if nombreDePages > 1}
				{#if pageActuelle > 1}
					<button
						class="px-4 py-2 bg-[#CAC3D6] text-[#3B2A5B] rounded-md hover:bg-[#B5ADC4] font-semibold"
						onclick={() => (pageActuelle = Math.max(1, pageActuelle - 1))}
					>
						Précédent
					</button>
				{/if}
				<div class="text-gray-600 font-semibold">
					Page {pageActuelle} sur {nombreDePages}
				</div>
				{#if pageActuelle < nombreDePages}
					<button
						class="px-4 py-2 bg-[#CAC3D6] text-[#3B2A5B] rounded-md hover:bg-[#B5ADC4] font-semibold"
						onclick={() => (pageActuelle = Math.min(nombreDePages, pageActuelle + 1))}
					>
						Suivant
					</button>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	select {
		background-position: right 0rem center; /* Ajoute un espace entre le texte et la flèche */
		background-repeat: no-repeat;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='gray'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
	}
</style>
