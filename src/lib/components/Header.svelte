<script lang="ts">
	import { ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';
	import { deconnexion, STORE } from '$lib/store.svelte';

	let menuOuvert = false;
	let mobileMenuOuvert = false;

	function toggleMenu() {
		menuOuvert = !menuOuvert;
	}
	function fermerMenu() {
		menuOuvert = false;
	}
	function toggleMobileMenu() {
		mobileMenuOuvert = !mobileMenuOuvert;
	}
	function fermerMobileMenu() {
		mobileMenuOuvert = false;
	}
	function formatNomPrenom(nom: string, prenom: string) {
		const nomFormate = nom.trim().toUpperCase();
		const prenomFormate = prenom.trim().charAt(0).toUpperCase() + '.';
		return { nomFormate, prenomFormate };
	}
</script>

<div class="bg-[#4B3B7C] text-white p-4 h-40 sm:h-18 w-full fixed top-0 left-0 right-0 z-50">
	<!-- Desktop -->
	<div class="mx-auto flex flex-col md:flex-row justify-between items-center h-full">
		<div class="flex items-center space-x-3 mb-4 md:mb-0">
			<a href="/" class="flex items-center space-x-3">
				<img src="/iut-troyes-logo.png" alt="IUT Troyes" class="h-12 w-12" />
				<h1 class="text-2xl font-semibold text-[#FDB813]">Agenda MMI Troyes</h1>
			</a>
		</div>
		<!-- Menu burger mobile -->
		<div class="flex md:hidden absolute right-4 top-6 z-60">
			<button
				class="focus:outline-none burger-btn"
				on:click={toggleMobileMenu}
				aria-label="Ouvrir le menu"
				aria-expanded={mobileMenuOuvert}
			>
				<span class="burger-bar" class:open={mobileMenuOuvert}></span>
				<span class="burger-bar" class:open={mobileMenuOuvert}></span>
				<span class="burger-bar" class:open={mobileMenuOuvert}></span>
			</button>
		</div>
		<!-- Desktop menu -->
		<div class="relative w-full md:w-auto hidden md:flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
			{#if STORE.connected === false}
				<a href="/inscription" class="flex items-center text-[#FDB813] hover:text-yellow-400 gap-2">
					<span class="w-6 h-6 i-ph:user-circle-plus-light"></span>
					<span>S'inscrire</span>
				</a>
				<a href="/connexion" class="flex items-center text-[#FDB813] hover:text-yellow-400 gap-2">
					<span class="i-ph:lock-key h-6 w-6"></span>
					<span>Se Connecter</span>
				</a>
			{:else}
				<a href="/mes-devoirs" class="flex items-center text-white hover:text-[#FDB813] gap-2">
					<span class="w-6 h-6 i-ph:book-light"></span>
					{STORE.utilisateur?.role === ERoleUtilisateur.PROFESSEUR ? 'Les Devoirs' : 'Mes Devoirs'}
				</a>
				<a href="/ajouter-devoir" class="flex items-center text-white hover:text-[#FDB813] gap-2">
					<span class="w-6 h-6 i-ph:plus-circle-light"></span>
					<span>Ajouter Devoir</span>
				</a>
				<div class="relative w-full md:w-auto">
					<button
						class="flex items-center justify-between space-x-2 text-white hover:text-[#FDB813] transition-colors bg-black/20 p-4 rounded-md w-full md:w-auto"
						on:click={toggleMenu}
					>
						<span class="w-8 h-8 i-ph:user-circle"></span>
						{#if STORE.utilisateur?.nom && STORE.utilisateur?.prenom}
							<span>
								{formatNomPrenom(STORE.utilisateur.nom, STORE.utilisateur.prenom).nomFormate}{' '}
								{formatNomPrenom(STORE.utilisateur.nom, STORE.utilisateur.prenom).prenomFormate}
							</span>
						{/if}
						<span class="w-4 h-4 i-ph:caret-down"></span>
					</button>
					{#if menuOuvert}
						<div
							id="userMenu"
							class="absolute right-0 mt-2 w-full md:w-48 bg-white shadow-lg py-1 text-gray-700 rounded-sm z-50"
						>
							{#if STORE.utilisateur?.role === ERoleUtilisateur.PROFESSEUR}
								<a
									href="/menu-admin"
									class="block px-4 py-3 hover:bg-gray-100"
									on:click={fermerMenu}
								>
									Menu Admin
								</a>
								<hr class="my-1" />
							{/if}
							<a href="/menu-profil" class="block px-4 py-3 hover:bg-gray-100" on:click={fermerMenu}>
								Mon Profil
							</a>
							<hr class="my-1" />
							<button
								on:click={() => {
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
			{/if}
		</div>
	</div>

	<!-- Menu mobile déroulant -->
	{#if mobileMenuOuvert}
		<div class="fixed inset-0 bg-black bg-opacity-40 z-50 md:hidden fade-in" on:click={fermerMobileMenu}></div>
		<div class="fixed top-0 right-0 w-64 h-full bg-white text-[#4B3B7C] shadow-lg z-50 md:hidden flex flex-col slide-in-menu">
			<div class="flex items-center justify-between p-4 border-b">
				<span class="font-bold text-lg">Menu</span>
				<button on:click={fermerMobileMenu} aria-label="Fermer le menu">
					<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="flex flex-col gap-2 p-4">
				{#if STORE.connected === false}
					<a href="/inscription" class="flex items-center gap-2 py-2 hover:text-[#FDB813] transition-all duration-200" on:click={fermerMobileMenu}>
						<span class="w-6 h-6 i-ph:user-circle-plus-light"></span>
						S'inscrire
					</a>
					<a href="/connexion" class="flex items-center gap-2 py-2 hover:text-[#FDB813] transition-all duration-200" on:click={fermerMobileMenu}>
						<span class="i-ph:lock-key h-6 w-6"></span>
						Se Connecter
					</a>
				{:else}
					<a href="/mes-devoirs" class="flex items-center gap-2 py-2 hover:text-[#FDB813] transition-all duration-200" on:click={fermerMobileMenu}>
						<span class="w-6 h-6 i-ph:book-light"></span>
						{STORE.utilisateur?.role === ERoleUtilisateur.PROFESSEUR ? 'Les Devoirs' : 'Mes Devoirs'}
					</a>
					<a href="/ajouter-devoir" class="flex items-center gap-2 py-2 hover:text-[#FDB813] transition-all duration-200" on:click={fermerMobileMenu}>
						<span class="w-6 h-6 i-ph:plus-circle-light"></span>
						Ajouter Devoir
					</a>
					{#if STORE.utilisateur?.role === ERoleUtilisateur.PROFESSEUR}
						<a href="/menu-admin" class="flex items-center gap-2 py-2 hover:text-[#FDB813] transition-all duration-200" on:click={fermerMobileMenu}>
							<span class="w-6 h-6 i-ph:gear"></span>
							Menu Admin
						</a>
					{/if}
					<a href="/menu-profil" class="flex items-center gap-2 py-2 hover:text-[#FDB813] transition-all duration-200" on:click={fermerMobileMenu}>
						<span class="w-6 h-6 i-ph:user-circle"></span>
						Mon Profil
					</a>
					<button
						on:click={() => {
							deconnexion();
							fermerMobileMenu();
						}}
						class="flex items-center gap-2 py-2 text-red-600 hover:text-red-800 transition-all duration-200"
					>
						<span class="w-6 h-6 i-ph:sign-out"></span>
						Déconnexion
					</button>
				{/if}
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

	.burger-btn {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 40px;
		height: 40px;
		background: transparent;
		border: none;
		cursor: pointer;
		position: relative;
		z-index: 70;
	}

	.burger-bar {
		display: block;
		width: 28px;
		height: 3px;
		margin: 4px 0;
		background: #fff;
		border-radius: 2px;
		transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.burger-bar:nth-child(1) {
		transform-origin: left;
	}
	.burger-bar:nth-child(3) {
		transform-origin: left;
	}

	.burger-btn .burger-bar.open:nth-child(1) {
		transform: rotate(45deg) translate(4px, 5px);
	}
	.burger-btn .burger-bar.open:nth-child(2) {
		opacity: 0;
		transform: translateX(-10px);
	}
	.burger-btn .burger-bar.open:nth-child(3) {
		transform: rotate(-45deg) translate(4px, -5px);
	}

	.fade-in {
		animation: fadeInBg 0.3s;
	}
	@keyframes fadeInBg {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.slide-in-menu {
		animation: slideInMenu 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	}
	@keyframes slideInMenu {
		from {
			transform: translateX(100%);
			opacity: 0.5;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	/* Correction du sélecteur pour le responsive */
	@media (max-width: 768px) {
		.bg-\[\#4B3B7C\] {
			height: auto !important;
			padding-bottom: 1rem;
		}
	}
</style>
