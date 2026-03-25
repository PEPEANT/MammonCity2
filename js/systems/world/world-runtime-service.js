// Runtime world helpers live outside logic.js so route, travel, and wander
// state can stay in one domain boundary.

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

function getResolvedHomeLocationId(targetState = state) {
  const day = targetState?.day || getCurrentDayNumber();
  if (typeof syncSpoonStartResidence === "function") {
    syncSpoonStartResidence(targetState);
  }

  if (typeof shouldUseSpoonStartResidence === "function" && !shouldUseSpoonStartResidence(targetState)) {
    return getDayHomeLocationId(day);
  }

  const spoonHomeLocationId = typeof getSpoonStartHomeLocationId === "function"
    ? getSpoonStartHomeLocationId(targetState)
    : "";

  if (spoonHomeLocationId) {
    return spoonHomeLocationId;
  }

  return getDayHomeLocationId(day);
}

function getResolvedInitialUnlockedLocationIds(targetState = null, day = targetState?.day || getCurrentDayNumber()) {
  const initialUnlockedLocations = typeof getWorldInitialUnlockedLocationIds === "function"
    ? getWorldInitialUnlockedLocationIds(day)
    : [];
  const homeLocationId = getResolvedHomeLocationId(targetState) || getDayHomeLocationId(day);
  const homeLocationIds = typeof getAllSpoonStartHomeLocationIds === "function"
    ? getAllSpoonStartHomeLocationIds()
    : [];
  const filteredLocations = initialUnlockedLocations.filter(
    (locationId) => !homeLocationIds.includes(locationId) || locationId === homeLocationId
  );

  if (homeLocationId && !filteredLocations.includes(homeLocationId)) {
    filteredLocations.unshift(homeLocationId);
  }

  return filteredLocations;
}

function createDefaultWorldState(day = getCurrentDayNumber(), targetState = null) {
  const stateForHomeResolution = targetState && typeof targetState === "object"
    ? targetState
    : { day };
  const currentLocation = getResolvedHomeLocationId(stateForHomeResolution) || getDayHomeLocationId(day);
  const currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(currentLocation, day)
    : "";

  return {
    currentDistrict,
    currentLocation,
    unlockedDistricts: typeof getWorldInitialUnlockedDistrictIds === "function"
      ? getWorldInitialUnlockedDistrictIds(day)
      : (currentDistrict ? [currentDistrict] : []),
    unlockedLocations: typeof getResolvedInitialUnlockedLocationIds === "function"
      ? getResolvedInitialUnlockedLocationIds(stateForHomeResolution, day)
      : (currentLocation ? [currentLocation] : []),
    alleyNpcVisible: false,
    alleyNpcId: "",
    activeNpcLocationId: "",
    ambientNpcCache: {},
    wanderedLocations: [],
    wanderNpcByLocation: {},
    wanderResult: {
      locationId: "",
      title: "",
      lines: [],
    },
    pendingTravelTarget: "",
    pendingTravelDistrict: "",
    pendingTravelSource: "",
    pendingTravelSourceLocationId: "",
    pendingTravelMinutes: 0,
    pendingTravelMethod: "",
    terminalTab: "route",
  };
}

