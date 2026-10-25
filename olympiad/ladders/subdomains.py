"""
Skill-tree subdomains for olympiad problems, and the subdomain of every ladder.

The `categories` table (3 levels, see docs/CATEGORIES.md) was written for a general math catalogue and lacks the
topics olympiad problems use most. NEW_CATEGORIES adds them (ids 103+); apply with
olympiad/scripts/apply_subdomains.py. Keep src/lib/categories.ts and docs/CATEGORIES.md in sync with this list.

Rules (docs/SKILL_TREE_RULES.md): every problem has exactly one subdomain (level 3); ladder steps take the
subdomain of their Challenge.
"""

import re
from pathlib import Path

# (category_id, name, level, parent_id)
NEW_CATEGORIES = [
    (103, "Sequences and Recurrences", 3, 11),
    (104, "Functional Equations", 3, 11),
    (105, "Floor and Fractional Parts", 3, 11),
    (106, "Divisors and Divisibility", 3, 22),
    (107, "Digits and Number Bases", 3, 22),
    (108, "Combinatorial Reasoning", 2, 5),
    (109, "Invariants and Processes", 3, 108),
    (110, "Extremal Combinatorics", 3, 108),
    (111, "Pigeonhole Principle", 3, 108),
    (112, "Games and Strategies", 3, 108),
    (113, "Combinatorial Geometry", 3, 108),
    (114, "Double Counting", 3, 24),
    (115, "Triangle Centres and Circles", 3, 14),
]

# Names of the existing categories used below (ids from src/lib/categories.ts).
EXISTING = {
    1: "Algebra", 2: "Geometry", 4: "Number Theory", 5: "Combinatorics & Discrete Mathematics",
    11: "Elementary Algebra", 14: "Euclidean Geometry", 22: "Elementary Number Theory", 24: "Enumeration",
    46: "Equations and Inequalities",
    81: "Primes and Prime Factorization", 82: "Congruences", 83: "Diophantine Equations",
    86: "Permutations and Combinations", 87: "Generating Functions",
}

