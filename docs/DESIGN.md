# Math Quest 디자인

2026-10-07 기준 사이트 디자인입니다. UI 리디자인(1~5단계, 2026-10)과 대시보드 레이아웃 변경을 반영했습니다.

> [STYLE_GUIDE.md](STYLE_GUIDE.md)는 리디자인 전 기준입니다(파란 강조색, gray 계열, 그림자, `rounded-lg`, `p-6`).
> 색상, 글꼴, 카드 모양은 **이 문서가 우선**합니다. STYLE_GUIDE의 클래스 순서 규칙은 그대로 따릅니다.

---

## 1. 원칙

- **차분하고 전문적으로:** 중성색(slate)을 기본으로 쓰고, 색은 상태(정답, 오류)에만 씁니다. 이모지 라벨은 쓰지 않습니다.
- **카드보다 목록과 표:** 여러 항목은 구분선이 있는 목록이나 표로 보여 줍니다. 장식용 그림자와 배너는 쓰지 않습니다.
- **한 화면에 주요 행동 하나:** 진하게 채운 버튼은 "지금 할 일"(예: 진행 중인 사다리의 Continue)에만 씁니다.
- **숫자는 정렬되게:** 수치에는 `.tnum`(고정폭 숫자)을 씁니다.
- **문제 본문은 읽기 좋게:** 문제 본문만 세리프 글꼴로 구분합니다.

---

## 2. 색 (디자인 토큰)

토큰은 `src/app/globals.css`에 정의하고 Tailwind에 연결했습니다. shadcn 컴포넌트(`components/ui`)도 이 토큰을 씁니다.

| 토큰 | 색 | 용도 |
|---|---|---|
| `background`, `card` | white | 카드, 헤더, 사이드바 |
| (앱 페이지 배경) | `bg-slate-50` | 대시보드 등 앱 화면 바탕 |
| `foreground`, `primary` | slate-900 | 본문 글자, 주요 버튼 |
| `secondary`, `muted`, `accent` | slate-100 | 선택된 메뉴, 약한 배경, 진행 막대 바탕 |
| `muted-foreground` | slate-500 | 보조 글자, 설명, 날짜 |
| `border` | slate-200 | 카드 테두리, 구분선 |
| `input` | slate-300 | 입력칸 테두리 |
| `ring` | slate-400 | 포커스 링 |
| `brand` | blue-800 | 링크, 포커스 강조 |
| `destructive` | red-600 | 오류, 삭제 |
| (성공) | emerald-600 | 푼 문제 체크, "Done" 표시 |

모서리 반경은 `--radius: 0.375rem`(`rounded-md`)입니다.

---

## 3. 글꼴과 글자 크기

글꼴은 `src/app/layout.tsx`에서 next/font로 불러옵니다.

| 글꼴 | 클래스 | 용도 |
|---|---|---|
| Geist Sans | `font-sans` (기본) | 화면 전체 |
| Geist Mono | `font-mono` | 난이도 숫자, XP 같은 작은 수치 |
| Source Serif 4 | `font-serif` | 문제 본문 |

| 요소 | 스타일 |
|---|---|
| 섹션 제목 (Ladders 등) | `text-base font-semibold text-slate-900` |
| 카드 제목 | `text-[13px] font-semibold text-slate-900` |
| 수치 라벨 (SOLVED 등) | `text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500` |
| 본문, 목록 항목 | `text-sm`, 문제 제목은 `text-[15px] font-medium` |
| 보조 정보 | `text-xs text-slate-500` |
| 큰 수치 | `text-xl`~`text-2xl font-semibold tracking-tight` + `.tnum` |

---

## 4. 레이아웃

### 4.1 전체 틀
```
┌────────────────────────────── 헤더 (h-14, 상단 고정) ──────────────────────────────┐
│ 로고 Math Quest │ 문제 검색 │                 인사말·날짜 │ Support │ 메뉴 │
├──────────────┬──────────────────────────────────────────────┬──────────────┤
│ 왼쪽 사이드바  │ 메인 (최대 1280px)                              │ 오른쪽 열     │
│ (w-64, xl 이상)│                                              │ (320px, xl)   │
│ 메뉴          │ Continue 패널                                   │ Topics        │
│ 통계 4×1      │ Ladders                                        │              │
│ Getting started│ Problems for you / My queue 탭                 │              │
│ Activity      │                                              │              │
│ Top solvers   │                                              │              │
│ Support       │                                              │              │
│ 이름·로그아웃   │                                              │              │
└──────────────┴──────────────────────────────────────────────┴──────────────┘
```

### 4.2 헤더 (`src/components/header.tsx`)
- 로고, 검색창, 인사말과 날짜("Good evening, 이름" / 요일·날짜), Support, 메뉴 순입니다.
- 인사말은 로그인 상태에서 `lg` 이상 화면에만 보입니다. 브라우저의 현지 시각으로 정합니다.

### 4.3 왼쪽 사이드바 (`src/components/SideNav.tsx`)
`xl`(1280px) 이상에서만 보이고, 너비는 `w-64`입니다. 위에서부터 다음 순서입니다.
1. 메뉴: Home, Skill Tree, Problems, Stats, Community, (관리자) Admin
2. **통계 4×1** (`SidebarStats`): Solved, Rating(티어), Streak, Level(진행 막대). 아래에 "Statistics →" 링크가 있습니다.
3. **Home 화면에서만**: Getting started(새 사용자), Activity(12주 달력), Top solvers, Support
4. 사용자 이름과 이메일, Log out

3번 카드는 Home 대시보드가 데이터를 가지고 있어서 사이드바의 빈 자리(`SIDENAV_SLOT_ID`)에 그려 넣습니다(React portal).

