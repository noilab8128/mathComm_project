"use client"
// "How to write LaTeX" under the explanation editor (decision 2026-10-25): a short table of the commands
// students need, each shown as typed and as rendered, and an example that can be inserted into the editor.

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import MathPreview from "@/components/MathPreview";

const ROWS: { what: string; type: string }[] = [
  { what: "Math inside a sentence", type: "$x + 1$" },
  { what: "Math on its own line", type: "$$x^{2} + 1 = 10$$" },
  { what: "Power", type: "$x^{2}$" },
  { what: "Subscript", type: "$a_{n}$" },
  { what: "Fraction", type: "$\\frac{3}{8}$" },
  { what: "Square root", type: "$\\sqrt{2}$" },
  { what: "Rounded down (floor)", type: "$\\floor{x}$ or $\\lfloor x \\rfloor$" },
  { what: "Times, dots", type: "$2 \\cdot 3$, $1 + 2 + \\dots + n$" },
  { what: "Inequalities", type: "$a \\le b$, $a \\ge b$, $a \\ne b$" },
  { what: "A set", type: "$\\{1, 2, 3\\}$" },
  { what: "Matrix", type: "$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$" },
];

export const LATEX_EXAMPLE = `Explain each step in words. Put math between dollar signs.

Let $n$ be the number we want. Then
$$
n^{2} + 1 = 10,
$$
so $n = 3$ (because $n \\ge 0$).

Fractions and matrices work the same way: $\\frac{3}{8}$ and $\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$.
`;

export default function LatexHelp({ onInsert }: { onInsert: (example: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-[13px] text-slate-600 hover:text-slate-900"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        How to write LaTeX
      </button>

      {open && (
        <section aria-label="How to write LaTeX" className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-slate-500">
                <th className="py-1 pr-3 font-medium">What</th>
                <th className="py-1 pr-3 font-medium">You type</th>
                <th className="py-1 font-medium">You get</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ROWS.map((r) => (
                <tr key={r.what}>
                  <td className="py-1.5 pr-3 text-slate-600">{r.what}</td>
                  <td className="py-1.5 pr-3">
                    <code className="break-all font-mono text-[12px] text-slate-800">{r.type}</code>
                  </td>
                  <td className="py-1.5">
                    <MathPreview html={r.type} className="text-[14px]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 leading-relaxed text-slate-600">
            Type the final number in the <span className="font-medium text-slate-900">Answer</span> box, for example{" "}
            <code className="font-mono text-[12px]">42</code>, <code className="font-mono text-[12px]">-3</code> or{" "}
            <code className="font-mono text-[12px]">3/8</code>.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onInsert(LATEX_EXAMPLE)}
            className="mt-3 h-8 rounded-md border-slate-300 text-[13px] text-slate-700 hover:text-slate-900"
          >
            Insert example
          </Button>
        </section>
      )}
    </div>
  );
}
