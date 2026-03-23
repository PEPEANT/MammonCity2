# 지도 기반 외부 이동 리팩터링
현재 결론: 바깥 씬은 `이동`과 `현장 행동`을 분리하고, 이동은 `지도 버튼 -> 전체 도시 지도 -> 장소 클릭 -> 소요시간 확인 -> 이동 확정` 흐름으로 바꾸는 것이 맞다.

## 목적

- 현재 `outside` 씬은 장소 이동과 현장 행동이 같은 버튼 리스트에 섞여 있다.
- 어디로 갈 수 있는지 공간적으로 파악하기 어렵고, 장소가 늘수록 버튼 길이만 길어진다.
- `prototype/city-map.html`처럼 도시 전체를 한눈에 보여 주는 지도형 UI가 들어가면 이동 판단이 빨라지고, 장소 확장도 쉬워진다.

## 현재 구조 요약

- `js/data/days/day01/world.js`
  day01 장소 데이터와 `options`, `exits`, `districtId`를 같이 들고 있다.
- `js/ui.js`
  `renderOutsideScene()`가 현재 장소의 `options`를 그대로 버튼으로 뿌린다.
- `js/logic.js`
  `handleOutsideOption()`이 `action: "move"`와 현장 행동을 한 함수에서 같이 처리한다.
- `state.world`
  이미 `currentLocation`, `currentDistrict`, `pendingTravelTarget`, `pendingTravelDistrict`, `pendingTravelSource`, `pendingTravelMinutes`를 가지고 있어 이동 확정 이후 흐름은 재활용 가능하다.

## 목표 UX

### 방 밖으로 나온 뒤 기본 흐름

1. 장소 설명과 현재 위치 전용 행동 버튼이 보인다.
2. `지도 보기` 버튼을 누르면 도시 지도 오버레이가 열린다.
3. 지도에서 목적지를 클릭하면 이동 확인 카드가 뜬다.
4. 카드에서 `도보 / 버스`, `소요시간`, `도착 예정 시각`을 확인한다.
5. `이동하기`를 누르면 기존 `pendingTravel*` 기반 이동 씬으로 넘어간다.
6. 도착 후에는 새 장소의 현장 행동 버튼만 다시 렌더링된다.

### 꼭 지켜야 할 분리 규칙

- 지도 기반으로 옮길 것
  - 모든 장소 이동
  - 구역 간 이동
  - 역/상점/건물 내부 진입처럼 위치가 바뀌는 선택
  - 귀가
- 버튼으로 남길 것
  - 알바 게시판 보기
  - 음식/물건 구매
  - 공부, 자격증, 성형, NPC 상호작용
  - 현재 위치에서 시간을 보내는 행동
  - 앱 열기, 노선도 보기 같은 위치 고정 행동

핵심은 `위치가 바뀌면 지도`, `위치가 안 바뀌면 버튼`이다.

## 데이터 개편 방향

### 1. 장소 데이터 분리

현재 `options`에 섞여 있는 데이터를 아래처럼 나누는 쪽이 안전하다.

- `exits`
  - 현재 장소에서 지도상 이동 가능한 목적지 ID 목록
- `actions`
  - 현재 장소에서 버튼으로 노출할 현장 행동 목록
- `mapNode`
  - 지도 배치용 좌표와 표시 정보

예시 방향:

```js
"city-crossroads": {
  label: "배금 사거리",
  districtId: "commercial",
  exits: ["bus-stop", "station-front", "downtown", "baegeum-hospital", "convenience-store", "mcdonalds"],
  actions: [
    { title: "주변을 둘러본다", action: "wander" }
  ],
  mapNode: {
    x: 196,
    y: 210,
    icon: "🚦",
    shortLabel: "배금 사거리",
    zoneTone: "commercial",
  },
}
```

### 2. 지도 전용 메타데이터

`day01/world.js`에 최소한 아래 정보가 필요하다.

- 각 장소의 `mapNode.x`, `mapNode.y`
- 각 장소의 지도 아이콘
- 구역별 색상 또는 테마 키
- 버스 이용 가능 여부
- 도보 최소 시간 / 버스 최소 시간

### 3. 저장 상태 원칙

1차 구현에서는 저장 상태를 크게 늘리지 않는 쪽이 낫다.

- 유지
  - `currentLocation`
  - `currentDistrict`
  - `pendingTravel*`
