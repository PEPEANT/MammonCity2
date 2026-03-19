function getCurrentDayNumber() {
  return typeof state === "undefined" ? 1 : state.day;
}

function getDayData(day = getCurrentDayNumber()) {
  return DAY_DATA[day] || DAY01_DATA;
}

function getDayStoryData(day = getCurrentDayNumber()) {
  return getDayData(day).story || DAY01_DATA.story;
}

function getDayEventData(day = getCurrentDayNumber()) {
  return getDayData(day).events || DAY01_DATA.events;
}

function getDayEventRegistry(day = getCurrentDayNumber()) {
  return getDayEventData(day).registry || [];
}

function getDayWorldData(day = getCurrentDayNumber()) {
  return getDayData(day).world || DAY01_DATA.world;
}

const DEFAULT_DAY_DEV_PRESETS = [
  {
    id: "room",
    label: "기본 방",
    type: "scene",
    scene: "room",
  },
  {
    id: "outside",
    label: "건물 앞",
    type: "scene",
    scene: "outside",
  },
  {
    id: "jobs",
    label: "폰 공고앱",
    type: "phone",
    scene: "room",
    view: "jobs",
    phoneMinimized: false,
  },
];

function getDayDevData(day = getCurrentDayNumber()) {
  return getDayData(day).dev || {};
}

function getDayDevPresets(day = getCurrentDayNumber()) {
  const merged = new Map();

  DEFAULT_DAY_DEV_PRESETS.forEach((preset) => {
    merged.set(preset.id, { ...preset });
  });

  const dayPresets = getDayDevData(day).presets;
  if (Array.isArray(dayPresets)) {
    dayPresets.forEach((preset) => {
      if (preset?.id) {
        merged.set(preset.id, { ...preset });
      }
    });
  }

  return [...merged.values()];
}

function getCurrentOutsideSceneConfig() {
  return getDayWorldData().outsideScene || null;
}

const SAVE_STATE_KEY = "mammon-city-save-v1";
const SAVE_STATE_VERSION = 1;
const TIME_COSTS = {
  moveBetweenScenes: 1,
  jobApplication: 1,
  phoneApp: 1,
  videoApp: 2,
  waitInRoom: 1,
};
const PROLOGUE_TIME_SLOTS = {
  introWake: 13,
  introCleanupPrompt: 14,
  introCleanup: 15,
  introReward: 16,
};
const JOB_SHIFT_RULES = {
  convenience: { startSlotChoices: [18, 22, 26], durationSlots: 10 },
  delivery: { startSlotChoices: [20, 24, 28], durationSlots: 8 },
  tutoring: { startSlotChoices: [26, 30], durationSlots: 6 },
  cafe: { startSlotChoices: [18, 22], durationSlots: 10 },
  warehouse: { startSlotChoices: [17, 21], durationSlots: 12 },
  cleaning: { startSlotChoices: [30, 34], durationSlots: 8 },
  smart_store: { startSlotChoices: [18, 22, 26], durationSlots: 10 },
  dispatch_monitor: { startSlotChoices: [20, 24, 28], durationSlots: 8 },
  study_coach: { startSlotChoices: [26, 30], durationSlots: 6 },
  robot_floor: { startSlotChoices: [18, 22], durationSlots: 10 },
  line_inspector: { startSlotChoices: [17, 21], durationSlots: 12 },
  closing_checker: { startSlotChoices: [30, 34], durationSlots: 8 },
};

function getJobShiftRule(jobId) {
  return JOB_SHIFT_RULES[jobId] || {
    startSlotChoices: [20, 24],
    durationSlots: 8,
  };
}

