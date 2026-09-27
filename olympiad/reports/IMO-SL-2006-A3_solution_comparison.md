# IMO-SL-2006-A3 — Official Solution Comparison

## Sources compared

1. **Official Solution** (`official_solution_1`) — main argument on PDF pages 11–12.
2. **Official Comment** (`official_comment_lemma_induction`) — alternate proof of the Lemma only, PDF pages 12–13.

There is one official solution to the problem. The Comment does not restart the whole argument; it replaces only the lemma proof.

## Shared ideas

- Use the characteristic roots φ,ψ of t² − t − 1 = 0.
- Choose the linear form αx + βy with α = ψ, β = 1.
- Forward direction: pairs in S satisfy −1 < ψx + y < φ via ∑ ψ^{j−1}.
- Converse reduces to representing ψx + y as ∑_{j∈J} ψ^{j−1} for a set J of distinct positive indices, then invoking irrationality of ψ.

## Diverging approaches

| Aspect | Official Solution lemma | Official Comment lemma |
|--------|-------------------------|------------------------|
| Strategy | Minimum-length multiset of powers; prove indices are distinct by contradiction | Induction on n = 3x + 2y; recursively peel off a factor of ψ |
| Core identity | 2ψ² = 1 + ψ³ and 1 + ψ = ψ² | (ψx+y)/ψ = ψy + (x−y) and (ψx+y−1)/ψ = ψ(y−1)+(x−y+1) |
| Case structure | Repeated index cases j≥2, 0, 1 | Interval split (−1,−ψ) vs (0,φ) covering (−1,φ) |

## Essential steps (common to any complete official path)

1. Derive αφ + β = 0 and select α=ψ, β=1.
2. Establish equation (1): ψ a_J + b_J = ∑ ψ^{j−1}.
3. Bound those sums in (−1, φ).
4. Prove a lemma producing a genuine set J for the converse.
5. Match coefficients by irrationality.

## Solution-specific steps

### Official Solution only

- Canonical minimum-length ordering of exponents.
- Local rewriting using 2ψ² = 1 + ψ³.
- Escape to geometric-series extremes when 0 or 1 repeats.

### Official Comment only

- Measure n = 3x + 2y for induction.
- Two recursive branches depending on whether 0 is included in J.
- Covering argument (−1,−ψ) ∪ (0,φ) = (−1,φ).

## Day 1 Thinking Graph choice

The Gold Thinking Graph traces **official_solution_1**, including its combinatorial lemma proof. The Comment is preserved in the gold record as a second official text object and analyzed here, but not expanded into a second schema `thinking_graph` object (schema v1.0 has a single `thinking_graph` field).
