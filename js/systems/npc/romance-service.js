const ROMANCE_NPC_CONFIG = {
  "convenience-cashier": {
    npcId: "convenience-cashier",
    contactId: "convenienceCashier",
    label: "편의점 알바녀",
    shortLabel: "알바녀",
    sourceLabel: "편의점",
    introNote: "야간 편의점에서 자주 마주치는 알바녀다.",
    dialogueChanceByLevel: {
      1: 0,
      2: 0.24,
      3: 1,
    },
    streetChanceByLevel: {
      1: 0,
      2: 0,
      3: 0,
    },
    dateLocationId: "convenience-store",
    dateVenueLabel: "편의점 앞",
    dateCost: 9000,
    homeInviteCost: 5000,
    callLines: [
      "편의점 알바녀가 오늘은 덜 바쁘다며 잠깐 웃어 보였다.",
      "짧은 통화였지만 다음에 들르면 얼굴은 기억하겠다는 답이 돌아왔다.",
      "편의점 알바녀가 쉬는 시간 끝나기 전에 다시 연락하자고 했다.",
    ],
  },
  "high-school-girl": {
    npcId: "high-school-girl",
    contactId: "highSchoolGirl",
    label: "골목 여고생",
    shortLabel: "여고생",
    sourceLabel: "골목",
    introNote: "골목이나 대학가 근처에서 가끔 마주치는 여고생이다.",
    dialogueChanceByLevel: {
      1: 0,
      2: 0.18,
      3: 0.78,
    },
    streetChanceByLevel: {
      1: 0,
      2: 0,
      3: 0.38,
    },
    dateLocationId: "campus-park",
    dateVenueLabel: "대학가 공원",
    dateCost: 7000,
    homeInviteCost: 4000,
    callLines: [
      "여고생은 학원 가는 길이라며 짧게 통화를 끊었지만 목소리는 밝았다.",
      "버스 오기 전까지는 괜찮다며 잠깐 수다를 받아줬다.",
      "문제집 들고 있던 손이 바쁜 와중에도 또 연락하라는 말은 남겼다.",
    ],
  },
  "girlfriend-student": {
    npcId: "girlfriend-student",
    contactId: "girlfriendStudent",
    label: "도서관 여학생",
    shortLabel: "여학생",
    sourceLabel: "도서관",
    introNote: "도서관과 대학가 복도에서 마주치는 조용한 학생.",
    dialogueChanceByLevel: {
      1: 0,
      2: 0,
      3: 0.16,
    },
    streetChanceByLevel: {
      1: 0,
      2: 0,
      3: 0,
    },
    dateLocationId: "campus-park",
    dateVenueLabel: "캠퍼스 공원",
    dateCost: 8000,
    homeInviteCost: 5000,
    callLines: [
      "도서관 여학생이 작은 목소리로 오늘은 책보다 당신 목소리가 더 기억난다고 말한다.",
      "복도에서 마주쳤던 순간을 떠올리며 조용히 웃는 숨결이 전화기 너머로 전해진다.",
      "다음엔 공부 이야기 말고 서로 이야기부터 해보자며 천천히 말을 잇는다.",
    ],
  },
  "npc-woman": {
    npcId: "npc-woman",
    contactId: "npcWoman",
    label: "길거리 여자",
    shortLabel: "거리 여자",
    sourceLabel: "중심가",
    introNote: "사거리와 중심가를 오가며 자주 눈에 띄는 여자다.",
    dialogueChanceByLevel: {
      1: 0,
      2: 0.22,
      3: 0.82,
    },
    streetChanceByLevel: {
      1: 0,
      2: 0,
      3: 0.46,
    },
    dateLocationId: "downtown",
    dateVenueLabel: "중심상업구역",
    dateCost: 18000,
    homeInviteCost: 8000,
    callLines: [
      "길거리 여자는 오늘도 중심가가 시끄럽다며 웃음 섞인 목소리로 전화를 받았다.",
      "짧은 통화였지만 다음엔 먼저 알아보고 말을 걸겠다는 답이 돌아왔다.",
      "거리에 나와 있으면 다시 보자는 가벼운 약속이 전화 끝에 남았다.",
    ],
  },
};

const ROMANCE_GIRLFRIEND_CALL_LINES = {
  convenienceCashier: [
    "\"오늘 손님 빠지자마자 네 생각부터 났어.\" 편의점 알바녀가 작게 웃는다.",
    "\"퇴근하고 나니까 네 목소리 듣고 싶더라.\" 익숙한 목소리가 전화 너머로 풀린다.",
    "\"다음엔 그냥 네가 먹고 싶은 거 바로 말해. 내가 맞춰볼게.\" 장난스러운 톤이 이어진다.",
  ],
  highSchoolGirl: [
    "\"오늘은 그냥 네 목소리 듣고 싶었어.\" 여고생이 조금 수줍게 웃는다.",
    "\"아까 지나가다가 네 생각나서 바로 눌렀어.\" 조용한 숨소리 뒤로 말이 이어진다.",
    "\"다음에 또 같이 걷자. 오늘은 그 말 하려고 전화했어.\" 맑은 목소리가 또렷하게 남는다.",
  ],
  npcWoman: [
    "\"지금 네 목소리 들으니까 오늘 하루가 좀 정리된다.\" 길거리 여자가 느긋하게 말한다.",
    "\"다음엔 네가 먼저 부르면 바로 나갈 수도 있어.\" 낮게 웃는 목소리가 이어진다.",
    "\"괜히 전화한 건 아닌데, 그냥 네 생각이 나서.\" 짧은 정적 뒤에 솔직한 한마디가 떨어진다.",
  ],
};

const ROMANCE_DATE_SCENE_CONFIG = {
  convenienceCashier: {
    roomTitle: ({ label = "" }) => `${label}와 편의점 앞에서 쉬기로 한 날`,
    roomLines: ({ label = "", venueLabel = "" }) => [
      `${label}와 오늘 ${venueLabel}에서 잠깐 쉬기로 했다.`,
      "방에서 나가기 전에 음료나 간단한 간식을 챙겨 두면 분위기가 더 편해질 것 같다.",
    ],
    actionLabel: "편의점 앞으로 가기",
    headlineText: ({ label = "" }) => `${label}와 오늘 편의점 앞에서 잠깐 보기로 했다.`,
    startTitle: ({ label = "", venueLabel = "" }) => `${label}와 ${venueLabel} 벤치에 앉는다`,
    introLines: ({ label = "" }) => [
      "냉장고 소리와 자동문 여닫히는 소리가 잔잔하게 뒤섞인다.",
      `${label}와 따뜻한 음료를 나눠 들고 오늘 있었던 일을 천천히 풀어 놓는다.`,
    ],
    resultBody: ({ label = "", actualCost = 0 }) => `${label}와 편의점 앞에서 가볍게 쉬어 갔다.${actualCost > 0 ? ` 음료와 간식을 사느라 ${formatMoney(actualCost)}을 썼지만` : ""} 편하게 웃으며 이야기를 나눈 덕분에 서로 조금 더 가까워졌다.`,
    successNote: ({ label = "" }) => `${label}와 편의점 앞에서 편하게 시간을 보내고 헤어졌다.`,
    happinessGain: 5,
    affinityDelta: 2,
    attractionDelta: 1,
    feedbackChip: "편의점 앞",
    dateDialogueByStage: {
      default: [
        "\"오늘은 손님이 좀 덜 몰려서 다행이었어요.\"",
        "\"바쁜 시간 끝나고 이렇게 앉아 있으니까 이제야 숨이 좀 트이네요.\"",
      ],
      dating: [
        "\"이제는 전화가 오면 괜히 먼저 웃게 돼요.\"",
        "\"다음에는 제가 쉬는 시간 더 길 때 맞춰 볼게요.\"",
      ],
      serious: [
        "\"당신이랑 있으면 하루가 너무 빨리 끝나는 느낌이에요.\"",
        "\"다음엔 제가 직접 디저트라도 챙겨 올게요.\"",
      ],
    },
    dateResultAsideByStage: {
      default: "돌아가는 발걸음이 한결 가벼워 보였다.",
      dating: "이제는 어색한 침묵보다 다음 약속 이야기가 먼저 나온다.",
      serious: "헤어질 때도 이미 다음 만남을 당연하게 기대하는 분위기였다.",
    },
    homeRoomTitle: ({ label = "" }) => `${label}가 집에 오기로 한 날`,
    homeRoomLines: ({ label = "", venueLabel = "" }) => [
      `${label}가 오늘 ${venueLabel}에 들르기로 했다.`,
      "집 안 공기를 조금만 정리해도 훨씬 편안한 시간이 될 것 같다.",
    ],
    homeHeadlineText: ({ label = "" }) => `${label}가 오늘 집에 오기로 했다.`,
    homeStartTitle: ({ label = "", venueLabel = "" }) => `${label}를 ${venueLabel}에서 맞이한다`,
    homeIntroLines: [
      "현관문 닫히는 소리 뒤로 조용한 공기가 천천히 가라앉는다.",
      "작은 간식과 따뜻한 음료를 꺼내 놓자 긴장이 조금씩 풀린다.",
    ],
    homeDialogueByStage: {
      dating: [
        "\"생각보다 훨씬 편하네요. 괜히 긴장했어요.\"",
        "\"밖에서 만날 때보다 이런 얘기는 여기서 더 잘 나오네요.\"",
      ],
      serious: [
        "\"이제는 여기 오는 게 어색하지 않네요.\"",
        "\"다음엔 제가 먹을 것도 조금 챙겨 올게요.\"",
      ],
    },
    homeResultBody: ({ label = "", actualCost = 0 }) => `${label}와 집에서 조용히 이야기를 나눴다.${actualCost > 0 ? ` 간단히 준비하느라 ${formatMoney(actualCost)}을 썼지만` : ""} 바깥에서 볼 때보다 훨씬 편안한 분위기가 이어졌다.`,
    homeResultAsideByStage: {
      dating: "문 앞까지 배웅하는 동안에도 대화가 끊기지 않았다.",
      serious: "이제는 서로의 일상 안으로 조금 더 깊게 들어온 느낌이 남았다.",
    },
    homeSuccessNote: ({ label = "" }) => `${label}가 집에서 편하게 시간을 보내고 돌아갔다.`,
    homeFeedbackChip: "집 데이트",
  },
  highSchoolGirl: {
    roomTitle: ({ label = "" }) => `${label}와 대학가 공원으로 가는 날`,
    roomLines: ({ label = "", venueLabel = "" }) => [
      `${label}와 오늘 ${venueLabel}에서 만나기로 했다.`,
      "공원 쪽은 오래 걷게 될 것 같아, 가볍게 몸가짐을 정리하고 나가는 편이 좋다.",
    ],
    actionLabel: "공원으로 가기",
    headlineText: ({ label = "" }) => `${label}와 오늘 대학가 공원에서 보기로 했다.`,
    startTitle: ({ label = "", venueLabel = "" }) => `${label}와 ${venueLabel}를 천천히 걷는다`,
    introLines: ({ label = "" }) => [
      "공원 안쪽은 생각보다 조용하고, 나무 사이로 바람이 천천히 지나간다.",
      `${label}와 나란히 걸으며 학교 이야기와 동네 이야기를 자연스럽게 이어 간다.`,
    ],
    resultBody: ({ label = "", actualCost = 0 }) => `${label}와 공원을 한참 걸으며 이야기를 나눴다.${actualCost > 0 ? ` 군것질값으로 ${formatMoney(actualCost)} 정도 썼지만` : ""} 함께 보낸 시간이 길어질수록 어색함이 풀리고 표정도 한결 편해졌다.`,
    successNote: ({ label = "" }) => `${label}와 공원을 걸으며 한층 가까워졌다.`,
    happinessGain: 7,
    affinityDelta: 2,
    attractionDelta: 2,
    feedbackChip: "공원 산책",
    dateDialogueByStage: {
      default: [
        "\"여기 오면 괜히 시간이 느리게 가는 것 같지 않아요?\"",
        "\"학교 끝나고 이런 데 걷는 거 은근 좋네요.\"",
      ],
      dating: [
        "\"오빠랑 있으면 괜히 말이 많아져요.\"",
        "\"다음엔 벚꽃 필 때 다시 같이 와요.\"",
      ],
      serious: [
        "\"이제는 이런 시간이 당연했으면 좋겠어요.\"",
        "\"같이 걷는 게 이렇게 익숙해질 줄 몰랐어요.\"",
      ],
    },
    dateResultAsideByStage: {
      default: "헤어질 때 손을 흔드는 표정이 처음보다 훨씬 부드러웠다.",
      dating: "가벼운 농담 하나에도 금세 웃음이 이어졌다.",
      serious: "짧은 산책이었는데도 하루의 중심이 통째로 그쪽으로 기울어진 느낌이었다.",
    },
    homeRoomTitle: ({ label = "" }) => `${label}가 집에 들르기로 한 날`,
    homeRoomLines: ({ label = "", venueLabel = "" }) => [
      `${label}가 오늘 ${venueLabel}에 잠깐 들르기로 했다.`,
      "밖에서 볼 때와는 다른 분위기라, 괜히 더 신경이 쓰인다.",
    ],
    homeHeadlineText: ({ label = "" }) => `${label}가 오늘 집에 들르기로 했다.`,
    homeStartTitle: ({ label = "", venueLabel = "" }) => `${label}를 ${venueLabel}에서 맞이한다`,
    homeIntroLines: [
      "방 안의 작은 소리들까지 유난히 또렷하게 들리는 조용한 시간이다.",
      "문득 밖에서 만나던 때보다 말투도 표정도 한층 가까워진 걸 느끼게 된다.",
    ],
    homeDialogueByStage: {
      dating: [
        "\"집은 생각보다 훨씬 편하네요. 괜히 떨었어요.\"",
        "\"밖에서 볼 때랑 느낌이 또 다르네요.\"",
      ],
      serious: [
        "\"이런 시간이 점점 더 자연스러워졌으면 좋겠어요.\"",
        "\"다음엔 제가 먼저 놀러 오자고 해도 되죠?\"",
      ],
    },
    homeResultBody: ({ label = "", actualCost = 0 }) => `${label}와 집에서 오래 이야기를 나눴다.${actualCost > 0 ? ` 간단한 준비 비용으로 ${formatMoney(actualCost)}을 썼지만` : ""} 서로를 더 편하게 받아들이는 기분이 분명해졌다.`,
    homeResultAsideByStage: {
      dating: "돌아가는 뒤모습에도 여운이 오래 남는다.",
      serious: "함께 있는 시간이 이제 특별한 이벤트보다 일상에 가까워지고 있었다.",
    },
    homeSuccessNote: ({ label = "" }) => `${label}가 집에서 웃으며 시간을 보내고 돌아갔다.`,
    homeFeedbackChip: "집 초대",
  },
  npcWoman: {
    roomTitle: ({ label = "" }) => `${label}와 중심상업구역에서 보기로 한 날`,
    roomLines: ({ label = "", venueLabel = "" }) => [
      `${label}와 오늘 ${venueLabel}에서 만나기로 했다.`,
      "사람이 많은 곳이라 분위기를 놓치지 않게 조금 더 단정하게 나가는 편이 좋겠다.",
    ],
    actionLabel: "중심가로 나가기",
    headlineText: ({ label = "" }) => `${label}와 오늘 중심상업구역에서 약속이 잡혀 있다.`,
    startTitle: ({ label = "", venueLabel = "" }) => `${label}와 ${venueLabel}의 불빛 사이를 걷는다`,
    introLines: ({ label = "" }) => [
      "상점 불빛과 사람들 소리가 섞여서 중심가 특유의 밤 공기가 살아난다.",
      `${label}와 발을 맞춰 걷다 보니 대화도 훨씬 자연스럽고 진하게 이어진다.`,
    ],
    resultBody: ({ label = "", actualCost = 0 }) => `${label}와 중심가를 돌며 오래 이야기를 나눴다.${actualCost > 0 ? ` 식사와 커피로 ${formatMoney(actualCost)}을 썼지만` : ""} 분위기가 잘 맞아서 다음에는 더 깊은 만남으로 이어질 것 같은 느낌이 남았다.`,
    successNote: ({ label = "" }) => `${label}와 중심가에서 진득하게 시간을 보내고 돌아왔다.`,
    happinessGain: 8,
    affinityDelta: 3,
    attractionDelta: 2,
    feedbackChip: "중심가 데이트",
    dateDialogueByStage: {
      default: [
        "\"중심가 소음도 같이 걸으니까 별로 거슬리지 않네요.\"",
        "\"이 정도면 데이트답게 분위기 좀 나네요.\"",
      ],
      dating: [
        "\"당신이랑 있으면 시간 쓰는 게 아깝지 않아요.\"",
        "\"다음엔 내가 먼저 장소를 골라 볼게요.\"",
      ],
      serious: [
        "\"이제는 이런 밤 공기가 낯설지 않네요.\"",
        "\"같이 걷는 속도까지 맞아 들어가는 게 마음에 들어요.\"",
      ],
    },
    dateResultAsideByStage: {
      default: "짧은 침묵에도 불편함보다 기대가 먼저 남았다.",
      dating: "헤어지는 순간에도 이미 다음 만남의 분위기가 이어졌다.",
      serious: "평범한 거리 풍경까지 둘만의 장면처럼 남는 밤이었다.",
    },
    homeRoomTitle: ({ label = "" }) => `${label}가 집으로 오기로 한 날`,
    homeRoomLines: ({ label = "", venueLabel = "" }) => [
      `${label}가 오늘 ${venueLabel}로 오기로 했다.`,
      "밖에서 보던 사람을 집 안에서 맞는다는 건 생각보다 더 묵직한 일이다.",
    ],
    homeHeadlineText: ({ label = "" }) => `${label}가 오늘 집으로 오기로 했다.`,
    homeStartTitle: ({ label = "", venueLabel = "" }) => `${label}를 ${venueLabel}에서 맞이한다`,
    homeIntroLines: [
      "문이 닫히고 나자 바깥의 소음이 멀어지며 완전히 다른 공기가 만들어진다.",
      "서로의 거리가 가까워진 만큼, 대화도 훨씬 천천히 깊어지는 쪽으로 흐른다.",
    ],
    homeDialogueByStage: {
      dating: [
        "\"당신 공간을 보여준다는 건 생각보다 큰 의미네요.\"",
        "\"밖에서 볼 때랑 집에서 보는 모습이 조금 다르네요.\"",
      ],
      serious: [
        "\"이제는 여기 오는 게 낯설지 않아요.\"",
        "\"당신 일상 안에 내가 들어온 느낌이 드네요.\"",
      ],
    },
    homeResultBody: ({ label = "", actualCost = 0 }) => `${label}와 집 안에서 오래 이야기를 나눴다.${actualCost > 0 ? ` 간단한 식사와 준비에 ${formatMoney(actualCost)}을 썼지만` : ""} 밖에서보다 훨씬 깊고 진한 분위기가 남았다.`,
    homeResultAsideByStage: {
      dating: "둘 사이의 온도가 한 단계 또 달라졌다는 게 분명했다.",
      serious: "특별한 말이 없어도 같은 공간을 공유하는 것만으로 충분한 밤이었다.",
    },
    homeSuccessNote: ({ label = "" }) => `${label}가 집에서 한참 머물다 천천히 돌아갔다.`,
    homeFeedbackChip: "프라이빗 데이트",
  },
};

