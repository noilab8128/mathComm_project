"""Recompute every number in the "- Example:" hints (hint 1 of each ladder, decision 2026-11-20).
Run: python3 ladders/v2/verify_hint_examples.py"""

from fractions import Fraction as F
from itertools import combinations, permutations, product
from math import gcd, isqrt

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


def floor(x):
    return x.numerator // x.denominator


# P1: oven 1 with 3 loaves, then a 4th; oven 0 with 2 loaves, then a 3rd
check("P1", (3 * 3**2, 3 * 4**2, 3 * 4**2 - 3 * 3**2, 3**2 - 2**2), (27, 48, 21, 5))
# P2: n = 3, entries floor(ij/4)
table = [[(i * j) // 4 for j in range(1, 4)] for i in range(1, 4)]
check("P2 table and S(3)", (table, sum(map(sum, table))), ([[0, 0, 0], [0, 1, 1], [0, 1, 2]], 5))
# P3: beads 1, 1, 2 (n = 3)
beads = [1, 1, 2]
sums = [[sum((beads[s:] + beads[:s])[: t + 1]) for t in range(3)] for s in range(3)]
check("P3 partial sums", sums, [[1, 2, 4], [1, 3, 4], [2, 3, 4]])
check("P3 safe starts", [all(x % 3 for x in row) for row in sums], [True, False, False])
# P4: P(5), R(5)
check("P4", ((2 + 3) * (2 + 5) * (3 + 5), 2 * 3 * 5, 280 % 30 != 0), (280, 30, True))
# P5: sums 25, 64, 81
x, y, z = (25 + 64 + 81) // 2 - 81, (25 + 64 + 81) // 2 - 64, (25 + 64 + 81) // 2 - 25
check("P5", ((25 + 64 + 81) // 2, x, y, z, x + y, x + z, y + z), (85, 4, 21, 60, 25, 64, 81))
# P6: M = 3
a0 = F(7, 2); a1 = a0 * floor(a0); a2 = a1 * floor(a1)
check("P6", (a1, floor(a1), a2), (F(21, 2), 10, 105))
# P7: 3 rows, lit = top, left of row 2, right of row 3 (positions 0-based)
lit = {(0, 0), (1, 0), (2, 2)}
best = max(sum((r, c) in lit for r, c in enumerate(path))
           for path in [(0, a, a + b) for a in (0, 1) for b in (0, 1)])
check("P7 best path", best, 2)
# P8: m = 20
divs = [d for d in range(1, 21) if 20 % d == 0]
check("P8", (divs, [d % 3 for d in divs], len(divs), sum(d % 3 == 1 for d in divs)),
      ([1, 2, 4, 5, 10, 20], [1, 2, 1, 2, 1, 2], 6, 3))
# P9: n = 2, k = 2
seqs = [s for s in product(range(4), repeat=2)
        if [s.count(l) % 2 for l in range(4)] == [1, 1, 0, 0]]
check("P9", (sorted(seqs), all(max(s) < 2 for s in seqs)), ([(0, 1), (1, 0)], True))
# P10: f = 1 is slow; f(n) = 5n fails at m = n = 1
check("P10", (1 >= 1 + 1 - 1, 5 * 2, 5 + 5 * 5 - 1, 5 * 2 >= 5 + 25 - 1), (True, 10, 29, False))
# P11: AB = 5, BC = 6, CA = 9
check("P11", (F(5 + 9 - 6, 2), 5 + 6 > 9), (4, True))
# P12: list 3, 1, 2 and x = 2, 2, 2
check("P12", ([abs(2 - a) for a in (3, 1, 2)], max(abs(2 - a) for a in (3, 1, 2)), F(3 - 1, 2)), ([1, 1, 0], 1, 1))
# P13: 1/11 = 0.0909...: digit n is 0 for odd n, 9 for even n
digits = [(10**n // 11) % 10 for n in range(1, 40)]
check("P13", [digits[2**k - 1] for k in range(1, 6)], [9, 9, 9, 9, 9])
# P14: equilateral, side 2*sqrt(3): R = 2, a^2 = 12
R2, a2 = 4, 12
check("P14", (R2 - F(a2, 4), 4 * R2 - F(a2, 4) - F(a2 + a2, 2), (R2 - F(a2, 4)) + 1), (1, 1, 2))
# P15: 2 and 9 with s = 3


def d(m):
    return sum(m % k == 0 for k in range(1, m + 1))


check("P15", (d(2), d(9), d(6), d(27)), (2, 3, 4, 4))
# P16: n = 2: m^2 + 18 = 7m has discriminant 49 - 72 < 0
check("P16", (2 * 3**2, 2**3 - 1, 49 - 72 < 0, [m for m in range(1, 100) if m * m + 18 == 7 * m]), (18, 7, True, []))
# P17: 2 x 2 grid can never be all heads (a move flips TL, BR and one of TR/BL)
# every combination of moves on 2 x 2: the 2 possible moves are {TL, BR, TR} and {TL, BR, BL}; flips add mod 2
moves = [0b1011, 0b1101]  # bits: TL, TR, BL, BR
reach = {0}
for _ in range(4):
    reach |= {r ^ m for r in reach for m in moves}
check("P17 (all heads = 0b1111 never reachable)", 0b1111 in reach, False)
# P18: n = 2, k = 2, ACCA -> CCAA


def op(row, k):
    i = j = k - 1
    while i > 0 and row[i - 1] == row[k - 1]:
        i -= 1
    while j < len(row) - 1 and row[j + 1] == row[k - 1]:
        j += 1
    return row[i:j + 1] + row[:i] + row[j + 1:]


check("P18", op("ACCA", 2), "CCAA")
# P19: n = 2, coins 3 and 2
pay = {a for a in range(1, 30) if any(3 * i + 2 * j == a for i in range(11) for j in range(16))}
check("P19", (2**2 - 1, 2**2 - 2, max(set(range(1, 30)) - pay)), (3, 2, 1))
# P20: 1, 1, 1 -> 2, 2, 1
check("P20", (sum([1, 1, 1]), sum([2, 2, 1])), (3, 5))
# P21: 9 left, 1 right, 3 right is valid (9 against 4); 1 left then 9 right is not
check("P21", (9 >= 1, 9 >= 1 + 3, 1 >= 9), (True, True, False))
# P22: n = 1, unit square, posts at (+-1/2, +-1/2)
check("P22", F(1) * 1, 1)
# P23: 1/3, 1/3, 1/3, 0, 0 around a circle
v = [F(1, 3)] * 3 + [F(0)] * 2
check("P23 triples", max(v[i] + v[(i + 1) % 5] + v[(i + 2) % 5] for i in range(5)), 1)
check("P23 S", sum(v[i] * v[(i + 2) % 5] for i in range(5)), F(1, 9))
# P24: 1, 2, 3
check("P24", (1 + 2 + 3, 1 + 4 + 9, 1 * 2 + 2 * 3 + 3 * 1, 6**2, 14 + 2 * 11), (6, 14, 11, 36, 36))


def E(a, b, c):
    return a * b * (a * a - b * b) + b * c * (b * b - c * c) + c * a * (c * c - a * a)


check("P25", (1 * 2 * (1 - 4), 2 * 1 * (4 - 1), E(1, 1, 2), all(E(a, a, c) == 0 for a in range(-5, 6) for c in range(-5, 6))),
      (-6, 6, 0, True))
# P26: 2 x 2 board, only top-left red
red = {(0, 0)}
cells = [(r, c) for r in range(2) for c in range(2)]
corners = [(c1, c2, c3) for c1 in cells for c2 in cells for c3 in cells
           if c1[0] == c2[0] and c2[1] == c3[1] and c2 in red and c1 not in red and c3 not in red]
check("P26", corners, [((0, 1), (0, 0), (1, 0))])
# P27: bowls 0.3 and 1.7, 2 kg
errs = {(n, 2 - n): abs(n - F(3, 10)) + abs(2 - n - F(17, 10)) for n in range(3)}
check("P27", (errs[(0, 2)], errs[(1, 1)], min(errs.values())), (F(3, 5), F(7, 5), F(3, 5)))
# P28: x1 = 2 alone: S1 = 2 = 1^2 + 1, S2 = 4 needs a^3 = 3
check("P28", (2 == 1**2 + 1, [a for a in range(10) if a**3 == 3]), (True, []))
# P29: bca


def disorder(w):
    return sum(w[i] > w[j] for i in range(len(w)) for j in range(i + 1, len(w)))


check("P29", (disorder("bca"), "bac", disorder("bac"), disorder("abc")), (2, "bac", 1, 0))
# P30: 010111 for n = 2
w = [0, 1, 0, 1, 1, 1]
check("P30", (sum(w[0:2]), sum(w[2:4]), sum(w[0:2]) < sum(w[2:4])), (1, 1, False))
# P31: equilateral side 6, P at the centre: small triangles of side 2
check("P31", 2 + 2 + 2, 6)
# P32: 3 x 3 board, knight attacks
K = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]


def attacks(r, c, n=3):
    return sum(0 <= r + a < n and 0 <= c + b < n for a, b in K)


check("P32", (attacks(0, 0), attacks(1, 1)), (2, 0))
# P33
check("P33", F(2, 3) * F(2, 3) * F(1, 3), F(4, 27))
# P34: a = x/(x - 1)
check("P34", (F(4, 3), F(1, 2) / (F(1, 2) - 1)), (F(4) / 3, F(-1)))
# P35: {0, 1, 3}
check("P35", sorted({b - a for a, b in combinations([0, 1, 3], 2)}), [1, 2, 3])
# P36: 15
check("P36", ([k for k in range(1, 16) if 15 % k == 0], (3 + 5) % 1, (5 + 15) % 3 == 0), ([1, 3, 5, 15], 0, False))
# P37: sparse subsets of {1, 2, 3}
sub = [set(s) for r in range(4) for s in combinations([1, 2, 3], r) if all(b - a > 1 for a, b in zip(s, s[1:]))]
check("P37", sub, [set(), {1}, {2}, {3}, {1, 3}])
# P38: regular pentagon, top 0: pairs at equal distance


def dist(a, b, n=5):
    return min((a - b) % n, (b - a) % n)


check("P38", [t for t in combinations(range(1, 5), 2) if dist(0, t[0]) == dist(0, t[1])], [(1, 4), (2, 3)])
# P39: x9, x10, S3
xs = [0, 1]
for i in range(2, 11):
    k = i // 2
    xs.append(-xs[k] if i % 2 == 0 else (-1) ** k * xs[k + 1])
check("P39", (xs[9], xs[10], sum(xs[1:4])), (1, -1, 1))
# P40: R R B B R B
col = "RRBBRB"
check("P40 changes", sum(col[i] != col[(i + 1) % 6] for i in range(6)), 4)
# P41: z0 = 10
z = [10] + [k * k for k in range(1, 5)]
dd = [sum(z[: n + 1]) - n * z[n] for n in range(5)]
check("P41", (F(sum(z[:3]), 2), z[2] < F(sum(z[:3]), 2) <= z[3], dd[2], dd[3]), (F(15, 2), True, 7, -3))

# ---- older ladders ----
# Candy Game: 5 and 1 -> 4, 2 -> 3, 3 (2 moves)
check("Candy", [(5, 1), (4, 2), (3, 3)][-1], (3, 3))
# Fibonacci Stairs: 10 from {1, 2, 3, 5, 8}
ways = [s for r in range(1, 6) for s in combinations([1, 2, 3, 5, 8], r) if sum(s) == 10]
check("Fibonacci list", ways, [(2, 8), (2, 3, 5)])
# Coins: 2 and 5
pay = {a for a in range(1, 30) if any(2 * i + 5 * j == a for i in range(15) for j in range(7))}
check("Coins", (sorted(set(range(1, 30)) - pay)), [1, 3])
# Reverse and Add: 23 and 64
check("Reverse", (23 + 32, 64 + 46, 110 + int(str(110)[::-1]), str(121) == str(121)[::-1]), (55, 110, 121, True))
# No Three in a Line: (0,0), (1,2), (2,4) are on one line
check("NoThree (cross product of (1, 2) and (2, 4) is 0)", 1 * 4 - 2 * 2, 0)
# Dots on a Circle
check("Dots", (sorted((a, b) for a in range(-3, 4) for b in range(-3, 4) if a * a + b * b == 2),
               len([(a, b) for a in range(-2, 3) for b in range(-2, 3) if a * a + b * b == 1])),
      ([(-1, -1), (-1, 1), (1, -1), (1, 1)], 4))


def s(n):
    return sum(map(int, str(n)))


check("Carries", (15 + 7, s(15), s(7), s(22), s(15) + s(7) - s(22)), (22, 6, 7, 4, 9))

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
