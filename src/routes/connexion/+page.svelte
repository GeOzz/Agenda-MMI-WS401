<script lang="ts">
    import Login from '$lib/components/Login.svelte';
    import type { IUtilisateur } from '$lib/interfaces/IUtilisateur';

    let email = '';
    let mot_de_passe = '';
    let erreurEmail = '';
    let erreurMotDePasse = '';

    async function handleSubmit() {
        try {
            const FORMULAIRE = { email, mot_de_passe };
            const REPONSE = await fetch('/api/connexion', {
                method: 'POST',
                body: JSON.stringify(FORMULAIRE)
            });
            const BODY = await REPONSE.text();
            if (REPONSE.status === 404) {
                erreurEmail = 'Utilisateur inexistant.';
                erreurMotDePasse = '';
            } else if (REPONSE.status === 401) {
                erreurMotDePasse = 'Mot de passe incorrect.';
                erreurEmail = '';
            } else if (REPONSE.status !== 200) {
                erreurEmail = 'Erreur inconnue.';
                erreurMotDePasse = '';
            } else {
                erreurEmail = '';
                erreurMotDePasse = '';
                window.location.href = '/';
            }
        } catch (erreur) {
            erreurEmail = 'Erreur réseau.';
            erreurMotDePasse = '';
        }
    }
</script>

<style>
    /* Ajustement des styles pour les labels flottants */
    .relative input {
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
    .relative input:not(:placeholder-shown) + label {
        top: -0.5rem; /* Position plus haute */
        left: 0.75rem; /* Ajustement horizontal */
        font-size: 0.875rem; /* Réduction de la taille */
        color: #4b3b7c; /* Couleur violette */
        background-color: white; /* Fond blanc pour éviter le chevauchement */
        padding: 0 0.25rem; /* Ajout de padding pour le fond blanc */
    }

    .form-container {
        margin-top: -10rem; /* Remonte le bloc en réduisant la marge supérieure */
    }

    .btn-primary {
        background-color: #4b3b7c; /* Couleur violette pour le bouton */
        color: white;
        transition: background-color 0.2s ease-in-out;
    }

    .btn-primary:hover {
        background-color: #3a2e63; /* Couleur plus foncée au survol */
    }
</style>

<div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md form-container">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Se Connecter</h1>
        <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
            <div class="relative">
                <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    on:input={(e) => email = e.target.value}
                    class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
                    placeholder=" "
                />
                <label for="email">E-mail</label>
                {#if erreurEmail}
                    <p class="text-red-500 text-sm mt-1 font-medium">{erreurEmail}</p>
                {/if}
            </div>

            <div class="relative">
                <input
                    type="password"
                    id="mot_de_passe"
                    required
                    value={mot_de_passe}
                    on:input={(e) => mot_de_passe = e.target.value}
                    class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
                    placeholder=" "
                />
                <label for="mot_de_passe">Mot de passe</label>
                {#if erreurMotDePasse}
                    <p class="text-red-500 text-sm mt-1 font-medium">{erreurMotDePasse}</p>
                {/if}
            </div>

            <div class="flex items-center justify-between pt-4">
                <a href="/inscription" class="text-sm text-gray-600">Vous n'avez pas de compte ?</a>
                <button
                    type="submit"
                    class="px-6 py-2 rounded-md font-semibold btn-primary"
                >
                    Se connecter
                </button>
            </div>
        </form>
    </div>
</div>
