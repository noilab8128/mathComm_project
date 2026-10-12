# Categories 매핑 가이드

한글 이름은 `math_Category_Schema.xlsx`(2026-10-09 받음)를 따릅니다. 영어 이름은 DB의 `name`과 같고, 그 파일의 102개 이름과 DB가 정확히 일치합니다.

## 📊 실제 Supabase categories 테이블 구조

### 테이블 구조
```sql
CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 3),
  parent_id INTEGER REFERENCES categories(category_id)
);
```

### 데이터 통계
- **Level 1**: 10개 카테고리 (ID: 1-10)
- **Level 2**: 35개 카테고리 (ID: 11-44, 108)
- **Level 3**: 70개 카테고리 (ID: 45-102, 103-107, 109-115)
- **총합**: 115개 카테고리 (2026-10-09에 올림피아드 세부 분야 13개 추가, 아래 표 참고)

---

## 📋 Level 1 카테고리 (10개)

| ID | Name | 한글 |
|----|------|------|
| 1 | Algebra | 대수학 |
| 2 | Geometry | 기하학 |
| 3 | Analysis | 해석학 |
| 4 | Number Theory | 정수론 |
| 5 | Combinatorics & Discrete Mathematics | 조합론 및 이산수학 |
| 6 | Probability & Statistics | 확률 및 통계 |
| 7 | Optimization Theory | 최적화 이론 |
| 8 | Numerical Analysis | 수치해석학 |
| 9 | Cryptography | 암호학 |
| 10 | Game Theory | 게임 이론 |

---

## 📋 Level 2 카테고리 (34개)

### Algebra · 대수학 (1) - 3개
| ID | Name | 한글 | Parent |
|----|------|------|--------|
| 11 | Elementary Algebra | 기초 대수 | 1 |
| 12 | Linear Algebra | 선형 대수 | 1 |
| 13 | Abstract Algebra | 추상 대수 | 1 |

### Geometry · 기하학 (2) - 4개
| ID | Name | 한글 | Parent |
|----|------|------|--------|
| 14 | Euclidean Geometry | 유클리드 기하 | 2 |
| 15 | Analytic Geometry | 해석 기하 | 2 |
| 16 | Differential Geometry | 미분 기하 | 2 |
| 17 | Topology | 위상 수학 | 2 |

### Analysis · 해석학 (3) - 4개
| ID | Name | 한글 | Parent |
|----|------|------|--------|
| 18 | Calculus | 미적분학 | 3 |
| 19 | Complex Analysis | 복소 해석학 | 3 |
| 20 | Real Analysis | 실해석학 | 3 |
| 21 | Differential Equations | 미분 방정식 | 3 |

### Number Theory · 정수론 (4) - 2개
| ID | Name | 한글 | Parent |
|----|------|------|--------|
| 22 | Elementary Number Theory | 기초 정수론 | 4 |
| 23 | Analytic Number Theory | 해석적 정수론 | 4 |

### Combinatorics & Discrete Mathematics · 조합론 및 이산수학 (5) - 3개
| ID | Name | 한글 | Parent |
|----|------|------|--------|
| 24 | Enumeration | 경우의 수 | 5 |
| 25 | Graph Theory | 그래프 이론 | 5 |
| 26 | Logic and Set Theory | 논리학 및 집합론 | 5 |

### Probability & Statistics · 확률 및 통계 (6) - 2개
| ID | Name | 한글 | Parent |
|----|------|------|--------|
| 27 | Probability | 확률론 | 6 |
| 28 | Statistics | 통계학 | 6 |

### Optimization Theory · 최적화 이론 (7) - 4개
| ID | Name | 한글 | Parent |
|----|------|------|--------|
| 29 | Linear Programming | 선형 계획법 | 7 |
| 30 | Integer Programming | 정수 계획법 | 7 |
| 31 | Network Optimization | 네트워크 최적화 | 7 |
| 32 | Dynamic Programming | 동적 계획법 | 7 |

