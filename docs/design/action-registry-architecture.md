<!-- AI 참고 금지: 설계 아이디어 문서입니다. 코드 수정 근거로 사용하지 마세요. -->

# 공통 액션 / 레지스트리 구조
결론: 앞으로 추가될 소비, 이동, 직업, 시설, NPC 기능은 `도메인 경계 -> typed action schema -> registry -> action runner` 순서로 붙여야 한다.

## 목적

- 새 기능을 붙일 때마다 `logic.js`에 전용 분기와 전용 상태 패치를 늘리는 흐름을 멈춘다.
- 시설, 회사, 직업, 차량, 소비, 연애가 같은 규칙으로 연결되게 만든다.
- UI는 렌더만 하고, 판정과 상태 변경은 도메인 서비스가 맡게 만든다.
- 추상화만 커지고 실제 기능은 못 붙이는 상황을 피한다.

## 핵심 결론

1. `만능 액션 엔진`은 만들지 않는다.
2. 액션 러너는 공통 흐름만 맡고, 실제 판정은 각 도메인 서비스가 맡는다.
3. 액션 데이터는 문자열 스크립트가 아니라 `typed operation`만 담는다.
4. 상태는 처음부터 예쁘게 재배열하는 것보다 `어디가 소유권자인지`를 먼저 고정한다.
5. 시설/회사/직업 레지스트리와 액션 스키마는 따로 만들되, 서로 직접 맞물리게 설계한다.

## 먼저 고정할 도메인 경계

### 1. 소유권

- `inventory-service`
  아이템, 장비, 소비품, 폰, 가방의 원본 소유자
- `ownership`
  집, 차량, 장기 자산의 원본 소유자
- `presentation-service`
  외모, attractiveness, appearance flags의 원본 소유자
- `jobs`
  직업 조건, 자격, 시프트, 회사 소속의 원본 소유자
- `npcs`
  관계, attraction, affinity, 연락 상태의 원본 소유자

### 2. 누가 판정하는가

- 이동수단/면허 판정: `mobility` 또는 `ownership/inventory`를 읽는 이동 서비스
- 직업 지원 가능 판정: jobs 도메인
- 소비 가능 판정: consumption 도메인
- 외모 반영: presentation 도메인
- NPC 반응 판정: social/npc 도메인

### 3. 지금 바로 필요 없는 것

- 처음부터 `state.assets`, `state.mobility`, `state.jobs`로 완벽 재이관
- 모든 기능을 하나의 super service에 몰아넣기
- world/day 데이터 구조를 전부 새로 갈아엎기

## 공통 액션 흐름

```text
UI 클릭
  -> actionId + context 전달
  -> registry에서 action 정의 조회
  -> requirement resolver가 가능 여부 판정
  -> cost resolver가 돈/시간/체력 차감
  -> domain operations 적용
  -> headline / memory / phone status 갱신
  -> UI 재렌더
```

이때 중요한 점:

- 액션 러너는 `흐름 제어`만 한다.
- 세부 판정은 도메인 서비스가 한다.
- 액션 정의는 `무엇을 하려는지`만 담는다.

## 공통 액션 스키마 초안

```js
const ACTION_DEFINITION = {
  id: "buy-used-motorbike",
  domain: "consumption",
  kind: "purchase",
  sourceType: "facility", // facility | company | npc | phone-app | world
  sourceId: "motor-dealer",
  title: "중고 오토바이를 산다",

  requirements: [
    { type: "money", min: 1800000 },
    { type: "license", id: "motorbike" },
    { type: "space", owner: "ownership.vehicle", allowReplace: true },
  ],

  costs: [
    { type: "money", amount: 1800000 },
    { type: "minutes", amount: 30 },
    { type: "energy", amount: 4 },
  ],

  operations: [
    { type: "set-owned-vehicle", vehicleId: "used-motorbike" },
    { type: "grant-inventory-item", itemId: "vehicle-key-used-motorbike", quantity: 1 },
    { type: "set-flag", path: "state.mobility.hasMotorbike", value: true },
    { type: "patch-happiness", delta: 2 },
  ],

  feedback: {
    headline: {
      badge: "이동 수단",
      text: "중고 오토바이를 마련해 배달과 장거리 이동이 쉬워졌다.",
    },
    memory: {
      title: "중고 오토바이를 샀다",
      text: "이제 이동 시간이 줄고 배달 루트 선택지가 넓어진다.",
      tags: ["소비", "차량", "배달"],
    },
  },
};
```

