const ROMANCE_GIRLFRIEND_PHONE_SMALLTALK_BY_NPC_ID = Object.freeze({
  "convenience-cashier": Object.freeze([
    "\"오늘 손님이 너무 많아서 조금 정신없었어.\" 편의점 알바가 작게 웃는다.",
    "\"네 목소리 들으니까 이제야 좀 풀린다.\" 숨을 고른 뒤 천천히 말을 잇는다.",
    "\"다음엔 대충 넘기지 말고 뭐 먹었는지도 바로 말해.\" 걱정 섞인 장난이 이어진다.",
  ]),
  "high-school-girl": Object.freeze([
    "\"그냥 네 목소리 듣고 싶어서 받았어.\" 수줍은 웃음이 짧게 번진다.",
    "\"아까 헤어지고 나니까 조금 아쉬웠어.\" 작은 목소리가 통화 너머로 이어진다.",
    "\"다음에는 조금 더 오래 같이 걷자.\" 마지막 말이 또렷하게 남는다.",
  ]),
  "girlfriend-student": Object.freeze([
    "\"오늘은 네 말투가 평소보다 더 다정했어.\" 조용한 목소리가 귀를 간질인다.",
    "\"같이 있던 시간 생각하면서 계속 웃게 되네.\" 숨결 섞인 웃음이 들린다.",
    "\"다음엔 공부 얘기 말고 그냥 우리 얘기만 하자.\" 차분한 기대가 묻어난다.",
  ]),
  "npc-woman": Object.freeze([
    "\"네 목소리 듣고 나니까 오늘 하루가 좀 정리되는 느낌이야.\"",
    "\"다음엔 네가 먼저 전화해도 괜찮아.\" 담백한 말끝이 오래 남는다.",
    "\"특별한 얘기 아니어도 좋으니까, 그냥 가끔 이렇게 전화해.\" 짧은 정적 뒤에 웃음이 흐른다.",
  ]),
});

