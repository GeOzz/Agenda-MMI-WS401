<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let utilisateurs = [];
	let recherche = '';
	let tri = 'Nom';
	let pageActuelle = 1;
	const utilisateursParPage = 5;

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
		<div class="flex items-center space-x-4">
			<span class="text-gray-600 font-semibold">Trier</span>
			<select
				bind:value={tri}
				class="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
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

	<div class="flex justify-between items-center mt-6">
		<button
			class="px-4 py-2 bg-[#CAC3D6] text-[#3B2A5B] rounded-md hover:bg-[#B5ADC4] font-semibold"
			onclick={() => (pageActuelle = Math.max(1, pageActuelle - 1))}
			disabled={pageActuelle === 1}
		>
			Précédent
		</button>
		<div class="text-gray-600 font-semibold">
			Page {pageActuelle} sur {nombreDePages}
		</div>
		<button
			class="px-4 py-2 bg-[#CAC3D6] text-[#3B2A5B] rounded-md hover:bg-[#B5ADC4] font-semibold"
			onclick={() => (pageActuelle = Math.min(nombreDePages, pageActuelle + 1))}
			disabled={pageActuelle === nombreDePages}
		>
			Suivant
		</button>
	</div>
</div>