function getRomanceNpcConfig(npcId = "") {
  return ROMANCE_NPC_CONFIG[String(npcId || "").trim()] || null;
}

function isRomanceNpc(npcId = "") {
  return Boolean(getRomanceNpcConfig(npcId));
}

function getRomanceContactId(npcId = "") {
  return getRomanceNpcConfig(npcId)?.contactId || "";
}

function getRomanceContactState(npcId = "", targetState = state) {
  const config = getRomanceNpcConfig(npcId);
  if (!config || !targetState?.social?.contacts) {
    return null;
  }

  return targetState.social.contacts[config.contactId] || null;
}

function hasRomanceContact(npcId = "", targetState = state) {
  const contact = getRomanceContactState(npcId, targetState);
  return Boolean(contact?.phoneUnlocked);
}

function getRomanceRelationshipStageLabel(stage = "") {
  const normalized = String(stage || "").trim().toLowerCase();
  if (normalized === "serious") {
    return "여자친구";
  }
  if (normalized === "dating") {
    return "데이트 중";
  }
  if (normalized === "contact") {
    return "연락 중";
  }
  return "썸 시작";
}

function getRomanceConfigByContactId(contactId = "") {
  const normalized = String(contactId || "").trim();
  if (!normalized) {
    return null;
  }

  return Object.values(ROMANCE_NPC_CONFIG).find((entry) => entry.contactId === normalized) || null;
}

function getRomanceDateSceneConfig(contactId = "") {
  const normalized = String(contactId || "").trim();
  return ROMANCE_DATE_SCENE_CONFIG[normalized] || null;
}

function getRomanceDialogueBundle(
  sceneConfig = {},
  {
    sceneType = "date",
    relationshipStage = "",
  } = {},
) {
  const normalizedSceneType = String(sceneType || "date").trim().toLowerCase();
  const normalizedStage = String(relationshipStage || "").trim().toLowerCase();
  const key = normalizedSceneType === "home-invite" ? "homeDialogueByStage" : "dateDialogueByStage";
  const table = sceneConfig && typeof sceneConfig === "object" ? sceneConfig[key] : null;
  if (!table || typeof table !== "object") {
    return [];
  }

  const stageLines = normalizedStage === "serious"
    ? (table.serious || table.dating || table.default)
    : normalizedStage === "dating"
      ? (table.dating || table.default)
      : table.default;
  return Array.isArray(stageLines)
    ? stageLines.map((line) => String(line || "").trim()).filter(Boolean)
    : [];
}

function getRomanceResultAside(
  sceneConfig = {},
  {
    sceneType = "date",
    relationshipStage = "",
  } = {},
) {
  const normalizedSceneType = String(sceneType || "date").trim().toLowerCase();
  const normalizedStage = String(relationshipStage || "").trim().toLowerCase();
  const key = normalizedSceneType === "home-invite" ? "homeResultAsideByStage" : "dateResultAsideByStage";
  const table = sceneConfig && typeof sceneConfig === "object" ? sceneConfig[key] : null;
  if (!table || typeof table !== "object") {
    return "";
  }

  const line = normalizedStage === "serious"
    ? (table.serious || table.dating || table.default)
    : normalizedStage === "dating"
      ? (table.dating || table.default)
      : table.default;
  return String(line || "").trim();
}

function buildRomanceDateSceneProfile(
  contactId = "",
  {
    targetState = state,
    venueLabel = "",
    actualCost = 0,
    relationshipStage = "",
    nextStage = "",
  } = {},
) {
  const config = getRomanceConfigByContactId(contactId);
  const label = String(config?.label || "상대").trim() || "상대";
  const resolvedVenueLabel = String(venueLabel || config?.dateVenueLabel || "약속 장소").trim() || "약속 장소";
  const sceneConfig = getRomanceDateSceneConfig(contactId) || {};
  const happinessGain = Math.max(1, Math.round(Number(sceneConfig.happinessGain) || 6));
  const affinityDelta = Math.max(0, Math.round(Number(sceneConfig.affinityDelta) || 2));
  const attractionDelta = Math.max(0, Math.round(Number(sceneConfig.attractionDelta) || 1));
  const relationshipLabel = getRomanceRelationshipStageLabel(nextStage || "dating");
  const dialogueLines = getRomanceDialogueBundle(sceneConfig, {
    sceneType: "date",
    relationshipStage: relationshipStage || nextStage || "contact",
  });
  const resultAside = getRomanceResultAside(sceneConfig, {
    sceneType: "date",
    relationshipStage: nextStage || relationshipStage || "dating",
  });

  return {
    roomTitle: typeof sceneConfig.roomTitle === "function"
      ? sceneConfig.roomTitle({ label, venueLabel: resolvedVenueLabel, targetState })
      : `${label}와 약속이 있는 날`,
    roomLines: typeof sceneConfig.roomLines === "function"
      ? sceneConfig.roomLines({ label, venueLabel: resolvedVenueLabel, targetState })
      : [
          `${label}와 오늘 ${resolvedVenueLabel}에서 보기로 했다.`,
          "방에서 마음을 정리한 뒤 바로 데이트를 시작할 수 있다.",
        ],
    actionLabel: String(sceneConfig.actionLabel || "데이트 나가기").trim() || "데이트 나가기",
    headlineText: typeof sceneConfig.headlineText === "function"
      ? sceneConfig.headlineText({ label, venueLabel: resolvedVenueLabel, targetState })
      : `${label}와 오늘 ${resolvedVenueLabel}에서 보기로 했다.`,
    startTitle: typeof sceneConfig.startTitle === "function"
      ? sceneConfig.startTitle({ label, venueLabel: resolvedVenueLabel, targetState })
      : `${label}와 약속 장소로 향한다`,
    introLines: typeof sceneConfig.introLines === "function"
      ? sceneConfig.introLines({ label, venueLabel: resolvedVenueLabel, targetState })
      : [
          `${resolvedVenueLabel} 공기가 오늘은 유난히 또렷하다.`,
          `${label}와 나란히 걸으며 자연스럽게 대화를 이어 간다.`,
        ],
    dialogueLines,
    resultBody: (() => {
      const baseResult = typeof sceneConfig.resultBody === "function"
      ? sceneConfig.resultBody({ label, venueLabel: resolvedVenueLabel, targetState, actualCost, nextStage })
      : `${label}와 데이트를 마쳤다.${actualCost > 0 ? ` ${formatMoney(actualCost)}을 썼지만` : ""} 다음에는 더 자연스럽게 연락할 수 있을 것 같다.`;
      return resultAside ? `${baseResult} ${resultAside}` : baseResult;
    })(),
    successNote: typeof sceneConfig.successNote === "function"
      ? sceneConfig.successNote({ label, venueLabel: resolvedVenueLabel, targetState, actualCost, nextStage })
      : `${label}와 약속을 무사히 마쳤다.`,
    happinessGain,
    affinityDelta,
    attractionDelta,
    feedbackChip: String(sceneConfig.feedbackChip || resolvedVenueLabel).trim() || resolvedVenueLabel,
    relationshipLabel,
  };
}

function buildRomanceHomeInviteSceneProfile(
  contactId = "",
  {
    targetState = state,
    venueLabel = "",
    actualCost = 0,
    relationshipStage = "",
    nextStage = "",
  } = {},
) {
  const config = getRomanceConfigByContactId(contactId);
  const label = String(config?.label || "상대").trim() || "상대";
  const resolvedVenueLabel = String(
    venueLabel
    || (typeof getInventoryResidenceLabel === "function" ? getInventoryResidenceLabel(targetState) : "")
    || "집"
  ).trim() || "집";
  const sceneConfig = getRomanceDateSceneConfig(contactId) || {};
  const happinessGain = Math.max(1, Math.round(Number(sceneConfig.homeHappinessGain) || 10));
  const affinityDelta = Math.max(0, Math.round(Number(sceneConfig.homeAffinityDelta) || 3));
  const attractionDelta = Math.max(0, Math.round(Number(sceneConfig.homeAttractionDelta) || 2));
  const relationshipLabel = getRomanceRelationshipStageLabel(nextStage || "serious");
  const dialogueLines = getRomanceDialogueBundle(sceneConfig, {
    sceneType: "home-invite",
    relationshipStage: relationshipStage || nextStage || "dating",
  });
  const resultAside = getRomanceResultAside(sceneConfig, {
    sceneType: "home-invite",
    relationshipStage: nextStage || relationshipStage || "serious",
  });

  return {
    roomTitle: typeof sceneConfig.homeRoomTitle === "function"
      ? sceneConfig.homeRoomTitle({ label, venueLabel: resolvedVenueLabel, targetState })
      : `${label}가 집에 오기로 한 날`,
    roomLines: typeof sceneConfig.homeRoomLines === "function"
      ? sceneConfig.homeRoomLines({ label, venueLabel: resolvedVenueLabel, targetState })
      : [
          `${label}가 오늘 ${resolvedVenueLabel}에 들르기로 했다.`,
          "방에서 준비를 마치면 바로 집 초대를 시작할 수 있다.",
        ],
    actionLabel: String(sceneConfig.homeActionLabel || "집 초대 시작").trim() || "집 초대 시작",
    headlineText: typeof sceneConfig.homeHeadlineText === "function"
      ? sceneConfig.homeHeadlineText({ label, venueLabel: resolvedVenueLabel, targetState })
      : `${label}가 오늘 집에 오기로 했다.`,
    startTitle: typeof sceneConfig.homeStartTitle === "function"
      ? sceneConfig.homeStartTitle({ label, venueLabel: resolvedVenueLabel, targetState })
      : `${label}를 ${resolvedVenueLabel}에서 맞이한다`,
    introLines: Array.isArray(sceneConfig.homeIntroLines)
      ? sceneConfig.homeIntroLines.map((line) => String(line || "").trim()).filter(Boolean)
      : [
          `${resolvedVenueLabel} 안 공기가 잔잔해지고 약속한 시간에 맞춰 문이 열린다.`,
          "밖에서 볼 때와는 다른 거리감 속에서 더 긴 이야기가 이어지기 시작한다.",
        ],
    dialogueLines,
    resultBody: (() => {
      const baseResult = typeof sceneConfig.homeResultBody === "function"
        ? sceneConfig.homeResultBody({ label, venueLabel: resolvedVenueLabel, targetState, actualCost, nextStage })
        : `${label}와 집에서 오래 이야기를 나눴다.${actualCost > 0 ? ` 준비 비용으로 ${formatMoney(actualCost)}을 썼지만` : ""} 밖에서보다 훨씬 편안한 분위기가 이어졌다.`;
      return resultAside ? `${baseResult} ${resultAside}` : baseResult;
    })(),
    successNote: typeof sceneConfig.homeSuccessNote === "function"
      ? sceneConfig.homeSuccessNote({ label, venueLabel: resolvedVenueLabel, targetState, actualCost, nextStage })
      : `${label}가 집에서 함께 시간을 보내고 돌아갔다.`,
    happinessGain,
    affinityDelta,
    attractionDelta,
    feedbackChip: String(sceneConfig.homeFeedbackChip || "집 초대").trim() || "집 초대",
    relationshipLabel,
  };
}

function buildRomanceSceneNpcActorOverride(contactId = "", sceneType = "") {
  const normalizedContactId = String(contactId || "")
    .trim()
    .replace(/[\s_-]/g, "")
    .toLowerCase();
  const normalizedSceneType = String(sceneType || "").trim().toLowerCase();

  if (normalizedSceneType === "home-invite" && normalizedContactId === "conveniencecashier") {
    const homeInviteArt = String(CHARACTER_ART?.convenienceCashier?.homeInvite || "").trim();
    if (!homeInviteArt) {
      return null;
    }

    return {
      kind: "npc",
      src: homeInviteArt,
      preserveSrc: true,
      left: 72,
      bottom: 0,
      height: 96,
      zIndex: 2,
    };
  }

  return null;
}

function getRomancePlanStatusSummary(contact = {}, config = {}, targetState = state) {
  const activePlan = getRomanceActivePlanSnapshot(targetState);
  if (activePlan && activePlan.contactId === (contact.contactId || contact.id || "")) {
    const venueLabel = activePlan.sceneType === "home-invite"
      ? (activePlan.venueLabel || (typeof getInventoryResidenceLabel === "function" ? getInventoryResidenceLabel(targetState) : "집"))
      : (activePlan.venueLabel || String(config?.dateVenueLabel || "약속 장소").trim() || "약속 장소");
    return activePlan.scheduledDay > (Number(targetState?.day) || 1)
      ? `내일 ${venueLabel} 약속`
      : `오늘 ${venueLabel} 약속`;
  }

  if (contact?.pendingHomeInviteStatus === "scheduled" && Number(contact?.pendingHomeInviteDay) >= (Number(targetState?.day) || 1)) {
    const inviteDay = Number(contact.pendingHomeInviteDay) || Number(targetState?.day) || 1;
    return inviteDay > (Number(targetState?.day) || 1)
      ? `내일 ${typeof getInventoryResidenceLabel === "function" ? getInventoryResidenceLabel(targetState) : "집"} 초대 약속`
      : "오늘 집 초대 약속";
  }

  if (contact?.pendingDateStatus === "scheduled" && Number(contact?.pendingDateDay) >= (Number(targetState?.day) || 1)) {
    const dateDay = Number(contact.pendingDateDay) || Number(targetState?.day) || 1;
    const venueLabel = String(config?.dateVenueLabel || "약속 장소").trim() || "약속 장소";
    return dateDay > (Number(targetState?.day) || 1)
      ? `내일 ${venueLabel} 약속`
      : `오늘 ${venueLabel} 약속`;
  }

  return String(contact?.note || config?.introNote || "").trim();
}

function getActiveRomancePlan(targetState = state) {
  return getRomanceActivePlanSnapshot(targetState);
}

function syncRomanceSceneState(targetState = state) {
  return getRomanceActiveSceneSnapshot(targetState);
}

function syncLegacyRomanceSceneState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return null;
  }

  const scene = targetState.romanceScene;
  if (!scene || typeof scene !== "object") {
    targetState.romanceScene = null;
    return null;
  }

  const sceneType = String(scene.sceneType || "").trim().toLowerCase();
  if (!["date", "home-invite"].includes(sceneType)) {
    targetState.romanceScene = null;
    return null;
  }

  targetState.romanceScene = {
    sceneType,
    contactId: String(scene.contactId || "").trim(),
    npcId: String(scene.npcId || "").trim(),
    label: String(scene.label || "").trim(),
    speaker: String(scene.speaker || scene.label || "").trim(),
    title: String(scene.title || "").trim(),
    tags: Array.isArray(scene.tags) ? scene.tags.map((tag) => String(tag || "").trim()).filter(Boolean) : [],
    introLines: Array.isArray(scene.introLines) ? scene.introLines.map((line) => String(line || "").trim()).filter(Boolean) : [],
    backgroundConfig: scene.backgroundConfig && typeof scene.backgroundConfig === "object"
      ? { ...scene.backgroundConfig }
      : null,
    plannedCost: Math.max(0, Math.round(Number(scene.plannedCost) || 0)),
    venueLabel: String(scene.venueLabel || "").trim(),
  };

  return targetState.romanceScene;
}

function cloneRomanceSceneChoice(choice = null) {
  if (!choice || typeof choice !== "object") {
    return null;
  }

  return {
    ...choice,
    lines: Array.isArray(choice.lines)
      ? choice.lines.map((line) => String(line || "").trim()).filter(Boolean)
      : [],
    resultLines: Array.isArray(choice.resultLines)
      ? choice.resultLines.map((line) => String(line || "").trim()).filter(Boolean)
      : [],
    tags: Array.isArray(choice.tags)
      ? choice.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [],
    resultTags: Array.isArray(choice.resultTags)
      ? choice.resultTags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [],
    headline: choice.headline && typeof choice.headline === "object"
      ? { ...choice.headline }
      : null,
    memory: choice.memory && typeof choice.memory === "object"
      ? { ...choice.memory }
      : null,
    grantContact: choice.grantContact && typeof choice.grantContact === "object"
      ? {
          ...choice.grantContact,
          headline: choice.grantContact.headline && typeof choice.grantContact.headline === "object"
            ? { ...choice.grantContact.headline }
            : null,
          memory: choice.grantContact.memory && typeof choice.grantContact.memory === "object"
            ? { ...choice.grantContact.memory }
            : null,
        }
      : null,
  };
}

function cloneRomanceSceneSnapshot(scene = null) {
  if (!scene || typeof scene !== "object") {
    return null;
  }

  return {
    ...scene,
    tags: Array.isArray(scene.tags) ? scene.tags.map((tag) => String(tag || "").trim()).filter(Boolean) : [],
    introLines: Array.isArray(scene.introLines) ? scene.introLines.map((line) => String(line || "").trim()).filter(Boolean) : [],
    choices: Array.isArray(scene.choices)
      ? scene.choices.map((choice) => cloneRomanceSceneChoice(choice)).filter(Boolean)
      : [],
    backgroundConfig: scene.backgroundConfig && typeof scene.backgroundConfig === "object"
      ? { ...scene.backgroundConfig }
      : null,
    playerActor: scene.playerActor && typeof scene.playerActor === "object"
      ? { ...scene.playerActor }
      : null,
    npcActor: scene.npcActor && typeof scene.npcActor === "object"
      ? { ...scene.npcActor }
      : null,
  };
}

function cloneRomanceCallChoice(choice = null) {
  if (!choice || typeof choice !== "object") {
    return null;
  }

  return {
    ...choice,
    tags: Array.isArray(choice.tags)
      ? choice.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [],
    resultTags: Array.isArray(choice.resultTags)
      ? choice.resultTags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [],
    resultLines: Array.isArray(choice.resultLines)
      ? choice.resultLines.map((line) => String(line || "").trim()).filter(Boolean)
      : [],
    headline: choice.headline && typeof choice.headline === "object"
      ? { ...choice.headline }
      : null,
  };
}

function cloneRomanceCallSceneSnapshot(scene = null) {
  if (!scene || typeof scene !== "object") {
    return null;
  }

  return {
    ...scene,
    lines: Array.isArray(scene.lines)
      ? scene.lines.map((line) => String(line || "").trim()).filter(Boolean)
      : [],
    tags: Array.isArray(scene.tags)
      ? scene.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [],
    choices: Array.isArray(scene.choices)
      ? scene.choices.map((choice) => cloneRomanceCallChoice(choice)).filter(Boolean)
      : [],
  };
}

function createDefaultAmbientRomanceState() {
  return {
    seenEventIds: [],
    cooldownUntilDayByNpcId: {},
    followUpStateByNpcId: {},
    lastTriggerId: "",
    activeEventId: "",
  };
}

function syncAmbientRomanceState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return createDefaultAmbientRomanceState();
  }

  const defaults = createDefaultAmbientRomanceState();
  const currentState = targetState.ambientRomance && typeof targetState.ambientRomance === "object"
    ? targetState.ambientRomance
    : {};

  targetState.ambientRomance = {
    seenEventIds: Array.isArray(currentState.seenEventIds)
      ? currentState.seenEventIds.map((id) => String(id || "").trim()).filter(Boolean)
      : defaults.seenEventIds,
    cooldownUntilDayByNpcId: currentState.cooldownUntilDayByNpcId && typeof currentState.cooldownUntilDayByNpcId === "object"
      ? Object.fromEntries(
          Object.entries(currentState.cooldownUntilDayByNpcId).map(([npcId, day]) => [
            String(npcId || "").trim(),
            Math.max(0, Math.round(Number(day) || 0)),
          ]).filter(([npcId]) => Boolean(npcId))
        )
      : { ...defaults.cooldownUntilDayByNpcId },
    followUpStateByNpcId: currentState.followUpStateByNpcId && typeof currentState.followUpStateByNpcId === "object"
      ? Object.fromEntries(
          Object.entries(currentState.followUpStateByNpcId).map(([npcId, followUpState]) => [
            String(npcId || "").trim(),
            String(followUpState || "").trim(),
          ]).filter(([npcId]) => Boolean(npcId))
        )
      : { ...defaults.followUpStateByNpcId },
    lastTriggerId: String(currentState.lastTriggerId || "").trim(),
    activeEventId: String(currentState.activeEventId || "").trim(),
  };

  return targetState.ambientRomance;
}

