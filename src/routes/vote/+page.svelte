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
</script>

<div>
	{#each devoirs as devoir}
		<div class="devoir">
			<h2>{devoir.matiere}</h2>
			<p>{devoir.markdown}</p>
			<div class="votes">
				<button on:click={() => handleVote(devoir.id, 1)}>👍</button>
				<button on:click={() => handleVote(devoir.id, -1)}>👎</button>
			</div>
		</div>
	{/each}
</div>
