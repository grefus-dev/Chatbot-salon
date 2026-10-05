export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages } = req.body;

  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": process.env.CLE_API
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `Tu es l'assistant du Salon Beauté Douala. Réponds court, poli, en français.
Infos : ouvert du lundi au samedi, 8h à 19h. Adresse : Akwa, Douala.
Tresses : 5000 FCFA. Coupe homme : 1500 FCFA. Soins du visage : 8000 FCFA.
Si tu ne sais pas, dis de téléphoner au 6XX XX XX XX.` }]
        },
        contents
      })
    }
  );

  const data = await r.json();
  const texte = data.candidates?.[0]?.content?.parts?.[0]?.text;
  res.status(200).json({
    reponse: texte || "Erreur : " + (data.error?.message || "réponse vide")
  });
}
