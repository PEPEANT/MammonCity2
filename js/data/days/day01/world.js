const DAY01_WORLD_PLAYER_ACTOR = {
  kind: "player",
  src: CHARACTER_ART.player.standing,
  alt: "player",
  left: 40,
  bottom: 6,
  height: 84,
  zIndex: 2,
};

const DAY01_WORLD_PLAYER_WALKING_ACTOR = {
  kind: "player",
  src: CHARACTER_ART.player.walking,
  alt: "player-walking",
  left: 50,
  bottom: 4,
  height: 92,
  zIndex: 2,
};

const DAY01_WORLD_ALLEY_GIRL_ACTOR = {
  src: CHARACTER_ART.highSchoolGirl.default,
  alt: "high-school-girl",
  left: 74,
  bottom: 8,
  height: 90,
  zIndex: 1,
};

const DAY01_WORLD_ALLEY_OFFICE_WORKER_ACTOR = {
  src: CHARACTER_ART.alleyOfficeWorker.default,
  alt: "alley-office-worker",
  left: 73,
  bottom: 6,
  height: 88,
  zIndex: 1,
};

const DAY01_WORLD_ALLEY_AUNT_ACTOR = {
  src: CHARACTER_ART.alleyAunt.default,
  alt: "alley-aunt",
  left: 70,
  bottom: 5,
  height: 86,
  zIndex: 1,
};

const DAY01_WORLD_CONVENIENCE_CASHIER_ACTOR = {
  src: CHARACTER_ART.convenienceCashier.default,
  alt: "convenience-cashier",
  npcId: "convenience-cashier",
  left: 74,
  bottom: 7,
  height: 86,
  zIndex: 1,
};

const DAY01_WORLD_ALLEY_NPC_POOL = [
  {
    id: "high-school-girl",
    weight: 4,
    tag: "여고생",
    actor: DAY01_WORLD_ALLEY_GIRL_ACTOR,
    headlineBadge: "낯선 시선",
    headlineText: "교복 입은 여고생이 골목 끝 전봇대 아래에 멈춰 서 있다.",
    approachBadge: "시선 교차",
    approachText: "가까이 다가가자 여고생이 휴대폰 화면을 끄고 한 걸음 물러선다.",
  },
  {
    id: "alley-office-worker",
    weight: 3,
    tag: "직장인",
    actor: DAY01_WORLD_ALLEY_OFFICE_WORKER_ACTOR,
    headlineBadge: "골목 통화",
    headlineText: "양복 차림의 남자가 전화를 받으며 골목 입구에 멈춰 서 있다.",
    approachBadge: "짧은 통화",
    approachText: "가까이 가자 남자는 통화를 끊지 않은 채 너를 한 번 훑어보고 지나간다.",
  },
  {
    id: "alley-aunt",
    weight: 3,
    tag: "동네 주민",
    actor: DAY01_WORLD_ALLEY_AUNT_ACTOR,
    headlineBadge: "익숙한 발걸음",
    headlineText: "장바구니를 든 아주머니가 통화하며 골목을 천천히 지나간다.",
    approachBadge: "스친 대화",
    approachText: "가까이 다가가자 아주머니는 통화를 마무리하며 바삐 발걸음을 옮긴다.",
  },
];

function createWorldWanderNpc({
  id,
  weight = 1,
  tag = "",
  src,
  alt,
  left,
  bottom,
  height,
  zIndex = 1,
  sceneTitle = "",
  sceneLines = [],
  headlineBadge = "",
  headlineText = "",
  approachBadge = "",
  approachText = "",
  memoryBody = "",
}) {
  return {
    id,
    weight,
    tag,
    actor: {
      src,
      alt,
      left,
      bottom,
      height,
      zIndex,
    },
    sceneTitle,
    sceneLines,
    headlineBadge,
    headlineText,
    approachBadge,
    approachText,
    memoryBody,
  };
}

const DAY01_WORLD_TERMINAL_NPC_POOL = [
  createWorldWanderNpc({
    id: "high-school-girl",
    weight: 4,
    tag: "학생",
    src: CHARACTER_ART.highSchoolGirl.default,
    alt: "터미널 학생",
    left: 73,
    bottom: 8,
    height: 90,
    sceneTitle: "터미널 앞 환승 인파 속에서 교복 치맛자락이 먼저 눈에 들어온다",
    sceneLines: [
      "휴대폰을 내려다보던 학생이 배차 시간을 다시 확인하는 듯 걸음을 멈춘다.",
      "가까이 가면 짧게 말을 붙여볼 수 있을 것 같다.",
    ],
    headlineBadge: "환승 인파",
    headlineText: "교복 차림 학생이 정류장 유리판 앞에서 시간을 다시 확인하고 있다.",
    approachBadge: "짧은 물음",
    approachText: "학생은 버스 시간을 다시 보려는 듯 고개만 끄덕이고 곧 인파 속으로 섞여든다.",
    memoryBody: "터미널 앞을 돌다가 교복 차림 학생과 잠깐 눈이 마주쳤다.",
  }),
  createWorldWanderNpc({
    id: "alley-office-worker",
    weight: 4,
    tag: "직장인",
    src: CHARACTER_ART.alleyOfficeWorker.default,
    alt: "터미널 직장인",
    left: 67,
    bottom: 6,
    height: 88,
    sceneTitle: "양복 차림 승객이 터미널 기둥에 기대 통화를 정리하고 있다",
    sceneLines: [
      "서류가방을 쥔 손끝이 바쁘게 움직이고, 눈빛은 아직 퇴근하지 못한 얼굴이다.",
      "오늘 이 근처 분위기를 아는 사람처럼 보여 잠깐 붙잡아볼 만하다.",
    ],
    headlineBadge: "터미널 통화",
    headlineText: "양복 차림 승객이 통화를 끊고 주변 정차면을 훑어본다.",
    approachBadge: "서둘러 지나감",
    approachText: "남자는 시계를 한 번 보고는 급히 다음 승차 줄 쪽으로 몸을 돌린다.",
    memoryBody: "터미널 앞에서 서두르는 직장인과 스쳐 지나갔다.",
  }),
  createWorldWanderNpc({
    id: "npc-woman",
    weight: 2,
    tag: "홍보원",
    src: CHARACTER_ART.npcWoman.default,
    alt: "터미널 홍보원",
    left: 80,
    bottom: 7,
    height: 88,
    sceneTitle: "전단지를 든 여자가 승객들 흐름 사이에서 사람 얼굴을 빠르게 읽는다",
    sceneLines: [
      "짧은 미소와 함께 손에 든 전단 뭉치를 다시 정리한다.",
      "붙잡으면 광고 한 장쯤은 건네줄 기세다.",
    ],
    headlineBadge: "전단 홍보",
    headlineText: "전단지를 든 여자가 환승객 틈에서 눈에 띄는 얼굴을 골라내고 있다.",
    approachBadge: "홍보 전단",
    approachText: "여자는 전단 한 장만 쥐여준 채 다시 승객 무리 쪽으로 몸을 돌린다.",
    memoryBody: "터미널 앞을 한 바퀴 돌다가 전단을 나눠주는 홍보원과 스쳤다.",
  }),
];

const DAY01_WORLD_CROSSROADS_NPC_POOL = [
  createWorldWanderNpc({
    id: "alley-office-worker",
    weight: 4,
    tag: "직장인",
    src: CHARACTER_ART.alleyOfficeWorker.default,
    alt: "사거리 직장인",
    left: 72,
    bottom: 6,
    height: 88,
    sceneTitle: "사거리 횡단보도 앞에서 양복 차림 남자가 신호를 기다린다",
    sceneLines: [
      "다음 일정이 있는지 발끝이 바닥을 빠르게 두드린다.",
      "한마디 붙이면 오늘 동선에 대한 감이 조금 더 잡힐 것 같다.",
    ],
    headlineBadge: "신호 대기",
    headlineText: "양복 차림 남자가 횡단보도 앞에서 신호가 바뀌기만 기다리고 있다.",
    approachBadge: "바쁜 발걸음",
    approachText: "남자는 짧게 눈인사만 남기고 신호가 바뀌자마자 반대편으로 건너간다.",
    memoryBody: "사거리에서 바삐 움직이는 직장인과 짧게 시선을 주고받았다.",
  }),
  createWorldWanderNpc({
    id: "alley-aunt",
    weight: 3,
    tag: "동네 주민",
    src: CHARACTER_ART.alleyAunt.default,
    alt: "사거리 아주머니",
    left: 64,
    bottom: 5,
    height: 86,
    sceneTitle: "장바구니를 든 아주머니가 사거리 모퉁이에서 잠깐 걸음을 늦춘다",
    sceneLines: [
      "상가 간판을 훑어보는 눈빛이 오늘 동네 소문을 다 알고 있을 것처럼 보인다.",
      "가볍게 말을 걸어보면 생활감 있는 이야기가 튀어나올 법하다.",
    ],
    headlineBadge: "생활 동선",
    headlineText: "장바구니를 든 아주머니가 사거리 모퉁이에서 주변 상가를 훑어본다.",
    approachBadge: "스친 생활감",
    approachText: "아주머니는 장을 더 봐야 한다는 듯 손만 흔들고 다시 발걸음을 옮긴다.",
    memoryBody: "사거리를 서성이다가 생활 냄새가 진한 아주머니와 스쳐 지나갔다.",
  }),
  createWorldWanderNpc({
    id: "npc-woman",
    weight: 3,
    tag: "홍보원",
    src: CHARACTER_ART.npcWoman.default,
    alt: "사거리 홍보원",
    left: 80,
    bottom: 7,
    height: 88,
    sceneTitle: "상가 전단을 든 여자가 사거리 유동 인구를 노리고 서 있다",
    sceneLines: [
      "눈이 마주치는 순간 바로 말을 걸 준비가 된 사람처럼 웃음이 빠르다.",
      "가까이 가면 오늘 중심가 분위기를 짐작할 말이 튀어나올지도 모른다.",
    ],
    headlineBadge: "상가 홍보",
    headlineText: "상가 전단을 든 여자가 사람 흐름이 가장 많은 모퉁이를 잡고 서 있다.",
    approachBadge: "상가 제안",
    approachText: "여자는 오늘 행사가 많다며 전단 한 장을 건네고 곧 다른 행인에게 말을 붙인다.",
    memoryBody: "사거리에서 상가 홍보를 하는 여자와 잠깐 스쳐 지나갔다.",
  }),
];

