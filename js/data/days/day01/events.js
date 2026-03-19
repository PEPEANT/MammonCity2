const DAY01_EVENTS = {
  registry: [
    {
      id: "day01-cleanup",
      action: "cleanRoom",
      type: "cleanup",
      trigger: {
        day: 1,
        scene: "prologue",
        storyKey: "intro",
        storyStep: 1,
        state: {
          day1CleanupDone: false,
        },
      },
      dataKey: "cleanup",
      onComplete: {
        state: {
          day1CleanupDone: true,
        },
        rewardFromData: true,
        scene: "prologue",
        storyStepDelta: 1,
      },
    },
  ],
  cleanup: {
    reward: 90000,
    items: [
      { id: "trash-1", image: "assets/items/item_1.png", x: 16, y: 62 },
      { id: "trash-2", image: "assets/items/item_2.png", x: 30, y: 78 },
      { id: "trash-3", image: "assets/items/item_3.png", x: 45, y: 86 },
      { id: "trash-4", image: "assets/items/item_4.png", x: 61, y: 70 },
      { id: "trash-5", image: "assets/items/item_5.png", x: 76, y: 83 },
      { id: "trash-6", image: "assets/items/item_6.png", x: 70, y: 58 },
    ],
  },
};
