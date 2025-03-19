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
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((total / (1000 * 60)) % 60);
        const seconds = Math.floor((total / 1000) % 60);

        return { total, days, hours, minutes, seconds };
    }
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    {#each devoirs.slice(0, 6) as devoir}
        <div class="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
            <div class="relative">
                <img src="/fond-devoirs.jpeg" alt="Devoir" class="w-full h-40 object-cover">
            </div>
            <div class="p-4">
                <h2 class="text-lg font-semibold">{devoir.matiere}</h2>
                <div class="flex justify-between items-center mt-2">
                    <p class="text-gray-900 text-md font-bold">Exercice {devoir.id}</p>
                    <span class="text-gray-700 text-sm">
                        {#if getTimeRemaining(devoir.expire_le_timestamp).total > 0}
                            {getTimeRemaining(devoir.expire_le_timestamp).days}j {getTimeRemaining(devoir.expire_le_timestamp).hours}h {getTimeRemaining(devoir.expire_le_timestamp).minutes}m
                        {:else}
                            Expiré
                        {/if}
                    </span>
                </div>
                <div class="flex justify-center items-center mt-4 space-x-4">
                    <button on:click={() => handleVote(devoir.id, 1)} class="p-2">
                        <img src="/verifier.png" alt="Verifier" class="w-8 h-8">
                    </button>
                    <button on:click={() => handleVote(devoir.id, -1)} class="p-2">
                        <img src="/refuser.png" alt="Refuser" class="w-8 h-8">
                    </button>
                </div>
            </div>
        </div>
    {/each}
</div>
