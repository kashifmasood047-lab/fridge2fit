# 🍲 Fridge2Fit

**Cook what you have. Hit your goal.**

## The Problem

Every day, people (especially students) stare into their fridge with random leftover ingredients and no idea what to cook — while also trying to hit a fitness goal (bulking, cutting, or maintaining). Recipe apps assume you'll shop for ingredients you don't have, and calorie apps don't help you decide what to actually cook tonight. Fridge2Fit solves both problems at once: tell it what's in your kitchen and your goal, and it gives you one realistic, goal-matched meal you can cook right now — with a Pakistani home-cooking lean, since that's the food most of my meals are actually built around.

**Built for:** anyone (students, home cooks, gym-goers) who wants a quick answer to "what do I cook with this, and does it fit my goal?"

## Live App

🔗 **[LIVE_URL_HERE]** — replace with your Vercel deployment URL

## Features

- Enter available ingredients in plain language
- Pick a fitness goal: Bulk / Cut / Maintain
- Optional diet notes (e.g. "no beef", "low oil", "quick to cook")
- AI generates one concrete meal suggestion: name, estimated macros (calories/protein/carbs/fat), ingredients used, step-by-step instructions, and why it fits your goal
- Session history of previously generated meals
- Mobile-first design, installable to your home screen like an app (PWA manifest)

## The AI Feature

The core AI feature is the **meal generator** (`/api/generate.js`), a serverless function that calls an LLM (via OpenRouter) with a custom system prompt written specifically for this app. It:

- Constrains the AI to only use ingredients the user actually has (plus basic staples)
- Adjusts calorie/macro targets based on the selected fitness goal
- Leans toward Pakistani/South Asian home cooking when it fits
- Forces a strict JSON output format so the frontend can render it reliably

**Full system prompt** (from `api/generate.js`):

```
You are Fridge2Fit's meal assistant. You help people figure out what to cook RIGHT NOW using only ingredients they already have at home, while keeping their fitness goal in mind.

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
- If the listed ingredients genuinely can't make a sensible meal, still do your best to suggest the closest reasonable option and mention any key gap inside "goalNote".
```

## Tools, Services & Models Used

- **Frontend:** Vanilla HTML/CSS/JavaScript, mobile-first responsive design, PWA manifest
- **Backend:** Node.js serverless function (Vercel Functions)
- **AI Model:** [FILL IN — e.g. Llama 3.1 8B Instruct via OpenRouter (free tier)]
- **Hosting/Deployment:** Vercel
- **Version Control:** GitHub

## Screenshots

> Replace these with real screenshots of your deployed app (minimum 3).

| Home Screen | Result Screen | History |
|---|---|---|
| ![home](screenshots/home.png) | ![result](screenshots/result.png) | ![history](screenshots/history.png) |

## How to Run Locally

1. Clone the repo:
   ```
   git clone https://github.com/YOUR_USERNAME/fridge2fit.git
   cd fridge2fit
   ```
2. Copy `.env.example` to `.env` and add your own OpenRouter API key:
   ```
   cp .env.example .env
   ```
3. Install the Vercel CLI (if not already installed):
   ```
   npm i -g vercel
   ```
4. Run locally:
   ```
   vercel dev
   ```
5. Open `http://localhost:3000` in your browser (or on your phone via your local network IP).

## Deployment

Deployed on Vercel directly from this GitHub repo. Environment variable `OPENROUTER_API_KEY` (and optionally `OPENROUTER_MODEL`) is set in the Vercel project's Environment Variables settings.
