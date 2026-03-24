const SERVICE_JOB_EVENTS = {
convenience: {
    critical: {
      id: "convenience-kiosk-shift",
      once: true,
      minVisits: 2,
      title: "점장이 무인 계산대를 들였다",
      intro: [
        "출근하자마자 계산대 한 줄이 통째로 키오스크로 바뀌어 있다.",
        "점장은 오늘부터 사람은 안내만 하고 계산은 기계가 맡는다고 말한다.",
      ],
      choices: [
        {
          label: "키오스크 안내까지 맡는다",
          payMultiplier: 1,
          bonus: 12000,
          result: [
            "손님들한테 기계 쓰는 법까지 알려 주느라 정신이 없었다.",
            "그날 근무는 버텼지만, 다음 공고부터는 예전 편의점 알바가 거의 사라졌다.",
          ],
          changes: {
            remove: ["convenience"],
            add: ["smart_store"],
            news: "편의점 심야 공고가 줄고 무인매장 안내 알바가 새로 올라오기 시작했다.",
          },
        },
        {
          label: "원래 하던 계산만 하겠다고 한다",
          payMultiplier: 0.7,
          bonus: 0,
          result: [
            "기계 앞에서 헤매는 손님이 쌓였고, 점장은 네 시간을 당겨서 너를 퇴근시켰다.",
            "그날 이후 예전 방식의 편의점 교대는 더 이상 거의 잡히지 않았다.",
          ],
          changes: {
            remove: ["convenience"],
            add: ["smart_store"],
            news: "무인 계산대가 들어오면서 편의점 공고가 안내형 공고로 바뀌었다.",
          },
        },
        {
          label: "유니폼 반납하고 그냥 나온다",
          payMultiplier: 0,
          bonus: 0,
          result: [
            "근무 시작도 못 한 채 유니폼만 반납하고 나왔다.",
            "편의점은 끝났고, 구인 앱엔 무인매장 관련 공고만 남았다.",
          ],
          changes: {
            remove: ["convenience"],
            add: ["smart_store"],
            news: "사람이 서던 편의점 자리에 무인매장 안내 공고만 남았다.",
          },
        },
      ],
    },
    repeatable: [
      {
        id: "convenience-rush",
        title: "술 취한 손님이 냉장고 앞에 눕는다",
        intro: [
          "새벽 두 시, 손님 하나가 컵라면을 들고 냉장고 앞에서 자리를 깔았다.",
          "매장은 꼬였고 너는 진열도 계산도 동시에 붙잡고 있다.",
        ],
        choices: [
          {
            label: "끝까지 달래서 정리한다",
            payMultiplier: 1,
            bonus: 8000,
            result: [
              "어찌어찌 손님을 내보내고 진열까지 다시 맞췄다.",
              "점장은 귀찮은 밤을 넘겼다며 오늘 일당을 조금 더 얹어 줬다.",
            ],
          },
          {
            label: "점장에게 바로 전화한다",
            payMultiplier: 1,
            bonus: 0,
            result: [
              "점장이 와서 정리하고 갔다.",
              "돈은 평소와 같지만 적어도 혼자 뒤집어쓰진 않았다.",
            ],
          },
          {
            label: "그냥 셔터 절반 내리고 버틴다",
            payMultiplier: 0.85,
            bonus: 0,
            result: [
              "매출은 조금 날아갔지만, 너는 덜 휘말렸다.",
              "오늘은 조용히 끝내는 쪽을 택했다.",
            ],
          },
        ],
      },
      {
        id: "convenience-boxes",
        title: "택배 박스가 한꺼번에 밀려든다",
        intro: [
          "문 앞에 박스가 쌓이고, 카운터는 비지 않는다.",
          "진열을 미루면 매대가 비고, 택배를 미루면 줄이 길어진다.",
        ],
        choices: [
          {
            label: "택배부터 쭉 받아 낸다",
            payMultiplier: 1,
            bonus: 5000,
            result: [
              "줄이 길어졌지만 박스 산은 금방 정리됐다.",
              "택배 수수료가 조금 붙어서 생각보다 손에 남았다.",
            ],
          },
          {
            label: "카운터 중심으로 돌린다",
            payMultiplier: 1,
            bonus: 0,
            result: [
              "매장은 덜 막혔지만 박스는 끝까지 남았다.",
              "무난하게 끝난 하루였다.",
            ],
          },
        ],
      },
    ],
  },
  delivery: {
    critical: {
      id: "delivery-robot-zone",
      once: true,
      minVisits: 2,
      title: "앱이 로봇 배달 시범구역을 연다",
      intro: [
        "배달 앱 공지가 뜬다. 중심 상권은 로봇과 자동 배차가 먼저 들어온다고 한다.",
        "오늘부터 라이더는 남는 구역만 받거나 관제 쪽으로 넘어가야 한다.",
      ],
      choices: [
        {
          label: "남는 콜을 끝까지 탄다",
          payMultiplier: 0.8,
          bonus: 10000,
          result: [
            "콜은 줄었지만 남는 구역을 억지로 주워 담아 일당은 챙겼다.",
            "대신 다음부터는 배달 대신 배차 모니터 공고가 더 자주 뜬다.",
          ],
          changes: {
            remove: ["delivery"],
            add: ["dispatch_monitor"],
            news: "중심 상권 배달 공고가 빠르게 줄고 배차 관제 공고가 늘었다.",
          },
        },
        {
          label: "앱 관제 교육 링크를 누른다",
          payMultiplier: 1,
          bonus: 6000,
          result: [
            "오늘은 교육 겸 근무로 넘어가서 크게 뛰진 않았지만 손에 남는 건 챙겼다.",
            "이제부터는 관제 쪽 단기 공고가 뜨기 시작한다.",
          ],
          changes: {
            remove: ["delivery"],
            add: ["dispatch_monitor"],
            news: "배달 콜 자리에 관제형 단기 근무가 새로 등장했다.",
          },
        },
        {
          label: "오늘은 그냥 접는다",
          payMultiplier: 0,
          bonus: 0,
          result: [
            "시범구역 공지를 보자마자 앱을 껐다.",
            "배달 일은 끊겼고, 다음부터는 다른 종류의 공고를 찾아야 한다.",
          ],
          changes: {
            remove: ["delivery"],
            add: ["dispatch_monitor"],
            news: "배달 공고가 빠지고 관제 공고가 메인 화면으로 올라왔다.",
          },
        },
      ],
    },
    repeatable: [
      {
        id: "delivery-rain",
        title: "비가 갑자기 퍼붓는다",
        intro: [
          "맑다가 갑자기 비가 내려서 앱 지도가 다 파랗게 물든다.",
          "콜 단가는 뛰었지만 길은 느려졌다.",
        ],
        choices: [
          {
            label: "비 맞고 끝까지 탄다",
            payMultiplier: 1,
            bonus: 15000,
            result: [
              "몸은 축축하지만 단가가 잘 붙었다.",
              "오늘은 비 덕분에 평소보다 꽤 남겼다.",
            ],
          },
          {
            label: "가까운 콜만 묶어서 탄다",
            payMultiplier: 1,
            bonus: 4000,
            result: [
              "큰돈은 아니지만 덜 위험하게 끝냈다.",
              "빗속에서 적당히 챙긴 하루였다.",
            ],
          },
          {
            label: "빗발 세질 때 앱을 끈다",
            payMultiplier: 0.6,
            bonus: 0,
            result: [
              "벌이는 줄었지만 몸은 덜 갈렸다.",
              "오늘은 적당한 선에서 퇴근했다.",
            ],
          },
        ],
      },
      {
        id: "delivery-misroute",
        title: "주소가 반쯤 잘못 찍혔다",
        intro: [
          "앱 주소와 주문 메모가 서로 달라서 골목을 두 바퀴나 돌았다.",
          "고객은 계속 전화를 하고, 시간은 빠르게 사라진다.",
        ],
        choices: [
          {
            label: "직접 전화해서 끝까지 찾아간다",
            payMultiplier: 1,
            bonus: 6000,
            result: [
              "헤맸지만 결국 전달했고, 고객이 미안하다며 팁을 조금 더 넣었다.",
            ],
          },
          {
            label: "앱 고객센터에 넘긴다",
            payMultiplier: 0.85,
            bonus: 0,
            result: [
              "처리는 느렸지만 책임은 앱이 떠안았다.",
              "돈은 조금 깎였지만 덜 휘말렸다.",
            ],
          },
        ],
      },
    ],
  },
  tutoring: {
    critical: {
      id: "tutoring-ai-switch",
      once: true,
      minVisits: 2,
      title: "학생이 AI 학습앱으로 갈아타겠다고 한다",
      intro: [
        "수업 시작 전에 학부모가 새 앱을 보여 준다.",
        "문제풀이와 채점은 AI가 다 해 준다면서, 이제 사람은 다른 역할이 필요하다고 한다.",
      ],
      choices: [
        {
          label: "설명과 피드백 중심으로 다시 제안한다",
          payMultiplier: 1,
          bonus: 14000,
          result: [
            "숙제 채점은 앱이 하고, 너는 설명과 상담만 맡는 쪽으로 자리를 바꿨다.",
            "예전 과외 공고 대신 학습 코치 공고가 새로 올라오기 시작한다.",
          ],
          changes: {
            remove: ["tutoring"],
            add: ["study_coach"],
            news: "방문 과외 공고가 줄고 AI 보조형 학습 코치 공고가 생겼다.",
          },
        },
        {
          label: "가격을 낮춰서 그대로 붙잡아 본다",
          payMultiplier: 0.75,
          bonus: 0,
          result: [
            "오늘 수업은 했지만, 다음 주부터는 앱 중심으로 바뀐다고 한다.",
            "과외 대신 코칭형 공고만 남기고 시장이 이동했다.",
          ],
          changes: {
            remove: ["tutoring"],
            add: ["study_coach"],
            news: "학생들이 AI 앱으로 옮겨 가며 과외 공고가 코칭형 공고로 바뀌었다.",
          },
        },
        {
          label: "그 자리에서 오늘까지만 하겠다고 한다",
          payMultiplier: 0.5,
          bonus: 0,
          result: [
            "오늘은 정리만 하고 나왔다.",
            "이제 전통적인 방문 과외 공고는 거의 보이지 않는다.",
          ],
          changes: {
            remove: ["tutoring"],
            add: ["study_coach"],
            news: "과외 공고가 빠지고 AI 학습 코치 공고가 메인으로 올라왔다.",
          },
        },
      ],
    },
    repeatable: [
      {
        id: "tutoring-parent",
        title: "학부모가 수업 끝나고 상담을 더 원한다",
        intro: [
          "원래는 한 시간만 보기로 했는데, 학부모가 성적표까지 꺼낸다.",
          "설명해 줄수록 시간은 늘어난다.",
        ],
        choices: [
          {
            label: "추가 상담까지 해 준다",
            payMultiplier: 1,
            bonus: 10000,
            result: [
              "오늘은 수업보다 상담이 길었지만 신뢰는 확실히 샀다.",
            ],
          },
          {
            label: "다음 시간에 이어서 하자고 한다",
            payMultiplier: 1,
            bonus: 0,
            result: [
              "선을 잘 그어 두고 원래 계획한 수업만 마쳤다.",
            ],
          },
        ],
      },
      {
        id: "tutoring-blank",
        title: "학생이 완전히 멍해져 있다",
        intro: [
          "문제는 쉬운데 학생 눈이 이미 멀리 가 있다.",
          "밀어붙이느냐, 잠깐 쉬게 하느냐를 골라야 한다.",
        ],
        choices: [
          {
            label: "쉬운 문제로 다시 감을 잡게 한다",
            payMultiplier: 1,
            bonus: 4000,
            result: [
              "속도는 느렸지만 수업은 다시 굴러갔다.",
            ],
          },
          {
            label: "오늘 분량을 끝까지 밀어붙인다",
            payMultiplier: 0.9,
            bonus: 7000,
            result: [
              "진도는 나갔지만 분위기는 썩 좋지 않았다.",
            ],
          },
        ],
      },
    ],
  },
  "mcd-counter": {
    critical: {
      id: "cafe-serving-bot",
      once: true,
      minVisits: 2,
      title: "매장에 서빙봇이 들어온다",
      intro: [
        "오픈하자마자 은색 서빙봇이 테이블 사이를 돌기 시작한다.",
        "사장은 사람은 주문보다 로봇 동선과 손님 안내를 맡으라고 한다.",
      ],
      choices: [
        {
          label: "서빙봇 동선까지 같이 본다",
          payMultiplier: 1,
          bonus: 9000,
          result: [
            "주문은 줄었지만 로봇이 멈출 때마다 네가 다시 살려 냈다.",
            "이제 카페 공고는 서빙보다 봇 케어 쪽으로 바뀐다.",
          ],
          changes: {
            remove: ["mcd-counter", "mcd-kitchen"],
            add: ["robot_floor"],
            news: "카페 오픈 공고가 줄고 서빙봇 케어 공고가 새로 떴다.",
          },
        },
        {
          label: "기계는 기계고 나는 홀만 본다",
          payMultiplier: 0.8,
          bonus: 0,
          result: [
            "로봇이 막힐 때마다 흐름이 깨졌고, 결국 근무 시간 일부가 잘렸다.",
            "다음부터는 사람이 서빙하던 공고 대신 봇 관리 공고가 보인다.",
          ],
          changes: {
            remove: ["mcd-counter", "mcd-kitchen"],
            add: ["robot_floor"],
            news: "서빙봇 도입으로 카페 공고가 관리형 공고로 교체됐다.",
          },
        },
        {
          label: "시끄럽다고 생각하고 그만둔다",
          payMultiplier: 0.3,
          bonus: 0,
          result: [
            "정리하다 말고 앞치마를 내려놓고 나왔다.",
            "카페는 끝났고, 앱엔 서빙봇 케어 공고만 남는다.",
          ],
          changes: {
            remove: ["mcd-counter", "mcd-kitchen"],
            add: ["robot_floor"],
            news: "사람 서빙 공고가 사라지고 서빙봇 보조 공고가 메인에 올라왔다.",
          },
        },
      ],
    },
    repeatable: [
      {
        id: "cafe-rush",
        title: "오픈 직후 주문이 한꺼번에 몰린다",
        intro: [
          "테이크아웃 줄과 홀 주문이 동시에 길어진다.",
          "머신은 느리고 손님은 빨라졌다.",
        ],
        choices: [
          {
            label: "테이크아웃 줄부터 소화한다",
            payMultiplier: 1,
            bonus: 7000,
            result: [
              "줄은 빨리 빠졌고, 사장은 속도 좋았다고 했다.",
            ],
          },
          {
            label: "홀과 포장을 반반 나눈다",
            payMultiplier: 1,
            bonus: 0,
            result: [
              "전부 무난하게 처리했고 큰 사고 없이 끝냈다.",
            ],
          },
        ],
      },
      {
        id: "cafe-spill",
        title: "손님이 음료를 엎질렀다",
        intro: [
          "창가 자리에서 컵이 넘어져 바닥이 전부 젖었다.",
          "정리도 해야 하고 새 음료도 다시 나가야 한다.",
        ],
        choices: [
          {
            label: "정리부터 하고 음료를 다시 만든다",
            payMultiplier: 1,
            bonus: 4000,
            result: [
              "동선은 꼬였지만 손님 컴플레인은 막았다.",
            ],
          },
          {
            label: "동료에게 닦아 달라고 하고 주문을 먼저 뺀다",
            payMultiplier: 0.9,
            bonus: 0,
            result: [
              "주문은 덜 밀렸지만 눈총은 조금 받았다.",
            ],
          },
        ],
      },
    ],
  },
};
