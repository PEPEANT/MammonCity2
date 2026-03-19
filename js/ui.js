let ui = {};

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
  ui.phoneLockedBadge = document.getElementById("phone-locked-badge");
  ui.phoneTimeDisplay = document.getElementById("phone-time-display");
  ui.phoneStatusSignal = document.getElementById("phone-status-signal");
  ui.phoneDayChip = document.getElementById("phone-day-chip");
  ui.phoneHeaderSub = document.getElementById("phone-hd-sub");
  ui.phoneAppScreen = document.getElementById("phone-app-screen");
  ui.phonePreview = document.getElementById("phone-preview");
  ui.phonePreviewKicker = document.getElementById("phone-preview-kicker");
  ui.phonePreviewState = document.getElementById("phone-preview-state");
  ui.phonePreviewTitle = document.getElementById("phone-preview-title");
  ui.phonePreviewBody = document.getElementById("phone-preview-body");
  ui.phoneToggleButton = document.getElementById("phone-toggle-btn");
  setupStartScreen();
  buildBuildings();
}

function setupStartScreen() {
  ui.startCard = ui.startScreen.querySelector(".start-card");

  const title = ui.startCard.querySelector(".start-title");
  const sub = ui.startCard.querySelector(".start-sub");
  title.textContent = "배금도시";
  sub.textContent = "30일동안 돈을 모으세요.";
  ui.nameInput.placeholder = "닉네임";
  ui.nameInput.autocomplete = "off";
  ui.startButton.textContent = "시작하기";
  if (ui.continueButton) {
    ui.continueButton.textContent = "이어하기";
    ui.continueButton.hidden = true;
  }
}

function setStartScreenSaveState(hasSave = false) {
  if (ui.continueButton) {
    ui.continueButton.hidden = !hasSave;
  }

  if (ui.startButton) {
    ui.startButton.textContent = hasSave ? "새로 시작" : "시작하기";
  }
}

function setSceneSpeaker(text) {
  const resolved = text || "";
  ui.playerDisplay.textContent = resolved;
  ui.speaker.textContent = resolved;
}

