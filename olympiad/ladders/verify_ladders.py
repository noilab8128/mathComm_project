"""
Recompute every answer in ladders/LADDERS_v0.1.md from scratch.

Run: python3 ladders/verify_ladders.py
Every check is brute force or exhaustive search where feasible; where a large
instance cannot be enumerated (candy 2005 / 2018, no-three-in-line 10x10), the
script checks the underlying formula on all small cases and/or verifies an
explicit witness.
"""

import itertools
import math
import sys
from functools import lru_cache

sys.setrecursionlimit(100000)
failures = []


def check(label, got, expected):
    status = "ok " if got == expected else "FAIL"
    if got != expected:
        failures.append(label)
    print(f"[{status}] {label}: got {got}, expected {expected}")


# ---------------------------------------------------------------------------
# Ladder 0 -- Candy game
# Move: a kid with at least 2 more candies than another kid gives that kid 1.
# ---------------------------------------------------------------------------

def candy_moves(state):
    s = list(state)
    out = set()
    for i in range(len(s)):
        for j in range(len(s)):
            if s[i] >= s[j] + 2:
                t = s[:]
                t[i] -= 1
                t[j] += 1
                out.add(tuple(t))
    return out


@lru_cache(None)
def candy_max(state):
    nxt = candy_moves(state)
    return 0 if not nxt else 1 + max(candy_max(t) for t in nxt)


@lru_cache(None)
def candy_min(state):
    nxt = candy_moves(state)
    return 0 if not nxt else 1 + min(candy_min(t) for t in nxt)


@lru_cache(None)
def candy_finals(state):
    nxt = candy_moves(state)
    if not nxt:
        return frozenset([state])
    return frozenset().union(*(candy_finals(t) for t in nxt))


def candy_ladder():
    f = candy_finals((7, 2, 0))
    check("Candy S1 Ana's final count (7,2,0)", {s[0] for s in f}, {3})
    f = candy_finals((9, 5, 1, 0))
    check("Candy S2 largest final count (9,5,1,0)", {max(s) for s in f}, {4})
    f = candy_finals((20, 0, 0, 0, 0, 0))
    check("Candy S3 kids ending with 4", {s.count(4) for s in f}, {2})
    check("Candy S4 fewest moves (9,5,1,0)", candy_min((9, 5, 1, 0)), 6)

    # S5: fewest moves = candies Ana must give away = start - her final share.
    # Check that formula exhaustively on small "one kid holds everything" cases.
    ok = True
    for k in range(2, 6):
        for n in range(0, 16):
            q, r = divmod(n, k)
            ana_final = q + 1 if r else q
            if candy_min(tuple([n] + [0] * (k - 1))) != n - ana_final:
                ok = False
    check("Candy S5 formula verified on small cases", ok, True)
    q, r = divmod(2026, 100)
    check("Candy S5 fewest moves, 2026 candies / 100 kids", 2026 - (q + 1 if r else q), 2005)

    check("Candy Bridge largest moves (9,4,0)", candy_max((9, 4, 0)), 8)

    # Challenge: for 3 kids, max moves = max(0, largest - smallest - 1).
    ok = all(
        candy_max((a, b, c)) == max(0, a - c - 1)
        for a in range(0, 31) for b in range(0, a + 1) for c in range(0, b + 1)
    )
    check("Candy Challenge formula verified (all starts <= 30)", ok, True)
    check("Candy Challenge answer (2026,1000,7)", 2026 - 7 - 1, 2018)

    # Explore table: 4 kids, one kid holds N.
    row = [candy_max((n, 0, 0, 0)) for n in range(1, 19)]
    check("Candy Explore 4-kid table",
          row, [0, 1, 2, 4, 5, 6, 8, 10, 11, 12, 14, 16, 17, 18, 20, 22, 23, 24])


# ---------------------------------------------------------------------------
# Ladder A -- Fibonacci stairs
# ---------------------------------------------------------------------------

FIBS = [1, 2]
while FIBS[-1] < 10000:
    FIBS.append(FIBS[-1] + FIBS[-2])


def fib_ways(n):
    @lru_cache(None)
    def w(rem, i):
        if rem == 0:
            return 1
        if i < 0 or rem < 0:
            return 0
        return w(rem - FIBS[i], i - 1) + w(rem, i - 1)
    return w(n, len(FIBS) - 1)


def greedy_terms(n):
    terms = []
    for f in reversed(FIBS):
        if f <= n:
            terms.append(f)
            n -= f
    return terms


def fibonacci_ladder():
    seq = [1, 1]
    while len(seq) < 12:
        seq.append(seq[-1] + seq[-2])
    check("Fib S1 12th term", seq[11], 144)
    check("Fib S2 greedy terms for 100", len(greedy_terms(100)), 3)
    check("Fib S3 ways to write 20", fib_ways(20), 1)
    check("Fib S4 ways to write 100", fib_ways(100), 9)
    check("Fib Challenge ways to write 2026", fib_ways(2026), 24)
    check("Fib Explore one-way numbers <= 100",
          [n for n in range(1, 101) if fib_ways(n) == 1],
          [1, 2, 4, 7, 12, 20, 33, 54, 88])


