<svelte:head>
	<title>Inscription | Agenda MMI</title>
	<meta name="description" content="Créez un compte étudiant ou enseignant sur l'agenda MMI pour accéder à vos devoirs et informations." />
</svelte:head>

<script lang="ts">
    import type { IUtilisateur } from '$lib/interfaces/IUtilisateur';
    import { EGroupeTD, EGroupeTP, EPromotion, ERoleUtilisateur } from '$lib/interfaces/IUtilisateur';

    let nom = '';
    let prenom = '';
    let email = '';
    let mot_de_passe = '';
    let confirmation_mot_de_passe = '';
    let promotion = '';
    let groupeTD = '';
    let groupeTP = '';
    let utilisateur = { role: '' };

    let erreurs = {
        nom: '',
        prenom: '',
        email: '',
        mot_de_passe: '',
        confirmation_mot_de_passe: '',
        promotion: '',
        groupeTD: '',
        groupeTP: ''
    };

    const groupesTD = ['TD AB', 'TD CD', 'TD EF', 'TD GH', 'TD IJ'];
    let groupesTP = [];

    function mettreAJourGroupesTP(td: string) {
        if (td === 'TD AB') groupesTP = ['TP A', 'TP B'];
        else if (td === 'TD CD') groupesTP = ['TP C', 'TP D'];
        else if (td === 'TD EF') groupesTP = ['TP E', 'TP F'];
        else if (td === 'TD GH') groupesTP = ['TP G', 'TP H'];
        else if (td === 'TD IJ') groupesTP = ['TP I', 'TP J'];
        else groupesTP = [];

        if (!groupesTP.includes(groupeTP)) {
            groupeTP = groupesTP[0] || '';
        }
    }

    async function handleSubmit() {
        erreurs = { nom: '', prenom: '', email: '', mot_de_passe: '', confirmation_mot_de_passe: '', promotion: '', groupeTD: '', groupeTP: '' };

        if (nom.length < 3) erreurs.nom = 'Le nom doit contenir au moins 3 caractères.';
        if (prenom.length < 3) erreurs.prenom = 'Le prénom doit contenir au moins 3 caractères.';
        if (!email) erreurs.email = 'L\'e-mail est requis.';
        if (mot_de_passe.length < 8) erreurs.mot_de_passe = 'Le mot de passe doit contenir au moins 8 caractères.';
        if (mot_de_passe !== confirmation_mot_de_passe) {
            erreurs.confirmation_mot_de_passe = 'Les mots de passe ne correspondent pas.';
        }
        if (!promotion) erreurs.promotion = 'La promotion est requise.';
        if (!groupeTD) erreurs.groupeTD = 'Le groupe TD est requis.';
        if (!groupeTP) erreurs.groupeTP = 'Le groupe TP est requis.';

        if (Object.values(erreurs).some((err) => err !== '')) return;

        try {
            const FORMULAIRE: IUtilisateur = { nom, prenom, email, mot_de_passe, promotion, groupeTD, groupeTP };
            const REPONSE = await fetch('/api/inscription', {
                method: 'POST',
                body: JSON.stringify(FORMULAIRE)
            });

            if (REPONSE.status === 409) {
                erreurs.email = 'Un utilisateur avec cet e-mail existe déjà.';
            } else if (REPONSE.status !== 200) {
                erreurs.nom = 'Erreur inconnue lors de l\'inscription.';
            } else {
                window.location.href = '/connexion';
            }
        } catch (e) {
            erreurs.nom = 'Erreur réseau. Veuillez réessayer.';
        }
    }
</script>

