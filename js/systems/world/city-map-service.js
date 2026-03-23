function getDayCityMapConfig(day = typeof getCurrentDayNumber === "function" ? getCurrentDayNumber() : 1) {
  return getDayWorldData(day)?.cityMap || null;
}

function getCityMapAnchorLocationId(locationId = "", targetState = state) {
  const day = targetState?.day || (typeof getCurrentDayNumber === "function" ? getCurrentDayNumber() : 1);
  const locations = getDayWorldLocationMap(day) || {};
  const currentLocation = locations[locationId] || null;

  if (!currentLocation) {
    return "";
  }

  if (currentLocation.mapNode && !currentLocation.cityMapHidden) {
    return locationId;
  }

  const anchorId = String(currentLocation.cityMapAnchorId || "").trim();
  if (anchorId && locations[anchorId]?.mapNode && !locations[anchorId]?.cityMapHidden) {
    return anchorId;
  }

  return "";
}

function getCurrentCityMapLocationId(targetState = state) {
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  return getCityMapAnchorLocationId(currentLocationId, targetState);
}

function canShowCityMapForState(targetState = state) {
  if (!targetState || targetState.scene !== "outside") {
    return false;
  }

  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";

  if (!currentLocationId || ["bus-ride", "walk-travel"].includes(currentLocationId)) {
    return false;
  }

  return getCityMapNodes(targetState).length > 0;
}

function getOutsideSceneActionOptions(locationConfig = null) {
  const sourceOptions = Array.isArray(locationConfig?.actions) && locationConfig.actions.length
    ? locationConfig.actions
    : (Array.isArray(locationConfig?.options) ? locationConfig.options : []);

  return sourceOptions
    .filter((option) => option && !(option.action === "move" && option.targetLocation))
    .map((option) => ({ ...option }));
}

function getCityMapNodes(targetState = state) {
  const day = targetState?.day || (typeof getCurrentDayNumber === "function" ? getCurrentDayNumber() : 1);
  const locations = getDayWorldLocationMap(day) || {};
  const worldState = typeof syncWorldState === "function"
    ? syncWorldState(targetState)
    : (targetState?.world || {});
  const currentMapLocationId = getCurrentCityMapLocationId(targetState);
  const unlockedLocations = Array.isArray(worldState?.unlockedLocations)
    ? worldState.unlockedLocations
    : [];

  return Object.entries(locations)
    .filter(([, location]) => location?.mapNode && !location.cityMapHidden)
    .map(([locationId, location]) => ({
      id: locationId,
      label: location.mapNode.shortLabel || location.label || locationId,
      fullLabel: location.label || location.mapNode.shortLabel || locationId,
      icon: location.mapNode.icon || "",
      x: Number(location.mapNode.x) || 0,
      y: Number(location.mapNode.y) || 0,
      zoneTone: location.mapNode.zoneTone || location.districtId || "default",
      note: location.mapNode.note || location.note || "",
      order: Number(location.mapNode.order) || 0,
      current: locationId === currentMapLocationId,
      unlocked: !unlockedLocations.length || unlockedLocations.includes(locationId),
      districtId: location.districtId || "",
    }))
    .sort((left, right) => left.order - right.order);
}

function getCityMapZones(targetState = state) {
  const config = getDayCityMapConfig(targetState?.day);
  const zones = Array.isArray(config?.zones) ? config.zones : [];

  return zones.map((zone) => ({
    id: zone.id || "",
    label: zone.label || zone.id || "",
    tone: zone.tone || zone.id || "default",
    x: Number(zone.x) || 0,
    y: Number(zone.y) || 0,
    width: Number(zone.width) || 20,
    height: Number(zone.height) || 20,
  }));
}

function normalizeCityMapLink(link = {}) {
  return {
    from: String(link.from || "").trim(),
    to: String(link.to || "").trim(),
    minutes: Math.max(4, Math.round(Number(link.minutes) || 0)),
    mode: link.mode === "bus" ? "bus" : "walk",
  };
}

function getCityMapLinks(targetState = state) {
  const config = getDayCityMapConfig(targetState?.day);
  const links = Array.isArray(config?.links) ? config.links : [];
  const nodeIds = new Set(getCityMapNodes(targetState).map((node) => node.id));

  return links
    .map(normalizeCityMapLink)
    .filter((link) => link.from && link.to && nodeIds.has(link.from) && nodeIds.has(link.to));
}

function buildCityMapGraph(targetState = state) {
  const graph = new Map();

  getCityMapLinks(targetState).forEach((link) => {
    if (!graph.has(link.from)) {
      graph.set(link.from, []);
    }
    if (!graph.has(link.to)) {
      graph.set(link.to, []);
    }

    graph.get(link.from).push({ ...link, next: link.to });
    graph.get(link.to).push({
      from: link.to,
      to: link.from,
      next: link.from,
      minutes: link.minutes,
      mode: link.mode,
    });
  });

  return graph;
}

function buildCityMapRouteText(pathIds = [], targetState = state) {
  if (!Array.isArray(pathIds) || !pathIds.length) {
    return "";
  }

  const locations = getDayWorldLocationMap(targetState?.day || 1) || {};
  return pathIds
    .map((locationId) => locations[locationId]?.mapNode?.shortLabel || locations[locationId]?.label || locationId)
    .join(" -> ");
}

