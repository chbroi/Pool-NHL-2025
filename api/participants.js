import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
 // 🔒 Autoriser les requêtes cross-origin (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*'); // ou remplace * par 'https://chbroi.github.io' pour plus de sécurité
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Répondre à la requête préliminaire (OPTIONS)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'participants.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Vérification de la structure
    if (!data || !Array.isArray(data.participants)) {
      return res.status(500).json({ error: "Fichier mal structuré" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erreur serveur :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