function syncWorldState(targetState = state) {
  if (!targetState) {
    return createDefaultWorldState();
  }

  const day = targetState.day || getCurrentDayNumber();
  const defaults = createDefaultWorldState(day, targetState);
  const worldState = targetState.world && typeof targetState.world === "object"
    ? targetState.world
    : {};
  const locations = getDayWorldLocationMap(day);
  const districts = typeof getDayWorldDistrictMap === "function"
    ? getDayWorldDistrictMap(day) || {}
    : {};
  let currentLocation = typeof worldState.currentLocation === "string"
    ? worldState.currentLocation
    : defaults.currentLocation;

  if (locations && currentLocation && !locations[currentLocation]) {
    currentLocation = defaults.currentLocation;
  }

  const homeLocationIds = typeof getAllSpoonStartHomeLocationIds === "function"
    ? getAllSpoonStartHomeLocationIds()
    : [];
  const resolvedHomeLocationId = getResolvedHomeLocationId(targetState) || defaults.currentLocation;
  if (homeLocationIds.includes(currentLocation) && resolvedHomeLocationId && currentLocation !== resolvedHomeLocationId) {
    currentLocation = resolvedHomeLocationId;
  }

  let currentDistrict = typeof worldState.currentDistrict === "string"
    ? worldState.currentDistrict
    : defaults.currentDistrict;

  if (!currentDistrict || (districts && !districts[currentDistrict])) {
    currentDistrict = typeof getWorldLocationDistrictId === "function"
      ? getWorldLocationDistrictId(currentLocation, day)
      : defaults.currentDistrict;
  }

  const unlockedDistricts = typeof normalizeWorldIdList === "function"
    ? normalizeWorldIdList(worldState.unlockedDistricts, Object.keys(districts), defaults.unlockedDistricts)
    : [...(defaults.unlockedDistricts || [])];
  let unlockedLocations = typeof normalizeWorldIdList === "function"
    ? normalizeWorldIdList(worldState.unlockedLocations, Object.keys(locations || {}), defaults.unlockedLocations)
    : [...(defaults.unlockedLocations || [])];
  const wanderedLocations = typeof normalizeWorldIdList === "function"
    ? normalizeWorldIdList(worldState.wanderedLocations, Object.keys(locations || {}), defaults.wanderedLocations)
    : [];
  const wanderResult = worldState.wanderResult && typeof worldState.wanderResult === "object"
    ? worldState.wanderResult
    : {};
  const ambientNpcCache = worldState.ambientNpcCache && typeof worldState.ambientNpcCache === "object"
    ? worldState.ambientNpcCache
    : {};
  const wanderNpcByLocation = worldState.wanderNpcByLocation && typeof worldState.wanderNpcByLocation === "object"
    ? worldState.wanderNpcByLocation
    : {};

  if (homeLocationIds.length) {
    unlockedLocations = unlockedLocations.filter(
      (locationId) => !homeLocationIds.includes(locationId) || locationId === resolvedHomeLocationId
    );
  }

  if (currentDistrict && !unlockedDistricts.includes(currentDistrict)) {
    unlockedDistricts.push(currentDistrict);
  }
  if (currentLocation && !unlockedLocations.includes(currentLocation)) {
    unlockedLocations.push(currentLocation);
  }
  if (locations?.["lotto-retailer"] && !unlockedLocations.includes("lotto-retailer")) {
    unlockedLocations.push("lotto-retailer");
  }

  targetState.world = {
    ...worldState,
    currentDistrict,
    currentLocation,
    unlockedDistricts,
    unlockedLocations,
    alleyNpcVisible: typeof worldState.alleyNpcVisible === "boolean"
      ? worldState.alleyNpcVisible
      : defaults.alleyNpcVisible,
    alleyNpcId: typeof worldState.alleyNpcId === "string"
      ? worldState.alleyNpcId
      : defaults.alleyNpcId,
    activeNpcLocationId: typeof worldState.activeNpcLocationId === "string"
      ? worldState.activeNpcLocationId
      : defaults.activeNpcLocationId,
    ambientNpcCache: Object.fromEntries(
      Object.entries(ambientNpcCache).filter(([locationId, snapshot]) =>
        typeof locationId === "string"
        && locationId
        && locations?.[locationId]
        && snapshot
        && typeof snapshot === "object"
      )
    ),
    wanderedLocations,
    wanderNpcByLocation: Object.fromEntries(
      Object.entries(wanderNpcByLocation).filter(([locationId, npcId]) =>
        typeof locationId === "string"
        && locationId
        && locations?.[locationId]
        && typeof npcId === "string"
      )
    ),
    wanderResult: {
      locationId: typeof wanderResult.locationId === "string"
        ? wanderResult.locationId
        : defaults.wanderResult.locationId,
      title: typeof wanderResult.title === "string"
        ? wanderResult.title
        : defaults.wanderResult.title,
      lines: Array.isArray(wanderResult.lines)
        ? wanderResult.lines.filter((line) => typeof line === "string")
        : [...defaults.wanderResult.lines],
    },
    pendingTravelTarget: typeof worldState.pendingTravelTarget === "string"
      ? worldState.pendingTravelTarget
      : defaults.pendingTravelTarget,
    pendingTravelDistrict: typeof worldState.pendingTravelDistrict === "string"
      && (!worldState.pendingTravelDistrict || districts[worldState.pendingTravelDistrict])
      ? worldState.pendingTravelDistrict
      : defaults.pendingTravelDistrict,
    pendingTravelSource: typeof worldState.pendingTravelSource === "string"
      ? worldState.pendingTravelSource
      : defaults.pendingTravelSource,
    pendingTravelSourceLocationId: typeof worldState.pendingTravelSourceLocationId === "string"
      && (!worldState.pendingTravelSourceLocationId || locations?.[worldState.pendingTravelSourceLocationId])
      ? worldState.pendingTravelSourceLocationId
      : defaults.pendingTravelSourceLocationId,
    pendingTravelMinutes: Number.isFinite(worldState.pendingTravelMinutes)
      ? Math.max(0, Math.round(worldState.pendingTravelMinutes))
      : defaults.pendingTravelMinutes,
    pendingTravelMethod: typeof worldState.pendingTravelMethod === "string"
      ? worldState.pendingTravelMethod
      : defaults.pendingTravelMethod,
    terminalTab: worldState.terminalTab === "timetable" ? "timetable" : "route",
  };

  return targetState.world;
}

