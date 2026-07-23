// api/generate.js
// Vercel serverless function — the AI-powered feature of Fridge2Fit.
// Calls an LLM via OpenRouter with a custom system prompt that turns
// "what's in my fridge + my fitness goal" into a concrete Pakistani-style
// meal suggestion with estimated macros.

const SYSTEM_PROMPT = `You are Fridge2Fit's meal assistant. You help people figure out what to cook RIGHT NOW using only ingredients they already have at home, while keeping their fitness goal in mind.

Rules:
- Suggest ONE realistic meal that can be made mainly from the ingredients the user listed. You may assume basic staples are available (salt, oil, water, common spices) even if not listed, but do NOT assume expensive or unlisted proteins/vegetables.
- Lean toward Pakistani/South Asian home cooking style (karahi, daal, sabzi, roti, rice dishes) when it fits the ingredients, but don't force it if it doesn't make sense.
- Adjust the suggestion to the stated goal:
  - "bulk": higher calories and protein, more carbs/fat allowed
  - "cut": lower calories, high protein, minimal oil/added fat
  - "maintain": balanced macros
- Respect any diet notes provided (e.g. no beef, low oil, quick to cook, vegetarian).
- Give realistic, honest estimated macros for the portion described — do not wildly exaggerate protein content.
- Keep instructions short and practical (5-8 steps max), assuming basic home kitchen equipment.
- Respond ONLY with valid minified JSON, no markdown, no code fences, no extra text. Use exactly this shape:
{"mealName": string, "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientsUsed": string[], "instructions": string, "goalNote": string}
- "goalNote" should be 1-2 sentences explaining why this meal fits the stated goal.
- If the listed ingredients genuinely can't make a sensible meal, still do your best to suggest the closest reasonable option and mention any key gap inside "goalNote".`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ingredients, goal, notes } = req.body || {};

  if (!ingredients || typeof ingredients !== 'string') {
    return res.status(400).json({ error: 'Ingredients are required' });
  }

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
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', errText);
      return res.status(502).json({ error: 'AI provider error' });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON parse failed, raw content:', raw);
      return res.status(502).json({ error: 'AI returned unexpected format' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
