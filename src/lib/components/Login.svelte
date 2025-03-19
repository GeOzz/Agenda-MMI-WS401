<script lang="ts">
	let email = $state('');
	let mot_de_passe = $state('');

	let { OnSubmit } = $props();

	function handleSubmit() {
		OnSubmit({ email, mot_de_passe });
	}
</script>

<div class="flex justify-center items-center p-4">
	<div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
		<h2 class="text-3xl font-bold mb-8">Se Connecter</h2>

		<form class="space-y-6" on:submit|preventDefault={handleSubmit}>
			<!-- Email -->
			<div>
				<label for="email" class="block text-sm text-gray-600 mb-1">E-mail</label>
				<input
					type="email"
					id="email"
					required
					bind:value={email}
					class="w-full px-3 py-2 border border-gray-300 rounded-md"
					placeholder="etudiant@univ-reims.fr"
				/>
			</div>

			<!-- Mot de passe -->
			<div>
				<label for="mot_de_passe" class="block text-sm text-gray-600 mb-1">Mot de passe</label>
				<input
					type="password"
					id="mot_de_passe"
					required
					bind:value={mot_de_passe}
					class="w-full px-3 py-2 border border-gray-300 rounded-md"
					placeholder="**********"
				/>
			</div>

			<div class="flex items-center justify-between pt-4">
				<a href="/inscription" class="text-sm text-gray-600">Vous n'avez pas de compte ?</a>
				<button
					type="submit"
					class="px-6 py-2 bg-[#4B3B7C] text-white rounded-md hover:bg-[#3c2f63] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B3B7C]"
				>
					Se connecter
				</button>
			</div>
		</form>
	</div>
</div>
