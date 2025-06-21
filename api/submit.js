export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { prenom, nom, soumission } = req.body;
  if (!prenom || !nom || !soumission) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  const token = process.env.GH_PAT;
  const owner = "chbroi";
  const repo = "Pool-NHL-2025";
  const workflow_id = "Write New Participant.yml"; // le nom du fichier workflow

  const body = {
    ref: "main",
    inputs: { prenom, nom, soumission }
  };

  const resp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify(body)
    }
  );

  if (resp.status === 204) {
    return res.status(200).json({ success: true });
  } else {
    const err = await resp.json().catch(() => ({}));
    return res.status(resp.status).json({ error: err });
  }
}
