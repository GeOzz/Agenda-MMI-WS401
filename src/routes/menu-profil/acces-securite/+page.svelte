<script lang="ts">
	let motDePasse = '';
	let confirmationMotDePasse = '';
	let motDePasseValide = false;

	$: motDePasseValide = motDePasse === confirmationMotDePasse && motDePasse.length >= 8;

	async function changerMotDePasse() {
		if (!motDePasseValide) {
			alert('Les mots de passe ne correspondent pas ou sont trop courts.');
			return;
		}

		try {
			const response = await fetch('/api/utilisateur/changer-mot-de-passe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ motDePasse })
			});

			if (response.ok) {
				alert('Mot de passe mis à jour avec succès.');
				motDePasse = '';
				confirmationMotDePasse = '';
			} else {
				alert('Erreur lors de la mise à jour du mot de passe.');
			}
		} catch (error) {
			alert('Erreur réseau lors de la mise à jour du mot de passe.');
		}
	}
</script>

<div class="flex min-h-screen bg-gray-50">
	<div class="w-1/4 bg-white shadow-md p-6">
		<h2 class="text-xl font-bold text-gray-800 mb-4">Navigation</h2>
		<ul class="space-y-4">
			<li>
				<a href="/menu-profil" class="text-gray-600 hover:text-purple-600 hover:underline">Détail du profil</a>
			</li>
			<li>
				<a href="/menu-profil/acces-securite" class="text-purple-600 font-semibold hover:underline">Accès et Sécurité</a>
			</li>
		</ul>
	</div>

	<div class="w-3/4 p-8">
		<h1 class="text-4xl font-bold mb-6 text-gray-800">Changer le mot de passe</h1>
		<p class="text-gray-600 mb-8">
			Changez le mot de passe que vous utilisez pour vous connecter à l'application. Il doit comporter au moins 8 caractères.
		</p>

		<div class="space-y-6 bg-white p-6 rounded-lg shadow-md">
			<div>
					<label for="motDePasse" class="block text-gray-700 font-bold mb-2">Mot de passe</label>
					<input
						id="motDePasse"
						type="password"
						bind:value={motDePasse}
						class="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					/>
				</div>
				<div>
					<label for="confirmationMotDePasse" class="block text-gray-700 font-bold mb-2">Confirmez le mot de passe</label>
					<input
						id="confirmationMotDePasse"
						type="password"
						bind:value={confirmationMotDePasse}
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
</div>