## requirements 규칙

요구조건은 `문자열 if문`이 아니라 타입으로 제한한다.

```js
[
  { type: "money", min: 50000 },
  { type: "location", anyOf: ["department-store", "downtown"] },
  { type: "inventory-item", itemId: "suit-basic", minQty: 1 },
  { type: "equipped-item", slot: "phone", anyOf: ["phone-mid", "phone-premium"] },
  { type: "owned-vehicle", anyOf: ["bicycle", "used-motorbike"] },
  { type: "license", id: "driver" },
  { type: "stat", stat: "appearance.attractiveness", min: 6 },
  { type: "job-prep", key: "office", min: 3 },
  { type: "npc-relation", npcId: "mina", key: "affinity", min: 4 },
  { type: "flag", path: "state.appearance.flags.surgeryDone", equals: true },
]
```

## costs 규칙

비용도 같은 방식으로 타입을 고정한다.

```js
[
  { type: "money", amount: 120000 },
  { type: "minutes", amount: 45 },
  { type: "stamina", amount: 8 },
  { type: "energy", amount: 12 },
  { type: "hunger", amount: 1 },
  { type: "recurring-charge", bucket: "phone-plan", amount: 55000 },
]
```

## operations 규칙

`effects`를 자유 문자열로 두지 않고 typed operation으로 고정한다.

```js
[
  { type: "grant-inventory-item", itemId: "shirt-clean", quantity: 1 },
  { type: "consume-inventory-item", itemId: "hair-wax", quantity: 1 },
  { type: "set-equipped-item", slot: "phone", itemId: "phone-premium" },
  { type: "set-owned-home", homeId: "oneroom" },
  { type: "set-owned-vehicle", vehicleId: "used-motorbike" },
  { type: "patch-appearance", attractivenessDelta: 2, flags: { salonDone: true } },
  { type: "patch-happiness", delta: 3 },
  { type: "patch-stat", path: "state.stats.social.reputation", delta: 1 },
  { type: "unlock-facility", facilityId: "stock-exchange" },
  { type: "schedule-job-shift", companyId: "bg-delivery", jobId: "rider-basic" },
]
```

## 액션 러너가 해야 하는 일

- action lookup
- requirement 검사 호출
- cost 적용 호출
- operation 적용 호출
- feedback 출력

## 액션 러너가 하면 안 되는 일

- 오토바이 면허 판정을 직접 쓰기
- 수술 여부에 따라 NPC 반응 수치를 직접 계산하기
- 직업별 성공률 수식을 직접 들고 있기
- 시설별 구매 규칙을 switch 문으로 품기

## 레지스트리 구조

### 1. 시설 레지스트리

시설은 `장소`와 `제공 액션 묶음`의 소유자다.

```js
const FACILITY_REGISTRY = {
  motor-dealer: {
    id: "motor-dealer",
    label: "배금 모터스",
    districtId: "crossroad-district",
    locationId: "motor-dealer",
    category: "vehicle",
    actionIds: [
      "buy-used-bicycle",
      "buy-used-motorbike",
      "repair-owned-vehicle",
    ],
    npcIds: ["dealer-kim", "repair-chief"],
    tags: ["차량", "정비", "면허"],
  },
};
```

### 2. 회사 레지스트리

회사는 `직업`, `근무지`, `인수/매각`, `지분`의 소유자다.

```js
const COMPANY_REGISTRY = {
  bg-delivery: {
    id: "bg-delivery",
    label: "배금딜리버리",
    industry: "delivery",
    facilityId: "delivery-hub",
    jobIds: ["rider-basic", "dispatch-assistant"],
    ownershipMode: "private",
    stockSymbol: null,
    tags: ["배달", "라이더", "관제"],
  },
  bg-retail: {
    id: "bg-retail",
    label: "배금리테일",
    industry: "retail",
    facilityId: "department-store",
    jobIds: ["sales-floor", "display-assistant"],
    ownershipMode: "public",
    stockSymbol: "BGRT",
    tags: ["백화점", "유통", "상장사"],
  },
};
```

