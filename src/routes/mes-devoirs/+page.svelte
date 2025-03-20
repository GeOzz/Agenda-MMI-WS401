<script lang="ts">
	import { onMount } from 'svelte';
	import { STORE } from '$lib/store.svelte';

	let devoirs = $state([]);
	let INTERVAL;

	onMount(async () => {
		const response = await fetch('/api/devoirs');
		devoirs = await response.json();
		devoirs = devoirs.map((devoir) => ({
			...devoir,
			votes: { verifier: 0, refuser: 0 },
			userVote: null
		}));

		setInterval(() => {
			devoirs = devoirs
				.filter((devoir) => devoir.expire_le_timestamp > new Date().getTime())
				.map((devoir) => {
					const time = getTimeRemaining(devoir.expire_le_timestamp);
					return { ...devoir, time };
				});
		}, 1000);

		return () => {
			clearInterval(INTERVAL);
		};
	});

	async function handleVote(devoir_id: number, vote: number) {
		try {
			const response = await fetch('/api/devoirs/vote', {
				method: 'POST',
				body: JSON.stringify({ devoir_id, vote })
			});
			const data = await response.json();
			const index = devoirs.findIndex((d) => d.id === devoir_id);
			if (index !== -1) {
				if (devoirs[index].userVote === vote) {
					devoirs[index].votes[vote === 1 ? 'verifier' : 'refuser']--;
					devoirs[index].userVote = null;
				} else {
					if (devoirs[index].userVote !== null) {
						devoirs[index].votes[devoirs[index].userVote === 1 ? 'verifier' : 'refuser']--;
					}
					devoirs[index].votes[vote === 1 ? 'verifier' : 'refuser']++;
					devoirs[index].userVote = vote;
				}
			}
		} catch (error) {
			console.error('Erreur lors du vote', error);
		}
	}

	function getTimeRemaining(expire_le_timestamp: number) {
		const total = expire_le_timestamp - Date.now();
		const days = Math.floor(total / (1000 * 60 * 60 * 24));
		const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
		const minutes = Math.floor((total / (1000 * 60)) % 60);
		const seconds = Math.floor((total / 1000) % 60);
		return { total, days, hours, minutes, seconds };
	}
</script>

<div class="flex">
	<!-- Menu de navigation à gauche -->
	<nav
		class="w-64 h-screen bg-gray-100 text-black flex flex-col fixed top-0 left-0 overflow-y-auto"
	>
		<div class="p-4">
			<h2 class="text-2xl font-bold">Menu</h2>
		</div>
		<ul class="flex-1 p-4 space-y-2">
			<li><a href="/" class="block px-4 py-2 rounded hover:bg-gray-700">Accueil</a></li>
			<li>
				<a href="/mes-devoirs" class="block px-4 py-2 rounded hover:bg-gray-700">Mes Devoirs</a>
			</li>
			<li>
				<a href="/ajouter-devoir" class="block px-4 py-2 rounded hover:bg-gray-700"
					>Ajouter Devoir</a
				>
			</li>
			<li><a href="/profil" class="block px-4 py-2 rounded hover:bg-gray-700">Profil</a></li>
		</ul>
	</nav>

	<!-- Contenu principal -->
	<div class="flex-1 ml-64 max-w-7xl mx-auto p-6 mt-6 bg-white">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
			{#each devoirs as devoir}
				<div
					class="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300 w-full max-w-xl mx-auto"
				>
					<div class="relative">
						<img src="/fond-devoirs.jpeg" alt="Devoir" class="w-full h-40 object-cover" />
					</div>
					<div class="p-4">
						<h2 class="text-lg font-bold">{devoir.matiere}</h2>
						<div class="flex justify-between items-center mt-2">
							<p class="text-gray-900 text-sm font-bold">{devoir.titre}</p>
							<span class="text-gray-700 text-xs bg-gray-200 px-3 py-1 rounded-lg">
								{devoir.time.days}j {devoir.time.hours}h {devoir.time.minutes}m {devoir.time
									.seconds}s
							</span>
						</div>
						<div class="flex justify-center items-center mt-4 space-x-4">
							<a
								class="w-full text-center bg-[#4B3B7C] text-white px-3 py-3 rounded-lg shadow transition-opacity duration-300 opacity-100 hover:opacity-75"
								href={`/devoir/${devoir.id}`}
							>
								Consulter
							</a>
						</div>
						<div class="flex justify-center items-center mt-4 space-x-4">
							<button
								on:click={() => handleVote(devoir.id, 1)}
								class="flex items-center bg-[#FDEFCC] text-black px-3 py-1 rounded-lg shadow transition-opacity duration-300 opacity-100 hover:opacity-75"
							>
								<img
									src="/verifier.png"
									alt="Vérifier"
									class="w-4 h-4 mr-2 opacity-80 hover:opacity-65 transition-opacity duration-300"
								/>
								{devoir.votes.verifier}
							</button>
							<button
								on:click={() => handleVote(devoir.id, -1)}
								class="flex items-center bg-[#DBD7E3] text-black px-3 py-1 rounded-lg shadow transition-opacity duration-300 opacity-100 hover:opacity-75"
							>
								<img
									src="/refuser.png"
									alt="Refuser"
									class="w-4 h-4 mr-2 opacity-80 hover:opacity-65 transition-opacity duration-300"
								/>
								{devoir.votes.refuser}
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
