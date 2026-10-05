const MODELES = [
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages } = req.body;

  const contents = messages
    .filter(m => !m.content.startsWith("Erreur"))
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

  const corps = JSON.stringify({
    systemInstruction: {
      parts: [{ text: `Tu es l'assistant du Salon Beauté Douala. Réponds court, poli, en français.
Infos : ouvert du lundi au samedi, 8h à 19h. Adresse : Akwa, Douala.
Tresses : 5000 FCFA. Coupe homme : 1500 FCFA. Soins du visage : 8000 FCFA.
Si tu ne sais pas, dis de téléphoner au 6XX XX XX XX.` }]
    },
    contents
  });

  let derniereErreur = "réponse vide";
  for (let tour = 0; tour < 2; tour++) {
    for (const modele of MODELES) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modele}:generateContent`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-goog-api-key": process.env.CLE_API
            },
            body: corps
          }
        );
        const data = await r.json();
        const texte = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (texte) return res.status(200).json({ reponse: texte });
        derniereErreur = data.error?.message || "réponse vide";
      } catch (e) {
        derniereErreur = "connexion impossible";
      }
    }
    await new Promise(ok => setTimeout(ok, 1500));
  }
  res.status(200).json({ reponse: "Erreur : " + derniereErreur });
}