const ROMANCE_POST_DATE_CALL_PACKS = Object.freeze([
  Object.freeze({
    id: "after-date-meal-check",
    tone: "warm",
    title: "데이트 뒤 짧은 안부 통화",
    relationshipStages: Object.freeze(["dating", "serious"]),
    beats: Object.freeze([
      Object.freeze({
        id: "meal-check-open",
        narrator: "데이트를 마치고 돌아가는 길. 화면이 천천히 아래로 내려가고, 짧은 통화 연결음이 귀에 남는다.",
        speaker: "여자친구",
        lines: Object.freeze([
          "여보, 밥 먹었어?",
          "아직.",
          "또 안 먹고 있었지.",
        ]),
        choices: Object.freeze([
          Object.freeze({
            id: "meal-check-soft",
            label: "이따 따뜻한 거 먹겠다고 말한다",
            affectionDelta: 1,
            happinessDelta: 2,
            responseLines: Object.freeze([
              "그래도 다행이다. 편의점이라도 괜찮으니까 따뜻한 걸로 먹어.",
              "응, 알겠어. 잔소리 고마워.",
            ]),
          }),
          Object.freeze({
            id: "meal-check-dry",
            label: "귀찮아서 그냥 넘긴다고 한다",
            affectionDelta: -1,
            happinessDelta: -2,
            responseLines: Object.freeze([
              "그렇게 또 대충 넘기면 내가 더 신경 쓰이잖아.",
              "알았어... 그냥 꼭 챙겨 먹어.",
            ]),
          }),
        ]),
      }),
    ]),
  }),
  Object.freeze({
    id: "after-date-commute-call",
    tone: "comfort",
    title: "집 가는 길 통화",
    relationshipStages: Object.freeze(["dating", "serious"]),
    beats: Object.freeze([
      Object.freeze({
        id: "commute-open",
        narrator: "지하철역 앞 바람이 조금 차다. 이어폰 너머로 익숙한 목소리가 바로 닿는다.",
        speaker: "주인공",
        lines: Object.freeze([
          "지금 집 가는 중이야?",
          "응, 방금 나왔어.",
          "오늘 힘들었겠다.",
        ]),
        choices: Object.freeze([
          Object.freeze({
            id: "commute-stay",
            label: "집 갈 때까지 같이 통화해주겠다고 한다",
            affectionDelta: 2,
            happinessDelta: 2,
            responseLines: Object.freeze([
              "응, 같이 가줘. 너 목소리 들으니까 좀 풀린다.",
            ]),
          }),
          Object.freeze({
            id: "commute-short",
            label: "피곤하니 먼저 끊자고 한다",
            affectionDelta: -1,
            happinessDelta: -1,
            responseLines: Object.freeze([
              "알겠어. 조금 아쉽지만 들어가서 연락할게.",
            ]),
          }),
        ]),
      }),
    ]),
  }),
  Object.freeze({
    id: "after-date-before-sleep",
    tone: "soft",
    title: "자기 전 통화",
    relationshipStages: Object.freeze(["dating", "serious"]),
    beats: Object.freeze([
      Object.freeze({
        id: "sleep-open",
        narrator: "밤공기가 조용해질 즈음, 짧은 숨소리 사이로 웃음이 먼저 새어 나온다.",
        speaker: "여자친구",
        lines: Object.freeze([
          "안 자고 있었어?",
          "네 전화 기다리고 있었지.",
          "또 그런다.",
        ]),
        choices: Object.freeze([
          Object.freeze({
            id: "sleep-sweet",
            label: "진짜 기다렸다고 자연스럽게 받아친다",
            affectionDelta: 2,
            happinessDelta: 3,
            responseLines: Object.freeze([
              "맨날 그런 식으로 말하면 내가 뭐라 해야 돼.",
              "웃으면 되지.",
              "지금 웃었어.",
            ]),
          }),
          Object.freeze({
            id: "sleep-flat",
            label: "농담이었다고 얼버무린다",
            affectionDelta: -1,
            happinessDelta: -1,
            responseLines: Object.freeze([
              "뭐야, 방금은 조금 설렜는데.",
            ]),
          }),
        ]),
      }),
    ]),
  }),
  Object.freeze({
    id: "after-date-rainy-night",
    tone: "care",
    title: "비 오는 날 걱정하는 통화",
    relationshipStages: Object.freeze(["dating", "serious"]),
    beats: Object.freeze([
      Object.freeze({
        id: "rain-open",
        narrator: "젖은 아스팔트 냄새가 남아 있다. 통화가 연결되자마자 걱정 섞인 목소리가 먼저 들린다.",
        speaker: "여자친구",
        lines: Object.freeze([
          "밖에 비 엄청 온다.",
          "너 우산 챙겼어?",
          "아니, 그냥 뛰면 되지.",
        ]),
        choices: Object.freeze([
          Object.freeze({
            id: "rain-listen",
            label: "우산 사서 따뜻한 물도 마시겠다고 한다",
            affectionDelta: 1,
            happinessDelta: 2,
            responseLines: Object.freeze([
              "응, 그럼 됐어. 진짜 말만 하지 말고 꼭 해.",
              "이렇게까지 걱정해주면 좀 설렌다.",
              "바보야.",
            ]),
          }),
          Object.freeze({
            id: "rain-ignore",
            label: "괜찮다며 대충 넘긴다",
            affectionDelta: -1,
            happinessDelta: -2,
            responseLines: Object.freeze([
              "그렇게 또 넘기지 마. 내가 괜히 더 신경 쓰이잖아.",
            ]),
          }),
        ]),
      }),
    ]),
  }),
  Object.freeze({
    id: "after-date-bored-call",
    tone: "playful",
    title: "심심해서 거는 전화",
    relationshipStages: Object.freeze(["dating", "serious"]),
    beats: Object.freeze([
      Object.freeze({
        id: "bored-open",
        narrator: "집에 거의 다 와갈 즈음, 통화는 장난스러운 분위기로 느슨하게 이어진다.",
        speaker: "여자친구",
        lines: Object.freeze([
          "뭐 해?",
          "그냥 누워 있었어.",
          "나도.",
        ]),
        choices: Object.freeze([
          Object.freeze({
            id: "bored-flirt",
            label: "심심할 때 제일 먼저 생각난 사람이 나냐고 묻는다",
            affectionDelta: 2,
            happinessDelta: 2,
            responseLines: Object.freeze([
              "응. 그럼 안 돼?",
              "너무 좋은데.",
            ]),
          }),
          Object.freeze({
            id: "bored-pass",
            label: "그냥 심심했나 보네 하고 넘긴다",
            affectionDelta: -1,
            happinessDelta: -1,
            responseLines: Object.freeze([
              "뭐야, 너무 담백한데. 조금 서운하다.",
            ]),
          }),
        ]),
      }),
    ]),
  }),
  Object.freeze({
    id: "after-date-miss-you",
    tone: "romantic",
    title: "헤어진 뒤 다시 보고 싶을 때",
    relationshipStages: Object.freeze(["dating", "serious"]),
    beats: Object.freeze([
      Object.freeze({
        id: "miss-you-open",
        narrator: "방금 헤어졌는데도 이상하게 목소리가 또 듣고 싶어진다. 통화는 그 여운을 그대로 이어받는다.",
        speaker: "주인공",
        lines: Object.freeze([
          "그냥 네 목소리 듣고 싶어서 전화했어.",
          "갑자기?",
          "응. 오늘은 좀 더 보고 싶더라.",
        ]),
        choices: Object.freeze([
          Object.freeze({
            id: "miss-you-lean-in",
            label: "좋으면 더 자주 말하겠다고 한다",
            affectionDelta: 2,
            happinessDelta: 3,
            responseLines: Object.freeze([
              "왜 이렇게 다정해.",
              "싫어?",
              "아니. 오히려 좋아.",
            ]),
          }),
          Object.freeze({
            id: "miss-you-backpedal",
            label: "그냥 해본 말이라고 물러난다",
            affectionDelta: -1,
            happinessDelta: -2,
            responseLines: Object.freeze([
              "아... 알겠어. 방금은 조금 진심인 줄 알았어.",
            ]),
          }),
        ]),
      }),
    ]),
  }),
  Object.freeze({
    id: "after-date-gentle-upset",
    tone: "tense",
    title: "조금 서운했던 마음을 푸는 통화",
    relationshipStages: Object.freeze(["dating", "serious"]),
    beats: Object.freeze([
      Object.freeze({
        id: "upset-open",
        narrator: "통화가 연결되고 잠깐의 정적이 흐른다. 싸운 건 아니지만 분위기는 조금 가라앉아 있다.",
        speaker: "여자친구",
        lines: Object.freeze([
          "오늘 왜 연락이 조금 늦었어?",
          "미안. 좀 정신없었어.",
          "알겠는데, 한마디는 해줄 수 있었잖아.",
        ]),
        choices: Object.freeze([
          Object.freeze({
            id: "upset-own",
            label: "잘못했다고 인정하고 다음엔 먼저 말하겠다고 한다",
            affectionDelta: 2,
            happinessDelta: 1,
            responseLines: Object.freeze([
              "알았어... 화난 건 아닌데 좀 서운했어.",
              "서운하게 해서 미안.",
              "지금은 좀 괜찮아.",
            ]),
          }),
          Object.freeze({
            id: "upset-deflect",
            label: "어쩔 수 없었다고 변명한다",
            affectionDelta: -2,
            happinessDelta: -2,
            responseLines: Object.freeze([
              "응, 그런 식으로 말하면 내가 더 말하기 어렵지.",
            ]),
          }),
        ]),
      }),
    ]),
  }),
  Object.freeze({
    id: "after-date-quiet-comfort",
    tone: "quiet",
    title: "잔잔하게 마음 풀리는 통화",
    relationshipStages: Object.freeze(["dating", "serious"]),
    beats: Object.freeze([
      Object.freeze({
        id: "quiet-open",
        narrator: "잠깐 멈춘 발걸음 사이로 도시 소음이 멀어진다. 통화는 조용하게 시작된다.",
        speaker: "주인공",
        lines: Object.freeze([
          "지금 뭐 보고 있었어?",
          "그냥 창밖.",
          "힘들었어?",
        ]),
        choices: Object.freeze([
          Object.freeze({
            id: "quiet-stay",
            label: "말하고 싶으면 하고 아니어도 된다고 한다",
            affectionDelta: 2,
            happinessDelta: 2,
            responseLines: Object.freeze([
              "그냥 네 목소리 들으니까 괜찮아져.",
              "그럼 오늘은 내가 조용히 옆에 있어줄게.",
            ]),
          }),
          Object.freeze({
            id: "quiet-rush",
            label: "왜 그런지 바로 캐묻는다",
            affectionDelta: -1,
            happinessDelta: -1,
            responseLines: Object.freeze([
              "음... 지금은 그냥 조용히 있고 싶어.",
            ]),
          }),
        ]),
      }),
    ]),
  }),
  Object.freeze({
    id: "after-date-hanging-up",
    tone: "sweet",
    title: "끊기 아쉬운 통화",
    relationshipStages: Object.freeze(["serious"]),
    beats: Object.freeze([
      Object.freeze({
        id: "hangup-open",
        narrator: "통화가 끝나갈수록 오히려 더 붙잡고 싶어진다. 말끝마다 웃음이 묻어난다.",
        speaker: "여자친구",
        lines: Object.freeze([
          "이제 끊어야겠다.",
          "벌써?",
          "내일 일찍 일어나야 해.",
        ]),
        choices: Object.freeze([
          Object.freeze({
            id: "hangup-sweet",
            label: "아쉽지만 잘 자고 내일 연락하자고 한다",
            affectionDelta: 2,
            happinessDelta: 3,
            responseLines: Object.freeze([
              "나도 아쉬워.",
              "잘 자고, 내일 일어나면 연락해.",
              "응. 너도 푹 자.",
            ]),
          }),
          Object.freeze({
            id: "hangup-clingy",
            label: "계속 안 끊고 버틴다",
            affectionDelta: -1,
            happinessDelta: -1,
            responseLines: Object.freeze([
              "귀엽긴 한데 오늘은 진짜 자야 해. 다음에 더 길게 하자.",
            ]),
          }),
        ]),
      }),
    ]),
  }),
]);

