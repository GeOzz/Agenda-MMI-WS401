<svelte:head>
	<title>Ajouter un devoir | Agenda MMI</title>
	<meta name="description" content="Ajoutez un nouveau devoir pour votre promotion ou groupe dans l'agenda MMI." />
</svelte:head>

<script lang="ts">
	import { Color } from '@tiptap/extension-color';
	import ListItem from '@tiptap/extension-list-item';
	import TextStyle from '@tiptap/extension-text-style';
	import StarterKit from '@tiptap/starter-kit';
	import { Editor } from '@tiptap/core';
	import { onMount } from 'svelte';
	import { Markdown } from 'tiptap-markdown';
	import { goto } from '$app/navigation';
	import { EGroupeTD, EGroupeTP, EPromotion, MATIERES } from '$lib/interfaces/IUtilisateur';
	import { STORE } from '$lib/store.svelte';

	const matieres_options = Object.values(MATIERES);
	let promotion = $state("");
	let selectedMatiere = $state("");
	let expire_le_timestamp = $state(getDateLendemain());
	let groupes = $state([]);
	let groupesErreur = $state('');
	let selectedGroupe = $state('');
	const groupes_options = [...Object.values(EGroupeTD), ...Object.values(EGroupeTP)];

	let markdown = $state('');
	let titre = $state('');

	let element;
	let editor = $state<Editor | null>(null);

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

	let dateErreur = $state('');

	let userTD = '';
	let userTP = '';
	let erreurTDTP = $state('');
	$effect(() => {
		if (STORE.utilisateur) {
			userTD = STORE.utilisateur.groupeTD || '';
			userTP = STORE.utilisateur.groupeTP || '';
		}
	});

	function validerChamps() {
			erreurTDTP = '';
			erreurs = {
				titre: devoirForm.titre.length < 3 ? '' : '',
				description: devoirForm.description.length < 10 ? '' : '',
				dateRendu: devoirForm.dateRendu === '' ? '' : '',
				promotion: devoirForm.promotion === '' ? '' : '',
				groupes: devoirForm.groupes.length === 0 ? '' : ''
			};

			// Vérifie que le TD et TP de l'utilisateur sont bien dans la sélection
			if (
				STORE.utilisateur?.role === 'ÉTUDIANT' || STORE.utilisateur?.role === 'DÉLÉGUÉ'
			) {
				if (userTD && !groupes.includes(userTD)) {
					erreurTDTP = "Vous ne pouvez pas ajouter un devoir qui n'est pas attribué à votre TD.";
				}
				if (userTP && !groupes.includes(userTP)) {
					erreurTDTP = "Vous ne pouvez pas ajouter un devoir qui n'est pas attribué à votre TP.";
				}
			}

			return Object.values(erreurs).every((erreur) => erreur === '') && !erreurTDTP;
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
				selectedTD = '';
				groupesTP = [];
			} else {
				alert('Erreur lors de l\'ajout du devoir.');
			}
		} catch (error) {
			alert('Erreur réseau lors de l\'ajout du devoir.');
		}
	}

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				Color.configure({ types: [TextStyle.name, ListItem.name] }),
				TextStyle.configure({ types: [ListItem.name] }),
				StarterKit,
				Markdown.configure({
					html: true, // Allow HTML input/output
					tightLists: true, // No <p> inside <li> in markdown output
					tightListClass: 'tight', // Add class to <ul> allowing you to remove <p> margins when tight
					bulletListMarker: '-', // <li> prefix in markdown output
					linkify: false, // Create links from "https://..." text
					breaks: false, // New lines (\n) in markdown input are converted to <br>
					transformPastedText: false, // Allow to paste markdown text in the editor
					transformCopiedText: false // Copied text is transformed to markdown
				})
			],
			content: `Tapez ici le contenu du devoir...`,
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			}
		});
	});

	$effect(() => {
		promotion = STORE.utilisateur?.role === 'ETUDIANT' ? MA_PROMOTION : promotion;
	});

	$effect(() => {
		// lecture de promotion pour déclencher la réactivité
		promotion;
		selectedMatiere = "";
	});

	$effect(() => {
		if (expire_le_timestamp && expire_le_timestamp < getMinDateTime()) {
			expire_le_timestamp = getMinDateTime();
		}
	});

	$effect(() => {
		dateErreur = '';
		if (expire_le_timestamp && new Date(expire_le_timestamp).getTime() <= Date.now()) {
			dateErreur = 'La date et l\'heure doivent être dans le futur.';
		}
	});

	// Pré-remplir et désactiver le select promotion si étudiant ou délégué
	const isEtudiantOuDelegue = $derived.by(() => STORE.utilisateur?.role === 'ÉTUDIANT' || STORE.utilisateur?.role === 'DÉLÉGUÉ');
	const maPromotion = $derived.by(() => STORE.utilisateur?.promotion);

	$effect(() => {
		if (isEtudiantOuDelegue) {
			promotion = maPromotion;
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		groupesErreur = '';
		dateErreur = '';
		erreurTDTP = '';

		if (groupes.length === 0) {
			groupesErreur = 'Veuillez sélectionner au moins un groupe.';
			return;
		}
		if (new Date(expire_le_timestamp).getTime() <= Date.now()) {
			dateErreur = 'La date de rendu doit être dans le futur.';
			return;
		}

		// Vérification stricte ici AVANT l'envoi
		if ((STORE.utilisateur?.role === 'ÉTUDIANT' || STORE.utilisateur?.role === 'DÉLÉGUÉ')) {
			if (userTD && !groupes.includes(userTD)) {
				erreurTDTP = "Vous ne pouvez pas ajouter un devoir qui n'est pas attribué à votre TD.";
				return;
			}
			if (userTP && !groupes.includes(userTP)) {
				erreurTDTP = "Vous ne pouvez pas ajouter un devoir qui n'est pas attribué à votre TP.";
				return;
			}
		}

		markdown = editor ? editor.storage.markdown.getMarkdown() : '';
		console.log('Données à envoyer:', {
			promotion,
			selectedMatiere,
			expire_le_timestamp,
			groupes,
			markdown,
			titre
		});
		if (isEtudiantOuDelegue && promotion !== maPromotion) {
			alert("Vous ne pouvez ajouter un devoir que pour votre propre promotion.");
			return;
		}
		try {
			promotion = STORE.utilisateur?.role === 'ETUDIANT' ? MA_PROMOTION : promotion;
			console.log(new Date(expire_le_timestamp).getTime());
			const RESPONSE = await fetch('/api/devoirs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					promotion,
					matiere: selectedMatiere,
					expire_le_timestamp: new Date(expire_le_timestamp).getTime(),
					groupes: groupes.join(','),
					markdown,
					titre
				})
			});
			const data = await RESPONSE.json();
			console.log(data);
			goto('/devoir/' + data.id);
		} catch (error) {
			console.error(error);
		}
	}

	let MA_PROMOTION = $derived(STORE.utilisateur?.promotion);

	let PROMOTIONS_OPTIONS = $derived.by(() => {
		const IS_ETUDIANT = STORE.utilisateur?.role === 'ETUDIANT';
		if (IS_ETUDIANT) {
			return [MA_PROMOTION];
		} else {
			return Object.values(EPromotion);
		}
	});
	let MATIERES_FILTRE = $derived.by(() => {
		if (promotion === EPromotion.PREMIERE_ANNEE) {
			return matieres_options
				.filter((matiere) => {
					const ID = parseInt(String(matiere.id).slice(2, 5));
					return ID >= 100 && ID <= 300;
				})
				.sort((a, b) => parseInt(String(a.id).slice(2, 5)) - parseInt(String(b.id).slice(2, 5)));
		} else if (promotion === EPromotion.DEUXIEME_ANNEE) {
			return matieres_options
				.filter((matiere) => {
					const ID = parseInt(String(matiere.id).slice(2, 5));
					return ID >= 300 && ID <= 500;
				})
				.sort((a, b) => parseInt(String(a.id).slice(2, 5)) - parseInt(String(b.id).slice(2, 5)));
		} else if (promotion === EPromotion.TROISIEME_ANNEE) {
			return matieres_options
				.filter((matiere) => {
					const ID = parseInt(String(matiere.id).slice(2, 5));
					return ID >= 500 && ID <= 700;
				})
				.sort((a, b) => parseInt(String(a.id).slice(2, 5)) - parseInt(String(b.id).slice(2, 5)));
		}
		return matieres_options
			.filter((matiere) => matiere.id !== '1')
			.sort((a, b) => parseInt(String(a.id).slice(2, 5)) - parseInt(String(b.id).slice(2, 5)));
	});

	const groupesTD = ['TD AB', 'TD CD', 'TD EF', 'TD GH', 'TD IJ'];
	let groupesTP = [];
	let selectedTD = '';
	let groupeTD = ''; // Déclaration de la variable réactive pour le binding
	let groupeTP = ''; // Déclaration de la variable réactive pour le binding

	function mettreAJourGroupesTP(td: string) {
		if (td === 'TD AB') groupesTP = ['TP A', 'TP B'];
		else if (td === 'TD CD') groupesTP = ['TP C', 'TP D'];
		else if (td === 'TD EF') groupesTP = ['TP E', 'TP F'];
		else if (td === 'TD GH') groupesTP = ['TP G', 'TP H'];
		else if (td === 'TD IJ') groupesTP = ['TP I', 'TP J'];
		else groupesTP = [];
		devoirForm.groupes = []; // Réinitialiser les groupes sélectionnés
	}

	function getDateActuelle() {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}

	// Nouvelle fonction pour le lendemain à la même heure
	function getDateLendemain() {
		const now = new Date();
		now.setDate(now.getDate() + 1);
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}

	let dateActuelle = getDateActuelle();
