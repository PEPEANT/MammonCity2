<!-- 현재 구현 기준 문서. 인벤토리 표시와의 책임 분리를 명확히 적는다. -->

# 소유 시스템

현재 결론: 집과 차량 같은 큰 자산의 원본 데이터는 `state.ownership`가 가진다. 인벤토리는 이 값을 읽어서 문서 카드나 자산 카드를 보여주는 UI 역할만 한다.

## 현재 상태 구조

```js
state.ownership = {
  residence: "parents-room",
  home: null,
  vehicle: null,
  homeAsset: null,
  vehicleAsset: null,
};
```

- `residence`
  현재 머무는 거처 키. 시작값은 `parents-room`이다.
- `home`
  직접 보유한 집 자산 키. 없으면 `null`.
- `vehicle`
  직접 보유한 차량 자산 키. 없으면 `null`.
- `homeAsset`
  현재 보유 중인 집 자산 레코드. 매입가, 현재 평가액, 취득 턴, 취득 경로를 가진다.
- `vehicleAsset`
  현재 보유 중인 차량 자산 레코드. 매입가, 현재 평가액, 취득 턴, 취득 경로를 가진다.

## 책임 분리

- `ownership`은 실제 소유 원본이다.
- `inventory`는 플레이어에게 보이는 보유품/문서/자산 패널이다.
- `homeAsset / vehicleAsset`은 현재 자산 가치와 취득 이력을 붙잡는 실데이터다.
- 집을 소유하면 인벤토리 `문서` 탭에 집 관련 서류가 자동 생성된다.
- 차량을 소유하면 인벤토리 `소지품` 탭에 차량 키가 자동 생성된다.
- 집이나 차를 잃는 로직은 앞으로도 `ownership`을 먼저 바꾸고, 인벤토리는 그 결과를 다시 그리게 한다.

## 현재 카탈로그

### 주거

- `parents-room`
- `goshiwon`
- `oneroom`
- `officetel`
- `apartment`
- `penthouse`
- `hideout`

### 차량

- `bicycle`
- `used-car`
- `foreign-car`

## 현재 구현 범위

- 저장/불러오기 포함
- 인벤토리 표시 연동 포함
- `setOwnedHome()`, `setOwnedVehicle()` 헬퍼 포함
- 집/차 매입 시 `매입가 / 현재 평가액 / 취득 경로 / 취득 턴` 기록 포함
- 차량/집 현재 평가액을 은행 담보 가치와 호박마켓 되팔기 화면이 같이 읽음
- 담보로 잡힌 자산은 호박마켓에서 즉시 되팔 수 없음
- 압류 시 `homeAsset / vehicleAsset` 레코드도 함께 제거됨

## 아직 구현하지 않은 범위

- 배경 이미지를 `ownership.residence`로 자동 교체하는 기능
- 집/차 다중 보유 포트폴리오
- 감가상각, 수리비, 유지비 같은 월간 자산 변동
- 집/차 보유 조건을 실제 선택지나 루트에 더 촘촘히 연결하는 기능

담보 대출과 압류 흐름의 상세 설계는 별도 문서로 정리한다.

- 상세 규칙 문서: `docs/design/bank-loans-and-collateral.md`
- 출생 자산 패키지와 현금/계좌 흐름: `docs/design/wealth-and-cashflow.md`

## 다음 단계

1. 거처 배경과 `ownership.residence`를 연결한다.
2. 차량 소유 여부를 이동/알바 조건과 연결한다.
3. 집 계약서, 차량 키 외에 자격증/허가증도 `ownership`과 구분해 설계한다.
