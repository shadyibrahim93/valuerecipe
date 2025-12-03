export default function recordServingChoice(serving) {
  let counts = JSON.parse(localStorage.getItem('vr-serving-counts') || '{}');

  counts[serving] = (counts[serving] || 0) + 1;

  localStorage.setItem('vr-serving-counts', JSON.stringify(counts));

  // Set default after being chosen 2 times
  if (counts[serving] >= 2) {
    localStorage.setItem('vr-default-servings', serving);
  }
}
