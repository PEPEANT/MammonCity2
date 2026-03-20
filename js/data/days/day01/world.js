const DAY01_WORLD_PLAYER_ACTOR = {
  src: CHARACTER_ART.player.standing,
  alt: "player",
  left: 40,
  bottom: 6,
  height: 84,
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

const DAY01_WORLD_BUS_MAP = {
  title: "배금시 버스 노선도",
  subtitle: "정류장 유리판에 손때 묻은 동네 지도가 붙어 있다.",
  nodes: [
    {
      id: "apt-alley",
      emoji: "🏠",
      label: "집앞 골목",
      note: "부모님 아파트 앞",
    },
    {
      id: "bus-stop",
      emoji: "🚌",
      label: "버스 정류장",
      note: "환승 지점",
    },
    {
      id: "city-crossroads",
      emoji: "🚦",
      label: "배금시 사거리",
      note: "전단과 사람 흐름",
    },
    {
      id: "station-front",
      emoji: "🚉",
      label: "배금역 앞",
      note: "알바와 식사 냄새",
    },
    {
      id: "downtown",
      emoji: "🌃",
      label: "배금 중심가",
      note: "큰돈과 위험",
    },
  ],
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
  image: "assets/backgrounds/day01/bus-stop.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.16) 100%)",
};

const DAY01_WORLD_BUS_TRAVEL_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/bus-travel.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.24) 100%)",
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

const DAY01_WORLD_LOCATIONS = {
  "apt-alley": {
    label: "부모님 아파트 집앞 골목",
    speaker: "부모님 아파트 집앞 골목",
    title: "골목 바람이 아직 잠에서 덜 깬다",
    lines: [
      "익숙한 담배 냄새와 편의점 불빛이 뒤섞인 동네 입구다.",
      "집으로 들어갈지, 사거리 쪽으로 걸어 나갈지 정하면 된다.",
    ],
    tags: ["집앞", "생활", "골목"],
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
  "bus-stop": {
    label: "버스 정류장",
    speaker: "버스 정류장",
    title: "정류장 기둥 밑에서 버스 바람이 스친다",
    background: DAY01_WORLD_BUS_STOP_BACKGROUND,
    lines: [
      "낡은 의자와 광고판 사이로 버스 도착 방송이 끊겨 들린다.",
      "정류장 유리판에 붙은 노선도를 보면 배금시 안쪽 이동이 한눈에 들어온다.",
    ],
    tags: ["환승", "대기", "정류장"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["apt-alley", "city-crossroads", "bus-stop-map"],
    options: [
      {
        title: "노선도를 본다",
        action: "move",
        targetLocation: "bus-stop-map",
      },
      {
        title: "집앞 골목으로 돌아간다",
        action: "move",
        targetLocation: "apt-alley",
      },
      {
        title: "배금시 사거리로 간다",
        action: "move",
        targetLocation: "city-crossroads",
      },
    ],
  },
  "bus-stop-map": {
    label: "버스 정류장 노선도",
    speaker: "버스 정류장 노선도",
    title: "유리판 뒤 노선도가 오늘의 동선을 바꾼다",
    background: DAY01_WORLD_BUS_STOP_BACKGROUND,
    lines: [
      "손때 묻은 배금시 지도를 따라가면 웬만한 곳은 버스로 이어진다.",
      "갈 곳을 정하면 다음 정류장처럼 바로 이동할 수 있다.",
    ],
    tags: ["환승", "지도", "노선도"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["bus-stop", "city-crossroads", "station-front", "downtown", "apt-alley"],
    map: DAY01_WORLD_BUS_MAP,
    options: [
      {
        title: "정류장 자리로 돌아간다",
        action: "move",
        targetLocation: "bus-stop",
      },
      {
        title: "집앞 골목으로 간다",
        action: "move",
        targetLocation: "apt-alley",
        travelVia: "bus",
      },
      {
        title: "배금시 사거리로 간다",
        action: "move",
        targetLocation: "city-crossroads",
        travelVia: "bus",
      },
      {
        title: "배금역 앞으로 간다",
        action: "move",
        targetLocation: "station-front",
        travelVia: "bus",
      },
      {
        title: "배금 중심가로 간다",
        action: "move",
        targetLocation: "downtown",
        travelVia: "bus",
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
  "city-crossroads": {
    label: "배금시 사거리",
    speaker: "배금시 사거리",
    title: "사거리의 소음이 하루 방향을 흔든다",
    background: DAY01_WORLD_CITY_CROSSROADS_BACKGROUND,
    lines: [
      "전단지와 사람 흐름이 뒤엉킨 동네 허브다.",
      "역 앞과 중심가로 갈 수 있고, 다시 골목으로 돌아갈 수도 있다.",
    ],
    tags: ["허브", "전단", "유동"],
    actors: [DAY01_WORLD_PLAYER_ACTOR],
    exits: ["apt-alley", "bus-stop", "station-front", "downtown"],
    options: [
      {
        title: "부모님 아파트 골목으로 돌아간다",
        action: "move",
        targetLocation: "apt-alley",
      },
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
        title: "전단지와 공고를 확인한다",
        action: "board",
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
    exits: ["bus-stop", "city-crossroads", "station-interior"],
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
        title: "역 앞 공고를 확인한다",
        action: "board",
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
