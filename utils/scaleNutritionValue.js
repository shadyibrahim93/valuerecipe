// 🧮 Helper: scale nutrition values
export default function scaleNutritionValue(value, factor) {
  if (!value || factor === 1) return value;

  const v = String(value).trim();
  const match = v.match(/^(\d+(\.\d+)?)(.*)$/);
  if (!match) return value;

  const numPart = parseFloat(match[1]);
  const unitPart = match[3].trim();
  const scaled = numPart * factor;

  return `${scaled}${unitPart}`;
}
