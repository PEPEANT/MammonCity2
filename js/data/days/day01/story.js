const DAY01_INTRO_STEPS = [
  {
    speaker: "거실",
    title: "",
    lines: [],
    character: "",
    startMode: "press-exit",
    background: {
      image: "1.png",
      overlay: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)",
      position: "center",
      size: "96% auto",
      repeat: "no-repeat",
      color: "#050505",
      className: "custom-location-bg",
    },
    player: {
      src: "assets/characters/player/standing.png",
      alt: "player",
      startLeft: 50,
      prompt: "E를 눌러 밖으로 나가기",
      bottom: 4,
      height: 72,
      zIndex: 2,
    },
    options: [],
  },
  {
    speaker: "부모님집",
    title: "",
    lines: [],
    character: "",
    options: [
      {
        title: "거실로 간다",
        action: "goToLivingRoom",
      },
      {
        title: "방청소를 한다",
        action: "cleanRoom",
        hidden: true,
      },
    ],
  },
  {
    speaker: "엄마",
    title: "엄마가 문을 열고 들어온다",
    lines: [
      "{nameCall}, 방 청소 끝냈구나.",
      "엄마가 9만 원 줄게. 앞으로도 열심히 해.",
    ],
    character: "",
    actors: [
      {
        src: CHARACTER_ART.player.standing,
        alt: "player",
        left: 25,
        bottom: 16,
        height: 88,
        zIndex: 1,
      },
      {
        src: CHARACTER_ART.mom.reward,
        alt: "mom",
        left: 63,
        bottom: 30,
        height: 72,
        zIndex: 2,
      },
    ],
    options: [
      {
        title: "계속하기",
        action: "continueDay",
      },
    ],
  },
];

const DAY01_PHONE_UNLOCK_STEPS = [
  {
    speaker: "부모님집",
    title: "세 번째 아침, 방이 또 어질러져 있다",
    lines: [
      "어제 벗어 둔 옷이 의자에 걸쳐져 있고 책상엔 컵만 남아 있다.",
      "오늘도 그냥 넘길 수는 없어서 먼저 방부터 정리하기로 한다.",
    ],
    character: "",
    options: [
      {
        title: "방청소를 한다",
        action: "next",
      },
    ],
  },
  {
    speaker: "부모님",
    title: "압수당했던 스마트폰을 돌려받았다",
    lines: [
      "부모님이 방을 보고는 오늘은 제법 사람답다며 웃는다.",
      "칭찬 한마디와 함께 압수당했던 스마트폰을 다시 손에 쥐여 준다.",
      "이제부터는 스마트폰으로 구인 앱을 직접 볼 수 있다.",
    ],
    character: "",
    options: [
      {
        title: "스마트폰을 켠다",
        action: "unlock",
      },
    ],
  },
];
