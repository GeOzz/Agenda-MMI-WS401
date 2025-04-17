<script lang="ts">
	let motDePasse = '';
	let nouveauMotDePasse = '';
	let confirmationNouveauMotDePasse = '';

	let motDePasseValide = true;
	let message = '';
	let messageType = ''; // 'success' ou 'error'

	function afficherMessage(type: string, texte: string) {
		messageType = type;
		message = texte;
		setTimeout(() => {
			message = '';
		}, 3000); // Le message disparaît après 3 secondes
	}

	async function changerMotDePasse() {
		if (!motDePasseValide) {
			afficherMessage('error', 'Les mots de passe ne correspondent pas ou sont trop courts.');
			return;
		}

		try {
			const response = await fetch('/api/changerMotDePasse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					mot_de_passe_actuel: motDePasse,
					mot_de_passe_nouveau: nouveauMotDePasse
				})
			});

			if (response.ok) {
				afficherMessage('success', 'Mot de passe mis à jour avec succès.');
				motDePasse = '';
				nouveauMotDePasse = '';
				confirmationNouveauMotDePasse = '';
			} else {
				afficherMessage('error', 'Erreur lors de la mise à jour du mot de passe.');
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
			<li class="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-md transition">
				<span class="i-ph:user-circle text-gray-600 text-lg"></span>
				<a href="/menu-profil" class="text-gray-600 hover:text-purple-600 hover:underline">Détail du profil</a>
			</li>
			<li class="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-md transition">
				<span class="i-ph:lock text-purple-600 text-lg"></span>
				<a href="/menu-profil/acces-securite" class="text-purple-600 font-semibold hover:underline">Accès et Sécurité</a>
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
			<div>
				<label for="motDePasse" class="block text-gray-700 font-bold mb-2"
					>Mot de passe actuel</label
				>
				<input
					id="motDePasse"
					type="password"
					bind:value={motDePasse}
					class="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				/>
			</div>
			<div>
				<label for="motDePasse" class="block text-gray-700 font-bold mb-2"
					>Nouveau mot de passe</label
				>
				<input
					id="nouveauMotDePasse"
					type="password"
					bind:value={nouveauMotDePasse}
					class="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				/>
			</div>
			<div>
				<label for="confirmationMotDePasse" class="block text-gray-700 font-bold mb-2"
					>Confirmez le nouveau mot de passe</label
				>
				<input
					id="confirmationNouveauMotDePasse"
					type="password"
					bind:value={confirmationNouveauMotDePasse}
					class="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				/>
			</div>
		</div>

		<div class="mt-6 flex justify-end">
			<button
				class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-semibold"
				onclick={changerMotDePasse}
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
