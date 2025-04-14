<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let utilisateur = {
		nom: '',
		prenom: '',
		email: '',
		role: '',
		groupeTD: '',
		groupeTP: '',
		promotion: ''
	};
	let id: number;

	// Groupes TD et leurs TP associés
	const groupesTD = ['TD AB', 'TD CD', 'TD EF', 'TD GH', 'TD IJ'];
	let groupesTP = []; // Liste des TP dynamiquement mise à jour

	// Charger les données de l'utilisateur
	onMount(async () => {
		const params = $page.params;
		id = Number(params.id);
		await chargerUtilisateur(id);

		// Mettre à jour les TP en fonction du TD actuel
		mettreAJourGroupesTP(utilisateur.groupeTD);
	});

	// Fonction pour charger les données de l'utilisateur
	async function chargerUtilisateur(id: number) {
		try {
			const response = await fetch(`/api/utilisateur/${id}`);
			if (response.ok) {
				utilisateur = await response.json();
				mettreAJourGroupesTP(utilisateur.groupeTD); // Mettre à jour les TP après le chargement
			} else {
				goto('/menu-admin?erreur=chargement');
			}
		} catch (error) {
			goto('/menu-admin?erreur=reseau');
		}
	}

	// Mettre à jour les TP en fonction du TD sélectionné
	function mettreAJourGroupesTP(td: string) {
		if (td === 'TD AB') groupesTP = ['TP A', 'TP B'];
		else if (td === 'TD CD') groupesTP = ['TP C', 'TP D'];
		else if (td === 'TD EF') groupesTP = ['TP E', 'TP F'];
		else if (td === 'TD GH') groupesTP = ['TP G', 'TP H'];
		else if (td === 'TD IJ') groupesTP = ['TP I', 'TP J'];
		else groupesTP = [];

		// Définir automatiquement le premier TP si le TP actuel n'est pas valide
		if (!groupesTP.includes(utilisateur.groupeTP)) {
			utilisateur.groupeTP = groupesTP[0] || ''; // Définit le premier TP ou vide si aucun TP
		}
	}

	// Sauvegarder les modifications
	async function sauvegarderUtilisateur() {
		try {
			const response = await fetch(`/api/utilisateur/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(utilisateur)
			});
			if (response.ok) {
				goto('/menu-admin?success=modification');
			} else {
				alert('Erreur lors de la mise à jour de l’utilisateur.');
			}
		} catch (error) {
			alert('Erreur réseau lors de la mise à jour de l’utilisateur.');
		}
	}
</script>

<div class="p-8 bg-gray-50 min-h-screen">
	<h1 class="text-4xl font-bold mb-6 text-gray-800">Modifier l'utilisateur</h1>
	<p class="text-gray-600 mb-8">
		Gérez les détails de ce compte utilisateur, y compris les informations personnelles, le rôle et les groupes.
	</p>

	<div class="space-y-6 bg-white p-6 rounded-lg shadow-md">
		<div class="grid grid-cols-2 gap-6">
			<div>
				<label for="nom" class="block text-gray-700 font-bold mb-2">Nom</label>
				<input
					id="nom"
					type="text"
					bind:value={utilisateur.nom}
					class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				/>
			</div>
			<div>
				<label for="prenom" class="block text-gray-700 font-bold mb-2">Prénom</label>
				<input
					id="prenom"
					type="text"
					bind:value={utilisateur.prenom}
					class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				/>
			</div>
		</div>

		<div>
			<label for="email" class="block text-gray-700 font-bold mb-2">E-mail</label>
			<input
				id="email"
				type="email"
				bind:value={utilisateur.email}
				class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
			/>
		</div>

			<div class="grid grid-cols-2 gap-6">
				<div>
					<label for="groupeTD" class="block text-gray-700 font-bold mb-2">Groupe TD</label>
					<select
						id="groupeTD"
						bind:value={utilisateur.groupeTD}
						onchange={() => mettreAJourGroupesTP(utilisateur.groupeTD)}
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					>
						<option value="" disabled>Choisir un groupe TD</option>
						{#each groupesTD as groupe}
							<option value={groupe}>{groupe}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="groupeTP" class="block text-gray-700 font-bold mb-2">Groupe TP</label>
					<select
						id="groupeTP"
						bind:value={utilisateur.groupeTP}
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					>
						<option value="" disabled>Choisir un groupe TP</option>
						{#each groupesTP as groupe}
							<option value={groupe}>{groupe}</option>
						{/each}
					</select>
				</div>
			</div>
	</div>

	<div class="mt-6 flex justify-between items-center">
		<div class="flex space-x-4">
			<button
				class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-semibold"
				onclick={() => goto('/menu-admin')}
			>
				Annuler
			</button>
			<button
				class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-semibold"
				onclick={sauvegarderUtilisateur}
			>
				Enregistrer
			</button>
		</div>
	</div>
</div>