const DAY01_WORLD_STATION_FRONT_NPC_POOL = [
  createWorldWanderNpc({
    id: "high-school-girl",
    weight: 3,
    tag: "학생",
    src: CHARACTER_ART.highSchoolGirl.default,
    alt: "역 앞 학생",
    left: 76,
    bottom: 8,
    height: 90,
    sceneTitle: "역 앞 전단지 더미 옆에 학생 하나가 발걸음을 늦춘다",
    sceneLines: [
      "전단을 읽는 척하면서도 시선은 계속 사람 흐름을 쫓는다.",
      "붙잡으면 짧은 질문 정도는 받아줄 것 같은 거리다.",
    ],
    headlineBadge: "역 앞 시선",
    headlineText: "학생 하나가 전단지 더미 옆에서 유리문 쪽을 흘끗거린다.",
    approachBadge: "짧은 대답",
    approachText: "학생은 고개만 살짝 끄덕이고 다시 역전광장 사람들 쪽으로 시선을 돌린다.",
    memoryBody: "역 앞을 돌아다니다 전단 앞에 멈춘 학생과 잠깐 눈이 마주쳤다.",
  }),
  createWorldWanderNpc({
    id: "alley-office-worker",
    weight: 4,
    tag: "직장인",
    src: CHARACTER_ART.alleyOfficeWorker.default,
    alt: "역 앞 직장인",
    left: 68,
    bottom: 6,
    height: 88,
    sceneTitle: "역전광장 가장자리에서 직장인 하나가 숨 돌릴 틈을 찾는다",
    sceneLines: [
      "서류가방 손잡이를 쥔 손에 힘이 꽤 들어가 있다.",
      "오늘 사람 흐름을 묻기엔 나쁘지 않은 상대처럼 보인다.",
    ],
    headlineBadge: "역전광장",
    headlineText: "직장인 하나가 역전광장 가장자리에서 잠깐 숨을 고른다.",
    approachBadge: "짧은 답변",
    approachText: "남자는 급히 움직이기 전 짧은 말만 남기고 다시 전단 쪽으로 향한다.",
    memoryBody: "역 앞 광장을 한 바퀴 돌다가 바쁜 직장인과 스쳐 지나갔다.",
  }),
  createWorldWanderNpc({
    id: "station-homeless",
    weight: 2,
    tag: "노숙인",
    src: CHARACTER_ART.casinoHomeless.default,
    alt: "역 앞 노숙인",
    left: 84,
    bottom: 4,
    height: 84,
    sceneTitle: "역 앞 벤치 끝에 앉은 사람이 네 쪽을 한번 올려다본다",
    sceneLines: [
      "지나가는 사람들 틈에 섞이지 않고 묵직한 시선 하나만 남아 있다.",
      "가까이 가면 이 동네 밑바닥 이야기를 한 조각쯤 들을 수도 있을 것 같다.",
    ],
    headlineBadge: "묵직한 시선",
    headlineText: "역 앞 벤치 끝에 앉은 사람이 잠깐 너를 올려다본다.",
    approachBadge: "낮은 목소리",
    approachText: "그는 오늘은 말을 길게 하고 싶지 않다는 듯 고개만 천천히 끄덕인다.",
    memoryBody: "역 앞 벤치 끝에 앉은 사람의 시선이 이상하게 오래 남았다.",
  }),
];

const DAY01_WORLD_DOWNTOWN_NPC_POOL = [
  createWorldWanderNpc({
    id: "npc-woman",
    weight: 4,
    tag: "홍보원",
    src: CHARACTER_ART.npcWoman.default,
    alt: "중심가 홍보원",
    left: 78,
    bottom: 7,
    height: 88,
    sceneTitle: "중심가 간판 불빛 아래에서 홍보원이 사람들 발걸음을 노린다",
    sceneLines: [
      "밝은 조명 아래서 웃는 얼굴이 지나치게 능숙하다.",
      "붙잡히면 돈 냄새 나는 이야기 한 마디쯤은 듣게 될 것 같다.",
    ],
    headlineBadge: "번화가 제안",
    headlineText: "간판 불빛 아래 선 홍보원이 지나가는 사람을 골라 말을 붙일 타이밍을 재고 있다.",
    approachBadge: "화려한 권유",
    approachText: "여자는 오늘 밤이 길다며 의미심장한 웃음만 남기고 다른 손님 쪽으로 몸을 돌린다.",
    memoryBody: "중심가를 한 바퀴 돌다가 화려한 홍보원과 짧게 시선을 주고받았다.",
  }),
  createWorldWanderNpc({
    id: "station-homeless",
    weight: 3,
    tag: "노숙인",
    src: CHARACTER_ART.casinoHomeless.default,
    alt: "중심가 노숙인",
    left: 64,
    bottom: 4,
    height: 84,
    sceneTitle: "번쩍이는 간판 아래 반쯤 웅크린 사람이 네 움직임을 따라본다",
    sceneLines: [
      "사람들은 모른 척 지나가지만 그 시선만은 묘하게 또렷하다.",
      "가까이 가면 번화가 바닥의 냄새를 조금은 들을 수 있을 것 같다.",
    ],
    headlineBadge: "바닥의 냄새",
    headlineText: "간판 그림자 아래 웅크린 사람이 지나가는 흐름을 무심하게 지켜본다.",
    approachBadge: "짧은 경고",
    approachText: "그는 오늘 번화가는 겉보다 더 시끄럽다는 말만 남기고 다시 몸을 웅크린다.",
    memoryBody: "번화가 그림자 아래 웅크린 사람에게서 묘한 경고 같은 기운을 느꼈다.",
  }),
  createWorldWanderNpc({
    id: "alley-office-worker",
    weight: 3,
    tag: "직장인",
    src: CHARACTER_ART.alleyOfficeWorker.default,
    alt: "중심가 직장인",
    left: 72,
    bottom: 6,
    height: 88,
    sceneTitle: "술집 간판 아래에서 직장인 하나가 잠깐 발걸음을 멈춘다",
    sceneLines: [
      "금방이라도 다른 약속으로 사라질 사람처럼 눈빛이 빠르게 흔들린다.",
      "지금 붙잡으면 중심가에서 돈이 도는 방향을 조금은 읽을 수 있을지 모른다.",
    ],
    headlineBadge: "번화가 피로",
    headlineText: "직장인 하나가 중심가 간판 아래서 짧게 한숨을 고른다.",
    approachBadge: "피곤한 한숨",
    approachText: "남자는 오늘은 일 이야기까지 하고 싶지 않다는 듯 어깨만 한번 으쓱한다.",
    memoryBody: "중심가를 서성이다 피곤한 얼굴의 직장인과 잠깐 스쳤다.",
  }),
];

const DAY01_WORLD_UNIVERSITY_NPC_POOL = [
  createWorldWanderNpc({
    id: "high-school-girl",
    weight: 4,
    tag: "학생",
    src: CHARACTER_ART.highSchoolGirl.default,
    alt: "대학가 학생",
    left: 74,
    bottom: 8,
    height: 90,
    sceneTitle: "대학가 건물 유리문 앞에서 학생 하나가 시간표를 확인한다",
    sceneLines: [
      "전단과 강의실 안내문 사이에서 잠깐 멈춘 눈빛이 어딘가 바쁘다.",
      "가까이 가면 학교 주변 분위기를 짧게 물어볼 수 있을 것 같다.",
    ],
    headlineBadge: "캠퍼스 기류",
    headlineText: "학생 하나가 시간표를 확인하다가 잠깐 고개를 든다.",
    approachBadge: "짧은 답",
    approachText: "학생은 바쁜 표정으로 한 마디만 남기고 다시 건물 안쪽으로 사라진다.",
    memoryBody: "대학가를 한 바퀴 돌다가 학생 하나와 잠깐 눈이 마주쳤다.",
  }),
  createWorldWanderNpc({
    id: "npc-woman",
    weight: 3,
    tag: "선배",
    src: CHARACTER_ART.npcWoman.default,
    alt: "캠퍼스 선배",
    left: 67,
    bottom: 7,
    height: 88,
    sceneTitle: "캠퍼스 배너 옆에서 선배처럼 보이는 사람이 네 쪽을 한번 본다",
    sceneLines: [
      "이미 여기저기 정보가 많은 사람처럼 표정이 차분하다.",
      "붙잡으면 이 구역에서 써먹을 만한 말 한마디는 건질 수 있을 것 같다.",
    ],
    headlineBadge: "캠퍼스 인맥",
    headlineText: "배너 옆에 서 있던 선배처럼 보이는 사람이 사람 흐름을 천천히 훑는다.",
    approachBadge: "담담한 조언",
    approachText: "상대는 여기선 사람보다 정보 흐름을 읽는 게 먼저라고 짧게 말하고 지나간다.",
    memoryBody: "대학가에서 선배처럼 보이는 사람의 담담한 시선이 기억에 남았다.",
  }),
  createWorldWanderNpc({
    id: "career-center-runner",
    weight: 3,
    tag: "상담원",
    src: CHARACTER_ART.casinoGuide.default,
    alt: "취업지원 홍보원",
    left: 82,
    bottom: 6,
    height: 88,
    sceneTitle: "취업지원센터 쪽에서 안내 배지를 단 사람이 학생들을 살피고 있다",
    sceneLines: [
      "누가 상담이 급한지 금방 알아챌 것 같은 눈빛이다.",
      "말을 걸면 이 구역에서 준비해야 할 방향을 짚어줄지도 모른다.",
    ],
    headlineBadge: "상담 안내",
    headlineText: "안내 배지를 단 사람이 취업지원센터 쪽으로 사람들을 이끈다.",
    approachBadge: "짧은 안내",
    approachText: "상담원은 안내문 위치만 짚어주고 다음 학생 쪽으로 발걸음을 옮긴다.",
    memoryBody: "대학가를 걷다 취업지원 안내를 하는 사람과 잠깐 스쳐 지나갔다.",
  }),
];

const DAY01_WORLD_CAMPUS_PARK_NPC_POOL = [
  createWorldWanderNpc({
    id: "npc-woman",
    weight: 4,
    tag: "선배",
    src: CHARACTER_ART.npcWoman.default,
    alt: "공원 선배",
    left: 70,
    bottom: 7,
    height: 88,
    sceneTitle: "벤치 끝에 앉은 선배처럼 보이는 사람이 사람 흐름을 천천히 바라본다",
    sceneLines: [
      "급한 기색 없이 주변을 보는 태도가 오히려 더 눈에 들어온다.",
      "잠깐 말을 붙이면 느슨한 조언 한마디쯤은 건질 수 있을 것 같다.",
    ],
    headlineBadge: "느슨한 쉼표",
    headlineText: "벤치 끝에 앉은 선배처럼 보이는 사람이 공원 풍경을 천천히 훑는다.",
    approachBadge: "가벼운 한마디",
    approachText: "상대는 숨부터 고르고 움직이라는 말만 남긴 채 다시 벤치 등에 몸을 기댄다.",
    memoryBody: "공원을 걷다 느긋한 선배 같은 사람에게서 묘한 여유를 느꼈다.",
  }),
  createWorldWanderNpc({
    id: "high-school-girl",
    weight: 3,
    tag: "학생",
    src: CHARACTER_ART.highSchoolGirl.default,
    alt: "공원 학생",
    left: 80,
    bottom: 8,
    height: 90,
    sceneTitle: "공원 벤치 근처에서 학생 하나가 이어폰을 빼고 주변을 둘러본다",
    sceneLines: [
      "과제 이야기와 알바 이야기가 뒤섞인 소음 속에서도 표정이 또렷하다.",
      "가까이 가면 오늘 대학가 분위기를 가볍게 들을 수 있을 것 같다.",
    ],
    headlineBadge: "공원 소문",
    headlineText: "이어폰을 뺀 학생 하나가 공원 벤치 근처에서 주변을 둘러본다.",
    approachBadge: "짧은 응답",
    approachText: "학생은 벤치 쪽으로 돌아서며 오늘은 사람도 정보도 많이 돈다는 말만 남긴다.",
    memoryBody: "캠퍼스 공원을 걷다 학생 하나에게서 오늘 분위기를 짐작할 말을 들었다.",
  }),
  createWorldWanderNpc({
    id: "park-busker",
    weight: 3,
    tag: "버스커",
    src: CHARACTER_ART.casinoGuide.default,
    alt: "공원 버스커",
    left: 60,
    bottom: 6,
    height: 88,
    sceneTitle: "기타 케이스를 옆에 둔 사람이 공원 가장자리에서 쉬고 있다",
    sceneLines: [
      "막 연주를 끝냈는지 손끝이 아직 느리게 리듬을 타고 있다.",
      "붙잡으면 이 구역 사람 흐름에 대한 감각적인 말이 돌아올지도 모른다.",
    ],
    headlineBadge: "느린 리듬",
    headlineText: "기타 케이스를 둔 사람이 공원 가장자리에서 쉬며 사람 흐름을 듣고 있다.",
    approachBadge: "감각적인 한마디",
    approachText: "그는 오늘 공기에는 조급함보다 기다림이 더 많이 섞여 있다고 짧게 말한다.",
    memoryBody: "캠퍼스 공원을 돌다가 느린 리듬을 가진 버스커와 스쳐 지나갔다.",
  }),
];

