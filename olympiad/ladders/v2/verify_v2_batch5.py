"""Recompute every answer and number in LADDERS_v2_batch5.md (ladders P22-P26).
Run: python3 ladders/v2/verify_v2_batch5.py"""

import cmath
import random
from fractions import Fraction as F
from functools import lru_cache
from itertools import combinations
from math import comb

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


# ---- P22: fence posts -----------------------------------------------------------------------------------------
def coords(n):
    xs = [F(2 * k - 1, 2) for k in range(1, n + 1)]
    return [-x for x in xs] + xs


def half_sum_sq(n):
    xs = coords(n)
    return sum(x * x + y * y for x in xs for y in xs) / 2


def area(pts):
    s = sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
    return abs(F(s) / 2)


def quarter_turn_total(n):
    pts = {(x, y) for x in coords(n) for y in coords(n)}
    total, seen = F(0), set()
    for p in sorted(pts):
        if p in seen:
            continue
        orbit = [p, (-p[1], p[0]), (-p[0], -p[1]), (p[1], -p[0])]
        seen.update(orbit)
        total += area(orbit)
    return total


def brute_4x4():
    pts = [(x, y) for x in range(4) for y in range(4)]
    best4 = {}
    for g in combinations(range(16), 4):
        a, b, c, d = [pts[i] for i in g]
        best4[sum(1 << i for i in g)] = max(area([a, b, c, d]), area([a, c, b, d]), area([a, b, d, c]))

    @lru_cache(None)
    def dp(mask):
        if mask == (1 << 16) - 1:
            return F(0)
        i = next(k for k in range(16) if not mask >> k & 1)
        rest = [k for k in range(16) if not mask >> k & 1 and k != i]
        return max(best4[(1 << i) | sum(1 << k for k in t)] + dp(mask | (1 << i) | sum(1 << k for k in t))
                   for t in combinations(rest, 3))

    return dp(0)


check("P22 Step 1 (right angle maximises 1/2 * 4 * 6)", F(4 * 6, 2), 12)
sq = [(3, 1), (-1, 3), (-3, -1), (1, -3)]
check("P22 Step 2 area and half the sum of squared distances", (area(sq), F(sum(x * x + y * y for x, y in sq), 2)), (20, 20))
check("P22 Step 3", 2 * half_sum_sq(3), 210)
check("P22 Step 4 (full search over all splits of the 4 x 4 grid)", (brute_4x4(), half_sum_sq(2)), (20, 20))
check("P22 bound = quarter-turn construction for n = 1..5", all(half_sum_sq(n) == quarter_turn_total(n) for n in range(1, 6)), True)
check("P22 Challenge (sum of squares 1650, half 825)", (2 * half_sum_sq(5), half_sum_sq(5)), (1650, 825))
check("P22 formula n^2(2n+1)(2n-1)/3", all(half_sum_sq(n) == F(n * n * (2 * n + 1) * (2 * n - 1), 3) for n in range(1, 8)), True)


# ---- P23: three in a row --------------------------------------------------------------------------------------
def S(x):
    return sum(x[i] * x[(i + 2) % len(x)] for i in range(len(x)))


def ok(x):
    n = len(x)
    return all(v >= 0 for v in x) and all(x[i] + x[(i + 1) % n] + x[(i + 2) % n] <= 1 for i in range(n))


alt8 = [F(1, 2), 0] * 4
check("P23 Step 1", (ok(alt8), S(alt8)), (True, 1))
# Step 2/3: ac + bd <= (1 - u) u with u = b + c; grid search over rationals confirms the maxima
grid = [F(i, 20) for i in range(21)]
best2 = max(a * c + b * d for b in grid for c in grid if b + c == F(2, 5) for a in grid if a + b + c <= 1 for d in grid if b + c + d <= 1)
best3 = max(a * c + b * d for b in grid for c in grid if b + c <= 1 for a in grid if a + b + c <= 1 for d in grid if b + c + d <= 1)
check("P23 Step 2", best2, F(6, 25))
check("P23 Step 3", best3, F(1, 4))
alt6 = [F(1, 2), 0] * 3
check("P23 Step 4 example", (ok(alt6), S(alt6)), (True, F(3, 4)))
random.seed(5)


def project(x):
    n = len(x)
    x = [max(0.0, v) for v in x]
    for _ in range(60):
        done = True
        for i in range(n):
            s = x[i] + x[(i + 1) % n] + x[(i + 2) % n]
            if s > 1:
                done = False
                for j in (i, (i + 1) % n, (i + 2) % n):
                    x[j] /= s
        if done:
            break
    return x


def search(n, trials=600):
    best = 0
    for _ in range(trials):
        x = project([random.random() for _ in range(n)])
        step = 0.2
        for _ in range(300):
            y = project([v + random.gauss(0, step) for v in x])
            if S(y) > S(x):
                x = y
            else:
                step *= 0.99
        best = max(best, S(x))
    return best


