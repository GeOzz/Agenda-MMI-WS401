<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { EGroupeTD, EGroupeTP, ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';

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

	let groupesTD = Object.values(EGroupeTD);
	let groupesTP = Object.values(EGroupeTP);

	// Charger les données de l'utilisateur
	onMount(async () => {
		const params = $page.params;
		id = Number(params.id);
		await chargerUtilisateur(id);

		// Redirigez si l'utilisateur est un PROFESSEUR
		if (utilisateur.role === 'PROFESSEUR') {
			alert("Vous ne pouvez pas modifier un compte PROFESSEUR.");
			goto('/menu-admin');
		}

		// Vérifiez si l'utilisateur connecté est un PROFESSEUR
		if ($page.data.utilisateur.role !== 'PROFESSEUR') {
			alert("Accès refusé : cette page est réservée aux professeurs.");
			goto('/menu-admin');
		}
	});

	async function chargerUtilisateur(id: number) {
		try {
			const response = await fetch(`/api/utilisateur/${id}`);
			if (response.ok) {
				utilisateur = await response.json();
			} else {
				alert('Erreur lors du chargement des données de l’utilisateur');
				goto('/menu-admin');
			}
		} catch (error) {
			console.error('Erreur réseau:', error);
			goto('/menu-admin');
		}
	}

	// Sauvegarder les modifications
	async function sauvegarderUtilisateur() {
		try {
			console.log('Données envoyées:', utilisateur); // Log des données envoyées
			const response = await fetch(`/api/utilisateur/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(utilisateur)
			});
			console.log('Réponse brute:', response); // Log de la réponse brute
			if (response.ok) {
				alert('Utilisateur mis à jour avec succès');
				goto('/menu-admin');
			} else {
				const errorText = await response.text();
				console.error('Erreur lors de la mise à jour:', errorText); // Log de l'erreur
				alert('Erreur lors de la mise à jour de l’utilisateur');
			}
		} catch (error) {
			console.error('Erreur réseau:', error);
		}
	}

	// Supprimer l'utilisateur
	async function supprimerUtilisateur() {
		try {
			const response = await fetch(`/api/utilisateur/${id}`, { method: 'DELETE' });
			if (response.ok) {
				alert('Utilisateur supprimé avec succès');
				goto('/menu-admin');
			} else {
				alert('Erreur lors de la suppression de l’utilisateur');
			}
		} catch (error) {
			console.error('Erreur réseau:', error);
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
				<label class="block text-gray-700 font-bold mb-2">Nom</label>
				<input
					type="text"
					bind:value={utilisateur.nom}
					class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				/>
			</div>
			<div>
				<label class="block text-gray-700 font-bold mb-2">Prénom</label>
				<input
					type="text"
					bind:value={utilisateur.prenom}
					class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				/>
			</div>
		</div>

		<div>
			<label class="block text-gray-700 font-bold mb-2">E-mail</label>
			<input
				type="email"
				bind:value={utilisateur.email}
				class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
			/>
		</div>

		{#if utilisateur.role !== 'PROFESSEUR'}
			<div>
				<label class="block text-gray-700 font-bold mb-2">Promotion</label>
				<input
					type="text"
					bind:value={utilisateur.promotion}
					class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				/>
			</div>

			<div class="grid grid-cols-2 gap-6">
				<div>
					<label class="block text-gray-700 font-bold mb-2">Groupe TD</label>
					<select
						bind:value={utilisateur.groupeTD}
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					>
						<option value="" disabled selected>Choisir un groupe TD</option>
						{#each groupesTD as groupe}
							<option value={groupe}>{groupe}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-gray-700 font-bold mb-2">Groupe TP</label>
					<select
						bind:value={utilisateur.groupeTP}
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					>
						<option value="" disabled selected>Choisir un groupe TP</option>
						{#each groupesTP as groupe}
							<option value={groupe}>{groupe}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}

		<div>
			<label class="block text-gray-700 font-bold mb-2">Rôles de l'utilisateur</label>
			<div class="flex space-x-4">
				<label class="flex items-center space-x-2">
					<input
						type="radio"
						bind:group={utilisateur.role}
						value={ERoleUtilisateur.ETUDIANT}
						class="form-radio"
					/>
					<span>Étudiant</span>
				</label>
				<label class="flex items-center space-x-2">
					<input
						type="radio"
						bind:group={utilisateur.role}
						value={ERoleUtilisateur.DELEGUE}
						class="form-radio"
					/>
					<span>Délégué</span>
				</label>
				<label class="flex items-center space-x-2">
					<input
						type="radio"
						bind:group={utilisateur.role}
						value={ERoleUtilisateur.PROFESSEUR}
						class="form-radio"
					/>
					<span>Professeur</span>
				</label>
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