### Numerical Analysis · 수치해석학 (8) - 4개
| ID | Name | 한글 | Parent |
|----|------|------|--------|
| 33 | Root-finding Algorithms | 방정식의 근 찾기 | 8 |
| 34 | Numerical Integration and Differentiation | 수치 적분 및 미분 | 8 |
| 35 | Interpolation | 보간법 | 8 |
| 36 | Numerical Linear Algebra | 행렬의 수치적 계산 | 8 |

### Cryptography · 암호학 (9) - 4개
| ID | Name | 한글 | Parent |
|----|------|------|--------|
| 37 | Classical Ciphers | 고전 암호 | 9 |
| 38 | Public-key Cryptography | 공개키 암호 | 9 |
| 39 | Hash Functions | 해시 함수 | 9 |
| 40 | Cryptographic Protocols | 암호학적 프로토콜 | 9 |

### Game Theory · 게임 이론 (10) - 4개
| ID | Name | 한글 | Parent |
|----|------|------|--------|
| 41 | Zero-sum Games | 제로섬 게임 | 10 |
| 42 | Nash Equilibrium | 내쉬 균형 | 10 |
| 43 | Cooperative and Non-cooperative Games | 협력 및 비협력 게임 | 10 |
| 44 | Auction Theory | 경매 이론 | 10 |

---

## 📋 Level 3 카테고리 (59개)

### Elementary Algebra · 기초 대수 (11) - 4개
| ID | Name | 한글 |
|----|------|------|
| 45 | Polynomials | 다항식 |
| 46 | Equations and Inequalities | 방정식과 부등식 |
| 47 | Factorization | 인수분해 |
| 48 | Exponents and Logarithms | 지수와 로그 |

### Linear Algebra · 선형 대수 (12) - 4개
| ID | Name | 한글 |
|----|------|------|
| 49 | Matrices and Determinants | 행렬과 행렬식 |
| 50 | Vector Spaces | 벡터 공간 |
| 51 | Linear Transformations | 선형 변환 |
| 52 | Eigenvalues and Eigenvectors | 고유값과 고유벡터 |

### Abstract Algebra · 추상 대수 (13) - 4개
| ID | Name | 한글 |
|----|------|------|
| 53 | Group Theory | 군론 |
| 54 | Ring Theory | 환론 |
| 55 | Field Theory | 체론 |
| 56 | Galois Theory | 갈루아 이론 |

### Euclidean Geometry · 유클리드 기하 (14) - 4개
| ID | Name | 한글 |
|----|------|------|
| 57 | Plane Figures | 평면 도형 |
| 58 | Solid Figures | 입체 도형 |
| 59 | Trigonometry | 삼각법 |
| 60 | Congruence and Similarity | 합동과 닮음 |

### Analytic Geometry · 해석 기하 (15) - 3개
| ID | Name | 한글 |
|----|------|------|
| 61 | Coordinate Systems | 좌표계 |
| 62 | Equations of Lines and Planes | 직선과 평면의 방정식 |
| 63 | Conic Sections | 원뿔 곡선 |

### Differential Geometry · 미분 기하 (16) - 2개
| ID | Name | 한글 |
|----|------|------|
| 64 | Theory of Curves | 곡선론 |
| 65 | Theory of Surfaces | 곡면론 |

### Topology · 위상 수학 (17) - 2개
| ID | Name | 한글 |
|----|------|------|
| 66 | Basic Topological Concepts | 기본 위상 개념 |
| 67 | Continuity and Connectedness | 연속성과 연결성 |

### Calculus · 미적분학 (18) - 4개
| ID | Name | 한글 |
|----|------|------|
| 68 | Limits and Continuity | 극한과 연속 |
| 69 | Differentiation | 미분 |
| 70 | Integration | 적분 |
| 71 | Series | 급수 |

