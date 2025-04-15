<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let id: number;
	let showSuccessPopup = false; // État pour afficher le popup de succès

	// Récupérer l'ID de l'utilisateur à supprimer
	$: id = Number($page.params.id);

	// Vérifiez si l'utilisateur connecté est un PROFESSEUR
	onMount(() => {
		if ($page.data.utilisateur.role !== 'PROFESSEUR') {
			alert("Accès refusé : cette page est réservée aux professeurs.");
			goto('/menu-admin');
		}
	});

	// Vérifiez si l'utilisateur à supprimer est un PROFESSEUR
	onMount(async () => {
		try {
			const response = await fetch(`/api/utilisateur/${id}`);
			if (response.ok) {
				const utilisateur = await response.json();
				if (utilisateur.role === 'PROFESSEUR') {
					alert("Vous ne pouvez pas supprimer un compte PROFESSEUR.");
					goto('/menu-admin');
				}
			} else {
				alert('Erreur lors de la récupération des données utilisateur.');
				goto('/menu-admin');
			}
		} catch (error) {
			console.error('Erreur réseau:', error);
			goto('/menu-admin');
		}
	});

	// Fonction pour confirmer la suppression
	async function confirmerSuppression() {
		try {
			const response = await fetch(`/api/utilisateur/${id}`, { method: 'DELETE' });
			if (response.ok) {
				showSuccessPopup = true; // Afficher le popup de succès
				setTimeout(() => {
					goto('/menu-admin'); // Rediriger après un délai
				}, 2000);
			} else {
				alert('Erreur lors de la suppression de l’utilisateur');
			}
		} catch (error) {
			console.error('Erreur réseau:', error);
		}
	}

	// Fonction pour annuler la suppression
	function annuler() {
		goto('/menu-admin');
	}
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
	<!-- Popup de succès -->
	{#if showSuccessPopup}
		<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
			<div class="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
				Utilisateur supprimé avec succès !
			</div>
		</div>
	{/if}

	<div class="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
		<h1 class="text-2xl font-bold text-gray-800 mb-4">Supprimer un utilisateur</h1>
		<p class="text-gray-600 mb-6">
			Cela supprimera complètement le compte de l'utilisateur du système. Vous ne pourrez pas récupérer ce compte ou annuler cette action.
		</p>
		<p class="text-red-600 font-semibold mb-6">Êtes-vous sûr(e) de vouloir supprimer ce compte ?</p>
		<div class="flex justify-end space-x-4">
			<button
				class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-semibold"
				onclick={annuler}
			>
				Annuler
			</button>
			<button
				class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-semibold"
				onclick={confirmerSuppression}
			>
				Continuer
			</button>
		</div>
	</div>
</div>
