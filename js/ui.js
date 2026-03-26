var ui = window.ui || {};
window.ui = ui;

const phoneScrollState = {
  panel: {},
  stage: {},
};

let lastPhoneUiScrollAt = 0;

function getPhoneScrollRouteKey(route = "home") {
  if (typeof normalizePhoneRoute === "function") {
    return normalizePhoneRoute(route);
  }

  return String(route || "home");
}

function rememberPhoneScrollPosition(scope, route, scrollTop = 0) {
  const bucket = scope === "stage" ? phoneScrollState.stage : phoneScrollState.panel;
  bucket[getPhoneScrollRouteKey(route)] = Math.max(0, Number(scrollTop) || 0);
}

function readPhoneScrollPosition(scope, route) {
  const bucket = scope === "stage" ? phoneScrollState.stage : phoneScrollState.panel;
  return Math.max(0, Number(bucket[getPhoneScrollRouteKey(route)]) || 0);
}

function handlePhoneScrollableInteraction(event) {
  const scrollHost = event.target?.closest?.("#phone-app-screen, .phone-stage-app-screen");
  if (!scrollHost) {
    return;
  }

  const scope = scrollHost.id === "phone-app-screen" ? "panel" : "stage";
  rememberPhoneScrollPosition(scope, state?.phoneView || "home", scrollHost.scrollTop);
  lastPhoneUiScrollAt = Date.now();
}

function shouldDeferPhoneUiRerender() {
  return Date.now() - lastPhoneUiScrollAt < 240;
}

function getPhoneRouteScreenMode(route, targetState = state) {
  if (typeof parsePhoneRoute !== "function" || typeof getPhoneAppManifest !== "function") {
    return "";
  }

  const routeInfo = parsePhoneRoute(route);
  const manifest = getPhoneAppManifest(routeInfo.appId, targetState);
  return String(manifest?.screenMode || "").trim();
}

function cacheUi() {
  ui.game = document.getElementById("game");
  ui.playerDisplay = document.getElementById("player-display");
  ui.dayDisplay = document.getElementById("day-display");
  ui.moneyDisplay = document.getElementById("money-display");
  ui.bankDisplay = document.getElementById("bank-display");
  ui.staminaDisplay = document.getElementById("stamina-display");
  ui.energyDisplay = document.getElementById("energy-display");
  ui.hungerDisplay = document.getElementById("hunger-display");
  ui.timeDisplay = document.getElementById("time-display");
  ui.progressbar = document.getElementById("progressbar");
  ui.headlineStrip = document.getElementById("headline-strip");
  ui.headlineBadge = document.getElementById("headline-badge");
  ui.headlineText = document.getElementById("headline-text");
  ui.gameplayFeedback = document.getElementById("gameplay-feedback");
  ui.memoryButton = document.getElementById("memory-button");
  ui.memoryCount = document.getElementById("memory-count");
  ui.memoryPanel = document.getElementById("memory-panel");
  ui.memoryList = document.getElementById("memory-list");
  ui.memoryCloseButton = document.getElementById("memory-close-button");
  ui.inventoryButton = document.getElementById("inventory-button");
  ui.inventoryCount = document.getElementById("inventory-count");
  ui.inventoryPanel = document.getElementById("inventory-panel");
  ui.inventorySummary = document.getElementById("inventory-summary");
  ui.inventoryTabs = document.getElementById("inventory-tabs");
  ui.inventoryList = document.getElementById("inventory-list");
  ui.inventoryCloseButton = document.getElementById("inventory-close-button");
  ui.characterButton = document.getElementById("character-button");
  ui.characterPanel = document.getElementById("character-panel");
  ui.characterStats = document.getElementById("character-stats");
  ui.characterCloseButton = document.getElementById("character-close-button");
  ui.bg = document.getElementById("bg");
  ui.buildings = document.getElementById("buildings");
  ui.outsideGoal = document.getElementById("outside-goal");
  ui.actorsLayer = document.getElementById("actors-layer");
  ui.character = document.getElementById("character");
  ui.speaker = document.getElementById("speaker");
  ui.message = document.getElementById("message");
  ui.sceneTags = document.getElementById("scene-tags");
  ui.choices = document.getElementById("choices");
  ui.trashGameLayer = document.getElementById("trash-game-layer");
  ui.trashItems = document.getElementById("trash-items");
  ui.trashRemaining = document.getElementById("trash-remaining");
  ui.jobMiniGameLayer = document.getElementById("job-minigame-layer");
  ui.jobMiniGameItems = document.getElementById("job-minigame-items");
  ui.jobMiniGameTitle = document.getElementById("job-minigame-title");
  ui.jobMiniGameNote = document.getElementById("job-minigame-note");
  ui.jobMiniGameProgress = document.getElementById("job-minigame-progress");
  ui.moneyEffect = document.getElementById("money-effect");
  ui.startScreen = document.getElementById("start-screen");
  ui.startKicker = ui.startScreen?.querySelector(".start-kicker") || null;
  ui.startTitle = ui.startScreen?.querySelector(".start-title") || null;
  ui.startSub = ui.startScreen?.querySelector(".start-sub") || null;
  ui.startBody = ui.startScreen?.querySelector(".start-body") || null;
  ui.startHighlights = ui.startScreen?.querySelector(".start-highlights") || null;
  ui.nameInput = document.getElementById("name-input");
  ui.continueButton = document.getElementById("continue-button");
  ui.rankingPreviewButton = document.getElementById("ranking-preview-button");
  ui.startButton = document.getElementById("start-button");
  ui.startRankingPanels = Array.from(document.querySelectorAll("[data-start-ranking-panel]"));
  ui.startOriginPanel = document.getElementById("start-origin-panel");
  ui.spoonDrawOverlay = document.getElementById("spoon-draw-overlay");
  ui.spdCapsule = document.getElementById("spd-capsule");
  ui.spdEmblem = document.getElementById("spd-emblem");
  ui.spdRing = document.getElementById("spd-ring");
  ui.spdOdds = document.getElementById("spd-odds");
  ui.spdResultArea = document.getElementById("spd-result-area");
  ui.spdResultBracket = document.getElementById("spd-result-bracket");
  ui.spdResultName = document.getElementById("spd-result-name");
  ui.spdResultSummary = document.getElementById("spd-result-summary");
  ui.spdResultChips = document.getElementById("spd-result-chips");
  ui.spdDrawBtn = document.getElementById("spd-draw-btn");
  ui.spdStartBtn = document.getElementById("spd-start-btn");
  ui.startOriginMachine = document.getElementById("start-origin-machine");
  ui.startOriginEmblem = document.getElementById("start-origin-emblem");
  ui.startOriginSpoon = document.getElementById("start-origin-spoon");
  ui.startOriginKicker = document.getElementById("start-origin-kicker");
  ui.startOriginName = document.getElementById("start-origin-name");
  ui.startOriginDesc = document.getElementById("start-origin-desc");
  ui.startOriginMeta = document.getElementById("start-origin-meta");
  ui.rankingSubtitle = document.querySelector(".ranking-subtitle");
  ui.phonePanel = document.getElementById("phone-panel");
  ui.phoneStage = document.getElementById("phone-stage");
  ui.phoneFocusDim = document.getElementById("phone-focus-dim");
  ui.textbox = document.getElementById("textbox");
  ui.phoneControls = document.getElementById("phone-controls");
  ui.phoneStageButton = document.getElementById("phone-stage-btn");
  ui.cityMapToggleButton = document.getElementById("city-map-toggle-btn");
  ui.phoneBackButton = document.getElementById("phone-back-btn");
  ui.phoneLockedBadge = document.getElementById("phone-locked-badge");
  ui.phoneTimeDisplay = document.getElementById("phone-time-display");
  ui.phoneStatusSignal = document.getElementById("phone-status-signal");
  ui.phoneDayChip = document.getElementById("phone-day-chip");
  ui.phoneApps = document.getElementById("phone-apps");
  ui.phoneHeaderSub = document.getElementById("phone-hd-sub");
  ui.phoneAppScreen = document.getElementById("phone-app-screen");
  ui.phonePreview = document.getElementById("phone-preview");
  ui.phonePreviewKicker = document.getElementById("phone-preview-kicker");
  ui.phonePreviewState = document.getElementById("phone-preview-state");
  ui.phonePreviewTitle = document.getElementById("phone-preview-title");
  ui.phonePreviewBody = document.getElementById("phone-preview-body");
  ui.phoneToggleButton = document.getElementById("phone-home-btn");
  ui.rankingScreen = document.getElementById("ranking-screen");
  ui.rankingList = document.getElementById("ranking-list");
  ui.rankingMyCard = document.getElementById("ranking-my-card");
  ui.rankingCloseBtn = document.getElementById("ranking-close-btn");
  ui.rankingRestartBtn = document.getElementById("ranking-restart-btn");
  ui.settlementScreen = document.getElementById("settlement-screen");
  ui.settlementTitleText = document.getElementById("settlement-title-text");
  ui.settlementRows = document.getElementById("settlement-rows");
  ui.settlementRankArea = document.getElementById("settlement-rank-area");
  ui.settlementActions = document.getElementById("settlement-actions");
  if (ui.rankingCloseBtn) {
    ui.rankingCloseBtn.addEventListener("click", () => {
      closeRankingScreen();
    });
  }
  if (ui.rankingRestartBtn) {
    ui.rankingRestartBtn.addEventListener("click", () => {
      if (typeof stopRankingRealtimeSubscription === "function") {
        stopRankingRealtimeSubscription();
      }
      if (typeof restartToTitle === "function") restartToTitle();
      closeRankingScreen();
    });
  }
  setupTitleScreenUi();
  buildBuildings();
}

const sceneTextProgress = {
  activeKey: "",
  progressByKey: {},
};
let revealAllSceneTextOnNextRender = false;

function markSceneTextForImmediateReveal() {
  revealAllSceneTextOnNextRender = true;
}

function consumePendingSceneTextReveal() {
  if (!revealAllSceneTextOnNextRender) {
    return false;
  }

  revealAllSceneTextOnNextRender = false;
  return true;
}

function syncTextboxContentState() {
  if (!ui.textbox) {
    return;
  }

  const hasChoices = Boolean(ui.choices?.childElementCount);
  const hasMessage = Boolean(ui.message?.textContent?.trim());
  const hasSpeaker = Boolean(ui.speaker?.textContent?.trim());

  ui.textbox.classList.toggle("has-message", hasMessage);
  ui.textbox.classList.toggle("has-choices", hasChoices);
  ui.textbox.classList.toggle("is-choice-only", hasChoices);
  ui.textbox.classList.toggle("is-message-only", hasMessage && !hasChoices);
  ui.textbox.classList.toggle("has-speaker", hasSpeaker && hasMessage && !hasChoices);
  syncHeadlineVisibility();
}

function setTextboxAdvanceState(canAdvance = false) {
  if (!ui.textbox) {
    return;
  }

  ui.textbox.classList.toggle("is-awaiting-advance", canAdvance);
}

function buildSceneTextProgressKey(sceneKey = "", title = "", lines = []) {
  const resolvedTitle = resolveDynamicText(title);
  const resolvedLines = (lines || []).map(resolveDynamicText);

  return [String(sceneKey || "").trim(), resolvedTitle, ...resolvedLines].join("||");
}

function getSceneTextProgressState(progressKey, resolvedLines = []) {
  const lineCount = resolvedLines.length;

  if (!progressKey || lineCount <= 1) {
    sceneTextProgress.activeKey = progressKey || "";
    if (progressKey) {
      sceneTextProgress.progressByKey[progressKey] = {
        lineIndex: Math.max(0, lineCount - 1),
        lineCount,
      };
    }

    return {
      visibleLines: resolvedLines,
      canAdvance: false,
      choicesReady: true,
    };
  }

  sceneTextProgress.activeKey = progressKey;

  if (!sceneTextProgress.progressByKey[progressKey]) {
    sceneTextProgress.progressByKey[progressKey] = {
      lineIndex: 0,
      lineCount,
    };
  }

  const progressEntry = sceneTextProgress.progressByKey[progressKey];
  progressEntry.lineCount = lineCount;
  progressEntry.lineIndex = Math.min(progressEntry.lineIndex, Math.max(0, lineCount - 1));

  const visibleLines = resolvedLines.slice(0, progressEntry.lineIndex + 1);
  const canAdvance = progressEntry.lineIndex < lineCount - 1;

  return {
    visibleLines,
    canAdvance,
    choicesReady: !canAdvance,
  };
}

function canAdvanceSceneText() {
  const activeKey = sceneTextProgress.activeKey;
  if (!activeKey) {
    return false;
  }

  const progressEntry = sceneTextProgress.progressByKey[activeKey];
  return Boolean(progressEntry && progressEntry.lineCount > 1 && progressEntry.lineIndex < progressEntry.lineCount - 1);
}

function resetSceneTextProgress(progressKey = "") {
  const normalizedKey = String(progressKey || "").trim();
  if (!normalizedKey) {
    sceneTextProgress.activeKey = "";
    return;
  }

  delete sceneTextProgress.progressByKey[normalizedKey];
  if (sceneTextProgress.activeKey === normalizedKey) {
    sceneTextProgress.activeKey = "";
  }
}

function resetSceneTextProgressByPrefix(prefix = "") {
  const normalizedPrefix = String(prefix || "").trim();
  if (!normalizedPrefix) {
    return;
  }

  Object.keys(sceneTextProgress.progressByKey).forEach((key) => {
    if (!key.startsWith(normalizedPrefix)) {
      return;
    }
    delete sceneTextProgress.progressByKey[key];
    if (sceneTextProgress.activeKey === key) {
      sceneTextProgress.activeKey = "";
    }
  });
}

function advanceSceneText() {
  if (!canAdvanceSceneText()) {
    return false;
  }

  const progressEntry = sceneTextProgress.progressByKey[sceneTextProgress.activeKey];
  if (!progressEntry) {
    return false;
  }

  progressEntry.lineIndex += 1;
  renderGame();
  return true;
}


function setupStartScreenLegacy() {
  ui.startCard = ui.startScreen.querySelector(".start-card");

  const kicker = ui.startKicker;
  const title = ui.startTitle;
  const sub = ui.startSub;
  const body = ui.startBody;
  if (kicker) {
    kicker.textContent = `현재 ${MAX_DAYS}턴 프로토타입`;
  }
  title.textContent = "\ubc30\uae08\ub3c4\uc2dc";
  sub.textContent = "\ud3f0 \uacf5\uace0\ub97c \ub4a4\uc9c0\uace0, \ub2e4\uc74c \ud134 \ucd9c\uadfc\uc744 \uc608\uc57d\ud558\uace0, \ubc84\ud2f4 \ud558\ub8e8\ub97c \ud604\uae08\uc73c\ub85c \ubc14\uafb8\ub294 \ub3c4\uc2dc \uc0dd\uc874 \uc2dc\ubbac\ub808\uc774\uc158.";
  if (body) {
    body.textContent = `1\ud134 \ud504\ub864\ub85c\uadf8\uc640 \ubc29\uccad\uc18c, \uc2a4\ub9c8\ud2b8\ud3f0 \uacf5\uace0 \uc9c0\uc6d0, \uc608\uc57d \ucd9c\uadfc, \ubc14\uae65 \uc774\ub3d9, \uae30\uc5b5 \ub85c\uadf8, ${MAX_DAYS}\ud134 \uacb0\uc0b0 \ub7ad\ud0b9\uae4c\uc9c0 \uc774\uc5b4\uc9d1\ub2c8\ub2e4.`;
  }
  ui.nameInput.placeholder = "\ub2c9\ub124\uc784";
  ui.nameInput.autocomplete = "off";
  ui.startButton.textContent = "새로하기";
  if (ui.continueButton) {
    ui.continueButton.textContent = "이어하기";
    ui.continueButton.hidden = true;
  }
  if (ui.rankingSubtitle) {
    ui.rankingSubtitle.textContent = `${MAX_DAYS}\ud134 \ucd5c\uc885 \ubcf4\uc720 \uc790\uae08 \ub7ad\ud0b9`;
  }
}


function setStartScreenSaveState(_hasSave = false) {
  if (ui.continueButton) {
    ui.continueButton.hidden = !_hasSave;
  }

  if (ui.startButton) {
    ui.startButton.textContent = "새로하기";
  }
}

function formatStartScreenCash(amount = 0) {
  return `${Math.max(0, Math.round(Number(amount) || 0)).toLocaleString("ko-KR")}원`;
}

function buildStartRankingEntries() {
  const baseTierIds = ["gold", "silver", "dirt"];
  return baseTierIds.map((tierId, index) => {
    const tier = typeof getSpoonStartTier === "function"
      ? getSpoonStartTier(tierId)
      : null;
    const visualTierId = typeof getSpoonStartVisualTierId === "function"
      ? getSpoonStartVisualTierId(tier?.id || tierId)
      : "";
    const homeConfig = typeof getSpoonStartHomeConfigByVisualTierId === "function"
      ? getSpoonStartHomeConfigByVisualTierId(visualTierId)
      : null;
    const tierLabel = String(tier?.name || `${tierId}수저`).trim();
    const pointLabel = String(homeConfig?.residenceLabel || "시작점 미정").trim();
    const bracket = String(tier?.bracket || "").trim();
    const summary = String(tier?.summary || "").trim();

    return {
      tierId: String(tier?.id || tierId).trim().toLowerCase(),
      rank: index + 1,
      rankLabel: `${index + 1}위`,
      tierLabel,
      pointLabel,
      desc: [bracket, summary].filter(Boolean).join(" · ") || `${tierLabel} 출발선`,
      accent: tier?.accent || "#cbd5e1",
      accentSoft: tier?.accentSoft || "rgba(203, 213, 225, 0.14)",
    };
  });
}

function renderStartRankingPanels({ phase = "idle", tier = null } = {}) {
  if (!Array.isArray(ui.startRankingPanels) || !ui.startRankingPanels.length) {
    return;
  }

  const entries = buildStartRankingEntries();
  const normalizedTierId = typeof normalizeSpoonStartTierId === "function"
    ? normalizeSpoonStartTierId(tier?.id || "")
    : String(tier?.id || "").trim().toLowerCase();
  const activeEntry = entries.find((entry) => entry.tierId === normalizedTierId) || null;
  const accent = activeEntry?.accent || tier?.accent || "#cbd5e1";
  const accentSoft = activeEntry?.accentSoft || tier?.accentSoft || "rgba(203, 213, 225, 0.14)";
  const badgeText = activeEntry
    ? activeEntry.tierLabel
    : (phase === "drawing" ? "결정 중" : "수저 미정");
  const rankText = activeEntry
    ? activeEntry.rankLabel
    : (phase === "drawing" ? "..." : "미정");
  const pointText = activeEntry
    ? activeEntry.pointLabel
    : (phase === "drawing" ? "출발선을 정하는 중" : "수저를 뽑아 결정");
  const descText = activeEntry
    ? activeEntry.desc
    : (phase === "drawing"
      ? "수저 결과에 따라 시작점과 출발선 순위가 계속 바뀝니다."
      : "게임 시작 전에 출발선이 확정됩니다.");
  const footText = activeEntry
    ? `시작점 ${activeEntry.pointLabel}`
    : "시작점 미정";
  const listMarkup = entries.map((entry) => `
    <div class="start-ranking-item${entry.tierId === normalizedTierId ? " is-active" : ""}">
      <div class="start-ranking-item-rank">#${entry.rank}</div>
      <div class="start-ranking-item-body">
        <div class="start-ranking-item-name">${escapeHtml(entry.tierLabel)} · ${escapeHtml(entry.pointLabel)}</div>
        <div class="start-ranking-item-note">${escapeHtml(entry.desc)}</div>
      </div>
    </div>
  `).join("");

  ui.startRankingPanels.forEach((panel) => {
    panel.dataset.phase = phase;
    panel.dataset.tier = normalizedTierId || "";
    panel.style.setProperty("--start-ranking-accent", accent);
    panel.style.setProperty("--start-ranking-accent-soft", accentSoft);

    const rankElement = panel.querySelector("[data-start-ranking-rank]");
    const tierElement = panel.querySelector("[data-start-ranking-tier]");
    const pointElement = panel.querySelector("[data-start-ranking-point]");
    const descElement = panel.querySelector("[data-start-ranking-desc]");
    const listElement = panel.querySelector("[data-start-ranking-list]");
    const footElement = panel.querySelector("[data-start-ranking-foot]");

    if (rankElement) rankElement.textContent = rankText;
    if (tierElement) tierElement.textContent = badgeText;
    if (pointElement) pointElement.textContent = pointText;
    if (descElement) descElement.textContent = descText;
    if (listElement) listElement.innerHTML = listMarkup;
    if (footElement) footElement.textContent = footText;
  });
}

function getStartScreenEnteredName() {
  return String(ui.nameInput?.value || "").trim();
}

