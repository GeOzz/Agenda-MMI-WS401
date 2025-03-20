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
        promotion: '',
        avatar: ''
    });

    let groupesTD = Object.values(EGroupeTD);
    let groupesTP = Object.values(EGroupeTP);

    onMount(() => {
        if (STORE.utilisateur) {
            utilisateur = { ...STORE.utilisateur };
        }
    });

    async function handleSave() {
        try {
            const response = await fetch('/api/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(utilisateur)
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

    function handleAvatarChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                utilisateur.avatar = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
</script>

<style>
    .diagonal-stripes {
        background: repeating-linear-gradient(
            45deg,
            #e0e0e0,
            #e0e0e0 10px,
            #f5f5f5 10px,
            #f5f5f5 20px
        );
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

<div class="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
    <h1 class="text-3xl font-bold mb-6">Détails du Profil</h1>
    <p class="text-gray-600 mb-6">Gérez les détails de votre compte qui représentent comment les autres utilisateurs vous voient, en plus d'autres détails utilisés pour la communication et la personnalisation du système.</p>
    <div class="space-y-4">
        <div class="flex space-x-4">
            <div class="flex-1 relative">
                <label class="block text-gray-700 font-bold">Nom</label>
                <div class="relative">
                    <input type="text" value={utilisateur.nom} class="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-default" readonly />
                    <div class="absolute inset-0 diagonal-stripes pointer-events-none"></div>
                </div>
            </div>
            <div class="flex-1 relative">
                <label class="block text-gray-700 font-bold">Prénom</label>
                <div class="relative">
                    <input type="text" value={utilisateur.prenom} class="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-default" readonly />
                    <div class="absolute inset-0 diagonal-stripes pointer-events-none"></div>
                </div>
            </div>
        </div>
        <hr class="my-4 border-gray-300" />
        <div>
            <label class="block text-gray-700 font-bold">Promotion</label>
            <select bind:value={utilisateur.promotion} class="w-full p-2 border border-gray-300 rounded">
                {#each Object.values(EPromotion) as promotion}
                    <option value={promotion}>{promotion}</option>
                {/each}
            </select>
        </div>
        <hr class="my-4 border-gray-300" />
        <div class="flex space-x-4">
            <div class="flex-1">
                <label class="block text-gray-700 font-bold">Groupe TD</label>
                <select bind:value={utilisateur.groupeTD} class="w-full p-2 border border-gray-300 rounded">
                    {#each groupesTD as groupe}
                        <option value={groupe}>{groupe}</option>
                    {/each}
                </select>
            </div>
            <div class="flex-1">
                <label class="block text-gray-700 font-bold">Groupe TP</label>
                <select bind:value={utilisateur.groupeTP} class="w-full p-2 border border-gray-300 rounded">
                    {#each groupesTP as groupe}
                        <option value={groupe}>{groupe}</option>
                    {/each}
                </select>
            </div>
        </div>
        <hr class="my-4 border-gray-300" />
        <div class="relative">
            <label class="block text-gray-700 font-bold">E-mail</label>
            <div class="relative">
                <input type="email" value={utilisateur.email} class="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-default" readonly />
                <div class="absolute inset-0 diagonal-stripes pointer-events-none"></div>
            </div>
            <p class="text-gray-500 text-sm mt-1">Ce courriel sera utilisé pour les notifications, et en fonction de l'authentification active du système, l'accès au système.</p>
        </div>
        <hr class="my-4 border-gray-300" />
        <div class="flex items-start space-x-4">
            <div class="flex-1">
                <label class="block text-gray-700 font-bold">Avatar de l'utilisateur</label>
                <p class="text-gray-600 mb-4">Sélectionnez une image qui sera utilisée pour vous représenter aux autres utilisateurs. Idéalement, cette image devrait être carrée et d'environ 256 pixels de largeur et de hauteur.</p>
            </div>
            <div class="flex flex-col items-center">
                <div class="border border-black rounded-lg p-2">
                    <img src={utilisateur.avatar || '/default-avatar.png'} alt="Avatar" class="w-24 h-24 rounded-full object-cover" />
                </div>
                <input type="file" accept="image/*" on:change={handleAvatarChange} class="mt-2 p-2 border border-gray-300 rounded" />
                <button class="mt-2 text-gray-600">Réinitialiser</button>
            </div>
        </div>
        <hr class="my-4 border-gray-300" />
        <div class="flex justify-end space-x-4">
            <button class="px-4 py-2 bg-[#F7B000] text-[#3B2A5B] rounded">Supprimer le compte</button>
            <button on:click={handleSave} class="px-4 py-2 bg-[#CAC3D6] text-[#3B2A5B] rounded">Enregistrer</button>
        </div>
    </div>
</div>
