# 저장 시스템
현재 결론: 게임은 `localStorage`에 자동 저장되지만, 타이틀에서는 `이어하기`와 `새로 시작`을 직접 고르게 한다. DEV 이벤트 재생 상태는 저장하지 않는다.

## 목적

- 30일 구조에서 중간 이탈 후에도 이어할 수 있게 한다.
- 새 게임과 기존 저장 복구를 분리해 의도치 않은 자동 진입을 막는다.
- DEV 테스트 장면이 본 저장을 덮어쓰지 않게 한다.

## 현재 규칙

1. 저장 키는 `mammon-city-save-v1`이다.
2. 시작 화면이 열려 있을 때는 저장하지 않는다.
3. 인게임 상태에서 `renderGame()`이 돌면 자동 저장한다.
4. 창을 닫거나 페이지를 떠날 때도 한 번 더 저장한다.
5. 저장 데이터가 있으면 타이틀에서 `이어하기` 버튼이 보인다.
6. `이어하기`를 누르면 마지막 진행 상태를 복구한다.
7. `새로 시작`을 누르면 기존 저장을 지우고 1일차부터 다시 시작한다.
8. `devPreviewMode = true`인 DEV 이벤트 재생 상태는 저장하지 않는다.

## 저장 대상

- `day`, `money`, `stamina`, `energy`
- `scene`, `storyKey`, `storyStep`
- `hasPhone`, `phoneMinimized`, `phoneView`
- `phoneUsedToday`, `jobApplicationDoneToday`
- `phonePreview`, `interviewResult`, `nextDayShift`
- `activeJobs`, `seenIncidents`
- `jobVisits`, `dayOffers`
- `currentOffer`, `currentIncident`
- `lastResult`, `endingSummary`
- `day1CleanupDone`, `cleaningGame`
- `headline`

`activeJobs`, `seenIncidents`는 저장 시 배열로 바꾸고 복구할 때 다시 `Set`으로 되돌린다.

## DEV 예외

- DEV 이벤트 재생은 깨끗한 테스트 상태를 새로 만든다.
- 이 상태에는 `devPreviewMode`가 켜진다.
- `devPreviewMode`가 켜진 동안에는 자동 저장과 종료 직전 저장이 모두 막힌다.
- `원래 상태`를 누르면 재생 전 상태로 돌아간다.

## 제약

- 저장 버전은 현재 `1`이다.
- 버전이 다르거나 JSON 파싱에 실패하면 저장을 무시하고 새 게임으로 본다.
- 저장이 있어도 자동으로 인게임에 들어가지는 않는다.

## 다음 문서 추천

- `day-data-layout.md`
- `early-progression.md`