function renderStartScreenDrawState(hasSave = false) {
  const drawState = typeof getStartScreenDrawState === "function"
    ? getStartScreenDrawState()
    : { screenMode: "intro", phase: "idle", previewTierId: "", resultTierId: "" };
  const screenMode = drawState.screenMode === "origin" ? "origin" : "intro";
  const inOriginScreen = screenMode === "origin";
  const enteredName = getStartScreenEnteredName();
  const hasEnteredName = enteredName.length > 0;
  const activeTierId = drawState.resultTierId || drawState.previewTierId || "";
  const tier = typeof getSpoonStartTier === "function"
    ? getSpoonStartTier(activeTierId)
    : null;
  const theme = typeof getSpoonStartVisualTheme === "function"
    ? getSpoonStartVisualTheme(activeTierId)
    : {
        accent: "#94a3b8",
        accentSoft: "rgba(148, 163, 184, 0.14)",
        glow: "rgba(148, 163, 184, 0.22)",
        screenOverlay: "linear-gradient(180deg, rgba(22, 25, 35, 0.22) 0%, rgba(8, 10, 18, 0.62) 100%)",
      };

  if (ui.startScreen) {
    ui.startScreen.dataset.screenMode = screenMode;
    ui.startScreen.dataset.phase = drawState.phase || "idle";
    ui.startScreen.dataset.tier = tier?.id || "";
    ui.startScreen.style.setProperty("--start-origin-accent", theme.accent || "#94a3b8");
    ui.startScreen.style.setProperty("--start-origin-accent-soft", theme.accentSoft || "rgba(148, 163, 184, 0.14)");
    ui.startScreen.style.setProperty("--start-origin-glow", theme.glow || "rgba(148, 163, 184, 0.22)");
    ui.startScreen.style.setProperty("--start-origin-screen-overlay", theme.screenOverlay || "linear-gradient(180deg, rgba(22, 25, 35, 0.22) 0%, rgba(8, 10, 18, 0.62) 100%)");
  }

  if (ui.startCard) {
    ui.startCard.dataset.screenMode = screenMode;
    ui.startCard.dataset.phase = drawState.phase || "idle";
    ui.startCard.dataset.tier = tier?.id || "";
  }

  if (ui.startOriginPanel) {
    ui.startOriginPanel.dataset.phase = drawState.phase || "idle";
    ui.startOriginPanel.dataset.tier = tier?.id || "";
    ui.startOriginPanel.hidden = !inOriginScreen;
  }

  if (ui.startKicker) ui.startKicker.hidden = inOriginScreen;
  if (ui.startTitle) ui.startTitle.hidden = inOriginScreen;
  if (ui.startSub) ui.startSub.hidden = inOriginScreen;
  if (ui.startBody) ui.startBody.hidden = inOriginScreen;
  if (ui.startHighlights) ui.startHighlights.hidden = inOriginScreen;
  if (ui.nameInput) ui.nameInput.hidden = inOriginScreen;

  if (ui.startOriginMachine) {
    ui.startOriginMachine.dataset.phase = drawState.phase || "idle";
    ui.startOriginMachine.dataset.tier = tier?.id || "";
  }

  if (ui.startOriginEmblem) {
    ui.startOriginEmblem.textContent = drawState.phase === "idle"
      ? "?"
      : (tier?.emblem || "?");
  }

  if (ui.startOriginSpoon) {
    ui.startOriginSpoon.textContent = drawState.phase === "idle" ? "🥄" : "🥄";
  }

  if (ui.startOriginKicker) {
    ui.startOriginKicker.textContent = drawState.phase === "result"
      ? (tier?.bracket || "출생 패키지")
      : (drawState.phase === "drawing" ? "출생 결정 중" : "출생 패키지");
  }

  if (ui.startOriginName) {
    ui.startOriginName.textContent = drawState.phase === "idle"
      ? "수저를 뽑아 시작을 정한다"
      : (tier?.name || "결정 중");
  }

  if (ui.startOriginDesc) {
    if (drawState.phase === "drawing") {
      ui.startOriginDesc.textContent = "수저를 섞는 중입니다. 이번 출발은 한 번만 정해집니다.";
    } else if (drawState.phase === "result" && tier) {
      ui.startOriginDesc.textContent = tier.summary || "출생 패키지가 확정됐습니다.";
    } else {
      ui.startOriginDesc.textContent = "새 게임마다 한 번만 정합니다. 결과에 따라 손 현금, 계좌, 시작 자산과 첫 방 톤이 달라집니다.";
    }
  }

  if (ui.startOriginMeta) {
    if (drawState.phase === "result" && tier) {
      const packageChips = typeof getSpoonStartPackageChipLabels === "function"
        ? getSpoonStartPackageChipLabels(tier)
        : [];
      ui.startOriginMeta.innerHTML = `
        ${packageChips.map((label) => `<span class="start-origin-chip">${escapeHtml(label)}</span>`).join("")}
        <span class="start-origin-chip">행복도 ${escapeHtml(String(tier.startHappiness))}</span>
      `;
    } else if (drawState.phase === "drawing" && tier) {
      ui.startOriginMeta.innerHTML = `
        <span class="start-origin-chip">확률 셔플 중</span>
        <span class="start-origin-chip">${escapeHtml(tier.name)}</span>
      `;
    } else {
      ui.startOriginMeta.innerHTML = `
        <span class="start-origin-chip">금 5%</span>
        <span class="start-origin-chip">은 25%</span>
        <span class="start-origin-chip">흙 70%</span>
      `;
    }
  }

  renderStartRankingPanels({
    phase: drawState.phase || "idle",
    tier,
  });

  if (ui.startButton) {
    ui.startButton.hidden = false;
    ui.startButton.disabled = !hasEnteredName;
    ui.startButton.textContent = "새로하기";
  }

  if (ui.continueButton) {
    ui.continueButton.textContent = "이어하기";
    ui.continueButton.hidden = !hasSave;
  }
}

function setSceneSpeaker(text) {
  const resolved = text || "";
  ui.playerDisplay.textContent = resolved;
  ui.speaker.textContent = resolved;
  syncTextboxContentState();
}

function getPhonePanelState() {
  if (typeof createPhoneShellViewModel === "function") {
    return createPhoneShellViewModel(state);
  }

  const jobsState = typeof getJobsDomainState === "function"
    ? getJobsDomainState(state)
    : (state.jobs || {});
  const unlocked = Boolean(state.hasPhone);
  const usedToday = Boolean(state.phoneUsedToday);
  const minimized = Boolean(state.phoneMinimized);
  const phoneView = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(state.phoneView || "home")
    : (state.phoneView || "home");
  const preview = state.phonePreview || {};
  const phoneTime = typeof getSceneTimeText === "function" ? getSceneTimeText() : "08:00";
  const canUseApps = typeof canUsePhoneApps === "function" ? canUsePhoneApps() : unlocked;
  const canOpenStage = typeof canOpenPhoneStage === "function"
    ? canOpenPhoneStage()
    : (unlocked && !minimized && canUseApps);
  const hasShiftToday = Boolean(jobsState.scheduledShift && jobsState.scheduledShift.day === state.day);
  const hasBookedShift = Boolean(jobsState.scheduledShift && jobsState.scheduledShift.day > state.day);
  const jobAppliedToday = Boolean(jobsState.applicationDoneToday);
  const stageExpanded = Boolean(state.phoneStageExpanded) && canOpenStage;
  const routeInfo = typeof parsePhoneRoute === "function"
    ? parsePhoneRoute(phoneView)
    : { appId: phoneView === "home" ? "" : phoneView };

  return {
    unlocked,
    usedToday,
    minimized,
    phoneView,
    preview,
    phoneTime,
    canUseApps,
    canOpenStage,
    hasShiftToday,
    hasBookedShift,
    jobAppliedToday,
    stageExpanded,
    activeAppId: routeInfo.appId || preview.appId,
    signalText: !unlocked
      ? "LOCK"
      : hasShiftToday
        ? "SHIFT"
        : hasBookedShift
          ? "BOOKED"
          : jobAppliedToday
            ? "APPLIED"
            : usedToday
              ? "DONE"
              : canUseApps
                ? "ONLINE"
                : "HOLD",
  };
}

function getPhoneLayoutState(screenState = getPhonePanelState(), targetState = state) {
  const phoneView = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(screenState?.phoneView || "home")
    : String(screenState?.phoneView || "home");
  const onHomeRoute = typeof isPhoneHomeRoute === "function"
    ? isPhoneHomeRoute(phoneView)
    : phoneView === "home";
  const currentLocationId = targetState?.scene === "outside" && typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  const locationMap = typeof getDayWorldLocationMap === "function"
    ? getDayWorldLocationMap(targetState?.day || 1) || {}
    : {};
  const currentLocation = currentLocationId ? locationMap[currentLocationId] || null : null;
  const interiorLikeLocation = Boolean(
    currentLocation
    && (
      currentLocation.cityMapHidden
      || !currentLocation.mapNode
      || (Array.isArray(currentLocation.exits) && currentLocation.exits.length <= 2)
    )
  );
  const mcdonaldsLikeLocation = /mcdonalds/.test(String(currentLocationId || ""));
  const focusActive = Boolean(
    screenState?.unlocked
    && !screenState?.minimized
    && (screenState?.stageExpanded || !onHomeRoute)
  );

  return {
    onHomeRoute,
    focusActive,
    stageDocked: Boolean(screenState?.stageExpanded),
    safeLayout: Boolean(focusActive && (interiorLikeLocation || mcdonaldsLikeLocation)),
    currentLocationId,
  };
}

function buildPhoneHomeGridMarkup(targetState = state) {
  const manifests = typeof getInstalledPhoneAppRegistry === "function"
    ? getInstalledPhoneAppRegistry(targetState)
    : [];
  const orderedManifests = [...manifests].sort((left, right) => {
    const leftPriority = left?.id === "bank" ? -1 : 0;
    const rightPriority = right?.id === "bank" ? -1 : 0;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return 0;
  });

  if (!orderedManifests.length) {
    return '<div class="phone-job-empty">설치된 앱이 없습니다.</div>';
  }

  return orderedManifests.map((app) => `
    <button
      class="phone-app-btn"
      type="button"
      data-phone-app="${escapeHtml(app.id)}"
    >
      <span class="phone-app-icon-tile">
        <span class="phone-app-emoji">${escapeHtml(app.icon || "📱")}</span>
      </span>
      <span class="phone-app-name">${escapeHtml(app.homeLabel || app.label || app.id)}</span>
    </button>
  `).join("");
}

function buildPhoneRouteMarkup(route, { stageMode = false } = {}, targetState = state) {
  if (typeof buildPhoneRouteScreenMarkup === "function") {
    return buildPhoneRouteScreenMarkup(route, {
      showHomeButton: !stageMode,
      stageMode,
    }, targetState);
  }

  return '<div class="phone-job-empty">앱 화면을 준비 중입니다.</div>';
}

function convertCasinoAppMarkupToVenueMarkup(markup = "") {
  return String(markup || "")
    .replace(/data-phone-route="casino\/([^"]+)"/g, 'data-casino-route="$1"')
    .replace(/data-phone-action=/g, "data-casino-action=");
}

function buildCasinoVenueMarkup(screenId = "home") {
  const normalizedScreenId = ["exchange", "blackjack", "slots"].includes(String(screenId || "").trim().toLowerCase())
    ? String(screenId || "").trim().toLowerCase()
    : "home";
  const markup = normalizedScreenId === "exchange"
    ? (typeof buildCasinoExchangeScreenMarkup === "function" ? buildCasinoExchangeScreenMarkup({ stageMode: true, targetState: state }) : "")
    : normalizedScreenId === "blackjack"
      ? (typeof buildCasinoBlackjackScreenMarkup === "function" ? buildCasinoBlackjackScreenMarkup({ stageMode: true, targetState: state }) : "")
      : normalizedScreenId === "slots"
        ? (typeof buildCasinoSlotsScreenMarkup === "function" ? buildCasinoSlotsScreenMarkup({ stageMode: true, targetState: state }) : "")
        : (typeof buildCasinoHomeScreenMarkup === "function" ? buildCasinoHomeScreenMarkup({ stageMode: true, targetState: state }) : "");

  return convertCasinoAppMarkupToVenueMarkup(markup);
}

function renderPhoneStage(screenState = getPhonePanelState()) {
  if (!ui.phoneStage) {
    return;
  }

  const shouldShow = screenState.unlocked && !screenState.minimized && screenState.stageExpanded;
  const existingStageAppScreen = ui.phoneStage.querySelector(".phone-stage-app-screen");
  if (existingStageAppScreen) {
    rememberPhoneScrollPosition("stage", screenState.phoneView, existingStageAppScreen.scrollTop);
  }
  ui.phoneStage.hidden = !shouldShow;
  ui.phoneStage.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  ui.game?.classList.toggle("phone-stage-active", shouldShow);

  if (!shouldShow) {
    ui.phoneStage.classList.remove("has-fullbleed-app");
    ui.phoneStage.innerHTML = "";
    return;
  }

  const onHomeRoute = typeof isPhoneHomeRoute === "function"
    ? isPhoneHomeRoute(screenState.phoneView)
    : screenState.phoneView === "home";
  const stageScreenMode = !onHomeRoute
    ? getPhoneRouteScreenMode(screenState.phoneView, state)
    : "";
  const stageBody = !onHomeRoute
    ? `
      <div class="phone-stage-app-screen${stageScreenMode === "fullbleed" ? " is-fullbleed-route" : ""}">
        ${buildPhoneRouteMarkup(screenState.phoneView, { stageMode: true })}
      </div>
    `
    : `
      <div class="phone-stage-home-grid">
        ${buildPhoneHomeGridMarkup(state)}
      </div>
      <div class="phone-stage-home-fill"></div>
    `;

  ui.phoneStage.innerHTML = `
    <div class="phone-stage-shell ${onHomeRoute ? "is-home-view" : "is-app-view"}">
      <div class="phone-stage-top">
        <div class="phone-stage-day">${typeof formatTurnBadge === "function" ? formatTurnBadge(state.day) : `TURN ${String(state.day).padStart(2, "0")}`}</div>
        <div class="phone-stage-meta">
          <span class="phone-stage-time">${screenState.phoneTime}</span>
          <span class="phone-stage-signal">${screenState.signalText}</span>
        </div>
      </div>
      ${stageBody}
    </div>
  `;
  ui.phoneStage.classList.toggle("has-fullbleed-app", stageScreenMode === "fullbleed");

  const nextStageAppScreen = ui.phoneStage.querySelector(".phone-stage-app-screen");
  if (nextStageAppScreen) {
    nextStageAppScreen.scrollTop = readPhoneScrollPosition("stage", screenState.phoneView);
  }
}


function updatePhonePanel() {
  if (!ui.phonePanel) return;

  const screenState = getPhonePanelState();
  const { phoneView } = screenState;
  const onHomeRoute = typeof isPhoneHomeRoute === "function"
    ? isPhoneHomeRoute(phoneView)
    : phoneView === "home";
  const panelScreenMode = !onHomeRoute
    ? getPhoneRouteScreenMode(phoneView, state)
    : "";
  const layoutState = getPhoneLayoutState(screenState, state);
  if (ui.phoneAppScreen && !ui.phoneAppScreen.hidden) {
    rememberPhoneScrollPosition("panel", phoneView, ui.phoneAppScreen.scrollTop);
  }

  if (
    layoutState.focusActive
    && typeof hideCityMapOverlay === "function"
    && typeof cityMapUiState !== "undefined"
    && cityMapUiState?.open
  ) {
    hideCityMapOverlay({ preserveSelection: true });
  }

  if (ui.phoneApps) {
    ui.phoneApps.hidden = !onHomeRoute;
    ui.phoneApps.innerHTML = onHomeRoute ? buildPhoneHomeGridMarkup(state) : "";
  }

  if (ui.phoneAppScreen) {
    const showAppScreen = !onHomeRoute;
    ui.phoneAppScreen.hidden = !showAppScreen;
    ui.phoneAppScreen.classList.toggle("is-fullbleed-route", showAppScreen && panelScreenMode === "fullbleed");
    if (showAppScreen) {
      ui.phoneAppScreen.innerHTML = buildPhoneRouteMarkup(phoneView);
      ui.phoneAppScreen.scrollTop = readPhoneScrollPosition("panel", phoneView);
    } else {
      ui.phoneAppScreen.innerHTML = "";
    }
  }

  ui.phonePanel.classList.toggle("is-app-open", !onHomeRoute);
  ui.phonePanel.classList.toggle("has-fullbleed-app", !onHomeRoute && panelScreenMode === "fullbleed");

  if (typeof applyPhoneShellUi === "function") {
    applyPhoneShellUi(ui, screenState);
  }

  renderPhoneStage(screenState);

  ui.phonePanel.classList.toggle("is-focus-mode", layoutState.focusActive);
  ui.phonePanel.classList.toggle("is-stage-docked", layoutState.stageDocked);
  ui.phonePanel.classList.toggle("is-safe-layout", layoutState.safeLayout);
  ui.phoneStage?.classList.toggle("is-safe-layout", layoutState.safeLayout);
  const romanceCallSessionActive = typeof getRomanceCallSession === "function"
    ? Boolean(getRomanceCallSession(state)?.active && state.scene === "romance-call")
    : false;
  ui.phonePanel.classList.toggle("is-lowered-for-call", romanceCallSessionActive);
  ui.phoneStage?.classList.toggle("is-lowered-for-call", romanceCallSessionActive);
  if (ui.game) {
    ui.game.classList.toggle("phone-focus-active", layoutState.focusActive);
    ui.game.classList.toggle("phone-safe-layout", layoutState.safeLayout);
    ui.game.classList.toggle("phone-collapsed", screenState.minimized || layoutState.focusActive);
    ui.game.classList.toggle("is-romance-call-session", romanceCallSessionActive);
  }
  if (ui.phoneFocusDim) {
    ui.phoneFocusDim.hidden = !layoutState.focusActive;
    ui.phoneFocusDim.setAttribute("aria-hidden", layoutState.focusActive ? "false" : "true");
    ui.phoneFocusDim.classList.toggle("is-active", layoutState.focusActive);
  }

  if (typeof syncCasinoSlotMachineMounts === "function") {
    syncCasinoSlotMachineMounts();
  }
}


function formatMoney(amount) {
  if (typeof formatCash === "function") {
    return formatCash(amount);
  }

  return `${amount.toLocaleString("ko-KR")}\uc6d0`;
}

function showStartScreen(hasSave = false) {
  if (typeof hideSpoonDrawOverlay === "function") {
    hideSpoonDrawOverlay();
  }
  setStartScreenSaveState(hasSave);
  renderStartScreenDrawState(hasSave);
  ui.startScreen.classList.remove("is-hidden");
  requestAnimationFrame(() => {
    if (hasSave && ui.continueButton && !ui.continueButton.hidden) {
      ui.continueButton.focus();
      return;
    }

    ui.nameInput.focus();
    ui.nameInput.select();
  });
}

function hideStartScreen() {
  ui.startScreen.classList.add("is-hidden");
}

function setHeadline(badge, text) {
  ui.headlineBadge.textContent = badge || "";
  ui.headlineText.textContent = text || "";
  syncHeadlineVisibility();
}

function syncHeadlineVisibility() {
  if (!ui.headlineStrip) {
    return;
  }

  const hasHeadline = Boolean(ui.headlineBadge?.textContent?.trim() || ui.headlineText?.textContent?.trim());
  const suppressForSceneText = Boolean(ui.message?.textContent?.trim() || ui.choices?.childElementCount);
  ui.headlineStrip.classList.toggle("is-hidden", !hasHeadline || suppressForSceneText);
}

function renderGameplayFeedback() {
  if (!ui.gameplayFeedback) {
    return;
  }

  const feedback = typeof getActiveGameplayFeedback === "function"
    ? getActiveGameplayFeedback()
    : null;
  const shouldHide = !feedback || state.scene === "ranking" || state.scene === "turn-briefing" || state.scene === "romance-call";
  ui.gameplayFeedback.hidden = shouldHide;
  ui.gameplayFeedback.setAttribute("aria-hidden", shouldHide ? "true" : "false");

  if (shouldHide) {
    ui.gameplayFeedback.innerHTML = "";
    return;
  }

  const toneClass = feedback.tone ? ` is-${escapeHtml(feedback.tone)}` : "";
  const chipsMarkup = Array.isArray(feedback.chips) && feedback.chips.length
    ? `
      <div class="gameplay-feedback-chips">
        ${feedback.chips.map((chip) => {
          const chipToneClass = chip?.tone ? ` is-${escapeHtml(chip.tone)}` : "";
          return `<span class="gameplay-feedback-chip${chipToneClass}">${escapeHtml(chip?.label || "")}</span>`;
        }).join("")}
      </div>
    `
    : "";

  ui.gameplayFeedback.innerHTML = `
    <div class="gameplay-feedback-card${toneClass}">
      <div class="gameplay-feedback-title">${escapeHtml(feedback.title || "상태 변화")}</div>
      ${chipsMarkup}
    </div>
  `;
}

function clearSceneBackgroundOverride() {
  if (!ui.bg) {
    return;
  }

  ui.bg.style.background = "";
  ui.bg.style.transition = "";
}

