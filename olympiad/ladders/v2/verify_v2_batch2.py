"""Recompute every answer and number in LADDERS_v2_batch2.md (ladders P7-P11).
Run: python3 ladders/v2/verify_v2_batch2.py"""

import math
from collections import Counter
from fractions import Fraction as F
from itertools import product

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


# ---- P7: lanterns on a pyramid (positions 0-based inside the code) ------------------------------------------
def label_rows(lit):
    f = [1 if lit[0] == 0 else 0]
    rows = [f]
    for i in range(1, len(lit)):
        f = [max(f[q] for q in (p - 1, p) if 0 <= q < i) + (1 if lit[i] == p else 0) for p in range(i + 1)]
        rows.append(f)
    return rows


def best(lit):
    return max(label_rows(lit)[-1])


def guaranteed(n):
    return min(best(l) for l in product(*[range(i + 1) for i in range(n)]))


def dyadic(n):
    return [2 * (i - 2 ** (i.bit_length() - 1)) for i in range(1, n + 1)]


check("P7 Step 1", best([0, 1, 0, 2]), 3)
check("P7 Step 2 labels", label_rows([0, 0, 2, 1, 4]), [[1], [2, 1], [2, 2, 2], [2, 3, 2, 2], [2, 3, 3, 2, 3]])
check("P7 Step 3", guaranteed(8), 4)
check("P7 Step 4 positions (1-based)", [p + 1 for p in dyadic(7)], [1, 1, 3, 1, 3, 5, 7])
check("P7 Step 4", best(dyadic(7)), 3)
check("P7 guarantee = 1 + floor(log2 n) for n <= 8", all(guaranteed(n) == n.bit_length() for n in range(1, 9)), True)
check("P7 dyadic pattern reaches 1 + floor(log2 n) for n <= 200",
      all(best(dyadic(n)) == n.bit_length() for n in range(1, 201)), True)
check("P7 row-sum inequality s(i+1) >= s(i) + m(i) + 1 (all lightings, 7 rows)",
      all(sum(r[i + 1]) >= sum(r[i]) + max(r[i]) + 1
          for l in product(*[range(i + 1) for i in range(7)]) for r in [label_rows(l)] for i in range(6)), True)
check("P7 Challenge: 127 rows allow only 7, 128 force 8", (best(dyadic(127)), (128).bit_length(), (127).bit_length()),
      (7, 8, 7))


