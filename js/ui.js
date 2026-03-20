var ui = window.ui || {};
window.ui = ui;

function cacheUi() {
  ui.game = document.getElementById("game");
  ui.playerDisplay = document.getElementById("player-display");
  ui.dayDisplay = document.getElementById("day-display");
  ui.moneyDisplay = document.getElementById("money-display");
  ui.staminaDisplay = document.getElementById("stamina-display");
  ui.energyDisplay = document.getElementById("energy-display");
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
  ui.moneyEffect = document.getElementById("money-effect");
  ui.startScreen = document.getElementById("start-screen");
  ui.nameInput = document.getElementById("name-input");
  ui.continueButton = document.getElementById("continue-button");
  ui.startButton = document.getElementById("start-button");
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

  const title = ui.startCard.querySelector(".start-title");
  const sub = ui.startCard.querySelector(".start-sub");
  title.textContent = "\ubc30\uae08\ub3c4\uc2dc";
  sub.textContent = `${MAX_DAYS}\uc77c \ub3d9\uc548 \ubc84\ud2f0\uba70 \ub3c8\uc744 \ubaa8\uc544\ubcf4\uc138\uc694.`;
  ui.nameInput.placeholder = "\ub2c9\ub124\uc784";
  ui.nameInput.autocomplete = "off";
  ui.startButton.textContent = "\uc2dc\uc791\ud558\uae30";
  if (ui.continueButton) {
    ui.continueButton.textContent = "\uc774\uc5b4\ud558\uae30";
    ui.continueButton.hidden = true;
  }
}