function renderMemoryPanel() {
  if (!ui.memoryButton || !ui.memoryPanel || !ui.memoryList) {
    return;
  }

  const memoryState = typeof syncMemoryState === "function"
    ? syncMemoryState(state)
    : { panelOpen: false, entries: [] };
  const entries = typeof getMemoryEntries === "function"
    ? getMemoryEntries(state)
    : (Array.isArray(memoryState.entries) ? memoryState.entries : []);
  const isOpen = Boolean(memoryState.panelOpen);

  ui.memoryButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  if (ui.memoryCount) {
    ui.memoryCount.textContent = String(entries.length);
  }

  ui.memoryPanel.hidden = !isOpen;
  ui.memoryPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");

  if (!isOpen) {
    return;
  }

  if (!entries.length) {
    ui.memoryList.innerHTML = `
      <div class="memory-empty">
        <div class="memory-empty-title">아직 남은 기억이 없습니다.</div>
        <div class="memory-empty-body">사건이나 대화를 겪으면 여기에 기록이 쌓입니다.</div>
      </div>
    `;
    return;
  }

  ui.memoryList.innerHTML = entries.map((entry) => {
    const tags = Array.isArray(entry.tags) && entry.tags.length
      ? `<div class="memory-entry-tags">${entry.tags.map((tag) => `<span class="memory-entry-tag">${escapeHtml(tag)}</span>`).join("")}</div>`
      : "";
    const body = entry.body ? `<div class="memory-entry-body">${escapeHtml(entry.body)}</div>` : "";
    const source = entry.source ? `<span class="memory-entry-source">${escapeHtml(entry.source)}</span>` : "";

    return `
      <article class="memory-entry memory-entry--${escapeHtml(entry.type || "note")}">
        <div class="memory-entry-meta">
          <span class="memory-entry-time">${escapeHtml(entry.timestamp || "")}</span>
          ${source}
        </div>
        <div class="memory-entry-title">${escapeHtml(entry.title || "기억")}</div>
        ${body}
        ${tags}
      </article>
    `;
  }).join("");
}

function renderCharacterPanelLegacy() {
  return renderCharacterPanel();
}

function appendCharacterStatRow(container, {
  label = "",
  cls = "",
  max = 100,
  value = 0,
  meta = "",
  metaCls = "",
} = {}) {
  const safeMax = Math.max(1, Number(max) || 1);
  const val = Math.max(0, Math.round(Number(value) || 0));
  const pct = Math.min(100, Math.round((val / safeMax) * 100));
  const metaMarkup = meta
    ? `<span class="character-stat-meta ${metaCls || ""}">${escapeHtml(meta)}</span>`
    : "";

  const row = document.createElement("div");
  row.className = "character-stat-row";
  row.innerHTML = `
    <div class="character-stat-name-wrap">
      <span class="character-stat-name">${escapeHtml(label)}</span>
      ${metaMarkup}
    </div>
    <div class="character-stat-bar-wrap">
      <div class="character-stat-bar ${escapeHtml(cls)}" style="width:${pct}%"></div>
    </div>
    <span class="character-stat-val ${escapeHtml(cls)}">${val}</span>
  `;
  container.appendChild(row);
}

function appendCharacterSummaryGrid(container, summaries = []) {
  if (!Array.isArray(summaries) || !summaries.length) {
    return;
  }

  const grid = document.createElement("div");
  grid.className = "character-summary-grid";
  grid.innerHTML = summaries.map((entry) => `
    <div class="character-summary-card">
      <div class="character-summary-label">${escapeHtml(entry.label || "")}</div>
      <div class="character-summary-value">${escapeHtml(entry.value || "")}</div>
    </div>
  `).join("");
  container.appendChild(grid);
}

function appendCharacterChipRow(container, chips = []) {
  if (!Array.isArray(chips) || !chips.length) {
    return;
  }

  const chipRow = document.createElement("div");
  chipRow.className = "character-chip-row";
  chipRow.innerHTML = chips.map((chip) => `
    <span class="character-chip is-${escapeHtml(chip.tone || "ready")}">${escapeHtml(chip.label || "")}</span>
  `).join("");
  container.appendChild(chipRow);
}

function appendCharacterSection(container, section = {}) {
  const sectionEl = document.createElement("section");
  sectionEl.className = "character-stat-section";
  sectionEl.innerHTML = `<div class="character-stat-section-title">${escapeHtml(section.label || "")}</div>`;

  const body = document.createElement("div");
  body.className = "character-stat-section-body";

  (section.bars || []).forEach((entry) => appendCharacterStatRow(body, entry));
  appendCharacterSummaryGrid(body, section.summaries || []);
  appendCharacterChipRow(body, section.chips || []);

  sectionEl.appendChild(body);
  container.appendChild(sectionEl);
}

function renderCharacterPanel() {
  if (!ui.characterButton || !ui.characterPanel || !ui.characterStats) {
    return;
  }

  const isOpen = Boolean(state._characterPanelOpen);
  const sections = typeof createPlayerStatSections === "function"
    ? createPlayerStatSections(state)
    : [];

  ui.characterButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  ui.characterPanel.hidden = !isOpen;
  ui.characterPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");

  if (!isOpen) {
    return;
  }

  ui.characterStats.innerHTML = "";
  if (!sections.length) {
    appendCharacterSection(ui.characterStats, {
      label: "기본",
      bars: [
        { label: "지능", cls: "intelligence", max: 100, value: Number(state["지능"]) || 0 },
        { label: "평판", cls: "reputation", max: 100, value: Number(state["평판"]) || 0 },
        { label: "범죄도", cls: "crime", max: 100, value: Number(state["범죄도"]) || 0 },
      ],
    });
    return;
  }

  sections.forEach((section) => appendCharacterSection(ui.characterStats, section));
}

function renderInventoryPanel() {
  if (!ui.inventoryButton || !ui.inventoryPanel || !ui.inventoryList) {
    return;
  }

  const inventoryState = typeof syncInventoryState === "function"
    ? syncInventoryState(state)
    : createDefaultInventoryState();
  const ownershipState = typeof syncOwnershipState === "function"
    ? syncOwnershipState(state)
    : createDefaultOwnershipState();
  if (typeof syncSpoonStartResidence === "function") {
    syncSpoonStartResidence(state);
  }
  const tabs = typeof getInventoryTabs === "function"
    ? getInventoryTabs()
    : [
        { id: "carry", label: "소지품" },
        { id: "equipment", label: "장비" },
        { id: "document", label: "문서" },
        { id: "asset", label: "자산" },
      ];
  const counts = typeof getInventoryTabCounts === "function"
    ? getInventoryTabCounts(state)
    : Object.fromEntries(tabs.map((tab) => [tab.id, 0]));
  const totalCount = typeof getInventoryBadgeCount === "function"
    ? getInventoryBadgeCount(state)
    : 0;
  const slotLimit = typeof getInventorySlotLimit === "function"
    ? getInventorySlotLimit(state)
    : inventoryState.slotLimit;
  const carryLoad = typeof getInventoryCarryLoad === "function"
    ? getInventoryCarryLoad(state)
    : 0;
  const activeTab = inventoryState.activeTab || "carry";
  const entries = typeof getInventoryEntriesByTab === "function"
    ? getInventoryEntriesByTab(activeTab, state)
    : [];
  const residenceLabel = typeof getInventoryResidenceLabel === "function"
    ? getInventoryResidenceLabel(state)
    : (ownershipState.residence || "거처 미정");
  const originLabel = typeof getStartingOriginLabel === "function"
    ? getStartingOriginLabel(state)
    : (state?.startingOrigin?.label || "수저 미정");
  const homeDefinition = typeof getOwnedHomeDefinition === "function"
    ? getOwnedHomeDefinition(ownershipState.home)
    : null;
  const vehicleDefinition = typeof getOwnedVehicleDefinition === "function"
    ? getOwnedVehicleDefinition(ownershipState.vehicle)
    : null;
  const assetValue = typeof getOwnershipTotalAssetValue === "function"
    ? getOwnershipTotalAssetValue(state)
    : 0;
  const isOpen = Boolean(inventoryState.panelOpen);

  ui.inventoryButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  if (ui.inventoryCount) {
    ui.inventoryCount.textContent = String(totalCount);
  }

  ui.inventoryPanel.hidden = !isOpen;
  ui.inventoryPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");

  if (!isOpen) {
    return;
  }

  if (ui.inventorySummary) {
    ui.inventorySummary.innerHTML = `
      <div class="inventory-summary-chip">
        <span class="inventory-summary-label">슬롯</span>
        <span class="inventory-summary-value">${carryLoad} / ${slotLimit}</span>
      </div>
      <div class="inventory-summary-chip">
        <span class="inventory-summary-label">수저</span>
        <span class="inventory-summary-value">${escapeHtml(originLabel)}</span>
      </div>
      <div class="inventory-summary-chip">
        <span class="inventory-summary-label">거주</span>
        <span class="inventory-summary-value">${escapeHtml(residenceLabel)}</span>
      </div>
      <div class="inventory-summary-chip">
        <span class="inventory-summary-label">부동산</span>
        <span class="inventory-summary-value">${escapeHtml(homeDefinition?.label || "-")}</span>
      </div>
      <div class="inventory-summary-chip">
        <span class="inventory-summary-label">차량</span>
        <span class="inventory-summary-value">${escapeHtml(vehicleDefinition?.label || "-")}</span>
      </div>
      <div class="inventory-summary-chip">
        <span class="inventory-summary-label">자산 가치</span>
        <span class="inventory-summary-value">${escapeHtml(typeof formatCash === "function" ? formatCash(assetValue) : String(assetValue))}</span>
      </div>
    `;
  }

  if (ui.inventoryTabs) {
    ui.inventoryTabs.innerHTML = tabs.map((tab) => `
      <button
        class="inventory-tab${tab.id === activeTab ? " is-active" : ""}"
        type="button"
        data-inventory-tab="${escapeHtml(tab.id)}"
      >
        <span>${escapeHtml(tab.label)}</span>
        <span class="inventory-tab-count">${counts[tab.id] || 0}</span>
      </button>
    `).join("");
  }

  if (!entries.length) {
    ui.inventoryList.innerHTML = "";
    return;
  }

  ui.inventoryList.innerHTML = `<div class="inventory-grid">${entries.map((entry) => {
    const isEquipped = Array.isArray(entry.badges) && entry.badges.length > 0;
    const qty = entry.quantity > 1 ? `<span class="inv-cell-qty">x${entry.quantity}</span>` : "";
    const useButton = entry.itemId && entry.actionLabel
      ? `<button class="inv-cell-use" type="button" data-inventory-use-id="${escapeHtml(entry.itemId)}">${escapeHtml(entry.actionLabel)}</button>`
      : "";
    const equipped = isEquipped ? ` is-equipped` : "";
    const actionable = useButton ? " has-action" : "";
    return `
      <div class="inv-cell${equipped}${actionable}" title="${escapeHtml(entry.label || "")}">
        <div class="inv-cell-icon">${entry.icon || "📦"}</div>
        <div class="inv-cell-name">${escapeHtml(entry.label || "아이템")}</div>
        ${qty}
        ${useButton}
      </div>
    `;
  }).join("")}</div>`;
}

const sceneImagePreloadState = window.sceneImagePreloadState || {
  registry: new Map(),
  bootstrapped: false,
};
window.sceneImagePreloadState = sceneImagePreloadState;

function normalizeSceneImageUrl(url = "") {
  return String(url || "").trim().replace(/\\/g, "/");
}

function isSceneImageUrl(url = "") {
  return /\.(png|jpe?g|webp|avif|gif|svg)([?#].*)?$/i.test(String(url || "").trim());
}

function isDisabledSceneBackgroundImageUrl(url = "") {
  const normalizedUrl = normalizeSceneImageUrl(url).toLowerCase();
  return normalizedUrl.startsWith("assets/backgrounds/")
    || normalizedUrl.startsWith("assets/days/")
    || normalizedUrl.startsWith("assets/_incoming/backgrounds/");
}

function collectSceneImageUrlsFromSource(source, bucket = []) {
  if (!source) {
    return bucket;
  }

  if (typeof source === "string") {
    const normalizedUrl = normalizeSceneImageUrl(source);
    if (normalizedUrl && isSceneImageUrl(normalizedUrl)) {
      bucket.push(normalizedUrl);
    }
    return bucket;
  }

  if (Array.isArray(source)) {
    source.forEach((entry) => collectSceneImageUrlsFromSource(entry, bucket));
    return bucket;
  }

  if (typeof source === "object") {
    Object.values(source).forEach((entry) => collectSceneImageUrlsFromSource(entry, bucket));
  }

  return bucket;
}

function preloadSceneImage(url = "", options = {}) {
  const normalizedUrl = normalizeSceneImageUrl(url);
  if (!normalizedUrl || !isSceneImageUrl(normalizedUrl) || isDisabledSceneBackgroundImageUrl(normalizedUrl)) {
    return Promise.resolve(false);
  }

  const existing = sceneImagePreloadState.registry.get(normalizedUrl);
  if (existing?.promise) {
    return existing.promise;
  }

  const image = new Image();
  let settled = false;
  let resolvePromise = () => {};
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });

  const record = {
    url: normalizedUrl,
    image,
    promise,
    status: "pending",
  };
  sceneImagePreloadState.registry.set(normalizedUrl, record);

  const finish = (loaded) => {
    if (settled) {
      return;
    }
    settled = true;
    record.status = loaded ? "loaded" : "error";
    resolvePromise(Boolean(loaded));
  };

  image.decoding = "async";
  try {
    if ("loading" in image) {
      image.loading = "eager";
    }
  } catch (_) {}
  try {
    if (options.priority && "fetchPriority" in image) {
      image.fetchPriority = options.priority;
    }
  } catch (_) {}

  image.addEventListener("load", () => finish(true), { once: true });
  image.addEventListener("error", () => finish(false), { once: true });
  image.src = normalizedUrl;

  if (image.complete && image.naturalWidth > 0) {
    finish(true);
  } else if (typeof image.decode === "function") {
    image.decode().then(() => finish(true)).catch(() => {});
  }

  return promise;
}

function preloadSceneImages(urls = [], options = {}) {
  const normalizedUrls = [...new Set(
    (Array.isArray(urls) ? urls : [urls])
      .map((entry) => normalizeSceneImageUrl(entry))
      .filter((entry) => entry && isSceneImageUrl(entry) && !isDisabledSceneBackgroundImageUrl(entry))
  )];

  normalizedUrls.forEach((url) => {
    preloadSceneImage(url, options);
  });

  return normalizedUrls;
}

function scheduleSceneImageWarmup(targetState = state) {
  if (sceneImagePreloadState.bootstrapped) {
    return;
  }

  sceneImagePreloadState.bootstrapped = true;
  const immediateUrls = collectSceneImageUrlsFromSource([
    CHARACTER_ART?.player?.standing,
    CHARACTER_ART?.player?.walking,
    CHARACTER_ART?.convenienceCashier?.default,
    CHARACTER_ART?.highSchoolGirl?.default,
    CHARACTER_ART?.alleyAunt?.default,
    CHARACTER_ART?.stationOfficeCommuter?.default,
  ]);
  preloadSceneImages(immediateUrls, { priority: "high" });

  const deferredUrls = collectSceneImageUrlsFromSource(CHARACTER_ART);
  const runDeferredPreload = () => preloadSceneImages(deferredUrls, { priority: "low" });

  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => {
      runDeferredPreload();
    }, { timeout: 1500 });
  } else {
    window.setTimeout(() => {
      runDeferredPreload();
    }, 350);
  }
}

function applySceneBackgroundConfig(backgroundConfig = null) {
  const backgroundImageUrl = normalizeSceneImageUrl(backgroundConfig?.image || "");
  if (!ui.bg || !backgroundImageUrl || isDisabledSceneBackgroundImageUrl(backgroundImageUrl)) {
    return false;
  }

  preloadSceneImage(backgroundImageUrl, { priority: "high" });

  const overlay = backgroundConfig.overlay
    || "linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.18) 100%)";
  const position = backgroundConfig.position || "center";
  const size = backgroundConfig.size || "cover";
  const repeat = backgroundConfig.repeat || "no-repeat";
  const color = backgroundConfig.color || "";

  ui.bg.className = backgroundConfig.className || "custom-location-bg";
  ui.bg.style.background = `${overlay}, url('${backgroundImageUrl}') ${position} / ${size} ${repeat}${color ? ` ${color}` : ""}`;
  ui.bg.style.transition = "none";
  return true;
}

function getCurrentUiBackgroundSnapshot() {
  if (!ui.bg) {
    return null;
  }

  return {
    className: typeof ui.bg.className === "string" ? ui.bg.className : "",
    background: typeof ui.bg.style.background === "string" ? ui.bg.style.background : "",
  };
}

