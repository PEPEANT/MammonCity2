# Character Asset Workflow

결론: `me_0.png`와 `mom__0.png`는 플레이어 컷신용 초록 배경 원본으로 취급하고, 항상 배경 제거 후 `assets/characters/player`에 넣어 사용한다.

## 목적

- 엄마 청소 보상 장면에서 같은 캐릭터 자산을 계속 재사용한다.
- 초록 배경 원본을 받으면 따로 지시가 없어도 같은 방식으로 처리할 기준을 남긴다.
- 한 번의 명령으로 장면용 투명 PNG 두 장을 다시 생성한다.

## 현재 규칙

- 기본 원본 입력 파일
  - `C:\Users\rneet\OneDrive\Desktop\MammonCity\me_0.png`
  - `C:\Users\rneet\OneDrive\Desktop\MammonCity\mom__0.png`
- 기본 출력 폴더
  - `assets/characters/player`
- 기본 출력 파일
  - `assets/characters/player/me-standing.png`
  - `assets/characters/player/mom-reward.png`
- 씬 연결 위치
  - 엄마가 청소 보상으로 돈을 주는 프롤로그 장면에서 두 이미지를 함께 사용한다.

## 실행 방법

두 장을 한 번에 다시 만들 때:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\process-player-assets.ps1
```

한 장만 개별 처리할 때:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\remove-green-screen.ps1 -InputPath .\me_0.png -OutputPath .\assets\characters\player\me-standing.png
```

## 관련 파일

- `scripts/process-player-assets.ps1`
  - `me_0.png`, `mom__0.png`를 한 번에 처리한다.
- `scripts/remove-green-screen.ps1`
  - 단일 초록 배경 PNG를 투명 PNG로 변환한다.
- `assets/characters/player`
  - 장면에 연결된 최종 캐릭터 PNG가 들어간다.
- `js/logic.js`
  - 엄마 청소 보상 장면에서 두 컷신 캐릭터를 배치한다.
- `js/ui.js`
  - 장면용 배우 레이어를 렌더링한다.

## 앞으로의 기준

- 사용자가 초록 배경 캐릭터 이미지를 주고 장면에 넣어달라고 하면 먼저 배경 제거부터 한다.
- 별도 지시가 없으면 플레이어 관련 컷신 자산은 `assets/characters/player` 아래에 저장한다.
- 체크무늬가 보이는 가짜 투명 PNG보다 초록 배경 원본을 우선한다.

## 제약

- 이 처리 방식은 단색 또는 거의 단색 초록 배경 기준이다.
- 배경색이 복잡하거나 머리카락 경계가 섬세하면 추가 보정이 필요할 수 있다.