### 3. 직업 레지스트리

직업은 `회사 소속`, `하드 게이트`, `기본 액션 템플릿`의 소유자다.

```js
const JOB_REGISTRY = {
  rider-basic: {
    id: "rider-basic",
    label: "배달 라이더",
    companyId: "bg-delivery",
    worksiteFacilityId: "delivery-hub",
    requirements: [
      { type: "owned-vehicle", anyOf: ["bicycle", "used-motorbike"] },
      { type: "license", id: "motorbike", optionalFor: ["used-motorbike"] },
    ],
    shiftActionId: "work-rider-basic",
    tags: ["배달", "야외", "이동"],
  },
};
```

### 4. 자산 레지스트리

자산은 구매/유지/감가/되팔기 공통 정보를 가진다.

```js
const VEHICLE_REGISTRY = {
  used-motorbike: {
    id: "used-motorbike",
    label: "중고 오토바이",
    kind: "motorbike",
    travelModifier: { shortTripMultiplier: 0.55, longTripMultiplier: 0.6 },
    upkeep: { fuel: 4000, repairChance: 0.08 },
    resaleBand: { min: 0.45, max: 0.72 },
    requiredLicenseId: "motorbike",
  },
};
```

### 5. 면허/자격 레지스트리

면허와 자격은 직업/차량/시설 요구조건을 연결하는 얇은 도메인이다.

```js
const LICENSE_REGISTRY = {
  motorbike: {
    id: "motorbike",
    label: "원동기 면허",
    unlockActionId: "earn-motorbike-license",
    tags: ["이동", "배달"],
  },
  driver: {
    id: "driver",
    label: "운전면허",
    unlockActionId: "earn-driver-license",
    tags: ["차량", "장거리"],
  },
};
```

## 상태 경계 초안

처음부터 대이동하지 말고, 원본 소유자만 명확히 둔다.

```js
state = {
  inventory,   // 아이템 / 장비
  ownership,   // 집 / 차량
  appearance,  // attractiveness / flags
  jobs,        // 준비도 / 자격 / 시프트 / 회사
  npcs,        // relations / attraction / affinity
  world,       // 현재 위치 / 해금 상태
  market,      // 현재 턴 경제 스냅샷 참조용
}
```

## 지금 하면 안 되는 구조

### 1. 기능마다 전용 로직 만들기

- `if (action === "buy-bike")`
- `if (action === "buy-motorbike")`
- `if (action === "buy-car")`

이런 식으로 늘리면 다시 거대 파일로 돌아간다.

### 2. world.js에 도시 기능 누적하기

`world.js`는 위치/장소 데이터까지만 맡고, 시설의 구매 규칙이나 회사 구조는 레지스트리 쪽이 맡아야 한다.

### 3. UI가 판정하기

- 폰 앱이 “살 수 있는지” 계산
- 지도 UI가 이동 시간 보정까지 직접 계산
- NPC 대화 UI가 외모 반응 수치를 계산

이런 구조는 금지한다.

## 추천 구현 순서

1. 도메인 소유권을 문서 기준으로 확정한다.
2. 공통 액션 스키마를 고정한다.
3. 시설/회사/직업/차량/면허 레지스트리 초안을 만든다.
4. 액션 러너가 레지스트리를 읽는 얇은 구조를 만든다.
5. 첫 실제 적용은 `오토바이 구매 -> 배달 하드 게이트 -> 이동 시간 보정`에 쓴다.
6. 그 다음에 `폰 업그레이드`, `운동`, `외모꾸미기`, `호박마켓`, `실제 회사 출근`으로 확장한다.

## 이 문서를 먼저 쓰는 이유

- 파일을 자르지 않아도 새 기능이 붙을 자리부터 고정할 수 있다.
- `나중에 분리할 때`도 어떤 함수가 어느 도메인으로 가야 하는지 기준이 생긴다.
- 지금 단계에서 가장 위험한 `기능마다 전용 규칙 추가`를 막을 수 있다.

## 추천 다음 문서

- [system-audit.md](./system-audit.md)
- [consumption.md](./consumption.md)
- [city-facilities.md](./city-facilities.md)
- [npc-social-system.md](./npc-social-system.md)
- [mobility-and-stats-audit.md](./mobility-and-stats-audit.md)
