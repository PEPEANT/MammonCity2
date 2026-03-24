# Next Turn Briefing
결론: 다음날에 터지는 개인 사건은 `pendingTurnEvents -> turnBriefing -> room` 흐름으로 검은 화면 요약부터 보여준다.

## Purpose

- 복권 결과, 알바/직장 합격, 대출 압류, 고백 이벤트 같은 `다음 턴 사건`을 한 구조로 묶는다.
- 플레이어가 아침 시작 전에 `오늘 왜 상태가 바뀌었는지` 먼저 이해하게 만든다.
- 새 사건을 추가할 때 UI를 따로 만들지 않고 공용 브리핑 큐만 태우게 한다.

## Flow

1. 어떤 시스템이든 `queueNextTurnEvent(...)`로 다음날 사건을 예약한다.
2. 하루가 넘어가면 `prepareDayState(...)`가 예약된 사건과 밤 사이 자동 처리 결과를 모은다.
3. 사건이 하나라도 있으면 씬이 `turn-briefing`으로 바뀌고 검은 화면 요약이 먼저 열린다.
4. 사건은 한 장씩 넘긴다.
5. 마지막 사건을 닫으면 `room`으로 돌아가 그날 플레이를 시작한다.

## Current Sources

- 로또 당첨/꽝 결과
- 직장 면접 결과
- 알바 지원 결과
- 대출 상태 변화와 압류
- 앞으로 추가될 NPC 고백/통보형 이벤트

## Implementation

- 공용 큐/브리핑 헬퍼는 `js/systems/progression/turn-briefing-service.js`에 둔다.
- 하루 전환 직전/직후 수집은 `js/logic.js`의 `prepareDayState(...)`에서 처리한다.
- 실제 검은 화면 렌더는 `js/ui.js`의 `renderTurnBriefingScene()`이 맡는다.
- NPC 대화 데이터는 `effects.nextTurnEvent`만 넣으면 다음 턴 브리핑으로 연결된다.

## Key State

- `state.pendingTurnEvents`
  - 다음날 이후에 보여줄 예약 사건 목록
- `state.turnBriefing`
  - 현재 브리핑 중인 사건 묶음
  - `day`, `currentIndex`, `entries`
- `normalizeTurnBriefingEntry(...)`
  - 제목, 라인, 태그, 톤을 공용 형식으로 맞춘다.

## UI Rules

- 배경은 거의 검은색 화면으로 고정한다.
- 사건은 한 번에 하나만 보여준다.
- 버튼은 `다음 사건 보기` 또는 마지막에 `하루 시작`만 쓴다.
- 브리핑 중에는 일반 행동 피드를 숨긴다.

## Extension Rule

- 데이터 기반 이벤트는 `effects.nextTurnEvent`만 넣으면 된다.
- NPC 대화, 이벤트 보상, 시장 뉴스, 연애 이벤트가 같은 큐를 같이 써도 된다.
- 다음날 즉시 보여줄 사건만 넣고, 같은 날 즉시 처리되는 사건은 기존 씬을 유지한다.

## Risks

- 너무 많은 사건이 한 번에 몰리면 아침 시작이 길어진다.
- 그래서 브리핑에는 `플레이어와 직접 관련 있는 사건`만 넣는 것이 기본 규칙이다.
- 일반 뉴스나 배경 설명은 브리핑이 아니라 뉴스 앱이나 헤드라인으로 보낸다.

## Recommended Next Docs

- [early-progression.md](./early-progression.md)
- [memory-system.md](./memory-system.md)
- [phone-system.md](./phone-system.md)
