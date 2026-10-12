"""Recompute every answer and every numeric claim in PILOT_A2.md. Run: python3 ladders/pilot_v2/verify_pilot_a2.py

Setting: ovens 0, 1, 2, ...; baking k loaves in oven i costs 3^i x k^2 coins. The Challenge is checked three ways:
a direct dynamic program, a greedy run over extra costs, and the counting formula from our solution.
"""

import heapq
from itertools import product

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


def v3(m):
    c = 0
    while m % 3 == 0:
        m //= 3
        c += 1
    return c


def best_dp(n, w=3):
    """best[m] = min over x0 of x0^2 + w * best[m - x0] (ovens 1, 2, ... cost exactly w times ovens 0, 1, ...)."""
    best = [0]
    for m in range(1, n + 1):
        best.append(min(x * x + w * best[m - x] for x in range(1, m + 1)))
    return best


def best_greedy(n, w=3, ovens=30):
    """Add loaves one at a time where the extra cost w^i (2k - 1) is smallest."""
    heap = [(w ** i, i, 1) for i in range(ovens)]
    heapq.heapify(heap)
    total, loads = 0, [0] * ovens
    for _ in range(n):
        cost, i, k = heapq.heappop(heap)
        total += cost
        loads[i] += 1
        heapq.heappush(heap, (w ** i * (2 * k + 1), i, k + 1))
    return total, loads


def list_count(M):
    """Entries of the extra-cost list that are at most M: odd m counted v3(m) + 1 times."""
    return sum(v3(m) + 1 for m in range(1, M + 1, 2))


def list_sum(M):
    return sum((v3(m) + 1) * m for m in range(1, M + 1, 2))


def odd_count(x):
    return (int(x) + 1) // 2  # odd numbers 1, 3, ... up to x


def count_by_layers(M):
    """Our solution's formula: layer j holds 3^j x (odd numbers up to M / 3^j)."""
    out, j = [], 0
    while 3 ** j <= M:
        out.append(odd_count(M // 3 ** j))
        j += 1
    return out


def sum_by_layers(M):
    """Sum of the first t odd numbers is t^2, so layer j adds 3^j x t_j^2."""
    return sum(3 ** j * t * t for j, t in enumerate(count_by_layers(M)))


def cheapest(n):
    """Our solution: take whole layers up to the cutoff, then the next odd numbers (with repeats)."""
    total, left, m = 0, n, 1
    while left > 0:
        take = min(v3(m) + 1, left)
        total += take * m
        left -= take
        m += 2
    return total


# ---- Steps --------------------------------------------------------------------------------------------
check("Step 1: 5th loaf in oven 2", 9 * 5 ** 2 - 9 * 4 ** 2, 81)
three_ovens = min(a * a + 3 * b * b + 9 * c * c for a, b, c in product(range(7), repeat=3) if a + b + c == 6)
check("Step 2: 6 loaves, ovens 0-2, full search", three_ovens, 28)
check("Step 2: same by taking the six cheapest extra costs", sum(sorted(
    [w * (2 * k - 1) for w in (1, 3, 9) for k in range(1, 7)])[:6]), 28)
check("Step 2: example split 4 + 2", 4 * 4 + 3 * 2 * 2, 28)
check("Step 3: times 45 appears", sum(1 for i in range(10) for k in range(1, 50) if 3 ** i * (2 * k - 1) == 45), 3)
check("Step 3 = v3(45) + 1", v3(45) + 1, 3)
check("Step 4: entries <= 100", list_count(100), 76)
check("Step 4 by layers (50 + 17 + 6 + 2 + 1)", count_by_layers(100), [50, 17, 6, 2, 1])
check("Step 5: sum of entries <= 30", list_sum(30), 363)
check("Step 5 by layers (225 + 3 * 25 + 9 * 4 + 27 * 1)", sum_by_layers(30), 363)
check("Step 6: 80 loaves", cheapest(80), 4294)
check("Step 6: the four entries after 100", (list_sum(100), 101 + 103 + 105 + 105), (3880, 414))

# ---- Challenge, three ways ---------------------------------------------------------------------------
dp = best_dp(2026)
greedy_total, loads = best_greedy(2026)
check("Challenge: dynamic program", dp[2026], 2737260)
check("Challenge: greedy", greedy_total, 2737260)
check("Challenge: counting formula", cheapest(2026), 2737260)
check("Method agreement for every n <= 400 (dp = counting)", all(dp[n] == cheapest(n) for n in range(401)), True)

# ---- Claims in the analysis and the flow ---------------------------------------------------------------
check("Analysis: everything in oven 0 costs 2026^2", 2026 ** 2, 4104676)
check("Analysis: the recursion compares 1 + 2 + ... + 2026 splits", 2026 * 2027 // 2, 2053351)
check("Analysis: estimate 2n^2/3 for n = 2026 (rounded)", round(2 * 2026 ** 2 / 3), 2736451)
check("Analysis: weights 2^i give 1 + 2 + ... + n (n <= 300)",
      all(v == n * (n + 1) // 2 for n, v in enumerate(best_dp(300, 2))), True)
two_list = sorted(2 ** i * (2 * k - 1) for i in range(12) for k in range(1, 2000) if 2 ** i * (2 * k - 1) <= 1000)
check("Analysis: with weights 2^i the extra costs up to 1000 are 1..1000, each once", two_list == list(range(1, 1001)), True)
check("Flow 2: extra costs rise inside every oven", all(3 ** i * (2 * k + 1) > 3 ** i * (2 * k - 1)
                                                        for i in range(6) for k in range(1, 50)), True)
check("Flow 4: layers for M = 2697", count_by_layers(2697), [1349, 450, 150, 50, 17, 6, 2, 1])
check("Flow 6: cutoff (entries <= 2697, next value and how often it appears)",
      (list_count(2697), list_count(2699) - list_count(2697), v3(2699) + 1), (2025, 1, 1))
check("Flow 6: sum of entries <= 2697", (list_sum(2697), sum_by_layers(2697)), (2734561, 2734561))
check("Flow 6: total = 2734561 + 2699", 2734561 + 2699, 2737260)
check("Solution: oven loads of a cheapest plan", loads[:9], [1350, 450, 150, 50, 17, 6, 2, 1, 0])
check("Solution: cost of those loads", sum(3 ** i * k * k for i, k in enumerate(loads)), 2737260)

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
