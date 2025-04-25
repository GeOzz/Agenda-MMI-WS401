<script lang="ts">
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let motDePasse = '';
	let nouveauMotDePasse = '';
	let confirmationNouveauMotDePasse = '';

	let message = '';
	let messageType = '';

	let erreurs = {
		motDePasse: '',
		nouveauMotDePasse: '',
		confirmationNouveauMotDePasse: ''
	};

	function afficherMessage(type: string, texte: string) {
		messageType = type;
		message = texte;
		setTimeout(() => {
			message = '';
		}, 3000);
	}

	function validerChamps() {
		erreurs = { motDePasse: '', nouveauMotDePasse: '', confirmationNouveauMotDePasse: '' };
		if (!motDePasse) {
			erreurs.motDePasse = 'Le mot de passe actuel est requis.';
		}
		if (!nouveauMotDePasse || nouveauMotDePasse.length < 8) {
			erreurs.nouveauMotDePasse = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
		}
		if (nouveauMotDePasse !== confirmationNouveauMotDePasse) {
			erreurs.confirmationNouveauMotDePasse = 'Les mots de passe ne correspondent pas.';
		}
		return Object.values(erreurs).every((v) => v === '');
	}

	async function changerMotDePasse() {
		if (!validerChamps()) return;
		try {
			const response = await fetch('/api/changerMotDePasse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					mot_de_passe_actuel: motDePasse,
					mot_de_passe_nouveau: nouveauMotDePasse,
					mot_de_passe_confirmation: confirmationNouveauMotDePasse,
				})
				});
			if (response.ok) {
				afficherMessage('success', 'Mot de passe mis à jour avec succès.');
				motDePasse = '';
				nouveauMotDePasse = '';
				confirmationNouveauMotDePasse = '';
			} else {
				const err = await response.text();
				afficherMessage('error', err || 'Erreur lors de la mise à jour du mot de passe.');
			}
		} catch (error) {
			afficherMessage('error', 'Erreur réseau lors de la mise à jour du mot de passe.');
		}
	}
</script>

<svelte:head>
	<title>Accès et sécurité | Agenda MMI</title>
	<meta name="description" content="Modifiez vos accès et paramètres de sécurité sur l'agenda MMI." />
</svelte:head>