# ---- P8: divisors that leave 1 ------------------------------------------------------------------------------
def divisors(m):
    out, d = [], 1
    while d * d <= m:
        if m % d == 0:
            out += [d] if d * d == m else [d, m // d]
        d += 1
    return out


def tau(m):
    return len(divisors(m))


def tau1(m):
    return sum(1 for d in divisors(m) if d % 3 == 1)


def ratio_from_exponents(c, exps2):
    """10n = 3^c x (primes leaving 2 with exponents exps2) x (primes leaving 1, which cancel)."""
    B = math.prod(e + 1 for e in exps2)
    return F((c + 1) * B, -(-B // 2))


check("P8 Step 1", tau1(40), 4)
check("P8 Step 2", tau1(200), 6)
check("P8 Step 3", F(tau(810), tau1(810)), 10)
def factorize(m):
    f, p = Counter(), 2
    while p * p <= m:
        while m % p == 0:
            f[p] += 1
            m //= p
        p += 1
    if m > 1:
        f[m] += 1
    return f


def ratio_by_formula(m):
    f = factorize(m)
    c = f.pop(3, 0)
    A = math.prod(e + 1 for p, e in f.items() if p % 3 == 1)
    B = math.prod(e + 1 for p, e in f.items() if p % 3 == 2)
    return F((c + 1) * A * B, A * -(-B // 2))


check("P8 ratio formula vs direct divisor counts (10n, n < 3000)",
      all(F(tau(10 * n), tau1(10 * n)) == ratio_by_formula(10 * n) for n in range(1, 3000)), True)


def witness(v):
    """Exponents (c, exps of 2 and 5) with ratio v: even v -> 3^(v/2 - 1); odd composite v = p q -> 2^(p-1) 5^(q-1) 3^c."""
    if v % 2 == 0:
        return v // 2 - 1, (1, 1)
    p = next(d for d in range(3, v, 2) if v % d == 0)
    q = v // p
    B = p * q
    return (B + 1) // 2 - 1, (p - 1, q - 1)


def is_prime(x):
    return x > 1 and all(x % d for d in range(2, math.isqrt(x) + 1))


values = [v for v in range(1, 101) if v == 2 or (v > 3 and not is_prime(v))]
check("P8 every value up to 100 has a witness", all(ratio_from_exponents(*witness(v)) == v for v in values), True)
check("P8 odd primes and 1 never occur (B even: 2(c+1); B odd: multiple of an odd composite)",
      all(F((c + 1) * B, -(-B // 2)) != v for v in [1] + [p for p in range(3, 101) if is_prime(p)]
          for c in range(0, 200) for B in range(4, 300)
          if B % 2 == 0 or any(B % d == 0 and d >= 3 and B // d >= 3 for d in range(3, B, 2))), True)
check("P8 Step 4: smallest odd value", min(v for v in values if v % 2), 9)
check("P8 Step 4 witness 2^2 5^2 3^4", ratio_from_exponents(4, (2, 2)), 9)
check("P8 Challenge", (len(values), len([v for v in values if v % 2 == 0]), len([v for v in values if v % 2])), (75, 50, 25))


# ---- P9: switching lamps ------------------------------------------------------------------------------------
def count(n, k, restricted):
    lamps = n if restricted else 2 * n
    states = Counter({0: 1})
    for _ in range(k):
        nxt = Counter()
        for s, c in states.items():
            for l in range(lamps):
                nxt[s ^ (1 << l)] += c
        states = nxt
    return states[(1 << n) - 1]


def odd_switchings(n, k):
    return sum((-1) ** j * math.comb(n, j) * (n - 2 * j) ** k for j in range(n + 1)) // 2 ** n


check("P9 Step 1", count(1, 3, False), 4)
check("P9 Step 2", count(2, 4, True), 8)
check("P9 Step 3", (count(2, 4, False), 8 * 2 ** 2), (32, 32))
check("P9 Step 4", (count(3, 5, True), odd_switchings(3, 5), 3 * math.factorial(5) // math.factorial(3)), (60, 60, 60))
check("P9 N = 2^(k-n) M for n <= 3, k <= 9 with k - n even",
      all(count(n, k, False) == 2 ** (k - n) * count(n, k, True)
          for n in range(1, 4) for k in range(n, 10) if (k - n) % 2 == 0), True)
check("P9 M(3, 9) by the +-1 trick", (odd_switchings(3, 9), (3 ** 9 - 3 - 3 + 3 ** 9) // 8), (4920, 4920))
check("P9 Challenge", (count(3, 9, False), 64 * 4920), (314880, 314880))


# ---- P10: functions that grow slowly ------------------------------------------------------------------------
def slow_on(f, limit):
    return all(f(m + n) >= f(m) + f(f(n)) - 1 for m in range(1, limit) for n in range(1, limit))


step1 = lambda n: 1 if n <= 4 else 4
check("P10 Step 1 example is slow and has f(5) = 4, f(9) = 4", (slow_on(step1, 60), step1(5), step1(9)), (True, 4, 4))
check("P10 Step 2", 5 + 5 - 1, 9)
cands = [lambda n: max(1, n - 3), lambda n: n, lambda n: n + 1, lambda n: 2 * n]
check("P10 Step 3", sum(slow_on(f, 60) for f in cands), 2)
top10 = lambda n: n + 1 if n % 10 == 0 else n
check("P10 Step 4 function is slow, f(10) = 11", (slow_on(top10, 120), top10(10)), (True, 11))
N = 2026
check("P10 Challenge examples (j = 1, 2, 500, 2025, 2026 and the top one) are slow up to 1500",
      all(slow_on(lambda n, j=j: max(1, n + j - N), 1500) for j in (1, 2, 500, 2025, 2026)), True)
top = lambda n: n + 1 if n % N == 0 else n
check("P10 the top function is slow (m, n up to 2600) and gives 2027", (all(
    top(m + n) >= top(m) + top(top(n)) - 1 for m in range(1, 2600, 7) for n in range(1, 2600, 3)) and
    all(top(m + n) >= top(m) + top(top(n)) - 1 for m in (N, 2 * N) for n in (N, 2 * N, 1, 5)), top(N)), (True, 2027))
check("P10 Challenge", len({max(1, N + j - N) for j in range(1, N + 1)} | {top(N)}), 2027)


# ---- P11: the halfway point ---------------------------------------------------------------------------------
def figure(ab, bc, ca):
    A, C = (0.0, 0.0), (float(ca), 0.0)
    x = (ab ** 2 - bc ** 2 + ca ** 2) / (2 * ca)
    B = (x, math.sqrt(ab ** 2 - x * x))
    s = (ab + bc + ca) / 2
    AL = s - bc
    K = (B[0] * AL / ab, B[1] * AL / ab)
    L = (AL, 0.0)
    D = (2 * B[0], 0.0)  # BD = BA: reflect A in the foot of B
    BC, CD, DB = math.dist(B, C), math.dist(C, D), math.dist(D, B)
    J = tuple((CD * B[i] + DB * C[i] + BC * D[i]) / (BC + CD + DB) for i in range(2))
    dx, dy = L[0] - K[0], L[1] - K[1]
    M = J[0] - J[1] / dy * dx
    mid = (J[0] / 2, J[1] / 2)
    on_KL = abs(dx * (mid[1] - K[1]) - dy * (mid[0] - K[0])) < 1e-9
    return AL, D[0], (DB + CD - BC) / 2, M, on_KL


AL, AD, DT, AM, on = figure(13, 14, 15)
check("P11 Step 1", round(AL, 9), 7.0)
check("P11 Step 2", (round(AD, 9), float(F(66, 5))), (13.2, 13.2))
check("P11 Step 2 by cos A", F(2 * 13) * F(13 ** 2 + 15 ** 2 - 14 ** 2, 2 * 13 * 15), F(66, 5))
check("P11 Step 3", (round(DT, 9), float(F(2, 5)), F(13) + (15 - F(66, 5)) - 14), (0.4, 0.4, F(4, 5)))
check("P11 Step 4", (round(AM, 9), on), (14.0, True))
AL, AD, DT, AM, on = figure(37, 40, 45)
check("P11 Challenge (built figure)", (round(AM, 9), on), (42.0, True))
check("P11 Challenge = AB + AC - BC", 37 + 45 - 40, 42)
check("P11 Challenge triangle has C < A < 90", (37 < 40, 40 ** 2 < 37 ** 2 + 45 ** 2), (True, True))

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
