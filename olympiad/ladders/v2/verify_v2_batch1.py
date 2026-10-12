"""Recompute every answer and number in LADDERS_v2_batch1.md (ladders P2-P6).
Run: python3 ladders/v2/verify_v2_batch1.py"""

import math
from fractions import Fraction as F
from itertools import product
from math import gcd, isqrt, prod

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


def is_prime(x):
    return x > 1 and all(x % p for p in range(2, isqrt(x) + 1))


PRIMES = [p for p in range(2, 1000) if is_prime(p)]


# ---- P2: the floor table ---------------------------------------------------------------------------------
def S(n):
    return sum((i * j) // (n + 1) for i in range(1, n + 1) for j in range(1, n + 1))


def D(n):
    return sum(1 for i in range(1, n + 1) for j in range(1, n + 1) if (i * j) % (n + 1) == 0)


def D_by_gcd(n):
    """For each i, ij is divisible by n + 1 exactly when j is a multiple of (n + 1)/gcd(i, n + 1)."""
    return sum(n // ((n + 1) // gcd(i, n + 1)) for i in range(1, n + 1))


check("P2 Step 1: S(4)", S(4), 12)
check("P2 Step 2: column 3, n = 6", [(3 * i) // 7 for i in range(1, 7)], [0, 0, 1, 1, 2, 2])
check("P2 Step 3: S(12)", (S(12), 6 * sum(range(12))), (396, 396))
check("P2 Step 4: D(11)", (D(11), D_by_gcd(11)), (17, 17))
check("P2 Step 5: S(11) from the formula", (S(11), (121 * 10 + 2 * 17) // 4), (311, 311))
check("P2 formula 4S = n^2(n-1) + 2D for n <= 60", all(4 * S(n) == n * n * (n - 1) + 2 * D(n) for n in range(1, 61)), True)
check("P2 D(2025) by gcd", D_by_gcd(2025), 2024)
check("P2 D(2025) by the argument (1012 + 1012)",
      sum(1 for j in range(1, 2026) if (1013 * j) % 2026 == 0) * 2, 2024)
check("P2 Challenge", 2025 ** 2 * 2024 // 4 + 2024 // 2, 2074917262)
check("P2 pieces", (2025 ** 2 * 2024 // 4, 2024 // 2), (2074916250, 1012))
check("P2 proof: 4S = n^2(n-1) exactly when n + 1 is prime (n <= 60)",
      all((4 * S(n) == n * n * (n - 1)) == is_prime(n + 1) for n in range(1, 61)), True)


# ---- P3: the safe start ----------------------------------------------------------------------------------
def safe_starts(a):
    n, count = len(a), 0
    for i in range(n):
        s, ok = 0, True
        for j in range(n):
            s += a[(i + j) % n]
            if s % n == 0:
                ok = False
                break
        count += ok
    return count


def good(n):
    return all(safe_starts(a) > 0 for a in product(range(n), repeat=n) if sum(a) % n)


check("P3 Step 1", safe_starts((1, 1, 1, 2)), 1)
check("P3 Step 2", safe_starts((2, 2, 2, 2, 2, 0)), 0)
bad_a = [a for a in range(2, 12) if safe_starts((a,) * 11 + (0,)) == 0]
check("P3 Step 3", (len(bad_a), bad_a), (7, [2, 3, 4, 6, 8, 9, 10]))
check("P3 Step 3: these are the a sharing a factor with 12", bad_a, [a for a in range(2, 12) if gcd(a, 12) > 1])
check("P3 Step 4", next(k for k in range(1, 100) if 10 * k % 7 == 0), 7)
check("P3 good numbers 2..7 by full search", [n for n in range(2, 8) if good(n)], [2, 3, 5, 7])
check("P3 Challenge: sum of primes up to 100", sum(p for p in PRIMES if p <= 100), 1060)


# ---- P4: primes that add up ------------------------------------------------------------------------------
def P(n):
    ps = [p for p in PRIMES if p <= n]
    return prod(p + q for i, p in enumerate(ps) for q in ps[i + 1:])


def R(n):
    return prod(p for p in PRIMES if p <= n)


check("P4 Step 1", P(7), 302400)
check("P4 Step 1 factors", 5 * 7 * 9 * 8 * 10 * 12, 302400)
check("P4 Step 2", [(p, q) for p in PRIMES for q in PRIMES if p < q <= 13 and (p + q) % 13 == 0], [(2, 11)])
check("P4 Step 3", [r for r in PRIMES if r < 1000 and r >= 7 and is_prime(r - 2) and is_prime(r - 4)], [7])
check("P4 Step 4", [n for n in range(3, 7) if P(n) % R(n) == 0], [])
check("P4 solution: sums for n = 5, 6 are 5, 7, 8", sorted(p + q for p in (2, 3, 5) for q in (2, 3, 5) if p < q), [5, 7, 8])
good_n = [n for n in range(3, 501) if P(n) % R(n) == 0]
check("P4 all n up to 500", good_n, [7, 8, 9, 10])
check("P4 Challenge", sum(good_n), 34)


# ---- P5: square triples ----------------------------------------------------------------------------------
SQ = {s * s for s in range(1, 100)}


def triples_brute(zmax):
    return sorted((x, y, z) for z in range(1, zmax + 1) for y in range(1, z) for x in range(1, y)
                  if x + y in SQ and x + z in SQ and y + z in SQ)


def triples_from_squares(cmax=40):
    out = []
    for a in range(1, cmax):
        for b in range(a + 1, cmax):
            for c in range(b + 1, cmax):
                A, B, C = a * a, b * b, c * c
                if (A + B + C) % 2 == 0 and A + B > C:
                    out.append(((A + B - C) // 2, (A + C - B) // 2, (B + C - A) // 2, c))
    return out


check("P5 example 6, 19, 30", (6 + 19, 6 + 30, 19 + 30), (25, 36, 49))
check("P5 Step 1", [z for z in range(20, 50) if 6 + z in SQ and 19 + z in SQ], [30])
check("P5 Step 2", ((49 + 64 - 81) // 2, (49 + 81 - 64) // 2, (64 + 81 - 49) // 2), (16, 33, 48))
k = 5
check("P5 Step 3", (2 * k * k - 4 * k) + (2 * k * k + 1) + (2 * k * k + 4 * k), 151)
check("P5 Step 3 family works for k = 3..50", all(
    {(2 * k * k - 4 * k) + (2 * k * k + 1), (2 * k * k - 4 * k) + (2 * k * k + 4 * k), (2 * k * k + 1) + (2 * k * k + 4 * k)}
    <= SQ for k in range(3, 50)), True)
check("P5 Step 4", len([t for t in triples_from_squares() if t[3] <= 10]), 7)
check("P5 Step 4 by brute force (all sums <= 100)",
      len([t for t in triples_brute(100) if t[1] + t[2] <= 100]), 7)
from_sq = sorted(t[:3] for t in triples_from_squares() if t[2] <= 100)
check("P5 Challenge (from squares)", len(from_sq), 16)
check("P5 Challenge (brute force) and same list", (len(triples_brute(100)), triples_brute(100) == from_sq), (16, True))
check("P5 solution: examples are in the list", all(x in from_sq for x in [(2, 23, 98), (2, 34, 47), (6, 19, 30)]), True)


# ---- P6: the half that never ends ------------------------------------------------------------------------
def T(M, cap=80):
    a = F(2 * M + 1, 2)
    for steps in range(cap):
        if a.denominator == 1:
            return steps
        a = a * math.floor(a)
    return None


def v2(x):
    c = 0
    while x % 2 == 0:
        x //= 2
        c += 1
    return c


check("P6 Step 1", T(5), 3)
check("P6 Step 1 values", (F(11, 2) * 5, F(55, 2) * 27, F(1485, 2) * 742), (F(55, 2), F(1485, 2), 550935))
check("P6 Step 2", 11 * 10 // 2 - 3, 52)
check("P6 identity b' - 3 = (b - 3)(b + 2)/2 (odd b < 1000)",
      all(b * (b - 1) // 2 - 3 == (b - 3) * (b + 2) // 2 for b in range(1, 1000, 2)), True)
check("P6 Step 3", (T(97), v2(97 - 1) + 1, v2(2 * 97 + 1 - 3)), (6, 6, 6))
check("P6 T(M) = v2(M - 1) + 1 for M = 2..1025", all(T(M) == v2(M - 1) + 1 for M in range(2, 1026)), True)
check("P6 Step 4", sum(v2(m) for m in range(1, 1025)), 1023)
check("P6 Step 4 layers", sum(1024 // 2 ** j for j in range(1, 11)), 1023)
check("P6 Challenge", sum(T(M) for M in range(2, 1026)), 2047)

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