function getAmbientRomanceFollowUpState(npcId = "", targetState = state) {
  const normalizedNpcId = String(npcId || "").trim();
  if (!normalizedNpcId) {
    return "";
  }

  return String(syncAmbientRomanceState(targetState).followUpStateByNpcId?.[normalizedNpcId] || "").trim();
}

function setAmbientRomanceFollowUpState(npcId = "", followUpState = "", targetState = state) {
  const normalizedNpcId = String(npcId || "").trim();
  if (!normalizedNpcId) {
    return "";
  }

  const normalizedFollowUpState = String(followUpState || "").trim();
  const ambientState = syncAmbientRomanceState(targetState);

  if (!normalizedFollowUpState) {
    delete ambientState.followUpStateByNpcId[normalizedNpcId];
    return "";
  }

  ambientState.followUpStateByNpcId[normalizedNpcId] = normalizedFollowUpState;
  return normalizedFollowUpState;
}

function createDefaultRomanceDomainState() {
  return {
    activePlan: null,
    activeScene: null,
    lastOutcome: null,
    callScene: null,
    callSession: null,
    girlfriendContactIds: [],
  };
}

const AMBIENT_ROMANCE_LIBRARY_CORRIDOR_BACKGROUND = Object.freeze({
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/library-corridor.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(8, 10, 16, 0.1) 0%, rgba(8, 10, 16, 0.28) 100%)",
});

const AMBIENT_ROMANCE_CAMPUS_PARK_BACKGROUND = Object.freeze({
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/campus-park.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(11, 18, 14, 0.08) 0%, rgba(11, 18, 14, 0.26) 100%)",
});

const AMBIENT_ROMANCE_MCDONALDS_COUNTER_BACKGROUND = Object.freeze({
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/commercial/mcdonalds-counter.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(15, 8, 8, 0.1) 0%, rgba(15, 8, 8, 0.3) 100%)",
});

const AMBIENT_ROMANCE_EVENTS = Object.freeze({
  "library-student-confession": Object.freeze({
    id: "library-student-confession",
    triggerId: "study-academic-prep",
    npcId: "girlfriend-student",
    contactId: "girlfriendStudent",
    locationId: "library",
    sceneType: "ambient-confession",
    oncePerContact: true,
    blockedAmbientFollowUpStates: ["soft-declined"],
    title: "복도로 나가려는 순간 여학생이 조심스럽게 앞을 막는다",
    speaker: "도서관 여학생",
    headlineBadge: "돌발 고백",
    headlineText: "도서관 복도에서 누군가 먼저 말을 걸어 왔다.",
    appearanceLevelMin: 2,
    chanceByAppearanceLevel: {
      2: 0.08,
      3: 0.18,
      4: 0.32,
    },
    gates: {
      timeBands: ["day", "evening"],
      blockedIfContactKnown: true,
      blockedIfDating: true,
    },
    tags: ["돌발", "고백", "도서관"],
    introLines: [
      "도서관에서 책을 덮고 나오려는 순간, 여학생 하나가 잠깐만 괜찮냐며 조심스럽게 말을 건다.",
      "\"잠깐 시간 괜찮으세요? 꼭 하고 싶은 말이 있어요.\"",
    ],
    backgroundConfig: AMBIENT_ROMANCE_LIBRARY_CORRIDOR_BACKGROUND,
    playerActor: {
      kind: "player",
      left: 28,
      bottom: 4,
      height: 86,
      zIndex: 2,
    },
    npcActor: {
      kind: "npc",
      left: 72,
      bottom: 5,
      height: 88,
      zIndex: 2,
    },
    choices: [
      Object.freeze({
        id: "accept-talk",
        label: "잠깐 이야기한다",
        resultTitle: "여학생은 떨리는 목소리로 오래 지켜봤다고 털어놓는다",
        resultLines: [
          "\"도서관에서 몇 번 마주쳤는데, 계속 생각나서요.\"",
          "짧은 고백 끝에 연락처를 조심스럽게 건네받고, 다음엔 복도 말고 밖에서 제대로 이야기하자는 약속까지 잡힌다.",
        ],
        resultTags: ["고백", "연락처"],
        ambientFollowUpState: "",
        contactPatch: {
          ambientOriginEventId: "library-student-confession",
          ambientCallSceneVariant: "library-first-call",
          ambientFollowUpStatus: "new-contact",
          note: "도서관 복도에서 고백을 받고 연락처를 교환했다.",
        },
        grantContact: {
          npcId: "girlfriend-student",
          source: "ambient-romance",
          relationshipStage: "contact",
          headline: {
            badge: "연락처 교환",
            text: "도서관 여학생과 연락처를 주고받았다.",
          },
          memory: {
            title: "도서관 복도에서 뜻밖의 고백을 받았다",
            body: "도서관 복도에서 말을 걸어온 여학생과 한참 이야기한 끝에 연락처를 주고받았다.",
          },
        },
        markSeen: true,
      }),
      Object.freeze({
        id: "soft-decline",
        label: "오늘은 공부가 먼저라고 말한다",
        resultTitle: "여학생은 아쉬운 표정으로 고개를 끄덕이고 먼저 물러난다",
        resultLines: [
          "\"아, 네. 공부하시는 중이었죠. 괜히 붙잡았네요.\"",
          "짧게 인사하고 지나가지만, 마지막 눈빛에는 다음에 다시 말을 걸 용기가 남아 있다.",
        ],
        resultTags: ["스쳐감", "다음 기회"],
        ambientFollowUpState: "soft-declined",
        headline: {
          badge: "돌발 이벤트",
          text: "도서관 복도에서 온 고백을 부드럽게 넘겼다.",
        },
        memory: {
          title: "도서관 복도에서 말을 걸려다 놓친 인연이 있었다",
          body: "오늘은 공부가 먼저라고 말하고 지나쳤지만, 낯선 여학생의 표정이 오래 남았다.",
        },
        cooldownDays: 2,
      }),
      Object.freeze({
        id: "ask-contact",
        label: "연락처부터 묻는다",
        resultTitle: "여학생은 놀라다가도 곧 웃으며 번호를 적어 준다",
        resultLines: [
          "\"바로요? ...그래도 좋아요. 다음엔 더 편하게 이야기해요.\"",
          "고백을 길게 듣지는 못했지만, 복도에서의 긴장감은 곧 다음 만남 약속으로 바뀐다.",
        ],
        resultTags: ["연락처", "빠른 진전"],
        ambientFollowUpState: "",
        contactPatch: {
          ambientOriginEventId: "library-student-confession",
          ambientCallSceneVariant: "library-first-call",
          ambientFollowUpStatus: "new-contact",
          note: "도서관 복도에서 먼저 연락처를 받아냈다.",
        },
        grantContact: {
          npcId: "girlfriend-student",
          source: "ambient-romance",
          relationshipStage: "contact",
          headline: {
            badge: "빠른 진전",
            text: "도서관 여학생이 먼저 연락처를 넘겨줬다.",
          },
          memory: {
            title: "도서관 복도에서 번호부터 받았다",
            body: "망설일 틈도 없이 연락처를 묻자, 여학생은 웃으며 다음에 더 길게 이야기하자고 했다.",
          },
        },
        markSeen: true,
      }),
    ],
  }),
  "library-student-reappearance": Object.freeze({
    id: "library-student-reappearance",
    triggerId: "study-academic-prep",
    npcId: "girlfriend-student",
    contactId: "girlfriendStudent",
    locationId: "library",
    sceneType: "ambient-confession",
    requiredAmbientFollowUpState: "soft-declined",
    title: "복도 끝에서 다시 마주친 여학생이 조심스럽게 웃는다",
    speaker: "도서관 여학생",
    headlineBadge: "복도 재등장",
    headlineText: "예전에 지나쳤던 여학생이 다시 말을 건다.",
    appearanceLevelMin: 2,
    chanceByAppearanceLevel: {
      2: 0.12,
      3: 0.24,
      4: 0.38,
    },
    gates: {
      timeBands: ["day", "evening"],
      blockedIfContactKnown: true,
      blockedIfDating: true,
    },
    tags: ["재등장", "도서관", "두 번째 기회"],
    introLines: [
      "복도 모퉁이를 돌아서는 순간, 전에 말을 걸었던 그 여학생이 멈칫하다가 먼저 웃어 보인다.",
      "\"그날은 정말 바빠 보였어요. 그래도 이번엔 잠깐 괜찮을까요?\"",
    ],
    backgroundConfig: AMBIENT_ROMANCE_LIBRARY_CORRIDOR_BACKGROUND,
    playerActor: {
      kind: "player",
      left: 28,
      bottom: 4,
      height: 86,
      zIndex: 2,
    },
    npcActor: {
      kind: "npc",
      left: 72,
      bottom: 5,
      height: 88,
      zIndex: 2,
    },
    choices: [
      Object.freeze({
        id: "accept-second-talk",
        label: "이번엔 멈춰서 이야기한다",
        resultTitle: "여학생은 다시 만난 걸 다행이라며 천천히 마음을 꺼낸다",
        resultLines: [
          "\"그날 그냥 지나치고도 계속 생각났어요. 이번엔 놓치고 싶지 않았어요.\"",
          "두 번째 만남은 처음보다 더 편안했고, 복도 끝에서 연락처를 교환한 뒤 다음 통화를 약속한다.",
        ],
        resultTags: ["재등장", "연락처"],
        ambientFollowUpState: "",
        contactPatch: {
          ambientOriginEventId: "library-student-reappearance",
          ambientCallSceneVariant: "library-first-call",
          ambientFollowUpStatus: "reappeared-contact",
          note: "도서관 복도에서 다시 말을 걸어온 여학생과 연락처를 교환했다.",
        },
        grantContact: {
          npcId: "girlfriend-student",
          source: "ambient-romance",
          relationshipStage: "contact",
          headline: {
            badge: "두 번째 기회",
            text: "도서관 여학생과 이번에는 연락처를 교환했다.",
          },
          memory: {
            title: "도서관 복도에서 다시 만난 인연을 붙잡았다",
            body: "예전에 지나쳤던 여학생이 다시 말을 걸어왔고, 이번에는 연락처를 교환했다.",
          },
        },
        markSeen: true,
      }),
      Object.freeze({
        id: "still-busy",
        label: "이번에도 짧게 사과하고 지나간다",
        resultTitle: "여학생은 서운한 기색을 감추고 다시 거리를 둔다",
        resultLines: [
          "\"괜찮아요. 언젠가 타이밍이 맞으면 그때 이야기해요.\"",
          "이번에도 스쳐 지나갔지만, 완전히 끝났다는 느낌보다는 잠시 미뤄 둔 인연에 가깝다.",
        ],
        resultTags: ["보류", "재등장"],
        ambientFollowUpState: "soft-declined",
        headline: {
          badge: "다시 보류",
          text: "도서관 여학생과의 대화를 또 다음으로 미뤘다.",
        },
        memory: {
          title: "도서관 복도에서 다시 만났지만 또 지나쳤다",
          body: "여학생은 아쉬워했지만, 언젠가 다시 보자는 말을 남기고 물러났다.",
        },
        cooldownDays: 3,
      }),
    ],
  }),
  "campus-park-bench-talk": Object.freeze({
    id: "campus-park-bench-talk",
    triggerId: "study-campus-network",
    npcId: "high-school-girl",
    contactId: "highSchoolGirl",
    locationId: "campus-park",
    sceneType: "ambient-campus-talk",
    oncePerContact: true,
    title: "캠퍼스 공원 벤치에서 학생이 먼저 인사를 건넨다",
    speaker: "골목 여고생",
    headlineBadge: "공원 조우",
    headlineText: "캠퍼스 공원에서 학생 하나가 먼저 웃어 보인다.",
    appearanceLevelMin: 2,
    chanceByAppearanceLevel: {
      2: 0.06,
      3: 0.16,
      4: 0.28,
    },
    gates: {
      timeBands: ["day", "evening"],
      blockedIfContactKnown: true,
      blockedIfDating: true,
    },
    tags: ["캠퍼스", "공원", "돌발"],
    introLines: [
      "캠퍼스 공원 벤치 쪽을 지나는데, 휴대폰을 내려다보던 학생이 먼저 눈을 맞추고 인사한다.",
      "\"아까부터 몇 번 스쳐 지나가서요. 그냥 지나치기엔 조금 아쉬웠어요.\"",
    ],
    backgroundConfig: AMBIENT_ROMANCE_CAMPUS_PARK_BACKGROUND,
    playerActor: {
      kind: "player",
      left: 26,
      bottom: 4,
      height: 86,
      zIndex: 2,
    },
    npcActor: {
      kind: "npc",
      left: 73,
      bottom: 5,
      height: 86,
      zIndex: 2,
    },
    choices: [
      Object.freeze({
        id: "sit-and-chat",
        label: "같이 벤치에 앉는다",
        resultTitle: "학생은 예상보다 편하게 웃으며 대화를 이어 간다",
        resultLines: [
          "\"캠퍼스 분위기 좋아 보여서 자주 와요. 오늘은 말 걸어보고 싶었어요.\"",
          "벤치에서 잠깐 이야기를 나누다 보니 번호를 주고받는 흐름이 자연스럽게 이어진다.",
        ],
        resultTags: ["벤치", "연락처"],
        contactPatch: {
          ambientOriginEventId: "campus-park-bench-talk",
          note: "캠퍼스 공원 벤치에서 짧은 대화 끝에 연락처를 교환했다.",
        },
        grantContact: {
          npcId: "high-school-girl",
          source: "ambient-romance",
          relationshipStage: "contact",
          headline: {
            badge: "공원 인연",
            text: "캠퍼스 공원에서 학생과 연락처를 교환했다.",
          },
          memory: {
            title: "캠퍼스 공원에서 연락처를 교환했다",
            body: "벤치에 잠깐 앉아 이야기를 나누다 학생과 연락처를 주고받았다.",
          },
        },
        markSeen: true,
      }),
      Object.freeze({
        id: "smile-and-pass",
        label: "웃어 주고 지나간다",
        resultTitle: "학생은 민망한 웃음을 남기고 다시 휴대폰을 내려다본다",
        resultLines: [
          "\"다음에 또 마주치면 그땐 조금 더 길게 이야기해요.\"",
          "짧은 눈인사만 남겼지만, 캠퍼스 공원에서 스쳐 지나간 인상은 오래 남는다.",
        ],
        resultTags: ["공원", "스침"],
        cooldownDays: 2,
        headline: {
          badge: "스쳐 지나감",
          text: "캠퍼스 공원에서 말을 걸어온 학생과 짧게 눈인사만 나눴다.",
        },
      }),
      Object.freeze({
        id: "ask-number-first",
        label: "연락처부터 묻는다",
        resultTitle: "학생은 웃음을 터뜨리며 휴대폰을 내민다",
        resultLines: [
          "\"바로요? ... 이런 전개도 나쁘지 않네요.\"",
          "가벼운 농담 섞인 분위기 속에서 연락처를 저장하고, 다음 통화를 기약한다.",
        ],
        resultTags: ["연락처", "빠른 전개"],
        contactPatch: {
          ambientOriginEventId: "campus-park-bench-talk",
          note: "캠퍼스 공원에서 먼저 번호를 물어 연락처를 교환했다.",
        },
        grantContact: {
          npcId: "high-school-girl",
          source: "ambient-romance",
          relationshipStage: "contact",
          headline: {
            badge: "빠른 전개",
            text: "캠퍼스 공원에서 학생의 연락처를 먼저 받아냈다.",
          },
          memory: {
            title: "캠퍼스 공원에서 번호를 먼저 물었다",
            body: "먼저 연락처를 묻자 학생이 웃으며 번호를 건넸다.",
          },
        },
        markSeen: true,
      }),
    ],
  }),
  "mcdonalds-counter-line-talk": Object.freeze({
    id: "mcdonalds-counter-line-talk",
    triggerId: "buy-mcdonalds-coffee",
    npcId: "npc-woman",
    contactId: "npcWoman",
    locationId: "mcdonalds-counter",
    sceneType: "ambient-coffee-talk",
    oncePerContact: true,
    title: "주문 줄 뒤에서 여자가 먼저 말을 건넨다",
    speaker: "길거리 여자",
    headlineBadge: "카운터 조우",
    headlineText: "맥도날드 카운터에서 낯선 여자가 먼저 미소를 보낸다.",
    appearanceLevelMin: 2,
    chanceByAppearanceLevel: {
      2: 0.05,
      3: 0.14,
      4: 0.26,
    },
    gates: {
      timeBands: ["day", "evening"],
      blockedIfContactKnown: true,
      blockedIfDating: true,
    },
    tags: ["맥도날드", "카운터", "돌발"],
    introLines: [
      "커피를 기다리며 옆으로 비켜서자, 뒤에 서 있던 여자가 의미심장한 눈빛으로 말을 건넨다.",
      "\"방금 주문하는 거 봤는데, 오늘은 그냥 지나치면 아쉬울 것 같았어요.\"",
    ],
    backgroundConfig: AMBIENT_ROMANCE_MCDONALDS_COUNTER_BACKGROUND,
    playerActor: {
      kind: "player",
      left: 28,
      bottom: 4,
      height: 86,
      zIndex: 2,
    },
    npcActor: {
      kind: "npc",
      left: 72,
      bottom: 5,
      height: 88,
      zIndex: 2,
    },
    choices: [
      Object.freeze({
        id: "share-coffee",
        label: "커피 얘기로 대화를 잇는다",
        resultTitle: "여자는 웃으면서 같은 메뉴를 자주 시킨다고 말한다",
        resultLines: [
          "\"이런 데서는 커피부터 보면 사람 성격이 좀 보이더라고요.\"",
          "줄이 조금씩 줄어드는 동안 대화를 이어가다 자연스럽게 번호를 주고받는다.",
        ],
        resultTags: ["커피", "연락처"],
        contactPatch: {
          ambientOriginEventId: "mcdonalds-counter-line-talk",
          note: "맥도날드 카운터에서 커피 얘기를 하다 연락처를 교환했다.",
        },
        grantContact: {
          npcId: "npc-woman",
          source: "ambient-romance",
          relationshipStage: "contact",
          headline: {
            badge: "카운터 인연",
            text: "맥도날드 카운터에서 연락처를 교환했다.",
          },
          memory: {
            title: "맥도날드 카운터에서 인연이 생겼다",
            body: "커피를 기다리던 동안 여자가 먼저 말을 걸어왔고, 짧은 대화 끝에 연락처를 교환했다.",
          },
        },
        markSeen: true,
      }),
      Object.freeze({
        id: "nod-and-smile",
        label: "웃고 넘긴다",
        resultTitle: "여자는 어깨를 가볍게 으쓱하고 먼저 주문대로 걸어간다",
        resultLines: [
          "\"그냥 인사 정도였어요. 다음에 또 마주치면 그땐 커피 한 잔쯤은 같이요.\"",
          "짧은 농담처럼 지나갔지만, 번화가 특유의 빠른 분위기 속에서도 인상은 남는다.",
        ],
        resultTags: ["번화가", "스침"],
        cooldownDays: 2,
        headline: {
          badge: "카운터 스침",
          text: "맥도날드 카운터에서 말을 걸어온 여자를 가볍게 넘겼다.",
        },
      }),
      Object.freeze({
        id: "ask-contact",
        label: "연락처부터 묻는다",
        resultTitle: "여자는 예상했다는 듯 휴대폰을 바로 꺼낸다",
        resultLines: [
          "\"좋아요. 이런 건 템포가 중요하니까요.\"",
          "빠른 분위기 그대로 연락처를 저장하고, 다음엔 카운터 말고 밖에서 보자는 말을 남긴다.",
        ],
        resultTags: ["연락처", "빠른 전개"],
        contactPatch: {
          ambientOriginEventId: "mcdonalds-counter-line-talk",
          note: "맥도날드 카운터에서 먼저 연락처를 물어 교환했다.",
        },
        grantContact: {
          npcId: "npc-woman",
          source: "ambient-romance",
          relationshipStage: "contact",
          headline: {
            badge: "빠른 템포",
            text: "맥도날드 카운터에서 곧바로 연락처를 교환했다.",
          },
          memory: {
            title: "맥도날드 카운터에서 번호를 먼저 물었다",
            body: "빠르게 연락처를 묻자, 여자가 망설임 없이 번호를 건넸다.",
          },
        },
        markSeen: true,
      }),
    ],
  }),
});