<style>
    .relative input,
    .relative select {
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
    .relative input:not(:placeholder-shown) + label,
    .relative select:focus + label,
    .relative select:not([value=""]) + label {
        top: -0.5rem; /* Position plus haute */
        left: 0.75rem; /* Ajustement horizontal */
        font-size: 0.875rem; /* Réduction de la taille */
        color: #4b3b7c; /* Couleur violette */
        background-color: white; /* Fond blanc pour éviter le chevauchement */
        padding: 0 0.25rem; /* Ajout de padding pour le fond blanc */
    }

    .form-container {
        padding: 2rem; /* Espacement interne pour le formulaire */
        background-color: #ffffff; /* Fond blanc pour le formulaire */
        border-radius: 0.5rem; /* Coins arrondis */
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Ombre légère */
    }

    .btn-primary {
        background-color: #4b3b7c; /* Couleur violette pour le bouton */
        color: white;
        transition: background-color 0.2s ease-in-out;
    }

    .btn-primary:hover {
        background-color: #3a2e63; /* Couleur plus foncée au survol */
    }

    /* Animation fluide pour l'apparition et la disparition */
    @keyframes smooth-slide-up-and-fade {
        0% {
            opacity: 0;
            transform: translate(-50%, 30px); /* Décalage initial */
        }
        15% {
            opacity: 1;
            transform: translate(-50%, 0); /* Centré */
        }
        85% {
            opacity: 1;
            transform: translate(-50%, 0); /* Maintien */
        }
        100% {
            opacity: 0;
            transform: translate(-50%, 30px); /* Disparition */
        }
    }
</style>

<div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md form-container">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">S'inscrire</h1>
        <form class="space-y-6" onsubmit={handleSubmit}>
            <div class="grid grid-cols-2 gap-4">
                <div class="relative">
                    <input
                        type="text"
                        id="nom"
                        bind:value={nom}
                        required
                        class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
                        placeholder=" "
                    />
                    <label for="nom">Nom</label>
                    {#if erreurs.nom}
                        <p class="text-red-500 text-sm mt-1 font-medium">{erreurs.nom}</p>
                    {/if}
                </div>

                <div class="relative">
                    <input
                        type="text"
                        id="prenom"
                        bind:value={prenom}
                        required
                        class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
                        placeholder=" "
                    />
                    <label for="prenom">Prénom</label>
                    {#if erreurs.prenom}
                        <p class="text-red-500 text-sm mt-1 font-medium">{erreurs.prenom}</p>
                    {/if}
                </div>
            </div>

            <div class="relative">
                <input
                    type="email"
                    id="email"
                    bind:value={email}
                    required
                    class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
                    placeholder=" "
                />
                <label for="email">E-mail</label>
                {#if erreurs.email}
                    <p class="text-red-500 text-sm mt-1 font-medium">{erreurs.email}</p>
                {/if}
            </div>

            <div class="relative">
                <input
                    type="password"
                    id="mot_de_passe"
                    bind:value={mot_de_passe}
                    required
                    class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
                    placeholder=" "
                />
                <label for="mot_de_passe">Mot de passe</label>
                {#if erreurs.mot_de_passe}
                    <p class="text-red-500 text-sm mt-1 font-medium">{erreurs.mot_de_passe}</p>
                {/if}
            </div>

            <div class="relative">
                <input
                    type="password"
                    id="confirmation_mot_de_passe"
                    bind:value={confirmation_mot_de_passe}
                    required
                    class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
                    placeholder=" "
                />
                <label for="confirmation_mot_de_passe">Confirmez le mot de passe</label>
                {#if erreurs.confirmation_mot_de_passe}
                    <p class="text-red-500 text-sm mt-1 font-medium">{erreurs.confirmation_mot_de_passe}</p>
                {/if}
            </div>

            <div class="relative">
                <select
                    id="promotion"
                    bind:value={promotion}
                    required
                    class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
                >
                    <option value="" disabled>Choisir une promotion</option>
                    {#each Object.values(EPromotion) as promo}
                        <option value={promo}>{promo}</option>
                    {/each}
                </select>
                <label for="promotion">Promotion</label>
                {#if erreurs.promotion}
                    <p class="text-red-500 text-sm mt-1 font-medium">{erreurs.promotion}</p>
                {/if}
            </div>

            <div class="grid grid-cols-2 gap-6">
                <div class="relative">
                    <select
                        id="groupeTD"
                        bind:value={groupeTD}
                        onchange={() => mettreAJourGroupesTP(groupeTD)}
                        required
                        class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
                    >
                        <option value="" disabled selected>Choisir un TD</option>
                        {#each groupesTD as td}
                            <option value={td}>{td}</option>
                        {/each}
                    </select>
                    <label for="groupeTD">Groupe TD</label>
                    {#if erreurs.groupeTD}
                        <p class="text-red-500 text-sm mt-1 font-medium">{erreurs.groupeTD}</p>
                    {/if}
                </div>
                <div class="relative">
                    <select
                        id="groupeTP"
                        bind:value={groupeTP}
                        required
                        class="peer w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 placeholder-transparent"
                    >
                        <option value="" disabled selected>Choisir un TP</option>
                        {#each groupesTP as tp}
                            <option value={tp}>{tp}</option>
                        {/each}
                    </select>
                    <label for="groupeTP">Groupe TP</label>
                    {#if erreurs.groupeTP}
                        <p class="text-red-500 text-sm mt-1 font-medium">{erreurs.groupeTP}</p>
                    {/if}
                </div>
            </div>

            <div class="flex items-center justify-between pt-4">
                <a href="/connexion" class="text-sm text-gray-600 hover:text-[#4B3B7C] hover:underline transition-colors duration-200">
                    Vous avez déjà un compte ?
                </a>
                <button
                    type="submit"
                    class="px-6 py-2 rounded-md font-semibold btn-primary"
                >
                    S'inscrire
                </button>
            </div>
        </form>
    </div>
</div>
