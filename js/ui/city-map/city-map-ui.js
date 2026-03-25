var cityMapUiState = window.cityMapUiState || {
  open: false,
  selectedLocationId: "",
  cardOpen: false,
};
window.cityMapUiState = cityMapUiState;

function escapeCityMapHtml(text) {
  if (typeof escapeHtml === "function") {
    return escapeHtml(text);
  }

  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function syncCityMapQuickButtons() {
  if (typeof getPhonePanelState !== "function" || typeof applyPhoneShellUi !== "function") {
    return;
  }

  applyPhoneShellUi(ui, getPhonePanelState());
}

function ensureCityMapUi() {
  if (ui.cityMapOverlay && document.body.contains(ui.cityMapOverlay)) {
    return ui.cityMapOverlay;
  }

  const overlay = document.createElement("div");
  overlay.id = "city-map-overlay";
  overlay.hidden = true;
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="city-map-overlay-backdrop" data-city-map-action="close"></div>
    <section class="city-map-surface" aria-label="도시 지도">
      <header class="city-map-header">
        <div class="city-map-title-wrap">
          <span class="city-map-title-icon" aria-hidden="true">🗺️</span>
          <div class="city-map-title-copy">
            <div id="city-map-shell-title" class="city-map-title">배금시 이동 지도</div>
            <div id="city-map-shell-subtitle" class="city-map-subtitle"></div>
          </div>
        </div>
        <button type="button" class="city-map-close-btn" data-city-map-action="close" aria-label="지도 닫기">✕</button>
      </header>
      <div class="city-map-current-bar">
        <span class="city-map-current-dot" aria-hidden="true"></span>
        <span class="city-map-current-label">현재 위치</span>
        <strong id="city-map-current-name" class="city-map-current-name"></strong>
      </div>
      <div class="city-map-canvas-wrap">
        <div class="city-map-board-viewport">
          <div id="city-map-board" class="city-map-board"></div>
        </div>
        <aside id="city-map-card" class="city-map-travel-card" aria-live="polite"></aside>
      </div>
      <div id="city-map-legend" class="city-map-legend"></div>
    </section>
  `;

  overlay.addEventListener("click", handleCityMapOverlayClick);
  document.body.appendChild(overlay);

  ui.cityMapOverlay = overlay;
  ui.cityMapShellTitle = overlay.querySelector("#city-map-shell-title");
  ui.cityMapShellSubtitle = overlay.querySelector("#city-map-shell-subtitle");
  ui.cityMapCurrentName = overlay.querySelector("#city-map-current-name");
  ui.cityMapCanvasWrap = overlay.querySelector(".city-map-canvas-wrap");
  ui.cityMapBoardViewport = overlay.querySelector(".city-map-board-viewport");
  ui.cityMapBoard = overlay.querySelector("#city-map-board");
  ui.cityMapLegend = overlay.querySelector("#city-map-legend");
  ui.cityMapCard = overlay.querySelector("#city-map-card");

  return overlay;
}

function getDefaultCityMapSelection(targetState = state) {
  const currentLocationId = getCurrentCityMapLocationId(targetState);
  const nodes = getCityMapNodes(targetState).filter((node) => node.unlocked && node.id !== currentLocationId);
  return nodes[0]?.id || "";
}

function ensureCityMapSelection(targetState = state) {
  const validNodeIds = new Set(getCityMapNodes(targetState).filter((node) => node.unlocked).map((node) => node.id));
  const currentLocationId = getCurrentCityMapLocationId(targetState);

  if (!cityMapUiState.selectedLocationId || !validNodeIds.has(cityMapUiState.selectedLocationId) || cityMapUiState.selectedLocationId === currentLocationId) {
    cityMapUiState.selectedLocationId = "";
    cityMapUiState.cardOpen = false;
  }

  return cityMapUiState.selectedLocationId;
}

function openCityMapOverlay(targetState = state) {
  if (ui.game?.classList.contains("phone-focus-active")) {
    return false;
  }

  if (!canShowCityMapForState(targetState)) {
    return false;
  }

  cityMapUiState.open = true;
  cityMapUiState.cardOpen = false;
  ensureCityMapSelection(targetState);
  renderCityMapOverlay(targetState);
  return true;
}

function openCityMapOverlayToLocation(locationId = "", targetState = state) {
  const normalizedLocationId = typeof getCityMapAnchorLocationId === "function"
    ? getCityMapAnchorLocationId(locationId, targetState) || String(locationId || "").trim()
    : String(locationId || "").trim();
  if (normalizedLocationId) {
    cityMapUiState.selectedLocationId = normalizedLocationId;
  }
  cityMapUiState.cardOpen = false;
  return openCityMapOverlay(targetState);
}

function hideCityMapOverlay(options = {}) {
  const preserveSelection = options?.preserveSelection === true;

  cityMapUiState.open = false;
  cityMapUiState.cardOpen = false;
  if (!preserveSelection) {
    cityMapUiState.selectedLocationId = "";
  }

  if (ui.cityMapOverlay) {
    ui.cityMapOverlay.hidden = true;
    ui.cityMapOverlay.setAttribute("aria-hidden", "true");
    ui.cityMapOverlay.classList.remove("is-open");
  }

  document.body.classList.remove("city-map-modal-open");
  ui.game?.classList.remove("city-map-open");
  syncCityMapQuickButtons();
}

function toggleCityMapOverlay(forceOpen) {
  if (forceOpen === true || !cityMapUiState.open) {
    openCityMapOverlay(state);
    return;
  }

  hideCityMapOverlay();
}

function getCityMapDistrictLabel(node = null, targetState = state) {
  if (!node?.districtId || typeof getWorldDistrictLabel !== "function") {
    return "";
  }

  return getWorldDistrictLabel(node.districtId, targetState?.day || 1);
}

function getCityMapNodeToneClass(node = null) {
  const tone = String(node?.zoneTone || node?.districtId || "default").trim();
  return tone ? `tone-${tone}` : "tone-default";
}

function getCityMapSelectedSummary(targetState = state) {
  const selectedLocationId = cityMapUiState.selectedLocationId;
  const nodes = getCityMapNodes(targetState);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const selectedNode = nodeMap.get(selectedLocationId) || null;
  const cardOpen = Boolean(selectedNode) && cityMapUiState.cardOpen === true;
  const summary = cardOpen && selectedLocationId ? getCityMapTravelSummary(selectedLocationId, targetState) : null;
  const locationMap = getDayWorldLocationMap(targetState?.day || 1) || {};
  const selectedLocation = selectedNode ? locationMap[selectedNode.id] || {} : null;

  return {
    cardOpen,
    selectedLocationId,
    nodes,
    nodeMap,
    selectedNode,
    summary,
    selectedLocation,
  };
}

function buildCityMapZoneSvgMarkup(zones = []) {
  return zones.map((zone) => {
    const labelX = Math.max(4, Number(zone.x) + 3.4);
    const labelY = Math.max(7, Number(zone.y) + 6.2);
    return `
      <g class="city-map-zone-group">
        <rect
          class="city-map-zone ${escapeCityMapHtml(`zone-${zone.tone}`)}"
          x="${zone.x}"
          y="${zone.y}"
          width="${zone.width}"
          height="${zone.height}"
          rx="5"
          ry="5"
        ></rect>
        <text class="city-map-zone-label" x="${labelX}" y="${labelY}">${escapeCityMapHtml(zone.label)}</text>
      </g>
    `;
  }).join("");
}

function getCityMapVisualLinkKey(link = {}) {
  const ends = [String(link.from || "").trim(), String(link.to || "").trim()].sort();
  return ends.join("::");
}

function normalizeCityMapVisualLinkStyle(style = "") {
  return String(style || "").trim().toLowerCase() === "connector" ? "connector" : "near";
}

function getCityMapVisualLinks(nodeMap, links = [], targetState = state) {
  const detailedLinks = links.map((link) => {
    const fromNode = nodeMap.get(link.from);
    const toNode = nodeMap.get(link.to);

    if (!fromNode || !toNode) {
      return null;
    }

    return {
      ...link,
      visualKey: getCityMapVisualLinkKey(link),
      distance: Math.hypot(
        Number(fromNode.x) - Number(toNode.x),
        Number(fromNode.y) - Number(toNode.y),
      ),
    };
  }).filter(Boolean);

  const configuredLinks = Array.isArray(getDayCityMapConfig(targetState?.day)?.visualLinks)
    ? getDayCityMapConfig(targetState?.day).visualLinks
    : [];
  if (configuredLinks.length) {
    const actualLinkMap = new Map(detailedLinks.map((link) => [link.visualKey, link]));
    const visibleLinks = [];
    const seenKeys = new Set();

    configuredLinks.forEach((link) => {
      const from = String(link?.from || "").trim();
      const to = String(link?.to || "").trim();
      const visualKey = getCityMapVisualLinkKey({ from, to });

      if (!from || !to || seenKeys.has(visualKey) || !nodeMap.has(from) || !nodeMap.has(to)) {
        return;
      }

      const actualLink = actualLinkMap.get(visualKey) || null;
      visibleLinks.push({
        from,
        to,
        visualKey,
        mode: link?.mode === "bus"
          ? "bus"
          : (link?.mode === "walk" ? "walk" : (actualLink?.mode === "bus" ? "bus" : "walk")),
        minutes: Math.max(0, Math.round(Number(link?.minutes ?? actualLink?.minutes) || 0)),
        style: normalizeCityMapVisualLinkStyle(link?.style),
      });
      seenKeys.add(visualKey);
    });

    return visibleLinks;
  }

  const visibleLinks = new Map();
  const endpointUsage = new Map();
  const registerLink = (link) => {
    if (!link || visibleLinks.has(link.visualKey)) {
      return;
    }

    visibleLinks.set(link.visualKey, { ...link, style: "near" });
    endpointUsage.set(link.from, (endpointUsage.get(link.from) || 0) + 1);
    endpointUsage.set(link.to, (endpointUsage.get(link.to) || 0) + 1);
  };

  detailedLinks
    .filter((link) => link.mode === "walk" && (link.minutes <= 8 || link.distance <= 12))
    .sort((left, right) => left.minutes - right.minutes || left.distance - right.distance)
    .forEach(registerLink);

  [...nodeMap.keys()].forEach((nodeId) => {
    if ((endpointUsage.get(nodeId) || 0) > 0) {
      return;
    }

    const fallbackLink = detailedLinks
      .filter((link) => link.from === nodeId || link.to === nodeId)
      .sort((left, right) => {
        if (left.mode !== right.mode) {
          return left.mode === "walk" ? -1 : 1;
        }
        return left.minutes - right.minutes || left.distance - right.distance;
      })[0];

    registerLink(fallbackLink);
  });

  return [...visibleLinks.values()];
}

function buildCityMapRoadSvgMarkup(nodeMap, links = []) {
  return links.map((link) => {
    const fromNode = nodeMap.get(link.from);
    const toNode = nodeMap.get(link.to);

    if (!fromNode || !toNode) {
      return "";
    }

    const styleClass = link.style === "connector" ? "is-connector" : "is-near";
    return `
      <line
        class="city-map-road-line ${styleClass}"
        x1="${fromNode.x}"
        y1="${fromNode.y}"
        x2="${toNode.x}"
        y2="${toNode.y}"
      ></line>
    `;
  }).join("");
}

function buildCityMapRouteSvgMarkup(nodeMap, summary = null) {
  if (!summary?.canTravel || !Array.isArray(summary.pathLocationIds) || summary.pathLocationIds.length <= 1) {
    return "";
  }

  const routeSegments = [];
  for (let index = 0; index < summary.pathLocationIds.length - 1; index += 1) {
    const fromNode = nodeMap.get(summary.pathLocationIds[index]);
    const toNode = nodeMap.get(summary.pathLocationIds[index + 1]);
    const mode = summary.pathModes[index] === "bus" ? "bus" : "walk";

    if (!fromNode || !toNode) {
      continue;
    }

    if (mode === "bus") {
      routeSegments.push(`
        <line
          class="city-map-route-glow is-bus"
          x1="${fromNode.x}"
          y1="${fromNode.y}"
          x2="${toNode.x}"
          y2="${toNode.y}"
        ></line>
      `);
    }

    routeSegments.push(`
      <line
        class="city-map-route-line is-${mode}"
        x1="${fromNode.x}"
        y1="${fromNode.y}"
        x2="${toNode.x}"
        y2="${toNode.y}"
      ></line>
    `);
  }

  return routeSegments.join("");
}

function buildCityMapNodeMarkup(nodes = [], targetState = state) {
  return nodes.map((node) => {
    const classes = [
      "city-map-node",
      getCityMapNodeToneClass(node),
      node.current ? "is-current" : "",
      cityMapUiState.cardOpen && cityMapUiState.selectedLocationId === node.id ? "is-selected" : "",
      !node.unlocked ? "is-locked" : "",
    ].filter(Boolean).join(" ");
    const icon = node.unlocked ? (node.icon || "📍") : "🔒";
    const statusMarkup = node.current
      ? '<span class="city-map-node-status is-current">현재</span>'
      : (!node.unlocked ? '<span class="city-map-node-status is-locked">미해금</span>' : "");
    const disabled = node.current || !node.unlocked ? "disabled" : "";
    const nodeStyle = [
      `left:${node.x}%`,
      `top:${node.y}%`,
      `--city-map-label-offset-x:${Number(node.labelOffsetX) || 0}px`,
      `--city-map-label-offset-y:${Number(node.labelOffsetY) || 0}px`,
    ].join(";");
    const ariaLabel = node.current
      ? `${node.fullLabel || node.label} 현재 위치`
      : `${node.fullLabel || node.label}${node.unlocked ? "" : " 미해금"}`;

    return `
      <button
        type="button"
        class="${classes}"
        style="${nodeStyle}"
        data-city-map-node="${escapeCityMapHtml(node.id)}"
        aria-label="${escapeCityMapHtml(ariaLabel)}"
        ${disabled}
      >
        <span class="city-map-node-core" aria-hidden="true">${escapeCityMapHtml(icon)}</span>
        <span class="city-map-node-caption">
          <span class="city-map-node-name">${escapeCityMapHtml(node.label)}</span>
          ${statusMarkup}
        </span>
      </button>
    `;
  }).join("");
}

function buildCityMapBoardMarkup(targetState = state) {
  const { nodes, nodeMap, summary } = getCityMapSelectedSummary(targetState);
  const links = getCityMapVisualLinks(nodeMap, getCityMapLinks(targetState), targetState);
  const zones = getCityMapZones(targetState);
  const zoneMarkup = buildCityMapZoneSvgMarkup(zones);
  const roadMarkup = buildCityMapRoadSvgMarkup(nodeMap, links);
  const routeMarkup = buildCityMapRouteSvgMarkup(nodeMap, summary);
  const nodeMarkup = buildCityMapNodeMarkup(nodes, targetState);

  return `
    <div class="city-map-board-inner">
      <div class="city-map-board-grid" aria-hidden="true"></div>
      <svg class="city-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        ${zoneMarkup}
        ${roadMarkup}
        ${routeMarkup}
      </svg>
      <div class="city-map-node-layer">
        ${nodeMarkup}
      </div>
    </div>
  `;
}

function buildCityMapLegendMarkup() {
  return `
    <div class="city-map-legend-item">
      <span class="city-map-legend-line is-near" aria-hidden="true"></span>
      <span class="city-map-legend-text">가까운 연결</span>
    </div>
    <div class="city-map-legend-item">
      <span class="city-map-legend-line is-route" aria-hidden="true"></span>
      <span class="city-map-legend-text">선택 경로</span>
    </div>
    <div class="city-map-legend-item">
      <span class="city-map-legend-dot is-current" aria-hidden="true"></span>
      <span class="city-map-legend-text">현재 위치</span>
    </div>
    <div class="city-map-legend-item">
      <span class="city-map-legend-dot is-locked" aria-hidden="true"></span>
      <span class="city-map-legend-text">미해금 장소</span>
    </div>
  `;
}

function buildCityMapMethodMarkup(summary = null) {
  if (!summary?.canTravel) {
    return "";
  }

  const uniqueModes = [...new Set((summary.pathModes || []).map((mode) => mode === "bus" ? "bus" : "walk"))];
  if (!uniqueModes.length) {
    uniqueModes.push(summary.methodLabel.includes("버스") ? "bus" : "walk");
  }

  return uniqueModes.map((mode) => {
    const isBus = mode === "bus";
    return `
      <div class="city-map-method-chip ${isBus ? "is-bus" : "is-walk"}">
        <span class="city-map-method-icon" aria-hidden="true">${isBus ? "🚌" : "🚶"}</span>
        <span class="city-map-method-copy">
          <span class="city-map-method-label">${isBus ? "버스" : "도보"}</span>
        </span>
      </div>
    `;
  }).join("");
}

function buildCityMapCardMarkup(targetState = state) {
  const { selectedLocationId, selectedNode, summary, cardOpen } = getCityMapSelectedSummary(targetState);

  if (!selectedNode || !cardOpen) {
    return "";
  }

  const districtLabel = getCityMapDistrictLabel(selectedNode, targetState);
  const locationIcon = selectedNode.unlocked ? (selectedNode.icon || "📍") : "🔒";

  if (!summary?.canTravel) {
    return `
      <div class="city-map-travel-card-handle" aria-hidden="true"></div>
      <div class="city-map-travel-card-header">
        <div class="city-map-destination-icon is-current" aria-hidden="true">${escapeCityMapHtml(locationIcon)}</div>
        <div class="city-map-destination-copy">
          <div class="city-map-destination-district">${escapeCityMapHtml(districtLabel || "현재 위치")}</div>
          <div class="city-map-destination-name">${escapeCityMapHtml(selectedNode.fullLabel || selectedNode.label)}</div>
        </div>
      </div>
      <div class="city-map-travel-empty is-current">
        <div class="city-map-travel-empty-kicker">CURRENT</div>
        <div class="city-map-travel-empty-title">현재 위치입니다</div>
      </div>
      <div class="city-map-travel-actions is-single">
        <button type="button" class="city-map-travel-btn is-secondary" data-city-map-action="collapse">닫기</button>
      </div>
    `;
  }

  return `
    <div class="city-map-travel-card-handle" aria-hidden="true"></div>
    <div class="city-map-travel-card-header">
      <div class="city-map-destination-icon" aria-hidden="true">${escapeCityMapHtml(locationIcon)}</div>
      <div class="city-map-destination-copy">
        <div class="city-map-destination-district">${escapeCityMapHtml(districtLabel || "이동 지역")}</div>
        <div class="city-map-destination-name">${escapeCityMapHtml(summary.targetLabel)}</div>
      </div>
    </div>
    <div class="city-map-travel-methods">
      ${buildCityMapMethodMarkup(summary)}
    </div>
    <div class="city-map-travel-summary">
      <div class="city-map-travel-summary-block">
        <div class="city-map-travel-summary-label">소요 시간</div>
        <div class="city-map-travel-summary-value is-time">${escapeCityMapHtml(summary.durationLabel)}</div>
      </div>
      <div class="city-map-travel-summary-arrow" aria-hidden="true">→</div>
      <div class="city-map-travel-summary-block is-right">
        <div class="city-map-travel-summary-label">도착 예정</div>
        <div class="city-map-travel-summary-value is-arrival">${escapeCityMapHtml(summary.arrivalLabel || "--:--")}</div>
      </div>
    </div>
    <div class="city-map-travel-route">
      <div class="city-map-travel-route-label">경로</div>
      <div class="city-map-travel-route-value">${escapeCityMapHtml(summary.routeText || `${summary.currentLabel} -> ${summary.targetLabel}`)}</div>
    </div>
    <div class="city-map-travel-actions">
      <button type="button" class="city-map-travel-btn is-secondary" data-city-map-action="collapse">취소</button>
      <button type="button" class="city-map-travel-btn is-primary" data-city-map-action="confirm" data-city-map-target="${escapeCityMapHtml(selectedLocationId)}">🗺️ 이동하기</button>
    </div>
  `;
}

function renderCityMapOverlay(targetState = state) {
  const overlay = ensureCityMapUi();
  if (!overlay) {
    return;
  }

  if (!canShowCityMapForState(targetState) || !cityMapUiState.open) {
    hideCityMapOverlay({ preserveSelection: true });
    return;
  }

  ensureCityMapSelection(targetState);

  const config = getDayCityMapConfig(targetState?.day);
  const title = config?.title || "배금시 이동 지도";
  const subtitle = String(config?.subtitle || "").trim();
  const currentLabel = typeof getCurrentLocationLabel === "function"
    ? getCurrentLocationLabel(targetState)
    : "";

  if (ui.cityMapShellTitle) {
    ui.cityMapShellTitle.textContent = title;
  }
  if (ui.cityMapShellSubtitle) {
    ui.cityMapShellSubtitle.textContent = subtitle;
    ui.cityMapShellSubtitle.hidden = !subtitle;
  }
  if (ui.cityMapCurrentName) {
    ui.cityMapCurrentName.textContent = currentLabel;
  }
  if (ui.cityMapBoard) {
    ui.cityMapBoard.innerHTML = buildCityMapBoardMarkup(targetState);
  }
  if (ui.cityMapLegend) {
    ui.cityMapLegend.innerHTML = buildCityMapLegendMarkup();
  }
  if (ui.cityMapCard) {
    const isCardVisible = cityMapUiState.cardOpen && Boolean(cityMapUiState.selectedLocationId);
    ui.cityMapCard.hidden = !isCardVisible;
    ui.cityMapCard.setAttribute("aria-hidden", isCardVisible ? "false" : "true");
    ui.cityMapCard.innerHTML = isCardVisible ? buildCityMapCardMarkup(targetState) : "";
  }
  if (ui.cityMapCanvasWrap) {
    ui.cityMapCanvasWrap.classList.toggle("is-card-open", cityMapUiState.cardOpen && Boolean(cityMapUiState.selectedLocationId));
  }

  overlay.hidden = false;
  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.add("is-open");
  document.body.classList.add("city-map-modal-open");
  ui.game?.classList.add("city-map-open");
  syncCityMapQuickButtons();
}

function confirmCityMapTravel(targetLocationId = cityMapUiState.selectedLocationId) {
  const summary = getCityMapTravelSummary(targetLocationId, state);
  if (!summary?.canTravel || typeof moveToWorldLocation !== "function") {
    return;
  }

  moveToWorldLocation(targetLocationId, {
    skipExitCheck: true,
    forceTravelMode: true,
    travelMinutes: summary.minutes,
    travelSlots: summary.slots,
    travelMethod: summary.methodLabel,
    travelSceneId: summary.sceneId,
    memoryTitle: `${summary.targetLabel}로 이동한다`,
    memoryText: `${summary.currentLabel}에서 ${summary.targetLabel}까지 ${summary.methodLabel} ${summary.durationLabel} 코스를 잡았다.`,
    memoryTags: ["이동", ...summary.pathModes, targetLocationId],
  });
}

function handleCityMapOverlayClick(event) {
  const actionTarget = event.target.closest("[data-city-map-action]");
  if (actionTarget) {
    const action = actionTarget.dataset.cityMapAction;
    if (action === "close") {
      hideCityMapOverlay();
      return;
    }
    if (action === "collapse") {
      cityMapUiState.selectedLocationId = "";
      cityMapUiState.cardOpen = false;
      renderCityMapOverlay(state);
      return;
    }
    if (action === "confirm") {
      confirmCityMapTravel(actionTarget.dataset.cityMapTarget || cityMapUiState.selectedLocationId);
      return;
    }
  }

  const nodeTarget = event.target.closest("[data-city-map-node]");
  if (!nodeTarget || nodeTarget.disabled) {
    return;
  }

  cityMapUiState.selectedLocationId = nodeTarget.dataset.cityMapNode || "";
  cityMapUiState.cardOpen = Boolean(cityMapUiState.selectedLocationId);
  renderCityMapOverlay(state);
}
