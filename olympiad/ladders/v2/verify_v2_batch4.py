"""Recompute every answer and number in LADDERS_v2_batch4.md (ladders P17-P21).
Run: python3 ladders/v2/verify_v2_batch4.py"""

import math
from collections import deque
from itertools import combinations, permutations, product

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


# ---- P17: heads up ------------------------------------------------------------------------------------------
def moves(m, n):
    """Each move as a bitmask of the 3 flipped cells (cell (r, c) is bit r * n + c)."""
    out = []
    for r in range(m - 1):
        for c in range(n - 1):
            tl, tr, bl, br = r * n + c, r * n + c + 1, (r + 1) * n + c, (r + 1) * n + c + 1
            out += [(1 << tl) | (1 << br) | (1 << tr), (1 << tl) | (1 << br) | (1 << bl)]
    return out


def solvable(m, n):
    """All heads reachable iff the all-ones vector is in the GF(2) span of the moves."""
    basis = {}
    for v in moves(m, n):
        while v:
            h = v.bit_length() - 1
            if h not in basis:
                basis[h] = v
                break
            v ^= basis[h]
    t = (1 << (m * n)) - 1
    while t:
        h = t.bit_length() - 1
        if h not in basis:
            return False
        t ^= basis[h]
    return True


def fewest(m, n):
    goal, mv = (1 << (m * n)) - 1, moves(m, n)
    dist, q = {0: 0}, deque([0])
    while q:
        s = q.popleft()
        if s == goal:
            return dist[s]
        for v in mv:
            if s ^ v not in dist:
                dist[s ^ v] = dist[s] + 1
                q.append(s ^ v)
    return None


def label_sizes(m, n):
    return sorted(sum(1 for r in range(1, m + 1) for c in range(1, n + 1) if (r + c) % 3 == t) for t in range(3))


