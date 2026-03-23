function createDefaultMemoryState() {
  return {
    panelOpen: false,
    entries: [],
  };
}

function normalizeMemoryRetention(retention = "") {
  return String(retention || "").trim() === "ending" ? "ending" : "volatile";
}

function getMemoryContextKey(targetState = state) {
  const day = Number.isFinite(targetState?.day) ? targetState.day : 1;
  const scene = String(targetState?.scene || "unknown");
  const locationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState) || ""
    : "";
  const phoneRoute = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(targetState?.phoneView || "home")
    : String(targetState?.phoneView || "");

  return [day, scene, locationId, phoneRoute].join(":");
}

function pruneExpiredVolatileMemoryEntries(targetState = state, contextKey = getMemoryContextKey(targetState)) {
  const memoryState = syncMemoryState(targetState);
  memoryState.entries = memoryState.entries.filter((entry) => {
    const retention = normalizeMemoryRetention(entry?.retention);
    if (retention === "ending") {
      return true;
    }

    return String(entry?.contextKey || "") === contextKey;
  });

  return memoryState.entries;
}

function clearVolatileMemoryEntries(targetState = state) {
  const memoryState = syncMemoryState(targetState);
  memoryState.entries = memoryState.entries.filter((entry) => normalizeMemoryRetention(entry?.retention) === "ending");
  return memoryState.entries;
}

function syncMemoryState(targetState = state) {
  if (!targetState) {
    return createDefaultMemoryState();
  }

  const defaults = createDefaultMemoryState();
  const memoryState = targetState.memory && typeof targetState.memory === "object"
    ? targetState.memory
    : {};
  const entries = Array.isArray(memoryState.entries)
    ? memoryState.entries.map((entry) => ({
        ...entry,
        tags: Array.isArray(entry?.tags) ? [...entry.tags] : [],
        retention: normalizeMemoryRetention(entry?.retention),
        contextKey: typeof entry?.contextKey === "string" ? entry.contextKey : "",
      }))
    : [];

  targetState.memory = {
    ...defaults,
    ...memoryState,
    panelOpen: Boolean(memoryState.panelOpen),
    entries,
  };

  return targetState.memory;
}

function getMemoryTimestamp(targetState = state) {
  const day = Number.isFinite(targetState?.day) ? targetState.day : 1;
  const timeText = typeof formatClockTime === "function"
    ? formatClockTime(targetState?.timeSlot, targetState?.timeMinuteOffset || 0)
    : "08:00";
  return `${typeof formatTurnBadge === "function" ? formatTurnBadge(day) : `TURN ${String(day).padStart(2, "0")}`} · ${timeText}`;
}

function recordMemoryEntry(entry = {}, targetState = state) {
  if (!targetState || !entry || (!entry.title && !entry.body)) {
    return null;
  }

  const contextKey = getMemoryContextKey(targetState);
  pruneExpiredVolatileMemoryEntries(targetState, contextKey);

  if (entry.flushTransient !== false) {
    clearVolatileMemoryEntries(targetState);
  }

  const retention = normalizeMemoryRetention(entry.retention);
  const memoryState = syncMemoryState(targetState);
  const normalizedEntry = {
    id: entry.id || `memory-${Date.now()}-${memoryState.entries.length + 1}`,
    type: entry.type || "note",
    title: entry.title || "기억",
    body: entry.body || "",
    source: entry.source || "",
    timestamp: entry.timestamp || getMemoryTimestamp(targetState),
    day: Number.isFinite(entry.day) ? entry.day : (targetState.day || 1),
    tags: Array.isArray(entry.tags) ? [...entry.tags] : [],
    retention,
    contextKey: retention === "ending" ? "" : contextKey,
  };

  memoryState.entries.unshift(normalizedEntry);
  memoryState.entries = memoryState.entries.slice(0, 64);
  return normalizedEntry;
}

function toggleMemoryPanel(forceOpen, targetState = state) {
  const memoryState = syncMemoryState(targetState);
  memoryState.panelOpen = typeof forceOpen === "boolean"
    ? forceOpen
    : !memoryState.panelOpen;
  return memoryState.panelOpen;
}

function closeMemoryPanel(targetState = state) {
  return toggleMemoryPanel(false, targetState);
}

function getMemoryEntries(targetState = state) {
  pruneExpiredVolatileMemoryEntries(targetState);
  return syncMemoryState(targetState).entries;
}
