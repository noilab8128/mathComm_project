# AI Problem Generation Guide

> **Note**: This guide is used by the AI API to generate structured sub-problems based on a main problem. It defines the stage-based approach for breaking down complex problems into foundational sub-problems.

---

## 1. 문제 요약 (Problem Statement)

문제를 명확하게 정리한다.
	•	문제 원문 또는 이미지에서 필요한 핵심 내용만 추출
	•	수식은 LaTeX로 표현
	•	정의, 조건, 변수 등을 정확하게 명시

예시:

문제: 모든 양의 정수 n에 대하여
Sₙ(α) = ⌊α⌋ + ⌊2α⌋ + … + ⌊nα⌋
이 n의 배수가 되는 α를 모두 구하여라.

⸻

## 2. 문제 구조 분석 (Initial Observations)

문제를 처음 접했을 때 확인할 수 있는 기초 분석:
	•	작은 값(n)을 대입하여 패턴 관찰
	•	반복성, 대칭성, 단조성 등 구조 분석
	•	바닥 함수의 성질 파악
	•	숨겨진 함수적 규칙 탐색

예시 관찰:
	•	작은 n 테스트로부터 짝수 정수가 후보로 보일 수 있음
	•	α = 정수부 k + 소수부 ε 로 분해하면 구조가 단순해짐

⸻

## 3. 논리 흐름도 (Logical Flowchart)

풀이 전체의 핵심 논리 과정을 흐름도 형태로 표현한다.
아래 예시 구조를 문제에 맞게 수정하여 사용한다.

──────────────────────────────────────────────
Start: 문제 조건 분석
│
▼
1단계: α를 정수부 k와 소수부 ε로 분해 (α = k + ε)
│
▼
2단계: 합 Sₙ(α)을 k와 ε에 대한 항으로 재작성
│
▼
3단계: k의 짝수/홀수에 따라 케이스 분석
│
▼
4단계: ε ≠ 0이면 큰 n에서 모순 발생 → ε = 0
│
▼
Conclusion: 가능한 α 값 도출
──────────────────────────────────────────────

⸻

## 4. 단계별 서브문제 생성 (Subproblems per Stage)

각 단계에서 자연스럽게 다음 단계로 넘어갈 수 있도록
중급 난이도 서브문제를 제시한다.
초등적인 계산 문제는 제외한다.

⸻

### Stage 1: 변수 분해

**Subproblem 1.1**
α = k + ε (0 ≤ ε < 1)일 때
⌊mα⌋ = mk + ⌊mε⌋ 임을 보여라.

**Subproblem 1.2**
이를 이용하여 Sₙ(α)를
Sₙ = (k n(n+1))/2 + Σ⌊mε⌋
형태로 재작성하라.

⸻

### Stage 2: 케이스 분석 준비

**Subproblem 2.1**
k가 짝수일 때와 홀수일 때
(k n(n+1))/2 mod n 을 계산하라.

⸻

### Stage 3: ε 분석

**Subproblem 3.1**
0 < ε < 1일 때 ⌊mε⌋가 가질 수 있는 값의 범위를 설명하라.

**Subproblem 3.2**
짝수 k의 경우,
n | Σ⌊mε⌋
이 성립하려면 ε = 0이어야 함을 보이시오.

⸻

### Stage 4: 최종 결론 도출

**Subproblem 4.1**
ε = 0이어야 한다는 사실을 바탕으로 α = k임을 결론지으시오.

**Subproblem 4.2**
홀수 k가 조건을 만족할 수 없는 이유를 설명하시오.

⸻

## 5. 핵심 아이디어 정리 (Key Insights)

문제 해결에 본질적인 역할을 하는 핵심 개념을 정리한다.
	•	바닥 함수의 선형 분해:
⌊mα⌋ = mk + ⌊mε⌋
	•	α를 정수부와 소수부로 분해하는 전략
	•	모듈러 구조 분석
	•	ε ≠ 0일 때 큰 n에서 모순 발생
	•	결론적으로 α가 반드시 짝수 정수여야 함

⸻

## 6. 최종 결론 (Final Answer)

문제 조건을 만족하는 α 값을 명확하게 정리한다.

예시 결론:

최종 결론: α는 모든 짝수 정수에 대해서만 조건을 만족한다.
즉, α ∈ 2ℤ.

⸻

## 7. 확장 및 비고 (Optional)
	•	왜 다른 값(특히 홀수 정수 또는 비정수)이 모순을 일으키는지 추가 설명
	•	문제의 조건을 일반화하여 새로운 문제를 만드는 방법
	•	유사한 구조의 Olympiad 문제 아이디어 정리

⸻

## Expected JSON Output Format

When generating sub-problems based on this guide, the AI should return JSON in the following format:

```json
{
  "stages": ["Stage 1: 변수 분해", "Stage 2: 케이스 분석 준비", "Stage 3: ε 분석", "Stage 4: 최종 결론 도출"],
  "relatedProblems": [
    {
      "title": "Short problem title",
      "content": "Problem with KaTeX formulas using \\( \\) or \\[ \\]",
      "solution": "Step-by-step solution with KaTeX",
      "difficulty": 3,
      "category": "Algebra",
      "stage": "Stage 1: 변수 분해",
      "concept": "Which concept this teaches",
      "explanation": "Why this is foundational"
    }
  ]
}
```

Note: The `stage` field should match one of the stages identified in the problem analysis.
