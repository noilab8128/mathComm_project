"""Recompute every answer and number in LADDERS_v2_batch3.md (ladders P12-P16).
Run: python3 ladders/v2/verify_v2_batch3.py"""

import math
from fractions import Fraction as F
from math import comb, isqrt

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


# ---- P12: the closest climb ---------------------------------------------------------------------------------
def largest_drop(a):
    return max(max(a[:i + 1]) - min(a[i:]) for i in range(len(a)))


def greedy(a):
    d = F(largest_drop(a))
    x, prev = [], None
    for v in a:
        cur = v - d / 2 if prev is None else max(prev, v - d / 2)
        x.append(cur)
        prev = cur
    return x, max(abs(xi - ai) for xi, ai in zip(x, a))


def best_error_lp(a, steps=400):
    """Independent check: binary search on the error e; feasible iff the greedy lower envelope stays below a + e."""
    lo, hi = F(0), F(max(a) - min(a))
    for _ in range(60):
        e = (lo + hi) / 2
        x, ok = None, True
        for v in a:
            x = v - e if x is None else max(x, v - e)
            if x > v + e:
                ok = False
                break
        lo, hi = (lo, e) if ok else (e, hi)
    return hi


a1 = [5, 1, 4, 2, 3]
check("P12 Step 1", largest_drop(a1), 4)
check("P12 Step 2", greedy(a1)[1], 2)
check("P12 Step 3", (greedy(a1)[0], greedy(a1)[0][-1]), ([3, 3, 3, 3, 3], 3))
a4 = [i * i % 11 for i in range(1, 11)]
check("P12 Step 4 list", a4, [1, 4, 9, 5, 3, 3, 5, 9, 4, 1])
check("P12 Step 4", greedy(a4)[1], 4)
ac = [37 * i % 101 for i in range(1, 101)]
check("P12 Challenge positions of 100 and 1", (ac.index(100) + 1, ac.index(1) + 1), (30, 71))
check("P12 Challenge", (largest_drop(ac), greedy(ac)[1]), (99, F(99, 2)))
check("P12 Challenge by independent binary search", abs(best_error_lp(ac) - F(99, 2)) < F(1, 10 ** 9), True)