res = {n: search(n) for n in (6, 8, 10)}
check("P23 random search never beats n/8 and gets within 1% (n = 6, 8, 10)",
      all(n / 8 * 0.99 <= v <= n / 8 + 1e-9 for n, v in res.items()), True)
check("P23 Challenge", (F(2026, 8), 1013 + 4), (F(1013, 4), 1017))


# ---- P24: power sums ------------------------------------------------------------------------------------------
p, q, r = 3, 2, 1
check("P24 Step 1", (9 - 5) // 2, 2)
check("P24 Step 2", F(12 - 3 * (5 - 2), 3), 1)
s = [3, 3, 5]
for _ in range(6):
    s.append(p * s[-1] - q * s[-2] + r * s[-3])
check("P24 recursion values s0..s8", s, [3, 3, 5, 12, 29, 68, 158, 367, 853])
# numeric roots of t^3 - 3t^2 + 2t - 1 by Durand-Kerner
roots = [complex(0.4, 0.9) ** k for k in range(3)]
for _ in range(200):
    roots = [z - (z ** 3 - 3 * z ** 2 + 2 * z - 1) / ((z - w1) * (z - w2))
             for z, w1, w2 in [(roots[i], roots[(i + 1) % 3], roots[(i + 2) % 3]) for i in range(3)]]
num = [sum(z ** k for z in roots) for k in range(9)]
check("P24 numeric roots give the same power sums", all(abs(num[k] - s[k]) < 1e-6 for k in range(9)), True)
real = [z.real for z in roots if abs(z.imag) < 1e-9]
check("P24 one real root near 2.32", (len(real), round(real[0], 2)), (1, 2.32))
check("P24 Step 3 and Challenge", (s[4], s[8]), (29, 853))


# ---- P25: the cyclic factor -----------------------------------------------------------------------------------
def E(a, b, c):
    return a * b * (a * a - b * b) + b * c * (b * b - c * c) + c * a * (c * c - a * a)


check("P25 factorisation (b-c)(a-b)(a-c)(a+b+c) on a grid", all(E(a, b, c) == (b - c) * (a - b) * (a - c) * (a + b + c)
                                                            for a in range(-6, 7) for b in range(-6, 7) for c in range(-6, 7)), True)
check("P25 Step 1", E(1, 2, 3), -12)
check("P25 Step 2 (roots in a for b = 2, c = 5)", sorted(a for a in range(-50, 51) if E(a, 2, 5) == 0), [-7, 2, 5])
T = list(combinations(range(1, 22), 3))
eq = [t for t in T if len({x % 7 for x in t}) < 3]
sm = [t for t in T if sum(t) % 7 == 0]
both = [t for t in T if t in set(eq) and sum(t) % 7 == 0]
check("P25 Step 3", (len(eq), len(T) - comb(7, 3) * 27), (385, 385))
check("P25 Step 4 and equal spread of sums", (len(sm), [sum(1 for t in T if sum(t) % 7 == k) for k in range(7)]), (190, [190] * 7))
check("P25 both groups: 1 + 54", (len(both), sum(1 for t in both if len({x % 7 for x in t}) == 1)), (55, 1))
check("P25 Challenge", (sum(1 for a, b, c in T if E(a, b, c) % 7 == 0), 385 + 190 - 55), (520, 520))


# ---- P26: red corners -----------------------------------------------------------------------------------------
def corners(red, n):
    whites_r = [sum(1 for j in range(n) if not red[i][j]) for i in range(n)]
    whites_c = [sum(1 for i in range(n) if not red[i][j]) for j in range(n)]
    return sum(whites_r[i] * whites_c[j] for i in range(n) for j in range(n) if red[i][j])


def brute(n):
    return max(corners([[m >> (n * i + j) & 1 for j in range(n)] for i in range(n)], n) for m in range(1 << (n * n)))


def cyclic(n, k):
    return [[(j - i) % n < k for j in range(n)] for i in range(n)]


diag4 = [[i == j for j in range(4)] for i in range(4)]
check("P26 Step 1", corners(diag4, 4), 36)
check("P26 Step 2", (max((6 - x) * x * x for x in range(7)), [(6 - x) * x * x for x in range(7)]), (32, [0, 5, 16, 27, 32, 25, 0]))
check("P26 full search 3 x 3 and 4 x 4 equal n * max (n - x) x^2", (brute(3), brute(4)),
      (3 * max((3 - x) * x * x for x in range(4)), 4 * max((4 - x) * x * x for x in range(5))))
check("P26 Step 3 bound and construction", (6 * 32, corners(cyclic(6, 2), 6)), (192, 192))
check("P26 values of (8 - x) x^2", [(8 - x) * x * x for x in range(9)], [0, 7, 24, 45, 64, 75, 72, 49, 0])
check("P26 Challenge bound and construction", (8 * 75, corners(cyclic(8, 3), 8)), (600, 600))

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
