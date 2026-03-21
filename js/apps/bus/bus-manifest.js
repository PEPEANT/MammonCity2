function buildBusAppTabMarkup(activeScreen = "home") {
  const activeTab = activeScreen === "timetable" ? "timetable" : "home";
  return `
    <div class="phone-app-tab-row bus-phone-tab-row" role="tablist" aria-label="배금버스 탭">
      ${buildPhoneRouteButtonMarkup({
        route: "bus/home",
        label: "노선도",
        className: `phone-app-tab${activeTab === "home" ? " is-active" : ""}`,
      })}
      ${buildPhoneRouteButtonMarkup({
        route: "bus/timetable",
        label: "터미널 시간표",
        className: `phone-app-tab${activeTab === "timetable" ? " is-active" : ""}`,
      })}
    </div>
  `;
}

function buildBusRouteCardsMarkup(targetState = state) {
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  const currentLocationLabel = typeof getCurrentLocationLabel === "function"
    ? getCurrentLocationLabel(targetState)
    : "배금시";
  const canBoard = currentLocationId === "bus-stop" || currentLocationId === "bus-stop-map";
  const routeStops = Array.isArray(DAY01_WORLD_BUS_ROUTE_STOPS)
    ? DAY01_WORLD_BUS_ROUTE_STOPS
    : [];

  const summaryCard = buildPhoneAppCardMarkup({
    title: canBoard ? "바로 탑승 가능" : "조회만 가능",
    body: canBoard
      ? "목적지 선택"
      : "터미널에서 탑승",
    tone: canBoard ? "accent" : "",
  });

  const routeCards = routeStops.map((stop) => {
    const isCurrentStop = stop.id === "bus-stop";
    const actionLabel = isCurrentStop
      ? "현재 정차"
      : canBoard
        ? "탑승"
        : "터미널에서 탑승";

    return `
      <section class="phone-app-card bus-phone-route-card${stop.type === "major" ? " is-major" : ""}">
        <div class="bus-phone-stop-row">
          <div class="bus-phone-stop-copy">
            <div class="bus-phone-stop-title-row">
              <span class="bus-phone-stop-icon">${escapePhoneAppHtml(stop.emoji || "🚌")}</span>
              <span class="bus-phone-stop-title">${escapePhoneAppHtml(stop.label || stop.id || "")}</span>
              ${stop.badge ? `<span class="bus-phone-stop-badge">${escapePhoneAppHtml(stop.badge)}</span>` : ""}
            </div>
            <div class="bus-phone-stop-note">${escapePhoneAppHtml(stop.note || "")}</div>
          </div>
          <span class="bus-phone-stop-eta">${escapePhoneAppHtml(stop.eta || "")}</span>
        </div>
        <div class="phone-app-card-footer">
          <div class="phone-app-card-footer-copy">배금 100번 · ${escapePhoneAppHtml(stop.type === "major" ? "주요 정차" : "일반 정차")}</div>
          ${buildPhoneAppActionButtonMarkup({
            action: "bus-ride-to-stop",
            label: actionLabel,
            disabled: isCurrentStop || !canBoard,
            data: { "location-id": stop.id },
            className: "phone-job-apply bus-phone-cta",
          })}
        </div>
      </section>
    `;
  }).join("");

  return `${summaryCard}${routeCards}`;
}

function buildBusTimetableCardsMarkup(targetState = state) {
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  const currentLocationLabel = typeof getCurrentLocationLabel === "function"
    ? getCurrentLocationLabel(targetState)
    : "배금시";
  const canBoard = currentLocationId === "bus-stop" || currentLocationId === "bus-stop-map";
  const timetableEntries = Array.isArray(DAY01_WORLD_TERMINAL_SCHEDULE)
    ? DAY01_WORLD_TERMINAL_SCHEDULE
    : [];

  const introCard = buildPhoneAppCardMarkup({
    title: canBoard ? "고속버스 탑승 가능" : "시간표 조회",
    body: canBoard
      ? "탑승 시 도시 이탈"
      : "터미널에서 탑승",
    tone: canBoard ? "accent" : "",
  });
  const previewCard = `
    <section class="phone-app-card bus-phone-preview-card">
      <div class="bus-phone-preview-kicker">EXPRESS EXIT</div>
      <div class="bus-phone-preview-title">메트로폴리스행</div>
      <div class="bus-phone-preview-body">탑승 시 엔딩</div>
    </section>
  `;

  const scheduleCards = timetableEntries.map((entry) => {
    const times = Array.isArray(entry?.times) ? entry.times : [];
    const timesMarkup = times.map((item) => `
      <div class="bus-phone-time-chip${item?.highlight ? " is-highlight" : ""}">
        <strong>${escapePhoneAppHtml(item?.time || "")}</strong>
        <span>${escapePhoneAppHtml(item?.label || "")}</span>
      </div>
    `).join("");
    const actionMarkup = entry?.escapeEnding
      ? buildPhoneAppActionButtonMarkup({
          action: "bus-take-express",
          label: canBoard ? "고속버스 탑승" : "터미널에서 승차",
          disabled: !canBoard,
          data: { "entry-id": entry.id || "" },
          className: "phone-job-apply bus-phone-cta is-danger",
        })
      : "";

    return `
      <section class="phone-app-card bus-phone-terminal-card${entry?.escapeEnding ? " is-express" : ""}">
        <div class="bus-phone-terminal-header">
          <div class="bus-phone-terminal-copy">
            <div class="bus-phone-terminal-title">배금 → ${escapePhoneAppHtml(entry?.destination || "")}</div>
            <div class="bus-phone-terminal-meta">${escapePhoneAppHtml(entry?.routeType || "")} · ${escapePhoneAppHtml(entry?.platform || "")}</div>
          </div>
          <span class="bus-phone-terminal-status">${escapePhoneAppHtml(entry?.status || "보통")}</span>
        </div>
        <div class="bus-phone-times">${timesMarkup}</div>
        ${actionMarkup ? `
          <div class="phone-app-card-footer">
            <div class="phone-app-card-footer-copy">랭킹에 반영되지 않고 도시를 떠나는 특수 루트</div>
            ${actionMarkup}
          </div>
        ` : ""}
      </section>
    `;
  }).join("");

  return `${previewCard}${introCard}${scheduleCards}`;
}

function getBusAppManifest(targetState = state) {
  return {
    id: "bus",
    label: "배금버스",
    icon: "🚌",
    openRoute: "bus/home",
    installable: true,
    storeCategory: "교통",
    storeDescription: "버스/터미널 앱",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false, screenId = "home" } = {}) => {
      const activeScreen = screenId === "timetable" ? "timetable" : "home";
      const bodyMarkup = activeScreen === "timetable"
        ? buildBusTimetableCardsMarkup(targetState)
        : buildBusRouteCardsMarkup(targetState);

      return `
        ${buildPhoneAppScreenHeaderMarkup({
          title: "배금버스",
          showHomeButton: !stageMode,
        })}
        ${buildPhoneAppStatusMarkup("bus")}
        ${buildBusAppTabMarkup(activeScreen)}
        ${bodyMarkup}
      `;
    },
  };
}
