import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	try {
		const response = await resolve(event);
		return response;
	} catch (error) {
		console.error('Erreur serveur:', error);
		return new Response(JSON.stringify({ message: 'Erreur interne du serveur.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