function updatePhonePanel() {
  if (!ui.phonePanel) return;
  const unlocked = Boolean(state.hasPhone);
  const usedToday = Boolean(state.phoneUsedToday);
  const minimized = Boolean(state.phoneMinimized);
  const phoneView = state.phoneView || "home";
  const preview = state.phonePreview || {};
  const phoneTime = typeof getSceneTimeText === "function" ? getSceneTimeText() : "08:00";
  const canUseApps = typeof canUsePhoneApps === "function" ? canUsePhoneApps() : unlocked;
  const hasShiftToday = Boolean(state.nextDayShift && state.nextDayShift.day === state.day);
  const hasBookedShift = Boolean(state.nextDayShift && state.nextDayShift.day > state.day);
  const jobAppliedToday = Boolean(state.jobApplicationDoneToday);

  ui.phonePanel.classList.toggle("is-unlocked", unlocked);
  ui.phonePanel.classList.toggle("phone-used", usedToday);
  ui.phonePanel.classList.toggle("is-hidden-panel", minimized);
  ui.game?.classList.toggle("phone-collapsed", minimized);

  if (ui.phoneToggleButton) {
    ui.phoneToggleButton.hidden = !unlocked;
    ui.phoneToggleButton.textContent = minimized ? "폰 열기" : "폰 숨기기";
    ui.phoneToggleButton.setAttribute("aria-expanded", minimized ? "false" : "true");
    ui.phoneToggleButton.classList.toggle("is-active", !minimized);
  }

  if (ui.phoneTimeDisplay) {
    ui.phoneTimeDisplay.textContent = phoneTime;
  }

  if (ui.phoneStatusSignal) {
    ui.phoneStatusSignal.textContent = !unlocked
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
                : "HOLD";
  }

  if (ui.phoneDayChip) {
    ui.phoneDayChip.textContent = `DAY ${String(state.day).padStart(2, "0")}`;
  }

  if (ui.phoneHeaderSub) {
    ui.phoneHeaderSub.textContent = !unlocked
      ? "아직 사용할 수 없다."
      : !canUseApps
        ? "현재 장면이 끝나면 공고를 확인할 수 있다."
        : hasShiftToday
          ? "오늘 예약된 출근이 있다."
          : hasBookedShift
            ? "내일 출근 예약이 잡혀 있다."
            : jobAppliedToday
              ? "오늘 공고 지원을 끝냈다."
              : usedToday
                ? "오늘 생활 앱을 한 번 사용했다."
                : "1일차부터 바로 사용할 수 있다.";
  }

  if (ui.phoneLockedBadge) {
    ui.phoneLockedBadge.textContent = !unlocked
      ? "잠금 중"
      : hasShiftToday
        ? "오늘 출근"
        : hasBookedShift
          ? "출근 예약"
          : jobAppliedToday
            ? "지원 완료"
            : usedToday
              ? "생활 앱 완료"
              : "앱 사용 가능";
  }

  if (ui.phonePreviewKicker) {
    ui.phonePreviewKicker.textContent = preview.kicker || "HOME";
  }

  if (ui.phonePreviewState) {
    ui.phonePreviewState.textContent = preview.state || (usedToday ? "DONE" : "READY");
  }

  if (ui.phonePreviewTitle) {
    ui.phonePreviewTitle.textContent = preview.title || "오늘의 폰 화면";
  }

  if (ui.phonePreviewBody) {
    ui.phonePreviewBody.textContent = preview.body || "스마트폰으로 오늘 공고와 생활 앱을 바로 확인할 수 있다.";
  }

  if (ui.phoneAppScreen && ui.phonePreview) {
    const showAppScreen = phoneView === "jobs";
    ui.phoneAppScreen.hidden = !showAppScreen;
    ui.phonePreview.hidden = showAppScreen;

    if (showAppScreen) {
      renderPhoneJobsApp();
    } else {
      ui.phoneAppScreen.innerHTML = "";
    }
  }

  ui.phonePanel.querySelectorAll(".phone-app-btn[data-app]").forEach((button) => {
    const activeAppId = phoneView === "jobs" ? "jobs" : preview.appId;
    const active = activeAppId === button.dataset.app;
    button.classList.toggle("is-selected", active);
    button.disabled = button.dataset.app === "jobs"
      ? (!unlocked || !canUseApps)
      : (!unlocked || !canUseApps || usedToday);
  });
}

function renderPhoneJobsApp() {
  if (!ui.phoneAppScreen) {
    return;
  }

  const result = state.interviewResult && state.interviewResult.day === state.day
    ? state.interviewResult
    : null;
  const bookedShift = state.nextDayShift || null;
  const canApply = typeof canApplyForJobOffer === "function" ? canApplyForJobOffer() : false;
  const offerCards = (state.dayOffers || []).map((offer, index) => {
    const job = JOB_LOOKUP[offer.jobId];
    const tags = (job.tags || []).slice(0, 2).map((tag) => `<span class="phone-job-tag">${escapeHtml(tag)}</span>`).join("");
    const disabledReason = bookedShift
      ? "예약된 출근이 있다"
      : state.jobApplicationDoneToday
        ? "오늘은 이미 지원했다"
        : "";

    return `
      <article class="phone-job-card">
        <div class="phone-job-card-top">
          <div class="phone-job-card-title">${escapeHtml(job.emoji)} ${escapeHtml(job.title)}</div>
          <div class="phone-job-pay">${formatMoney(offer.pay)}</div>
        </div>
        <div class="phone-job-card-body">${escapeHtml(job.description || "오늘 바로 연결되는 단기 공고.")}</div>
        <div class="phone-job-meta">
          <div class="phone-job-tags">${tags}</div>
          <button
            class="phone-job-apply"
            type="button"
            data-phone-action="apply-job"
            data-offer-index="${index}"
            ${canApply ? "" : "disabled"}
            title="${escapeHtml(disabledReason)}"
          >
            ${canApply ? "지원" : "마감"}
          </button>
        </div>
      </article>
    `;
  }).join("");

  const statusCards = [];

  if (bookedShift) {
    const job = JOB_LOOKUP[bookedShift.offer.jobId];
    const dueToday = bookedShift.day === state.day;
    statusCards.push(`
      <section class="phone-job-status-card is-booked">
        <div class="phone-job-status-label">
          <span>${dueToday ? "TODAY SHIFT" : "BOOKED SHIFT"}</span>
          <span>DAY ${String(bookedShift.day).padStart(2, "0")}</span>
        </div>
        <div class="phone-job-status-title">${escapeHtml(job.emoji)} ${escapeHtml(job.title)}</div>
        <div class="phone-job-status-body">
          ${dueToday ? "오늘은 이 근무로 출근할 차례다." : `다음 출근일은 ${bookedShift.day}일차다.`}
        </div>
        ${dueToday ? '<button class="phone-job-apply" type="button" data-phone-action="go-shift">출근하기</button>' : ""}
      </section>
    `);
  }

  if (result) {
    const job = JOB_LOOKUP[result.offer.jobId];
    statusCards.push(`
      <section class="phone-job-status-card ${result.success ? "is-success" : "is-fail"}">
        <div class="phone-job-status-label">
          <span>${result.success ? "INTERVIEW PASS" : "INTERVIEW FAIL"}</span>
          <span>${Math.round((result.chance || 0) * 100)}%</span>
        </div>
        <div class="phone-job-status-title">${escapeHtml(job.emoji)} ${escapeHtml(job.title)}</div>
        <div class="phone-job-status-body">${escapeHtml((result.lines || []).join(" "))}</div>
      </section>
    `);
  }

  ui.phoneAppScreen.innerHTML = `
    <div class="phone-app-screen-top">
      <div class="phone-app-screen-copy">
        <span class="phone-app-screen-kicker">JOB APP</span>
        <div class="phone-app-screen-title">오늘의 공고</div>
        <div class="phone-app-screen-note">공고를 보고 지원하면 면접 결과가 바로 도착한다.</div>
      </div>
      <button class="phone-app-mini-btn" type="button" data-phone-action="close-phone-view">홈</button>
    </div>
    ${statusCards.join("")}
    ${offerCards || '<div class="phone-job-empty">오늘은 확인할 공고가 없다.</div>'}
  `;
}

