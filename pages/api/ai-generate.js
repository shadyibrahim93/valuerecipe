// pages/api/ai-generate.js
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, recipe } = req.body;

  if (!type || !recipe) {
    return res.status(400).json({ error: 'Missing type or recipe data' });
  }

  // Build ingredient string
  const ingredientList = recipe.ingredients
    ?.map((i) => i.ingredient.replace(/-/g, ' '))
    .join(', ');

  // Build instructions text
  const instructionsText = recipe.instructions
    ?.map((step) => `${step.step}. ${step.text}`)
    .join('\n');

  // NUTRITION
  const nutritionText = recipe.nutrition
    ? JSON.stringify(recipe.nutrition)
    : 'No nutrition provided';

  // 🎯 PROMPT BUILDER
  let userContent = '';

  // 1. Preparation Paragraph
  if (type === 'preparation-paragraph') {
    userContent = `
      Write a detailed but non-boring preparation paragraph for a recipe page.
      Use SEO-friendly language, natural flow, and reference the recipe title,
      ingredients, and nutrition.

      Recipe Title: ${recipe.title}
      Ingredients: ${ingredientList}
      Nutrition: ${nutritionText}

      Keep the tone helpful, warm, clean, and professional.
      Do NOT write lists. Write one cohesive paragraph.
    `;
  }

  // 2. Chef Tips
  if (type === 'chef-tips') {
    userContent = `
      Generate 2–4 short, helpful chef tips for this recipe.
      Make them specific to the recipe, based on ingredients & instructions.
      No fluff. No generic tips.

      Recipe Title: ${recipe.title}
      Ingredients: ${ingredientList}
      Instructions: ${instructionsText}

      Output format:
      - Tip 1
      - Tip 2
      - Tip 3
    `;
  }

  // 3. Total Time
  if (type === 'total-time') {
    userContent = `
      Estimate the cooking times for this recipe based strictly on the ingredients
      and instructions.

      Output EXACTLY in this format:
      "Prep: X minutes • Cook: X minutes • Total: X minutes"

      Recipe Title: ${recipe.title}
      Instructions:
      ${instructionsText}
    `;
  }

  // 4. Tools Needed
  if (type === 'tools-needed') {
    userContent = `
      Generate a clean bullet list of ONLY the tools needed for this recipe.
      Base it on the instructions and ingredients.

      Examples of tools:
      - Large skillet
      - Knife
      - Cutting board
      - Baking sheet
      - Oven
      - Whisk
      - Mixing bowl
      - Saucepan

      Output format: one tool per line, no numbering.

      Recipe Title: ${recipe.title}
      Ingredients: ${ingredientList}
      Instructions:
      ${instructionsText}
    `;
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a cooking assistant that generates content for ValueRecipe.'
        },
        {
          role: 'user',
          content: userContent
        }
      ]
    });

    const generated = response.choices[0].message.content;

    return res.status(200).json({ aiContent: generated });
  } catch (error) {
    console.error('AI Error:', error);
    return res.status(500).json({ error: 'Failed to generate AI content' });
  }
}
