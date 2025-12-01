# Style Guide Checklist - Admin Problem Management Page

## 📋 적용 체크리스트

이 문서는 `src/app/admin/problems/page.tsx`에 스타일 가이드를 적용하기 위한 체크리스트입니다.

---

## ✅ 완료 항목

### 1. 색상 시스템
- [ ] **통계 카드 그라데이션 제거**
  - 현재: `bg-gradient-to-br from-blue-50 to-blue-100`
  - 변경: `bg-white`
  - 위치: Line 1450-1467

- [ ] **Primary Accent 통일**
  - 모든 강조 요소에 `text-blue-600`, `border-blue-600` 사용
  - 버튼: `bg-blue-600 hover:bg-blue-700`

- [ ] **텍스트 색상 통일**
  - 제목: `text-gray-800`
  - 본문: `text-gray-800`
  - 보조: `text-gray-500`

### 2. 컴포넌트 스타일
- [ ] **메인 카드 스타일 통일**
  - 표준: `bg-white p-6 rounded-lg shadow-sm border border-gray-200`
  - 적용 위치:
    - 통계 카드 (Line 1450-1467)
    - 문제 리스트 카드 (Line 1473)
    - Learning Path 카드 (Line 1686-1694)

- [ ] **버튼 스타일 통일**
  - Primary: `bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700`
  - Outline: `border border-gray-300 text-gray-700 hover:bg-gray-50`

- [ ] **입력 필드 스타일 통일**
  - 표준: `p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`

### 3. 타이포그래피
- [ ] **제목 크기 통일**
  - H1 (페이지 제목): `text-2xl font-bold text-gray-800`
  - H2 (섹션 제목): `text-xl font-semibold text-gray-800`
  - H3 (카드 제목): `text-base font-medium text-gray-800`

- [ ] **본문 텍스트**
  - 일반: `text-base font-normal text-gray-800`
  - 보조: `text-sm text-gray-500`
  - 작은 텍스트: `text-xs text-gray-500`

### 4. 간격 및 레이아웃
- [ ] **수직 간격 통일**
  - 주요 섹션 간: `space-y-6` (24px)
  - 카드 내부: `space-y-4` (16px)
  - 작은 요소: `space-y-2` (8px)

- [ ] **수평 간격 통일**
  - 그리드 간격: `gap-6` (24px)
  - 버튼 그룹: `gap-2` (8px)

- [ ] **패딩 통일**
  - 카드: `p-6` (24px)
  - 버튼: `py-2 px-4`
  - 입력 필드: `p-2`

### 5. 상호작용 상태
- [ ] **Hover 효과 통일**
  - 카드: `hover:bg-gray-50`
  - 버튼: `hover:bg-blue-700` (Primary), `hover:bg-gray-50` (Outline)
  - 링크: `hover:text-gray-800`

- [ ] **Active/Selected 상태**
  - 선택된 카드: `border-blue-600 bg-blue-50`
  - 활성 메뉴: `bg-gray-100 text-gray-800 font-semibold`

### 6. 접근성
- [ ] **aria-label 추가**
  - 이모지 아이콘에 설명 추가
  - 예: `<span aria-label="Derived Problem">🌱</span>`

- [ ] **키보드 네비게이션**
  - 모든 인터랙티브 요소에 focus 스타일
  - `focus:ring-blue-500 focus:border-blue-500`

### 7. 사용자 피드백
- [ ] **alert() 제거**
  - 모든 `alert()` → `showToast()` 변경
  - 위치: Line 969, 1037, 1045, 1073, 1098, 1109, 1121, 1162

- [ ] **Toast 메시지 일관성**
  - 성공: `✅ [메시지]`
  - 에러: `❌ [메시지]`
  - 경고: `⚠️ [메시지]`
  - 정보: `ℹ️ [메시지]`

---

## 🎨 구체적인 변경 사항

### 변경 1: 통계 카드 (Line 1448-1469)

**현재 코드:**
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
    <div className="text-sm text-blue-600 font-medium">Total Problems</div>
    <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
  </Card>
  {/* ... 다른 카드들 */}
</div>
```

**변경 후:**
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="text-sm text-gray-500 font-medium">Total Problems</div>
    <div className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</div>
    <div className="text-xs text-blue-600 mt-1">All problems</div>
  </Card>
  
  <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="text-sm text-gray-500 font-medium">Easy (1-3)</div>
    <div className="text-3xl font-bold text-gray-800 mt-2">{stats.byDifficulty.easy}</div>
    <div className="text-xs text-gray-500 mt-1">Beginner level</div>
  </Card>
  
  <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="text-sm text-gray-500 font-medium">Medium (4-6)</div>
    <div className="text-3xl font-bold text-gray-800 mt-2">{stats.byDifficulty.medium}</div>
    <div className="text-xs text-gray-500 mt-1">Intermediate level</div>
  </Card>
  
  <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="text-sm text-gray-500 font-medium">Hard (7-10)</div>
    <div className="text-3xl font-bold text-gray-800 mt-2">
      {stats.byDifficulty.hard + stats.byDifficulty.olympic}
    </div>
    <div className="text-xs text-gray-500 mt-1">Advanced level</div>
  </Card>
</div>
```

