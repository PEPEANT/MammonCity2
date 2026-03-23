// Keep logic.js focused on orchestration. Domain rules belong in
// js/systems/* or js/apps/* per docs/design/logic-split-plan.md.

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

    if (locationId === "walk-travel") {
      const sourceLabel = getPendingTravelSourceLabel(targetState);
      const targetLabel = getPendingTravelTargetLabel(targetState);
      const durationLabel = getPendingTravelDurationLabel(targetState);
      const methodLabel = getPendingTravelMethodLabel(targetState);
      const travelMinutes = syncWorldState(targetState).pendingTravelMinutes;
      resolvedScene.title = "걷는 중...";
      resolvedScene.background = getWalkTravelBackgroundForMinutes(travelMinutes);
      resolvedScene.lines = [
        `${sourceLabel}에서 나와 ${targetLabel} 쪽으로 걷는 중... 도보 ${durationLabel} 소요 됨.`,
        "신호등과 골목 모퉁이를 지나며 발걸음을 계속 이어간다.",
      ];
      resolvedScene.lines[0] = `${sourceLabel}에서 ${targetLabel} 쪽으로 ${methodLabel} ${durationLabel} 코스를 잡고 걸음을 옮긴다.`;
    }

    const activeAlleyNpc = getActiveAlleyNpcConfig(targetState);
    const wanderResult = worldState.wanderResult || {};
    resolvedScene.options = resolvedScene.options.filter((option) => option.action !== "wander");

    if (locationId && canUseLocationWander(locationId, targetState)) {
      resolvedScene.options.splice(Math.min(2, resolvedScene.options.length), 0, {
        title: "돌아다닌다",
        action: "wander",
      });
    }

    if (wanderResult.locationId === locationId && wanderResult.title && wanderResult.lines?.length) {
      resolvedScene.title = wanderResult.title;
      resolvedScene.lines = [...wanderResult.lines];
    }

    if (activeAlleyNpc?.actor) {
      resolvedScene.actors.push({ ...activeAlleyNpc.actor, npcId: activeAlleyNpc.id });
      if (activeAlleyNpc.tag && !resolvedScene.tags.includes(activeAlleyNpc.tag)) {
        resolvedScene.tags.push(activeAlleyNpc.tag);
      }
      if (!(wanderResult.locationId === locationId && wanderResult.title && wanderResult.lines?.length)) {
        resolvedScene.title = activeAlleyNpc.sceneTitle || resolvedScene.title;
        resolvedScene.lines = Array.isArray(activeAlleyNpc.sceneLines) && activeAlleyNpc.sceneLines.length
          ? [...activeAlleyNpc.sceneLines]
          : resolvedScene.lines;
      }
      resolvedScene.options.unshift({
        title: "가까이 가기",
        action: "approach-alley-npc",
      });
    }

    if (typeof resolveSceneActorPresentation === "function") {
      resolvedScene.actors = resolvedScene.actors.map((actor) =>
        resolveSceneActorPresentation(actor, targetState, {
          source: "outside-scene",
          scene: "outside",
          day,
          locationId,
          districtId: baseScene.districtId || worldState.currentDistrict || "",
        })
      );
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
  wanderOutside: 2,
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
  "delivery-motorbike": { startSlotChoices: [20, 24, 28], durationSlots: 8 },
  "delivery-courier": { startSlotChoices: [18, 22, 26], durationSlots: 10 },
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

function getCurrentPrologueStep(targetState = state) {
  const steps = getActiveStorySteps(targetState);
  const stepIndex = Number.isFinite(targetState?.storyStep)
    ? Math.max(0, Math.floor(targetState.storyStep))
    : 0;
  return steps[stepIndex] || steps[0] || null;
}

function getInteractivePrologueStepConfig(targetState = state) {
  if (targetState?.scene !== "prologue") {
    return null;
  }

  const step = getCurrentPrologueStep(targetState);
  return ["walk-to-exit", "press-exit"].includes(step?.startMode) ? step : null;
}

function createDefaultPrologueIntroState(targetState = state) {
  const step = getInteractivePrologueStepConfig(targetState) || getCurrentPrologueStep(targetState);
  const playerConfig = step?.player || {};
  const startLeft = Number(playerConfig.startLeft);

  return {
    playerLeft: Number.isFinite(startLeft) ? startLeft : 24,
    facing: Number(playerConfig.facing) < 0 ? -1 : 1,
  };
}

function syncPrologueIntroState(targetState = state) {
  const defaults = createDefaultPrologueIntroState(targetState);
  if (!targetState || typeof targetState !== "object") {
    return defaults;
  }

  const current = targetState.prologueIntro && typeof targetState.prologueIntro === "object"
    ? targetState.prologueIntro
    : {};

  targetState.prologueIntro = {
    playerLeft: Number.isFinite(current.playerLeft)
      ? Math.max(0, Math.min(100, current.playerLeft))
      : defaults.playerLeft,
    facing: Number(current.facing) < 0 ? -1 : 1,
  };

  return targetState.prologueIntro;
}

function canUseInteractivePrologueExit(targetState = state) {
  const step = getInteractivePrologueStepConfig(targetState);
  if (!step) {
    return false;
  }

  const introState = syncPrologueIntroState(targetState);
  const exitThreshold = Number(step.player?.exitThreshold);
  if (!Number.isFinite(exitThreshold)) {
    return true;
  }
  return introState.playerLeft >= exitThreshold;
}

function enterInteractivePrologueExit(targetState = state) {
  if (!canUseInteractivePrologueExit(targetState)) {
    return false;
  }

  prepareDayState(targetState);
  syncWorldState(targetState);
  targetState.scene = "outside";
  targetState.world.currentLocation = getDayHomeLocationId(targetState.day) || targetState.world.currentLocation;
  targetState.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(targetState.world.currentLocation, targetState.day)
    : targetState.world.currentDistrict;
  clearAlleyNpcState(targetState);
  clearWanderResultState(targetState);
  clearPendingTravelState(targetState);
  targetState.prologueIntro = createDefaultPrologueIntroState(targetState);
  targetState.headline = {
    badge: "",
    text: "",
  };

  if (targetState === state && typeof recordActionMemory === "function") {
    recordActionMemory("집 밖으로 나갔다", `${getCurrentLocationLabel()} 쪽으로 문을 열고 나갔다.`, {
      type: "travel",
      source: "집",
      tags: ["이동", "외출"],
    });
  }

  renderGame();
  return true;
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
  if (typeof recordActionMemory === "function") {
    recordActionMemory(`${definition.label} 사용`, definition.useMemoryBody || `${definition.label}으로 배고픔을 달랬다.`, {
      type: "food",
      source: "인벤토리",
      tags: ["인벤토리", "배고픔", definition.id],
    });
  }

  renderGame();
  return true;
}

let state = createInitialState();
let pendingSavedState = null;
let startScreenDrawState = createDefaultStartScreenDrawState();
let startScreenDrawTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  cacheUi();
  bindStaticEvents();
  if (typeof startTradingTerminalTicker === "function") {
    startTradingTerminalTicker();
  }
  pendingSavedState = loadSavedState();
  showStartScreen(Boolean(pendingSavedState));
});

function createDefaultStartScreenDrawState() {
  return {
    screenMode: "intro",
    phase: "idle",
    previewTierId: "",
    resultTierId: "",
  };
}

function getStartScreenDrawState() {
  return {
    ...startScreenDrawState,
  };
}

function stopStartScreenDrawTimer() {
  if (startScreenDrawTimer) {
    clearInterval(startScreenDrawTimer);
    startScreenDrawTimer = null;
  }
}

function syncStartScreenDrawUi() {
  if (typeof renderStartScreenDrawState === "function") {
    renderStartScreenDrawState(Boolean(pendingSavedState));
  }
}

function resetStartScreenDrawState() {
  stopStartScreenDrawTimer();
  startScreenDrawState = createDefaultStartScreenDrawState();
  syncStartScreenDrawUi();
}

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
        loans: [],
        loanDraft: {
          selectedType: "personal",
        },
        lastLoanResolution: null,
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
  const inventoryDefaults = typeof createDefaultInventoryState === "function"
    ? createDefaultInventoryState()
    : {
        panelOpen: false,
        activeTab: "carry",
        slotLimit: 8,
        items: [],
        equipped: {
          phone: null,
          bag: null,
        },
      };
  const ownershipDefaults = typeof createDefaultOwnershipState === "function"
    ? createDefaultOwnershipState()
    : {
        residence: "parents-room",
        home: null,
        vehicle: null,
      };
  const progressionDefaults = typeof createDefaultProgressionState === "function"
    ? createDefaultProgressionState()
    : {
        routes: {
          career: {},
          crime: {},
          startup: {},
          corporate: {},
          investor: {},
        },
      };
  const unlockDefaults = typeof createDefaultUnlocksState === "function"
    ? createDefaultUnlocksState()
    : {
        jobs: [],
        locations: [],
        apps: [],
        routes: [],
        events: [],
        npcs: [],
      };
  const socialDefaults = typeof createDefaultSocialState === "function"
    ? createDefaultSocialState()
    : {
        contacts: {},
        factions: {},
      };
  const riskDefaults = typeof createDefaultRiskState === "function"
    ? createDefaultRiskState()
    : {
        crime: 0,
        heat: 0,
        debt: 0,
        gambling: 0,
      };
  const businessDefaults = typeof createDefaultBusinessState === "function"
    ? createDefaultBusinessState()
    : {
        ventures: {},
        ledger: [],
        permits: {},
        staff: {},
      };
  const appearanceDefaults = typeof createDefaultAppearanceState === "function"
    ? createDefaultAppearanceState()
    : {
        profileId: "default",
        surgeryDone: false,
        attractiveness: 0,
        flags: {},
      };
  const npcDefaults = typeof createDefaultNpcState === "function"
    ? createDefaultNpcState()
    : {
        relations: {},
      };
  const happinessDefaults = typeof createDefaultHappinessState === "function"
    ? createDefaultHappinessState()
    : {
        value: 45,
        status: "low",
        dailyDecay: 5,
        lastModifiedDay: 1,
      };

  return {
    playerName: "이름 없음",
    day: 1,
    money: 0,
    stamina: BASE_STAMINA,
    energy: BASE_ENERGY,
    hunger: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3,
    hungerDecayProgress: 0,
    hungerVersion: typeof HUNGER_SYSTEM_VERSION === "number" ? HUNGER_SYSTEM_VERSION : 1,
    timeSlot: PROLOGUE_TIME_SLOTS.introWake,
    timeMinuteOffset: 0,
    scene: "prologue",
    storyKey: "intro",
    storyStep: 0,
    prologueIntro: createDefaultPrologueIntroState({
      day: 1,
      scene: "prologue",
      storyKey: "intro",
      storyStep: 0,
    }),
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
      loans: [...(bankDefaults.loans || [])].map((loan) => ({ ...(loan || {}) })),
      loanDraft: { ...(bankDefaults.loanDraft || { selectedType: "personal" }) },
      lastLoanResolution: bankDefaults.lastLoanResolution
        ? { ...bankDefaults.lastLoanResolution, lines: [...(bankDefaults.lastLoanResolution.lines || [])] }
        : null,
    },
    dialogue: {
      ...dialogueDefaults,
    },
    memory: {
      ...memoryDefaults,
      entries: [...(memoryDefaults.entries || [])],
    },
    inventory: {
      ...inventoryDefaults,
      items: [...(inventoryDefaults.items || [])].map((item) => ({ ...item })),
      equipped: { ...(inventoryDefaults.equipped || {}) },
    },
    ownership: {
      ...ownershipDefaults,
    },
    progression: {
      ...progressionDefaults,
      routes: { ...(progressionDefaults.routes || {}) },
    },
    unlocks: {
      ...unlockDefaults,
      jobs: [...(unlockDefaults.jobs || [])],
      locations: [...(unlockDefaults.locations || [])],
      apps: [...(unlockDefaults.apps || [])],
      routes: [...(unlockDefaults.routes || [])],
      events: [...(unlockDefaults.events || [])],
      npcs: [...(unlockDefaults.npcs || [])],
    },
    social: {
      ...socialDefaults,
      contacts: { ...(socialDefaults.contacts || {}) },
      factions: { ...(socialDefaults.factions || {}) },
    },
    happiness: {
      ...happinessDefaults,
    },
    risk: {
      ...riskDefaults,
    },
    business: {
      ...businessDefaults,
      ventures: { ...(businessDefaults.ventures || {}) },
      ledger: Array.isArray(businessDefaults.ledger) ? [...businessDefaults.ledger] : [],
      permits: { ...(businessDefaults.permits || {}) },
      staff: { ...(businessDefaults.staff || {}) },
    },
    appearance: {
      ...appearanceDefaults,
      flags: { ...(appearanceDefaults.flags || {}) },
    },
    npcs: {
      ...npcDefaults,
      relations: Object.fromEntries(
        Object.entries(npcDefaults.relations || {}).map(([npcId, relation]) => [
          npcId,
          {
            ...(relation || {}),
            flags: { ...(relation?.flags || {}) },
          },
        ])
      ),
    },
    world: createDefaultWorldState(1),
    hasPhone: true,
    phoneMinimized: phoneDefaults.minimized,
    phoneStageExpanded: phoneDefaults.stageExpanded,
    phoneView: phoneDefaults.route,
    phoneUsedToday: phoneDefaults.usedToday,
    installedPhoneApps: [...(phoneDefaults.installedApps || [])],
    disSearchQuery: "",
    disGambleDrafts: {
      "odd-even": "1000",
      ladder: "5000",
    },
    phonePreview: createPhoneHomePreview(1),
    phoneAppStatus: {},
    casino: typeof createDefaultCasinoState === "function"
      ? createDefaultCasinoState()
      : null,
    stocksUsedToday: false,
    casinoUsedToday: false,
    coinUsedToday: false,
    stockHolding: null,
    coinHolding: null,
    activeJobs: new Set(STARTING_JOB_IDS),
    seenIncidents: new Set(),
    jobVisits: {},
    currentOffer: null,
    currentIncident: null,
    jobMiniGame: null,
    jobMiniGameResult: null,
    lastResult: null,
    endingSummary: null,
    lastWorkedJobId: null,
    day1CleanupDone: false,
    cleaningGame: null,
    devPreviewMode: false,
    startingOrigin: typeof createDefaultSpoonStartState === "function"
      ? createDefaultSpoonStartState()
      : {
          tierId: "",
          label: "",
          bracket: "",
          summary: "",
          toneLabel: "",
          initialCash: 0,
          walletCash: 0,
          bankBalance: 0,
          starterAssetIds: [],
          starterVehicleId: "",
          safetyNetLevel: "none",
          startHappiness: 45,
          accent: "#94a3b8",
          applied: false,
        },
    headline: {
      badge: "",
      text: "",
    },
    지능: 10,
    평판: 0,
    범죄도: 0,
  };
}

function advanceStoryStep() {
  state.storyStep = Math.min(state.storyStep + 1, getActiveStorySteps().length - 1);
}

