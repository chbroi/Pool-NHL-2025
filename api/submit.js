import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.setHeader('Allow', ['POST']).status(405).json({ message: 'Method not allowed' });
  }

  const body = req.body;

  const prenom = body.prenom;
  const nom = body.nom;
  const soumission = parseInt(body.soumission, 10);

  if (!prenom || !nom || !soumission) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Les données de prédictions (tout le reste sauf prénom, nom, soumission)
  const predictionData = { numero: soumission, ...body };
  delete predictionData.prenom;
  delete predictionData.nom;
  delete predictionData.soumission;

  const filePath = path.join(process.cwd(), 'docs', 'data', 'participants.json');
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let participant = jsonData.participants.find(
    (p) => p.nom === nom && p.prenom === prenom
  );

  if (!participant) {
    participant = { nom, prenom, soumissions: [predictionData] };
    jsonData.participants.push(participant);
  } else {
    // Vérifie si cette soumission existe déjà
    const existing = participant.soumissions.find((s) => s.numero === soumission);
    if (existing) {
      return res.status(409).json({ message: 'Soumission déjà existante pour ce participant.' });
    }
    participant.soumissions.push(predictionData);
  }

  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
  return res.status(200).json({ success: true });
}
