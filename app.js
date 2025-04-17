const express = require('express');
const app = express();
const utilisateurRoutes = require('./routes/utilisateur');

app.use(express.json()); // Middleware pour parser le JSON
app.use('/api/utilisateur', utilisateurRoutes);

// Middleware pour gérer les erreurs 405
app.use((req, res) => {
	res.status(405).json({ message: 'Méthode non autorisée.' });
});

// Middleware global pour gérer les erreurs
app.use((err, req, res, next) => {
	console.error('Erreur serveur:', err);
	res.status(500).json({ message: 'Erreur interne du serveur.' });
});

module.exports = app;