# ---- P13: every power of two --------------------------------------------------------------------------------
def digits(num, den, count):
    out, r = [], num
    for _ in range(count):
        r *= 10
        out.append(r // den)
        r %= den
    return out


def order(base, mod):
    k, x = 1, base % mod
    while x != 1:
        x = x * base % mod
        k += 1
    return k


def y_digits(den, count):
    per = order(10, den)
    d = digits(1, den, per)
    return [d[(pow(2, n, per) - 1) % per] for n in range(1, count + 1)]


def eventual_period(seq, start=20):
    return next(p for p in range(1, 60) if all(seq[i] == seq[i + p] for i in range(start, len(seq) - p)))


check("P13 Step 1", int("".join(map(str, y_digits(7, 4)))), 4848)
check("P13 Step 1 (direct digits)", [digits(1, 7, 16)[p - 1] for p in (2, 4, 8, 16)], [4, 8, 4, 8])
check("P13 Step 2", (order(10, 41), pow(2, 10, 5)), (5, 4))
check("P13 Step 3", order(2, 17), 8)
check("P13 Step 4", ([pow(2, n, 34) for n in range(1, 10)], order(10, 103)), ([2, 4, 8, 16, 32, 30, 26, 18, 2], 34))
yd = y_digits(103, 200)
check("P13 Challenge digits", yd[:12], [0, 7, 3, 6, 2, 9, 2, 9, 0, 7, 3, 6])
check("P13 Challenge", eventual_period(yd), 8)
check("P13 Challenge (digits of 1/103 computed directly, positions up to 2^12)",
      [digits(1, 103, 2 ** 12)[2 ** n - 1] for n in range(1, 13)] == yd[:12], True)


# ---- P14: six points on a circle ----------------------------------------------------------------------------
def six_points(a, b, c):
    """Exact where possible: returns (R^2, OA0^2, A0H^2, r^2) from the vector formulas, plus a coordinate check."""
    s = F(a + b + c, 2)
    area2 = s * (s - a) * (s - b) * (s - c)
    R2 = F(a * b * c) ** 2 / (16 * area2)
    OA0 = R2 - F(a * a, 4)
    A0H = 4 * R2 - F(a * a, 4) - F(b * b + c * c, 2)
    r2 = 5 * R2 - F(a * a + b * b + c * c, 2)
    # coordinates (floats): B = (0,0), C = (a,0)
    x = (c * c - b * b + a * a) / (2 * a)
    A, B, C = (x, math.sqrt(c * c - x * x)), (0.0, 0.0), (float(a), 0.0)
    ox = a / 2
    oy = (A[0] ** 2 + A[1] ** 2 - a * A[0]) / (2 * A[1])
    H = (A[0] + B[0] + C[0] - 2 * ox, A[1] + B[1] + C[1] - 2 * oy)
    pts = []
    for P, Q in ((B, C), (C, A), (A, B)):
        M = ((P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2)
        rad = math.dist(M, H)
        ux, uy = (Q[0] - P[0]) / math.dist(P, Q), (Q[1] - P[1]) / math.dist(P, Q)
        pts += [(M[0] + rad * ux, M[1] + rad * uy), (M[0] - rad * ux, M[1] - rad * uy)]
    dists = [math.dist((ox, oy), p) ** 2 for p in pts]
    return R2, OA0, A0H, r2, max(dists) - min(dists) < 1e-9, sum(dists) / 6


R2, OA0, A0H, r2, same, coord = six_points(14, 15, 13)
check("P14 Step 1", F(8) ** 2 * R2, 65 ** 2)
check("P14 Step 2", 64 * OA0, 1089)
check("P14 Step 3", 64 * A0H, 1156)
check("P14 Step 4", (64 * r2, same, round(coord * 64, 6)), (2245, True, 2245.0))
R2, OA0, A0H, r2, same, coord = six_points(7, 8, 9)
check("P14 Challenge", (4 * r2, same, round(coord * 4, 6)), (53, True, 53.0))
check("P14 Challenge R^2", R2, F(441, 20))
check("P14 symmetric formula for each side choice", len({six_points(*p)[3] for p in ((7, 8, 9), (8, 9, 7), (9, 7, 8))}), 1)


# ---- P15: equal divisor counts ------------------------------------------------------------------------------
def d(m):
    return sum(2 if i * i != m else 1 for i in range(1, isqrt(m) + 1) if m % i == 0)


def multiplier(n, k, limit=20000):
    return next((s for s in range(1, limit) if d(s * n) == d(s * k)), None)


check("P15 Step 1", (d(12), d(18), d(12) + d(18)), (6, 6, 12))
small = [(n, k) for n in range(1, 7) for k in range(n + 1, 7) if k % n]
check("P15 Step 2", (len(small), all(multiplier(n, k) for n, k in small)), (7, True))
check("P15 Step 3", (multiplier(8, 12), d(72), d(108)), (9, 12, 12))
divisible = [(n, k) for n in range(1, 31) for k in range(n + 1, 31) if k % n == 0]
check("P15 Step 4", (len(divisible), sum(30 // n - 1 for n in range(1, 31)), sum(30 // n for n in range(1, 31))), (81, 81, 111))
pairs = [(n, k) for n in range(1, 31) for k in range(n + 1, 31) if k % n]
check("P15 Challenge: every non-divisible pair has a multiplier", all(multiplier(n, k) for n, k in pairs), True)
check("P15 divisible pairs never balanced (s < 3000)", all(d(s * k) > d(s * n) for n, k in divisible for s in range(1, 3000, 7)), True)
check("P15 Challenge", (len(pairs), comb(30, 2) - 81), (354, 354))


# ---- P16: powers on both sides ------------------------------------------------------------------------------
def solutions(nmax):
    out = []
    for n in range(nmax + 1):
        b = 2 ** (n + 1) - 1
        D = b * b - 8 * 3 ** n
        if D >= 0 and isqrt(D) ** 2 == D:
            for m in {(b + isqrt(D)) // 2, (b - isqrt(D)) // 2}:
                if m > 0 and m * m + 2 * 3 ** n == m * b:
                    out.append((m, n))
    return sorted(out)


def v3(x):
    c = 0
    while x % 3 == 0:
        x //= 3
        c += 1
    return c


check("P16 Step 1", ([m for m in range(1, 100) if m * m + 54 == 15 * m], 6 + 9), ([6, 9], 15))
check("P16 Step 2", ([m for m in range(1, 200) if m * m + 2 * 243 == 63 * m], 9 * 54, 9 + 54), ([9, 54], 486, 63))
check("P16 Step 3", (v3(2 ** 18 - 1), 2 ** 18 - 1, (2 ** 18 - 1) // 27), (3, 262143, 9709))
check("P16 Step 4", len([p for p in solutions(5)]), 4)
check("P16 LTE: v3(64^r - 1) = 2 + v3(r) for r <= 200", all(v3(64 ** r - 1) == 2 + v3(r) for r in range(1, 201)), True)
check("P16 all solutions with n <= 300", solutions(300), [(6, 3), (9, 3), (9, 5), (54, 5)])
check("P16 Challenge", sum(m + n for m, n in solutions(300)), 94)

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
