const DAY01_DEV_PRESETS = [
  {
    id: "intro-0",
    label: "프롤로그 1: 기상",
    type: "story",
    storyKey: "intro",
    storyStep: 0,
    state: {
      day1CleanupDone: false,
      money: 0,
      timeSlot: 13,
    },
  },
  {
    id: "intro-1",
    label: "프롤로그 2: 청소 직전",
    type: "story",
    storyKey: "intro",
    storyStep: 1,
    state: {
      day1CleanupDone: false,
      money: 0,
      timeSlot: 14,
    },
  },
  {
    id: "cleanup",
    label: "청소 씬",
    type: "cleanup",
    eventId: "day01-cleanup",
    storyKey: "intro",
    storyStep: 1,
    state: {
      day1CleanupDone: false,
      money: 0,
      timeSlot: 15,
    },
  },
  {
    id: "reward",
    label: "엄마 보상",
    type: "story",
    storyKey: "intro",
    storyStep: 2,
    state: {
      day1CleanupDone: true,
      money: 90000,
      timeSlot: 16,
    },
  },
];

const DAY01_DATA = {
  story: {
    introSteps: DAY01_INTRO_STEPS,
    phoneUnlockSteps: DAY01_PHONE_UNLOCK_STEPS,
  },
  events: DAY01_EVENTS,
  world: DAY01_WORLD,
  dev: {
    presets: DAY01_DEV_PRESETS,
  },
};
