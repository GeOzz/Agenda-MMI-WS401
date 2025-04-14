<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { STORE } from '$lib/store.svelte'; // Importez le STORE pour mettre à jour les données utilisateur

	let utilisateur = {
		id: null, // Ajoutez l'ID ici pour éviter les erreurs
		nom: '',
		prenom: '',
		email: '',
		role: '',
		groupeTD: '',
		groupeTP: '',
		promotion: ''
	};

	// Charger les données utilisateur depuis `$page.data`
	onMount(() => {
		utilisateur = $page.data.utilisateur;
	});

	async function sauvegarderProfil() {
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
				alert('Profil mis à jour avec succès');
				// Mettez à jour le STORE pour refléter les modifications dans le menu
				STORE.utilisateur = { ...STORE.utilisateur, ...utilisateur };
			} else {
				const errorText = await response.text();
				console.error('Erreur lors de la mise à jour du profil:', errorText);
				alert('Erreur lors de la mise à jour du profil');
			}
		} catch (error) {
			console.error('Erreur réseau:', error);
			alert('Erreur réseau lors de la mise à jour du profil');
		}
	}
</script>

<div class="flex min-h-screen bg-gray-50">
	<!-- Navigation latérale -->
	<div class="w-1/4 bg-white shadow-md p-6">
		<h2 class="text-xl font-bold text-gray-800 mb-4">Navigation</h2>
		<ul class="space-y-4">
			<li>
				<a href="/menu-profil" class="text-purple-600 font-semibold hover:underline">Détail du profil</a>
			</li>
			<li>
				<a href="/menu-profil/acces-securite" class="text-gray-600 hover:text-purple-600 hover:underline">Accès et Sécurité</a>
			</li>
		</ul>
	</div>

	<!-- Contenu principal -->
	<div class="w-3/4 p-8">
		<h1 class="text-4xl font-bold mb-6 text-gray-800">Détails du Profil</h1>
		<p class="text-gray-600 mb-8">
			Gérez les détails de votre compte qui représentent comment les autres utilisateurs vous voient, en plus d'autres détails utilisés pour la communication et la personnalisation du système.
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
				class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-semibold"
				onclick={sauvegarderProfil}
			>
				Enregistrer
			</button>
		</div>
	</div>
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
</style>
