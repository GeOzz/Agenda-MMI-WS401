<script lang="ts">
	import Error from '../../error.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { EPromotion, ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';

	let utilisateur = $page.data.utilisateur;
	let erreur = null;

	onMount(() => {
		if (utilisateur.role !== 'PROFESSEUR') {
			erreur = { status: 403, message: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page." };
		}
	});

	let utilisateurForm = {
		nom: '',
		prenom: '',
		email: '',
		role: 'ETUDIANT', // Rôle par défaut
		groupeTD: '',
		groupeTP: '',
		promotion: '',
		mot_de_passe: '',
		confirmation_mot_de_passe: ''
	};

	let erreurs = {
		nom: '',
		prenom: '',
		email: '',
		mot_de_passe: '',
		confirmation_mot_de_passe: '',
		promotion: '',
		groupeTD: '',
		groupeTP: ''
	};

	const groupesTD = ['TD AB', 'TD CD', 'TD EF', 'TD GH', 'TD IJ'];
	let groupesTP = [];

	function mettreAJourGroupesTP(td: string) {
		if (td === 'TD AB') groupesTP = ['TP A', 'TP B'];
		else if (td === 'TD CD') groupesTP = ['TP C', 'TP D'];
		else if (td === 'TD EF') groupesTP = ['TP E', 'TP F'];
		else if (td === 'TD GH') groupesTP = ['TP G', 'TP H'];
		else if (td === 'TD IJ') groupesTP = ['TP I', 'TP J'];
		else groupesTP = [];
		utilisateurForm.groupeTP = groupesTP[0] || '';
	}

	let message = '';
	let messageType = ''; // 'success' ou 'error'

	function afficherMessage(type: string, texte: string) {
		messageType = type;
		message = texte;
		setTimeout(() => {
			message = '';
		}, 3000);
	}

	function validerChamps() {
		erreurs = {
			nom: utilisateurForm.nom.length < 3 ? 'Le nom doit contenir au moins 3 caractères.' : '',
			prenom: utilisateurForm.prenom.length < 3 ? 'Le prénom doit contenir au moins 3 caractères.' : '',
			email: !utilisateurForm.email.includes('@') ? 'Veuillez entrer une adresse e-mail valide.' : '',
			mot_de_passe: utilisateurForm.mot_de_passe.length < 8 ? 'Le mot de passe doit contenir au moins 8 caractères.' : '',
			confirmation_mot_de_passe:
				utilisateurForm.mot_de_passe !== utilisateurForm.confirmation_mot_de_passe
					? 'Les mots de passe ne correspondent pas.'
						: '',
			promotion: utilisateurForm.promotion === '' ? 'Veuillez sélectionner une promotion.' : '',
			groupeTD: utilisateurForm.groupeTD === '' ? 'Veuillez sélectionner un groupe TD.' : '',
			groupeTP: utilisateurForm.groupeTP === '' ? 'Veuillez sélectionner un groupe TP.' : ''
		};

		return Object.values(erreurs).every((erreur) => erreur === '');
	}

	async function ajouterUtilisateur() {
		if (!validerChamps()) {
			afficherMessage('error', 'Veuillez remplir tous les champs correctement.');
			return;
		}

		try {
			const response = await fetch('/api/inscription-admin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(utilisateurForm)
			});

			if (response.ok) {
				afficherMessage('success', 'Utilisateur ajouté avec succès.');
				setTimeout(() => {
					goto('/menu-admin');
				}, 3500);
			} else {
				const error = await response.text();
				afficherMessage('error', error || 'Erreur lors de l\'ajout de l\'utilisateur.');
			}
		} catch (error) {
			afficherMessage('error', 'Erreur réseau lors de l\'ajout de l\'utilisateur.');
		}
	}
</script>

