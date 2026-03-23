# 구역 기반 월드 구조
현재 결론: 월드는 `버스정류장 -> 구역 -> 세부 장소` 2단 구조로 확장하는 방향이 맞고, day01부터 `residential / study / commercial` 구역 뼈대가 들어갔다.

## 목적

카지노, 회사, 창업, 금융 구역까지 확장할 때 장소를 flat하게 늘리지 않고, 구역 단위로 정리하기 위한 기준 문서다.

## 현재 규칙

`state.world`

- `currentDistrict`
- `currentLocation`
- `unlockedDistricts`
- `unlockedLocations`
- `pendingTravelTarget`
- `pendingTravelDistrict`

현재 day01에는 아래 구역 메타데이터가 들어간다.

- `residential`
- `study`
- `commercial`
- `industrial`
- `underworld`
- `finance`

실제 day01에서 바로 이동 가능한 구역은 현재 `residential / study / commercial`이다.

## day01 적용 상태

### 버스정류장

- `bus-stop-map`은 이제 개별 장소 직행 지도가 아니라 구역 선택 허브다.
- 현재는 `주거 구역`, `학습 구역`, `상업 구역`을 고를 수 있다.

### 학습 구역

- `study-hub`
- `library`
- `exam-center`

도서관과 시험장은 이제 버스정류장에서 직접 꽂히는 대신 `학습 구역 입구`를 거쳐 들어간다.

## 추천 확장 순서

1. `study` 구역에 `university`, `park` 추가
2. `commercial` 구역에 회사/오피스 루트 추가
3. `underworld` 구역에 카지노와 수상한 NPC 추가
4. `finance` 구역에 은행/투자/사업 제안 추가
5. `industrial` 구역에 물류/현장/청소 확장

## 설계 원칙

- 버스정류장은 구역 선택 허브만 맡는다.
- 세부 장소 이동은 구역 내부에서 처리한다.
- 해금도 장소 단위만이 아니라 구역 단위로 같이 관리한다.
- day별 데이터는 장기적으로 `base city districts + day overrides`로 가는 것이 좋다.

실제 바깥 이동 UX는 [city-map-navigation.md](./city-map-navigation.md)처럼 `지도`, `행동 버튼`을 분리하는 방향이 맞다.

## 다음 문서

- [city-map-navigation.md](./city-map-navigation.md)
- [job-tracks.md](./job-tracks.md)
- [../early-progression.md](../early-progression.md)