function getRomanceGirlfriendPhoneSmalltalkLines(npcId = "") {
  const normalizedNpcId = String(npcId || "").trim();
  const lines = normalizedNpcId
    ? ROMANCE_GIRLFRIEND_PHONE_SMALLTALK_BY_NPC_ID[normalizedNpcId]
    : null;

  return Array.isArray(lines) ? [...lines] : [];
}

function getRomancePostDateCallPacks({ relationshipStage = "" } = {}) {
  const normalizedStage = String(relationshipStage || "").trim().toLowerCase();
  return ROMANCE_POST_DATE_CALL_PACKS
    .filter((pack) => {
      const stages = Array.isArray(pack?.relationshipStages) ? pack.relationshipStages : [];
      return !normalizedStage || !stages.length || stages.includes(normalizedStage);
    })
    .map((pack) => ({
      ...pack,
      beats: Array.isArray(pack?.beats)
        ? pack.beats.map((beat) => ({
            ...beat,
            lines: Array.isArray(beat?.lines) ? [...beat.lines] : [],
            choices: Array.isArray(beat?.choices)
              ? beat.choices.map((choice) => ({
                  ...choice,
                  responseLines: Array.isArray(choice?.responseLines) ? [...choice.responseLines] : [],
                }))
              : [],
          }))
        : [],
    }));
}