<style>
	/* Ajustement des styles pour les labels flottants */
	.relative input {
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
	.relative input:not(:placeholder-shown) + label {
		top: -0.5rem; /* Position plus haute */
		left: 0.75rem; /* Ajustement horizontal */
		font-size: 0.875rem; /* Réduction de la taille */
		color: #4b3b7c; /* Couleur violette */
		background-color: white; /* Fond blanc pour éviter le chevauchement */
		padding: 0 0.25rem; /* Ajout de padding pour le fond blanc */
	}

	.input-error {
		border-color: #ef4444; /* Rouge pour les erreurs */
	}

	.input-success {
		border-color: #10b981; /* Vert pour le succès */
	}
</style>

{#if erreur}
	<Error status={erreur.status} message={erreur.message} />
{:else}
	<div class="p-8 bg-gray-50 min-h-screen">
		<h1 class="text-4xl font-bold mb-6 text-gray-800">Ajouter un utilisateur</h1>
		<p class="text-gray-600 mb-8">
			Ajoutez un utilisateur pour gérer les détails de ce compte, y compris la manière dont il est perçu par les autres utilisateurs, ainsi que d'autres informations utilisées pour la communication et la personnalisation du système.
		</p>

		<div class="space-y-6 bg-white p-6 rounded-lg shadow-md">
			<div class="grid grid-cols-2 gap-6">
					<div class="relative">
					<input
						id="nom"
						type="text"
						bind:value={utilisateurForm.nom}
						class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
						placeholder=" "
					/>
					<label for="nom">Nom</label>
					{#if erreurs.nom}
						<p class="text-red-500 text-sm mt-1">{erreurs.nom}</p>
					{/if}
				</div>
					<div class="relative">
					<input
						id="prenom"
						type="text"
						bind:value={utilisateurForm.prenom}
						class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
						placeholder=" "
					/>
					<label for="prenom">Prénom</label>
					{#if erreurs.prenom}
						<p class="text-red-500 text-sm mt-1">{erreurs.prenom}</p>
					{/if}
				</div>
			</div>

			<div class="relative">
				<input
					id="email"
					type="email"
					bind:value={utilisateurForm.email}
					class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					placeholder=" "
				/>
				<label for="email">E-mail</label>
				{#if erreurs.email}
					<p class="text-red-500 text-sm mt-1">{erreurs.email}</p>
				{/if}
			</div>

			<div class="relative">
				<input
					id="mot_de_passe"
					type="password"
					bind:value={utilisateurForm.mot_de_passe}
					class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					placeholder=" "
					class:input-error={utilisateurForm.mot_de_passe.length > 0 && utilisateurForm.confirmation_mot_de_passe.length > 0 && utilisateurForm.mot_de_passe !== utilisateurForm.confirmation_mot_de_passe}
					class:input-success={utilisateurForm.mot_de_passe.length >= 8 && utilisateurForm.mot_de_passe === utilisateurForm.confirmation_mot_de_passe}
				/>
				<label for="mot_de_passe" class="absolute left-4 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
					Mot de passe
				</label>
				{#if erreurs.mot_de_passe}
					<p class="text-red-500 text-sm mt-1">{erreurs.mot_de_passe}</p>
				{/if}
			</div>

			<div class="relative">
				<input
					id="confirmation_mot_de_passe"
					type="password"
					bind:value={utilisateurForm.confirmation_mot_de_passe}
					class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 input-default"
					placeholder=" "
					class:input-error={utilisateurForm.mot_de_passe.length > 0 && utilisateurForm.confirmation_mot_de_passe.length > 0 && utilisateurForm.mot_de_passe !== utilisateurForm.confirmation_mot_de_passe}
					class:input-success={utilisateurForm.mot_de_passe.length >= 8 && utilisateurForm.mot_de_passe === utilisateurForm.confirmation_mot_de_passe}
				/>
				<label for="confirmation_mot_de_passe" class="absolute left-4 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
					Confirmez le mot de passe
				</label>
				{#if erreurs.confirmation_mot_de_passe}
					<p class="text-red-500 text-sm mt-1">{erreurs.confirmation_mot_de_passe}</p>
				{/if}
			</div>

			<div>
				<label for="promotion" class="block text-gray-700 font-bold mb-2">Promotion</label>
				<select
					id="promotion"
					bind:value={utilisateurForm.promotion}
					class="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				>
					<option value="" disabled>Choisir une promotion</option>
					{#each Object.values(EPromotion) as promotion}
						<option value={promotion}>{promotion}</option>
					{/each}
				</select>
				{#if erreurs.promotion}
					<p class="text-red-500 text-sm mt-1">{erreurs.promotion}</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-6">
				<div>
					<label for="groupeTD" class="block text-gray-700 font-bold mb-2">Groupe TD</label>
					<select
						id="groupeTD"
						bind:value={utilisateurForm.groupeTD}
						onchange={() => mettreAJourGroupesTP(utilisateurForm.groupeTD)}
						class="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					>
						<option value="" disabled>Choisir un groupe TD</option>
						{#each groupesTD as groupe}
							<option value={groupe}>{groupe}</option>
						{/each}
					</select>
					{#if erreurs.groupeTD}
						<p class="text-red-500 text-sm mt-1">{erreurs.groupeTD}</p>
					{/if}
				</div>
				<div>
					<label for="groupeTP" class="block text-gray-700 font-bold mb-2">Groupe TP</label>
					<select
						id="groupeTP"
						bind:value={utilisateurForm.groupeTP}
						class="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					>
						<option value="" disabled>Choisir un groupe TP</option>
						{#each groupesTP as groupe}
							<option value={groupe}>{groupe}</option>
						{/each}
					</select>
					{#if erreurs.groupeTP}
						<p class="text-red-500 text-sm mt-1">{erreurs.groupeTP}</p>
					{/if}
				</div>
			</div>

			<div>
				<label class="block text-gray-700 font-bold mb-2">Rôles de l'utilisateur</label>
				<div class="flex flex-wrap gap-4">
					{#each Object.values(ERoleUtilisateur).filter(role => role !== 'PROFESSEUR') as role}
						<label class="flex items-center space-x-2">
							<input
								type="radio"
								name="role"
								value={role}
								bind:group={utilisateurForm.role}
								class="form-radio text-purple-500 focus:ring-purple-500"
							/>
							<span class="text-gray-700">{role}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="mt-6 flex justify-end">
				<button
					class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-semibold"
					onclick={ajouterUtilisateur}
				>
					Enregistrer
				</button>
			</div>
		</div>
	</div>

	<!-- Message contextuel -->
	{#if message}
		<div
			class="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-500 ease-in-out z-50"
			class:bg-green-500={messageType === 'success'}
			class:bg-red-500={messageType === 'error'}
			style="animation: smooth-slide-up-and-fade 3.5s ease-in-out forwards;"
		>
			{message}
		</div>
	{/if}
{/if}
