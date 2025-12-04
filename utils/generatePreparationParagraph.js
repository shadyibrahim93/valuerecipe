// components/RecipePage/utils/generatePreparationParagraph.js
import { BRAND_NAME } from '../lib/constants';

export default function generatePreparationParagraph(recipe) {
  const title = recipe.title;

  // Format ingredient names
  const ingredientList = recipe.ingredients
    .map((i) => i.ingredient.replace(/-/g, ' '))
    .map((name) => name.replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(', ');

  // Build nutrition highlight string dynamically
  const nutrition = recipe.nutrition || {};
  const nutritionParts = [];

  if (nutrition.calories) nutritionParts.push(`${nutrition.calories} Calories`);
  if (nutrition.protein) nutritionParts.push(`${nutrition.protein} Protein`);
  if (nutrition.carbs) nutritionParts.push(`${nutrition.carbs} Carbs`);
  if (nutrition.fat) nutritionParts.push(`${nutrition.fat} Fat`);
  if (nutrition.fiber) nutritionParts.push(`${nutrition.fiber} Fiber`);
  if (nutrition.sugar) nutritionParts.push(`${nutrition.sugar} Sugar`);

  let nutritionHighlight = 'solid nutritional value';

  if (nutritionParts.length === 1) {
    nutritionHighlight = nutritionParts[0];
  } else if (nutritionParts.length > 1) {
    const last = nutritionParts.pop();
    nutritionHighlight = `${nutritionParts.join(', ')} and ${last}`;
  }

  return `
    Before you start making your ${title}, make sure to select the number of
    servings you plan to cook. This is important because all ingredient
    measurements on ${BRAND_NAME} automatically adjust to match your serving size,
    helping you stay accurate and avoid mistakes as you cook.

    Once your servings are set, gather all your ingredients. This recipe uses
    high-value essentials like ${ingredientList}, each contributing to the flavor,
    texture, and reliability this dish is known for. Having everything prepped
    ahead of time makes the cooking process smoother and prevents last-minute
    surprises.

    For the best results, take a moment to skim through the steps, measure
    everything carefully, and keep ingredients at the right temperature. This
    recipe was designed to be beginner-friendly while still satisfying for
    experienced home cooks. It also offers balanced nutrition, with
    ${nutritionHighlight} per serving, making it a great choice for anyone who
    wants a flavorful and cost-efficient homemade meal.
  `;
}
