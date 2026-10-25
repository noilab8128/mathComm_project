"""Recompute every answer and number in LADDERS_v2_batch7.md (ladders P32-P36).
Run: python3 ladders/v2/verify_v2_batch7.py"""

import random
from fractions import Fraction as F
from itertools import combinations
from math import cos, isqrt, pi, sin, sqrt

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


# ---- P32: knights and queens ----------------------------------------------------------------------------------
MOVES = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]
cells = [(r, c) for r in range(4) for c in range(4)]
adj = {p: {(p[0] + a, p[1] + b) for a, b in MOVES if (p[0] + a, p[1] + b) in cells} for p in cells}
cyc = set()
for a in cells:
    for b in adj[a]:
        for c in adj[b] - {a}:
            for d in adj[c] - {a, b}:
                if a in adj[d]:
                    cyc.add(frozenset((a, b, c, d)))
splits = [p for p in combinations(cyc, 4) if len(set().union(*p)) == 16]
check("P32 Step 2 (the 4 x 4 knight graph splits into 4 four-cycles in exactly one way)", (len(cyc), len(splits)), (4, 1))
check("P32 each cycle has two black and two white squares", all(sum((r + c) % 2 for r, c in cy) == 2 for cy in cyc), True)
check("P32 Step 1", 64 // 2 // 2, 16)
check("P32 Step 3", (12 * 16 // 2 // 2, (12 // 4) * (16 // 4) * 4), (48, 48))
board = [(r, c) for r in range(28) for c in range(28)
         if not ((r < 4 or r >= 24) and (c < 4 or c >= 24))]
blacks = sum(1 for r, c in board if (r + c) % 2 == 0)
blocks = {(r // 4, c // 4) for r, c in board}
check("P32 Challenge (720 squares, 360 black, 45 blocks, 180 cycles)", (len(board), blacks, len(blocks), blacks // 2, len(blocks) * 4),
      (720, 360, 45, 180, 180))


# ---- P33: red hulls -------------------------------------------------------------------------------------------
pts = [(cos(2 * pi * k / 5 + pi / 2), sin(2 * pi * k / 5 + pi / 2)) for k in range(5)] + [(0.0, 0.0)]


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def hull(idx):
    P = sorted(idx, key=lambda i: pts[i])
    if len(P) < 3:
        return tuple(sorted(P))
    lo, up = [], []
    for i in P:
        while len(lo) >= 2 and cross(pts[lo[-2]], pts[lo[-1]], pts[i]) <= 0:
            lo.pop()
        lo.append(i)
    for i in reversed(P):
        while len(up) >= 2 and cross(pts[up[-2]], pts[up[-1]], pts[i]) <= 0:
            up.pop()
        up.append(i)
    return tuple(sorted(set(lo[:-1] + up[:-1])))


x = F(2, 3)
pr_tri = sum(x ** bin(m).count("1") * (1 - x) ** (6 - bin(m).count("1"))
             for m in range(64) if len(hull([i for i in range(6) if m >> i & 1])) == 3)
check("P33 no three points on a line", all(abs(cross(pts[a], pts[b], pts[c])) > 1e-9 for a, b, c in combinations(range(6), 3)), True)
check("P33 Step 1", sum(F(1, 2) ** a * F(1, 2) ** (3 - a) * n for a, n in ((0, 1), (1, 3), (2, 3), (3, 1))), 1)
around = [t for t in combinations(range(5), 3) if 5 not in hull(list(t) + [5])]
check("P33 Step 2", len(around), 5)
t0 = around[0]
p3 = sum(x ** bin(m).count("1") * (1 - x) ** (6 - bin(m).count("1")) for m in range(64)
         if hull([i for i in range(6) if m >> i & 1]) == tuple(sorted(t0)))
check("P33 Step 3", p3, F(8, 243))
p4 = sum(x ** bin(m).count("1") * (1 - x) ** (6 - bin(m).count("1")) for m in range(64)
         if hull([i for i in range(6) if m >> i & 1]) == (0, 1, 5))
check("P33 Step 4", p4, F(8, 729))
check("P33 Challenge (all 64 colourings)", (pr_tri, 5 * F(8, 243) + 15 * F(8, 729), pr_tri.numerator + pr_tri.denominator),
      (F(80, 243), F(80, 243), 323))
check("P33 hull probabilities add up to 1", sum(x ** bin(m).count("1") * (1 - x) ** (6 - bin(m).count("1")) for m in range(64)), 1)


# ---- P34: shifted fractions -----------------------------------------------------------------------------------
def abc(x, y, z):
    return x / (x - 1), y / (y - 1), z / (z - 1)


check("P34 Step 1", F(3) / (F(3) - 1), F(3, 2))
a, b, c = abc(F(2), F(3), F(1, 6))
check("P34 Step 2", a * a + b * b + c * c, F(629, 100))
random.seed(34)
ok = True
for _ in range(500):
    X = F(random.randint(2, 40), random.randint(1, 17)); Y = F(random.randint(2, 40), random.randint(1, 17))
    Z = 1 / (X * Y)
    if 1 in (X, Y, Z):
        continue
    a, b, c = abc(X, Y, Z)
    if a + b + c - 1 != a * b + b * c + c * a or a * a + b * b + c * c != (a + b + c - 1) ** 2 + 1:
        ok = False
check("P34 identities on random triples with xyz = 1", ok, True)
check("P34 Step 3", F(5, 2) - 1, F(3, 2))
s = F(19, 2)
check("P34 Challenge value", (s * s - 2 * (s - 1), (s - 1) ** 2 + 1), (F(293, 4), F(293, 4)))
A = (38 + sqrt(1036)) / 12
C = 9.5 - 2 * A
xs = [t / (t - 1) for t in (A, A, C)]
check("P34 example: a = b = (38 + sqrt 1036)/12 works", (abs(xs[0] * xs[1] * xs[2] - 1) < 1e-9, abs(2 * A + C - 9.5) < 1e-12,
                                                         abs(A * A + 2 * A * C - 8.5) < 1e-9, min(abs(A - 1), abs(C - 1)) > 0.5), (True,) * 4)
check("P34 Challenge", 293 + 4, 297)


# ---- P35: Fibonacci gaps --------------------------------------------------------------------------------------
Fib = [0, 1]
while len(Fib) < 2000:
    Fib.append(Fib[-1] + Fib[-2])
check("P35 Step 1", Fib[1] + Fib[3] + Fib[5] + Fib[7], 21)
check("P35 telescoping F1 + F3 + ... + F(2m-1) = F(2m), m <= 50", all(sum(Fib[1:2 * m:2]) == Fib[2 * m] for m in range(1, 51)), True)


def smallest(n):
    need = set(Fib[2:n + 1])
    top = Fib[n] + Fib[n - 1]
    for size in range(2, 10):
        for rest in combinations(range(1, top + 1), size - 1):
            S = (0,) + rest
            if need <= {abs(p - q) for p in S for q in S}:
                return size


check("P35 Step 3 and small cases n = 2..9 match ceil(n/2) + 1",
      [smallest(n) for n in range(2, 10)], [-(-n // 2) + 1 for n in range(2, 10)])
S = Fib[0:1997:2]
D = set()
for i in range(len(S)):
    D.add(S[i] - S[0])
    if i:
        D.add(S[i] - S[i - 1])
check("P35 Challenge construction measures F2..F1996 with 999 numbers", (len(S), set(Fib[2:1997]) <= D), (999, True))
check("P35 Challenge lower bound: 998 odd-index differences", len(set(Fib[1:1996:2])), 998)


# ---- P36: divisor chains --------------------------------------------------------------------------------------
def divisors(n):
    return sorted(d for d in range(1, n + 1) if n % d == 0)


def chain_like(n):
    d = divisors(n)
    return all((d[i + 1] + d[i + 2]) % d[i] == 0 for i in range(len(d) - 2))


def is_prime(n):
    return n > 1 and all(n % p for p in range(2, isqrt(n) + 1))


composite = [n for n in range(4, 1001) if not is_prime(n)]
check("P36 Step 1", sum(chain_like(n) for n in (4, 6, 8, 9, 10, 12)), 3)
check("P36 Step 2", divisors(40)[-4], 8)
check("P36 Step 3", sum(chain_like(n) for n in composite if n <= 100), 10)
cl = [n for n in composite if chain_like(n)]
pp = [n for n in composite if len({p for p in range(2, n + 1) if n % p == 0 and is_prime(p)}) == 1]
check("P36 chain-like composites up to 1000 are exactly the prime powers", cl == pp, True)
check("P36 Challenge", len(cl), 25)

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
