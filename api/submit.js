import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  // CORS headers pour autoriser GitHub Pages
  res.setHeader("Access-Control-Allow-Origin", "https://chbroi.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Répondre immédiatement à une requête OPTIONS (pré-vol)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const {
      prenom,
      nom,
      soumission, // ex: 1, 2, etc.
      ...payload
    } = req.body;

    const filePath = path.join(process.cwd(), 'public', 'data', 'participants.json');
    const file = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(file);

    const soumissionKey = String(soumission);
    const participantIndex = data.participants.findIndex(
      p => p.Prenom === prenom && p.Nom === nom
    );

    if (participantIndex !== -1) {
      data.participants[participantIndex].soumissions[soumissionKey] = payload;
    } else {
      data.participants.push({
        Prenom: prenom,
        Nom: nom,
        soumissions: {
          [soumissionKey]: payload
        }
      });
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return res.status(200).json({ success: true });
  } catch (err) {
  console.error("Erreur API submit :", err);  // 👈 très important pour voir l'erreur complète dans les logs Vercel
  return res.status(500).json({ error: "Erreur serveur", details: err.message });
}
 
}
