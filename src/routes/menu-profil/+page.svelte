<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { STORE } from '$lib/store.svelte'; // Importez le STORE pour mettre à jour les données utilisateur

	let utilisateur = {
		id: null,
		nom: '',
		prenom: '',
		email: '',
		role: '',
		groupeTD: '',
		groupeTP: '',
		promotion: ''
	};

	let utilisateurInitial = { ...utilisateur }; // Stocker les données initiales
	let message = '';
	let messageType = ''; // 'success' ou 'error'

	function afficherMessage(type: string, texte: string) {
		messageType = type;
		message = texte;
		setTimeout(() => {
			message = '';
		}, 3000); // Le message disparaît après 3 secondes
	}

	// Charger les données utilisateur depuis le serveur
	async function chargerUtilisateurDepuisServeur() {
		try {
			const response = await fetch('/api/mon-compte');
			if (response.ok) {
				const data = await response.json();
				utilisateur = data;
				utilisateurInitial = { ...data }; // Sauvegarder les données initiales
				STORE.utilisateur = data; // Mettre à jour le STORE
			} else {
				console.error('Erreur lors du chargement des données utilisateur:', await response.text());
			}
		} catch (error) {
			console.error('Erreur réseau lors du chargement des données utilisateur:', error);
		}
	}

	onMount(() => {
		chargerUtilisateurDepuisServeur(); // Recharger les données utilisateur à chaque visite
	});

	async function sauvegarderProfil() {
		if (utilisateur.nom.length < 3 || utilisateur.prenom.length < 3) {
			afficherMessage('error', 'Le nom et le prénom doivent contenir au moins 3 caractères.');
			utilisateur = { ...utilisateurInitial }; // Restaurer les données initiales
			return;
		}

		try {
			console.log('Données envoyées:', {
				nom: utilisateur.nom,
				prenom: utilisateur.prenom,
				email: utilisateur.email
			}); // Log des données envoyées

			const response = await fetch(`/api/utilisateur/${utilisateur.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					nom: utilisateur.nom,
					prenom: utilisateur.prenom,
					email: utilisateur.email
				}) // Seules les informations personnelles sont envoyées
			});

			console.log('Réponse API:', response); // Log de la réponse brute

			if (response.ok) {
				afficherMessage('success', 'Profil mis à jour avec succès.');
				// Mettez à jour le STORE pour refléter les modifications dans le menu
				STORE.utilisateur = { ...STORE.utilisateur, ...utilisateur };
				utilisateurInitial = { ...utilisateur }; // Mettre à jour les données initiales
			} else {
				const errorText = await response.text();
				console.error('Erreur lors de la mise à jour du profil:', errorText);
				afficherMessage('error', 'Erreur lors de la mise à jour du profil.');
				utilisateur = { ...utilisateurInitial }; // Restaurer les données initiales
			}
		} catch (error) {
			console.error('Erreur réseau:', error);
			afficherMessage('error', 'Erreur réseau lors de la mise à jour du profil.');
			utilisateur = { ...utilisateurInitial }; // Restaurer les données initiales
		}
	}
</script>

<div class="flex min-h-screen bg-gray-50">
	<!-- Navigation latérale -->
	<div class="w-1/4 bg-white shadow-md p-6 rounded-lg fixed h-full">
		<h2 class="text-xl font-bold text-gray-800 mb-4">Navigation</h2>
		<ul class="space-y-4">
			<li class="flex items-center space-x-3 hover:bg-[#EEEAF9] p-2 rounded-md transition">
				<span class="i-ph:user-circle text-[#4B3B7C] text-lg"></span>
				<a href="/menu-profil" class="text-[#4B3B7C] font-semibold hover:underline hover:text-[#4B3B7C]">Détail du profil</a>
			</li>
			<li class="flex items-center space-x-3 hover:bg-[#EEEAF9] p-2 rounded-md transition">
				<span class="i-ph:lock text-gray-600 text-lg"></span>
				<a href="/menu-profil/acces-securite" class="text-gray-600 hover:text-[#4B3B7C] hover:underline">Accès et Sécurité</a>
			</li>
		</ul>
	</div>	

	<!-- Contenu principal -->
	<div class="w-3/4 p-8 ml-1/4">
		<h1 class="text-4xl font-bold mb-6 text-gray-800">Détails du Profil</h1>
		<p class="text-gray-600 mb-8">
			Gérez les détails de votre compte qui représentent comment les autres utilisateurs vous voient, en plus d'autres détails utilisés pour la communication et la personnalisation du système.
		</p>

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

			<!-- Les champs suivants sont désactivés pour les étudiants -->
			<div>
				<label class="block text-gray-700 font-bold mb-2">Promotion</label>
				<input
					type="text"
					value={utilisateur.promotion}
					disabled
					class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
				/>
			</div>

			<div class="grid grid-cols-2 gap-6">
				<div>
					<label class="block text-gray-700 font-bold mb-2">Groupe TD</label>
					<input
						type="text"
						value={utilisateur.groupeTD}
						disabled
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
					/>
				</div>
				<div>
					<label class="block text-gray-700 font-bold mb-2">Groupe TP</label>
					<input
						type="text"
						value={utilisateur.groupeTP}
						disabled
						class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
					/>
				</div>
			</div>

			<div>
				<label class="block text-gray-700 font-bold mb-2">Rôle</label>
				<input
					type="text"
					value={utilisateur.role}
					disabled
					class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
				/>
			</div>
		</div>

		<div class="mt-6 flex justify-end">
			<button
				class="px-4 py-2 text-white rounded-md hover:brightness-110 font-semibold"
				style="background-color: #4B3B7C"
				onclick={sauvegarderProfil}
			>
				Enregistrer
			</button>

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
</div>

<style>
	.diagonal-stripes {
		background: repeating-linear-gradient(45deg, #e0e0e0, #e0e0e0 10px, #f5f5f5 10px, #f5f5f5 20px);
		opacity: 0.5;
	}
	.text-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		color: #333;
		pointer-events: none;
		z-index: 1;
	}
	/* Ajout d'une animation pour les alertes */
	.fixed {
		animation: slide-up 0.5s ease-in-out;
	}

	@keyframes slide-up-and-fade {
		0% {
			opacity: 0;
			transform: translate(-50%, 20px);
		}
		10% {
			opacity: 1;
			transform: translate(-50%, 0);
		}
		90% {
			opacity: 1;
			transform: translate(-50%, 0);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, 20px);
		}
	}

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

	/* État initial pour éviter les comportements inattendus */
	.initial-hidden {
		opacity: 0;
		transform: translate(-50%, 30px);
	}

	/* Styles pour les labels flottants */
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
</style>
