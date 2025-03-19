export const STORE = $state({
	connected: false,
	utilisateur: null
});

export async function checkConnected() {
	try {
		const RESPONSE = await fetch('/api/mon-compte');
		if (RESPONSE.status !== 200) {
			STORE.connected = false;
			return;
		}
		const DATA = await RESPONSE.json();
		STORE.connected = true;
		STORE.utilisateur = DATA;
	} catch (error) {
		STORE.connected = false;
	}
}

export async function deconnexion() {
	await fetch('/api/deconnexion', {
		method: 'GET'
	});
	STORE.connected = false;
	STORE.utilisateur = null;
	window.location.href = '/connexion';
}

export function redirectToConnexion() {
	window.location.href = '/connexion';
}
