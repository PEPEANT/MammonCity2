const NPC_DIALOGUES = {
  "high-school-girl": {
    startNodeId: "intro",
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
    },
  },
  "alley-office-worker": {
    startNodeId: "intro",
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
};
