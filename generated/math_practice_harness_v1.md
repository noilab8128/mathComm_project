# Math Practice Harness v1

이 구조는 고등학교 수학 단원별 연습문제를 반복 생성하기 위한 고정 포맷이다.

## 생성 원칙

1. 한 단원은 하나의 하네스 JSON 파일로 정리한다.
2. 문제는 쉬운 절차 연습에서 종합 적용으로 이어지도록 `stages`에 배치한다.
3. 모든 문제는 앱 저장과 검토가 가능하도록 분류, 난이도, 개념, 정답, 해설을 포함한다.
4. HTML/Markdown 출력물은 사람이 보는 자료이고, 하네스 JSON은 재사용 가능한 원본 데이터이다.

## 파일명 규칙

- Harness JSON: `high_school_math_unit_{unitNumber}_{slug}_{date}.harness.json`
- Markdown: `high_school_math_unit_{unitNumber}_{slug}_{date}.md`
- HTML: `high_school_math_unit_{unitNumber}_{slug}_{date}.html`

예시:

```text
high_school_math_unit_01_polynomials_2026-06-08.harness.json
```

## 최상위 구조

```json
{
  "harnessVersion": "math-practice-v1",
  "generatedAt": "2026-06-08",
  "curriculum": {
    "country": "KR",
    "name": "2022 개정 교육과정",
    "course": "공통수학1",
    "gradeBand": "고1"
  },
  "unit": {
    "sequence": 1,
    "title": "다항식",
    "slug": "polynomials",
    "subtopics": ["다항식의 연산", "나머지정리", "인수분해"]
  },
  "taxonomy": {
    "categoryPath": "Algebra > Elementary Algebra > Polynomials",
    "categoryLevel1": 1,
    "categoryLevel2": 11
  },
  "outputs": {
    "markdown": "generated/example.md",
    "html": "generated/example.html"
  },
  "stages": [],
  "problems": []
}
```

## Stage 구조

```json
{
  "id": "U01-S01",
  "order": 1,
  "title": "다항식의 연산",
  "goal": "동류항 정리, 전개, 나눗셈을 정확히 수행한다.",
  "concepts": ["동류항", "전개", "다항식 나눗셈"]
}
```

## Problem 구조

```json
{
  "id": "U01-P001",
  "order": 1,
  "stageId": "U01-S01",
  "title": "다항식의 덧셈과 뺄셈",
  "content": "다음 식을 간단히 하여라. \\\\[(2x^2-3x+1)+(x^2+5x-4)-2(x^2-x+3)\\\\]",
  "answer": "\\\\(x^2+4x-9\\\\)",
  "solution": "동류항을 정리하면 \\\\(3x^2+2x-3-2x^2+2x-6=x^2+4x-9\\\\)이다.",
  "difficulty": {
    "score": 2,
    "band": "Basic"
  },
  "category": {
    "level1": 1,
    "level2": 11,
    "level3": 45,
    "path": "Algebra > Elementary Algebra > Polynomials"
  },
  "concepts": ["동류항 정리"],
  "tags": ["공통수학1", "다항식", "연산"],
  "isBonus": false,
  "relationships": {
    "prerequisiteProblemIds": [],
    "nextProblemId": "U01-P002"
  },
  "validation": {
    "answerCheckType": "manual",
    "expectedAnswer": "x^2+4x-9"
  }
}
```

## 난이도 밴드

- `Basic`: 1-2
- `Core`: 3-4
- `Application`: 5-6
- `Challenge`: 7-8
- `Olympiad`: 9-10

## 이후 단원 생성 시 기본 출력

요청이 들어오면 다음 3개 파일을 기본으로 만든다.

1. 하네스 JSON
2. 학생용 Markdown
3. 도식 포함 HTML
