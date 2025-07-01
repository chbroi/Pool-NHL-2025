import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const filePath = path.resolve('./public/data/participants.json'); // ← important : utiliser /public
    const file = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(file);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Erreur lecture participants.json :", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
