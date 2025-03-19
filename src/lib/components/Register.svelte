<script lang="ts">
	import { browser } from '$app/environment';
	import { EGroupeTD, EGroupeTP, EPromotion } from '$lib/interfaces/IUtilisateur';

	let nom = $state('');
	let prenom = $state('');
	let email = $state('');
	let mot_de_passe = $state('');
	let mot_de_passe_confirmation = $state('');
	let promotion = $state(EPromotion.PREMIERE_ANNEE);
	let groupeTD = $state(EGroupeTD.TD_AB);
	let groupeTP = $state(EGroupeTP.TP_A);

	let { OnSubmit } = $props();
	function handleSubmit() {
		OnSubmit({ nom, prenom, email, mot_de_passe, promotion, groupeTD, groupeTP });
	}

	$effect(() => {
		if (!browser) return;

		const ELEMENT_MOT_DE_PASSE_CONFIRMATION: HTMLInputElement = document.getElementById(
			'mot_de_passe_confirmation'
		) as HTMLInputElement;

		const ELEMENT_MOT_DE_PASSE: HTMLInputElement = document.getElementById(
			'mot_de_passe'
		) as HTMLInputElement;

		const MOT_DE_PASSE_CORRESPOND = mot_de_passe === mot_de_passe_confirmation;
		const MOT_DE_PASSE_VIDE = mot_de_passe.length === 0;
		const MOT_DE_PASSE_CONFIRMATION_VIDE = mot_de_passe_confirmation.length === 0;

		if (MOT_DE_PASSE_CORRESPOND === false) {
			ELEMENT_MOT_DE_PASSE_CONFIRMATION?.classList.add('border-red-500');
			ELEMENT_MOT_DE_PASSE?.classList.add('border-red-500');
			ELEMENT_MOT_DE_PASSE_CONFIRMATION?.setCustomValidity(
				'Les mots de passe ne correspondent pas'
			);
			return;
		}

		if (MOT_DE_PASSE_VIDE || MOT_DE_PASSE_CONFIRMATION_VIDE) {
			ELEMENT_MOT_DE_PASSE?.classList.remove('border-green-500');
			ELEMENT_MOT_DE_PASSE?.classList.remove('border-red-500');
			ELEMENT_MOT_DE_PASSE_CONFIRMATION?.classList.remove('border-green-500');
			ELEMENT_MOT_DE_PASSE_CONFIRMATION?.classList.remove('border-red-500');
			ELEMENT_MOT_DE_PASSE_CONFIRMATION?.setCustomValidity('');
			return;
		}

		ELEMENT_MOT_DE_PASSE?.classList.remove('border-red-500');
		ELEMENT_MOT_DE_PASSE?.classList.add('border-green-500');
		ELEMENT_MOT_DE_PASSE_CONFIRMATION?.classList.remove('border-red-500');
		ELEMENT_MOT_DE_PASSE_CONFIRMATION?.classList.add('border-green-500');
		ELEMENT_MOT_DE_PASSE_CONFIRMATION?.setCustomValidity('');
	});
</script>

<div class="flex justify-center items-center">
	<div class="bg-white rounded-lg shadow-lg p-8 w-full">
		<h2 class="text-3xl font-bold mb-8">S'inscrire</h2>

		<form class="space-y-6" on:submit|preventDefault={handleSubmit}>
			<!-- Nom et Prénom -->
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="nom" class="block text-sm text-gray-600 mb-1">Nom *</label>
					<input
						type="text"
						id="nom"
						required
						bind:value={nom}
						class="w-full px-3 py-2 border border-gray-300 rounded-md"
						placeholder="Albert"
					/>
				</div>
				<div>
					<label for="prenom" class="block text-sm text-gray-600 mb-1">Prenom *</label>
					<input
						type="text"
						id="prenom"
						required
						bind:value={prenom}
						class="w-full px-3 py-2 border border-gray-300 rounded-md"
						placeholder="Mark"
					/>
				</div>
			</div>

			<!-- Email -->
			<div>
				<label for="email" class="block text-sm text-gray-600 mb-1">E-mail *</label>
				<input
					type="email"
					id="email"
					required
					bind:value={email}
					class="w-full px-3 py-2 border border-gray-300 rounded-md"
					placeholder="etudiant@univ-reims.fr"
				/>
			</div>

			<!-- mot_de_passe -->
			<div>
				<label for="password" class="block text-sm text-gray-600 mb-1">Mot de passe *</label>

				<input
					type="password"
					id="mot_de_passe"
					required
					bind:value={mot_de_passe}
					class="w-full px-3 py-2 border border-gray-300 rounded-md"
					placeholder="**********"
				/>
			</div>
			<!-- mot_de_passe_confirmation -->
			<div>
				<label for="password" class="block text-sm text-gray-600 mb-1"
					>Confirmation du mot de passe *</label
				>
				<input
					type="password"
					id="mot_de_passe_confirmation"
					required
					bind:value={mot_de_passe_confirmation}
					class="w-full px-3 py-2 border border-gray-300 rounded-md"
					placeholder="**********"
				/>
			</div>

			<!-- Promotion -->
			<div>
				<label for="promotion" class="block text-sm text-gray-600 mb-1">Promotion</label>
				<select
					id="promotion"
					required
					bind:value={promotion}
					class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
				>
					{#each Object.values(EPromotion) as promotion}
						<option>{promotion}</option>
					{/each}
				</select>
			</div>

			<!-- Groupes -->
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="groupeTD" class="block text-sm text-gray-600 mb-1">Groupe (TD) </label>
					<select
						required
						id="groupeTD"
						bind:value={groupeTD}
						class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
					>
						{#each Object.values(EGroupeTD) as groupeTD}
							<option>{groupeTD}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="groupeTP" class="block text-sm text-gray-600 mb-1">Groupe (TP)</label>
					<select
						required
						id="groupeTP"
						bind:value={groupeTP}
						class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
					>
						{#each Object.values(EGroupeTP) as groupeTP}
							<option>{groupeTP}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="flex items-center justify-between pt-4">
				<a href="/connexion" class="text-sm text-gray-600">Vous avez déjà un compte ?</a>
				<button
					type="submit"
					class="px-6 py-2 bg-[#4B3B7C] text-white rounded-md hover:bg-[#3c2f63] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B3B7C]"
				>
					Créer un compte
				</button>
			</div>
		</form>
	</div>
</div>
