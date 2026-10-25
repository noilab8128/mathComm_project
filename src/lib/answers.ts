// Short-answer checking: compare a student's number with the stored answer exactly.
// Stored answers are the first line of a solution: "Answer: 2737260", "Answer: 27/10", "Answer: -3".

/** An exact rational number num/den with den > 0. */
export interface Rational {
  num: bigint;
  den: bigint;
}

/**
 * Parse a whole number, a fraction (27/10 or \frac{27}{10}) or a decimal, allowing spaces, commas and thin spaces
 * as thousands separators and a leading minus sign. Returns null for anything else (words, formulas, two numbers).
 */
export function parseNumber(raw: string): Rational | null {
  const s = raw
    .replace(/[\s   ,]/g, "") // spaces, no-break and thin spaces, commas
    .replace(/[−–]/g, "-") // minus sign and en dash typed as minus
    .replace(/^\$|\$$/g, "") // a number typed as $27/10$
    // a fraction typed in LaTeX: \frac{27}{10}, \dfrac{27}{10}, -\frac{3}{8} or \frac{-3}{8}
    .replace(/^(-?)\\[dt]?frac\{(-?)(\d+)\}\{(\d+)\}$/, (_, outer, inner, n, d) => `${outer === inner ? "" : "-"}${n}/${d}`);
  let m = s.match(/^(-?)(\d+)\/(\d+)$/);
  if (m) {
    const den = BigInt(m[3]);
    if (den === BigInt(0)) return null;
    return { num: (m[1] ? BigInt(-1) : BigInt(1)) * BigInt(m[2]), den };
  }
  m = s.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (m) {
    const frac = m[3] ?? "";
    const den = BigInt(10) ** BigInt(frac.length);
    return { num: (m[1] ? BigInt(-1) : BigInt(1)) * BigInt(m[2] + frac), den };
  }
  return null;
}

export function sameNumber(a: Rational, b: Rational): boolean {
  return a.num * b.den === b.num * a.den;
}

/** The stored answer of a problem from its solution texts, or null if none is a plain number. */
export function storedAnswer(solutions: { content: string; sequence_order?: number | null }[]): Rational | null {
  const sorted = [...solutions].sort((x, y) => (x.sequence_order ?? 0) - (y.sequence_order ?? 0));
  for (const sol of sorted) {
    const first = (sol.content || "").split("\n")[0];
    const m = first.match(/^\s*\**\s*Answer\s*:\s*\**\s*(.+?)\s*\**\s*\.?\s*$/i);
    if (m) {
      const value = parseNumber(m[1]);
      if (value) return value;
    }
  }
  return null;
}
