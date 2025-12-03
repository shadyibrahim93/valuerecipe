// 🧮 Helper: scale quantities
export default function scaleQuantity(quantity, factor) {
  if (!quantity || factor === 1) return quantity;

  const q = String(quantity).trim();

  // helper: gcd
  function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  }

  // helper: convert decimal to simplified fraction
  function decimalToFraction(dec) {
    const tolerance = 1e-6;
    let numerator = 1;
    let denominator = 1;

    while (Math.abs(numerator / denominator - dec) > tolerance) {
      if (numerator / denominator < dec) numerator++;
      else denominator++;
    }

    const g = gcd(numerator, denominator);
    return [numerator / g, denominator / g];
  }

  // helper: format final number into whole/mixed/fraction
  function formatNumber(n) {
    if (Number.isInteger(n)) return String(n);

    const [num, den] = decimalToFraction(n);

    if (num > den) {
      const whole = Math.floor(num / den);
      const remainder = num % den;
      return remainder === 0 ? String(whole) : `${whole} ${remainder}/${den}`;
    }

    return `${num}/${den}`;
  }

  // PARSE MIXED NUMBER: "1 1/2"
  const mixedMatch = q.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    const rest = mixedMatch[4] || '';

    const base = whole + num / den;
    const scaled = base * factor;
    return rest ? `${formatNumber(scaled)} ${rest}` : formatNumber(scaled);
  }

  // PARSE FRACTION: "3/4"
  const fracMatch = q.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    const rest = fracMatch[3] || '';

    const base = num / den;
    const scaled = base * factor;
    return rest ? `${formatNumber(scaled)} ${rest}` : formatNumber(scaled);
  }

  // PLAIN NUMBER
  const numberMatch = q.match(/^(\d+(\.\d+)?)\s*(.*)$/);
  if (numberMatch) {
    const base = parseFloat(numberMatch[1]);
    const rest = numberMatch[3] || '';

    const scaled = base * factor;
    return rest ? `${formatNumber(scaled)} ${rest}` : formatNumber(scaled);
  }

  return quantity;
}
