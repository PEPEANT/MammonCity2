# 프로젝트 작업 규칙

이 문서는 권장 사항이 아니라 작업 종료 조건이다.
아래 `hard limit`를 넘긴 파일에는 기능을 더 추가하지 말고, 먼저 분리하거나 구조를 정리한다.

## 1. 현재 기준 폴더

이 프로젝트의 기준 폴더는 아래와 같다.

```text
project/
- css/
- docs/
- js/
  - data/
    - jobs/
- index.html
- RULES.md
```

- 새 규칙은 반드시 현재 구조 기준으로 적는다.
- 더 이상 사용하지 않는 예전 구조 예시는 문서에 남기지 않는다.
- 지금 프로젝트에서는 `src/` 기준이 아니라 `js/` 기준으로 관리한다.

## 2. 파일 크기 기준

### 기본 원칙

- `soft limit` 초과: 다음 기능 추가 전에 분리 계획을 세우고 같은 작업 안에서 정리한다.
- `hard limit` 초과: 해당 파일에 기능 추가 금지. 먼저 분리한다.
- 줄 수가 기준 이하여도 서로 다른 책임이 2개 이상 섞이면 분리한다.

### 파일별 기준

| 종류 | soft limit | hard limit | 기준 |
|------|------------|------------|------|
| `index.html` | 80줄 | 120줄 | 구조만 남기고, 스타일과 스크립트는 외부 파일 유지 |
| `css/*.css` | 180줄 | 260줄 | 화면 역할 단위로 분리 |
| `js` 로직/UI 파일 | 250줄 | 400줄 | 기능 단위로 분리 |
| `js` 데이터 파일 | 300줄 | 500줄 | 데이터 종류 단위로 분리 |
| `docs/*.md` | 120줄 | 200줄 | 문서 주제 단위로 분리 |

## 3. 데이터 파일 규칙

`data.js`는 예외 파일이 아니다.
데이터 파일도 커지면 반드시 쪼갠다.

### 데이터 분리 원칙

1. 한 파일에는 한 종류의 데이터만 둔다.
2. 아래 항목이 섞이면 분리 대상으로 본다.
   - 직업 목록
   - 직업별 이벤트
   - 헤드라인/뉴스
   - 상점 데이터
   - 엔딩/랭크 데이터
3. 중첩 객체나 배열 하나가 150줄을 넘으면 별도 파일로 뺀다.
4. 조회용 파생 데이터(`JOB_LOOKUP` 같은 것)는 원본 데이터와 같은 파일에 둬도 된다.
5. 대형 데이터 파일에 새 데이터를 계속 추가하는 방식은 금지한다.

### 현재 프로젝트 기준 권장 분리 예시

```text
js/
- data/
  - jobs/
    - jobs-data.js
    - job-headlines-data.js
    - service-job-events-data.js
    - labor-job-events-data.js
    - advanced-job-events-data.js
    - job-events-data.js
- logic.js
- shop.js
- ui.js
```

- `JOBS`, `STARTING_JOB_IDS`, `JOB_LOOKUP`는 같은 파일에 둬도 된다.
- `JOB_EVENTS`는 부분 데이터 파일과 결합 파일로 나눈다.
- 데이터 의존 순서는 `index.html`의 `<script>` 로드 순서로 맞춘다.

## 4. 역할 분리 규칙

### JS

- `logic.js`: 상태 변화, 하루 진행, 승패/정산, 시스템 규칙
- `ui.js`: DOM 조회, 렌더링, 버튼 생성, 화면 갱신
- `shop.js`: 상점 규칙, 장비 효과, 소비 처리
- `data/*.js`: 순수 데이터와 파생 lookup만

### CSS

- `base.css`: 리셋, body, 공통 타이포
- `layout.css`: 배경, 배치, 큰 레이아웃
- `components.css`: 버튼, 카드, 텍스트박스, 재사용 UI
- 기능별 화면이 커지면 `phone.css`, `shop.css`처럼 별도 파일 허용

## 5. 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| JS 변수/함수 | `camelCase` | `playerName`, `renderBoard()` |
| JS 상수 | `UPPER_SNAKE_CASE` | `MAX_DAYS`, `STARTING_JOB_IDS` |
| CSS 클래스 | `kebab-case` | `choice-btn`, `phone-panel` |
| CSS ID | `kebab-case` | `start-screen`, `money-effect` |
| 파일명 | `kebab-case` | `service-job-events-data.js`, `phone-system.md` |
| 폴더명 | 소문자 | `js/`, `css/`, `docs/` |

- 헝가리안 표기법은 쓰지 않는다.
- 약어보다 의미가 드러나는 이름을 우선한다.

## 6. 함수와 주석 규칙

### 함수

- 함수 하나는 한 가지 일만 한다.
- 함수 길이 40줄을 넘기기 시작하면 분리를 먼저 검토한다.
- 함수명은 동사로 시작한다.

### 주석

- 복잡한 규칙, 예외 처리, 수식 설명에만 쓴다.
- 코드만 읽어도 분명한 내용은 주석으로 반복하지 않는다.
- 임시 메모는 `TODO:` 또는 `FIXME:` 형식으로만 남긴다.

## 7. 문서 규칙

- 시스템 흐름을 바꾸면 `docs/` 문서도 같은 작업 안에서 같이 갱신한다.
- 구현이 바뀌면 오래된 기획 문구를 남겨두지 않는다.
- `RULES.md`의 현재 상태 섹션은 실제 파일 수치와 맞아야 한다.

## 8. 작업 종료 전 체크리스트

아래 항목을 모두 확인하고 끝낸다.

1. 바뀐 파일이 `hard limit`를 넘지 않는가
2. `soft limit`를 넘긴 파일은 같은 작업에서 분리했는가
3. 데이터 파일에 서로 다른 데이터 종류를 섞어 넣지 않았는가
4. 문서와 실제 구현이 어긋나지 않는가
5. 새 파일 경로와 로드 순서가 현재 프로젝트 구조와 맞는가

## 9. 현재 프로젝트 상태

2026-03-18 기준:

```text
index.html                              112줄    soft limit 초과
js/data/jobs/jobs-data.js               143줄    정상
js/data/jobs/job-headlines-data.js        6줄    정상
js/data/jobs/service-job-events-data.js 467줄    soft limit 초과
js/data/jobs/labor-job-events-data.js   222줄    정상
js/data/jobs/advanced-job-events-data.js 338줄   soft limit 초과
js/data/jobs/job-events-data.js           5줄    정상
js/logic.js                             367줄    soft limit 초과
js/ui.js                                327줄    soft limit 초과
js/shop.js                              251줄    soft limit 초과
css/layout.css                          248줄    soft limit 초과
css/components.css                      222줄    soft limit 초과
css/phone.css                           157줄    정상
css/shop.css                            195줄    soft limit 초과
```

가장 먼저 정리할 파일:

1. `js/data/jobs/service-job-events-data.js`
2. `js/logic.js`
3. `js/ui.js`