# ---------------------------------------------------------------------------
# Ladder B -- Coins you can't make
# ---------------------------------------------------------------------------

def unmakeable(coins, limit=2000):
    ok = [False] * (limit + 1)
    ok[0] = True
    for x in range(1, limit + 1):
        ok[x] = any(x >= c and ok[x - c] for c in coins)
    return [x for x in range(limit + 1) if not ok[x]]


def coins_ladder():
    check("Coins S1 largest impossible (3,5)", max(unmakeable((3, 5))), 7)
    check("Coins S2 number impossible (4,7)", len(unmakeable((4, 7))), 9)
    check("Coins S3 largest impossible (5,8)", max(unmakeable((5, 8))), 27)
    check("Coins Bridge largest impossible (6,10,15)", max(unmakeable((6, 10, 15))), 29)
    bad = unmakeable((7, 11, 13))
    check("Coins Challenge largest impossible (7,11,13)", max(bad), 30)
    frob = max(bad)
    makeable_upto_f = (frob + 1) - len(bad)
    check("Coins Wilf check n*e >= F+1 for (7,11,13)", makeable_upto_f * 3 >= frob + 1, True)


# ---------------------------------------------------------------------------
# Ladder C -- Reverse and add
# ---------------------------------------------------------------------------

def rev(n):
    return int(str(n)[::-1])


def is_pal(n):
    s = str(n)
    return s == s[::-1]


def steps_to_pal(n, cap=1000):
    for step in range(1, cap + 1):
        n = n + rev(n)
        if is_pal(n):
            return step, n
    return None, None


def reverse_add_ladder():
    check("RevAdd S1 steps for 57", steps_to_pal(57)[0], 2)
    check("RevAdd S2 steps for 87", steps_to_pal(87)[0], 4)
    check("RevAdd S3 two-digit, palindrome after 1 step",
          sum(1 for n in range(10, 100) if is_pal(n + rev(n))), 53)
    check("RevAdd Challenge three-digit, palindrome after 1 step",
          sum(1 for n in range(100, 1000) if is_pal(n + rev(n))), 233)
    check("RevAdd Explore 89", steps_to_pal(89), (24, 8813200023188))
    stuck = [n for n in range(1, 1000) if steps_to_pal(n, 300)[0] is None]
    check("RevAdd Explore unresolved below 1000 after 300 steps", len(stuck), 13)
    check("RevAdd Open 196 unresolved after 1000 steps", steps_to_pal(196)[0], None)


# ---------------------------------------------------------------------------
# Ladder D -- No three in a line
# ---------------------------------------------------------------------------

def collinear(p, q, r):
    return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]) == 0


def no3_max(n):
    cells = [(i, j) for i in range(n) for j in range(n)]
    best = [0]

    def bt(idx, chosen):
        if len(chosen) + (len(cells) - idx) <= best[0]:
            return
        if idx == len(cells):
            best[0] = max(best[0], len(chosen))
            return
        c = cells[idx]
        if all(not collinear(p, q, c) for p, q in itertools.combinations(chosen, 2)):
            bt(idx + 1, chosen + [c])
        bt(idx + 1, chosen)

    bt(0, [])
    return best[0]


def no3_count_full(n):
    pairs = list(itertools.combinations(range(n), 2))
    count = 0

    def bt(r, pts):
        nonlocal count
        if r == n:
            count += 1
            return
        for a, b in pairs:
            new = [(r, a), (r, b)]
            if any(collinear(p, q, c) for c in new for p, q in itertools.combinations(pts, 2)):
                continue
            if any(collinear(p, new[0], new[1]) for p in pts):
                continue
            bt(r + 1, pts + new)

    bt(0, [])
    return count


WITNESS_10 = [(0, 0), (0, 2), (1, 5), (1, 8), (2, 6), (2, 7), (3, 2), (3, 5), (4, 1), (4, 9),
              (5, 6), (5, 8), (6, 0), (6, 9), (7, 3), (7, 4), (8, 4), (8, 7), (9, 1), (9, 3)]


def no_three_ladder():
    check("No3 S1 3x3 max", no3_max(3), 6)
    check("No3 S3 4x4 max", no3_max(4), 8)
    check("No3 S2 5x5 max", no3_max(5), 10)
    ok = (len(set(WITNESS_10)) == 20
          and all(0 <= x < 10 and 0 <= y < 10 for x, y in WITNESS_10)
          and not any(collinear(*t) for t in itertools.combinations(WITNESS_10, 3)))
    check("No3 Challenge 10x10 witness with 20 points is valid", ok, True)
    check("No3 Explore counts n=3..6", [no3_count_full(n) for n in range(3, 7)], [2, 11, 32, 50])


