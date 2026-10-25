"""Recompute every answer and number in LADDERS_v2_batch6.md (ladders P27-P31).
Run: python3 ladders/v2/verify_v2_batch6.py"""

import random
from collections import deque
from fractions import Fraction as F
from functools import lru_cache
from itertools import permutations, product
from math import sqrt

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


# ---- P27: fair rounding ---------------------------------------------------------------------------------------
def best_error(caps):
    """Smallest total error, by trying every way to hand out the total in whole kilos (small cases)."""
    total = int(sum(caps))
    n = len(caps)
    best = None

    def rec(i, left, err):
        nonlocal best
        if i == n - 1:
            e = err + abs(left - caps[i])
            best = e if best is None or e < best else best
            return
        for N in range(left + 1):
            rec(i + 1, left - N, err + abs(N - caps[i]))

    rec(0, total, F(0))
    return best


def rule_error(caps):
    """The leftover rule: whole parts first, extra kilos to the largest fractional parts."""
    whole = [int(c) for c in caps]
    R = int(sum(caps)) - sum(whole)
    fr = sorted((c - w for c, w in zip(caps, whole)), reverse=True)
    return sum(1 - x for x in fr[:R]) + sum(fr[R:])


def D(n):
    return max(F(2 * R * (n - R), n) for R in range(n))


check("P27 Step 1", best_error([F(3, 2), F(3, 2), F(3)]), 1)
check("P27 Step 2", best_error([F(23, 10), F(46, 10), F(11, 10)]), F(4, 5))
check("P27 Step 3", rule_error([F(3, 7)] * 7), F(24, 7))
check("P27 Step 4 (bound and example)", (D(8), best_error([F(3, 2)] * 4 + [F(1, 2)] * 4)), (4, 4))
random.seed(7)
ok = True
for _ in range(1500):
    n = random.randint(2, 6)
    fr = [F(random.randint(0, 12), 12) for _ in range(n - 1)]
    last = (-sum(fr)) % 1
    caps = [f + random.randint(0, 1) for f in fr] + [last + 1]
    if best_error(caps) != rule_error(caps) or rule_error(caps) > D(n):
        ok = False
check("P27 leftover rule is best and error <= max 2R(n-R)/n (random bowls, n <= 6)", ok, True)
ex = [1 + F(13, 25)] * 12 + [F(13, 25)] * 13
check("P27 Challenge example (total 25 kg) and value", (sum(ex), rule_error(ex), D(25)), (25, F(312, 25), F(312, 25)))
check("P27 Challenge", 312 + 25, 337)


# ---- P28: powers that match -----------------------------------------------------------------------------------
def iroot(v, k):
    if v < 0:
        return None
    r = round(v ** (1 / k))
    return next((c for c in (r - 1, r, r + 1) if c >= 0 and c ** k == v), None)


def solutions(m, X, N=6):
    return [xs for xs in product(range(1, X + 1), repeat=m)
            if all(iroot(sum((i + 1) * x ** n for i, x in enumerate(xs)) - 1, n + 1) is not None for n in range(1, N + 1))]


check("P28 Step 1", (1 + 2 * 25 + 3 * 25, 5 ** 3 + 1), (126, 126))
check("P28 Step 2 (search k up to 100)", [k for k in range(1, 101) if all(iroot(5 * k ** n, n + 1) == k for n in range(1, 6))], [5])
check("P28 Step 3", (55 * 6 ** 10, 7 ** 11 < 55 * 6 ** 10 < 8 ** 11), (3325639680, True))
check("P28 small cases are unique", (solutions(2, 30), solutions(3, 25), solutions(4, 14)), ([(1, 2)], [(1, 5, 5)], [(1, 9, 9, 9)]))
check("P28 Step 4", sum((1, 9, 9, 9)), 28)
xs = [1] + [54] * 9
check("P28 the 10-number answer works for n = 1..12",
      all(sum((i + 1) * x ** n for i, x in enumerate(xs)) - 1 == 54 ** (n + 1) for n in range(1, 13)), True)
check("P28 Challenge", (sum(range(2, 11)), sum(xs)), (54, 487))


# ---- P29: sorting letters -------------------------------------------------------------------------------------
def disorder(w):
    return sum(1 for i in range(len(w)) for j in range(i + 1, len(w)) if w[i] > w[j])


def swap_distance(start, target):
    seen, q = {start: 0}, deque([start])
    while q:
        w = q.popleft()
        if w == target:
            return seen[w]
        for i in range(len(w) - 1):
            v = w[:i] + w[i + 1] + w[i] + w[i + 2:]
            if v not in seen:
                seen[v] = seen[w] + 1
                q.append(v)


words = sorted(set("".join(p) for p in permutations("aabbcc")))
check("P29 Step 1", swap_distance("abc", "cba"), 3)
check("P29 Step 2", disorder("cabbac"), 6)
check("P29 Step 3", (disorder("bcacab"), swap_distance("bcacab", "aabbcc")), (7, 7))
check("P29 distance = disorder and 12 - disorder for all 90 words",
      (len(words), all(swap_distance(w, "aabbcc") == disorder(w) and swap_distance(w, "ccbbaa") == 12 - disorder(w)
                       for w in words)), (90, True))