### Complex Analysis · 복소 해석학 (19) - 4개
| ID | Name | 한글 |
|----|------|------|
| 72 | Complex Numbers and Plane | 복소수와 복소평면 |
| 73 | Analytic Functions | 해석 함수 |
| 74 | Cauchy's Integral Theorem | 코시 적분 정리 |
| 75 | Residue Theorem | 유수 정리 |

### Real Analysis · 실해석학 (20) - 3개
| ID | Name | 한글 |
|----|------|------|
| 76 | Measure Theory | 측도론 |
| 77 | Lebesgue Integration | 르베그 적분 |
| 78 | Function Spaces | 함수 공간 |

### Differential Equations · 미분 방정식 (21) - 2개
| ID | Name | 한글 |
|----|------|------|
| 79 | Ordinary Differential Equations | 상미분 방정식 |
| 80 | Partial Differential Equations | 편미분 방정식 |

### Elementary Number Theory · 기초 정수론 (22) - 3개
| ID | Name | 한글 |
|----|------|------|
| 81 | Primes and Prime Factorization | 소수와 소인수분해 |
| 82 | Congruences | 합동식 |
| 83 | Diophantine Equations | 디오판토스 방정식 |

### Analytic Number Theory · 해석적 정수론 (23) - 2개
| ID | Name | 한글 |
|----|------|------|
| 84 | Prime Number Theorem | 소수 정리 |
| 85 | Riemann Zeta Function | 리만 제타 함수 |

### Enumeration · 경우의 수 (24) - 3개
| ID | Name | 한글 |
|----|------|------|
| 86 | Permutations and Combinations | 순열과 조합 |
| 87 | Generating Functions | 생성 함수 |
| 88 | Inclusion-Exclusion Principle | 포함-배제의 원리 |

### Graph Theory · 그래프 이론 (25) - 4개
| ID | Name | 한글 |
|----|------|------|
| 89 | Basic Properties of Graphs | 그래프의 기본 속성 |
| 90 | Trees | 트리 |
| 91 | Paths and Cycles | 경로와 순환 |
| 92 | Graph Coloring | 그래프 색칠 문제 |

### Logic and Set Theory · 논리학 및 집합론 (26) - 3개
| ID | Name | 한글 |
|----|------|------|
| 93 | Propositional Logic | 명제 논리 |
| 94 | Predicate Logic | 술어 논리 |
| 95 | Set Operations | 집합의 연산 |

### Probability · 확률론 (27) - 4개
| ID | Name | 한글 |
|----|------|------|
| 96 | Basic Laws of Probability | 확률의 기본 법칙 |
| 97 | Conditional Probability and Independence | 조건부 확률과 독립 |
| 98 | Random Variables and Distributions | 확률 변수와 분포 |
| 99 | Expected Value and Variance | 기댓값과 분산 |

### Statistics · 통계학 (28) - 3개
| ID | Name | 한글 |
|----|------|------|
| 100 | Descriptive Statistics | 기술 통계 |
| 101 | Estimation and Hypothesis Testing | 추정과 검정 |
| 102 | Regression Analysis | 회귀 분석 |

### 올림피아드 세부 분야 (스킬 트리용, ID 103-115)

기존 목록(`math_Category_Schema.xlsx`)에 없던 올림피아드 주제를 추가했습니다. 한글 이름은 제안이며 확정 전입니다. 원본 목록은 `olympiad/ladders/subdomains.py`이고, 적용은
`olympiad/scripts/apply_subdomains.py`로 합니다. 규칙은 [SKILL_TREE_RULES.md](SKILL_TREE_RULES.md) 참고.

