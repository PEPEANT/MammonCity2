<!-- AI 참고 금지: 설계 아이디어 문서입니다. 코드 수정 근거로 사용하지 마세요. -->

# 은행 대출 / 담보 / 압류

현재 결론: 은행 1차 확장은 `일반 대출`, `차량 담보 대출`, `집 담보 대출`, `턴 시작 자동 상환`, `연체 누적`, `담보 압류`를 한 루프로 묶어야 한다.

## 목적

- 은행 앱을 `입출금/송금`만 있는 도구에서 실제 금융 선택지로 확장한다.
- 차량, 집 같은 소유 자산이 단순 보유품이 아니라 `대출 여력`과 `압류 리스크`를 만드는 구조로 바꾼다.
- 1턴 = 1개월 구조에 맞춰 `월 상환` 감각을 만든다.
- 돈이 모자라면 그냥 행동이 막히는 게 아니라, `대출 -> 연체 -> 압류`로 이어지는 생활 압박을 추가한다.

## 1차 범위

이번 확장의 최소 범위는 아래 5개다.

1. 일반 대출
2. 차량 담보 대출
3. 집 담보 대출
4. 자동 상환 + 수동 조기 상환
5. 연체 누적 후 차량/집 압류

아직 1차에 넣지 않는 범위:

- 사채 / 불법 대부업
- 신용등급 수치화
- 법원 경매 / 압류 해제 소송
- 대출 상품 랜덤 이벤트
- 카드론 / 마이너스 통장 / 할부금융 세분화

## 핵심 루프

```text
은행 앱에서 대출 상품 확인
  -> 한도 / 금리 / 담보 조건 확인
  -> 대출 실행
  -> 계좌 잔액 즉시 증가
  -> 매 턴 시작 시 자동 상환 시도
  -> 잔액 부족 시 연체 증가
  -> 연체 누적 시 담보 압류
```

## 상품 구조

### 1. 일반 대출

- 담보 없음
- 한도는 작게
- 금리는 가장 높게
- 연체해도 바로 압류는 없지만 패널티가 빠르게 붙는다

권장 값 초안:

- 최대 한도: `300,000원 ~ 800,000원`
- 금리: `턴당 8% ~ 12%`
- 상환 기간: `4턴`
- 연체 2회부터 추가 연체료

용도:

- 당장 식비, 교통비, 급한 소비, 초기 자금 메우기

### 2. 차량 담보 대출

- `state.ownership.vehicle` 필요
- 차량 시세의 일부만 대출 가능
- 일반 대출보다 금리는 낮다
- 연체 누적 시 차량 압류

권장 값 초안:

- 대출 한도: `차량 평가액의 55% ~ 65%`
- 금리: `턴당 4% ~ 7%`
- 상환 기간: `5턴 ~ 6턴`
- 연체 2회 시 차량 압류

담보 대상:

- `bicycle`
- `used-motorbike`
- `used-car`
- `foreign-car`

### 3. 집 담보 대출

- `state.ownership.home` 필요
- 가장 큰 대출 가능
- 금리는 가장 낮다
- 연체 누적 시 집 압류 및 거처 강등

권장 값 초안:

- 대출 한도: `주거 자산 평가액의 50% ~ 70%`
- 금리: `턴당 3% ~ 5%`
- 상환 기간: `6턴 ~ 8턴`
- 연체 3회 시 집 압류

담보 대상:

- `oneroom`
- `officetel`
- 이후 `apartment`, `penthouse`

## 상환 규칙

### 자동 상환

매 턴 시작 시 아래 순서로 자동 상환을 시도한다.

1. `bank.balance`에서 먼저 차감
2. 부족하면 `wallet cash`에서 추가 차감
3. 그래도 부족하면 연체 처리

자동 상환 순서를 이렇게 두는 이유:

- 은행 앱을 쓰는 의미가 생긴다
- 잔액을 계좌에 넣어두는 습관이 게임적으로 중요해진다
- 현금만 들고 버티는 플레이와 분리된다

### 수동 상환

은행 앱에서 조기 상환 가능

- `최소 상환`
- `이번 턴 전액 상환`
- `전체 조기 상환`

조기 상환 장점:

- 다음 턴 이자 감소
- 압류 리스크 차단

## 연체와 압류

### 연체 단계

공통 규칙:

- 상환 실패 시 `overdueCount + 1`
- 연체 발생 시 은행 앱 상태 카드 + 헤드라인 + 거래내역 기록

### 일반 대출 연체

- 1회 연체: 경고
- 2회 연체: 연체료 추가
- 3회 이상: 신용 대출 신규 실행 잠금