function serializeState(currentState = state) {
  const {
    dayOffers,
    nextDayShift,
    interviewResult,
    jobApplicationDoneToday,
    ...serializableState
  } = currentState;
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(currentState)
    : (currentState.jobs || {});
  const happinessState = typeof syncHappinessState === "function"
    ? syncHappinessState(currentState)
    : (currentState.happiness || {});

  return {
    version: SAVE_STATE_VERSION,
    savedAt: Date.now(),
    state: {
      ...serializableState,
      jobs: {
        ...jobsState,
        dailyOffers: Array.isArray(jobsState.dailyOffers)
          ? jobsState.dailyOffers.map((offer) => ({ ...offer }))
          : [],
        scheduledShift: jobsState.scheduledShift?.offer
          ? {
              ...jobsState.scheduledShift,
              offer: { ...jobsState.scheduledShift.offer },
            }
          : null,
        interviewResult: jobsState.interviewResult?.offer
          ? {
              ...jobsState.interviewResult,
              offer: { ...jobsState.interviewResult.offer },
              lines: [...(jobsState.interviewResult.lines || [])],
            }
          : null,
        careerOffers: Array.isArray(jobsState.careerOffers)
          ? jobsState.careerOffers.map((offer) => ({
              ...offer,
              requiredCerts: [...(offer.requiredCerts || [])],
              requirementTags: [...(offer.requirementTags || [])],
              unmetRequirements: [...(offer.unmetRequirements || [])],
            }))
          : [],
        career: jobsState.career
          ? {
              ...jobsState.career,
              lastLines: [...(jobsState.career.lastLines || [])],
            }
          : null,
        careerPrep: { ...(jobsState.careerPrep || {}) },
        certifications: { ...(jobsState.certifications || {}) },
      },
      inventory: {
        ...(currentState.inventory || {}),
        items: Array.isArray(currentState.inventory?.items)
          ? currentState.inventory.items.map((item) => ({ ...item }))
          : [],
        equipped: { ...(currentState.inventory?.equipped || {}) },
      },
      casino: typeof syncCasinoState === "function"
        ? {
            ...syncCasinoState(currentState),
            exchangeDraft: { ...(currentState.casino?.exchangeDraft || {}) },
            blackjack: typeof syncCasinoBlackjackState === "function"
              ? syncCasinoBlackjackState(currentState.casino?.blackjack)
              : { ...(currentState.casino?.blackjack || {}) },
            slots: typeof syncCasinoSlotsState === "function"
              ? syncCasinoSlotsState(currentState.casino?.slots)
              : { ...(currentState.casino?.slots || {}) },
            scam: currentState.casino?.scam
              ? { ...(currentState.casino.scam || {}) }
              : null,
            lastResult: currentState.casino?.lastResult
              ? { ...(currentState.casino.lastResult || {}) }
              : null,
          }
        : {
            ...(currentState.casino || {}),
          },
      ownership: {
        ...(currentState.ownership || {}),
      },
      happiness: {
        ...(happinessState || {}),
      },
      appearance: {
        ...(currentState.appearance || {}),
        flags: { ...(currentState.appearance?.flags || {}) },
      },
      npcs: {
        ...(currentState.npcs || {}),
        relations: Object.fromEntries(
          Object.entries(currentState.npcs?.relations || {}).map(([npcId, relation]) => [
            npcId,
            {
              ...(relation || {}),
              flags: { ...(relation?.flags || {}) },
            },
          ])
        ),
      },
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
  mergedState.jobs = rawState.jobs && typeof rawState.jobs === "object"
    ? {
        ...nextState.jobs,
        ...rawState.jobs,
        dailyOffers: Array.isArray(rawState.dayOffers)
          ? rawState.dayOffers.map((offer) => ({ ...offer }))
          : (Array.isArray(rawState.jobs.dailyOffers)
            ? rawState.jobs.dailyOffers.map((offer) => ({ ...offer }))
            : [...(nextState.jobs.dailyOffers || [])].map((offer) => ({ ...offer }))),
        scheduledShift: rawState.nextDayShift?.offer
          ? {
              ...rawState.nextDayShift,
              offer: { ...rawState.nextDayShift.offer },
            }
          : (rawState.jobs.scheduledShift?.offer
            ? {
                ...rawState.jobs.scheduledShift,
                offer: { ...rawState.jobs.scheduledShift.offer },
              }
            : nextState.jobs.scheduledShift),
        interviewResult: rawState.interviewResult?.offer
          ? {
              ...rawState.interviewResult,
              offer: { ...rawState.interviewResult.offer },
              lines: [...(rawState.interviewResult.lines || [])],
            }
          : (rawState.jobs.interviewResult?.offer
            ? {
                ...rawState.jobs.interviewResult,
                offer: { ...rawState.jobs.interviewResult.offer },
                lines: [...(rawState.jobs.interviewResult.lines || [])],
              }
            : nextState.jobs.interviewResult),
        applicationDoneToday: typeof rawState.jobApplicationDoneToday === "boolean"
          ? rawState.jobApplicationDoneToday
          : Boolean(rawState.jobs.applicationDoneToday),
        careerOffers: Array.isArray(rawState.jobs.careerOffers)
          ? rawState.jobs.careerOffers.map((offer) => ({
              ...offer,
              requiredCerts: [...(offer.requiredCerts || [])],
              requirementTags: [...(offer.requirementTags || [])],
              unmetRequirements: [...(offer.unmetRequirements || [])],
            }))
          : [],
        career: rawState.jobs.career && typeof rawState.jobs.career === "object"
          ? {
              ...nextState.jobs.career,
              ...rawState.jobs.career,
              lastLines: [...(rawState.jobs.career.lastLines || [])],
            }
          : { ...nextState.jobs.career },
        careerPrep: { ...(nextState.jobs.careerPrep || {}), ...(rawState.jobs.careerPrep || {}) },
        certifications: { ...(nextState.jobs.certifications || {}), ...(rawState.jobs.certifications || {}) },
      }
    : {
        ...nextState.jobs,
        dailyOffers: Array.isArray(rawState.dayOffers)
          ? rawState.dayOffers.map((offer) => ({ ...offer }))
          : [],
        scheduledShift: rawState.nextDayShift?.offer
          ? {
              ...rawState.nextDayShift,
              offer: { ...rawState.nextDayShift.offer },
            }
          : nextState.jobs.scheduledShift,
        interviewResult: rawState.interviewResult?.offer
          ? {
              ...rawState.interviewResult,
              offer: { ...rawState.interviewResult.offer },
              lines: [...(rawState.interviewResult.lines || [])],
            }
          : nextState.jobs.interviewResult,
        applicationDoneToday: Boolean(rawState.jobApplicationDoneToday),
      };
  mergedState.currentOffer = rawState.currentOffer ? { ...rawState.currentOffer } : null;
  mergedState.currentIncident = rawState.currentIncident ? { ...rawState.currentIncident } : null;
  mergedState.jobMiniGame = rawState.jobMiniGame
    ? {
        ...rawState.jobMiniGame,
        items: Array.isArray(rawState.jobMiniGame.items)
          ? rawState.jobMiniGame.items.map((item) => ({ ...item }))
          : [],
      }
    : null;
  mergedState.jobMiniGameResult = rawState.jobMiniGameResult
    ? { ...rawState.jobMiniGameResult }
    : null;
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
  if (rawState.startingOrigin && typeof rawState.startingOrigin === "object") {
    const rawOriginTierId = String(rawState.startingOrigin.tierId || "").trim().toLowerCase();
    const startingOriginDefaults = rawOriginTierId && typeof createAppliedSpoonStartState === "function"
      ? createAppliedSpoonStartState(rawOriginTierId)
      : (typeof createDefaultSpoonStartState === "function"
        ? createDefaultSpoonStartState()
        : {});
    mergedState.startingOrigin = {
      ...startingOriginDefaults,
      ...rawState.startingOrigin,
      starterAssetIds: Array.isArray(rawState.startingOrigin.starterAssetIds)
        ? [...rawState.startingOrigin.starterAssetIds]
        : [...(startingOriginDefaults.starterAssetIds || [])],
    };
  } else {
    mergedState.startingOrigin = typeof createDefaultSpoonStartState === "function"
      ? createDefaultSpoonStartState()
      : { tierId: "", label: "", bracket: "", summary: "", toneLabel: "", initialCash: 0, walletCash: 0, bankBalance: 0, starterAssetIds: [], starterVehicleId: "", safetyNetLevel: "none", startHappiness: 45, accent: "#94a3b8", applied: false };
  }
  mergedState.phonePreview = rawState.phonePreview
    ? { ...nextState.phonePreview, ...rawState.phonePreview }
    : createPhoneHomePreview(mergedState.day);
  mergedState.phoneAppStatus = rawState.phoneAppStatus && typeof rawState.phoneAppStatus === "object"
    ? Object.fromEntries(Object.entries(rawState.phoneAppStatus).map(([key, value]) => [key, { ...(value || {}) }]))
    : {};
  mergedState.casino = rawState.casino && typeof rawState.casino === "object"
    ? {
        ...(typeof createDefaultCasinoState === "function" ? createDefaultCasinoState() : {}),
        ...rawState.casino,
        exchangeDraft: {
          ...((typeof createDefaultCasinoState === "function" ? createDefaultCasinoState().exchangeDraft : {}) || {}),
          ...(rawState.casino.exchangeDraft || {}),
        },
        blackjack: typeof syncCasinoBlackjackState === "function"
          ? syncCasinoBlackjackState(rawState.casino.blackjack)
          : { ...(rawState.casino.blackjack || {}) },
        slots: typeof syncCasinoSlotsState === "function"
          ? syncCasinoSlotsState(rawState.casino.slots)
          : { ...(rawState.casino.slots || {}) },
        scam: rawState.casino.scam && typeof rawState.casino.scam === "object"
          ? { ...(rawState.casino.scam || {}) }
          : { ...((typeof createDefaultCasinoState === "function" ? createDefaultCasinoState().scam : {}) || {}) },
        lastResult: rawState.casino.lastResult
          ? { ...(rawState.casino.lastResult || {}) }
          : null,
      }
    : (typeof createDefaultCasinoState === "function" ? createDefaultCasinoState() : null);
  mergedState.inventory = rawState.inventory && typeof rawState.inventory === "object"
    ? {
        ...nextState.inventory,
        ...rawState.inventory,
        items: Array.isArray(rawState.inventory.items)
          ? rawState.inventory.items.map((item) => ({ ...item }))
          : [...(nextState.inventory.items || [])].map((item) => ({ ...item })),
        equipped: { ...(nextState.inventory.equipped || {}), ...(rawState.inventory.equipped || {}) },
      }
    : {
        ...nextState.inventory,
        items: [...(nextState.inventory.items || [])].map((item) => ({ ...item })),
        equipped: { ...(nextState.inventory.equipped || {}) },
      };
  mergedState.ownership = rawState.ownership && typeof rawState.ownership === "object"
    ? { ...nextState.ownership, ...rawState.ownership }
    : { ...nextState.ownership };
  mergedState.happiness = rawState.happiness && typeof rawState.happiness === "object"
    ? { ...nextState.happiness, ...rawState.happiness }
    : { ...nextState.happiness };
  mergedState.appearance = rawState.appearance && typeof rawState.appearance === "object"
    ? {
        ...nextState.appearance,
        ...rawState.appearance,
        flags: { ...(nextState.appearance?.flags || {}), ...(rawState.appearance.flags || {}) },
      }
    : {
        ...nextState.appearance,
        flags: { ...(nextState.appearance?.flags || {}) },
      };
  mergedState.npcs = rawState.npcs && typeof rawState.npcs === "object"
    ? {
        ...nextState.npcs,
        ...rawState.npcs,
        relations: Object.fromEntries(
          Object.entries(rawState.npcs.relations || {}).map(([npcId, relation]) => [
            npcId,
            {
              ...(relation || {}),
              flags: { ...(relation?.flags || {}) },
            },
          ])
        ),
      }
    : {
        ...nextState.npcs,
        relations: Object.fromEntries(
          Object.entries(nextState.npcs?.relations || {}).map(([npcId, relation]) => [
            npcId,
            {
              ...(relation || {}),
              flags: { ...(relation?.flags || {}) },
            },
          ])
        ),
      };
  mergedState.world = {
    ...nextState.world,
    ...(rawState.world || {}),
  };
  mergedState.phoneView = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(rawState.phoneView || nextState.phoneView)
    : (rawState.phoneView || nextState.phoneView);
  mergedState.disSearchQuery = typeof rawState.disSearchQuery === "string"
    ? rawState.disSearchQuery
    : nextState.disSearchQuery;
  mergedState.disGambleDrafts = rawState.disGambleDrafts && typeof rawState.disGambleDrafts === "object"
    ? {
        "odd-even": String(rawState.disGambleDrafts["odd-even"] ?? nextState.disGambleDrafts["odd-even"] ?? "1000"),
        ladder: String(rawState.disGambleDrafts.ladder ?? nextState.disGambleDrafts.ladder ?? "5000"),
      }
    : { ...(nextState.disGambleDrafts || { "odd-even": "1000", ladder: "5000" }) };
  mergedState.headline = { ...nextState.headline, ...(rawState.headline || {}) };
  mergedState.prologueIntro = rawState.prologueIntro && typeof rawState.prologueIntro === "object"
    ? { ...nextState.prologueIntro, ...rawState.prologueIntro }
    : { ...nextState.prologueIntro };
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

  if (typeof syncInventoryState === "function") {
    syncInventoryState(mergedState);
  }

  if (typeof syncOwnershipState === "function") {
    syncOwnershipState(mergedState);
  }

  if (typeof syncMetaRunState === "function") {
    syncMetaRunState(mergedState);
  }

  if (typeof syncHappinessState === "function") {
    syncHappinessState(mergedState);
  }

  if (typeof syncAppearanceState === "function") {
    syncAppearanceState(mergedState);
  }

  if (typeof syncNpcState === "function") {
    syncNpcState(mergedState);
  }

  syncWorldState(mergedState);
  syncPrologueIntroState(mergedState);

  return mergedState;
}

function createPhoneHomePreview(day = 1) {
  return {
    appId: "",
    kicker: "HOME",
    state: "READY",
    title: `${typeof formatTurnLabel === "function" ? formatTurnLabel(day) : `${day}턴`} 스마트폰`,
    body: "Diggle, 뉴스, 플레이스토어, 전화, 갤러리를 바로 열 수 있다.",
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
  const interactivePrologueStep = typeof getInteractivePrologueStepConfig === "function"
    ? getInteractivePrologueStepConfig(targetState)
    : null;

  if (interactivePrologueStep) {
    return true;
  }

  return !["prologue", "cleanup"].includes(targetState.scene);
}

function canOpenPhoneStage(targetState = state) {
  const interactivePrologueStep = typeof getInteractivePrologueStepConfig === "function"
    ? getInteractivePrologueStepConfig(targetState)
    : null;
  const canExpandInScene = ["room", "outside", "board"].includes(targetState.scene) || Boolean(interactivePrologueStep);

  return Boolean(
    targetState.hasPhone
    && !targetState.phoneMinimized
    && canUsePhoneApps(targetState)
    && canExpandInScene,
  );
}

function canApplyForJobOffer(targetState = state) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : createDefaultJobsState();

  return Boolean(
    targetState?.hasPhone
    && canUsePhoneApps(targetState)
    && !jobsState.applicationDoneToday
    && !jobsState.scheduledShift,
  );
}

function canApplyForCareerOffer(targetState = state) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : null;
  const careerStatus = jobsState?.career?.status || "idle";

  return Boolean(
    targetState?.hasPhone
    && canUsePhoneApps(targetState)
    && !(jobsState?.careerApplicationDoneToday)
    && !["applied", "employed"].includes(careerStatus),
  );
}

function getShortTermOfferEligibility(offer = null, targetState = state) {
  if (typeof evaluateShortTermJobOfferEligibility === "function") {
    return evaluateShortTermJobOfferEligibility(offer, targetState);
  }

  return {
    eligible: true,
    requirementTags: [],
    unmetRequirements: [],
  };
}

function getShortTermOfferBlockedMessage(offer = null, targetState = state) {
  const eligibility = getShortTermOfferEligibility(offer, targetState);
  return eligibility.eligible
    ? ""
    : (eligibility.unmetRequirements[0] || "조건 부족");
}

function getScheduledShiftForToday(targetState = state) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : targetState?.jobs;
  const scheduledShift = jobsState?.scheduledShift || null;

  if (!scheduledShift || scheduledShift.day !== targetState.day) {
    return null;
  }

  return scheduledShift;
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
  if (applyHungerTimePassage(normalized * TIME_SLOT_MINUTES, state)) {
    return false;
  }
  return state.timeSlot >= DAY_END_TIME_SLOT;
}

function advanceTimeToSlot(targetSlot) {
  const nextSlot = Math.max(state.timeSlot, Math.round(targetSlot));
  if (nextSlot <= state.timeSlot) {
    return false;
  }

  const elapsedSlots = nextSlot - state.timeSlot;
  state.timeSlot = Math.min(DAY_END_TIME_SLOT, nextSlot);
  state.timeMinuteOffset = 0;
  if (applyHungerTimePassage(elapsedSlots * TIME_SLOT_MINUTES, state)) {
    return false;
  }
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
      break;
    }
  }

  if (applyHungerTimePassage(normalizedMinutes, state)) {
    return false;
  }

  return state.timeSlot >= DAY_END_TIME_SLOT;
}

