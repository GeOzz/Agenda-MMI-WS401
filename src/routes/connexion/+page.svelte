<script lang="ts">
	import Login from '$lib/components/Login.svelte';

	import type { IUtilisateur } from '$lib/interfaces/IUtilisateur';

	let erreur = $state('');

	async function handleSubmit(FORMULAIRE: { email: string; mot_de_passe: string }) {
		try {
			const REPONSE = await fetch('/api/connexion', {
				method: 'POST',
				body: JSON.stringify(FORMULAIRE)
			});
			const BODY = await REPONSE.text();
			const ERREUR = REPONSE.status !== 200;
			if (ERREUR) {
				erreur = BODY;
				return;
			}
			erreur = '';
			window.location.href = '/';
		} catch (erreur) {
			erreur = 'Erreur lors de la connexion';
		}
	}
</script>

<div class="min-h-screen bg-gray-100">
	<!-- Content -->
	<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		{#if erreur}
			<div class="bg-red-500 text-white p-4 rounded-md w-full">{erreur}</div>
		{/if}
		<Login OnSubmit={handleSubmit} />
	</div>
</div>
