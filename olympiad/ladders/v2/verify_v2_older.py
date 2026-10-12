"""Recompute the numbers in LADDERS_v2_older.md (analysis, flow, full solutions of the 7 older live ladders).
Run: python3 ladders/v2/verify_v2_older.py"""

from itertools import combinations, product
from math import ceil

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


# ---- Candy Game -----------------------------------------------------------------------------------------------
def longest(start):
    """Longest game from a 3-kid start (memoised search over sorted states)."""
    memo = {}

    def go(s):
        if s in memo:
            return memo[s]
        best = 0
        for i in range(3):
            for j in range(3):
                if s[i] >= s[j] + 2:
                    t = list(s)
                    t[i] -= 1
                    t[j] += 1
                    best = max(best, 1 + go(tuple(sorted(t))))
        memo[s] = best
        return best

    return go(tuple(sorted(start)))


def end_state(total, kids):
    q, r = divmod(total, kids)
    return sorted([q + 1] * r + [q] * (kids - r), reverse=True)


check("Candy end state 20 among 6", end_state(20, 6), [4, 4, 3, 3, 3, 3])
check("Candy Bridge 9, 4, 0", longest((9, 4, 0)), 8)
check("Candy gap - 1 rule for 3 kids up to 25 each",
      all(longest(s) == max(s) - min(s) - 1 for s in product(range(26), repeat=3) if max(s) - min(s) >= 1
          and s[0] >= s[1] >= s[2]), True)
check("Candy Challenge", 2026 - 7 - 1, 2018)
check("Candy Step 5 hint: ceil(2026/100)", ceil(2026 / 100), 21)

# ---- Fibonacci Stairs -----------------------------------------------------------------------------------------
F = [0, 1, 1]
while len(F) < 40:
    F.append(F[-1] + F[-2])
LIST = F[2:30]  # F2 = 1, F3 = 2, ...


def brute(n):
    count = [0] * (n + 1)
    count[0] = 1
    for v in LIST:
        if v > n:
            break
        for x in range(n, v - 1, -1):
            count[x] += count[x - v]
    return count


def zeckendorf(n):
    idx = []
    for i in range(29, 1, -1):
        if F[i] <= n:
            idx.append(i)
            n -= F[i]
    return idx


def by_rule(n):
    idx = zeckendorf(n)[::-1]  # smallest first
    K, S = 1, (idx[0] - 2) // 2
    for j, i in zip(idx, idx[1:]):
        d = i - j
        K, S = K + S, K * (ceil(d / 2) - 1) + S * (d // 2)
    return K + S


counts = brute(3000)
check("Fibonacci greedy form of 2026 (indices)", zeckendorf(2026), [17, 14, 9, 7, 5])
check("Fibonacci greedy terms", [F[i] for i in zeckendorf(2026)], [1597, 377, 34, 13, 5])
check("Fibonacci rule = direct count for 1..3000", all(by_rule(n) == counts[n] for n in range(1, 3001)), True)
check("Fibonacci 100 and 20 and 2026", (counts[100], counts[20], counts[2026], by_rule(2026)), (9, 1, 24, 24))
check("Fibonacci greedy 100", [F[i] for i in zeckendorf(100)], [89, 8, 3])
check("Fibonacci Step 3 hint: 1+2+3+5+8", 1 + 2 + 3 + 5 + 8, 19)

# ---- Coins You Can't Make -------------------------------------------------------------------------------------
def payable(coins, limit):
    ok = [True] + [False] * limit
    for x in range(1, limit + 1):
        ok[x] = any(x >= c and ok[x - c] for c in coins)
    return ok


ok = payable([11, 13], 200)
mins = [min(x for x in range(201) if x % 7 == r and payable([7, 11, 13], 200)[x]) for r in range(7)]
check("Coins class minimums mod 7", mins, [0, 22, 37, 24, 11, 26, 13])
pay = payable([7, 11, 13], 200)
check("Coins Challenge", max(x for x in range(201) if not pay[x]), 30)
check("Coins two-coin formula 5, 8", 5 * 8 - 5 - 8, 27)

# ---- Reverse and Add ------------------------------------------------------------------------------------------
pal = lambda x: str(x) == str(x)[::-1]
three = [n for n in range(100, 1000) if pal(n + int(str(n)[::-1]))]
check("Reverse three-digit count", len(three), 233)
no_carry = [n for n in three if (n // 100 + n % 10) <= 9 and (n // 10 % 10) <= 4]
carry = [n for n in three if n not in no_carry]
check("Reverse split: no carry 225, carry 8 (all s = 11, b = 0)",
      (len(no_carry), len(carry), {(n // 100 + n % 10, n // 10 % 10) for n in carry}), (225, 8, {(11, 0)}))
check("Reverse two-digit count", len([n for n in range(10, 100) if pal(n + int(str(n)[::-1]))]), 53)

# ---- No Three in a Line ---------------------------------------------------------------------------------------
GRID10 = ["●.●.......", ".....●..●.", "......●●..", "..●..●....", ".●.......●", "......●.●.", "●........●",
          "...●●.....", "....●..●..", ".●.●......"]
pts = [(r, c) for r, row in enumerate(GRID10) for c, ch in enumerate(row) if ch == "●"]
col = lambda a, b, c: (b[0] - a[0]) * (c[1] - a[1]) == (c[0] - a[0]) * (b[1] - a[1])
check("No three in line: live 10 x 10 example has 20 dots, no three collinear",
      (len(pts), any(col(*t) for t in combinations(pts, 3))), (20, False))

# ---- Dots on a Circle -----------------------------------------------------------------------------------------
def points(N):
    r = int(N ** 0.5) + 1
    return sum(1 for x in range(-r, r + 1) for y in range(-r, r + 1) if x * x + y * y == N)


def formula(N):
    d = [k for k in range(1, N + 1) if N % k == 0]
    return 4 * (sum(k % 4 == 1 for k in d) - sum(k % 4 == 3 for k in d))


check("Dots 25, 50, 65, 325", [points(n) for n in (25, 50, 65, 325)], [12, 12, 16, 24])
check("Dots formula = count for N <= 400", all(points(n) == formula(n) for n in range(1, 401)), True)
check("Dots 2025^2 by formula (divisors 3^i 5^j)", 4 * (sum(1 for i in range(9) for j in range(5) if i % 2 == 0)
                                                       - sum(1 for i in range(9) for j in range(5) if i % 2)), 20)
check("Dots 2025^2 = 3^8 5^4", 2025 ** 2 == 3 ** 8 * 5 ** 4, True)

# ---- Carries Cost Nine ----------------------------------------------------------------------------------------
s = lambda x: sum(map(int, str(x)))
Q = lambda x: x * x + 9 * x
vals = [s(Q(101 * 10 ** m)) for m in range(21)]
check("Carries m = 0, 1, 2 and m >= 3", (vals[:3], set(vals[3:])), ([4, 22, 13], {22}))
check("Carries Challenge", sum(vals), 435)
check("Carries Steps 3-5, Bridge", (50 + 40 - 9 * 6, s(1001 ** 3), s(1001 ** 6), s(Q(10)) - s(Q(1)), Q(1), Q(10)),
      (36, 8, 28, 9, 10, 190))

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
