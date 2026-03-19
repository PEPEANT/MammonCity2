# 날짜 데이터 구조
현재 결론: 날짜별 콘텐츠는 `assets/days/`와 `js/data/days/`를 같은 `day01`, `day02` 축으로 맞춰 관리한다. day 데이터는 `story`, `events`, `world`, `dev`를 묶는 방식으로 확장한다.

## 목적

- 날짜별 이미지와 날짜별 스크립트 위치를 고정한다.
- `logic.js`에는 공통 진행 엔진만 남기고, 날짜 전용 데이터는 바깥으로 뺀다.
- DEV에서 날짜별 장면을 바로 재생할 수 있게 테스트용 preset도 날짜 데이터에 같이 둔다.

## 현재 구조

```text
assets/
  days/
    day01/
      room-01.png
      room-04.png
      room-05.png

js/
  data/
    constants.js
    characters.js
    days/
      day01/
        story.js
        events.js
        world.js
        index.js
      day02/
        index.js
      day03/
        index.js
      index.js
```

## 파일 역할

- `js/data/characters.js`
  공통 캐릭터 이미지 경로를 모은다.

- `js/data/constants.js`
  날짜, 스탯, 랭크 같은 공통 상수를 둔다.

- `js/data/days/day01/story.js`
  프롤로그 대사, 선택지, 배우 배치 같은 스토리 데이터를 둔다.

- `js/data/days/day01/events.js`
  청소처럼 조건 기반으로 시작하는 이벤트 registry와 이벤트 데이터를 둔다.

- `js/data/days/day01/world.js`
  밖 장면, 건물 앞 배우 배치, 기본 이동 규칙 같은 월드 데이터를 둔다.

- `js/data/days/day01/index.js`
  `DAY01_DATA`를 만들고 아래 네 묶음을 한곳에 모은다.
  - `story`
  - `events`
  - `world`
  - `dev.presets`

- `js/data/days/index.js`
  날짜 번호와 날짜 데이터 묶음을 연결한다.

- `js/logic.js`
  날짜 데이터를 읽어 공통 진행, 저장/복구, DEV 재생 상태 생성을 처리한다.

## dev preset 규칙

- 날짜별 DEV 장면 재생은 `js/data/days/dayXX/index.js`의 `dev.presets`를 기준으로 한다.
- 공통 preset은 엔진에서 자동 제공한다.
  - `기본 방`
  - `건물 앞`
  - `폰 공고앱`
- 날짜 전용 장면은 day 데이터에 추가한다.
  - 예: `프롤로그 1`, `청소 씬`, `엄마 보상`
- preset은 기본적으로 깨끗한 day 상태 위에 적용된다.
- 필요하면 preset에 `state` 패치를 넣어 돈, storyStep, 플래그를 보정한다.

## 분리 기준

1. 하루 분량이 작으면 `day02/index.js`처럼 파일 하나로 시작한다.
2. 하루 분량이 커지면 `story.js`, `events.js`, `world.js`로 쪼갠다.
3. 여러 날짜에서 같이 쓰는 경로와 상수는 날짜 폴더 밖으로 뺀다.
4. 테스트용 장면 재생이 필요하면 `dev.presets`에 추가한다.

## 현재 구현 메모

- 1일차 프롤로그, 청소, 엄마 보상, 바깥 선택지는 `js/data/days/day01/`에서 읽는다.
- 1일차 청소는 `events.js`의 `registry` 조건이 맞을 때만 시작된다.
- 1일차 DEV 재생 preset은 `기본 방`, `건물 앞`, `폰 공고앱`, `프롤로그 1`, `청소 직전`, `청소 씬`, `엄마 보상`이 등록돼 있다.

## 제약

- `assets/` 안에는 이미지 같은 자산만 둔다.
- 날짜 로직 파일을 `assets/days/day01` 안에 넣지 않는다.
- 날짜 폴더 이름은 항상 `day01`, `day02`처럼 두 자리 숫자를 쓴다.

## 다음 문서 추천

- `early-progression.md`
- `save-system.md`