<div class="flex flex-col sm:flex-row min-h-screen bg-gray-50">
	<!-- Navigation mobile/tab style -->
	<div class="w-full bg-white shadow-md px-2 sm:hidden mt-16 mb-4">
		<div class="flex">
			<a
				href="/menu-profil"
				class="flex-1 text-center py-3 font-semibold text-sm transition relative
					{get(page)?.url?.pathname === '/menu-profil' ? 'text-[#4B3B7C]' : 'text-gray-700'}"
			>
				Détail du profil
				{#if get(page)?.url?.pathname === '/menu-profil'}
					<span class="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-t"></span>
				{/if}
			</a>
			<a
				href="/menu-profil/acces-securite"
				class="flex-1 text-center py-3 font-semibold text-sm transition relative
					{get(page)?.url?.pathname === '/menu-profil/acces-securite' ? 'text-[#4B3B7C]' : 'text-gray-700'}"
			>
				Accès et Sécurité
				{#if get(page)?.url?.pathname === '/menu-profil/acces-securite'}
					<span class="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-t"></span>
				{/if}
			</a>
		</div>
	</div>

	<!-- Navigation latérale desktop -->
	<div class="hidden sm:block w-full sm:w-1/4 bg-white shadow-md p-4 sm:p-6 rounded-lg sm:fixed sm:h-full mb-4 sm:mb-0">
		<h2 class="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center sm:text-left">Navigation</h2>
		<ul class="space-y-4">
			<li>
				<a
					href="/menu-profil"
					class="block px-2 py-2 rounded-md font-semibold transition relative
						{get(page)?.url?.pathname === '/menu-profil' ? 'bg-[#EEEAF9] text-[#4B3B7C]' : 'text-gray-700 hover:bg-[#EEEAF9]'}"
				>
					Détail du profil
					{#if get(page)?.url?.pathname === '/menu-profil'}
						<span class="absolute left-0 bottom-0 w-full h-1 bg-yellow-400 rounded-t"></span>
					{/if}
				</a>
			</li>
			<li>
				<a
					href="/menu-profil/acces-securite"
					class="block px-2 py-2 rounded-md font-semibold transition relative
						{get(page)?.url?.pathname === '/menu-profil/acces-securite' ? 'bg-[#EEEAF9] text-[#4B3B7C]' : 'text-gray-700 hover:bg-[#EEEAF9]'}"
				>
					Accès et Sécurité
					{#if get(page)?.url?.pathname === '/menu-profil/acces-securite'}
						<span class="absolute left-0 bottom-0 w-full h-1 bg-yellow-400 rounded-t"></span>
					{/if}
				</a>
			</li>
		</ul>
	</div>

	<!-- Contenu principal -->
	<div class="w-full sm:w-3/4 p-2 sm:p-8 sm:ml-[25%]">
		<h1 class="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 text-center sm:text-left">Changer le mot de passe</h1>
		<p class="text-gray-600 mb-6 sm:mb-8 text-center sm:text-left">
			Changez le mot de passe que vous utilisez pour vous connecter à l'application.
		</p>
		<div class="space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
			<div class="relative">
				<input
					id="motDePasse"
					type="password"
					bind:value={motDePasse}
					required
					class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
					placeholder=" "
				/>
				<label for="motDePasse">Mot de passe actuel</label>
				{#if erreurs.motDePasse}
					<p class="text-red-500 text-sm mt-1 font-medium">{erreurs.motDePasse}</p>
				{/if}
			</div>
			<div class="relative">
				<input
					id="nouveauMotDePasse"
					type="password"
					bind:value={nouveauMotDePasse}
					required
					class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
					placeholder=" "
				/>
				<label for="nouveauMotDePasse">Nouveau mot de passe</label>
				{#if erreurs.nouveauMotDePasse}
					<p class="text-red-500 text-sm mt-1 font-medium">{erreurs.nouveauMotDePasse}</p>
				{/if}
			</div>
			<div class="relative">
				<input
					id="confirmationNouveauMotDePasse"
					type="password"
					bind:value={confirmationNouveauMotDePasse}
					required
					class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
					placeholder=" "
				/>
				<label for="confirmationNouveauMotDePasse">Confirmez le nouveau mot de passe</label>
				{#if erreurs.confirmationNouveauMotDePasse}
					<p class="text-red-500 text-sm mt-1 font-medium">{erreurs.confirmationNouveauMotDePasse}</p>
				{/if}
			</div>
		</div>
		<div class="mt-6 flex flex-col sm:flex-row justify-end">
			<button
				type="button"
				class="w-full sm:w-auto px-4 py-2 text-white rounded-md hover:brightness-110 font-semibold"
				style="background-color: #4B3B7C"
				on:click={changerMotDePasse}
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
	.relative input {
		padding-top: 1.25rem;
	}
	.relative label {
		position: absolute;
		left: 1rem;
		top: 1.25rem;
		font-size: 1rem;
		color: #6b7280;
		transition: all 0.2s ease-in-out;
		pointer-events: none;
	}
	.relative input:focus + label,
	.relative input:not(:placeholder-shown) + label {
		top: -0.5rem;
		left: 0.75rem;
		font-size: 0.875rem;
		color: #4b3b7c;
		background-color: white;
		padding: 0 0.25rem;
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

	@media (max-width: 640px) {
		.sm\:fixed { position: static !important; }
		.sm\:ml-\[25\%\] { margin-left: 0 !important; }
		.sm\:w-1\/4 { width: 100% !important; }
		.sm\:w-3\/4 { width: 100% !important; }
		.grid-cols-2 { grid-template-columns: 1fr !important; }
		.gap-6 { gap: 1rem !important; }
		.p-8 { padding: 0.5rem !important; }
		.p-6 { padding: 1rem !important; }
		.text-4xl { font-size: 1.5rem !important; }
		.w-full.bg-white.shadow-md.px-2.sm\:hidden {
			margin-top: 4rem !important; /* mt-16 */
			margin-bottom: 1rem !important;
		}
	}
	[role="tab"].active, .relative .active {
		position: relative;
	}
	[role="tab"].active::after, .relative .active::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 4px;
		background: #FDB813;
		border-radius: 2px 2px 0 0;
	}
</style>
