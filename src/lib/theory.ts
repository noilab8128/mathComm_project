// Theory cards for the Theory button in the problem window (decision 2026-10-11: our own short card per topic plus
// links, AoPS Wiki first because it is written for competition students, Wikipedia second).
// One card per subdomain (problems.category_level3; ids in docs/CATEGORIES.md). Text is our own, plain text with
// math in Unicode, kept short and literal so it can be translated to Korean later. Every link was checked to load.

export interface TheoryLink {
  label: string;
  url: string;
}

export interface TheoryCard {
  title: string;
  summary: string;
  keyIdeas: string[];
  example: string;
  links: TheoryLink[];
}

const aops = (page: string, label: string): TheoryLink => ({
  label: `AoPS Wiki: ${label}`,
  url: `https://artofproblemsolving.com/wiki/index.php/${page}`,
});
const wiki = (page: string, label: string): TheoryLink => ({
  label: `Wikipedia: ${label}`,
  url: `https://en.wikipedia.org/wiki/${page}`,
});

export const THEORY_BY_SUBDOMAIN: Record<number, TheoryCard> = {
  46: {
    title: "Equations and Inequalities",
    summary:
      "To find the smallest or largest possible value, prove a bound that holds in every case, then show one case that reaches it.",
    keyIdeas: [
      "AM–GM: for positive numbers, the average is at least the geometric mean. For two numbers, (a + b)/2 ≥ √(ab), with equality only when a = b.",
      "A square is never negative: (a − b)² ≥ 0 gives a² + b² ≥ 2ab and (a + b)² ≥ 4ab.",
      "For a fixed product, numbers that are as equal as possible give the smallest sum. For a fixed sum, they give the largest product.",
    ],
    example: "Two positive numbers have product 36. Their sum is at least 2√36 = 12, and 6 + 6 = 12 reaches it.",
    links: [
      aops("AM-GM_Inequality", "AM-GM Inequality"),
      wiki("Inequality_of_arithmetic_and_geometric_means", "AM–GM inequality"),
    ],
  },
  81: {
    title: "Primes and Prime Factorization",
    summary: "Every whole number greater than 1 is a product of primes in exactly one way (apart from order).",
    keyIdeas: [
      "A prime has exactly two divisors: 1 and itself. 2 is the only even prime.",
      "If a prime divides a product ab, it divides a or b.",
      "Parity helps: a sum of primes that are all odd has the same parity as the number of primes.",
    ],
    example: "360 = 2³ × 3² × 5. Any divisor of 360 is 2ᵃ × 3ᵇ × 5ᶜ with a ≤ 3, b ≤ 2, c ≤ 1.",
    links: [
      aops("Prime_factorization", "Prime factorization"),
      wiki("Fundamental_theorem_of_arithmetic", "Fundamental theorem of arithmetic"),
    ],
  },
  82: {
    title: "Congruences",
    summary:
      "Working modulo n means keeping only remainders after division by n. Sums and products of remainders behave like sums and products of the numbers.",
    keyIdeas: [
      "a ≡ b (mod n) means n divides a − b. You can add, subtract and multiply congruences.",
      "Powers repeat: the remainders of 2, 2², 2³, … modulo n eventually cycle. The length of the cycle of a modulo n (when a and n share no factor) is the order of a.",
      "Fermat's little theorem: if p is prime and p does not divide a, then aᵖ⁻¹ ≡ 1 (mod p).",
    ],
    example: "2¹⁰ = 1024 ≡ 1 (mod 11), so 2¹⁰⁰ = (2¹⁰)¹⁰ ≡ 1 (mod 11).",
    links: [
      aops("Modular_arithmetic/Introduction", "Modular arithmetic"),
      wiki("Modular_arithmetic", "Modular arithmetic"),
      wiki("Multiplicative_order", "Multiplicative order"),
    ],
  },
  83: {
    title: "Diophantine Equations",
    summary: "Equations where only whole-number solutions count. The tools are divisibility, remainders and size bounds.",
    keyIdeas: [
      "Look at remainders: squares leave remainder 0 or 1 modulo 4, so x² + y² can never be 3 more than a multiple of 4.",
      "Factor: if xy = N, then x and y are divisors of N, so there are only finitely many cases.",
      "Coin problems: with coins a and b that share no factor, every amount above ab − a − b can be paid, and ab − a − b cannot.",
    ],
    example: "With 3¢ and 5¢ stamps, 3 × 5 − 3 − 5 = 7¢ is the largest postage you cannot make.",
    links: [
      aops("Diophantine_equation", "Diophantine equation"),
      aops("Chicken_McNugget_Theorem", "Chicken McNugget Theorem"),
      wiki("Diophantine_equation", "Diophantine equation"),
      wiki("Coin_problem", "Coin problem"),
    ],
  },
  86: {
    title: "Permutations and Combinations",
    summary:
      "Count choices step by step: multiply when choices are made one after another, add when the cases cannot happen together.",
    keyIdeas: [
      "n different things can be ordered in n! = 1 × 2 × … × n ways.",
      "Choosing k of n things without order: C(n, k) = n! / (k! (n − k)!).",
      "Recursive counting: build an object of size n from one of size n − 1 and count the ways to add the new piece.",
    ],
    example:
      "Ways to order 4 books: 4! = 24. Ways to choose 2 of them: C(4, 2) = 6. The product 1 × 3 × 5 × … × (2n − 1) is written (2n − 1)!!.",
    links: [
      aops("Combination", "Combination"),
      wiki("Combination", "Combination"),
      wiki("Double_factorial", "Double factorial"),
    ],
  },
  87: {
    title: "Generating Functions",
    summary:
      "Pack a whole sequence of counts into one expression, then use algebra on that expression to read off the counts.",
    keyIdeas: [
      "The number of ways to get a total of k is the coefficient of xᵏ in a product of simple factors, one factor per choice.",
      "Substituting x = 1 counts everything; substituting x = −1 gives (even cases) − (odd cases).",
      "Averaging the two substitutions keeps only the cases with an even (or only those with an odd) exponent.",
    ],
    example:
      "Flipping 3 coins: (1 + x)³ = 1 + 3x + 3x² + x³, so there are 3 ways to get exactly 2 heads. At x = −1 the sum is 0: as many even-head as odd-head outcomes.",
    links: [aops("Generating_function", "Generating function"), wiki("Generating_function", "Generating function")],
  },
  103: {
    title: "Sequences and Recurrences",
    summary:
      "A recurrence defines each term from earlier terms. Compute small cases, guess a formula, then prove it by induction.",
    keyIdeas: [
      "Write out the first 6–10 terms before guessing anything.",
      "Look for a pattern in the differences, the ratios, or the binary digits of n.",
      "Prove a guessed formula by showing it satisfies the same recurrence and the same first term.",
    ],
    example: "a₁ = 1, aₙ₊₁ = 2aₙ + 1 gives 1, 3, 7, 15, …, which fits aₙ = 2ⁿ − 1; check: 2(2ⁿ − 1) + 1 = 2ⁿ⁺¹ − 1.",
    links: [aops("Recursion", "Recursion"), wiki("Recurrence_relation", "Recurrence relation")],
  },
  104: {
    title: "Functional Equations",
    summary:
      "Find every function that satisfies a rule for all inputs. Plug in special values, find what the function must do, then check that it really works.",
    keyIdeas: [
      "Try small or special inputs (0, 1, equal inputs) to get facts such as f(1) = 1.",
      "Compare two ways of computing the same value to force an inequality or equation.",
      "Always check your candidate functions in the original rule: substitution only shows what is necessary.",
    ],
    example: "If f(x + y) = f(x) + f(y) for all whole numbers, then f(2) = 2f(1), f(3) = 3f(1), and so f(n) = n·f(1).",
    links: [aops("Functional_equation", "Functional equation"), wiki("Functional_equation", "Functional equation")],
  },
  105: {
    title: "Floor and Fractional Parts",
    summary:
      "⌊x⌋ is the largest whole number not above x; {x} = x − ⌊x⌋ is the part after the point, between 0 and 1.",
    keyIdeas: [
      "⌊n/k⌋ counts the multiples of k from 1 to n.",
      "⌊x + m⌋ = ⌊x⌋ + m for a whole number m.",
      "Sums of floors are easier when you swap the order of summation: count, for each value, how many terms reach it.",
    ],
    example: "The multiples of 7 from 1 to 100 number ⌊100/7⌋ = 14.",
    links: [aops("Floor_function", "Floor function"), wiki("Floor_and_ceiling_functions", "Floor and ceiling functions")],
  },
  106: {
    title: "Divisors and Divisibility",
    summary: "The prime factorization of n tells you everything about its divisors.",
    keyIdeas: [
      "If n = p₁ᵃ × p₂ᵇ × …, the number of divisors is (a + 1)(b + 1)⋯.",
      "Divisors come in pairs d and n/d; n has an odd number of divisors exactly when it is a perfect square.",
      "To count divisors with a property (for example remainder 1 when divided by 3), split the factorization by that property.",
    ],
    example: "72 = 2³ × 3², so it has (3 + 1)(2 + 1) = 12 divisors.",
    links: [aops("Divisor_function", "Divisor function"), wiki("Divisor_function", "Divisor function")],
  },
  107: {
    title: "Digits and Number Bases",
    summary: "A number's digits are its coefficients in powers of 10 (or of another base).",
    keyIdeas: [
      "n and its digit sum leave the same remainder when divided by 9.",
      "Adding in columns: every carry lowers the digit sum by exactly 9.",
      "Other bases work the same way: in base 2 the digits are 0 and 1, and each place is worth twice the one to its right.",
    ],
    example: "s(999) + s(1) − s(1000) = 27 + 1 − 1 = 27: three carries, 9 each.",
    links: [aops("Base_numbers", "Base numbers"), wiki("Digit_sum", "Digit sum"), wiki("Positional_notation", "Positional notation")],
  },
  109: {
    title: "Invariants and Processes",
    summary:
      "When a process repeats a move, look for a quantity that never changes (an invariant) or that always moves one way (a monovariant).",
    keyIdeas: [
      "Invariant: if the move never changes a quantity, any end state must have the same value. This rules out impossible goals.",
      "Monovariant: a whole-number quantity that strictly decreases cannot decrease forever, so the process must stop.",
      "Colourings and remainders make good invariants: label cells or positions and track how many of each label a move touches.",
    ],
    example:
      "Erase two numbers a, b from a list and write a + b: the total never changes, so the last number left is the original total.",
    links: [aops("Invariant", "Invariant"), wiki("Invariant_(mathematics)", "Invariant (mathematics)")],
  },
  110: {
    title: "Extremal Combinatorics",
    summary:
      "Find the largest or smallest size something can have. You need two halves: a bound that always holds, and an example that reaches it.",
    keyIdeas: [
      "Pigeonhole principle: if more than n objects go into n boxes, some box gets at least two.",
      "Look at the extreme object (largest, smallest, first, last); it often has a special property.",
      "Build the example from small cases: patterns that double or repeat often reach the bound.",
    ],
    example: "Among any 13 people, two were born in the same month, because there are only 12 months.",
    links: [aops("Pigeonhole_Principle", "Pigeonhole Principle"), wiki("Extremal_combinatorics", "Extremal combinatorics")],
  },
  113: {
    title: "Combinatorial Geometry",
    summary: "Counting and arranging points, lines and shapes on a grid or in the plane.",
    keyIdeas: [
      "Every row (and column) is a line: a row can hold at most 2 points if no three may be in a line.",
      "Three points (x₁, y₁), (x₂, y₂), (x₃, y₃) are on one line when (x₂ − x₁)(y₃ − y₁) = (x₃ − x₁)(y₂ − y₁).",
      "Symmetric arrangements are a good place to look for examples.",
    ],
    example: "On a 3 × 3 grid, each of the 3 rows holds at most 2 points, so at most 6 points; 6 can be placed.",
    links: [wiki("No-three-in-line_problem", "No-three-in-line problem"), wiki("Discrete_geometry", "Discrete geometry")],
  },
  115: {
    title: "Triangle Centres and Circles",
    summary:
      "Special points of a triangle (circumcentre, incentre, orthocentre, centroid) and the circles through them.",
    keyIdeas: [
      "The incircle touches side BC at a point whose distance from B is s − b, where s is half the perimeter.",
      "The nine-point circle passes through the midpoints of the sides and the feet of the altitudes; its radius is half the circumradius.",
      "With vectors from the circumcentre O, the orthocentre is H = A + B + C.",
    ],
    example: "In the 3-4-5 right triangle, s = 6, so the incircle touches the hypotenuse 6 − 4 = 2 from one end.",
    links: [
      aops("Nine-point_circle", "Nine-point circle"),
      wiki("Nine-point_circle", "Nine-point circle"),
      wiki("Triangle_center", "Triangle center"),
    ],
  },
};

/** The card for a problem, by its subdomain (category_level3). Null when no card is written yet. */
export function theoryFor(subdomainId: number | null | undefined): TheoryCard | null {
  return subdomainId != null ? THEORY_BY_SUBDOMAIN[subdomainId] ?? null : null;
}
