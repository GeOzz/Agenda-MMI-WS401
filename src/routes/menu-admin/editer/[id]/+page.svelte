<script lang="ts">
	import Error from '../../../error.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { EPromotion, ERoleUtilisateur } from '$lib/interfaces/IUtilisateur'; // Ajout de l'importation

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
	let showSuccessPopup = false; // État pour afficher le popup de succès
	let erreur = null;

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
				erreur = { status: response.status, message: "Erreur lors du chargement des données utilisateur." };
			}
		} catch (error) {
			erreur = { status: 500, message: "Erreur réseau ou problème serveur." };
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

	let message = '';
	let messageType = ''; // 'success' ou 'error'

	function afficherMessage(type: string, texte: string) {
		messageType = type;
		message = texte;
		setTimeout(() => {
			message = '';
		}, 3000); // Le message disparaît après 3 secondes
	}

	// Sauvegarder les modifications
	async function sauvegarderUtilisateur() {
		// Validation des champs nom et prénom
		if (utilisateur.nom.length < 3 || utilisateur.prenom.length < 3) {
			afficherMessage('error', 'Le nom et le prénom doivent contenir au moins 3 caractères.');
			return;
		}

		try {
			const response = await fetch(`/api/utilisateur/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(utilisateur)
			});

			if (response.ok) {
				afficherMessage('success', 'Modification effectuée avec succès.');
				setTimeout(() => {
					goto('/menu-admin'); // Redirection après succès
				}, 3500); // Attendre la fin de l'animation
			} else {
				const error = await response.json();
				afficherMessage('error', error.message || 'Erreur lors de la mise à jour.');
			}
		} catch (error) {
			afficherMessage('error', 'Erreur réseau lors de la mise à jour.');
		}
	}

	// Supprimer l'utilisateur (fonction inutilisée ici, peut être supprimée si non utilisée ailleurs)
	// async function supprimerUtilisateur() {
	// 	if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
	// 		try {
	// 			const response = await fetch(`/api/utilisateur/${id}`, {
	// 				method: 'DELETE'
	// 			});

	// 			if (!response.ok) {
	// 				const error = await response.text();
	// 				alert('Erreur : ' + error);
	// 				return;
	// 			}

	// 			alert('Utilisateur supprimé avec succès.');
	// 			goto('/menu-admin');
	// 		} catch (error) {
	// 			alert('Erreur réseau lors de la suppression de l’utilisateur.');
	// 			console.error(error);
	// 		}
	// 	}
	// }
</script>

{#if erreur}
	<Error status={erreur.status} message={erreur.message} />
{:else}
	<div class="p-8 bg-gray-50 min-h-screen">
		<h1 class="text-4xl font-bold mb-6 text-gray-800">Modifier l'utilisateur</h1>
		<p class="text-gray-600 mb-8">
			Gérez les détails de ce compte utilisateur, y compris les informations personnelles, le rôle et les groupes.
		</p>

		<!-- Popup de succès -->
		{#if showSuccessPopup}
			<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
				<div class="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
					Modification effectuée avec succès !
				</div>
			</div>
		{/if}

		<!-- Message contextuel -->
		{#if message}
			<div
				class="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-500 ease-in-out z-50"
				class:bg-green-500={messageType === 'success'}
				class:bg-red-500={messageType === 'error'}
				style="opacity: 1; animation: smooth-slide-up-and-fade 3.5s ease-in-out forwards;"
			>
				{message}
			</div>
		{/if}

		<div class="space-y-6 bg-white p-6 rounded-lg shadow-md">
			<div class="grid grid-cols-2 gap-6">
					<div class="relative">
						<input
							id="nom"
							type="text"
							bind:value={utilisateur.nom}
							class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
							placeholder=" "
						/>
						<label for="nom">Nom</label>
					</div>
					<div class="relative">
						<input
							id="prenom"
							type="text"
							bind:value={utilisateur.prenom}
							class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
							placeholder=" "
						/>
						<label for="prenom">Prénom</label>
					</div>
				</div>

				<div class="relative">
					<input
						id="email"
						type="email"
						bind:value={utilisateur.email}
						class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
						placeholder=" "
					/>
					<label for="email">E-mail</label>
				</div>

				<div class="relative">
					<select
						id="promotion"
						bind:value={utilisateur.promotion}
						class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					>
						<option value="" disabled>Choisir une promotion</option>
						{#each Object.values(EPromotion) as promotion}
							<option value={promotion}>{promotion}</option>
						{/each}
					</select>
					<label for="promotion">Promotion</label>
				</div>

				<div class="relative">
					<label class="block text-gray-700 font-bold mb-2">Rôles de l'utilisateur</label>
					<div class="flex flex-wrap gap-4">
						{#each Object.values(ERoleUtilisateur).filter(role => role !== 'PROFESSEUR') as role}
							<label class="flex items-center space-x-2">
								<input
									type="radio"
									name="role"
									value={role}
									bind:group={utilisateur.role}
									class="form-radio text-purple-500 focus:ring-purple-500"
								/>
								<span class="text-gray-700">{role}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="grid grid-cols-2 gap-6">
					<div class="relative">
						<select
							id="groupeTD"
							bind:value={utilisateur.groupeTD}
							onchange={() => mettreAJourGroupesTP(utilisateur.groupeTD)}
							class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
						>
							<option value="" disabled>Choisir un groupe TD</option>
							{#each groupesTD as groupe}
								<option value={groupe}>{groupe}</option>
							{/each}
						</select>
						<label for="groupeTD">Groupe TD</label>
					</div>
					<div class="relative">
						<select
							id="groupeTP"
							bind:value={utilisateur.groupeTP}
							class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
						>
							<option value="" disabled>Choisir un groupe TP</option>
							{#each groupesTP as groupe}
								<option value={groupe}>{groupe}</option>
							{/each}
						</select>
						<label for="groupeTP">Groupe TP</label>
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
		</div>
{/if}

<style>
	/* Animation fluide pour l'apparition et la disparition */
	@keyframes smooth-slide-up-and-fade {
		0% {
			opacity: 0;
			transform: translate(-50%, 30px); /* Décalage initial */
		}
		15% {
			opacity: 1;
			transform: translate(-50%, 0); /* Centré */
		}
		85% {
			opacity: 1;
			transform: translate(-50%, 0); /* Maintien */
		}
		100% {
			opacity: 0;
			transform: translate(-50%, 30px); /* Disparition */
		}
	}

	/* Styles pour les labels flottants */
	.relative input,
	.relative select {
		padding-top: 1.25rem; /* Ajout d'espace pour le label flottant */
	}

	.relative label {
		position: absolute;
		left: 1rem;
		top: 1.25rem;
		font-size: 1rem;
		color: #6b7280; /* Couleur grise */
		transition: all 0.2s ease-in-out;
	}

	.relative input:focus + label,
	.relative input:not(:placeholder-shown) + label,
	.relative select:focus + label,
	.relative select:not([value=""]) + label {
		top: -0.5rem; /* Position plus haute */
		left: 0.75rem; /* Ajustement horizontal */
		font-size: 0.875rem; /* Réduction de la taille */
		color: #4b3b7c; /* Couleur violette */
		background-color: white; /* Fond blanc pour éviter le chevauchement */
		padding: 0 0.25rem; /* Ajout de padding pour le fond blanc */
	}
</style>