const DAY01_WORLD_OFFICE_PLAZA_NPC_POOL = [
  createWorldWanderNpc({
    id: "office-plaza-worker",
    weight: 5,
    tag: "직장인",
    src: CHARACTER_ART.alleyOfficeWorker.default,
    alt: "배금디지털단지 직장인",
    left: 70,
    bottom: 6,
    height: 88,
    sceneTitle: "출근 시간대 직장인들이 배금디지털단지 입구를 빠르게 가른다",
    sceneLines: [
      "사원증 줄이 재킷 위로 흔들리고, 커피 컵과 노트북 가방이 동시에 부딪힌다.",
      "여기서는 시간표와 직장 냄새가 같이 움직인다.",
    ],
    headlineBadge: "출근 러시",
    headlineText: "배금디지털단지 입구에서 직장인들이 버스에서 쏟아지듯 흩어진다.",
    approachBadge: "바쁜 눈빛",
    approachText: "붙잡아 말을 걸기엔 다들 이미 다음 일정으로 몸이 기울어 있다.",
    memoryBody: "배금디지털단지 입구 앞에서 출근 러시 한가운데를 잠깐 스쳤다.",
  }),
  createWorldWanderNpc({
    id: "office-plaza-recruiter",
    weight: 2,
    tag: "채용담당",
    src: CHARACTER_ART.npcWoman.default,
    alt: "배금디지털단지 채용담당",
    left: 82,
    bottom: 7,
    height: 88,
    sceneTitle: "채용 배지를 단 여자가 로비 게시판 앞에서 사람 얼굴을 골라본다",
    sceneLines: [
      "계약직 전단과 출입증 안내를 한 손에 쥔 채 누군가를 기다리는 표정이다.",
      "공고앱에 뜬 이름들이 실제 회사로 이어지는 느낌이 이 구역에선 더 선명하다.",
    ],
    headlineBadge: "채용 공기",
    headlineText: "채용 배지를 단 사람이 로비 게시판 앞에서 사람 흐름을 살핀다.",
    approachBadge: "짧은 응답",
    approachText: "오늘도 계약직 문의가 많다며 여자는 다시 안내 데스크 쪽으로 몸을 돌린다.",
    memoryBody: "배금디지털단지 안내 데스크 앞에서 채용담당처럼 보이는 사람을 봤다.",
  }),
];

const DAY01_WORLD_LOGISTICS_HUB_NPC_POOL = [
  createWorldWanderNpc({
    id: "logistics-checker",
    weight: 4,
    tag: "현장직",
    src: CHARACTER_ART.alleyOfficeWorker.default,
    alt: "물류허브 현장직",
    left: 76,
    bottom: 6,
    height: 88,
    sceneTitle: "물류허브 앞에서 형광 조끼를 걸친 직원이 출고 라벨을 다시 확인한다",
    sceneLines: [
      "출고 시간표와 상차 순서가 적힌 클립보드를 손가락으로 빠르게 훑는다.",
      "조금만 늦어도 오늘 물량이 바로 밀릴 것 같은 공기가 진하다.",
    ],
    headlineBadge: "물류 동선",
    headlineText: "물류허브 출입문 앞에서 직원이 오늘 출고 라벨을 다시 확인하고 있다.",
    approachBadge: "짧은 브리핑",
    approachText: "직원은 오늘은 물량이 많다며 바닥 표시선 안으로는 들어오지 말라고만 한다.",
    memoryBody: "회사구역 물류허브 앞에서 출고 준비를 하는 직원을 봤다.",
  }),
  createWorldWanderNpc({
    id: "logistics-driver",
    weight: 2,
    tag: "기사",
    src: CHARACTER_ART.casinoGuide.default,
    alt: "물류허브 기사",
    left: 63,
    bottom: 7,
    height: 88,
    sceneTitle: "납품 기사 하나가 물류동 입구에서 시동을 걸지 말지 잠깐 망설인다",
    sceneLines: [
      "무전기 잡음과 후진 경고음이 뒤섞이며 새벽 현장 특유의 긴장을 만든다.",
      "차량이 있으면 이쪽 일감이 왜 더 비싸지는지 몸으로 느껴진다.",
    ],
    headlineBadge: "납품 대기",
    headlineText: "물류동 입구에서 기사 하나가 배차 연락을 다시 확인한다.",
    approachBadge: "현장 냄새",
    approachText: "그는 차만 있으면 콜은 계속 돈다고 중얼거린 뒤 다시 무전기로 시선을 돌린다.",
    memoryBody: "물류허브 앞에서 장거리 납품 기사가 배차 연락을 기다리고 있었다.",
  }),
];

const DAY01_WORLD_BUS_ROUTE_STOPS = [
  {
    id: "bus-stop",
    emoji: "🚌",
    label: "배금시외버스터미널",
    note: "현재 정차 중인 정류장, 시외·고속버스 환승",
    type: "major",
    eta: "지금",
    badge: "현재 정류장",
    travelVia: "",
  },
  {
    id: "downtown",
    emoji: "🛍️",
    label: "중심상업구역",
    note: "로데오거리, 백화점, 식당가",
    type: "normal",
    eta: "5분",
    badge: "생활권",
    travelVia: "bus",
  },
  {
    id: "city-crossroads",
    emoji: "🚦",
    label: "배금 사거리",
    note: "중앙 환승센터, 편의점과 상가 골목",
    type: "normal",
    eta: "8분",
    badge: "환승",
    travelVia: "bus",
  },
  {
    id: "office-plaza",
    emoji: "🏢",
    label: "배금디지털단지",
    note: "단지 입구, 배금전자 사무동, 생산동, 배금연구소",
    type: "major",
    eta: "11분",
    badge: "회사구역",
    travelVia: "bus",
  },
  {
    id: "baegeum-hospital",
    emoji: "🏥",
    label: "배금병원",
    note: "응급의료센터, 성형 상담 구역",
    type: "major",
    eta: "12분",
    badge: "의료",
    travelVia: "bus",
  },
  {
    id: "library",
    emoji: "📚",
    label: "도서관 구역",
    note: "도서관, 시험장, 대학가로 이어지는 학습 동선",
    type: "normal",
    eta: "16분",
    badge: "학습",
    travelVia: "bus",
  },
  {
    id: "station-front",
    emoji: "🚉",
    label: "배금역",
    note: "도시철도 1호선 환승, 역전광장 진입",
    type: "major",
    eta: "20분",
    badge: "철도",
    travelVia: "bus",
  },
];

const DAY01_WORLD_TERMINAL_SCHEDULE = [
  {
    id: "seoul-premium",
    destination: "서울시외버스터미널",
    routeType: "프리미엄/고속",
    platform: "1번 홈",
    status: "여유",
    times: [
      { time: "06:00", label: "우등" },
      { time: "06:30", label: "프리미엄", highlight: true },
      { time: "07:00", label: "우등" },
      { time: "07:30", label: "일반" },
      { time: "08:00", label: "프리미엄" },
      { time: "수시운행", label: "30분 간격" },
    ],
  },
  {
    id: "metropolis-express",
    destination: "메트로폴리스 광역터미널",
    routeType: "직행/고속",
    platform: "3번 홈",
    status: "혼잡",
    escapeEnding: true,
    times: [
      { time: "09:00", label: "우등" },
      { time: "12:00", label: "프리미엄", highlight: true },
      { time: "15:00", label: "우등" },
      { time: "18:30", label: "일반" },
      { time: "20:00", label: "심야우등" },
    ],
  },
  {
    id: "seosan-local",
    destination: "서산시외버스터미널",
    routeType: "시외/일반",
    platform: "5번 홈",
    status: "보통",
    times: [
      { time: "08:00", label: "일반" },
      { time: "10:30", label: "우등" },
      { time: "14:00", label: "일반" },
      { time: "16:30", label: "우등", highlight: true },
      { time: "19:00", label: "일반" },
    ],
  },
];

const DAY01_WORLD_BUS_MAP = {
  variant: "bus-terminal",
  routeTitle: "배금 100번",
  routeSubtitle: "배금시외버스터미널 ↔ 배금디지털단지 ↔ 배금역",
  serviceLabel: "간선버스",
  statusLabel: "노선 개편",
  nextStopLabel: "중심상업구역",
  intervalLabel: "10~15분",
  helperText: "아래 정류장 버튼을 누르면 바로 해당 정차 구간으로 이동한다.",
  routeTabLabel: "노선도",
  timetableTabLabel: "터미널 시간표",
  terminalName: "배금시외버스터미널",
  terminalSubtitle: "출발 시간표 및 운행 정보",
  terminalNotice: "실시간 교통 상황과 승차 인원에 따라 출발 시각은 조금씩 달라질 수 있다.",
  timetableEntries: DAY01_WORLD_TERMINAL_SCHEDULE,
  nodes: DAY01_WORLD_BUS_ROUTE_STOPS,
};

const DAY01_WORLD_BUS_ROUTE_OPTIONS = DAY01_WORLD_BUS_ROUTE_STOPS.map((stop) => ({
  title: stop.label,
  action: "move",
  targetLocation: stop.id,
  travelVia: stop.travelVia,
  uiVariant: "bus-route",
  routeIcon: stop.emoji,
  routeEta: stop.eta,
  routeBadge: stop.badge,
  routeStopType: stop.type,
  description: stop.note,
}));

const DAY01_WORLD_BUS_TIMETABLE_OPTIONS = [
  {
    title: "정류장 자리로 돌아간다",
    action: "move",
    targetLocation: "bus-stop",
  },
];

const DAY01_WORLD_BUS_TERMINAL_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/bus-terminal-exterior.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)",
};

const DAY01_WORLD_EXPRESS_BUS_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/bus-express-interior.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.28) 100%)",
};

const DAY01_WORLD_BUSAN_CASINO_EXTERIOR_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day03/casino-exterior.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.26) 100%)",
};

const DAY01_WORLD_BUSAN_CASINO_INTERIOR_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day03/casino-interior.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.34) 100%)",
};

const DAY01_WORLD_METROPOLIS_ENDING_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/metropolis-ending.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.24) 100%)",
};

const DAY01_WORLD_CITY_CROSSROADS_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/city-crossroads.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.2) 100%)",
};

const DAY01_WORLD_BUS_STOP_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/bus-terminal-exterior.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.16) 100%)",
};

const DAY01_WORLD_BUS_TRAVEL_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/bus-city-interior.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.24) 100%)",
};

const DAY01_WORLD_WALKING_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/street-walk.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.18) 100%)",
};

const DAY01_WORLD_WALKING_BACKGROUND_2 = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/street-walk-2.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)",
};

const DAY01_WORLD_WALKING_BACKGROUND_3 = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/street-walk-3.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.22) 100%)",
};

const DAY01_WORLD_DOWNTOWN_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/downtown-street.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.18) 100%)",
};

const DAY01_WORLD_STATION_FRONT_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/station-front.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.18) 100%)",
};

const DAY01_WORLD_STATION_INTERIOR_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/station-interior.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.18) 100%)",
};

const DAY01_WORLD_STATION_SEOUL_ROUTE_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/station-seoul-route.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.18) 100%)",
};

