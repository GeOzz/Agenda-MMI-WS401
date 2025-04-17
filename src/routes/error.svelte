<script lang="ts">
	export let status: number;
	export let message: string;

	let titre = '';
	let description = '';

	// Définir les messages en fonction du code d'erreur
	$: {
		if (status === 404) {
			titre = 'Page introuvable';
			description = "La page que vous recherchez n'existe pas ou a été déplacée.";
		} else if (status === 500) {
			titre = 'Erreur interne du serveur';
			description = "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.";
		} else if (status === 400) {
			titre = 'Requête invalide';
			description = "La requête envoyée est incorrecte. Veuillez vérifier et réessayer.";
		} else if (status === 403) {
			titre = 'Accès interdit';
			description = "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.";
		} else {
			titre = 'Erreur';
			description = message || "Une erreur s'est produite. Veuillez réessayer.";
		}
	}
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
	<div class="bg-red-100 text-red-800 p-6 rounded-lg shadow-md max-w-lg text-center">
		<h1 class="text-2xl font-bold mb-4">{titre}</h1>
		<p class="mb-6">{description}</p>
		<div class="flex justify-center gap-4">
			<a href="/" class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-semibold">
				Retourner à l'accueil
			</a>
			<a href="/menu-profil" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-semibold">
				Voir mon profil
			</a>
		</div>
	</div>
</div>

<style>
	/* Styles pour la page d'erreur */
	.bg-red-100 {
		background-color: #fee2e2;
	}
	.text-red-800 {
		color: #b91c1c;
	}
</style>
