const LABOR_JOB_EVENTS = {
warehouse: {
    critical: {
      id: "warehouse-automation-line",
      once: true,
      minVisits: 2,
      title: "분류 라인이 자동화로 바뀐다",
      intro: [
        "출근해 보니 기존 분류대 절반이 센서 라인으로 교체됐다.",
        "사람은 물건을 직접 들기보다 라인을 멈추고 다시 살리는 역할만 남았다.",
      ],
      choices: [
        {
          label: "센서 알람 보는 쪽으로 옮긴다",
          payMultiplier: 1,
          bonus: 10000,
          result: [
            "예전처럼 계속 들진 않았지만, 알람 뜰 때마다 뛰어다녔다.",
            "이제부터는 상하차보다 자동화 라인 점검 공고가 보인다.",
          ],
          changes: {
            remove: ["warehouse"],
            add: ["line_inspector"],
            news: "새벽 물류 공고가 줄고 자동화 라인 점검 공고가 등장했다.",
          },
        },
        {
          label: "끝까지 박스 드는 쪽에 남는다",
          payMultiplier: 0.75,
          bonus: 0,
          result: [
            "남은 손작업 구역만 하다 퇴근했고, 다음번부터는 같은 자리가 거의 없다.",
            "현장은 자동화 점검 인력 위주로 바뀌었다.",
          ],
          changes: {
            remove: ["warehouse"],
            add: ["line_inspector"],
            news: "상하차 공고가 빠르게 줄고 자동화 보조 공고가 자리 잡기 시작했다.",
          },
        },
        {
          label: "오늘은 그냥 나간다",
          payMultiplier: 0,
          bonus: 0,
          result: [
            "라인 소음을 듣자마자 출근 체크도 안 하고 돌아섰다.",
            "물류는 끝났고, 남은 건 점검형 공고뿐이다.",
          ],
          changes: {
            remove: ["warehouse"],
            add: ["line_inspector"],
            news: "사람이 들던 분류 공고가 사라지고 자동화 라인 점검 공고만 남았다.",
          },
        },
      ],
    },
    repeatable: [
      {
        id: "warehouse-scanner",
        title: "스캔건이 자꾸 멈춘다",
        intro: [
          "바코드를 읽다가 스캔건이 멎어서 라인이 막힌다.",
          "그냥 손으로 넘길지, 관리자 호출을 기다릴지 정해야 한다.",
        ],
        choices: [
          {
            label: "손으로 먼저 분류를 이어 간다",
            payMultiplier: 1,
            bonus: 7000,
            result: [
              "팔은 더 무거워졌지만 라인은 살아났다.",
            ],
          },
          {
            label: "관리자 호출 후 대기한다",
            payMultiplier: 0.85,
            bonus: 0,
            result: [
              "몸은 덜 썼지만 시간도 같이 빠졌다.",
            ],
          },
        ],
      },
      {
        id: "warehouse-overflow",
        title: "한 구역 물량이 갑자기 터진다",
        intro: [
          "같은 라인에 박스가 한꺼번에 몰려와서 벨트가 꽉 찼다.",
          "응급으로 다른 구역을 비워 와야 한다.",
        ],
        choices: [
          {
            label: "터진 구역부터 몰아서 정리한다",
            payMultiplier: 1,
            bonus: 5000,
            result: [
              "끝날 즈음엔 숨이 찼지만 라인은 다시 흐르기 시작했다.",
            ],
          },
          {
            label: "전체 속도를 낮춰 달라고 요청한다",
            payMultiplier: 0.95,
            bonus: 0,
            result: [
              "속도는 죽었지만 큰 사고 없이 끝났다.",
            ],
          },
        ],
      },
    ],
  },
  cleaning: {
    critical: {
      id: "cleaning-robot-rollout",
      once: true,
      minVisits: 2,
      title: "청소로봇이 야간 루트를 돈다",
      intro: [
        "복도 끝에서 청소로봇 두 대가 동시에 출발한다.",
        "업체는 사람 청소보다 로봇 루트 확인과 마감 체크에 힘을 주겠다고 한다.",
      ],
      choices: [
        {
          label: "로봇이 놓친 곳만 확인한다",
          payMultiplier: 1,
          bonus: 8000,
          result: [
            "쓸고 닦는 시간은 줄었지만 체크리스트는 더 길어졌다.",
            "다음부터는 청소 알바 대신 마감 점검 공고가 뜬다.",
          ],
          changes: {
            remove: ["cleaning"],
            add: ["closing_checker"],
            news: "오피스 청소 공고가 줄고 마감 점검 공고가 새로 보이기 시작했다.",
          },
        },
        {
          label: "예전 방식대로 직접 다 닦는다",
          payMultiplier: 0.75,
          bonus: 0,
          result: [
            "일은 끝냈지만 업체는 다음부터 로봇 루트 위주로 돌리겠다고 못 박았다.",
            "사람 청소 공고는 점검형 공고로 바뀌었다.",
          ],
          changes: {
            remove: ["cleaning"],
            add: ["closing_checker"],
            news: "청소로봇 도입으로 사람 청소 공고가 점검형 공고로 바뀌었다.",
          },
        },
        {
          label: "오늘까지만 하고 빠진다",
          payMultiplier: 0.4,
          bonus: 0,
          result: [
            "체크리스트만 대충 넘기고 조용히 퇴근했다.",
            "이제 남은 건 로봇 마감 점검 공고다.",
          ],
          changes: {
            remove: ["cleaning"],
            add: ["closing_checker"],
            news: "청소 인력 공고가 사라지고 로봇 마감 점검 공고가 대신 올라왔다.",
          },
        },
      ],
    },
    repeatable: [
      {
        id: "cleaning-meeting",
        title: "회의실 사용이 늦게 끝난다",
        intro: [
          "퇴근한 줄 알았던 층에서 회의가 길게 이어진다.",
          "네 루트가 통째로 밀리기 시작한다.",
        ],
        choices: [
          {
            label: "다른 층부터 먼저 끝낸다",
            payMultiplier: 1,
            bonus: 4000,
            result: [
              "루트가 꼬였지만 결국 마감은 맞췄다.",
            ],
          },
          {
            label: "회의실 앞에서 그냥 대기한다",
            payMultiplier: 0.85,
            bonus: 0,
            result: [
              "몸은 덜 움직였지만 일당도 살짝 줄었다.",
            ],
          },
        ],
      },
      {
        id: "cleaning-stain",
        title: "카펫 얼룩이 안 지워진다",
        intro: [
          "복도 끝 카펫에 진한 얼룩이 남아 있다.",
          "시간을 더 쓰느냐, 사진만 찍고 넘기느냐를 골라야 한다.",
        ],
        choices: [
          {
            label: "끝까지 지워 본다",
            payMultiplier: 1,
            bonus: 6000,
            result: [
              "시간은 더 들었지만 결과는 괜찮았다.",
            ],
          },
          {
            label: "사진 찍고 업체에 보고만 한다",
            payMultiplier: 1,
            bonus: 0,
            result: [
              "무난하게 마감했고, 문제는 다음 팀으로 넘겼다.",
            ],
          },
        ],
      },
    ],
  },
};