dist = [sum(1 for w in words if disorder(w) == k) for k in range(13)]
check("P29 words by disorder", dist, [1, 2, 5, 7, 11, 12, 14, 12, 11, 7, 5, 2, 1])
check("P29 Step 4", F(sum(disorder(w) for w in words), 90), 6)
EX = F(sum(min(disorder(w), 12 - disorder(w)) for w in words), 90)
check("P29 Challenge", (EX, EX.numerator + EX.denominator), (F(179, 45), 224))


# ---- P30: climbing windows ------------------------------------------------------------------------------------
def climbing(seq, n):
    return all(sum(seq[i:i + n]) < sum(seq[i + n:i + 2 * n]) for i in range(n * n - n + 1))


def stair(n):
    return [0 if v < n - u else 1 for u in range(n + 1) for v in range(n)]


def all_climbing(n):
    L, out = n * n + n, []

    def rec(seq):  # extend and prune with every complete comparison
        k = len(seq)
        i = k - 2 * n
        if i >= 0 and not sum(seq[i:i + n]) < sum(seq[i + n:i + 2 * n]):
            return
        if k == L:
            out.append(tuple(seq))
            return
        for d in (0, 1):
            rec(seq + [d])

    rec([])
    return out


check("P30 Step 1 and uniqueness for n = 2, 3, 4", [all_climbing(n) == [tuple(stair(n))] for n in (2, 3, 4)], [True] * 3)
check("P30 Step 2", sum(sum(stair(3)[3 * u:3 * u + 3]) for u in range(4)), 6)
check("P30 Step 3", stair(3).index(1) + 1, 6)
check("P30 Step 4", sum(stair(5)), 15)
check("P30 staircase n = 30 is climbing; Challenge", (climbing(stair(30), 30), sum(stair(30)[:500]), 120 + 6), (True, 126, 126))


# ---- P31: parallel cuts ---------------------------------------------------------------------------------------
B, C = (0.0, 0.0), (14.0, 0.0)
ax = (13 ** 2 - 15 ** 2 + 14 ** 2) / 28
A = (ax, sqrt(13 ** 2 - ax * ax))


def tri_area(p, q, r):
    return abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2


def inradius(p, q, r):
    d = lambda u, v: sqrt((u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2)
    return 2 * tri_area(p, q, r) / (d(p, q) + d(q, r) + d(r, p))


def meet(p1, d1, p2, d2):
    det = d1[0] * (-d2[1]) - d1[1] * (-d2[0])
    t = ((p2[0] - p1[0]) * (-d2[1]) - (p2[1] - p1[1]) * (-d2[0])) / det
    return (p1[0] + t * d1[0], p1[1] + t * d1[1])


def small_triangles(t):
    """P with barycentric coordinates t = (tA, tB, tC); the three small triangles with corner P."""
    P = (t[0] * A[0] + t[1] * B[0] + t[2] * C[0], t[0] * A[1] + t[1] * B[1] + t[2] * C[1])
    dirs = {"BC": (C[0] - B[0], C[1] - B[1]), "CA": (A[0] - C[0], A[1] - C[1]), "AB": (B[0] - A[0], B[1] - A[1])}
    sides = {"BC": (B, dirs["BC"]), "CA": (C, dirs["CA"]), "AB": (A, dirs["AB"])}
    out = []
    for base, others in (("BC", ("CA", "AB")), ("CA", ("AB", "BC")), ("AB", ("BC", "CA"))):
        q1 = meet(P, dirs[others[0]], *sides[base])
        q2 = meet(P, dirs[others[1]], *sides[base])
        out.append((P, q1, q2))
    return out


check("P31 Step 1 (area 84, inradius 4)", (round(tri_area(A, B, C), 9), round(inradius(A, B, C), 9)), (84.0, 4.0))
check("P31 Step 2", F(4, 3), F(4) / 3)
random.seed(31)
okr = True
for _ in range(200):
    u, v = sorted((random.random(), random.random()))
    t = (u, v - u, 1 - v)
    tris = small_triangles(t)
    if abs(sum(inradius(*x) for x in tris) - 4) > 1e-9 or abs(sum(tri_area(*x) for x in tris) - 84 * sum(s * s for s in t)) > 1e-8:
        okr = False
check("P31 inradii add up to 4 and areas = 84 * sum t^2 (random P)", okr, True)
check("P31 Step 3", 4 - F(1) - F(3, 2), F(3, 2))
cen = small_triangles((1 / 3, 1 / 3, 1 / 3))
check("P31 Step 4 (centroid gives 28)", round(sum(tri_area(*x) for x in cen), 9), 28.0)
ch = small_triangles((1 / 6, 1 / 3, 1 / 2))
check("P31 Challenge inradii 2/3, 4/3, 2 and area 98/3",
      ([round(inradius(*x), 9) for x in ch], round(sum(tri_area(*x) for x in ch) * 3, 6)), ([round(2 / 3, 9), round(4 / 3, 9), 2.0], 98.0))
check("P31 Challenge", 98 + 3, 101)

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