function refreshPhoneHomePreviewForState(targetState = state) {
  const route = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(targetState.phoneView || "home")
    : (targetState.phoneView || "home");
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : null;

  if (typeof isPhoneHomeRoute === "function" ? !isPhoneHomeRoute(route) : route !== "home") {
    return;
  }

  const scheduledShift = getScheduledShiftForToday(targetState);
  const pendingShift = jobsState?.scheduledShift || null;
  const result = jobsState?.interviewResult && jobsState.interviewResult.day === targetState.day
    ? jobsState.interviewResult
    : null;
  const career = jobsState?.career || null;

  if (scheduledShift) {
    const job = JOB_LOOKUP[scheduledShift.offer.jobId];
    const workplace = typeof getOfferWorkplaceSummary === "function"
      ? getOfferWorkplaceSummary(scheduledShift.offer, targetState)
      : null;
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "SHIFT",
      state: "TODAY",
      title: `${job.title} 출근`,
      body: workplace?.workplaceName
        ? `오늘 예약된 근무는 ${workplace.workplaceName}이다. 폰 공고앱이나 방 화면에서 바로 출근할 수 있다.`
        : "오늘 예약된 근무가 있다. 폰 공고앱이나 방 화면에서 바로 출근할 수 있다.",
    };
    return;
  }

  if (pendingShift) {
    const job = JOB_LOOKUP[pendingShift.offer.jobId];
    const workplace = typeof getOfferWorkplaceSummary === "function"
      ? getOfferWorkplaceSummary(pendingShift.offer, targetState)
      : null;
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "BOOKED",
      state: "READY",
      title: `${job.title} 예약 완료`,
      body: `${typeof formatTurnLabel === "function" ? formatTurnLabel(pendingShift.day) : `${pendingShift.day}턴`} ${workplace?.workplaceName || "근무지"} 출근이 잡혀 있다.`,
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

  if (career?.lastOutcomeDay === targetState.day) {
    const posting = typeof getCareerPostingById === "function"
      ? getCareerPostingById(career.postingId)
      : null;
    const workplace = typeof getCareerPostingWorkplaceSummaryByPostingId === "function"
      ? getCareerPostingWorkplaceSummaryByPostingId(career.postingId, targetState)
      : null;
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "CAREER",
      state: career.lastOutcome === "employed" ? "PASS" : "FAIL",
      title: `${posting?.title || "직장지원"} 결과`,
      body: [workplace?.workplaceName, (career.lastLines || []).join(" ")].filter(Boolean).join(" · "),
    };
    return;
  }

  if (career?.status === "applied" && Number.isFinite(career.resultDay) && career.resultDay > targetState.day) {
    const workplace = typeof getCareerPostingWorkplaceSummaryByPostingId === "function"
      ? getCareerPostingWorkplaceSummaryByPostingId(career.postingId, targetState)
      : null;
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "CAREER",
      state: "REVIEW",
      title: "직장지원 심사중",
      body: `${typeof formatTurnLabel === "function" ? formatTurnLabel(career.resultDay) : `${career.resultDay}턴`} ${workplace?.workplaceName || "근무지"} 결과가 도착할 예정이다.`,
    };
    return;
  }

  if (career?.status === "employed") {
    const posting = typeof getCareerPostingById === "function"
      ? getCareerPostingById(career.postingId)
      : null;
    const workplace = typeof getCareerPostingWorkplaceSummaryByPostingId === "function"
      ? getCareerPostingWorkplaceSummaryByPostingId(career.postingId, targetState)
      : null;
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "CAREER",
      state: "ACTIVE",
      title: posting?.title || "직장지원 루트",
      body: posting?.unlockJobId
        ? `${workplace?.workplaceName || "근무지"} 루트가 열렸고 더 좋은 공고가 보이기 시작했다.`
        : `${workplace?.workplaceName || "근무지"} 직장지원 루트가 열린 상태다.`,
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
    "delivery-motorbike": 0.67,
    "delivery-courier": 0.6,
    tutoring: 0.42,
    cafe: 0.55,
    warehouse: 0.64,
    cleaning: 0.56,
  };

  let chance = baseByJob[offer.jobId] ?? 0.52;
  const liquidFunds = typeof getTotalLiquidFunds === "function"
    ? getTotalLiquidFunds(state)
    : (
      (typeof getWalletBalance === "function" ? getWalletBalance(state) : Math.max(0, Number(state.money) || 0))
      + Math.max(0, Number(state.bank?.balance) || 0)
    );
  const hasSuit = typeof hasEquippedInventoryItem === "function"
    ? hasEquippedInventoryItem("outfit-suit", state)
    : false;
  const hasPremiumPhone = typeof getPlayerPhoneTier === "function"
    ? getPlayerPhoneTier(state) >= 2
    : false;
  const certifications = getCareerCertificationSnapshotForState(state);

  if (offer.jobId === "cleaning" && state.day1CleanupDone) {
    chance += 0.18;
  }
  if (offer.jobId === "warehouse" && state.stamina >= 90) {
    chance += 0.05;
  }
  if (offer.jobId === "delivery" && state.energy >= 90) {
    chance += 0.05;
  }
  if (offer.jobId === "delivery-motorbike" && state.energy >= 88) {
    chance += 0.06;
  }
  if (offer.jobId === "delivery-courier" && liquidFunds >= 120000) {
    chance += 0.04;
  }
  if (offer.jobId === "tutoring" && state.day >= 2) {
    chance += 0.04;
  }
  if (offer.jobId === "cafe" && liquidFunds >= 50000) {
    chance += 0.03;
  }
  if (offer.jobId === "smart_store" && hasPremiumPhone) {
    chance += 0.06;
  }
  if (offer.jobId === "dispatch_monitor" && hasPremiumPhone && certifications.computerCert) {
    chance += 0.08;
  }
  if (offer.jobId === "study_coach" && hasSuit && state.지능 >= 20) {
    chance += 0.06;
  }

  return Math.max(0.15, Math.min(0.92, chance));
}

function getCareerPrepSnapshotForState(targetState = state) {
  const rawPrep = targetState?.jobs && typeof targetState.jobs === "object"
    ? targetState.jobs.careerPrep
    : null;

  if (typeof sanitizeCareerPrepSnapshot === "function") {
    return sanitizeCareerPrepSnapshot(rawPrep);
  }

  return {
    service: Math.max(0, Math.round(Number(rawPrep?.service) || 0)),
    labor: Math.max(0, Math.round(Number(rawPrep?.labor) || 0)),
    office: Math.max(0, Math.round(Number(rawPrep?.office) || 0)),
    academic: Math.max(0, Math.round(Number(rawPrep?.academic) || 0)),
  };
}

function getCareerCertificationSnapshotForState(targetState = state) {
  const rawCertifications = targetState?.jobs && typeof targetState.jobs === "object"
    ? targetState.jobs.certifications
    : null;

  if (typeof sanitizeCertificationSnapshot === "function") {
    return sanitizeCertificationSnapshot(rawCertifications);
  }

  return {
    driverLicense: Boolean(rawCertifications?.driverLicense),
    computerCert: Boolean(rawCertifications?.computerCert),
  };
}

function getCareerPrepLabel(prepKey) {
  return CAREER_PREP_LABELS?.[prepKey] || prepKey;
}

function getCareerCertificationLabel(certKey) {
  return CAREER_CERTIFICATION_LABELS?.[certKey] || certKey;
}

function getCareerSuccessChance(posting, targetState = state) {
  if (!posting) {
    return 0.18;
  }

  const prepState = getCareerPrepSnapshotForState(targetState);
  const certifications = getCareerCertificationSnapshotForState(targetState);
  const requiredPrep = Math.max(0, Math.round(Number(posting.requiredPrep) || 0));
  const prepLevel = Math.max(0, Math.round(Number(prepState[posting.prepKey]) || 0));
  const requiredCerts = Array.isArray(posting.requiredCerts) ? posting.requiredCerts : [];
  let chance = Number(posting.baseChance) || 0.4;

  chance += Math.min(prepLevel, Math.max(requiredPrep, 1)) * 0.08;
  requiredCerts.forEach((certKey) => {
    if (certifications[certKey]) {
      chance += 0.12;
    }
  });

  return Math.max(0.18, Math.min(0.92, chance));
}

function buildCareerOffersForState(targetState = state) {
  const postings = Array.isArray(CAREER_JOB_POSTINGS) ? CAREER_JOB_POSTINGS : [];

  return postings.map((posting) => {
    const eligibility = typeof evaluateCareerPostingEligibility === "function"
      ? evaluateCareerPostingEligibility(posting, targetState)
      : {
          eligible: true,
          requirementTags: [],
          unmetRequirements: [],
        };

    return {
      ...posting,
      requiredPrep: Math.max(0, Math.round(Number(posting.requiredPrep) || 0)),
      prepLevel: Math.max(0, Math.round(Number(getCareerPrepSnapshotForState(targetState)[posting.prepKey]) || 0)),
      requiredCerts: Array.isArray(posting.requiredCerts) ? [...posting.requiredCerts] : [],
      requirementTags: [...(eligibility.requirementTags || [])],
      unmetRequirements: [...(eligibility.unmetRequirements || [])],
      eligible: Boolean(eligibility.eligible),
      successChance: getCareerSuccessChance(posting, targetState),
    };
  });
}

function refreshCareerJobOffers(targetState = state) {
  if (typeof patchJobsDomainState !== "function") {
    return [];
  }

  const offers = buildCareerOffersForState(targetState);
  patchJobsDomainState(targetState, { careerOffers: offers });
  return offers;
}

function resolveCareerProgressForState(targetState = state) {
  if (typeof syncJobsDomainState !== "function" || typeof patchJobsDomainState !== "function") {
    return null;
  }

  const jobsState = syncJobsDomainState(targetState);
  const career = jobsState.career;

  if (career.status !== "applied" || !Number.isFinite(career.resultDay) || career.resultDay > targetState.day) {
    return null;
  }

  const posting = typeof getCareerPostingById === "function"
    ? getCareerPostingById(career.postingId)
    : null;
  const workplace = typeof getCareerPostingWorkplaceSummaryByPostingId === "function"
    ? getCareerPostingWorkplaceSummaryByPostingId(career.postingId, targetState)
    : null;
  const chance = getCareerSuccessChance(posting, targetState);
  const success = Boolean(posting) && Math.random() < chance;
  const lines = success
    ? [
        `${posting.title} 심사 결과가 도착했다.`,
        `${workplace?.workplaceName || "근무지"} 루트가 열리며 더 좋은 공고가 보이기 시작했다.`,
      ]
    : [
        `${posting?.title || "직장지원"} 심사 결과가 도착했다.`,
        "이번에는 연결되지 않았다. 준비도를 더 쌓고 다시 지원할 수 있다.",
      ];

  patchJobsDomainState(targetState, {
    career: {
      ...career,
      status: success ? "employed" : "rejected",
      resultDay: null,
      employedJobId: success ? posting.id : "",
      lastOutcomeDay: targetState.day,
      lastOutcome: success ? "employed" : "rejected",
      lastLines: lines,
      resultChance: chance,
    },
  });

  if (success && posting?.unlockJobId && targetState.activeJobs instanceof Set) {
    targetState.activeJobs.add(posting.unlockJobId);
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      success ? "직장지원에 합격했다" : "직장지원 결과를 확인했다",
      success
        ? `${posting.title} 루트가 열렸고 새로운 공고가 풀리기 시작했다.`
        : `${posting?.title || "직장지원"} 심사는 이번엔 이어지지 않았다.`,
      {
        type: "job",
        source: posting?.title || "직장지원",
        tags: ["직장지원", success ? "합격" : "불합격", posting?.id].filter(Boolean),
      },
    );
  }

  return {
    posting,
    success,
    chance,
    lines,
  };
}

function gainCareerPrep(prepKey, {
  badge = "준비도 상승",
  text = "",
  memoryTitle = "",
  memoryBody = "",
  slots = 1,
  tags = [],
} = {}) {
  const prepState = getCareerPrepSnapshotForState(state);
  const nextValue = Math.min(9, (prepState[prepKey] || 0) + 1);

  if (typeof patchJobsDomainState === "function") {
    patchJobsDomainState(state, {
      careerPrep: {
        [prepKey]: nextValue,
      },
    });
  }
  refreshCareerJobOffers(state);

  state.headline = {
    badge,
    text: text || `${getCareerPrepLabel(prepKey)} 수치가 ${nextValue}까지 올랐다.`,
  };

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      memoryTitle || `${getCareerPrepLabel(prepKey)}를 쌓았다`,
      memoryBody || `${getCareerPrepLabel(prepKey)}를 다듬으며 다음 지원을 준비했다.`,
      {
        type: "job",
        source: getCurrentLocationLabel(),
        tags: ["준비", prepKey, ...tags],
      },
    );
  }

  if (spendTimeSlots(slots)) {
    advanceDayOrFinish();
    return;
  }

  renderGame();
}

function earnCareerCertification(certKey, {
  badge = "자격 확보",
  text = "",
  memoryTitle = "",
  memoryBody = "",
  slots = 2,
  tags = [],
} = {}) {
  const certifications = getCareerCertificationSnapshotForState(state);
  const certLabel = getCareerCertificationLabel(certKey);

  if (certifications[certKey]) {
    state.headline = {
      badge: "이미 보유",
      text: `${certLabel}는 이미 챙겨둔 상태다.`,
    };
    renderGame();
    return;
  }

  if (typeof patchJobsDomainState === "function") {
    patchJobsDomainState(state, {
      certifications: {
        [certKey]: true,
      },
    });
  }
  refreshCareerJobOffers(state);

  state.headline = {
    badge,
    text: text || `${certLabel}를 확보해 지원 조건이 넓어졌다.`,
  };

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      memoryTitle || `${certLabel}를 확보했다`,
      memoryBody || `${certLabel}를 준비해 더 나은 직장지원 루트를 열었다.`,
      {
        type: "job",
        source: getCurrentLocationLabel(),
        tags: ["자격", certKey, ...tags],
      },
    );
  }

  if (spendTimeSlots(slots)) {
    advanceDayOrFinish();
    return;
  }

  renderGame();
}

function applyToCareerJob(index) {
  if (!canApplyForCareerOffer(state) || typeof patchJobsDomainState !== "function") {
    return;
  }

  const jobsState = syncJobsDomainState(state);
  const offer = jobsState.careerOffers[index];
  const workplace = typeof getCareerOfferWorkplaceSummary === "function"
    ? getCareerOfferWorkplaceSummary(offer, state)
    : null;
  const blockReason = typeof getCareerPostingFailureReason === "function"
    ? getCareerPostingFailureReason(offer, state)
    : "";

  if (!offer || !offer.eligible || blockReason) {
    if (offer && blockReason) {
      state.headline = {
        badge: "직장지원 조건 부족",
        text: `${blockReason} 조건을 맞춰야 ${offer.title}에 지원할 수 있다.`,
      };
      renderGame();
    }
    return;
  }

  patchJobsDomainState(state, {
    careerApplicationDoneToday: true,
    career: {
      ...jobsState.career,
      status: "applied",
      postingId: offer.id,
      appliedDay: state.day,
      resultDay: state.day + 1,
      employedJobId: "",
      lastOutcomeDay: null,
      lastOutcome: "",
      lastLines: [],
      resultChance: null,
    },
  });
  refreshCareerJobOffers(state);

  state.headline = {
    badge: "직장지원 접수",
    text: `${offer.title} 지원서를 넣었다. ${workplace?.workplaceName || "근무지"} 결과는 다음 턴 도착할 예정이다.`,
  };

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      "직장지원서를 제출했다",
      `${offer.title}에 지원했다. ${workplace?.workplaceName || "근무지"} 심사에 도서관과 시험장에서 쌓은 준비가 반영된다.`,
      {
        type: "job",
        source: "스마트폰",
        tags: ["직장지원", "지원", offer.id],
      },
    );
  }

  refreshPhoneHomePreview();
  if (spendTimeSlots(TIME_COSTS.jobApplication)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
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

function applyToPhoneJobLegacy(index) {
  applyToPhoneJob(index);
}

function getJobMiniGameDefinition(jobId = "") {
  return JOB_LOOKUP?.[jobId]?.minigame || null;
}

function createJobMiniGameSession(jobId = "") {
  const definition = getJobMiniGameDefinition(jobId);
  if (!definition || !Array.isArray(definition.items) || !definition.items.length) {
    return null;
  }

  const items = definition.items.map((item, index) => ({
    ...item,
    id: item.id || `${jobId}-task-${index + 1}`,
    target: item.target !== false,
    resolved: false,
  }));
  const totalTargets = items.filter((item) => item.target !== false).length;

  return {
    id: definition.id || `${jobId}-minigame`,
    jobId,
    title: definition.title || "알바 미니게임",
    intro: definition.intro || "",
    note: definition.note || "",
    baseBonus: Number.isFinite(definition.baseBonus) ? Number(definition.baseBonus) : 0,
    penaltyPerMistake: Number.isFinite(definition.penaltyPerMistake) ? Number(definition.penaltyPerMistake) : 0,
    perfectBonus: Number.isFinite(definition.perfectBonus) ? Number(definition.perfectBonus) : 0,
    performanceLabels: definition.performanceLabels && typeof definition.performanceLabels === "object"
      ? { ...definition.performanceLabels }
      : {},
    totalTargets,
    clearedTargets: 0,
    mistakes: 0,
    items,
  };
}

function buildJobMiniGameSummary(result = null) {
  if (!result || !result.jobId) {
    return "";
  }

  const definition = getJobMiniGameDefinition(result.jobId);
  const performanceLabels = definition?.performanceLabels || {};

  if (result.bonus > 0) {
    const baseLine = result.perfect
      ? (performanceLabels.perfect || "현장 흐름을 깔끔하게 잡아 추가 수당이 붙었다.")
      : (performanceLabels.success || "핵심 업무를 먼저 처리해 추가 수당이 붙었다.");
    return `${baseLine} ${formatMoney(result.bonus)} 보너스를 받았다.`;
  }

  return performanceLabels.fail || "초반 정리가 흔들려 추가 수당은 붙지 않았다.";
}

function startWorkSceneForOffer(offerSnapshot, {
  clearScheduledShift = false,
} = {}) {
  const offer = cloneOfferSnapshot(offerSnapshot);
  const job = JOB_LOOKUP[offer.jobId];
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, state)
    : null;
  const miniGameSession = createJobMiniGameSession(offer.jobId);

  state.currentOffer = offer;
  state.lastWorkedJobId = offer.jobId;
  state.jobVisits[offer.jobId] = (state.jobVisits[offer.jobId] || 0) + 1;
  state.currentIncident = pickIncident(offer.jobId, state.jobVisits[offer.jobId]);
  state.jobMiniGame = miniGameSession;
  state.jobMiniGameResult = null;
  state.scene = miniGameSession ? "job-minigame" : "incident";

  if (clearScheduledShift) {
    if (typeof patchJobsDomainState === "function") {
      patchJobsDomainState(state, {
        scheduledShift: null,
        interviewResult: null,
      });
    } else {
      state.nextDayShift = null;
      state.interviewResult = null;
    }
  }

  state.phoneView = "home";
  state.headline = {
    badge: miniGameSession ? "근무 준비" : "출근 시작",
    text: miniGameSession
      ? `${job.title} 시작 전 ${workplace?.workplaceName || "근무지"} 핵심 업무부터 빠르게 정리한다.`
      : `${job.title} 근무를 위해 ${workplace?.workplaceName || "현장"}으로 향했다.`,
  };
  recordActionMemory("예약 근무를 시작했다", `${job.title} 근무를 위해 ${workplace?.workplaceName || "현장"}으로 향했다.`, {
    type: "job",
    source: workplace?.workplaceName || job.title,
    tags: ["알바", "출근", offer.jobId, workplace?.districtId || "", miniGameSession ? "미니게임" : ""].filter(Boolean),
  });
  refreshPhoneHomePreview();
  renderGame();
}

