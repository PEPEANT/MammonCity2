# 근무지-출근 루프 작업 계획

현재 결론: 오늘 작업은 `근무지 도착형 출근 루프`를 한 흐름으로 정리하는 데 집중한다. 이미 들어간 `공고 앱`, `근무지 요약`, `도시 지도`, `예약 출근`을 묶고, 그 과정에서 `jobs` 관련 로직을 더 분리한다.

## 목적

- 오늘 구현 범위를 짧게 고정해 기능 추가와 구조 정리를 동시에 밀어붙이기 위한 문서다.
- `회사/근무지` 축을 플레이어가 실제로 느끼게 만들고, 다음 단계인 회사 내부 이벤트/NPC 확장을 위한 받침대를 만든다.
- `logic.js`에 남아 있는 출근 흐름을 무작정 더 키우지 않도록 작업 경계를 먼저 잡는다.

## 현재 기준

- `js/apps/jobs/jobs-app-ui.js`
  단기알바/직장 탭, 근무지 카드, 예약 출근 카드가 이미 있다.
- `js/data/jobs/job-workplaces-data.js`
  알바/직장 공고에 연결되는 회사명, 근무지명, 위치, 이동 힌트가 이미 있다.
- `js/ui/city-map/city-map-ui.js`
  지도 오버레이, 목적지 선택, 이동 확인 카드, 이동 확정 흐름이 이미 있다.
- `js/systems/jobs/jobs-action-service.js`
  예약 근무는 근무지 도착 전에는 시작할 수 없고, 대기/결근 처리도 1차 구현돼 있다.

즉 오늘은 바닥부터 새로 만드는 날이 아니라, 이미 생긴 조각들을 `출근 준비 -> 이동 -> 도착 -> 대기/출근 -> 결과` 하나의 루프로 정리하는 날이다.

## 오늘 목표

1. 플레이어가 `오늘 어디로 가야 하는지`를 폰/바깥 UI에서 일관되게 읽을 수 있게 만든다.
2. 예약된 근무의 `이동 필요`, `대기 가능`, `출근 가능`, `결근` 상태를 한 흐름으로 다듬는다.
3. 이번 작업에 닿는 출근 로직은 `jobs` 도메인 쪽으로 더 밀어 넣고 `logic.js` 직접 분기를 줄인다.

## 오늘 안 할 것

- 회사 내부 전용 장면 전체
- 상사/NPC/동료 관계 시스템
- 장기 재직 유지/퇴사/인사평가 전체
- 회사 엔티티의 완전한 데이터 모델링
- 은행, 소비, 연애 시스템 확장

## 작업 순서

1. 예약 근무 상태 노출 정리
   폰 공고 앱, 폰 홈 미리보기, 바깥 액션 카드에서 `근무지명 / 위치 / 다음 행동`이 같은 기준으로 보이게 맞춘다.
2. 출근 진입 흐름 정리
   `근무지 미도착 -> 지도 이동 유도 -> 현장 도착 -> 대기 또는 출근 시작` 흐름을 확인하고, 문구와 버튼 흐름을 통일한다.
3. 출근 로직 분리 정리
   이번 작업에서 건드리는 예약 출근/결근/대기/진입 로직은 `js/systems/jobs/` 안에서 처리하고, `logic.js`는 오케스트레이션만 남기는 방향으로 정리한다.
4. 문서 동기화
   실제 구현이 바뀐 경우 `phone-system.md`, `early-progression.md`, `save-system.md` 중 필요한 문서만 같이 갱신한다.

## 우선 건드릴 파일

- `js/apps/jobs/jobs-app-ui.js`
- `js/systems/jobs/jobs-action-service.js`
- `js/data/jobs/job-workplaces-data.js`
- `js/ui.js`
- `js/logic.js`
- 필요 시 `js/ui/city-map/city-map-ui.js`

## 완료 조건

- 예약된 근무가 있는 날, 플레이어가 폰이나 바깥 화면에서 `어디로 가야 하는지` 바로 알 수 있다.
- 근무지에 도착하지 않으면 출근이 막히고, 도착하면 `대기` 또는 `출근`으로 자연스럽게 이어진다.
- 출근 실패/결근/시간 놓침 처리 문구가 근무지 정보와 함께 일관되게 나온다.
- 이번 작업으로 늘어난 출근 규칙이 `logic.js`에 직접 더 얹히지 않는다.

## 확인 방법

1. 알바 지원 후 다음 턴 예약 출근 생성 확인
2. 근무지 바깥에서 출근 불가 및 이동 유도 확인
3. 지도 이동 후 근무지 도착 상태에서 대기/출근 버튼 확인
4. 출근 가능 시간 전후 상태 변화 확인
5. 시간 초과 시 결근 처리 확인

## 리스크

- `js/logic.js`와 `js/ui.js`가 여전히 크기 때문에 작은 수정도 결합 범위를 넓힐 수 있다.
- 문구/UI 정리만 하다가 실제 상태 흐름 정리가 밀리면 오늘 작업 의미가 약해진다.
- top-level 호환 상태(`nextDayShift`, `interviewResult`)는 아직 남아 있으므로, 이번 작업에서 성급히 제거하지 않는다.

## 다음 문서

- [phone-system.md](./phone-system.md)
- [early-progression.md](./early-progression.md)
- [design/job-tracks.md](./design/job-tracks.md)
- [design/logic-split-plan.md](./design/logic-split-plan.md)

## 2026-03 current implemented status

- McDonald's venue flow is no longer a single mixed branch. The live state machine distinguishes:
  - not hired
  - inquiry available
  - hired
  - on-shift window
  - off-shift window
  - customer mode
- Job inquiry is time-gated. If the player asks outside the inquiry window, the venue rejects the request instead of silently mixing it with shift entry.
- After hiring, shift start is only available during the assigned window. Outside that window the venue stays in customer mode.
- Customer mode keeps the kiosk usable even when the player is an employee.
- Counter and kitchen paths are now separated, and shift cleanup returns the player to a safe counter/outside location instead of leaving them stuck in kitchen state.
- Minigame entry is routed through shared checks for job, place, and time so duplicate entry and missing-trigger cases are easier to trace.

## Remaining release gap

- This document is still partly a plan document. Before release, the manual smoke pass should confirm at least one full McDonald's loop:
  - inquiry rejected outside inquiry time
  - inquiry accepted in inquiry time
  - off-shift customer kiosk access
  - on-shift entry
  - minigame start
  - shift completion and safe return
