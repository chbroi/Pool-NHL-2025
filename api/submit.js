export default async function handler(req, res) {
  // Autoriser CORS (GitHub Pages)
  res.setHeader("Access-Control-Allow-Origin", "https://chbroi.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Si c'est une requête de pré-vol (preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const data = req.body;

  // Validation de base
  if (!data.Nom || !data.Prenom || !data.Soumission) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const githubToken = process.env.GITHUB_TOKEN; // Configuré sur Vercel
  const owner = "chbroi";
  const repo = "Pool-NHL-2025";
  const workflow_id = "write-new-participant.yml"; // nom exact du fichier
  const ref = "main";

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref,
        inputs: {
          prenom: data.Prenom,
          nom: data.Nom,
          soumission: data.Soumission.toString(),
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    return res.status(200).json({ success: true, message: "Données envoyées à GitHub Actions" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
