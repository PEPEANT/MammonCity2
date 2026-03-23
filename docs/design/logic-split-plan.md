# logic split plan

`logic.js`는 이제 새 기능을 직접 품는 파일이 아니라, 이미 분리된 시스템을 이어 붙이는 오케스트레이션 파일로 유지해야 한다.

## Purpose

- `js/logic.js`가 다시 6천 줄 이상으로 커지는 패턴을 멈춘다.
- 도메인 로직이 생길 때 어디로 넣어야 하는지 기준을 고정한다.
- 레거시 중복 함수와 전역 함수 뭉치를 단계적으로 걷어낸다.

## Current Rule

- `js/logic.js`
  현재 장면 전환, 클릭 라우팅, 여러 시스템 호출을 묶는 오케스트레이션만 둔다.
- `js/systems/world/*`
  날짜, 위치, 이동, 배회, 도시 상태처럼 월드 상태를 다룬다.
- `js/systems/progression/*`
  배고픔, 행복도, 출신 수저, 메타 성장처럼 플레이어 상태 규칙을 다룬다.
- `js/systems/economy/*`
  현금, 계좌, 인벤토리, 자산, 시장 변동처럼 돈과 자산 규칙을 다룬다.
- `js/apps/*`
  폰 앱이나 단일 앱 도메인 UI/상태만 둔다.
- `js/ui*`
  렌더링과 화면 출력만 둔다.

## Current Extraction

- `js/systems/world/world-runtime-service.js`
  `logic.js` 초반의 날짜, 월드 상태, 이동 라벨, 배회/NPC 풀 helper를 옮겼다.
- `js/systems/progression/hunger-service.js`
  배고픔 수치, 감쇠, 응급실 이동, 파산 엔딩 연결을 옮겼다.
- `index.html`
  두 서비스가 `logic.js`보다 먼저 로드되도록 순서를 고정했다.

## Immediate Guardrails

- 새 도메인 함수는 먼저 `js/systems/*` 또는 `js/apps/*` 후보를 찾고, 거기에 두는 것을 기본값으로 삼는다.
- `logic.js`에는 새 규칙 계산 함수를 추가하지 않는다.
- 같은 이름의 `Legacy` 함수와 신규 함수가 공존하면, 다음 분리 때 반드시 정리 목록에 넣는다.

## Next Split Targets

1. `career/job` 묶음
   `careerPrep`, 자격증, 직업 해금, 급여 계산 helper를 `js/systems/jobs/`로 옮긴다.
2. `inventory consumable` 중복 정리
   `useInventoryConsumable` 중복 선언을 하나의 서비스로 합친다.
3. `legacy phone/job` 제거
   `*Legacy` 함수군을 실제 호출 여부 기준으로 정리한다.
4. `scene-specific shop/service` 추출
   편의점, 맥도날드, 성형외과, 갤러리 같은 생활 소비 로직을 각 서비스로 뺀다.

## Risk

- 이 프로젝트는 ES module이 아니라 전역 함수 + 스크립트 순서 기반이라, 파일 분리 시 로드 순서를 항상 함께 수정해야 한다.
- UI 파일이 `logic.js`보다 먼저 로드되므로, 공용 helper는 `ui.js`보다 먼저 로드되게 맞춰야 한다.

## Recommended Next Document

- `design/system-audit.md`
- `design/mobility-and-stats-audit.md`
