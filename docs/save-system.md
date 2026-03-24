# Save System

결론: 세이브는 `localStorage` 기반이고, 저장 직전에 `복구 가능한 장면`으로 정규화한 뒤 저장한다.

## 목적

- 새로고침이나 브라우저 재진입 뒤에도 플레이를 안정적으로 이어간다.
- 폰 상태, 위치, 예약 근무처럼 출시 핵심 루프를 우선 복구한다.
- 랭킹, 대화, 미니게임처럼 휘발성 장면은 저장 시 안전한 체크포인트로 접어 저장한다.

## 현재 규칙

1. 저장 키는 `mammon-city-save-v1`이다.
2. 저장 버전은 `1`이다.
3. 저장은 `renderGame()` 안의 `persistState("render")`에서 기본적으로 실행된다.
4. 최종 정산 진입 직후에는 `persistState("finish-run")`를 한 번 더 호출해 엔딩 체크포인트를 남긴다.
5. 시작 화면이 열려 있거나 `devPreviewMode = true`일 때는 저장하지 않는다.
6. 저장 데이터는 `serializeState()`에서 만들고, 복구는 `hydrateState()`에서 처리한다.
7. 저장 루트에는 `meta.reason`, `meta.day`, `meta.scene`, `meta.locationId`, `meta.phoneView`를 함께 남긴다.

## 저장 직전 정규화

`buildPersistenceSceneFrame()`이 저장 직전 장면을 안정화한다.

- `home-transition` -> `room`
- `dialogue` -> `dialogue.returnScene`으로 복귀하고 `returnLocationId`가 있으면 그 위치로 복원
- `job-minigame` -> `incident / clockout / outside / room` 순서의 fallback 장면으로 복귀
- `ranking` -> `ending`
- `ending`, `ranking`, `job-minigame`, `dialogue`, `home-transition` 저장 시 폰은 `home`으로 접고 stage를 닫는다

이 규칙 덕분에 `renderGame()`이 직접 처리하지 않는 휘발 장면을 저장해도, 다음 진입은 안정 장면에서 다시 시작한다.

## 복구 흐름

1. `loadSavedState()`가 `localStorage`에서 raw save를 읽는다.
2. `hydrateState()`가 현재 기본 상태와 병합한다.
3. `stabilizeRestoredStateForPlay()`가 저장 직전과 같은 정규화 규칙을 한 번 더 적용한다.
4. `syncPhoneSessionState()`, `syncJobsDomainState()`, `syncWorldState()`가 위치/폰/근무 상태를 다시 맞춘다.
5. `restoreSavedState()`가 시작 화면과 랭킹 오버레이를 닫고 `renderGame()`으로 진입한다.

## 현재 저장 범위

- 날짜, 시간, 체력, 에너지, 배고픔
- 현재 장면과 스토리 진행 상태
- `devices.phone`
- `jobs`
- `bank`
- `inventory`
- `ownership`
- `world`
- `memory`
- `dialogue`
- `progression / unlocks / social / risk / business`
- `appearance / npcs / happiness`
- `pendingTurnEvents / turnBriefing`
- `lottoRetailer / romance / casino`
- `endingSummary`

## 출시 기준 핵심 확인 포인트

- 방에서 저장 후 새로고침하면 방으로 복구된다.
- 바깥에서 앱을 열어 둔 상태로 저장 후 새로고침하면 위치와 폰 route가 같이 복구된다.
- 예약 근무가 있는 날 저장 후 새로고침하면 `scheduledShift`가 유지된다.
- 랭킹 장면에서 저장되더라도 실제 복구는 `ending` 체크포인트로 들어간다.

## 남은 리스크

- Firebase 실제 설정이 없으면 온라인 랭킹 제출 성공 여부는 오프라인 fallback 기준으로만 확인 가능하다.
- 장시간 플레이 세이브는 브라우저 수동 스모크가 여전히 필요하다.

## 관련 문서

- [release-smoke-checklist.md](./release-smoke-checklist.md)
- [phone-system.md](./phone-system.md)
- [workplace-shift-loop-plan.md](./workplace-shift-loop-plan.md)

## 2026-03 release stabilization notes

- `persistState("render")` is still the default save entry point, but writes are now debounced before touching `localStorage`.
- The render-save debounce is `240ms`, so fast UI updates no longer block on synchronous save writes every frame.
- Pending saves are flushed on `pagehide` and on `visibilitychange` when the document becomes hidden.
- Title reset, new game, continue, clear-save, and restore paths cancel or flush pending save timers before replacing state.
- `buildPersistenceSceneFrame()` is the canonical sanitizer for unsafe scenes before serialization.
- `ranking` always saves as `ending`, and `job-minigame` saves as a recoverable fallback scene instead of trying to resume a broken minigame directly.
- Current release risk is not save corruption but incomplete manual coverage across the full `day 1 -> ending` run.
