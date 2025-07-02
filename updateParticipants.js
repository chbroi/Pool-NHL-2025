// updateParticipants.js
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const [prenom, nom, soumission, payloadStr] = process.argv.slice(2);
  const payload = JSON.parse(payloadStr);
  const filePath = path.resolve('./docs/data/participants.json');
  const raw = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(raw);

  const idx = data.participants.findIndex(p => p.Prenom === prenom && p.Nom === nom);
  if (idx === -1) {
    data.participants.push({ Prenom: prenom, Nom: nom, soumissions: { [soumission]: payload } });
  } else {
    data.participants[idx].soumissions = data.participants[idx].soumissions || {};
    data.participants[idx].soumissions[soumission] = payload;
  }

  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

main().catch(e => { console.error(e); process.exit(1); });
