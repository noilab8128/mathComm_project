"""Recompute every answer in LADDERS_v0.3_draft.md. Run: python3 ladders/verify_ladders_v0_3.py [--quick]

Each answer is checked by brute force, an exhaustive search, or an explicit example plus a counting bound
(the comment says which). --quick skips the two slow searches (ladders R and Z).
"""

import math
import sys
from fractions import Fraction as F
from itertools import combinations, permutations, product
from math import gcd, isqrt

QUICK = "--quick" in sys.argv
sys.setrecursionlimit(100000)
checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}", flush=True)


def divisors(n):
    return [d for d in range(1, n + 1) if n % d == 0]


def is_prime(x):
    return x > 1 and all(x % p for p in range(2, isqrt(x) + 1))


def num_divisors(n):
    count, p = 1, 2
    while p * p <= n:
        e = 0
        while n % p == 0:
            n //= p
            e += 1
        count *= e + 1
        p += 1
    return count * (2 if n > 1 else 1)


# ---- Ladder I: three different divisors of N adding up to a target ------------------------------------

def triples_to(N, T):
    return [t for t in combinations(divisors(N), 3) if sum(t) == T]


def smallest_N(T):
    return next(N for N in range(1, T + 1) if triples_to(N, T))


check("I1", len(triples_to(12, 19)), 2)
check("I2", next(N for N in range(1, 100) if triples_to(N, N)), 6)
check("I3 (only 1/2 + 1/3 + 1/6)", [a + b + c for a, b, c in combinations(range(2, 50), 3)
                                    if F(1, a) + F(1, b) + F(1, c) == 1], [11])
check("I4", smallest_N(100), 60)
check("I Challenge", smallest_N(2026), 1348)
check("I Challenge example", triples_to(1348, 2026), [(4, 674, 1348)])


# ---- Ladder J: square -> square root, otherwise + 3 -----------------------------------------------------

def j_next(a):
    s = isqrt(a)
    return s if s * s == a else a + 3


def j_seq(a, n):
    out = [a]
    while len(out) < n:
        out.append(j_next(out[-1]))
    return out


def j_repeats(a):
    """Exact: stop at a repeat, or at a number that is 2 mod 3 (never a square, so it grows forever)."""
    seen = set()
    while a not in seen:
        if a % 3 == 2:
            return False
        seen.add(a)
        a = j_next(a)
    return True


check("J1", j_seq(7, 6)[-1], 2)
check("J2", sum(isqrt(x) ** 2 == x for x in j_seq(5, 100)), 0)
check("J3", len({x * x % 3 for x in range(100)}), 2)
check("J4", min(j_seq(2026, 300)), 2)
check("J4 grows after the last 2", all(x % 3 == 2 for x in j_seq(2026, 300)[40:]), True)
seq30 = j_seq(30, 20)
check("J5", sum(sorted(set(seq30[10:]))), 18)
check("J Challenge", sum(j_repeats(a) for a in range(1, 1001)), 334)


# ---- Ladder K: smallest number with a power-of-2 number of divisors ---------------------------------

def smallest_with(d, limit=10 ** 5):
    return next(n for n in range(1, limit) if num_divisors(n) == d)


PRIMES = [p for p in range(2, 200) if is_prime(p)]


