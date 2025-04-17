<script lang="ts">
	let devoirForm = {
		titre: '',
		description: '',
		dateRendu: '',
		promotion: '',
		groupes: []
	};

	let erreurs = {
		titre: '',
		description: '',
		dateRendu: '',
		promotion: '',
		groupes: ''
	};

	const groupesOptions = ['TD AB', 'TD CD', 'TD EF', 'TD GH', 'TD IJ'];

	function validerChamps() {
		erreurs = {
			titre: devoirForm.titre.length < 3 ? 'Le titre doit contenir au moins 3 caractères.' : '',
			description: devoirForm.description.length < 10 ? 'La description doit contenir au moins 10 caractères.' : '',
			dateRendu: devoirForm.dateRendu === '' ? 'Veuillez sélectionner une date de rendu.' : '',
			promotion: devoirForm.promotion === '' ? 'Veuillez sélectionner une promotion.' : '',
			groupes: devoirForm.groupes.length === 0 ? 'Veuillez sélectionner au moins un groupe.' : ''
		};

		return Object.values(erreurs).every((erreur) => erreur === '');
	}

	async function ajouterDevoir() {
		if (!validerChamps()) {
			return;
		}

		try {
			const response = await fetch('/api/ajouter-devoir', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(devoirForm)
			});

			if (response.ok) {
				alert('Devoir ajouté avec succès.');
				// Réinitialiser le formulaire
				devoirForm = {
					titre: '',
					description: '',
					dateRendu: '',
					promotion: '',
					groupes: []
				};
			} else {
				alert('Erreur lors de l\'ajout du devoir.');
			}
		} catch (error) {
			alert('Erreur réseau lors de l\'ajout du devoir.');
		}
	}
</script>

<div class="p-8 bg-gray-50 min-h-screen">
	<h1 class="text-4xl font-bold mb-6 text-gray-800">Ajouter un devoir</h1>
	<p class="text-gray-600 mb-8">
		Ajoutez un devoir pour une promotion et un groupe spécifique. Tous les champs sont obligatoires.
	</p>

	<div class="space-y-6 bg-white p-6 rounded-lg shadow-md">
		<div class="relative">
			<input
				id="titre"
				type="text"
				bind:value={devoirForm.titre}
				class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				placeholder=" "
			/>
			<label for="titre">Titre</label>
			{#if erreurs.titre}
				<p class="text-red-500 text-sm mt-1">{erreurs.titre}</p>
			{/if}
		</div>

		<div class="relative">
			<textarea
				id="description"
				bind:value={devoirForm.description}
				class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				placeholder=" "
			></textarea>
			<label for="description">Description</label>
			{#if erreurs.description}
				<p class="text-red-500 text-sm mt-1">{erreurs.description}</p>
			{/if}
		</div>

		<div class="relative">
			<input
				id="dateRendu"
				type="datetime-local"
				bind:value={devoirForm.dateRendu}
				class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				placeholder=" "
			/>
			<label for="dateRendu">Date de rendu</label>
			{#if erreurs.dateRendu}
				<p class="text-red-500 text-sm mt-1">{erreurs.dateRendu}</p>
			{/if}
		</div>

		<div class="relative">
			<select
				id="promotion"
				bind:value={devoirForm.promotion}
				class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
			>
				<option value="" disabled>Choisir une promotion</option>
				<option value="1ère Année (BUT1)">1ère Année (BUT1)</option>
				<option value="2ème Année (BUT2)">2ème Année (BUT2)</option>
				<option value="3ème Année (BUT3)">3ème Année (BUT3)</option>
			</select>
			<label for="promotion">Promotion</label>
			{#if erreurs.promotion}
				<p class="text-red-500 text-sm mt-1">{erreurs.promotion}</p>
			{/if}
		</div>

		<div class="relative">
			<select
				id="groupes"
				bind:value={devoirForm.groupes}
				multiple
				class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
			>
				<option value="" disabled>Choisir un ou plusieurs groupes</option>
				{#each groupesOptions as groupe}
					<option value={groupe}>{groupe}</option>
				{/each}
			</select>
			<label for="groupes">Groupes</label>
			{#if erreurs.groupes}
				<p class="text-red-500 text-sm mt-1">{erreurs.groupes}</p>
			{/if}
		</div>
	</div>

	<div class="mt-6 flex justify-end">
		<button
			class="px-4 py-2 text-white rounded-md hover:brightness-110 font-semibold"
			style="background-color: #4B3B7C"
			onclick={ajouterDevoir}
		>
			Enregistrer
		</button>
	</div>
</div>

<style>
	/* Styles pour les labels flottants */
	.relative input,
	.relative select,
	.relative textarea {
		padding-top: 1.25rem; /* Ajout d'espace pour le label flottant */
	}

	.relative label {
		position: absolute;
		left: 1rem;
		top: 1.25rem;
		font-size: 1rem;
		color: #6b7280; /* Couleur grise */
		transition: all 0.2s ease-in-out;
	}

	.relative input:focus + label,
	.relative input:not(:placeholder-shown) + label,
	.relative select:focus + label,
	.relative select:not([value=""]) + label,
	.relative textarea:focus + label,
	.relative textarea:not(:placeholder-shown) + label {
		top: -0.5rem; /* Position plus haute */
		left: 0.75rem; /* Ajustement horizontal */
		font-size: 0.875rem; /* Réduction de la taille */
		color: #4b3b7c; /* Couleur violette */
		background-color: white; /* Fond blanc pour éviter le chevauchement */
		padding: 0 0.25rem; /* Ajout de padding pour le fond blanc */
	}
</style>