function applySceneBackgroundSnapshot(snapshot = null) {
  if (!ui.bg || !snapshot || typeof snapshot !== "object") {
    return false;
  }

  const className = typeof snapshot.className === "string" ? snapshot.className : "";
  const background = typeof snapshot.background === "string" ? snapshot.background : "";
  if (!className && !background) {
    return false;
  }

  if (/url\(/i.test(background)) {
    return false;
  }

  ui.bg.className = className;
  ui.bg.style.background = background;
  ui.bg.style.transition = "none";
  return true;
}

function setBackgroundByTone(tone) {
  clearSceneBackgroundOverride();

  if (state.day === 1 && tone === "prologue") {
    if (state.storyStep === 0) {
      ui.bg.className = "day-1-room-01";
      return;
    }

    if (state.storyStep === 1) {
      ui.bg.className = "day-1-room-02";
      return;
    }

    ui.bg.className = "day-1-room-04";
    return;
  }

  if (state.day === 1 && tone === "room") {
    ui.bg.className = "day-1-room-04";
    return;
  }

  if (tone === "cleanup") {
    ui.bg.className = "day-1-cleanup";
    return;
  }

  const map = {
    board: "night",
    room: "room",       /* 獄?獄쏄퀗瑗? ??산땀 ???筌왖 */
    outside: "apartment-front",
    prologue: "night",
    cobalt: "night",
    steel: "night",
    ember: "evening",
    berry: "evening",
    mint: "morning",
    aqua: "noon",
  };

  ui.bg.className = map[tone] || "night";
}


function setCharacter(emoji) {
  ui.character.textContent = emoji ?? "\u{1F9D1}";
}

function resolveLayoutNumber(value, fallback) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clampLayoutValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundLayoutValue(value) {
  return Math.round(value * 10) / 10;
}

function normalizeCropInsets(layout = {}) {
  let top = clampLayoutValue(resolveLayoutNumber(layout.cropTop, 0), 0, 90);
  let right = clampLayoutValue(resolveLayoutNumber(layout.cropRight, 0), 0, 90);
  let bottom = clampLayoutValue(resolveLayoutNumber(layout.cropBottom, 0), 0, 90);
  let left = clampLayoutValue(resolveLayoutNumber(layout.cropLeft, 0), 0, 90);

  const verticalSum = top + bottom;
  if (verticalSum > 95) {
    const scale = 95 / verticalSum;
    top = roundLayoutValue(top * scale);
    bottom = roundLayoutValue(bottom * scale);
  }

  const horizontalSum = left + right;
  if (horizontalSum > 95) {
    const scale = 95 / horizontalSum;
    left = roundLayoutValue(left * scale);
    right = roundLayoutValue(right * scale);
  }

  return { top, right, bottom, left };
}

function applyCropToImage(image, crop = {}) {
  if (!image) {
    return;
  }

  const hasCrop = crop.top || crop.right || crop.bottom || crop.left;
  image.style.clipPath = hasCrop
    ? `inset(${crop.top}% ${crop.right}% ${crop.bottom}% ${crop.left}%)`
    : "";
}

function applySceneActorLayout(element, layout = {}) {
  if (!element) {
    return;
  }

  if (layout.left != null) {
    element.style.left = `${layout.left}%`;
  }
  if (layout.bottom != null) {
    element.style.bottom = `${layout.bottom}px`;
  }
  if (layout.height != null) {
    element.style.height = `${layout.height}%`;
  }
  if (layout.zIndex != null) {
    element.style.zIndex = String(layout.zIndex);
  }

  const facing = resolveLayoutNumber(layout.facing ?? element.dataset.facing, 1) < 0 ? -1 : 1;
  const rotation = roundLayoutValue(resolveLayoutNumber(layout.rotation ?? element.dataset.rotation, 0));
  const crop = normalizeCropInsets({
    cropTop: layout.cropTop ?? element.dataset.cropTop,
    cropRight: layout.cropRight ?? element.dataset.cropRight,
    cropBottom: layout.cropBottom ?? element.dataset.cropBottom,
    cropLeft: layout.cropLeft ?? element.dataset.cropLeft,
  });

  element.dataset.facing = String(facing);
  element.dataset.rotation = String(rotation);
  element.dataset.cropTop = String(crop.top);
  element.dataset.cropRight = String(crop.right);
  element.dataset.cropBottom = String(crop.bottom);
  element.dataset.cropLeft = String(crop.left);
  element.style.transform = `translateX(-50%) scaleX(${facing}) rotate(${rotation}deg)`;

  applyCropToImage(element.querySelector(".scene-actor-image"), crop);
}

function applyTrashItemLayout(element, layout = {}) {
  if (!element) {
    return;
  }

  if (layout.x != null) {
    element.style.left = `${layout.x}%`;
  }
  if (layout.y != null) {
    element.style.top = `${layout.y}%`;
  }

  const size = clampLayoutValue(resolveLayoutNumber(layout.size ?? element.dataset.size, 96), 24, 240);
  const facing = resolveLayoutNumber(layout.facing ?? element.dataset.facing, 1) < 0 ? -1 : 1;
  const rotation = roundLayoutValue(resolveLayoutNumber(layout.rotation ?? element.dataset.rotation, 0));
  const zIndex = Math.round(clampLayoutValue(resolveLayoutNumber(layout.zIndex ?? element.dataset.zIndex, 1), 0, 99));
  const crop = normalizeCropInsets({
    cropTop: layout.cropTop ?? element.dataset.cropTop,
    cropRight: layout.cropRight ?? element.dataset.cropRight,
    cropBottom: layout.cropBottom ?? element.dataset.cropBottom,
    cropLeft: layout.cropLeft ?? element.dataset.cropLeft,
  });

  element.dataset.size = String(size);
  element.dataset.facing = String(facing);
  element.dataset.rotation = String(rotation);
  element.dataset.zIndex = String(zIndex);
  element.dataset.cropTop = String(crop.top);
  element.dataset.cropRight = String(crop.right);
  element.dataset.cropBottom = String(crop.bottom);
  element.dataset.cropLeft = String(crop.left);

  element.style.width = `${size}px`;
  element.style.height = `${size}px`;
  element.style.zIndex = String(zIndex);
  element.style.transform = `translate(-50%, -50%) scaleX(${facing}) rotate(${rotation}deg)`;

  applyCropToImage(element.querySelector(".trash-item-image"), crop);
}

function applyJobMiniGameItemLayout(element, layout = {}) {
  if (!element) {
    return;
  }

  if (layout.x != null) {
    element.style.left = `${layout.x}%`;
  }
  if (layout.y != null) {
    element.style.top = `${layout.y}%`;
  }

  const width = clampLayoutValue(resolveLayoutNumber(layout.size ?? element.dataset.size, 108), 72, 144);
  const zIndex = Math.round(clampLayoutValue(resolveLayoutNumber(layout.zIndex ?? element.dataset.zIndex, 2), 0, 99));

  element.dataset.size = String(width);
  element.dataset.zIndex = String(zIndex);
  element.style.width = `${width}px`;
  element.style.zIndex = String(zIndex);
  element.style.transform = "translate(-50%, -50%)";
}

function renderActors(actors = []) {
  if (!ui.actorsLayer) {
    return;
  }

  ui.actorsLayer.innerHTML = "";
  ui.actorsLayer.classList.toggle("is-hidden", actors.length === 0);
  ui.actorsLayer.classList.toggle("has-interactive-actors", actors.some((actor) => Boolean(actor?.npcId)));
  preloadSceneImages(actors.map((actor) => actor?.src || ""), { priority: "high" });

  actors.forEach((actor) => {
    const isInteractive = Boolean(actor?.npcId);
    const wrapper = document.createElement(isInteractive ? "button" : "div");
    wrapper.className = "scene-actor";
    if (isInteractive) {
      const npcPresentation = typeof getNpcPresentation === "function"
        ? getNpcPresentation(actor.npcId, state, {
            source: "actor-render",
            scene: state.scene,
            locationId: typeof getCurrentLocationId === "function" ? getCurrentLocationId(state) : "",
          })
        : null;
      const npcName = npcPresentation?.name
        || (typeof getNpcConfig === "function" ? getNpcConfig(actor.npcId)?.name : "");
      wrapper.type = "button";
      wrapper.classList.add("is-interactive");
      wrapper.setAttribute("aria-label", `${npcName || actor.alt || actor.npcId}와 대화`);
      wrapper.addEventListener("click", () => {
        if (typeof handleActorInteraction === "function") {
          handleActorInteraction(actor.npcId);
        }
      });
    }

    const image = document.createElement("img");
    image.className = "scene-actor-image";
    image.decoding = "async";
    try {
      if ("loading" in image) {
        image.loading = "eager";
      }
    } catch (_) {}
    try {
      if ("fetchPriority" in image) {
        image.fetchPriority = isInteractive ? "high" : "auto";
      }
    } catch (_) {}
    image.src = actor.src;
    image.alt = actor.alt || "";

    wrapper.appendChild(image);
    applySceneActorLayout(wrapper, actor);
    ui.actorsLayer.appendChild(wrapper);
  });
}

function setCharacterPosition(percent, facing = 1) {
  // ?怨쀫? ????ㅺ섯 ??彛????餓λ쵐????癒?짗 癰귣똻???뺣뼄.
  const gameWidth = ui.game?.clientWidth || window.innerWidth || 1;
  const isBottomPanel = window.matchMedia("(max-width: 600px)").matches;
  const panelWidth = isBottomPanel ? 0 : (ui.phonePanel?.offsetWidth || 0);
  const panelRatio = Math.min(panelWidth / gameWidth, 0.3);
  const adjusted = percent * (1 - panelRatio);
  ui.character.style.left = `${adjusted}%`;
  ui.character.style.transform = `translateX(-50%) scaleX(${facing})`;
}

function setWorldMode(mode) {
  ui.game.classList.toggle("outside-mode", mode === "outside");
  ui.game.classList.toggle("interactive-start-mode", mode === "interactive-start");
}

function setProgressByScene(scene) {
  const widthMap = {
    prologue: 8,
    "turn-briefing": 12,
    room: 18,
    "home-transition": 24,
    outside: 42,
    "casino-floor": 50,
    "lotto-pick": 46,
    dialogue: 46,
    board: 18,
    "job-minigame": 56,
    incident: 60,
    clockout: 74,
    result: 100,
    ending: 100,
  };

  if (ui.progressbar) ui.progressbar.style.width = `${widthMap[scene] || 0}%`;
}

function buildBuildings() {
  ui.buildings.innerHTML = "";
}

function clearChoices() {
  ui.choices.innerHTML = "";
  ui.choices.classList.remove("is-bus-route");
  syncTextboxContentState();
}

function clearMessage() {
  ui.message.innerHTML = "";
  setTextboxAdvanceState(false);
  syncTextboxContentState();
}

function setSceneInteractionPrompt(text = "", visible = false, { routeLabel = "" } = {}) {
  if (!ui.outsideGoal) {
    return;
  }

  const normalizedText = String(text || "").trim();
  const normalizedRouteLabel = String(routeLabel || "").trim();
  const shouldShow = Boolean(visible && normalizedText);
  const prefix = normalizedRouteLabel
    ? `- (${normalizedRouteLabel}) 힌트: `
    : "- 힌트: ";
  ui.outsideGoal.textContent = shouldShow ? `${prefix}${normalizedText}` : "";
  ui.outsideGoal.style.display = shouldShow ? "block" : "none";
  ui.outsideGoal.classList.toggle("is-visible", shouldShow);
}

function syncGameplayObjectivePrompt(targetState = state) {
  const objective = typeof createGameplayObjectiveSnapshot === "function"
    ? createGameplayObjectiveSnapshot(targetState)
    : null;
  const interactiveStartScene = targetState?.scene === "prologue"
    && ui.game?.classList.contains("interactive-start-mode");
  const supportedScene = interactiveStartScene
    || !["prologue", "cleanup", "job-minigame", "ending", "ranking", "turn-briefing", "night-auto-sleep", "lotto-pick", "lotto-result", "plastic-surgery"].includes(targetState?.scene);
  const promptText = objective?.prompt || "";
  setSceneInteractionPrompt(promptText, supportedScene && Boolean(promptText), {
    routeLabel: objective?.routeLabel || "",
  });
}

function hideTrashGame() {
  if (!ui.trashGameLayer) {
    return;
  }

  ui.trashGameLayer.classList.add("is-hidden");
  ui.trashGameLayer.setAttribute("aria-hidden", "true");
  ui.trashItems.innerHTML = "";
  ui.trashRemaining.textContent = "0 / 0";
}

function hideJobMiniGame() {
  if (!ui.jobMiniGameLayer) {
    return;
  }

  ui.jobMiniGameLayer.classList.add("is-hidden");
  ui.jobMiniGameLayer.setAttribute("aria-hidden", "true");
  if (ui.jobMiniGameItems) {
    ui.jobMiniGameItems.innerHTML = "";
  }
  if (ui.jobMiniGameProgress) {
    ui.jobMiniGameProgress.textContent = "0 / 0";
  }
  if (ui.jobMiniGameTitle) {
    ui.jobMiniGameTitle.textContent = "알바 미니게임";
  }
  if (ui.jobMiniGameNote) {
    ui.jobMiniGameNote.textContent = "핵심 업무 카드만 빠르게 정리하세요.";
  }
}


function renderTrashGame() {
  const game = state.cleaningGame;

  if (!ui.trashGameLayer || !game) {
    return;
  }

  ui.trashGameLayer.classList.remove("is-hidden");
  ui.trashGameLayer.setAttribute("aria-hidden", "false");
  ui.trashItems.innerHTML = "";
  ui.trashRemaining.textContent = `${game.remaining} / ${game.items.length}`;

  game.items.forEach((item) => {
    if (item.collected) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "trash-item";
    button.setAttribute("aria-label", `\uc4f0\ub808\uae30 ${item.id}`);

    const image = document.createElement("img");
    image.className = "trash-item-image";
    image.src = item.image;
    image.alt = "";
    button.appendChild(image);

    applyTrashItemLayout(button, item);
    button.addEventListener("click", () => {
      if (typeof runGuardedUiAction === "function") {
        runGuardedUiAction(() => {
          collectTrash(item.id);
        }, {
          source: "minigame-action",
          actionId: `cleanup:${item.id}`,
          allowedModes: ["minigame"],
          suppressFeedback: true,
        });
        return;
      }
      collectTrash(item.id);
    });
    ui.trashItems.appendChild(button);
  });
}

function renderJobMiniGame() {
  const game = state.jobMiniGame;

  if (!ui.jobMiniGameLayer || !game) {
    return;
  }

  const totalTargets = Number(game.totalTargets || 0);
  const clearedTargets = Number(game.clearedTargets || 0);
  const remainingTargets = Math.max(0, totalTargets - clearedTargets);

  ui.jobMiniGameLayer.classList.remove("is-hidden");
  ui.jobMiniGameLayer.setAttribute("aria-hidden", "false");
  ui.jobMiniGameItems.innerHTML = "";
  ui.jobMiniGameTitle.textContent = game.title || "알바 미니게임";
  ui.jobMiniGameNote.textContent = game.note || "핵심 업무 카드만 빠르게 정리하세요.";
  ui.jobMiniGameProgress.textContent = `${clearedTargets} / ${totalTargets}`;

  game.items.forEach((item) => {
    if (item.resolved) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = `job-task-item${item.target === false ? " is-decoy" : " is-target"}${remainingTargets <= 1 && item.target !== false ? " is-finish" : ""}`;
    button.setAttribute("aria-label", item.label || item.shortLabel || item.id);

    const icon = document.createElement("span");
    icon.className = "job-task-icon";
    icon.textContent = item.icon || "•";
    button.appendChild(icon);

    const label = document.createElement("span");
    label.className = "job-task-label";
    label.textContent = item.shortLabel || item.label || "업무";
    button.appendChild(label);

    applyJobMiniGameItemLayout(button, item);
    button.addEventListener("click", () => {
      if (typeof runGuardedUiAction === "function") {
        runGuardedUiAction(() => {
          completeJobMiniGameTask(item.id);
        }, {
          source: "minigame-action",
          actionId: `job-minigame:${item.id}`,
          allowedModes: ["minigame"],
          suppressFeedback: true,
        });
        return;
      }
      completeJobMiniGameTask(item.id);
    });
    ui.jobMiniGameItems.appendChild(button);
  });
}

function renderMessage(title, lines = [], { progressKey = "", revealAll = false } = {}) {
  const resolvedTitle = resolveDynamicText(title);
  const resolvedLines = lines.map(resolveDynamicText);
  if (revealAll) {
    sceneTextProgress.activeKey = progressKey || "";
    if (progressKey) {
      sceneTextProgress.progressByKey[progressKey] = {
        lineIndex: Math.max(0, resolvedLines.length - 1),
        lineCount: resolvedLines.length,
      };
    }
  }
  const progressState = revealAll
    ? {
        visibleLines: resolvedLines,
        canAdvance: false,
        choicesReady: true,
      }
    : getSceneTextProgressState(progressKey, resolvedLines);
  const titleMarkup = resolvedTitle
    ? `<div class="message-title">${escapeHtml(resolvedTitle)}</div>`
    : "";
  const copy = progressState.visibleLines.length
    ? `<div class="message-copy">${progressState.visibleLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>`
    : "";
  const continueMarkup = progressState.canAdvance
    ? '<div class="message-continue">계속</div>'
    : "";

  ui.message.innerHTML = `
    <div class="message-narration">
      ${titleMarkup}
      ${copy}
      ${continueMarkup}
    </div>
  `;
  setTextboxAdvanceState(progressState.canAdvance);
  syncTextboxContentState();

  return progressState.choicesReady;
}

function renderBusRouteMap(locationConfig, map = {}) {
  const resolvedTitle = resolveDynamicText(locationConfig?.title || locationConfig?.label || "");
  const resolvedLines = (locationConfig?.lines || []).map(resolveDynamicText);
  const activeTab = typeof getWorldTerminalTab === "function" ? getWorldTerminalTab(state) : "route";
  const titleMarkup = resolvedTitle
    ? `<div class="message-title">${escapeHtml(resolvedTitle)}</div>`
    : "";
  const copyMarkup = resolvedLines.length
    ? `<div class="message-copy">${resolvedLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>`
    : "";
  const routeTabLabel = escapeHtml(resolveDynamicText(map.routeTabLabel || "노선도"));
  const timetableTabLabel = escapeHtml(resolveDynamicText(map.timetableTabLabel || "시간표"));
  const tabsMarkup = `
    <div class="location-map-terminal-tabs" role="tablist" aria-label="배금시외버스터미널 탭">
      <button
        type="button"
        class="location-map-terminal-tab${activeTab === "route" ? " is-active" : ""}"
        data-terminal-tab="route"
        aria-pressed="${activeTab === "route" ? "true" : "false"}"
      >${routeTabLabel}</button>
      <button
        type="button"
        class="location-map-terminal-tab${activeTab === "timetable" ? " is-active" : ""}"
        data-terminal-tab="timetable"
        aria-pressed="${activeTab === "timetable" ? "true" : "false"}"
      >${timetableTabLabel}</button>
    </div>
  `;

  if (activeTab === "timetable") {
    const terminalName = map.terminalName
      ? `<div class="location-map-terminal-name">${escapeHtml(resolveDynamicText(map.terminalName))}</div>`
      : "";
    const terminalSubtitle = map.terminalSubtitle
      ? `<div class="location-map-terminal-subtitle">${escapeHtml(resolveDynamicText(map.terminalSubtitle))}</div>`
      : "";
    const entries = Array.isArray(map.timetableEntries) ? map.timetableEntries : [];
    const scheduleMarkup = entries.map((entry) => {
      const times = Array.isArray(entry?.times) ? entry.times : [];
      const statusTone = entry?.status === "여유"
        ? "calm"
        : entry?.status === "혼잡"
          ? "busy"
          : "normal";
      const timesMarkup = times.map((item) => `
        <div class="location-map-terminal-time${item?.highlight ? " is-highlight" : ""}">
          <strong>${escapeHtml(resolveDynamicText(item?.time || ""))}</strong>
          <span>${escapeHtml(resolveDynamicText(item?.label || ""))}</span>
        </div>
      `).join("");

      return `
        <div class="location-map-terminal-card">
          <div class="location-map-terminal-card-header">
            <div class="location-map-terminal-card-copy">
            <div class="location-map-terminal-destination">배금 → ${escapeHtml(resolveDynamicText(entry?.destination || ""))}</div>
              <div class="location-map-terminal-meta">${escapeHtml(resolveDynamicText(entry?.routeType || ""))} · ${escapeHtml(resolveDynamicText(entry?.platform || ""))}</div>
            </div>
            <span class="location-map-terminal-status is-${statusTone}">
              ${escapeHtml(resolveDynamicText(entry?.status || "보통"))}
            </span>
          </div>
          <div class="location-map-terminal-times">${timesMarkup}</div>
        </div>
      `;
    }).join("");
    const noticeMarkup = map.terminalNotice
      ? `<div class="location-map-terminal-notice">${escapeHtml(resolveDynamicText(map.terminalNotice))}</div>`
      : "";

    ui.message.innerHTML = `
      <div class="message-narration">
        ${titleMarkup}
        ${copyMarkup}
      </div>
      <div class="location-map location-map-bus-route is-terminal-schedule">
        ${tabsMarkup}
        <div class="location-map-terminal-hero">
          ${terminalName}
          ${terminalSubtitle}
        </div>
        <div class="location-map-terminal-schedule-list">
          ${scheduleMarkup}
        </div>
        ${noticeMarkup}
      </div>
    `;
    setTextboxAdvanceState(false);
    syncTextboxContentState();
    return;
  }

  const serviceLabel = map.serviceLabel
    ? `<span class="location-map-route-chip">${escapeHtml(resolveDynamicText(map.serviceLabel))}</span>`
    : "";
  const statusLabel = map.statusLabel
    ? `<span class="location-map-route-chip is-alert">${escapeHtml(resolveDynamicText(map.statusLabel))}</span>`
    : "";
  const routeName = map.routeTitle
    ? `<div class="location-map-route-name">${escapeHtml(resolveDynamicText(map.routeTitle))}</div>`
    : "";
  const routeDirection = map.routeSubtitle
    ? `<div class="location-map-route-direction">${escapeHtml(resolveDynamicText(map.routeSubtitle))}</div>`
    : "";
  const nextStopLabel = map.nextStopLabel
    ? `<div class="location-map-route-stat">
        <span>다음 주요 정차</span>
        <strong>${escapeHtml(resolveDynamicText(map.nextStopLabel))}</strong>
      </div>`
    : "";
  const intervalLabel = map.intervalLabel
    ? `<div class="location-map-route-stat">
        <span>배차 간격</span>
        <strong>${escapeHtml(resolveDynamicText(map.intervalLabel))}</strong>
      </div>`
    : "";
  const helperText = map.helperText
    ? `<div class="location-map-route-helper">${escapeHtml(resolveDynamicText(map.helperText))}</div>`
    : "";

  ui.message.innerHTML = `
    <div class="message-narration">
      ${titleMarkup}
      ${copyMarkup}
    </div>
    <div class="location-map location-map-bus-route">
      ${tabsMarkup}
      <div class="location-map-route-hero">
        <div class="location-map-route-badges">
          ${serviceLabel}
          ${statusLabel}
        </div>
        ${routeName}
        ${routeDirection}
        <div class="location-map-route-stats">
          ${nextStopLabel}
          ${intervalLabel}
        </div>
      </div>
      ${helperText}
    </div>
  `;
  setTextboxAdvanceState(false);
  syncTextboxContentState();
}

function renderLocationMap(locationConfig, currentLocationId = "") {
  const resolvedTitle = resolveDynamicText(locationConfig?.title || locationConfig?.label || "");
  const resolvedLines = (locationConfig?.lines || []).map(resolveDynamicText);
  const map = locationConfig?.map || {};
  if (map.variant === "bus-terminal" || map.variant === "bus-route") {
    renderBusRouteMap(locationConfig, map);
    return;
  }
  const titleMarkup = resolvedTitle
    ? `<div class="message-title">${escapeHtml(resolvedTitle)}</div>`
    : "";
  const copyMarkup = resolvedLines.length
    ? `<div class="message-copy">${resolvedLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>`
    : "";
  const mapTitle = map.title ? `<div class="location-map-title">${escapeHtml(map.title)}</div>` : "";
  const mapSubtitle = map.subtitle ? `<div class="location-map-subtitle">${escapeHtml(resolveDynamicText(map.subtitle))}</div>` : "";
  const nodes = Array.isArray(map.nodes) ? map.nodes : [];
  const currentNodeId = map.mode === "district" && typeof getCurrentDistrictId === "function"
    ? getCurrentDistrictId()
    : currentLocationId;
  const nodesMarkup = nodes.map((node) => {
    const isCurrent = node.id === currentNodeId;
    const currentBadge = isCurrent ? '<span class="location-map-badge">현재</span>' : "";
    const emoji = node.emoji ? `<span class="location-map-emoji">${escapeHtml(node.emoji)}</span>` : "";
    const note = node.note ? `<div class="location-map-note">${escapeHtml(resolveDynamicText(node.note))}</div>` : "";

    return `
      <div class="location-map-node${isCurrent ? " is-current" : ""}">
        <div class="location-map-label-row">
          <div class="location-map-label">
            ${emoji}
            <span>${escapeHtml(resolveDynamicText(node.label || node.id || ""))}</span>
          </div>
          ${currentBadge}
        </div>
        ${note}
      </div>
    `;
  }).join("");

  ui.message.innerHTML = `
    <div class="message-narration">
      ${titleMarkup}
      ${copyMarkup}
    </div>
    <div class="location-map">
      <div class="location-map-header">
        ${mapTitle}
        ${mapSubtitle}
      </div>
      <div class="location-map-grid">
        ${nodesMarkup}
      </div>
    </div>
  `;
  setTextboxAdvanceState(false);
  syncTextboxContentState();
}

function renderTags(tags = []) {
  ui.sceneTags.innerHTML = "";

  tags.forEach((tag) => {
    const element = document.createElement("span");
    element.className = "scene-tag";
    element.textContent = tag;
    ui.sceneTags.appendChild(element);
  });
}

function createBusRouteChoiceContent(button, {
  title,
  description = "",
  routeIcon = "",
  routeEta = "",
  routeBadge = "",
  routeStopType = "normal",
}) {
  button.classList.add("choice-btn-bus-route");
  button.classList.add(routeStopType === "major" ? "is-major" : "is-normal");

  const marker = document.createElement("span");
  marker.className = "choice-route-marker";
  button.appendChild(marker);

  const main = document.createElement("div");
  main.className = "choice-main choice-route-main";

  const top = document.createElement("div");
  top.className = "choice-route-top";

  const body = document.createElement("div");
  body.className = "choice-route-body";

  const titleRow = document.createElement("div");
  titleRow.className = "choice-route-title-row";

  if (routeIcon) {
    const icon = document.createElement("span");
    icon.className = "choice-route-icon";
    icon.textContent = routeIcon;
    titleRow.appendChild(icon);
  }

  const titleElement = document.createElement("span");
  titleElement.className = "choice-title choice-route-title";
  titleElement.textContent = title;
  titleRow.appendChild(titleElement);

  if (routeBadge) {
    const badge = document.createElement("span");
    badge.className = "choice-route-badge";
    badge.textContent = routeBadge;
    titleRow.appendChild(badge);
  }

  body.appendChild(titleRow);

  if (description) {
    const desc = document.createElement("span");
    desc.className = "choice-route-desc";
    desc.textContent = description;
    body.appendChild(desc);
  }

  top.appendChild(body);

  if (routeEta) {
    const eta = document.createElement("span");
    eta.className = "choice-route-eta";
    eta.textContent = routeEta;
    top.appendChild(eta);
  }

  main.appendChild(top);
  button.appendChild(main);
}

function createChoiceButton({
  title,
  earnText,
  onClick,
  uiVariant = "",
  buttonClassName = "",
  description = "",
  routeIcon = "",
  routeEta = "",
  routeBadge = "",
  routeStopType = "normal",
  gateSource = "scene-choice",
  gateActionId = "",
  allowedModes = null,
  suppressGateFeedback = false,
}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-btn";
  if (buttonClassName) {
    buttonClassName.split(/\s+/).filter(Boolean).forEach((className) => {
      button.classList.add(className);
    });
  }

  if (uiVariant === "bus-route") {
    createBusRouteChoiceContent(button, {
      title,
      description,
      routeIcon,
      routeEta,
      routeBadge,
      routeStopType,
    });
  } else {
    const main = document.createElement("div");
    main.className = "choice-main";

    const titleElement = document.createElement("span");
    titleElement.className = "choice-title";
    titleElement.textContent = title;
    main.appendChild(titleElement);

    button.appendChild(main);
  }

  if (earnText) {
    button.classList.add("has-earn");
  }

  if (earnText) {
    const earn = document.createElement("span");
    earn.className = "choice-earn";
    earn.textContent = earnText;
    button.appendChild(earn);
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();
    if (typeof onClick !== "function") {
      return;
    }

    if (typeof runGuardedUiAction === "function") {
      runGuardedUiAction(() => {
        onClick();
      }, {
        source: gateSource,
        actionId: gateActionId || title || "choice",
        allowedModes,
        suppressFeedback: suppressGateFeedback,
      });
      return;
    }

    onClick();
  });
  ui.choices.appendChild(button);
  syncTextboxContentState();
}

