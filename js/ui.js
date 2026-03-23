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
  ui.staminaDisplay = document.getElementById("stamina-display");
  ui.energyDisplay = document.getElementById("energy-display");
  ui.hungerDisplay = document.getElementById("hunger-display");
  ui.timeDisplay = document.getElementById("time-display");
  ui.progressbar = document.getElementById("progressbar");
  ui.headlineStrip = document.getElementById("headline-strip");
  ui.headlineBadge = document.getElementById("headline-badge");
  ui.headlineText = document.getElementById("headline-text");
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
  ui.nameInput = document.getElementById("name-input");
  ui.continueButton = document.getElementById("continue-button");
  ui.startButton = document.getElementById("start-button");
  ui.startOriginPanel = document.getElementById("start-origin-panel");
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
  ui.textbox = document.getElementById("textbox");
  ui.phoneControls = document.getElementById("phone-controls");
  ui.phoneStageButton = document.getElementById("phone-stage-btn");
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
  ui.rankingRestartBtn = document.getElementById("ranking-restart-btn");
  if (ui.rankingRestartBtn) {
    ui.rankingRestartBtn.addEventListener("click", () => {
      if (typeof restartToTitle === "function") restartToTitle();
      if (ui.rankingScreen) {
        ui.rankingScreen.hidden = true;
        ui.rankingScreen.setAttribute("aria-hidden", "true");
      }
    });
  }
  setupStartScreen();
  buildBuildings();
}

const sceneTextProgress = {
  key: "",
  lineIndex: 0,
  lineCount: 0,
};

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
    sceneTextProgress.key = progressKey || "";
    sceneTextProgress.lineIndex = Math.max(0, lineCount - 1);
    sceneTextProgress.lineCount = lineCount;

    return {
      visibleLines: resolvedLines,
      canAdvance: false,
      choicesReady: true,
    };
  }

  if (sceneTextProgress.key !== progressKey) {
    sceneTextProgress.key = progressKey;
    sceneTextProgress.lineIndex = 0;
  }

  sceneTextProgress.lineCount = lineCount;
  sceneTextProgress.lineIndex = Math.min(sceneTextProgress.lineIndex, Math.max(0, lineCount - 1));

  const visibleLines = resolvedLines.slice(0, sceneTextProgress.lineIndex + 1);
  const canAdvance = sceneTextProgress.lineIndex < lineCount - 1;

  return {
    visibleLines,
    canAdvance,
    choicesReady: !canAdvance,
  };
}

function canAdvanceSceneText() {
  return sceneTextProgress.lineCount > 1 && sceneTextProgress.lineIndex < sceneTextProgress.lineCount - 1;
}

function advanceSceneText() {
  if (!canAdvanceSceneText()) {
    return false;
  }

  sceneTextProgress.lineIndex += 1;
  renderGame();
  return true;
}


function setupStartScreen() {
  ui.startCard = ui.startScreen.querySelector(".start-card");

  const kicker = ui.startCard.querySelector(".start-kicker");
  const title = ui.startCard.querySelector(".start-title");
  const sub = ui.startCard.querySelector(".start-sub");
  const body = ui.startCard.querySelector(".start-body");
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
  ui.startButton.textContent = "\uc2dc\uc791\ud558\uae30";
  if (ui.continueButton) {
    ui.continueButton.textContent = "\uc774\uc5b4\ud558\uae30";
    ui.continueButton.hidden = true;
  }
  if (ui.rankingSubtitle) {
    ui.rankingSubtitle.textContent = `${MAX_DAYS}\ud134 \uacb0\uc0b0 \u00b7 \uc804\uad6d \ub7ad\ud0b9`;
  }
}


function setStartScreenSaveState(_hasSave = false) {
  if (ui.continueButton) {
    ui.continueButton.hidden = !_hasSave;
  }

  if (ui.startButton) {
    ui.startButton.textContent = _hasSave ? "\uc0c8\ub85c \uc2dc\uc791" : "\uc2dc\uc791\ud558\uae30";
  }
}

function formatStartScreenCash(amount = 0) {
  return `${Math.max(0, Math.round(Number(amount) || 0)).toLocaleString("ko-KR")}원`;
}

