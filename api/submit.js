export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { Prenom, Nom, soumission, ...predictions } = req.body;
  if (!Prenom || !Nom || !soumission) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const workflowUrl = `https://api.github.com/repos/YOUR_GITHUB_USERNAME/Pool-NHL-2025/actions/workflows/write-participant.yml/dispatches`;

  const payload = {
    ref: 'main',
    inputs: {
      prenom: Prenom,
      nom: Nom,
      soumission: String(soumission),
      payload: JSON.stringify(predictions)
    }
  };

  const ghToken = process.env.GH_PAT;

  const ghResp = await fetch(workflowUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (ghResp.ok) {
    return res.status(200).json({ success: true });
  } else {
    const error = await ghResp.json();
    console.error(error);
    return res.status(500).json({ success: false, error });
  }
}