function getAmbientRomanceEventConfig(eventId = "") {
  return AMBIENT_ROMANCE_EVENTS[String(eventId || "").trim()] || null;
}

function getAmbientRomanceTriggerLocationId(context = {}, targetState = state) {
  const contextLocationId = String(context?.locationId || "").trim();
  if (contextLocationId) {
    return contextLocationId;
  }

  return typeof getCurrentLocationId === "function"
    ? String(getCurrentLocationId(targetState) || "").trim()
    : "";
}

function getAmbientRomanceChanceForEvent(event = null, targetState = state) {
  if (!event) {
    return 0;
  }

  const appearanceLevel = typeof getPlayerAppearanceLevel === "function"
    ? getPlayerAppearanceLevel(targetState)
    : 1;
  const chanceTable = event.chanceByAppearanceLevel && typeof event.chanceByAppearanceLevel === "object"
    ? event.chanceByAppearanceLevel
    : null;

  if (chanceTable) {
    const directChance = Number(chanceTable[appearanceLevel]);
    if (Number.isFinite(directChance) && directChance > 0) {
      return Math.min(1, directChance);
    }
  }

  return appearanceLevel >= Number(event.appearanceLevelMin || 99) ? 0.08 : 0;
}

function isAmbientRomanceEventEligible(event = null, triggerId = "", context = {}, targetState = state) {
  if (!event || String(event.triggerId || "").trim() !== String(triggerId || "").trim()) {
    return false;
  }

  if (!targetState || targetState.scene !== "outside" || targetState.currentIncident || targetState.jobMiniGame) {
    return false;
  }

  const appearanceLevel = typeof getPlayerAppearanceLevel === "function"
    ? getPlayerAppearanceLevel(targetState)
    : 1;
  if (appearanceLevel < Math.max(1, Math.round(Number(event.appearanceLevelMin) || 1))) {
    return false;
  }

  const ambientState = syncAmbientRomanceState(targetState);
  const locationId = getAmbientRomanceTriggerLocationId(context, targetState);
  const timeBand = typeof getWorldTimeBand === "function"
    ? getWorldTimeBand(targetState)
    : "day";
  const followUpState = getAmbientRomanceFollowUpState(event.npcId, targetState);
  const contact = typeof getRomanceConfigByContactId === "function"
    ? (targetState?.social?.contacts?.[event.contactId] || null)
    : null;
  const relationshipStage = String(contact?.relationshipStage || "").trim().toLowerCase();

  if (event.locationId && locationId !== event.locationId) {
    return false;
  }
  if (Array.isArray(event.gates?.timeBands) && event.gates.timeBands.length && !event.gates.timeBands.includes(timeBand)) {
    return false;
  }
  if (event.gates?.blockedIfContactKnown && hasRomanceContact(event.npcId, targetState)) {
    return false;
  }
  if (event.gates?.blockedIfDating && ["dating", "serious"].includes(relationshipStage)) {
    return false;
  }
  if (event.requiredAmbientFollowUpState && followUpState !== String(event.requiredAmbientFollowUpState || "").trim()) {
    return false;
  }
  if (Array.isArray(event.blockedAmbientFollowUpStates) && event.blockedAmbientFollowUpStates.includes(followUpState)) {
    return false;
  }
  if ((ambientState.cooldownUntilDayByNpcId[event.npcId] || 0) >= Math.max(1, Math.round(Number(targetState?.day) || 1))) {
    return false;
  }
  if (ambientState.activeEventId) {
    return false;
  }
  if (event.oncePerContact && ambientState.seenEventIds.includes(event.id) && hasRomanceContact(event.npcId, targetState)) {
    return false;
  }

  return getAmbientRomanceChanceForEvent(event, targetState) > 0;
}

function buildAmbientRomanceScene(event = null, triggerId = "", context = {}, targetState = state) {
  if (!event) {
    return null;
  }

  const npcConfig = typeof getNpcConfig === "function"
    ? getNpcConfig(event.npcId)
    : null;
  const locationId = getAmbientRomanceTriggerLocationId(context, targetState);
  const locationLabel = context?.locationLabel
    || (typeof getWorldLocationConfig === "function"
      ? getWorldLocationConfig(locationId, targetState?.day)?.label || ""
      : "")
    || (typeof getCurrentLocationLabel === "function"
      ? getCurrentLocationLabel(targetState)
      : "");

  return {
    sceneType: String(event.sceneType || "ambient-event").trim() || "ambient-event",
    eventId: event.id,
    sourceTriggerId: String(triggerId || event.triggerId || "").trim(),
    contactId: String(event.contactId || "").trim(),
    npcId: String(event.npcId || "").trim(),
    label: String(event.speaker || npcConfig?.name || event.contactId || "상대").trim(),
    speaker: String(event.speaker || npcConfig?.name || event.contactId || "상대").trim(),
    title: String(event.title || "").trim(),
    tags: Array.isArray(event.tags) ? [...event.tags] : ["로맨스", "돌발"],
    introLines: Array.isArray(event.introLines) ? [...event.introLines] : [],
    backgroundConfig: event.backgroundConfig && typeof event.backgroundConfig === "object"
      ? { ...event.backgroundConfig }
      : null,
    plannedCost: 0,
    venueLabel: locationLabel,
    returnScene: "outside",
    returnLocationId: locationId,
    choices: Array.isArray(event.choices)
      ? event.choices.map((choice) => cloneRomanceSceneChoice(choice)).filter(Boolean)
      : [],
    playerActor: {
      src: CHARACTER_ART?.player?.standing || "",
      alt: "player-romance",
      ...(event.playerActor || {}),
    },
    npcActor: {
      src: npcConfig?.art || "",
      alt: event.npcId || "ambient-romance-npc",
      ...(event.npcActor || {}),
    },
  };
}

function tryStartAmbientRomanceEvent(triggerId = "", context = {}, targetState = state) {
  const normalizedTriggerId = String(triggerId || "").trim();
  if (!normalizedTriggerId) {
    return false;
  }

  const registry = Object.values(AMBIENT_ROMANCE_EVENTS);
  const ambientState = syncAmbientRomanceState(targetState);
  ambientState.lastTriggerId = normalizedTriggerId;

  const eligibleEvents = registry.filter((event) =>
    isAmbientRomanceEventEligible(event, normalizedTriggerId, context, targetState)
  );
  if (!eligibleEvents.length) {
    return false;
  }

  const selectedEvent = eligibleEvents.find((event) => Math.random() <= getAmbientRomanceChanceForEvent(event, targetState));
  if (!selectedEvent) {
    return false;
  }

  const nextScene = buildAmbientRomanceScene(selectedEvent, normalizedTriggerId, context, targetState);
  if (!nextScene) {
    return false;
  }

  setRomanceActiveSceneSnapshot(nextScene, targetState);
  ambientState.activeEventId = selectedEvent.id;
  targetState.scene = "romance";
  targetState.headline = {
    badge: String(selectedEvent.headlineBadge || "돌발 이벤트").trim(),
    text: String(selectedEvent.headlineText || selectedEvent.title || "").trim(),
  };
  return true;
}

function applyAmbientRomanceChoice(choice = null, scene = null, targetState = state) {
  if (!choice || !scene) {
    return false;
  }

  const ambientState = syncAmbientRomanceState(targetState);
  const cooldownDays = Math.max(0, Math.round(Number(choice.cooldownDays) || 0));
  if (cooldownDays > 0) {
    ambientState.cooldownUntilDayByNpcId[scene.npcId] = Math.max(1, Math.round(Number(targetState?.day) || 1)) + cooldownDays;
  }

  if (choice.grantContact && typeof grantRomanceContact === "function") {
    grantRomanceContact(choice.grantContact.npcId || scene.npcId, targetState, {
      source: choice.grantContact.source || scene.sourceTriggerId || "ambient-romance",
      locationId: scene.returnLocationId || "",
      headline: choice.grantContact.headline || null,
      memory: choice.grantContact.memory || null,
      relationshipStage: choice.grantContact.relationshipStage || "contact",
    });
    if (choice.contactPatch && typeof patchSocialContact === "function" && scene.contactId) {
      patchSocialContact(scene.contactId, choice.contactPatch, targetState);
    }
  } else {
    if (choice.headline && typeof choice.headline === "object") {
      targetState.headline = {
        badge: String(choice.headline.badge || "").trim(),
        text: String(choice.headline.text || "").trim(),
      };
    }
    if (choice.memory && typeof recordActionMemory === "function") {
      recordActionMemory(choice.memory.title, choice.memory.body, {
        type: "npc",
        source: scene.venueLabel || scene.label || "로맨스",
        tags: ["로맨스", "돌발", ...(choice.resultTags || [])],
      });
    }
  }

  if (Object.prototype.hasOwnProperty.call(choice, "ambientFollowUpState")) {
    setAmbientRomanceFollowUpState(scene.npcId, choice.ambientFollowUpState, targetState);
  }

  if (choice.markSeen) {
    const nextSeenEventIds = new Set(ambientState.seenEventIds);
    nextSeenEventIds.add(String(scene.eventId || "").trim());
    ambientState.seenEventIds = [...nextSeenEventIds];
  }

  setRomanceActiveSceneSnapshot({
    ...scene,
    title: String(choice.resultTitle || scene.title || "").trim(),
    introLines: Array.isArray(choice.resultLines) && choice.resultLines.length
      ? [...choice.resultLines]
      : [...(scene.introLines || [])],
    tags: Array.isArray(choice.resultTags) && choice.resultTags.length
      ? [...choice.resultTags]
      : [...(scene.tags || [])],
    choices: [],
    resolvedChoiceId: String(choice.id || "").trim(),
    sceneOutcomeType: choice.grantContact ? "contact-unlocked" : "ambient-finished",
  }, targetState);

  return true;
}

function chooseAmbientRomanceChoice(index = 0, targetState = state) {
  const scene = syncRomanceSceneState(targetState);
  const choices = Array.isArray(scene?.choices) ? scene.choices : [];
  const choice = choices[index];
  if (!scene || !choice) {
    return false;
  }

  return applyAmbientRomanceChoice(choice, scene, targetState);
}

function completeAmbientRomanceScene(targetState = state) {
  const scene = syncRomanceSceneState(targetState);
  if (!scene || !String(scene.eventId || "").trim()) {
    return false;
  }

  const returnScene = String(scene.returnScene || "outside").trim() || "outside";
  const returnLocationId = String(scene.returnLocationId || "").trim();
  clearRomanceActiveSceneSnapshot(targetState);
  syncAmbientRomanceState(targetState).activeEventId = "";
  targetState.scene = returnScene;

  if (returnScene === "outside" && typeof syncWorldState === "function") {
    const worldState = syncWorldState(targetState);
    if (returnLocationId) {
      worldState.currentLocation = returnLocationId;
      if (typeof getWorldLocationDistrictId === "function") {
        worldState.currentDistrict = getWorldLocationDistrictId(returnLocationId, targetState?.day || getCurrentDayNumber()) || worldState.currentDistrict;
      }
    }
  }

  return true;
}

function getRomanceGirlfriendLimit() {
  return 3;
}

function getRomanceGirlfriendContacts(targetState = state) {
  const contacts = targetState?.social?.contacts || {};
  return Object.values(contacts)
    .filter((contact) => (
      contact?.kind === "romance"
      && (
        contact?.isGirlfriend
        || String(contact?.relationshipStage || "").trim().toLowerCase() === "serious"
      )
    ))
    .sort((left, right) => {
      const leftDay = Number(left?.girlfriendSinceDay) || 0;
      const rightDay = Number(right?.girlfriendSinceDay) || 0;
      if (leftDay !== rightDay) {
        return rightDay - leftDay;
      }
      return String(left?.label || "").localeCompare(String(right?.label || ""), "ko");
    });
}

function getRomanceGirlfriendCount(targetState = state) {
  return getRomanceGirlfriendContacts(targetState).length;
}

function canAddNewGirlfriend(contactId = "", targetState = state) {
  const normalizedContactId = String(contactId || "").trim();
  if (!normalizedContactId) {
    return false;
  }
  const contact = targetState?.social?.contacts?.[normalizedContactId] || null;
  if (contact?.isGirlfriend) {
    return true;
  }
  return getRomanceGirlfriendCount(targetState) < getRomanceGirlfriendLimit();
}

function syncRomanceGirlfriendRoster(targetState = state) {
  const romanceState = syncRomanceDomainState(targetState);
  romanceState.girlfriendContactIds = getRomanceGirlfriendContacts(targetState)
    .map((contact) => String(contact.contactId || contact.id || "").trim())
    .filter(Boolean)
    .slice(0, getRomanceGirlfriendLimit());
  return romanceState.girlfriendContactIds;
}

function markRomanceContactAsGirlfriend(contactId = "", targetState = state) {
  const normalizedContactId = String(contactId || "").trim();
  if (!normalizedContactId || !canAddNewGirlfriend(normalizedContactId, targetState)) {
    return false;
  }
  if (typeof patchSocialContact === "function") {
    patchSocialContact(normalizedContactId, {
      isGirlfriend: true,
      girlfriendSinceDay: Math.max(1, Math.round(Number(targetState?.day) || 1)),
    }, targetState);
  } else if (targetState?.social?.contacts?.[normalizedContactId]) {
    targetState.social.contacts[normalizedContactId].isGirlfriend = true;
    targetState.social.contacts[normalizedContactId].girlfriendSinceDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  }
  syncRomanceGirlfriendRoster(targetState);
  return true;
}

function clearRomanceCallScene(targetState = state) {
  const romanceState = syncRomanceDomainState(targetState);
  romanceState.callScene = null;
  return romanceState.callScene;
}

function setRomanceCallScene(scene = null, targetState = state) {
  const romanceState = syncRomanceDomainState(targetState);
  romanceState.callScene = cloneRomanceCallSceneSnapshot(scene);
  return romanceState.callScene;
}

function getRomanceCallScene(targetState = state) {
  return syncRomanceDomainState(targetState).callScene;
}

function clearRomanceCallSession(targetState = state) {
  const romanceState = syncRomanceDomainState(targetState);
  romanceState.callSession = null;
  return romanceState.callSession;
}

function setRomanceCallSession(session = null, targetState = state) {
  const romanceState = syncRomanceDomainState(targetState);
  romanceState.callSession = typeof cloneRomanceCallSessionSnapshot === "function"
    ? cloneRomanceCallSessionSnapshot(session)
    : (session && typeof session === "object" ? { ...session } : null);
  return romanceState.callSession;
}

function getRomanceCallSession(targetState = state) {
  return syncRomanceDomainState(targetState).callSession;
}

function normalizeRomancePlanSnapshot(plan = null) {
  if (!plan || typeof plan !== "object") {
    return null;
  }

  const sceneType = String(plan.sceneType || "").trim().toLowerCase();
  const contactId = String(plan.contactId || "").trim();
  if (!["date", "home-invite"].includes(sceneType) || !contactId) {
    return null;
  }

  const scheduledDay = Math.max(1, Math.round(Number(plan.scheduledDay) || 1));
  return {
    id: String(plan.id || `${sceneType}:${contactId}:${scheduledDay}`).trim(),
    contactId,
    npcId: String(plan.npcId || "").trim(),
    label: String(plan.label || "").trim(),
    sceneType,
    status: String(plan.status || "scheduled").trim().toLowerCase() === "active" ? "active" : "scheduled",
    scheduledDay,
    locationId: String(plan.locationId || "").trim(),
    venueLabel: String(plan.venueLabel || "").trim(),
    plannedCost: Math.max(0, Math.round(Number(plan.plannedCost) || 0)),
  };
}

function getLegacyRomancePlanSnapshot(targetState = state) {
  const contacts = targetState?.social?.contacts || {};
  const currentDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const candidates = Object.values(contacts)
    .filter((contact) => contact?.kind === "romance" && contact?.phoneUnlocked)
    .flatMap((contact) => {
      const config = getRomanceConfigByContactId(contact.contactId || contact.id || "");
      if (!config) {
        return [];
      }

      const nextPlans = [];
      if (contact.pendingHomeInviteStatus === "scheduled" && Number(contact.pendingHomeInviteDay) >= currentDay) {
        nextPlans.push({
          contactId: contact.contactId || contact.id || "",
          npcId: config.npcId,
          label: config.label,
          sceneType: "home-invite",
          status: "scheduled",
          scheduledDay: Math.max(currentDay, Number(contact.pendingHomeInviteDay) || currentDay),
          venueLabel: typeof getInventoryResidenceLabel === "function" ? getInventoryResidenceLabel(targetState) : "",
          plannedCost: Math.max(0, Number(config.homeInviteCost) || 0),
        });
      }
      if (contact.pendingDateStatus === "scheduled" && Number(contact.pendingDateDay) >= currentDay) {
        nextPlans.push({
          contactId: contact.contactId || contact.id || "",
          npcId: config.npcId,
          label: config.label,
          sceneType: "date",
          status: "scheduled",
          scheduledDay: Math.max(currentDay, Number(contact.pendingDateDay) || currentDay),
          locationId: String(contact.pendingDateLocationId || config.dateLocationId || "").trim(),
          venueLabel: String(config.dateVenueLabel || "").trim(),
          plannedCost: Math.max(0, Number(config.dateCost) || 0),
        });
      }
      return nextPlans;
    })
    .sort((left, right) => {
      if (left.scheduledDay !== right.scheduledDay) {
        return left.scheduledDay - right.scheduledDay;
      }
      if (left.sceneType !== right.sceneType) {
        return left.sceneType === "home-invite" ? -1 : 1;
      }
      return String(left.contactId || "").localeCompare(String(right.contactId || ""), "ko");
    });

  return candidates.length ? normalizeRomancePlanSnapshot(candidates[0]) : null;
}