function formatClockTime(slot = DAY_START_TIME_SLOT) {
  const normalized = Math.max(0, Math.round(slot));
  const hours = Math.floor(normalized / 2);
  const minutes = normalized % 2 === 0 ? "00" : "30";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function getDefaultTimeSlotForState(targetState = state) {
  if (targetState.scene === "prologue" && targetState.storyKey === "intro") {
    if (targetState.storyStep <= 0) {
      return PROLOGUE_TIME_SLOTS.introWake;
    }
    if (targetState.storyStep === 1) {
      return PROLOGUE_TIME_SLOTS.introCleanupPrompt;
    }
    return PROLOGUE_TIME_SLOTS.introReward;
  }

  if (targetState.scene === "cleanup") {
    return PROLOGUE_TIME_SLOTS.introCleanup;
  }

  return DAY_START_TIME_SLOT;
}

function matchesEventTrigger(event, action) {
  const trigger = event.trigger || {};

  if (event.action && event.action !== action) {
    return false;
  }

  if (trigger.day != null && trigger.day !== state.day) {
    return false;
  }

  if (trigger.scene && trigger.scene !== state.scene) {
    return false;
  }

  if (trigger.storyKey && trigger.storyKey !== state.storyKey) {
    return false;
  }

  if (trigger.storyStep != null && trigger.storyStep !== state.storyStep) {
    return false;
  }

  if (trigger.state) {
    for (const [key, value] of Object.entries(trigger.state)) {
      if (state[key] !== value) {
        return false;
      }
    }
  }

  return true;
}

function findTriggeredEvent(action, day = getCurrentDayNumber()) {
  return getDayEventRegistry(day).find((event) => matchesEventTrigger(event, action)) || null;
}

function getDayEventConfig(event, day = getCurrentDayNumber()) {
  if (!event) {
    return null;
  }

  const eventData = getDayEventData(day);

  if (event.dataKey && eventData[event.dataKey]) {
    return eventData[event.dataKey];
  }

  return event.data || null;
}

function findDayEventById(eventId, day = getCurrentDayNumber()) {
  if (!eventId) {
    return null;
  }

  return getDayEventRegistry(day).find((event) => event.id === eventId) || null;
}

function applyStatePatch(targetState = state, patch = {}) {
  Object.entries(patch).forEach(([key, value]) => {
    targetState[key] = value;
  });
}

function applyEventStatePatch(patch = {}) {
  applyStatePatch(state, patch);
}

function startRegisteredEvent(action) {
  const event = findTriggeredEvent(action);

  if (!event) {
    return false;
  }

  if (event.type === "cleanup") {
    const cleanup = getDayEventConfig(event);
    state.timeSlot = PROLOGUE_TIME_SLOTS.introCleanup;
    state.scene = "cleanup";
    state.cleaningGame = {
      eventId: event.id,
      items: cleanup.items.map((item) => ({ ...item })),
      remaining: cleanup.items.length,
    };
    renderGame();
    return true;
  }

  return false;
}

function getActiveCleaningEvent() {
  const activeId = state.cleaningGame?.eventId;
  if (!activeId) {
    return null;
  }

  return getDayEventRegistry().find((event) => event.id === activeId) || null;
}

function finishRegisteredCleanupEvent() {
  const event = getActiveCleaningEvent();
  const cleanup = getDayEventConfig(event);

  if (!event || !cleanup) {
    return false;
  }

  const onComplete = event.onComplete || {};

  applyEventStatePatch(onComplete.state);

  if (onComplete.rewardFromData && cleanup.reward) {
    state.money += cleanup.reward;
    showMoneyEffect(cleanup.reward);
  }

  state.cleaningGame = null;
  state.timeSlot = PROLOGUE_TIME_SLOTS.introReward;

  if (onComplete.scene) {
    state.scene = onComplete.scene;
  }

  if (onComplete.storyStepDelta) {
    state.storyStep = Math.min(
      state.storyStep + onComplete.storyStepDelta,
      getActiveStorySteps().length - 1,
    );
  }

  renderGame();
  return true;
}

let state = createInitialState();
let pendingSavedState = null;

document.addEventListener("DOMContentLoaded", () => {
  cacheUi();
  bindStaticEvents();
  pendingSavedState = loadSavedState();
  showStartScreen(Boolean(pendingSavedState));
});

function createInitialState() {
  return {
    playerName: "이름 없음",
    day: 1,
    money: 0,
    stamina: BASE_STAMINA,
    energy: BASE_ENERGY,
    timeSlot: PROLOGUE_TIME_SLOTS.introWake,
    scene: "prologue",
    storyKey: "intro",
    storyStep: 0,
    hasPhone: true,
    phoneMinimized: true,
    phoneView: "home",
    phoneUsedToday: false,
    jobApplicationDoneToday: false,
    phonePreview: createPhoneHomePreview(1),
    activeJobs: new Set(STARTING_JOB_IDS),
    seenIncidents: new Set(),
    jobVisits: {},
    dayOffers: [],
    nextDayShift: null,
    interviewResult: null,
    currentOffer: null,
    currentIncident: null,
    lastResult: null,
    endingSummary: null,
    day1CleanupDone: false,
    cleaningGame: null,
    devPreviewMode: false,
    headline: {
      badge: "",
      text: "",
    },
  };
}

function advanceStoryStep() {
  state.storyStep = Math.min(state.storyStep + 1, getActiveStorySteps().length - 1);
}

function serializeState(currentState = state) {
  return {
    version: SAVE_STATE_VERSION,
    savedAt: Date.now(),
    state: {
      ...currentState,
      activeJobs: [...currentState.activeJobs],
      seenIncidents: [...currentState.seenIncidents],
    },
  };
}

function hydrateState(rawState = {}) {
  const nextState = createInitialState();
  const mergedState = {
    ...nextState,
    ...rawState,
  };

  mergedState.hasPhone = true;
  mergedState.activeJobs = new Set(Array.isArray(rawState.activeJobs) ? rawState.activeJobs : [...nextState.activeJobs]);
  mergedState.seenIncidents = new Set(Array.isArray(rawState.seenIncidents) ? rawState.seenIncidents : []);
  mergedState.jobVisits = { ...nextState.jobVisits, ...(rawState.jobVisits || {}) };
  mergedState.dayOffers = Array.isArray(rawState.dayOffers) ? rawState.dayOffers.map((offer) => ({ ...offer })) : [];
  mergedState.currentOffer = rawState.currentOffer ? { ...rawState.currentOffer } : null;
  mergedState.currentIncident = rawState.currentIncident ? { ...rawState.currentIncident } : null;
  mergedState.lastResult = rawState.lastResult
    ? { ...rawState.lastResult, lines: [...(rawState.lastResult.lines || [])] }
    : null;
  mergedState.endingSummary = rawState.endingSummary
    ? {
        ...rawState.endingSummary,
        lines: [...(rawState.endingSummary.lines || [])],
        rank: rawState.endingSummary.rank ? { ...rawState.endingSummary.rank } : null,
      }
    : null;
  mergedState.cleaningGame = rawState.cleaningGame
    ? {
        ...rawState.cleaningGame,
        items: Array.isArray(rawState.cleaningGame.items)
          ? rawState.cleaningGame.items.map((item) => ({ ...item }))
          : [],
      }
    : null;
  mergedState.phonePreview = rawState.phonePreview
    ? { ...nextState.phonePreview, ...rawState.phonePreview }
    : createPhoneHomePreview(mergedState.day);
  mergedState.phoneView = rawState.phoneView === "jobs" ? "jobs" : "home";
  mergedState.jobApplicationDoneToday = Boolean(rawState.jobApplicationDoneToday);
  mergedState.nextDayShift = rawState.nextDayShift?.offer
    ? {
        ...rawState.nextDayShift,
        offer: { ...rawState.nextDayShift.offer },
      }
    : null;
  mergedState.interviewResult = rawState.interviewResult?.offer
    ? {
        ...rawState.interviewResult,
        offer: { ...rawState.interviewResult.offer },
        lines: [...(rawState.interviewResult.lines || [])],
      }
    : null;
  mergedState.headline = { ...nextState.headline, ...(rawState.headline || {}) };
  mergedState.timeSlot = Number.isFinite(rawState.timeSlot)
    ? rawState.timeSlot
    : getDefaultTimeSlotForState(mergedState);

  return mergedState;
}

function createPhoneHomePreview(day = 1) {
  return {
    appId: "",
    kicker: "HOME",
    state: "READY",
    title: `${day}일차 스마트폰`,
    body: "공고 확인과 생활 앱을 바로 사용할 수 있다.",
  };
}

function createPhoneResultPreview(appId, kicker, title, body) {
  return {
    appId,
    kicker,
    state: "DONE",
    title,
    body,
  };
}

function canUsePhoneApps(targetState = state) {
  return !["prologue", "cleanup"].includes(targetState.scene);
}

function canApplyForJobOffer() {
  return Boolean(
    state.hasPhone
    && canUsePhoneApps()
    && !state.jobApplicationDoneToday
    && !state.nextDayShift,
  );
}

function getScheduledShiftForToday(targetState = state) {
  if (!targetState.nextDayShift || targetState.nextDayShift.day !== targetState.day) {
    return null;
  }

  return targetState.nextDayShift;
}

function cloneOfferSnapshot(offer) {
  return offer
    ? {
        jobId: offer.jobId,
        pay: offer.pay,
        shiftStartSlot: offer.shiftStartSlot,
        shiftDurationSlots: offer.shiftDurationSlots,
      }
    : null;
}

function getOfferShiftTiming(offer) {
  if (!offer) {
    return null;
  }

  const startSlot = Number.isFinite(offer.shiftStartSlot) ? offer.shiftStartSlot : DAY_START_TIME_SLOT;
  const durationSlots = Number.isFinite(offer.shiftDurationSlots) ? offer.shiftDurationSlots : 8;

  return {
    startSlot,
    durationSlots,
    endSlot: startSlot + durationSlots,
  };
}

function getScheduledShiftStatus(targetState = state) {
  const scheduledShift = getScheduledShiftForToday(targetState);
  if (!scheduledShift) {
    return null;
  }

  const timing = getOfferShiftTiming(scheduledShift.offer);
  return {
    ...timing,
    scheduledShift,
    waiting: targetState.timeSlot < timing.startSlot,
    active: targetState.timeSlot >= timing.startSlot && targetState.timeSlot < timing.endSlot,
    missed: targetState.timeSlot >= timing.endSlot,
  };
}

function spendTimeSlots(slots = 0) {
  const normalized = Math.max(0, Math.round(slots));
  if (!normalized) {
    return false;
  }

  state.timeSlot = Math.min(DAY_END_TIME_SLOT, state.timeSlot + normalized);
  return state.timeSlot >= DAY_END_TIME_SLOT;
}

function advanceTimeToSlot(targetSlot) {
  const nextSlot = Math.max(state.timeSlot, Math.round(targetSlot));
  if (nextSlot <= state.timeSlot) {
    return false;
  }

  state.timeSlot = Math.min(DAY_END_TIME_SLOT, nextSlot);
  return state.timeSlot >= DAY_END_TIME_SLOT;
}

function refreshPhoneHomePreviewForState(targetState = state) {
  if (targetState.phoneView !== "home") {
    return;
  }

  const scheduledShift = getScheduledShiftForToday(targetState);
  const pendingShift = targetState.nextDayShift;
  const result = targetState.interviewResult && targetState.interviewResult.day === targetState.day
    ? targetState.interviewResult
    : null;

  if (scheduledShift) {
    const job = JOB_LOOKUP[scheduledShift.offer.jobId];
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "SHIFT",
      state: "TODAY",
      title: `${job.title} 출근`,
      body: "오늘 예약된 근무가 있다. 폰 공고앱이나 방 화면에서 바로 출근할 수 있다.",
    };
    return;
  }

  if (pendingShift) {
    const job = JOB_LOOKUP[pendingShift.offer.jobId];
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "BOOKED",
      state: "READY",
      title: `${job.title} 예약 완료`,
      body: `${pendingShift.day}일차 출근이 잡혀 있다.`,
    };
    return;
  }

  if (result) {
    const job = JOB_LOOKUP[result.offer.jobId];
    targetState.phonePreview = {
      appId: "jobs",
      kicker: result.success ? "PASS" : "FAIL",
      state: result.success ? "BOOKED" : "CLOSED",
      title: `${job.title} 지원 결과`,
      body: result.lines.join(" "),
    };
    return;
  }

  targetState.phonePreview = createPhoneHomePreview(targetState.day);
}

