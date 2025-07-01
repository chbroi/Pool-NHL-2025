// api/submit.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prenom, nom, soumission } = req.body;
    if (!prenom || !nom || !soumission) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const response = await fetch(`https://api.github.com/repos/${process.env.GH_REPO}/actions/workflows/write-participant.yml/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${process.env.GH_PAT}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: { prenom, nom, soumission: String(soumission) }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("GitHub API error:", error);
      return res.status(response.status).json({ error });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: e.toString() });
  }
}