### 4.4 Home 대시보드 (`src/components/home/HomeDashboard.tsx`)
- **메인 열:** Continue 패널 → Ladders → Problems for you / My queue 탭
- **오른쪽 열:** Topics(분야별 숙련도)
- 새 사용자에게는 맨 위에 "Welcome to Math Quest…" 한 줄이 나옵니다.

### 4.5 화면 크기별 동작
| 너비 | 동작 |
|---|---|
| `xl` (1280px) 이상 | 사이드바 표시, 메인 + 오른쪽 열 2단 |
| 1280px 미만 | 사이드바 숨김. 통계는 대시보드 맨 위에 1×4(휴대폰에서는 2×2) 줄로, 사이드바 카드는 Topics 위에 표시하고 한 열로 쌓음 |
| `lg` 미만 | 헤더 인사말 숨김 |
| `md` 미만 | 헤더 검색창 숨김 |

---

## 5. 컴포넌트

| 컴포넌트 | 모양 | 위치 |
|---|---|---|
| 카드 | `rounded-md border border-slate-200 bg-white p-4`, 그림자 없음 | `home/SidePanel.tsx` 등 |
| 목록 | 바깥 테두리 하나 + 항목 사이 `divide-y divide-slate-100`, 마우스를 올리면 `bg-slate-50` | `ProblemRow`, `LadderList` |
| 주요 버튼 | `bg-slate-900 text-white`, `h-8 text-[13px]` | 진행 중 항목의 Continue / Resume |
| 보조 버튼 | `variant="outline"`, `border-slate-300` | Start, Solve, Review |
| 아이콘 버튼 | `p-1.5 text-slate-400`, 마우스를 올리면 `bg-slate-100`. 설명은 툴팁(`title`) | 좋아요(하트), My queue(리스트) |
| 탭 | 밑줄 방식, 선택된 탭은 `border-slate-900 font-medium` | Problems for you / My queue |
| 구간 선택 필터 | 붙어 있는 버튼 묶음, 선택된 칸은 `bg-slate-900 text-white` | All / Easy / Medium / Hard+ |
| 진행 막대 | 높이 `h-1`, 바탕 `bg-slate-100`, 채움 `bg-slate-900`, 둥근 모서리 없음 | Level, Getting started |
| 상태 동그라미 | 빈 원 = 시작 안 함, 가운데 점 = 진행 중, 초록 체크 = 해결 | `ProblemRow` |
| 난이도 표시 | 막대 그래프 + 숫자(mono) + 라벨(Easy…) | `DifficultyBadge` (`components/DifficultyRating.tsx`) |
| 사다리 진행 칸 | 단계마다 한 칸. 해결 = 진하게, 현재 = 테두리만, Challenge 칸은 더 넓게 | `LadderDots` (`home/LadderList.tsx`) |
| 사다리 행 | 이름, 분야 · 다음 단계, 진행 칸 + n/m, 난이도 범위(첫 단계 → Challenge), Start / Continue / Review | `LadderList` |
| Continue 패널 | 다음에 풀 문제의 본문 미리보기 + 사다리 전체 계단(Challenge가 맨 위) | `home/ContinuePanel.tsx` |
| Activity 달력 | 최근 12주, 하루 한 칸(월요일이 위), 문제를 연 횟수에 따라 slate 4단계 음영 | `home/ActivityCard.tsx` |

---

## 6. 문구 규칙
- 화면 문구는 영어입니다. 브랜드 이름은 **Math Quest** 하나만 씁니다.
- 학생 화면에 IMO를 언급하지 않습니다. 예외는 사다리 끝 "비슷한 올림피아드 문제"의 출처 인용입니다.
- 버튼 이름:
  - 처음 = Start / Solve
  - 진행 중 = Continue / Resume
  - 다 푼 것 = Review

---

## 7. 남은 디자인 과제
- **"Problems for you"와 "Ladders" 중복:** 모든 문제가 사다리라서 두 목록이 같습니다. 하나로 합칠 예정입니다([OPERATING_POLICY.md](OPERATING_POLICY.md) 6.1).
- **"0/7" 숫자의 두 가지 뜻:** 제목 옆 숫자는 "완주한 사다리 / 전체 사다리", 행의 숫자는 "푼 단계 / 전체 단계"입니다. 제목 쪽을 "0 of 7 completed"처럼 바꾸는 것을 검토합니다.
- **글자 없는 아이콘:** 하트와 리스트 아이콘은 툴팁뿐이라 뜻이 잘 전달되지 않습니다. 작은 라벨("Like", "Save")을 검토합니다.
- **오른쪽 열에 Topics만 남음:** Topics도 사이드바로 옮기고 메인을 넓게 쓸지 검토합니다.
- **스킬 트리:** 임시 화면입니다. 배지와 함께 다시 디자인합니다.

---

## 8. 변경 이력
| 날짜 | 내용 |
|---|---|
| 2026-10 | 리디자인 1단계: slate 색, Geist + Source Serif 4, 숫자 난이도, 목록형 문제 행, 사다리 단계 표시 |
| 2026-10 | 2단계: 디자인 토큰, 랜딩·로그인·온보딩 |
| 2026-10 | 3단계: 안내 페이지 13개, 공개 안내 경로 |
| 2026-10 | 4단계: 문제 표, 통계, 커뮤니티, 스킬 트리, 설정 |
| 2026-10 | 5단계: 관리자 페이지 |
| 2026-10-06 | 대시보드 레이아웃: Continue 패널, 사다리 표, 탭 목록 |
| 2026-10-07 | 인사말을 헤더로, 통계를 왼쪽 사이드바 4×1로, Getting started·Activity·Top solvers·Support를 사이드바로 |