# Ladder key -> subdomain (level-3 category id). Keys as in the LADDERS_v0.x files.
LADDER_SUBDOMAIN = {
    # v0.1 (live)
    "0": 109,   # The Candy Game: a process that must stop
    "A": 107,   # Fibonacci Stairs: Zeckendorf representation
    "B": 83,    # Coins You Can't Make: a x + b y
    "C": 107,   # Reverse and Add: digits
    "D": 113,   # No Three in a Line: points on a grid
    "E": 83,    # Dots on a Circle: x^2 + y^2 = n
    "F": 107,   # Carries Cost Nine: digits and carries
    # v0.2 (draft)
    "G": 103,   # Stickers That Double: self-similar recursion
    "H": 106,   # Divisors Plus Three
    # v0.3 (draft)
    "I": 106, "J": 82, "K": 81, "L": 83, "M": 106, "N": 82, "AB": 83,
    "O": 110, "P": 110, "Q": 109, "R": 110, "S": 110, "T": 110, "U": 86, "V": 114, "W": 113,
    "X": 105, "Y": 106, "Z": 103,
    "AA": 115,
    # solution-path pilot (pilot_v2/PILOT_A2.md)
    "P1": 46,   # The Cheapest Bakery: minimum cost, greedy on extra costs
    # solution-path ladders, batch 1 (v2/LADDERS_v2_batch1.md)
    "P2": 105,  # The Floor Table
    "P3": 82,   # The Safe Start: running totals modulo n
    "P4": 81,   # Primes That Add Up
    "P5": 83,   # Square Triples
    "P6": 103,  # The Half That Never Ends: a recursion and 2-adic descent
    # batch 2 (v2/LADDERS_v2_batch2.md)
    "P7": 110,  # Lanterns on a Pyramid
    "P8": 106,  # Divisors That Leave 1
    "P9": 87,   # Switching Lamps: bijection + generating functions
    "P10": 104, # Functions That Grow Slowly
    "P11": 115, # The Halfway Point
    # batch 3 (v2/LADDERS_v2_batch3.md)
    "P12": 46,  # The Closest Climb: approximation by a non-decreasing list
    "P13": 82,  # Every Power of Two: digits and orders modulo n
    "P14": 115, # Six Points on a Circle
    "P15": 106, # Equal Divisor Counts
    "P16": 83,  # Powers on Both Sides
    # batch 4 (v2/LADDERS_v2_batch4.md)
    "P17": 109, # Heads Up: a colouring invariant
    "P18": 109, # The Coins of Oslo: a process with a decreasing block count
    "P19": 83,  # Coins of Powers of Two: which amounts can be paid
    "P20": 46,  # Sheets That Double: AM-GM bound
    "P21": 86,  # Weights of Three: recursive counting
    # batch 5 (v2/LADDERS_v2_batch5.md): topics that had no ladders
    "P22": 57,  # Fence Posts: Plane Figures
    "P23": 46,  # Three in a Row: Equations and Inequalities
    "P24": 45,  # Power Sums: Polynomials
    "P25": 47,  # The Cyclic Factor: Factorization
    "P26": 114, # Red Corners: Double Counting
    # batch 6 (v2/LADDERS_v2_batch6.md)
    "P27": 100, # Fair Rounding: Descriptive Statistics
    "P28": 48,  # Powers That Match: Exponents and Logarithms
    "P29": 99,  # Sorting Letters: Expected Value and Variance
    "P30": 111, # Climbing Windows: Pigeonhole Principle
    "P31": 60,  # Parallel Cuts: Congruence and Similarity
    # batch 7 (v2/LADDERS_v2_batch7.md)
    "P32": 112, # Knights and Queens: Games and Strategies
    "P33": 96,  # Red Hulls: Basic Laws of Probability
    "P34": 46,  # Shifted Fractions: Equations and Inequalities
    "P35": 90,  # Fibonacci Gaps: Trees (forest argument)
    "P36": 81,  # Divisor Chains: Primes and Prime Factorization
    # batch 8 (v2/LADDERS_v2_batch8.md)
    "P37": 97,  # No Neighbours: Conditional Probability
    "P38": 92,  # Two-Coloured Sides: Graph Coloring
    "P39": 103, # Zero Sums: Sequences and Recurrences
    "P40": 113, # Cutting Colours: Combinatorial Geometry
    "P41": 103, # The Average Crossing: Sequences and Recurrences
}


_CATEGORIES_TS = Path(__file__).resolve().parents[2] / "src" / "lib" / "categories.ts"


def _all_categories():
    """{id: (name, parent_id)} for every category in src/lib/categories.ts (the site's copy of the category file)."""
    out = {}
    if _CATEGORIES_TS.exists():
        text = _CATEGORIES_TS.read_text(encoding="utf-8")
        for cid, name, _, parent in re.findall(
                r"\{\s*id:\s*(\d+),\s*name:\s*'((?:[^'\\]|\\.)*)',\s*level:\s*(\d),\s*parent_id:\s*(null|\d+)", text):
            out[int(cid)] = (name.replace("\\'", "'"), None if parent == "null" else int(parent))
    return out


def _names():
    names = dict(EXISTING)
    names.update({cid: name for cid, (name, _) in _all_categories().items()})
    names.update({cid: name for cid, name, _, _ in NEW_CATEGORIES})
    return names


def _parent():
    parent = {cid: p for cid, (_, p) in _all_categories().items() if p is not None}
    parent.update({cid: p for cid, _, _, p in NEW_CATEGORIES})
    parent.update({46: 11, 81: 22, 82: 22, 83: 22, 86: 24, 87: 24, 11: 1, 14: 2, 22: 4, 24: 5})
    return parent


def category_chain(level3_id):
    """[(level1 id, name), (level2 id, name), (level3 id, name)] for a subdomain id."""
    names, parent = _names(), _parent()
    l2 = parent[level3_id]
    l1 = parent[l2]
    return [(l1, names[l1]), (l2, names[l2]), (level3_id, names[level3_id])]


def ladder_categories(key):
    return category_chain(LADDER_SUBDOMAIN[key])


def category_path(key):
    return " > ".join(name for _, name in ladder_categories(key))


if __name__ == "__main__":
    for k in LADDER_SUBDOMAIN:
        print(f"{k:3} {category_path(k)}")
