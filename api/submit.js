export default async function handler(req, res) {
  // 1. CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://chbroi.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Préflight OK
  }

  // 2. Lecture du body
  const { prenom, nom, soumission } = req.body || {};

  if (!prenom || !nom || !soumission) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // 3. Appel à l’API GitHub
  const workflowUrl = `https://api.github.com/repos/${process.env.GH_REPO}/actions/workflows/write-participant.yml/dispatches`;

  const payload = {
    ref: "main",
    inputs: {
      prenom,
      nom,
      soumission: String(soumission)
    }
  };

  try {
    const resp = await fetch(workflowUrl, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${process.env.GH_PAT}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error("GitHub dispatch failed:", json);
      return res.status(resp.status).json({ success: false, error: json });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Exception during workflow dispatch:", err);
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
}