function formatMoney(amount) {
  return `${amount.toLocaleString("ko-KR")}원`;
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
  ui.headlineStrip.classList.toggle("is-hidden", !badge && !text);
}

function setBackgroundByTone(tone) {
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
    room: "room",       /* 방 배경: 실내 이미지 */
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
  ui.character.textContent = emoji ?? "🧑";
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

  actors.forEach((actor) => {
    const wrapper = document.createElement("div");
    wrapper.className = "scene-actor";

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
  // 우측 폰 패널 폭만큼 씬 중심을 자동 보정한다.
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
}

function clearMessage() {
  ui.message.innerHTML = "";
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
    button.setAttribute("aria-label", `쓰레기 ${item.id}`);

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

function renderMessage(title, lines = []) {
  const resolvedTitle = resolveDynamicText(title);
  const resolvedLines = lines.map(resolveDynamicText);
  const titleMarkup = resolvedTitle
    ? `<div class="message-title">${escapeHtml(resolvedTitle)}</div>`
    : "";
  const copy = resolvedLines.length
    ? `<div class="message-copy">${resolvedLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>`
    : "";

  ui.message.innerHTML = `
    ${titleMarkup}
    ${copy}
  `;
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
    title: state.day >= MAX_DAYS ? "최종 정산 보기" : "다음 날 공고 보기",
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
  renderMessage(step.title, step.lines);
  clearChoices();

  step.options.forEach((option) => {
    createChoiceButton({
      title: option.title,
      onClick: () => handlePrologueOption(option.action),
    });
  });
}

/*
function renderRoomScene() {
  setBackgroundByTone("room");
  setWorldMode("room");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker("부모님집");
  renderTags([]);
  const scheduledShift = typeof getScheduledShiftForToday === "function"
    ? getScheduledShiftForToday()
    : null;
  if (scheduledShift) {
    const job = JOB_LOOKUP[scheduledShift.offer.jobId];
    renderMessage("오늘 예약된 출근이 있다", [
      `${job.title} 면접에 붙었다.`,
      "출근을 시작하거나, 오늘은 포기하고 넘길 수 있다.",
    ]);
  } else {
    clearMessage();
  }
  clearChoices();
  if (scheduledShift) {
    createChoiceButton({
      title: "예약된 출근 가기",
      onClick: startScheduledShift,
    });
    createChoiceButton({
      title: "결근하고 넘기기",
      onClick: skipScheduledShift,
    });
  }
  createChoiceButton({
    title: "밖을 나가기",
    onClick: goOutside,
  });
  createChoiceButton({
    title: "잠을 자기",
    onClick: sleepInRoom,
  });
}

function renderRoomScene() {
  setBackgroundByTone("room");
  setWorldMode("room");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker("遺紐⑤떂吏?);
  renderTags([]);

  const shiftStatus = typeof getScheduledShiftStatus === "function"
    ? getScheduledShiftStatus()
    : null;

  if (shiftStatus) {
    const job = JOB_LOOKUP[shiftStatus.scheduledShift.offer.jobId];
    const shiftWindow = typeof formatClockTime === "function"
      ? `${formatClockTime(shiftStatus.startSlot)} - ${formatClockTime(shiftStatus.endSlot)}`
      : "";

    if (shiftStatus.waiting) {
      renderMessage("오늘 예약된 출근이 있다", [
        `${job.title} 출근 시간은 ${shiftWindow}이다.`,
        "출근 전까지 다른 행동을 하거나 바로 시간을 보낼 수 있다.",
      ]);
    } else if (shiftStatus.active) {
      renderMessage("지금 출근할 수 있다", [
        `${job.title} 근무 시간은 ${shiftWindow}이다.`,
        "준비가 됐다면 바로 출근해서 오늘 근무를 시작한다.",
      ]);
    } else {
      renderMessage("예약된 출근 시간이 지났다", [
        `${job.title} 근무 시간 ${shiftWindow}을 놓쳤다.`,
        "결근 처리하고 오늘을 넘길 수 있다.",
      ]);
    }
  } else {
    clearMessage();
  }

  clearChoices();

  if (shiftStatus) {
    if (shiftStatus.waiting) {
      createChoiceButton({
        title: `${typeof formatClockTime === "function" ? formatClockTime(shiftStatus.startSlot) : "출근"}까지 시간 보내기`,
        onClick: waitForScheduledShift,
      });
    } else if (shiftStatus.active) {
      createChoiceButton({
        title: "?덉빟??異쒓렐 媛湲?,
        onClick: startScheduledShift,
      });
    }

    createChoiceButton({
      title: "寃곌렐?섍퀬 ?섍린湲?,
      onClick: skipScheduledShift,
    });
  }

  createChoiceButton({
    title: "30분 보내기",
    onClick: waitInRoom,
  });
  createChoiceButton({
    title: "諛뽰쓣 ?섍?湲?,
    onClick: goOutside,
  });
  createChoiceButton({
    title: "?좎쓣 ?먭린",
    onClick: sleepInRoom,
  });
}
*/

/*
function renderRoomScene() {
  setBackgroundByTone("room");
  setWorldMode("room");
  setCharacter("");
  renderActors([]);
  setCharacterPosition(50, 1);
  setSceneSpeaker("부모님집");
  renderTags([]);

  const shiftStatus = typeof getScheduledShiftStatus === "function"
    ? getScheduledShiftStatus()
    : null;

  if (shiftStatus) {
    const job = JOB_LOOKUP[shiftStatus.scheduledShift.offer.jobId];
    const shiftWindow = typeof formatClockTime === "function"
      ? `${formatClockTime(shiftStatus.startSlot)} - ${formatClockTime(shiftStatus.endSlot)}`
      : "";

    if (shiftStatus.waiting) {
      renderMessage("오늘 예약된 출근이 있다", [
        `${job.title} 출근 시간은 ${shiftWindow}이다.`,
        "출근 전까지 다른 행동을 하거나 바로 시간을 보낼 수 있다.",
      ]);
    } else if (shiftStatus.active) {
      renderMessage("지금 출근할 수 있다", [
        `${job.title} 근무 시간은 ${shiftWindow}이다.`,
        "준비가 됐다면 바로 출근해서 오늘 근무를 시작한다.",
      ]);
    } else {
      renderMessage("예약된 출근 시간이 지났다", [
        `${job.title} 근무 시간 ${shiftWindow}을 놓쳤다.`,
        "결근 처리하고 오늘을 넘길 수 있다.",
      ]);
    }
  } else {
    clearMessage();
  }

  clearChoices();

  if (shiftStatus) {
    if (shiftStatus.waiting) {
      createChoiceButton({
        title: `${typeof formatClockTime === "function" ? formatClockTime(shiftStatus.startSlot) : "출근"}까지 시간 보내기`,
        onClick: waitForScheduledShift,
      });
    } else if (shiftStatus.active) {
      createChoiceButton({
        title: "예약된 출근 가기",
        onClick: startScheduledShift,
      });
    }

    createChoiceButton({
      title: "결근하고 넘기기",
      onClick: skipScheduledShift,
    });
  }

  createChoiceButton({
    title: "30분 보내기",
    onClick: waitInRoom,
  });
  createChoiceButton({
    title: "밖을 나가기",
    onClick: goOutside,
  });
  createChoiceButton({
    title: "잠을 잔다",
    onClick: sleepInRoom,
  });
}
*/

/*
function renderRoomSceneV2() {
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

    if (shiftStatus.waiting) {
      renderMessage("\uc624\ub298 \uc608\uc57d\ub41c \ucd9c\uadfc\uc774 \uc788\ub2e4", [
        `${job.title} \ucd9c\uadfc \uc2dc\uac04\uc740 ${shiftWindow}\uc774\ub2e4.`,
        "\ucd9c\uadfc \uc804\uae4c\uc9c0 \ub2e4\ub978 \ud589\ub3d9\uc744 \ud558\uac70\ub098 \ubc14\ub85c \uc2dc\uac04\uc744 \ubcf4\ub0bc \uc218 \uc788\ub2e4.",
      ]);
    } else if (shiftStatus.active) {
      renderMessage("\uc9c0\uae08 \ucd9c\uadfc\ud560 \uc218 \uc788\ub2e4", [
        `${job.title} \uadfc\ubb34 \uc2dc\uac04\uc740 ${shiftWindow}\uc774\ub2e4.`,
        "\uc900\ube44\uac00 \ub410\ub2e4\uba74 \ubc14\ub85c \ucd9c\uadfc\ud574\uc11c \uc624\ub298 \uadfc\ubb34\ub97c \uc2dc\uc791\ud55c\ub2e4.",
      ]);
    } else {
      renderMessage("\uc608\uc57d\ub41c \ucd9c\uadfc \uc2dc\uac04\uc774 \uc9c0\ub0ac\ub2e4", [
        `${job.title} \uadfc\ubb34 \uc2dc\uac04 ${shiftWindow}\uc744 \ub193\uc쳤\ub2e4.`,
        "\uacb0\uadfc \ucc98\ub9ac\ud558\uace0 \uc624\ub298\uc744 \ub118\uae38 \uc218 \uc788\ub2e4.",
      ]);
    }
  } else {
    clearMessage();
  }

  clearChoices();

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
*/

function renderRoomSceneV3() {
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

    if (shiftStatus.waiting) {
      renderMessage("\uc624\ub298 \uc608\uc57d\ub41c \ucd9c\uadfc\uc774 \uc788\ub2e4", [
        `${job.title} \ucd9c\uadfc \uc2dc\uac04\uc740 ${shiftWindow}\uc774\ub2e4.`,
        "\ucd9c\uadfc \uc804\uae4c\uc9c0 \ub2e4\ub978 \ud589\ub3d9\uc744 \ud558\uac70\ub098 \ubc14\ub85c \uc2dc\uac04\uc744 \ubcf4\ub0bc \uc218 \uc788\ub2e4.",
      ]);
    } else if (shiftStatus.active) {
      renderMessage("\uc9c0\uae08 \ucd9c\uadfc\ud560 \uc218 \uc788\ub2e4", [
        `${job.title} \uadfc\ubb34 \uc2dc\uac04\uc740 ${shiftWindow}\uc774\ub2e4.`,
        "\uc900\ube44\uac00 \ub410\ub2e4\uba74 \ubc14\ub85c \ucd9c\uadfc\ud574\uc11c \uc624\ub298 \uadfc\ubb34\ub97c \uc2dc\uc791\ud55c\ub2e4.",
      ]);
    } else {
      renderMessage("\uc608\uc57d\ub41c \ucd9c\uadfc \uc2dc\uac04\uc774 \uc9c0\ub0ac\ub2e4", [
        `${job.title} \uadfc\ubb34 \uc2dc\uac04 ${shiftWindow}\uc744 \ub193\uccd0\ub2e4.`,
        "\uacb0\uadfc \ucc98\ub9ac\ud558\uace0 \uc624\ub298\uc744 \ub118\uae38 \uc218 \uc788\ub2e4.",
      ]);
    }
  } else {
    clearMessage();
  }

  clearChoices();

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

  setBackgroundByTone("outside");
  setWorldMode("outside");
  setCharacter("");
  renderActors(outsideScene?.actors || []);
  setCharacterPosition(50, 1);
  setSceneSpeaker(outsideScene?.speaker || "아파트 앞");
  renderTags([]);
  renderMessage(outsideScene?.title || "", outsideScene?.lines || []);
  clearChoices();

  (outsideScene?.options || []).forEach((option) => {
    createChoiceButton({
      title: option.title,
      onClick: () => handleOutsideOption(option.action),
    });
  });
}

function renderBoardScene() {
  setBackgroundByTone("board");
  setWorldMode("board");
  setCharacter("🧑");
  setCharacterPosition(50, 1);
  setSceneSpeaker("구인 앱");
  renderTags([]);
  clearMessage();
  renderOfferButtons(state.dayOffers);
}

function renderCleanupScene() {
  setBackgroundByTone("cleanup");
  setWorldMode("cleanup");
  setCharacter("");
  setCharacterPosition(50, 1);
  setSceneSpeaker("부모님집");
  renderTags([]);
  clearMessage();
  clearChoices();
  renderTrashGame();
}

function getSceneTimeText() {
  if (state.scene === "prologue") {
    return state.storyStep === 0 ? "06:30" : "07:10";
  }

  const map = {
    room: "08:00",
    cleanup: "07:20",
    outside: "09:00",
    board: "09:30",
    incident: "14:00",
    result: "20:00",
    ending: "23:59",
  };

  return map[state.scene] || "08:00";
}

function getSceneTimeText() {
  if (typeof formatClockTime === "function") {
    return formatClockTime(state.timeSlot);
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
  renderMessage(state.currentIncident.title, state.currentIncident.intro);
  renderChoiceButtons(state.currentIncident);
}

function renderResultScene() {
  const job = JOB_LOOKUP[state.currentOffer.jobId];

  setBackgroundByTone(job.tone);
  setWorldMode("result");
  setCharacter(job.emoji);
  setCharacterPosition(50, 1);
  setSceneSpeaker("그날 근무 종료");
  renderTags([]);
  renderMessage(`오늘 손에 쥔 돈 ${formatMoney(state.lastResult.pay)}`, state.lastResult.lines);
  renderNextDayButton();
}

function renderEndingScene() {
  const summary = state.endingSummary;

  setBackgroundByTone("board");
  setWorldMode("ending");
  setCharacter("💰");
  setCharacterPosition(50, 1);
  setSceneSpeaker("정산표");
  renderTags([`랭킹 ${summary.rank.label}`, summary.rank.title]);
  renderMessage(`최종 현금 ${formatMoney(summary.totalCash)}`, summary.lines);
  clearChoices();
  createChoiceButton({
    title: "처음부터 다시 하기",
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
  ui.dayDisplay.textContent = `${state.day}일차 / ${totalDays}`;
  ui.moneyDisplay.textContent = formatMoney(state.money);
  ui.staminaDisplay.textContent = `${state.stamina}`;
  ui.energyDisplay.textContent = `${state.energy}`;
  ui.timeDisplay.textContent = getSceneTimeText();
  setHeadline(state.headline.badge, state.headline.text);
  setProgressByScene(state.scene);
  if (typeof persistState === "function") {
    persistState();
  }

  if (state.scene === "prologue") {
    renderPrologueScene();
    return;
  }

  if (state.scene === "room") {
    renderRoomSceneV3();
    return;
  }

  if (state.scene === "outside") {
    renderOutsideScene();
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

  renderResultScene();
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
  const displayName = rawName && rawName !== "이름 없음" ? rawName : "";
  const nameCall = displayName ? `${displayName}아` : "얘야";

  return String(text)
    .replaceAll("{nameCall}", nameCall)
    .replaceAll("{name}", displayName);
}