function renderStartScreenDrawState(hasSave = false) {
  const drawState = typeof getStartScreenDrawState === "function"
    ? getStartScreenDrawState()
    : { phase: "idle", previewTierId: "", resultTierId: "" };
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
    ui.startScreen.dataset.phase = drawState.phase || "idle";
    ui.startScreen.dataset.tier = tier?.id || "";
    ui.startScreen.style.setProperty("--start-origin-accent", theme.accent || "#94a3b8");
    ui.startScreen.style.setProperty("--start-origin-accent-soft", theme.accentSoft || "rgba(148, 163, 184, 0.14)");
    ui.startScreen.style.setProperty("--start-origin-glow", theme.glow || "rgba(148, 163, 184, 0.22)");
    ui.startScreen.style.setProperty("--start-origin-screen-overlay", theme.screenOverlay || "linear-gradient(180deg, rgba(22, 25, 35, 0.22) 0%, rgba(8, 10, 18, 0.62) 100%)");
  }

  if (ui.startCard) {
    ui.startCard.dataset.phase = drawState.phase || "idle";
    ui.startCard.dataset.tier = tier?.id || "";
  }

  if (ui.startOriginPanel) {
    ui.startOriginPanel.dataset.phase = drawState.phase || "idle";
    ui.startOriginPanel.dataset.tier = tier?.id || "";
  }

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
      ui.startOriginDesc.textContent = "새 게임마다 한 번만 정합니다. 결과에 따라 초기 현금과 첫 방 톤이 달라집니다.";
    }
  }

  if (ui.startOriginMeta) {
    if (drawState.phase === "result" && tier) {
      ui.startOriginMeta.innerHTML = `
        <span class="start-origin-chip">초기 현금 ${escapeHtml(formatStartScreenCash(tier.initialCash))}</span>
        <span class="start-origin-chip">행복도 ${escapeHtml(String(tier.startHappiness))}</span>
        <span class="start-origin-chip">첫 톤 ${escapeHtml(tier.toneLabel || tier.name)}</span>
      `;
    } else if (drawState.phase === "drawing" && tier) {
      ui.startOriginMeta.innerHTML = `
        <span class="start-origin-chip">확률 셔플 중</span>
        <span class="start-origin-chip">${escapeHtml(tier.name)}</span>
      `;
    } else {
      ui.startOriginMeta.innerHTML = `
        <span class="start-origin-chip">금 1%</span>
        <span class="start-origin-chip">은 4%</span>
        <span class="start-origin-chip">동 15%</span>
        <span class="start-origin-chip">쇠 30%</span>
        <span class="start-origin-chip">흙 50%</span>
      `;
    }
  }

  if (ui.startButton) {
    ui.startButton.disabled = drawState.phase === "drawing";
    if (drawState.phase === "drawing") {
      ui.startButton.textContent = "출생 결정 중...";
    } else if (drawState.phase === "result") {
      ui.startButton.textContent = "이 출생으로 시작하기";
    } else {
      ui.startButton.textContent = hasSave ? "새로 시작 뽑기" : "출생 패키지 뽑기";
    }
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

function buildPhoneHomeGridMarkup(targetState = state) {
  const manifests = typeof getInstalledPhoneAppRegistry === "function"
    ? getInstalledPhoneAppRegistry(targetState)
    : [];

  if (!manifests.length) {
    return '<div class="phone-job-empty">설치된 앱이 없습니다.</div>';
  }

  return manifests.map((app) => `
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
  if (ui.phoneAppScreen && !ui.phoneAppScreen.hidden) {
    rememberPhoneScrollPosition("panel", phoneView, ui.phoneAppScreen.scrollTop);
  }

  if (ui.phoneApps) {
    ui.phoneApps.hidden = !onHomeRoute;
    ui.phoneApps.innerHTML = onHomeRoute ? buildPhoneHomeGridMarkup(state) : "";
  }

  if (ui.phoneAppScreen) {
    const showAppScreen = !onHomeRoute;
    ui.phoneAppScreen.hidden = !showAppScreen;
    ui.phoneAppScreen.classList.toggle("is-fullbleed-route", showAppScreen && panelScreenMode === "fullbleed");
    ui.phoneAppScreen.innerHTML = showAppScreen ? buildPhoneRouteMarkup(phoneView) : "";
    if (showAppScreen) {
      ui.phoneAppScreen.scrollTop = readPhoneScrollPosition("panel", phoneView);
    }
  }

  ui.phonePanel.classList.toggle("is-app-open", !onHomeRoute);
  ui.phonePanel.classList.toggle("has-fullbleed-app", !onHomeRoute && panelScreenMode === "fullbleed");

  if (typeof applyPhoneShellUi === "function") {
    applyPhoneShellUi(ui, screenState);
  }

  renderPhoneStage(screenState);

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
  if (!ui.characterButton || !ui.characterPanel || !ui.characterStats) {
    return;
  }

  const isOpen = Boolean(state._characterPanelOpen);

  ui.characterButton.setAttribute("aria-expanded", isOpen ? "true" : "false");

  ui.characterPanel.hidden = !isOpen;
  ui.characterPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");

  if (!isOpen) return;

  const stats = [
    { key: "지능", label: "지능", cls: "intelligence", max: 100 },
    { key: "평판", label: "평판", cls: "reputation",   max: 100 },
    { key: "범죄도", label: "범죄도", cls: "crime",    max: 100 },
    {
      key: "hunger",
      label: "배고픔",
      cls: "hunger",
      max: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3,
      value: hungerState.value,
      meta: hungerMeta,
      metaCls: hungerMetaCls,
    },
  ];

  ui.characterStats.innerHTML = "";
  stats.forEach(({ key, label, cls, max }) => {
    const val = Number(state[key]) || 0;
    const pct = Math.min(100, Math.round((val / max) * 100));

    const row = document.createElement("div");
    row.className = "character-stat-row";
    row.innerHTML = `
      <span class="character-stat-name">${label}</span>
      <div class="character-stat-bar-wrap">
        <div class="character-stat-bar ${cls}" style="width:${pct}%"></div>
      </div>
      <span class="character-stat-val ${cls}">${val}</span>
    `;
    ui.characterStats.appendChild(row);
  });
}

function renderCharacterPanel() {
  if (!ui.characterButton || !ui.characterPanel || !ui.characterStats) {
    return;
  }

  const isOpen = Boolean(state._characterPanelOpen);
  const happinessState = typeof syncHappinessState === "function"
    ? syncHappinessState(state)
    : createDefaultHappinessState();
  const happinessMeta = typeof getHappinessStatusLabel === "function"
    ? getHappinessStatusLabel(happinessState.status)
    : "";
  const hungerState = typeof ensureHungerState === "function"
    ? ensureHungerState(state)
    : { value: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3 };
  const hungerMeta = typeof getHungerStatusLabel === "function"
    ? getHungerStatusLabel(state)
    : "";
  const hungerMetaCls = typeof getHungerStatusTone === "function"
    ? getHungerStatusTone(state)
    : "";
  const stats = [
    { key: "지능", label: "지능", cls: "intelligence", max: 100 },
    { key: "평판", label: "평판", cls: "reputation", max: 100 },
    { key: "범죄도", label: "범죄도", cls: "crime", max: 100 },
    { key: "happiness", label: "행복도", cls: "happiness", max: 100, value: happinessState.value, meta: happinessMeta, metaCls: happinessState.status },
    {
      key: "hunger",
      label: "배고픔",
      cls: "hunger",
      max: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3,
      value: hungerState.value,
      meta: hungerMeta,
      metaCls: hungerMetaCls,
    },
  ];

  ui.characterButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  ui.characterPanel.hidden = !isOpen;
  ui.characterPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");

  if (!isOpen) {
    return;
  }

  ui.characterStats.innerHTML = "";
  stats.forEach(({ key, label, cls, max, value, meta, metaCls }) => {
    const parsedValue = Number(value);
    const val = Number.isFinite(parsedValue) ? parsedValue : (Number(state[key]) || 0);
    const pct = Math.min(100, Math.round((val / max) * 100));
    const metaMarkup = meta
      ? `<span class="character-stat-meta ${metaCls || ""}">${meta}</span>`
      : "";

    const row = document.createElement("div");
    row.className = "character-stat-row";
    row.innerHTML = `
      <div class="character-stat-name-wrap">
        <span class="character-stat-name">${label}</span>
        ${metaMarkup}
      </div>
      <div class="character-stat-bar-wrap">
        <div class="character-stat-bar ${cls}" style="width:${pct}%"></div>
      </div>
      <span class="character-stat-val ${cls}">${val}</span>
    `;
    ui.characterStats.appendChild(row);
  });
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
  const homeDefinition = typeof getOwnedHomeDefinition === "function"
    ? getOwnedHomeDefinition(ownershipState.home)
    : null;
  const vehicleDefinition = typeof getOwnedVehicleDefinition === "function"
    ? getOwnedVehicleDefinition(ownershipState.vehicle)
    : null;
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

function applySceneBackgroundConfig(backgroundConfig = null) {
  if (!ui.bg || !backgroundConfig?.image) {
    return false;
  }

  const overlay = backgroundConfig.overlay
    || "linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.18) 100%)";
  const position = backgroundConfig.position || "center";
  const size = backgroundConfig.size || "cover";
  const repeat = backgroundConfig.repeat || "no-repeat";
  const color = backgroundConfig.color || "";

  ui.bg.className = backgroundConfig.className || "custom-location-bg";
  ui.bg.style.background = `${overlay}, url('${backgroundConfig.image}') ${position} / ${size} ${repeat}${color ? ` ${color}` : ""}`;
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
    room: 18,
    outside: 42,
    dialogue: 46,
    board: 18,
    "job-minigame": 56,
    incident: 60,
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

function setSceneInteractionPrompt(text = "", visible = false) {
  if (!ui.outsideGoal) {
    return;
  }

  const shouldShow = Boolean(visible && text);
  ui.outsideGoal.textContent = shouldShow ? text : "";
  ui.outsideGoal.style.display = shouldShow ? "block" : "none";
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
    button.addEventListener("click", () => collectTrash(item.id));
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
    button.addEventListener("click", () => completeJobMiniGameTask(item.id));
    ui.jobMiniGameItems.appendChild(button);
  });
}

function renderMessage(title, lines = [], { progressKey = "" } = {}) {
  const resolvedTitle = resolveDynamicText(title);
  const resolvedLines = lines.map(resolveDynamicText);
  const progressState = getSceneTextProgressState(progressKey, resolvedLines);
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

  button.addEventListener("click", onClick);
  ui.choices.appendChild(button);
  syncTextboxContentState();
}

function renderOfferButtons(offers) {
  clearChoices();

  offers.forEach((offer, index) => {
    const job = JOB_LOOKUP[offer.jobId];
    createChoiceButton({
      title: `${job.emoji} ${job.title}`,
      earnText: formatMoney(offer.pay),
      onClick: () => selectJobOffer(index),
    });
  });
}

function renderChoiceButtons(incident) {
  clearChoices();

  incident.choices.forEach((choice, index) => {
    createChoiceButton({
      title: choice.label,
      onClick: () => chooseIncidentOption(index),
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

function showMoneyEffect(amount) {
  if (!amount) {
    return;
  }

  ui.moneyEffect.textContent = `${amount > 0 ? "+" : ""}${formatMoney(amount)}`;
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

function renderPrologueScene() {
  const steps = getActiveStorySteps();
  const step = steps[state.storyStep] || steps[0];
  const interactiveStart = ["walk-to-exit", "press-exit"].includes(step?.startMode);

  setBackgroundByTone("prologue");
  if (step?.background) {
    const startBackground = typeof getSpoonStartSceneBackground === "function"
      ? getSpoonStartSceneBackground(step.background, state)
      : step.background;
    applySceneBackgroundConfig(startBackground);
  }
  setWorldMode(interactiveStart ? "interactive-start" : "prologue");
  setCharacter(step.character);

  if (interactiveStart) {
    const introState = typeof syncPrologueIntroState === "function"
      ? syncPrologueIntroState(state)
      : { playerLeft: Number(step?.player?.startLeft) || 24, facing: 1 };
    const playerActor = step?.player
      ? {
          ...step.player,
          left: introState.playerLeft,
          facing: introState.facing,
        }
      : null;

    renderActors(playerActor ? [playerActor] : []);
    setCharacterPosition(introState.playerLeft, introState.facing);
    setSceneSpeaker(step.speaker || "");
    renderTags(step.tags || []);
    clearMessage();
    clearChoices();
    setSceneInteractionPrompt("", false);
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

  renderActors(step.actors || []);
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


function renderRoomScene() {
  setBackgroundByTone("room");
  if (state.day === 1) {
    const introStep = typeof getDayStoryData === "function"
      ? getDayStoryData(state.day)?.introSteps?.[0]
      : null;
    if (introStep?.background) {
      const startBackground = typeof getSpoonStartSceneBackground === "function"
        ? getSpoonStartSceneBackground(introStep.background, state)
        : introStep.background;
      applySceneBackgroundConfig(startBackground);
    }
  }
  setWorldMode("room");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker("\ubd80\ubaa8\ub2d8\uc9d1");
  renderTags([]);

  const shiftStatus = typeof getScheduledShiftStatus === "function"
    ? getScheduledShiftStatus()
    : null;

  if (shiftStatus) {
    const job = JOB_LOOKUP[shiftStatus.scheduledShift.offer.jobId];
    const shiftWindow = typeof formatClockTime === "function"
      ? `${formatClockTime(shiftStatus.startSlot)} - ${formatClockTime(shiftStatus.endSlot)}`
      : "";
    let showChoices = true;
    let messageTitle = "";
    let messageLines = [];

    if (shiftStatus.waiting) {
      messageTitle = "\uc624\ub298 \uc608\uc57d\ub41c \ucd9c\uadfc\uc774 \uc788\ub2e4";
      messageLines = [
        `${job.title} \ucd9c\uadfc \uc2dc\uac04\uc740 ${shiftWindow}\uc774\ub2e4.`,
        "\ucd9c\uadfc \uc804\uae4c\uc9c0 \ub2e4\ub978 \ud589\ub3d9\uc744 \ud558\uac70\ub098 \ubc14\ub85c \uc2dc\uac04\uc744 \ubcf4\ub0bc \uc218 \uc788\ub2e4.",
      ];
    } else if (shiftStatus.active) {
      messageTitle = "\uc9c0\uae08 \ucd9c\uadfc\ud560 \uc218 \uc788\ub2e4";
      messageLines = [
        `${job.title} \uadfc\ubb34 \uc2dc\uac04\uc740 ${shiftWindow}\uc774\ub2e4.`,
        "\uc900\ube44\uac00 \ub410\ub2e4\uba74 \ubc14\ub85c \ucd9c\uadfc\ud574\uc11c \uc624\ub298 \uadfc\ubb34\ub97c \uc2dc\uc791\ud55c\ub2e4.",
      ];
    } else {
      messageTitle = "\uc608\uc57d\ub41c \ucd9c\uadfc \uc2dc\uac04\uc774 \uc9c0\ub0ac\ub2e4";
      messageLines = [
        `${job.title} \uadfc\ubb34 \uc2dc\uac04 ${shiftWindow}\uc744 \ub193\uccd0\ub2e4.`,
        "\uacb0\uadfc \ucc98\ub9ac\ud558\uace0 \uc624\ub298\uc744 \ub118\uae38 \uc218 \uc788\ub2e4.",
      ];
    }

    showChoices = renderMessage(messageTitle, messageLines, {
      progressKey: buildSceneTextProgressKey(`room:${state.day}:${shiftStatus.startSlot}:${messageTitle}`, messageTitle, messageLines),
    });
    clearChoices();

    if (!showChoices) {
      return;
    }
  } else {
    clearMessage();
    clearChoices();
  }

  if (shiftStatus) {
    if (shiftStatus.waiting) {
      createChoiceButton({
        title: `${typeof formatClockTime === "function" ? formatClockTime(shiftStatus.startSlot) : "\ucd9c\uadfc"}\uae4c\uc9c0 \uc2dc\uac04 \ubcf4\ub0b4\uae30`,
        onClick: waitForScheduledShift,
      });
    } else if (shiftStatus.active) {
      createChoiceButton({
        title: "\uc608\uc57d\ub41c \ucd9c\uadfc \uac00\uae30",
        onClick: startScheduledShift,
      });
    }

    createChoiceButton({
      title: "\uacb0\uadfc\ud558\uace0 \ub118\uae30\uae30",
      onClick: skipScheduledShift,
    });
  }

  createChoiceButton({
    title: "30\ubd84 \ubcf4\ub0b4\uae30",
    onClick: waitInRoom,
  });
  createChoiceButton({
    title: "\ubc16\uc744 \ub098\uac00\uae30",
    onClick: goOutside,
  });
  createChoiceButton({
    title: "\uc7a0\uc744 \uc794\ub2e4",
    onClick: sleepInRoom,
  });
}


function renderOutsideScene() {
  const outsideScene = typeof getCurrentOutsideSceneConfig === "function"
    ? getCurrentOutsideSceneConfig()
    : null;
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId()
    : "";

  setBackgroundByTone("outside");
  applySceneBackgroundConfig(outsideScene?.background || null);
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
    const outsideTitle = outsideScene?.title || outsideScene?.label || "";
    const outsideLines = outsideScene?.lines || [];
    showChoices = renderMessage(outsideTitle, outsideLines, {
      progressKey: buildSceneTextProgressKey(`outside:${state.day}:${currentLocationId}`, outsideTitle, outsideLines),
    });
  }
  clearChoices();

  if (!showChoices) {
    if (typeof hideCityMapOverlay === "function") {
      hideCityMapOverlay({ preserveSelection: true });
    }
    return;
  }

  const choiceOptions = typeof getOutsideSceneActionOptions === "function"
    ? getOutsideSceneActionOptions(outsideScene, state)
    : (outsideScene?.options || []);

  if (choiceOptions.some((option) => option.uiVariant === "bus-route")) {
    ui.choices.classList.add("is-bus-route");
  }

  if (typeof canShowCityMapForState === "function" && canShowCityMapForState(state)) {
    createChoiceButton({
      title: "지도 보기",
      buttonClassName: "choice-btn-city-map",
      onClick: () => {
        if (typeof openCityMapOverlay === "function") {
          openCityMapOverlay(state);
        }
      },
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
  const job = game?.jobId ? JOB_LOOKUP[game.jobId] : null;

  if (!game || !job) {
    hideJobMiniGame();
    renderGame();
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
  renderJobMiniGame();
}

function getSceneTimeText() {
  if (typeof formatClockTime === "function") {
    return formatClockTime(state.timeSlot, state.timeMinuteOffset || 0);
  }

  return "08:00";
}

function renderIncidentScene() {
  const job = JOB_LOOKUP[state.currentOffer.jobId];

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
    progressKey: buildSceneTextProgressKey(`incident:${state.currentOffer.jobId}:${state.currentIncident.title}`, state.currentIncident.title, state.currentIncident.intro),
  });
  clearChoices();

  if (!showChoices) {
    return;
  }

  renderChoiceButtons(state.currentIncident);
}

function renderDialogueScene() {
  const dialogueNode = typeof getActiveDialogueNode === "function"
    ? getActiveDialogueNode(state)
    : null;
  const outsideScene = typeof getCurrentOutsideSceneConfig === "function"
    ? getCurrentOutsideSceneConfig(state)
    : null;

  if (!dialogueNode) {
    if (typeof endNpcDialogue === "function") {
      endNpcDialogue(state);
    }
    renderGame();
    return;
  }

  setBackgroundByTone("outside");
  applySceneBackgroundConfig(outsideScene?.background || null);
  setWorldMode("outside");
  setCharacter("");
  renderActors(outsideScene?.actors || []);
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
  const job = JOB_LOOKUP[state.currentOffer.jobId];

  setBackgroundByTone(job.tone);
  setWorldMode("result");
  setCharacter(job.emoji);
  setCharacterPosition(50, 1);
  setSceneSpeaker("\uadf8\ub0a0 \uadfc\ubb34 \uc885\ub8cc");
  renderTags([]);
  const resultTitle = `\uc624\ub298 \uc190\uc5d0 \uc950 \ub3c8 ${formatMoney(state.lastResult.pay)}`;
  const showChoices = renderMessage(resultTitle, state.lastResult.lines, {
    progressKey: buildSceneTextProgressKey(`result:${state.day}:${state.lastResult.pay}`, resultTitle, state.lastResult.lines),
  });

  if (!showChoices) {
    clearChoices();
    return;
  }

  renderNextDayButton();
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
  const endingTitle = summary?.title || `\ucd5c\uc885 \ud604\uae08 ${formatMoney(summary.totalCash)}`;
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

  if (typeof normalizeStateForCurrentRules === "function") {
    normalizeStateForCurrentRules();
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
  ui.moneyDisplay.textContent = formatMoney(state.money);
  ui.staminaDisplay.textContent = `${state.stamina}`;
  ui.energyDisplay.textContent = `${state.energy}`;
  if (ui.hungerDisplay) {
    const hungerState = typeof ensureHungerState === "function"
      ? ensureHungerState(state)
      : { value: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3 };
    const hungerMax = typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3;
    ui.hungerDisplay.textContent = `${hungerState.value}/${hungerMax}`;
  }
  ui.timeDisplay.textContent = getSceneTimeText();
  setHeadline(state.headline.badge, state.headline.text);
  setProgressByScene(state.scene);
  renderMemoryPanel();
  renderInventoryPanel();
  renderCharacterPanel();
  setSceneInteractionPrompt("", false);
  if (typeof persistState === "function") {
    persistState();
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

  if (state.scene === "outside") {
    renderOutsideScene();
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

function showRankingScreen(myEntry, allEntries) {
  if (!ui.rankingScreen) return;
  const mySpoon = escapeHtml(String(myEntry.spoon || "수저 미정"));
  const mySpoonClass = getRankingSpoonClass(myEntry.spoonId || myEntry.spoon);

  // 내 카드 렌더링
  if (ui.rankingMyCard) {
    ui.rankingMyCard.innerHTML = `
      <div class="ranking-my-label">내 결과</div>
      <div class="ranking-my-name">${escapeHtml(myEntry.name)}</div>
      <div class="ranking-my-stats">
        <span class="ranking-my-money">${formatMoney(myEntry.money)}</span>
        <span class="ranking-my-job">${escapeHtml(myEntry.job)}</span>
        <span class="ranking-spoon-badge ${mySpoonClass}">${mySpoon}</span>
        <span class="ranking-my-rank ranking-rank--${myEntry.rank.toLowerCase()}">${myEntry.rank}</span>
      </div>
    `;
  }

  // 전체 랭킹 리스트 렌더링
  if (ui.rankingList) {
    // money 내림차순 정렬
    const sorted = [...allEntries].sort((a, b) => (b.money || 0) - (a.money || 0));
    const isMe = (entry) =>
      entry.name === myEntry.name && entry.money === myEntry.money;

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
          <td class="ranking-rank ranking-rank--${(entry.rank || "d").toLowerCase()}">${entry.rank || "D"}</td>
        </tr>`;
      })
      .join("");
  }

  ui.rankingScreen.hidden = false;
  ui.rankingScreen.setAttribute("aria-hidden", "false");
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

function setupStartScreen() {
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
    ui.rankingSubtitle.textContent = `${MAX_DAYS}\ud134 \uacb0\uc0b0 \u00b7 \uc804\uad6d \ub7ad\ud0b9`;
  }
  renderStartScreenDrawState(false);
}

function getRankingSpoonClass(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "gold" || normalized.includes("금수저")) {
    return "ranking-spoon-badge--gold";
  }
  if (normalized === "silver" || normalized.includes("은수저")) {
    return "ranking-spoon-badge--silver";
  }
  if (normalized === "bronze" || normalized.includes("동수저")) {
    return "ranking-spoon-badge--bronze";
  }
  if (normalized === "steel" || normalized.includes("쇠수저")) {
    return "ranking-spoon-badge--steel";
  }
  if (normalized === "dirt" || normalized.includes("흙수저")) {
    return "ranking-spoon-badge--dirt";
  }
  return "ranking-spoon-badge--unknown";
}
