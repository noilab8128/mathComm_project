"""Recompute every answer and number in LADDERS_v2_batch8.md (ladders P37-P41).
Run: python3 ladders/v2/verify_v2_batch8.py"""

import random
from fractions import Fraction as F
from itertools import combinations
from math import gcd

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


# ---- P37: no neighbours ---------------------------------------------------------------------------------------
def sparse_sets(n):
    out = []
    for mask in range(1 << n):
        s = {i + 1 for i in range(n) if mask >> i & 1}
        if all(i + 1 not in s for i in s):
            out.append(s)
    return out


c = [1, 2]
for _ in range(9):
    c.append(c[-1] + c[-2])
check("P37 c_0..c_10", c, [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144])
check("P37 Step 1", len(sparse_sets(4)), 8)
check("P37 Step 2", len(sparse_sets(10)), 144)
check("P37 Step 3", F(len(sparse_sets(6)), 64), F(21, 64))
s6 = [s for s in sparse_sets(6) if 6 in s]
check("P37 Step 4 (8 sets contain 6, 3 also contain 1)", (len(s6), F(sum(1 in s for s in s6), len(s6))), (8, F(3, 8)))
s12 = [s for s in sparse_sets(12) if 12 in s]
p = F(sum(1 in s for s in s12), len(s12))
check("P37 Challenge (144 sets with 12, 55 with 1 too)", (len(s12), sum(1 in s for s in s12), p, p.numerator + p.denominator),
      (144, 55, F(55, 144), 199))


# ---- P38: two-coloured sides ----------------------------------------------------------------------------------
def isosceles(n):
    def d(a, b):
        return min((a - b) % n, (b - a) % n)
    return [t for t in combinations(range(n), 3)
            if len({d(t[0], t[1]), d(t[1], t[2]), d(t[0], t[2])}) < 3]


def tops(n, v):
    return sum(1 for t in isosceles(n) if v in t and len({min((v - u) % n, (u - v) % n) for u in t if u != v}) == 1)


check("P38 Step 1 (7-gon, triangles with top 0)", tops(7, 0), 3)
iso = isosceles(13)
check("P38 Step 2", len(iso), 78)
check("P38 no equilateral triangle in the 13-gon", tops(13, 0) * 13, 78)
check("P38 Step 3 (every pair in exactly 3)", {sum(a in t and b in t for t in iso) for a, b in combinations(range(13), 2)}, {3})
check("P38 Step 4", sum(x != y for x, y in [("R", "R"), ("R", "B"), ("R", "B")]), 2)
check("P38 two-coloured pairs", 3 * 5 + 5 * 5 + 5 * 3, 55)
cols = list("R" * 3 + "B" * 5 + "G" * 5)
totals, three = set(), []
rng = random.Random(8)
for _ in range(2000):
    rng.shuffle(cols)
    totals.add(sum(sum(cols[a] != cols[b] for a, b in combinations(t, 2)) for t in iso))
    three.append(sum(len({cols[v] for v in t}) == 3 for t in iso))
check("P38 Challenge (2000 random colourings)", totals, {165})
check("P38 Explore claim: random colourings give 13 or more three-coloured triangles", min(three) >= 13, True)


# ---- P39: zero sums -------------------------------------------------------------------------------------------
N = 4100
x = [0] * (N + 2)
x[1] = 1
for i in range(2, N + 1):
    k = i // 2
    x[i] = -x[k] if i % 2 == 0 else (-1) ** k * x[k + 1]
S = [0] * (N + 1)
for i in range(1, N + 1):
    S[i] = S[i - 1] + x[i]
check("P39 x_1..x_8", x[1:9], [1, -1, 1, 1, 1, -1, -1, -1])
check("P39 Step 1", S[6], 2)
check("P39 blocks of four add to 2x_k", all(x[4 * k - 3] + x[4 * k - 2] + x[4 * k - 1] + x[4 * k] == 2 * x[k] for k in range(1, N // 4)), True)
check("P39 S_4k+2 = S_4k = 2S_k", all(S[4 * k + 2] == S[4 * k] == 2 * S[k] for k in range(0, N // 4 - 1)), True)
check("P39 Step 2", (S[4], S[16]), (2, 4))
check("P39 Step 3", sum(S[n] == 0 for n in range(1, 10)), 2)
check("P39 Step 4", (S[10], S[40]), (0, 0))
check("P39 parity", all(S[n] % 2 == n % 2 for n in range(1, N + 1)), True)
check("P39 S_n >= 0 (SL2010 A4)", min(S[1:]) >= 0, True)


def base4_02(n):
    while n:
        if n % 4 not in (0, 2):
            return False
        n //= 4
    return True


zeros = [n for n in range(1, N + 1) if S[n] == 0]
check("P39 zeros are the base-4 {0,2} numbers (n <= 4100)", zeros, [n for n in range(1, N + 1) if base4_02(n)])
check("P39 1000 in base 4, 22222_4, 200000_4", (int("33220", 4), int("22222", 4), int("200000", 4)), (1000, 682, 2048))
check("P39 Challenge", sum(1 for n in range(1, 1001) if S[n] == 0), 31)


# ---- P40: cutting colours -------------------------------------------------------------------------------------
def changes(n):
    blue = [gcd(k, n) == 1 for k in range(1, n + 1)]
    return sum(blue), sum(blue[i] != blue[(i + 1) % n] for i in range(n))


check("P40 Step 1 (RBRB: 4 changes, 2 lines)", (4, 4 // 2), (4, 2))
b60, c60 = changes(60)
check("P40 Step 2", b60, 16)
check("P40 Step 3 (32 changes, 16 lines)", (c60, c60 // 2), (32, 16))
b105, c105 = changes(105)
check("P40 Challenge (48 blue, 66 changes, 33 lines)", (b105, c105, c105 // 2), (48, 66, 33))


# ---- P41: the average crossing --------------------------------------------------------------------------------
z = [2026] + [k * k for k in range(1, 202)]


def d(n):
    return sum(z[: n + 1]) - n * z[n]


check("P41 Step 1", sum(k * k for k in range(1, 15)), 1015)
check("P41 Step 2", d(3), 2013)
check("P41 Step 3", (d(11) - d(10), 10 * (z[10] - z[11])), (-210, -210))
check("P41 Step 4", d(15), -109)
check("P41 d_14, 1^2+..+15^2", (d(14), sum(k * k for k in range(1, 16))), (297, 1240))
good = [n for n in range(1, 200) if z[n] < F(sum(z[: n + 1]), n) <= z[n + 1]]
check("P41 Challenge", good, [14])

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks passed")