function getCurrentDistrictId(targetState = state) {
  return syncWorldState(targetState).currentDistrict;
}

function getCurrentLocationId(targetState = state) {
  return syncWorldState(targetState).currentLocation;
}

function isTravelSceneLocationId(locationId = "") {
  return ["walk-travel", "bus-ride", "express-bus-travel"].includes(String(locationId || "").trim());
}

function getWorldTerminalTab(targetState = state) {
  return syncWorldState(targetState).terminalTab === "timetable" ? "timetable" : "route";
}

function setWorldTerminalTab(tab = "route", targetState = state) {
  const worldState = syncWorldState(targetState);
  worldState.terminalTab = tab === "timetable" ? "timetable" : "route";
  return worldState.terminalTab;
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

function getPendingTravelSourceLabel(targetState = state) {
  const sourceLabel = syncWorldState(targetState).pendingTravelSource;
  return sourceLabel || "이전 장소";
}

function formatTravelDurationLabel(totalMinutes = TIME_SLOT_MINUTES) {
  const rawMinutes = Math.round(Number(totalMinutes));
  const minutes = Number.isFinite(rawMinutes) && rawMinutes > 0
    ? rawMinutes
    : TIME_SLOT_MINUTES;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;

  if (hours <= 0) {
    return `${minutes}분`;
  }
  if (remainMinutes <= 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${remainMinutes}분`;
}

function getPendingTravelDurationLabel(targetState = state) {
  const pendingMinutes = syncWorldState(targetState).pendingTravelMinutes;
  return formatTravelDurationLabel(pendingMinutes || TIME_SLOT_MINUTES);
}

function getPendingTravelMethodLabel(targetState = state) {
  const methodLabel = syncWorldState(targetState).pendingTravelMethod;
  return methodLabel || "도보";
}

function getWalkTravelRouteTheme(targetState = state) {
  const worldState = syncWorldState(targetState);
  const day = targetState?.day || getCurrentDayNumber();
  const sourceLocationId = String(worldState.pendingTravelSourceLocationId || "").trim();
  const targetLocationId = String(worldState.pendingTravelTarget || "").trim();
  const sourceDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(sourceLocationId, day)
    : "";
  const targetDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(targetLocationId, day)
    : "";
  const routeDistrict = targetDistrict || sourceDistrict || String(worldState.pendingTravelDistrict || "").trim();

  return {
    sourceLocationId,
    targetLocationId,
    sourceDistrict,
    targetDistrict,
    routeDistrict,
    crossesDistrict: Boolean(sourceDistrict && targetDistrict && sourceDistrict !== targetDistrict),
  };
}

function getWalkTravelBackgroundVariants(routeTheme = null) {
  const defaultBackground = typeof DAY01_WORLD_WALKING_BACKGROUND !== "undefined"
    ? DAY01_WORLD_WALKING_BACKGROUND
    : null;
  const alternateBackground = typeof DAY01_WORLD_WALKING_BACKGROUND_2 !== "undefined"
    ? DAY01_WORLD_WALKING_BACKGROUND_2
    : defaultBackground;
  const longRouteBackground = typeof DAY01_WORLD_WALKING_BACKGROUND_3 !== "undefined"
    ? DAY01_WORLD_WALKING_BACKGROUND_3
    : alternateBackground;

  switch (routeTheme?.routeDistrict) {
    case "industrial":
      return [longRouteBackground, alternateBackground, defaultBackground].filter(Boolean);
    case "commercial":
      return [alternateBackground, defaultBackground, longRouteBackground].filter(Boolean);
    case "study":
      return [defaultBackground, alternateBackground, longRouteBackground].filter(Boolean);
    case "residential":
    default:
      return [defaultBackground, alternateBackground, longRouteBackground].filter(Boolean);
  }
}

function getWalkTravelSeedHash(seed = "") {
  let hash = 0;
  const normalizedSeed = String(seed || "");
  for (let index = 0; index < normalizedSeed.length; index += 1) {
    hash = ((hash * 31) + normalizedSeed.charCodeAt(index)) % 2147483647;
  }
  return Math.abs(hash);
}

function getWalkTravelBackgroundForMinutes(totalMinutes = TIME_SLOT_MINUTES, targetState = state) {
  const normalizedMinutes = Math.max(4, Math.round(Number(totalMinutes || TIME_SLOT_MINUTES)));
  const routeTheme = getWalkTravelRouteTheme(targetState);
  const variants = getWalkTravelBackgroundVariants(routeTheme);
  if (!variants.length) {
    return null;
  }

  const seed = [
    routeTheme.sourceLocationId || routeTheme.sourceDistrict || "walk",
    routeTheme.targetLocationId || routeTheme.targetDistrict || "route",
    Math.max(1, Math.round(normalizedMinutes / 5)),
  ].join(":");
  const hash = getWalkTravelSeedHash(seed);
  const variantCount = normalizedMinutes >= TIME_SLOT_MINUTES * 2 || routeTheme.crossesDistrict
    ? variants.length
    : Math.min(2, variants.length);
  const variantIndex = variantCount <= 1 ? 0 : (hash % variantCount);

  return variants[variantIndex] || variants[0] || null;
}

function estimateWalkTravelMinutes(fromLocationId = "", toLocationId = "", targetState = state) {
  const day = targetState?.day || getCurrentDayNumber();
  const fromDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(fromLocationId, day)
    : "";
  const toDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(toLocationId, day)
    : "";

  const nearbyResidentialStops = new Set([
    "apt-alley",
    "silver-home-front",
    "golden-home-front",
    "bus-stop",
    "bus-stop-map",
  ]);
  if (nearbyResidentialStops.has(fromLocationId) && nearbyResidentialStops.has(toLocationId)) {
    return typeof adjustTravelMinutesForOwnedVehicle === "function"
      ? adjustTravelMinutesForOwnedVehicle(TIME_SLOT_MINUTES, {
          fromLocationId,
          toLocationId,
          mode: "walk",
        }, targetState)
      : TIME_SLOT_MINUTES;
  }

  const baseMinutes = fromDistrict && toDistrict && fromDistrict !== toDistrict
    ? TIME_SLOT_MINUTES * 3
    : TIME_SLOT_MINUTES * 2;

  return typeof adjustTravelMinutesForOwnedVehicle === "function"
    ? adjustTravelMinutesForOwnedVehicle(baseMinutes, {
        fromLocationId,
        toLocationId,
        mode: "walk",
      }, targetState)
    : baseMinutes;
}

const WORLD_NPC_METADATA = {
  "high-school-girl": {
    gender: "female",
    talkable: true,
    timeBands: ["morning", "day", "evening"],
  },
  "npc-woman": {
    gender: "female",
    talkable: true,
    timeBands: ["day", "evening", "night"],
  },
  "alley-aunt": {
    gender: "female",
    talkable: true,
    timeBands: ["morning", "day", "evening"],
  },
  "office-plaza-recruiter": {
    gender: "female",
    talkable: true,
    timeBands: ["day", "evening"],
  },
  "city-knit-commuter": {
    gender: "female",
    talkable: true,
    timeBands: ["morning", "day", "evening"],
  },
  "station-alt-student": {
    gender: "female",
    talkable: true,
    timeBands: ["morning", "day", "evening"],
  },
  "smart-casual-commuter": {
    gender: "female",
    talkable: true,
    timeBands: ["morning", "day", "evening"],
  },
  "campus-hoodie-student": {
    gender: "female",
    talkable: true,
    timeBands: ["day", "evening"],
  },
  "campus-glasses-student": {
    gender: "female",
    talkable: true,
    timeBands: ["day", "evening"],
  },
  "alley-office-worker": {
    gender: "male",
    talkable: true,
    timeBands: ["morning", "day", "evening"],
  },
  "office-plaza-worker": {
    gender: "male",
    talkable: true,
    timeBands: ["morning", "day", "evening"],
  },
  "career-center-runner": {
    gender: "male",
    talkable: true,
    timeBands: ["day", "evening"],
  },
  "park-busker": {
    gender: "male",
    talkable: true,
    timeBands: ["day", "evening", "night"],
  },
  "station-homeless": {
    gender: "male",
    talkable: true,
    timeBands: ["day", "evening", "night"],
  },
  "logistics-checker": {
    gender: "male",
    talkable: true,
    timeBands: ["morning", "day", "evening"],
  },
  "logistics-driver": {
    gender: "male",
    talkable: true,
    timeBands: ["day", "evening", "night"],
  },
};

const WORLD_FALLBACK_CROWD_LAYOUTS = {
  default: [
    { left: 62, bottom: 5, height: 84 },
    { left: 72, bottom: 6, height: 88 },
    { left: 82, bottom: 7, height: 86 },
    { left: 88, bottom: 5, height: 82 },
  ],
  downtown: [
    { left: 60, bottom: 5, height: 84 },
    { left: 70, bottom: 6, height: 88 },
    { left: 80, bottom: 7, height: 86 },
    { left: 88, bottom: 5, height: 82 },
  ],
  "station-front": [
    { left: 64, bottom: 5, height: 84 },
    { left: 74, bottom: 6, height: 88 },
    { left: 84, bottom: 7, height: 86 },
    { left: 90, bottom: 5, height: 82 },
  ],
  "university-district": [
    { left: 62, bottom: 5, height: 84 },
    { left: 70, bottom: 6, height: 88 },
    { left: 80, bottom: 7, height: 86 },
    { left: 88, bottom: 5, height: 82 },
  ],
};

function getWorldTimeBand(targetState = state) {
  const totalMinutes = (Math.max(0, Number(targetState?.timeSlot) || 0) * 30)
    + Math.max(0, Number(targetState?.timeMinuteOffset) || 0);
  const hour = Math.floor(totalMinutes / 60);

  if (hour < 11) {
    return "morning";
  }
  if (hour < 17) {
    return "day";
  }
  if (hour < 21) {
    return "evening";
  }
  return "night";
}

function cloneWorldNpcEntry(entry = null) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  return {
    ...entry,
    actor: entry.actor && typeof entry.actor === "object"
      ? { ...entry.actor }
      : null,
    sceneLines: Array.isArray(entry.sceneLines)
      ? [...entry.sceneLines]
      : [],
  };
}

function getWorldNpcMetadata(npcId = "") {
  return WORLD_NPC_METADATA[String(npcId || "").trim()] || {};
}

function isResidentialHomeFrontLocation(locationId = "") {
  return ["apt-alley", "silver-home-front", "golden-home-front"].includes(String(locationId || "").trim());
}

function getLocationCrowdTargetCount(locationId = "", targetState = state, options = {}) {
  const rawPool = getAlleyNpcPool(targetState, locationId);
  if (!rawPool.length) {
    return 0;
  }
  return 1;
}

function getAdjustedLocationNpcPool(targetState = state, locationId = getCurrentLocationId(targetState)) {
  const rawPool = getAlleyNpcPool(targetState, locationId).map((entry) => cloneWorldNpcEntry(entry)).filter(Boolean);
  if (!rawPool.length) {
    return [];
  }

  const appearanceLevel = typeof getPlayerAppearanceLevel === "function"
    ? getPlayerAppearanceLevel(targetState)
    : 1;
  const timeBand = getWorldTimeBand(targetState);
  const applyAdjustments = (entries = []) => entries.map((entry) => {
    const metadata = getWorldNpcMetadata(entry.id);
    const avoidingPlayer = typeof isNpcAvoidingPlayer === "function"
      ? isNpcAvoidingPlayer(entry.id, targetState)
      : false;
    let weight = Math.max(0, Number(entry.weight) || 0);

    if (appearanceLevel >= 2 && metadata.gender === "female") {
      weight *= 1.75;
    }
    if (appearanceLevel >= 3 && metadata.talkable !== false) {
      weight *= 1.25;
    }
    if (Array.isArray(metadata.timeBands) && metadata.timeBands.includes(timeBand)) {
      weight *= 1.15;
    }
    if (avoidingPlayer) {
      weight = 0;
    }

    return {
      ...entry,
      weight,
      metadata: {
        ...metadata,
        talkable: metadata.talkable !== false && !avoidingPlayer,
        avoidsPlayer: avoidingPlayer,
      },
    };
  });

  const filtered = rawPool.filter((entry) => {
    const metadata = getWorldNpcMetadata(entry.id);
    return !Array.isArray(metadata.timeBands)
      || !metadata.timeBands.length
      || metadata.timeBands.includes(timeBand);
  });

  return applyAdjustments(filtered.length ? filtered : rawPool);
}

function createFallbackWorldNpcEntry(locationId = "", slotIndex = 0, targetState = state) {
  const timeBand = getWorldTimeBand(targetState);
  const appearanceLevel = typeof getPlayerAppearanceLevel === "function"
    ? getPlayerAppearanceLevel(targetState)
    : 1;
  const fallbackId = appearanceLevel >= 2 && timeBand !== "morning"
    ? "npc-woman"
    : (timeBand === "morning" ? "high-school-girl" : "alley-office-worker");
  const artMap = {
    "npc-woman": CHARACTER_ART?.npcWoman?.default || "",
    "high-school-girl": CHARACTER_ART?.highSchoolGirl?.default || "",
    "alley-office-worker": CHARACTER_ART?.alleyOfficeWorker?.default || "",
  };
  const layouts = WORLD_FALLBACK_CROWD_LAYOUTS[locationId] || WORLD_FALLBACK_CROWD_LAYOUTS.default;
  const layout = layouts[slotIndex % layouts.length] || WORLD_FALLBACK_CROWD_LAYOUTS.default[0];
  const day = targetState?.day || getCurrentDayNumber();
  const locationLabel = getDayWorldLocationMap(day)?.[locationId]?.label || "거리";

  return {
    id: `fallback-${locationId || "street"}-${slotIndex + 1}-${fallbackId}`,
    weight: 1,
    tag: "행인",
    isFallback: true,
    actor: {
      src: artMap[fallbackId] || artMap["alley-office-worker"] || "",
      alt: `${locationId || "street"}-fallback-npc`,
      left: layout.left,
      bottom: layout.bottom,
      height: layout.height,
      zIndex: 1,
    },
    headlineBadge: "주변 사람들",
    headlineText: `${locationLabel}에는 항상 누군가가 지나가고 있다.`,
    approachBadge: "짧은 스침",
    approachText: "가볍게 시선을 주고받지만 바쁜 걸음으로 지나간다.",
    memoryBody: `${locationLabel}을 지나는 사람들 사이에 자연스럽게 섞여 걸었다.`,
    sceneTitle: `${locationLabel}에 사람이 오간다`,
    sceneLines: [
      `${locationLabel}에는 적어도 두세 명의 사람이 계속 오가고 있다.`,
      "잠깐 시선을 마주쳐도 대개는 자신의 일정으로 서둘러 지나간다.",
    ],
    metadata: {
      ...getWorldNpcMetadata(fallbackId),
      talkable: false,
    },
  };
}

function buildAmbientNpcRefreshKey(locationId = "", targetState = state) {
  const day = Number(targetState?.day || 0);
  const appearanceLevel = typeof getPlayerAppearanceLevel === "function"
    ? getPlayerAppearanceLevel(targetState)
    : 1;
  return [
    day,
    String(locationId || "").trim(),
    getWorldTimeBand(targetState),
    appearanceLevel,
  ].join(":");
}

function cloneAmbientNpcSnapshot(snapshot = null) {
  if (!snapshot || typeof snapshot !== "object") {
    return null;
  }

  return {
    ...snapshot,
    roster: Array.isArray(snapshot.roster)
      ? snapshot.roster.map((entry) => ({
          ...entry,
          actor: entry.actor && typeof entry.actor === "object"
            ? { ...entry.actor }
            : null,
        }))
      : [],
  };
}

function clearAmbientNpcCache(locationId = "", targetState = state) {
  const worldState = syncWorldState(targetState);
  if (!worldState.ambientNpcCache || typeof worldState.ambientNpcCache !== "object") {
    worldState.ambientNpcCache = {};
  }

  const normalizedLocationId = String(locationId || "").trim();
  if (!normalizedLocationId) {
    worldState.ambientNpcCache = {};
    return worldState.ambientNpcCache;
  }

  delete worldState.ambientNpcCache[normalizedLocationId];
  return worldState.ambientNpcCache;
}

function pickWeightedEntries(entries = [], count = 1) {
  const available = entries
    .map((entry) => cloneWorldNpcEntry(entry))
    .filter((entry) => Number(entry?.weight) > 0);
  const picked = [];

  while (available.length && picked.length < count) {
    const selected = pickWeightedEntry(available);
    if (!selected) {
      break;
    }

    picked.push(selected);
    const selectedId = String(selected.id || "");
    const selectedIndex = available.findIndex((entry) => String(entry?.id || "") === selectedId);
    if (selectedIndex >= 0) {
      available.splice(selectedIndex, 1);
    } else {
      break;
    }
  }

  return picked;
}

function getLocationAmbientNpcSnapshot(targetState = state, locationId = getCurrentLocationId(targetState), {
  forceRefresh = false,
  focusNpcId = "",
} = {}) {
  const normalizedLocationId = String(locationId || "").trim();
  if (!normalizedLocationId) {
    return null;
  }

  const worldState = syncWorldState(targetState);
  if (!worldState.ambientNpcCache || typeof worldState.ambientNpcCache !== "object") {
    worldState.ambientNpcCache = {};
  }

  const normalizedFocusNpcId = String(focusNpcId || "").trim();
  const refreshKey = `${buildAmbientNpcRefreshKey(normalizedLocationId, targetState)}:${normalizedFocusNpcId || "ambient"}`;
  const cached = cloneAmbientNpcSnapshot(worldState.ambientNpcCache[normalizedLocationId] || null);
  if (!forceRefresh && cached?.refreshKey === refreshKey && Array.isArray(cached.roster) && cached.roster.length) {
    return cached;
  }

  const targetCount = getLocationCrowdTargetCount(normalizedLocationId, targetState, {
    focusNpcId: normalizedFocusNpcId,
  });
  if (!targetCount) {
    worldState.ambientNpcCache[normalizedLocationId] = {
      refreshKey,
      locationId: normalizedLocationId,
      roster: [],
    };
    return cloneAmbientNpcSnapshot(worldState.ambientNpcCache[normalizedLocationId]);
  }

  const candidatePool = getAdjustedLocationNpcPool(targetState, normalizedLocationId);
  const filteredPool = normalizedFocusNpcId
    ? candidatePool.filter((entry) => String(entry?.id || "") === normalizedFocusNpcId)
    : candidatePool;
  const selected = pickWeightedEntries(filteredPool, Math.min(targetCount, filteredPool.length));
  const roster = selected.map((entry) => ({
    id: entry.id,
    actor: entry.actor && typeof entry.actor === "object"
      ? { ...entry.actor }
      : null,
    tag: entry.tag || "",
    isFallback: Boolean(entry.isFallback),
      metadata: { ...(entry.metadata || {}) },
    }));

  while (!roster.length && roster.length < targetCount) {
    const fallbackEntry = createFallbackWorldNpcEntry(normalizedLocationId, roster.length, targetState);
    roster.push({
      id: fallbackEntry.id,
      actor: { ...(fallbackEntry.actor || {}) },
      tag: fallbackEntry.tag || "",
      isFallback: true,
      metadata: { ...(fallbackEntry.metadata || {}) },
    });
  }

  roster.forEach((entry) => {
    const canTalk = !entry.isFallback && entry.metadata?.talkable !== false;
    entry.npcId = canTalk
      ? entry.id
      : "";
  });

  worldState.ambientNpcCache[normalizedLocationId] = {
    refreshKey,
    locationId: normalizedLocationId,
    roster: roster.map((entry) => ({
      ...entry,
      actor: entry.actor ? { ...entry.actor } : null,
      metadata: { ...(entry.metadata || {}) },
    })),
  };

  return cloneAmbientNpcSnapshot(worldState.ambientNpcCache[normalizedLocationId]);
}

function getLocationAmbientNpcActors(targetState = state, locationId = getCurrentLocationId(targetState), options = {}) {
  const snapshot = getLocationAmbientNpcSnapshot(targetState, locationId, options);
  const roster = Array.isArray(snapshot?.roster) ? snapshot.roster : [];
  return roster
    .map((entry) => ({
      ...(entry.actor || {}),
      npcId: entry.npcId || "",
      alt: entry.actor?.alt || entry.id || "ambient-npc",
    }))
    .filter((actor) => Boolean(actor.src));
}

function getAlleyNpcPool(targetState = state, locationId = getCurrentLocationId(targetState)) {
  const day = targetState?.day || getCurrentDayNumber();
  const locations = getDayWorldLocationMap(day);
  const pool = locations?.[locationId || ""]?.randomNpcPool;
  return Array.isArray(pool) ? pool : [];
}

function getActiveAlleyNpcConfig(targetState = state) {
  const worldState = syncWorldState(targetState);
  const currentLocationId = getCurrentLocationId(targetState);
  if (!worldState.alleyNpcVisible || !worldState.alleyNpcId || worldState.activeNpcLocationId !== currentLocationId) {
    return null;
  }

  return getAdjustedLocationNpcPool(targetState, currentLocationId).find((entry) => entry.id === worldState.alleyNpcId)
    || getAlleyNpcPool(targetState, currentLocationId).find((entry) => entry.id === worldState.alleyNpcId)
    || null;
}

function hasUsedLocationWander(locationId = getCurrentLocationId(state), targetState = state) {
  return false;
}

function markLocationWanderUsed(locationId = getCurrentLocationId(state), targetState = state) {
  if (!locationId) {
    return [];
  }

  const worldState = syncWorldState(targetState);
  if (!worldState.wanderedLocations.includes(locationId)) {
    worldState.wanderedLocations.push(locationId);
  }

  return worldState.wanderedLocations;
}

function setLocationWanderResult(locationId = "", title = "", lines = [], targetState = state) {
  const worldState = syncWorldState(targetState);
  worldState.wanderResult = {
    locationId: typeof locationId === "string" ? locationId : "",
    title: typeof title === "string" ? title : "",
    lines: Array.isArray(lines) ? lines.filter((line) => typeof line === "string") : [],
  };

  return worldState.wanderResult;
}

function setLocationWanderNpcId(locationId = "", npcId = "", targetState = state) {
  const normalizedLocationId = String(locationId || "").trim();
  if (!normalizedLocationId) {
    return "";
  }

  const worldState = syncWorldState(targetState);
  if (!worldState.wanderNpcByLocation || typeof worldState.wanderNpcByLocation !== "object") {
    worldState.wanderNpcByLocation = {};
  }

  worldState.wanderNpcByLocation[normalizedLocationId] = String(npcId || "").trim();
  return worldState.wanderNpcByLocation[normalizedLocationId];
}

function getLocationWanderNpcId(locationId = "", targetState = state) {
  const normalizedLocationId = String(locationId || "").trim();
  if (!normalizedLocationId) {
    return "";
  }

  return String(syncWorldState(targetState).wanderNpcByLocation?.[normalizedLocationId] || "").trim();
}

function clearWanderResultState(targetState = state) {
  return setLocationWanderResult("", "", [], targetState);
}

function resetLocationWanderState(targetState = state) {
  const worldState = syncWorldState(targetState);
  worldState.wanderedLocations = [];
  worldState.wanderNpcByLocation = {};
  clearWanderResultState(targetState);
  return worldState.wanderedLocations;
}

function canUseLocationWander(locationId = getCurrentLocationId(state), targetState = state) {
  if (!locationId) {
    return false;
  }

  const npcPool = getAdjustedLocationNpcPool(targetState, locationId);
  return npcPool.length > 0;
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
  worldState.activeNpcLocationId = "";
}

function clearPendingTravelState(targetState = state) {
  const worldState = syncWorldState(targetState);
  worldState.pendingTravelTarget = "";
  worldState.pendingTravelDistrict = "";
  worldState.pendingTravelSource = "";
  worldState.pendingTravelSourceLocationId = "";
  worldState.pendingTravelMinutes = 0;
  worldState.pendingTravelMethod = "";
}
