<script lang="ts">
	import { onMount } from 'svelte';
	import { STORE } from '$lib/store.svelte';
	import { EPromotion, EGroupeTD, EGroupeTP } from '$lib/interfaces/IUtilisateur';

	let utilisateur = $state({
		nom: '',
		prenom: '',
		email: '',
		groupeTD: '',
		groupeTP: '',
		promotion: ''
	});

	let groupesTD = Object.values(EGroupeTD);
	let groupesTP = Object.values(EGroupeTP);

	$effect(() => {
		if (STORE.utilisateur) {
			utilisateur = { ...STORE.utilisateur };
		}
	});

	async function handleSave() {
		try {
			const response = await fetch('/api/mon-compte', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					promotion: utilisateur.promotion,
					groupeTD: utilisateur.groupeTD,
					groupeTP: utilisateur.groupeTP
				})
			});

			if (response.ok) {
				console.log('Modifications sauvegardées', utilisateur);
				alert('Modifications sauvegardées avec succès');
			} else {
				console.error('Erreur lors de la sauvegarde des modifications');
				alert('Erreur lors de la sauvegarde des modifications');
			}
		} catch (error) {
			console.error('Erreur lors de la sauvegarde des modifications', error);
			alert('Erreur lors de la sauvegarde des modifications');
		}
	}

	const FILTERED_GROUPES_TP = $derived.by(() => {
		if (!utilisateur.groupeTD) return groupesTP;

		const tdLetters = utilisateur.groupeTD.replace('TD ', '').split('');

		return groupesTP.filter((tp) => {
			const tpLetter = tp.replace('TP ', '');
			return tdLetters.includes(tpLetter);
		});
	});
</script>

<div class="flex">
	<!-- Menu de navigation à gauche -->
	<nav
		class="w-64 h-screen bg-gray-100 text-black flex flex-col fixed top-0 left-0 overflow-y-auto"
	>
	</nav>

	<!-- Contenu principal -->
	<div class="flex-1 ml-64 max-w-7xl mx-auto p-8 mt-6 bg-white">
		<h1 class="text-3xl font-bold mb-6">Détails du Profil</h1>
		<p class="text-gray-600 mb-6">
			Gérez les détails de votre compte qui représentent comment les autres utilisateurs vous
			voient, en plus d'autres détails utilisés pour la communication et la personnalisation du
			système.
		</p>
		<div class="space-y-4">
			<div class="flex space-x-4">
				<div class="flex-1 relative">
					<label class="block text-gray-700 font-bold">Nom</label>
					<div class="relative">
						<input
							type="text"
							value={utilisateur.nom}
							class="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-default"
							readonly
						/>
						<div class="absolute inset-0 diagonal-stripes pointer-events-none"></div>
					</div>
				</div>
				<div class="flex-1 relative">
					<label class="block text-gray-700 font-bold">Prénom</label>
					<div class="relative">
						<input
							type="text"
							value={utilisateur.prenom}
							class="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-default"
							readonly
						/>
						<div class="absolute inset-0 diagonal-stripes pointer-events-none"></div>
					</div>
				</div>
				<div class="flex-1 relative">
					<label class="block text-gray-700 font-bold">Role</label>
					<div class="relative">
						<input
							type="text"
							value={utilisateur.role}
							class="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-default"
							readonly
						/>
						<div class="absolute inset-0 diagonal-stripes pointer-events-none"></div>
					</div>
				</div>
			</div>
			<hr class="my-4 border-gray-300" />
			<div>
				<label class="block text-gray-700 font-bold">Promotion</label>
				<select
					bind:value={utilisateur.promotion}
					class="w-full p-2 border border-gray-300 rounded"
				>
					{#each Object.values(EPromotion) as promotion}
						<option value={promotion}>{promotion}</option>
					{/each}
				</select>
			</div>
			<hr class="my-4 border-gray-300" />
			<div class="flex space-x-4">
				<div class="flex-1">
					<label class="block text-gray-700 font-bold">Groupe TD</label>
					<select
						onchange={() => {
							utilisateur.groupeTP = FILTERED_GROUPES_TP[0];
						}}
						bind:value={utilisateur.groupeTD}
						class="w-full p-2 border border-gray-300 rounded"
					>
						{#each groupesTD as groupe}
							<option selected={utilisateur.groupeTD === groupe} value={groupe}>
								{groupe}
							</option>
						{/each}
					</select>
				</div>
				<div class="flex-1">
					<label class="block text-gray-700 font-bold">Groupe TP</label>
					<select
						bind:value={utilisateur.groupeTP}
						class="w-full p-2 border border-gray-300 rounded"
					>
						{#each FILTERED_GROUPES_TP as groupe}
							<option selected={utilisateur?.groupeTP === groupe} value={groupe}>
								{groupe}
							</option>
						{/each}
					</select>
				</div>
			</div>
			<hr class="my-4 border-gray-300" />
			<div class="relative">
				<label class="block text-gray-700 font-bold">E-mail</label>
				<div class="relative">
					<input
						type="email"
						value={utilisateur.email}
						class="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-default"
						readonly
					/>
					<div class="absolute inset-0 diagonal-stripes pointer-events-none"></div>
				</div>
			</div>

			<hr class="my-4 border-gray-300" />
			<div class="flex justify-end space-x-4">
				<button onclick={handleSave} class="px-4 py-2 bg-[#CAC3D6] text-[#3B2A5B] rounded"
					>Enregistrer</button
				>
			</div>
		</div>
	</div>
</div>

<style>
	.diagonal-stripes {
		background: repeating-linear-gradient(45deg, #e0e0e0, #e0e0e0 10px, #f5f5f5 10px, #f5f5f5 20px);
		opacity: 0.5;
	}
	.text-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #333;
		font-weight: bold;
		z-index: 1;
		pointer-events: none;
	}
</style>