function completeJobMiniGameTask(itemId) {
  const game = state.jobMiniGame;
  if (state.scene !== "job-minigame" || !game) {
    return;
  }

  const item = game.items.find((entry) => entry.id === itemId);
  if (!item || item.resolved) {
    return;
  }

  item.resolved = true;
  if (item.target !== false) {
    game.clearedTargets += 1;
    spendEnergy(1);
    state.headline = {
      badge: "업무 처리",
      text: `${item.label || item.shortLabel || "핵심 업무"}를 먼저 정리했다.`,
    };
  } else {
    game.mistakes += 1;
    spendEnergy(2);
    state.stamina = Math.max(0, state.stamina - 1);
    state.headline = {
      badge: "동선 흔들림",
      text: `${item.label || item.shortLabel || "불필요한 일"}에 시간을 써서 흐름이 조금 꼬였다.`,
    };
  }

  if (game.clearedTargets >= game.totalTargets) {
    finishJobMiniGame();
    return;
  }

  renderGame();
}

function finishJobMiniGame() {
  const game = state.jobMiniGame;
  if (!game) {
    return;
  }

  const perfect = game.mistakes === 0;
  let bonus = Math.max(0, game.baseBonus - (game.mistakes * game.penaltyPerMistake));
  if (perfect) {
    bonus += game.perfectBonus || 0;
  }
  bonus = roundToHundred(bonus);

  state.jobMiniGameResult = {
    jobId: game.jobId,
    bonus,
    mistakes: game.mistakes,
    perfect,
  };
  state.jobMiniGame = null;
  state.scene = "incident";

  const summaryLine = buildJobMiniGameSummary(state.jobMiniGameResult);
  state.headline = {
    badge: perfect ? "현장 정리 완료" : "현장 정리 마무리",
    text: summaryLine,
  };
  recordActionMemory(`${JOB_LOOKUP?.[game.jobId]?.title || "알바"} 준비를 마쳤다`, summaryLine, {
    type: "job",
    source: JOB_LOOKUP?.[game.jobId]?.title || "알바",
    tags: ["알바", "미니게임", game.jobId].filter(Boolean),
  });
  renderGame();
}

function startScheduledShiftLegacy() {
  startScheduledShift();
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
  const locationId = getCurrentLocationId(state);
  const worldState = syncWorldState(state);
  const npcPool = getAlleyNpcPool(state, locationId);
  const locationLabel = getCurrentLocationLabel();
  const activeNpc = pickWeightedEntry(npcPool);
  const wanderTags = activeNpc?.tag
    ? ["이동", "탐색", locationId, activeNpc.tag]
    : ["이동", "탐색", locationId].filter(Boolean);

  if (!locationId || !npcPool.length) {
    state.headline = {
      badge: "탐색 불가",
      text: `${locationLabel}은 천천히 걸어봐도 지금은 특별히 만날 사람이 없다.`,
    };
    renderGame();
    return;
  }

  if (hasUsedLocationWander(locationId, state)) {
    setLocationWanderResult(
      locationId,
      `${locationLabel}은 오늘 이미 둘러봤다`,
      [
        "한 바퀴 돌며 사람 흐름을 이미 훑어본 곳이다.",
        "더 둘러보기보다는 다른 장소로 이동하거나 눈에 들어온 사람에게 다가가는 편이 낫다.",
      ],
      state,
    );
    state.headline = {
      badge: "탐색 완료",
      text: `${locationLabel}은 오늘 이미 한 번 돌아봤다.`,
    };
    renderGame();
    return;
  }

  markLocationWanderUsed(locationId, state);
  worldState.alleyNpcVisible = Boolean(activeNpc);
  worldState.alleyNpcId = activeNpc?.id || "";
  worldState.activeNpcLocationId = activeNpc ? locationId : "";
  setLocationWanderResult(
    locationId,
    activeNpc?.sceneTitle || `${locationLabel}을 천천히 돌아다녔다`,
    Array.isArray(activeNpc?.sceneLines) && activeNpc.sceneLines.length
      ? activeNpc.sceneLines
      : [
        `${locationLabel} 주변을 한 바퀴 돌며 사람들 얼굴을 훑어봤다.`,
        "오늘 이 장소에서는 더 오래 머물기보다 다른 선택을 하는 편이 낫다.",
      ],
    state,
  );
  state.headline = {
    badge: activeNpc ? activeNpc.headlineBadge || "주변 탐색" : "주변 탐색",
    text: activeNpc
      ? activeNpc.headlineText || `${locationLabel}에서 낯선 얼굴 하나가 눈에 들어온다.`
      : `${locationLabel} 주변을 천천히 걸으며 사람 흐름을 훑었다.`,
  };
  recordActionMemory(
    `${locationLabel}을 돌아다녔다`,
    activeNpc
      ? activeNpc.memoryBody || `${locationLabel}을 서성이다가 ${activeNpc.tag}과 눈이 마주쳤다.`
      : `${locationLabel} 주변을 천천히 걸으며 시간을 보냈다.`,
    {
      type: "travel",
      source: locationLabel,
      tags: wanderTags,
    },
  );
  if (typeof adjustHappiness === "function") {
    adjustHappiness(1, state);
  }
  if (spendTimeSlots(TIME_COSTS.wanderOutside)) {
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
  const locationId = getCurrentLocationId(state);
  const activeNpc = getActiveAlleyNpcConfig(state);
  const npcConfig = activeNpc?.id === npcId
    ? activeNpc
    : getAlleyNpcPool(state, locationId).find((entry) => entry.id === npcId) || null;

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
      badge: npcConfig?.approachBadge || "스친 사람",
      text: npcConfig?.approachText || "가까이 다가가자 상대가 짧게 반응하고 지나간다.",
    };
    setLocationWanderResult(
      locationId,
      npcConfig?.approachBadge || `${getCurrentLocationLabel()}에서 짧게 스쳤다`,
      [
        npcConfig?.approachText || "가까이 다가가자 상대가 짧게 반응하고 지나간다.",
        "더 오래 붙잡을 분위기는 아니라서 다시 주변을 둘러본다.",
      ],
      state,
    );
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

function skipScheduledShiftLegacy() {
  skipScheduledShift();
}

function normalizeStateForCurrentRules() {
  if (typeof ensureSpoonStartState === "function") {
    ensureSpoonStartState(state);
  }

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

  if (!Number.isFinite(state.timeSlot)) {
    state.timeSlot = getDefaultTimeSlotForState(state);
    state.timeMinuteOffset = 0;
  }

  if (!Number.isFinite(state.timeMinuteOffset)) {
    state.timeMinuteOffset = 0;
  }

  if (typeof state.devPreviewMode !== "boolean") {
    state.devPreviewMode = false;
  }

  if (typeof syncPhoneSessionState === "function") {
    syncPhoneSessionState(state);
  }

  if (typeof syncJobsDomainState === "function") {
    const jobsState = syncJobsDomainState(state);
    const jobsPatch = {};

    if (jobsState.scheduledShift && jobsState.scheduledShift.day < state.day) {
      jobsPatch.scheduledShift = null;
    }

    if (jobsState.interviewResult && jobsState.interviewResult.day !== state.day) {
      jobsPatch.interviewResult = null;
    }

    if (Object.keys(jobsPatch).length && typeof patchJobsDomainState === "function") {
      patchJobsDomainState(state, jobsPatch);
    }
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

  if (typeof syncInventoryState === "function") {
    syncInventoryState(state);
  }

  if (typeof syncOwnershipState === "function") {
    syncOwnershipState(state);
  }

  ensureHungerState(state);

  if (typeof syncCasinoState === "function") {
    syncCasinoState(state);
  }

  if (typeof syncMetaRunState === "function") {
    syncMetaRunState(state);
  }

  if (typeof syncHappinessState === "function") {
    syncHappinessState(state);
  }

  if (typeof syncAppearanceState === "function") {
    syncAppearanceState(state);
  }

  if (typeof syncNpcState === "function") {
    syncNpcState(state);
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
  goToLivingRoom() {
    prepareDay();
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
  "complete-walk-travel"() {
    completeWalkTravel();
  },
  "wait-seoul-rail"() {
    waitForSeoulRailEvent();
  },
  "open-bus-route-app"() {
    openBusPhoneSurface("bus/home");
  },
  "open-bus-timetable-app"() {
    openBusPhoneSurface("bus/timetable");
  },
  "study-office-prep"() {
    gainCareerPrep("office", {
      badge: "도서관 준비",
      text: "도서관에서 이력서와 문서 정리를 다듬으며 사무 준비도를 올렸다.",
      memoryTitle: "도서관에서 사무 준비를 했다",
      memoryBody: "조용한 열람실에서 이력서와 서류를 정리하며 다음 지원을 준비했다.",
      tags: ["도서관", "사무"],
    });
  },
  "study-academic-prep"() {
    gainCareerPrep("academic", {
      badge: "도서관 준비",
      text: "도서관 자료를 훑으며 학업 준비도를 올렸다.",
      memoryTitle: "도서관에서 학업 준비를 했다",
      memoryBody: "강의 자료와 문제집을 뒤적이며 학원과 교육 계열 지원을 준비했다.",
      tags: ["도서관", "학업"],
    });
  },
  "take-computer-cert"() {
    earnCareerCertification("computerCert", {
      badge: "시험 통과",
      text: "컴퓨터 자격을 확보해 사무 계열 지원 조건이 넓어졌다.",
      memoryTitle: "시험장에서 컴퓨터 자격을 챙겼다",
      memoryBody: "시험장에 들러 문서 처리와 컴퓨터 활용 자격을 확보했다.",
      tags: ["시험장", "컴퓨터"],
    });
  },
  "take-driver-license"() {
    earnCareerCertification("driverLicense", {
      badge: "시험 통과",
      text: "운전면허를 확보해 이동이 필요한 직장지원 루트가 열렸다.",
      memoryTitle: "시험장에서 운전면허를 챙겼다",
      memoryBody: "실기 접수를 마치고 이동이 필요한 루트에 도전할 준비를 끝냈다.",
      tags: ["시험장", "운전면허"],
    });
  },
  "get-plastic-surgery"() {
    performPlasticSurgery(state);
  },
  "buy-convenience-water"() {
    buyConvenienceStoreItem("buy-convenience-water", state);
  },
  "buy-convenience-kimbap"() {
    buyConvenienceStoreItem("buy-convenience-kimbap", state);
  },
  "buy-convenience-painkiller"() {
    buyConvenienceStoreItem("buy-convenience-painkiller", state);
  },
  "eat-mcdonalds-set"() {
    visitMcDonaldsMenu("eat-mcdonalds-set", state);
  },
  "buy-mcdonalds-coffee"() {
    visitMcDonaldsMenu("buy-mcdonalds-coffee", state);
  },
  "study-career-center-review"() {
    const currentMeetings = Number(state.social?.contacts?.careerCenterClerk?.meetings || 0);
    runStudyDistrictEvent({
      badge: "캠퍼스 상담",
      text: "취업지원센터에서 이력서 흐름과 지원 순서를 짚으며 사무 준비도를 올렸다.",
      memoryTitle: "대학가 취업지원센터에서 상담을 받았다",
      memoryBody: "캠퍼스 취업지원센터 직원이 이력서 순서와 공고 읽는 법을 짚어주며 다음 지원 루트를 정리해줬다.",
      prepKey: "office",
      prepGain: 1,
      happinessDelta: 2,
      routeKey: "career",
      routePatch: {
        campusCareerCenterVisited: true,
        campusCareerCenterVisits: currentMeetings + 1,
      },
      contactId: "careerCenterClerk",
      contactPatch: {
        label: "취업지원센터 직원",
        met: true,
        meetings: currentMeetings + 1,
        lastSeenDay: state.day,
        note: "사무 계열 지원 흐름과 서류 순서를 짚어줬다.",
      },
      unlockEventId: "study-career-center-review",
      unlockNpcId: "careerCenterClerk",
      slots: 1,
      tags: ["대학가", "취업지원", "상담"],
    });
  },
  "study-campus-network"() {
    const currentMeetings = Number(state.social?.contacts?.campusSenior?.meetings || 0);
    runStudyDistrictEvent({
      badge: "캠퍼스 인연",
      text: "벤치에서 만난 선배와 이야기를 나누며 학업 준비도를 올리고 숨을 골랐다.",
      memoryTitle: "캠퍼스 공원에서 선배와 이야기를 나눴다",
      memoryBody: "공원 벤치에서 만난 선배가 학원 조교와 계약직 루트 이야기를 꺼내며 다음 지원에 도움이 될 만한 힌트를 남겼다.",
      prepKey: "academic",
      prepGain: 1,
      energyGain: 1,
      happinessDelta: 4,
      routeKey: "career",
      routePatch: {
        campusNetworkUnlocked: true,
        campusNetworkMeetings: currentMeetings + 1,
      },
      contactId: "campusSenior",
      contactPatch: {
        label: "캠퍼스 선배",
        met: true,
        meetings: currentMeetings + 1,
        lastSeenDay: state.day,
        note: "학원 조교와 계약직 루트 소문을 알고 있다.",
      },
      unlockEventId: "study-campus-network",
      unlockNpcId: "campusSenior",
      slots: 1,
      tags: ["대학가", "공원", "인맥"],
    });
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
  ui.startButton.addEventListener("click", handleStartScreenPrimaryAction);
  ui.nameInput?.addEventListener("input", () => {
    syncStartScreenDrawUi();
  });
  ui.nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleStartScreenPrimaryAction();
    }
  });
  window.addEventListener("keydown", handleWorldKeyDown);
  window.addEventListener("resize", () => {
    renderGame();
  });
  window.addEventListener("scroll", handlePhoneScrollableInteraction, true);

  ui.phoneToggleButton?.addEventListener("click", togglePhonePanel);
  ui.phoneStageButton?.addEventListener("click", togglePhoneStage);
  ui.phoneBackButton?.addEventListener("click", goBackInPhone);
  ui.memoryButton?.addEventListener("click", toggleMemoryLog);
  ui.memoryCloseButton?.addEventListener("click", closeMemoryLog);
  ui.inventoryButton?.addEventListener("click", toggleInventoryLog);
  ui.inventoryCloseButton?.addEventListener("click", closeInventoryLog);
  ui.inventoryTabs?.addEventListener("click", handleInventoryTabClick);
  ui.inventoryList?.addEventListener("click", handleInventoryListClick);
  ui.characterButton?.addEventListener("click", toggleCharacterLog);
  ui.characterCloseButton?.addEventListener("click", closeCharacterLog);
  ui.textbox?.addEventListener("click", handleTextboxClick);
  ui.phonePanel?.addEventListener("click", handlePhoneScreenClick);
  ui.phoneStage?.addEventListener("click", handlePhoneScreenClick);
  ui.phonePanel?.addEventListener("input", handlePhoneScreenInput);
  ui.phoneStage?.addEventListener("input", handlePhoneScreenInput);
}

function beginStartScreenDraw() {
  if (startScreenDrawState.phase === "drawing") {
    return;
  }

  stopStartScreenDrawTimer();
  startScreenDrawState.screenMode = "origin";
  startScreenDrawState.phase = "drawing";
  startScreenDrawState.resultTierId = "";
  startScreenDrawState.previewTierId = typeof getDefaultSpoonStartTier === "function"
    ? getDefaultSpoonStartTier().id
    : "steel";
  syncStartScreenDrawUi();

  let ticks = 0;
  startScreenDrawTimer = setInterval(() => {
    startScreenDrawState.previewTierId = typeof drawSpoonStartTierId === "function"
      ? drawSpoonStartTierId()
      : "steel";
    ticks += 1;
    syncStartScreenDrawUi();

    if (ticks < 15) {
      return;
    }

    stopStartScreenDrawTimer();
    const finalTierId = typeof drawSpoonStartTierId === "function"
      ? drawSpoonStartTierId()
      : startScreenDrawState.previewTierId;
    startScreenDrawState.phase = "result";
    startScreenDrawState.previewTierId = finalTierId;
    startScreenDrawState.resultTierId = finalTierId;
    syncStartScreenDrawUi();
  }, 90);
}

function handleStartScreenPrimaryAction() {
  const playerName = String(ui.nameInput?.value || "").trim();
  if (!playerName) {
    ui.nameInput?.focus();
    ui.nameInput?.select();
    return;
  }

  showSpoonDrawOverlay();
}

function handlePhoneScreenInput(event) {
  const amountInput = event.target?.closest?.("[data-trading-amount-input]");
  if (amountInput && typeof setTradingTerminalDraftAmount === "function") {
    setTradingTerminalDraftAmount(amountInput.dataset.tradingApp, amountInput.value, state);
    return;
  }

  const disSearchInput = event.target?.closest?.("[data-dis-search-input]");
  if (disSearchInput) {
    const nextQuery = String(disSearchInput.value || "");
    if (state.disSearchQuery !== nextQuery) {
      state.disSearchQuery = nextQuery;
      const selectionStart = typeof disSearchInput.selectionStart === "number"
        ? disSearchInput.selectionStart
        : nextQuery.length;

      renderGame();

      requestAnimationFrame(() => {
        const nextInput = (ui.phoneAppScreen || ui.phoneStage || ui.phonePanel)
          ?.querySelector?.("[data-dis-search-input]");
        if (!nextInput) {
          return;
        }

        nextInput.focus({ preventScroll: true });
        if (typeof nextInput.setSelectionRange === "function") {
          const cursor = Math.min(selectionStart, nextInput.value.length);
          nextInput.setSelectionRange(cursor, cursor);
        }
      });
    }
    return;
  }

  const stockQtyInput = event.target?.closest?.("[data-stock-qty-input]");
  if (!stockQtyInput || typeof setStockMarketDraftQuantity !== "function") {
    const disGambleInput = event.target?.closest?.("[data-dis-gamble-input]");
    if (!disGambleInput || typeof setDisGambleDraftAmount !== "function") {
      return;
    }

    setDisGambleDraftAmount(disGambleInput.dataset.disGambleInput, disGambleInput.value, state);
    return;
  }

  setStockMarketDraftQuantity(stockQtyInput.value, state);
}

var _spoonOverlayPhase = "idle";
var _spoonOverlayTierId = "";
var _spoonOverlayDrawTimer = null;

function showSpoonDrawOverlay() {
  if (!ui.spoonDrawOverlay || !ui.spoonDrawOverlay.hidden) {
    return;
  }

  _spoonOverlayPhase = "idle";
  _spoonOverlayTierId = "";
  if (_spoonOverlayDrawTimer) {
    clearTimeout(_spoonOverlayDrawTimer);
    _spoonOverlayDrawTimer = null;
  }
  if (ui.spdDrawBtn) {
    ui.spdDrawBtn.removeEventListener("click", _handleSpoonDrawClick);
  }
  if (ui.spdStartBtn) {
    ui.spdStartBtn.removeEventListener("click", _handleSpoonStartClick);
  }
  _syncSpoonOverlay();
  ui.spoonDrawOverlay.hidden = false;
  ui.spoonDrawOverlay.removeAttribute("aria-hidden");
  if (ui.spdDrawBtn) {
    ui.spdDrawBtn.addEventListener("click", _handleSpoonDrawClick);
  }
  if (ui.spdStartBtn) {
    ui.spdStartBtn.addEventListener("click", _handleSpoonStartClick);
  }
}

function hideSpoonDrawOverlay() {
  if (ui.spoonDrawOverlay) {
    ui.spoonDrawOverlay.hidden = true;
    ui.spoonDrawOverlay.setAttribute("aria-hidden", "true");
  }
  if (ui.spdDrawBtn) ui.spdDrawBtn.removeEventListener("click", _handleSpoonDrawClick);
  if (ui.spdStartBtn) ui.spdStartBtn.removeEventListener("click", _handleSpoonStartClick);
  if (_spoonOverlayDrawTimer) {
    clearTimeout(_spoonOverlayDrawTimer);
    _spoonOverlayDrawTimer = null;
  }
}

function _handleSpoonDrawClick() {
  if (_spoonOverlayPhase !== "idle") return;
  _spoonOverlayPhase = "drawing";
  _spoonOverlayTierId = "";
  _syncSpoonOverlay();

  const drawTime = 900 + Math.random() * 600;
  _spoonOverlayDrawTimer = setTimeout(function() {
    _spoonOverlayTierId = typeof drawSpoonStartTierId === "function"
      ? drawSpoonStartTierId()
      : "steel";
    _spoonOverlayPhase = "result";
    _syncSpoonOverlay();
  }, drawTime);
}

function _handleSpoonStartClick() {
  if (_spoonOverlayPhase !== "result") return;
  const tierId = _spoonOverlayTierId;
  hideSpoonDrawOverlay();
  // Set the resultTierId so startGame() uses it
  if (typeof startScreenDrawState !== "undefined") {
    startScreenDrawState.resultTierId = tierId;
  }
  startGame();
}

function _syncSpoonOverlay() {
  if (!ui.spoonDrawOverlay) return;

  const phase = _spoonOverlayPhase;
  const tierId = _spoonOverlayTierId;
  const tier = tierId && typeof getSpoonStartTier === "function"
    ? getSpoonStartTier(tierId)
    : null;

  ui.spoonDrawOverlay.dataset.phase = phase;
  ui.spoonDrawOverlay.dataset.tier = tierId || "";

  // Emblem
  if (ui.spdEmblem) {
    ui.spdEmblem.textContent = phase === "idle" ? "?" : (tier?.emblem || "?");
  }

  // Odds: hide on result
  if (ui.spdOdds) {
    ui.spdOdds.hidden = phase === "result";
  }

  // Result area
  if (ui.spdResultArea) {
    ui.spdResultArea.hidden = phase !== "result";
    if (phase === "result" && tier) {
      if (ui.spdResultBracket) ui.spdResultBracket.textContent = tier.bracket || "";
      if (ui.spdResultName) ui.spdResultName.textContent = tier.name || "";
      if (ui.spdResultSummary) ui.spdResultSummary.textContent = tier.summary || "";
      if (ui.spdResultChips) {
        var packageChips = typeof getSpoonStartPackageChipLabels === "function"
          ? getSpoonStartPackageChipLabels(tier)
          : [];
        ui.spdResultChips.innerHTML =
          packageChips.map(function (label) {
            return '<span class="spd-result-chip">' + label + '</span>';
          }).join("") +
          '<span class="spd-result-chip">행복도 ' + tier.startHappiness + '</span>';
      }
    }
  }

  // Buttons
  if (ui.spdDrawBtn) {
    ui.spdDrawBtn.hidden = phase === "result";
    ui.spdDrawBtn.disabled = phase === "drawing";
    ui.spdDrawBtn.textContent = phase === "drawing" ? "결정 중..." : "🥄 수저 뽑기";
  }
  if (ui.spdStartBtn) {
    ui.spdStartBtn.hidden = phase !== "result";
  }
}

function startGame() {
  const playerName = ui.nameInput.value.trim() || "이름 없음";
  const selectedTierId = startScreenDrawState.resultTierId
    || (typeof drawSpoonStartTierId === "function" ? drawSpoonStartTierId() : "steel");

  clearSavedState();
  pendingSavedState = null;
  state = createInitialState();
  state.playerName = playerName;
  if (typeof applySpoonStartPackage === "function") {
    applySpoonStartPackage(state, selectedTierId);
  }

  hideStartScreen();
  resetStartScreenDrawState();
  renderGame();
}

function continueSavedGame() {
  resetStartScreenDrawState();
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

function getActiveStorySteps(targetState = state) {
  const storyData = getDayStoryData(targetState?.day || getCurrentDayNumber());
  return targetState?.storyKey === "phoneUnlock" ? storyData.phoneUnlockSteps : storyData.introSteps;
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
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(state);
  }
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

function toggleInventoryLog() {
  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  if (typeof toggleInventoryPanel === "function") {
    toggleInventoryPanel(undefined, state);
  }
  renderGame();
}

function closeInventoryLog() {
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(state);
  }
  renderGame();
}

function toggleCharacterLog() {
  if (typeof closeMemoryPanel === "function") closeMemoryPanel(state);
  if (typeof closeInventoryPanel === "function") closeInventoryPanel(state);
  state._characterPanelOpen = !state._characterPanelOpen;
  renderGame();
}

function closeCharacterLog() {
  state._characterPanelOpen = false;
  renderGame();
}

function handleInventoryTabClick(event) {
  const tabButton = event.target?.closest?.("[data-inventory-tab]");
  if (!tabButton) {
    return;
  }

  if (typeof setInventoryTab === "function") {
    setInventoryTab(tabButton.dataset.inventoryTab, state);
  }
  renderGame();
}

function handleInventoryListClick(event) {
  const useButton = event.target?.closest?.("[data-inventory-use-id]");
  if (!useButton) {
    return;
  }

  useInventoryConsumable(useButton.dataset.inventoryUseId, state);
}

function prepareDayStateLegacy(targetState = state) {
  prepareDayState(targetState);
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

function openBusPhoneSurface(route = "bus/home") {
  if (!state.hasPhone) {
    return;
  }

  const hasBusApp = typeof isPhoneAppInstalled === "function"
    ? isPhoneAppInstalled("bus", state)
    : false;

  if (hasBusApp && typeof openPhoneRoute === "function") {
    openPhoneRoute(route, state);
    renderGame();
    return;
  }

  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("playstore", {
      kicker: "STORE",
      title: "배금버스 앱 필요",
      body: "플레이스토어에서 바로 설치 가능.",
      tone: "accent",
    }, state);
  }

  if (typeof openPhoneRoute === "function") {
    openPhoneRoute("playstore/home", state);
  }
  renderGame();
}

function rideBusFromPhone(locationId = "") {
  const targetLocation = String(locationId || "").trim();
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(state)
    : "";
  const canBoard = currentLocationId === "bus-stop" || currentLocationId === "bus-stop-map";

  if (!targetLocation) {
    return;
  }

  if (!canBoard) {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("bus", {
        kicker: "BUS",
        title: "터미널 앞에서만 탑승 가능",
        body: "정류장이나 안내판 앞에서 이용 가능.",
        tone: "fail",
      }, state);
    }
    renderGame();
    return;
  }

  if (targetLocation === "bus-stop") {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("bus", {
        kicker: "BUS",
        title: "현재 정류장",
        body: "다른 정차 구간을 선택.",
        tone: "accent",
      }, state);
    }
    renderGame();
    return;
  }

  handleOutsideOption({
    action: "move",
    targetLocation,
    travelVia: "bus",
  });
}

