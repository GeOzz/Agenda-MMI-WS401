<script lang="ts">
	import Register from '$lib/components/Register.svelte';
	import type { IUtilisateur } from '$lib/interfaces/IUtilisateur';
	let erreur = $state('');
	async function handleSubmit(FORMULAIRE: IUtilisateur) {
		try {
			const REPONSE = await fetch('/inscription', {
				method: 'POST',
				body: JSON.stringify(FORMULAIRE)
			});
			const UTILISATEUR_EXISTANT = REPONSE.status !== 200;
			if (UTILISATEUR_EXISTANT) {
				erreur = 'Utilisateur deja existant';
			} else {
				window.location.href = '/connexion';
			}
		} catch (erreur) {
			erreur = "Erreur lors de l'inscription";
		}
	}
</script>

<div class="min-h-screen bg-gray-100">
	<!-- Content -->
	<div class=" mx-auto py-6 sm:px-6 lg:px-8 max-w-2xl space-y-2">
		{#if erreur}
			<div class="bg-red-500 text-white p-4 rounded-md w-full">{erreur}</div>
		{/if}
		<Register OnSubmit={handleSubmit} />
	</div>
</div>