function renderOfferButtons(offers) {
  clearChoices();

  offers.forEach((offer, index) => {
    const job = typeof getOfferRuntimeDefinition === "function"
      ? getOfferRuntimeDefinition(offer)
      : JOB_LOOKUP[offer.jobId];
    if (!job) {
      return;
    }
    const workplace = typeof getOfferWorkplaceSummary === "function"
      ? getOfferWorkplaceSummary(offer, state)
      : null;
    createChoiceButton({
      title: `${job.emoji} ${job.title}`,
      earnText: formatMoney(offer.pay),
      description: [workplace?.workplaceName, workplace?.locationLabel].filter(Boolean).join(" · "),
      onClick: () => selectJobOffer(index),
    });
  });
}

function renderChoiceButtons(incident) {
  clearChoices();

  incident.choices.forEach((choice, index) => {
    createChoiceButton({
      title: choice.label,
      onClick: () => {
        if (typeof chooseWorkIncidentOption === "function") {
          chooseWorkIncidentOption(index);
          return;
        }
        chooseIncidentOption(index);
      },
    });
  });
}


function renderNextDayButton() {
  clearChoices();

  createChoiceButton({
    title: state.day >= MAX_DAYS ? "\ucd5c\uc885 \uc815\uc0b0 \ubcf4\uae30" : "\ub2e4\uc74c \ud134 \uacf5\uace0 \ubcf4\uae30",
    onClick: goToNextDay,
  });
}

function showMoneyEffect(amount, { destination = "" } = {}) {
  if (!amount) {
    return;
  }

  const destinationLabel = destination === "bank"
    ? "계좌 "
    : (destination === "cash" ? "현금 " : "");
  ui.moneyEffect.textContent = `${destinationLabel}${amount > 0 ? "+" : ""}${formatMoney(amount)}`;
  ui.moneyEffect.style.color = amount > 0 ? "#7fff7f" : "#ff6b6b";
  ui.moneyEffect.style.left = "50%";
  ui.moneyEffect.style.top = "160px";
  ui.moneyEffect.style.transform = "translateX(-50%)";
  ui.moneyEffect.style.opacity = "1";
  ui.moneyEffect.style.transition = "none";

  setTimeout(() => {
    ui.moneyEffect.style.transition = "top 1.1s ease-out, opacity 1.1s ease-out";
    ui.moneyEffect.style.top = "100px";
    ui.moneyEffect.style.opacity = "0";
  }, 30);
}

function setHudValueWarningState(element, level = "", title = "") {
  if (!element) {
    return;
  }

  element.classList.toggle("is-warning", level === "warning");
  element.classList.toggle("is-danger", level === "danger");
  if (title) {
    element.title = title;
  } else {
    element.removeAttribute("title");
  }
}

function applyHudResourceStatus(targetState = state) {
  const warningSnapshot = typeof getCriticalResourceWarningSnapshot === "function"
    ? getCriticalResourceWarningSnapshot(targetState)
    : null;
  const lifestyle = typeof getPlayerLifestyleSnapshot === "function"
    ? getPlayerLifestyleSnapshot(targetState)
    : null;
  const hungerState = typeof ensureHungerState === "function"
    ? ensureHungerState(targetState)
    : { value: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 100 };
  const hungerMax = typeof HUNGER_MAX === "number" ? HUNGER_MAX : 100;
  const cashOnHand = Math.max(0, Number(lifestyle?.cashOnHand ?? targetState?.money) || 0);
  const bankBalance = Math.max(0, Number(lifestyle?.bankBalance) || 0);
  const totalFunds = Math.max(0, Number(lifestyle?.liquidFunds ?? (cashOnHand + bankBalance)) || 0);
  const staminaValue = Math.max(0, Number(targetState?.stamina) || 0);

  setHudValueWarningState(
    ui.moneyDisplay,
    warningSnapshot?.cashLevel || "",
    `현금 ${formatMoney(cashOnHand)} / 총자금 ${formatMoney(totalFunds)}`,
  );
  setHudValueWarningState(
    ui.bankDisplay,
    warningSnapshot?.economyLevel || "",
    `계좌 ${formatMoney(bankBalance)} / 총자금 ${formatMoney(totalFunds)}`,
  );
  setHudValueWarningState(
    ui.staminaDisplay,
    warningSnapshot?.staminaLevel || "",
    `체력 ${staminaValue}`,
  );
  setHudValueWarningState(
    ui.hungerDisplay,
    warningSnapshot?.hungerLevel || "",
    `배고픔 ${hungerState.value}/${hungerMax}`,
  );
}

function renderPrologueScene() {
  const steps = getActiveStorySteps();
  const step = steps[state.storyStep] || steps[0];
  const interactiveStart = ["walk-to-exit", "press-exit"].includes(step?.startMode);

  setBackgroundByTone("prologue");
  if (step?.background) {
    const startBackground = typeof getSpoonStartStageBackground === "function"
      ? getSpoonStartStageBackground("spawn", state, step.background)
      : (typeof getSpoonStartSceneBackground === "function"
        ? getSpoonStartSceneBackground(step.background, state)
        : step.background);
    applySceneBackgroundConfig(startBackground);
  }
  setWorldMode(interactiveStart ? "interactive-start" : "prologue");
  setCharacter(step.character);

  if (interactiveStart) {
    const introState = typeof syncPrologueIntroState === "function"
      ? syncPrologueIntroState(state)
      : { playerLeft: Number(step?.player?.startLeft) || 24, facing: 1 };
    const spoonSpawnPlayerLayout = typeof getSpoonStartSpawnPlayerLayout === "function"
      ? getSpoonStartSpawnPlayerLayout(state)
      : null;
    const rawPlayerActor = step?.player
      ? {
          ...step.player,
          ...(spoonSpawnPlayerLayout || {}),
          left: introState.playerLeft,
          facing: introState.facing,
        }
      : null;
    const playerActor = rawPlayerActor && typeof resolveSceneActorPresentation === "function"
      ? resolveSceneActorPresentation(rawPlayerActor, state, {
          source: "prologue-scene",
          scene: state.scene,
          day: state.day,
        })
      : rawPlayerActor;

    renderActors(playerActor ? [playerActor] : []);
    setCharacterPosition(introState.playerLeft, introState.facing);
    setSceneSpeaker(step.speaker || "");
    renderTags(step.tags || []);
    clearMessage();
    clearChoices();
    syncGameplayObjectivePrompt(state);
    createChoiceButton({
      title: "밖으로 나가기",
      onClick: () => {
        if (typeof enterInteractivePrologueExit === "function") {
          enterInteractivePrologueExit(state);
        }
      },
    });
    return;
  }

  const resolvedActors = Array.isArray(step.actors)
    ? step.actors.map((actor) =>
        typeof resolveSceneActorPresentation === "function"
          ? resolveSceneActorPresentation(actor, state, {
              source: "prologue-scene",
              scene: state.scene,
              day: state.day,
            })
          : actor
      )
    : [];

  renderActors(resolvedActors);
  setCharacterPosition(50, 1);
  setSceneSpeaker(step.speaker);
  renderTags([]);
  setSceneInteractionPrompt("", false);
  const showChoices = renderMessage(step.title, step.lines, {
    progressKey: buildSceneTextProgressKey(`prologue:${state.storyKey}:${state.storyStep}`, step.title, step.lines),
  });
  clearChoices();

  if (!showChoices) {
    return;
  }

  (step.options || []).filter((option) => !option.hidden).forEach((option) => {
    createChoiceButton({
      title: option.title,
      onClick: () => handlePrologueOption(option.action),
    });
  });
}

function getHomeTransitionSceneCopy(stageId = "", direction = "outbound") {
  if (stageId === "transit") {
    return direction === "inbound"
      ? {
          speaker: "지하주차장",
          tag: "주차장",
          title: "차고 램프를 지나 집 안쪽으로 돌아간다",
          lines: [
            "주차장 안 공기가 조용하게 가라앉아 있다.",
            "램프를 지나 로비 쪽으로 올라가면 다시 집 안 동선으로 이어진다.",
          ],
        }
      : {
          speaker: "지하주차장",
          tag: "주차장",
          title: "차고 램프를 따라 집 밖으로 향한다",
          lines: [
            "셔터 너머로 바깥 공기와 도로 소음이 스며든다.",
            "램프 끝까지 나가면 곧장 집 앞 동선으로 이어진다.",
          ],
        };
  }

  return direction === "inbound"
    ? {
        speaker: "로비",
        tag: "로비",
        title: "로비를 지나 다시 집 안으로 올라간다",
        lines: [
          "문이 닫히며 바깥 소음이 한 번 꺾인다.",
          "복도와 엘리베이터를 지나면 다시 방으로 올라갈 수 있다.",
        ],
      }
    : {
        speaker: "로비",
        tag: "로비",
        title: "방을 나와 로비를 지나간다",
        lines: [
          "엘리베이터 앞 공기가 비어 있고, 바깥 동선이 바로 아래로 이어진다.",
          "문을 나서면 오늘 움직일 도시 쪽으로 바로 발을 뗄 수 있다.",
        ],
      };
}

function getHomeTransitionContinueLabel(stageId = "", direction = "outbound", nextStageId = "") {
  if (nextStageId === "transit") {
    return direction === "inbound" ? "주차장으로 내려간다" : "주차장으로 간다";
  }
  if (nextStageId === "lobby") {
    return direction === "inbound" ? "로비로 올라간다" : "로비로 간다";
  }

  return direction === "inbound"
    ? "방으로 올라간다"
    : "집 앞으로 나간다";
}

function renderHomeTransitionScene() {
  const homeTransition = typeof syncHomeTransitionState === "function"
    ? syncHomeTransitionState(state)
    : null;
  const stageId = typeof getCurrentHomeTransitionStageId === "function"
    ? getCurrentHomeTransitionStageId(state)
    : "";

  if (!homeTransition || !stageId) {
    state.scene = "room";
    renderGame();
    return;
  }

  const nextStageId = homeTransition.stageIds[homeTransition.currentIndex + 1] || "";
  const sceneCopy = getHomeTransitionSceneCopy(stageId, homeTransition.direction);
  const background = typeof getSpoonStartStageBackground === "function"
    ? getSpoonStartStageBackground(stageId, state, null)
    : null;

  setBackgroundByTone(stageId === "transit" ? "outside" : "room");
  if (!applySceneBackgroundConfig(background)) {
    clearSceneBackgroundOverride();
  }
  setWorldMode(stageId === "transit" ? "outside" : "room");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker(sceneCopy.speaker);
  renderTags(["이동", sceneCopy.tag]);

  const showChoices = renderMessage(sceneCopy.title, sceneCopy.lines, {
    progressKey: buildSceneTextProgressKey(
      `home-transition:${homeTransition.direction}:${stageId}:${homeTransition.currentIndex}`,
      sceneCopy.title,
      sceneCopy.lines
    ),
    revealAll: true,
  });
  clearChoices();

  if (!showChoices) {
    return;
  }

  createChoiceButton({
    title: getHomeTransitionContinueLabel(stageId, homeTransition.direction, nextStageId),
    onClick: () => advanceHomeTransition(state),
  });
}

function renderRoomScene() {
  setBackgroundByTone("room");
  const introStep = typeof getDayStoryData === "function"
    ? getDayStoryData(state.day)?.introSteps?.[0]
    : null;
  const startBackground = typeof getSpoonStartStageBackground === "function"
    ? getSpoonStartStageBackground("room", state, state.day === 1 ? (introStep?.background || null) : null)
    : (typeof getSpoonStartSceneBackground === "function"
      ? getSpoonStartSceneBackground(introStep?.background || null, state)
      : introStep?.background);
  if (startBackground) {
    applySceneBackgroundConfig(startBackground);
  }
  const spoonRoomActorLayout = typeof getSpoonStartRoomActorLayout === "function"
    ? getSpoonStartRoomActorLayout(state)
    : null;
  const rawRoomPlayerActor = {
    kind: "player",
    src: CHARACTER_ART?.player?.standing || "",
    alt: "player-room",
    left: 50,
    bottom: 2,
    height: 92,
    zIndex: 2,
    ...(spoonRoomActorLayout || {}),
  };
  const roomPlayerActor = typeof resolveSceneActorPresentation === "function"
    ? resolveSceneActorPresentation(rawRoomPlayerActor, state, {
        source: "room-scene",
        scene: state.scene,
        day: state.day,
      })
    : rawRoomPlayerActor;
  setWorldMode("room");
  setCharacter("");
  renderActors(roomPlayerActor?.src ? [roomPlayerActor] : []);
  setCharacterPosition(50, 1);
  setSceneSpeaker(typeof getInventoryResidenceLabel === "function" ? getInventoryResidenceLabel(state) : "\ubd80\ubaa8\ub2d8\uc9d1");
  renderTags([]);

  const shiftUi = typeof getScheduledShiftUiModel === "function"
    ? getScheduledShiftUiModel(state)
    : null;
  const shiftStatus = shiftUi?.shiftStatus || null;

  if (shiftStatus) {
    const revealMessageImmediately = consumePendingSceneTextReveal();
    const job = shiftUi?.job || JOB_LOOKUP[shiftStatus.scheduledShift.offer.jobId];
    const workplaceLine = shiftUi?.workplaceLine || "";
    const shiftWindow = shiftUi?.shiftWindowLabel || "";
    let showChoices = true;
    let messageTitle = "";
    let messageLines = [];

    if (shiftStatus.waiting) {
      messageTitle = "\uc624\ub298 \uc608\uc57d\ub41c \ucd9c\uadfc\uc774 \uc788\ub2e4";
      messageLines = [
        `${job.title} ${workplaceLine ? `${workplaceLine} ` : ""}\ucd9c\uadfc \uc2dc\uac04\uc740 ${shiftWindow}\uc774\ub2e4.`,
        `${shiftUi?.workplaceLabel || "\uadfc\ubb34\uc9c0"}\ub85c \uac00\uc57c \ucd9c\uadfc\uc774 \uc5f4\ub9b0\ub2e4. \ubc29\uc5d0\uc11c\ub294 \uc77c\ub2e8 \ub098\uac00\uc11c \uc774\ub3d9 \uc900\ube44\ub97c \ud574\uc57c \ud55c\ub2e4.`,
      ];
    } else if (shiftStatus.active) {
      messageTitle = "\ucd9c\uadfc \uc2dc\uac04\uc774 \ub418\uc5c8\ub2e4";
      messageLines = [
        `${job.title} ${workplaceLine ? `${workplaceLine} ` : ""}\uadfc\ubb34 \uc2dc\uac04\uc740 ${shiftWindow}\uc774\ub2e4.`,
        `\uc544\uc9c1 \ubc29 \uc548\uc774\ub2e4. \uc9c0\uae08 \ub098\uac00\uc11c ${shiftUi?.workplaceLabel || "\uadfc\ubb34\uc9c0"}\ub85c \uc774\ub3d9\ud574\uc57c \uc624\ub298 \uadfc\ubb34\ub97c \uc2dc\uc791\ud560 \uc218 \uc788\ub2e4.`,
      ];
    } else {
      messageTitle = "\uc608\uc57d\ub41c \ucd9c\uadfc \uc2dc\uac04\uc774 \uc9c0\ub0ac\ub2e4";
      messageLines = [
        `${job.title} ${workplaceLine ? `${workplaceLine} ` : ""}\uadfc\ubb34 \uc2dc\uac04 ${shiftWindow}\uc744 \ub193\uccd0\ub2e4.`,
        "\uacb0\uadfc \ucc98\ub9ac\ud558\uace0 \uc624\ub298\uc744 \ub118\uae38 \uc218 \uc788\ub2e4.",
      ];
    }

    showChoices = renderMessage(messageTitle, messageLines, {
      progressKey: buildSceneTextProgressKey(`room:${state.day}:${shiftStatus.startSlot}:${messageTitle}`, messageTitle, messageLines),
      revealAll: revealMessageImmediately,
    });
    clearChoices();
    syncGameplayObjectivePrompt(state);

    if (!showChoices) {
      return;
    }
  } else {
    clearMessage();
    clearChoices();
  }

  const romanceRoomEvent = !shiftStatus && typeof getTodayRomanceRoomEvent === "function"
    ? getTodayRomanceRoomEvent(state)
    : null;
  if (romanceRoomEvent) {
    const showChoices = renderMessage(romanceRoomEvent.title, romanceRoomEvent.lines, {
      progressKey: buildSceneTextProgressKey(
        `romance-room:${romanceRoomEvent.sceneType}:${romanceRoomEvent.contactId || romanceRoomEvent.npcId || romanceRoomEvent.label}:${state.day}`,
        romanceRoomEvent.title,
        romanceRoomEvent.lines,
      ),
      revealAll: true,
    });
    clearChoices();

    if (showChoices) {
      createChoiceButton({
        title: romanceRoomEvent.actionLabel,
        onClick: () => {
          if (typeof startTodayRomanceEvent === "function") {
            startTodayRomanceEvent(romanceRoomEvent.contactId, romanceRoomEvent.sceneType, state);
            renderGame();
          }
        },
      });
    }
  }

  if (shiftStatus) {
    if (shiftStatus.waiting) {
      createChoiceButton({
        title: "출근 전까지 방에서 쉬기",
        onClick: waitForScheduledShift,
      });
    }

    if (shiftStatus.waiting || shiftStatus.active) {
      createChoiceButton({
        title: `${shiftUi?.workplaceLabel || "근무지"}로 이동하기`,
        onClick: goOutside,
      });
    }

    createChoiceButton({
      title: "오늘 근무 포기",
      onClick: skipScheduledShift,
    });
  }

  const lectureGig = typeof getHomeLectureGigDefinition === "function"
    ? getHomeLectureGigDefinition(state)
    : null;
  if (lectureGig && typeof canHostHomeLectureGig === "function" && canHostHomeLectureGig(state)) {
    createChoiceButton({
      title: "집에서 임시 강연 진행",
      earnText: lectureGig.payoutRangeLabel,
      onClick: () => startHomeLectureGig(state),
    });
  }

  createChoiceButton({
    title: "방에서 쉬기",
    onClick: waitInRoom,
  });
  createChoiceButton({
    title: "밖으로 나가기",
    onClick: goOutside,
  });
  syncGameplayObjectivePrompt(state);
}


