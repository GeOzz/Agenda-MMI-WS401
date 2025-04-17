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

	const FILTERED_GROUPES_TP = $derived.by(() => {
		if (!groupeTD) return Object.values(EGroupeTP);

		const tdLetters = groupeTD.replace('TD ', '').split('');

		return Object.values(EGroupeTP).filter((tp) => {
			const tpLetter = tp.replace('TP ', '');
			return tdLetters.includes(tpLetter);
		});
	});

	let { OnSubmit } = $props();
	function handleSubmit(event: Event) {
		event.preventDefault();
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

		<form class="space-y-6" onsubmit={handleSubmit}>
			<!-- Nom et Prénom -->
			<div class="grid grid-cols-2 gap-4">
				<div class="relative">
					<input
						type="text"
						id="nom"
						required
						bind:value={nom}
						class="w-full px-3 py-2 border border-gray-300 rounded-md pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-[#4B3B7C] peer"
						placeholder=" "
					/>
					<label
						for="nom"
						class="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
					>
						Nom
					</label>
				</div>
				<div class="relative">
					<input
						type="text"
						id="prenom"
						required
						bind:value={prenom}
						class="w-full px-3 py-2 border border-gray-300 rounded-md pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-[#4B3B7C] peer"
						placeholder=" "
					/>
					<label
						for="prenom"
						class="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
					>
						Prénom
					</label>
				</div>
			</div>

			<!-- Email -->
			<div class="relative">
				<input
					type="email"
					id="email"
					required
					bind:value={email}
					class="w-full px-3 py-2 border border-gray-300 rounded-md pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-[#4B3B7C] peer"
					placeholder=" "
				/>
				<label
					for="email"
					class="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
				>
					E-mail
				</label>
			</div>

			<!-- mot_de_passe -->
			<div class="relative">
				<input
					type="password"
					id="mot_de_passe"
					required
					bind:value={mot_de_passe}
					class="w-full px-3 py-2 border border-gray-300 rounded-md pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-[#4B3B7C] peer"
					placeholder=" "
				/>
				<label
					for="mot_de_passe"
					class="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
				>
					Mot de passe
				</label>
			</div>
			<!-- mot_de_passe_confirmation -->
			<div class="relative">
				<input
					type="password"
					id="mot_de_passe_confirmation"
					required
					bind:value={mot_de_passe_confirmation}
					class="w-full px-3 py-2 border border-gray-300 rounded-md pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-[#4B3B7C] peer"
					placeholder=" "
				/>
				<label
					for="mot_de_passe_confirmation"
					class="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
				>
					Confirmation du mot de passe
				</label>
			</div>

			<!-- Promotion -->
			<div class="relative">
				<select
					id="promotion"
					required
					bind:value={promotion}
					class="w-full px-3 py-2 border border-gray-300 rounded-md pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-[#4B3B7C] peer bg-white"
				>
					{#each Object.values(EPromotion) as promotion}
						<option>{promotion}</option>
					{/each}
				</select>
				<label
					for="promotion"
					class="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:scale-75 peer-focus:-translate-y-4"
				>
					Promotion
				</label>
			</div>

			<!-- Groupes -->
			<div class="grid grid-cols-2 gap-4">
				<div class="relative">
					<select
						required
						id="groupeTD"
						onchange={() => {
							groupeTP = FILTERED_GROUPES_TP[0];
						}}
						bind:value={groupeTD}
						class="w-full px-3 py-2 border border-gray-300 rounded-md pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-[#4B3B7C] peer bg-white"
					>
						{#each Object.values(EGroupeTD) as _groupeTD}
							<option value={_groupeTD} selected={_groupeTD === groupeTD}>
								{_groupeTD}
							</option>
						{/each}
					</select>
					<label
						for="groupeTD"
						class="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:scale-75 peer-focus:-translate-y-4"
					>
						Groupe (TD)
					</label>
				</div>
				<div class="relative">
					<select
						required
						id="groupeTP"
						bind:value={groupeTP}
						class="w-full px-3 py-2 border border-gray-300 rounded-md pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-[#4B3B7C] peer bg-white"
					>
						{#each FILTERED_GROUPES_TP as _groupeTP}
							<option value={_groupeTP} selected={_groupeTP === groupeTP}>
								{_groupeTP}
							</option>
						{/each}
					</select>
					<label
						for="groupeTP"
						class="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:scale-75 peer-focus:-translate-y-4"
					>
						Groupe (TP)
					</label>
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