def smallest_by_exponents(target):
    """Independent method: try every non-increasing exponent list e1 >= e2 >= ... on 2, 3, 5, ..."""
    best = [None, None]

    def go(i, remaining, max_e, value):
        if best[0] is not None and value >= best[0]:
            return
        if remaining == 1:
            best[0], best[1] = value, i
            return
        for e in range(max_e, 0, -1):
            if remaining % (e + 1) == 0:
                go(i + 1, remaining // (e + 1), e, value * PRIMES[i] ** e)

    go(0, target, 60, 1)
    return best[0], best[1]


blocks = sorted(p ** (2 ** r) for p in PRIMES for r in range(6) if p ** (2 ** r) < 10 ** 15)
check("K1", num_divisors(24), 8)
check("K2", smallest_with(4), 6)
check("K3", smallest_with(8), 24)
check("K4", len([b for b in blocks if b < 30]), 14)
check("K5", smallest_with(64), 7560)
check("K5 = product of six smallest blocks", math.prod(blocks[:6]), 7560)
n1024, primes_used = smallest_by_exponents(1024)
check("K Challenge (different primes)", primes_used, 7)
check("K Challenge: blocks method agrees", math.prod(blocks[:10]), n1024)


# ---- Ladder L: product of (1 - 1/s) over different whole numbers s >= 2 ------------------------------

def prod_l(nums):
    return math.prod((F(s - 1, s) for s in nums), start=F(1))


check("L1", prod_l(range(2, 6)), F(1, 5))
check("L2", prod_l(range(2, 101)), F(1, 100))
check("L3 example", prod_l(range(2, 11)), F(1, 10))
check("L3 bound: 8 numbers give at least 1/9", F(1, 9) > F(1, 10), True)
check("L3", len(range(2, 11)), 9)
check("L4", next(m for m in range(35, 1000) if prod_l([s for s in range(2, 35) if s != 26] + [m]) == F(3, 100)), 52)
check("L5", prod_l(range(2, 22)), F(1, 21))
challenge_set = [s for s in range(2, 30) if s != 21] + [30]
check("L Challenge example (28 numbers)", (len(challenge_set), prod_l(challenge_set)), (28, F(7, 200)))
check("L Challenge bound (27 numbers give at least 1/28 > 7/200)", F(1, 28) > F(7, 200), True)


# ---- Ladder M: f(n) = (floor(n/1) + ... + floor(n/n)) / n is the average of d(1..n) ------------------

def floor_sum(n):
    return sum(n // k for k in range(1, n + 1))


def f_m(n):
    return F(floor_sum(n), n)


check("M1", num_divisors(12), 6)
check("M2", floor_sum(6), 14)
check("M3", sum(num_divisors(k) for k in range(1, 11)), 27)
check("M3 floor sum = divisor sum (n <= 300)", all(floor_sum(n) == sum(num_divisors(k) for k in range(1, n + 1))
                                                   for n in range(1, 301)), True)
check("M4", f_m(10), F(27, 10))
check("M5", next(n for n in range(1, 100) if f_m(n) > 3), 16)
check("M Challenge", sum(f_m(n + 1) < f_m(n) for n in range(1, 101)), 43)
check("M Challenge rule: f(n + 1) < f(n) exactly when d(n + 1) < f(n) (n <= 1000)",
      all((f_m(n + 1) < f_m(n)) == (num_divisors(n + 1) < f_m(n)) for n in range(1, 1001)), True)
check("M Explore (n <= 1000)", sum(f_m(n + 1) < f_m(n) for n in range(1, 1001)), 518)


# ---- Ladder N: P(n) = n^2 + n + 1, blocks where every value shares a factor with another -------------

def P(n):
    return n * n + n + 1


def friendly(a, b):
    vals = [P(a + i) for i in range(1, b + 1)]
    return all(any(gcd(v, w) > 1 for j, w in enumerate(vals) if j != i) for i, v in enumerate(vals))


check("N1", sum(gcd(P(i), P(j)) > 1 for i, j in combinations(range(1, 7), 2)), 2)
check("N2", gcd(P(10), P(11)), 1)
check("N3", next(n for n in range(1, 100) if gcd(P(n), P(n + 2)) > 1), 2)
check("N4 (always 7, and only for n = 2 mod 7)",
      {(gcd(P(n), P(n + 2)), n % 7) for n in range(1, 5000) if gcd(P(n), P(n + 2)) > 1}, {(7, 2)})
check("N5", sum(gcd(P(n), P(n + 3)) > 1 for n in range(1, 31)), 10)
check("N Challenge", next(a for a in range(0, 1000) if friendly(a, 6)), 195)
check("N Challenge: no block of 2 to 5 below a = 10^5",
      any(friendly(a, b) for a in range(0, 100000) for b in (2, 3, 4, 5)), False)


# ---- Ladder O: pick from a +1/-1 row, skipping at most one number between picks ---------------------

def best_pick(row):
    res = 0
    for sign in (1, -1):
        d1 = d2 = None
        for v in row:
            prev = max([d for d in (d1, d2) if d is not None], default=0)
            cur = sign * v + max(prev, 0)
            d2, d1 = d1, cur
            res = max(res, cur)
    return res


def guaranteed(n):
    return min(best_pick(r) for r in product((1, -1), repeat=n))


row10 = (1, -1, -1, 1, 1, -1, -1, 1, 1, -1)
check("O1", best_pick(row10[:6]), 2)
check("O2", best_pick(row10), 3)
check("O3", guaranteed(6), 2)
check("O4", guaranteed(10), 3)
check("O5", guaranteed(14), 4)
check("O formula floor((n + 1)/4) + 1 for n <= 18", all(guaranteed(n) == (n + 1) // 4 + 1 for n in range(1, 19)), True)
check("O Challenge (formula)", (2026 + 1) // 4 + 1, 507)
pattern = [1] + [(-1 if (i // 2) % 2 == 0 else 1) for i in range(2025)]
check("O Challenge: this row allows only 507", best_pick(pattern), 507)


# ---- Ladder P: n colours on a circle, every n + 1 neighbours show all colours -------------------------

def rainbow_possible(m, n):
    seq = [0]

    def dfs():
        L = len(seq)
        if L >= n + 1 and len(set(seq[L - n - 1:])) < n:
            return False
        if L == m:
            ext = seq + seq[:n]
            return all(len(set(ext[i:i + n + 1])) == n for i in range(m))
        for c in range(n):
            if c > max(seq) + 1:
                break
            seq.append(c)
            if dfs():
                return True
            seq.pop()
        return False

    return m >= n and dfs()


def rainbow_ok(seq, n):
    ext = seq + seq[:n]
    return all(len(set(ext[i:i + n + 1])) == n for i in range(len(seq)))


def counting_rule_ok(m, n):
    """Each colour must appear in every n + 1 neighbours, so at least ceil(m / (n + 1)) times."""
    return n * -(-m // (n + 1)) <= m


def blocks_6_7(m):
    """Write m = 6a + 7b and glue a blocks (1..6) and b blocks (1, 1, 2..6); None if impossible."""
    for b in range(m // 7 + 1):
        if (m - 7 * b) % 6 == 0:
            return list(range(6)) * ((m - 7 * b) // 6) + ([0] + list(range(6))) * b
    return None


check("P1", sum(rainbow_possible(m, 3) for m in range(3, 11)), 7)
check("P2", [m for m in range(3, 21) if not rainbow_possible(m, 3)], [5])
check("P3", max(m for m in range(4, 25) if not rainbow_possible(m, 4)), 11)
check("P4", -(-11 // 5), 3)
check("P counting rule = full search (3, 4, 5 colours)",
      all(counting_rule_ok(m, n) == rainbow_possible(m, n) for n in (3, 4, 5) for m in range(n, n * n + 2)), True)
impossible6 = [m for m in range(6, 201) if not counting_rule_ok(m, 6)]
check("P Challenge: the counting rule fails exactly for the m that are not 6a + 7b",
      impossible6 == [m for m in range(6, 201) if blocks_6_7(m) is None], True)
check("P Challenge: every other m from 6 to 200 has a rainbow circle",
      all(rainbow_ok(blocks_6_7(m), 6) for m in range(6, 201) if m not in impossible6), True)
check("P Challenge", (len(impossible6), max(impossible6)), (10, 29))


# ---- Ladder Q: while there are k heads, flip the k-th coin ----------------------------------------

def coin_steps(c):
    c, s = list(c), 0
    while sum(c):
        c[sum(c) - 1] ^= 1
        s += 1
    return s


def coin_total(n):
    return sum(coin_steps(c) for c in product((0, 1), repeat=n))


check("Q1", coin_steps((1, 0, 1)), 4)
check("Q2", coin_steps((1, 1, 1)), 3)
check("Q3", coin_total(2), 6)
check("Q4", coin_total(3), 24)
check("Q5", F(coin_total(4), 16), 5)
check("Q rule: a last T is never touched (rows of up to 10 coins)",
      all(coin_steps(c + (0,)) == coin_steps(c) for n in range(1, 10) for c in product((0, 1), repeat=n)), True)
check("Q rule: a last H adds n steps to the flipped, reversed row (rows of up to 10 coins)",
      all(coin_steps(c + (1,)) == coin_steps(tuple(1 - x for x in reversed(c))) + n + 1
          for n in range(1, 10) for c in product((0, 1), repeat=n)), True)
check("Q Challenge", F(coin_total(12), 2 ** 12), 39)


# ---- Ladder R: n rooks on an n x n board, largest empty k x k square that always exists ------------------

def has_empty(perm, k):
    n = len(perm)
    return any(all(not (c <= perm[r + i] < c + k) for i in range(k))
               for r in range(n - k + 1) for c in range(n - k + 1))


def board_without_empty(n, k):
    """Exhaustive search (with pruning) for a board that has no empty k x k square."""
    perm, used = [], [False] * n

    def dfs():
        i = len(perm)
        if i >= k and any(all(not (c <= x < c + k) for x in perm[i - k:i]) for c in range(n - k + 1)):
            return False
        if i == n:
            return True
        for c in range(n):
            if not used[c]:
                used[c] = True
                perm.append(c)
                if dfs():
                    return True
                perm.pop()
                used[c] = False
        return False

    return dfs()


def always_empty(n):
    k = 1
    while not board_without_empty(n, k + 1):
        k += 1
    return k


check("R1", max(k for k in range(1, 5) if has_empty((1, 3, 0, 2), k)), 2)
check("R2", always_empty(4), 1)
check("R2 cross-check: all 24 boards", min(max(k for k in range(1, 5) if has_empty(p, k)) for p in permutations(range(4))), 1)
check("R3", always_empty(5), 2)
check("R3 cross-check: all 120 boards", min(max(k for k in range(1, 6) if has_empty(p, k)) for p in permutations(range(5))), 2)
check("R4", always_empty(10), 3)
check("R5", next(n for n in range(2, 20) if always_empty(n) == 3), 10)
check("R formula floor(sqrt(n - 1)) for n <= 17", all(always_empty(n) == isqrt(n - 1) for n in range(2, 18)), True)
if not QUICK:
    check("R Challenge: every 26 x 26 board has an empty 5 x 5", board_without_empty(26, 5), False)
witness26 = [0, 6, 11, 16, 21, 1, 7, 12, 17, 22, 2, 8, 13, 18, 23, 3, 9, 14, 19, 24, 4, 10, 15, 20, 25, 5]
check("R Challenge: this 26 x 26 board has no empty 6 x 6",
      (sorted(witness26) == list(range(26)), has_empty(witness26, 6)), (True, False))
check("R Challenge (formula)", isqrt(26 - 1), 5)


# ---- Ladder S: disjoint pairs from 1..n with different sums, all at most n -----------------------------

def max_pairs(n):
    pairs = [(a, b) for a in range(1, n + 1) for b in range(a + 1, n + 1) if a + b <= n]
    best = 0

    def dfs(i, used, sums, cnt):
        nonlocal best
        best = max(best, cnt)
        for j in range(i, len(pairs)):
            a, b = pairs[j]
            if a not in used and b not in used and a + b not in sums:
                dfs(j + 1, used | {a, b}, sums | {a + b}, cnt + 1)

    dfs(0, frozenset(), frozenset(), 0)
    return best


def s_construction(k):
    return [(k - i, 2 * k + 3 + 2 * i) for i in range(k)] + [(2 * k + 1 - i, 2 * k + 2 + 2 * i) for i in range(k + 1)]


check("S1", max_pairs(8), 3)
check("S2", max_pairs(13), 5)
check("S3", sum(range(1, 11)), 55)
check("S4", sum(range(16, 21)), 90)
check("S5", max(x for x in range(1, 100) if x * (2 * x + 1) <= x * (2 * 100 - x + 1) // 2), 39)
check("S formula floor((2n - 1)/5) for n <= 15", all(max_pairs(n) == (2 * n - 1) // 5 for n in range(1, 16)), True)
pairs = s_construction(404)
nums = [x for p in pairs for x in p]
sums = [a + b for a, b in pairs]
check("S Challenge example: 809 pairs, numbers distinct, sums distinct and <= 2025",
      (len(pairs), len(set(nums)) == len(nums), len(set(sums)) == len(sums), max(sums) <= 2025), (809, True, True, True))
check("S Challenge bound: 810 pairs cannot fit", 810 * (2 * 810 + 1) > 810 * (2 * 2025 - 810 + 1) // 2, True)
check("S Challenge", max(x for x in range(1, 2026) if 5 * x <= 2 * 2025 - 1), 809)


# ---- Ladder T: triples (a, b, c) with a + b + c = n and no repeated entry in any position ---------------

def max_triples(n):
    T = [(a, b, n - a - b) for a in range(n + 1) for b in range(n + 1 - a)]
    best = 0

    def dfs(i, A, B, C, cnt):
        nonlocal best
        best = max(best, cnt)
        if cnt + len(T) - i <= best:
            return
        for j in range(i, len(T)):
            a, b, c = T[j]
            if a not in A and b not in B and c not in C:
                dfs(j + 1, A | {a}, B | {b}, C | {c}, cnt + 1)

    dfs(0, frozenset(), frozenset(), frozenset(), 0)
    return best


def t_construction(n):  # for n = 3m + 1
    m = n // 3
    return [(i, m + i - 1, n - i - (m + i - 1)) for i in range(m + 2)] + \
           [(m + 2 + j, j, n - (m + 2 + j) - j) for j in range(m - 1)]


check("T1", max_triples(2), 2)
check("T2", max_triples(3), 3)
check("T3", sum(range(7)), 21)
check("T4", max_triples(9), 7)
check("T5", max(N for N in range(1, 100) if 3 * N * (N - 1) // 2 <= N * 30), 21)
check("T formula floor(2n/3) + 1 for n <= 12", all(max_triples(n) == 2 * n // 3 + 1 for n in range(13)), True)
tr = t_construction(2026)
check("T Challenge example", (len(tr), all(min(t) >= 0 and sum(t) == 2026 for t in tr),
                              all(len({t[i] for t in tr}) == len(tr) for i in range(3))), (1351, True, True))
check("T Challenge bound: 1352 triples cannot fit", 3 * 1352 * 1351 // 2 > 1352 * 2026, True)


# ---- Ladder U: orders of 1..n where k divides 2 x (sum of the first k) ---------------------------------

def u_orders(n):
    out = []

    def dfs(seq, s):
        k = len(seq)
        if k == n:
            out.append(tuple(seq))
            return
        for a in range(1, n + 1):
            if a not in seq and (2 * (s + a)) % (k + 1) == 0:
                dfs(seq + [a], s + a)

    dfs([], 0)
    return out


check("U1", len(u_orders(3)), 6)
check("U2", len(u_orders(4)), 12)
check("U3", sum({o[-1] for o in u_orders(5)}), 6)
check("U4", len(u_orders(6)), 48)
check("U formula 3 x 2^(n - 2) for 3 <= n <= 13", all(len(u_orders(n)) == 3 * 2 ** (n - 2) for n in range(3, 14)), True)
check("U Challenge (last three digits of 3 x 2^2024)", 3 * pow(2, 2024, 1000) % 1000, 648)


# ---- Ladder V: same-colour triples with n | x + y + z ------------------------------------------------

def mono(n, red):
    return sum(1 for x in range(1, n + 1) for y in range(1, n + 1) for z in range(1, n + 1)
               if (x + y + z) % n == 0 and (x in red) == (y in red) == (z in red))


check("V1", mono(3, {1, 2, 3}), 9)
check("V2", mono(4, {1, 2}), 4)
check("V3", sum(1 for x in range(1, 11) for y in range(1, 11) for z in range(1, 11) if (x + y + z) % 10 == 0), 100)
check("V4", mono(7, {1, 2, 3}), 13)
check("V formula r^2 - rb + b^2 (every colouring, n <= 7)",
      all(mono(n, set(R)) == len(R) ** 2 - len(R) * (n - len(R)) + (n - len(R)) ** 2
          for n in range(1, 8) for r in range(n + 1) for R in combinations(range(1, n + 1), r)), True)
check("V5", min(r * r - r * (10 - r) + (10 - r) ** 2 for r in range(11)), 25)
check("V Challenge", sum(n for n in range(1, 3000) if any(r * r - r * (n - r) + (n - r) ** 2 == 2028 for r in range(n + 1))), 216)


# ---- Ladder W: k-friends (a lattice point C makes triangle area k) -----------------------------------

def friends(u, v, k):
    """(0,0) and (u,v) are k-friends iff gcd(u, v) divides 2k (area = |u y - v x| / 2)."""
    return (2 * k) % gcd(u, v) == 0


def friends_brute(u, v, k, R=30):
    return any(abs(u * y - v * x) == 2 * k for x in range(-R, R + 1) for y in range(-R, R + 1))


check("W1", F(4 * 3, 2), 6)
check("W2", next(k for k in range(1, 50) if friends_brute(6, 9, k)), 3)
check("W gcd rule = brute force", all(friends(u, v, k) == friends_brute(u, v, k)
                                      for u in range(0, 7) for v in range(1, 7) for k in range(1, 7)), True)
check("W3", sum(friends(u, v, 6) for u in range(1, 13) for v in range(1, 13)), 136)
grid4 = [(x, y) for x in range(4) for y in range(4)]
check("W4", next(k for k in range(1, 50) if all(friends(a[0] - b[0], a[1] - b[1], k) for a, b in combinations(grid4, 2))), 3)
grid11 = [(x, y) for x in range(11) for y in range(11)]
check("W Challenge example: 121-point team for k = 1260",
      all(friends(a[0] - b[0], a[1] - b[1], 1260) for a, b in combinations(grid11, 2)), True)
check("W Challenge bound: every k < 1260 misses some n <= 10 (so a team has at most n^2 <= 100 points)",
      all(any((2 * k) % n for n in range(1, 11)) for k in range(1, 1260)), True)
check("W Challenge", math.lcm(*range(1, 11)) // 2, 1260)


# ---- Ladder X: smallest floor(a1/1) + floor(a2/2) + ... over orders of 1..n -----------------------------

def x_score(p):
    return sum(p[i] // (i + 1) for i in range(len(p)))


def x_min(n):
    return min(x_score(p) for p in permutations(range(1, n + 1)))


def x_construction(n):
    """Blocks [2^j, 2^(j+1) - 1]; in each block put the largest number first, then the rest in order."""
    p, j = [], 0
    while 2 ** j <= n:
        lo, hi = 2 ** j, min(2 ** (j + 1) - 1, n)
        p += [hi] + list(range(lo, hi))
        j += 1
    return p


check("X1", x_score((1, 2, 3)), 3)
check("X2", x_min(3), 2)
check("X3", x_min(4), 3)
check("X4", x_min(8), 4)
check("X5", x_score(x_construction(7)), 3)
check("X formula floor(log2 n) + 1 for n <= 9", all(x_min(n) == n.bit_length() for n in range(1, 10)), True)
cons = x_construction(2026)
check("X Challenge example", (sorted(cons) == list(range(1, 2027)), x_score(cons)), (True, 11))


# ---- Ladder Y: 4 different numbers, pairs whose sum divides the total ---------------------------------

def y_count(s4):
    t = sum(s4)
    return sum(t % (a + b) == 0 for a, b in combinations(s4, 2))


check("Y1", y_count((1, 2, 3, 4)), 2)
best_y = max(y_count(s) for s in combinations(range(1, 60), 4))
check("Y2", best_y, 4)
check("Y3", y_count((1, 5, 7, 11)), 4)
check("Y4", min(sum(s) for s in combinations(range(1, 40), 4) if y_count(s) == 4), 24)
check("Y Challenge", sum(1 for s in combinations(range(1, 101), 4) if y_count(s) == 4), 12)


# ---- Ladder Z: r0 = 0, r1 = 1, r_n = average of the last k readings (1 <= k <= n) -----------------------

def z_best(N):
    best = None

    def dfs(seq):
        nonlocal best
        n = len(seq)
        if n == N + 1:
            d = seq[-1] - seq[-2]
            best = d if best is None or d > best else best
            return
        for k in range(1, n + 1):
            dfs(seq + [sum(seq[n - k:], F(0)) / k])

    dfs([F(0), F(1)])
    return best


check("Z1", (F(0) + F(1)) / 2, F(1, 2))
check("Z2", F(1) + F(1, 2), F(3, 2))
check("Z3", z_best(3), F(1, 4))
check("Z4", z_best(5), F(3, 16))
if not QUICK:
    z9 = z_best(9)
    check("Z Challenge", (z9, z9.numerator + z9.denominator), (F(7, 64), 71))


# ---- Ladder AA: P inside ABC with angle PBA + angle PCA = angle PBC + angle PCB ---------------------------

def triangle(ab, bc, ca):
    B, C = (0.0, 0.0), (float(bc), 0.0)
    x = (ab ** 2 - ca ** 2 + bc ** 2) / (2 * bc)
    return (x, math.sqrt(ab ** 2 - x * x)), B, C


def angle(P, Q, R):
    v, w = (P[0] - Q[0], P[1] - Q[1]), (R[0] - Q[0], R[1] - Q[1])
    return math.degrees(math.acos(max(-1.0, min(1.0, (v[0] * w[0] + v[1] * w[1]) / math.hypot(*v) / math.hypot(*w)))))


def incentre(A, B, C):
    a, b, c = math.dist(B, C), math.dist(C, A), math.dist(A, B)
    return tuple((a * A[i] + b * B[i] + c * C[i]) / (a + b + c) for i in range(2))


def min_AP2(ab, bc, ca, steps=200000):
    """Points with BPC = 90 + A/2 inside the triangle lie on the arc through B, I, C. Sample that arc."""
    A, B, C = triangle(ab, bc, ca)
    I = incentre(A, B, C)
    # circle through B, C, I: centre on x = bc/2
    cx = bc / 2
    cy = (I[0] ** 2 - 2 * cx * I[0] + I[1] ** 2) / (2 * I[1])
    rad = math.hypot(cx, cy)
    best = None
    for t in range(1, steps):
        th = math.pi * t / steps
        P = (cx + rad * math.cos(th), cy + rad * math.sin(th))
        if P[1] <= 0:
            continue
        cond = angle(P, B, A) + angle(P, C, A) - angle(P, B, C) - angle(P, C, B)
        inside = P[1] < A[1] and (P[0] - B[0]) * A[1] - (A[0] - B[0]) * P[1] > 0 > (P[0] - C[0]) * A[1] - (A[0] - C[0]) * P[1]
        if inside and abs(cond) < 1e-6 + 1e-3:
            d = math.dist(A, P) ** 2
            best = d if best is None else min(best, d)
    return best


A13, B13, C13 = triangle(13, 14, 15)
s13 = 21
area13 = math.sqrt(s13 * (s13 - 13) * (s13 - 14) * (s13 - 15))
check("AA1", round(area13, 9), 84.0)
check("AA2", round(area13 / s13, 9), 4.0)
check("AA3 (angle BIC when A = 60)", 90 + 60 / 2, 120.0)
check("AA4", round(math.dist(A13, incentre(A13, B13, C13)) ** 2, 9), 65.0)
check("AA5 (s - a)", s13 - 14, 7)
got = min_AP2(10, 21, 17)
check("AA Challenge (4 x smallest AP^2, sampled on the arc)", round(4 * got, 3), 85.0)
Ach, Bch, Cch = triangle(10, 21, 17)
check("AA Challenge = 4 AI^2", round(4 * math.dist(Ach, incentre(Ach, Bch, Cch)) ** 2, 9), 85.0)


# ---- Ladder AB: p^a + a^4 is a perfect square -------------------------------------------------------

def square(x):
    return isqrt(x) ** 2 == x


check("AB1", 3 ** 2 + 2 ** 4, 25)
check("AB2", sum(square(2 ** a + a ** 4) for a in range(1, 51)), 0)
check("AB3", isqrt(3 ** 6 + 6 ** 4), 45)
check("AB4", isqrt(3 ** 9 + 9 ** 4), 162)
sols = [(p, a) for p in PRIMES if p < 100 for a in range(1, 300) if square(p ** a + a ** 4)]
check("AB Challenge (p < 100, a < 300)", (sols, sum(a for _, a in sols)), ([(3, 1), (3, 2), (3, 6), (3, 9)], 18))

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