| ID | Name | 한글 (제안) | Level | Parent |
|----|------|------|-------|--------|
| 103 | Sequences and Recurrences | 수열과 점화식 | 3 | 11 |
| 104 | Functional Equations | 함수방정식 | 3 | 11 |
| 105 | Floor and Fractional Parts | 가우스 기호와 소수 부분 | 3 | 11 |
| 106 | Divisors and Divisibility | 약수와 나누어떨어짐 | 3 | 22 |
| 107 | Digits and Number Bases | 자릿수와 진법 | 3 | 22 |
| 108 | Combinatorial Reasoning | 조합적 추론 | 2 | 5 |
| 109 | Invariants and Processes | 불변량과 과정 | 3 | 108 |
| 110 | Extremal Combinatorics | 극값 조합론 | 3 | 108 |
| 111 | Pigeonhole Principle | 비둘기집 원리 | 3 | 108 |
| 112 | Games and Strategies | 게임과 전략 | 3 | 108 |
| 113 | Combinatorial Geometry | 조합 기하 | 3 | 108 |
| 114 | Double Counting | 두 번 세기 | 3 | 24 |
| 115 | Triangle Centres and Circles | 삼각형의 중심과 원 | 3 | 14 |

---

## 🔍 카테고리 조회 쿼리

### 1. 전체 계층 구조 조회
```sql
SELECT 
  c1.category_id as level1_id,
  c1.name as level1_name,
  c2.category_id as level2_id,
  c2.name as level2_name,
  c3.category_id as level3_id,
  c3.name as level3_name
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.category_id
LEFT JOIN categories c3 ON c3.parent_id = c2.category_id
WHERE c1.level = 1
ORDER BY c1.category_id, c2.category_id, c3.category_id;
```

### 2. 특정 카테고리의 전체 경로 조회
```sql
WITH RECURSIVE category_path AS (
  SELECT 
    category_id, 
    name, 
    level, 
    parent_id,
    name::TEXT as path
  FROM categories
  WHERE category_id = 45  -- Polynomials
  
  UNION ALL
  
  SELECT 
    c.category_id, 
    c.name, 
    c.level, 
    c.parent_id,
    c.name || ' > ' || cp.path
  FROM categories c
  JOIN category_path cp ON c.category_id = cp.parent_id
)
SELECT path FROM category_path WHERE level = 1;
-- Result: "Algebra > Elementary Algebra > Polynomials"
```

### 3. 특정 Level 1의 하위 카테고리 개수
```sql
SELECT 
  c1.category_id,
  c1.name,
  COUNT(DISTINCT c2.category_id) as level2_count,
  COUNT(DISTINCT c3.category_id) as level3_count
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.category_id
LEFT JOIN categories c3 ON c3.parent_id = c2.category_id
WHERE c1.level = 1
GROUP BY c1.category_id, c1.name
ORDER BY c1.category_id;
```

---

## 💡 Admin 페이지 활용

### Admin UI에서 카테고리 선택 시

```typescript
// 1. Level 1 카테고리 로드
const level1Categories = await supabase
  .from('categories')
  .select('category_id, name')
  .eq('level', 1)
  .order('category_id');

// 2. Level 2 카테고리 로드 (Level 1 선택 후)
const level2Categories = await supabase
  .from('categories')
  .select('category_id, name')
  .eq('level', 2)
  .eq('parent_id', selectedLevel1)
  .order('category_id');

// 3. Level 3 카테고리 로드 (Level 2 선택 후)
const level3Categories = await supabase
  .from('categories')
  .select('category_id, name')
  .eq('level', 3)
  .eq('parent_id', selectedLevel2)
  .order('category_id');

// 4. 전체 경로 생성
const categoryPath = `${level1Name} > ${level2Name} > ${level3Name}`;

// 5. problems 테이블에 저장
await supabase
  .from('problems')
  .insert({
    title: problemTitle,
    category_level1: selectedLevel1,  // INTEGER: 1-10
    category_level2: selectedLevel2,  // INTEGER: 11-44
    category_level3: selectedLevel3,  // INTEGER: 45-103
    category_path: categoryPath,      // TEXT: "Algebra > Elementary Algebra > Polynomials"
    // ... 기타 필드
  });
```

---

## 📚 참고

- **categories_rows.csv** - 전체 카테고리 데이터
- **DATABASE_SCHEMA.md** - 전체 DB 스키마
- **Admin 페이지** - `/admin/problems`에서 카테고리 선택 UI 구현 필요

