import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { prenom, nom, soumission, payload } = req.body;
  if (!prenom || !nom || !soumission || !payload) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/actions/workflows/update-participants.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${process.env.GH_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: { prenom, nom, soumission: String(soumission), payload }
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('GitHub dispatch error:', err);
      return res.status(response.status).json({ error: err });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Submit API error:', e);
    return res.status(500).json({ error: e.message });
  }
}
