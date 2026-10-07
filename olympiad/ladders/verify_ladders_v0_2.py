"""Recompute every answer in LADDERS_v0.2_draft.md by brute force. Run: python3 ladders/verify_ladders_v0_2.py"""

import itertools

checks = []


def check(name, got, want):
    checks.append((name, got == want))
    print(f"{'ok ' if got == want else 'FAIL'} {name}: got {got}, want {want}")


# ---- Ladder G: k stickers on day i cost k^2 * w^i -------------------------------------------------

def cheapest(n, w, days, first_day=0):
    best = None
    for xs in itertools.product(range(n + 1), repeat=days):
        if sum(xs) == n:
            cost = sum(w ** (i + first_day) * x * x for i, x in enumerate(xs))
            best = cost if best is None else min(best, cost)
    return best


check("G1", cheapest(3, 2, 2), 6)
check("G2", cheapest(4, 2, 3), 10)
check("G3", cheapest(6, 2, 7), 21)
check("G4", 9 + cheapest(6, 2, 6, first_day=1), 51)
check("G4 table", [cheapest(n, 2, 7) for n in range(7)], [0, 1, 3, 6, 10, 15, 21])


def best_by_rule(n, w):
    best = [0]
    for m in range(1, n + 1):
        best.append(min(x * x + w * best[m - x] for x in range(1, m + 1)))
    return best[n]


check("G5", best_by_rule(100, 2), 5050)
check("G5 rule = brute force (n <= 8)", [best_by_rule(n, 2) for n in range(9)],
      [cheapest(n, 2, 6) for n in range(9)])
check("G Challenge", cheapest(12, 3, 7), 100)
check("G Challenge rule", best_by_rule(12, 3), 100)


# ---- Ladder H: n is lucky if every divisor d has d + 3 prime or d + 3 | n ---------------------------

def is_prime(x):
    return x > 1 and all(x % p for p in range(2, int(x ** 0.5) + 1))


def lucky(n):
    return all(n % (d + 3) == 0 or is_prime(d + 3) for d in range(1, n + 1) if n % d == 0)


check("H example", lucky(4), True)
check("H1", sum(is_prime(d + 3) for d in (1, 2, 4, 8, 16)), 4)
check("H2", next(k for k in range(1, 30) if not is_prime(2 ** k + 3)), 5)
check("H3", sum(lucky(n) for n in range(1, 100, 2)), 0)
check("H4", max(2 ** a for a in range(30) if lucky(2 ** a)), 16)
check("H5", sum(a for a in range(25) if lucky(5 * 2 ** a)), 7)
check("H Challenge", sum(n for n in range(1, 1001) if lucky(n)), 148)

print(f"\n{sum(ok for _, ok in checks)}/{len(checks)} checks pass")
