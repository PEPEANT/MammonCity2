function getBusCurrentBoardableLocationId(targetState = state) {
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";

  if (["bus-stop", "bus-stop-map"].includes(currentLocationId)) {
    return "bus-stop";
  }

  return currentLocationId;
}

function canBoardFromBusApp(targetState = state) {
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  return currentLocationId === "bus-stop" || currentLocationId === "bus-stop-map";
}

function getBusAppStatusBannerMarkup() {
  const status = typeof getPhoneAppStatus === "function"
    ? getPhoneAppStatus("bus")
    : null;

  if (!status?.title && !status?.body) {
    return "";
  }

  const tone = status.tone ? ` is-${escapePhoneAppHtml(status.tone)}` : "";
  return `
    <section class="bus-phone-status-banner${tone}">
      ${status.kicker ? `<div class="bus-phone-status-kicker">${escapePhoneAppHtml(status.kicker)}</div>` : ""}
      ${status.title ? `<div class="bus-phone-status-title">${escapePhoneAppHtml(status.title)}</div>` : ""}
      ${status.body ? `<div class="bus-phone-status-body">${escapePhoneAppHtml(status.body)}</div>` : ""}
    </section>
  `;
}

function getBusHeroStatusTone(label = "") {
  const normalizedLabel = String(label || "").trim();

  if (!normalizedLabel) {
    return "running";
  }

  if (normalizedLabel.includes("혼잡")) {
    return "alert";
  }

  if (normalizedLabel.includes("가능")) {
    return "ready";
  }

  if (normalizedLabel.includes("개편")) {
    return "notice";
  }

  return "running";
}