function getCityMapArrivalClockLabel(totalMinutes = 0, targetState = state) {
  if (typeof formatClockTime !== "function") {
    return "";
  }

  const baseMinutes = ((Number(targetState?.timeSlot) || 0) * 30) + (Number(targetState?.timeMinuteOffset) || 0);
  const arrivalMinutes = Math.max(0, baseMinutes + Math.max(0, Math.round(Number(totalMinutes) || 0)));
  const arrivalSlot = Math.floor(arrivalMinutes / 30);
  const minuteOffset = arrivalMinutes % 30;
  return formatClockTime(arrivalSlot, minuteOffset);
}

function getCityMapTravelSummary(targetLocationId = "", targetState = state) {
  const day = targetState?.day || (typeof getCurrentDayNumber === "function" ? getCurrentDayNumber() : 1);
  const locations = getDayWorldLocationMap(day) || {};
  const nodes = getCityMapNodes(targetState);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  const currentAnchorId = getCurrentCityMapLocationId(targetState);
  const targetNode = nodeMap.get(targetLocationId) || null;

  if (!currentAnchorId || !targetNode || !locations[targetLocationId]) {
    return null;
  }

  if (currentAnchorId === targetLocationId) {
    return {
      canTravel: false,
      currentLocationId,
      currentAnchorId,
      targetLocationId,
      currentLabel: typeof getCurrentLocationLabel === "function" ? getCurrentLocationLabel(targetState) : currentAnchorId,
      targetLabel: targetNode.fullLabel || targetNode.label,
      reason: "already-there",
      minutes: 0,
      slots: 0,
      methodLabel: "",
      durationLabel: "",
      arrivalLabel: "",
      routeText: "",
      sceneId: "walk-travel",
      pathLocationIds: [currentAnchorId],
      pathModes: [],
    };
  }

  const graph = buildCityMapGraph(targetState);
  const queue = [{
    id: currentAnchorId,
    minutes: 0,
    path: [currentAnchorId],
    modes: [],
  }];
  const best = new Map([[currentAnchorId, 0]]);
  let bestRoute = null;

  while (queue.length) {
    queue.sort((left, right) => left.minutes - right.minutes);
    const current = queue.shift();

    if (!current) {
      break;
    }

    if (current.id === targetLocationId) {
      bestRoute = current;
      break;
    }

    const edges = graph.get(current.id) || [];
    edges.forEach((edge) => {
      const nextMinutes = current.minutes + edge.minutes;
      if (best.has(edge.next) && best.get(edge.next) <= nextMinutes) {
        return;
      }

      best.set(edge.next, nextMinutes);
      queue.push({
        id: edge.next,
        minutes: nextMinutes,
        path: [...current.path, edge.next],
        modes: [...current.modes, edge.mode],
      });
    });
  }

  if (!bestRoute) {
    const fallbackMinutes = typeof estimateWalkTravelMinutes === "function"
      ? estimateWalkTravelMinutes(currentAnchorId, targetLocationId, targetState)
      : 30;
    const durationLabel = typeof formatTravelDurationLabel === "function"
      ? formatTravelDurationLabel(fallbackMinutes)
      : `${fallbackMinutes}분`;
    return {
      canTravel: true,
      currentLocationId,
      currentAnchorId,
      targetLocationId,
      currentLabel: typeof getCurrentLocationLabel === "function" ? getCurrentLocationLabel(targetState) : currentAnchorId,
      targetLabel: targetNode.fullLabel || targetNode.label,
      minutes: fallbackMinutes,
      slots: Math.max(1, Math.ceil(fallbackMinutes / 30)),
      methodLabel: "도보",
      durationLabel,
      arrivalLabel: getCityMapArrivalClockLabel(fallbackMinutes, targetState),
      routeText: buildCityMapRouteText([currentAnchorId, targetLocationId], targetState),
      sceneId: "walk-travel",
      pathLocationIds: [currentAnchorId, targetLocationId],
      pathModes: ["walk"],
    };
  }

  const uniqueModes = [...new Set(bestRoute.modes)];
  const methodLabel = uniqueModes.length > 1
    ? "도보 + 버스"
    : (uniqueModes[0] === "bus" ? "버스" : "도보");
  const durationLabel = typeof formatTravelDurationLabel === "function"
    ? formatTravelDurationLabel(bestRoute.minutes)
    : `${bestRoute.minutes}분`;

  return {
    canTravel: true,
    currentLocationId,
    currentAnchorId,
    targetLocationId,
    currentLabel: typeof getCurrentLocationLabel === "function" ? getCurrentLocationLabel(targetState) : currentAnchorId,
    targetLabel: targetNode.fullLabel || targetNode.label,
    minutes: bestRoute.minutes,
    slots: Math.max(1, Math.ceil(bestRoute.minutes / 30)),
    methodLabel,
    durationLabel,
    arrivalLabel: getCityMapArrivalClockLabel(bestRoute.minutes, targetState),
    routeText: buildCityMapRouteText(bestRoute.path, targetState),
    sceneId: uniqueModes.length === 1 && uniqueModes[0] === "bus" ? "bus-ride" : "walk-travel",
    pathLocationIds: bestRoute.path,
    pathModes: bestRoute.modes,
  };
}