### 차량 담보 연체

- 1회 연체: 경고
- 2회 연체: 차량 압류

차량 압류 결과:

- `state.ownership.vehicle = null`
- 이동 시간 보정 상실
- 차량 관련 배달/운송 공고는 조건 부족 상태로 전환
- 인벤토리 차량 키도 같이 사라짐

### 집 담보 연체

- 1회 연체: 경고
- 2회 연체: 최종 통보
- 3회 연체: 집 압류

집 압류 결과:

- `state.ownership.home = null`
- `state.ownership.residence`를 기본 거처로 되돌림
- 집 관련 문서/자산 카드 제거
- 이후 주거 시스템과 월세 압박 이벤트에 연결 가능

## 앱 흐름

은행 앱은 최소 3화면으로 간다.

### `bank/home`

- 현재 잔액
- 대출 총액
- 이번 턴 상환 예정액
- 연체 상태 요약
- `송금`
- `대출/상환`

### `bank/transfer`

- 기존 그대로 유지

### `bank/loans`

- 일반 대출 / 차량 담보 / 집 담보 상품 카드
- 보유 중 대출 목록
- 최소 상환 / 조기 상환 버튼
- 압류 경고 카드

## 상태 구조 초안

```js
state.bank = {
  balance: 0,
  transactions: [],
  transferDraft: {
    recipient: "",
    amount: "",
  },
  loans: [
    {
      id: "loan-vehicle-001",
      type: "vehicle-secured",
      lender: "배금은행",
      collateralKind: "vehicle",
      collateralId: "used-motorbike",
      principal: 1200000,
      remainingPrincipal: 1200000,
      interestRate: 0.05,
      installmentAmount: 252000,
      originatedTurn: 3,
      nextDueTurn: 4,
      termTurns: 6,
      overdueCount: 0,
      status: "active",
    },
  ],
  loanDraft: {
    selectedType: "personal",
  },
  lastLoanResolution: null,
};
```

## 거래내역 기록 원칙

은행 거래내역에는 아래가 모두 남아야 한다.

- 대출 실행
- 자동 상환
- 수동 상환
- 이자 차감
- 연체 발생
- 압류 완료

예시:

- `일반 대출 실행 +500,000원`
- `차량 담보 상환 -252,000원`
- `차량 담보 연체 경고 0원`
- `오토바이 압류 0원`

## 자산 평가 기준

1차는 복잡한 감정 시스템보다 `현재 카탈로그/되팔기 가격`을 기준으로 한다.

- 차량 담보 가치: `현재 되팔기 가격`
- 집 담보 가치: `현재 주거 자산 기준가`

즉, 호박마켓에서 이미 쓰고 있는 `resalePrice`를 기본 평가로 쓰고, 실제 보유 중인 자산은 `ownership.homeAsset / vehicleAsset`의 현재 평가액을 우선 읽는다.

## 구현 연결 지점

### 1. 은행 상태

- `js/apps/bank/bank-app-state.js`
- `createDefaultBankState()`
- `syncBankDomainState()`
- `createBankAppViewModel()`

### 2. 은행 UI

- `js/apps/bank/bank-manifest.js`
- `bank/home` 유지
- `bank/loans` 추가

### 3. 행동 처리

- 현재는 `js/logic.js` 은행 액션 분기
- 다음 구조 목표는 `bank-action-service` 또는 action runner 경유

### 4. 턴 시작 처리

- `prepareDayState()` 또는 `advanceDayOrFinish()` 직후
- 매 턴 시작 시 `processLoanTurnStart(state)` 실행

### 5. 자산 압류

- 차량: `ownership.vehicle`
- 집: `ownership.home`, `ownership.residence`
- 관련 UI는 ownership/inventory가 다시 렌더하면 자동 반영

## 위험

- 상환액이 너무 크면 초반이 바로 터진다
- 압류가 너무 빠르면 플레이어가 억울하게 느낀다
- 대출이 너무 쉬우면 돈 루프가 무너진다
- 집 압류 시 거처 fallback 규칙이 불명확하면 월드 상태가 꼬인다

## 추천 구현 순서

1. `bank.loans` 상태 추가
2. `bank/loans` 화면 추가
3. 일반 대출 실행 / 상환
4. 차량 담보 대출 + 차량 압류
5. 집 담보 대출 + 집 압류
6. 이후에만 연체 이벤트/사채/할부 확장

## 다음 문서

- [economy.md](./economy.md)
- [ownership.md](./ownership.md)
- [city-facilities.md](./city-facilities.md)
