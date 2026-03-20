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

function getDayWorldLocationMap(day = getCurrentDayNumber()) {
  return getDayWorldData(day).locations || null;
}

function getDayHomeLocationId(day = getCurrentDayNumber()) {
  const worldData = getDayWorldData(day);
  const locations = worldData.locations || null;
  if (!locations) {
    return null;
  }
  if (worldData.homeLocationId && locations[worldData.homeLocationId]) {
    return worldData.homeLocationId;
  }
  if (worldData.defaultLocationId && locations[worldData.defaultLocationId]) {
    return worldData.defaultLocationId;
  }
  return Object.keys(locations)[0] || null;
}

function createDefaultWorldState(day = getCurrentDayNumber()) {
  return {
    currentLocation: getDayHomeLocationId(day),
    alleyNpcVisible: false,
    alleyNpcId: "",
    pendingTravelTarget: "",
  };
}

function syncWorldState(targetState = state) {
  if (!targetState) {
    return createDefaultWorldState();
  }

  const day = targetState.day || getCurrentDayNumber();
  const defaults = createDefaultWorldState(day);
  const worldState = targetState.world && typeof targetState.world === "object"
    ? targetState.world
    : {};
  const locations = getDayWorldLocationMap(day);
  let currentLocation = typeof worldState.currentLocation === "string"
    ? worldState.currentLocation
    : defaults.currentLocation;

  if (locations && currentLocation && !locations[currentLocation]) {
    currentLocation = defaults.currentLocation;
  }

  targetState.world = {
    ...worldState,
    currentLocation,
    alleyNpcVisible: typeof worldState.alleyNpcVisible === "boolean"
      ? worldState.alleyNpcVisible
      : defaults.alleyNpcVisible,
    alleyNpcId: typeof worldState.alleyNpcId === "string"
      ? worldState.alleyNpcId
      : defaults.alleyNpcId,
    pendingTravelTarget: typeof worldState.pendingTravelTarget === "string"
      ? worldState.pendingTravelTarget
      : defaults.pendingTravelTarget,
  };

  return targetState.world;
}

function getCurrentLocationId(targetState = state) {
  return syncWorldState(targetState).currentLocation;
}

function getCurrentLocationLabel(targetState = state) {
  const day = targetState?.day || getCurrentDayNumber();
  const locationId = getCurrentLocationId(targetState);
  const locationMap = getDayWorldLocationMap(day);
  return locationMap?.[locationId]?.label || "배금시";
}

function getPendingTravelTargetLabel(targetState = state) {
  const day = targetState?.day || getCurrentDayNumber();
  const locationMap = getDayWorldLocationMap(day);
  const pendingTarget = syncWorldState(targetState).pendingTravelTarget;
  return locationMap?.[pendingTarget]?.label || "다음 정류장";
}

function getAlleyNpcPool(targetState = state) {
  const day = targetState?.day || getCurrentDayNumber();
  const locations = getDayWorldLocationMap(day);
  const pool = locations?.["apt-alley"]?.randomNpcPool;
  return Array.isArray(pool) ? pool : [];
}

function getActiveAlleyNpcConfig(targetState = state) {
  const worldState = syncWorldState(targetState);
  if (!worldState.alleyNpcVisible || !worldState.alleyNpcId) {
    return null;
  }

  return getAlleyNpcPool(targetState).find((entry) => entry.id === worldState.alleyNpcId) || null;
}

function pickWeightedEntry(entries = []) {
  const weightedEntries = entries.filter((entry) => Number(entry?.weight) > 0);
  const totalWeight = weightedEntries.reduce((sum, entry) => sum + Number(entry.weight || 0), 0);

  if (!totalWeight) {
    return null;
  }

  let roll = Math.random() * totalWeight;
  for (const entry of weightedEntries) {
    roll -= Number(entry.weight || 0);
    if (roll < 0) {
      return entry;
    }
  }

  return weightedEntries[weightedEntries.length - 1] || null;
}

function clearAlleyNpcState(targetState = state) {
  const worldState = syncWorldState(targetState);
  worldState.alleyNpcVisible = false;
  worldState.alleyNpcId = "";
}

function clearPendingTravelState(targetState = state) {
  const worldState = syncWorldState(targetState);
  worldState.pendingTravelTarget = "";
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

function getCurrentOutsideSceneConfig(targetState = state) {
  const day = targetState?.day || getCurrentDayNumber();
  const worldData = getDayWorldData(day);
  const locations = worldData.locations || null;

  if (locations) {
    const locationId = getCurrentLocationId(targetState);
    const baseScene = locationId ? locations[locationId] || null : null;
    if (!baseScene) {
      return null;
    }

    const worldState = syncWorldState(targetState);
    const resolvedScene = {
      ...baseScene,
      lines: [...(baseScene.lines || [])],
      tags: [...(baseScene.tags || [])],
      actors: (baseScene.actors || []).map((actor) => ({ ...actor })),
      options: (baseScene.options || []).map((option) => ({ ...option })),
    };

    if (locationId === "bus-ride") {
      const targetLabel = getPendingTravelTargetLabel(targetState);
      resolvedScene.title = `${targetLabel} 쪽으로 버스가 천천히 미끄러진다`;
      resolvedScene.lines = [
        "차창 너머로 배금시 간판과 가로등이 길게 흘러간다.",
        `${targetLabel}에 가까워질수록 내려야 할 타이밍이 다가온다.`,
      ];
    }

    const activeAlleyNpc = locationId === "apt-alley"
      ? getActiveAlleyNpcConfig(targetState)
      : null;
    if (activeAlleyNpc?.actor) {
      resolvedScene.actors.push({ ...activeAlleyNpc.actor, npcId: activeAlleyNpc.id });
      if (activeAlleyNpc.tag && !resolvedScene.tags.includes(activeAlleyNpc.tag)) {
        resolvedScene.tags.push(activeAlleyNpc.tag);
      }
      resolvedScene.options.unshift({
        title: "가까이 가기",
        action: "approach-alley-npc",
      });
    }

    return resolvedScene;
  }

  return worldData.outsideScene || null;
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

function formatClockTime(slot = DAY_START_TIME_SLOT, minuteOffset = 0) {
  const normalizedSlot = Math.max(0, Math.round(slot));
  const normalizedMinuteOffset = Math.max(0, Math.min(29, Math.round(minuteOffset)));
  const totalMinutes = (normalizedSlot * 30) + normalizedMinuteOffset;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = String(totalMinutes % 60).padStart(2, "0");
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
    state.timeMinuteOffset = 0;
    state.scene = "cleanup";
    state.cleaningGame = {
      eventId: event.id,
      items: cleanup.items.map((item) => ({ ...item })),
      remaining: cleanup.items.length,
    };
    recordActionMemory("방청소를 시작했다", "바닥에 널린 것들을 치우려고 방부터 손대기 시작했다.", {
      type: "action",
      source: "집",
      tags: ["일상", "청소"],
    });
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
    if (typeof earnCash === "function") {
      earnCash(cleanup.reward);
    } else {
      state.money += cleanup.reward;
    }
    showMoneyEffect(cleanup.reward);
  }

  recordActionMemory(
    "방청소를 마쳤다",
    onComplete.rewardFromData && cleanup.reward
      ? `방 안을 정리하고 ${formatMoney(cleanup.reward)}을 손에 쥐었다.`
      : "방 안을 정리하고 한숨 돌렸다.",
    {
      type: "action",
      source: "집",
      tags: ["일상", "청소"],
    },
  );

  state.cleaningGame = null;
  state.timeSlot = PROLOGUE_TIME_SLOTS.introReward;
  state.timeMinuteOffset = 0;

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
  clearSavedState();
  showStartScreen(false);
});