function setStartScreenSaveState(_hasSave = false) {
  // 이어하기 항상 숨김 (첫 게임)
  if (ui.continueButton) {
    ui.continueButton.hidden = true;
  }

  if (ui.startButton) {
    ui.startButton.textContent = "\uc2dc\uc791\ud558\uae30";
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
  const hasShiftToday = Boolean(state.nextDayShift && state.nextDayShift.day === state.day);
  const hasBookedShift = Boolean(state.nextDayShift && state.nextDayShift.day > state.day);
  const jobAppliedToday = Boolean(state.jobApplicationDoneToday);
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
      <span class="phone-app-emoji">${escapeHtml(app.icon || "📱")}</span>
      <span class="phone-app-name">${escapeHtml(app.label || app.id)}</span>
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
  ui.phoneStage.hidden = !shouldShow;
  ui.phoneStage.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  ui.game?.classList.toggle("phone-stage-active", shouldShow);

  if (!shouldShow) {
    ui.phoneStage.innerHTML = "";
    return;
  }

  const onHomeRoute = typeof isPhoneHomeRoute === "function"
    ? isPhoneHomeRoute(screenState.phoneView)
    : screenState.phoneView === "home";
  const stageBody = !onHomeRoute
    ? `<div class="phone-stage-app-screen">${buildPhoneRouteMarkup(screenState.phoneView, { stageMode: true })}</div>`
    : `
      <div class="phone-stage-home-grid">
        ${buildPhoneHomeGridMarkup(state)}
      </div>
      <div class="phone-stage-home-fill"></div>
    `;

  ui.phoneStage.innerHTML = `
    <div class="phone-stage-shell ${onHomeRoute ? "is-home-view" : "is-app-view"}">
      <div class="phone-stage-top">
        <div class="phone-stage-day">DAY ${String(state.day).padStart(2, "0")}</div>
        <div class="phone-stage-meta">
          <span class="phone-stage-time">${screenState.phoneTime}</span>
          <span class="phone-stage-signal">${screenState.signalText}</span>
        </div>
      </div>
      ${stageBody}
    </div>
  `;
}


function updatePhonePanel() {
  if (!ui.phonePanel) return;

  const screenState = getPhonePanelState();
  const { phoneView } = screenState;
  const onHomeRoute = typeof isPhoneHomeRoute === "function"
    ? isPhoneHomeRoute(phoneView)
    : phoneView === "home";

  if (ui.phoneApps) {
    ui.phoneApps.hidden = !onHomeRoute;
    ui.phoneApps.innerHTML = onHomeRoute ? buildPhoneHomeGridMarkup(state) : "";
  }

  if (ui.phoneAppScreen) {
    const showAppScreen = !onHomeRoute;
    ui.phoneAppScreen.hidden = !showAppScreen;
    ui.phoneAppScreen.innerHTML = showAppScreen ? buildPhoneRouteMarkup(phoneView) : "";
  }

  if (typeof applyPhoneShellUi === "function") {
    applyPhoneShellUi(ui, screenState);
  }

  renderPhoneStage(screenState);
}


function formatMoney(amount) {
  if (typeof formatCash === "function") {
    return formatCash(amount);
  }

  return `${amount.toLocaleString("ko-KR")}\uc6d0`;
}

function showStartScreen(hasSave = false) {
  setStartScreenSaveState(hasSave);
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

  ui.memoryButton.hidden = false;
  ui.memoryButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  ui.memoryButton.classList.toggle("has-entries", entries.length > 0);
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

function applySceneBackgroundConfig(backgroundConfig = null) {
  if (!ui.bg || !backgroundConfig?.image) {
    return false;
  }

  const overlay = backgroundConfig.overlay
    || "linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.18) 100%)";
  const position = backgroundConfig.position || "center";
  const size = backgroundConfig.size || "cover";
  const repeat = backgroundConfig.repeat || "no-repeat";

  ui.bg.className = backgroundConfig.className || "custom-location-bg";
  ui.bg.style.background = `${overlay}, url('${backgroundConfig.image}') ${position} / ${size} ${repeat}`;
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
      const npcName = typeof getNpcConfig === "function"
        ? getNpcConfig(actor.npcId)?.name
        : "";
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
}

function setProgressByScene(scene) {
  const widthMap = {
    prologue: 8,
    room: 18,
    outside: 42,
    dialogue: 46,
    board: 18,
    incident: 60,
    result: 100,
    ending: 100,
  };

  ui.progressbar.style.width = `${widthMap[scene] || 0}%`;
}

function buildBuildings() {
  ui.buildings.innerHTML = "";
}

function clearChoices() {
  ui.choices.innerHTML = "";
  syncTextboxContentState();
}

function clearMessage() {
  ui.message.innerHTML = "";
  setTextboxAdvanceState(false);
  syncTextboxContentState();
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

function renderLocationMap(locationConfig, currentLocationId = "") {
  const resolvedTitle = resolveDynamicText(locationConfig?.title || locationConfig?.label || "");
  const resolvedLines = (locationConfig?.lines || []).map(resolveDynamicText);
  const map = locationConfig?.map || {};
  const titleMarkup = resolvedTitle
    ? `<div class="message-title">${escapeHtml(resolvedTitle)}</div>`
    : "";
  const copyMarkup = resolvedLines.length
    ? `<div class="message-copy">${resolvedLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>`
    : "";
  const mapTitle = map.title ? `<div class="location-map-title">${escapeHtml(map.title)}</div>` : "";
  const mapSubtitle = map.subtitle ? `<div class="location-map-subtitle">${escapeHtml(resolveDynamicText(map.subtitle))}</div>` : "";
  const nodes = Array.isArray(map.nodes) ? map.nodes : [];
  const nodesMarkup = nodes.map((node) => {
    const isCurrent = node.id === currentLocationId;
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

function createChoiceButton({ title, earnText, onClick }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-btn";

  if (earnText) {
    button.classList.add("has-earn");
  }

  const main = document.createElement("div");
  main.className = "choice-main";

  const titleElement = document.createElement("span");
  titleElement.className = "choice-title";
  titleElement.textContent = title;
  main.appendChild(titleElement);

  button.appendChild(main);

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
    title: state.day >= MAX_DAYS ? "\ucd5c\uc885 \uc815\uc0b0 \ubcf4\uae30" : "\ub2e4\uc74c \ub0a0 \uacf5\uace0 \ubcf4\uae30",
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

  setBackgroundByTone("prologue");
  setWorldMode("prologue");
  setCharacter(step.character);
  renderActors(step.actors || []);
  setCharacterPosition(50, 1);
  setSceneSpeaker(step.speaker);
  renderTags([]);
  const showChoices = renderMessage(step.title, step.lines, {
    progressKey: buildSceneTextProgressKey(`prologue:${state.storyKey}:${state.storyStep}`, step.title, step.lines),
  });
  clearChoices();

  if (!showChoices) {
    return;
  }

  step.options.forEach((option) => {
    createChoiceButton({
      title: option.title,
      onClick: () => handlePrologueOption(option.action),
    });
  });
}


function renderRoomScene() {
  setBackgroundByTone("room");
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
    return;
  }

  (outsideScene?.options || []).forEach((option) => {
    createChoiceButton({
      title: option.title,
      onClick: () => handleOutsideOption(option),
    });
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
  renderOfferButtons(state.dayOffers);
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

function getSceneTimeText() {
  if (typeof formatClockTime === "function") {
    return formatClockTime(state.timeSlot, state.timeMinuteOffset || 0);
  }

  return "08:00";
}

function renderIncidentScene() {
  const job = JOB_LOOKUP[state.currentOffer.jobId];

  setBackgroundByTone(job.tone);
  setWorldMode("incident");
  setCharacter(job.emoji);
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

  setBackgroundByTone("board");
  setWorldMode("ending");
  setCharacter("\u{1F4B0}");
  setCharacterPosition(50, 1);
  setSceneSpeaker("\uc815\uc0b0\ud45c");
  renderTags([`\ub7ad\ud0b9 ${summary.rank.label}`, summary.rank.title]);
  const endingTitle = `\ucd5c\uc885 \ud604\uae08 ${formatMoney(summary.totalCash)}`;
  const showChoices = renderMessage(endingTitle, summary.lines, {
    progressKey: buildSceneTextProgressKey(`ending:${summary.totalCash}:${summary.rank.label}`, endingTitle, summary.lines),
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
  ui.dayDisplay.textContent = `${state.day}\uc77c\ucc28 / ${totalDays}`;
  ui.moneyDisplay.textContent = formatMoney(state.money);
  ui.staminaDisplay.textContent = `${state.stamina}`;
  ui.energyDisplay.textContent = `${state.energy}`;
  ui.timeDisplay.textContent = getSceneTimeText();
  setHeadline(state.headline.badge, state.headline.text);
  setProgressByScene(state.scene);
  renderMemoryPanel();
  if (typeof persistState === "function") {
    persistState();
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

  // 내 카드 렌더링
  if (ui.rankingMyCard) {
    ui.rankingMyCard.innerHTML = `
      <div class="ranking-my-label">내 결과</div>
      <div class="ranking-my-name">${escapeHtml(myEntry.name)}</div>
      <div class="ranking-my-stats">
        <span class="ranking-my-money">${formatMoney(myEntry.money)}</span>
        <span class="ranking-my-job">${escapeHtml(myEntry.job)}</span>
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
        return `<tr class="ranking-row${me ? " ranking-row--me" : ""}">
          <td class="ranking-pos">${idx + 1}</td>
          <td class="ranking-name">${escapeHtml(entry.name || "무명")}${me ? " <span class=\"ranking-me-badge\">나</span>" : ""}</td>
          <td class="ranking-money">${formatMoney(entry.money || 0)}</td>
          <td class="ranking-job">${escapeHtml(entry.job || "무직")}</td>
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