const DAY01_WORLD_STUDY_HUB_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/library-building.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.22) 100%)",
};

const DAY01_WORLD_LIBRARY_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/library-interior.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.24) 100%)",
};

const DAY01_WORLD_EXAM_CENTER_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/university-classroom.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.22) 100%)",
};

const DAY01_WORLD_UNIVERSITY_DISTRICT_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/university-building.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.22) 100%)",
};

const DAY01_WORLD_CAMPUS_PARK_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/campus-park.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.18) 100%)",
};

const DAY01_WORLD_BAEGEUM_HOSPITAL_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/baegeum-hospital.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.2) 100%)",
};

const DAY01_WORLD_CONVENIENCE_STORE_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/convenience-store.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.16) 100%)",
};

const DAY01_WORLD_LOTTO_RETAILER_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/commercial/lotto-retailer-exterior.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.18) 100%)",
};

const DAY01_WORLD_LOTTO_RETAILER_INTERIOR_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/commercial/lotto-retailer-interior.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)",
};

const DAY01_WORLD_MCDONALDS_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/commercial/mcdonalds-building-exterior.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)",
};

const DAY01_WORLD_MCDONALDS_COUNTER_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/commercial/mcdonalds-counter.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)",
};

const DAY01_WORLD_OFFICE_PLAZA_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/industrial/digital-complex-exterior.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(7, 13, 24, 0.1) 0%, rgba(7, 13, 24, 0.24) 100%)",
};

const DAY01_WORLD_DIGITAL_COMPLEX_VIEW_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/industrial/digital-complex-view.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(7, 13, 24, 0.12) 0%, rgba(7, 13, 24, 0.28) 100%)",
};

const DAY01_WORLD_MOBILITY_CONTROL_CENTER_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/station-interior.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(7, 13, 24, 0.12) 0%, rgba(7, 13, 24, 0.28) 100%)",
};

const DAY01_WORLD_LOGISTICS_CENTER_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/commercial/logistics-center-exterior.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(8, 11, 18, 0.12) 0%, rgba(8, 11, 18, 0.26) 100%)",
};

const DAY01_WORLD_LOGISTICS_HUB_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/industrial/factory-exterior.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(8, 11, 18, 0.14) 0%, rgba(8, 11, 18, 0.3) 100%)",
};

const DAY01_WORLD_PRODUCTION_LINE_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/industrial/production-line.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(8, 11, 18, 0.16) 0%, rgba(8, 11, 18, 0.34) 100%)",
};

const DAY01_WORLD_TOWER_CAFE_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/industrial/research-lab-exterior.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(12, 10, 8, 0.12) 0%, rgba(12, 10, 8, 0.24) 100%)",
};

const DAY01_WORLD_RESEARCH_LAB_INTERIOR_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/industrial/research-lab-interior.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(10, 12, 18, 0.1) 0%, rgba(10, 12, 18, 0.28) 100%)",
};