function syncRomanceDomainState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return createDefaultRomanceDomainState();
  }

  const romanceState = targetState.romance && typeof targetState.romance === "object"
    ? targetState.romance
    : createDefaultRomanceDomainState();

  romanceState.activePlan = normalizeRomancePlanSnapshot(romanceState.activePlan) || getLegacyRomancePlanSnapshot(targetState);
  romanceState.activeScene = cloneRomanceSceneSnapshot(targetState.romanceScene);
  romanceState.lastOutcome = romanceState.lastOutcome && typeof romanceState.lastOutcome === "object"
    ? { ...romanceState.lastOutcome }
    : null;
  romanceState.callScene = cloneRomanceCallSceneSnapshot(romanceState.callScene);
  romanceState.callSession = typeof cloneRomanceCallSessionSnapshot === "function"
    ? cloneRomanceCallSessionSnapshot(romanceState.callSession)
    : (romanceState.callSession && typeof romanceState.callSession === "object" ? { ...romanceState.callSession } : null);
  romanceState.girlfriendContactIds = Array.isArray(romanceState.girlfriendContactIds)
    ? romanceState.girlfriendContactIds.map((id) => String(id || "").trim()).filter(Boolean).slice(0, getRomanceGirlfriendLimit())
    : [];
  targetState.romance = romanceState;
  const syncedRoster = getRomanceGirlfriendContacts(targetState)
    .map((contact) => String(contact.contactId || contact.id || "").trim())
    .filter(Boolean)
    .slice(0, getRomanceGirlfriendLimit());
  if (syncedRoster.length || romanceState.girlfriendContactIds.length) {
    romanceState.girlfriendContactIds = syncedRoster;
  }
  return romanceState;
}

function getRomanceActivePlanSnapshot(targetState = state) {
  return syncRomanceDomainState(targetState).activePlan;
}

function setRomanceActivePlanSnapshot(plan = null, targetState = state) {
  const romanceState = syncRomanceDomainState(targetState);
  romanceState.activePlan = normalizeRomancePlanSnapshot(plan);
  return romanceState.activePlan;
}

function clearRomanceActivePlanSnapshot(targetState = state) {
  return setRomanceActivePlanSnapshot(null, targetState);
}

function getRomanceActiveSceneSnapshot(targetState = state) {
  return syncRomanceDomainState(targetState).activeScene;
}

function setRomanceActiveSceneSnapshot(scene = null, targetState = state) {
  targetState.romanceScene = cloneRomanceSceneSnapshot(scene);
  syncRomanceDomainState(targetState).activeScene = targetState.romanceScene
    ? cloneRomanceSceneSnapshot(targetState.romanceScene)
    : null;
  return targetState.romanceScene;
}

function clearRomanceActiveSceneSnapshot(targetState = state) {
  return setRomanceActiveSceneSnapshot(null, targetState);
}

function recordRomanceDomainOutcome(result = null, targetState = state) {
  const romanceState = syncRomanceDomainState(targetState);
  romanceState.lastOutcome = result && typeof result === "object"
    ? {
        ...result,
        day: Math.max(1, Math.round(Number(result.day) || Number(targetState?.day) || 1)),
      }
    : null;
  return romanceState.lastOutcome;
}

function applyRomanceActionResult(result = null, targetState = state) {
  if (!result || typeof result !== "object") {
    return result;
  }

  if (result.turnEvent && typeof queueNextTurnEvent === "function") {
    queueNextTurnEvent(result.turnEvent, targetState, {
      dayOffset: Math.max(0, Math.round(Number(result.turnEventDayOffset) || 0)),
    });
  }

  if (result.phoneStatus && typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("call", result.phoneStatus, targetState);
  }

  if (result.phonePreview && typeof createPhoneResultPreview === "function") {
    targetState.phonePreview = createPhoneResultPreview(
      "call",
      result.phonePreview.kicker || "CALL",
      result.phonePreview.title || "",
      result.phonePreview.body || "",
    );
  }

  if (result.headline) {
    targetState.headline = {
      badge: String(result.headline.badge || "").trim(),
      text: String(result.headline.text || "").trim(),
    };
  }

  if (result.feedback && typeof queueGameplayFeedback === "function") {
    queueGameplayFeedback(result.feedback, targetState);
  }

  if (result.finishPhoneTime && typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend(result.finishPhoneTime);
  }

  if (result.outcome) {
    recordRomanceDomainOutcome(result.outcome, targetState);
  }

  return result;
}

function applyRomanceSuccessHappinessGain(amount = 0, targetState = state) {
  const normalizedAmount = Math.max(1, Math.round(Number(amount) || 0));
  if (typeof adjustHappiness === "function") {
    adjustHappiness(normalizedAmount, targetState);
    return;
  }

  if (!targetState || typeof targetState !== "object") {
    return;
  }

  if (!targetState.happiness || typeof targetState.happiness !== "object") {
    targetState.happiness = {};
  }
  const currentValue = Math.max(0, Math.round(Number(targetState.happiness.value) || 0));
  const maxValue = typeof HAPPINESS_MAX === "number" ? HAPPINESS_MAX : 100;
  targetState.happiness.value = Math.min(maxValue, currentValue + normalizedAmount);
  targetState.happiness.status = targetState.happiness.value >= 70 ? "steady" : "low";
  targetState.happiness.lastModifiedDay = Math.max(1, Math.round(Number(targetState.day) || 1));
}

function getRomanceChanceForLevel({
  npcId = "",
  source = "dialogue",
  targetState = state,
} = {}) {
  const config = getRomanceNpcConfig(npcId);
  if (!config) {
    return 0;
  }

  const level = typeof getPlayerAppearanceLevel === "function"
    ? getPlayerAppearanceLevel(targetState)
    : 1;
  const table = source === "street"
    ? config.streetChanceByLevel
    : config.dialogueChanceByLevel;

  return Math.max(0, Math.min(1, Number(table?.[level]) || 0));
}

function grantRomanceContact(
  npcId = "",
  targetState = state,
  {
    source = "dialogue",
    locationId = "",
    headline = null,
    memory = null,
    relationshipStage = "interest",
  } = {},
) {
  const config = getRomanceNpcConfig(npcId);
  if (!config || !targetState) {
    return null;
  }

  if (typeof ensureMetaRunStateReady === "function") {
    ensureMetaRunStateReady(targetState);
  }

  const relation = typeof getNpcRelation === "function"
    ? getNpcRelation(npcId, targetState)
    : null;
  const current = targetState.social?.contacts?.[config.contactId] || {};
  const levelLabel = typeof getPlayerAppearanceLevelLabel === "function"
    ? getPlayerAppearanceLevelLabel(targetState)
    : "";
  const locationLabel = locationId && typeof getWorldLocationConfig === "function"
    ? getWorldLocationConfig(locationId, targetState?.day)?.label || ""
    : (typeof getCurrentLocationLabel === "function" ? getCurrentLocationLabel() : "");
  const nextContact = typeof patchSocialContact === "function"
    ? patchSocialContact(config.contactId, {
        id: config.contactId,
        npcId,
        label: config.label,
        shortLabel: config.shortLabel,
        kind: "romance",
        phoneUnlocked: true,
        met: true,
        relationshipStage: current.relationshipStage || relationshipStage,
        unlockedDay: current.unlockedDay || targetState.day,
        lastSeenDay: targetState.day,
        locationId: locationId || current.locationId || "",
        source: source || current.source || "dialogue",
        note: config.introNote,
        affinity: Number.isFinite(relation?.affinity) ? relation.affinity : (Number(current.affinity) || 0),
        attraction: Number.isFinite(relation?.attraction) ? relation.attraction : (Number(current.attraction) || 0),
      }, targetState)
    : null;

  if (typeof addUnlockEntry === "function") {
    addUnlockEntry("npcs", npcId, targetState);
  }

  if (typeof patchNpcRelation === "function") {
    patchNpcRelation(npcId, {
      met: true,
      flags: {
        phoneUnlocked: true,
        romanceUnlocked: true,
      },
    }, targetState);
  }

  if (headline) {
    targetState.headline = {
      badge: headline.badge || "연락처 획득",
      text: headline.text || `${config.label}의 번호를 저장했다.`,
    };
  } else {
    targetState.headline = {
      badge: "연락처 획득",
      text: `${config.label}의 번호가 휴대폰에 저장됐다.`,
    };
  }

  if (typeof queueGameplayFeedback === "function") {
    queueGameplayFeedback({
      title: "연락처 획득",
      tone: "up",
      chips: [
        { label: `${config.label} 번호 저장`, tone: "up" },
        levelLabel ? { label: `외모 ${levelLabel}`, tone: "info" } : null,
        locationLabel ? { label: `${locationLabel} 인연`, tone: "info" } : null,
      ].filter(Boolean),
    }, targetState);
  }

  if (memory && typeof recordActionMemory === "function") {
    recordActionMemory(memory.title, memory.body, {
      type: "npc",
      source: locationLabel || config.sourceLabel,
      tags: ["연락처", "인연", config.shortLabel],
    });
  }

  return nextContact;
}

function unlockRomanceContactFromEffect(effect = {}, targetState = state, context = {}) {
  const resolvedNpcId = String(effect?.npcId || context?.npcId || "").trim();
  if (!resolvedNpcId || hasRomanceContact(resolvedNpcId, targetState)) {
    return null;
  }

  return grantRomanceContact(resolvedNpcId, targetState, {
    source: effect?.source || context?.source || "dialogue",
    locationId: effect?.locationId || context?.locationId || "",
    headline: effect?.headline || null,
    memory: effect?.memory || null,
    relationshipStage: effect?.relationshipStage || "interest",
  });
}

function tryUnlockRomanceContactFromDialogue(
  npcId = "",
  targetState = state,
  {
    source = "dialogue",
    locationId = "",
  } = {},
) {
  if (!isRomanceNpc(npcId) || hasRomanceContact(npcId, targetState)) {
    return null;
  }

  const chance = getRomanceChanceForLevel({
    npcId,
    source: "dialogue",
    targetState,
  });
  if (chance <= 0 || Math.random() > chance) {
    return null;
  }

  const config = getRomanceNpcConfig(npcId);
  return grantRomanceContact(npcId, targetState, {
    source,
    locationId,
    headline: {
      badge: "번호 교환",
      text: `${config.label}와 연락처를 주고받았다.`,
    },
    memory: {
      title: `${config.label}의 번호를 받았다`,
      body: `${config.sourceLabel}에서 말을 섞은 끝에 ${config.label}가 번호를 남겨줬다.`,
    },
  });
}

function tryAutoStreetRomanceLead(
  npcId = "",
  targetState = state,
  {
    locationId = "",
    locationLabel = "",
  } = {},
) {
  if (!isRomanceNpc(npcId) || hasRomanceContact(npcId, targetState)) {
    return null;
  }

  const chance = getRomanceChanceForLevel({
    npcId,
    source: "street",
    targetState,
  });
  if (chance <= 0 || Math.random() > chance) {
    return null;
  }

  const config = getRomanceNpcConfig(npcId);
  const resolvedLocationLabel = locationLabel
    || (locationId && typeof getWorldLocationConfig === "function"
      ? getWorldLocationConfig(locationId, targetState?.day)?.label || ""
      : "");

  grantRomanceContact(npcId, targetState, {
    source: "street",
    locationId,
    headline: {
      badge: "길거리 번호",
      text: `${config.label}가 먼저 다가와 번호를 물어봤다.`,
    },
    memory: {
      title: `${config.label}가 먼저 번호를 물어봤다`,
      body: `${resolvedLocationLabel || config.sourceLabel}에서 스쳐 지나가던 ${config.label}가 먼저 말을 걸어왔다.`,
    },
  });

  return {
    sceneTitle: `${config.label} 쪽에서 먼저 발걸음이 멈춘다`,
    sceneLines: [
      `"잠깐, 번호 줄 수 있어요?" ${config.label}가 먼저 말을 걸어온다.`,
      `${resolvedLocationLabel || config.sourceLabel} 공기 속에서 짧은 번호 교환이 이상하리만큼 자연스럽게 끝난다.`,
    ],
    headlineBadge: "길거리 번호",
    headlineText: `${config.label} 쪽에서 먼저 번호를 물어봤다.`,
    memoryBody: `${resolvedLocationLabel || config.sourceLabel}에서 ${config.label}에게 먼저 번호를 따였다.`,
    tag: "번호 교환",
  };
}

function getRomancePhoneContacts(targetState = state) {
  const contacts = targetState?.social?.contacts || {};
  return Object.values(contacts)
    .filter((contact) => contact?.kind === "romance" && contact?.phoneUnlocked)
    .map((contact) => {
      const config = getRomanceConfigByContactId(contact.contactId || contact.id || "");
      const isGirlfriend = Boolean(contact.isGirlfriend) || String(contact.relationshipStage || "").trim().toLowerCase() === "serious";
      return {
        ...contact,
        isGirlfriend,
        rosterLabel: isGirlfriend ? "여자친구" : "연락처",
        stageLabel: isGirlfriend ? "여자친구" : getRomanceRelationshipStageLabel(contact.relationshipStage),
        note: getRomancePlanStatusSummary(contact, config, targetState),
      };
    })
    .sort((left, right) => {
      const leftGirlfriend = left?.isGirlfriend ? 1 : 0;
      const rightGirlfriend = right?.isGirlfriend ? 1 : 0;
      if (leftGirlfriend !== rightGirlfriend) {
        return rightGirlfriend - leftGirlfriend;
      }
      const leftDay = Number(left?.unlockedDay) || 0;
      const rightDay = Number(right?.unlockedDay) || 0;
      if (leftDay !== rightDay) {
        return rightDay - leftDay;
      }
      return String(left?.label || "").localeCompare(String(right?.label || ""), "ko");
    });
}

function buildRomanceGirlfriendCallScene(contactId = "", targetState = state) {
  const contact = targetState?.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  const isGirlfriend = Boolean(contact?.isGirlfriend)
    || String(contact?.relationshipStage || "").trim().toLowerCase() === "serious";
  if (!contact || !config || !isGirlfriend) {
    return null;
  }

  if (typeof buildRomanceGirlfriendSmallTalkCallScene === "function") {
    const sessionBackedScene = buildRomanceGirlfriendSmallTalkCallScene({
      contactId,
      contact,
      config,
      targetState,
    });
    if (sessionBackedScene) {
      return sessionBackedScene;
    }
  }

  const dialoguePool = Array.isArray(ROMANCE_GIRLFRIEND_CALL_LINES[config.npcId])
    ? ROMANCE_GIRLFRIEND_CALL_LINES[config.npcId]
    : [];
  const leadLine = dialoguePool.length
    ? (typeof sample === "function" ? sample(dialoguePool) : dialoguePool[0])
    : `${config.label}와 짧은 통화를 하며 오늘 있었던 일을 나눴다.`;
  const relationshipLine = String(contact.relationshipStage || "").trim().toLowerCase() === "serious"
    ? `${config.label}는 통화 끝에 "오늘도 네 편이야"라고 낮게 덧붙였다.`
    : `${config.label}는 다음에 보자는 말을 남기고 조용히 전화를 마무리했다.`;
  return {
    contactId,
    npcId: config.npcId,
    label: config.label,
    title: `${config.label}와 통화`,
    lines: [
      leadLine,
      relationshipLine,
    ],
    tags: ["통화", "여자친구"],
    previousScene: String(targetState?.scene || "").trim() || "room",
    headline: `${config.label}와 짧은 통화를 나눴다.`,
  };
}

function buildAmbientRomanceFollowUpCallScene(contactId = "", targetState = state) {
  const contact = targetState?.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  if (!contact || !config || !contact.phoneUnlocked) {
    return null;
  }

  const callVariant = String(contact.ambientCallSceneVariant || "").trim();
  if (callVariant !== "library-first-call") {
    return null;
  }

  const followUpStatus = String(contact.ambientFollowUpStatus || "").trim();
  if (!["new-contact", "reappeared-contact", "paced", "called-once"].includes(followUpStatus)) {
    return null;
  }

  const canSetDate = typeof canScheduleRomanceDate === "function"
    ? canScheduleRomanceDate(contactId, targetState)
    : false;
  const leadLine = followUpStatus === "reappeared-contact"
    ? "복도에서 다시 마주친 뒤라 그런지, 여학생의 목소리는 처음보다 조금 더 편안하다."
    : "복도에서 번호를 주고받은 직후라 그런지, 조심스러운 숨소리가 전화기 너머로 또렷하게 들린다.";
  const secondLine = followUpStatus === "paced"
    ? "\"천천히 알아가자고 해줘서 오히려 마음이 놓였어요. 그래도 오늘은 목소리 듣고 싶었어요.\""
    : "\"아까는 너무 갑자기 말한 것 같아서요. 그래도 지금 통화하니까 조금 안심돼요.\"";
  const choices = [
    {
      id: "keep-talking",
      label: "잠깐 더 통화한다",
    },
    canSetDate
      ? {
          id: "after-class",
          label: "수업 끝나고 보기",
        }
      : null,
    {
      id: "slow-pace",
      label: "천천히 알아가자",
    },
  ].filter(Boolean);

  return {
    contactId,
    npcId: config.npcId,
    label: config.label,
    title: `${config.label}과 통화`,
    lines: [leadLine, secondLine],
    tags: ["통화", "후속"],
    previousScene: String(targetState?.scene || "").trim() || "room",
    headline: `${config.label}과 조심스러운 첫 통화가 이어진다.`,
    sceneVariant: "ambient-follow-up",
    choiceVariant: "library-first-call",
    choices,
  };
}

