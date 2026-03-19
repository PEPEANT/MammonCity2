# PNG Asset Cleanup

결론: 일차별 배경과 아이템 자산을 `assets/` 아래로 옮겼고, 1일차 청소 미니게임 PNG는 새 경로를 기준으로 계속 사용한다.

## 목적

- 날짜별 이미지를 `assets/days/day00`부터 `assets/days/day30`까지 한 자리에서 관리한다.
- 날짜와 무관한 PNG는 `assets/items`로 분리해 참조 경로를 단순하게 유지한다.
- 시작 화면용 `day0_0.jpg`도 `day00`로 옮겨 첫 화면 인트로 자산과 본편 자산 구조를 맞춘다.

## 현재 자산 구조

- 시작 화면
  - `assets/days/day00/intro.jpg`
- 1일차 배경
  - `assets/days/day01/room-01.png`
  - `assets/days/day01/room-02.png`
  - `assets/days/day01/cleanup.png`
- 미니게임 아이템
  - `assets/items/item_1.png`
  - `assets/items/item_2.png`
  - `assets/items/item_3.png`
  - `assets/items/item_4.png`
  - `assets/items/item_5.png`
  - `assets/items/item_6.png`

## 현재 규칙

- 날짜가 있는 배경은 `assets/days/dayNN/`에 둔다.
- 날짜와 무관한 수집물, 소품, UI성 이미지는 `assets/items/`에 둔다.
- 청소 미니게임 아이템 표시는 데스크톱 `96px`, 모바일 `78px`를 유지한다.

## 관련 파일

- `js/ui.js`
  - 닉네임 입력 다음 단계에서 `assets/days/day00/intro.jpg`를 보여주는 인트로 카드를 만든다.
- `js/logic.js`
  - 청소 미니게임 아이템 경로를 `assets/items` 기준으로 참조한다.
- `css/layout.css`
  - 1일차 배경 경로를 `assets/days/day01` 기준으로 참조한다.
- `css/components.css`
  - 시작 화면 인트로 이미지 스타일을 정의한다.

## 메모

- 현재는 `day00`과 `day01`만 실제 이미지가 들어 있고, `day02`부터 `day30`은 확장용 빈 폴더다.
- 새 날짜 이미지가 생기면 먼저 해당 일차 폴더에 넣고, 그다음 CSS 또는 JS 경로를 연결한다.