const DAY01_WORLD_LOCATIONS = {
  "apt-alley": {
    label: "배금고시원 앞",
    speaker: "배금고시원 앞",
    title: "고시원 골목 바람이 아직 잠에서 덜 깬다",
    lines: [
      "좁은 고시원 입구와 편의점 불빛이 뒤섞인 주거 골목이다.",
      "고시원으로 들어갈지, 사거리 쪽으로 걸어 나갈지 정하면 된다.",
    ],
    tags: ["집앞", "주거", "고시원"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    randomNpcPool: DAY01_WORLD_ALLEY_NPC_POOL,
    exits: ["city-crossroads", "bus-stop"],
    options: [
      {
        title: "배금시 사거리로 간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
      {
        title: "버스 정류장으로 간다",
        action: "move",
        targetLocation: "bus-stop",
      },
      {
        title: "돌아다닌다",
        action: "wander",
      },
      {
        title: "다시 집으로 들어간다",
        action: "home",
      },
    ],
  },
  "silver-home-front": {
    x: 10,
    y: 84,
    icon: "🏢",
    shortLabel: "아파트 앞",
    note: "배금아파트 로비를 거쳐 나오는 주거 구역 출입점.",
    zoneTone: "residential",
    order: 11,
  },
  "golden-home-front": {
    x: 23,
    y: 84,
    icon: "🚘",
    shortLabel: "복합빌딩 앞",
    note: "배금복합빌딩 차고 램프와 입구가 이어지는 주거 구역 출입점.",
    zoneTone: "residential",
    order: 12,
  },
  "bus-stop": {
    label: "배금시외버스터미널 앞",
    speaker: "배금시외버스터미널 앞",
    title: "터미널 앞 공기가 버스 소음과 함께 길게 번진다",
    background: DAY01_WORLD_BUS_TERMINAL_BACKGROUND,
    lines: [
      "시내버스 정차면과 시외버스 홈이 한곳에 붙어 있어 사람 흐름이 끊이지 않는다.",
      "이제 노선도와 시간표는 전광판보다 스마트폰 앱으로 보는 편이 더 빠르다.",
    ],
    tags: ["환승", "대기", "터미널"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    randomNpcPool: DAY01_WORLD_TERMINAL_NPC_POOL,
    exits: ["apt-alley", "city-crossroads", "bus-stop-map"],
    options: [
      {
        title: "터미널 안내판 앞으로 간다",
        action: "move",
        targetLocation: "bus-stop-map",
      },
      {
        title: "현재 집 쪽으로 돌아간다",
        action: "move-home",
      },
      {
        title: "배금시 사거리로 간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
    ],
  },
  "bus-stop-map": {
    label: "배금시외버스터미널 안내판 앞",
    speaker: "배금시외버스터미널",
    title: "전광판 아래에서 스마트폰으로 버스 앱을 켠다",
    background: DAY01_WORLD_BUS_TERMINAL_BACKGROUND,
    lines: [
      "시내버스 노선도와 시외버스 시간표는 이제 폰 화면으로 보는 쪽이 훨씬 깔끔하다.",
      "배금버스 앱을 열면 시내 노선과 터미널 시간표, 메트로폴리스행 고속버스까지 한 번에 확인할 수 있다.",
    ],
    tags: ["환승", "터미널", "스마트폰"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["bus-stop", "city-crossroads", "station-front", "downtown", "library", "exam-center", "apt-alley"],
    options: [
      {
        title: "스마트폰으로 배금버스 노선도를 본다",
        action: "open-bus-route-app",
      },
      {
        title: "스마트폰으로 터미널 시간표를 본다",
        action: "open-bus-timetable-app",
      },
      {
        title: "정류장 자리로 돌아간다",
        action: "move",
        targetLocation: "bus-stop",
      },
    ],
  },
  "bus-ride": {
    label: "버스 이동 중",
    speaker: "버스 창가",
    title: "버스가 천천히 다음 정류장으로 나아간다",
    background: DAY01_WORLD_BUS_TRAVEL_BACKGROUND,
    lines: [
      "창밖 간판과 가로등이 차창 유리에 길게 번진다.",
      "내릴 타이밍만 놓치지 않으면 된다.",
    ],
    tags: ["이동", "버스", "창가"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    options: [
      {
        title: "도착해서 내린다",
        action: "complete-bus-travel",
      },
    ],
  },
  "walk-travel": {
    label: "걷는 중",
    speaker: "길거리",
    title: "걷는 중...",
    background: DAY01_WORLD_WALKING_BACKGROUND,
    lines: [
      "골목과 도로를 따라 다음 장소 쪽으로 발걸음을 옮긴다.",
      "도착할 때까지 리듬을 잃지 않고 계속 걷는다.",
    ],
    tags: ["이동", "도보", "길거리"],
    actors: [DAY01_WORLD_PLAYER_WALKING_ACTOR],
    options: [
      {
        title: "도착한다",
        action: "complete-walk-travel",
      },
    ],
  },
  "express-bus-travel": {
    label: "부산역행 고속버스",
    speaker: "고속버스 좌석",
    title: "고속버스가 부산역 방향으로 길게 달린다",
    background: DAY01_WORLD_EXPRESS_BUS_BACKGROUND,
    lines: [
      "커튼 틈으로 야경과 도로 표지판이 빠르게 밀려난다.",
      "부산역 쪽으로 가까워질수록 카지노 간판이 보일 거라는 말이 머릿속을 맴돈다.",
    ],
    tags: ["이동", "고속버스", "부산역"],
    actors: [],
    cityMapHidden: true,
    options: [
      {
        title: "도착해서 내린다",
        action: "complete-bus-travel",
      },
    ],
  },
  "city-crossroads": {
    label: "배금 사거리",
    speaker: "배금 사거리",
    title: "사거리의 소음이 하루 방향을 흔든다",
    background: DAY01_WORLD_CITY_CROSSROADS_BACKGROUND,
    lines: [
      "사람 흐름이 갈라지는 상업 구역의 허브다.",
      "역 앞과 중심가, 병원 쪽으로 이어지고 편의점과 새 맥도날드도 바로 눈에 들어온다.",
    ],
    tags: ["허브", "상업 구역", "유동"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    randomNpcPool: DAY01_WORLD_CROSSROADS_NPC_POOL,
    exits: ["bus-stop", "station-front", "downtown", "baegeum-hospital", "convenience-store", "mcdonalds"],
    options: [
      {
        title: "버스 정류장으로 간다",
        action: "move",
        targetLocation: "bus-stop",
      },
      {
        title: "배금역 앞으로 간다",
        action: "move",
        targetLocation: "station-front",
      },
      {
        title: "배금 중심가로 간다",
        action: "move",
        targetLocation: "downtown",
      },
      {
        title: "배금병원 쪽으로 간다",
        action: "move",
        targetLocation: "baegeum-hospital",
      },
      {
        title: "편의점으로 들어간다",
        action: "move",
        targetLocation: "convenience-store",
      },
      {
        title: "맥도날드로 들어간다",
        action: "move",
        targetLocation: "mcdonalds",
      },
    ],
  },
  "station-front": {
    label: "배금역 앞",
    speaker: "배금역 앞",
    title: "역 앞 인파가 알바 냄새를 몰고 온다",
    background: DAY01_WORLD_STATION_FRONT_BACKGROUND,
    lines: [
      "값싼 음식 냄새와 구인 전단지가 제일 빨리 모이는 곳이다.",
      "역 안으로 들어가거나 사거리 쪽으로 되돌아갈 수 있다.",
    ],
    tags: ["알바", "식사", "유동인구"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    randomNpcPool: DAY01_WORLD_STATION_FRONT_NPC_POOL,
    exits: ["bus-stop", "city-crossroads", "station-interior", "logistics-center", "lotto-retailer", "busan-casino-exterior"],
    options: [
      {
        title: "버스 정류장으로 간다",
        action: "move",
        targetLocation: "bus-stop",
      },
      {
        title: "배금시 사거리로 돌아간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
      {
        title: "배금역 안으로 들어간다",
        action: "move",
        targetLocation: "station-interior",
      },
      {
        title: "배금 물류센터 앞으로 간다",
        action: "move",
        targetLocation: "logistics-center",
        travelMinutes: 8,
        keepVisible: true,
      },
      {
        title: "로또판매장으로 간다",
        action: "move",
        targetLocation: "lotto-retailer",
        travelMinutes: 3,
        keepVisible: true,
      },
      {
        title: "부산역 카지노행 고속버스를 탄다",
        action: "move",
        targetLocation: "busan-casino-exterior",
        travelMinutes: 60,
        travelMethod: "고속버스",
        travelSceneId: "express-bus-travel",
        keepVisible: true,
      },
      {
        title: "역 앞 공고를 확인한다",
        action: "board",
      },
    ],
  },
  "logistics-center": {
    label: "배금 물류센터 앞",
    speaker: "배금 물류센터",
    title: "역 광장에서 빠져나오면 배금 물류센터 건물 앞이 바로 이어진다",
    background: DAY01_WORLD_LOGISTICS_CENTER_BACKGROUND,
    districtId: "commercial",
    lines: [
      "화물차 진입로와 출고 안내문이 물류센터 앞 공기를 분주하게 만들고 있다.",
      "새벽 물류 알바가 잡히면 이 앞에서 출근 동선을 다시 정리하게 된다.",
    ],
    tags: ["물류", "알바", "역세권"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["station-front"],
    options: [
      {
        title: "배금역 광장으로 돌아간다",
        action: "move",
        targetLocation: "station-front",
        travelMinutes: 8,
      },
    ],
  },
  "station-interior": {
    label: "배금역 안",
    speaker: "배금역 안",
    title: "전광판 소리와 발걸음이 천장에 부딪혀 울린다",
    background: DAY01_WORLD_STATION_INTERIOR_BACKGROUND,
    lines: [
      "개찰구와 편의시설 사이로 사람들의 발걸음이 끊기지 않는다.",
      "서울역 방향 통로로 더 들어가거나 다시 역 앞 광장으로 나갈 수 있다.",
    ],
    tags: ["역 안", "개찰구", "플랫폼"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["station-front", "station-seoul-route"],
    options: [
      {
        title: "역 앞 광장으로 나간다",
        action: "move",
        targetLocation: "station-front",
      },
      {
        title: "서울역 가는 통로로 향한다",
        action: "move",
        targetLocation: "station-seoul-route",
      },
    ],
  },
  "station-seoul-route": {
    label: "배금역 철도 통로",
    speaker: "서울역 방향 통로",
    title: "서울역으로 이어지는 철도 안내판이 길게 이어진다",
    background: DAY01_WORLD_STATION_SEOUL_ROUTE_BACKGROUND,
    lines: [
      "노란 안내 화살표와 플랫폼 번호가 서울행 방향을 또렷하게 가리킨다.",
      "여기서 열차를 타면 다음 구역 이벤트로 넘어가게 될 것이다. 지금은 잠시 대기만 할 수 있다.",
    ],
    tags: ["철도", "서울행", "환승"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["station-interior"],
    options: [
      {
        title: "탑승구 앞에서 잠시 기다린다",
        action: "wait-seoul-rail",
      },
      {
        title: "배금역 안으로 돌아간다",
        action: "move",
        targetLocation: "station-interior",
      },
    ],
  },
  "busan-casino-exterior": {
    label: "부산 카지노 앞",
    speaker: "부산 카지노 앞",
    title: "부산역 근처 카지노 건물이 밤빛을 빨아들인다",
    background: DAY01_WORLD_BUSAN_CASINO_EXTERIOR_BACKGROUND,
    districtId: "underworld",
    cityMapHidden: true,
    lines: [
      "대형 간판과 유리문 너머 조명이 지나가는 사람의 시선을 오래 붙잡아 둔다.",
      "안으로 들어가면 환전소와 테이블, 슬롯 구역이 한꺼번에 열려 있다.",
    ],
    tags: ["부산", "카지노", "유흥"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["busan-casino-interior", "station-front"],
    options: [
      {
        title: "카지노 안으로 들어간다",
        action: "move",
        targetLocation: "busan-casino-interior",
        travelMinutes: 6,
        keepVisible: true,
      },
      {
        title: "배금역으로 돌아가는 고속버스를 탄다",
        action: "move",
        targetLocation: "station-front",
        travelMinutes: 60,
        travelMethod: "고속버스",
        travelSceneId: "express-bus-travel",
        keepVisible: true,
      },
    ],
  },
  "busan-casino-interior": {
    label: "부산 카지노 내부",
    speaker: "부산 카지노 내부",
    title: "칩 부딪히는 소리와 기계음이 홀 전체를 메운다",
    background: DAY01_WORLD_BUSAN_CASINO_INTERIOR_BACKGROUND,
    districtId: "underworld",
    cityMapHidden: true,
    lines: [
      "환전소와 블랙잭 테이블, 슬롯머신 줄이 한 공간에서 동시에 돌아간다.",
      "원하면 바로 테이블로 들어가 오늘 운을 시험해 볼 수 있다.",
    ],
    tags: ["부산", "카지노", "실내"],
    actors: [],
    exits: ["busan-casino-exterior"],
    options: [
      {
        title: "카지노 게임장으로 들어간다",
        action: "enter-casino-venue",
      },
      {
        title: "카지노 밖으로 나간다",
        action: "move",
        targetLocation: "busan-casino-exterior",
        travelMinutes: 6,
        keepVisible: true,
      },
    ],
  },
  downtown: {
    label: "배금 중심가",
    speaker: "배금 중심가",
    title: "간판 불빛이 더 큰 돈 냄새를 풍긴다",
    background: DAY01_WORLD_DOWNTOWN_BACKGROUND,
    lines: [
      "밝은 조명과 시끄러운 음악이 기회와 위험을 같이 끌어당긴다.",
      "아직은 둘러보는 정도지만, 나중엔 여기서 큰 소비와 사건이 열린다.",
    ],
    tags: ["고액소비", "유흥", "위험"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    randomNpcPool: DAY01_WORLD_DOWNTOWN_NPC_POOL,
    exits: ["bus-stop", "city-crossroads"],
    options: [
      {
        title: "버스 정류장으로 간다",
        action: "move",
        targetLocation: "bus-stop",
      },
      {
        title: "배금시 사거리로 돌아간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
    ],
  },
  "baegeum-hospital": {
    label: "배금병원 성형외과",
    speaker: "배금병원 성형외과",
    title: "로비 안내판 아래로 성형 상담 배너가 차갑게 줄지어 서 있다",
    background: DAY01_WORLD_BAEGEUM_HOSPITAL_BACKGROUND,
    lines: [
      "수술 전후 사진과 상담 안내 문구가 복도 벽면을 따라 반듯하게 붙어 있다.",
      "준비만 되면 얼굴과 인상을 다시 설계할 수 있다는 공기가 병원 안에 가라앉아 있다.",
    ],
    tags: ["병원", "성형", "상업 구역"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["city-crossroads"],
    options: [
      {
        title: "천만원으로 성형 상담을 진행한다",
        action: "get-plastic-surgery",
      },
      {
        title: "배금 사거리로 돌아간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
    ],
  },
  "convenience-store": {
    label: "편의점 내부",
    speaker: "편의점 내부",
    title: "형광등 아래 진열대와 계산대가 지나치게 깔끔한 편의점이다",
    background: DAY01_WORLD_CONVENIENCE_STORE_BACKGROUND,
    lines: [
      "냉장고 모터 소리와 전자레인지 알림음이 야간 편의점 특유의 공기를 붙잡고 있다.",
      "계산대 쪽 점원이 잠깐 시선을 들었다가 다시 바코드 스캐너를 정리한다.",
    ],
    tags: ["편의점", "상점", "상업 구역"],
    actors: [DAY01_WORLD_PLAYER_ACTOR, DAY01_WORLD_CONVENIENCE_CASHIER_ACTOR],
    exits: ["city-crossroads"],
    options: [
      {
        title: "생수를 산다",
        action: "buy-convenience-water",
      },
      {
        title: "삼각김밥을 산다",
        action: "buy-convenience-kimbap",
      },
      {
        title: "진통제를 산다",
        action: "buy-convenience-painkiller",
      },
      {
        title: "배금 네거리로 돌아간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
    ],
  },
  "lotto-retailer": {
    label: "배금역 로또판매장",
    speaker: "배금역 로또판매장",
    title: "복권 간판과 작은 창구가 붙어 있는 로또판매장이다",
    background: DAY01_WORLD_LOTTO_RETAILER_BACKGROUND,
    lines: [
      "배금역 앞 코너에 붙은 작은 판매장이라 지나가다 들르기 쉽다.",
      "유리창 안쪽에는 로또 복권과 각종 복권 안내문이 빼곡하게 붙어 있다.",
    ],
    tags: ["로또", "복권", "상업 구역"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    districtId: "commercial",
    exits: ["city-crossroads", "station-front", "lotto-retailer-interior"],
    options: [
      {
        title: "판매 창구로 들어간다",
        action: "move",
        targetLocation: "lotto-retailer-interior",
        travelMinutes: 2,
        keepVisible: true,
      },
      {
        title: "배금거리로 돌아간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
      {
        title: "배금역 앞으로 간다",
        action: "move",
        targetLocation: "station-front",
        travelMinutes: 3,
        keepVisible: true,
      },
    ],
  },
  "lotto-retailer-interior": {
    label: "로또판매장 안",
    speaker: "로또판매장 안",
    title: "창구 앞에서 로또 복권을 사고 다음날 결과를 기다릴 수 있다",
    background: DAY01_WORLD_LOTTO_RETAILER_INTERIOR_BACKGROUND,
    lines: [
      "좁은 창구 옆으로 복권 번호표와 추첨 안내지가 붙어 있다.",
      "여기서는 복권을 사서 인벤토리에 보관하고 다음날 결과를 확인한다.",
    ],
    tags: ["로또", "판매장", "상업 구역"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    districtId: "commercial",
    exits: ["lotto-retailer"],
    options: [
      {
        title: "로또 복권 한 장 사기",
        action: "buy-lotto-ticket",
      },
      {
        title: "판매장 밖으로 나간다",
        action: "move",
        targetLocation: "lotto-retailer",
        travelMinutes: 2,
        keepVisible: true,
      },
    ],
  },
  mcdonalds: {
    label: "맥도날드 배금거리점",
    speaker: "맥도날드 배금거리점",
    title: "건물 앞에서 카운터 쪽으로 이어지는 입구가 바로 보인다",
    background: DAY01_WORLD_MCDONALDS_BACKGROUND,
    lines: [
      "대로변 코너를 차지한 빨간 간판 아래로 입구 유리문이 환하게 켜져 있다.",
      "안으로 들어가면 카운터에서 세트 메뉴나 커피를 바로 주문할 수 있다.",
    ],
    tags: ["패스트푸드", "상업", "상업 구역"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    districtId: "commercial",
    exits: ["city-crossroads", "mcdonalds-counter"],
    options: [
      {
        title: "카운터로 들어간다",
        action: "move",
        targetLocation: "mcdonalds-counter",
        travelMinutes: 4,
        keepVisible: true,
      },
      {
        title: "배금 사거리로 돌아간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
    ],
  },
  "mcdonalds-counter": {
    label: "맥도날드 배금거리점 카운터",
    speaker: "맥도날드 배금거리점 카운터",
    title: "주문 카운터와 픽업 안내판이 바로 눈앞에 있다",
    background: DAY01_WORLD_MCDONALDS_COUNTER_BACKGROUND,
    lines: [
      "카운터 앞에서 주문 번호와 커피 픽업 벨이 번갈아 울린다.",
      "잠깐 서 있기만 해도 패스트푸드 매장 특유의 바쁜 공기가 그대로 느껴진다.",
    ],
    tags: ["패스트푸드", "카운터", "맥도날드"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    districtId: "commercial",
    exits: ["mcdonalds"],
    options: [
      {
        title: "세트 메뉴를 주문한다",
        action: "eat-mcdonalds-set",
      },
      {
        title: "커피 한 잔을 주문한다",
        action: "buy-mcdonalds-coffee",
      },
      {
        title: "건물 앞으로 나간다",
        action: "move",
        targetLocation: "mcdonalds",
        travelMinutes: 4,
        keepVisible: true,
      },
    ],
  },
  "office-plaza": {
    label: "배금디지털단지 입구",
    speaker: "배금디지털단지",
    title: "정문 보안 게이트와 출근 인파가 단지 공기를 먼저 채운다",
    background: DAY01_WORLD_OFFICE_PLAZA_BACKGROUND,
    lines: [
      "배금디지털단지 정문 버스정류장에서 내리면 안쪽 건물로 갈라지는 동선이 먼저 보인다.",
      "배금전자 사무동과 생산동, 배금연구소로 이어지는 길이 단지 안쪽으로 뻗어 있다.",
    ],
    tags: ["배금디지털단지", "기업", "출근"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    randomNpcPool: DAY01_WORLD_OFFICE_PLAZA_NPC_POOL,
    exits: ["bus-stop", "city-crossroads", "station-front", "mobility-control-center", "logistics-hub", "tower-cafe"],
    options: [
      {
        title: "배금전자 사무동으로 들어간다",
        action: "move",
        targetLocation: "mobility-control-center",
        keepVisible: true,
      },
      {
        title: "배금전자 생산동 쪽으로 간다",
        action: "move",
        targetLocation: "logistics-hub",
        keepVisible: true,
      },
      {
        title: "배금연구소로 들어간다",
        action: "move",
        targetLocation: "tower-cafe",
        keepVisible: true,
      },
      {
        title: "배금 사거리 쪽으로 돌아간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
    ],
  },
  "mobility-control-center": {
    label: "배금전자 사무동",
    speaker: "배금전자 사무동",
    title: "사무직 면접 안내와 층별 출입 게이트가 벽면을 채운다",
    background: DAY01_WORLD_MOBILITY_CONTROL_CENTER_BACKGROUND,
    lines: [
      "사무직 신입 면접과 문서 처리, 팀 배치 안내가 이 건물 안에서 돌아간다.",
      "정장 차림 지원자와 사원증을 단 직원들이 층별 안내판 앞을 오간다.",
    ],
    tags: ["배금디지털단지", "사무직", "배금전자"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["office-plaza", "logistics-hub"],
    options: [
      {
        title: "배금디지털단지 입구로 돌아간다",
        action: "move",
        targetLocation: "office-plaza",
        keepVisible: true,
      },
    ],
  },
  "logistics-hub": {
    label: "배금전자 생산동",
    speaker: "배금전자 생산동",
    title: "작업복 동선과 생산 라인 점검 소리가 규칙적으로 울린다",
    background: DAY01_WORLD_LOGISTICS_HUB_BACKGROUND,
    lines: [
      "생산직 신입 면접과 라인 배치 안내가 현장 사무실 앞에서 진행된다.",
      "바깥 적재장과 안쪽 라인 출입문이 공장 외곽을 따라 이어진다.",
    ],
    tags: ["배금디지털단지", "생산직", "배금전자"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    randomNpcPool: DAY01_WORLD_LOGISTICS_HUB_NPC_POOL,
    exits: ["office-plaza", "mobility-control-center", "production-line"],
    options: [
      {
        title: "생산라인으로 들어간다",
        action: "move",
        targetLocation: "production-line",
        travelMinutes: 6,
        keepVisible: true,
      },
      {
        title: "배금디지털단지 입구로 돌아간다",
        action: "move",
        targetLocation: "office-plaza",
        keepVisible: true,
      },
    ],
  },
  "production-line": {
    label: "배금전자 생산라인",
    speaker: "배금전자 생산라인",
    title: "생산라인과 점검 로봇이 규칙적으로 움직이고 있다",
    background: DAY01_WORLD_PRODUCTION_LINE_BACKGROUND,
    lines: [
      "라인 위로 자재 박스와 체크 표시가 일정한 리듬으로 지나간다.",
      "생산직 출근이나 면접 동선을 확인할 때 가장 먼저 들어오게 되는 현장이다.",
    ],
    tags: ["생산라인", "배금전자", "생산직"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    districtId: "industrial",
    exits: ["logistics-hub"],
    options: [
      {
        title: "공장 앞으로 돌아간다",
        action: "move",
        targetLocation: "logistics-hub",
        travelMinutes: 6,
        keepVisible: true,
      },
    ],
  },
  "tower-cafe": {
    label: "배금연구소",
    speaker: "배금연구소",
    title: "출입 배지와 연구 일정표가 유리문 안쪽 벽을 채운다",
    background: DAY01_WORLD_TOWER_CAFE_BACKGROUND,
    lines: [
      "연구직 신입 면접과 프로젝트 브리핑이 연구동 로비에서 오간다.",
      "사무동보다 조용하지만 안쪽 실험 구역으로 들어가는 긴장감이 감돈다.",
    ],
    tags: ["배금디지털단지", "연구직", "배금연구소"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["office-plaza", "research-lab-interior"],
    options: [
      {
        title: "연구동으로 들어간다",
        action: "move",
        targetLocation: "research-lab-interior",
        travelMinutes: 5,
        keepVisible: true,
      },
      {
        title: "배금디지털단지 입구로 돌아간다",
        action: "move",
        targetLocation: "office-plaza",
        keepVisible: true,
      },
    ],
  },
  "research-lab-interior": {
    label: "배금연구소 연구동",
    speaker: "배금연구소 연구동",
    title: "기구와 모니터 사이로 연구 일정의 긴장이 흐르고 있다",
    background: DAY01_WORLD_RESEARCH_LAB_INTERIOR_BACKGROUND,
    lines: [
      "실험대와 분석 장비가 정돈된 채 다음 작업 순서를 기다리고 있다.",
      "연구직 루트에서 실제로 발을 들이게 되는 내부 공간이다.",
    ],
    tags: ["연구동", "배금연구소", "연구직"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    districtId: "industrial",
    exits: ["tower-cafe"],
    options: [
      {
        title: "연구소 앞으로 돌아간다",
        action: "move",
        targetLocation: "tower-cafe",
        travelMinutes: 5,
        keepVisible: true,
      },
    ],
  },
  library: {
    label: "도서관",
    speaker: "도서관",
    title: "낮은 조명 아래 열람실 공기가 조용히 가라앉아 있다",
    background: DAY01_WORLD_LIBRARY_BACKGROUND,
    lines: [
      "책장 사이로 오래된 종이 냄새가 돌고, 빈 좌석마다 누군가의 준비 시간이 남아 있다.",
      "이력서를 다듬거나 공부를 하며 직장 면접 준비도를 쌓기 좋은 곳이다.",
    ],
    tags: ["도서관", "준비", "공부"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["bus-stop-map"],
    options: [
      {
        title: "사무 준비를 한다",
        action: "study-office-prep",
      },
      {
        title: "학업 준비를 한다",
        action: "study-academic-prep",
      },
      {
        title: "버스 정류장 지도로 돌아간다",
        action: "move",
        targetLocation: "bus-stop-map",
      },
    ],
  },
  "exam-center": {
    label: "시험장",
    speaker: "시험장",
    title: "접수 창구 앞 공기가 팽팽하게 식어 있는 시험장이다",
    background: DAY01_WORLD_EXAM_CENTER_BACKGROUND,
    lines: [
      "수험표와 접수 안내문이 벽을 빼곡하게 채우고 있다.",
      "오늘은 자격을 챙겨 두면 앞으로 지원할 수 있는 직장 루트가 늘어난다.",
    ],
    tags: ["시험장", "자격", "접수"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["bus-stop-map"],
    options: [
      {
        title: "컴퓨터 자격을 챙긴다",
        action: "take-computer-cert",
      },
      {
        title: "운전면허를 챙긴다",
        action: "take-driver-license",
      },
      {
        title: "버스 정류장 지도로 돌아간다",
        action: "move",
        targetLocation: "bus-stop-map",
      },
    ],
  },
  "university-district": {
    label: "대학가",
    speaker: "대학가",
    title: "취업지원센터 배너와 졸업 안내문이 함께 보이는 캠퍼스 길목이다",
    background: DAY01_WORLD_UNIVERSITY_DISTRICT_BACKGROUND,
    lines: [
      "건물 유리문마다 강의실 안내와 취업 상담 포스터가 겹쳐 붙어 있다.",
      "학생들 틈에서 서류를 다듬고 졸업 요건을 채우면 직장 면접 루트에 도움이 될 것 같은 분위기다.",
    ],
    tags: ["대학가", "취업지원", "학생"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    randomNpcPool: DAY01_WORLD_UNIVERSITY_NPC_POOL,
    exits: ["study-hub", "campus-park"],
    options: [
      {
        title: "취업지원센터에서 상담을 받는다",
        action: "study-career-center-review",
      },
      {
        title: "졸업 심사를 진행한다",
        action: "graduate-university",
      },
      {
        title: "캠퍼스 공원으로 걸어간다",
        action: "move",
        targetLocation: "campus-park",
      },
      {
        title: "학습 구역 입구로 돌아간다",
        action: "move",
        targetLocation: "study-hub",
      },
    ],
  },
  "campus-park": {
    label: "캠퍼스 공원",
    speaker: "캠퍼스 공원",
    title: "잔디와 벤치 사이로 학생들 목소리가 느리게 흘러가는 쉼터다",
    background: DAY01_WORLD_CAMPUS_PARK_BACKGROUND,
    lines: [
      "강의가 끝난 학생들이 벤치에 모여 과제와 아르바이트 이야기를 가볍게 주고받고 있다.",
      "앉아서 숨을 고르다 보면 다음 루트를 알려줄 만한 사람을 만날 수도 있어 보인다.",
    ],
    tags: ["공원", "휴식", "인맥"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    randomNpcPool: DAY01_WORLD_CAMPUS_PARK_NPC_POOL,
    exits: ["university-district", "study-hub"],
    options: [
      {
        title: "벤치에 앉아 사람들을 살핀다",
        action: "study-campus-network",
      },
      {
        title: "대학가로 돌아간다",
        action: "move",
        targetLocation: "university-district",
      },
      {
        title: "학습 구역 입구로 돌아간다",
        action: "move",
        targetLocation: "study-hub",
      },
    ],
  },
};

const DAY01_HOME_FRONT_LOCATION_IDS = ["apt-alley", "silver-home-front", "golden-home-front"];

DAY01_WORLD_LOCATIONS["silver-home-front"] = {
  label: "배금아파트 앞",
  speaker: "배금아파트 앞",
  title: "아파트 로비 문이 닫히고 낮은 바람 소리가 주거 구역에 번진다",
  lines: [
    "아파트 현관 앞 공기는 정리되어 있지만, 길 하나만 건너면 바로 배금시의 일상이 이어진다.",
    "다시 안으로 들어가 로비를 지나 방으로 올라가거나, 버스 정류장 쪽으로 걸어 나갈 수 있다.",
  ],
  tags: ["집앞", "주거", "아파트"],
  actors: [DAY01_WORLD_PLAYER_ACTOR],
  randomNpcPool: DAY01_WORLD_ALLEY_NPC_POOL,
  exits: ["city-crossroads", "bus-stop"],
  options: [
    {
      title: "배금시 사거리로 간다",
      action: "move",
      targetLocation: "city-crossroads",
    },
    {
      title: "버스 정류장으로 간다",
      action: "move",
      targetLocation: "bus-stop",
    },
    {
      title: "다시 집 안으로 들어간다",
      action: "home",
    },
  ],
};

DAY01_WORLD_LOCATIONS["golden-home-front"] = {
  label: "배금복합빌딩 앞",
  speaker: "배금복합빌딩 앞",
  title: "복합빌딩 차고 셔터가 열리며 바깥 도로와 주거 구역 풍경이 한 번에 드러난다",
  lines: [
    "차량이 드나드는 램프 끝에서 바로 바깥 공기와 도시 소음이 닿는다.",
    "다시 안으로 들어가 차고와 로비를 거쳐 방으로 올라가거나, 곧장 주거 구역으로 나갈 수 있다.",
  ],
  tags: ["집앞", "주거", "복합빌딩"],
  actors: [DAY01_WORLD_PLAYER_ACTOR],
  randomNpcPool: DAY01_WORLD_ALLEY_NPC_POOL,
  exits: ["city-crossroads", "bus-stop"],
  options: [
    {
      title: "배금시 사거리로 간다",
      action: "move",
      targetLocation: "city-crossroads",
    },
    {
      title: "버스 정류장으로 간다",
      action: "move",
      targetLocation: "bus-stop",
    },
    {
      title: "다시 집 안으로 들어간다",
      action: "home",
    },
  ],
};

const DAY01_WORLD = {
  homeLocationId: "apt-alley",
  defaultLocationId: "apt-alley",
  locations: DAY01_WORLD_LOCATIONS,
  boardHeadline: {
    phone: "밖에서도 스마트폰으로 오늘 공고를 확인한다.",
    board: "골목 게시판과 역 앞 전단지에서 오늘 공고를 확인한다.",
  },
};
const DAY01_WORLD_DISTRICTS = {
  residential: {
    id: "residential",
    label: "주거 구역",
    note: "배금고시원, 배금아파트, 배금복합빌딩",
    entryLocationId: "bus-stop",
  },
  study: {
    id: "study",
    label: "학습 구역",
    note: "도서관과 시험장",
    entryLocationId: "study-hub",
  },
  commercial: {
    id: "commercial",
    label: "상업 구역",
    note: "역 앞과 번화가",
    entryLocationId: "city-crossroads",
  },
  industrial: {
    id: "industrial",
    label: "배금디지털단지",
    note: "배금전자와 배금연구소",
    entryLocationId: "office-plaza",
  },
  underworld: {
    id: "underworld",
    label: "유흥 구역",
    note: "카지노와 수상한 인맥",
    entryLocationId: "",
  },
  finance: {
    id: "finance",
    label: "금융 구역",
    note: "은행과 투자",
    entryLocationId: "",
  },
};

const DAY01_WORLD_DISTRICT_MAP = {
  mode: "district",
  title: "도시 구역 노선도",
  subtitle: "먼저 갈 구역을 고른 뒤, 그 안에서 세부 장소를 걸어 들어간다.",
  nodes: ["residential", "study", "commercial", "industrial"].map((districtId) => {
    const district = DAY01_WORLD_DISTRICTS[districtId];
    return {
      id: district.id,
      emoji: districtId === "residential"
        ? "🏠"
        : districtId === "study"
          ? "📚"
          : districtId === "industrial"
            ? "🏢"
            : "🌆",
      label: district.label,
      note: district.note,
    };
  }),
};

DAY01_WORLD_LOCATIONS["apt-alley"].districtId = "residential";
DAY01_WORLD_LOCATIONS["silver-home-front"].districtId = "residential";
DAY01_WORLD_LOCATIONS["golden-home-front"].districtId = "residential";
DAY01_WORLD_LOCATIONS["bus-stop"].districtId = "residential";
DAY01_WORLD_LOCATIONS["bus-stop-map"].districtId = "residential";
DAY01_WORLD_LOCATIONS["city-crossroads"].districtId = "commercial";
DAY01_WORLD_LOCATIONS["station-front"].districtId = "commercial";
DAY01_WORLD_LOCATIONS["station-interior"].districtId = "commercial";
DAY01_WORLD_LOCATIONS["station-seoul-route"].districtId = "commercial";
DAY01_WORLD_LOCATIONS.downtown.districtId = "commercial";
DAY01_WORLD_LOCATIONS["baegeum-hospital"].districtId = "commercial";
DAY01_WORLD_LOCATIONS["convenience-store"].districtId = "commercial";
DAY01_WORLD_LOCATIONS.mcdonalds.districtId = "commercial";
DAY01_WORLD_LOCATIONS["office-plaza"].districtId = "industrial";
DAY01_WORLD_LOCATIONS["mobility-control-center"].districtId = "industrial";
DAY01_WORLD_LOCATIONS["logistics-hub"].districtId = "industrial";
DAY01_WORLD_LOCATIONS["tower-cafe"].districtId = "industrial";
DAY01_WORLD_LOCATIONS.library.districtId = "study";
DAY01_WORLD_LOCATIONS["exam-center"].districtId = "study";
DAY01_WORLD_LOCATIONS["university-district"].districtId = "study";
DAY01_WORLD_LOCATIONS["campus-park"].districtId = "study";

DAY01_WORLD_LOCATIONS["study-hub"] = {
  label: "학습 구역 입구",
  speaker: "학습 구역 입구",
  title: "열람실과 시험장 안내판이 이어진 골목 입구다",
  background: DAY01_WORLD_STUDY_HUB_BACKGROUND,
  districtId: "study",
  lines: [
    "도서관과 시험장, 앞으로 열릴 대학가와 공원이 이 구역 안쪽으로 이어진다.",
    "지금은 공부와 자격 준비를 위한 장소부터 먼저 둘러볼 수 있다.",
  ],
  tags: ["학습 구역", "이동 허브", "준비"],
  actors: [DAY01_WORLD_PLAYER_ACTOR],
  exits: ["library", "exam-center", "university-district", "campus-park", "bus-stop-map"],
  options: [
    {
      title: "도서관으로 간다",
      action: "move",
      targetLocation: "library",
    },
    {
      title: "시험장으로 간다",
      action: "move",
      targetLocation: "exam-center",
    },
    {
      title: "대학가로 간다",
      action: "move",
      targetLocation: "university-district",
    },
    {
      title: "캠퍼스 공원으로 간다",
      action: "move",
      targetLocation: "campus-park",
    },
    {
      title: "버스 구역 노선도로 돌아간다",
      action: "move",
      targetLocation: "bus-stop-map",
    },
  ],
};

DAY01_WORLD_LOCATIONS["bus-stop-map"].map = null;
DAY01_WORLD_LOCATIONS["bus-stop-map"].exits = [
  "bus-stop",
  ...DAY01_HOME_FRONT_LOCATION_IDS,
  ...DAY01_WORLD_BUS_ROUTE_OPTIONS
    .map((option) => option.targetLocation)
    .filter((locationId) => ![...DAY01_HOME_FRONT_LOCATION_IDS, "bus-stop"].includes(locationId)),
];
DAY01_WORLD_LOCATIONS["bus-stop-map"].label = "배금시외버스터미널 안내";
DAY01_WORLD_LOCATIONS["bus-stop-map"].speaker = "배금시외버스터미널";
DAY01_WORLD_LOCATIONS["bus-stop-map"].title = "전광판 아래에서 스마트폰으로 버스 앱을 켠다";
DAY01_WORLD_LOCATIONS["bus-stop-map"].lines = [
  "시내버스 노선도와 시외버스 시간표는 배금버스 앱에서 깔끔하게 확인할 수 있다.",
  "앱이 아직 없다면 플레이스토어가 먼저 열리고, 설치돼 있다면 바로 교통 화면으로 이어진다.",
];
DAY01_WORLD_LOCATIONS["bus-stop-map"].options = [
  {
    title: "스마트폰으로 배금버스 노선도를 본다",
    action: "open-bus-route-app",
  },
  {
    title: "스마트폰으로 터미널 시간표를 본다",
    action: "open-bus-timetable-app",
  },
  {
    title: "정류장 자리로 돌아간다",
    action: "move",
    targetLocation: "bus-stop",
  },
];
DAY01_WORLD_LOCATIONS["bus-stop-map"].timetableOptions = [];
DAY01_WORLD_LOCATIONS["bus-stop"].exits = [
  ...DAY01_HOME_FRONT_LOCATION_IDS,
  "city-crossroads",
  "bus-stop-map",
  ...DAY01_WORLD_BUS_ROUTE_OPTIONS
    .map((option) => option.targetLocation)
    .filter((locationId) => ![...DAY01_HOME_FRONT_LOCATION_IDS, "city-crossroads", "bus-stop", "bus-stop-map"].includes(locationId)),
];
DAY01_WORLD_LOCATIONS["bus-stop"].options = [
  {
    title: "안내판 앞으로 간다",
    action: "move",
    targetLocation: "bus-stop-map",
  },
  {
    title: "집 쪽으로 돌아간다",
    action: "move-home",
  },
  {
    title: "배금시 사거리로 간다",
    action: "move",
    targetLocation: "city-crossroads",
  },
];

DAY01_WORLD_LOCATIONS.library.exits = ["study-hub"];
DAY01_WORLD_LOCATIONS.library.options = [
  {
    title: "사무 준비를 한다",
    action: "study-office-prep",
  },
  {
    title: "학업 준비를 한다",
    action: "study-academic-prep",
  },
  {
    title: "학습 구역 입구로 돌아간다",
    action: "move",
    targetLocation: "study-hub",
  },
];

DAY01_WORLD_LOCATIONS["exam-center"].exits = ["study-hub"];
DAY01_WORLD_LOCATIONS["exam-center"].options = [
  {
    title: "컴퓨터 자격을 챙긴다",
    action: "take-computer-cert",
  },
  {
    title: "운전면허를 챙긴다",
    action: "take-driver-license",
  },
  {
    title: "학습 구역 입구로 돌아간다",
    action: "move",
    targetLocation: "study-hub",
  },
];

DAY01_WORLD.districts = DAY01_WORLD_DISTRICTS;
DAY01_WORLD.defaultDistrictId = "residential";
DAY01_WORLD.initialUnlockedDistricts = ["residential", "study", "commercial", "industrial"];
DAY01_WORLD.initialUnlockedLocations = [
  "apt-alley",
  "bus-stop",
  "bus-stop-map",
  "study-hub",
  "library",
  "exam-center",
  "university-district",
  "campus-park",
  "city-crossroads",
  "station-front",
  "station-interior",
  "station-seoul-route",
  "downtown",
  "baegeum-hospital",
  "convenience-store",
  "mcdonalds",
  "office-plaza",
  "mobility-control-center",
  "logistics-hub",
  "tower-cafe",
];

const DAY01_CITY_MAP_NODE_META = {
  "apt-alley": {
    x: 14,
    y: 76,
    icon: "🏠",
    shortLabel: "고시원 앞",
    note: "배금고시원으로 이어지는 주거 구역 출입점.",
    zoneTone: "residential",
    order: 10,
  },
  "bus-stop": {
    x: 26,
    y: 67,
    icon: "🚌",
    shortLabel: "버스정류장",
    note: "주거 구역에서 다른 곳으로 빠져나가는 교통 거점.",
    zoneTone: "residential",
    order: 20,
  },
  "study-hub": {
    x: 31,
    y: 25,
    icon: "📍",
    shortLabel: "학습구역입구",
    note: "도서관, 시험장, 대학가로 이어지는 학습 구역 허브.",
    zoneTone: "study",
    order: 30,
  },
  library: {
    x: 17,
    y: 18,
    icon: "📚",
    shortLabel: "도서관",
    note: "사무 준비와 공부 루트의 기본 거점.",
    zoneTone: "study",
    order: 40,
  },
  "exam-center": {
    x: 31,
    y: 10,
    icon: "📝",
    shortLabel: "시험장",
    note: "자격증 시험을 바로 접수하고 치를 수 있다.",
    zoneTone: "study",
    order: 50,
  },
  "university-district": {
    x: 48,
    y: 16,
    icon: "🎓",
    shortLabel: "대학가",
    note: "취업지원센터 상담과 졸업 심사를 챙길 수 있는 구역.",
    zoneTone: "study",
    order: 60,
  },
  "campus-park": {
    x: 60,
    y: 9,
    icon: "🌿",
    shortLabel: "캠퍼스공원",
    note: "학생과 선배, 버스커를 만날 수 있는 쉼터.",
    zoneTone: "study",
    order: 70,
  },
  "city-crossroads": {
    x: 47,
    y: 53,
    icon: "✦",
    shortLabel: "배금사거리",
    note: "상업 구역의 중심 허브. 여러 장소가 여기서 갈라진다.",
    zoneTone: "commercial",
    order: 80,
  },
  "station-front": {
    x: 69,
    y: 30,
    icon: "🚉",
    shortLabel: "배금역앞",
    note: "알바 공고와 사람 흐름이 몰리는 역전 광장.",
    zoneTone: "commercial",
    order: 90,
  },
  "station-interior": {
    x: 81,
    y: 24,
    icon: "🚈",
    shortLabel: "배금역내부",
    note: "철도 플랫폼으로 들어가기 직전의 내부 공간.",
    zoneTone: "commercial",
    order: 100,
  },
  downtown: {
    x: 69,
    y: 52,
    icon: "🌃",
    shortLabel: "다운타운",
    note: "배금시 중심 상업 구역.",
    zoneTone: "commercial",
    order: 110,
  },
  "baegeum-hospital": {
    label: "배금병원 성형외과",
    speaker: "배금병원 성형외과",
    title: "로비 안내판 아래로 성형 상담 배너가 차갑게 줄지어 서 있다",
    background: DAY01_WORLD_BAEGEUM_HOSPITAL_BACKGROUND,
    lines: [
      "수술 전후 사진과 상담 안내 문구가 복도 벽면을 따라 반듯하게 붙어 있다.",
      "준비만 되면 얼굴과 인상을 다시 설계할 수 있다는 공기가 병원 안에 가라앉아 있다.",
    ],
    tags: ["병원", "성형", "상업 구역"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["city-crossroads"],
    options: [
      {
        title: "천만원으로 성형 상담을 진행한다",
        action: "get-plastic-surgery",
      },
      {
        title: "배금 사거리로 돌아간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
    ],
  },
  "convenience-store": {
    x: 36,
    y: 39,
    icon: "🏪",
    shortLabel: "편의점",
    note: "간단한 소비와 회복 아이템을 살 수 있다.",
    zoneTone: "commercial",
    order: 130,
  },
  "lotto-retailer": {
    x: 58,
    y: 36,
    icon: "🎟️",
    shortLabel: "로또",
    note: "배금역 앞 코너에 있는 로또판매장",
    zoneTone: "commercial",
    order: 135,
  },
  mcdonalds: {
    label: "맥도날드 배금거리점",
    speaker: "맥도날드 배금거리점",
    title: "건물 앞에서 카운터 쪽으로 이어지는 입구가 바로 보인다",
    background: DAY01_WORLD_MCDONALDS_BACKGROUND,
    lines: [
      "대로변 코너를 차지한 빨간 간판 아래로 입구 유리문이 환하게 켜져 있다.",
      "안으로 들어가면 카운터에서 세트 메뉴나 커피를 바로 주문할 수 있다.",
    ],
    tags: ["패스트푸드", "상업", "상업 구역"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    districtId: "commercial",
    exits: ["city-crossroads", "mcdonalds-counter"],
    options: [
      {
        title: "카운터로 들어간다",
        action: "move",
        targetLocation: "mcdonalds-counter",
        travelMinutes: 4,
      },
      {
        title: "배금 사거리로 돌아간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
    ],
  },
  "mcdonalds-counter": {
    label: "맥도날드 배금거리점 카운터",
    speaker: "맥도날드 배금거리점 카운터",
    title: "주문 카운터와 픽업 안내판이 바로 눈앞에 있다",
    background: DAY01_WORLD_MCDONALDS_COUNTER_BACKGROUND,
    lines: [
      "카운터 앞에서 주문 번호와 커피 픽업 벨이 번갈아 울린다.",
      "잠깐 서 있기만 해도 패스트푸드 매장 특유의 바쁜 공기가 그대로 느껴진다.",
    ],
    tags: ["패스트푸드", "카운터", "맥도날드"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    districtId: "commercial",
    exits: ["mcdonalds"],
    options: [
      {
        title: "세트 메뉴를 주문한다",
        action: "eat-mcdonalds-set",
      },
      {
        title: "커피 한 잔을 주문한다",
        action: "buy-mcdonalds-coffee",
      },
      {
        title: "건물 앞으로 나간다",
        action: "move",
        targetLocation: "mcdonalds",
        travelMinutes: 4,
      },
    ],
  },
  "office-plaza": {
    x: 82,
    y: 48,
    icon: "🏢",
    shortLabel: "디지털단지",
    note: "단지 입구. 배금전자 사무동, 생산동, 배금연구소로 갈라진다.",
    zoneTone: "industrial",
    order: 145,
  },
  "mobility-control-center": {
    x: 85,
    y: 33,
    icon: "🖥️",
    shortLabel: "사무동",
    note: "배금전자 사무직 면접과 사무층 배치가 이뤄지는 건물.",
    zoneTone: "industrial",
    order: 150,
  },
  "tower-cafe": {
    x: 77,
    y: 63,
    icon: "🧪",
    shortLabel: "연구소",
    note: "배금연구소 연구직 면접과 연구동 브리핑이 열리는 건물.",
    zoneTone: "industrial",
    order: 155,
  },
  "logistics-hub": {
    x: 90,
    y: 73,
    icon: "📦",
    shortLabel: "생산동",
    note: "배금전자 생산직 면접과 라인 배치가 이어지는 공장동.",
    zoneTone: "industrial",
    order: 160,
  },
};

Object.entries(DAY01_CITY_MAP_NODE_META).forEach(([locationId, mapNode]) => {
  if (DAY01_WORLD_LOCATIONS[locationId]) {
    DAY01_WORLD_LOCATIONS[locationId].mapNode = { ...mapNode };
  }
});

DAY01_WORLD_LOCATIONS["silver-home-front"].mapNode = {
  x: 10,
  y: 84,
  icon: "🏢",
  shortLabel: "아파트 앞",
  note: "배금아파트 로비를 거쳐 나오는 주거 구역 출입점.",
  zoneTone: "residential",
  order: 11,
};
DAY01_WORLD_LOCATIONS["golden-home-front"].mapNode = {
  x: 23,
  y: 84,
  icon: "🚘",
  shortLabel: "복합빌딩 앞",
  note: "배금복합빌딩 차고 램프와 입구가 이어지는 주거 구역 출입점.",
  zoneTone: "residential",
  order: 12,
};

[
  "bus-stop-map",
  "bus-ride",
  "walk-travel",
  "station-seoul-route",
  "logistics-center",
  "lotto-retailer-interior",
  "mcdonalds-counter",
  "production-line",
  "research-lab-interior",
].forEach((locationId) => {
  if (DAY01_WORLD_LOCATIONS[locationId]) {
    DAY01_WORLD_LOCATIONS[locationId].cityMapHidden = true;
  }
});

DAY01_WORLD_LOCATIONS["bus-stop-map"].cityMapAnchorId = "bus-stop";
DAY01_WORLD_LOCATIONS["bus-ride"].cityMapHidden = true;
DAY01_WORLD_LOCATIONS["walk-travel"].cityMapHidden = true;
DAY01_WORLD_LOCATIONS["logistics-center"].cityMapAnchorId = "station-front";
DAY01_WORLD_LOCATIONS["lotto-retailer-interior"].cityMapAnchorId = "lotto-retailer";
DAY01_WORLD_LOCATIONS["mcdonalds-counter"].cityMapAnchorId = "mcdonalds";
DAY01_WORLD_LOCATIONS["production-line"].cityMapAnchorId = "logistics-hub";
DAY01_WORLD_LOCATIONS["research-lab-interior"].cityMapAnchorId = "tower-cafe";
DAY01_WORLD_LOCATIONS["station-seoul-route"].cityMapAnchorId = "station-interior";

DAY01_WORLD.cityMap = {
  title: "배금시 이동 지도",
  subtitle: "이동은 지도에서 고르고, 도착한 장소에서 할 수 있는 행동만 버튼으로 남긴다.",
  zones: [
    { id: "study", label: "학습 구역", tone: "study", x: 6, y: 4, width: 60, height: 30 },
    { id: "commercial", label: "상업 구역", tone: "commercial", x: 27, y: 25, width: 45, height: 57 },
    { id: "industrial", label: "배금디지털단지", tone: "industrial", x: 73, y: 28, width: 23, height: 56 },
    { id: "residential", label: "주거 구역", tone: "residential", x: 4, y: 58, width: 34, height: 30 },
  ],
  links: [
    { from: "apt-alley", to: "bus-stop", minutes: 8, mode: "walk" },
    { from: "apt-alley", to: "city-crossroads", minutes: 18, mode: "walk" },
    { from: "silver-home-front", to: "bus-stop", minutes: 6, mode: "walk" },
    { from: "silver-home-front", to: "city-crossroads", minutes: 16, mode: "walk" },
    { from: "golden-home-front", to: "bus-stop", minutes: 10, mode: "walk" },
    { from: "golden-home-front", to: "city-crossroads", minutes: 20, mode: "walk" },
    { from: "bus-stop", to: "city-crossroads", minutes: 14, mode: "walk" },
    { from: "bus-stop", to: "study-hub", minutes: 22, mode: "bus" },
    { from: "bus-stop", to: "downtown", minutes: 10, mode: "bus" },
    { from: "bus-stop", to: "station-front", minutes: 12, mode: "bus" },
    { from: "bus-stop", to: "office-plaza", minutes: 11, mode: "bus" },
    { from: "bus-stop", to: "baegeum-hospital", minutes: 12, mode: "bus" },
    { from: "study-hub", to: "library", minutes: 6, mode: "walk" },
    { from: "study-hub", to: "exam-center", minutes: 6, mode: "walk" },
    { from: "study-hub", to: "university-district", minutes: 9, mode: "walk" },
    { from: "study-hub", to: "campus-park", minutes: 11, mode: "walk" },
    { from: "university-district", to: "campus-park", minutes: 6, mode: "walk" },
    { from: "city-crossroads", to: "station-front", minutes: 10, mode: "walk" },
    { from: "city-crossroads", to: "downtown", minutes: 9, mode: "walk" },
    { from: "city-crossroads", to: "baegeum-hospital", minutes: 9, mode: "walk" },
    { from: "city-crossroads", to: "convenience-store", minutes: 4, mode: "walk" },
    { from: "city-crossroads", to: "lotto-retailer", minutes: 6, mode: "walk" },
    { from: "city-crossroads", to: "mcdonalds", minutes: 5, mode: "walk" },
    { from: "city-crossroads", to: "office-plaza", minutes: 9, mode: "walk" },
    { from: "station-front", to: "station-interior", minutes: 4, mode: "walk" },
    { from: "station-front", to: "lotto-retailer", minutes: 3, mode: "walk" },
    { from: "station-front", to: "office-plaza", minutes: 8, mode: "walk" },
    { from: "downtown", to: "office-plaza", minutes: 8, mode: "walk" },
    { from: "office-plaza", to: "mobility-control-center", minutes: 4, mode: "walk" },
    { from: "office-plaza", to: "tower-cafe", minutes: 4, mode: "walk" },
    { from: "office-plaza", to: "logistics-hub", minutes: 7, mode: "walk" },
    { from: "mobility-control-center", to: "logistics-hub", minutes: 6, mode: "walk" },
  ],
};


