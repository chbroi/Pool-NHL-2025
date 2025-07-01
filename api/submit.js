// api/submit.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.setHeader('Allow', ['POST']).status(405).json({ message: 'Method not allowed' });
  }

  const { prenom, nom, soumission } = req.body;
  if (!prenom || !nom || !soumission) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const workflowUrl = `https://api.github.com/repos/${process.env.GH_REPO}/actions/workflows/write-participant.yml/dispatches`;

  const payload = {
    ref: 'main',
    inputs: { prenom, nom, soumission: String(soumission) }
  };

  const resp = await fetch(workflowUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${process.env.GH_PAT}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (resp.ok) {
    return res.status(200).json({ success: true });
  } else {
    const error = await resp.json().catch(() => ({}));
    console.error('Workflow dispatch failed:', error);
    return res.status(resp.status).json({ success: false, error });
  }
}