### 변경 2: 필터 컨트롤 (Line 1517-1581)

**현재 코드:**
```tsx
<div className="mt-3 space-y-2">
  <div>
    <label className="text-xs font-medium text-gray-600">Category</label>
    <select className="w-full mt-1 p-2 text-sm border border-gray-300 rounded-md">
      {/* ... */}
    </select>
  </div>
  {/* ... */}
</div>
```

**변경 후:**
```tsx
<div className="flex items-center gap-4 flex-wrap mt-4">
  <select 
    value={filterCategory}
    onChange={(e) => setFilterCategory(e.target.value)}
    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
  >
    <option value="all">All Categories</option>
    {/* ... */}
  </select>
  
  <select 
    value={filterDifficulty}
    onChange={(e) => setFilterDifficulty(e.target.value)}
    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
  >
    <option value="all">All Difficulties</option>
    {/* ... */}
  </select>
  
  <select 
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value as any)}
    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
  >
    <option value="newest">Newest First</option>
    {/* ... */}
  </select>
  
  {(filterCategory !== "all" || filterDifficulty !== "all" || sortBy !== "newest") && (
    <Button
      onClick={() => {
        setFilterCategory("all");
        setFilterDifficulty("all");
        setSortBy("newest");
      }}
      variant="outline"
      size="sm"
    >
      Reset
    </Button>
  )}
</div>
```

### 변경 3: Learning Path 카드 (Line 1686-1721)

**현재 코드:**
```tsx
<div className={`
  relative p-4 rounded-xl border-2 bg-white shadow-md transition-all
  ${selectedProblem?.id === rootProblem.id 
    ? 'border-blue-500 shadow-lg' 
    : 'border-gray-300 hover:border-blue-400 hover:shadow-lg'}
  w-64
`}>
```

**변경 후:**
```tsx
<div className={`
  relative p-6 rounded-lg border bg-white shadow-sm transition-all
  ${selectedProblem?.id === rootProblem.id 
    ? 'border-blue-600 bg-blue-50' 
    : 'border-gray-200 hover:bg-gray-50'}
  w-64
`}>
```

### 변경 4: Toast 메시지 (전체)

**현재 코드:**
```tsx
alert("Please fill in all required fields");
alert("AI analysis complete!");
```

**변경 후:**
```tsx
showToast("⚠️ Please fill in all required fields", "error");
showToast("✅ AI analysis complete!", "success");
```

### 변경 5: 접근성 개선

**현재 코드:**
```tsx
<span className="text-2xl">🔒</span>
<span className="text-xl">🌱</span>
<span className="text-sm">🌿</span>
```

**변경 후:**
```tsx
<span className="text-2xl" aria-label="Root Problem">🔒</span>
<span className="text-xl" aria-label="Derived Problem">🌱</span>
<span className="text-sm" aria-label="Child Problem">🌿</span>
```

---

## 📊 변경 영향 분석

### 시각적 변화
- ✅ 더 깔끔하고 미니멀한 디자인
- ✅ 일관된 색상 팔레트
- ✅ 명확한 시각적 계층 구조

### 사용성 개선
- ✅ 더 나은 접근성
- ✅ 일관된 사용자 피드백
- ✅ 향상된 키보드 네비게이션

### 유지보수성
- ✅ 스타일 가이드 준수로 협업 용이
- ✅ 일관된 코드 스타일
- ✅ 재사용 가능한 패턴

---

## 🚀 적용 순서

1. **Phase 1: 색상 시스템** (30분)
   - 통계 카드 그라데이션 제거
   - 색상 통일

2. **Phase 2: 컴포넌트 스타일** (45분)
   - 카드, 버튼, 입력 필드 스타일 통일
   - 간격 및 패딩 조정

3. **Phase 3: 타이포그래피** (20분)
   - 제목 크기 통일
   - 폰트 굵기 조정

4. **Phase 4: 접근성** (30분)
   - aria-label 추가
   - focus 스타일 추가

5. **Phase 5: 사용자 피드백** (20분)
   - alert() → showToast() 변경
   - Toast 메시지 일관성 확보

**총 예상 시간: 약 2-3시간**

---

## ✅ 완료 후 확인사항

- [ ] 모든 색상이 스타일 가이드에 정의된 색상인가?
- [ ] 카드 스타일이 통일되었는가?
- [ ] 간격이 일관되게 적용되었는가?
- [ ] 접근성 요구사항을 충족하는가?
- [ ] alert()가 모두 제거되었는가?
- [ ] TypeScript 에러가 없는가?
- [ ] 브라우저에서 정상 작동하는가?

---

**작성일:** 2025-11-21  
**작성자:** AI Assistant  
**버전:** 1.0.0
