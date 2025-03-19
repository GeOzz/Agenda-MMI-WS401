<script lang="ts">
	import { browser } from '$app/environment';
	import { EPromotion } from '$lib/interfaces/IUtilisateur';
	import { checkConnected, redirectToConnexion, STORE } from '$lib/store.svelte';
	import { onMount } from 'svelte';

	// Semester datas
	const semesters = [
		{
			title: 'BUT1 - SEMESTRE 1',
			subtitle: 'BUT1 MMI',
			modules: [
				{ code: 'WR101', name: 'Anglais' },
				{ code: 'WR102', name: 'Anglais Renfocé' },
				{ code: 'WR103', name: 'Ergonomie et Accessibilité' },
				{ code: 'WR104', name: 'Culture numérique' },
				{ code: 'WR105', name: 'Stratégies de communication et marketing' },
				{ code: 'WR106', name: 'Expression, communication et rhétorique' },
				{ code: 'WR107', name: 'Ecriture multimédia et narration' },
				{ code: 'WR108', name: 'Production Graphique' },
				{ code: 'WR109', name: 'Culture artistique' },
				{ code: 'WR110', name: 'Production audio et vidéo' },
				{ code: 'WR112', name: 'Intégration' },
				{ code: 'WR113', name: 'Développement Web' }
			]
		}
		// Add other semesters similarly...
	];

	let activeTab = $state<'informations' | 'contenu'>('informations');

	const AfficherOuNon = new Promise(async (resolve, reject) => {
		if (!browser) return;
		await checkConnected();

		if (STORE.connected === false) {
			redirectToConnexion();
			reject(false);
		} else {
			resolve(true);
		}
	});
</script>