function buildEscapeEndingSummary() {
  const originLabel = getStartingOriginLabel();
  return {
    noRanking: true,
    originLabel,
    originTierId: getStartingOriginTierId(),
    title: "당신은 배금도시를 떠났다",
    speaker: "메트로폴리스행 고속버스",
    tags: ["도시 이탈", "새로운 자유", originLabel],
    character: "",
    backgroundConfig: typeof DAY01_WORLD_METROPOLIS_ENDING_BACKGROUND !== "undefined"
      ? DAY01_WORLD_METROPOLIS_ENDING_BACKGROUND
      : null,
    lines: [
      "고속버스를 타고 배금도시를 떠났다.",
      `출신 수저 ${originLabel}`,
      "이번 선택은 랭킹에 반영되지 않았다.",
      "당신은 새로운 자유를 찾아 도시 밖으로 나갔다.",
    ],
  };
}

function takeMetropolisExpressBus() {
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(state)
    : "";
  const canBoard = currentLocationId === "bus-stop" || currentLocationId === "bus-stop-map";

  if (!canBoard) {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("bus", {
        kicker: "BUS",
        title: "터미널에서만 고속버스 승차 가능",
        body: "배금시외버스터미널 앞에 도착해야 메트로폴리스행 고속버스를 탈 수 있다.",
        tone: "fail",
      }, state);
    }
    renderGame();
    return;
  }

  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(state);
  }
  if (typeof patchPhoneSession === "function") {
    patchPhoneSession(state, {
      minimized: true,
      stageExpanded: false,
      route: "home",
    });
  }

  clearPendingTravelState(state);
  clearAlleyNpcState(state);
  state.currentOffer = null;
  state.currentIncident = null;
  state.lastResult = null;
  state.scene = "ending";
  state.endingSummary = buildEscapeEndingSummary();
  state.headline = {
    badge: "도시 이탈",
    text: "메트로폴리스행 고속버스가 배금도시 바깥으로 미끄러져 나간다.",
  };
  renderGame();
}

function refreshNewsFeed() {
  const feedItems = typeof getDisInternetFeedEntries === "function"
    ? getDisInternetFeedEntries(state)
    : [];
  const picked = feedItems.length
    ? sample(feedItems)
    : {
        kicker: "NEWS",
        title: "뉴스 대기",
        body: "아직 불러올 수 있는 뉴스가 없습니다.",
        tone: "accent",
      };

  setPhoneAppStatus("news", {
    kicker: picked.kicker,
    title: picked.title,
    body: picked.body,
    tone: picked.tone,
  });
  state.phonePreview = createPhoneResultPreview("news", picked.kicker, picked.title, picked.body);
  setHeadline("📰 뉴스", picked.body);
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function refreshDisInternetFeed() {
  const feedItems = typeof getDisInternetFeedEntries === "function"
    ? getDisInternetFeedEntries(state)
    : [];
  const picked = feedItems.length
    ? sample(feedItems)
    : {
        kicker: "DIGGLE",
        title: "검색 인덱스 대기",
        body: "아직 반영된 실시간 이슈가 없습니다.",
        tone: "accent",
      };

  setPhoneAppStatus("dis", {
    kicker: picked.kicker,
    title: picked.title,
    body: picked.body,
    tone: picked.tone,
  });
  state.phonePreview = createPhoneResultPreview("dis", picked.kicker, picked.title, picked.body);
  setHeadline("🌐 Diggle", picked.body);
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function runDisInternetSearch(actionTarget) {
  const scopedRoot = actionTarget?.closest(".dis-search-panel")
    || actionTarget?.closest(".dis-app")
    || ui.phoneAppScreen
    || ui.phoneStage;
  const input = actionTarget?.dataset.query
    ? null
    : scopedRoot?.querySelector("[data-dis-search-input]");
  const query = typeof actionTarget?.dataset.query === "string" && actionTarget.dataset.query.trim()
    ? actionTarget.dataset.query.trim()
    : String(input?.value || "").trim();
  const summary = typeof getDisInternetSearchSummary === "function"
    ? getDisInternetSearchSummary(query, state)
    : {
        kicker: "SEARCH",
        title: "검색",
        body: "검색 결과를 불러오지 못했습니다.",
        tone: "accent",
      };

  state.disSearchQuery = query;
  setPhoneAppStatus("dis", {
    kicker: summary.kicker,
    title: summary.title,
    body: summary.body,
    tone: summary.tone,
  });
  state.phonePreview = createPhoneResultPreview("dis", summary.kicker, summary.title, summary.body);
  setHeadline("🌐 Diggle", summary.body);
  renderGame();
}

function getDisGambleScope(actionTarget) {
  return actionTarget?.closest(".dis-gamble-panel")
    || actionTarget?.closest(".dis-gamble-app")
    || actionTarget?.closest(".dis-app")
    || ui.phoneAppScreen
    || ui.phoneStage;
}

function ensureDisGambleDrafts(targetState = state) {
  if (!targetState) {
    return null;
  }

  if (!targetState.disGambleDrafts || typeof targetState.disGambleDrafts !== "object") {
    targetState.disGambleDrafts = {
      "odd-even": "1000",
      ladder: "5000",
    };
  }

  return targetState.disGambleDrafts;
}

function normalizeDisGambleGameId(gameId = "") {
  return String(gameId || "").toLowerCase() === "ladder" ? "ladder" : "odd-even";
}

function setDisGambleDraftAmount(gameId, nextValue, targetState = state) {
  const drafts = ensureDisGambleDrafts(targetState);
  if (!drafts) {
    return "";
  }

  const normalizedGameId = normalizeDisGambleGameId(gameId);
  drafts[normalizedGameId] = String(nextValue ?? "").replace(/[^\d]/g, "");
  return drafts[normalizedGameId];
}

function getDisGambleBetAmount(gameId, actionTarget) {
  const scopedRoot = getDisGambleScope(actionTarget);
  const input = scopedRoot?.querySelector(`[data-dis-gamble-input="${gameId}"]`);
  const liveValue = String(input?.value ?? "").replace(/[^\d]/g, "");
  if (liveValue) {
    setDisGambleDraftAmount(gameId, liveValue, state);
  }

  const drafts = ensureDisGambleDrafts(state);
  return Math.floor(Number(liveValue || drafts?.[normalizeDisGambleGameId(gameId)] || 0) || 0);
}

function setDisGambleOutcome({
  title,
  body,
  tone = "accent",
  kicker = "SHADOW",
}) {
  setPhoneAppStatus("dis", {
    kicker,
    title,
    body,
    tone,
  });
  state.phonePreview = createPhoneResultPreview("dis", kicker, title, body);
  setHeadline("🌐 Diggle", body);
}

function validateDisGambleBet(gameId, actionTarget) {
  const betAmount = getDisGambleBetAmount(gameId, actionTarget);
  const balance = typeof getWalletBalance === "function"
    ? getWalletBalance(state)
    : state.money;

  if (betAmount < 1000) {
    setDisGambleOutcome({
      title: "베팅 금액 오류",
      body: "최소 1,000원 이상부터 걸 수 있습니다.",
      tone: "fail",
    });
    renderGame();
    return null;
  }

  if (betAmount > balance) {
    setDisGambleOutcome({
      title: "현금 부족",
      body: "손에 쥔 현금보다 큰 금액은 걸 수 없습니다.",
      tone: "fail",
    });
    renderGame();
    return null;
  }

  if (typeof spendCash === "function" && !spendCash(betAmount, state)) {
    setDisGambleOutcome({
      title: "정산 실패",
      body: "지갑 정리에 실패해서 베팅을 진행하지 못했습니다.",
      tone: "fail",
    });
    renderGame();
    return null;
  }

  if (typeof spendCash !== "function") {
    state.money = Math.max(0, state.money - betAmount);
  }

  return betAmount;
}

function isDisGambleScamTriggered(betAmount = 0) {
  const normalizedBet = Math.max(0, Math.floor(Number(betAmount) || 0));
  const scamChance = normalizedBet >= 50000 ? 0.18 : 0.12;
  return Math.random() < scamChance;
}

function runDisOddEven(actionTarget) {
  const betAmount = validateDisGambleBet("odd-even", actionTarget);
  if (!betAmount) {
    return;
  }

  const choice = actionTarget?.dataset.choice === "even" ? "짝" : "홀";
  const choiceKey = actionTarget?.dataset.choice === "even" ? "even" : "odd";

  if (isDisGambleScamTriggered(betAmount)) {
    const message = `홀짝 정산이 지연된다는 문구만 남기고 사이트가 닫혔다. ${formatMoney(betAmount)}은 돌아오지 않았다.`;
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(-betAmount);
    }
    setDisGambleOutcome({
      title: "먹튀 발생",
      body: message,
      tone: "fail",
    });
    finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
    return;
  }

  const rolledNumber = Math.floor(Math.random() * 10) + 1;
  const resultKey = rolledNumber % 2 === 0 ? "even" : "odd";

  if (choiceKey === resultKey) {
    const payout = betAmount * 2;
    if (typeof earnCash === "function") {
      earnCash(payout, state);
    } else {
      state.money += payout;
    }
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(betAmount);
    }
    setDisGambleOutcome({
      title: "홀짝 적중",
      body: `${rolledNumber}이 떠서 ${choice}이 맞았습니다. ${formatMoney(payout)}을 정산받았습니다.`,
      tone: "success",
    });
  } else {
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(-betAmount);
    }
    setDisGambleOutcome({
      title: "홀짝 실패",
      body: `${rolledNumber}이 떠서 ${choice} 선택이 빗나갔습니다. ${formatMoney(betAmount)}을 잃었습니다.`,
      tone: "fail",
    });
  }

  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

