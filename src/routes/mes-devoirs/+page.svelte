<script lang="ts">
	import { onMount } from 'svelte';
	import { STORE } from '$lib/store.svelte';

	let devoirs = $state([]);

	onMount(async () => {
		const response = await fetch('/api/devoirs');
		devoirs = await response.json();
	});

	async function handleVote(devoir_id: number, vote: number) {
		try {
			const response = await fetch('/api/devoirs/vote', {
				method: 'POST',
				body: JSON.stringify({ devoir_id, vote })
			});
			const data = await response.json();
			console.log(data.message);
		} catch (error) {
			console.error('Erreur lors du vote', error);
		}
	}

	function getTimeRemaining(expire_le_timestamp: number) {
		const total = expire_le_timestamp - Date.now();
		const seconds = Math.floor((total / 1000) % 60);
		const minutes = Math.floor((total / 1000 / 60) % 60);
		const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
		const days = Math.floor(total / (1000 * 60 * 60 * 24));

		return {
			total,
			days,
			hours,
			minutes,
			seconds
		};
	}
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
	{#each devoirs.slice(0, 6) as devoir}
		<div class="bg-white shadow-lg rounded-lg overflow-hidden">
			<div class="bg-purple-200 h-24"></div>
			<div class="p-4">
				<h2 class="text-xl font-bold">{devoir.matiere}</h2>
				<p class="text-gray-600">{devoir.markdown}</p>
				<div class="flex justify-between items-center mt-4">
					<span class="text-gray-500">
						{#if getTimeRemaining(devoir.expire_le_timestamp).total > 0}
							{getTimeRemaining(devoir.expire_le_timestamp).days}j {getTimeRemaining(devoir.expire_le_timestamp).hours}h {getTimeRemaining(devoir.expire_le_timestamp).minutes}m {getTimeRemaining(devoir.expire_le_timestamp).seconds}s
						{:else}
							Expiré
						{/if}
					</span>
					<div class="flex space-x-2">
						<button on:click={() => handleVote(devoir.id, 1)} class="bg-green-500 text-white px-3 py-1 rounded">👍</button>
						<button on:click={() => handleVote(devoir.id, -1)} class="bg-red-500 text-white px-3 py-1 rounded">👎</button>
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>
