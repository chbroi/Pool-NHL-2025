const JSONBIN_ID = "6856f95e8a456b7966b2cacd";
const JSONBIN_SECRET = "$2a$10$iFqawtXVcI6pZB2aSOGqIeX/GWLEYnWV4Brl.iTCXTi2k9gsU/KBO";
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;

async function loadPredictions() {
  const res = await fetch(JSONBIN_URL + "/latest", {
    headers: { "X-Master-Key": JSONBIN_SECRET }
  });
  const json = await res.json();
  return json.record || [];
}

async function savePredictions(newEntry) {
  const current = await loadPredictions();
  const updated = [...current, newEntry];
  await fetch(JSONBIN_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_SECRET
    },
    body: JSON.stringify(updated)
  });
}