function refreshPhoneHomePreview() {
  refreshPhoneHomePreviewForState(state);
}

function getInterviewChanceForOffer(offer) {
  const baseByJob = {
    convenience: 0.58,
    delivery: 0.62,
    tutoring: 0.42,
    cafe: 0.55,
    warehouse: 0.64,
    cleaning: 0.56,
  };

  let chance = baseByJob[offer.jobId] ?? 0.52;

  if (offer.jobId === "cleaning" && state.day1CleanupDone) {
    chance += 0.18;
  }
  if (offer.jobId === "warehouse" && state.stamina >= 90) {
    chance += 0.05;
  }
  if (offer.jobId === "delivery" && state.energy >= 90) {
    chance += 0.05;
  }
  if (offer.jobId === "tutoring" && state.day >= 2) {
    chance += 0.04;
  }
  if (offer.jobId === "cafe" && state.money >= 50000) {
    chance += 0.03;
  }

  return Math.max(0.15, Math.min(0.92, chance));
}

function openPhoneHome() {
  state.phoneView = "home";
  refreshPhoneHomePreview();
  renderGame();
}

function openPhoneJobsApp() {
  if (!state.hasPhone || !canUsePhoneApps()) {
    return;
  }

  state.phoneMinimized = false;
  state.phoneView = "jobs";
  renderGame();
}

