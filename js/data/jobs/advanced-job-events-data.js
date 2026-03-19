const ADVANCED_JOB_EVENTS = {
smart_store: {
    repeatable: [
      {
        id: "smart-store-id-check",
        title: "무인 주류 결제가 막힌다",
        intro: [
          "성인 인증이 풀리지 않아서 계산대 앞이 금방 길어진다.",
          "매장엔 너 말고 도와줄 사람이 없다.",
        ],
        choices: [
          {
            label: "한 명씩 직접 풀어 준다",
            payMultiplier: 1,
            bonus: 7000,
            result: [
              "시간은 걸렸지만 매장을 멈추게 하진 않았다.",
            ],
          },
          {
            label: "주류 판매를 잠깐 막는다",
            payMultiplier: 0.9,
            bonus: 0,
            result: [
              "불만은 생겼지만 계산대는 금방 안정됐다.",
            ],
          },
        ],
      },
      {
        id: "smart-store-voice",
        title: "키오스크 음성 안내가 반복 재생된다",
        intro: [
          "매장 전체에 같은 안내 멘트가 계속 울린다.",
          "손님들은 점점 예민해지고 있다.",
        ],
        choices: [
          {
            label: "설정을 찾아 직접 꺼 본다",
            payMultiplier: 1,
            bonus: 4000,
            result: [
              "소음을 멈춰서 매장이 겨우 조용해졌다.",
            ],
          },
          {
            label: "본사 문의만 남긴다",
            payMultiplier: 0.95,
            bonus: 0,
            result: [
              "근본 해결은 못 했지만 네 선에서는 정리됐다.",
            ],
          },
        ],
      },
    ],
  },
  dispatch_monitor: {
    repeatable: [
      {
        id: "dispatch-reroute",
        title: "우천 경로 재설정이 한꺼번에 들어온다",
        intro: [
          "비구름이 넘어오면서 로봇 경로랑 라이더 경로가 동시에 엉킨다.",
          "모니터 앞에서 우선순위를 바로 정해야 한다.",
        ],
        choices: [
          {
            label: "로봇 경로부터 정리한다",
            payMultiplier: 1,
            bonus: 5000,
            result: [
              "도심 쪽은 금방 정리됐고, 관제팀이 고맙다고 했다.",
            ],
          },
          {
            label: "사람 라이더 콜부터 살린다",
            payMultiplier: 1,
            bonus: 3000,
            result: [
              "콜 지연은 줄었지만 로봇 두 대가 잠깐 멈췄다.",
            ],
          },
        ],
      },
      {
        id: "dispatch-calls",
        title: "라이더 문의 전화가 몰린다",
        intro: [
          "앱에 표시된 도착 시간과 실제 동선이 자꾸 어긋난다.",
          "전화, 채팅, 관제 화면이 동시에 울린다.",
        ],
        choices: [
          {
            label: "전화부터 쳐낸다",
            payMultiplier: 1,
            bonus: 4000,
            result: [
              "문의는 빨리 빠졌고 화면도 다시 안정됐다.",
            ],
          },
          {
            label: "관제 화면부터 정리한다",
            payMultiplier: 0.95,
            bonus: 0,
            result: [
              "큰 사고는 막았지만 문의는 끝까지 남았다.",
            ],
          },
        ],
      },
    ],
  },
  study_coach: {
    repeatable: [
      {
        id: "study-coach-summary",
        title: "AI 요약이 엉뚱하게 나왔다",
        intro: [
          "앱이 단원 핵심을 이상하게 뽑아 와서 학생이 더 헷갈려 한다.",
          "오늘은 네 설명이 실제 수업이 된다.",
        ],
        choices: [
          {
            label: "핵심만 다시 손으로 정리해 준다",
            payMultiplier: 1,
            bonus: 9000,
            result: [
              "학생이 이해한 티가 바로 났고, 오늘 수업은 제대로 끝났다.",
            ],
          },
          {
            label: "앱 자료 위에 짧게 보충만 한다",
            payMultiplier: 0.95,
            bonus: 0,
            result: [
              "시간은 절약했지만 설명 맛은 덜했다.",
            ],
          },
        ],
      },
      {
        id: "study-coach-voice",
        title: "학생이 문제보다 설명을 더 원한다",
        intro: [
          "채점은 앱이 다 했는데, 학생은 왜 틀렸는지가 궁금하다고 한다.",
          "결국 네가 사람 목소리로 길을 다시 열어 줘야 한다.",
        ],
        choices: [
          {
            label: "예시를 더 들어 가며 풀어 준다",
            payMultiplier: 1,
            bonus: 6000,
            result: [
              "수업은 길어졌지만 만족도는 확실히 올라갔다.",
            ],
          },
          {
            label: "오답 패턴만 짚고 마무리한다",
            payMultiplier: 1,
            bonus: 0,
            result: [
              "깔끔하게 끝냈고 오늘 분량은 지켰다.",
            ],
          },
        ],
      },
    ],
  },
  robot_floor: {
    repeatable: [
      {
        id: "robot-floor-block",
        title: "아이가 서빙봇 앞을 막고 선다",
        intro: [
          "서빙봇이 테이블 사이에서 멈춰서 계속 안내 멘트만 반복한다.",
          "홀 흐름이 다 끊기기 전에 길을 열어야 한다.",
        ],
        choices: [
          {
            label: "직접 가서 길을 연다",
            payMultiplier: 1,
            bonus: 5000,
            result: [
              "봇은 다시 움직였고 테이블 회전도 금방 살아났다.",
            ],
          },
          {
            label: "손님 부모에게 먼저 부탁한다",
            payMultiplier: 0.95,
            bonus: 0,
            result: [
              "조금 늦었지만 큰 소란 없이 정리됐다.",
            ],
          },
        ],
      },
      {
        id: "robot-floor-tray",
        title: "서빙 트레이가 중간에 비스듬해진다",
        intro: [
          "음료가 한쪽으로 쏠리면서 로봇이 자꾸 속도를 줄인다.",
          "주문은 밀리고 매니저 시선도 느껴진다.",
        ],
        choices: [
          {
            label: "직접 내려서 다시 실어 준다",
            payMultiplier: 1,
            bonus: 4000,
            result: [
              "손은 갔지만 로봇은 다시 제 속도를 찾았다.",
            ],
          },
          {
            label: "테이블 도착 후에만 정리한다",
            payMultiplier: 0.9,
            bonus: 0,
            result: [
              "조금 어수선했지만 최소한의 선에서 마무리했다.",
            ],
          },
        ],
      },
    ],
  },
  line_inspector: {
    repeatable: [
      {
        id: "line-inspector-alarm",
        title: "센서 알람이 반복해서 울린다",
        intro: [
          "빨간 불이 연속으로 들어오는데 실제 문제는 잡히지 않는다.",
          "라인을 멈출지, 감으로 더 돌릴지 골라야 한다.",
        ],
        choices: [
          {
            label: "라인을 잠깐 멈추고 확인한다",
            payMultiplier: 1,
            bonus: 6000,
            result: [
              "시간은 조금 밀렸지만 큰 오류는 막았다.",
            ],
          },
          {
            label: "그대로 돌리면서 지켜본다",
            payMultiplier: 0.9,
            bonus: 3000,
            result: [
              "속도는 살렸지만 마음은 끝까지 불안했다.",
            ],
          },
        ],
      },
      {
        id: "line-inspector-stop",
        title: "협동로봇 팔이 중간에서 멈춘다",
        intro: [
          "팔 하나가 박스 위에서 그대로 굳어 버렸다.",
          "옆 라인까지 영향을 주기 전에 선택해야 한다.",
        ],
        choices: [
          {
            label: "긴급 정지 후 재시작 절차를 밟는다",
            payMultiplier: 1,
            bonus: 5000,
            result: [
              "느리지만 안전하게 라인을 다시 살렸다.",
            ],
          },
          {
            label: "관리자 호출 후 주변 라인만 돌린다",
            payMultiplier: 0.95,
            bonus: 0,
            result: [
              "보수적으로 처리해서 사고는 없었다.",
            ],
          },
        ],
      },
    ],
  },
  closing_checker: {
    repeatable: [
      {
        id: "closing-checker-glass",
        title: "청소로봇이 유리 벽을 놓친다",
        intro: [
          "복도 바닥은 반짝이는데 유리 벽 자국은 그대로 남아 있다.",
          "사진만 찍고 넘길지, 손으로 마저 닦을지 정해야 한다.",
        ],
        choices: [
          {
            label: "직접 마저 닦는다",
            payMultiplier: 1,
            bonus: 4000,
            result: [
              "확실히 마감했고, 체크표도 깔끔하게 끝났다.",
            ],
          },
          {
            label: "누락으로 기록만 남긴다",
            payMultiplier: 1,
            bonus: 0,
            result: [
              "오늘은 시스템대로 처리하고 넘겼다.",
            ],
          },
        ],
      },
      {
        id: "closing-checker-room",
        title: "회의실 세팅이 다시 어질러졌다",
        intro: [
          "저녁 행사팀이 의자를 엉망으로 두고 갔다.",
          "마감 체크만 하려던 루트가 다시 손일이 된다.",
        ],
        choices: [
          {
            label: "의자 배치까지 다시 맞춘다",
            payMultiplier: 1,
            bonus: 5000,
            result: [
              "예정보다 오래 걸렸지만 다음 날 팀은 편할 것이다.",
            ],
          },
          {
            label: "사진 첨부 후 체크만 하고 끝낸다",
            payMultiplier: 0.95,
            bonus: 0,
            result: [
              "정석대로 보고하고 오늘 할 일만 마무리했다.",
            ],
          },
        ],
      },
    ],
  },
};
