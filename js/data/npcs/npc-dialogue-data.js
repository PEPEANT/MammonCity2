const NPC_DIALOGUES = {
  "high-school-girl": {
    startNodeId: "intro",
    startNodeSelector(targetState) {
      const relation = typeof getNpcRelation === "function"
        ? getNpcRelation("high-school-girl", targetState)
        : null;
      if ((relation?.meetings || 0) >= 2) {
        return "late-cram";
      }
      if ((relation?.meetings || 0) >= 1) {
        return "snack-break";
      }
      return "intro";
    },
    nodes: {
      intro: {
        title: "교복 치맛자락이 바람에 조금 흔들린다",
        lines: [
          "여고생은 휴대폰 화면을 살짝 가린 채 너를 한 번 올려다본다.",
          "\"무슨 일 있어요?\" 하고 먼저 묻기엔 서로 너무 낯설다.",
        ],
        choices: [
          { label: "무슨 일 있냐고 묻는다", next: "concern" },
          { label: "버스 시간을 물어본다", next: "bus-stop" },
          { label: "그냥 지나친다", next: "leave" },
        ],
      },
      concern: {
        lines: [
          "\"아뇨, 그냥 사람 기다리는 중이에요.\"",
          "짧게 답한 뒤 다시 골목 입구 쪽을 힐끗 본다.",
        ],
        choices: [
          {
            label: "고개만 끄덕이고 물러난다",
            end: true,
            effects: {
              headline: {
                badge: "스친 대화",
                text: "교복 차림의 여고생은 다시 누군가를 기다리는 표정으로 돌아간다.",
              },
              memory: {
                type: "npc",
                title: "골목 여고생과 잠깐 말을 섞었다",
                body: "누군가를 기다린다는 말만 남긴 채 여고생은 다시 골목 끝을 바라봤다.",
                tags: ["NPC", "골목", "여고생"],
              },
            },
          },
        ],
      },
      "bus-stop": {
        lines: [
          "\"버스면 저쪽 정류장 유리판 보는 게 제일 빨라요.\"",
          "여고생은 손가락으로 버스 정류장 방향을 짧게 가리킨다.",
        ],
        choices: [
          {
            label: "정류장 쪽으로 시선을 돌린다",
            end: true,
            effects: {
              headline: {
                badge: "길 안내",
                text: "버스 노선도를 보면 오늘 동선이 좀 더 또렷해질 것 같다.",
              },
              memory: {
                type: "info",
                title: "버스 정류장 힌트를 들었다",
                body: "정류장 유리판의 노선도가 가장 빠르다는 말을 들었다.",
                tags: ["정보", "버스", "동선"],
              },
            },
          },
        ],
      },
      leave: {
        lines: [
          "괜히 더 말을 걸지 않고 발걸음을 늦춘다.",
          "여고생도 더는 시선을 주지 않는다.",
        ],
        choices: [
          {
            label: "골목을 다시 둘러본다",
            end: true,
            effects: {
              headline: {
                badge: "낯선 거리",
                text: "가볍게 스친 시선 하나만 남기고 골목은 다시 조용해진다.",
              },
              memory: {
                type: "mood",
                title: "낯선 시선만 남겼다",
                body: "더 말을 걸지 않고 지나쳤다. 골목은 다시 아무 일 없던 얼굴로 돌아갔다.",
                tags: ["골목", "스침"],
              },
            },
          },
        ],
      },
      "snack-break": {
        title: "교복 주머니에서 작은 과자 봉지가 바스락거린다",
        lines: [
          "\"학원 가기 전에 잠깐 당 떨어져서요.\"",
          "학생은 버스 시간표보다 손에 쥔 문제집을 더 자주 내려다본다.",
        ],
        choices: [
          { label: "오늘 공부 많이 하나 보다 하고 묻는다", next: "concern" },
          {
            label: "힘내라고 하고 지나간다",
            end: true,
            effects: {
              headline: {
                badge: "짧은 응원",
                text: "잠깐 스친 말이었는데도 학생의 표정이 조금 풀렸다.",
              },
              memory: {
                type: "npc",
                title: "골목 학생에게 짧게 응원했다",
                body: "버스를 기다리던 학생이 과자 봉지를 쥔 채 고개를 끄덕였다.",
                tags: ["NPC", "응원", "학생"],
              },
            },
          },
        ],
      },
      "late-cram": {
        title: "문제집 가장자리에 형광펜 자국이 빽빽하게 남아 있다",
        lines: [
          "\"오늘 모의고사 다시 풀어보는 날이라서요.\"",
          "학생은 버스가 늦는 것보다 남은 공부 시간이 줄어드는 걸 더 신경 쓰는 눈치다.",
        ],
        choices: [
          {
            label: "집중 잘 되길 바란다고 말한다",
            end: true,
            effects: {
              headline: {
                badge: "시험 준비",
                text: "누군가의 하루도 이렇게 다급하게 굴러간다는 걸 다시 느꼈다.",
              },
              memory: {
                type: "mood",
                title: "모의고사 앞둔 학생을 만났다",
                body: "버스보다 공부 시간을 더 신경 쓰는 얼굴이 오래 남았다.",
                tags: ["학생", "시험", "골목"],
              },
            },
          },
          { label: "버스 쪽 길을 다시 알려준다", next: "bus-stop" },
        ],
      },
      "rush-hour": {
        title: "넥타이를 느슨하게 푼 채 발걸음만 빨라져 있다",
        lines: [
          "\"퇴근 시간 놓치면 집까지 더 오래 걸리거든요.\"",
          "그는 폰 화면과 버스 방향을 번갈아 보며 숨을 한 번 고른다.",
        ],
        choices: [
          { label: "퇴근길 자주 막히냐고 묻는다", next: "jobs" },
          {
            label: "오늘도 고생 많았겠다고 말한다",
            end: true,
            effects: {
              headline: {
                badge: "퇴근길 한숨",
                text: "남의 하루 끝자락을 보고 있자니 묘하게 현실감이 밀려왔다.",
              },
              memory: {
                type: "npc",
                title: "퇴근길 직장인과 짧게 말을 섞었다",
                body: "급한 발걸음 사이로도 피곤한 표정은 쉽게 감춰지지 않았다.",
                tags: ["직장인", "퇴근", "골목"],
              },
            },
          },
        ],
      },
      "coffee-run": {
        title: "손에 든 종이컵이 거의 비어 있는데도 계속 들고 있다",
        lines: [
          "\"오늘은 커피 두 잔째인데도 정신이 안 차려지네요.\"",
          "그는 웃으면서도 어깨를 한 번 크게 돌려 뭉친 기색을 푼다.",
        ],
        choices: [
          {
            label: "무리하지 말라고 하고 보내준다",
            end: true,
            effects: {
              headline: {
                badge: "피곤한 웃음",
                text: "지친 사람의 농담은 가볍게 흘려듣기 어렵다.",
              },
              memory: {
                type: "mood",
                title: "커피로 버티는 직장인을 봤다",
                body: "웃는 얼굴 뒤로 피로가 눌어붙은 느낌이 오래 남았다.",
                tags: ["직장인", "피로", "골목"],
              },
            },
          },
          { label: "괜찮은 일자리 쪽 이야기를 다시 묻는다", next: "jobs" },
        ],
      },
      "market-rumor": {
        title: "장바구니 끈을 고쳐 쥔 채 동네 이야기를 먼저 꺼낸다",
        lines: [
          "\"사거리 쪽은 오늘도 사람 많더라. 해 질 무렵 되면 더 붐비지.\"",
          "아주머니는 별일 아닌 말처럼 꺼내지만 동네 흐름을 꽤 정확히 짚는다.",
        ],
        choices: [
          {
            label: "장사 잘되는 시간대를 기억해둔다",
            end: true,
            effects: {
              headline: {
                badge: "동네 흐름",
                text: "사람이 몰리는 시간대를 아는 것만으로도 길이 조금 선명해졌다.",
              },
              memory: {
                type: "info",
                title: "사거리 붐비는 시간대를 들었다",
                body: "동네 아주머니의 말 한마디가 의외로 정확한 생활 정보가 됐다.",
                tags: ["동네", "사거리", "정보"],
              },
            },
          },
          { label: "그 김에 일자리 이야기도 묻는다", next: "jobs" },
        ],
      },
      "weather-check": {
        title: "비 올 것 같은 하늘을 올려다보며 우산 손잡이를 두드린다",
        lines: [
          "\"오늘 저녁엔 바람도 차고 금방 어두워질 거다.\"",
          "\"멀리 나갈 거면 일찍 움직이는 게 낫다.\"",
        ],
        choices: [
          {
            label: "늦게까지 밖에 있지 말아야겠다고 생각한다",
            end: true,
            effects: {
              headline: {
                badge: "생활 감각",
                text: "거창한 조언은 아니어도 하루 동선을 정리하는 데 도움이 됐다.",
              },
              memory: {
                type: "mood",
                title: "동네 아주머니가 날씨를 걱정해줬다",
                body: "사소한 말인데도 이상하게 하루를 챙겨받은 느낌이 남았다.",
                tags: ["동네", "날씨", "조언"],
              },
            },
          },
          { label: "버스 정류장 쪽 분위기를 다시 묻는다", next: "rumor" },
        ],
      },
      "discount-rumor": {
        title: "계산대 옆 행사 스티커를 정리하다가 먼저 말을 건넨다",
        lines: [
          "\"오늘은 도시락이 빨리 빠져서 저녁 전에 한 번 더 채워야 할 것 같아요.\"",
          "점원은 바코드 리더기보다 진열대 쪽을 더 자주 힐끗거린다.",
        ],
        choices: [
          {
            label: "사람 몰리는 시간대가 언제냐고 묻는다",
            end: true,
            effects: {
              headline: {
                badge: "편의점 팁",
                text: "저녁 직전이 제일 분주하다는 말이 의외로 또렷하게 남았다.",
              },
              memory: {
                type: "info",
                title: "편의점 붐비는 시간대를 들었다",
                body: "점원의 짧은 말이 생활 동선을 읽는 힌트처럼 느껴졌다.",
                tags: ["편의점", "정보", "NPC"],
              },
              npcRelation: {
                affinityDelta: 1,
              },
            },
          },
          { label: "가볍게 웃고 장을 본다", next: "small-talk" },
        ],
      },
      "restock-chat": {
        title: "삼각김밥 상자를 들고도 시선은 금방 계산대로 돌아온다",
        lines: [
          "\"요즘엔 물류차 늦게 들어오는 날이 많아서 정리할 틈이 잘 안 나네요.\"",
          "익숙하게 듣는 말투지만 전보다 한결 편한 분위기다.",
        ],
        choices: [
          {
            label: "오늘도 바쁘겠다고 말해준다",
            end: true,
            effects: {
              headline: {
                badge: "익숙한 인사",
                text: "몇 번 마주친 사이라는 건 말투에서 먼저 드러난다.",
              },
              memory: {
                type: "npc",
                title: "편의점 점원과 조금 편하게 대화했다",
                body: "예전보다 한결 자연스럽게 안부를 주고받게 됐다.",
                tags: ["편의점", "대화", "NPC"],
              },
              npcRelation: {
                affinityDelta: 1,
              },
            },
          },
          { label: "진열대 쪽 일손이 부족한지 묻는다", next: "small-talk" },
        ],
      },
    },
  },
  "alley-office-worker": {
    startNodeId: "intro",
    startNodeSelector(targetState) {
      const relation = typeof getNpcRelation === "function"
        ? getNpcRelation("alley-office-worker", targetState)
        : null;
      if ((relation?.meetings || 0) >= 2) {
        return "coffee-run";
      }
      if ((relation?.meetings || 0) >= 1) {
        return "rush-hour";
      }
      return "intro";
    },
    nodes: {
      intro: {
        title: "양복 차림의 남자가 통화를 마치고 한숨을 삼킨다",
        lines: [
          "퇴근한 얼굴인데도 눈빛은 아직 회사에 붙잡혀 있는 것 같다.",
          "\"왜요? 저 찾으셨어요?\" 하고 피곤한 목소리로 묻는다.",
        ],
        choices: [
          { label: "오늘 일할 만한 곳이 있냐고 묻는다", next: "jobs" },
          { label: "힘들어 보인다고 말한다", next: "tired" },
          { label: "괜히 붙잡지 않고 물러난다", next: "leave" },
        ],
      },
      jobs: {
        lines: [
          "\"역 앞 가면 전단 붙은 데 많아요. 사거리보다 훨씬 빠르죠.\"",
          "\"급하면 오늘은 역 앞부터 보는 게 나을걸요.\"",
        ],
        choices: [
          {
            label: "정보를 기억해 둔다",
            end: true,
            effects: {
              headline: {
                badge: "일자리 힌트",
                text: "역 앞 쪽이 오늘 공고를 찾기엔 더 빠를지도 모른다.",
              },
              memory: {
                type: "info",
                title: "직장인에게서 일자리 힌트를 들었다",
                body: "사거리보다 역 앞 전단이 더 빠르다는 말을 들었다.",
                tags: ["정보", "일자리", "역 앞"],
              },
            },
          },
        ],
      },
      tired: {
        lines: [
          "\"다들 그렇죠 뭐. 안 힘든 사람이 어딨어요.\"",
          "그는 넥타이를 조금 풀어내리고 억지로 웃는다.",
        ],
        choices: [
          {
            label: "괜히 미안해져서 물러난다",
            end: true,
            effects: {
              headline: {
                badge: "퇴근길",
                text: "남자의 피곤한 표정이 골목 공기를 더 무겁게 만든다.",
              },
              memory: {
                type: "mood",
                title: "퇴근길 피로를 마주쳤다",
                body: "안 힘든 사람이 어딨냐는 말이 이상하게 오래 남았다.",
                tags: ["직장인", "피로", "골목"],
              },
            },
          },
        ],
      },
      leave: {
        lines: [
          "남자는 다시 휴대폰을 귀에 대고 사거리 쪽으로 걸어간다.",
        ],
        choices: [
          {
            label: "다시 골목을 둘러본다",
            end: true,
          },
        ],
      },
    },
  },
  "alley-aunt": {
    startNodeId: "intro",
    startNodeSelector(targetState) {
      const relation = typeof getNpcRelation === "function"
        ? getNpcRelation("alley-aunt", targetState)
        : null;
      if ((relation?.meetings || 0) >= 2) {
        return "weather-check";
      }
      if ((relation?.meetings || 0) >= 1) {
        return "market-rumor";
      }
      return "intro";
    },
    nodes: {
      intro: {
        title: "장바구니 비닐이 손등에 스치는 소리가 난다",
        lines: [
          "아주머니는 통화를 끝내고 너를 보자 익숙한 사람 보듯 눈을 가늘게 뜬다.",
          "\"또 나왔니? 오늘도 밖에서 시간 보낼 거야?\"",
        ],
        choices: [
          { label: "그냥 인사만 한다", next: "greet" },
          { label: "동네 소문을 묻는다", next: "rumor" },
          { label: "일자리 이야기를 묻는다", next: "jobs" },
        ],
      },
      greet: {
        lines: [
          "\"그래, 밥은 챙겨 먹고 돌아다녀.\"",
          "짧은 걱정 한마디가 생각보다 오래 귀에 남는다.",
        ],
        choices: [
          {
            label: "작게 웃고 지나간다",
            end: true,
            effects: {
              headline: {
                badge: "동네 온기",
                text: "별말 아닌데도 이상하게 마음이 조금 느슨해진다.",
              },
              memory: {
                type: "npc",
                title: "골목 아주머니가 밥은 챙겨 먹으라 했다",
                body: "짧은 걱정 한마디였는데도 이상하게 마음이 풀렸다.",
                tags: ["아주머니", "동네", "온기"],
              },
            },
          },
        ],
      },
      rumor: {
        lines: [
          "\"사거리 쪽이 오늘도 시끄럽더라. 전단 돌리는 사람도 많고.\"",
          "\"버스 정류장 쪽은 아까부터 학생들이랑 직장인들이 계속 섞여 다니고.\"",
        ],
        choices: [
          {
            label: "고개를 끄덕이며 새겨둔다",
            end: true,
            effects: {
              headline: {
                badge: "동네 소문",
                text: "사거리와 정류장 쪽이 오늘 더 붐빈다는 말을 귀에 담아 둔다.",
              },
              memory: {
                type: "info",
                title: "사거리와 정류장 소문을 들었다",
                body: "오늘은 사거리와 버스 정류장 쪽이 더 시끄럽고 붐빈다고 했다.",
                tags: ["소문", "사거리", "정류장"],
              },
            },
          },
        ],
      },
      jobs: {
        lines: [
          "\"당장 돈 급하면 역 앞 전단부터 보는 게 제일 빨라.\"",
          "\"괜히 중심가만 기웃거리면 돈도 시간도 같이 새 나가.\"",
        ],
        choices: [
          {
            label: "현실적인 조언을 기억한다",
            end: true,
            effects: {
              headline: {
                badge: "생활 조언",
                text: "큰돈 냄새보다 당장 손에 잡히는 공고부터 챙기라는 말이 남는다.",
              },
              memory: {
                type: "info",
                title: "현실적인 생활 조언을 들었다",
                body: "중심가보다 역 앞 전단부터 챙기라는 조언이 기억에 남았다.",
                tags: ["조언", "생활", "역 앞"],
              },
            },
          },
        ],
      },
    },
  },
  "convenience-cashier": {
    startNodeId: "default-greeting",
    startNodeSelector(targetState) {
      const relation = typeof getNpcRelation === "function"
        ? getNpcRelation("convenience-cashier", targetState)
        : null;
      if ((relation?.meetings || 0) >= 2) {
        return "restock-chat";
      }
      if ((relation?.meetings || 0) >= 1) {
        return "discount-rumor";
      }
      return "default-greeting";
    },
    nodes: {
      "default-greeting": {
        title: "편의점 계산대에 형광등 불빛이 반듯하게 내려앉아 있다",
        lines: [
          "점원이 바코드 스캐너를 내려놓고 짧게 눈을 맞춘다.",
          "\"필요하신 거 있으시면 천천히 보세요.\"",
        ],
        choices: [
          {
            label: "인사만 하고 물건을 더 둘러본다",
            end: true,
          },
          {
            label: "계산대 앞에서 한마디 더 건넨다",
            next: "small-talk",
          },
        ],
      },
      "small-talk": {
        lines: [
          "\"오늘은 좀 조용하네요.\"",
          "점원은 계산대 화면을 흘끗 보다가 다시 웃으며 고개를 든다.",
        ],
        choices: [
          {
            label: "고개를 끄덕이고 물러난다",
            end: true,
            effects: {
              npcRelation: {
                affinityDelta: 1,
              },
            },
          },
        ],
      },
      "ask-number-intro": {
        title: "점원이 바코드 리더기를 내려놓더니 시선을 한 번 더 붙잡는다",
        lines: [
          "\"저 혹시 번호 있어요?\"",
          "예상 못한 질문이 계산대 위로 너무 자연스럽게 흘러나온다.",
        ],
        choices: [
          {
            label: "당황한 채 웃으며 넘긴다",
            end: true,
            effects: {
              socialContact: {
                npcId: "convenience-cashier",
                source: "dialogue",
                headline: {
                  badge: "번호 교환",
                  text: "편의점 알바녀가 먼저 번호를 남겼다.",
                },
                memory: {
                  title: "편의점 알바녀의 번호를 받았다",
                  body: "성형 뒤 처음 들른 편의점에서 알바녀가 먼저 번호를 물어봤다.",
                },
              },
              npcRelation: {
                affinityDelta: 1,
                attractionDelta: 2,
                flags: {
                  askedNumber: true,
                },
              },
              memory: {
                type: "npc",
                title: "편의점 점원이 번호를 물어봤다",
                body: "성형 뒤 처음 들른 편의점에서 점원이 뜻밖에도 번호를 물어봤다.",
                tags: ["편의점", "외형 변화", "NPC"],
              },
            },
          },
          {
            label: "짧게 대화를 이어본다",
            next: "ask-number-followup",
            effects: {
              socialContact: {
                npcId: "convenience-cashier",
                source: "dialogue",
                headline: {
                  badge: "번호 교환",
                  text: "편의점 알바녀와 연락처를 주고받았다.",
                },
                memory: {
                  title: "편의점 알바녀와 연락처를 교환했다",
                  body: "계산대 앞 대화가 자연스럽게 번호 교환으로 이어졌다.",
                },
              },
              npcRelation: {
                met: true,
                affinityDelta: 1,
                attractionDelta: 2,
                flags: {
                  askedNumber: true,
                },
              },
            },
          },
        ],
      },
      "ask-number-followup": {
        lines: [
          "\"아, 아니... 그냥 자주 오시면 기억해두려고요.\"",
          "점원은 민망한 듯 웃지만 눈빛은 조금 들떠 있다.",
        ],
        choices: [
          {
            label: "가볍게 웃고 계산대를 떠난다",
            end: true,
            effects: {
              npcRelation: {
                affinityDelta: 1,
              },
            },
          },
        ],
      },
      "post-surgery-repeat": {
        lines: [
          "\"오늘도 오셨네요. 필요한 거 있으시면 바로 말씀하세요.\"",
          "점원의 시선이 전보다 한결 부드럽게 따라온다.",
        ],
        choices: [
          {
            label: "가볍게 인사하고 물건을 고른다",
            end: true,
            effects: {
              npcRelation: {
                affinityDelta: 1,
              },
            },
          },
        ],
      },
    },
  },
  "npc-woman": {
    startNodeId: "intro",
    startNodeSelector(targetState) {
      const relation = typeof getNpcRelation === "function"
        ? getNpcRelation("npc-woman", targetState)
        : null;
      if ((relation?.meetings || 0) >= 2) {
        return "repeat";
      }
      if ((relation?.meetings || 0) >= 1) {
        return "playful";
      }
      return "intro";
    },
    nodes: {
      intro: {
        title: "네온 불빛 아래 선 여자가 시선을 한 번 붙든다",
        lines: [
          "낯선 거리의 공기를 잘 아는 사람처럼 표정이 이상하리만큼 느긋하다.",
          "\"길 찾는 얼굴은 아닌데, 뭘 찾고 있어요?\"",
        ],
        choices: [
          { label: "오늘 중심가 분위기를 묻는다", next: "mood" },
          { label: "가볍게 웃고 지나간다", next: "leave" },
        ],
      },
      mood: {
        lines: [
          "\"오늘은 사람도 돈도 다 빨리 움직여요. 눈치 잘 보면 재밌을걸요.\"",
          "여자는 말을 끝내고도 잠깐 더 너를 살핀다.",
        ],
        choices: [
          {
            label: "중심가에서 자주 보이냐고 묻는다",
            end: true,
            effects: {
              headline: {
                badge: "중심가 기류",
                text: "길거리 여자는 오늘 중심가 공기가 예민하다고 짧게 웃었다.",
              },
              memory: {
                type: "npc",
                title: "중심가에서 길거리 여자와 말을 섞었다",
                body: "돈 냄새와 사람 흐름을 잘 아는 듯한 말투가 오래 남았다.",
                tags: ["NPC", "중심가", "길거리 여자"],
              },
              npcRelation: {
                affinityDelta: 1,
                attractionDelta: 1,
              },
            },
          },
        ],
      },
      playful: {
        title: "길거리 여자가 먼저 눈웃음을 건넨다",
        lines: [
          "\"또 보네. 여기 계속 돌면 결국 다 마주치더라.\"",
          "장난기 섞인 말투지만 반응을 보는 눈빛은 꽤 또렷하다.",
        ],
        choices: [
          {
            label: "오늘도 바쁘냐고 묻는다",
            end: true,
            effects: {
              headline: {
                badge: "가벼운 플러팅",
                text: "길거리 여자는 바쁜 척하면서도 발걸음을 쉽게 떼지 않았다.",
              },
              memory: {
                type: "npc",
                title: "길거리 여자와 두 번째로 마주쳤다",
                body: "가벼운 농담 몇 마디였는데도 묘하게 분위기가 남았다.",
                tags: ["NPC", "중심가", "두 번째 만남"],
              },
              npcRelation: {
                affinityDelta: 1,
                attractionDelta: 1,
              },
            },
          },
        ],
      },
      repeat: {
        title: "익숙한 얼굴을 알아본 듯 여자가 먼저 멈춘다",
        lines: [
          "\"오늘은 그냥 지나가도 되는 얼굴은 아니네.\"",
          "짧은 한마디인데도 먼저 말을 걸 기회를 남겨두는 느낌이다.",
        ],
        choices: [
          {
            label: "다음에 또 보자고 하고 지나간다",
            end: true,
            effects: {
              headline: {
                badge: "익숙한 인연",
                text: "중심가에서 자주 마주치던 얼굴이 이제는 완전히 낯설지만은 않다.",
              },
              memory: {
                type: "npc",
                title: "길거리 여자가 먼저 아는 척했다",
                body: "짧은 대화인데도 거리의 공기가 한결 부드럽게 느껴졌다.",
                tags: ["NPC", "반복 조우", "중심가"],
              },
              npcRelation: {
                affinityDelta: 1,
                attractionDelta: 1,
              },
            },
          },
        ],
      },
      leave: {
        lines: [
          "여자는 굳이 붙잡지 않고, 네온빛 아래로 다시 몸을 돌린다.",
        ],
        choices: [
          {
            label: "중심가를 다시 둘러본다",
            end: true,
          },
        ],
      },
    },
  },
};
