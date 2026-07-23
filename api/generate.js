/// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ingredients, goal, notes } = req.body || {};

  if (!ingredients || typeof ingredients !== 'string') {
    return res.status(400).json({ error: 'Ingredients are required' });
  }

  const SYSTEM_PROMPT = `You are Fridge2Fit's meal assistant. You help people figure out what to cook using ingredients they already have at home, while keeping their fitness goal in mind.

Rules:
- Suggest ONE realistic meal using mainly the listed ingredients plus basic staples (salt, oil, water, spices).
- Lean toward Pakistani/South Asian home cooking when it fits.
- Adjust to the goal: "bulk" = higher calories/protein, "cut" = lower calories/high protein/minimal oil, "maintain" = balanced.
- Respect diet notes given.
- Give realistic estimated macros.
- Keep instructions short (5-8 steps).
- Respond ONLY with valid minified JSON, no markdown, no extra text, in exactly this shape:
{"mealName": string, "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientsUsed": string[], "instructions": string, "goalNote": string}`;

  const userPrompt = `Ingredients available: ${ingredients}
Fitness goal: ${goal || 'maintain'}
Diet notes: ${notes || 'none'}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'poolside/laguna-m.1:free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      return res.status(200).json({ error: `OpenRouter error (${response.status}): ${raw}` });
    }

    const data = JSON.parse(raw);
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    const cleaned = content.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return res.status(200).json({ error: `Could not parse AI response: ${content}` });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(200).json({ error: `Server error: ${err.message}` });
  }
}
