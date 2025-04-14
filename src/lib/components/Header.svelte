<script lang="ts">
	import { deconnexion, STORE } from '$lib/store.svelte';

	let menuOuvert = false;

	// Fonction pour basculer l'état du menu
	function toggleMenu() {
		menuOuvert = !menuOuvert;
	}

	// Fonction pour fermer le menu
	function fermerMenu() {
		menuOuvert = false;
	}
</script>

<div class="bg-[#4B3B7C] text-white p-4 h-40 sm:h-18 w-full fixed top-0 left-0 right-0 z-50">
	{#if STORE.connected === false}
		<div class="mx-auto flex flex-col md:flex-row justify-between items-center h-full">
			<div class="flex items-center space-x-3 mb-4 md:mb-0">
				<a href="/" class="flex items-center space-x-3">
					<img src="/iut-troyes-logo.png" alt="IUT Troyes" class="h-12 w-12" />
					<h1 class="text-2xl font-semibold text-[#FDB813]">Agenda MMI Troyes</h1>
				</a>
			</div>
			<div class="flex items-center space-x-4">
				<a href="/inscription" class="flex items-center text-[#FDB813] hover:text-yellow-400 gap-2">
					<span class="w-6 h-6 i-ph:user-circle-plus-light"></span>
					<span>S'inscrire</span>
				</a>
				<a href="/connexion" class="flex items-center text-[#FDB813] hover:text-yellow-400 gap-2">
					<span class="i-ph:lock-key h-6 w-6"></span>
					<span>Se Connecter</span>
				</a>
			</div>
		</div>
	{:else}
		<div class="mx-auto flex flex-col md:flex-row justify-between items-center h-full">
			<div class="flex items-center space-x-3 mb-4 md:mb-0">
				<a href="/" class="flex items-center space-x-3">
					<img src="/iut-troyes-logo.png" alt="IUT Troyes" class="h-12 w-12" />
					<h1 class="text-2xl font-semibold text-[#FDB813]">Agenda MMI Troyes</h1>
				</a>
			</div>
			<div class="relative w-full md:w-auto hidden sm:flex!"></div>
			<div
				class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto"
			>
				<!-- Boutons ajoutés -->
				<a href="/mes-devoirs" class="flex items-center text-white hover:text-[#FDB813] gap-2">
					<span class="w-6 h-6 i-ph:book-light"></span>
					<span>Mes Devoirs</span>
				</a>
				<a href="/ajouter-devoir" class="flex items-center text-white hover:text-[#FDB813] gap-2">
					<span class="w-6 h-6 i-ph:plus-circle-light"></span>
					<span>Ajouter Devoir</span>
				</a>

				<div class="relative w-full md:w-auto">
					<button
						class="flex items-center justify-between space-x-2 text-white hover:text-[#FDB813] transition-colors bg-black/20 p-4 rounded-md w-full md:w-auto"
						onclick={toggleMenu}
					>
						<span class="w-8 h-8 i-ph:user-circle"></span>
						<span>{STORE.utilisateur?.nom}</span>
						<span class="w-4 h-4 i-ph:caret-down"></span>
					</button>

					{#if menuOuvert}
						<div
							id="userMenu"
							class="absolute right-0 mt-2 w-full md:w-48 bg-white shadow-lg py-1 text-gray-700 rounded-sm z-50"
						>
							{#if STORE.utilisateur?.role === 'PROFESSEUR'}
								<a href="/menu-admin" class="block px-4 py-3 hover:bg-gray-100" onclick={fermerMenu}>
									Menu Admin
								</a>
								<hr class="my-1" />
							{/if}
							<a href="/menu-profil" class="block px-4 py-3 hover:bg-gray-100" onclick={fermerMenu}>
								Mon Profil
							</a>
							<hr class="my-1" />
							<button
								onclick={() => {
									deconnexion();
									fermerMenu();
								}}
								class="block w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
							>
								Déconnexion
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	div[popover] {
		border: none;
		padding: 0;
		margin: 0;
	}

	div[popover][state='open'] {
		animation: slide-in 0.2s ease-out;
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Add anchor positioning */
	#userMenu {
		anchor-name: --user-menu;
		inset: unset;
		top: anchor(bottom);
		right: anchor(right);
		width: max-content;
		max-width: 100%;
		min-width: 0;
		width: anchor-size(--user-menu, 100%);
	}

	#userMenuButton {
		anchor-name: --user-menu;
	}
</style>
