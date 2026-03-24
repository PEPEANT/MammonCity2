# NPC Romance Implementation Plan

Conclusion: 1차 여자친구 루프는 이미 동작한다. 현재 기준 루프는 `길거리 조우 -> 연락처 획득 -> 폰 약속 -> 다음날 브리핑 -> 방에서 데이트/집 초대 시작 -> 관계 진전`이다.

## Purpose

- 여자친구 후보 NPC를 실제 월드 조우와 폰 연락 루프에 연결한다.
- 여성 NPC 원본 PNG와 실사용 PNG 경로를 분리해서 자산 충돌을 막는다.
- 다음 세션에서 데이트 세부 이벤트와 장기 관계 분기만 이어 붙일 수 있게 현재 동작을 고정한다.

## Current Status

### Implemented now

- `convenience-cashier`, `high-school-girl`, `npc-woman` 3명 조우/대화/연락처 획득
- 외모 규칙
  - `1LV`: 연락처 획득 불가
  - `2LV`: 대화 후 확률로 연락처 획득
  - `3LV`: 길거리에서 랜덤으로 번호를 따임
- 폰 `통화` 앱에서 연락처 확인, 통화, 약속, 집 초대
- 약속/집 초대는 다음날 브리핑으로 안내
- 다음날 방에서 `데이트 나가기` 또는 `집 초대 시작`
- 이벤트 완료 후 관계 단계 상승

### Not implemented yet

- 데이트 장소별 세부 분기
- 메시지/부재중/재연락 루프
- 거절, 잠수, 호감도 하락 같은 실패 분기
- 집 초대 이후 장기 연애/결혼 계열 확장

## Current Live Loop

1. 월드에서 여성 NPC를 조우한다.
2. 외모 레벨과 NPC 조건이 맞으면 연락처를 얻는다.
3. 폰 `통화` 앱에서 `약속` 또는 `집초대`를 누른다.
4. 일정은 즉시 실행되지 않고 다음날 브리핑에 예약된다.
5. 다음날 방에서 전용 버튼으로 이벤트를 시작한다.
6. 이벤트 종료 시 행복도, 관계 단계, 일부 비용이 반영된다.

## Relationship Stages

- 내부 단계:
  `none -> interest -> contact -> dating -> serious`
- UI 표기:
  - `interest`: 썸 시작
  - `contact`: 연락 중
  - `dating`: 데이트 중
  - `serious`: 여자친구

## Current NPC Roster

- `convenience-cashier`
  - 성형 전/후 variant가 있는 편의점 알바 NPC
  - 약속 장소: 편의점 근처
  - 기본 데이트 비용: 9,000원
  - 집 초대 비용: 5,000원
- `high-school-girl`
  - 길거리 조우형 학생 NPC
  - 약속 장소: 캠퍼스 공원
  - 기본 데이트 비용: 7,000원
  - 집 초대 비용: 4,000원
- `npc-woman`
  - 중심상업구역 일반 여성 NPC
  - 약속 장소: 중심상업구역
  - 기본 데이트 비용: 18,000원
  - 집 초대 비용: 8,000원

## Current Canonical Asset Rule

- 실사용 NPC PNG:
  `assets/characters/npc/<npc-id>/<variant>.png`
- 원본 NPC PNG:
  `assets/_incoming/characters/npc/<group>/...`
- 여자친구 후보 원본 그룹:
  `assets/_incoming/characters/npc/romance/`

## Key State

- `state.npcs.relations[npcId]`
  - `contactKnown`
  - `phoneContactId`
  - `romanceStage`
  - `lastContactDay`
  - `lastDateDay`
  - `invitedHome`
- `state.social.contacts`
  - 폰 연락처 목록
  - 약속/집 초대 예약 상태
- `state.romanceScene`
  - 현재 진행 중인 데이트/집 초대 씬

## Current UI Rule

- 작은 폰 화면:
  연락처 이름과 핵심 상태만 간단히 보여준다.
- 펼치기 화면:
  연락처 설명, 관계 단계, 약속/집 초대 버튼까지 전부 보여준다.

## Next Recommended Tasks

1. 데이트 장소별 세부 연출 분기 추가
2. `통화 -> 약속 수락/거절` 확률과 대사 분기 강화
3. 집 초대 이후 장기 상태를 `serious` 이상으로 확장할지 결정
4. 다음턴 브리핑에 로맨스 후속 사건을 더 넣기
