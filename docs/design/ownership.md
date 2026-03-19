<!-- AI 참고 금지: 설계 아이디어 문서입니다. 코드 수정 근거로 사용하지 마세요. -->

# 소유 시스템 설계

## 핵심 개념

집/차 등 큰 소유물은 구매 시 state에 저장되고 배경이 즉시 바뀜.
로그인한 플레이어는 14일 이후 다음 회차에서 구매한 집에서 시작함.
게스트는 매번 부모님 집에서 시작.

---

## 집 소유

### 집 등급 및 배경

| 집 | 구매 조건 | 배경 이미지 | 느낌 |
|----|----------|------------|------|
| 부모님 집 | 기본값 | assets/rooms/parents-room.png | 좁고 어수선한 원룸 (현재 배경 재활용) |
| 고시원 | 50만 원 | assets/rooms/goshiwon.png | 더 좁고 어두운 느낌 |
| 원룸 | 500만 원 | assets/rooms/oneroom.png | 독립한 느낌, 깔끔함 |
| 오피스텔 | 3,000만 원 | assets/rooms/officetel.png | 현대적, 도시적 |
| 아파트 | 1억 원 | assets/rooms/apartment.png | 넓고 밝음 |
| 펜트하우스 | 10억 원 | assets/rooms/penthouse.png | 야경 보이는 고층 |
| 비밀 아지트 | 범죄도 90 이상 | assets/rooms/hideout.png | 어둡고 은밀 |

### 로그인 시 집 저장

```
14일 종료 시
  → 현재 보유 집 등급 서버에 저장
  → 다음 회차 시작 시 그 집에서 시작
  → 배경 이미지 자동 반영
```

---

## 차 소유

### 차 종류 및 효과

| 차 | 구매 조건 | 효과 | 외출 씬 변화 |
|----|----------|------|------------|
| 없음 | 기본값 | 없음 | 도보 이동 |
| 자전거 | 10만 원 | 이동 시간 소폭 단축 | 자전거 등장 |
| 중고차 | 300만 원 | 이동 시간 단축, 배달 알바 해금 | 낡은 차 등장 |
| 외제차 | 5,000만 원 | 외모 +, 평판 +, 과시형 루트 강화 | 고급차 등장 |

---

## state 구조

```js
state.소유 = {
  집: "parents-room",  // 현재 거주 집 키 (배경 결정)
  차: null,            // null이면 도보
}
```

---

## assets 구조

```
assets/
  rooms/
    parents-room.png   ← 현재 day01 배경 재활용
    goshiwon.png
    oneroom.png
    officetel.png
    apartment.png
    penthouse.png
    hideout.png
  vehicles/
    bicycle.png
    used-car.png
    foreign-car.png
```

---

## 원칙

- 집은 한 번 사면 영구 소유 (로그인 저장)
- 차는 회차마다 초기화 (집만 이월)
- 배경은 state.소유.집 값에 따라 자동으로 바뀜
- 부모님 집 배경은 현재 day01 배경 그대로 재활용
- 로그인 없는 게스트는 매번 부모님 집 시작
