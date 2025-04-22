<script lang="ts">
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

<div class="flex min-h-screen bg-gray-50">
	<!-- Navigation latérale -->
	<div class="w-1/4 bg-white shadow-md p-6 rounded-lg fixed h-full">
		<h2 class="text-xl font-bold text-gray-800 mb-4">Navigation</h2>
		<ul class="space-y-4">
			<li class="flex items-center space-x-3 hover:bg-[#EEEAF9] p-2 rounded-md transition">
				<span class="i-ph:user-circle text-gray-600 text-lg"></span>
				<a href="/menu-profil" class="text-gray-600 hover:text-[#4B3B7C] hover:underline">Détail du profil</a>
			</li>
			<li class="flex items-center space-x-3 hover:bg-[#EEEAF9] p-2 rounded-md transition">
				<span class="i-ph:lock text-[#4B3B7C] text-lg"></span>
				<a href="/menu-profil/acces-securite" class="text-[#4B3B7C] font-semibold hover:underline hover:text-[#4B3B7C]">Accès et Sécurité</a>
			</li>
		</ul>
	</div>
	

	<!-- Contenu principal -->
	<div class="w-3/4 p-8 ml-1/4">
		<h1 class="text-4xl font-bold mb-6 text-gray-800">Changer le mot de passe</h1>
		<p class="text-gray-600 mb-8">
			Changez le mot de passe que vous utilisez pour vous connecter à l'application.
		</p>

		<div class="space-y-6 bg-white p-6 rounded-lg shadow-md">
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

		<div class="mt-6 flex justify-end">
			<button
				type="button"
				class="px-4 py-2 text-white rounded-md hover:brightness-110 font-semibold"
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

</style>
