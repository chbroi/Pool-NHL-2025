import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const {
    prenom,
    nom,
    soumission, // ex: 1, 2, etc.
    ...payload // toutes les prédictions (filtrées côté client)
  } = req.body;

  if (!prenom || !nom || !soumission) {
    return res.status(400).json({ message: 'Champs manquants' });
  }

  const filePath = path.resolve('./docs/data/participants.json');

  try {
    const file = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(file);

    const nomClean = nom.trim().toLowerCase();
    const prenomClean = prenom.trim().toLowerCase();
    const soumissionKey = String(soumission);

    const participantIndex = data.participants.findIndex(
      p =>
        p.Nom?.trim().toLowerCase() === nomClean &&
        p.Prenom?.trim().toLowerCase() === prenomClean
    );

    if (participantIndex !== -1) {
      // Participant existe, mise à jour ou ajout de la soumission
      data.participants[participantIndex].soumissions[soumissionKey] = payload;
    } else {
      // Nouveau participant
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
    console.error('Erreur:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
