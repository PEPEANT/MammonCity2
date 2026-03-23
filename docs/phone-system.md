# 스마트폰 시스템
현재 결론: 스마트폰은 초반부터 보유하고, 첫 시작 방의 `interactive-start` 단계에서도 사용할 수 있다. `공고` 앱은 `단기알바 / 직장지원` 2트랙으로 동작하고, 예약된 출근은 이제 `근무지 도착`이 되어야 실제로 시작할 수 있다.

## 목적

초반 생존 루프에서 스마트폰이 어떤 역할을 하는지, 특히 공고 앱과 예약 출근 흐름이 지금 어떻게 구현되어 있는지 기록한다.

## 현재 규칙

1. 플레이어는 1일차 시작부터 스마트폰을 가지고 있다.
2. `cleanup` 장면에서는 앱 사용이 막힌다.
3. 첫 시작 방의 `interactive-start` 단계에서는 앱 사용이 열린다.
4. 앱 사용 가능 장면은 현재 `room`, `outside`, `board`, `interactive-start`다.
5. 기본 설치 앱은 현재 `dis`, `playstore`, `call`, `gallery`, `jobs`, `bank`, `news`, `bus`, `market`를 포함한다.
6. 폰 홈 미리보기는 현재 가장 중요한 상태를 우선해서 보여준다.
7. 우선순위는 `오늘 출근 > 예약 출근 > 단기알바 결과 > 직장지원 결과 > 직장지원 심사중 > 직장지원 재직 상태`다.

## 공고 앱

### 단기알바

- 하루에 1번 지원 가능하다.
- 지원 결과는 즉시 나온다.
- 합격하면 다음 날 출근이 예약된다.
- 예약된 출근은 폰이나 방에서 바로 실행되지 않는다.
- 근무지에 실제로 도착했을 때만 `출근한다` 버튼이 열린다.
- 방에서는 `근무지로 이동하기`, 바깥에서는 `지도 보기`를 통해 근무지로 가는 흐름이 우선 열린다.

### 직장지원

- 하루에 1번 지원 가능하다.
- 같은 날 결과가 나오지 않고, 다음 날 심사 결과가 도착한다.
- 현재 상태는 `idle / applied / rejected / employed`를 사용한다.
- 합격하면 장기 루트가 열리고, 일부 상위 공고가 `activeJobs`에 추가된다.
- 일부 공고는 이제 준비도뿐 아니라 `정장`, `프리미엄 폰`, `차량`, `자격증`, `지능` 같은 하드 게이트를 함께 요구한다.

## 준비 루프

### 도서관

- `사무 준비`
- `학업 준비`

도서관 행동은 `jobs.careerPrep` 수치를 올린다.

### 시험장

- `컴퓨터 자격`
- `운전면허`

시험장 행동은 `jobs.certifications`를 갱신한다.

## 관련 상태

`state.jobs`

- `dailyOffers`
- `scheduledShift`
- `interviewResult`
- `applicationDoneToday`
- `activeTrack`
- `careerOffers`
- `career`
- `careerPrep`
- `certifications`
- `careerApplicationDoneToday`

호환용 top-level 별칭도 아직 유지한다.

- `state.dayOffers`
- `state.nextDayShift`
- `state.interviewResult`
- `state.jobApplicationDoneToday`

`state`의 통합 성장 표시는 캐릭터 패널에서 아래 4개 묶음으로 보인다.

- `생활`
- `사회`
- `직업`
- `생활수준`

## 현재 제약

- 직장지원은 아직 면접 장면이나 재직 유지 시스템까지 가지 않았다.
- 합격 후에는 장기 재직 상태를 표시하고 상위 공고를 해금하는 수준이다.
- `대학가`, `공원`, NPC 기반 비정규 루트는 아직 미구현이다.
- 근무지 자체는 1차로 지도와 공고에 붙었지만, 회사 내부 이벤트나 상사/NPC 시스템은 아직 미구현이다.

## 다음 문서

- [early-progression.md](./early-progression.md)
- [design/job-tracks.md](./design/job-tracks.md)
- [save-system.md](./save-system.md)
