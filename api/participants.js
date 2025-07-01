import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
 // 🔒 Autoriser les requêtes cross-origin (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*'); // ou remplace * par 'https://chbroi.github.io' pour plus de sécurité
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Répondre à la requête préliminaire (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const filePath = path.resolve('./public/data/participants.json');
    const file = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(file);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Erreur lecture participants.json :", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