function runDisLadder(actionTarget) {
  const betAmount = validateDisGambleBet("ladder", actionTarget);
  if (!betAmount) {
    return;
  }

  const selectedLane = String(actionTarget?.dataset.lane || "left");
  const laneLabels = {
    left: "좌",
    center: "중",
    right: "우",
  };

  if (isDisGambleScamTriggered(betAmount)) {
    const message = `사다리 결과 창이 열리기 직전에 링크가 끊겼다. ${formatMoney(betAmount)}은 먹튀 처리됐다.`;
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(-betAmount);
    }
    setDisGambleOutcome({
      title: "먹튀 발생",
      body: message,
      tone: "fail",
    });
    finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
    return;
  }

  const winningLane = sample(["left", "center", "right"]);
  if (selectedLane === winningLane) {
    const payout = Math.round(betAmount * 2.4);
    if (typeof earnCash === "function") {
      earnCash(payout, state);
    } else {
      state.money += payout;
    }
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(payout - betAmount);
    }
    setDisGambleOutcome({
      title: "사다리 적중",
      body: `${laneLabels[winningLane]} 줄이 당첨으로 열렸습니다. ${formatMoney(payout)}을 정산받았습니다.`,
      tone: "success",
    });
  } else {
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(-betAmount);
    }
    setDisGambleOutcome({
      title: "사다리 실패",
      body: `${laneLabels[winningLane]} 줄이 당첨이었습니다. 선택한 ${laneLabels[selectedLane] || "좌"} 줄은 꽝이어서 ${formatMoney(betAmount)}을 잃었습니다.`,
      tone: "fail",
    });
  }

  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
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
    if (typeof earnBankBalance === "function") {
      earnBankBalance(amount, {
        title: "현금 입금",
        type: "deposit",
        direction: "in",
        note: "지갑의 현금을 계좌로 이동",
      }, state);
    } else {
      patchBankDomainState(state, {
        balance: bankState.balance + amount,
      });
    }
  } else {
    state.bank = {
      ...(state.bank || {}),
      balance: (state.bank?.balance || 0) + amount,
    };
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

  const bankSpent = typeof spendBankBalance === "function"
    ? spendBankBalance(amount, {
        title: "현금 출금",
        type: "withdraw",
        direction: "out",
        note: "계좌 잔액을 현금으로 인출",
      }, state)
    : false;

  if (!bankSpent && typeof patchBankDomainState === "function") {
    patchBankDomainState(state, {
      balance: Math.max(0, bankState.balance - amount),
    });
  } else if (!bankSpent) {
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

function applyBankLoanActionResult(result, { spendTime = true, route = "bank/loans" } = {}) {
  if (!result) {
    renderGame();
    return;
  }

  if (typeof openPhoneRoute === "function") {
    openPhoneRoute(route, state);
  } else {
    state.phoneView = route;
  }

  setBankAppStatusMessage({
    kicker: result.kicker || "BANK",
    title: result.title || "은행 상태",
    body: result.body || "",
    tone: result.tone || (result.ok ? "success" : "fail"),
    previewTitle: result.title || "은행 상태",
  });

  if (Number.isFinite(result.cashDelta) && result.cashDelta !== 0) {
    showMoneyEffect(result.cashDelta);
  }

  if (spendTime) {
    finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
    return;
  }

  renderGame();
}

function requestBankLoan(actionTarget) {
  const loanType = String(actionTarget?.dataset.loanType || "").trim();
  if (!loanType || typeof createBankLoan !== "function") {
    renderGame();
    return;
  }

  if (typeof updateBankLoanDraft === "function") {
    updateBankLoanDraft({ selectedType: loanType }, state);
  }

  const result = createBankLoan(loanType, state);
  applyBankLoanActionResult(result, { spendTime: true, route: "bank/loans" });
}

function repayBankLoanFromPhone(actionTarget, mode = "minimum") {
  const loanId = String(actionTarget?.dataset.loanId || "").trim();
  if (!loanId || typeof finalizeBankLoanPayment !== "function") {
    renderGame();
    return;
  }

  const result = finalizeBankLoanPayment(loanId, mode, state);
  applyBankLoanActionResult(result, { spendTime: true, route: "bank/loans" });
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

function ensureMetaRunStateReady(targetState = state) {
  if (typeof syncMetaRunState === "function") {
    syncMetaRunState(targetState);
  }
  return targetState;
}

function addUnlockEntry(bucket, id, targetState = state) {
  if (!id) {
    return;
  }

  ensureMetaRunStateReady(targetState);
  const list = Array.isArray(targetState.unlocks?.[bucket]) ? targetState.unlocks[bucket] : [];
  if (!list.includes(id)) {
    list.push(id);
  }
  targetState.unlocks[bucket] = list;
}

function patchSocialContact(contactId, patch = {}, targetState = state) {
  if (!contactId) {
    return {};
  }

  ensureMetaRunStateReady(targetState);
  const current = targetState.social.contacts?.[contactId] || {};
  const next = {
    ...current,
    ...patch,
  };
  targetState.social.contacts[contactId] = next;
  return next;
}

function patchProgressionRoute(routeKey, patch = {}, targetState = state) {
  if (!routeKey) {
    return {};
  }

  ensureMetaRunStateReady(targetState);
  const current = targetState.progression.routes?.[routeKey] || {};
  const next = {
    ...current,
    ...patch,
  };
  targetState.progression.routes[routeKey] = next;
  return next;
}

function runStudyDistrictEvent({
  badge = "학습 구역",
  text = "",
  memoryTitle = "",
  memoryBody = "",
  prepKey = "",
  prepGain = 0,
  energyGain = 0,
  happinessDelta = 0,
  routeKey = "",
  routePatch = null,
  contactId = "",
  contactPatch = null,
  unlockEventId = "",
  unlockNpcId = "",
  slots = 1,
  tags = [],
} = {}) {
  ensureMetaRunStateReady(state);

  if (prepKey && prepGain > 0 && typeof patchJobsDomainState === "function") {
    const prepState = getCareerPrepSnapshotForState(state);
    patchJobsDomainState(state, {
      careerPrep: {
        [prepKey]: Math.min(9, (prepState[prepKey] || 0) + prepGain),
      },
    });
    refreshCareerJobOffers(state);
  }

  if (energyGain > 0) {
    state.energy = Math.min(BASE_ENERGY, state.energy + Math.max(0, Math.round(energyGain)));
  }

  if (happinessDelta !== 0 && typeof adjustHappiness === "function") {
    adjustHappiness(happinessDelta, state);
  }

  if (routeKey && routePatch && typeof routePatch === "object") {
    patchProgressionRoute(routeKey, routePatch, state);
  }

  if (contactId && contactPatch && typeof contactPatch === "object") {
    patchSocialContact(contactId, contactPatch, state);
  }

  if (unlockEventId) {
    addUnlockEntry("events", unlockEventId, state);
  }

  if (unlockNpcId) {
    addUnlockEntry("npcs", unlockNpcId, state);
  }

  state.headline = {
    badge,
    text,
  };

  if (typeof recordActionMemory === "function") {
    recordActionMemory(memoryTitle, memoryBody, {
      type: "event",
      source: getCurrentLocationLabel(),
      tags,
    });
  }

  if (spendTimeSlots(slots)) {
    advanceDayOrFinish();
    return;
  }

  renderGame();
}

function useInventoryConsumable(itemId, targetState = state) {
  const definition = typeof getInventoryItemDefinition === "function"
    ? getInventoryItemDefinition(itemId)
    : null;
  const hungerRestore = Math.max(0, Math.round(Number(definition?.hungerRestore) || 0));
  const hungerMax = typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3;
  const hungerState = ensureHungerState(targetState);

  if (!definition || !definition.id || !definition.useLabel || hungerRestore <= 0) {
    return false;
  }

  if (hungerState.value >= hungerMax) {
    targetState.headline = {
      badge: "배고픔 안정",
      text: `${definition.label}은 지금 먹지 않아도 될 만큼 배고픔이 버텨 주고 있다.`,
    };
    renderGame();
    return false;
  }

  if (typeof consumeInventoryItem === "function" && !consumeInventoryItem(definition.id, 1, targetState)) {
    targetState.headline = {
      badge: "사용 실패",
      text: `${definition.label}이 인벤토리에 남아 있지 않다.`,
    };
    renderGame();
    return false;
  }

  restoreHunger(hungerRestore, targetState, { resetProgress: true });
  targetState.headline = {
    badge: "허기 달램",
    text: `${definition.label}으로 배고픔을 달래 포만감을 ${targetState.hunger}/${hungerMax}까지 회복했다.`,
  };

  if (typeof recordActionMemory === "function") {
    recordActionMemory(`${definition.label} 사용`, definition.useMemoryBody || `${definition.label}으로 배고픔을 달랬다.`, {
      type: "food",
      source: "인벤토리",
      tags: ["인벤토리", "배고픔", definition.id],
    });
  }

  renderGame();
  return true;
}

const PLASTIC_SURGERY_COST = 10000000;
const CONVENIENCE_STORE_CATALOG = Object.freeze({
  "buy-convenience-water": Object.freeze({
    itemId: "water-bottle",
    label: "생수",
    price: 1200,
    memoryBody: "편의점 냉장고에서 차가운 생수 한 병을 꺼내 계산했다.",
  }),
  "buy-convenience-kimbap": Object.freeze({
    itemId: "triangle-kimbap",
    label: "삼각김밥",
    price: 1800,
    memoryBody: "급하게 배를 채울 생각으로 삼각김밥을 하나 집어 들고 계산했다.",
  }),
  "buy-convenience-painkiller": Object.freeze({
    itemId: "painkiller",
    label: "진통제",
    price: 3500,
    memoryBody: "몸 상태가 흔들릴 때 버티기 좋게 진통제를 하나 챙겼다.",
  }),
});
const MCDONALDS_MENU_CATALOG = Object.freeze({
  "eat-mcdonalds-set": Object.freeze({
    label: "버거 세트",
    price: 6900,
    hungerGain: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3,
    energyGain: 8,
    happinessGain: 2,
    slots: 1,
    memoryBody: "맥도날드 배금사거리점에서 버거 세트를 먹으며 잠깐 숨을 돌렸다.",
  }),
  "buy-mcdonalds-coffee": Object.freeze({
    label: "커피",
    price: 2500,
    energyGain: 3,
    happinessGain: 1,
    slots: 1,
    memoryBody: "카운터에서 막 나온 커피를 받아 들고 사거리 쪽 풍경을 잠깐 바라봤다.",
  }),
});

function markConvenienceCashierSeen(targetState = state) {
  if (typeof patchSocialContact === "function") {
    patchSocialContact("convenienceCashier", {
      label: "편의점 점원",
      met: true,
      lastSeenDay: targetState.day,
      note: "상업 구역 편의점 계산대에서 자주 마주치는 점원이다.",
    }, targetState);
  }

  if (typeof patchNpcRelation === "function") {
    patchNpcRelation("convenience-cashier", { met: true }, targetState);
  }

  if (typeof addUnlockEntry === "function") {
    addUnlockEntry("npcs", "convenience-cashier", targetState);
  }
}

function performPlasticSurgery(targetState = state) {
  if (!targetState) {
    return false;
  }

  if (typeof ensurePresentationStateReady === "function") {
    ensurePresentationStateReady(targetState);
  }

  if (targetState.appearance?.surgeryDone) {
    targetState.headline = {
      badge: "성형외과",
      text: "이미 외형 변화가 반영된 상태라 오늘은 추가 상담이 필요 없어 보인다.",
    };
    renderGame();
    return false;
  }

  if (typeof canAfford === "function" && !canAfford(PLASTIC_SURGERY_COST, targetState)) {
    targetState.headline = {
      badge: "상담 보류",
      text: `${formatMoney(PLASTIC_SURGERY_COST)}이 있어야 배금병원 성형 상담을 진행할 수 있다.`,
    };
    renderGame();
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(PLASTIC_SURGERY_COST, targetState)) {
    targetState.headline = {
      badge: "결제 실패",
      text: "수술 비용이 부족해서 접수 단계에서 다시 돌아나왔다.",
    };
    renderGame();
    return false;
  }

  if (typeof patchAppearanceState === "function") {
    patchAppearanceState({
      profileId: "postSurgery",
      surgeryDone: true,
      attractivenessDelta: 2,
      flags: {
        hadPlasticSurgery: true,
      },
    }, targetState);
  }

  if (typeof adjustHappiness === "function") {
    adjustHappiness(8, targetState);
  }

  if (typeof addUnlockEntry === "function") {
    addUnlockEntry("events", "plastic-surgery", targetState);
  }

  targetState.headline = {
    badge: "성형 완료",
    text: "배금병원에서 큰돈을 쓰고 외형을 새로 정리했다. 이제 주변 반응도 달라질 수 있다.",
  };

  recordActionMemory("배금병원에서 성형 상담을 마쳤다", `${formatMoney(PLASTIC_SURGERY_COST)}을 내고 외형 변화를 선택했다. 이제 사람들의 첫 반응이 달라질 수 있다.`, {
    type: "event",
    source: getCurrentLocationLabel(),
    tags: ["병원", "성형", "외형 변화"],
  });

  if (spendTimeSlots(2)) {
    advanceDayOrFinish();
    return true;
  }

  renderGame();
  return true;
}

function buyConvenienceStoreItem(actionId, targetState = state) {
  const item = CONVENIENCE_STORE_CATALOG[actionId];
  if (!item || !targetState) {
    return false;
  }

  if (typeof canAfford === "function" && !canAfford(item.price, targetState)) {
    targetState.headline = {
      badge: "구매 실패",
      text: `${item.label} 가격인 ${formatMoney(item.price)}이 부족하다.`,
    };
    renderGame();
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(item.price, targetState)) {
    targetState.headline = {
      badge: "구매 실패",
      text: `${item.label} 계산이 중간에 멈췄다.`,
    };
    renderGame();
    return false;
  }

  if (typeof grantInventoryItem === "function") {
    grantInventoryItem(item.itemId, 1, targetState);
  }

  if (typeof adjustHappiness === "function") {
    adjustHappiness(1, targetState);
  }

  markConvenienceCashierSeen(targetState);

  targetState.headline = {
    badge: "구매 완료",
    text: `${item.label}을(를) 사고 인벤토리에 챙겨 넣었다.`,
  };

  recordActionMemory(`${item.label}을 샀다`, item.memoryBody, {
    type: "shopping",
    source: getCurrentLocationLabel(),
    tags: ["편의점", item.itemId],
  });

  renderGame();
  return true;
}

function visitMcDonaldsMenu(actionId, targetState = state) {
  const menu = MCDONALDS_MENU_CATALOG[actionId];
  if (!menu || !targetState) {
    return false;
  }

  if (typeof canAfford === "function" && !canAfford(menu.price, targetState)) {
    targetState.headline = {
      badge: "주문 실패",
      text: `${menu.label} 가격인 ${formatMoney(menu.price)}이 부족하다.`,
    };
    renderGame();
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(menu.price, targetState)) {
    targetState.headline = {
      badge: "주문 실패",
      text: `${menu.label} 결제 도중 주문이 취소됐다.`,
    };
    renderGame();
    return false;
  }

  const energyCap = typeof ENERGY_MAX === "number"
    ? ENERGY_MAX
    : (typeof BASE_ENERGY === "number" ? BASE_ENERGY : 100);
  targetState.energy = Math.min(
    energyCap,
    Math.max(0, Number(targetState.energy || 0)) + Math.max(0, Number(menu.energyGain || 0)),
  );

  if (Number(menu.hungerGain) > 0) {
    restoreHunger(menu.hungerGain, targetState, { resetProgress: true });
  }

  if (typeof adjustHappiness === "function" && menu.happinessGain) {
    adjustHappiness(menu.happinessGain, targetState);
  }

  targetState.headline = {
    badge: "식사 완료",
    text: `${menu.label}로 잠깐 숨을 돌리며 다시 움직일 힘을 챙겼다.`,
  };

  recordActionMemory(`${menu.label}로 한숨 돌렸다`, menu.memoryBody, {
    type: "food",
    source: getCurrentLocationLabel(),
    tags: ["맥도날드", "식사"],
  });

  if (spendTimeSlots(Math.max(0, Number(menu.slots || 0)))) {
    advanceDayOrFinish();
    return true;
  }

  renderGame();
  return true;
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

// ── 주식: 매수 진입 ────────────────────────────────────────
function runStocksEnter() {
  if (state.stocksUsedToday || state.stockHolding) return;

  const betInput = document.getElementById("stk-bet-input")
    || document.querySelector(".stk-app .gbl-bet-input");
  const betAmount = betInput ? Math.floor(Number(betInput.value) || 0) : 0;
  const balance = typeof getWalletBalance === "function" ? getWalletBalance(state) : state.money;

  if (betAmount < 1000) {
    setPhoneAppStatus("stocks", { kicker: "STOCKS", title: "금액 오류", body: "최소 1,000원 이상 입력하세요.", tone: "fail" });
    renderGame(); return;
  }
  if (betAmount > balance) {
    setPhoneAppStatus("stocks", { kicker: "STOCKS", title: "잔고 부족", body: "보유 현금보다 많은 금액은 투자할 수 없습니다.", tone: "fail" });
    renderGame(); return;
  }

  if (typeof spendCash === "function") spendCash(betAmount);
  else state.money = Math.max(0, state.money - betAmount);

  state.stockHolding = { betAmount, buyDay: state.day };
  state.stocksUsedToday = true;

  const message = `${formatMoney(betAmount)}을 증권 시장에 투자했다. 다음 턴 결과를 확인하자.`;
  setPhoneAppStatus("stocks", { kicker: "STOCKS", title: "매수 완료", body: message, tone: "accent" });
  setHeadline("📈 증권", message);
  recordActionMemory("주식을 매수했다", message, { type: "finance", source: "증권 앱", tags: ["증권", "매수"] });
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 주식: 매도 실현 ────────────────────────────────────────
function runStocksSell() {
  if (state.stocksUsedToday || !state.stockHolding) return;

  const market = typeof getStockMarketSnapshot === "function" ? getStockMarketSnapshot(state) : null;
  const returnRate = market ? market.stockDailyReturnRate : 0;
  const holding = state.stockHolding;
  const currentValue = Math.round(holding.betAmount * (1 + returnRate));
  const pnl = currentValue - holding.betAmount;

  if (typeof earnCash === "function") earnCash(currentValue);
  else state.money += currentValue;

  showMoneyEffect(pnl);
  state.stockHolding = null;
  state.stocksUsedToday = true;

  const pnlSign = pnl >= 0 ? "+" : "";
  const tone = pnl >= 0 ? "success" : "fail";
  const message = `보유 주식을 ${formatMoney(currentValue)}에 매도했다. 손익: ${pnlSign}${formatMoney(pnl)} (${(returnRate * 100).toFixed(1)}%)`;
  setPhoneAppStatus("stocks", { kicker: "MARKET CLOSE", title: pnl >= 0 ? "매도 수익" : "매도 손실", body: message, tone });
  setHeadline("📈 증권", message);
  recordActionMemory("주식을 매도했다", message, { type: "finance", source: "증권 앱", tags: ["증권", pnl >= 0 ? "수익" : "손실"] });
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 주식: 보유 유지 ────────────────────────────────────────
function runStocksHold() {
  if (state.stocksUsedToday || !state.stockHolding) return;
  state.stocksUsedToday = true;
  const message = "오늘은 매도하지 않기로 했다. 다음 턴 다시 확인하자.";
  setPhoneAppStatus("stocks", { kicker: "STOCKS", title: "보유 유지", body: message, tone: "accent" });
  setHeadline("📈 증권", message);
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 카지노: 즉시 베팅 ──────────────────────────────────────
function runCasinoBet() {
  if (typeof openPhoneRoute === "function") {
    openPhoneRoute(CASINO_ROUTES.blackjack, state);
  }
  renderGame();
}

// ── 코인: 매수 진입 ────────────────────────────────────────
function runCoinEnter() {
  if (state.coinUsedToday || state.coinHolding) return;

  const betInput = document.getElementById("coin-bet-input")
    || document.querySelector(".coin-app .gbl-bet-input");
  const betAmount = betInput ? Math.floor(Number(betInput.value) || 0) : 0;
  const balance = typeof getWalletBalance === "function" ? getWalletBalance(state) : state.money;

  const selectedRadio = document.querySelector(".coin-tab-radio:checked");
  const coinType = selectedRadio ? selectedRadio.value : "MAMC";

  if (betAmount < 1000) {
    setPhoneAppStatus("coin", { kicker: "COIN", title: "금액 오류", body: "최소 1,000원 이상 입력하세요.", tone: "fail" });
    renderGame(); return;
  }
  if (betAmount > balance) {
    setPhoneAppStatus("coin", { kicker: "COIN", title: "잔고 부족", body: "보유 현금보다 많은 금액은 매수할 수 없습니다.", tone: "fail" });
    renderGame(); return;
  }

  if (typeof spendCash === "function") spendCash(betAmount);
  else state.money = Math.max(0, state.money - betAmount);

  const coinInfo = typeof getCoinTypeInfo === "function" ? getCoinTypeInfo(coinType) : { label: coinType };
  state.coinHolding = { betAmount, buyDay: state.day, coinType };
  state.coinUsedToday = true;

  const message = `${coinInfo.label}(${coinType}) ${formatMoney(betAmount)}어치를 매수했다. 다음 턴 결과를 확인하자.`;
  setPhoneAppStatus("coin", { kicker: "COIN", title: "매수 완료", body: message, tone: "accent" });
  setHeadline("🪙 코인", message);
  recordActionMemory("코인을 매수했다", message, { type: "finance", source: "코인 앱", tags: ["코인", "매수", coinType] });
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 코인: 매도 실현 ────────────────────────────────────────
function runCoinSell() {
  if (state.coinUsedToday || !state.coinHolding) return;

  const holding = state.coinHolding;
  const returnRate = typeof getCoinDailyReturnRate === "function"
    ? getCoinDailyReturnRate(holding.coinType, state)
    : 0;
  const currentValue = Math.round(holding.betAmount * (1 + returnRate));
  const pnl = currentValue - holding.betAmount;

  if (typeof earnCash === "function") earnCash(currentValue);
  else state.money += currentValue;

  showMoneyEffect(pnl);
  state.coinHolding = null;
  state.coinUsedToday = true;

  const coinInfo = typeof getCoinTypeInfo === "function" ? getCoinTypeInfo(holding.coinType) : { label: holding.coinType };
  const pnlSign = pnl >= 0 ? "+" : "";
  const tone = pnl >= 0 ? "success" : "fail";
  const message = `${coinInfo.label} 매도 완료. ${formatMoney(currentValue)} 수령. 손익: ${pnlSign}${formatMoney(pnl)} (${(returnRate * 100).toFixed(1)}%)`;
  setPhoneAppStatus("coin", { kicker: "COIN", title: pnl >= 0 ? "매도 수익" : "매도 손실", body: message, tone });
  setHeadline("🪙 코인", message);
  recordActionMemory("코인을 매도했다", message, { type: "finance", source: "코인 앱", tags: ["코인", pnl >= 0 ? "수익" : "손실"] });
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 코인: 보유 유지 ────────────────────────────────────────
function runCoinHold() {
  if (state.coinUsedToday || !state.coinHolding) return;
  state.coinUsedToday = true;
  const coinInfo = typeof getCoinTypeInfo === "function" ? getCoinTypeInfo(state.coinHolding.coinType) : { label: state.coinHolding.coinType };
  const message = `${coinInfo.label} 보유를 유지하기로 했다. 다음 턴 다시 확인하자.`;
  setPhoneAppStatus("coin", { kicker: "COIN", title: "보유 유지", body: message, tone: "accent" });
  setHeadline("🪙 코인", message);
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

function handleTradingTerminalAction(phoneAction, actionTarget) {
  if (typeof ensureTradingTerminalState !== "function") {
    return false;
  }

  const appId = actionTarget?.dataset.appId;

  if (phoneAction === "terminal-set-mode") {
    setTradingTerminalMode(appId, actionTarget.dataset.mode, state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-set-asset") {
    setTradingTerminalAsset(appId, actionTarget.dataset.asset, state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-toggle-chart") {
    toggleTradingTerminalChart(appId, state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-set-leverage") {
    setTradingTerminalLeverage(appId, Number(actionTarget.dataset.leverage) || 5, state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-set-pct") {
    setTradingTerminalQuickAmount(appId, Number(actionTarget.dataset.pct) || 0, state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-spot-buy") {
    if (tradeTradingTerminalSpot(appId, "buy", state)) {
      renderGame();
    } else {
      renderGame();
    }
    return true;
  }

  if (phoneAction === "terminal-spot-sell") {
    tradeTradingTerminalSpot(appId, "sell", state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-futures-long") {
    tradeTradingTerminalFutures(appId, "long", state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-futures-short") {
    tradeTradingTerminalFutures(appId, "short", state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-close-position") {
    closeTradingTerminalPosition(appId, actionTarget.dataset.positionId, state);
    renderGame();
    return true;
  }

  return false;
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
  restoreHunger(typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3, state, { resetProgress: true });
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

function handlePhoneScreenClickLegacy(event) {
  return handlePhoneScreenClick(event);
}

function applyToPhoneJob(index) {
  if (typeof runPhoneJobApplicationAction === "function") {
    const result = runPhoneJobApplicationAction(index, state);
    if (result && !result.rendered) {
      renderGame();
    }
    return;
  }
}

function startScheduledShift() {
  if (typeof runStartScheduledShiftAction === "function") {
    const result = runStartScheduledShiftAction(state);
    if (result && !result.rendered) {
      renderGame();
    }
    return;
  }
}

function skipScheduledShift() {
  if (typeof runSkipScheduledShiftAction === "function") {
    const result = runSkipScheduledShiftAction(state);
    if (result && !result.rendered) {
      renderGame();
    }
    return;
  }
}

function prepareDayState(targetState = state) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : null;
  let bankLoanResolution = null;

  targetState.timeSlot = DAY_START_TIME_SLOT;
  targetState.timeMinuteOffset = 0;
  targetState.scene = "room";
  targetState.currentOffer = null;
  targetState.currentIncident = null;
  targetState.jobMiniGame = null;
  targetState.jobMiniGameResult = null;
  targetState.lastResult = null;
  targetState.endingSummary = null;
  targetState.cleaningGame = null;
  targetState.hasPhone = true;
  targetState.phoneStageExpanded = false;
  targetState.phoneView = "home";
  targetState.phoneUsedToday = false;
  targetState.stocksUsedToday = false;
  targetState.casinoUsedToday = false;
  targetState.coinUsedToday = false;
  targetState.phonePreview = createPhoneHomePreview(targetState.day);
  bankLoanResolution = typeof processBankLoansForTurn === "function"
    ? processBankLoansForTurn(targetState)
    : null;
  const nextDailyOffers = buildDayOffersForState(targetState);
  targetState.headline = {
    badge: "",
    text: "",
  };

  syncWorldState(targetState);
  targetState.world.currentLocation = getDayHomeLocationId(targetState.day) || targetState.world.currentLocation;
  targetState.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(targetState.world.currentLocation, targetState.day)
    : targetState.world.currentDistrict;
  clearAlleyNpcState(targetState);
  resetLocationWanderState(targetState);
  clearPendingTravelState(targetState);

  if (typeof resetDialogueState === "function") {
    resetDialogueState(targetState);
  }

  if (typeof resetPhoneSessionForDay === "function") {
    resetPhoneSessionForDay(targetState);
  }

  if (typeof patchJobsDomainState === "function") {
    patchJobsDomainState(targetState, {
      dailyOffers: nextDailyOffers,
      scheduledShift: jobsState?.scheduledShift && jobsState.scheduledShift.day >= targetState.day
        ? jobsState.scheduledShift
        : null,
      interviewResult: jobsState?.interviewResult && jobsState.interviewResult.day === targetState.day
        ? jobsState.interviewResult
        : null,
      applicationDoneToday: false,
      careerApplicationDoneToday: false,
    });

    const careerProgress = resolveCareerProgressForState(targetState);
    const refreshedDailyOffers = buildDayOffersForState(targetState);
    patchJobsDomainState(targetState, {
      dailyOffers: refreshedDailyOffers,
    });
    refreshCareerJobOffers(targetState);

    if (careerProgress) {
      targetState.headline = {
        badge: careerProgress.success ? "직장지원 합격" : "직장지원 결과",
        text: careerProgress.lines[careerProgress.lines.length - 1] || "",
      };
    }
  }

  refreshPhoneHomePreviewForState(targetState);

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

  if (bankLoanResolution) {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("bank", {
        kicker: bankLoanResolution.kicker || "BANK",
        title: bankLoanResolution.title || "대출 상태",
        body: bankLoanResolution.body || "",
        tone: bankLoanResolution.tone || (bankLoanResolution.ok ? "success" : "warning"),
      }, targetState);
    }

    if (!targetState.headline?.text || bankLoanResolution.seizureTriggered) {
      targetState.headline = {
        badge: bankLoanResolution.seizureTriggered ? "담보 압류" : "대출 상태",
        text: bankLoanResolution.body || (bankLoanResolution.lines?.[0] || ""),
      };
    }
  }
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

  const {
    phoneAction,
    offerIndex,
    track,
  } = actionTarget.dataset;

  if (phoneAction === "close-phone-view") {
    openPhoneHome();
    return;
  }

  if (phoneAction === "install-phone-app") {
    installPhoneAppFromStore(actionTarget.dataset.appId);
    return;
  }

  if (phoneAction === "bus-ride-to-stop") {
    rideBusFromPhone(actionTarget.dataset.locationId);
    return;
  }

  if (phoneAction === "bus-take-express") {
    takeMetropolisExpressBus();
    return;
  }

  if (phoneAction === "refresh-dis-feed") {
    refreshDisInternetFeed();
    return;
  }

  if (phoneAction === "refresh-news-feed") {
    refreshNewsFeed();
    return;
  }

  if (phoneAction === "dis-run-search") {
    runDisInternetSearch(actionTarget);
    return;
  }

  if (phoneAction === "dis-set-gamble-bet") {
    setDisGambleDraftAmount(actionTarget.dataset.gameId, actionTarget.dataset.amount, state);
    renderGame();
    return;
  }

  if (typeof dispatchRegisteredPhoneAction === "function" && dispatchRegisteredPhoneAction(phoneAction, actionTarget, state)) {
    return;
  }

  if (typeof handleStockMarketAction === "function" && handleStockMarketAction(phoneAction, actionTarget)) {
    return;
  }

  if (handleTradingTerminalAction(phoneAction, actionTarget)) {
    return;
  }

  if (phoneAction === "dis-play-odd-even") {
    runDisOddEven(actionTarget);
    return;
  }

  if (phoneAction === "dis-play-ladder") {
    runDisLadder(actionTarget);
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

  if (phoneAction === "bank-take-loan") {
    requestBankLoan(actionTarget);
    return;
  }

  if (phoneAction === "bank-repay-loan-minimum") {
    repayBankLoanFromPhone(actionTarget, "minimum");
    return;
  }

  if (phoneAction === "bank-repay-loan-full") {
    repayBankLoanFromPhone(actionTarget, "full");
    return;
  }

  if (phoneAction === "jobs-set-track") {
    if (typeof setJobsActiveTrack === "function") {
      setJobsActiveTrack(track, state);
    }
    renderGame();
    return;
  }

  if (phoneAction === "apply-career-job") {
    applyToCareerJob(Number(offerIndex));
    return;
  }

  if (phoneAction === "run-stocks-trade") {
    runStocksTrade();
    return;
  }

  if (phoneAction === "run-stocks-enter") {
    runStocksEnter();
    return;
  }

  if (phoneAction === "run-stocks-sell") {
    runStocksSell();
    return;
  }

  if (phoneAction === "run-stocks-hold") {
    runStocksHold();
    return;
  }

  if (phoneAction === "run-casino-bet") {
    runCasinoBet();
    return;
  }

  if (phoneAction === "casino-fill-exchange") {
    fillCasinoExchangeDraft(actionTarget.dataset.direction, Number(actionTarget.dataset.amount) || 0);
    return;
  }

  if (phoneAction === "casino-exchange-in") {
    runCasinoExchangeIn();
    return;
  }

  if (phoneAction === "casino-exchange-out") {
    runCasinoExchangeOut();
    return;
  }

  if (phoneAction === "casino-add-bet") {
    addCasinoBlackjackBet(Number(actionTarget.dataset.amount) || 0);
    return;
  }

  if (phoneAction === "casino-reset-bet") {
    resetCasinoBlackjackBet();
    return;
  }

  if (phoneAction === "casino-start-blackjack") {
    startCasinoBlackjackRound();
    return;
  }

  if (phoneAction === "casino-hit") {
    casinoBlackjackHit();
    return;
  }

  if (phoneAction === "casino-stand") {
    casinoBlackjackStand();
    return;
  }

  if (phoneAction === "casino-double") {
    casinoBlackjackDoubleDown();
    return;
  }

  if (phoneAction === "casino-set-ace") {
    setCasinoBlackjackAcePreference(Number(actionTarget.dataset.ace) || 11);
    return;
  }

  if (phoneAction === "casino-slot-set-bet") {
    setCasinoSlotBet(Number(actionTarget.dataset.amount) || CASINO_SLOT_MIN_BET);
    return;
  }

  if (phoneAction === "run-coin-enter") {
    runCoinEnter();
    return;
  }

  if (phoneAction === "run-coin-sell") {
    runCoinSell();
    return;
  }

  if (phoneAction === "run-coin-hold") {
    runCoinHold();
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
    const offer = {
      jobId,
      pay: typeof getAdjustedWage === "function"
        ? getAdjustedWage(basePay, targetState)
        : basePay,
      shiftStartSlot: sample(shiftRule.startSlotChoices),
      shiftDurationSlots: shiftRule.durationSlots,
    };
    const eligibility = getShortTermOfferEligibility(offer, targetState);

    return {
      ...offer,
      requirementTags: [...(eligibility.requirementTags || [])],
      unmetRequirements: [...(eligibility.unmetRequirements || [])],
      eligible: Boolean(eligibility.eligible),
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
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(state)
    : createDefaultJobsState();
  const offer = jobsState.dailyOffers[index];
  if (!offer) {
    return;
  }

  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, state)
    : null;
  state.currentOffer = offer;
  state.jobVisits[offer.jobId] = (state.jobVisits[offer.jobId] || 0) + 1;
  state.currentIncident = pickIncident(offer.jobId, state.jobVisits[offer.jobId]);
  state.scene = "incident";
  state.headline = {
    badge: JOB_LOOKUP[offer.jobId].category,
    text: `${JOB_LOOKUP[offer.jobId].title} 공고를 잡았다. ${workplace?.workplaceName || "근무지"}에선 오늘 어떤 일이 터질까.`,
  };
  recordActionMemory("공고 하나를 붙잡았다", `${JOB_LOOKUP[offer.jobId].title} 공고를 보고 ${workplace?.workplaceName || "근무지"}에서 오늘 해볼 일로 정했다.`, {
    type: "job",
    source: workplace?.workplaceName || getCurrentLocationLabel(),
    tags: ["알바", "공고", offer.jobId, workplace?.districtId || ""].filter(Boolean),
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

  const miniGameResult = state.jobMiniGameResult?.jobId === state.currentOffer?.jobId
    ? state.jobMiniGameResult
    : null;
  const miniGameBonus = Number.isFinite(miniGameResult?.bonus)
    ? Number(miniGameResult.bonus)
    : 0;
  const pay = roundToHundred(calculatePay(state.currentOffer.pay, choice) + miniGameBonus);
  const resultLines = Array.isArray(choice.result) ? [...choice.result] : [];
  const miniGameSummary = buildJobMiniGameSummary(miniGameResult);
  if (miniGameSummary) {
    resultLines.unshift(miniGameSummary);
  }
  if (typeof earnBankBalance === "function") {
    earnBankBalance(pay, {
      title: `${state.currentOffer.title} 급여 입금`,
      type: "income",
      direction: "in",
      note: "오늘 근무 정산",
    }, state);
  } else if (typeof patchBankDomainState === "function") {
    const bankState = typeof getBankDomainState === "function"
      ? getBankDomainState(state)
      : { balance: 0 };
    patchBankDomainState(state, {
      balance: bankState.balance + pay,
    });
    if (typeof recordBankTransaction === "function") {
      recordBankTransaction({
        title: `${state.currentOffer.title} 급여 입금`,
        amount: pay,
        type: "income",
        direction: "in",
        note: "오늘 근무 정산",
      }, state);
    }
  } else {
    state.money += pay;
  }

  resultLines.unshift(`급여 ${formatMoney(pay)}이 계좌로 입금됐다.`);

  if (choice.changes?.remove) {
    choice.changes.remove.forEach((jobId) => state.activeJobs.delete(jobId));
  }

  if (choice.changes?.add) {
    choice.changes.add.forEach((jobId) => state.activeJobs.add(jobId));
  }

  state.lastResult = {
    pay,
    depositDestination: "bank",
    lines: resultLines,
  };
  state.jobMiniGameResult = null;

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
  state.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(state.world.currentLocation, state.day)
    : state.world.currentDistrict;
  clearAlleyNpcState(state);
  clearWanderResultState(state);
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
    clearAlleyNpcState(state);
    clearWanderResultState(state);
    clearPendingTravelState(state);
    renderGame();
    return;
  }

  worldState.currentLocation = targetLocation;
  worldState.currentDistrict = worldState.pendingTravelDistrict
    || (typeof getWorldLocationDistrictId === "function"
      ? getWorldLocationDistrictId(targetLocation, state.day)
      : worldState.currentDistrict);
  if (worldState.currentDistrict && !worldState.unlockedDistricts.includes(worldState.currentDistrict)) {
    worldState.unlockedDistricts.push(worldState.currentDistrict);
  }
  if (targetLocation && !worldState.unlockedLocations.includes(targetLocation)) {
    worldState.unlockedLocations.push(targetLocation);
  }
  clearAlleyNpcState(state);
  clearWanderResultState(state);
  clearPendingTravelState(state);
  state.world.currentLocation = targetLocation;
  state.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(targetLocation, state.day)
    : state.world.currentDistrict;
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

function completeWalkTravel() {
  const worldState = syncWorldState(state);
  const targetLocation = worldState.pendingTravelTarget;
  const locationMap = getDayWorldLocationMap(state.day);
  const travelMethod = getPendingTravelMethodLabel(state);
  const isPureWalkTravel = travelMethod === "도보";

  if (!targetLocation || !locationMap?.[targetLocation]) {
    worldState.currentLocation = getDayHomeLocationId(state.day) || "apt-alley";
    clearAlleyNpcState(state);
    clearWanderResultState(state);
    clearPendingTravelState(state);
    renderGame();
    return;
  }

  worldState.currentLocation = targetLocation;
  worldState.currentDistrict = worldState.pendingTravelDistrict
    || (typeof getWorldLocationDistrictId === "function"
      ? getWorldLocationDistrictId(targetLocation, state.day)
      : worldState.currentDistrict);
  if (targetLocation === "bus-stop-map") {
    setWorldTerminalTab("route", state);
  }
  if (worldState.currentDistrict && !worldState.unlockedDistricts.includes(worldState.currentDistrict)) {
    worldState.unlockedDistricts.push(worldState.currentDistrict);
  }
  if (targetLocation && !worldState.unlockedLocations.includes(targetLocation)) {
    worldState.unlockedLocations.push(targetLocation);
  }
  clearAlleyNpcState(state);
  clearWanderResultState(state);
  clearPendingTravelState(state);
  state.world.currentLocation = targetLocation;
  state.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(targetLocation, state.day)
    : state.world.currentDistrict;
  state.headline = {
    badge: isPureWalkTravel ? "도보 도착" : "이동 도착",
    text: isPureWalkTravel
      ? `${locationMap[targetLocation].label}에 걸어서 도착했다.`
      : `${locationMap[targetLocation].label}에 ${travelMethod}로 도착했다.`,
  };
  recordActionMemory(isPureWalkTravel ? "걸어서 이동했다" : "이동을 마쳤다", isPureWalkTravel
    ? `${locationMap[targetLocation].label}에 걸어서 도착했다.`
    : `${locationMap[targetLocation].label}에 ${travelMethod}로 도착했다.`, {
    type: "travel",
    source: travelMethod,
    tags: ["이동", ...(travelMethod.includes("버스") ? ["버스"] : []), ...(travelMethod.includes("도보") ? ["도보"] : []), targetLocation],
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

  if (!isTypingTarget && (event.key === "i" || event.key === "I")) {
    event.preventDefault();
    toggleInventoryLog();
    return;
  }

  if (event.key === "Escape" && state.inventory?.panelOpen) {
    event.preventDefault();
    closeInventoryLog();
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
  const terminalTabTarget = event.target?.closest?.("[data-terminal-tab]");
  if (terminalTabTarget) {
    setWorldTerminalTab(terminalTabTarget.dataset.terminalTab, state);
    renderGame();
    return;
  }

  if (!event.target || event.target.closest("#choices, button, a, input, textarea, select")) {
    return;
  }

  if (typeof canAdvanceSceneText === "function" && canAdvanceSceneText()) {
    advanceSceneText();
  }
}

function startWorldTravelToLocation(targetLocation = "", config = {}) {
  const normalizedTargetLocation = String(targetLocation || "").trim();
  const currentLocationId = getCurrentLocationId();
  const currentLocation = getCurrentOutsideSceneConfig();
  const locationMap = getDayWorldLocationMap(state.day);
  const currentLabel = currentLocation?.label || getCurrentLocationLabel();
  const targetLabel = locationMap?.[normalizedTargetLocation]?.label || normalizedTargetLocation;
  const canMove = config.skipExitCheck
    || !Array.isArray(currentLocation?.exits)
    || currentLocation.exits.includes(normalizedTargetLocation);

  if (!normalizedTargetLocation || !locationMap?.[normalizedTargetLocation] || !canMove || currentLocationId === normalizedTargetLocation) {
    return false;
  }

  const travelMinutes = Math.max(
    TIME_SLOT_MINUTES,
    Math.round(
      Number(config.travelMinutes)
      || estimateWalkTravelMinutes(currentLocationId, normalizedTargetLocation, state)
      || TIME_SLOT_MINUTES
    )
  );
  const travelSlots = Number.isFinite(config.travelSlots)
    ? Math.max(TIME_COSTS.moveBetweenScenes, Math.round(config.travelSlots))
    : Math.max(TIME_COSTS.moveBetweenScenes, Math.ceil(travelMinutes / TIME_SLOT_MINUTES));
  const travelMethod = typeof config.travelMethod === "string" && config.travelMethod.trim()
    ? config.travelMethod.trim()
    : (typeof getTravelMethodLabelForMode === "function"
      ? getTravelMethodLabelForMode(config.travelSceneId === "bus-ride" ? "bus" : "walk", state)
      : (config.travelSceneId === "bus-ride" ? "버스" : "도보"));
  const memoryTags = Array.isArray(config.memoryTags) && config.memoryTags.length
    ? config.memoryTags
    : ["이동", travelMethod.includes("버스") ? "bus" : "walk", normalizedTargetLocation];

  const reachedDayEnd = spendMinorTime(travelMinutes);
  if (reachedDayEnd) {
    advanceDayOrFinish();
    return true;
  }

  syncWorldState(state);
  state.world.pendingTravelTarget = normalizedTargetLocation;
  state.world.pendingTravelDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(normalizedTargetLocation, state.day)
    : state.world.pendingTravelDistrict;
  state.world.pendingTravelSource = currentLabel;
  state.world.pendingTravelMinutes = travelMinutes;
  state.world.pendingTravelMethod = travelMethod;
  state.world.currentLocation = config.travelSceneId === "bus-ride" ? "bus-ride" : "walk-travel";

  recordActionMemory(
    config.memoryTitle || `${targetLabel}로 이동한다`,
    config.memoryText || `${currentLabel}에서 ${targetLabel}까지 ${travelMethod} ${formatTravelDurationLabel(travelMinutes)} 이동 코스를 잡았다.`,
    {
      type: "travel",
      source: currentLabel,
      tags: memoryTags,
    }
  );

  clearAlleyNpcState(state);
  clearWanderResultState(state);
  state.headline = {
    badge: "",
    text: "",
  };

  if (typeof hideCityMapOverlay === "function") {
    hideCityMapOverlay();
  }

  renderGame();
  return true;
}

function handleOutsideOption(action) {
  const option = typeof action === "string" ? { action } : action;
  if (!option) {
    return;
  }

  if (option.action === "move" && option.targetLocation) {
    const currentLocationId = getCurrentLocationId();
    const shouldUseBusTravel = (currentLocationId === "bus-stop-map" || currentLocationId === "bus-stop")
      && option.travelVia === "bus";
    const cityMapSummary = shouldUseBusTravel || typeof getCityMapTravelSummary !== "function"
      ? null
      : getCityMapTravelSummary(option.targetLocation, state);

    startWorldTravelToLocation(option.targetLocation, {
      skipExitCheck: Boolean(cityMapSummary) || shouldUseBusTravel,
      travelMinutes: shouldUseBusTravel ? TIME_SLOT_MINUTES : cityMapSummary?.minutes,
      travelSlots: shouldUseBusTravel ? TIME_COSTS.moveBetweenScenes : cityMapSummary?.slots,
      travelMethod: shouldUseBusTravel ? "버스" : cityMapSummary?.methodLabel,
      travelSceneId: shouldUseBusTravel ? "bus-ride" : cityMapSummary?.sceneId,
      memoryTitle: shouldUseBusTravel ? "버스를 타고 이동한다" : undefined,
      memoryText: shouldUseBusTravel ? undefined : cityMapSummary?.routeText
        ? `${cityMapSummary.currentLabel}에서 ${cityMapSummary.targetLabel}까지 ${cityMapSummary.methodLabel} ${cityMapSummary.durationLabel} 코스를 잡았다.`
        : undefined,
      memoryTags: shouldUseBusTravel
        ? ["이동", "bus", option.targetLocation]
        : (cityMapSummary?.pathModes?.length
          ? ["이동", ...cityMapSummary.pathModes, option.targetLocation]
          : undefined),
    });
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
  state.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(state.world.currentLocation, state.day)
    : state.world.currentDistrict;
  clearAlleyNpcState(state);
  clearWanderResultState(state);
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
    badge: state.hasPhone ? "스마트폰" : (typeof formatTurnLabel === "function" ? formatTurnLabel(state.day) : `${state.day}턴`),
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
  if (typeof applyDailyHappinessDecay === "function") {
    applyDailyHappinessDecay(state);
  }
  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(state);
  }
  prepareDay();
}

function finishRun() {
  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(state);
  }
  state.scene = "ranking";
  state.currentOffer = null;
  state.currentIncident = null;
  state.endingSummary = buildEndingSummary();
  state.headline = {
    badge: "최종 정산",
    text: `${MAX_DAYS}턴이 끝났다. 현금과 계좌를 합친 보유 자금으로 마지막 랭킹이 매겨진다.`,
  };

  const summary = state.endingSummary;
  const myEntry = {
    name: summary.playerName,
    money: summary.totalCash,
    rank: summary.rank.label,
    job: summary.jobTitle,
    spoon: summary.originLabel,
    spoonId: summary.originTierId,
    happiness: summary.happiness,
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

function getStartingOriginInfo(targetState = state) {
  const originState = typeof ensureSpoonStartState === "function"
    ? ensureSpoonStartState(targetState)
    : (targetState?.startingOrigin || null);
  const label = String(originState?.label || "").trim() || "수저 미정";
  const tierId = String(originState?.tierId || "").trim().toLowerCase();
  return {
    label,
    tierId,
  };
}

function getStartingOriginLabel(targetState = state) {
  return getStartingOriginInfo(targetState).label;
}

function getStartingOriginTierId(targetState = state) {
  return getStartingOriginInfo(targetState).tierId;
}

function buildEndingSummaryLegacy() {
  return buildEndingSummary();
}

function buildEndingSummary() {
  const totalLiquidFunds = typeof getTotalLiquidFunds === "function"
    ? getTotalLiquidFunds(state)
    : Math.max(0, Number(state.money) || 0) + Math.max(0, Number(state.bank?.balance) || 0);
  const assetValue = typeof getOwnershipTotalAssetValue === "function"
    ? getOwnershipTotalAssetValue(state)
    : 0;
  const debtOutstanding = typeof getBankLoanSummary === "function"
    ? Math.max(0, Number(getBankLoanSummary(state)?.totalOutstanding) || 0)
    : 0;
  const netWorth = totalLiquidFunds + assetValue - debtOutstanding;
  const cashOnHand = typeof getWalletBalance === "function"
    ? getWalletBalance(state)
    : Math.max(0, Number(state.money) || 0);
  const bankBalance = typeof getBankBalance === "function"
    ? getBankBalance(state)
    : Math.max(0, Number(state.bank?.balance) || 0);
  const rank = getRankByMoney(totalLiquidFunds);
  const lastJob = JOB_LOOKUP[state.lastWorkedJobId];
  const jobTitle = lastJob ? lastJob.title : "무직";
  const originLabel = getStartingOriginLabel(state);
  const originTierId = getStartingOriginTierId(state);
  const happinessState = typeof syncHappinessState === "function"
    ? syncHappinessState(state)
    : createDefaultHappinessState();
  const happinessLabel = typeof getHappinessStatusLabel === "function"
    ? getHappinessStatusLabel(happinessState.status)
    : happinessState.status;
  let happinessComment = "현금은 쥐었지만 마음의 여유까지 챙기진 못했다.";

  if (happinessState.status === "steady") {
    happinessComment = "돈뿐 아니라 삶의 결도 어느 정도 붙잡은 채 이번 주를 넘겼다.";
  } else if (happinessState.status === "depressed") {
    happinessComment = "버티기는 했지만 마음이 많이 깎인 채로 결산표 앞에 섰다.";
  }

  return {
    totalCash: totalLiquidFunds,
    cashOnHand,
    bankBalance,
    assetValue,
    debtOutstanding,
    netWorth,
    rank,
    jobTitle,
    playerName: state.playerName,
    originLabel,
    originTierId,
    happiness: happinessState.value,
    happinessStatus: happinessState.status,
    lines: [
      `${MAX_DAYS}턴 동안 쥔 현금과 계좌 잔고를 모두 정산했다.`,
      `손 현금 ${formatMoney(cashOnHand)}`,
      `계좌 잔고 ${formatMoney(bankBalance)}`,
      `최종 보유 자금 ${formatMoney(totalLiquidFunds)}`,
      `보유 자산 가치 ${formatMoney(assetValue)}`,
      `남은 대출 ${formatMoney(debtOutstanding)}`,
      `순자산 ${formatMoney(netWorth)}`,
      `출신 수저 ${originLabel}`,
      `최종 행복도 ${happinessState.value} (${happinessLabel})`,
      `최종 정산 ${rank.label} / ${rank.title}`,
      rank.comment,
      happinessComment,
    ],
  };
}

function getRankByMoney(money) {
  return RANK_TABLE.find((entry) => money >= entry.min) || RANK_TABLE[RANK_TABLE.length - 1];
}

function restartToTitle() {
  clearSavedState();
  pendingSavedState = null;
  resetStartScreenDrawState();
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