- 가능하면 저장하지 않을 것
  - 지도 열림 여부
  - 현재 선택된 지도 목적지
  - 이동 확인 카드 UI 상태

지도 UI 상태는 `state` 바깥 모듈 로컬 상태로 두는 편이 저장 호환성이 좋다.

## UI 구조 제안

### 새 파일 배치

- `js/ui/city-map/city-map-ui.js`
  - 지도 오버레이 렌더링
  - 노드 클릭 처리
  - 이동 확인 카드 표시
- `js/systems/world/city-map-service.js`
  - 현재 위치 기준 도달 가능 목적지 계산
  - 이동 시간 계산
  - 버스/도보 선택 가능 여부 정리
- `css/city-map.css`
  - 지도 오버레이, 노드, 확인 카드 스타일
- `prototype/city-map.html`
  - 시각 방향 참고용 프로토타입으로 유지

### outside 씬 렌더 원칙

- `renderOutsideScene()`는 더 이상 이동 버튼을 직접 렌더링하지 않는다.
- 대신 아래만 책임진다.
  - 현재 장소 설명
  - 현재 장소 배우/NPC
  - 현장 행동 버튼
  - `지도 보기` 버튼

지도 오버레이는 `renderOutsideScene()` 바깥에서 독립 레이어로 떠야 한다.

## day01 도시 지도 초안

현재 데이터 기준으로 day01에서 먼저 보여 줄 구역은 아래 정도가 적당하다.

- `residential`
  - 집앞골목
  - 버스정류장
  - 버스터미널 안내
- `commercial`
  - 배금 사거리
  - 배금역 앞
  - 다운타운
  - 배금병원
  - 편의점
  - 맥도날드
- `study`
  - 학습 구역 입구
  - 도서관
  - 시험장
  - 대학가
  - 캠퍼스 공원

1차 목표는 day01 지도 완성이다. 다른 날짜는 같은 인터페이스를 재사용하고 좌표만 확장하면 된다.

## 구현 단계

### Phase 1 — 지도 UI 골격

- `prototype/city-map.html`의 레이아웃 방향을 실제 코드 구조에 맞게 축소 이식
- `지도 보기` 버튼 추가
- 오버레이 열기/닫기만 먼저 연결
- 현재 위치 하이라이트만 우선 표시

### Phase 2 — 이동 확인 카드

- 장소 클릭 시 확인 카드 열기
- `도보 / 버스`
- `소요시간`
- `도착 예정 시각`
- `취소 / 이동하기`

이 단계까지 오면 “이동을 지도에서 고른다”는 UX가 완성된다.

### Phase 3 — 데이터 분리

- `options`에서 `action: "move"`를 걷어내고 `actions`로 재구성
- `renderOutsideScene()`는 `actions`만 버튼으로 표시
- `handleOutsideOption()`는 현장 행동만 처리
- 지도 쪽에서만 이동 확정 함수 호출

### Phase 4 — 기존 이동 UI 정리

- 버스정류장 특수 버튼 이동을 지도 기반 흐름으로 흡수
- 필요하면 `renderLocationMap()`는 버스터미널 전용 지도만 남기거나 제거
- 중복 이동 버튼 제거

### Phase 5 — day 공용화

- day01 좌표/아이콘 메타데이터를 day 데이터 구조 규칙에 맞게 정리
- 날짜별 오버라이드가 가능한 형태로 일반화

## 위험과 제약

- `outside` 렌더 구조가 현재 `ui.js`에 크게 모여 있어, 지도 UI를 분리할 때 결합도가 높을 수 있다.
- 모바일 세로/가로 둘 다 지도가 읽혀야 한다.
- 저장 파일을 깨지 않으려면 지도 UI 상태는 영속 상태에 넣지 않는 것이 안전하다.
- day01에서 바로 모든 건물 내부까지 완벽한 지도를 만들려 하면 범위가 커진다.

## 구현 우선순위

1. `지도 보기` 버튼과 오버레이 뼈대
2. 이동 확인 카드
3. day01 좌표 메타데이터
4. 이동/행동 데이터 분리
5. 기존 이동 버튼 제거

## 다음 문서

- [world-districts.md](./world-districts.md)
- [../early-progression.md](../early-progression.md)
- [../day-data-layout.md](../day-data-layout.md)
