const DAY01_WORLD = {
  outsideScene: {
    speaker: "아파트 앞",
    title: "건물 앞에 나왔다",
    lines: ["어디로 갈지 선택한다."],
    actors: [
      {
        src: CHARACTER_ART.player.standing,
        alt: "player",
        left: 40,
        bottom: 6,
        height: 84,
        zIndex: 2,
      },
    ],
    options: [
      {
        title: "지도를 본다",
        action: "board",
      },
      {
        title: "다시 집으로 간다",
        action: "home",
      },
    ],
  },
  boardHeadline: {
    phone: "밖에서도 스마트폰으로 오늘 공고를 본다.",
    board: "골목 끝 게시판에서 오늘 공고를 확인한다.",
  },
};