function renderOutsideScene() {
  const outsideScene = typeof getCurrentOutsideSceneConfig === "function"
    ? getCurrentOutsideSceneConfig()
    : null;
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId()
    : "";
  const homeLocationId = typeof getResolvedHomeLocationId === "function"
    ? getResolvedHomeLocationId(state)
    : (typeof getDayHomeLocationId === "function" ? getDayHomeLocationId(state.day) : "");
  const outsideBackground = currentLocationId && homeLocationId && currentLocationId === homeLocationId
    ? (typeof getSpoonStartStageBackground === "function"
      ? getSpoonStartStageBackground("outside-home", state, outsideScene?.background || null)
      : outsideScene?.background || null)
    : outsideScene?.background || null;

  setBackgroundByTone("outside");
  applySceneBackgroundConfig(outsideBackground);
  setWorldMode("outside");
  setCharacter("");
  renderActors(outsideScene?.actors || []);
  setCharacterPosition(50, 1);
  setSceneSpeaker(outsideScene?.speaker || outsideScene?.label || "\uc544\ud30c\ud2b8 \uc55e");
  renderTags(outsideScene?.tags || []);
  let showChoices = true;
  if (outsideScene?.map) {
    renderLocationMap(outsideScene, currentLocationId);
  } else {
    const revealMessageImmediately = consumePendingSceneTextReveal();
    const outsideTitle = outsideScene?.title || outsideScene?.label || "";
    const outsideLines = outsideScene?.lines || [];
    showChoices = renderMessage(outsideTitle, outsideLines, {
      progressKey: buildSceneTextProgressKey(`outside:${state.day}:${currentLocationId}`, outsideTitle, outsideLines),
      revealAll: revealMessageImmediately,
    });
  }
  clearChoices();
  syncGameplayObjectivePrompt(state);

  if (!showChoices) {
    if (typeof hideCityMapOverlay === "function") {
      hideCityMapOverlay({ preserveSelection: true });
    }
    return;
  }

  const choiceOptions = typeof getOutsideSceneActionOptions === "function"
    ? getOutsideSceneActionOptions(outsideScene, state)
    : (outsideScene?.options || []);
  const shiftUi = typeof getScheduledShiftUiModel === "function"
    ? getScheduledShiftUiModel(state)
    : null;
  const suppressGenericShiftButtons = Boolean(
    shiftUi?.isAtWorkplace
    && typeof isMcDonaldsLocationId === "function"
    && isMcDonaldsLocationId(shiftUi.currentLocationId || currentLocationId)
  );

  if (choiceOptions.some((option) => option.uiVariant === "bus-route")) {
    ui.choices.classList.add("is-bus-route");
  }

  if (shiftUi?.canWait && !suppressGenericShiftButtons) {
    createChoiceButton({
      title: "근무지에서 출근 시간까지 기다린다",
      onClick: waitForScheduledShift,
    });
  }

  if (shiftUi?.canStart && !suppressGenericShiftButtons) {
    createChoiceButton({
      title: `${shiftUi.workplaceLabel || "이 근무지"}로 출근한다`,
      onClick: startScheduledShift,
    });
  }

  if (shiftUi?.phase === "missed") {
    createChoiceButton({
      title: `${shiftUi.job?.title || "예약 근무"} 결근 처리`,
      onClick: skipScheduledShift,
    });
  }

  choiceOptions.forEach((option) => {
    createChoiceButton({
      title: option.title,
      uiVariant: option.uiVariant,
      description: option.description,
      routeIcon: option.routeIcon,
      routeEta: option.routeEta,
      routeBadge: option.routeBadge,
      routeStopType: option.routeStopType,
      onClick: () => handleOutsideOption(option),
    });
  });

  if (typeof renderCityMapOverlay === "function") {
    renderCityMapOverlay(state);
  }
}

function renderCasinoVenueScene() {
  const venueLocation = typeof getCurrentOutsideSceneConfig === "function"
    ? getCurrentOutsideSceneConfig(state)
    : null;
  const venueScreenId = typeof getCasinoVenueScreenId === "function"
    ? getCasinoVenueScreenId(state)
    : "home";
  const showVenueMeta = venueScreenId === "home";
  const venueTags = [...new Set(
    (Array.isArray(venueLocation?.tags) ? venueLocation.tags : [])
      .map((tag) => String(tag || "").trim())
      .filter(Boolean)
  )];

  setBackgroundByTone("outside");
  if (!applySceneBackgroundConfig(venueLocation?.background || null)) {
    clearSceneBackgroundOverride();
  }
  setWorldMode("outside");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker(showVenueMeta ? (venueLocation?.speaker || venueLocation?.label || "카지노") : "");
  renderTags(showVenueMeta ? venueTags : []);
  clearChoices();
  setTextboxAdvanceState(false);
  ui.message.innerHTML = `
    <div class="casino-venue-shell">
      <div class="casino-venue-toolbar">
        <div class="casino-venue-copy"></div>
        <button class="casino-mini-btn casino-venue-exit" type="button" data-casino-scene-action="leave">로비로</button>
      </div>
      <div class="casino-venue-body">
        ${buildCasinoVenueMarkup(venueScreenId)}
      </div>
    </div>
  `;
  syncTextboxContentState();
  syncGameplayObjectivePrompt(state);
  if (typeof syncCasinoSlotMachineMounts === "function") {
    syncCasinoSlotMachineMounts();
  }
}

function renderLectureScene() {
  const lectureGig = state.lectureGig;
  if (!lectureGig) {
    state.scene = "room";
    renderGame();
    return;
  }

  setBackgroundByTone("outside");
  if (!applySceneBackgroundConfig(lectureGig.backgroundConfig || null)) {
    clearSceneBackgroundOverride();
  }
  setWorldMode("incident");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker(lectureGig.venueLabel || "임시 강연장");
  renderTags([...(lectureGig.tags || ["강연", "사례비"])]);

  const isResultPhase = lectureGig.phase === "result";
  const title = isResultPhase
    ? (lectureGig.resultTitle || "강연을 마쳤다")
    : (lectureGig.title || "임시 강연");
  const lines = isResultPhase
    ? [...(lectureGig.resultLines || [])]
    : [...(lectureGig.introLines || [])];
  const showChoices = renderMessage(title, lines, {
    progressKey: buildSceneTextProgressKey(
      `lecture:${lectureGig.jobId || "gig"}:${state.day}:${lectureGig.phase || "intro"}`,
      title,
      lines,
    ),
  });
  clearChoices();
  syncGameplayObjectivePrompt(state);

  if (!showChoices) {
    return;
  }

  if (isResultPhase) {
    createChoiceButton({
      title: "집으로 돌아가기",
      onClick: () => finishHomeLectureGig(state),
    });
    return;
  }

  createChoiceButton({
    title: "강연 마치고 사례비 받기",
    earnText: formatMoney(lectureGig.pay || 0),
    onClick: () => completeHomeLectureGig(state),
  });
}

function renderPlasticSurgeryScene() {
  const surgeryScene = typeof getPlasticSurgerySceneConfig === "function"
    ? getPlasticSurgerySceneConfig(state)
    : null;
  if (!surgeryScene) {
    state.scene = "outside";
    renderGame();
    return;
  }

  setBackgroundByTone("outside");
  if (!applySceneBackgroundConfig(surgeryScene.backgroundConfig || null)) {
    clearSceneBackgroundOverride();
  }
  setWorldMode("incident");
  setCharacter("");
  renderActors((surgeryScene.actors || []).map((actor) =>
    (typeof resolveSceneActorPresentation === "function"
      ? resolveSceneActorPresentation(actor, state, {
          source: "plastic-surgery",
          stage: surgeryScene.stage,
        })
      : actor)
  ));
  setCharacterPosition(50, 1);
  setSceneSpeaker(surgeryScene.speaker || "배금병원 성형외과");
  renderTags(surgeryScene.tags || ["병원", "성형"]);

  const title = surgeryScene.title || "성형외과";
  const lines = Array.isArray(surgeryScene.lines) ? surgeryScene.lines : [];
  const showChoices = renderMessage(title, lines, {
    progressKey: buildSceneTextProgressKey(
      `plastic-surgery:${state.day}:${surgeryScene.stage || "consultation"}:${surgeryScene.selectedPlanId || ""}`,
      title,
      lines,
    ),
  });
  clearChoices();
  syncGameplayObjectivePrompt(state);

  if (!showChoices) {
    return;
  }

  const choices = Array.isArray(surgeryScene.choices) ? surgeryScene.choices : [];
  choices.forEach((choice, index) => {
    createChoiceButton({
      title: choice.title || `선택 ${index + 1}`,
      earnText: choice.earnText || "",
      description: choice.description || "",
      onClick: () => {
        if (choice.type === "plan" && typeof performPlasticSurgeryPlan === "function") {
          performPlasticSurgeryPlan(choice.planId, state);
          return;
        }
        if (choice.type === "advance" && typeof advancePlasticSurgeryEvent === "function") {
          advancePlasticSurgeryEvent(state);
          return;
        }
        if (choice.type === "finish" && typeof finishPlasticSurgeryEvent === "function") {
          finishPlasticSurgeryEvent(state);
          return;
        }
        if (choice.type === "cancel") {
          state.plasticSurgeryEvent = null;
          state.scene = "outside";
          state.phoneView = "home";
          renderGame();
        }
      },
    });
  });
}

function renderRomanceScene() {
  const romanceScene = typeof syncRomanceSceneState === "function"
    ? syncRomanceSceneState(state)
    : state.romanceScene;
  if (!romanceScene) {
    state.scene = "room";
    renderGame();
    return;
  }

  setBackgroundByTone(romanceScene.sceneType === "home-invite" ? "room" : "outside");
  if (!applySceneBackgroundConfig(romanceScene.backgroundConfig || null)) {
    clearSceneBackgroundOverride();
  }
  const sceneType = String(romanceScene.sceneType || "").trim().toLowerCase();
  const isHomeInvite = sceneType === "home-invite";
  const isAmbientScene = sceneType.startsWith("ambient");
  const isSocialScamScene = sceneType.startsWith("social-scam");

  setWorldMode(isHomeInvite ? "room" : "outside");
  setCharacter("");

  const playerActor = typeof resolveSceneActorPresentation === "function"
    ? resolveSceneActorPresentation({
        kind: "player",
        src: CHARACTER_ART?.player?.standing || "",
        alt: "player-romance",
        left: 28,
        bottom: 4,
        height: 86,
        zIndex: 2,
        ...(romanceScene.playerActor && typeof romanceScene.playerActor === "object"
          ? romanceScene.playerActor
          : {}),
      }, state, {
        source: "romance-scene",
        scene: state.scene,
        day: state.day,
      })
    : null;
  const npcDefinition = typeof NPC_DATA === "object"
    ? NPC_DATA?.[romanceScene.npcId] || null
    : null;
  const npcActorSource = String(
    (romanceScene.npcActor && typeof romanceScene.npcActor === "object" ? romanceScene.npcActor.src : "")
    || npcDefinition?.art
    || ""
  ).trim();
  const npcActor = npcActorSource
    ? (typeof resolveSceneActorPresentation === "function"
      ? resolveSceneActorPresentation({
        kind: "npc",
        src: npcActorSource,
        alt: romanceScene.label || romanceScene.npcId || "romance-npc",
        left: 72,
        bottom: 5,
        height: 88,
        zIndex: 2,
        ...(romanceScene.npcActor && typeof romanceScene.npcActor === "object"
          ? romanceScene.npcActor
          : {}),
      }, state, {
        source: "romance-scene",
        scene: state.scene,
        day: state.day,
      })
      : {
          kind: "npc",
          src: npcActorSource,
          alt: romanceScene.label || romanceScene.npcId || "romance-npc",
          left: 72,
          bottom: 5,
          height: 88,
          zIndex: 2,
          ...(romanceScene.npcActor && typeof romanceScene.npcActor === "object"
            ? romanceScene.npcActor
            : {}),
        })
    : null;
  const sceneChoices = Array.isArray(romanceScene.choices) ? romanceScene.choices : [];

  renderActors([playerActor, npcActor].filter((actor) => actor?.src));
  setCharacterPosition(50, 1);
  setSceneSpeaker(romanceScene.speaker || romanceScene.label || "데이트");
  renderTags(romanceScene.tags || []);
  const showChoices = renderMessage(romanceScene.title, romanceScene.introLines || [], {
    progressKey: buildSceneTextProgressKey(
      `romance:${romanceScene.sceneType}:${romanceScene.contactId || romanceScene.npcId || "scene"}:${state.day}`,
      romanceScene.title,
      romanceScene.introLines || [],
    ),
    revealAll: true,
  });
  clearChoices();
  syncGameplayObjectivePrompt(state);

  if (!showChoices) {
    return;
  }

  if (sceneChoices.length) {
    sceneChoices.forEach((choice, index) => {
      const choiceLabel = String(choice?.label || "").trim();
      if (!choiceLabel) {
        return;
      }

      createChoiceButton({
        title: choiceLabel,
        gateActionId: `romance-choice:${romanceScene.eventId || romanceScene.contactId || romanceScene.npcId || "scene"}:${choice.id || index}`,
        onClick: () => {
          if (isSocialScamScene) {
            if (typeof chooseSocialScamChoice === "function" && chooseSocialScamChoice(index, state) !== false) {
              renderGame();
            }
            return;
          }

          if (typeof chooseAmbientRomanceChoice === "function" && chooseAmbientRomanceChoice(index, state) !== false) {
            renderGame();
          }
        },
      });
    });
    return;
  }

  if (isSocialScamScene) {
    createChoiceButton({
      title: "상황 정리하기",
      onClick: () => {
        if (typeof completeSocialScamScene === "function" && completeSocialScamScene(state) !== false) {
          renderGame();
        }
      },
    });
    return;
  }

  createChoiceButton({
    title: isAmbientScene
      ? "이야기 마치기"
      : (isHomeInvite ? "집 초대 마치기" : "데이트 마치기"),
    earnText: romanceScene.plannedCost > 0 && !romanceScene.resolvedChoiceId
      ? `-${formatMoney(romanceScene.plannedCost)}`
      : "",
    onClick: () => {
      if (isAmbientScene) {
        if (typeof completeAmbientRomanceScene === "function" && completeAmbientRomanceScene(state) !== false) {
          renderGame();
        }
        return;
      }

      if (isSocialScamScene) {
        if (typeof completeSocialScamScene === "function" && completeSocialScamScene(state) !== false) {
          renderGame();
        }
        return;
      }

      if (typeof completeActiveRomanceScene === "function") {
        completeActiveRomanceScene(state);
        renderGame();
      }
    },
  });
}

function renderRomanceCallSessionScene(callSession) {
  const renderModel = typeof getRomanceCallSessionRenderModel === "function"
    ? getRomanceCallSessionRenderModel(state)
    : null;
  if (!renderModel) {
    if (typeof finishRomanceCallScene === "function") {
      finishRomanceCallScene(state);
      return;
    }
    state.scene = "room";
    renderGame();
    return;
  }

  const finishCallLabel = "?? ???";
  const baseTone = renderModel.sourceSceneType === "home-invite" ? "room" : "outside";
  setBackgroundByTone(baseTone);
  if (!applySceneBackgroundConfig(renderModel.backgroundConfig || null) && ui.bg) {
    ui.bg.style.transition = "none";
  }
  setWorldMode("result");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker(renderModel.speaker || callSession.label || "??");
  renderTags(renderModel.tags || ["??"]);
  const showChoices = renderMessage(renderModel.title || "?? ??", renderModel.lines || [], {
    progressKey: buildSceneTextProgressKey(
      renderModel.progressKey || `romance-call-session:${callSession.contactId || callSession.npcId || "call"}` ,
      renderModel.title || "?? ??",
      renderModel.lines || [],
    ),
  });
  clearChoices();
  syncGameplayObjectivePrompt(state);

  if (!showChoices) {
    return;
  }

  const sceneChoices = Array.isArray(renderModel.choices) ? renderModel.choices : [];
  if (sceneChoices.length) {
    sceneChoices.forEach((choice, index) => {
      const choiceLabel = String(choice?.label || "").trim();
      if (!choiceLabel) {
        return;
      }

      createChoiceButton({
        title: choiceLabel,
        gateActionId: `${renderModel.progressKey || "romance-call-session"}:${choice.id || index}`,
        onClick: () => {
          if (typeof chooseRomanceCallChoice === "function" && chooseRomanceCallChoice(index, state) !== false) {
            renderGame();
          }
        },
      });
    });
    return;
  }

  createChoiceButton({
    title: renderModel.advanceLabel || finishCallLabel,
    onClick: () => {
      if (renderModel.advanceLabel && renderModel.advanceLabel !== finishCallLabel && typeof advanceRomanceCallSession === "function") {
        if (advanceRomanceCallSession(state) !== false) {
          renderGame();
        }
        return;
      }

      if (typeof finishRomanceCallScene === "function") {
        finishRomanceCallScene(state);
      }
    },
  });
}

function renderRomanceCallScene() {
  const callSession = typeof getRomanceCallSession === "function"
    ? getRomanceCallSession(state)
    : null;
  if (callSession?.active) {
    renderRomanceCallSessionScene(callSession);
    return;
  }

  const callScene = typeof getRomanceCallScene === "function"
    ? getRomanceCallScene(state)
    : null;
  if (!callScene) {
    state.scene = "room";
    renderGame();
    return;
  }

  setBackgroundByTone("night");
  if (ui.bg) {
    ui.bg.className = "night";
    ui.bg.style.background = "linear-gradient(180deg, #050505 0%, #0e0e0e 46%, #191919 100%)";
    ui.bg.style.transition = "none";
  }
  setWorldMode("result");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker(callScene.label || "전화 통화");
  renderTags(callScene.tags || ["통화"]);
  const showChoices = renderMessage(callScene.title || "전화 통화", callScene.lines || [], {
    progressKey: buildSceneTextProgressKey(
      `romance-call:${callScene.contactId || callScene.npcId || "call"}:${state.day}`,
      callScene.title || "전화 통화",
      callScene.lines || [],
    ),
  });
  clearChoices();
  syncGameplayObjectivePrompt(state);

  if (!showChoices) {
    return;
  }

  const sceneChoices = Array.isArray(callScene.choices) ? callScene.choices : [];
  if (sceneChoices.length) {
    sceneChoices.forEach((choice, index) => {
      const choiceLabel = String(choice?.label || "").trim();
      if (!choiceLabel) {
        return;
      }

      createChoiceButton({
        title: choiceLabel,
        gateActionId: `romance-call:${callScene.contactId || callScene.npcId || "call"}:${choice.id || index}`,
        onClick: () => {
          if (typeof chooseRomanceCallChoice === "function" && chooseRomanceCallChoice(index, state) !== false) {
            renderGame();
          }
        },
      });
    });
    return;
  }

  createChoiceButton({
    title: "통화 마치기",
    onClick: () => {
      if (typeof finishRomanceCallScene === "function") {
        finishRomanceCallScene(state);
      }
    },
  });
}

function renderTurnBriefingScene() {
  const briefingEntry = typeof getActiveTurnBriefingEntry === "function"
    ? getActiveTurnBriefingEntry(state)
    : null;
  const briefingState = typeof syncTurnBriefingState === "function"
    ? syncTurnBriefingState(state)
    : null;

  if (!briefingEntry || !briefingState) {
    state.scene = "room";
    renderGame();
    return;
  }

  setBackgroundByTone("night");
  if (ui.bg) {
    ui.bg.className = "night";
    ui.bg.style.background = "linear-gradient(180deg, #000000 0%, #040404 46%, #101010 100%)";
    ui.bg.style.transition = "none";
  }
  setWorldMode("result");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker(briefingEntry.speaker || "다음날 요약");
  renderTags([
    `다음날 ${briefingState.currentIndex + 1}/${briefingState.entries.length}`,
    ...(briefingEntry.tags || []),
  ]);
  const showChoices = renderMessage(briefingEntry.title || "다음날 소식", briefingEntry.lines || [], {
    progressKey: buildSceneTextProgressKey(
      `turn-briefing:${briefingState.day}:${briefingState.currentIndex}:${briefingEntry.id || "entry"}`,
      briefingEntry.title || "다음날 소식",
      briefingEntry.lines || [],
    ),
  });
  clearChoices();
  syncGameplayObjectivePrompt(state);

  if (!showChoices) {
    return;
  }

  const isLastEntry = briefingState.currentIndex >= briefingState.entries.length - 1;
  createChoiceButton({
    title: isLastEntry ? "하루 시작" : "다음 사건 보기",
    onClick: () => {
      if (typeof advanceTurnBriefing === "function") {
        advanceTurnBriefing(state);
      }
    },
  });
}

function renderNightAutoSleepScene() {
  const summary = state.nightAutoSleep && typeof state.nightAutoSleep === "object"
    ? state.nightAutoSleep
    : null;

  if (!summary?.pending) {
    state.scene = "room";
    renderGame();
    return;
  }

  setBackgroundByTone("night");
  if (ui.bg) {
    ui.bg.className = "night";
    ui.bg.style.background = "linear-gradient(180deg, #000000 0%, #020202 45%, #0b0b0b 100%)";
    ui.bg.style.transition = "none";
  }
  setWorldMode("result");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker("야간 귀가");
  renderTags(["22:00", "자동 취침", "집 복귀"]);
  const lines = Array.isArray(summary.lines) && summary.lines.length
    ? summary.lines
    : [
        "밤 10시가 넘자 더 돌아다니지 못하고 집으로 돌아갔다.",
        "다음 턴은 아침 8시, 집 안에서 다시 시작된다.",
      ];
  const showChoices = renderMessage(summary.title || "밤이 깊어졌다", lines, {
    progressKey: buildSceneTextProgressKey(
      `night-auto-sleep:${summary.triggeredDay || state.day}:${summary.triggeredSlot || 44}`,
      summary.title || "밤이 깊어졌다",
      lines,
    ),
  });
  clearChoices();
  syncGameplayObjectivePrompt(state);

  if (!showChoices) {
    return;
  }

  createChoiceButton({
    title: "집으로 돌아가 잠든다",
    onClick: () => {
      if (typeof confirmNightAutoSleep === "function") {
        confirmNightAutoSleep();
      }
    },
  });
}