function scheduleAmbientRomanceDateFromCall(
  contactId = "",
  targetState = state,
  {
    preferredSameDay = true,
    locationId = "",
    venueLabel = "",
    followUpStatus = "after-class-scheduled",
  } = {},
) {
  if (!contactId || !canScheduleRomanceDate(contactId, targetState)) {
    return null;
  }

  const contact = targetState?.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  if (!contact || !config) {
    return null;
  }

  const currentDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const timeBand = typeof getWorldTimeBand === "function"
    ? getWorldTimeBand(targetState)
    : "day";
  const canMeetToday = preferredSameDay && ["day", "evening"].includes(timeBand);
  const scheduledDay = canMeetToday ? currentDay : currentDay + 1;
  const resolvedLocationId = String(locationId || config.dateLocationId || "").trim();
  const resolvedVenueLabel = String(
    venueLabel
      || (typeof getWorldLocationConfig === "function"
        ? getWorldLocationConfig(resolvedLocationId, targetState?.day)?.label || ""
        : "")
      || config.dateVenueLabel
      || "약속 장소"
  ).trim();
  const planSnapshot = {
    id: `date:${contactId}:${scheduledDay}`,
    contactId,
    npcId: config.npcId,
    label: config.label,
    sceneType: "date",
    status: "scheduled",
    scheduledDay,
    locationId: resolvedLocationId,
    venueLabel: resolvedVenueLabel,
    plannedCost: Math.max(0, Number(config.dateCost) || 0),
  };

  setRomanceActivePlanSnapshot(planSnapshot, targetState);
  if (typeof patchSocialContact === "function") {
    patchSocialContact(contactId, {
      relationshipStage: contact.relationshipStage === "interest" ? "contact" : (contact.relationshipStage || "contact"),
      pendingDateDay: scheduledDay,
      pendingDateStatus: "scheduled",
      pendingDateLocationId: resolvedLocationId,
      lastInvitationDay: currentDay,
      ambientFollowUpStatus: followUpStatus,
      note: `${scheduledDay === currentDay ? "오늘" : "내일"} ${resolvedVenueLabel}에서 ${config.label} 일정이 잡혔다.`,
    }, targetState);
  }
  if (typeof patchNpcRelation === "function") {
    patchNpcRelation(config.npcId, {
      affinityDelta: 1,
      attractionDelta: 1,
      lastSeenDay: currentDay,
    }, targetState);
  }
  if (scheduledDay > currentDay && typeof queueNextTurnEvent === "function") {
    queueNextTurnEvent({
      badge: "수업 후 약속",
      title: `${config.label}과 보기로 했다`,
      speaker: "다음날 요약",
      tags: ["연락", "약속"],
      lines: [
        `${config.label} 통화 끝에 약속이 잡혔다.`,
        `내일 ${resolvedVenueLabel}에서 보기로 했다.`,
      ],
    }, targetState, { dayOffset: 1 });
  }

  const scheduleText = scheduledDay === currentDay
    ? `오늘 ${resolvedVenueLabel}에서 보기로 했다.`
    : `내일 ${resolvedVenueLabel}에서 보기로 했다.`;
  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("call", {
      kicker: "CALL",
      title: `${config.label} 수업 후 약속`,
      body: scheduleText,
      tone: "accent",
    }, targetState);
  }
  if (typeof createPhoneResultPreview === "function") {
    targetState.phonePreview = createPhoneResultPreview("call", "DATE", `${config.label} 약속`, scheduleText);
  }
  targetState.headline = {
    badge: "수업 후 약속",
    text: scheduleText,
  };
  if (typeof queueGameplayFeedback === "function") {
    queueGameplayFeedback({
      title: "약속 확정",
      tone: "up",
      chips: [
        { label: `${config.label}과 통화`, tone: "up" },
        { label: scheduleText, tone: "info" },
      ],
    }, targetState);
  }

  return {
    scheduledDay,
    venueLabel: resolvedVenueLabel,
  };
}

function applyAmbientRomanceCallChoice(choice = null, scene = null, targetState = state) {
  const contactId = String(scene?.contactId || "").trim();
  const contact = targetState?.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  if (!choice || !scene || !contactId || !contact || !config) {
    return false;
  }

  if (scene.choiceVariant !== "library-first-call") {
    return false;
  }

  const currentDay = Math.max(1, Math.round(Number(targetState?.day) || 1));

  if (choice.id === "keep-talking") {
    if (typeof patchSocialContact === "function") {
      patchSocialContact(contactId, {
        lastContactDay: currentDay,
        ambientFollowUpStatus: "called-once",
        note: "도서관 여학생과 첫 통화를 길게 이어 갔다.",
      }, targetState);
    }
    if (typeof patchNpcRelation === "function") {
      patchNpcRelation(config.npcId, {
        affinityDelta: 1,
        attractionDelta: 1,
        lastSeenDay: currentDay,
      }, targetState);
    }

    setRomanceCallScene({
      ...scene,
      title: "차분한 첫 통화",
      lines: [
        "\"통화로 들으니까, 아까보다 훨씬 덜 떨려요.\"",
        "짧은 통화였지만 둘 다 조금 더 편해졌고, 다음엔 얼굴 보고 이야기하자는 분위기가 자연스럽게 남는다.",
      ],
      tags: ["통화", "설렘"],
      choices: [],
      resolvedChoiceId: choice.id,
    }, targetState);
    targetState.headline = {
      badge: "첫 통화",
      text: `${config.label}과 어색하지 않게 첫 통화를 마쳤다.`,
    };
    return true;
  }

  if (choice.id === "after-class") {
    const scheduled = scheduleAmbientRomanceDateFromCall(contactId, targetState, {
      preferredSameDay: true,
      locationId: "campus-park",
      venueLabel: "캠퍼스 공원",
      followUpStatus: "after-class-scheduled",
    });
    if (!scheduled) {
      return false;
    }

    setRomanceCallScene({
      ...scene,
      title: "수업 후 보기로 했다",
      lines: [
        scheduled.scheduledDay === currentDay
          ? "\"오늘 저녁이면 괜찮아요. 캠퍼스 공원에서 잠깐 걸을래요?\""
          : "\"오늘은 조금 늦을 것 같아요. 내일 캠퍼스 공원에서 보면 좋겠어요.\"",
        `${config.label}과 ${scheduled.scheduledDay === currentDay ? "오늘" : "내일"} ${scheduled.venueLabel}에서 보기로 했다.`,
      ],
      tags: ["통화", "약속"],
      choices: [],
      resolvedChoiceId: choice.id,
    }, targetState);
    return true;
  }

  if (choice.id === "slow-pace") {
    if (typeof patchSocialContact === "function") {
      patchSocialContact(contactId, {
        lastContactDay: currentDay,
        ambientFollowUpStatus: "paced",
        note: "도서관 여학생과 천천히 알아가기로 했다.",
      }, targetState);
    }
    if (typeof patchNpcRelation === "function") {
      patchNpcRelation(config.npcId, {
        affinityDelta: 1,
        lastSeenDay: currentDay,
      }, targetState);
    }

    setRomanceCallScene({
      ...scene,
      title: "천천히 알아가기로 했다",
      lines: [
        "\"그 말 들으니까 오히려 마음이 놓여요. 급하게 굴고 싶진 않았어요.\"",
        "둘은 서두르지 말고 천천히 자주 연락해 보자는 데 뜻을 맞춘다.",
      ],
      tags: ["통화", "페이스 조절"],
      choices: [],
      resolvedChoiceId: choice.id,
    }, targetState);
    targetState.headline = {
      badge: "천천히 시작",
      text: `${config.label}과 서두르지 말고 천천히 알아가기로 했다.`,
    };
    return true;
  }

  return false;
}

function chooseRomanceCallChoice(index = 0, targetState = state) {
  const callSession = typeof getRomanceCallSession === "function"
    ? getRomanceCallSession(targetState)
    : null;
  if (callSession?.active && typeof chooseRomanceCallSessionChoice === "function") {
    return chooseRomanceCallSessionChoice(index, targetState);
  }

  const callScene = getRomanceCallScene(targetState);
  const choices = Array.isArray(callScene?.choices) ? callScene.choices : [];
  const choice = choices[index];
  if (!callScene || !choice) {
    return false;
  }

  return applyAmbientRomanceCallChoice(choice, callScene, targetState);
}

function finishRomanceCallScene(targetState = state) {
  const callSession = typeof getRomanceCallSession === "function"
    ? getRomanceCallSession(targetState)
    : null;
  if (callSession?.active && typeof finishRomanceCallSession === "function") {
    return finishRomanceCallSession(targetState);
  }

  const callScene = getRomanceCallScene(targetState);
  const previousScene = String(callScene?.previousScene || "room").trim() || "room";
  clearRomanceCallScene(targetState);
  targetState.scene = previousScene;
  if (targetState === state && typeof renderGame === "function") {
    renderGame();
  }
  return true;
}

function callRomanceContact(contactId = "", targetState = state) {
  if (!contactId || !targetState) {
    return false;
  }

  const contact = targetState.social?.contacts?.[contactId] || null;
  if (!contact?.phoneUnlocked) {
    return false;
  }

  const config = Object.values(ROMANCE_NPC_CONFIG).find((entry) => entry.contactId === contactId) || null;
  if (!config) {
    return false;
  }

  const ambientFollowUpCallScene = buildAmbientRomanceFollowUpCallScene(contactId, targetState);
  if (ambientFollowUpCallScene) {
    setRomanceCallScene(ambientFollowUpCallScene, targetState);
    if (typeof patchSocialContact === "function") {
      patchSocialContact(contactId, {
        lastContactDay: targetState.day,
        note: `${config.label}과 첫 후속 통화를 이어 갔다.`,
      }, targetState);
    }
    if (typeof patchNpcRelation === "function") {
      patchNpcRelation(config.npcId, {
        affinityDelta: 1,
        lastSeenDay: targetState.day,
      }, targetState);
    }
    targetState.scene = "romance-call";
    targetState.headline = {
      badge: "후속 통화",
      text: ambientFollowUpCallScene.headline,
    };
    if (typeof finishPhoneAppTimeSpend === "function") {
      finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
    }
    return true;
  }

  const isGirlfriend = Boolean(contact.isGirlfriend)
    || String(contact.relationshipStage || "").trim().toLowerCase() === "serious";
  if (isGirlfriend) {
    const callScene = buildRomanceGirlfriendCallScene(contactId, targetState);
    if (!callScene) {
      return false;
    }
    setRomanceCallScene(callScene, targetState);
    if (typeof patchSocialContact === "function") {
      patchSocialContact(contactId, {
        lastContactDay: targetState.day,
        note: `${config.label}와 통화했다.`,
      }, targetState);
    }
    if (typeof patchNpcRelation === "function") {
      patchNpcRelation(config.npcId, {
        affinityDelta: 1,
        lastSeenDay: targetState.day,
      }, targetState);
    }
    targetState.scene = "romance-call";
    targetState.headline = {
      badge: "전화 통화",
      text: callScene.headline,
    };
    if (typeof finishPhoneAppTimeSpend === "function") {
      finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
    }
    return true;
  }

  const message = typeof sample === "function"
    ? sample(config.callLines)
    : config.callLines[0];

  if (typeof patchSocialContact === "function") {
    patchSocialContact(contactId, {
      lastContactDay: targetState.day,
      note: config.introNote,
    }, targetState);
  }

  if (typeof patchNpcRelation === "function") {
    patchNpcRelation(config.npcId, {
      affinityDelta: 1,
      lastSeenDay: targetState.day,
    }, targetState);
  }

  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("call", {
      kicker: "CALL LOG",
      title: `${config.label}와 통화`,
      body: message,
      tone: "accent",
    });
  }

  if (typeof createPhoneResultPreview === "function") {
    targetState.phonePreview = createPhoneResultPreview("call", "CALL", `${config.label}와 통화`, message);
  }

  if (typeof setHeadline === "function") {
    setHeadline("📞 연락", message);
  } else {
    targetState.headline = {
      badge: "연락",
      text: message,
    };
  }

  if (typeof queueGameplayFeedback === "function") {
    queueGameplayFeedback({
      title: "통화 완료",
      tone: "info",
      chips: [
        { label: `${config.label} 통화`, tone: "up" },
        { label: "호감 +1", tone: "up" },
      ],
    }, targetState);
  }

  if (typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
  }

  return true;
}

function canScheduleRomanceDate(contactId = "", targetState = state) {
  const contact = targetState?.social?.contacts?.[contactId] || null;
  if (!contact?.phoneUnlocked || contact.kind !== "romance") {
    return false;
  }

  const activePlan = getRomanceActivePlanSnapshot(targetState);
  if (activePlan && (activePlan.contactId || activePlan.id || "") !== contactId) {
    return false;
  }

  if (activePlan && activePlan.contactId === contactId) {
    return false;
  }

  return true;
}

function getRomanceDateAcceptanceChance(contactId = "", targetState = state) {
  const contact = targetState?.social?.contacts?.[contactId] || null;
  if (!contact) {
    return 0;
  }

  const appearanceLevel = typeof getPlayerAppearanceLevel === "function"
    ? getPlayerAppearanceLevel(targetState)
    : 1;
  const affinity = Number(contact.affinity) || 0;
  const attraction = Number(contact.attraction) || 0;
  const stage = String(contact.relationshipStage || "interest").trim().toLowerCase();
  const baseChance = appearanceLevel >= 3 ? 0.78 : 0.52;
  const stageBonus = stage === "contact" ? 0.08 : stage === "dating" ? 0.18 : stage === "serious" ? 0.28 : 0;
  const relationBonus = (affinity * 0.04) + (attraction * 0.03);
  return Math.max(0.15, Math.min(0.96, baseChance + stageBonus + relationBonus));
}

function legacyScheduleRomanceDate(contactId = "", targetState = state) {
  if (!canScheduleRomanceDate(contactId, targetState)) {
    return false;
  }

  const contact = targetState.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  if (!contact || !config) {
    return false;
  }

  const accepted = Math.random() <= getRomanceDateAcceptanceChance(contactId, targetState);
  const venueLabel = config.dateVenueLabel || "약속 장소";

  if (!accepted) {
    if (typeof patchSocialContact === "function") {
      patchSocialContact(contactId, {
        lastInvitationDay: targetState.day,
        lastRejectedDay: targetState.day,
        note: `${config.label}와 통화했지만 오늘은 일정이 맞지 않았다.`,
      }, targetState);
    }
    if (typeof patchNpcRelation === "function") {
      patchNpcRelation(config.npcId, {
        annoyanceDelta: 1,
        lastSeenDay: targetState.day,
      }, targetState);
    }
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("call", {
        kicker: "CALL",
        title: `${config.label} 약속 불발`,
        body: `${config.label}가 오늘은 일정이 있다며 다음에 보자고 했다.`,
        tone: "warning",
      }, targetState);
    }
    if (typeof createPhoneResultPreview === "function") {
      targetState.phonePreview = createPhoneResultPreview("call", "CALL", `${config.label} 약속 불발`, `${config.label}가 오늘은 시간이 없다고 했다.`);
    }
    targetState.headline = {
      badge: "약속 보류",
      text: `${config.label}가 오늘은 일정이 있다며 다음에 다시 연락하자고 했다.`,
    };
    if (typeof queueGameplayFeedback === "function") {
      queueGameplayFeedback({
        title: "약속 불발",
        tone: "warning",
        chips: [
          { label: `${config.label} 일정 겹침`, tone: "warning" },
        ],
      }, targetState);
    }
    if (typeof finishPhoneAppTimeSpend === "function") {
      finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
    }
    return false;
  }

  if (typeof patchSocialContact === "function") {
    patchSocialContact(contactId, {
      relationshipStage: contact.relationshipStage === "interest" ? "contact" : (contact.relationshipStage || "contact"),
      pendingDateDay: targetState.day + 1,
      pendingDateStatus: "scheduled",
      pendingDateLocationId: config.dateLocationId,
      lastInvitationDay: targetState.day,
      note: `${config.label}와 내일 ${venueLabel}에서 보기로 했다.`,
    }, targetState);
  }
  if (typeof patchNpcRelation === "function") {
    patchNpcRelation(config.npcId, {
      affinityDelta: 1,
      attractionDelta: 1,
      lastSeenDay: targetState.day,
    }, targetState);
  }
  if (typeof queueNextTurnEvent === "function") {
    queueNextTurnEvent({
      badge: "데이트 약속",
      title: `${config.label}와 약속`,
      speaker: "다음날 요약",
      tags: ["연애", "약속"],
      lines: [
        `${config.label}와 통화 끝에 약속이 잡혔다.`,
        `내일 ${venueLabel}에서 보기로 했다.`,
      ],
    }, targetState, { dayOffset: 1 });
  }
  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("call", {
      kicker: "CALL",
      title: `${config.label} 약속 성사`,
      body: `내일 ${venueLabel}에서 보기로 했다.`,
      tone: "accent",
    }, targetState);
  }
  if (typeof createPhoneResultPreview === "function") {
    targetState.phonePreview = createPhoneResultPreview("call", "DATE", `${config.label} 약속`, `내일 ${venueLabel}에서 보기로 했다.`);
  }
  targetState.headline = {
    badge: "데이트 약속",
    text: `${config.label}와 내일 ${venueLabel}에서 보기로 했다.`,
  };
  if (typeof queueGameplayFeedback === "function") {
    queueGameplayFeedback({
      title: "약속 성사",
      tone: "up",
      chips: [
        { label: `${config.label} 약속`, tone: "up" },
        { label: `내일 ${venueLabel}`, tone: "info" },
      ],
    }, targetState);
  }
  if (typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
  }
  return true;
}

function canInviteRomanceHome(contactId = "", targetState = state) {
  const contact = targetState?.social?.contacts?.[contactId] || null;
  if (!contact?.phoneUnlocked || contact.kind !== "romance") {
    return false;
  }

  if (!canAddNewGirlfriend(contactId, targetState)) {
    return false;
  }

  const stage = String(contact.relationshipStage || "").trim().toLowerCase();
  if (!["dating", "serious"].includes(stage)) {
    return false;
  }

  const activePlan = getRomanceActivePlanSnapshot(targetState);
  if (activePlan && (activePlan.contactId || activePlan.id || "") !== contactId) {
    return false;
  }

  if (activePlan && activePlan.contactId === contactId) {
    return false;
  }

  return true;
}

function legacyScheduleRomanceHomeInvite(contactId = "", targetState = state) {
  if (!canInviteRomanceHome(contactId, targetState)) {
    return false;
  }

  const contact = targetState.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  if (!contact || !config) {
    return false;
  }

  const residenceLabel = typeof getInventoryResidenceLabel === "function"
    ? getInventoryResidenceLabel(targetState)
    : "집";
  const acceptedChance = String(contact.relationshipStage || "").trim().toLowerCase() === "serious" ? 0.96 : 0.74;
  const accepted = Math.random() <= acceptedChance;

  if (!accepted) {
    if (typeof patchSocialContact === "function") {
      patchSocialContact(contactId, {
        lastInvitationDay: targetState.day,
        note: `${config.label}가 집 초대는 아직 이르다고 했다.`,
      }, targetState);
    }
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("call", {
        kicker: "CALL",
        title: `${config.label} 집 초대 보류`,
        body: "조금 더 가까워진 뒤에 가 보자고 했다.",
        tone: "warning",
      }, targetState);
    }
    targetState.headline = {
      badge: "집 초대 보류",
      text: `${config.label}가 집 초대는 아직 조금 이르다고 했다.`,
    };
    if (typeof queueGameplayFeedback === "function") {
      queueGameplayFeedback({
        title: "집 초대 보류",
        tone: "warning",
        chips: [
          { label: "조금 더 가까워질 필요", tone: "warning" },
        ],
      }, targetState);
    }
    if (typeof finishPhoneAppTimeSpend === "function") {
      finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
    }
    return false;
  }

  if (typeof patchSocialContact === "function") {
    patchSocialContact(contactId, {
      pendingHomeInviteDay: targetState.day + 1,
      pendingHomeInviteStatus: "scheduled",
      lastInvitationDay: targetState.day,
      note: `${config.label}가 내일 ${residenceLabel}에 들르겠다고 했다.`,
    }, targetState);
  }
  if (typeof queueNextTurnEvent === "function") {
    queueNextTurnEvent({
      badge: "집 초대",
      title: `${config.label}를 집에 초대했다`,
      speaker: "다음날 요약",
      tags: ["연애", "집 초대"],
      lines: [
        `${config.label}가 초대를 받아들였다.`,
        `내일 ${residenceLabel}에서 같이 시간을 보내기로 했다.`,
      ],
    }, targetState, { dayOffset: 1 });
  }
  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("call", {
      kicker: "CALL",
      title: `${config.label} 집 초대 성사`,
      body: `내일 ${residenceLabel}에서 보기로 했다.`,
      tone: "accent",
    }, targetState);
  }
  if (typeof createPhoneResultPreview === "function") {
    targetState.phonePreview = createPhoneResultPreview("call", "HOME", `${config.label} 집 초대`, `내일 ${residenceLabel}에서 보기로 했다.`);
  }
  targetState.headline = {
    badge: "집 초대",
    text: `${config.label}가 내일 ${residenceLabel}에 들르기로 했다.`,
  };
  if (typeof queueGameplayFeedback === "function") {
    queueGameplayFeedback({
      title: "집 초대 성사",
      tone: "up",
      chips: [
        { label: `${config.label} 방문 예정`, tone: "up" },
        { label: residenceLabel, tone: "info" },
      ],
    }, targetState);
  }
  if (typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
  }
  return true;
}

