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

function createDefaultWorldState(day = getCurrentDayNumber()) {
  const currentLocation = getDayHomeLocationId(day);
  const currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(currentLocation, day)
    : "";

  return {
    currentDistrict,
    currentLocation,
    unlockedDistricts: typeof getWorldInitialUnlockedDistrictIds === "function"
      ? getWorldInitialUnlockedDistrictIds(day)
      : (currentDistrict ? [currentDistrict] : []),
    unlockedLocations: typeof getWorldInitialUnlockedLocationIds === "function"
      ? getWorldInitialUnlockedLocationIds(day)
      : (currentLocation ? [currentLocation] : []),
    alleyNpcVisible: false,
    alleyNpcId: "",
    activeNpcLocationId: "",
    wanderedLocations: [],
    wanderResult: {
      locationId: "",
      title: "",
      lines: [],
    },
    pendingTravelTarget: "",
    pendingTravelDistrict: "",
    pendingTravelSource: "",
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
  const defaults = createDefaultWorldState(day);
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
  const unlockedLocations = typeof normalizeWorldIdList === "function"
    ? normalizeWorldIdList(worldState.unlockedLocations, Object.keys(locations || {}), defaults.unlockedLocations)
    : [...(defaults.unlockedLocations || [])];
  const wanderedLocations = typeof normalizeWorldIdList === "function"
    ? normalizeWorldIdList(worldState.wanderedLocations, Object.keys(locations || {}), defaults.wanderedLocations)
    : [];
  const wanderResult = worldState.wanderResult && typeof worldState.wanderResult === "object"
    ? worldState.wanderResult
    : {};

  if (currentDistrict && !unlockedDistricts.includes(currentDistrict)) {
    unlockedDistricts.push(currentDistrict);
  }
  if (currentLocation && !unlockedLocations.includes(currentLocation)) {
    unlockedLocations.push(currentLocation);
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
    wanderedLocations,
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

function getWalkTravelBackgroundForMinutes(totalMinutes = TIME_SLOT_MINUTES) {
  const normalizedMinutes = Math.max(TIME_SLOT_MINUTES, Math.round(Number(totalMinutes || TIME_SLOT_MINUTES)));

  if (normalizedMinutes > TIME_SLOT_MINUTES * 2) {
    return typeof DAY01_WORLD_WALKING_BACKGROUND_3 !== "undefined"
      ? DAY01_WORLD_WALKING_BACKGROUND_3
      : (typeof DAY01_WORLD_WALKING_BACKGROUND !== "undefined" ? DAY01_WORLD_WALKING_BACKGROUND : null);
  }

  if (normalizedMinutes > TIME_SLOT_MINUTES) {
    return typeof DAY01_WORLD_WALKING_BACKGROUND_2 !== "undefined"
      ? DAY01_WORLD_WALKING_BACKGROUND_2
      : (typeof DAY01_WORLD_WALKING_BACKGROUND !== "undefined" ? DAY01_WORLD_WALKING_BACKGROUND : null);
  }

  return typeof DAY01_WORLD_WALKING_BACKGROUND !== "undefined"
    ? DAY01_WORLD_WALKING_BACKGROUND
    : null;
}

function estimateWalkTravelMinutes(fromLocationId = "", toLocationId = "", targetState = state) {
  const day = targetState?.day || getCurrentDayNumber();
  const fromDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(fromLocationId, day)
    : "";
  const toDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(toLocationId, day)
    : "";

  const nearbyResidentialStops = new Set(["apt-alley", "bus-stop", "bus-stop-map"]);
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

  return getAlleyNpcPool(targetState, currentLocationId).find((entry) => entry.id === worldState.alleyNpcId) || null;
}

function hasUsedLocationWander(locationId = getCurrentLocationId(state), targetState = state) {
  if (!locationId) {
    return false;
  }

  return syncWorldState(targetState).wanderedLocations.includes(locationId);
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

function clearWanderResultState(targetState = state) {
  return setLocationWanderResult("", "", [], targetState);
}

function resetLocationWanderState(targetState = state) {
  const worldState = syncWorldState(targetState);
  worldState.wanderedLocations = [];
  clearWanderResultState(targetState);
  return worldState.wanderedLocations;
}

function canUseLocationWander(locationId = getCurrentLocationId(state), targetState = state) {
  if (!locationId) {
    return false;
  }

  const npcPool = getAlleyNpcPool(targetState, locationId);
  return npcPool.length > 0 && !hasUsedLocationWander(locationId, targetState);
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
  worldState.pendingTravelMinutes = 0;
  worldState.pendingTravelMethod = "";
}
