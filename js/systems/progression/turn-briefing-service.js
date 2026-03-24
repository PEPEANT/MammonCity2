function normalizeTurnBriefingEntry(entry = {}, fallbackDay = 1, fallbackIndex = 0) {
  const day = Math.max(1, Math.round(Number(entry?.day) || fallbackDay || 1));
  const id = String(entry?.id || `turn-event-${day}-${fallbackIndex + 1}`).trim()
    || `turn-event-${day}-${fallbackIndex + 1}`;
  const title = String(entry?.title || "").trim();
  const badge = String(entry?.badge || "").trim();
  const speaker = String(entry?.speaker || "다음날 요약").trim() || "다음날 요약";
  const tone = String(entry?.tone || "info").trim() || "info";
  const tags = Array.isArray(entry?.tags)
    ? entry.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
    : [];
  const lines = Array.isArray(entry?.lines)
    ? entry.lines.map((line) => String(line || "").trim()).filter(Boolean)
    : [];
  const normalizedLines = lines.length
    ? lines
    : (title ? [title] : []);

  return {
    id,
    day,
    badge,
    title: title || badge || "다음날 소식",
    speaker,
    tone,
    tags,
    lines: normalizedLines,
  };
}

function syncPendingTurnEvents(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return [];
  }

  targetState.pendingTurnEvents = Array.isArray(targetState.pendingTurnEvents)
    ? targetState.pendingTurnEvents.map((entry, index) =>
        normalizeTurnBriefingEntry(entry, Number(entry?.day) || Number(targetState.day) || 1, index)
      )
    : [];

  return targetState.pendingTurnEvents;
}

function syncTurnBriefingState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return null;
  }

  if (!targetState.turnBriefing || typeof targetState.turnBriefing !== "object") {
    targetState.turnBriefing = null;
    return null;
  }

  const day = Math.max(1, Math.round(Number(targetState.turnBriefing.day) || Number(targetState.day) || 1));
  const entries = Array.isArray(targetState.turnBriefing.entries)
    ? targetState.turnBriefing.entries.map((entry, index) => normalizeTurnBriefingEntry(entry, day, index))
    : [];

  if (!entries.length) {
    targetState.turnBriefing = null;
    return null;
  }

  targetState.turnBriefing = {
    day,
    currentIndex: Math.max(0, Math.min(entries.length - 1, Math.round(Number(targetState.turnBriefing.currentIndex) || 0))),
    entries,
  };

  return targetState.turnBriefing;
}

function queueNextTurnEvent(entry = {}, targetState = state, { dayOffset = 1, absoluteDay = null } = {}) {
  if (!targetState || typeof targetState !== "object") {
    return null;
  }

  const queue = syncPendingTurnEvents(targetState);
  const scheduledDay = absoluteDay != null
    ? Math.max(1, Math.round(Number(absoluteDay) || Math.max(1, Number(targetState.day) || 1)))
    : Math.max(1, Math.round(Number(targetState.day) || 1) + Math.max(0, Math.round(Number(dayOffset) || 0)));
  const normalized = normalizeTurnBriefingEntry({ ...entry, day: scheduledDay }, scheduledDay, queue.length);
  queue.push(normalized);
  return normalized;
}

function collectDueTurnEvents(targetState = state) {
  const queue = syncPendingTurnEvents(targetState);
  const currentDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const dueEntries = [];
  const futureEntries = [];

  queue.forEach((entry) => {
    if (entry.day <= currentDay) {
      dueEntries.push(entry);
      return;
    }
    futureEntries.push(entry);
  });

  targetState.pendingTurnEvents = futureEntries;
  return dueEntries;
}

function startTurnBriefing(entries = [], targetState = state) {
  const normalizedEntries = Array.isArray(entries)
    ? entries.map((entry, index) => normalizeTurnBriefingEntry(entry, Number(targetState?.day) || 1, index))
      .filter((entry) => entry.title || entry.lines.length)
    : [];

  if (!normalizedEntries.length) {
    targetState.turnBriefing = null;
    return false;
  }

  targetState.turnBriefing = {
    day: Math.max(1, Math.round(Number(targetState?.day) || 1)),
    currentIndex: 0,
    entries: normalizedEntries,
  };
  targetState.scene = "turn-briefing";
  targetState.headline = {
    badge: "",
    text: "",
  };
  return true;
}

function getActiveTurnBriefingEntry(targetState = state) {
  const briefing = syncTurnBriefingState(targetState);
  if (!briefing) {
    return null;
  }

  return briefing.entries[briefing.currentIndex] || briefing.entries[0] || null;
}

function advanceTurnBriefing(targetState = state) {
  const briefing = syncTurnBriefingState(targetState);
  if (!briefing) {
    targetState.scene = "room";
    renderGame();
    return false;
  }

  if (briefing.currentIndex < briefing.entries.length - 1) {
    briefing.currentIndex += 1;
    renderGame();
    return true;
  }

  const lastEntry = briefing.entries[briefing.entries.length - 1] || null;
  targetState.turnBriefing = null;
  targetState.scene = "room";
  targetState.headline = lastEntry
    ? {
        badge: lastEntry.badge || "다음날 소식",
        text: lastEntry.lines[lastEntry.lines.length - 1] || lastEntry.title || "",
      }
    : {
        badge: "",
        text: "",
      };
  renderGame();
  return true;
}
