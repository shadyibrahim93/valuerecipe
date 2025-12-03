export default function formatFraction(value) {
  // 1. Safety check
  if (value === null || value === undefined || value === '') return '';

  // 2. Normalize input to a number
  let num = Number(value);
  if (Number.isNaN(num)) return '';

  // 3. Check for Floating Point Whole Numbers (e.g. 0.99999 or 4.00001)
  if (Math.abs(num - Math.round(num)) < 0.001) {
    return String(Math.round(num));
  }

  // 4. Split Integer and Decimal parts
  const whole = Math.floor(num);
  const remainder = num - whole;

  // 5. Find best fraction match
  const denominators = [2, 3, 4, 6, 8, 10, 12, 16];
  let best = { n: 0, d: 1, error: Infinity };

  for (const d of denominators) {
    const n = Math.round(remainder * d);
    const error = Math.abs(remainder - n / d);

    // Prioritize smaller denominators if error is roughly same
    if (error < best.error - 0.0001) {
      best = { n, d, error };
    }
  }

  // 6. Simplify Fraction (GCD)
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const common = gcd(best.n, best.d);
  let n = best.n / common;
  let d = best.d / common;

  // 7. Edge Case: If rounding made it a whole number (e.g. 4/4)
  if (n === d) {
    return String(whole + 1);
  }
  if (n === 0) {
    return String(whole);
  }

  // 8. Format Output
  if (whole > 0) {
    return `${whole} ${n}/${d}`;
  }
  return `${n}/${d}`;
}
