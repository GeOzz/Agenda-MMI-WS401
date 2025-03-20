<script lang="ts">
	import { EGroupeTD, EGroupeTP, MATIERES } from '$lib/interfaces/IUtilisateur';
	import { Color } from '@tiptap/extension-color';
	import ListItem from '@tiptap/extension-list-item';
	import TextStyle from '@tiptap/extension-text-style';
	import StarterKit from '@tiptap/starter-kit';
	import { Editor } from '@tiptap/core';
	import { onMount } from 'svelte';
	import { Markdown } from 'tiptap-markdown';
	import { goto } from '$app/navigation';
	const matieres_options = Object.values(MATIERES);
	let promotion = $state('1ère Année (BUT1)');
	let selectedMatiere = $state(matieres_options[0].id);
	let expire_le_timestamp = $state(new Date());
	let groupes = $state([]);
	let selectedGroupe = $state('');
	const groupes_options = [...Object.values(EGroupeTD), ...Object.values(EGroupeTP)];

	let markdown = $state('');
	let titre = $state('');

	let element;
	let editor = $state<Editor | null>(null);

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
			content: `
# Titre principal

## Sous-titre

Ceci est un paragraphe avec du texte **en gras** et *en italique*.

### Liste à puces
- Premier élément
- Deuxième élément
- Troisième élément

### Liste numérotée
1. Premier point
2. Deuxième point
3. Troisième point

> Ceci est une citation
			`,
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			}
		});
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		markdown = editor ? editor.storage.markdown.getMarkdown() : '';
		console.log('Données à envoyer:', {
			promotion,
			selectedMatiere,
			expire_le_timestamp,
			groupes,
			markdown,
			titre
		});
		try {
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
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div class="max-w-4xl mx-auto p-6 prose">
	<h1 class="text-3xl font-bold mb-6">Formulaire d'ajouts</h1>

	<h2 class="text-2xl mb-6">Rendu(s) / Exercice(s)</h2>

	<form onsubmit={handleSubmit} class="space-y-6">
		<div class="grid grid-cols-2 gap-6">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Promotion</label>
				<select
					bind:value={promotion}
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
				>
					<option>1ère Année (BUT1)</option>
					<option>2ème Année (BUT2)</option>
					<option>3ème Année (BUT3)</option>
				</select>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Matière</label>

				<select
					bind:value={selectedMatiere}
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
				>
					{#each matieres_options as matiere}
						<option value={matiere.id}>{matiere.nom}</option>
					{/each}
				</select>
			</div>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Date et heure de rendu</label>
			<input
				type="datetime-local"
				bind:value={expire_le_timestamp}
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Groupe (TOUS/TD/TP)</label>
			<div class="flex items-center gap-2">
				<button
					class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
					type="button"
					onclick={() => {
						if (groupes.length === groupes_options.length) {
							groupes = [];
						} else {
							groupes = [...groupes_options];
						}
					}}
				>
					{groupes.length === groupes_options.length ? 'Effacer' : 'Tous'}
				</button>
				<select
					bind:value={selectedGroupe}
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
				>
					<option value="" disabled selected>Choisir un groupe</option>
					{#each groupes_options as groupe}
						<option value={groupe}>{groupe}</option>
					{/each}
				</select>
				<button
					class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
					type="button"
					onclick={() => {
						if (selectedGroupe === '') {
							alert('Veuillez sélectionner un groupe');
							return;
						}
						if (groupes.find((g) => g === selectedGroupe)) {
							alert('Ce groupe est déjà sélectionné');
						} else {
							groupes = [...groupes, selectedGroupe];
						}
					}}
				>
					Ajouter
				</button>
			</div>
			<div class="flex flex-wrap gap-2 mt-3">
				{#each groupes as groupe}
					<span
						class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center gap-2"
					>
						{groupe}
						<button type="button" onclick={() => (groupes = groupes.filter((g) => g !== groupe))}>
							<div class="i-ph:x-bold w-4 h-4 rounded-full"></div>
						</button>
					</span>
				{/each}
			</div>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Titre du devoir</label>
			<input
				type="text"
				bind:value={titre}
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
			/>
		</div>

		<div class="border border-gray-300 rounded-md p-4 min-h-[300px]">
			<label class="block text-sm font-medium text-gray-700 mb-2">Contenu du devoir</label>
			{#if editor}
				<div class="control-group">
					<div class="flex flex-wrap gap-2 p-2 border-b border-gray-200 mb-3">
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
									><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path
										d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"
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
								class="p-1.5 rounded-md border border-gray-300 text-sm"
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
								onclick={() => editor.chain().focus().toggleBlockquote().run()}
								class={`p-1.5 rounded-md hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-purple-100 text-purple-800' : 'text-gray-700'}`}
								aria-label="Blockquote"
								title="Blockquote"
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
									><path
										d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
									></path><path
										d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
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

						<div class="flex items-center space-x-1">
							<button
								type="button"
								onclick={() => editor.chain().focus().undo().run()}
								disabled={!editor.can().chain().focus().undo().run()}
								class="p-1.5 rounded-md hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
								aria-label="Undo"
								title="Undo"
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
									><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"
									></path></svg
								>
							</button>
							<button
								type="button"
								onclick={() => editor.chain().focus().redo().run()}
								disabled={!editor.can().chain().focus().redo().run()}
								class="p-1.5 rounded-md hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
								aria-label="Redo"
								title="Redo"
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
									><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"
									></path></svg
								>
							</button>
						</div>

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
			<div bind:this={element} />
		</div>

		<div class="flex justify-end gap-4">
			<button
				type="button"
				class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
				onclick={() => goto('/')}
			>
				Retour
			</button>
			<button
				type="submit"
				class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
			>
				Ajouter
			</button>
		</div>
	</form>
</div>