function applyToPhoneJob(index) {
  if (!canApplyForJobOffer()) {
    return;
  }

  const offer = state.dayOffers[index];
  if (!offer) {
    return;
  }

  const job = JOB_LOOKUP[offer.jobId];
  const chance = getInterviewChanceForOffer(offer);
  const success = Math.random() < chance;

  state.jobApplicationDoneToday = true;
  state.interviewResult = {
    day: state.day,
    success,
    chance,
    offer: cloneOfferSnapshot(offer),
    lines: success
      ? [
          `${job.title} 지원 결과가 도착했다.`,
          `${state.day + 1}일차에 출근하라는 연락을 받았다.`,
        ]
      : [
          `${job.title} 지원 결과가 도착했다.`,
          "이번에는 채용되지 않았다.",
        ],
  };

  if (success) {
    state.nextDayShift = {
      day: state.day + 1,
      offer: cloneOfferSnapshot(offer),
    };
    state.headline = {
      badge: "면접 합격",
      text: `${job.title}에 붙었다. ${state.day + 1}일차 출근이 예약됐다.`,
    };
  } else {
    state.headline = {
      badge: "면접 결과",
      text: `${job.title} 지원은 이번엔 이어지지 않았다.`,
    };
  }

  refreshPhoneHomePreview();
  if (spendTimeSlots(TIME_COSTS.jobApplication)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function startScheduledShift() {
  const shiftStatus = getScheduledShiftStatus();

  if (!shiftStatus) {
    return;
  }

  if (shiftStatus.waiting) {
    waitForScheduledShift();
    return;
  }

  if (shiftStatus.missed) {
    skipScheduledShift();
    return;
  }

  const scheduledShift = shiftStatus.scheduledShift;
  const offer = cloneOfferSnapshot(scheduledShift.offer);
  const job = JOB_LOOKUP[offer.jobId];

  state.timeSlot = Math.max(state.timeSlot, shiftStatus.startSlot) + shiftStatus.durationSlots;
  state.currentOffer = offer;
  state.jobVisits[offer.jobId] = (state.jobVisits[offer.jobId] || 0) + 1;
  state.currentIncident = pickIncident(offer.jobId, state.jobVisits[offer.jobId]);
  state.scene = "incident";
  state.nextDayShift = null;
  state.interviewResult = null;
  state.phoneView = "home";
  state.headline = {
    badge: "출근 시작",
    text: `${job.title} 근무를 위해 현장으로 향했다.`,
  };
  refreshPhoneHomePreview();
  renderGame();
}

function waitInRoom() {
  state.headline = {
    badge: "시간 경과",
    text: "방 안에서 30분을 보낸다.",
  };
  if (spendTimeSlots(TIME_COSTS.waitInRoom)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function waitForScheduledShift() {
  const shiftStatus = getScheduledShiftStatus();
  if (!shiftStatus) {
    return;
  }

  state.headline = {
    badge: "출근 대기",
    text: `${formatClockTime(shiftStatus.startSlot)} 출근까지 시간을 보낸다.`,
  };
  if (advanceTimeToSlot(shiftStatus.startSlot)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function skipScheduledShift() {
  const scheduledShift = getScheduledShiftForToday();

  if (!scheduledShift) {
    return;
  }

  const offer = cloneOfferSnapshot(scheduledShift.offer);
  const job = JOB_LOOKUP[offer.jobId];

  state.currentOffer = offer;
  state.lastResult = {
    pay: 0,
    lines: [
      `${job.title} 출근을 놓쳤다.`,
      "예약된 근무는 사라졌고, 오늘은 돈을 벌지 못했다.",
    ],
  };
  state.nextDayShift = null;
  state.interviewResult = null;
  state.phoneView = "home";
  state.scene = "result";
  state.headline = {
    badge: "결근",
    text: `${job.title} 예약 근무를 놓쳤다.`,
  };
  refreshPhoneHomePreview();
  renderGame();
}

function normalizeStateForCurrentRules() {
  if (state.day >= 1) {
    state.hasPhone = true;
  }

  if (typeof state.phoneMinimized !== "boolean") {
    state.phoneMinimized = true;
  }

  if (!state.phonePreview || typeof state.phonePreview !== "object") {
    state.phonePreview = createPhoneHomePreview(state.day);
  }

  if (state.phoneView !== "jobs") {
    state.phoneView = "home";
  }

  if (typeof state.jobApplicationDoneToday !== "boolean") {
    state.jobApplicationDoneToday = false;
  }

  if (!Number.isFinite(state.timeSlot)) {
    state.timeSlot = getDefaultTimeSlotForState(state);
  }

  if (state.nextDayShift && state.nextDayShift.day < state.day) {
    state.nextDayShift = null;
  }

  if (state.interviewResult && state.interviewResult.day !== state.day) {
    state.interviewResult = null;
  }

  if (typeof state.devPreviewMode !== "boolean") {
    state.devPreviewMode = false;
  }
}

function canPersistState() {
  return Boolean(ui.startScreen?.classList.contains("is-hidden")) && !state.devPreviewMode;
}

function persistState() {
  if (!canPersistState()) {
    return;
  }

  try {
    localStorage.setItem(SAVE_STATE_KEY, JSON.stringify(serializeState()));
  } catch (error) {
    console.warn("Failed to save game state", error);
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(SAVE_STATE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (parsed?.version !== SAVE_STATE_VERSION || !parsed.state) {
      return null;
    }

    return hydrateState(parsed.state);
  } catch (error) {
    console.warn("Failed to load saved game state", error);
    return null;
  }
}

function clearSavedState() {
  try {
    localStorage.removeItem(SAVE_STATE_KEY);
  } catch (error) {
    console.warn("Failed to clear saved game state", error);
  }
}

function restoreSavedState(savedState = pendingSavedState || loadSavedState()) {
  if (!savedState) {
    return false;
  }

  pendingSavedState = null;
  state = savedState;
  hideStartScreen();
  renderGame();
  return true;
}

function hasActionHandler(action) {
  return Boolean(ACTION_HANDLERS[action]);
}

const ACTION_HANDLERS = {
  keepSleeping() {
    recoverEnergy();
    state.timeSlot = PROLOGUE_TIME_SLOTS.introCleanupPrompt;
    advanceStoryStep();
    renderGame();
  },
  wakeUp() {
    state.timeSlot = PROLOGUE_TIME_SLOTS.introCleanupPrompt;
    advanceStoryStep();
    renderGame();
  },
  cleanRoom() {
    return startRegisteredEvent("cleanRoom");
  },
  continueDay() {
    prepareDay();
  },
  sleep() {
    recoverStamina();
    recoverEnergy();
    if (state.storyKey === "intro") {
      state.day = 2;
    }
    prepareDay();
  },
  unlock() {
    state.hasPhone = true;
    prepareDay();
  },
  next() {
    advanceStoryStep();
    renderGame();
  },
  board() {
    enterJobBoard();
  },
  home() {
    returnHomeFromOutside();
  },
};

function runAction(action) {
  const handler = ACTION_HANDLERS[action];

  if (!handler) {
    return false;
  }

  return handler();
}

function bindStaticEvents() {
  ui.continueButton?.addEventListener("click", continueSavedGame);
  ui.startButton.addEventListener("click", startGame);
  ui.nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startGame();
    }
  });
  window.addEventListener("keydown", handleWorldKeyDown);
  window.addEventListener("resize", () => {
    renderGame();
  });

  // 스마트폰 앱 버튼 클릭
  document.querySelectorAll(".phone-app-btn[data-app]").forEach((btn) => {
    btn.addEventListener("click", () => usePhoneApp(btn.dataset.app));
  });
  ui.phoneToggleButton?.addEventListener("click", togglePhonePanel);
  ui.phoneAppScreen?.addEventListener("click", handlePhoneScreenClick);
}

function startGame() {
  const playerName = ui.nameInput.value.trim() || "이름 없음";

  clearSavedState();
  pendingSavedState = null;
  state = createInitialState();
  state.playerName = playerName;

  hideStartScreen();
  renderGame();
}

function continueSavedGame() {
  if (restoreSavedState()) {
    return;
  }

  startGame();
}

function startStory(storyKey) {
  state.scene = "prologue";
  state.storyKey = storyKey;
  state.storyStep = 0;
  state.headline = {
    badge: "",
    text: "",
  };
  renderGame();
}

function getActiveStorySteps() {
  const storyData = getDayStoryData();
  return state.storyKey === "phoneUnlock" ? storyData.phoneUnlockSteps : storyData.introSteps;
}

function handlePrologueOption(action) {
  if (hasActionHandler(action)) {
    runAction(action);
    return;
  }

  const steps = getActiveStorySteps();

  if (state.storyStep < steps.length - 1) {
    advanceStoryStep();
    renderGame();
    return;
  }

  prepareDay();
}

function prepareDay() {
  prepareDayState(state);
  renderGame();
}

function prepareDayState(targetState = state) {
  targetState.timeSlot = DAY_START_TIME_SLOT;
  targetState.scene = "room";
  targetState.currentOffer = null;
  targetState.currentIncident = null;
  targetState.lastResult = null;
  targetState.endingSummary = null;
  targetState.cleaningGame = null;
  targetState.hasPhone = true;
  targetState.phoneView = "home";
  targetState.phoneUsedToday = false;
  targetState.jobApplicationDoneToday = false;
  if (targetState.nextDayShift && targetState.nextDayShift.day < targetState.day) {
    targetState.nextDayShift = null;
  }
  if (targetState.interviewResult && targetState.interviewResult.day !== targetState.day) {
    targetState.interviewResult = null;
  }
  targetState.phonePreview = createPhoneHomePreview(targetState.day);
  targetState.dayOffers = buildDayOffersForState(targetState);
  targetState.headline = {
    badge: "",
    text: "",
  };
  refreshPhoneHomePreviewForState(targetState);
}

function collectTrash(itemId) {
  if (state.scene !== "cleanup" || !state.cleaningGame) {
    return;
  }

  const item = state.cleaningGame.items.find((entry) => entry.id === itemId);

  if (!item || item.collected) {
    return;
  }

  spendEnergy(1);
  item.collected = true;
  state.cleaningGame.remaining -= 1;

  if (state.cleaningGame.remaining <= 0) {
    if (!finishRegisteredCleanupEvent()) {
      state.cleaningGame = null;
      renderGame();
    }
    return;
  }

  renderGame();
}

/* ── 스마트폰 앱 액션 ────────────────────────────────── */
const PHONE_ACTIONS = {
  jobs() {
    openPhoneJobsApp();
    return null;
  },
  daangn() {
    const earn = roundToHundred(randomBetween(10000, 40000));
    state.money += earn;
    showMoneyEffect(earn);
    const message = `중고 물건을 팔아 ${formatMoney(earn)}을 받았다.`;
    setHeadline("📲 당근마켓", message);
    return createPhoneResultPreview("daangn", "MARKET", "당근마켓 거래 완료", message);
  },
  stocks() {
    const win = Math.random() < 0.5;
    const change = win ? 60000 : -30000;
    const actual = Math.max(-state.money, change);
    state.money = Math.max(0, state.money + change);
    showMoneyEffect(actual);
    if (win) {
      const message = `오늘 주식이 올랐다. ${formatMoney(60000)} 수익.`;
      setHeadline("📈 주식 앱", message);
      return createPhoneResultPreview("stocks", "STOCK", "주식 앱 상승", message);
    } else {
      const message = `오늘 주식이 폭락했다. ${formatMoney(30000)} 손실.`;
      setHeadline("📈 주식 앱", message);
      return createPhoneResultPreview("stocks", "STOCK", "주식 앱 하락", message);
    }
  },
  delivery() {
    const cost = 15000;
    state.money = Math.max(0, state.money - cost);
    showMoneyEffect(-cost);
    const message = `음식을 시켜 먹었다. ${formatMoney(cost)} 지출.`;
    setHeadline("🍔 배달 앱", message);
    return createPhoneResultPreview("delivery", "DELIVERY", "배달 앱 주문 완료", message);
  },
  youtube() {
    const message = "쇼츠를 보다가 두 시간이 사라졌다. 아무 일도 없었다.";
    setHeadline("📺 유튜브", message);
    return createPhoneResultPreview("youtube", "VIDEO", "유튜브 감상", message);
  },
};

function usePhoneApp(appId) {
  if (!state.hasPhone || !canUsePhoneApps()) return;
  if (appId === "jobs") {
    openPhoneJobsApp();
    return;
  }
  if (state.phoneUsedToday) return;
  const action = PHONE_ACTIONS[appId];
  if (!action) return;

  const preview = action();
  if (preview) {
    state.phonePreview = preview;
  }
  state.phoneUsedToday = true;
  state.phoneView = "home";
  const timeCost = appId === "youtube" ? TIME_COSTS.videoApp : TIME_COSTS.phoneApp;
  if (spendTimeSlots(timeCost)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function togglePhonePanel() {
  if (!state.hasPhone) {
    return;
  }

  state.phoneMinimized = !state.phoneMinimized;
  updatePhonePanel();
  persistState();
}

function handlePhoneScreenClick(event) {
  const actionTarget = event.target.closest("[data-phone-action]");

  if (!actionTarget) {
    return;
  }

  const { phoneAction, offerIndex } = actionTarget.dataset;

  if (phoneAction === "close-phone-view") {
    openPhoneHome();
    return;
  }

  if (phoneAction === "apply-job") {
    applyToPhoneJob(Number(offerIndex));
    return;
  }

  if (phoneAction === "go-shift") {
    startScheduledShift();
  }
}

function buildDayOffersForState(targetState = state) {
  const activeIds = [...targetState.activeJobs];
  const chosenIds = shuffle(activeIds).slice(0, Math.min(3, activeIds.length));

  return chosenIds.map((jobId) => {
    const job = JOB_LOOKUP[jobId];
    const shiftRule = getJobShiftRule(jobId);
    return {
      jobId,
      pay: roundToHundred(randomBetween(job.payMin, job.payMax)),
      shiftStartSlot: sample(shiftRule.startSlotChoices),
      shiftDurationSlots: shiftRule.durationSlots,
    };
  });
}

function buildDayOffers() {
  return buildDayOffersForState(state);
}

function applyDevReplayPresetToState(targetState, preset, day = targetState.day) {
  if (!targetState || !preset) {
    return;
  }

  if (preset.baseState) {
    applyStatePatch(targetState, preset.baseState);
  }

  switch (preset.type) {
    case "story":
      targetState.scene = "prologue";
      targetState.storyKey = preset.storyKey || "intro";
      targetState.storyStep = Math.max(0, preset.storyStep || 0);
      targetState.cleaningGame = null;
      targetState.phoneMinimized = true;
      targetState.phoneView = "home";
      break;
    case "cleanup": {
      const event = findDayEventById(preset.eventId, day);
      const cleanup = getDayEventConfig(event, day);
      if (event && cleanup) {
        targetState.scene = "cleanup";
        targetState.cleaningGame = {
          eventId: event.id,
          items: cleanup.items.map((item) => ({ ...item })),
          remaining: cleanup.items.length,
        };
      }
      if (preset.storyKey) {
        targetState.storyKey = preset.storyKey;
      }
      if (preset.storyStep != null) {
        targetState.storyStep = preset.storyStep;
      }
      targetState.phoneMinimized = true;
      targetState.phoneView = "home";
      break;
    }
    case "phone":
      targetState.scene = preset.scene || "room";
      targetState.phoneMinimized = preset.phoneMinimized ?? false;
      targetState.phoneView = preset.view || "home";
      break;
    case "scene":
    default:
      targetState.scene = preset.scene || "room";
      if (preset.phoneView) {
        targetState.phoneView = preset.phoneView;
      }
      if (preset.phoneMinimized != null) {
        targetState.phoneMinimized = preset.phoneMinimized;
      }
      break;
  }

  if (preset.state) {
    applyStatePatch(targetState, preset.state);
  }

  if (preset.headline) {
    targetState.headline = {
      ...targetState.headline,
      ...preset.headline,
    };
  }

  if (typeof preset.apply === "function") {
    preset.apply(targetState, {
      day,
      getEventConfig: (eventId) => getDayEventConfig(findDayEventById(eventId, day), day),
    });
  }

  if (targetState.phoneView === "home") {
    refreshPhoneHomePreviewForState(targetState);
  }
}

function createDevReplayState(day, presetId, playerName = state?.playerName) {
  const preset = getDayDevPresets(day).find((entry) => entry.id === presetId);
  if (!preset) {
    return null;
  }

  const nextState = createInitialState();
  nextState.playerName = playerName || nextState.playerName;
  nextState.day = day;
  nextState.day1CleanupDone = day > 1;
  nextState.devPreviewMode = true;
  prepareDayState(nextState);
  applyDevReplayPresetToState(nextState, preset, day);
  return nextState;
}

function selectJobOffer(index) {
  const offer = state.dayOffers[index];
  if (!offer) {
    return;
  }

  state.currentOffer = offer;
  state.jobVisits[offer.jobId] = (state.jobVisits[offer.jobId] || 0) + 1;
  state.currentIncident = pickIncident(offer.jobId, state.jobVisits[offer.jobId]);
  state.scene = "incident";
  state.headline = {
    badge: JOB_LOOKUP[offer.jobId].category,
    text: `${JOB_LOOKUP[offer.jobId].title} 공고를 잡았다. 오늘은 어떤 일이 터질까.`,
  };
  renderGame();
}

function pickIncident(jobId, visits) {
  const pack = JOB_EVENTS[jobId];
  const critical = pack.critical;

  if (critical && visits >= (critical.minVisits || 1) && !state.seenIncidents.has(critical.id)) {
    return critical;
  }

  return sample(pack.repeatable);
}

function chooseIncidentOption(index) {
  const incident = state.currentIncident;
  if (!incident) {
    return;
  }

  const choice = incident.choices[index];
  if (!choice) {
    return;
  }

  if (incident.once) {
    state.seenIncidents.add(incident.id);
  }

  const pay = calculatePay(state.currentOffer.pay, choice);
  state.money += pay;
  showMoneyEffect(pay);

  if (choice.changes?.remove) {
    choice.changes.remove.forEach((jobId) => state.activeJobs.delete(jobId));
  }

  if (choice.changes?.add) {
    choice.changes.add.forEach((jobId) => state.activeJobs.add(jobId));
  }

  state.lastResult = {
    pay,
    lines: choice.result,
  };

  state.headline = choice.changes?.news
    ? {
        badge: "시장 변화",
        text: choice.changes.news,
      }
    : {
        badge: "오늘 정산",
        text: "하루 근무가 끝났다. 내일은 또 다른 공고를 찾는다.",
      };

  state.scene = "result";
  renderGame();
}

function goToNextDay() {
  advanceDayOrFinish();
}

function sleepInRoom() {
  if (getScheduledShiftForToday()) {
    skipScheduledShift();
    return;
  }

  advanceDayOrFinish();
}

function goOutside() {
  if (spendTimeSlots(TIME_COSTS.moveBetweenScenes)) {
    advanceDayOrFinish();
    return;
  }
  state.scene = "outside";
  state.headline = {
    badge: "",
    text: "",
  };
  renderGame();
}

function handleWorldKeyDown(event) {
  if (state.scene !== "outside") {
    return;
  }

  if (["ArrowRight", "ArrowLeft", "a", "A", "d", "D"].includes(event.key)) {
    event.preventDefault();
  }
}

function handleOutsideOption(action) {
  if (hasActionHandler(action)) {
    runAction(action);
  }
}

function returnHomeFromOutside() {
  if (spendTimeSlots(TIME_COSTS.moveBetweenScenes)) {
    advanceDayOrFinish();
    return;
  }
  state.scene = "room";
  state.headline = {
    badge: "",
    text: "",
  };
  renderGame();
}

function enterJobBoard() {
  const boardHeadline = getDayWorldData().boardHeadline || {};
  if (spendTimeSlots(TIME_COSTS.phoneApp)) {
    advanceDayOrFinish();
    return;
  }
  if (state.hasPhone) {
    state.phoneMinimized = false;
    state.phoneView = "jobs";
    state.headline = {
      badge: "스마트폰",
      text: boardHeadline.phone || "밖에서도 스마트폰으로 오늘 공고를 본다.",
    };
    renderGame();
    return;
  }

  state.scene = "board";
  state.headline = {
    badge: state.hasPhone ? "스마트폰" : `${state.day}일차`,
    text: state.hasPhone
      ? (boardHeadline.phone || "밖에서도 스마트폰으로 오늘 공고를 본다.")
      : (boardHeadline.board || "골목 끝 게시판에서 오늘 공고를 확인한다."),
  };
  renderGame();
}

function recoverStamina() {
  state.stamina = Math.min(SLEEP_STAMINA_MAX, state.stamina + SLEEP_STAMINA_GAIN);
}

function recoverEnergy() {
  state.energy = Math.min(ENERGY_MAX, state.energy + SLEEP_ENERGY_GAIN);
}

function spendEnergy(amount) {
  state.energy = Math.max(0, state.energy - amount);
}

function advanceDayOrFinish({ recover = true } = {}) {
  if (state.day >= MAX_DAYS) {
    finishRun();
    return;
  }

  if (recover) {
    recoverStamina();
    recoverEnergy();
  }

  state.day += 1;
  prepareDay();
}

function finishRun() {
  state.scene = "ending";
  state.currentOffer = null;
  state.currentIncident = null;
  state.endingSummary = buildEndingSummary();
  state.headline = {
    badge: "최종 정산",
    text: `${MAX_DAYS}일이 끝났다. 손에 남은 현금으로 마지막 랭킹이 매겨진다.`,
  };
  renderGame();
}

function buildEndingSummary() {
  const rank = getRankByMoney(state.money);

  return {
    totalCash: state.money,
    rank,
    lines: [
      `${MAX_DAYS}일 동안 모은 현금을 전부 정산했다.`,
      `최종 현금 ${formatMoney(state.money)}`,
      `최종 랭킹 ${rank.label} · ${rank.title}`,
      rank.comment,
    ],
  };
}

function getRankByMoney(money) {
  return RANK_TABLE.find((entry) => money >= entry.min) || RANK_TABLE[RANK_TABLE.length - 1];
}

function restartToTitle() {
  clearSavedState();
  pendingSavedState = null;
  ui.nameInput.value = "";
  state = createInitialState();
  showStartScreen(false);
}

function calculatePay(basePay, choice) {
  const multiplier = choice.payMultiplier ?? 1;
  const bonus = choice.bonus ?? 0;
  const rawPay = (basePay * multiplier) + bonus;
  return Math.max(0, roundToHundred(rawPay));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToHundred(value) {
  return Math.round(value / 100) * 100;
}

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  const copy = [...list];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

window.addEventListener("beforeunload", persistState);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    persistState();
  }
});