function legacyGetTodayRomanceRoomEvent(targetState = state) {
  const activePlan = getRomanceActivePlanSnapshot(targetState);
  const today = Math.max(1, Math.round(Number(targetState?.day) || 1));
  if (activePlan && activePlan.status === "scheduled" && activePlan.scheduledDay === today) {
    const config = getRomanceConfigByContactId(activePlan.contactId);
    if (config) {
      const isHomeInvite = activePlan.sceneType === "home-invite";
      const residenceLabel = typeof getInventoryResidenceLabel === "function"
        ? getInventoryResidenceLabel(targetState)
        : "집";

      return {
        sceneType: isHomeInvite ? "home-invite" : "date",
        contactId: activePlan.contactId,
        npcId: config.npcId,
        label: config.label,
        title: isHomeInvite ? `${config.label}가 집에 오기로 한 날` : `${config.label}와 약속이 있는 날`,
        lines: isHomeInvite
          ? [
              `${config.label}가 오늘 ${residenceLabel}에 들르기로 했다.`,
              "방에서 준비를 마치면 바로 집 초대를 시작할 수 있다.",
            ]
          : [
              `${config.label}와 오늘 ${activePlan.venueLabel || config.dateVenueLabel || "약속 장소"}에서 보기로 했다.`,
              "방에서 마음을 정리한 뒤 바로 데이트를 시작할 수 있다.",
            ],
        actionLabel: isHomeInvite ? "집 초대 시작" : "데이트 나가기",
        headlineBadge: isHomeInvite ? "집 초대" : "데이트 약속",
        headlineText: isHomeInvite
          ? `${config.label}가 오늘 집에 들르기로 했다.`
          : `${config.label}와 오늘 약속이 잡혀 있다.`,
      };
    }
  }

  const contacts = targetState?.social?.contacts || {};
  const dueContact = Object.values(contacts).find((contact) => {
    if (contact?.kind !== "romance" || !contact.phoneUnlocked) {
      return false;
    }

    if (contact.pendingHomeInviteStatus === "scheduled" && Number(contact.pendingHomeInviteDay) === today) {
      return true;
    }

    return contact.pendingDateStatus === "scheduled" && Number(contact.pendingDateDay) === today;
  }) || null;

  if (!dueContact) {
    return null;
  }

  const config = getRomanceConfigByContactId(dueContact.contactId || dueContact.id || "");
  if (!config) {
    return null;
  }

  const isHomeInvite = dueContact.pendingHomeInviteStatus === "scheduled" && Number(dueContact.pendingHomeInviteDay) === today;
  const residenceLabel = typeof getInventoryResidenceLabel === "function"
    ? getInventoryResidenceLabel(targetState)
    : "집";

  return {
    sceneType: isHomeInvite ? "home-invite" : "date",
    contactId: dueContact.contactId || dueContact.id || "",
    npcId: config.npcId,
    label: config.label,
    title: isHomeInvite ? `${config.label}가 집에 오기로 한 날` : `${config.label}와 약속이 있는 날`,
    lines: isHomeInvite
      ? [
          `${config.label}가 오늘 ${residenceLabel}에 들르기로 했다.`,
          "방에서 준비를 마친 뒤 집 초대를 시작할 수 있다.",
        ]
      : [
          `${config.label}와 오늘 ${config.dateVenueLabel || "약속 장소"}에서 보기로 했다.`,
          "방에서 나가기 전에 마음을 정리하고 약속을 시작할 수 있다.",
        ],
    actionLabel: isHomeInvite ? "집 초대 시작" : "데이트 나가기",
    headlineBadge: isHomeInvite ? "집 초대" : "데이트 약속",
    headlineText: isHomeInvite
      ? `${config.label}가 오늘 집에 들르기로 했다.`
      : `${config.label}와 오늘 약속이 있다.`,
  };
}

function legacyStartTodayRomanceEvent(contactId = "", sceneType = "date", targetState = state) {
  const activePlan = getRomanceActivePlanSnapshot(targetState);
  if (activePlan && activePlan.contactId === contactId) {
    const config = getRomanceConfigByContactId(contactId);
    const contact = targetState?.social?.contacts?.[contactId] || null;
    if (!contact || !config) {
      return false;
    }

    const isHomeInvite = String(activePlan.sceneType || sceneType || "").trim().toLowerCase() === "home-invite";
    const venueLocation = !isHomeInvite && typeof getWorldLocationConfig === "function"
      ? getWorldLocationConfig(activePlan.locationId || config.dateLocationId, targetState.day)
      : null;
    const residenceLabel = typeof getInventoryResidenceLabel === "function"
      ? getInventoryResidenceLabel(targetState)
      : "집";
    const nextScene = {
      sceneType: isHomeInvite ? "home-invite" : "date",
      contactId,
      npcId: config.npcId,
      label: config.label,
      speaker: config.label,
      title: isHomeInvite ? `${config.label}를 ${residenceLabel}에서 맞이한다` : `${config.label}와 약속 장소로 향한다`,
      tags: isHomeInvite ? ["연애", "집 초대"] : ["연애", "데이트"],
      introLines: isHomeInvite
        ? [
            `${residenceLabel} 안 공기가 잠잠해지고 ${config.label}가 약속한 시간에 맞춰 도착했다.`,
            "집 안 분위기를 정리한 뒤 함께 시간을 보내기 시작한다.",
          ]
        : [
            `${activePlan.venueLabel || config.dateVenueLabel || venueLocation?.label || "약속 장소"} 공기가 오늘은 유난히 또렷하다.`,
            `${config.label}와 나란히 걸으며 자연스럽게 대화를 이어간다.`,
          ],
      backgroundConfig: isHomeInvite
        ? (typeof getSpoonStartStageBackground === "function" ? getSpoonStartStageBackground("room", targetState, null) : null)
        : (venueLocation?.background ? { ...venueLocation.background } : null),
      plannedCost: Math.max(0, Number(activePlan.plannedCost) || 0),
      venueLabel: isHomeInvite ? residenceLabel : (activePlan.venueLabel || config.dateVenueLabel || venueLocation?.label || "약속 장소"),
    };

    setRomanceActiveSceneSnapshot(nextScene, targetState);
    setRomanceActivePlanSnapshot({
      ...activePlan,
      status: "active",
    }, targetState);
    targetState.scene = "romance";
    targetState.headline = {
      badge: isHomeInvite ? "집 초대" : "데이트 약속",
      text: isHomeInvite
        ? `${config.label}가 약속대로 집에 들렀다.`
        : `${config.label}와 약속 장소로 이동했다.`,
    };
    return true;
  }

  const contact = targetState?.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  if (!contact || !config) {
    return false;
  }

  const isHomeInvite = String(sceneType || "").trim().toLowerCase() === "home-invite";
  const venueLocation = !isHomeInvite && typeof getWorldLocationConfig === "function"
    ? getWorldLocationConfig(config.dateLocationId, targetState.day)
    : null;
  const residenceLabel = typeof getInventoryResidenceLabel === "function"
    ? getInventoryResidenceLabel(targetState)
    : "집";
  const backgroundConfig = isHomeInvite
    ? (typeof getSpoonStartStageBackground === "function" ? getSpoonStartStageBackground("room", targetState, null) : null)
    : (venueLocation?.background ? { ...venueLocation.background } : null);

  targetState.romanceScene = {
    sceneType: isHomeInvite ? "home-invite" : "date",
    contactId,
    npcId: config.npcId,
    label: config.label,
    speaker: config.label,
    title: isHomeInvite ? `${config.label}를 ${residenceLabel}에 맞이했다` : `${config.label}와 약속 장소로 나왔다`,
    tags: isHomeInvite ? ["연애", "집 초대"] : ["연애", "데이트"],
    introLines: isHomeInvite
      ? [
          `${residenceLabel}에 조용한 공기가 감돌고, ${config.label}가 약속한 시간에 맞춰 들른다.`,
          "방 안 분위기를 가볍게 정리한 뒤 둘만의 시간을 시작한다.",
        ]
      : [
          `${config.dateVenueLabel || venueLocation?.label || "약속 장소"} 공기가 오늘은 유난히 또렷하다.`,
          `${config.label}와 가볍게 걸으면서 하루 이야기를 나누기 시작한다.`,
        ],
    backgroundConfig,
    plannedCost: isHomeInvite ? Math.max(0, Number(config.homeInviteCost) || 0) : Math.max(0, Number(config.dateCost) || 0),
    venueLabel: isHomeInvite ? residenceLabel : (config.dateVenueLabel || venueLocation?.label || "약속 장소"),
  };
  targetState.scene = "romance";
  targetState.headline = {
    badge: isHomeInvite ? "집 초대" : "데이트 약속",
    text: isHomeInvite
      ? `${config.label}가 약속대로 집에 들렀다.`
      : `${config.label}와 약속 장소에 도착했다.`,
  };
  return true;
}

function legacyCompleteActiveRomanceScene(targetState = state) {
  const activeScene = getRomanceActiveSceneSnapshot(targetState);
  if (activeScene) {
    const contactId = activeScene.contactId;
    const contact = targetState?.social?.contacts?.[contactId] || null;
    const config = getRomanceConfigByContactId(contactId);
    if (!contact || !config) {
      clearRomanceActiveSceneSnapshot(targetState);
      clearRomanceActivePlanSnapshot(targetState);
      targetState.scene = "room";
      return false;
    }

    const plannedCost = Math.max(0, Math.round(Number(activeScene.plannedCost) || 0));
    const actualCost = Math.max(0, Math.min(Math.max(0, Number(targetState.money) || 0), plannedCost));
    if (actualCost > 0 && typeof spendCash === "function") {
      spendCash(actualCost, targetState);
    }

    const isHomeInvite = activeScene.sceneType === "home-invite";
    const nextStage = isHomeInvite
      ? "serious"
      : (String(contact.relationshipStage || "").trim().toLowerCase() === "serious" ? "serious" : "dating");
    const happinessGain = isHomeInvite ? 10 : 6;
    applyRomanceSuccessHappinessGain(happinessGain, targetState);

    if (typeof patchSocialContact === "function") {
      patchSocialContact(contactId, {
        relationshipStage: nextStage,
        pendingDateDay: null,
        pendingDateStatus: "",
        pendingDateLocationId: "",
        pendingHomeInviteDay: null,
        pendingHomeInviteStatus: "",
        dateCount: (Number(contact.dateCount) || 0) + (isHomeInvite ? 0 : 1),
        homeInviteCount: (Number(contact.homeInviteCount) || 0) + (isHomeInvite ? 1 : 0),
        invitedHome: isHomeInvite || Boolean(contact.invitedHome),
        lastDateDay: isHomeInvite ? (Number(contact.lastDateDay) || 0) : targetState.day,
        lastHomeInviteDay: isHomeInvite ? targetState.day : (Number(contact.lastHomeInviteDay) || 0),
        note: isHomeInvite
          ? `${config.label}가 집에서 함께 시간을 보내고 돌아갔다.`
          : `${config.label}와 약속을 무사히 마쳤다.`,
      }, targetState);
    }

    if (typeof patchNpcRelation === "function") {
      patchNpcRelation(config.npcId, {
        affinityDelta: isHomeInvite ? 3 : 2,
        attractionDelta: isHomeInvite ? 2 : 1,
        meetingsDelta: 1,
        lastSeenDay: targetState.day,
        flags: isHomeInvite ? { homeInvited: true } : {},
      }, targetState);
    }

    if (isHomeInvite) {
      markRomanceContactAsGirlfriend(contactId, targetState);
    }

    clearRomanceActiveSceneSnapshot(targetState);
    clearRomanceActivePlanSnapshot(targetState);

    const resultBody = isHomeInvite
      ? `${config.label}와 집에서 오래 이야기를 나눴다. ${actualCost > 0 ? `${formatMoney(actualCost)}을 써서 간단한 준비도 했다. ` : ""}관계가 한 단계 더 가까워졌다.`
      : `${config.label}와 데이트를 마쳤다. ${actualCost > 0 ? `${formatMoney(actualCost)}을 써서 오늘 약속을 마무리했다. ` : ""}다음엔 더 자연스럽게 연락할 수 있을 것 같다.`;

    targetState.scene = "room";
    return applyRomanceActionResult({
      ok: true,
      code: isHomeInvite ? "home-invite-complete" : "date-complete",
      outcome: {
        kind: isHomeInvite ? "home-invite" : "date",
        status: "completed",
        contactId,
        npcId: config.npcId,
        nextStage,
      },
      phoneStatus: {
        kicker: isHomeInvite ? "HOME" : "DATE",
        title: isHomeInvite ? `${config.label} 집 초대 완료` : `${config.label} 데이트 완료`,
        body: resultBody,
        tone: "accent",
      },
      phonePreview: {
        kicker: isHomeInvite ? "HOME" : "DATE",
        title: isHomeInvite ? `${config.label} 집 초대 완료` : `${config.label} 데이트 완료`,
        body: resultBody,
      },
      headline: {
        badge: isHomeInvite ? "집 초대 완료" : "데이트 완료",
        text: resultBody,
      },
      feedback: {
        title: isHomeInvite ? "집 초대 완료" : "데이트 완료",
        tone: "up",
        chips: [
          { label: `${config.label}`, tone: "up" },
          { label: `${getRomanceRelationshipStageLabel(nextStage)}`, tone: "up" },
          { label: `행복 +${happinessGain}`, tone: "up" },
          actualCost > 0 ? { label: `${formatMoney(actualCost)} 사용`, tone: "down" } : null,
        ].filter(Boolean),
      },
    }, targetState);
  }

  const romanceScene = syncRomanceSceneState(targetState);
  if (!romanceScene) {
    return false;
  }

  const contactId = romanceScene.contactId;
  const contact = targetState?.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  if (!contact || !config) {
    targetState.romanceScene = null;
    targetState.scene = "room";
    return false;
  }

  const plannedCost = Math.max(0, Math.round(Number(romanceScene.plannedCost) || 0));
  const actualCost = Math.max(0, Math.min(Math.max(0, Number(targetState.money) || 0), plannedCost));
  if (actualCost > 0 && typeof spendCash === "function") {
    spendCash(actualCost, targetState);
  }

  const isHomeInvite = romanceScene.sceneType === "home-invite";
  const nextStage = isHomeInvite ? "serious" : (String(contact.relationshipStage || "").trim().toLowerCase() === "serious" ? "serious" : "dating");
  const happinessGain = isHomeInvite ? 10 : 6;
  applyRomanceSuccessHappinessGain(happinessGain, targetState);

  if (typeof patchSocialContact === "function") {
    patchSocialContact(contactId, {
      relationshipStage: nextStage,
      pendingDateDay: null,
      pendingDateStatus: "",
      pendingDateLocationId: "",
      pendingHomeInviteDay: null,
      pendingHomeInviteStatus: "",
      dateCount: (Number(contact.dateCount) || 0) + (isHomeInvite ? 0 : 1),
      homeInviteCount: (Number(contact.homeInviteCount) || 0) + (isHomeInvite ? 1 : 0),
      invitedHome: isHomeInvite || Boolean(contact.invitedHome),
      lastDateDay: isHomeInvite ? (Number(contact.lastDateDay) || 0) : targetState.day,
      lastHomeInviteDay: isHomeInvite ? targetState.day : (Number(contact.lastHomeInviteDay) || 0),
      note: isHomeInvite
        ? `${config.label}가 집에서 함께 시간을 보내고 돌아갔다.`
        : `${config.label}와 약속을 무사히 마쳤다.`,
    }, targetState);
  }

  if (typeof patchNpcRelation === "function") {
    patchNpcRelation(config.npcId, {
      affinityDelta: isHomeInvite ? 3 : 2,
      attractionDelta: isHomeInvite ? 2 : 1,
      meetingsDelta: 1,
      lastSeenDay: targetState.day,
      flags: isHomeInvite ? { homeInvited: true } : {},
    }, targetState);
  }

  if (isHomeInvite) {
    markRomanceContactAsGirlfriend(contactId, targetState);
  }

  const resultBody = isHomeInvite
    ? `${config.label}와 집에서 오래 이야기했다. ${actualCost > 0 ? `${formatMoney(actualCost)}을 써서 간단한 준비도 했다. ` : ""}관계가 한 단계 더 가까워졌다.`
    : `${config.label}와 약속을 마쳤다. ${actualCost > 0 ? `${formatMoney(actualCost)}을 써서 오늘 데이트를 마무리했다. ` : ""}다음엔 더 자연스럽게 연락할 수 있을 것 같다.`;

  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("call", {
      kicker: isHomeInvite ? "HOME" : "DATE",
      title: isHomeInvite ? `${config.label} 집 초대 완료` : `${config.label} 데이트 완료`,
      body: resultBody,
      tone: "accent",
    }, targetState);
  }
  if (typeof createPhoneResultPreview === "function") {
    targetState.phonePreview = createPhoneResultPreview("call", isHomeInvite ? "HOME" : "DATE", isHomeInvite ? `${config.label} 집 초대 완료` : `${config.label} 데이트 완료`, resultBody);
  }
  targetState.headline = {
    badge: isHomeInvite ? "집 초대 완료" : "데이트 완료",
    text: resultBody,
  };
  if (typeof queueGameplayFeedback === "function") {
    queueGameplayFeedback({
      title: isHomeInvite ? "집 초대 완료" : "데이트 완료",
      tone: "up",
      chips: [
        { label: `${config.label}`, tone: "up" },
        { label: `${getRomanceRelationshipStageLabel(nextStage)}`, tone: "up" },
        { label: `행복 +${happinessGain}`, tone: "up" },
        actualCost > 0 ? { label: `${formatMoney(actualCost)} 사용`, tone: "down" } : null,
      ].filter(Boolean),
    }, targetState);
  }

  targetState.romanceScene = null;
  targetState.scene = "room";
  if (targetState === state && typeof renderGame === "function") {
    renderGame();
  }
  return true;
}