function renderLottoPickScene() {
  {
    const lottoState = typeof syncLottoRetailerState === "function"
      ? syncLottoRetailerState(state)
      : null;
    const pickSession = lottoState?.pickSession || null;
    if (!pickSession) {
      state.scene = "outside";
      renderGame();
      return;
    }

    const venueLocation = typeof getWorldLocationConfig === "function"
      ? getWorldLocationConfig("lotto-retailer-interior", state.day)
      : null;
    const purchaseSnapshot = typeof getLottoRetailerPurchaseSnapshot === "function"
      ? getLottoRetailerPurchaseSnapshot(state)
      : null;
    const remainingCount = Math.max(
      0,
      Number(purchaseSnapshot?.remaining)
        || (typeof LOTTO_TICKET_DAILY_LIMIT === "number" ? LOTTO_TICKET_DAILY_LIMIT : 5),
    );
    const board = Array.isArray(pickSession.board) ? pickSession.board : [];
    const boardMarkup = board.map((cell, index) => {
      const prizeRule = typeof getLottoPrizeRuleById === "function"
        ? getLottoPrizeRuleById(cell?.prizeId || "miss")
        : null;
      const revealed = Boolean(cell?.revealed);
      const cellLabel = revealed
        ? (prizeRule?.scratchLabel || prizeRule?.label || "?")
        : "긁기";
      const cellClassName = [
        "lotto-scratch-cell",
        revealed ? "is-revealed" : "is-hidden",
        prizeRule?.id ? `is-${escapeHtml(prizeRule.id)}` : "",
      ].filter(Boolean).join(" ");

      return `
        <button
          type="button"
          class="${cellClassName}"
          data-lotto-scratch-index="${index}"
          ${revealed ? "disabled" : ""}
        >
          <span class="lotto-scratch-cell-index">${index + 1}</span>
          <strong>${escapeHtml(cellLabel)}</strong>
        </button>
      `;
    }).join("");
    const oddsLines = typeof buildLottoPrizeGuideLines === "function"
      ? buildLottoPrizeGuideLines()
      : [];
    const oddsMarkup = oddsLines.map((line) => `
      <div class="lotto-scratch-odds-row">${escapeHtml(line)}</div>
    `).join("");

    setBackgroundByTone("outside");
    if (!applySceneBackgroundConfig(venueLocation?.background || null)) {
      clearSceneBackgroundOverride();
    }
    setWorldMode("incident");
    setCharacter("");
    renderActors([]);
    setCharacterPosition(50, 1);
    setSceneSpeaker("즉석복권 판매장");
    renderTags(["즉석복권", `${remainingCount}장 남음`]);
    clearChoices();
    setTextboxAdvanceState(false);
    ui.message.innerHTML = `
      <div class="lotto-scratch-shell">
        <div class="lotto-ticket-header">
          <span class="lotto-ticket-brand">즉석복권</span>
          <span class="lotto-ticket-price-badge">${escapeHtml(typeof formatMoney === "function" ? formatMoney(LOTTO_TICKET_PRICE) : "1,000원")}</span>
        </div>
        <div class="lotto-scratch-area">
          <div class="lotto-scratch-instruction">3칸이 모두 같으면 당첨!</div>
          <div class="lotto-scratch-board">
            ${boardMarkup}
          </div>
        </div>
        <div class="lotto-scratch-footer">
          <div class="lotto-scratch-actions">
            <button type="button" class="lotto-scratch-action" data-lotto-scratch-leave="true">나가기</button>
          </div>
        </div>
      </div>
    `;
    syncTextboxContentState();
    syncGameplayObjectivePrompt(state);

    Array.from(ui.message.querySelectorAll("[data-lotto-scratch-index]")).forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.lottoScratchIndex);
        if (typeof scratchLottoRetailerCell === "function") {
          scratchLottoRetailerCell(index, state);
        }
      });
    });
    const leaveButton = ui.message.querySelector("[data-lotto-scratch-leave]");
    if (leaveButton) {
      leaveButton.addEventListener("click", () => {
        if (typeof cancelLottoRetailerPickSession === "function") {
          cancelLottoRetailerPickSession(state);
        }
      });
    }
    return;
  }

  const lottoState = typeof syncLottoRetailerState === "function"
    ? syncLottoRetailerState(state)
    : null;
  const pickSession = lottoState?.pickSession || null;
  if (!pickSession) {
    state.scene = "outside";
    renderGame();
    return;
  }

  const venueLocation = typeof getWorldLocationConfig === "function"
    ? getWorldLocationConfig("lotto-retailer-interior", state.day)
    : null;
  const purchaseSnapshot = typeof getLottoRetailerPurchaseSnapshot === "function"
    ? getLottoRetailerPurchaseSnapshot(state)
    : null;
  const remainingCount = Math.max(
    0,
    Number(purchaseSnapshot?.remaining)
      || (typeof LOTTO_TICKET_DAILY_LIMIT === "number" ? LOTTO_TICKET_DAILY_LIMIT : 5),
  );
  const lines = [
    `번호 하나를 고르면 ${typeof formatMoney === "function" ? formatMoney(LOTTO_TICKET_PRICE) : "1,000원"}으로 바로 추첨한다.`,
    `오늘 남은 구매 가능 수량은 ${remainingCount}장이다.`,
    "등수 안내: 1등 6개 / 2등 5개+보너스 / 3등 5개 / 4등 4개 / 5등 3개 일치",
  ];

  setBackgroundByTone("outside");
  if (!applySceneBackgroundConfig(venueLocation?.background || null)) {
    clearSceneBackgroundOverride();
  }
  setWorldMode("incident");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker("로또판매장");
  renderTags(["번호 선택", "즉시 추첨", `${remainingCount}장 남음`]);
  const showChoices = renderMessage("번호를 고른다", lines, {
    progressKey: buildSceneTextProgressKey(
      `lotto-pick:${state.day}:${remainingCount}:${pickSession.candidates?.length || 0}`,
      "번호를 고른다",
      lines,
    ),
  });
  clearChoices();
  syncGameplayObjectivePrompt(state);

  if (!showChoices) {
    return;
  }

  (pickSession.candidates || []).forEach((candidate, index) => {
    const numberText = typeof formatLottoNumberSet === "function"
      ? formatLottoNumberSet(candidate?.numbers || [])
      : "";
    createChoiceButton({
      title: `번호 ${numberText}`,
      earnText: typeof formatMoney === "function" ? formatMoney(LOTTO_TICKET_PRICE) : "1,000원",
      onClick: () => {
        if (typeof confirmLottoRetailerPick === "function") {
          confirmLottoRetailerPick(index);
        }
      },
    });
  });

  createChoiceButton({
    title: "번호 다시 받기",
    onClick: () => {
      if (typeof rerollLottoRetailerPickSession === "function") {
        rerollLottoRetailerPickSession();
      }
    },
  });

  createChoiceButton({
    title: "구매 취소",
    onClick: () => {
      if (typeof cancelLottoRetailerPickSession === "function") {
        cancelLottoRetailerPickSession();
      }
    },
  });
}

function renderLottoResultScene() {
  {
    const lottoState = typeof syncLottoRetailerState === "function"
      ? syncLottoRetailerState(state)
      : null;
    const summary = lottoState?.lastDrawSummary || null;
    if (!summary) {
      state.scene = "outside";
      renderGame();
      return;
    }

    const venueLocation = typeof getWorldLocationConfig === "function"
      ? getWorldLocationConfig("lotto-retailer-interior", state.day)
      : null;
    const purchaseSnapshot = typeof getLottoRetailerPurchaseSnapshot === "function"
      ? getLottoRetailerPurchaseSnapshot(state)
      : null;
    const remainingCount = Math.max(0, Number(purchaseSnapshot?.remaining) || 0);
    const canBuyMore = remainingCount > 0
      && (typeof canAfford !== "function" || canAfford(LOTTO_TICKET_PRICE, state));
    setBackgroundByTone("outside");
    if (!applySceneBackgroundConfig(venueLocation?.background || null)) {
      clearSceneBackgroundOverride();
    }
    setWorldMode("incident");
    setCharacter("");
    renderActors([]);
    setCharacterPosition(50, 1);
    setSceneSpeaker("즉석복권 판매장");
    renderTags(["즉석복권", `${remainingCount}장 남음`]);
    clearChoices();
    setTextboxAdvanceState(false);
    const isWin = (Number(summary.payout) || 0) > 0;
    const prizeLabel = isWin
      ? (typeof getLottoPrizeRuleById === "function" ? getLottoPrizeRuleById(summary.prizeId || "miss").label : "") : "";
    ui.message.innerHTML = `
      <div class="lotto-scratch-shell is-result">
        <div class="lotto-ticket-header">
          <span class="lotto-ticket-brand">즉석복권</span>
          <span class="lotto-ticket-price-badge">${escapeHtml(prizeLabel || (isWin ? "당첨" : "꽝"))}</span>
        </div>
        <div class="lotto-scratch-area">
          <div class="lotto-scratch-result-payout${isWin ? " is-win" + (summary.prizeId === "jackpot" || summary.prizeId === "super" ? " is-" + escapeHtml(summary.prizeId) : "") : " is-miss"}">
            ${isWin
              ? `${escapeHtml(typeof formatMoney === "function" ? formatMoney(summary.payout || 0) : "0원")} 획득`
              : "꽝"}
          </div>
        </div>
        <div class="lotto-scratch-footer">
          <div class="lotto-scratch-actions">
            ${canBuyMore ? '<button type="button" class="lotto-scratch-action is-primary" data-lotto-result-rebuy="true">한 장 더</button>' : ""}
            <button type="button" class="lotto-scratch-action" data-lotto-result-close="true">돌아가기</button>
          </div>
        </div>
      </div>
    `;
    syncTextboxContentState();
    syncGameplayObjectivePrompt(state);

    const rebuyButton = ui.message.querySelector("[data-lotto-result-rebuy]");
    if (rebuyButton) {
      rebuyButton.addEventListener("click", () => {
        if (typeof buyLottoRetailerTicket === "function") {
          buyLottoRetailerTicket(state);
        }
      });
    }

    const closeButton = ui.message.querySelector("[data-lotto-result-close]");
    if (closeButton) {
      closeButton.addEventListener("click", () => dismissLottoRetailerResult(state));
    }
    return;
  }

  const lottoState = typeof syncLottoRetailerState === "function"
    ? syncLottoRetailerState(state)
    : null;
  const summary = lottoState?.lastDrawSummary || null;
  if (!summary) {
    state.scene = "room";
    renderGame();
    return;
  }

  const venueLocation = typeof getWorldLocationConfig === "function"
    ? getWorldLocationConfig("lotto-retailer-interior", state.day)
    : null;

  setBackgroundByTone("outside");
  if (!applySceneBackgroundConfig(venueLocation?.background || null)) {
    clearSceneBackgroundOverride();
  }
  setWorldMode("incident");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker("복권 결과");
  renderTags(["로또", "추첨 결과"]);
  const showChoices = renderMessage(summary.title || "복권 결과", summary.lines || [], {
    progressKey: buildSceneTextProgressKey(
      `lotto-result:${state.day}:${summary.ticketCount || 0}:${summary.payout || 0}`,
      summary.title || "복권 결과",
      summary.lines || [],
    ),
  });
  clearChoices();
  syncGameplayObjectivePrompt(state);

  if (!showChoices) {
    return;
  }

  createChoiceButton({
    title: summary.returnScene === "outside" ? "판매장으로 돌아간다" : "다음으로 넘어간다",
    onClick: () => dismissLottoRetailerResult(state),
  });
}


function renderBoardScene() {
  setBackgroundByTone("board");
  setWorldMode("board");
  setCharacter("\u{1F9D1}");
  setCharacterPosition(50, 1);
  setSceneSpeaker("\uad6c\uc778 \uc571");
  renderTags([]);
  clearMessage();
  const jobsState = typeof getJobsDomainState === "function"
    ? getJobsDomainState(state)
    : (state.jobs || {});
  renderOfferButtons(jobsState.dailyOffers || []);
}


function renderCleanupScene() {
  setBackgroundByTone("cleanup");
  setWorldMode("cleanup");
  setCharacter("");
  setCharacterPosition(50, 1);
  setSceneSpeaker("\ubd80\ubaa8\ub2d8\uc9d1");
  renderTags([]);
  clearMessage();
  clearChoices();
  renderTrashGame();
}

function renderJobMiniGameScene() {
  const game = state.jobMiniGame;
  const job = game?.offer && typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(game.offer)
    : (game?.jobId ? JOB_LOOKUP[game.jobId] : null);

  if (!game || !job) {
    if (typeof recoverBrokenJobMiniGameState === "function") {
      recoverBrokenJobMiniGameState("render-missing-context");
    } else {
      hideJobMiniGame();
      renderGame();
    }
    return;
  }

  setBackgroundByTone(job.tone);
  if (!applySceneBackgroundConfig(job.sceneBackground || null)) {
    clearSceneBackgroundOverride();
  }
  setWorldMode("incident");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker(`${job.emoji} ${job.title}`);
  renderTags(["미니게임", job.category || "알바"]);
  renderMessage(game.title || "알바 미니게임", [
    game.intro || `${job.title} 시작 전에 핵심 업무를 먼저 정리하자.`,
  ], {
    progressKey: buildSceneTextProgressKey(`job-minigame:${game.jobId}:${game.id}`, game.title || "", [
      game.intro || "",
    ]),
  });
  clearChoices();
  createChoiceButton({
    title: "준비를 중단한다",
    description: "보너스 없이 다음 단계로 넘어간다",
    onClick: () => {
      if (typeof cancelJobMiniGame === "function") {
        cancelJobMiniGame("choice-cancel");
      }
    },
    gateSource: "minigame-action",
    gateActionId: `job-minigame:cancel:${game.id || game.jobId || "current"}`,
    allowedModes: ["minigame"],
    suppressGateFeedback: true,
  });
  renderJobMiniGame();
}

function getSceneTimeText() {
  if (typeof formatClockTime === "function") {
    return formatClockTime(state.timeSlot, state.timeMinuteOffset || 0);
  }

  return "08:00";
}

function renderIncidentScene() {
  const offer = state.currentOffer || null;
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : JOB_LOOKUP[offer?.jobId];
  if (!job) {
    state.scene = "room";
    renderGame();
    return;
  }

  setBackgroundByTone(job.tone);
  if (!applySceneBackgroundConfig(state.currentIncident?.backgroundConfig || job.sceneBackground || null)) {
    clearSceneBackgroundOverride();
  }
  setWorldMode("incident");
  setCharacter(job.sceneBackground ? "" : job.emoji);
  setCharacterPosition(50, 1);
  setSceneSpeaker(`${job.emoji} ${job.title}`);
  renderTags([]);
  const showChoices = renderMessage(state.currentIncident.title, state.currentIncident.intro, {
    progressKey: buildSceneTextProgressKey(
      `incident:${offer?.careerPostingId || offer?.jobId || "work"}:${state.currentIncident.title}`,
      state.currentIncident.title,
      state.currentIncident.intro,
    ),
  });
  clearChoices();

  if (!showChoices) {
    return;
  }

  renderChoiceButtons(state.currentIncident);
}

function renderClockOutScene() {
  const summary = state.clockOutSummary;
  const offer = summary?.offer || state.currentOffer || null;
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : JOB_LOOKUP[offer?.jobId];
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, state)
    : null;

  if (!summary || !job) {
    state.scene = "room";
    renderGame();
    return;
  }

  setBackgroundByTone(job.tone);
  if (!applySceneBackgroundConfig(job.sceneBackground || null)) {
    clearSceneBackgroundOverride();
  }
  setWorldMode("incident");
  setCharacter(job.sceneBackground ? "" : job.emoji);
  setCharacterPosition(50, 1);
  setSceneSpeaker(workplace?.workplaceName || `${job.emoji} ${job.title}`);
  renderTags(["퇴근", job.category || "근무"]);
  const showChoices = renderMessage(summary.sceneTitle || "퇴근 준비", summary.sceneLines || [], {
    progressKey: buildSceneTextProgressKey(
      `clockout:${state.day}:${offer?.careerPostingId || offer?.jobId || "work"}:${summary.pay || 0}`,
      summary.sceneTitle || "퇴근 준비",
      summary.sceneLines || [],
    ),
  });
  clearChoices();

  if (!showChoices) {
    return;
  }

  createChoiceButton({
    title: "퇴근하고 정산 보기",
    onClick: () => {
      if (typeof completeWorkClockOut === "function") {
        completeWorkClockOut(state);
      }
    },
  });
}

function renderDialogueScene() {
  const dialogueNode = typeof getActiveDialogueNode === "function"
    ? getActiveDialogueNode(state)
    : null;
  const dialogueState = typeof syncDialogueState === "function"
    ? syncDialogueState(state)
    : (state.dialogue && typeof state.dialogue === "object" ? state.dialogue : null);
  const outsideScene = typeof getCurrentOutsideSceneConfig === "function"
    ? getCurrentOutsideSceneConfig(state)
    : null;
  const dialogueActors = Array.isArray(dialogueState?.actorsSnapshot) && dialogueState.actorsSnapshot.length
    ? dialogueState.actorsSnapshot
    : (outsideScene?.actors || []);

  if (!dialogueNode) {
    if (typeof endNpcDialogue === "function") {
      endNpcDialogue(state);
    }
    renderGame();
    return;
  }

  const hasCapturedBackground = applySceneBackgroundSnapshot(dialogueState?.backgroundSnapshot || null);
  if (!hasCapturedBackground) {
    setBackgroundByTone("outside");
    applySceneBackgroundConfig(outsideScene?.background || null);
  }
  setWorldMode("outside");
  setCharacter("");
  renderActors(dialogueActors);
  setCharacterPosition(50, 1);
  setSceneSpeaker(dialogueNode.speaker || "대화");
  renderTags(dialogueNode.tags || ["대화"]);

  const showChoices = renderMessage(dialogueNode.title || "", dialogueNode.lines || [], {
    progressKey: buildSceneTextProgressKey(
      `dialogue:${state.day}:${dialogueNode.npcId}:${dialogueNode.nodeId}`,
      dialogueNode.title || "",
      dialogueNode.lines || []
    ),
  });
  clearChoices();

  if (!showChoices) {
    return;
  }

  const choices = Array.isArray(dialogueNode.choices) ? dialogueNode.choices : [];
  if (!choices.length) {
    createChoiceButton({
      title: "대화를 마친다",
      onClick: () => {
        if (typeof endNpcDialogue === "function") {
          endNpcDialogue(state);
        }
        renderGame();
      },
    });
    return;
  }

  choices.forEach((choice, index) => {
    createChoiceButton({
      title: choice.label || choice.title || `선택 ${index + 1}`,
      onClick: () => {
        if (typeof chooseDialogueOption === "function") {
          chooseDialogueOption(index, state);
        }
        renderGame();
      },
    });
  });
}


function renderResultScene() {
  const offer = state.currentOffer || null;
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : JOB_LOOKUP[offer?.jobId];
  if (!job) {
    state.scene = "room";
    renderGame();
    return;
  }

  setBackgroundByTone(job.tone);
  setWorldMode("result");
  setCharacter(job.emoji);
  setCharacterPosition(50, 1);
  setSceneSpeaker("\uadf8\ub0a0 \uadfc\ubb34 \uc885\ub8cc");
  renderTags([]);
  const resultTitle = state.lastResult?.depositDestination === "bank"
    ? `오늘 계좌에 들어온 돈 ${formatMoney(state.lastResult.pay)}`
    : `오늘 손에 쥔 돈 ${formatMoney(state.lastResult.pay)}`;
  const showChoices = renderMessage(resultTitle, state.lastResult.lines, {
    progressKey: buildSceneTextProgressKey(
      `result:${state.day}:${offer?.careerPostingId || offer?.jobId || "work"}:${state.lastResult.pay}`,
      resultTitle,
      state.lastResult.lines,
    ),
  });

  if (!showChoices) {
    clearChoices();
    return;
  }

  clearChoices();
  const lectureGig = typeof getHomeLectureGigDefinition === "function"
    ? getHomeLectureGigDefinition(state)
    : null;
  if (lectureGig && typeof canHostHomeLectureGig === "function" && canHostHomeLectureGig(state)) {
    createChoiceButton({
      title: "집으로 돌아가 강연하기",
      earnText: lectureGig.payoutRangeLabel,
      onClick: () => returnHomeForLecture(state),
    });
  }
  createChoiceButton({
    title: state.day >= MAX_DAYS ? "\ucd5c\uc885 \uc815\uc0b0 \ubcf4\uae30" : "\ub2e4\uc74c \ud134 \uacf5\uace0 \ubcf4\uae30",
    onClick: goToNextDay,
  });
}