# ---------------------------------------------------------------------------
# Ladder E -- Lattice points on circles
# ---------------------------------------------------------------------------

def lattice_on_circle(n):
    """Number of integer (x, y) with x^2 + y^2 = n."""
    r = math.isqrt(n)
    total = 0
    for x in range(-r, r + 1):
        y2 = n - x * x
        y = math.isqrt(y2)
        if y * y == y2:
            total += 1 if y == 0 else 2
    return total


def lattice_inside(radius):
    return sum(2 * math.isqrt(radius * radius - x * x) + 1 for x in range(-radius, radius + 1))


def circle_ladder():
    check("Circle S1 x^2+y^2=25", lattice_on_circle(25), 12)
    check("Circle S2 x^2+y^2=50", lattice_on_circle(50), 12)
    check("Circle S3 x^2+y^2=65", lattice_on_circle(65), 16)
    check("Circle S4 x^2+y^2=325", lattice_on_circle(325), 24)
    check("Circle Challenge radius 2025", lattice_on_circle(2025 ** 2), 20)
    check("Circle Explore inside radius 10/100/1000",
          [lattice_inside(r) for r in (10, 100, 1000)], [317, 31417, 3141549])


# ---------------------------------------------------------------------------
# Ladder F -- Carries cost nine (digit sums)
# ---------------------------------------------------------------------------

def digit_sum(n, base=10):
    total = 0
    while n:
        total += n % base
        n //= base
    return total


def carries(a, b, base=10):
    count = carry = 0
    while a or b or carry:
        carry = 1 if a % base + b % base + carry >= base else 0
        count += carry
        a //= base
        b //= base
    return count


def digit_sum_ladder():
    s = digit_sum
    Q = lambda x: x * x + 9 * x  # noqa: E731

    # The rule behind Steps 1-3: s(a) + s(b) - s(a + b) = 9 * carries, checked on all pairs below 1500.
    check("Digits rule s(a)+s(b)-s(a+b) = 9*carries",
          all(s(a) + s(b) - s(a + b) == 9 * carries(a, b) for a in range(1500) for b in range(1500)), True)
    check("Digits S1 s(999)+s(1)-s(1000)", s(999) + s(1) - s(1000), 27)
    check("Digits S2 s(4768)+s(1325)-s(6093)", s(4768) + s(1325) - s(4768 + 1325), 18)
    a, b = 35982342266, 75081053236
    check("Digits S3 witness: s(A)=50, s(B)=40, 6 carries",
          (s(a), s(b), carries(a, b)), (50, 40, 6))
    check("Digits S3 s(A+B)", s(a + b), 36)
    check("Digits S4 s(1001^3)", s(1001 ** 3), 8)
    check("Digits S5 s(1001^6)", s(1001 ** 6), 28)
    check("Digits Bridge s(Q(10))-s(Q(1))", s(Q(10)) - s(Q(1)), 9)
    ks = [101 * 10 ** m for m in range(21)]
    check("Digits Challenge inputs all have digit sum 2", {s(k) for k in ks}, {2})
    check("Digits Challenge values m=0..3", [s(Q(k)) for k in ks[:4]], [4, 22, 13, 22])
    check("Digits Challenge sum m=0..20", sum(s(Q(k)) for k in ks), 435)

    # Explore (Kummer): carries adding m + n in base 2 = times 2 divides C(m+n, m).
    def twos(n):
        count = 0
        while n % 2 == 0:
            n //= 2
            count += 1
        return count
    check("Digits Explore 5+3 in base 2", (carries(5, 3, 2), twos(math.comb(8, 3))), (3, 3))
    check("Digits Explore Kummer for all m, n < 200",
          all(carries(m, n, 2) == twos(math.comb(m + n, m)) for m in range(200) for n in range(200)), True)
    # Open problem examples: 4 = 11 and 256 = 100111 in base 3; no other 2^n with n <= 2000 avoids digit 2.
    def base3(n):
        return "".join(str(d) for d in reversed([int(c) for c in _digits(n, 3)]))
    check("Digits open problem 4 and 256 in base 3", (base3(4), base3(256)), ("11", "100111"))
    check("Digits open problem powers of 2 without digit 2 (n <= 2000)",
          [n for n in range(2001) if "2" not in base3(2 ** n)], [0, 2, 8])


def _digits(n, base):
    out = []
    while n:
        out.append(n % base)
        n //= base
    return out or [0]


if __name__ == "__main__":
    candy_ladder()
    fibonacci_ladder()
    coins_ladder()
    reverse_add_ladder()
    no_three_ladder()
    circle_ladder()
    digit_sum_ladder()
    print()
    print("ALL CHECKS PASSED" if not failures else f"{len(failures)} FAILED: {failures}")
    sys.exit(1 if failures else 0)
