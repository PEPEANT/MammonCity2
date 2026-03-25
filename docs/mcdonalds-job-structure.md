# 맥도날드 근무 구조

현재 결론: 맥도날드는 `도시 지도 앵커 1개 + 내부 근무 스테이지 2개` 구조로 고정한다. 지도와 예약 근무의 대표 ID는 `mcdonalds` 하나만 쓰고, 실제 포지션은 `mcd-counter`와 `mcd-kitchen`으로 분리한다.

## 목적

- 카운터 / 조리 2포지션 구조를 문서 기준으로 고정한다.
- 카운터는 현재 미니게임 기준을 명시하고, 조리는 다음 단계에서 채울 뼈대를 먼저 남긴다.
- 예전 `오픈 카페`, `cafe`, `카페 알바`처럼 흩어진 표기를 현재 맥도날드 venue ID로 정리한다.

## 기준 ID

- 외부 앵커: `mcdonalds`
- 카운터 스테이지: `mcdonalds-counter`
- 주방 스테이지: `mcdonalds-kitchen`
- 카운터 잡 ID: `mcd-counter`
- 주방 잡 ID: `mcd-kitchen`

두 내부 스테이지는 모두 `cityMapAnchorId = "mcdonalds"`를 사용한다. 즉 지도에는 맥도날드 한 지점만 보이고, 내부 단계만 카운터/주방으로 갈라진다.

## 장소 흐름

```text
도시 사거리
  -> mcdonalds
  -> mcdonalds-counter
  -> mcdonalds-kitchen
```

- `mcdonalds`
  외부 진입점이자 지원/근무 확인 기준 위치.
- `mcdonalds-counter`
  손님 행동과 카운터 근무가 함께 붙는 기본 내부 스테이지.
- `mcdonalds-kitchen`
  조리 포지션 전용 스테이지.

## 포지션 구조

### 카운터

- 잡 ID는 `mcd-counter`.
- 근무 위치는 `mcdonalds-counter`.
- 현재 미니게임 기준은 `fast-food-counter-rush`.
- 주문, 음료, 픽업 흐름을 빠르게 정리하는 쪽이 기본 감각이다.
- 손님 행동인 `세트 메뉴 주문`, `커피 주문`도 카운터에 남긴다.

### 조리

- 잡 ID는 `mcd-kitchen`.
- 근무 위치는 `mcdonalds-kitchen`.
- 현재 데이터에는 `fast-food-kitchen-rush` 정의가 있고, 카드 배열은 비어 있다.
- 실제 런타임은 `dynamic-kitchen` 세션으로 진입해 조리 라인을 처리한다.
- 즉 조리 미니게임은 `예약 구조와 세션 진입은 live`, `정적 카드 데이터는 추후 채움` 상태다.

## 지원과 출근 규칙

- 맥도날드 지원은 venue 상태를 통해 시간대가 열렸을 때만 가능하다.
- 현재 카운터와 조리 모두 같은 출근 슬롯 규칙을 쓴다.
  - 시작 슬롯: `18`, `22`
  - 근무 길이: `10 슬롯`
- 손님 모드와 근무 모드는 분리한다.
- 근무가 없는 시간에는 카운터 소비 행동만 남기고, 예약된 근무가 있는 날에만 `대기 / 출근 시작` 흐름을 연다.
- 주방 근무가 끝나면 플레이어는 안전하게 카운터 쪽으로 되돌린다.

## 카페 ID -> 맥도날드 전환 기준

- 현재 프로토타입에서 패스트푸드 체인 venue의 대표 ID는 `mcdonalds`다.
- 예전 문서나 메모에서 아래 표현이 현재 맥도날드 지점을 가리킨다면 모두 `mcdonalds` 계열로 본다.
  - `오픈 카페`
  - `cafe`
  - `카페 알바`
- 단, 일반 카페 소비 장소나 미래 체인점 설계 전체를 `mcdonalds`로 뭉개지는 않는다.
- 전환 기준은 `현재 fast-food work venue를 가리키는가` 하나로 본다.

## 현재 구현 메모

- `jobs-data.js`에 `mcd-counter`, `mcd-kitchen` 두 공고가 이미 분리돼 있다.
- `job-workplaces-data.js`에도 두 포지션의 근무지명과 출근 힌트가 따로 있다.
- `day01/world.js`에는 외부 / 카운터 / 주방 세 위치가 모두 live다.
- `logic.js`와 `jobs-action-service.js`는 맥도날드 venue 전용 상태 계산과 현장 흐름을 따로 갖고 있다.

## 리스크와 후속 작업

- 카운터는 소비와 근무가 같이 붙어 있어 문구가 길어지기 쉽다.
- 주방은 현재 세션 진입은 live지만, 정적 카드형 미니게임 뼈대는 아직 비어 있다.
- 문서와 코드에서 `카운터만 있는 맥도날드` 전제를 더 이상 쓰지 않도록 기존 문서를 계속 정리해야 한다.

## 다음 문서

- [workplace-shift-loop-plan.md](./workplace-shift-loop-plan.md)
- [early-progression.md](./early-progression.md)
- [alb-no-rejection-design.md](./alb-no-rejection-design.md)