</script>

<div class="max-w-5xl mx-auto p-0 sm:p-6 prose page-ajouter-devoir">
	<h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Formulaire d'ajouts</h1>

	<h2 class="text-xl sm:text-2xl mb-4 sm:mb-6">Rendu(s) / Exercice(s)</h2>

	<form onsubmit={handleSubmit} class="space-y-4 sm:space-y-6">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
			<div class="relative">
				<select
					id="promotion"
					bind:value={promotion}
					required
					class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					disabled={isEtudiantOuDelegue}
				>
					<option value="" disabled selected>Choisir une promotion</option>
					{#each PROMOTIONS_OPTIONS as promo}
						<option value={promo}>{promo}</option>
					{/each}
				</select>
				<label for="promotion" class="absolute left-4 top-2 text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-purple-500">Promotion</label>
			</div>

			<div class="relative">
				<select
					id="matiere"
					bind:value={selectedMatiere}
					required
					class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
				>
					<option value="" disabled selected>Choisir une matière</option>
					{#each MATIERES_FILTRE as matiere, index}
						<option value={matiere.id}>{matiere.nom}</option>
					{/each}
				</select>
				<label for="matiere" class="absolute left-4 top-2 text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-purple-500">Matière</label>
			</div>
		</div>

		<div class="relative">
			<input
				type="datetime-local"
				id="dateRendu"
				bind:value={expire_le_timestamp}
				required
				min={dateActuelle}
				class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
				placeholder=" "
			/>
			<label for="dateRendu">Date et heure de rendu</label>
			{#if expire_le_timestamp && expire_le_timestamp !== '' && new Date(expire_le_timestamp).getTime() <= Date.now()}
				<p class="text-red-600 text-sm mt-1">La date choisie est déjà passée, merci d'en prendre une à venir.</p>
			{/if}
		</div>

		{#if STORE.utilisateur?.role === 'ETUDIANT' || STORE.utilisateur?.role === 'DÉLÉGUÉ'}
			<div class="mb-4">
				<label class="block text-base font-bold text-gray-700 mb-2">Groupe concerné</label>
				<div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
					<select
						id="groupeSelect"
						bind:value={selectedGroupe}
						class="w-full sm:w-[320px] px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					>
						<option value="" disabled selected>Choisir un groupe</option>
						{#each groupes_options as groupe}
							{#if !groupes.includes(groupe)}
								<option value={groupe}>{groupe}</option>
							{/if}
						{/each}
						{#if !groupes.includes('Tous')}
							<option value="Tous">Tous les groupes (toute la promo)</option>
						{/if}
					</select>
					<button
						type="button"
						class="w-full sm:w-auto sm:min-w-[120px] px-3 py-2 sm:px-6 sm:py-2 bg-[#4B3B7C] text-white rounded-md font-semibold hover:brightness-110"
						onclick={() => {
							// Ajout d'une vérification stricte pour TD/TP avant d'ajouter
							if ((STORE.utilisateur?.role === 'ÉTUDIANT' || STORE.utilisateur?.role === 'DÉLÉGUÉ')) {
								if (userTD && !groupes.includes(userTD) && selectedGroupe !== userTD && selectedGroupe !== 'Tous') {
									erreurTDTP = "Vous ne pouvez pas ajouter un devoir qui n'est pas attribué à votre TD.";
									return;
								}
								if (userTP && !groupes.includes(userTP) && selectedGroupe !== userTP && selectedGroupe !== 'Tous') {
									erreurTDTP = "Vous ne pouvez pas ajouter un devoir qui n'est pas attribué à votre TP.";
									return;
								}
							}
							erreurTDTP = '';
							if (selectedGroupe) {
								if (selectedGroupe === 'Tous') {
									groupes = [...Object.values(EGroupeTD), ...Object.values(EGroupeTP)];
								} else {
									groupes = groupes.filter(g => g !== 'Tous');
									if (!groupes.includes(selectedGroupe)) {
										groupes = [...groupes, selectedGroupe];
									}
								}
								selectedGroupe = '';
							}
						}}
						disabled={!selectedGroupe}
					>
						Ajouter
					</button>
					{#if erreurTDTP}
						<p class="text-red-600 text-sm mt-1">{erreurTDTP}</p>
					{/if}
				</div>
				<div class="flex flex-wrap gap-2 mt-2">
					{#if groupes.length === Object.values(EGroupeTD).length + Object.values(EGroupeTP).length}
						<span class="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
							Tous
							<button type="button" class="ml-2 text-purple-600 hover:text-red-500" onclick={() => {
								groupes = [];
							}} title="Retirer tous les groupes">&times;</button>
						</span>
					{:else}
						{#each groupes as groupe}
							<span class="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
								{groupe}
								<button type="button" class="ml-2 text-purple-600 hover:text-red-500" onclick={() => {
									groupes = groupes.filter(g => g !== groupe);
								}} title="Retirer ce groupe">&times;</button>
							</span>
						{/each}
					{/if}
				</div>
				<p class="text-xs text-gray-500 mt-1">
					Ajoutez un ou plusieurs groupes TD/TP, ou "Tous les groupes" pour toute la promotion.
				</p>
				{#if groupesErreur}
					<p class="text-red-600 text-sm mt-1">{groupesErreur}</p>
				{/if}
				{#if erreurTDTP}
					<p class="text-red-600 text-sm mt-1">{erreurTDTP}</p>
				{/if}
			</div>
		{:else}
			<div class="mb-4">
				<label class="block text-base font-bold text-gray-700 mb-2">Groupes concernés</label>
				<div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
					<select
						id="groupeSelect"
						bind:value={selectedGroupe}
						class="w-full sm:w-[320px] px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
					>
						<option value="" disabled selected>Choisir un groupe</option>
						{#each groupes_options as groupe}
							{#if !groupes.includes(groupe)}
								<option value={groupe}>{groupe}</option>
							{/if}
						{/each}
						{#if !groupes.includes('Tous')}
							<option value="Tous">Toute la promotion</option>
						{/if}
					</select>
					<button
						type="button"
						class="w-full sm:w-auto sm:min-w-[120px] px-3 py-2 sm:px-6 sm:py-2 bg-[#4B3B7C] text-white rounded-md font-semibold hover:brightness-110"
						onclick={() => {
							if (selectedGroupe) {
								if (selectedGroupe === 'Tous') {
									groupes = [...Object.values(EGroupeTD), ...Object.values(EGroupeTP)];
								} else {
									groupes = groupes.filter(g => g !== 'Tous');
									if (!groupes.includes(selectedGroupe)) {
										groupes = [...groupes, selectedGroupe];
									}
								}
								selectedGroupe = '';
							}
						}}
						disabled={!selectedGroupe}
					>
						Ajouter
					</button>
				</div>
				<div class="flex flex-wrap gap-2 mt-2">
					{#if groupes.length === Object.values(EGroupeTD).length + Object.values(EGroupeTP).length}
						<span class="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
							Tous
							<button type="button" class="ml-2 text-purple-600 hover:text-red-500" onclick={() => {
								groupes = [];
							}} title="Retirer tous les groupes">&times;</button>
						</span>
					{:else}
						{#each groupes as groupe}
							<span class="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
								{groupe}
								<button type="button" class="ml-2 text-purple-600 hover:text-red-500" onclick={() => {
									groupes = groupes.filter(g => g !== groupe);
								}} title="Retirer ce groupe">&times;</button>
							</span>
						{/each}
					{/if}
				</div>
				<p class="text-xs text-gray-500 mt-1">
					Ajoutez un ou plusieurs groupes TD/TP, ou "Tous les groupes" pour toute la promotion.
				</p>
				{#if groupesErreur}
					<p class="text-red-600 text-sm mt-1">{groupesErreur}</p>
				{/if}
			</div>
		{/if}

		<div class="relative">
			<input
				type="text"
				id="titreDevoir"
				bind:value={titre}
				required
				class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
				placeholder=" "
			/>
			<label for="titreDevoir">Titre du devoir</label>
		</div>


		<div class="border border-gray-300 bg-white rounded-md p-2 sm:p-4 min-h-[200px] sm:min-h-[300px]">
			<label class="block text-sm font-medium text-gray-700 mb-2">Contenu du devoir</label>
			{#if editor}
				<div class="control-group">
					<div class="flex flex-wrap sm:flex-nowrap gap-2 p-2 border-b border-gray-200 mb-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
						<!-- Text Formatting Group -->
						<div class="flex items-center space-x-1 mr-3">
							<button
								type="button"
								onclick={() => editor.chain().focus().toggleBold().run()}
								disabled={!editor.can().chain().focus().toggleBold().run()}
								class={`p-1.5 rounded-md hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-purple-100 text-purple-800' : 'text-gray-700'}`}
								aria-label="Bold"
								title="Bold"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M6 4h8a4 4 0 0 1 4 4 4 0 0 1-4 4H6z"></path><path
										d="M6 12h9a4 4 0 0 1 4 4 4 0 0 1-4 4H6z"
									></path></svg
								>
							</button>
							<button
								type="button"
								onclick={() => editor.chain().focus().toggleItalic().run()}
								disabled={!editor.can().chain().focus().toggleItalic().run()}
								class={`p-1.5 rounded-md hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-purple-100 text-purple-800' : 'text-gray-700'}`}
								aria-label="Italic"
								title="Italic"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"
									></line><line x1="15" y1="4" x2="9" y2="20"></line></svg
								>
							</button>
							<button
								type="button"
								onclick={() => editor.chain().focus().toggleStrike().run()}
								disabled={!editor.can().chain().focus().toggleStrike().run()}
								class={`p-1.5 rounded-md hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-purple-100 text-purple-800' : 'text-gray-700'}`}
								aria-label="Strikethrough"
								title="Strikethrough"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M17 9V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v3"></path><path
										d="M16 15v3a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3"
									></path><line x1="4" y1="12" x2="20" y2="12"></line></svg
								>
							</button>
							<button
								type="button"
								onclick={() => editor.chain().focus().toggleCode().run()}
								disabled={!editor.can().chain().focus().toggleCode().run()}
								class={`p-1.5 rounded-md hover:bg-gray-100 ${editor.isActive('code') ? 'bg-purple-100 text-purple-800' : 'text-gray-700'}`}
								aria-label="Inline Code"
								title="Inline Code"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"
									></polyline></svg
								>
							</button>
						</div>

						<!-- Divider -->
						<div class="h-8 w-px bg-gray-200 mx-1"></div>

						<!-- Paragraph Styles Group -->
						<div class="flex items-center space-x-1 mr-3">
							<select
								onchange={(e) => {
									const value = e.target.value;
									if (value === 'paragraph') {
										editor.chain().focus().setParagraph().run();
									} else if (value.startsWith('heading')) {
										const level = parseInt(value.split('-')[1]);
										editor.chain().focus().toggleHeading({ level }).run();
									}
								}}
								class="p-2.5 pr-8 rounded-md border border-gray-300 text-sm"
							>
								<option value="paragraph" selected={editor.isActive('paragraph')}>Paragraph</option>
								<option value="heading-1" selected={editor.isActive('heading', { level: 1 })}
									>Heading 1</option
								>
								<option value="heading-2" selected={editor.isActive('heading', { level: 2 })}
									>Heading 2</option
								>
								<option value="heading-3" selected={editor.isActive('heading', { level: 3 })}
									>Heading 3</option
								>
							</select>
						</div>

						<div class="h-8 w-px bg-gray-200 mx-1"></div>

						<div class="flex items-center space-x-1 mr-3">
							<button
								type="button"
								onclick={() => editor.chain().focus().toggleBulletList().run()}
								class={`p-1.5 rounded-md hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-purple-100 text-purple-800' : 'text-gray-700'}`}
								aria-label="Bullet List"
								title="Bullet List"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"
									></line><line x1="8" y1="18" x2="21" y2="18"></line><line
										x1="3"
										y1="6"
										x2="3.01"
										y2="6"
									></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line
										x1="3"
										y1="18"
										x2="3.01"
										y2="18"
									></line></svg
								>
							</button>
							<button
								type="button"
								onclick={() => editor.chain().focus().toggleOrderedList().run()}
								class={`p-1.5 rounded-md hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-purple-100 text-purple-800' : 'text-gray-700'}`}
								aria-label="Ordered List"
								title="Ordered List"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"
									></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"
									></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"
									></path></svg
								>
							</button>

							<button
								type="button"
								onclick={() => editor.chain().focus().toggleCodeBlock().run()}
								class={`p-1.5 rounded-md hover:bg-gray-100 ${editor.isActive('codeBlock') ? 'bg-purple-100 text-purple-800' : 'text-gray-700'}`}
								aria-label="Code Block"
								title="Code Block"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"
									></polyline></svg
								>
							</button>
						</div>

						<div class="h-8 w-px bg-gray-200 mx-1"></div>

						<div class="relative ml-auto">
							<button
								type="button"
								onclick={() => document.getElementById('more-options').classList.toggle('hidden')}
								class="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
								aria-label="More Options"
								title="More Options"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"
									></circle><circle cx="5" cy="12" r="1"></circle></svg
								>
							</button>
							<div
								id="more-options"
								class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden z-10"
							>
								<div class="py-1">
									<button
										type="button"
										onclick={() => {
											editor.chain().focus().setHorizontalRule().run();
											document.getElementById('more-options').classList.add('hidden');
										}}
										class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									>
										Horizontal Rule
									</button>
									<button
										type="button"
										onclick={() => {
											editor.chain().focus().setHardBreak().run();
											document.getElementById('more-options').classList.add('hidden');
										}}
										class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									>
										Hard Break
									</button>
									<button
										type="button"
										onclick={() => {
											editor.chain().focus().unsetAllMarks().run();
											document.getElementById('more-options').classList.add('hidden');
										}}
										class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									>
										Clear Formatting
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
			<div class="" bind:this={element} />
		</div>

		<div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
			<button
				type="button"
				class="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
				onclick={() => goto('/')}
			>
				Retour
			</button>
			<button
				type="submit"
				class="w-full sm:w-auto px-4 py-2 text-white rounded-md hover:brightness-110"
				style="background-color: #4B3B7C"
				disabled={!!dateErreur}
			>
				Ajouter
			</button>

		</div>
	</form>
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

	body, .page-ajouter-devoir {
		background: #fff !important;
	}

	@media (max-width: 640px) {
		.page-ajouter-devoir {
			padding-left: 0 !important;
			padding-right: 0 !important;
		}
		.prose {
			font-size: 1rem;
		}
		.control-group > div {
			overflow-x: auto;
			white-space: nowrap;
			}
		.relative label {
			font-size: 0.95rem;
		}
	}
	@media (min-width: 640px) {
		.page-ajouter-devoir {
			max-width: 900px;
		}
	}
</style>