function getBusStopSummary(stop = {}) {
  const noteParts = String(stop.note || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (noteParts.length) {
    return noteParts.join(" · ");
  }

  return String(stop.badge || "").trim();
}

function getBusAppHeroValues(targetState = state) {
  const map = DAY01_WORLD_BUS_MAP || {};
  const routeStops = Array.isArray(DAY01_WORLD_BUS_ROUTE_STOPS) ? DAY01_WORLD_BUS_ROUTE_STOPS : [];
  const currentStopId = getBusCurrentBoardableLocationId(targetState);
  const currentStopIndex = routeStops.findIndex((stop) => stop.id === currentStopId);
  const nextStop = currentStopIndex >= 0 && currentStopIndex < routeStops.length - 1
    ? routeStops[currentStopIndex + 1]
    : (routeStops[1] || routeStops[0] || null);
  const activeStatus = typeof getCurrentLocationId === "function" && ["bus-stop", "bus-stop-map"].includes(getCurrentLocationId(targetState))
    ? "탑승 가능"
    : (map.statusLabel || "운행중");

  return {
    routeTitle: map.routeTitle || "배금 100번",
    routeSubtitle: map.routeSubtitle || "배금시외버스터미널 ↔ 배금역",
    serviceLabel: map.serviceLabel || "간선버스",
    statusLabel: activeStatus,
    statusTone: getBusHeroStatusTone(activeStatus),
    nextStopLabel: nextStop?.label || map.nextStopLabel || "다음 정류장",
    intervalLabel: map.intervalLabel || "10~15분",
  };
}

function buildBusBottomTabsMarkup(activeScreen = "home") {
  const activeTab = activeScreen === "timetable" ? "timetable" : "home";
  return `
    <div class="bus-phone-bottom-nav" role="tablist" aria-label="배금버스 탭">
      ${buildPhoneRouteButtonMarkup({
        route: "bus/home",
        label: "노선도",
        className: `bus-phone-bottom-tab${activeTab === "home" ? " is-active" : ""}`,
      })}
      ${buildPhoneRouteButtonMarkup({
        route: "bus/timetable",
        label: "시간표",
        className: `bus-phone-bottom-tab${activeTab === "timetable" ? " is-active" : ""}`,
      })}
    </div>
  `;
}

function buildBusRouteScreenMarkup({ stageMode = false } = {}, targetState = state) {
  const hero = getBusAppHeroValues(targetState);
  const routeStops = Array.isArray(DAY01_WORLD_BUS_ROUTE_STOPS) ? DAY01_WORLD_BUS_ROUTE_STOPS : [];
  const currentStopId = getBusCurrentBoardableLocationId(targetState);
  const canBoard = canBoardFromBusApp(targetState);
  const currentStopIndex = routeStops.findIndex((stop) => stop.id === currentStopId);

  const stopMarkup = routeStops.map((stop, index) => {
    const isCurrent = stop.id === currentStopId;
    const isMajor = stop.type === "major";
    const isPassed = currentStopIndex >= 0 && index < currentStopIndex;
    const isNext = currentStopIndex >= 0 && index === currentStopIndex + 1;
    const canRideHere = canBoard && !isCurrent;
    const actionMarkup = canRideHere
      ? buildPhoneAppActionButtonMarkup({
          action: "bus-ride-to-stop",
          label: "탑승",
          data: { "location-id": stop.id },
          className: "bus-phone-stop-action",
        })
      : (isCurrent
        ? '<span class="bus-phone-stop-pill is-current">현재</span>'
        : `<span class="bus-phone-stop-pill">${escapePhoneAppHtml(canBoard ? "도착 예정" : "조회")}</span>`);

    return `
      <article class="bus-phone-stop-item${isMajor ? " is-major" : ""}${isCurrent ? " is-current" : ""}${isPassed ? " is-passed" : ""}${isNext ? " is-next" : ""}">
        <div class="bus-phone-stop-rail" aria-hidden="true">
          <span class="bus-phone-stop-dot"></span>
        </div>
        <div class="bus-phone-stop-main">
          <div class="bus-phone-stop-head">
            <div class="bus-phone-stop-copy">
              <div class="bus-phone-stop-title-line">
                <span class="bus-phone-stop-name">${escapePhoneAppHtml(stop.label || stop.id || "")}</span>
                ${stop.emoji ? `<span class="bus-phone-stop-emoji" aria-hidden="true">${escapePhoneAppHtml(stop.emoji)}</span>` : ""}
              </div>
              <div class="bus-phone-stop-desc">${escapePhoneAppHtml(getBusStopSummary(stop))}</div>
            </div>
            <div class="bus-phone-stop-side">
              <span class="bus-phone-stop-eta">${escapePhoneAppHtml(stop.eta || "")}</span>
              ${actionMarkup}
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  return `
    <section class="bus-phone-shell is-route">
      <div class="bus-phone-top bus-phone-top-route">
        <div class="bus-phone-hero">
          <div class="bus-phone-hero-head">
            <div>
              <div class="bus-phone-hero-badges">
                <span class="bus-phone-hero-badge">${escapePhoneAppHtml(hero.serviceLabel)}</span>
                <span class="bus-phone-hero-badge is-status is-${escapePhoneAppHtml(hero.statusTone)}">${escapePhoneAppHtml(hero.statusLabel)}</span>
              </div>
              <h1 class="bus-phone-hero-title">${escapePhoneAppHtml(hero.routeTitle)}</h1>
              <p class="bus-phone-hero-subtitle">${escapePhoneAppHtml(hero.routeSubtitle)}</p>
            </div>
            ${!stageMode ? '<button class="bus-phone-refresh-btn" type="button" data-phone-action="close-phone-view" aria-label="홈">홈</button>' : ""}
          </div>
          <div class="bus-phone-hero-stats">
            <div class="bus-phone-hero-stat">
              <span class="bus-phone-hero-stat-label">다음 정류장</span>
              <strong>${escapePhoneAppHtml(hero.nextStopLabel)}</strong>
            </div>
            <div class="bus-phone-hero-stat">
              <span class="bus-phone-hero-stat-label">배차 간격</span>
              <strong>${escapePhoneAppHtml(hero.intervalLabel)}</strong>
            </div>
          </div>
        </div>
        ${getBusAppStatusBannerMarkup()}
      </div>
      <div class="bus-phone-body">
        <div class="bus-phone-route-list">
          ${stopMarkup}
        </div>
      </div>
      ${buildBusBottomTabsMarkup("home")}
    </section>
  `;
}

function buildBusTimetableScreenMarkup({ stageMode = false } = {}, targetState = state) {
  const terminalName = DAY01_WORLD_BUS_MAP?.terminalName || "배금시외버스터미널";
  const terminalSubtitle = DAY01_WORLD_BUS_MAP?.terminalSubtitle || "출발 시간표";
  const timetableEntries = Array.isArray(DAY01_WORLD_TERMINAL_SCHEDULE) ? DAY01_WORLD_TERMINAL_SCHEDULE : [];
  const canBoard = canBoardFromBusApp(targetState);

  const scheduleMarkup = timetableEntries.map((entry) => {
    const times = Array.isArray(entry?.times) ? entry.times : [];
    const timesMarkup = times.map((item) => `
      <div class="bus-phone-time-chip${item?.highlight ? " is-highlight" : ""}">
        <strong>${escapePhoneAppHtml(item?.time || "")}</strong>
        <span>${escapePhoneAppHtml(item?.label || "")}</span>
      </div>
    `).join("");
    const statusClass = entry?.status === "여유"
      ? "is-easy"
      : (entry?.status === "혼잡" ? "is-busy" : "is-normal");
    const actionMarkup = entry?.escapeEnding
      ? buildPhoneAppActionButtonMarkup({
          action: "bus-take-express",
          label: canBoard ? "탑승" : "터미널 필요",
          disabled: !canBoard,
          data: { "entry-id": entry.id || "" },
          className: "bus-phone-terminal-action",
        })
      : "";

    return `
      <article class="bus-phone-terminal-item${entry?.escapeEnding ? " is-express" : ""}">
        <div class="bus-phone-terminal-head">
          <div class="bus-phone-terminal-copy">
            <div class="bus-phone-terminal-name">배금 → ${escapePhoneAppHtml(entry?.destination || "")}</div>
            <div class="bus-phone-terminal-meta">${escapePhoneAppHtml(entry?.routeType || "")} · ${escapePhoneAppHtml(entry?.platform || "")}</div>
          </div>
          <span class="bus-phone-terminal-status ${statusClass}">${escapePhoneAppHtml(entry?.status || "보통")}</span>
        </div>
        <div class="bus-phone-times">${timesMarkup}</div>
        ${actionMarkup ? `<div class="bus-phone-terminal-actions">${actionMarkup}</div>` : ""}
      </article>
    `;
  }).join("");

  return `
    <section class="bus-phone-shell is-timetable">
      <div class="bus-phone-top bus-phone-top-timetable">
        <div class="bus-phone-terminal-hero">
          <div>
            <div class="bus-phone-terminal-kicker">TERMINAL</div>
            <h1 class="bus-phone-terminal-hero-title">${escapePhoneAppHtml(terminalName)}</h1>
            <p class="bus-phone-terminal-hero-subtitle">${escapePhoneAppHtml(terminalSubtitle)}</p>
          </div>
          ${!stageMode ? '<button class="bus-phone-refresh-btn" type="button" data-phone-action="close-phone-view" aria-label="홈">홈</button>' : ""}
        </div>
        ${getBusAppStatusBannerMarkup()}
      </div>
      <div class="bus-phone-body is-timetable">
        <div class="bus-phone-terminal-list">
          ${scheduleMarkup}
        </div>
      </div>
      ${buildBusBottomTabsMarkup("timetable")}
    </section>
  `;
}

function getBusAppManifest(targetState = state) {
  return {
    id: "bus",
    label: "배금버스",
    icon: "🚌",
    openRoute: "bus/home",
    screenMode: "fullbleed",
    installable: true,
    storeCategory: "교통",
    storeDescription: "버스/터미널 앱",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false, screenId = "home" } = {}) => (
      screenId === "timetable"
        ? buildBusTimetableScreenMarkup({ stageMode }, targetState)
        : buildBusRouteScreenMarkup({ stageMode }, targetState)
    ),
  };
}