{#await AfficherOuNon then value}
	{#if STORE.connected === true}
		<div class=" flex h-screen">
			<div class=" h-full w-100 bg-gray-200 p-4 shadow-lg overflow-y-scroll hidden sm:block!">
				<nav class="space-y-4">
					<!-- Navigation header -->
					<div class="text-gray-500 mb-6">
						<h2 class="text-sm font-medium">Navigation</h2>
						<div class="mt-2 space-y-2">
							<button
								class="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 w-full p-2 rounded"
							>
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4z" />
								</svg>
								<span>Vue en grille</span>
							</button>
							<button
								class="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 w-full p-2 rounded"
							>
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
								</svg>
								<span>Mode sombre</span>
							</button>
						</div>
					</div>

					<!-- Recent views -->
					<div class="text-gray-500">
						<h2 class="text-sm font-medium mb-2">Vus récemment</h2>
						<div class="space-y-2">
							{#each semesters[0].modules as module}
								<div
									class="flex items-center space-x-2 text-gray-600 hover:bIPromotion0 p-2 rounded cursor-pointer"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									<span class="text-sm">{module.code} - {module.name}</span>
								</div>
							{/each}
						</div>
					</div>
				</nav>
			</div>

			<!-- Main content -->
			<main class=" p-0 sm:p-8! h-full overflow-y-scroll flex-grow-1">
				<div class="sm:hidden! w-full flex bg-white">
					<button
						onclick={() => (activeTab = 'informations')}
						class="p-4 transition-colors cursor-pointer w-full border-b-5 {activeTab ===
						'informations'
							? 'border-[#4B3B7C]'
							: 'border-gray-300'} font-semibold"
					>
						Informations
					</button>
					<button
						onclick={() => (activeTab = 'contenu')}
						class="p-4 transition-colors cursor-pointer w-full border-b-5 {activeTab === 'contenu'
							? 'border-[#4B3B7C]'
							: 'border-gray-300'} font-semibold"
					>
						Contenu
					</button>
				</div>
				<!-- MOBILE -->
				<div class="sm:hidden!">
					{#if activeTab === 'informations'}
						<div class=" h-full w-full bg-white p-4 shadow-lg overflow-y-auto">
							<nav class="space-y-4">
								<!-- Navigation header -->
								<div class="text-gray-500 mb-6">
									<h2 class="text-sm font-medium">Navigation</h2>
									<div class="mt-2 space-y-2">
										<button
											class="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 w-full p-2 rounded"
										>
											<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4z" />
											</svg>
											<span>Vue en grille</span>
										</button>
										<button
											class="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 w-full p-2 rounded"
										>
											<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path
													d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
												/>
											</svg>
											<span>Mode sombre</span>
										</button>
									</div>
								</div>

								<!-- Recent views -->
								<div class="text-gray-500">
									<h2 class="text-sm font-medium mb-2">Vus récemment</h2>
									<div class="space-y-2">
										{#each semesters[0].modules as module}
											<div
												class="flex items-center space-x-2 text-gray-600 hover:bIPromotion0 p-2 rounded cursor-pointer"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
												<span class="text-sm">{module.code} - {module.name}</span>
											</div>
										{/each}
									</div>
								</div>
							</nav>
						</div>
					{:else}
						<h1 class="text-5xl font-bold block mb-20 mt-10">
							Bienvenue, {STORE.utilisateur?.nom}
							{STORE.utilisateur?.prenom}
						</h1>
						<div class="flex justify-between items-center my-8">
							<div>
								<h2 class="text-2xl font-bold">Agenda</h2>
								<select class="border rounded p-1 pr-10">
									{#each Object.values(EPromotion) as promotion}
										<option>{promotion}</option>
									{/each}
								</select>
							</div>

							<div class="flex items-center space-x-2">
								<span class="text-gray-600">Trier</span>
								<select class="border rounded p-1 pr-10">
									<option>Nom</option>
								</select>
							</div>
						</div>

						<!-- Semesters -->
						{#each semesters as semester}
							<div class="mb-12">
								<div class="flex items-center space-x-4 mb-6">
									<div class="w-24 h-24 bg-purple-200 rounded-lg overflow-hidden">
										<!-- You can add an actual image here -->
									</div>
									<div>
										<h2 class="text-xl font-bold">{semester.title}</h2>
										<p class="text-gray-600">{semester.subtitle}</p>
									</div>
								</div>

								<div class="grid grid-cols-3 gap-4">
									{#each semester.modules as module}
										<div
											class="bg-gray-200 p-4 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
										>
											<div class="flex items-center space-x-2">
												<svg
													class="w-5 h-5 text-purple-600"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"
													/>
												</svg>
												<span>{module.code} - {module.name}</span>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					{/if}
				</div>
				<!-- BUREAU -->
				<div class="hidden sm:block!">
					<h1 class="text-5xl font-bold block mb-20 mt-10">
						Bienvenue, {STORE.utilisateur?.nom}
						{STORE.utilisateur?.prenom}
					</h1>
					<div class="flex justify-between items-center my-8">
						<div>
							<h2 class="text-2xl font-bold">Agenda</h2>
							<select class="border rounded p-1 pr-10">
								{#each Object.values(EPromotion) as promotion}
									<option>{promotion}</option>
								{/each}
							</select>
						</div>

						<div class="flex items-center space-x-2">
							<span class="text-gray-600">Trier</span>
							<select class="border rounded p-1 pr-10">
								<option>Nom</option>
							</select>
						</div>
					</div>

					<!-- Semesters -->
					{#each semesters as semester}
						<div class="mb-12">
							<div class="flex items-center space-x-4 mb-6">
								<div class="w-24 h-24 bg-purple-200 rounded-lg overflow-hidden">
									<!-- You can add an actual image here -->
								</div>
								<div>
									<h2 class="text-xl font-bold">{semester.title}</h2>
									<p class="text-gray-600">{semester.subtitle}</p>
								</div>
							</div>

							<div class="grid grid-cols-3 gap-4">
								{#each semester.modules as module}
									<div
										class="bg-gray-200 p-4 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
									>
										<div class="flex items-center space-x-2">
											<svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
												<path
													d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"
												/>
											</svg>
											<span>{module.code} - {module.name}</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</main>
		</div>
	{/if}
{/await}