function createInitialState() {
  const phoneDefaults = typeof createDefaultPhoneDeviceState === "function"
    ? createDefaultPhoneDeviceState()
    : {
        minimized: true,
        stageExpanded: false,
        route: "home",
        usedToday: false,
        installedApps: ["dis", "playstore", "call", "gallery"],
      };
  const jobsDefaults = typeof createDefaultJobsState === "function"
    ? createDefaultJobsState()
    : {
        dailyOffers: [],
        scheduledShift: null,
        interviewResult: null,
        applicationDoneToday: false,
      };
  const bankDefaults = typeof createDefaultBankState === "function"
    ? createDefaultBankState()
    : {
        balance: 0,
        transactions: [],
        transferDraft: {
          recipient: "",
          amount: "",
        },
      };
  const dialogueDefaults = typeof createDefaultDialogueState === "function"
    ? createDefaultDialogueState()
    : {
        active: false,
        npcId: "",
        nodeId: "",
        returnScene: "outside",
        returnLocationId: "",
        source: "",
      };
  const memoryDefaults = typeof createDefaultMemoryState === "function"
    ? createDefaultMemoryState()
    : {
        panelOpen: false,
        entries: [],
      };

  return {
    playerName: "이름 없음",
    day: 1,
    money: 0,
    stamina: BASE_STAMINA,
    energy: BASE_ENERGY,
    timeSlot: PROLOGUE_TIME_SLOTS.introWake,
    timeMinuteOffset: 0,
    scene: "prologue",
    storyKey: "intro",
    storyStep: 0,
    devices: {
      phone: { ...phoneDefaults },
    },
    jobs: {
      ...jobsDefaults,
    },
    bank: {
      ...bankDefaults,
      transactions: [...(bankDefaults.transactions || [])],
      transferDraft: { ...(bankDefaults.transferDraft || { recipient: "", amount: "" }) },
    },
    dialogue: {
      ...dialogueDefaults,
    },
    memory: {
      ...memoryDefaults,
      entries: [...(memoryDefaults.entries || [])],
    },
    world: createDefaultWorldState(1),
    hasPhone: true,
    phoneMinimized: phoneDefaults.minimized,
    phoneStageExpanded: phoneDefaults.stageExpanded,
    phoneView: phoneDefaults.route,
    phoneUsedToday: phoneDefaults.usedToday,
    installedPhoneApps: [...(phoneDefaults.installedApps || [])],
    jobApplicationDoneToday: jobsDefaults.applicationDoneToday,
    phonePreview: createPhoneHomePreview(1),
    phoneAppStatus: {},
    activeJobs: new Set(STARTING_JOB_IDS),
    seenIncidents: new Set(),
    jobVisits: {},
    dayOffers: [...jobsDefaults.dailyOffers],
    nextDayShift: jobsDefaults.scheduledShift,
    interviewResult: jobsDefaults.interviewResult,
    currentOffer: null,
    currentIncident: null,
    lastResult: null,
    endingSummary: null,
    lastWorkedJobId: null,
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
  mergedState.phoneAppStatus = rawState.phoneAppStatus && typeof rawState.phoneAppStatus === "object"
    ? Object.fromEntries(Object.entries(rawState.phoneAppStatus).map(([key, value]) => [key, { ...(value || {}) }]))
    : {};
  mergedState.world = {
    ...nextState.world,
    ...(rawState.world || {}),
  };
  mergedState.phoneView = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(rawState.phoneView || nextState.phoneView)
    : (rawState.phoneView || nextState.phoneView);
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
  mergedState.timeMinuteOffset = Number.isFinite(rawState.timeMinuteOffset)
    ? Math.max(0, Math.min(29, Math.round(rawState.timeMinuteOffset)))
    : 0;

  if (typeof syncPhoneSessionState === "function") {
    syncPhoneSessionState(mergedState);
  }

  if (typeof syncJobsDomainState === "function") {
    syncJobsDomainState(mergedState);
  }

  if (typeof syncBankDomainState === "function") {
    syncBankDomainState(mergedState);
  }

  if (typeof syncDialogueState === "function") {
    syncDialogueState(mergedState);
  }

  if (typeof syncMemoryState === "function") {
    syncMemoryState(mergedState);
  }

  syncWorldState(mergedState);

  return mergedState;
}

function createPhoneHomePreview(day = 1) {
  return {
    appId: "",
    kicker: "HOME",
    state: "READY",
    title: `${day}일차 스마트폰`,
    body: "DIS 인터넷, 플레이스토어, 전화, 갤러리를 바로 열 수 있다.",
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

function getPhoneAppStatus(appId, targetState = state) {
  if (!targetState?.phoneAppStatus || typeof targetState.phoneAppStatus !== "object") {
    return null;
  }

  const normalizedAppId = typeof normalizePhoneAppId === "function"
    ? normalizePhoneAppId(appId)
    : String(appId || "");

  return normalizedAppId && targetState.phoneAppStatus[normalizedAppId]
    ? { ...targetState.phoneAppStatus[normalizedAppId] }
    : null;
}

function setPhoneAppStatus(appId, nextStatus = {}, targetState = state) {
  if (!targetState) {
    return null;
  }

  const normalizedAppId = typeof normalizePhoneAppId === "function"
    ? normalizePhoneAppId(appId)
    : String(appId || "");

  if (!normalizedAppId) {
    return null;
  }

  targetState.phoneAppStatus = {
    ...(targetState.phoneAppStatus || {}),
    [normalizedAppId]: {
      ...(nextStatus || {}),
    },
  };

  return getPhoneAppStatus(normalizedAppId, targetState);
}

function canUsePhoneApps(targetState = state) {
  return !["prologue", "cleanup"].includes(targetState.scene);
}

function canOpenPhoneStage(targetState = state) {
  return Boolean(
    targetState.hasPhone
    && !targetState.phoneMinimized
    && canUsePhoneApps(targetState)
    && ["room", "outside", "board"].includes(targetState.scene),
  );
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
  if (state.timeSlot >= DAY_END_TIME_SLOT) {
    state.timeMinuteOffset = 0;
  }
  return state.timeSlot >= DAY_END_TIME_SLOT;
}

function advanceTimeToSlot(targetSlot) {
  const nextSlot = Math.max(state.timeSlot, Math.round(targetSlot));
  if (nextSlot <= state.timeSlot) {
    return false;
  }

  state.timeSlot = Math.min(DAY_END_TIME_SLOT, nextSlot);
  state.timeMinuteOffset = 0;
  return state.timeSlot >= DAY_END_TIME_SLOT;
}

function spendMinorTime(minutes = 1) {
  const normalizedMinutes = Math.max(0, Math.round(minutes));
  if (!normalizedMinutes) {
    return false;
  }

  state.timeMinuteOffset = Math.max(0, Number(state.timeMinuteOffset) || 0) + normalizedMinutes;

  while (state.timeMinuteOffset >= 30) {
    state.timeMinuteOffset -= 30;
    state.timeSlot = Math.min(DAY_END_TIME_SLOT, state.timeSlot + 1);

    if (state.timeSlot >= DAY_END_TIME_SLOT) {
      state.timeMinuteOffset = 0;
      return true;
    }
  }

  return false;
}

function refreshPhoneHomePreviewForState(targetState = state) {
  const route = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(targetState.phoneView || "home")
    : (targetState.phoneView || "home");

  if (typeof isPhoneHomeRoute === "function" ? !isPhoneHomeRoute(route) : route !== "home") {
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
  if (typeof openPhoneHomeRoute === "function") {
    openPhoneHomeRoute(state);
  } else {
    state.phoneView = "home";
    refreshPhoneHomePreview();
  }
  renderGame();
}

function openPhoneJobsApp() {
  if (typeof openPhoneJobsRoute === "function") {
    if (!openPhoneJobsRoute(state)) {
      return;
    }
    renderGame();
    return;
  }

  if (!state.hasPhone || !canUsePhoneApps()) {
    return;
  }

  state.phoneMinimized = false;
  state.phoneView = "jobs/home";
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

  recordActionMemory(
    "공고에 지원했다",
    success
      ? `${job.title} 지원 결과가 좋아서 ${state.day + 1}일차 출근이 잡혔다.`
      : `${job.title} 공고에 지원했지만 이번에는 이어지지 않았다.`,
    {
      type: "job",
      source: "스마트폰",
      tags: ["알바", "지원", offer.jobId],
    },
  );
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
  state.timeMinuteOffset = 0;
  state.currentOffer = offer;
  state.lastWorkedJobId = offer.jobId;
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
  recordActionMemory("예약 근무를 시작했다", `${job.title} 근무를 위해 현장으로 향했다.`, {
    type: "job",
    source: job.title,
    tags: ["알바", "출근", offer.jobId],
  });
  refreshPhoneHomePreview();
  renderGame();
}

function waitInRoom() {
  state.headline = {
    badge: "시간 경과",
    text: "방 안에서 30분을 보낸다.",
  };
  recordActionMemory("방 안에서 시간을 보냈다", "특별한 일 없이 방 안에서 잠깐 시간을 흘려보냈다.", {
    type: "action",
    source: "집",
    tags: ["일상", "대기"],
  });
  if (spendTimeSlots(TIME_COSTS.waitInRoom)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function wanderAroundOutside() {
  const inAptAlley = getCurrentLocationId() === "apt-alley";
  const worldState = syncWorldState(state);
  const npcPool = inAptAlley ? getAlleyNpcPool(state) : [];
  const activeNpc = inAptAlley && npcPool.length && Math.random() < 0.38
    ? pickWeightedEntry(npcPool)
    : null;
  const wanderTags = activeNpc?.tag ? ["이동", "산책", activeNpc.tag] : ["이동", "산책"];
  const locationLabel = getCurrentLocationLabel();

  worldState.alleyNpcVisible = Boolean(activeNpc);
  worldState.alleyNpcId = activeNpc?.id || "";
  state.headline = {
    badge: activeNpc ? activeNpc.headlineBadge || "낯선 시선" : "동네 한 바퀴",
    text: activeNpc
      ? activeNpc.headlineText || "골목 끝에 누군가가 서 있다."
      : "골목 주변을 천천히 돌아다니며 시간을 보낸다.",
  };
  recordActionMemory(
    "골목을 돌아다녔다",
    activeNpc
      ? `${locationLabel}을 서성이다가 ${activeNpc.tag}과 눈이 마주쳤다.`
      : `${locationLabel} 주변을 천천히 걸으며 시간을 보냈다.`,
    {
      type: "travel",
      source: locationLabel,
      tags: wanderTags,
    },
  );
  if (spendTimeSlots(TIME_COSTS.waitInRoom)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function approachAlleyNpc() {
  const activeNpc = getActiveAlleyNpcConfig(state);
  if (!activeNpc) {
    return;
  }

  startNpcInteraction(activeNpc.id, "approach-button");
}

function startNpcInteraction(npcId, source = "actor-click") {
  const activeNpc = getActiveAlleyNpcConfig(state);
  const npcConfig = activeNpc?.id === npcId
    ? activeNpc
    : getAlleyNpcPool(state).find((entry) => entry.id === npcId) || null;

  if (!npcId) {
    return false;
  }

  if (spendTimeSlots(TIME_COSTS.moveBetweenScenes)) {
    advanceDayOrFinish();
    return true;
  }

  const started = typeof startNpcDialogue === "function" && startNpcDialogue(npcId, {
    returnScene: "outside",
    returnLocationId: getCurrentLocationId(state),
    source,
  }, state);

  if (!started) {
    if (activeNpc?.id === npcId) {
      clearAlleyNpcState(state);
    }
    state.headline = {
      badge: npcConfig?.approachBadge || "골목",
      text: npcConfig?.approachText || "가까이 다가가자 상대가 짧게 반응하고 지나간다.",
    };
  }

  renderGame();
  return started;
}

function handleActorInteraction(npcId) {
  if (state.scene !== "outside" || !npcId) {
    return;
  }

  if (ui.actorsLayer?.classList.contains("dev-position-active")) {
    return;
  }

  startNpcInteraction(npcId, "actor-click");
}

function waitForScheduledShift() {
  const shiftStatus = getScheduledShiftStatus();
  if (!shiftStatus) {
    return;
  }
  const shiftOffer = shiftStatus.scheduledShift?.offer;
  const shiftJob = shiftOffer ? JOB_LOOKUP[shiftOffer.jobId] : null;

  state.headline = {
    badge: "출근 대기",
    text: `${formatClockTime(shiftStatus.startSlot)} 출근까지 시간을 보낸다.`,
  };
  recordActionMemory(
    "출근 전까지 기다렸다",
    shiftJob
      ? `${shiftJob.title} 출근 시간에 맞추려고 잠깐 대기했다.`
      : `${formatClockTime(shiftStatus.startSlot)} 출근까지 시간을 보냈다.`,
    {
      type: "job",
      source: "집",
      tags: ["알바", "대기", shiftOffer?.jobId].filter(Boolean),
    },
  );
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
  recordActionMemory("예약 근무를 놓쳤다", `${job.title} 출근 시간에 맞추지 못해 오늘 근무가 사라졌다.`, {
    type: "job",
    source: job.title,
    tags: ["알바", "결근", offer.jobId],
  });
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

  if (typeof state.phoneStageExpanded !== "boolean") {
    state.phoneStageExpanded = false;
  }

  if (!state.phonePreview || typeof state.phonePreview !== "object") {
    state.phonePreview = createPhoneHomePreview(state.day);
  }

  if (!state.phoneAppStatus || typeof state.phoneAppStatus !== "object") {
    state.phoneAppStatus = {};
  }

  state.phoneView = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(state.phoneView || "home")
    : (state.phoneView || "home");

  if (typeof canOpenPhoneStage === "function" && !canOpenPhoneStage(state)) {
    state.phoneStageExpanded = false;
  }

  if (typeof state.jobApplicationDoneToday !== "boolean") {
    state.jobApplicationDoneToday = false;
  }

  if (!Number.isFinite(state.timeSlot)) {
    state.timeSlot = getDefaultTimeSlotForState(state);
    state.timeMinuteOffset = 0;
  }

  if (!Number.isFinite(state.timeMinuteOffset)) {
    state.timeMinuteOffset = 0;
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

  if (typeof syncPhoneSessionState === "function") {
    syncPhoneSessionState(state);
  }

  if (typeof syncJobsDomainState === "function") {
    syncJobsDomainState(state);
  }

  if (typeof syncDialogueState === "function") {
    syncDialogueState(state);
    if (state.scene === "dialogue" && !state.dialogue.active) {
      state.scene = state.dialogue.returnScene || "outside";
    }
  }

  if (typeof syncMemoryState === "function") {
    syncMemoryState(state);
  }

  syncWorldState(state);
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
    state.timeMinuteOffset = 0;
    advanceStoryStep();
    renderGame();
  },
  wakeUp() {
    state.timeSlot = PROLOGUE_TIME_SLOTS.introCleanupPrompt;
    state.timeMinuteOffset = 0;
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
  wander() {
    wanderAroundOutside();
  },
  "approach-alley-npc"() {
    approachAlleyNpc();
  },
  "complete-bus-travel"() {
    completeBusTravel();
  },
  "wait-seoul-rail"() {
    waitForSeoulRailEvent();
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

  ui.phoneToggleButton?.addEventListener("click", togglePhonePanel);
  ui.phoneStageButton?.addEventListener("click", togglePhoneStage);
  ui.phoneBackButton?.addEventListener("click", goBackInPhone);
  ui.memoryButton?.addEventListener("click", toggleMemoryLog);
  ui.memoryCloseButton?.addEventListener("click", closeMemoryLog);
  ui.textbox?.addEventListener("click", handleTextboxClick);
  ui.phonePanel?.addEventListener("click", handlePhoneScreenClick);
  ui.phoneStage?.addEventListener("click", handlePhoneScreenClick);
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

function toggleMemoryLog() {
  if (typeof toggleMemoryPanel === "function") {
    toggleMemoryPanel(undefined, state);
  }
  renderGame();
}

function closeMemoryLog() {
  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  renderGame();
}

function prepareDayState(targetState = state) {
  targetState.timeSlot = DAY_START_TIME_SLOT;
  targetState.timeMinuteOffset = 0;
  targetState.scene = "room";
  targetState.currentOffer = null;
  targetState.currentIncident = null;
  targetState.lastResult = null;
  targetState.endingSummary = null;
  targetState.cleaningGame = null;
  targetState.hasPhone = true;
  targetState.phoneStageExpanded = false;
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
  syncWorldState(targetState);
  targetState.world.currentLocation = getDayHomeLocationId(targetState.day) || targetState.world.currentLocation;
  clearAlleyNpcState(targetState);
  clearPendingTravelState(targetState);
  if (typeof resetDialogueState === "function") {
    resetDialogueState(targetState);
  }
  refreshPhoneHomePreviewForState(targetState);

  if (typeof resetPhoneSessionForDay === "function") {
    resetPhoneSessionForDay(targetState);
  }

  if (typeof syncJobsDomainState === "function") {
    syncJobsDomainState(targetState);
  }

  if (typeof patchBankDomainState === "function") {
    patchBankDomainState(targetState, {
      transferDraft: {
        recipient: "",
        amount: "",
      },
    });
  } else if (typeof syncBankDomainState === "function") {
    syncBankDomainState(targetState);
  }
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
function finishPhoneAppTimeSpend(timeSpent) {
  const reachedDayEnd = timeSpent.type === "minor"
    ? spendMinorTime(timeSpent.amount)
    : spendTimeSlots(timeSpent.amount);

  if (reachedDayEnd) {
    advanceDayOrFinish();
    return true;
  }

  renderGame();
  return false;
}

function refreshDisInternetFeed() {
  const locationLabel = typeof getCurrentLocationLabel === "function"
    ? getCurrentLocationLabel(state)
    : "배금시";
  const economy = typeof getTodayEconomy === "function"
    ? getTodayEconomy(state)
    : null;
  const market = typeof getStockMarketSnapshot === "function"
    ? getStockMarketSnapshot(state)
    : null;
  const feedLines = [
    economy
      ? `${locationLabel} 생활물가 ${economy.priceIndex.toFixed(2)}배, 체감지수가 다시 갱신됐다.`
      : `${locationLabel} 근처 공고가 다시 상단으로 올라왔다.`,
    market
      ? `오늘 장세는 ${market.marketTrend}, 예상 승률은 ${market.successChanceText} 수준이다.`
      : `${state.day}일차 생존 팁이 커뮤니티 인기글에 떴다.`,
    economy
      ? `환율 체감지수 ${economy.exchangeIndex}, 거리 상인들 사이에서 긴장감이 돈다.`
      : "역 앞 시세와 골목 소문이 새로 갱신됐다.",
  ];
  const message = sample(feedLines);

  setPhoneAppStatus("dis", {
    kicker: "LIVE",
    title: "실시간 피드 새로고침",
    body: message,
    tone: "accent",
  });
  state.phonePreview = createPhoneResultPreview("dis", "DIS", "인터넷 새로고침", message);
  setHeadline("🌐 DIS 인터넷", message);
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function installPhoneAppFromStore(appId) {
  const manifest = typeof getPhoneAppManifest === "function"
    ? getPhoneAppManifest(appId, state)
    : null;

  if (!manifest || !manifest.installable) {
    return;
  }

  if (typeof installPhoneApp === "function" && !installPhoneApp(appId, state)) {
    setPhoneAppStatus("playstore", {
      kicker: "STORE",
      title: `${manifest.label} 이미 설치됨`,
      body: "홈 화면에서 바로 확인할 수 있습니다.",
      tone: "accent",
    });
    renderGame();
    return;
  }

  const message = `${manifest.label} 앱이 홈 화면에 추가됐다.`;
  setPhoneAppStatus("playstore", {
    kicker: "INSTALL",
    title: `${manifest.label} 설치 완료`,
    body: message,
    tone: "success",
  });
  state.phonePreview = createPhoneResultPreview("playstore", "INSTALL", `${manifest.label} 설치 완료`, message);
  setHeadline("🛒 플레이스토어", message);
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function callHomeContact() {
  const lines = [
    "엄마가 밥은 꼭 챙겨 먹으라고 했다.",
    "엄마가 오늘도 무사히 버티라고 짧게 말했다.",
    "집에 너무 늦지 말라는 말이 귓가에 남았다.",
  ];
  const message = sample(lines);

  setPhoneAppStatus("call", {
    kicker: "CALL LOG",
    title: "엄마와 통화",
    body: message,
    tone: "accent",
  });
  state.phonePreview = createPhoneResultPreview("call", "CALL", "엄마와 통화", message);
  setHeadline("📞 전화", message);
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function setBankAppStatusMessage({
  kicker = "BANK",
  title = "배금은행",
  body = "",
  tone = "accent",
  previewTitle = title,
} = {}) {
  setPhoneAppStatus("bank", {
    kicker,
    title,
    body,
    tone,
  });
  state.phonePreview = createPhoneResultPreview("bank", kicker, previewTitle, body);
  setHeadline("🏦 은행", body);
}

function resolvePhoneAmountValue(rawValue, maxAmount = 0) {
  const numericMax = Math.max(0, Math.round(Number(maxAmount) || 0));
  const normalized = String(rawValue || "").trim().toLowerCase();

  if (!normalized) {
    return 0;
  }

  if (normalized === "all") {
    return numericMax;
  }

  const parsed = Math.round(Number(normalized) || 0);
  return Math.max(0, Math.min(parsed, numericMax));
}

function getBankTransferRoot(actionTarget) {
  return actionTarget?.closest("[data-bank-transfer-root]") || null;
}

function getBankTransferForm(actionTarget) {
  return getBankTransferRoot(actionTarget)?.querySelector("[data-bank-transfer-form]")
    || actionTarget?.closest("[data-bank-transfer-form]")
    || null;
}

function getBankTransferFormValues(actionTarget) {
  const bankState = typeof getBankDomainState === "function"
    ? getBankDomainState(state)
    : { transferDraft: { recipient: "", amount: "" } };
  const form = getBankTransferForm(actionTarget);
  const recipientInput = form?.querySelector("[data-bank-transfer-input='recipient']");
  const amountInput = form?.querySelector("[data-bank-transfer-input='amount']");

  return {
    recipient: String(recipientInput?.value ?? bankState.transferDraft?.recipient ?? "").trim(),
    amount: String(amountInput?.value ?? bankState.transferDraft?.amount ?? "").trim(),
  };
}

function updateBankTransferDraft(patch = {}) {
  if (typeof patchBankDomainState !== "function") {
    return null;
  }

  const bankState = typeof getBankDomainState === "function"
    ? getBankDomainState(state)
    : { transferDraft: { recipient: "", amount: "" } };

  return patchBankDomainState(state, {
    transferDraft: {
      ...(bankState.transferDraft || {}),
      ...patch,
    },
  });
}

function depositCashToBank(actionTarget) {
  const availableCash = typeof getWalletBalance === "function"
    ? getWalletBalance(state)
    : Math.max(0, Number(state.money) || 0);
  const amount = resolvePhoneAmountValue(actionTarget?.dataset.amount, availableCash);

  if (!amount || availableCash <= 0) {
    setBankAppStatusMessage({
      kicker: "BANK",
      title: "입금할 현금 없음",
      body: "지금 손에 들고 있는 현금이 없어서 계좌에 넣을 수 없었다.",
      tone: "fail",
      previewTitle: "현금 입금 실패",
    });
    renderGame();
    return;
  }

  if (typeof spendCash === "function" && !spendCash(amount)) {
    setBankAppStatusMessage({
      kicker: "BANK",
      title: "입금 실패",
      body: "현금 잔액이 부족해서 입금에 실패했다.",
      tone: "fail",
      previewTitle: "현금 입금 실패",
    });
    renderGame();
    return;
  }

  const bankState = typeof getBankDomainState === "function"
    ? getBankDomainState(state)
    : { balance: 0 };

  if (typeof patchBankDomainState === "function") {
    patchBankDomainState(state, {
      balance: bankState.balance + amount,
    });
  } else {
    state.bank = {
      ...(state.bank || {}),
      balance: (state.bank?.balance || 0) + amount,
    };
  }

  if (typeof recordBankTransaction === "function") {
    recordBankTransaction({
      title: "현금 입금",
      amount,
      type: "deposit",
      direction: "in",
      note: "지갑의 현금을 계좌로 이동",
    });
  }

  showMoneyEffect(-amount);
  recordActionMemory("현금을 계좌에 넣었다", `${formatMoney(amount)}을 계좌로 옮겼다.`, {
    type: "finance",
    source: "은행 앱",
    tags: ["은행", "입금"],
  });
  setBankAppStatusMessage({
    kicker: "DEPOSIT",
    title: "현금 입금 완료",
    body: `${formatMoney(amount)}을 계좌로 옮겼다.`,
    tone: "success",
    previewTitle: "현금 입금 완료",
  });
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function withdrawCashFromBank(actionTarget) {
  const bankState = typeof getBankDomainState === "function"
    ? getBankDomainState(state)
    : { balance: 0 };
  const amount = resolvePhoneAmountValue(actionTarget?.dataset.amount, bankState.balance);

  if (!amount || bankState.balance <= 0) {
    setBankAppStatusMessage({
      kicker: "BANK",
      title: "출금할 잔액 없음",
      body: "계좌에 남은 돈이 없어서 현금으로 뺄 수 없었다.",
      tone: "fail",
      previewTitle: "현금 출금 실패",
    });
    renderGame();
    return;
  }

  if (typeof patchBankDomainState === "function") {
    patchBankDomainState(state, {
      balance: Math.max(0, bankState.balance - amount),
    });
  } else {
    state.bank = {
      ...(state.bank || {}),
      balance: Math.max(0, (state.bank?.balance || 0) - amount),
    };
  }

  if (typeof earnCash === "function") {
    earnCash(amount);
  } else {
    state.money += amount;
  }

  if (typeof recordBankTransaction === "function") {
    recordBankTransaction({
      title: "현금 출금",
      amount: -amount,
      type: "withdraw",
      direction: "out",
      note: "계좌 잔액을 현금으로 인출",
    });
  }

  showMoneyEffect(amount);
  recordActionMemory("계좌에서 현금을 뺐다", `${formatMoney(amount)}을 현금으로 인출했다.`, {
    type: "finance",
    source: "은행 앱",
    tags: ["은행", "출금"],
  });
  setBankAppStatusMessage({
    kicker: "WITHDRAW",
    title: "현금 출금 완료",
    body: `${formatMoney(amount)}을 손에 쥐었다.`,
    tone: "accent",
    previewTitle: "현금 출금 완료",
  });
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function fillBankTransferRecipient(actionTarget) {
  const recipient = String(actionTarget?.dataset.recipient || "").trim();

  if (!recipient) {
    return;
  }

  updateBankTransferDraft({ recipient });
  renderGame();
}

function fillBankTransferAmount(actionTarget) {
  const amount = String(actionTarget?.dataset.amount || "").trim();

  if (!amount) {
    return;
  }

  updateBankTransferDraft({ amount });
  renderGame();
}

function submitBankTransfer(actionTarget) {
  const bankState = typeof getBankDomainState === "function"
    ? getBankDomainState(state)
    : { balance: 0, transferDraft: { recipient: "", amount: "" } };
  const formValues = getBankTransferFormValues(actionTarget);
  updateBankTransferDraft(formValues);

  const recipient = formValues.recipient;
  const amount = Math.max(0, Math.round(Number(formValues.amount) || 0));

  if (!recipient) {
    setBankAppStatusMessage({
      kicker: "TRANSFER",
      title: "송금 대상 필요",
      body: "누구에게 보낼지 먼저 입력해야 한다.",
      tone: "fail",
      previewTitle: "송금 실패",
    });
    renderGame();
    return;
  }

  if (!amount) {
    setBankAppStatusMessage({
      kicker: "TRANSFER",
      title: "송금 금액 필요",
      body: "보낼 금액을 입력해야 송금을 진행할 수 있다.",
      tone: "fail",
      previewTitle: "송금 실패",
    });
    renderGame();
    return;
  }

  if (bankState.balance < amount) {
    setBankAppStatusMessage({
      kicker: "TRANSFER",
      title: "잔액 부족",
      body: `계좌 잔액이 부족해서 ${formatMoney(amount)}을 보낼 수 없었다.`,
      tone: "fail",
      previewTitle: "송금 실패",
    });
    renderGame();
    return;
  }

  if (typeof patchBankDomainState === "function") {
    patchBankDomainState(state, {
      balance: Math.max(0, bankState.balance - amount),
      transferDraft: {
        recipient: "",
        amount: "",
      },
    });
  } else {
    state.bank = {
      ...(state.bank || {}),
      balance: Math.max(0, (state.bank?.balance || 0) - amount),
    };
  }

  if (typeof recordBankTransaction === "function") {
    recordBankTransaction({
      title: `${recipient} 송금`,
      amount: -amount,
      type: "transfer",
      direction: "out",
      note: "즉시 이체",
    });
  }

  if (typeof openPhoneRoute === "function") {
    openPhoneRoute("bank/home", state);
  } else {
    state.phoneView = "bank/home";
  }

  setBankAppStatusMessage({
    kicker: "TRANSFER",
    title: "송금 완료",
    body: `${recipient}에게 ${formatMoney(amount)}을 송금했다.`,
    tone: "success",
    previewTitle: "송금 완료",
  });
  recordActionMemory("송금을 마쳤다", `${recipient}에게 ${formatMoney(amount)}을 보냈다.`, {
    type: "finance",
    source: "은행 앱",
    tags: ["은행", "송금"],
  });
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function recordActionMemory(title, body, { type = "action", source = "", tags = [] } = {}) {
  if (typeof recordMemoryEntry !== "function") {
    return null;
  }

  return recordMemoryEntry({
    type,
    title,
    body,
    source,
    tags,
  }, state);
}

function runStocksTrade() {
  if (state.phoneUsedToday) {
    return;
  }

  const market = typeof getStockMarketSnapshot === "function"
    ? getStockMarketSnapshot(state)
    : null;
  const balance = typeof getWalletBalance === "function" ? getWalletBalance(state) : state.money;
  if (balance <= 0) {
    const message = "시드머니가 없어서 오늘 시장에 들어갈 수 없었다.";
    setPhoneAppStatus("stocks", {
      kicker: "MARKET",
      title: "거래 실패",
      body: message,
      tone: "fail",
    });
    setHeadline("📈 증권", message);
    renderGame();
    return;
  }

  const winChance = market?.successChance ?? 0.5;
  const win = Math.random() < winChance;
  const gain = market?.gainAmount ?? 60000;
  const loss = Math.min(balance, market?.lossAmount ?? 30000);
  let message = "";
  let title = "";
  let tone = "accent";

  if (win) {
    if (typeof earnCash === "function") {
      earnCash(gain);
    } else {
      state.money += gain;
    }
    showMoneyEffect(gain);
    title = "장 마감 수익";
    message = market
      ? `오늘 장이 ${market.marketTrend}로 마감해 ${formatMoney(gain)} 수익을 챙겼다.`
      : `오늘 장이 올라 ${formatMoney(gain)} 수익을 챙겼다.`;
    tone = "success";
  } else {
    if (typeof spendCash === "function") {
      spendCash(loss);
    } else {
      state.money = Math.max(0, state.money - loss);
    }
    showMoneyEffect(-loss);
    title = "장 마감 손실";
    message = market
      ? `오늘 장이 ${market.marketTrend}로 흘러 ${formatMoney(loss)} 손실을 봤다.`
      : `오늘 장이 밀려 ${formatMoney(loss)} 손실을 봤다.`;
    tone = "fail";
  }

  setPhoneAppStatus("stocks", {
    kicker: "MARKET CLOSE",
    title,
    body: market
      ? `${message} 변동성은 ${market.volatilityLabel}였다.`
      : message,
    tone,
  });
  state.phonePreview = createPhoneResultPreview("stocks", "STOCK", title, message);
  state.phoneUsedToday = true;
  recordActionMemory("오늘 증시를 정리했다", message, {
    type: "finance",
    source: "증권 앱",
    tags: ["증권", win ? "수익" : "손실"],
  });
  setHeadline("📈 증권", message);
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

function orderDeliveryMeal() {
  if (state.phoneUsedToday) {
    return;
  }

  const cost = typeof getIndexedPrice === "function"
    ? getIndexedPrice(15000, state)
    : 15000;
  const economy = typeof getTodayEconomy === "function"
    ? getTodayEconomy(state)
    : null;
  if (typeof canAfford === "function" && !canAfford(cost, state)) {
    const message = `잔액이 부족해서 ${formatMoney(cost)}짜리 배달 주문을 넣지 못했다.`;
    setPhoneAppStatus("delivery", {
      kicker: "DELIVERY",
      title: "주문 실패",
      body: message,
      tone: "fail",
    });
    setHeadline("🍔 배달", message);
    renderGame();
    return;
  }

  if (typeof spendCash === "function") {
    spendCash(cost);
  } else {
    state.money = Math.max(0, state.money - cost);
  }
  showMoneyEffect(-cost);

  const message = economy
    ? `물가지수 ${economy.priceIndex.toFixed(2)}가 반영돼 ${formatMoney(cost)}을 지출했다.`
    : `따뜻한 한 끼를 주문했다. ${formatMoney(cost)} 지출.`;
  setPhoneAppStatus("delivery", {
    kicker: "DELIVERY",
    title: "주문 완료",
    body: message,
    tone: "accent",
  });
  state.phonePreview = createPhoneResultPreview("delivery", "DELIVERY", "배달 주문 완료", message);
  state.phoneUsedToday = true;
  setHeadline("🍔 배달", message);
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

function watchVideoFeed() {
  if (state.phoneUsedToday) {
    return;
  }

  const message = "짧은 영상을 넘기다 보니 두 시간이 사라졌다.";
  setPhoneAppStatus("video", {
    kicker: "PLAYBACK",
    title: "무한 추천 피드",
    body: message,
    tone: "accent",
  });
  state.phonePreview = createPhoneResultPreview("video", "VIDEO", "짧은 영상 감상", message);
  state.phoneUsedToday = true;
  setHeadline("📺 DIS Tube", message);
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.videoApp });
}

function usePhoneApp(appId) {
  if (!state.hasPhone || !canUsePhoneApps()) {
    return;
  }

  if (typeof openPhoneAppRoute === "function") {
    if (!openPhoneAppRoute(appId, state)) {
      return;
    }
    renderGame();
    return;
  }

  if (appId === "jobs") {
    openPhoneJobsApp();
    return;
  }
}

function togglePhoneStage() {
  if (typeof togglePhoneStageState === "function") {
    if (!togglePhoneStageState(state)) {
      return;
    }
    renderGame();
    return;
  }

  if (!canOpenPhoneStage()) {
    return;
  }

  state.phoneStageExpanded = !state.phoneStageExpanded;
  renderGame();
}

function goBackInPhone() {
  if (typeof goBackInPhoneRoute === "function") {
    if (!goBackInPhoneRoute(state)) {
      return;
    }
    renderGame();
    return;
  }

  if (state.phoneMinimized) {
    return;
  }

  const route = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(state.phoneView || "home")
    : (state.phoneView || "home");

  if (typeof isPhoneHomeRoute === "function" ? !isPhoneHomeRoute(route) : route !== "home") {
    openPhoneHome();
    return;
  }

  if (state.phoneStageExpanded) {
    state.phoneStageExpanded = false;
    renderGame();
  }
}

function togglePhonePanel() {
  if (typeof togglePhonePanelState === "function") {
    if (!togglePhonePanelState(state)) {
      return;
    }
    if (spendMinorTime(1)) {
      advanceDayOrFinish();
      return;
    }
    renderGame();
    return;
  }

  if (!state.hasPhone) {
    return;
  }

  state.phoneMinimized = !state.phoneMinimized;
  if (state.phoneMinimized) {
    state.phoneStageExpanded = false;
  }
  if (spendMinorTime(1)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function handlePhoneScreenClick(event) {
  const appTarget = event.target.closest("[data-phone-app]");
  if (appTarget) {
    usePhoneApp(appTarget.dataset.phoneApp);
    return;
  }

  const routeTarget = event.target.closest("[data-phone-route]");
  if (routeTarget) {
    if (typeof openPhoneRoute === "function" && openPhoneRoute(routeTarget.dataset.phoneRoute, state)) {
      renderGame();
    }
    return;
  }

  const actionTarget = event.target.closest("[data-phone-action]");

  if (!actionTarget) {
    return;
  }

  const { phoneAction, offerIndex } = actionTarget.dataset;

  if (phoneAction === "close-phone-view") {
    openPhoneHome();
    return;
  }

  if (phoneAction === "install-phone-app") {
    installPhoneAppFromStore(actionTarget.dataset.appId);
    return;
  }

  if (phoneAction === "refresh-dis-feed") {
    refreshDisInternetFeed();
    return;
  }

  if (phoneAction === "call-home-contact") {
    callHomeContact();
    return;
  }

  if (phoneAction === "bank-deposit-cash") {
    depositCashToBank(actionTarget);
    return;
  }

  if (phoneAction === "bank-withdraw-cash") {
    withdrawCashFromBank(actionTarget);
    return;
  }

  if (phoneAction === "bank-fill-recipient") {
    fillBankTransferRecipient(actionTarget);
    return;
  }

  if (phoneAction === "bank-fill-amount") {
    fillBankTransferAmount(actionTarget);
    return;
  }

  if (phoneAction === "bank-transfer-money") {
    submitBankTransfer(actionTarget);
    return;
  }

  if (phoneAction === "apply-job") {
    applyToPhoneJob(Number(offerIndex));
    return;
  }

  if (phoneAction === "go-shift") {
    startScheduledShift();
    return;
  }

  if (phoneAction === "run-stocks-trade") {
    runStocksTrade();
    return;
  }

  if (phoneAction === "order-delivery-meal") {
    orderDeliveryMeal();
    return;
  }

  if (phoneAction === "watch-video-feed") {
    watchVideoFeed();
  }
}

function buildDayOffersForState(targetState = state) {
  const activeIds = [...targetState.activeJobs];
  const chosenIds = shuffle(activeIds).slice(0, Math.min(3, activeIds.length));

  return chosenIds.map((jobId) => {
    const job = JOB_LOOKUP[jobId];
    const shiftRule = getJobShiftRule(jobId);
    const basePay = roundToHundred(randomBetween(job.payMin, job.payMax));
    return {
      jobId,
      pay: typeof getAdjustedWage === "function"
        ? getAdjustedWage(basePay, targetState)
        : basePay,
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
      targetState.phoneView = typeof normalizePhoneRoute === "function"
        ? normalizePhoneRoute(preset.view || "home")
        : (preset.view || "home");
      break;
    case "scene":
    default:
      targetState.scene = preset.scene || "room";
      if (preset.phoneView) {
        targetState.phoneView = typeof normalizePhoneRoute === "function"
          ? normalizePhoneRoute(preset.phoneView)
          : preset.phoneView;
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

  if (typeof isPhoneHomeRoute === "function" ? isPhoneHomeRoute(targetState.phoneView) : targetState.phoneView === "home") {
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
  recordActionMemory("공고 하나를 붙잡았다", `${JOB_LOOKUP[offer.jobId].title} 공고를 보고 오늘 해볼 일로 정했다.`, {
    type: "job",
    source: getCurrentLocationLabel(),
    tags: ["알바", "공고", offer.jobId],
  });
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
  if (typeof earnCash === "function") {
    earnCash(pay);
  } else {
    state.money += pay;
  }
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
  syncWorldState(state);
  state.world.currentLocation = getDayHomeLocationId(state.day) || state.world.currentLocation;
  clearAlleyNpcState(state);
  clearPendingTravelState(state);
  state.scene = "outside";
  state.headline = {
    badge: "",
    text: "",
  };
  recordActionMemory("집 밖으로 나갔다", `${getCurrentLocationLabel()} 쪽으로 문을 열고 나갔다.`, {
    type: "travel",
    source: "집",
    tags: ["이동", "외출"],
  });
  renderGame();
}

function completeBusTravel() {
  const worldState = syncWorldState(state);
  const targetLocation = worldState.pendingTravelTarget;
  const locationMap = getDayWorldLocationMap(state.day);

  if (!targetLocation || !locationMap?.[targetLocation]) {
    worldState.currentLocation = "bus-stop";
    clearPendingTravelState(state);
    renderGame();
    return;
  }

  worldState.currentLocation = targetLocation;
  clearPendingTravelState(state);
  state.headline = {
    badge: "버스 도착",
    text: `${locationMap[targetLocation].label}에 내려 주변을 둘러본다.`,
  };
  recordActionMemory("버스에서 내렸다", `${locationMap[targetLocation].label}에 내려 주변을 둘러봤다.`, {
    type: "travel",
    source: "버스",
    tags: ["이동", "버스", targetLocation],
  });
  renderGame();
}

function waitForSeoulRailEvent() {
  if (spendMinorTime(1)) {
    advanceDayOrFinish();
    return;
  }

  state.headline = {
    badge: "서울행 통로",
    text: "서울역으로 이어질 다음 이벤트는 아직 준비 중이다. 지금은 통로 앞에서 잠시 대기한다.",
  };
  if (typeof recordActionMemory === "function") {
    recordActionMemory("서울역 가는 철도 통로를 확인했다", "아직 본격적인 이동은 열리지 않았고, 통로 앞에서 잠시 대기만 했다.", {
      type: "travel",
      source: "배금역",
      tags: ["철도", "서울역", "대기"],
    });
  }
  renderGame();
}

function handleWorldKeyDown(event) {
  const targetTag = String(event.target?.tagName || "").toUpperCase();
  const isEditableTarget = event.target?.isContentEditable
    || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(targetTag);
  const isTypingTarget = event.target?.isContentEditable
    || ["INPUT", "TEXTAREA", "SELECT"].includes(targetTag);

  if (!isTypingTarget && (event.key === "m" || event.key === "M")) {
    event.preventDefault();
    toggleMemoryLog();
    return;
  }

  if (event.key === "Escape" && state.memory?.panelOpen) {
    event.preventDefault();
    closeMemoryLog();
    return;
  }

  if (!isEditableTarget && ["Enter", " "].includes(event.key) && typeof canAdvanceSceneText === "function" && canAdvanceSceneText()) {
    event.preventDefault();
    advanceSceneText();
    return;
  }

  if (state.scene !== "outside") {
    return;
  }

  if (["ArrowRight", "ArrowLeft", "a", "A", "d", "D"].includes(event.key)) {
    event.preventDefault();
  }
}

function handleTextboxClick(event) {
  if (!event.target || event.target.closest("#choices, button, a, input, textarea, select")) {
    return;
  }

  if (typeof canAdvanceSceneText === "function" && canAdvanceSceneText()) {
    advanceSceneText();
  }
}

function handleOutsideOption(action) {
  const option = typeof action === "string" ? { action } : action;
  if (!option) {
    return;
  }

  if (option.action === "move" && option.targetLocation) {
    const currentLocationId = getCurrentLocationId();
    const currentLocation = getCurrentOutsideSceneConfig();
    const locationMap = getDayWorldLocationMap(state.day);
    const shouldUseBusTravel = currentLocationId === "bus-stop-map" && option.travelVia === "bus";
    const canMove = !Array.isArray(currentLocation?.exits)
      || currentLocation.exits.includes(option.targetLocation);
    const currentLabel = currentLocation?.label || getCurrentLocationLabel();
    const targetLabel = locationMap?.[option.targetLocation]?.label || option.targetLocation;

    if (!canMove || currentLocationId === option.targetLocation) {
      return;
    }

    if (spendTimeSlots(TIME_COSTS.moveBetweenScenes)) {
      advanceDayOrFinish();
      return;
    }

    syncWorldState(state);
    if (shouldUseBusTravel) {
      state.world.pendingTravelTarget = option.targetLocation;
      state.world.currentLocation = "bus-ride";
      recordActionMemory("버스를 타러 움직였다", `${targetLabel} 쪽으로 가는 버스를 타기 위해 정류장 안쪽으로 들어갔다.`, {
        type: "travel",
        source: currentLabel,
        tags: ["이동", "버스", option.targetLocation],
      });
    } else {
      state.world.currentLocation = option.targetLocation;
      clearPendingTravelState(state);
      recordActionMemory(`${targetLabel}로 걸어갔다`, `${currentLabel}에서 나와 ${targetLabel} 쪽으로 발걸음을 옮겼다.`, {
        type: "travel",
        source: currentLabel,
        tags: ["이동", option.targetLocation],
      });
    }
    clearAlleyNpcState(state);
    state.headline = {
      badge: "",
      text: "",
    };
    renderGame();
    return;
  }

  if (hasActionHandler(option.action)) {
    runAction(option.action);
  }
}

function returnHomeFromOutside() {
  const previousLocationLabel = getCurrentLocationLabel();
  if (spendTimeSlots(TIME_COSTS.moveBetweenScenes)) {
    advanceDayOrFinish();
    return;
  }
  syncWorldState(state);
  state.world.currentLocation = getDayHomeLocationId(state.day) || state.world.currentLocation;
  clearAlleyNpcState(state);
  clearPendingTravelState(state);
  state.scene = "room";
  state.headline = {
    badge: "",
    text: "",
  };
  recordActionMemory("집으로 돌아왔다", `${previousLocationLabel}에서 발길을 돌려 다시 집 안으로 들어왔다.`, {
    type: "travel",
    source: previousLocationLabel,
    tags: ["이동", "귀가"],
  });
  renderGame();
}

function enterJobBoard() {
  const boardHeadline = getDayWorldData().boardHeadline || {};
  if (spendTimeSlots(TIME_COSTS.phoneApp)) {
    advanceDayOrFinish();
    return;
  }
  if (state.hasPhone && (typeof isPhoneAppInstalled !== "function" || isPhoneAppInstalled("jobs", state))) {
    state.phoneMinimized = false;
    state.phoneView = "jobs/home";
    state.headline = {
      badge: "스마트폰",
      text: boardHeadline.phone || "밖에서도 스마트폰으로 오늘 공고를 본다.",
    };
    recordActionMemory("오늘 공고를 확인했다", "밖에서도 스마트폰으로 오늘 공고들을 훑어봤다.", {
      type: "job",
      source: getCurrentLocationLabel(),
      tags: ["알바", "공고", "스마트폰"],
    });
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
  recordActionMemory("게시판을 살폈다", "골목 끝 게시판에 붙은 오늘 공고를 확인했다.", {
    type: "job",
    source: getCurrentLocationLabel(),
    tags: ["알바", "공고", "게시판"],
  });
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
  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  prepareDay();
}

function finishRun() {
  state.scene = "ranking";
  state.currentOffer = null;
  state.currentIncident = null;
  state.endingSummary = buildEndingSummary();
  state.headline = {
    badge: "최종 정산",
    text: `${MAX_DAYS}일이 끝났다. 손에 남은 현금으로 마지막 랭킹이 매겨진다.`,
  };

  const summary = state.endingSummary;
  const myEntry = {
    name: summary.playerName,
    money: summary.totalCash,
    rank: summary.rank.label,
    job: summary.jobTitle,
  };

  if (typeof submitRanking === "function" && typeof fetchTopRankings === "function") {
    submitRanking(myEntry).then(() => fetchTopRankings()).then((entries) => {
      if (typeof showRankingScreen === "function") {
        showRankingScreen(myEntry, entries);
      }
    }).catch(() => {
      if (typeof showRankingScreen === "function") {
        showRankingScreen(myEntry, [myEntry]);
      }
    });
  } else if (typeof showRankingScreen === "function") {
    showRankingScreen(myEntry, [myEntry]);
  }
}

function buildEndingSummary() {
  const rank = getRankByMoney(state.money);
  const lastJob = JOB_LOOKUP[state.lastWorkedJobId];
  const jobTitle = lastJob ? lastJob.title : "무직";

  return {
    totalCash: state.money,
    rank,
    jobTitle,
    playerName: state.playerName,
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

// 자동 저장 비활성화 (첫 게임 — 이어하기 없음)