function scheduleRomanceDate(contactId = "", targetState = state) {
  if (!canScheduleRomanceDate(contactId, targetState)) {
    return false;
  }

  const contact = targetState.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  if (!contact || !config) {
    return false;
  }

  const accepted = Math.random() <= getRomanceDateAcceptanceChance(contactId, targetState);
  const venueLabel = config.dateVenueLabel || "약속 장소";

  if (!accepted) {
    if (typeof patchSocialContact === "function") {
      patchSocialContact(contactId, {
        lastInvitationDay: targetState.day,
        lastRejectedDay: targetState.day,
        note: `${config.label}에게 전화를 걸었지만 오늘은 시간이 안 된다고 들었다.`,
      }, targetState);
    }
    if (typeof patchNpcRelation === "function") {
      patchNpcRelation(config.npcId, {
        annoyanceDelta: 1,
        lastSeenDay: targetState.day,
      }, targetState);
    }
    applyRomanceActionResult({
      ok: false,
      code: "date-rejected",
      phoneStatus: {
        kicker: "CALL",
        title: `${config.label} 약속 보류`,
        body: `${config.label} 쪽에서 오늘은 시간이 안 된다고 했다.`,
        tone: "warning",
      },
      phonePreview: {
        kicker: "CALL",
        title: `${config.label} 약속 보류`,
        body: `${config.label} 쪽에서 오늘은 어렵다고 했다.`,
      },
      headline: {
        badge: "약속 보류",
        text: `${config.label} 쪽에서 오늘은 어렵다고 했다. 다음에 다시 연락해 보자.`,
      },
      feedback: {
        title: "약속 거절",
        tone: "warning",
        chips: [
          { label: `${config.label} 일정 거절`, tone: "warning" },
        ],
      },
      finishPhoneTime: { type: "minor", amount: 1 },
      outcome: {
        kind: "date",
        status: "rejected",
        day: targetState.day,
        contactId,
        npcId: config.npcId,
      },
    }, targetState);
    return false;
  }

  const nextDay = Math.max(1, Math.round(Number(targetState.day) || 1) + 1);
  const nextPlan = {
    id: `date:${contactId}:${nextDay}`,
    contactId,
    npcId: config.npcId,
    label: config.label,
    sceneType: "date",
    status: "scheduled",
    scheduledDay: nextDay,
    locationId: config.dateLocationId,
    venueLabel,
    plannedCost: Math.max(0, Number(config.dateCost) || 0),
  };
  setRomanceActivePlanSnapshot(nextPlan, targetState);

  if (typeof patchSocialContact === "function") {
    patchSocialContact(contactId, {
      relationshipStage: contact.relationshipStage === "interest" ? "contact" : (contact.relationshipStage || "contact"),
      pendingDateDay: nextDay,
      pendingDateStatus: "scheduled",
      pendingDateLocationId: config.dateLocationId,
      lastInvitationDay: targetState.day,
      note: `${config.label}와 내일 ${venueLabel}에서 보기로 했다.`,
    }, targetState);
  }
  if (typeof patchNpcRelation === "function") {
    patchNpcRelation(config.npcId, {
      affinityDelta: 1,
      attractionDelta: 1,
      lastSeenDay: targetState.day,
    }, targetState);
  }
  applyRomanceActionResult({
    ok: true,
    code: "date-scheduled",
    turnEventDayOffset: 1,
    turnEvent: {
      badge: "데이트 약속",
      title: `${config.label}와 약속`,
      speaker: "다음날 요약",
      tags: ["연애", "약속"],
      lines: [
        `${config.label}와 전화 끝에 약속이 잡혔다.`,
        `내일 ${venueLabel}에서 보기로 했다.`,
      ],
    },
    phoneStatus: {
      kicker: "CALL",
      title: `${config.label} 데이트 확정`,
      body: `내일 ${venueLabel}에서 보기로 했다.`,
      tone: "accent",
    },
    phonePreview: {
      kicker: "DATE",
      title: `${config.label} 약속`,
      body: `내일 ${venueLabel}에서 보기로 했다.`,
    },
    headline: {
      badge: "데이트 약속",
      text: `${config.label}와 내일 ${venueLabel}에서 보기로 했다.`,
    },
    feedback: {
      title: "약속 확정",
      tone: "up",
      chips: [
        { label: `${config.label}와 약속`, tone: "up" },
        { label: `내일 ${venueLabel}`, tone: "info" },
      ],
    },
    finishPhoneTime: { type: "minor", amount: 1 },
    outcome: {
      kind: "date",
      status: "scheduled",
      day: targetState.day,
      contactId,
      npcId: config.npcId,
      scheduledDay: nextDay,
      venueLabel,
    },
  }, targetState);
  return true;
}

function scheduleRomanceHomeInvite(contactId = "", targetState = state) {
  if (!canInviteRomanceHome(contactId, targetState)) {
    const contact = targetState?.social?.contacts?.[contactId] || null;
    const config = getRomanceConfigByContactId(contactId);
    if (contact && config && !canAddNewGirlfriend(contactId, targetState)) {
      applyRomanceActionResult({
        ok: false,
        code: "girlfriend-limit-reached",
        phoneStatus: {
          kicker: "CALL",
          title: "연애 슬롯 가득참",
          body: `여자친구는 최대 ${getRomanceGirlfriendLimit()}명까지만 둘 수 있다.`,
          tone: "warning",
        },
        phonePreview: {
          kicker: "CALL",
          title: "연애 슬롯 가득참",
          body: `여자친구는 최대 ${getRomanceGirlfriendLimit()}명까지만 둘 수 있다.`,
        },
        headline: {
          badge: "연애 제한",
          text: `지금은 새로운 여자친구를 더 만들 수 없다.`,
        },
        feedback: {
          title: "여자친구 제한",
          tone: "warning",
          chips: [
            { label: `최대 ${getRomanceGirlfriendLimit()}명`, tone: "warning" },
          ],
        },
        finishPhoneTime: { type: "minor", amount: 1 },
        outcome: {
          kind: "home-invite",
          status: "girlfriend-limit",
          day: targetState.day,
          contactId,
          npcId: config.npcId,
        },
      }, targetState);
    }
    return false;
  }

  const contact = targetState.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  if (!contact || !config) {
    return false;
  }

  const residenceLabel = typeof getInventoryResidenceLabel === "function"
    ? getInventoryResidenceLabel(targetState)
    : "집";
  const acceptedChance = String(contact.relationshipStage || "").trim().toLowerCase() === "serious" ? 0.96 : 0.74;
  const accepted = Math.random() <= acceptedChance;

  if (!accepted) {
    if (typeof patchSocialContact === "function") {
      patchSocialContact(contactId, {
        lastInvitationDay: targetState.day,
        note: `${config.label}가 집 초대는 아직 조금 이르다고 했다.`,
      }, targetState);
    }
    applyRomanceActionResult({
      ok: false,
      code: "home-invite-rejected",
      phoneStatus: {
        kicker: "CALL",
        title: `${config.label} 집 초대 보류`,
        body: "조금 더 가까워진 뒤에 가 보자고 했다.",
        tone: "warning",
      },
      phonePreview: {
        kicker: "HOME",
        title: `${config.label} 집 초대 보류`,
        body: "조금 더 가까워진 뒤에 보자고 했다.",
      },
      headline: {
        badge: "집 초대 보류",
        text: `${config.label}가 집 초대는 아직 이르다고 했다.`,
      },
      feedback: {
        title: "집 초대 보류",
        tone: "warning",
        chips: [
          { label: "조금 더 가까워질 필요", tone: "warning" },
        ],
      },
      finishPhoneTime: { type: "minor", amount: 1 },
      outcome: {
        kind: "home-invite",
        status: "rejected",
        day: targetState.day,
        contactId,
        npcId: config.npcId,
      },
    }, targetState);
    return false;
  }

  const nextDay = Math.max(1, Math.round(Number(targetState.day) || 1) + 1);
  const nextPlan = {
    id: `home-invite:${contactId}:${nextDay}`,
    contactId,
    npcId: config.npcId,
    label: config.label,
    sceneType: "home-invite",
    status: "scheduled",
    scheduledDay: nextDay,
    venueLabel: residenceLabel,
    plannedCost: Math.max(0, Number(config.homeInviteCost) || 0),
  };
  setRomanceActivePlanSnapshot(nextPlan, targetState);

  if (typeof patchSocialContact === "function") {
    patchSocialContact(contactId, {
      pendingHomeInviteDay: nextDay,
      pendingHomeInviteStatus: "scheduled",
      lastInvitationDay: targetState.day,
      note: `${config.label}가 내일 ${residenceLabel}로 오기로 했다.`,
    }, targetState);
  }
  applyRomanceActionResult({
    ok: true,
    code: "home-invite-scheduled",
    turnEventDayOffset: 1,
    turnEvent: {
      badge: "집 초대",
      title: `${config.label}를 집에 초대했다`,
      speaker: "다음날 요약",
      tags: ["연애", "집 초대"],
      lines: [
        `${config.label}가 초대를 받아들였다.`,
        `내일 ${residenceLabel}에서 함께 시간을 보내기로 했다.`,
      ],
    },
    phoneStatus: {
      kicker: "CALL",
      title: `${config.label} 집 초대 확정`,
      body: `내일 ${residenceLabel}에서 보기로 했다.`,
      tone: "accent",
    },
    phonePreview: {
      kicker: "HOME",
      title: `${config.label} 집 초대`,
      body: `내일 ${residenceLabel}에서 보기로 했다.`,
    },
    headline: {
      badge: "집 초대",
      text: `${config.label}가 내일 ${residenceLabel}로 오기로 했다.`,
    },
    feedback: {
      title: "집 초대 확정",
      tone: "up",
      chips: [
        { label: `${config.label} 방문 예정`, tone: "up" },
        { label: residenceLabel, tone: "info" },
      ],
    },
    finishPhoneTime: { type: "minor", amount: 1 },
    outcome: {
      kind: "home-invite",
      status: "scheduled",
      day: targetState.day,
      contactId,
      npcId: config.npcId,
      scheduledDay: nextDay,
      venueLabel: residenceLabel,
    },
  }, targetState);
  return true;
}

function getTodayRomanceRoomEvent(targetState = state) {
  const legacyEvent = legacyGetTodayRomanceRoomEvent(targetState);
  if (!legacyEvent) {
    return legacyEvent;
  }

  const config = getRomanceConfigByContactId(legacyEvent.contactId || "");
  if (!config) {
    return legacyEvent;
  }

  const activePlan = getRomanceActivePlanSnapshot(targetState);
  const venueLabel = activePlan && activePlan.contactId === legacyEvent.contactId
    ? (
        activePlan.sceneType === "home-invite"
          ? (activePlan.venueLabel || (typeof getInventoryResidenceLabel === "function" ? getInventoryResidenceLabel(targetState) : "집"))
          : (activePlan.venueLabel || config.dateVenueLabel || "약속 장소")
      )
    : (
        legacyEvent.sceneType === "home-invite"
          ? (typeof getInventoryResidenceLabel === "function" ? getInventoryResidenceLabel(targetState) : "집")
          : (config.dateVenueLabel || "약속 장소")
      );
  const profile = legacyEvent.sceneType === "home-invite"
    ? buildRomanceHomeInviteSceneProfile(legacyEvent.contactId, {
        targetState,
        venueLabel,
        relationshipStage: targetState?.social?.contacts?.[legacyEvent.contactId]?.relationshipStage || "dating",
      })
    : buildRomanceDateSceneProfile(legacyEvent.contactId, {
        targetState,
        venueLabel,
        relationshipStage: targetState?.social?.contacts?.[legacyEvent.contactId]?.relationshipStage || "contact",
      });

  return {
    ...legacyEvent,
    title: profile.roomTitle,
    lines: [...profile.roomLines],
    actionLabel: profile.actionLabel,
    headlineText: profile.headlineText,
  };
}

function startTodayRomanceEvent(contactId = "", sceneType = "date", targetState = state) {
  const normalizedSceneType = String(sceneType || "date").trim().toLowerCase();
  if (!["date", "home-invite"].includes(normalizedSceneType)) {
    return legacyStartTodayRomanceEvent(contactId, sceneType, targetState);
  }

  const config = getRomanceConfigByContactId(contactId);
  const contact = targetState?.social?.contacts?.[contactId] || null;
  if (!contact || !config) {
    return legacyStartTodayRomanceEvent(contactId, sceneType, targetState);
  }

  const activePlan = getRomanceActivePlanSnapshot(targetState);
  const currentDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const isHomeInvite = normalizedSceneType === "home-invite";
  const planSnapshot = activePlan && activePlan.contactId === contactId
    ? activePlan
    : normalizeRomancePlanSnapshot({
        id: `${normalizedSceneType}:${contactId}:${currentDay}`,
        contactId,
        npcId: config.npcId,
        label: config.label,
        sceneType: normalizedSceneType,
        status: "scheduled",
        scheduledDay: currentDay,
        locationId: isHomeInvite ? "" : config.dateLocationId,
        venueLabel: isHomeInvite
          ? (typeof getInventoryResidenceLabel === "function" ? getInventoryResidenceLabel(targetState) : "집")
          : config.dateVenueLabel,
        plannedCost: isHomeInvite
          ? Math.max(0, Number(config.homeInviteCost) || 0)
          : Math.max(0, Number(config.dateCost) || 0),
      });
  if (!planSnapshot) {
    return false;
  }

  const venueLocation = !isHomeInvite && typeof getWorldLocationConfig === "function"
    ? getWorldLocationConfig(planSnapshot.locationId || config.dateLocationId, targetState.day)
    : null;
  const venueLabel = isHomeInvite
    ? (planSnapshot.venueLabel || (typeof getInventoryResidenceLabel === "function" ? getInventoryResidenceLabel(targetState) : "집"))
    : (planSnapshot.venueLabel || config.dateVenueLabel || venueLocation?.label || "약속 장소");
  const profile = isHomeInvite
    ? buildRomanceHomeInviteSceneProfile(contactId, {
        targetState,
        venueLabel,
        relationshipStage: contact.relationshipStage || "dating",
      })
    : buildRomanceDateSceneProfile(contactId, {
        targetState,
        venueLabel,
        relationshipStage: contact.relationshipStage || "contact",
      });
  const npcActorOverride = buildRomanceSceneNpcActorOverride(contactId, normalizedSceneType);
  const nextScene = {
    sceneType: isHomeInvite ? "home-invite" : "date",
    contactId,
    npcId: config.npcId,
    label: config.label,
    speaker: config.label,
    title: profile.startTitle,
    tags: isHomeInvite ? ["연애", "집 초대", profile.feedbackChip] : ["연애", "데이트", profile.feedbackChip],
    introLines: [...profile.introLines, ...profile.dialogueLines],
    backgroundConfig: isHomeInvite
      ? (typeof getSpoonStartStageBackground === "function" ? getSpoonStartStageBackground("room", targetState, null) : null)
      : (venueLocation?.background ? { ...venueLocation.background } : null),
    plannedCost: Math.max(0, Number(planSnapshot.plannedCost) || 0),
    venueLabel,
    ...(npcActorOverride ? { npcActor: npcActorOverride } : {}),
  };

  setRomanceActiveSceneSnapshot(nextScene, targetState);
  setRomanceActivePlanSnapshot({
    ...planSnapshot,
    status: "active",
  }, targetState);
  targetState.scene = "romance";
  targetState.headline = {
    badge: isHomeInvite ? "집 초대" : "데이트 약속",
    text: profile.headlineText,
  };
  return true;
}

function completeActiveRomanceScene(targetState = state) {
  const activeScene = getRomanceActiveSceneSnapshot(targetState);
  if (!activeScene || !["date", "home-invite"].includes(String(activeScene.sceneType || "").trim().toLowerCase())) {
    return legacyCompleteActiveRomanceScene(targetState);
  }

  const completedSceneSnapshot = cloneRomanceSceneSnapshot(activeScene);

  const contactId = activeScene.contactId;
  const contact = targetState?.social?.contacts?.[contactId] || null;
  const config = getRomanceConfigByContactId(contactId);
  if (!contact || !config) {
    clearRomanceActiveSceneSnapshot(targetState);
    clearRomanceActivePlanSnapshot(targetState);
    targetState.scene = "room";
    return false;
  }

  const plannedCost = Math.max(0, Math.round(Number(activeScene.plannedCost) || 0));
  const actualCost = Math.max(0, Math.min(Math.max(0, Number(targetState.money) || 0), plannedCost));
  if (actualCost > 0 && typeof spendCash === "function") {
    spendCash(actualCost, targetState);
  }

  const isHomeInvite = String(activeScene.sceneType || "").trim().toLowerCase() === "home-invite";
  const nextStage = isHomeInvite
    ? "serious"
    : (String(contact.relationshipStage || "").trim().toLowerCase() === "serious" ? "serious" : "dating");
  const profile = isHomeInvite
    ? buildRomanceHomeInviteSceneProfile(contactId, {
        targetState,
        venueLabel: activeScene.venueLabel,
        actualCost,
        relationshipStage: contact.relationshipStage || "dating",
        nextStage,
      })
    : buildRomanceDateSceneProfile(contactId, {
        targetState,
        venueLabel: activeScene.venueLabel,
        actualCost,
        relationshipStage: contact.relationshipStage || "contact",
        nextStage,
      });

  applyRomanceSuccessHappinessGain(profile.happinessGain, targetState);

  if (typeof patchSocialContact === "function") {
    patchSocialContact(contactId, {
      relationshipStage: nextStage,
      pendingDateDay: null,
      pendingDateStatus: "",
      pendingDateLocationId: "",
      pendingHomeInviteDay: null,
      pendingHomeInviteStatus: "",
      dateCount: (Number(contact.dateCount) || 0) + (isHomeInvite ? 0 : 1),
      homeInviteCount: (Number(contact.homeInviteCount) || 0) + (isHomeInvite ? 1 : 0),
      invitedHome: isHomeInvite || Boolean(contact.invitedHome),
      lastDateDay: isHomeInvite ? (Number(contact.lastDateDay) || 0) : targetState.day,
      lastHomeInviteDay: isHomeInvite ? targetState.day : (Number(contact.lastHomeInviteDay) || 0),
      note: profile.successNote,
    }, targetState);
  }

  if (typeof patchNpcRelation === "function") {
    patchNpcRelation(config.npcId, {
      affinityDelta: profile.affinityDelta,
      attractionDelta: profile.attractionDelta,
      meetingsDelta: 1,
      lastSeenDay: targetState.day,
      flags: isHomeInvite ? { homeInvited: true } : {},
    }, targetState);
  }

  if (isHomeInvite) {
    markRomanceContactAsGirlfriend(contactId, targetState);
  }

  clearRomanceActiveSceneSnapshot(targetState);
  clearRomanceActivePlanSnapshot(targetState);

  targetState.scene = "room";
  const result = applyRomanceActionResult({
    ok: true,
    code: isHomeInvite ? "home-invite-complete" : "date-complete",
    outcome: {
      kind: isHomeInvite ? "home-invite" : "date",
      status: "completed",
      contactId,
      npcId: config.npcId,
      nextStage,
      venueLabel: activeScene.venueLabel || config.dateVenueLabel || "",
    },
    phoneStatus: {
      kicker: isHomeInvite ? "HOME" : "DATE",
      title: isHomeInvite ? `${config.label} 집 초대 완료` : `${config.label} 데이트 완료`,
      body: profile.resultBody,
      tone: "accent",
    },
    phonePreview: {
      kicker: isHomeInvite ? "HOME" : "DATE",
      title: isHomeInvite ? `${config.label} 집 초대 완료` : `${config.label} 데이트 완료`,
      body: profile.resultBody,
    },
    headline: {
      badge: isHomeInvite ? "집 초대 완료" : "데이트 완료",
      text: profile.resultBody,
    },
    feedback: {
      title: isHomeInvite ? "집 초대 완료" : "데이트 완료",
      tone: "up",
      chips: [
        { label: `${config.label}`, tone: "up" },
        { label: `${profile.relationshipLabel}`, tone: "up" },
        { label: `${profile.feedbackChip}`, tone: "info" },
        { label: `행복 +${profile.happinessGain}`, tone: "up" },
        actualCost > 0 ? { label: `${formatMoney(actualCost)} 사용`, tone: "down" } : null,
      ].filter(Boolean),
    },
  }, targetState);

  if (typeof startRomancePostDateCallSession === "function") {
    startRomancePostDateCallSession({
      contactId,
      config,
      sourceScene: completedSceneSnapshot,
      targetState,
    });
  }

  return result;
}