function renderEndingScene() {
  const summary = state.endingSummary;
  const isEscapeEnding = Boolean(summary?.noRanking);

  setBackgroundByTone(isEscapeEnding ? "outside" : "board");
  if (!applySceneBackgroundConfig(summary?.backgroundConfig || null)) {
    clearSceneBackgroundOverride();
  }
  setWorldMode("ending");
  setCharacter(summary?.character ?? (isEscapeEnding ? "" : "\u{1F4B0}"));
  setCharacterPosition(50, 1);
  setSceneSpeaker(summary?.speaker || "\uc815\uc0b0\ud45c");
  const endingTags = isEscapeEnding
    ? [...(summary?.tags || ["\ub3c4\uc2dc \uc774\ud0c8"])]
    : [`\ub7ad\ud0b9 ${summary.rank.label}`, summary.rank.title];
  if (summary?.originLabel && !endingTags.includes(summary.originLabel)) {
    endingTags.push(summary.originLabel);
  }
  renderTags(endingTags);
  const endingTitle = summary?.title || `최종 보유 자금 ${formatMoney(summary.totalCash)}`;
  const showChoices = renderMessage(endingTitle, summary.lines, {
    progressKey: buildSceneTextProgressKey(
      isEscapeEnding
        ? `ending:escape:${endingTitle}`
        : `ending:${summary.totalCash}:${summary.rank.label}`,
      endingTitle,
      summary.lines
    ),
  });
  clearChoices();

  if (!showChoices) {
    return;
  }

  createChoiceButton({
    title: "\ucc98\uc74c\ubd80\ud130 \ub2e4\uc2dc \ud558\uae30",
    onClick: restartToTitle,
  });
}


function renderGame() {
  const totalDays = typeof MAX_DAYS === "number" ? MAX_DAYS : 30;
  let lifestyle = null;
  let cashOnHand = Math.max(0, Number(state?.money) || 0);
  let bankBalance = 0;

  if (typeof normalizeStateForCurrentRules === "function") {
    normalizeStateForCurrentRules();
  }
  if (typeof normalizePlayerProgressionState === "function") {
    normalizePlayerProgressionState(state);
  }
  lifestyle = typeof getPlayerLifestyleSnapshot === "function"
    ? getPlayerLifestyleSnapshot(state)
    : null;
  cashOnHand = Math.max(0, Number(lifestyle?.cashOnHand ?? state.money) || 0);
  bankBalance = Math.max(0, Number(lifestyle?.bankBalance) || 0);
  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(state);
  }
  if (ui.game && typeof getCurrentInputGateMode === "function") {
    const inputMode = getCurrentInputGateMode(state);
    ui.game.dataset.inputMode = inputMode;
    ui.game.classList.toggle("is-input-locked", inputMode !== "normal");
  }

  updatePhonePanel();
  renderActors([]);
  if (state.scene !== "cleanup") {
    hideTrashGame();
  }
  if (state.scene !== "job-minigame") {
    hideJobMiniGame();
  }
  ui.dayDisplay.textContent = typeof formatTurnProgress === "function"
    ? formatTurnProgress(state.day, totalDays)
    : `${state.day}/${totalDays}`;
  ui.moneyDisplay.textContent = `현금 ${typeof formatCashHud === "function" ? formatCashHud(cashOnHand) : formatMoney(cashOnHand)}`;
  if (ui.bankDisplay) {
    ui.bankDisplay.textContent = `계좌 ${typeof formatCashHud === "function" ? formatCashHud(bankBalance) : formatMoney(bankBalance)}`;
  }
  ui.staminaDisplay.textContent = `${state.stamina}`;
  ui.energyDisplay.textContent = `${state.energy}`;
  if (ui.hungerDisplay) {
    const hungerState = typeof ensureHungerState === "function"
      ? ensureHungerState(state)
      : { value: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 100 };
    const hungerMax = typeof HUNGER_MAX === "number" ? HUNGER_MAX : 100;
    ui.hungerDisplay.textContent = `${hungerState.value}/${hungerMax}`;
  }
  applyHudResourceStatus(state);
  ui.timeDisplay.textContent = getSceneTimeText();
  const headline = state?.headline && typeof state.headline === "object"
    ? state.headline
    : { badge: "", text: "" };
  setHeadline(headline.badge || "", headline.text || "");
  renderGameplayFeedback();
  setProgressByScene(state.scene);
  renderMemoryPanel();
  renderInventoryPanel();
  renderCharacterPanel();
  setSceneInteractionPrompt("", false);
  if (typeof persistState === "function") {
    persistState("render");
  }

  if (state.scene !== "outside" && typeof hideCityMapOverlay === "function") {
    hideCityMapOverlay({ preserveSelection: false });
  }

  if (state.scene === "prologue") {
    renderPrologueScene();
    return;
  }

  if (state.scene === "room") {
    renderRoomScene();
    return;
  }

  if (state.scene === "home-transition") {
    renderHomeTransitionScene();
    return;
  }

  if (state.scene === "outside") {
    renderOutsideScene();
    return;
  }

  if (state.scene === "casino-floor") {
    renderCasinoVenueScene();
    return;
  }

  if (state.scene === "lecture") {
    renderLectureScene();
    return;
  }

  if (state.scene === "plastic-surgery") {
    renderPlasticSurgeryScene();
    return;
  }

  if (state.scene === "romance") {
    renderRomanceScene();
    return;
  }

  if (state.scene === "romance-call") {
    renderRomanceCallScene();
    return;
  }

  if (state.scene === "turn-briefing") {
    renderTurnBriefingScene();
    return;
  }

  if (state.scene === "night-auto-sleep") {
    renderNightAutoSleepScene();
    return;
  }

  if (state.scene === "lotto-pick") {
    renderLottoPickScene();
    return;
  }

  if (state.scene === "lotto-result") {
    renderLottoResultScene();
    return;
  }

  if (state.scene === "dialogue") {
    renderDialogueScene();
    return;
  }

  if (state.scene === "board") {
    renderBoardScene();
    return;
  }

  if (state.scene === "cleanup") {
    renderCleanupScene();
    return;
  }

  if (state.scene === "job-minigame") {
    renderJobMiniGameScene();
    return;
  }

  if (state.scene === "incident") {
    renderIncidentScene();
    return;
  }

  if (state.scene === "clockout") {
    renderClockOutScene();
    return;
  }

  if (state.scene === "ending") {
    renderEndingScene();
    return;
  }

  if (state.scene === "ranking") {
    // 랭킹 화면은 별도 오버레이 — renderGame에서 별도 처리 없음
    return;
  }

  renderResultScene();
}

function closeRankingScreen() {
  if (!ui.rankingScreen) return;
  ui.rankingScreen.hidden = true;
  ui.rankingScreen.setAttribute("aria-hidden", "true");
  if (ui.rankingMyCard) {
    ui.rankingMyCard.classList.remove("is-preview");
  }
}

function showRankingScreen(myEntry, allEntries, options = {}) {
  if (!ui.rankingScreen) return;

  const previewMode = Boolean(options?.previewMode);
  const safeMyEntry = myEntry && typeof myEntry === "object" ? myEntry : null;
  const sourceEntries = Array.isArray(allEntries) ? [...allEntries] : [];
  const metricLabelText = String(safeMyEntry?.metricLabel || "최종 보유 자금");
  const metricLabel = escapeHtml(metricLabelText);
  const mySpoon = escapeHtml(String(safeMyEntry?.spoon || "수저 미정"));
  const mySpoonClass = getRankingSpoonClass(safeMyEntry?.spoonId || safeMyEntry?.spoon);
  const hasMyEntry = !previewMode && Boolean(safeMyEntry);
  const includesMyEntry = hasMyEntry && sourceEntries.some((entry) => {
    if (safeMyEntry.id && entry.id) {
      return String(entry.id) === String(safeMyEntry.id);
    }
    if (safeMyEntry.entryKey && entry.entryKey) {
      return String(entry.entryKey) === String(safeMyEntry.entryKey);
    }

    return String(entry.name || "") === String(safeMyEntry.name || "")
      && Number(entry.money || 0) === Number(safeMyEntry.money || 0)
      && Number(entry.happiness || 0) === Number(safeMyEntry.happiness || 0)
      && String(entry.job || "") === String(safeMyEntry.job || "")
      && String(entry.rank || "") === String(safeMyEntry.rank || "")
      && String(entry.spoonId || entry.spoon || "") === String(safeMyEntry.spoonId || safeMyEntry.spoon || "");
  });
  const mergedEntries = hasMyEntry && !includesMyEntry ? [...sourceEntries, safeMyEntry] : sourceEntries;
  const firebaseReady = typeof isFirebaseReady === "function" ? isFirebaseReady() : false;

  if (ui.rankingSubtitle) {
    if (previewMode) {
      ui.rankingSubtitle.textContent = firebaseReady
        ? `${MAX_DAYS}턴 ${metricLabelText} 랭킹 미리보기`
        : `${MAX_DAYS}턴 ${metricLabelText} 랭킹 미리보기 · 오프라인`;
    } else {
      ui.rankingSubtitle.textContent = firebaseReady
        ? `${MAX_DAYS}턴 ${metricLabelText} 랭킹`
        : `${MAX_DAYS}턴 ${metricLabelText} 랭킹 · 오프라인`;
    }
  }

  if (ui.rankingRestartBtn) {
    ui.rankingRestartBtn.hidden = previewMode;
  }

  if (ui.rankingCloseBtn) {
    ui.rankingCloseBtn.hidden = !previewMode;
  }

  if (ui.rankingMyCard) {
    ui.rankingMyCard.classList.toggle("is-preview", previewMode);
    if (previewMode) {
      ui.rankingMyCard.innerHTML = ``;
    } else if (safeMyEntry) {
      const myHappiness = Number(safeMyEntry.happiness) || 0;
      const myHappinessBadge = myHappiness > 0
        ? `<span class="ranking-my-happiness">행복도 ${Math.round(myHappiness)}점</span>`
        : "";
      ui.rankingMyCard.innerHTML = `
        <div class="ranking-my-label">내 결과</div>
        <div class="ranking-my-name">${escapeHtml(safeMyEntry.name)}</div>
        <div class="ranking-my-stats">
          <span class="ranking-my-money">${metricLabel} ${formatMoney(safeMyEntry.money)}</span>
          <span class="ranking-my-job">${escapeHtml(safeMyEntry.job)}</span>
          <span class="ranking-spoon-badge ${mySpoonClass}">${mySpoon}</span>
          ${myHappinessBadge}
          <span class="ranking-my-rank ranking-rank--${String(safeMyEntry.rank || "d").toLowerCase()}">${safeMyEntry.rank}</span>
        </div>
      `;
    } else {
      ui.rankingMyCard.innerHTML = "";
    }
  }

  if (ui.rankingList) {
    const sorted = typeof sortRankingEntries === "function"
      ? sortRankingEntries(mergedEntries)
      : [...mergedEntries].sort((a, b) => {
        const moneyGap = Number(b?.money || 0) - Number(a?.money || 0);
        if (moneyGap !== 0) {
          return moneyGap;
        }
        return Number(b?.happiness || 0) - Number(a?.happiness || 0);
      });
    if (!sorted.length) {
      ui.rankingList.innerHTML = `
        <tr class="ranking-row ranking-row--empty">
          <td class="ranking-empty" colspan="6">아직 등록된 랭킹이 없습니다.</td>
        </tr>
      `;
    } else {
      let matchedFallbackEntry = false;
      const isMe = hasMyEntry ? (entry) => {
        if (safeMyEntry.id && entry.id) {
          return String(entry.id) === String(safeMyEntry.id);
        }
        if (safeMyEntry.entryKey && entry.entryKey) {
          return String(entry.entryKey) === String(safeMyEntry.entryKey);
        }
        if (matchedFallbackEntry) {
          return false;
        }

        const matched = String(entry.name || "") === String(safeMyEntry.name || "")
          && Number(entry.money || 0) === Number(safeMyEntry.money || 0)
          && Number(entry.happiness || 0) === Number(safeMyEntry.happiness || 0)
          && String(entry.job || "") === String(safeMyEntry.job || "")
          && String(entry.rank || "") === String(safeMyEntry.rank || "")
          && String(entry.spoonId || entry.spoon || "") === String(safeMyEntry.spoonId || safeMyEntry.spoon || "");

        if (matched) {
          matchedFallbackEntry = true;
        }

        return matched;
      } : () => false;

      ui.rankingList.innerHTML = sorted
        .map((entry, idx) => {
          const me = isMe(entry);
          const spoonLabel = escapeHtml(String(entry.spoon || "수저 미정"));
          const spoonClass = getRankingSpoonClass(entry.spoonId || entry.spoon);
          return `<tr class="ranking-row${me ? " ranking-row--me" : ""}">
            <td class="ranking-pos">${idx + 1}</td>
            <td class="ranking-name">${escapeHtml(entry.name || "무명")}${me ? " <span class=\"ranking-me-badge\">나</span>" : ""}</td>
            <td class="ranking-money">${formatMoney(entry.money || 0)}</td>
            <td class="ranking-job">
              <div class="ranking-job-stack">
                <span class="ranking-job-main">${escapeHtml(entry.job || "무직")}</span>
                <span class="ranking-spoon-badge ${spoonClass}">${spoonLabel}</span>
              </div>
            </td>
            <td class="ranking-happiness">${Math.round(Number(entry.happiness) || 0)}점</td>
            <td class="ranking-rank ranking-rank--${(entry.rank || "d").toLowerCase()}">${entry.rank || "D"}</td>
          </tr>`;
        })
        .join("");
    }
  }

  ui.rankingScreen.hidden = false;
  ui.rankingScreen.setAttribute("aria-hidden", "false");
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   정산 화면 (Settlement Screen)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function showSettlementScreen(summary, onDone) {
  if (!ui.settlementScreen) {
    onDone?.();
    return;
  }

  if (ui.settlementTitleText) {
    ui.settlementTitleText.textContent = `${MAX_DAYS}턴 최종 정산`;
  }

  // 이전 상태 초기화
  if (ui.settlementRows) ui.settlementRows.innerHTML = "";
  if (ui.settlementRankArea) {
    ui.settlementRankArea.innerHTML = "";
    ui.settlementRankArea.classList.remove("is-visible");
  }
  if (ui.settlementActions) {
    ui.settlementActions.innerHTML = "";
    ui.settlementActions.classList.remove("is-visible");
  }

  ui.settlementScreen.hidden = false;
  ui.settlementScreen.scrollTop = 0;

  const DELAY_BASE = 400;
  const DELAY_PER_ROW = 260;

  const rows = Array.isArray(summary?.settlementRows) ? summary.settlementRows : [];
  const totalRow = { id: "net-worth", label: "순자산", amount: summary?.netWorth ?? 0, isTotal: true };
  const allRows = [...rows, totalRow];

  // ── 행 렌더링 ──
  allRows.forEach((row, idx) => {
    if (!ui.settlementRows) return;
    const delay = DELAY_BASE + idx * DELAY_PER_ROW;
    const el = document.createElement("div");

    if (row.isTotal) {
      el.className = "settlement-row settlement-row--total";
    } else if (row.id === "debt") {
      el.className = "settlement-row settlement-row--debt";
    } else {
      el.className = "settlement-row";
    }

    el.style.setProperty("--row-delay", `${delay}ms`);

    if (row.isTotal) {
      el.innerHTML = `<span class="settlement-row-label">${escapeHtml(row.label)}</span><span class="settlement-row-right"><span class="settlement-row-amount settlement-total-amount" data-final="${row.amount}">${formatMoney(0)}</span></span>`;
    } else {
      const sign = row.amount >= 0 ? "+" : "";
      const amountText = `${sign}${typeof formatMoney === "function" ? formatMoney(Math.abs(row.amount)) : String(Math.abs(row.amount)) + "원"}`;
      const finalAmount = row.id === "debt"
        ? `<span class="settlement-row-amount">-${typeof formatMoney === "function" ? formatMoney(Math.abs(row.amount)) : String(Math.abs(row.amount)) + "원"}</span>`
        : `<span class="settlement-row-amount">${amountText}</span>`;
      let pnlMarkup = "";
      if (row.pnl !== undefined) {
        const pnlSign = row.pnl >= 0 ? "+" : "";
        const pnlClass = row.pnl >= 0 ? "is-pos" : "is-neg";
        pnlMarkup = `<span class="settlement-row-pnl ${pnlClass}">(${pnlSign}${typeof formatMoney === "function" ? formatMoney(row.pnl) : String(row.pnl) + "원"})</span>`;
      }
      el.innerHTML = `<span class="settlement-row-label">${escapeHtml(row.label)}</span><span class="settlement-row-right">${finalAmount}${pnlMarkup}</span>`;
    }

    ui.settlementRows.appendChild(el);
  });

  // ── 순자산 카운트업 애니메이션 ──
  const totalDelay = DELAY_BASE + (allRows.length - 1) * DELAY_PER_ROW + 200;
  setTimeout(() => {
    const totalAmountEl = ui.settlementRows?.querySelector(".settlement-total-amount");
    if (totalAmountEl) {
      settlementCountUp(totalAmountEl, summary?.netWorth ?? 0, 900);
    }
  }, totalDelay);

  // ── 행복도 + 랭크 표시 ──
  const rankDelay = totalDelay + 700;
  setTimeout(() => {
    if (!ui.settlementRankArea) return;
    const happinessVal = Math.round(Number(summary?.happiness) || 0);
    const happinessStatus = escapeHtml(String(summary?.happinessLabel || summary?.happinessStatus || "보통"));
    const rankLabel = String(summary?.rank?.label || "D");
    const rankTitle = escapeHtml(String(summary?.rank?.title || ""));
    const rankClass = `settlement-rank--${rankLabel.toLowerCase()}`;

    ui.settlementRankArea.innerHTML = `
      <div class="settlement-happiness">
        <span class="settlement-happiness-label">행복도</span>
        <span class="settlement-happiness-value">${happinessVal}점</span>
        <span class="settlement-happiness-status">${happinessStatus}</span>
      </div>
      <div class="settlement-divider"></div>
      <div class="settlement-rank ${rankClass}">
        <span class="settlement-rank-label">랭크</span>
        <span class="settlement-rank-grade">${escapeHtml(rankLabel)}</span>
        <span class="settlement-rank-title">${rankTitle}</span>
      </div>
    `;
    ui.settlementRankArea.classList.add("is-visible");
  }, rankDelay);

  // ── "랭킹 보기" 버튼 ──
  const btnDelay = rankDelay + 600;
  setTimeout(() => {
    if (!ui.settlementActions) return;
    const btn = document.createElement("button");
    btn.className = "settlement-btn";
    btn.type = "button";
    btn.textContent = "랭킹 보기";
    btn.addEventListener("click", () => {
      if (ui.settlementScreen) ui.settlementScreen.hidden = true;
      onDone?.();
    });
    ui.settlementActions.appendChild(btn);
    ui.settlementActions.classList.add("is-visible");
  }, btnDelay);
}

function settlementCountUp(el, finalValue, duration) {
  const start = Date.now();
  const fmt = typeof formatMoney === "function" ? formatMoney : (v) => `${v}원`;

  function step() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(finalValue * eased);
    el.textContent = fmt(current);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = fmt(finalValue);
    }
  }

  requestAnimationFrame(step);
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


function resolveDynamicText(text) {
  const rawName = String(state.playerName || "").trim();
  const displayName = rawName && rawName !== "\uc774\ub984 \uc5c6\uc74c" ? rawName : "";
  const nameCall = displayName ? `${displayName}\uc544` : "\uc598\uc57c";

  return String(text)
    .replaceAll("{nameCall}", nameCall)
    .replaceAll("{name}", displayName);
}

function setupTitleScreenUi() {
  ui.startCard = ui.startScreen.querySelector(".start-card");

  const kicker = ui.startCard?.querySelector(".start-kicker");
  const title = ui.startCard?.querySelector(".start-title");
  const sub = ui.startCard?.querySelector(".start-sub");
  const body = ui.startCard?.querySelector(".start-body");
  const highlights = ui.startCard?.querySelector(".start-highlights");

  if (kicker) {
    kicker.hidden = true;
    kicker.textContent = "";
  }

  if (sub) {
    sub.hidden = true;
    sub.textContent = "";
  }

  if (body) {
    body.hidden = true;
    body.textContent = "";
  }

  if (highlights) {
    highlights.hidden = true;
    highlights.innerHTML = "";
  }

  if (title) {
    title.textContent = "\ubc30\uae08\ub3c4\uc2dc";
  }

  ui.nameInput.placeholder = "\ub2c9\ub124\uc784";
  ui.nameInput.autocomplete = "off";
  ui.startButton.textContent = "\ucd9c\uc0dd \ud328\ud0a4\uc9c0 \ubf51\uae30";
  if (ui.continueButton) {
    ui.continueButton.textContent = "\uc774\uc5b4\ud558\uae30";
    ui.continueButton.hidden = true;
  }
  if (ui.rankingSubtitle) {
    ui.rankingSubtitle.textContent = `${MAX_DAYS}\ud134 \ucd5c\uc885 \ubcf4\uc720 \uc790\uae08 \ub7ad\ud0b9`;
  }
  renderStartScreenDrawState(false);
}

function getRankingSpoonClass(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "gold" || normalized.includes("금수저")) {
    return "ranking-spoon-badge--gold";
  }
  if (
    normalized === "silver"
    || normalized === "bronze"
    || normalized.includes("은수저")
    || normalized.includes("동수저")
  ) {
    return "ranking-spoon-badge--silver";
  }
  if (
    normalized === "dirt"
    || normalized === "steel"
    || normalized.includes("흙수저")
    || normalized.includes("쇠수저")
  ) {
    return "ranking-spoon-badge--dirt";
  }
  return "ranking-spoon-badge--unknown";
}