check("P17 Step 1", fewest(2, 3), 2)
check("P17 Step 2", label_sizes(4, 4), [5, 5, 6])
check("P17 every move flips one cell of each label (all boards up to 8 x 8)",
      all(sorted(((i // n) + 1 + (i % n) + 1) % 3 for i in range(m * n) if v >> i & 1) == [0, 1, 2]
          for m in range(2, 9) for n in range(2, 9) for v in moves(m, n)), True)
step3 = [(2, 4), (3, 5), (4, 5), (5, 6), (4, 7)]
check("P17 Step 3", (sum(solvable(*b) for b in step3), [b for b in step3 if solvable(*b)]), (2, [(3, 5), (5, 6)]))
check("P17 Step 3 class sizes as listed",
      [label_sizes(*b) for b in step3], [[2, 3, 3], [5, 5, 5], [6, 7, 7], [10, 10, 10], [9, 9, 10]])
check("P17 Step 1 moves (left square TL BR BL, right square TL BR TR) flip all six",
      moves(2, 3)[1] ^ moves(2, 3)[2], 63)
check("P17 class sizes have equal parity iff 3 | mn (m, n <= 20)",
      all((len({x % 2 for x in label_sizes(m, n)}) == 1) == (m * n % 3 == 0) for m in range(2, 21) for n in range(2, 21)),
      True)
check("P17 Step 4", fewest(3, 4), 4)
check("P17 blocks: 3 x 2 needs 2, 3 x 3 needs 5, 3 x 5 needs 7", (fewest(3, 2), fewest(3, 3), fewest(3, 5)), (2, 5, 7))
pairs = [(m, n) for m in range(2, 21) for n in range(2, 21) if solvable(m, n)]
check("P17 solvable (linear algebra) iff 3 | mn for 2 <= m, n <= 20",
      all(solvable(m, n) == (m * n % 3 == 0) for m in range(2, 21) for n in range(2, 21)), True)
check("P17 Challenge", (len(pairs), 19 * 19 - 13 * 13), (192, 192))


# ---- P18: the coins of Oslo ---------------------------------------------------------------------------------
def op(row, k):
    i = l = r = k - 1
    while l > 0 and row[l - 1] == row[i]:
        l -= 1
    while r < len(row) - 1 and row[r + 1] == row[i]:
        r += 1
    return row[l:r + 1] + row[:l] + row[r + 1:]


def at_goal(row, n):
    return len(set(row[:n])) == 1


def run(row, n, k):
    """Operations until the goal, or None if the row cycles first."""
    seen, t = set(), 0
    while not at_goal(row, n):
        if row in seen:
            return None
        seen.add(row)
        row, t = op(row, k), t + 1
    return t


def trace(row, k, count):
    out = [row]
    for _ in range(count):
        out.append(op(out[-1], k))
    return out


def blocks(row):
    return 1 + sum(row[i] != row[i + 1] for i in range(len(row) - 1))


def good(n, k):
    return all(run(''.join('A' if i in c else 'C' for i in range(2 * n)), n, k) is not None
               for c in combinations(range(2 * n), n))


check("P18 Step 1", (run("CACAACCA", 4, 5), trace("CACAACCA", 5, 4)),
      (4, ["CACAACCA", "AACACCCA", "CCCAACAA", "AACCCCAA", "CCCCAAAA"]))
check("P18 blocks never increase (n <= 5, every row and k)",
      all(blocks(op(''.join('A' if i in c else 'C' for i in range(2 * n)), k)) <=
          blocks(''.join('A' if i in c else 'C' for i in range(2 * n)))
          for n in range(1, 6) for k in range(1, 2 * n + 1) for c in combinations(range(2 * n), n)), True)
def change(row, k):
    i = l = r = k - 1
    while l > 0 and row[l - 1] == row[i]:
        l -= 1
    while r < len(row) - 1 and row[r + 1] == row[i]:
        r += 1
    kind = "first" if l == 0 else "last" if r == len(row) - 1 else "middle"
    return kind, blocks(op(row, k)) - blocks(row)


allrows = [(''.join('A' if i in c else 'C' for i in range(2 * n)), k)
           for n in range(1, 6) for k in range(1, 2 * n + 1) for c in combinations(range(2 * n), n)]
check("P18 proof problem: first block 0, middle block drops, last block never rises (n <= 5)",
      all((d == 0) if kind == "first" else (d <= -1) if kind == "middle" else (d <= 0)
          for row, k in allrows for kind, d in [change(row, k)]), True)
check("P18 Step 2", (trace("AACCAAACCC", 9, 4), run("AACCAAACCC", 5, 9)),
      (["AACCAAACCC", "CCCAACCAAA", "AAACCCAACC", "CCAAACCCAA", "AACCAAACCC"], None))
check("P18 Step 3", [k for k in range(1, 9) if good(4, k)], [4, 5, 6])
row10 = "A" * 5 + "C" * 5 + "A" * 5 + "C" * 5
stuck = [k for k in range(1, 21) if run(row10, 10, k) is None]
check("P18 Step 4", (len(stuck), stuck), (10, [1, 2, 3, 4, 5, 16, 17, 18, 19, 20]))
check("P18 Step 4: the stuck rows keep 4 blocks", all(blocks(r) == 4 for k in stuck for r in trace(row10, k, 12)), True)
check("P18 good k = n..floor((3n+1)/2) for n <= 6",
      all([k for k in range(1, 2 * n + 1) if good(n, k)] == list(range(n, (3 * n + 1) // 2 + 1)) for n in range(1, 7)),
      True)
check("P18 counterexample rows: A^(n-1) C^n A fails for k < n, A^a C^a A^b C^b fails for k > ceil(3n/2) (n <= 12)",
      all(run("A" * (n - 1) + "C" * n + "A", n, k) is None for n in range(2, 13) for k in range(1, n)) and
      all(run("A" * (n // 2) + "C" * (n // 2) + "A" * (n - n // 2) + "C" * (n - n // 2), n, k) is None
          for n in range(2, 13) for k in range((3 * n + 1) // 2 + 1, 2 * n + 1)), True)
check("P18 Challenge", ((3 * 2026 + 1) // 2, (3 * 2026 + 1) // 2 - 2026 + 1), (3039, 1014))


# ---- P19: coins of powers of two ----------------------------------------------------------------------------
def unpayable(coins, limit):
    ok = [True] + [False] * limit
    for x in range(1, limit + 1):
        ok[x] = any(x >= c and ok[x - c] for c in coins)
    return [x for x in range(1, limit + 1) if not ok[x]]


def f(n):
    coins = [2 ** n - 2 ** k for k in range(n)]
    return max(unpayable(coins, (n + 1) * 2 ** n))


check("P19 Step 1", (unpayable([7, 6, 4], 60), f(3)), ([1, 2, 3, 5, 9], 9))
check("P19 Step 2", max(unpayable([14, 12, 8], 200)[x] for x in range(len(unpayable([14, 12, 8], 200)))
                        if unpayable([14, 12, 8], 200)[x] % 2 == 0), 18)
check("P19 Step 3", (f(4), 18 + 15, 3 * 15 > 33), (33, 33, True))
g = {2: 1}
for n in range(3, 11):
    g[n] = 2 * g[n - 1] + 2 ** n - 1
check("P19 Step 4", g[7], 641)
check("P19 f(n) = (n - 2) 2^n + 1 = recursion, by listing amounts (n = 2..10)",
      all(f(n) == (n - 2) * 2 ** n + 1 == g[n] for n in range(2, 11)), True)
check("P19 f(3..6) as in the analysis", [f(n) for n in range(3, 7)], [9, 33, 97, 257])
def fewest_powers(s_, n):
    big = 2 ** (n - 1)
    return s_ // big + bin(s_ % big).count("1")


check("P19 coin count: s = j 2^n - 1 needs m + j powers of two (n <= 12, j <= 30)",
      all(fewest_powers(j * 2 ** n - 1, n) == (j + n - 2) + j for n in range(2, 13) for j in range(1, 31)), True)
def min_terms_dp(limit, n):
    """Fewest powers of two (each at most 2^(n-1)) with sum x, for every x up to limit."""
    best = [0] + [10 ** 9] * limit
    for x in range(1, limit + 1):
        best[x] = 1 + min(best[x - 2 ** e] for e in range(n) if 2 ** e <= x)
    return best


check("P19 fewest powers formula agrees with a direct search (x < 2000, n <= 7)",
      all(fewest_powers(x, n) == t for n in range(2, 8) for x, t in enumerate(min_terms_dp(1999, n))), True)
check("P19 Challenge", (f(10), 8 * 1024 + 1), (8193, 8193))


# ---- P20: sheets that double --------------------------------------------------------------------------------
def min_sum(N, steps, cap):
    """Smallest sum and product after the given steps. The sum only grows, so states with sum above cap
    (a value already reached by pairing) are dropped; returns None if nothing stays within the cap."""
    states = {tuple([1] * N)}
    for _ in range(steps):
        nxt = set()
        for s in states:
            for i, j in combinations(range(N), 2):
                t = list(s)
                t[i] = t[j] = s[i] + s[j]
                if sum(t) <= cap:
                    nxt.add(tuple(sorted(t)))
        states = nxt
    return min(sum(s) for s in states), min(math.prod(s) for s in states)


check("P20 Step 1", min_sum(4, 2, 8)[0], 8)
check("P20 Step 2", min_sum(5, 3, 10 ** 9)[1], 64)
check("P20 Step 3 (AM-GM: equal numbers 4)", (6 * 4, 4 ** 6 == 2 ** 12), (24, True))
check("P20 Step 4", min_sum(8, 12, 64)[0], 64)
check("P20 small cases match N 4^(k/N): 6 sheets after 6 and 9 steps", (min_sum(6, 6, 24)[0], min_sum(6, 9, 48)[0]), (24, 48))
check("P20 bound for 8 sheets, 12 steps", 8 * 4 ** (12 / 8), 64.0)
rounds = [1] * 12
for _ in range(5):
    rounds = [2 * x for x in rounds]
check("P20 Challenge", (sum(rounds), 12 * 2 ** (60 // 12), 5 * 6), (384, 384, 30))


# ---- P21: weights of three ----------------------------------------------------------------------------------
def placements(weights, first_fixed=None):
    total = 0
    for order in permutations(weights):
        if first_fixed is not None and order[0] != first_fixed:
            continue
        for pans in product((1, -1), repeat=len(order) - 1):
            diff, ok = order[0], True
            for w, p in zip(order[1:], pans):
                diff += p * w
                if diff < 0:
                    ok = False
                    break
            total += ok
    return total


check("P21 Step 1", placements([1, 3]), 3)
check("P21 Step 2", (placements([1, 3, 9, 27], first_fixed=27), math.factorial(3) * 2 ** 3), (48, 48))
check("P21 Step 3", placements([1, 3, 9]), 15)
check("P21 Step 3 by first weight (9, 3, 1)",
      [placements([1, 3, 9], first_fixed=w) for w in (9, 3, 1)], [8, 4, 3])
check("P21 Step 4", placements([1, 3, 9, 27, 81]), 945)
check("P21 counts are 1 x 3 x ... x (2n - 1) for n <= 7",
      all(placements([3 ** i for i in range(n)]) == math.prod(range(1, 2 * n, 2)) for n in range(1, 8)), True)
check("P21 nonempty signed sums of distinct powers of 3 are never 0 (n <= 8)",
      all(sum(s * 3 ** i for i, s in enumerate(signs)) != 0
          for signs in product((-1, 0, 1), repeat=8) if any(signs)), True)
check("P21 Challenge", math.prod(range(1, 16, 2)), 2027025)

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
