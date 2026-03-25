// Keep logic.js focused on orchestration. Domain rules belong in
// js/systems/* or js/apps/* per docs/design/logic-split-plan.md.

const DEFAULT_DAY_DEV_PRESETS = [
  {
    id: "room",
    label: "기본 방",
    type: "scene",
    scene: "room",
  },
  {
    id: "outside",
    label: "건물 앞",
    type: "scene",
    scene: "outside",
  },
  {
    id: "jobs",
    label: "폰 공고앱",
    type: "phone",
    scene: "room",
    view: "jobs",
    phoneMinimized: false,
  },
];

function getDayDevData(day = getCurrentDayNumber()) {
  return getDayData(day).dev || {};
}

function getDayDevPresets(day = getCurrentDayNumber()) {
  const merged = new Map();

  DEFAULT_DAY_DEV_PRESETS.forEach((preset) => {
    merged.set(preset.id, { ...preset });
  });

  const dayPresets = getDayDevData(day).presets;
  if (Array.isArray(dayPresets)) {
    dayPresets.forEach((preset) => {
      if (preset?.id) {
        merged.set(preset.id, { ...preset });
      }
    });
  }

  return [...merged.values()];
}

function getCurrentOutsideSceneConfig(targetState = state) {
  const day = targetState?.day || getCurrentDayNumber();
  const worldData = getDayWorldData(day);
  const locations = worldData.locations || null;

  if (locations) {
    if (typeof recoverMcDonaldsVenueLocation === "function") {
      recoverMcDonaldsVenueLocation(targetState);
    }
    if (typeof recoverResearchLabVenueLocation === "function") {
      recoverResearchLabVenueLocation(targetState);
    }

    const locationId = getCurrentLocationId(targetState);
    const baseScene = locationId ? locations[locationId] || null : null;
    if (!baseScene) {
      return null;
    }

    const worldState = syncWorldState(targetState);
    const resolvedScene = {
      ...baseScene,
      lines: [...(baseScene.lines || [])],
      tags: [...(baseScene.tags || [])],
      actors: (baseScene.actors || []).map((actor) => ({ ...actor })),
      options: (baseScene.options || []).map((option) => ({ ...option })),
    };

    const pendingTarget = worldState.pendingTravelTarget || "";
    const pendingDistrict = worldState.pendingTravelDistrict || "";
    const isIndustrialArrival = pendingDistrict === "industrial"
      || ["office-plaza", "mobility-control-center", "logistics-hub", "production-line", "tower-cafe", "research-lab-interior"].includes(pendingTarget);

    if (locationId === "bus-ride") {
      const targetLabel = getPendingTravelTargetLabel(targetState);

      resolvedScene.title = `${targetLabel} 쪽으로 버스가 천천히 미끄러진다.`;
      if (isIndustrialArrival && typeof DAY01_WORLD_DIGITAL_COMPLEX_VIEW_BACKGROUND !== "undefined") {
        resolvedScene.background = DAY01_WORLD_DIGITAL_COMPLEX_VIEW_BACKGROUND;
        resolvedScene.lines = [
          "버스 창밖으로 배금디지털단지 빌딩 실루엣이 길게 지나간다.",
          `${targetLabel}에 가까워질수록 기업 간판과 단지 도로가 선명하게 보이기 시작한다.`,
        ];
      } else {
        resolvedScene.lines = [
          "창밖 너머로 배금시 간판과 가로등이 길게 흘러간다.",
          `${targetLabel}에 가까워질수록 내려야 할 순간이 또렷해진다.`,
        ];
      }
    }
    if (locationId === "walk-travel") {
      const sourceLabel = getPendingTravelSourceLabel(targetState);
      const targetLabel = getPendingTravelTargetLabel(targetState);
      const durationLabel = getPendingTravelDurationLabel(targetState);
      const methodLabel = getPendingTravelMethodLabel(targetState);
      const travelMinutes = syncWorldState(targetState).pendingTravelMinutes;
      resolvedScene.title = "걷는 중...";
      resolvedScene.background = getWalkTravelBackgroundForMinutes(travelMinutes, targetState);
      if (isIndustrialArrival && typeof DAY01_WORLD_DIGITAL_COMPLEX_VIEW_BACKGROUND !== "undefined") {
        resolvedScene.background = DAY01_WORLD_DIGITAL_COMPLEX_VIEW_BACKGROUND;
        resolvedScene.actors = [];
      }
      resolvedScene.lines = [
        `${sourceLabel}에서 나와 ${targetLabel} 쪽으로 걷는 중... 도보 ${durationLabel} 소요 됨.`,
        "신호등과 골목 모퉁이를 지나며 발걸음을 계속 이어간다.",
      ];
      resolvedScene.lines[0] = `${sourceLabel}에서 ${targetLabel} 쪽으로 ${methodLabel} ${durationLabel} 코스를 잡고 걸음을 옮긴다.`;
    }

    if (locationId === "walk-travel") {
      const sourceLabel = getPendingTravelSourceLabel(targetState);
      const targetLabel = getPendingTravelTargetLabel(targetState);
      const durationLabel = getPendingTravelDurationLabel(targetState);
      resolvedScene.lines[0] = `${sourceLabel}에서 ${targetLabel} 쪽으로 ${durationLabel} 정도 걸어간다.`;
    }

    const activeAlleyNpc = getActiveAlleyNpcConfig(targetState);
    const wanderResult = worldState.wanderResult || {};
    const wanderFocusNpcId = wanderResult.locationId === locationId
      ? (
          activeAlleyNpc?.id
          || (typeof getLocationWanderNpcId === "function"
            ? getLocationWanderNpcId(locationId, targetState)
            : "")
        )
      : "";
    const wanderFocusNpc = wanderFocusNpcId
      ? (
          activeAlleyNpc?.id === wanderFocusNpcId
            ? activeAlleyNpc
            : (
              (typeof getAdjustedLocationNpcPool === "function"
                ? getAdjustedLocationNpcPool(targetState, locationId)
                : getAlleyNpcPool(targetState, locationId)
              ).find((entry) => entry.id === wanderFocusNpcId) || null
            )
        )
      : null;
    const hasWanderFocusNpc = Boolean(wanderFocusNpc?.actor && wanderResult.locationId === locationId);
    resolvedScene.options = resolvedScene.options.filter((option) => option.action !== "wander");

    if (locationId && canUseLocationWander(locationId, targetState)) {
      resolvedScene.options.splice(Math.min(2, resolvedScene.options.length), 0, {
        title: "돌아다닌다",
        action: "wander",
      });
    }

    if (wanderResult.locationId === locationId && wanderResult.title && wanderResult.lines?.length) {
      resolvedScene.title = wanderResult.title;
      resolvedScene.lines = [...wanderResult.lines];
    }

    if (hasWanderFocusNpc) {
      resolvedScene.actors.push({ ...wanderFocusNpc.actor, npcId: wanderFocusNpc.id });
      if (wanderFocusNpc.tag && !resolvedScene.tags.includes(wanderFocusNpc.tag)) {
        resolvedScene.tags.push(wanderFocusNpc.tag);
      }
      if (!(wanderResult.locationId === locationId && wanderResult.title && wanderResult.lines?.length)) {
        resolvedScene.title = wanderFocusNpc.sceneTitle || resolvedScene.title;
        resolvedScene.lines = Array.isArray(wanderFocusNpc.sceneLines) && wanderFocusNpc.sceneLines.length
          ? [...wanderFocusNpc.sceneLines]
          : resolvedScene.lines;
      }
      resolvedScene.options.unshift({
        title: "가까이 가기",
        action: "approach-alley-npc",
      });
    }

    applyMcDonaldsVenueSceneState(resolvedScene, locationId, targetState);
    applyResearchLabVenueSceneState(resolvedScene, locationId, targetState);
    applyRealEstateVenueSceneState(resolvedScene, locationId, targetState);

    if (false && locationId === "baegeum-hospital") {
      resolvedScene.options = resolvedScene.options.map((option) =>
        option?.action === "get-plastic-surgery"
          ? {
              ...option,
              title: "상담실로 들어가 성형 플랜을 고른다",
            }
          : option
      );
    }

    if (typeof resolveSceneActorPresentation === "function") {
      resolvedScene.actors = resolvedScene.actors.map((actor) =>
        resolveSceneActorPresentation(actor, targetState, {
          source: "outside-scene",
          scene: "outside",
          day,
          locationId,
          districtId: baseScene.districtId || worldState.currentDistrict || "",
        })
      );
    }

    return resolvedScene;
  }

  return worldData.outsideScene || null;
}

function hasMatchingSceneOption(options = [], option = null) {
  if (!option || !Array.isArray(options)) {
    return false;
  }

  return options.some((entry) =>
    entry?.action === option.action
    && String(entry?.targetLocation || "") === String(option.targetLocation || "")
    && String(entry?.jobId || "") === String(option.jobId || "")
    && String(entry?.title || "") === String(option.title || "")
  );
}

function prependSceneOption(options = [], option = null) {
  if (!option || hasMatchingSceneOption(options, option)) {
    return options;
  }

  options.unshift({ ...option });
  return options;
}

function appendSceneOption(options = [], option = null) {
  if (!option || hasMatchingSceneOption(options, option)) {
    return options;
  }

  options.push({ ...option });
  return options;
}

function buildMcDonaldsVenueStatusLine(venueState = null) {
  if (!venueState) {
    return "";
  }

  switch (venueState.phase) {
    case "rejected":
      return "매니저가 오늘 채용은 여기까지라며 다음 공고가 뜰 때 다시 들르라고 한다.";
    case "apply-ready":
      return `지금은 채용 문의 시간이라 ${venueState.hasCounterOffer && venueState.hasKitchenOffer ? "카운터와 주방" : (venueState.hasKitchenOffer ? "주방" : "카운터")} 알바를 물어볼 수 있다.`;
    case "apply-closed":
      return `알바 문의는 ${venueState.applicationWindowLabel} 사이에만 받는다고 한다.`;
    case "apply-locked":
      return "이미 잡힌 일정이 있거나 오늘 지원을 마쳐서 더 이상 채용 문의를 받을 수 없다.";
    case "hired":
      return `${venueState.shiftDayLabel || "다음 근무"} ${venueState.shiftWindowLabel || ""} ${venueState.shiftStageLabel} 출근이라고 메모가 붙어 있다.`.trim();
    case "shift-waiting":
      return `${venueState.shiftStageLabel} 출근 시간은 ${venueState.shiftWindowLabel || "오늘 근무 시간"}이다. 아직 조금 이르다.`;
    case "shift-active":
      return `지금은 ${venueState.shiftStageLabel} 근무 시간이라 바로 라인에 들어갈 수 있다.`;
    case "shift-missed":
      return `오늘 ${venueState.shiftStageLabel} 근무 시간은 이미 지나서 결근 처리만 남았다.`;
    default:
      return venueState.locationRole === "counter"
        ? "손님 모드라 키오스크 주문과 잠깐 쉬는 행동부터 할 수 있다."
        : "";
  }
}

function applyMcDonaldsVenueSceneState(resolvedScene, locationId = "", targetState = state) {
  if (!resolvedScene || !locationId || typeof getMcDonaldsVenueState !== "function" || !isMcDonaldsLocationId(locationId)) {
    return resolvedScene;
  }

  const venueState = getMcDonaldsVenueState(targetState);
  if (!venueState) {
    return resolvedScene;
  }

  const statusLine = buildMcDonaldsVenueStatusLine(venueState);
  if (statusLine) {
    const leadLine = resolvedScene.lines[0] || "";
    resolvedScene.lines = [leadLine, statusLine].filter(Boolean);
  }

  if (!resolvedScene.tags.includes("알바")) {
    resolvedScene.tags.push("알바");
  }
  if (venueState.phase === "customer" && venueState.locationRole === "counter" && !resolvedScene.tags.includes("손님 모드")) {
    resolvedScene.tags.push("손님 모드");
  }

  if (locationId === "mcdonalds") {
    if (venueState.scheduledShift || venueState.interviewResult) {
      prependSceneOption(resolvedScene.options, {
        title: "매니저에게 근무 시간을 확인한다",
        action: "mcd-check-shift",
      });
    }

    if (venueState.canApplyHere && venueState.hasKitchenOffer && venueState.offerByJobId["mcd-kitchen"]) {
      prependSceneOption(resolvedScene.options, {
        title: "주방 알바를 물어본다",
        action: "mcd-apply-job",
        jobId: "mcd-kitchen",
      });
    }

    return resolvedScene;
  }

  if (locationId === "mcdonalds-counter") {
    if (!venueState.shouldUseKiosk) {
      resolvedScene.options = resolvedScene.options.filter((option) =>
        !["eat-mcdonalds-set", "buy-mcdonalds-coffee"].includes(option.action)
      );
    }

    if (venueState.canEnterKitchen) {
      prependSceneOption(resolvedScene.options, {
        title: "주방으로 들어간다",
        action: "move",
        targetLocation: "mcdonalds-kitchen",
        travelMinutes: 2,
        keepVisible: true,
      });
    }

    if (venueState.shiftUi?.phase === "waiting" && venueState.shiftUi.isAtWorkplace && venueState.shiftJobId === "mcd-counter") {
      prependSceneOption(resolvedScene.options, {
        title: "카운터 출근 시간까지 기다린다",
        action: "mcd-check-shift",
      });
    }

    if (venueState.shiftUi?.phase === "active" && venueState.shiftUi.isAtWorkplace && venueState.shiftJobId === "mcd-counter") {
      prependSceneOption(resolvedScene.options, {
        title: "카운터 근무를 시작한다",
        action: "mcd-check-shift",
      });
    }

    if ((venueState.scheduledShift || venueState.interviewResult) && !(venueState.shiftUi?.phase === "active" && venueState.shiftUi.isAtWorkplace && venueState.shiftJobId === "mcd-counter")) {
      prependSceneOption(resolvedScene.options, {
        title: "매니저에게 근무 시간을 확인한다",
        action: "mcd-check-shift",
      });
    }

    if (venueState.canApplyHere && venueState.hasKitchenOffer && venueState.offerByJobId["mcd-kitchen"]) {
      prependSceneOption(resolvedScene.options, {
        title: "주방 알바를 물어본다",
        action: "mcd-apply-job",
        jobId: "mcd-kitchen",
      });
    }

    return resolvedScene;
  }

  if (locationId === "mcdonalds-kitchen") {
    if (venueState.shiftUi?.phase === "waiting" && venueState.shiftUi.isAtWorkplace && venueState.shiftJobId === "mcd-kitchen") {
      prependSceneOption(resolvedScene.options, {
        title: "주방 출근 시간까지 기다린다",
        action: "mcd-check-shift",
      });
    }

    if (venueState.shiftUi?.phase === "active" && venueState.shiftUi.isAtWorkplace && venueState.shiftJobId === "mcd-kitchen") {
      prependSceneOption(resolvedScene.options, {
        title: "주방 근무를 시작한다",
        action: "mcd-check-shift",
      });
    }

    if ((venueState.scheduledShift || venueState.interviewResult)
      && !(venueState.shiftUi?.phase === "active" && venueState.shiftUi.isAtWorkplace && venueState.shiftJobId === "mcd-kitchen")) {
      prependSceneOption(resolvedScene.options, {
        title: "매니저에게 근무 시간을 확인한다",
        action: "mcd-check-shift",
      });
    }

    appendSceneOption(resolvedScene.options, {
      title: "카운터로 나온다",
      action: "move",
      targetLocation: "mcdonalds-counter",
      travelMinutes: 2,
      keepVisible: true,
    });
  }

  return resolvedScene;
}

const RESEARCH_LAB_ACCESS_POSTING_IDS = new Set([
  "baegeum-research-lab",
  "ai-researcher",
]);

function canAccessResearchLabInterior(targetState = state) {
  const postingId = typeof getCareerEmploymentPostingId === "function"
    ? getCareerEmploymentPostingId(targetState)
    : "";
  return RESEARCH_LAB_ACCESS_POSTING_IDS.has(String(postingId || "").trim());
}

function recoverResearchLabVenueLocation(targetState = state) {
  if (!targetState || targetState.scene !== "outside") {
    return false;
  }

  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  if (currentLocationId !== "research-lab-interior" || canAccessResearchLabInterior(targetState)) {
    return false;
  }

  if (typeof syncWorldState === "function") {
    const worldState = syncWorldState(targetState);
    worldState.currentLocation = "tower-cafe";
    if (typeof getWorldLocationDistrictId === "function") {
      worldState.currentDistrict = getWorldLocationDistrictId("tower-cafe", targetState.day);
    }
  } else if (targetState.world && typeof targetState.world === "object") {
    targetState.world.currentLocation = "tower-cafe";
  }

  return true;
}

function buildResearchLabAccessStatusLine(hasAccess = false) {
  return hasAccess
    ? "출입 게이트가 연구원 사원증을 확인한 뒤 조용히 열린다."
    : "연구동 출입 게이트가 연구원 사원증 없이는 열리지 않는다.";
}

function applyResearchLabVenueSceneState(resolvedScene, locationId = "", targetState = state) {
  if (!resolvedScene || !["tower-cafe", "research-lab-interior"].includes(String(locationId || "").trim())) {
    return resolvedScene;
  }

  const hasAccess = canAccessResearchLabInterior(targetState);
  const statusLine = buildResearchLabAccessStatusLine(hasAccess);

  if (statusLine) {
    const leadLine = resolvedScene.lines[0] || "";
    resolvedScene.lines = [leadLine, statusLine].filter(Boolean);
  }

  if (!hasAccess && locationId === "tower-cafe") {
    resolvedScene.options = resolvedScene.options.filter((option) =>
      String(option?.targetLocation || "").trim() !== "research-lab-interior"
    );
    if (!resolvedScene.tags.includes("출입통제")) {
      resolvedScene.tags.push("출입통제");
    }
  }

  return resolvedScene;
}

const DOWNTOWN_REAL_ESTATE_BUILDING_DEFINITION = Object.freeze({
  id: "downtown-rental-building",
  label: "다운타운 수익형 빌딩",
  price: 25000000,
  estimatedValue: 41000000,
  incomePerTurn: 2800000,
  sourceLabel: "다운타운 부동산",
});

function createDefaultRealEstateInvestmentState() {
  return {
    ownedBuildingId: "",
    buildingLabel: "",
    contractSigned: false,
    contractSource: "",
    contractToken: "",
    purchasedDay: 0,
    cumulativeProfit: 0,
    lastProcessedTurnDay: 0,
    purchasePrice: 0,
    estimatedValue: 0,
    incomePerTurn: 0,
  };
}

function isValidRealEstateInvestmentState(currentState = null) {
  const ownedBuildingId = String(currentState?.ownedBuildingId || "").trim();
  if (!ownedBuildingId) {
    return false;
  }

  const definition = getDowntownRealEstateBuildingDefinition(ownedBuildingId);
  if (!definition) {
    return false;
  }

  const purchasedDay = Math.max(0, Math.round(Number(currentState?.purchasedDay) || 0));
  const purchasePrice = Math.max(0, Math.round(Number(currentState?.purchasePrice) || 0));
  const estimatedValue = Math.max(0, Math.round(Number(currentState?.estimatedValue) || 0));
  const incomePerTurn = Math.max(0, Math.round(Number(currentState?.incomePerTurn) || 0));

  return purchasedDay >= 1
    && purchasePrice > 0
    && estimatedValue > 0
    && incomePerTurn > 0;
}

function getRealEstateContractToken() {
  return `real-estate-contract-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasConfirmedRealEstateContract(targetState = state, currentState = null) {
  const ownedBuildingId = String(currentState?.ownedBuildingId || "").trim();
  const definition = getDowntownRealEstateBuildingDefinition(ownedBuildingId);
  if (!definition) {
    return false;
  }

  const bankState = typeof syncBankDomainState === "function"
    ? syncBankDomainState(targetState)
    : (targetState?.bank || null);
  const transactions = Array.isArray(bankState?.transactions)
    ? bankState.transactions
    : [];

  return transactions.some((transaction) => {
    const title = String(transaction?.title || "").trim();
    const note = String(transaction?.note || "").trim();
    const amount = Math.abs(Math.round(Number(transaction?.amount) || 0));
    return title === "다운타운 부동산 건물 매입"
      || (
        amount === definition.price
        && note.includes(definition.label)
      );
  });
}

function syncRealEstateInvestmentState(targetState = state) {
  ensureMetaRunStateReady(targetState);
  const businessState = targetState.business && typeof targetState.business === "object"
    ? targetState.business
    : (targetState.business = {});
  const defaults = createDefaultRealEstateInvestmentState();
  const currentState = businessState.realEstate && typeof businessState.realEstate === "object"
    ? businessState.realEstate
    : {};

  businessState.realEstate = {
    ...defaults,
    ...currentState,
    ownedBuildingId: String(currentState.ownedBuildingId || "").trim(),
    buildingLabel: String(currentState.buildingLabel || "").trim(),
    contractSigned: Boolean(currentState.contractSigned),
    contractSource: String(currentState.contractSource || "").trim(),
    contractToken: String(currentState.contractToken || "").trim(),
    purchasedDay: Math.max(0, Math.round(Number(currentState.purchasedDay) || 0)),
    cumulativeProfit: Math.max(0, Math.round(Number(currentState.cumulativeProfit) || 0)),
    lastProcessedTurnDay: Math.max(0, Math.round(Number(currentState.lastProcessedTurnDay) || 0)),
    purchasePrice: Math.max(0, Math.round(Number(currentState.purchasePrice) || 0)),
    estimatedValue: Math.max(0, Math.round(Number(currentState.estimatedValue) || 0)),
    incomePerTurn: Math.max(0, Math.round(Number(currentState.incomePerTurn) || 0)),
  };

  const hasContractEvidence = hasConfirmedRealEstateContract(targetState, businessState.realEstate);
  if (!isValidRealEstateInvestmentState(businessState.realEstate)
    || (!businessState.realEstate.contractToken && !hasContractEvidence)) {
    businessState.realEstate = { ...defaults };
    return businessState.realEstate;
  }

  const definition = getDowntownRealEstateBuildingDefinition(businessState.realEstate.ownedBuildingId);
  if (definition) {
    businessState.realEstate.contractToken = businessState.realEstate.contractToken || getRealEstateContractToken();
    businessState.realEstate.contractSigned = true;
    businessState.realEstate.contractSource = businessState.realEstate.contractSource || "downtown-real-estate";
    businessState.realEstate.buildingLabel = businessState.realEstate.buildingLabel || definition.label;
    businessState.realEstate.purchasePrice = Math.max(
      businessState.realEstate.purchasePrice,
      1,
    );
    businessState.realEstate.estimatedValue = Math.max(
      businessState.realEstate.estimatedValue,
      definition.estimatedValue,
    );
    businessState.realEstate.incomePerTurn = Math.max(
      businessState.realEstate.incomePerTurn,
      definition.incomePerTurn,
    );
  }

  return businessState.realEstate;
}

function getDowntownRealEstateBuildingDefinition(buildingId = "") {
  const normalizedBuildingId = String(buildingId || DOWNTOWN_REAL_ESTATE_BUILDING_DEFINITION.id).trim();
  return normalizedBuildingId === DOWNTOWN_REAL_ESTATE_BUILDING_DEFINITION.id
    ? DOWNTOWN_REAL_ESTATE_BUILDING_DEFINITION
    : null;
}

function getOwnedRealEstateInvestmentSummary(targetState = state) {
  const investmentState = syncRealEstateInvestmentState(targetState);
  const definition = getDowntownRealEstateBuildingDefinition(investmentState.ownedBuildingId);
  if (!definition) {
    return null;
  }

  return {
    ...definition,
    label: investmentState.buildingLabel || definition.label,
    purchasedDay: Math.max(1, Math.round(Number(investmentState.purchasedDay) || 1)),
    cumulativeProfit: Math.max(0, Math.round(Number(investmentState.cumulativeProfit) || 0)),
    lastProcessedTurnDay: Math.max(0, Math.round(Number(investmentState.lastProcessedTurnDay) || 0)),
    purchasePrice: Math.max(0, Math.round(Number(investmentState.purchasePrice) || definition.price)),
    estimatedValue: Math.max(0, Math.round(Number(investmentState.estimatedValue) || definition.estimatedValue)),
    incomePerTurn: Math.max(0, Math.round(Number(investmentState.incomePerTurn) || definition.incomePerTurn)),
  };
}

function buildRealEstateVenueStatusLine(locationId = "", targetState = state) {
  const ownedBuilding = getOwnedRealEstateInvestmentSummary(targetState);
  if (ownedBuilding) {
    return `${ownedBuilding.label} 계약이 유지 중이다. 매 턴 ${formatMoney(ownedBuilding.incomePerTurn)} 임대수익이 계좌로 들어오고, 누적 수익은 ${formatMoney(ownedBuilding.cumulativeProfit)}이다.`;
  }

  const buildingDefinition = getDowntownRealEstateBuildingDefinition();
  if (locationId === "real-estate-interior") {
    return `${buildingDefinition.label} 매입가는 ${formatMoney(buildingDefinition.price)}이고, 매 턴 예상 임대수익은 ${formatMoney(buildingDefinition.incomePerTurn)}이다.`;
  }

  return `${formatMoney(buildingDefinition.price)}부터 시작하는 다운타운 수익형 빌딩 매물을 상담할 수 있다.`;
}

function applyRealEstateVenueSceneState(resolvedScene, locationId = "", targetState = state) {
  const normalizedLocationId = String(locationId || "").trim();
  if (!resolvedScene || !["real-estate", "real-estate-interior"].includes(normalizedLocationId)) {
    return resolvedScene;
  }

  const ownedBuilding = getOwnedRealEstateInvestmentSummary(targetState);
  const buildingDefinition = getDowntownRealEstateBuildingDefinition();
  const statusLine = buildRealEstateVenueStatusLine(normalizedLocationId, targetState);
  if (statusLine) {
    const leadLine = resolvedScene.lines[0] || "";
    resolvedScene.lines = [leadLine, statusLine].filter(Boolean);
  }

  if (!resolvedScene.tags.includes("부동산")) {
    resolvedScene.tags.push("부동산");
  }

  if (normalizedLocationId === "real-estate") {
    if (ownedBuilding && !resolvedScene.tags.includes("건물주")) {
      resolvedScene.tags.push("건물주");
    }
    return resolvedScene;
  }

  resolvedScene.options = resolvedScene.options.map((option) =>
    option?.action === "buy-downtown-building"
      ? {
          ...option,
          title: `${buildingDefinition.label}을 ${formatMoney(buildingDefinition.price)}에 매입한다`,
        }
      : option
  );

  if (ownedBuilding) {
    resolvedScene.options = resolvedScene.options.filter((option) => option?.action !== "buy-downtown-building");
    prependSceneOption(resolvedScene.options, {
      title: "보유 건물 수익 현황을 확인한다",
      action: "review-downtown-building",
    });
    if (!resolvedScene.tags.includes("건물주")) {
      resolvedScene.tags.push("건물주");
    }
  }

  return resolvedScene;
}

function reviewDowntownRealEstateBuilding(targetState = state) {
  const ownedBuilding = getOwnedRealEstateInvestmentSummary(targetState);
  if (!ownedBuilding) {
    targetState.headline = {
      badge: "매물 조회",
      text: "아직 매입한 건물이 없다. 안쪽 계약 테이블에서 수익형 빌딩을 살 수 있다.",
    };
    if (targetState === state) {
      renderGame();
    }
    return false;
  }

  const operatedTurns = Math.max(0, ownedBuilding.lastProcessedTurnDay - ownedBuilding.purchasedDay + 1);
  targetState.headline = {
    badge: "건물 현황",
    text: `${ownedBuilding.label} 보유 중. 누적 수익 ${formatMoney(ownedBuilding.cumulativeProfit)}, 자산 가치는 ${formatMoney(ownedBuilding.estimatedValue)}이다.`,
  };
  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("bank", {
      kicker: "REALTY",
      title: ownedBuilding.label,
      body: `${operatedTurns}턴 운영했고 누적 수익은 ${formatMoney(ownedBuilding.cumulativeProfit)}이다. 자산 가치는 ${formatMoney(ownedBuilding.estimatedValue)}로 잡힌다.`,
      tone: "success",
    }, targetState);
  }
  if (targetState === state) {
    renderGame();
  }
  return true;
}

function buyDowntownRealEstateBuilding(targetState = state) {
  const existingBuilding = getOwnedRealEstateInvestmentSummary(targetState);
  if (existingBuilding) {
    return reviewDowntownRealEstateBuilding(targetState);
  }

  const buildingDefinition = getDowntownRealEstateBuildingDefinition();
  const bankBalance = typeof getBankBalance === "function"
    ? getBankBalance(targetState)
    : Math.max(0, Number(targetState?.bank?.balance) || 0);
  if (bankBalance < buildingDefinition.price) {
    const shortage = Math.max(0, buildingDefinition.price - bankBalance);
    targetState.headline = {
      badge: "매입 보류",
      text: `${buildingDefinition.label} 계약금이 부족하다. ${formatMoney(shortage)}이 더 있어야 한다.`,
    };
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("bank", {
        kicker: "REALTY",
        title: "건물 매입 보류",
        body: `${buildingDefinition.label} 매입가 ${formatMoney(buildingDefinition.price)} 중 ${formatMoney(shortage)}이 부족하다.`,
        tone: "fail",
      }, targetState);
    }
    if (targetState === state) {
      renderGame();
    }
    return false;
  }

  const spent = typeof spendBankBalance === "function"
    ? spendBankBalance(buildingDefinition.price, {
        title: "다운타운 부동산 건물 매입",
        type: "asset",
        note: `${buildingDefinition.label} 계약금`,
      }, targetState)
    : false;
  if (!spent) {
    targetState.headline = {
      badge: "매입 보류",
      text: "계좌 정산 중 문제가 생겨 건물 계약을 마무리하지 못했다.",
    };
    if (targetState === state) {
      renderGame();
    }
    return false;
  }

  const investmentState = syncRealEstateInvestmentState(targetState);
  investmentState.ownedBuildingId = buildingDefinition.id;
  investmentState.buildingLabel = buildingDefinition.label;
  investmentState.contractSigned = true;
  investmentState.contractSource = "downtown-real-estate";
  investmentState.contractToken = getRealEstateContractToken();
  investmentState.purchasedDay = Math.max(1, Math.round(Number(targetState.day) || 1));
  investmentState.lastProcessedTurnDay = Math.max(0, investmentState.purchasedDay - 1);
  investmentState.purchasePrice = buildingDefinition.price;
  investmentState.estimatedValue = buildingDefinition.estimatedValue;
  investmentState.incomePerTurn = buildingDefinition.incomePerTurn;
  investmentState.cumulativeProfit = Math.max(0, Math.round(Number(investmentState.cumulativeProfit) || 0));

  const message = `${buildingDefinition.label}을 매입했다. 이제 매 턴 ${formatMoney(buildingDefinition.incomePerTurn)} 임대수익이 계좌로 들어온다.`;
  targetState.headline = {
    badge: "건물 매입",
    text: message,
  };
  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("bank", {
      kicker: "REALTY",
      title: "건물 매입 완료",
      body: `${message} 엔딩 정산에는 건물 가치 ${formatMoney(buildingDefinition.estimatedValue)}도 함께 반영된다.`,
      tone: "success",
    }, targetState);
  }
  if (typeof queueGameplayFeedback === "function") {
    queueGameplayFeedback({
      title: "다운타운 부동산 계약 완료",
      body: `${formatMoney(buildingDefinition.price)} 계약이 끝났다. 매 턴 ${formatMoney(buildingDefinition.incomePerTurn)} 수익이 들어온다.`,
      tone: "success",
      duration: 2600,
    });
  }
  if (typeof recordActionMemory === "function") {
    recordActionMemory("다운타운 건물을 매입했다", `${buildingDefinition.label}을 ${formatMoney(buildingDefinition.price)}에 매입했다. 매 턴 ${formatMoney(buildingDefinition.incomePerTurn)} 임대수익이 들어오고, 최종 정산에는 건물 가치 ${formatMoney(buildingDefinition.estimatedValue)}가 포함된다.`, {
      type: "finance",
      source: buildingDefinition.sourceLabel,
      tags: ["부동산", "건물", "투자"],
    });
  }
  if (targetState === state) {
    renderGame();
  }
  return true;
}

function settleOwnedRealEstateTurnIncome(completedDay = 0, targetState = state) {
  const normalizedCompletedDay = Math.max(0, Math.round(Number(completedDay) || 0));
  const ownedBuilding = getOwnedRealEstateInvestmentSummary(targetState);
  if (!ownedBuilding || !normalizedCompletedDay) {
    return null;
  }

  const investmentState = syncRealEstateInvestmentState(targetState);
  const startDay = Math.max(ownedBuilding.purchasedDay, investmentState.lastProcessedTurnDay + 1);
  if (normalizedCompletedDay < startDay) {
    return null;
  }

  const settledTurns = Math.max(1, normalizedCompletedDay - startDay + 1);
  const payout = Math.max(0, ownedBuilding.incomePerTurn * settledTurns);
  if (!payout) {
    return null;
  }

  investmentState.lastProcessedTurnDay = normalizedCompletedDay;
  investmentState.cumulativeProfit += payout;

  if (typeof earnBankBalance === "function") {
    earnBankBalance(payout, {
      title: "건물 임대 수익",
      type: "income",
      note: `${ownedBuilding.label} ${settledTurns}턴 정산`,
    }, targetState);
  } else {
    targetState.bank = {
      ...(targetState.bank || {}),
      balance: Math.max(0, Number(targetState?.bank?.balance) || 0) + payout,
    };
  }

  const periodLabel = settledTurns > 1
    ? `${startDay}턴부터 ${normalizedCompletedDay}턴까지`
    : `${normalizedCompletedDay}턴`;
  const summary = {
    badge: "건물 수익",
    title: `${ownedBuilding.label} 임대 수익`,
    body: `${periodLabel} 운영 수익 ${formatMoney(payout)}이 계좌로 들어왔다.`,
    lines: [
      `${periodLabel} 운영 정산으로 ${formatMoney(payout)}이 계좌에 입금됐다.`,
      `누적 임대수익 ${formatMoney(investmentState.cumulativeProfit)}`,
      `건물 자산 가치 ${formatMoney(ownedBuilding.estimatedValue)}`,
    ],
  };

  if (typeof queueNextTurnEvent === "function" && normalizedCompletedDay < MAX_DAYS) {
    queueNextTurnEvent({
      id: `real-estate-income-${normalizedCompletedDay}-${ownedBuilding.id}`,
      badge: summary.badge,
      title: summary.title,
      speaker: "다음 턴 요약",
      tags: ["부동산", "수익", "건물"],
      lines: summary.lines,
    }, targetState, { absoluteDay: normalizedCompletedDay + 1 });
  }

  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("bank", {
      kicker: "RENT",
      title: summary.title,
      body: `${summary.body} 누적 수익은 ${formatMoney(investmentState.cumulativeProfit)}이다.`,
      tone: "success",
    }, targetState);
  }

  return {
    ...summary,
    payout,
    cumulativeProfit: investmentState.cumulativeProfit,
    estimatedValue: ownedBuilding.estimatedValue,
    label: ownedBuilding.label,
  };
}

const SAVE_STATE_KEY = "mammon-city-save-v1";
const SAVE_STATE_VERSION = 1;
const PHONE_INTERACTION_MINUTES = 10;
const GAMEPLAY_FEEDBACK_DURATION_MS = 2800;
const TIME_COSTS = {
  moveBetweenScenes: 1,
  jobApplication: 1,
  phoneApp: 1,
  videoApp: 2,
  waitInRoom: 1,
  wanderOutside: 2,
};
const PROLOGUE_TIME_SLOTS = {
  introWake: 13,
  introCleanupPrompt: 14,
  introCleanup: 15,
  introReward: 16,
};
const JOB_SHIFT_RULES = {
  convenience: { startSlotChoices: [18, 22, 26], durationSlots: 10 },
  delivery: { startSlotChoices: [20, 24, 28], durationSlots: 8 },
  "delivery-motorbike": { startSlotChoices: [20, 24, 28], durationSlots: 8 },
  "delivery-courier": { startSlotChoices: [18, 22, 26], durationSlots: 10 },
  tutoring: { startSlotChoices: [26, 30], durationSlots: 6 },
  "mcd-counter": { startSlotChoices: [18, 22], durationSlots: 10 },
  "mcd-kitchen": { startSlotChoices: [18, 22], durationSlots: 10 },
  warehouse: { startSlotChoices: [17, 21], durationSlots: 12 },
  cleaning: { startSlotChoices: [30, 34], durationSlots: 8 },
  smart_store: { startSlotChoices: [18, 22, 26], durationSlots: 10 },
  dispatch_monitor: { startSlotChoices: [20, 24, 28], durationSlots: 8 },
  study_coach: { startSlotChoices: [26, 30], durationSlots: 6 },
  robot_floor: { startSlotChoices: [18, 22], durationSlots: 10 },
  line_inspector: { startSlotChoices: [17, 21], durationSlots: 12 },
  closing_checker: { startSlotChoices: [30, 34], durationSlots: 8 },
};
const INPUT_GATE_COOLDOWN_MS = 90;
const INPUT_GATE_STALE_MS = 2500;
const INPUT_GATE_FEEDBACK_COOLDOWN_MS = 900;
const INPUT_GATE_BUSY_FEEDBACK_DELAY_MS = 450;
const INPUT_GATE_DEBUG_LOG_LIMIT = 24;
const RENDER_SAVE_DEBOUNCE_MS = 240;

function createDefaultInputGateState() {
  return {
    active: false,
    actionId: "",
    source: "",
    mode: "normal",
    lockStartedAt: 0,
    lockUntil: 0,
    blockedCount: 0,
    recoveryCount: 0,
    lastBlockedReason: "",
    lastBlockedAt: 0,
    debugLog: [],
  };
}

function syncInputGateState(targetState = state) {
  const defaults = createDefaultInputGateState();
  if (!targetState || typeof targetState !== "object") {
    return defaults;
  }

  const gateState = targetState.inputGate && typeof targetState.inputGate === "object"
    ? targetState.inputGate
    : {};

  gateState.active = Boolean(gateState.active);
  gateState.actionId = typeof gateState.actionId === "string" ? gateState.actionId : "";
  gateState.source = typeof gateState.source === "string" ? gateState.source : "";
  gateState.mode = typeof gateState.mode === "string" && gateState.mode
    ? gateState.mode
    : defaults.mode;
  gateState.lockStartedAt = Math.max(0, Math.round(Number(gateState.lockStartedAt) || 0));
  gateState.lockUntil = Math.max(0, Math.round(Number(gateState.lockUntil) || 0));
  gateState.blockedCount = Math.max(0, Math.round(Number(gateState.blockedCount) || 0));
  gateState.recoveryCount = Math.max(0, Math.round(Number(gateState.recoveryCount) || 0));
  gateState.lastBlockedReason = typeof gateState.lastBlockedReason === "string" ? gateState.lastBlockedReason : "";
  gateState.lastBlockedAt = Math.max(0, Math.round(Number(gateState.lastBlockedAt) || 0));
  gateState.debugLog = Array.isArray(gateState.debugLog)
    ? gateState.debugLog
      .map((entry) => ({
        type: String(entry?.type || "").trim(),
        reason: String(entry?.reason || "").trim(),
        source: String(entry?.source || "").trim(),
        actionId: String(entry?.actionId || "").trim(),
        mode: String(entry?.mode || "").trim(),
        at: Math.max(0, Math.round(Number(entry?.at) || 0)),
      }))
      .filter((entry) => entry.type)
      .slice(-INPUT_GATE_DEBUG_LOG_LIMIT)
    : [];

  targetState.inputGate = gateState;
  return gateState;
}

function isPhoneInteractionFocusActive(targetState = state) {
  if (!targetState?.hasPhone || targetState.phoneMinimized) {
    return false;
  }

  const route = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(targetState.phoneView || "home")
    : String(targetState.phoneView || "home");
  const onHomeRoute = typeof isPhoneHomeRoute === "function"
    ? isPhoneHomeRoute(route)
    : route === "home";

  return Boolean(targetState.phoneStageExpanded || !onHomeRoute);
}

function getCurrentInputGateMode(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return "normal";
  }

  if (
    (targetState.scene === "cleanup" && targetState.cleaningGame)
    || (targetState.scene === "job-minigame" && targetState.jobMiniGame)
  ) {
    return "minigame";
  }

  if (targetState.scene === "dialogue" || targetState.dialogue?.active) {
    return "dialogue";
  }

  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : String(targetState.world?.currentLocation || "");
  if (
    targetState.scene === "home-transition"
    || (targetState.scene === "outside"
      && (typeof isTravelSceneLocationId === "function"
        ? isTravelSceneLocationId(currentLocationId)
        : ["walk-travel", "bus-ride"].includes(currentLocationId)))
  ) {
    return "moving";
  }

  if ([
    "incident",
    "clockout",
    "result",
    "lecture",
    "lotto-pick",
    "plastic-surgery",
    "turn-briefing",
    "romance",
    "romance-call",
    "lotto-result",
  ].includes(String(targetState.scene || ""))) {
    return "event";
  }

  if (isPhoneInteractionFocusActive(targetState)) {
    return "phone";
  }

  return "normal";
}

function pushInputGateDebugEntry(type, details = {}, targetState = state) {
  const gateState = syncInputGateState(targetState);
  const entry = {
    type: String(type || "info").trim() || "info",
    reason: String(details.reason || "").trim(),
    source: String(details.source || "").trim(),
    actionId: String(details.actionId || "").trim(),
    mode: String(details.mode || gateState.mode || "").trim(),
    at: Date.now(),
  };

  gateState.debugLog = [...gateState.debugLog, entry].slice(-INPUT_GATE_DEBUG_LOG_LIMIT);

  const debugLine = [entry.type, entry.mode, entry.source, entry.actionId, entry.reason]
    .filter(Boolean)
    .join(" | ");
  const debugEnabled = Boolean(window.__MAMMON_INPUT_GATE_DEBUG__);
  if (debugEnabled || ["blocked", "recover"].includes(entry.type)) {
    console.debug("[input-gate]", debugLine);
  }
  return entry;
}

function recoverStaleInputGate(targetState = state, { force = false, reason = "" } = {}) {
  const gateState = syncInputGateState(targetState);
  const now = Date.now();
  const shouldRecover = force
    ? (gateState.active || gateState.lockUntil > now)
    : (gateState.active && gateState.lockStartedAt && (now - gateState.lockStartedAt) >= INPUT_GATE_STALE_MS);

  if (!shouldRecover) {
    gateState.mode = getCurrentInputGateMode(targetState);
    return false;
  }

  gateState.active = false;
  gateState.actionId = "";
  gateState.source = "";
  gateState.lockStartedAt = 0;
  gateState.lockUntil = 0;
  gateState.mode = getCurrentInputGateMode(targetState);
  gateState.recoveryCount += 1;
  if (reason) {
    gateState.lastBlockedReason = reason;
  }

  pushInputGateDebugEntry("recover", {
    reason: reason || "stale-lock",
    mode: gateState.mode,
  }, targetState);
  return true;
}

function getInputGatePolicyForSource(source = "general") {
  switch (String(source || "").trim()) {
    case "phone-action":
    case "phone-toggle":
      return ["normal", "phone"];
    case "overlay-toggle":
    case "overlay-action":
      return ["normal"];
    case "minigame-action":
      return ["minigame"];
    case "scene-choice":
    case "textbox-advance":
      return ["normal", "moving", "event", "dialogue", "minigame"];
    default:
      return [];
  }
}

function getInputGateModeBlockMessage(mode = "normal") {
  switch (mode) {
    case "moving":
      return "이동 중에는 다른 행동을 할 수 없다.";
    case "event":
      return "이 장면을 먼저 마무리해야 한다.";
    case "dialogue":
      return "대화가 끝난 뒤에 다른 행동을 할 수 있다.";
    case "minigame":
      return "미니게임을 먼저 끝내야 한다.";
    case "phone":
      return "폰을 접고 화면으로 돌아가야 한다.";
    default:
      return "지금은 그 행동을 할 수 없다.";
  }
}

function maybeShowInputGateFeedback(reason = "", targetState = state) {
  const gateState = syncInputGateState(targetState);
  const now = Date.now();
  if ((now - gateState.lastBlockedAt) < INPUT_GATE_FEEDBACK_COOLDOWN_MS) {
    return;
  }

  gateState.lastBlockedAt = now;
  const message = String(reason || "").trim();
  if (!message) {
    return;
  }

  if (typeof queueGameplayFeedback === "function") {
    queueGameplayFeedback({
      title: "입력 잠금",
      tone: "warning",
      chips: [{ label: message, tone: "warning" }],
    }, targetState);
    return;
  }

  if (targetState?.headline) {
    targetState.headline = {
      badge: "입력 잠금",
      text: message,
    };
  }
}

function canRunGuardedUiAction({
  source = "general",
  actionId = "",
  allowedModes = null,
  targetState = state,
  suppressFeedback = false,
} = {}) {
  const gateState = syncInputGateState(targetState);
  recoverStaleInputGate(targetState);
  const now = Date.now();
  gateState.mode = getCurrentInputGateMode(targetState);

  if (gateState.active || gateState.lockUntil > now) {
    gateState.blockedCount += 1;
    gateState.lastBlockedReason = "busy";
    pushInputGateDebugEntry("blocked", {
      reason: "busy",
      source,
      actionId,
      mode: gateState.mode,
    }, targetState);
    const shouldExplainBusy = gateState.active
      && gateState.lockStartedAt
      && (now - gateState.lockStartedAt) >= INPUT_GATE_BUSY_FEEDBACK_DELAY_MS;
    if (!suppressFeedback && shouldExplainBusy) {
      maybeShowInputGateFeedback("입력이 아직 정리되는 중이다.", targetState);
    }
    return false;
  }

  const resolvedAllowedModes = Array.isArray(allowedModes)
    ? allowedModes.filter(Boolean)
    : getInputGatePolicyForSource(source);

  if (resolvedAllowedModes.length && !resolvedAllowedModes.includes(gateState.mode)) {
    gateState.blockedCount += 1;
    gateState.lastBlockedReason = `mode:${gateState.mode}`;
    pushInputGateDebugEntry("blocked", {
      reason: gateState.lastBlockedReason,
      source,
      actionId,
      mode: gateState.mode,
    }, targetState);
    if (!suppressFeedback) {
      maybeShowInputGateFeedback(getInputGateModeBlockMessage(gateState.mode), targetState);
    }
    return false;
  }

  return true;
}

function runGuardedUiAction(callback, {
  source = "general",
  actionId = "",
  allowedModes = null,
  cooldownMs = INPUT_GATE_COOLDOWN_MS,
  targetState = state,
  suppressFeedback = false,
} = {}) {
  if (typeof callback !== "function") {
    return false;
  }

  if (!canRunGuardedUiAction({
    source,
    actionId,
    allowedModes,
    targetState,
    suppressFeedback,
  })) {
    return false;
  }

  const gateState = syncInputGateState(targetState);
  const startedAt = Date.now();
  const resolvedCooldownMs = Math.max(0, Math.round(Number(cooldownMs) || INPUT_GATE_COOLDOWN_MS));
  gateState.active = true;
  gateState.actionId = String(actionId || source || "action").trim();
  gateState.source = String(source || "general").trim() || "general";
  gateState.mode = getCurrentInputGateMode(targetState);
  gateState.lockStartedAt = startedAt;
  gateState.lockUntil = startedAt + resolvedCooldownMs;
  pushInputGateDebugEntry("start", {
    source: gateState.source,
    actionId: gateState.actionId,
    mode: gateState.mode,
  }, targetState);

  try {
    return callback();
  } catch (error) {
    recoverStaleInputGate(targetState, {
      force: true,
      reason: `${gateState.source}:${gateState.actionId}:error`,
    });
    console.error("[input-gate] action failed", error);
    throw error;
  } finally {
    const finishedAt = Date.now();
    gateState.active = false;
    gateState.actionId = "";
    gateState.source = "";
    gateState.lockStartedAt = 0;
    gateState.lockUntil = finishedAt + resolvedCooldownMs;
    gateState.mode = getCurrentInputGateMode(targetState);
    pushInputGateDebugEntry("finish", {
      source,
      actionId,
      mode: gateState.mode,
    }, targetState);
  }
}

var activeGameplayFeedback = null;
var gameplayFeedbackTimerId = 0;

function clearGameplayFeedback({ render = false } = {}) {
  activeGameplayFeedback = null;
  if (gameplayFeedbackTimerId) {
    clearTimeout(gameplayFeedbackTimerId);
    gameplayFeedbackTimerId = 0;
  }

  if (render && typeof renderGame === "function") {
    renderGame();
  }
}

function normalizeGameplayFeedbackChip(chip = null) {
  if (!chip || typeof chip !== "object") {
    return null;
  }

  const label = String(chip.label || "").trim();
  if (!label) {
    return null;
  }

  const tone = String(chip.tone || "").trim();
  return tone ? { label, tone } : { label };
}

function queueGameplayFeedback({
  title = "",
  tone = "info",
  chips = [],
} = {}, targetState = state) {
  const normalizedTitle = String(title || "").trim() || "행동 결과";
  const normalizedChips = Array.isArray(chips)
    ? chips.map((chip) => normalizeGameplayFeedbackChip(chip)).filter(Boolean)
    : [];

  activeGameplayFeedback = {
    title: normalizedTitle,
    tone: String(tone || "info").trim() || "info",
    chips: normalizedChips,
  };

  if (gameplayFeedbackTimerId) {
    clearTimeout(gameplayFeedbackTimerId);
  }

  gameplayFeedbackTimerId = window.setTimeout(() => {
    activeGameplayFeedback = null;
    gameplayFeedbackTimerId = 0;
    if (typeof renderGame === "function") {
      renderGame();
    }
  }, GAMEPLAY_FEEDBACK_DURATION_MS);

  if (targetState === state && typeof renderGame === "function") {
    renderGame();
  }

  return activeGameplayFeedback;
}

function getActiveGameplayFeedback() {
  return activeGameplayFeedback;
}

function buildGameplayFeedbackDeltaChip(
  label,
  amount,
  {
    suffix = "",
    positiveTone = "up",
    negativeTone = "down",
  } = {},
) {
  const normalizedLabel = String(label || "").trim();
  const normalizedAmount = Math.round(Number(amount) || 0);
  if (!normalizedLabel || !normalizedAmount) {
    return null;
  }

  const sign = normalizedAmount > 0 ? "+" : "";
  return {
    label: `${normalizedLabel} ${sign}${normalizedAmount}${suffix}`,
    tone: normalizedAmount > 0 ? positiveTone : negativeTone,
  };
}

function applyPlayerNeedDelta({
  stamina = 0,
  energy = 0,
  hunger = 0,
} = {}, targetState = state) {
  const chips = [];
  const staminaDelta = Math.round(Number(stamina) || 0);
  const energyDelta = Math.round(Number(energy) || 0);
  const hungerDelta = Math.round(Number(hunger) || 0);

  if (staminaDelta !== 0) {
    const staminaMax = typeof SLEEP_STAMINA_MAX === "number" ? SLEEP_STAMINA_MAX : 100;
    targetState.stamina = Math.max(
      0,
      Math.min(staminaMax, Math.round(Number(targetState.stamina) || 0) + staminaDelta),
    );
    chips.push(buildGameplayFeedbackDeltaChip("체력", staminaDelta));
  }

  if (energyDelta !== 0) {
    const energyMax = typeof ENERGY_MAX === "number"
      ? ENERGY_MAX
      : (typeof BASE_ENERGY === "number" ? BASE_ENERGY : 100);
    targetState.energy = Math.max(
      0,
      Math.min(energyMax, Math.round(Number(targetState.energy) || 0) + energyDelta),
    );
    chips.push(buildGameplayFeedbackDeltaChip("에너지", energyDelta));
  }

  if (hungerDelta !== 0 && typeof ensureHungerState === "function") {
    const hungerState = ensureHungerState(targetState);
    const hungerMax = typeof HUNGER_MAX === "number" ? HUNGER_MAX : 100;
    const nextValue = Math.max(
      0,
      Math.min(hungerMax, Math.round(Number(hungerState.value) || 0) + hungerDelta),
    );
    targetState.hunger = nextValue;
    if (hungerDelta > 0) {
      targetState.hungerDecayProgress = 0;
    }
    if (nextValue > Math.round(hungerMax * 0.6)) {
      targetState.lastHungerWarningKey = "";
    }
    chips.push(buildGameplayFeedbackDeltaChip("배고픔", hungerDelta));
  }

  if ((staminaDelta !== 0 || hungerDelta !== 0) && typeof syncCriticalResourceWarnings === "function") {
    syncCriticalResourceWarnings(targetState);
  }

  return chips.filter(Boolean);
}

function applyPlayerSocialDelta({
  intelligence = 0,
  reputation = 0,
  crime = 0,
  attractiveness = 0,
  happiness = 0,
} = {}, targetState = state) {
  const chips = [];
  const intelligenceDelta = Math.round(Number(intelligence) || 0);
  const reputationDelta = Math.round(Number(reputation) || 0);
  const crimeDelta = Math.round(Number(crime) || 0);
  const attractivenessDelta = Math.round(Number(attractiveness) || 0);
  const happinessDelta = Math.round(Number(happiness) || 0);

  if (intelligenceDelta !== 0) {
    targetState.지능 = Math.max(0, Math.min(100, Math.round(Number(targetState.지능) || 0) + intelligenceDelta));
    chips.push(buildGameplayFeedbackDeltaChip("지능", intelligenceDelta));
  }

  if (reputationDelta !== 0) {
    targetState.평판 = Math.max(0, Math.min(100, Math.round(Number(targetState.평판) || 0) + reputationDelta));
    chips.push(buildGameplayFeedbackDeltaChip("평판", reputationDelta));
  }

  if (crimeDelta !== 0) {
    targetState.범죄도 = Math.max(0, Math.min(100, Math.round(Number(targetState.범죄도) || 0) + crimeDelta));
    chips.push(buildGameplayFeedbackDeltaChip("범죄도", crimeDelta, {
      positiveTone: "warning",
      negativeTone: "up",
    }));
  }

  if (attractivenessDelta !== 0 && typeof patchAppearanceState === "function") {
    patchAppearanceState({ attractivenessDelta }, targetState);
    chips.push(buildGameplayFeedbackDeltaChip("외모", attractivenessDelta));
  }

  if (happinessDelta !== 0 && typeof adjustHappiness === "function") {
    adjustHappiness(happinessDelta, targetState);
    chips.push(buildGameplayFeedbackDeltaChip("행복도", happinessDelta));
  }

  return chips.filter(Boolean);
}

function getJobShiftRule(jobId) {
  return JOB_SHIFT_RULES[jobId] || {
    startSlotChoices: [20, 24],
    durationSlots: 8,
  };
}

function formatClockTime(slot = DAY_START_TIME_SLOT, minuteOffset = 0) {
  const normalizedSlot = Math.max(0, Math.round(slot));
  const normalizedMinuteOffset = Math.max(0, Math.min(29, Math.round(minuteOffset)));
  const totalMinutes = (normalizedSlot * 30) + normalizedMinuteOffset;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function getDefaultTimeSlotForState(targetState = state) {
  if (targetState.scene === "prologue" && targetState.storyKey === "originIntro") {
    return PROLOGUE_TIME_SLOTS.introWake;
  }

  if (targetState.scene === "prologue" && targetState.storyKey === "intro") {
    if (targetState.storyStep <= 0) {
      return PROLOGUE_TIME_SLOTS.introWake;
    }
    if (targetState.storyStep === 1) {
      return PROLOGUE_TIME_SLOTS.introCleanupPrompt;
    }
    return PROLOGUE_TIME_SLOTS.introReward;
  }

  if (targetState.scene === "cleanup") {
    return PROLOGUE_TIME_SLOTS.introCleanup;
  }

  return DAY_START_TIME_SLOT;
}

function getCurrentPrologueStep(targetState = state) {
  const steps = getActiveStorySteps(targetState);
  const stepIndex = Number.isFinite(targetState?.storyStep)
    ? Math.max(0, Math.floor(targetState.storyStep))
    : 0;
  return steps[stepIndex] || steps[0] || null;
}

function getInteractivePrologueStepConfig(targetState = state) {
  if (targetState?.scene !== "prologue") {
    return null;
  }

  const step = getCurrentPrologueStep(targetState);
  return ["walk-to-exit", "press-exit"].includes(step?.startMode) ? step : null;
}

function createDefaultPrologueIntroState(targetState = state) {
  const step = getInteractivePrologueStepConfig(targetState) || getCurrentPrologueStep(targetState);
  const playerConfig = step?.player || {};
  const startLeft = Number(playerConfig.startLeft);

  return {
    playerLeft: Number.isFinite(startLeft) ? startLeft : 24,
    facing: Number(playerConfig.facing) < 0 ? -1 : 1,
  };
}

function syncPrologueIntroState(targetState = state) {
  const defaults = createDefaultPrologueIntroState(targetState);
  if (!targetState || typeof targetState !== "object") {
    return defaults;
  }

  const current = targetState.prologueIntro && typeof targetState.prologueIntro === "object"
    ? targetState.prologueIntro
    : {};

  targetState.prologueIntro = {
    playerLeft: Number.isFinite(current.playerLeft)
      ? Math.max(0, Math.min(100, current.playerLeft))
      : defaults.playerLeft,
    facing: Number(current.facing) < 0 ? -1 : 1,
  };

  return targetState.prologueIntro;
}

function canUseInteractivePrologueExit(targetState = state) {
  const step = getInteractivePrologueStepConfig(targetState);
  if (!step) {
    return false;
  }

  const introState = syncPrologueIntroState(targetState);
  const exitThreshold = Number(step.player?.exitThreshold);
  if (!Number.isFinite(exitThreshold)) {
    return true;
  }
  return introState.playerLeft >= exitThreshold;
}

function enterInteractivePrologueExit(targetState = state) {
  if (!canUseInteractivePrologueExit(targetState)) {
    return false;
  }

  prepareDayState(targetState);
  targetState.prologueIntro = createDefaultPrologueIntroState(targetState);

  if (beginHomeRouteTransition("outbound", {
    spendTime: false,
    targetState,
  })) {
    if (targetState === state && typeof recordActionMemory === "function") {
      recordActionMemory("집 밖으로 나간다", `${getCurrentLocationLabel()} 쪽으로 문을 열고 나간다.`, {
        type: "travel",
        source: "집",
        tags: ["이동", "외출"],
      });
    }

    return true;
  }

  syncWorldState(targetState);
  targetState.scene = "outside";
  targetState.world.currentLocation = (typeof getResolvedHomeLocationId === "function"
    ? getResolvedHomeLocationId(targetState)
    : getDayHomeLocationId(targetState.day)) || targetState.world.currentLocation;
  targetState.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(targetState.world.currentLocation, targetState.day)
    : targetState.world.currentDistrict;
  clearAlleyNpcState(targetState);
  clearWanderResultState(targetState);
  clearPendingTravelState(targetState);
  targetState.headline = {
    badge: "",
    text: "",
  };

  if (targetState === state && typeof recordActionMemory === "function") {
    recordActionMemory("집 밖으로 나갔다", `${getCurrentLocationLabel()} 쪽으로 문을 열고 나갔다.`, {
      type: "travel",
      source: "집",
      tags: ["이동", "외출"],
    });
  }

  renderGame();
  return true;
}

function matchesEventTrigger(event, action) {
  const trigger = event.trigger || {};

  if (event.action && event.action !== action) {
    return false;
  }

  if (trigger.day != null && trigger.day !== state.day) {
    return false;
  }

  if (trigger.scene && trigger.scene !== state.scene) {
    return false;
  }

  if (trigger.storyKey && trigger.storyKey !== state.storyKey) {
    return false;
  }

  if (trigger.storyStep != null && trigger.storyStep !== state.storyStep) {
    return false;
  }

  if (trigger.state) {
    for (const [key, value] of Object.entries(trigger.state)) {
      if (state[key] !== value) {
        return false;
      }
    }
  }

  return true;
}

function findTriggeredEvent(action, day = getCurrentDayNumber()) {
  return getDayEventRegistry(day).find((event) => matchesEventTrigger(event, action)) || null;
}

function getDayEventConfig(event, day = getCurrentDayNumber()) {
  if (!event) {
    return null;
  }

  const eventData = getDayEventData(day);

  if (event.dataKey && eventData[event.dataKey]) {
    return eventData[event.dataKey];
  }

  return event.data || null;
}

function findDayEventById(eventId, day = getCurrentDayNumber()) {
  if (!eventId) {
    return null;
  }

  return getDayEventRegistry(day).find((event) => event.id === eventId) || null;
}

function applyStatePatch(targetState = state, patch = {}) {
  Object.entries(patch).forEach(([key, value]) => {
    targetState[key] = value;
  });
}

function applyEventStatePatch(patch = {}) {
  applyStatePatch(state, patch);
}

function startRegisteredEvent(action) {
  const event = findTriggeredEvent(action);

  if (!event) {
    return false;
  }

  if (event.type === "cleanup") {
    const cleanup = getDayEventConfig(event);
    state.timeSlot = PROLOGUE_TIME_SLOTS.introCleanup;
    state.timeMinuteOffset = 0;
    state.scene = "cleanup";
    state.cleaningGame = {
      eventId: event.id,
      items: cleanup.items.map((item) => ({ ...item })),
      remaining: cleanup.items.length,
    };
    recordActionMemory("방청소를 시작했다", "바닥에 널린 것들을 치우려고 방부터 손대기 시작했다.", {
      type: "action",
      source: "집",
      tags: ["일상", "청소"],
    });
    renderGame();
    return true;
  }

  return false;
}

function getActiveCleaningEvent() {
  const activeId = state.cleaningGame?.eventId;
  if (!activeId) {
    return null;
  }

  return getDayEventRegistry().find((event) => event.id === activeId) || null;
}

function finishRegisteredCleanupEvent() {
  const event = getActiveCleaningEvent();
  const cleanup = getDayEventConfig(event);

  if (!event || !cleanup) {
    return false;
  }

  const onComplete = event.onComplete || {};

  applyEventStatePatch(onComplete.state);

  if (onComplete.rewardFromData && cleanup.reward) {
    if (typeof earnCash === "function") {
      earnCash(cleanup.reward);
    } else {
      state.money += cleanup.reward;
    }
    showMoneyEffect(cleanup.reward);
  }
  recordActionMemory(
    "방청소를 마쳤다",
    onComplete.rewardFromData && cleanup.reward
      ? `방 안을 정리하고 ${formatMoney(cleanup.reward)}을 손에 쥐었다.`
      : "방 안을 정리하고 한숨 돌렸다.",
    {
      type: "action",
      source: "집",
      tags: ["일상", "청소"],
    },
  );

  state.cleaningGame = null;
  state.timeSlot = PROLOGUE_TIME_SLOTS.introReward;
  state.timeMinuteOffset = 0;

  if (onComplete.scene) {
    state.scene = onComplete.scene;
  }

  if (onComplete.storyStepDelta) {
    state.storyStep = Math.min(
      state.storyStep + onComplete.storyStepDelta,
      getActiveStorySteps().length - 1,
    );
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory(`${definition.label} 사용`, definition.useMemoryBody || `${definition.label}으로 배고픔을 달랬다.`, {
      type: "food",
      source: "인벤토리",
      tags: ["인벤토리", "배고픔", definition.id],
    });
  }

  renderGame();
  return true;
}

let state = createInitialState();
let pendingSavedState = null;
let startScreenDrawState = createDefaultStartScreenDrawState();
let startScreenDrawTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  cacheUi();
  bindStaticEvents();
  if (typeof scheduleSceneImageWarmup === "function") {
    scheduleSceneImageWarmup(state);
  }
  if (typeof startTradingTerminalTicker === "function") {
    startTradingTerminalTicker();
  }
  pendingSavedState = loadSavedState();
  showStartScreen(Boolean(pendingSavedState));
});

function createDefaultStartScreenDrawState() {
  return {
    screenMode: "intro",
    phase: "idle",
    previewTierId: "",
    resultTierId: "",
    confirmedTierId: "",
  };
}

function getStartScreenDrawState() {
  return {
    ...startScreenDrawState,
  };
}

function stopStartScreenDrawTimer() {
  if (startScreenDrawTimer) {
    clearInterval(startScreenDrawTimer);
    startScreenDrawTimer = null;
  }
}

function syncStartScreenDrawUi() {
  if (typeof renderStartScreenDrawState === "function") {
    renderStartScreenDrawState(Boolean(pendingSavedState));
  }
}

function resetStartScreenDrawState() {
  stopStartScreenDrawTimer();
  startScreenDrawState = createDefaultStartScreenDrawState();
  syncStartScreenDrawUi();
}

function createInitialState() {
  const phoneDefaults = typeof createDefaultPhoneDeviceState === "function"
      ? createDefaultPhoneDeviceState()
      : {
        minimized: true,
        stageExpanded: false,
        route: "home",
        usedToday: false,
        installedApps: ["bank", "dis", "news", "playstore", "call", "gallery"],
        manualInstalledApps: [],
      };
  const jobsDefaults = typeof createDefaultJobsState === "function"
    ? createDefaultJobsState()
    : {
        dailyOffers: [],
        scheduledShift: null,
        interviewResult: null,
        applicationDoneToday: false,
      };
  const bankDefaults = typeof createDefaultBankState === "function"
    ? createDefaultBankState()
    : {
        balance: 0,
        transactions: [],
        transferDraft: {
          recipient: "",
          amount: "",
        },
        loans: [],
        loanDraft: {
          selectedType: "personal",
        },
        lastLoanResolution: null,
      };
  const dialogueDefaults = typeof createDefaultDialogueState === "function"
    ? createDefaultDialogueState()
    : {
        active: false,
        npcId: "",
        nodeId: "",
        returnScene: "outside",
        returnLocationId: "",
        source: "",
      };
  const memoryDefaults = typeof createDefaultMemoryState === "function"
    ? createDefaultMemoryState()
    : {
        panelOpen: false,
        entries: [],
      };
  const inventoryDefaults = typeof createDefaultInventoryState === "function"
    ? createDefaultInventoryState()
    : {
        panelOpen: false,
        activeTab: "carry",
        slotLimit: 8,
        items: [],
        equipped: {
          phone: null,
          bag: null,
        },
      };
  const ownershipDefaults = typeof createDefaultOwnershipState === "function"
    ? createDefaultOwnershipState()
    : {
        residence: "parents-room",
        home: null,
        vehicle: null,
      };
  const progressionDefaults = typeof createDefaultProgressionState === "function"
    ? createDefaultProgressionState()
    : {
        routes: {
          career: {},
          crime: {},
          startup: {},
          corporate: {},
          investor: {},
        },
      };
  const unlockDefaults = typeof createDefaultUnlocksState === "function"
    ? createDefaultUnlocksState()
    : {
        jobs: [],
        locations: [],
        apps: [],
        routes: [],
        events: [],
        npcs: [],
      };
  const socialDefaults = typeof createDefaultSocialState === "function"
    ? createDefaultSocialState()
    : {
        contacts: {},
        factions: {},
      };
  const riskDefaults = typeof createDefaultRiskState === "function"
    ? createDefaultRiskState()
    : {
        crime: 0,
        heat: 0,
        debt: 0,
        gambling: 0,
      };
  const businessDefaults = typeof createDefaultBusinessState === "function"
    ? createDefaultBusinessState()
    : {
        ventures: {},
        ledger: [],
        permits: {},
        staff: {},
        realEstate: {
          ownedBuildingId: "",
          buildingLabel: "",
          purchasedDay: 0,
          cumulativeProfit: 0,
          lastProcessedTurnDay: 0,
          purchasePrice: 0,
          estimatedValue: 0,
          incomePerTurn: 0,
        },
      };
  const appearanceDefaults = typeof createDefaultAppearanceState === "function"
    ? createDefaultAppearanceState()
    : {
        profileId: "",
        surgeryDone: false,
        attractiveness: 0,
        flags: {},
      };
  const npcDefaults = typeof createDefaultNpcState === "function"
    ? createDefaultNpcState()
    : {
        relations: {},
      };
  const happinessDefaults = typeof createDefaultHappinessState === "function"
    ? createDefaultHappinessState()
    : {
        value: 45,
        status: "low",
        dailyDecay: 5,
        lastModifiedDay: 1,
      };
  const ambientRomanceDefaults = typeof createDefaultAmbientRomanceState === "function"
    ? createDefaultAmbientRomanceState()
    : {
        seenEventIds: [],
        cooldownUntilDayByNpcId: {},
        followUpStateByNpcId: {},
        lastTriggerId: "",
        activeEventId: "",
      };
  const socialScamDefaults = typeof createDefaultSocialScamState === "function"
    ? createDefaultSocialScamState()
    : {
        shownDay: 0,
        activeEventId: "",
        activeNpcId: "",
        seenEventIds: [],
        cooldownUntilDayByEventId: {},
        lastResult: null,
      };

  return {
    playerName: "이름 없음",
    day: 1,
    money: 0,
    stamina: BASE_STAMINA,
    energy: BASE_ENERGY,
    hunger: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 100,
    hungerDecayProgress: 0,
    hungerVersion: typeof HUNGER_SYSTEM_VERSION === "number" ? HUNGER_SYSTEM_VERSION : 1,
    timeSlot: PROLOGUE_TIME_SLOTS.introWake,
    timeMinuteOffset: 0,
    scene: "prologue",
    storyKey: "intro",
    storyStep: 0,
    prologueIntro: createDefaultPrologueIntroState({
      day: 1,
      scene: "prologue",
      storyKey: "intro",
      storyStep: 0,
    }),
    devices: {
      phone: { ...phoneDefaults },
    },
    jobs: {
      ...jobsDefaults,
    },
    bank: {
      ...bankDefaults,
      transactions: [...(bankDefaults.transactions || [])],
      transferDraft: { ...(bankDefaults.transferDraft || { recipient: "", amount: "" }) },
      loans: [...(bankDefaults.loans || [])].map((loan) => ({ ...(loan || {}) })),
      loanDraft: { ...(bankDefaults.loanDraft || { selectedType: "personal" }) },
      lastLoanResolution: bankDefaults.lastLoanResolution
        ? { ...bankDefaults.lastLoanResolution, lines: [...(bankDefaults.lastLoanResolution.lines || [])] }
        : null,
    },
    dialogue: {
      ...dialogueDefaults,
    },
    memory: {
      ...memoryDefaults,
      entries: [...(memoryDefaults.entries || [])],
    },
    inventory: {
      ...inventoryDefaults,
      items: [...(inventoryDefaults.items || [])].map((item) => ({ ...item })),
      equipped: { ...(inventoryDefaults.equipped || {}) },
    },
    ownership: {
      ...ownershipDefaults,
    },
    progression: {
      ...progressionDefaults,
      routes: { ...(progressionDefaults.routes || {}) },
    },
    unlocks: {
      ...unlockDefaults,
      jobs: [...(unlockDefaults.jobs || [])],
      locations: [...(unlockDefaults.locations || [])],
      apps: [...(unlockDefaults.apps || [])],
      routes: [...(unlockDefaults.routes || [])],
      events: [...(unlockDefaults.events || [])],
      npcs: [...(unlockDefaults.npcs || [])],
    },
    social: {
      ...socialDefaults,
      contacts: { ...(socialDefaults.contacts || {}) },
      factions: { ...(socialDefaults.factions || {}) },
    },
    happiness: {
      ...happinessDefaults,
    },
    risk: {
      ...riskDefaults,
    },
    business: {
      ...businessDefaults,
      ventures: { ...(businessDefaults.ventures || {}) },
      ledger: Array.isArray(businessDefaults.ledger) ? [...businessDefaults.ledger] : [],
      permits: { ...(businessDefaults.permits || {}) },
      staff: { ...(businessDefaults.staff || {}) },
      realEstate: { ...(businessDefaults.realEstate || {}) },
    },
    appearance: {
      ...appearanceDefaults,
      flags: { ...(appearanceDefaults.flags || {}) },
    },
    npcs: {
      ...npcDefaults,
      relations: Object.fromEntries(
        Object.entries(npcDefaults.relations || {}).map(([npcId, relation]) => [
          npcId,
          {
            ...(relation || {}),
            flags: { ...(relation?.flags || {}) },
          },
        ])
      ),
    },
    world: createDefaultWorldState(1),
    hasPhone: true,
    phoneMinimized: phoneDefaults.minimized,
    phoneStageExpanded: phoneDefaults.stageExpanded,
    phoneView: phoneDefaults.route,
    phoneUsedToday: phoneDefaults.usedToday,
    installedPhoneApps: [...(phoneDefaults.installedApps || [])],
    disSearchQuery: "",
    disCommunity: typeof createDefaultDisCommunityState === "function"
      ? createDefaultDisCommunityState()
      : {
          selectedPostId: "",
          draft: {
            author: "",
            title: "",
            content: "",
          },
          commentDraft: {
            author: "",
            content: "",
          },
        },
    disGambleDrafts: {
      "odd-even": "1000",
      ladder: "5000",
    },
    phonePreview: createPhoneHomePreview(1),
    phoneAppStatus: {},
    inputGate: createDefaultInputGateState(),
    casino: typeof createDefaultCasinoState === "function"
      ? createDefaultCasinoState()
      : null,
    stocksUsedToday: false,
    casinoUsedToday: false,
    coinUsedToday: false,
    stockHolding: null,
    coinHolding: null,
    activeJobs: new Set(STARTING_JOB_IDS),
    seenIncidents: new Set(),
    jobVisits: {},
    currentOffer: null,
    currentIncident: null,
    jobMiniGame: null,
    jobMiniGameResult: null,
    clockOutSummary: null,
    lectureGig: null,
    lectureGigDay: 0,
    romance: typeof createDefaultRomanceDomainState === "function"
      ? createDefaultRomanceDomainState()
      : {
          activePlan: null,
          activeScene: null,
          lastOutcome: null,
          callScene: null,
          callSession: null,
          girlfriendContactIds: [],
        },
    ambientRomance: {
      ...ambientRomanceDefaults,
      seenEventIds: [...(ambientRomanceDefaults.seenEventIds || [])],
      cooldownUntilDayByNpcId: { ...(ambientRomanceDefaults.cooldownUntilDayByNpcId || {}) },
      followUpStateByNpcId: { ...(ambientRomanceDefaults.followUpStateByNpcId || {}) },
    },
    socialScams: {
      ...socialScamDefaults,
      seenEventIds: [...(socialScamDefaults.seenEventIds || [])],
      cooldownUntilDayByEventId: { ...(socialScamDefaults.cooldownUntilDayByEventId || {}) },
      lastResult: socialScamDefaults.lastResult ? { ...socialScamDefaults.lastResult } : null,
    },
    romanceScene: null,
    plasticSurgeryEvent: null,
    lottoRetailer: createDefaultLottoRetailerState(),
    pendingTurnEvents: [],
    turnBriefing: null,
    nightAutoSleep: null,
    homeTransition: null,
    lastResult: null,
    endingSummary: null,
    lastWorkedJobId: null,
    day1CleanupDone: false,
    cleaningGame: null,
    devPreviewMode: false,
    startingOrigin: typeof createDefaultSpoonStartState === "function"
      ? createDefaultSpoonStartState()
      : {
          tierId: "",
          label: "",
          bracket: "",
          summary: "",
          toneLabel: "",
          initialCash: 0,
          walletCash: 0,
          bankBalance: 0,
          starterAssetIds: [],
          starterVehicleId: "",
          safetyNetLevel: "none",
          startHappiness: 45,
          accent: "#94a3b8",
          applied: false,
        },
    headline: {
      badge: "",
      text: "",
    },
    지능: 10,
    평판: 0,
    범죄도: 0,
  };
}

function advanceStoryStep() {
  state.storyStep = Math.min(state.storyStep + 1, getActiveStorySteps().length - 1);
}

function buildWorldLocationPersistencePatch(targetState = state, locationId = "") {
  const normalizedLocationId = String(locationId || "").trim();
  if (!normalizedLocationId) {
    return {};
  }

  const day = targetState?.day || getCurrentDayNumber();
  const locationMap = typeof getDayWorldLocationMap === "function"
    ? getDayWorldLocationMap(day) || {}
    : {};
  if (!locationMap?.[normalizedLocationId]) {
    return {};
  }

  return {
    currentLocation: normalizedLocationId,
    currentDistrict: typeof getWorldLocationDistrictId === "function"
      ? getWorldLocationDistrictId(normalizedLocationId, day)
      : String(targetState?.world?.currentDistrict || ""),
  };
}

function buildPersistenceSceneFrame(targetState = state) {
  const phoneState = typeof syncPhoneSessionState === "function"
    ? syncPhoneSessionState(targetState)
    : {
        minimized: typeof targetState?.phoneMinimized === "boolean" ? targetState.phoneMinimized : true,
        stageExpanded: typeof targetState?.phoneStageExpanded === "boolean" ? targetState.phoneStageExpanded : false,
        route: String(targetState?.phoneView || "home"),
      };
  const normalizedPhoneView = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(phoneState?.route || targetState?.phoneView || "home")
    : String(phoneState?.route || targetState?.phoneView || "home");
  const frame = {
    scene: String(targetState?.scene || "room"),
    phoneMinimized: Boolean(phoneState?.minimized),
    phoneStageExpanded: Boolean(phoneState?.stageExpanded),
    phoneView: normalizedPhoneView || "home",
    worldPatch: {},
    dialogue: targetState?.dialogue && typeof targetState.dialogue === "object"
      ? { ...(targetState.dialogue || {}) }
      : null,
    homeTransition: targetState?.homeTransition || null,
    currentOffer: targetState?.currentOffer || null,
    currentIncident: targetState?.currentIncident || null,
    jobMiniGame: targetState?.jobMiniGame || null,
    clockOutSummary: targetState?.clockOutSummary || null,
    plasticSurgeryEvent: targetState?.plasticSurgeryEvent || null,
  };
  const collapsePhone = () => {
    frame.phoneMinimized = true;
    frame.phoneStageExpanded = false;
    frame.phoneView = "home";
  };

  if (frame.scene === "home-transition") {
    frame.scene = "room";
    frame.homeTransition = null;
    collapsePhone();
    return frame;
  }

  if (frame.scene === "dialogue") {
    const returnScene = String(frame.dialogue?.returnScene || "").trim();
    frame.scene = returnScene || "outside";
    frame.dialogue = frame.dialogue
      ? {
          ...frame.dialogue,
          active: false,
        }
      : null;
    frame.worldPatch = buildWorldLocationPersistencePatch(targetState, frame.dialogue?.returnLocationId);
    collapsePhone();
    return frame;
  }

  if (frame.scene === "night-auto-sleep") {
    collapsePhone();
    return frame;
  }

  if (frame.scene === "job-minigame") {
    const restoreLocationId = resolveJobMiniGameRestoreLocationId(targetState, frame.jobMiniGame);
    frame.worldPatch = buildWorldLocationPersistencePatch(targetState, restoreLocationId);
    frame.jobMiniGame = null;
    frame.scene = frame.currentIncident
      ? "incident"
      : (frame.clockOutSummary
        ? "clockout"
        : (restoreLocationId ? "outside" : "room"));
    collapsePhone();
    return frame;
  }

  if (frame.scene === "plastic-surgery") {
    const restoreLocationId = String(frame.plasticSurgeryEvent?.locationId || getPlasticSurgeryEventLocationId(targetState)).trim();
    frame.worldPatch = buildWorldLocationPersistencePatch(targetState, restoreLocationId);
    collapsePhone();
    return frame;
  }

  if (frame.scene === "ranking") {
    frame.scene = targetState?.endingSummary ? "ending" : "room";
    frame.currentOffer = null;
    frame.currentIncident = null;
    frame.jobMiniGame = null;
    frame.homeTransition = null;
    collapsePhone();
    return frame;
  }

  if (frame.scene === "ending") {
    collapsePhone();
  }

  return frame;
}

function applyPersistenceSceneFrame(targetState = state, frame = buildPersistenceSceneFrame(targetState)) {
  if (!targetState || typeof targetState !== "object" || !frame || typeof frame !== "object") {
    return targetState;
  }

  const devices = targetState.devices && typeof targetState.devices === "object"
    ? targetState.devices
    : {};
  const phone = devices.phone && typeof devices.phone === "object"
    ? devices.phone
    : {};

  targetState.scene = String(frame.scene || targetState.scene || "room");
  targetState.currentOffer = frame.currentOffer ?? null;
  targetState.currentIncident = frame.currentIncident ?? null;
  targetState.jobMiniGame = frame.jobMiniGame ?? null;
  targetState.clockOutSummary = frame.clockOutSummary ?? null;
  targetState.homeTransition = frame.homeTransition ?? null;
  targetState.plasticSurgeryEvent = frame.plasticSurgeryEvent ?? null;
  targetState.phoneMinimized = Boolean(frame.phoneMinimized);
  targetState.phoneStageExpanded = Boolean(frame.phoneStageExpanded);
  targetState.phoneView = String(frame.phoneView || "home");
  targetState.devices = {
    ...devices,
    phone: {
      ...phone,
      minimized: targetState.phoneMinimized,
      stageExpanded: targetState.phoneStageExpanded,
      route: targetState.phoneView,
    },
  };
  targetState.world = {
    ...(targetState.world && typeof targetState.world === "object" ? targetState.world : {}),
    ...(frame.worldPatch && typeof frame.worldPatch === "object" ? frame.worldPatch : {}),
  };

  if (targetState.dialogue || frame.dialogue) {
    const currentDialogue = targetState.dialogue && typeof targetState.dialogue === "object"
      ? targetState.dialogue
      : {};
    const nextDialogue = frame.dialogue && typeof frame.dialogue === "object"
      ? frame.dialogue
      : {};
    targetState.dialogue = {
      ...currentDialogue,
      ...nextDialogue,
      active: targetState.scene === "dialogue",
    };
  }

  return targetState;
}

function stabilizeRestoredStateForPlay(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return targetState;
  }

  applyPersistenceSceneFrame(targetState, buildPersistenceSceneFrame(targetState));

  if (targetState.scene === "incident" && !targetState.currentIncident) {
    targetState.scene = targetState.clockOutSummary ? "clockout" : "outside";
  }

  if (targetState.scene === "clockout" && !targetState.clockOutSummary) {
    targetState.scene = targetState.currentIncident ? "incident" : "room";
  }

  if (targetState.scene === "plastic-surgery" && !targetState.plasticSurgeryEvent) {
    targetState.scene = "outside";
  }

  if (targetState.scene === "night-auto-sleep" && !targetState.nightAutoSleep?.pending) {
    targetState.scene = "room";
  }

  targetState.inputGate = createDefaultInputGateState();
  return targetState;
}

function serializeState(currentState = state, { reason = "render" } = {}) {
  const persistenceFrame = buildPersistenceSceneFrame(currentState);
  const currentWorldState = typeof syncWorldState === "function"
    ? syncWorldState(currentState)
    : (currentState.world || {});
  const activeJobs = currentState?.activeJobs instanceof Set
    ? [...currentState.activeJobs]
    : (Array.isArray(currentState?.activeJobs) ? [...currentState.activeJobs] : []);
  const seenIncidents = currentState?.seenIncidents instanceof Set
    ? [...currentState.seenIncidents]
    : (Array.isArray(currentState?.seenIncidents) ? [...currentState.seenIncidents] : []);
  const {
    dayOffers,
    nextDayShift,
    interviewResult,
    jobApplicationDoneToday,
    inputGate,
    ...serializableState
  } = currentState;
  applyPersistenceSceneFrame(serializableState, persistenceFrame);
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(currentState)
    : (currentState.jobs || {});
  const happinessState = typeof syncHappinessState === "function"
    ? syncHappinessState(currentState)
    : (currentState.happiness || {});
  const saveLocationId = String(
    persistenceFrame.worldPatch?.currentLocation
    || currentWorldState?.currentLocation
    || serializableState.world?.currentLocation
    || ""
  );

  return {
    version: SAVE_STATE_VERSION,
    savedAt: Date.now(),
    meta: {
      reason: String(reason || "render"),
      day: Math.max(1, Math.round(Number(currentState?.day) || 1)),
      scene: String(persistenceFrame.scene || serializableState.scene || "room"),
      locationId: saveLocationId,
      phoneView: String(persistenceFrame.phoneView || serializableState.phoneView || "home"),
    },
    state: {
      ...serializableState,
      jobs: {
        ...jobsState,
        dailyOffers: Array.isArray(jobsState.dailyOffers)
          ? jobsState.dailyOffers.map((offer) => ({ ...offer }))
          : [],
        scheduledShift: jobsState.scheduledShift?.offer
          ? {
              ...jobsState.scheduledShift,
              offer: { ...jobsState.scheduledShift.offer },
            }
          : null,
        interviewResult: jobsState.interviewResult?.offer
          ? {
              ...jobsState.interviewResult,
              offer: { ...jobsState.interviewResult.offer },
              lines: [...(jobsState.interviewResult.lines || [])],
            }
          : null,
        careerOffers: Array.isArray(jobsState.careerOffers)
          ? jobsState.careerOffers.map((offer) => ({
              ...offer,
              requiredCerts: [...(offer.requiredCerts || [])],
              requirementTags: [...(offer.requirementTags || [])],
              unmetRequirements: [...(offer.unmetRequirements || [])],
            }))
          : [],
        career: jobsState.career
          ? {
              ...jobsState.career,
              lastLines: [...(jobsState.career.lastLines || [])],
            }
          : null,
        careerPrep: { ...(jobsState.careerPrep || {}) },
        certifications: { ...(jobsState.certifications || {}) },
      },
      inventory: {
        ...(currentState.inventory || {}),
        items: Array.isArray(currentState.inventory?.items)
          ? currentState.inventory.items.map((item) => ({ ...item }))
          : [],
        equipped: { ...(currentState.inventory?.equipped || {}) },
      },
      casino: typeof syncCasinoState === "function"
        ? {
            ...syncCasinoState(currentState),
            exchangeDraft: { ...(currentState.casino?.exchangeDraft || {}) },
            blackjack: typeof syncCasinoBlackjackState === "function"
              ? syncCasinoBlackjackState(currentState.casino?.blackjack)
              : { ...(currentState.casino?.blackjack || {}) },
            slots: typeof syncCasinoSlotsState === "function"
              ? syncCasinoSlotsState(currentState.casino?.slots)
              : { ...(currentState.casino?.slots || {}) },
            scam: currentState.casino?.scam
              ? { ...(currentState.casino.scam || {}) }
              : null,
            lastResult: currentState.casino?.lastResult
              ? { ...(currentState.casino.lastResult || {}) }
              : null,
          }
        : {
            ...(currentState.casino || {}),
          },
      ownership: {
        ...(currentState.ownership || {}),
      },
      happiness: {
        ...(happinessState || {}),
      },
      appearance: {
        ...(currentState.appearance || {}),
        flags: { ...(currentState.appearance?.flags || {}) },
      },
      npcs: {
        ...(currentState.npcs || {}),
        relations: Object.fromEntries(
          Object.entries(currentState.npcs?.relations || {}).map(([npcId, relation]) => [
            npcId,
            {
              ...(relation || {}),
              flags: { ...(relation?.flags || {}) },
            },
          ])
        ),
      },
      activeJobs,
      seenIncidents,
    },
  };
}

function hydrateState(rawState = {}) {
  const nextState = createInitialState();
  const mergedState = {
    ...nextState,
    ...rawState,
  };

  mergedState.hasPhone = true;
  mergedState.activeJobs = new Set(Array.isArray(rawState.activeJobs) ? rawState.activeJobs : [...nextState.activeJobs]);
  mergedState.seenIncidents = new Set(Array.isArray(rawState.seenIncidents) ? rawState.seenIncidents : []);
  mergedState.jobVisits = { ...nextState.jobVisits, ...(rawState.jobVisits || {}) };
  mergedState.jobs = rawState.jobs && typeof rawState.jobs === "object"
    ? {
        ...nextState.jobs,
        ...rawState.jobs,
        dailyOffers: Array.isArray(rawState.dayOffers)
          ? rawState.dayOffers.map((offer) => ({ ...offer }))
          : (Array.isArray(rawState.jobs.dailyOffers)
            ? rawState.jobs.dailyOffers.map((offer) => ({ ...offer }))
            : [...(nextState.jobs.dailyOffers || [])].map((offer) => ({ ...offer }))),
        scheduledShift: rawState.nextDayShift?.offer
          ? {
              ...rawState.nextDayShift,
              offer: { ...rawState.nextDayShift.offer },
            }
          : (rawState.jobs.scheduledShift?.offer
            ? {
                ...rawState.jobs.scheduledShift,
                offer: { ...rawState.jobs.scheduledShift.offer },
              }
            : nextState.jobs.scheduledShift),
        interviewResult: rawState.interviewResult?.offer
          ? {
              ...rawState.interviewResult,
              offer: { ...rawState.interviewResult.offer },
              lines: [...(rawState.interviewResult.lines || [])],
            }
          : (rawState.jobs.interviewResult?.offer
            ? {
                ...rawState.jobs.interviewResult,
                offer: { ...rawState.jobs.interviewResult.offer },
                lines: [...(rawState.jobs.interviewResult.lines || [])],
              }
            : nextState.jobs.interviewResult),
        applicationDoneToday: typeof rawState.jobApplicationDoneToday === "boolean"
          ? rawState.jobApplicationDoneToday
          : Boolean(rawState.jobs.applicationDoneToday),
        careerOffers: Array.isArray(rawState.jobs.careerOffers)
          ? rawState.jobs.careerOffers.map((offer) => ({
              ...offer,
              requiredCerts: [...(offer.requiredCerts || [])],
              requirementTags: [...(offer.requirementTags || [])],
              unmetRequirements: [...(offer.unmetRequirements || [])],
            }))
          : [],
        career: rawState.jobs.career && typeof rawState.jobs.career === "object"
          ? {
              ...nextState.jobs.career,
              ...rawState.jobs.career,
              lastLines: [...(rawState.jobs.career.lastLines || [])],
            }
          : { ...nextState.jobs.career },
        careerPrep: { ...(nextState.jobs.careerPrep || {}), ...(rawState.jobs.careerPrep || {}) },
        certifications: { ...(nextState.jobs.certifications || {}), ...(rawState.jobs.certifications || {}) },
      }
    : {
        ...nextState.jobs,
        dailyOffers: Array.isArray(rawState.dayOffers)
          ? rawState.dayOffers.map((offer) => ({ ...offer }))
          : [],
        scheduledShift: rawState.nextDayShift?.offer
          ? {
              ...rawState.nextDayShift,
              offer: { ...rawState.nextDayShift.offer },
            }
          : nextState.jobs.scheduledShift,
        interviewResult: rawState.interviewResult?.offer
          ? {
              ...rawState.interviewResult,
              offer: { ...rawState.interviewResult.offer },
              lines: [...(rawState.interviewResult.lines || [])],
            }
          : nextState.jobs.interviewResult,
        applicationDoneToday: Boolean(rawState.jobApplicationDoneToday),
      };
  mergedState.currentOffer = rawState.currentOffer ? { ...rawState.currentOffer } : null;
  mergedState.currentIncident = rawState.currentIncident ? { ...rawState.currentIncident } : null;
  mergedState.jobMiniGame = rawState.jobMiniGame
    ? {
        ...rawState.jobMiniGame,
        items: Array.isArray(rawState.jobMiniGame.items)
          ? rawState.jobMiniGame.items.map((item) => ({ ...item }))
          : [],
      }
    : null;
  mergedState.jobMiniGameResult = rawState.jobMiniGameResult
    ? { ...rawState.jobMiniGameResult }
    : null;
  mergedState.clockOutSummary = rawState.clockOutSummary
    ? {
        ...rawState.clockOutSummary,
        offer: rawState.clockOutSummary.offer ? { ...rawState.clockOutSummary.offer } : null,
        sceneLines: [...(rawState.clockOutSummary.sceneLines || [])],
        resultLines: [...(rawState.clockOutSummary.resultLines || [])],
        memoryTags: [...(rawState.clockOutSummary.memoryTags || [])],
        changes: rawState.clockOutSummary.changes
          ? {
              ...rawState.clockOutSummary.changes,
              add: [...(rawState.clockOutSummary.changes.add || [])],
              remove: [...(rawState.clockOutSummary.changes.remove || [])],
            }
          : null,
      }
    : null;
  mergedState.lectureGig = rawState.lectureGig
    ? {
        ...rawState.lectureGig,
        tags: [...(rawState.lectureGig.tags || [])],
        introLines: [...(rawState.lectureGig.introLines || [])],
        resultLines: [...(rawState.lectureGig.resultLines || [])],
        backgroundConfig: rawState.lectureGig.backgroundConfig
          ? { ...rawState.lectureGig.backgroundConfig }
          : null,
      }
    : null;
  mergedState.lectureGigDay = Math.max(0, Math.round(Number(rawState.lectureGigDay) || 0));
  mergedState.romanceScene = rawState.romanceScene && typeof rawState.romanceScene === "object"
    ? (typeof cloneRomanceSceneSnapshot === "function"
      ? cloneRomanceSceneSnapshot(rawState.romanceScene)
      : {
          ...rawState.romanceScene,
          tags: [...(rawState.romanceScene.tags || [])],
          introLines: [...(rawState.romanceScene.introLines || [])],
          choices: Array.isArray(rawState.romanceScene.choices)
            ? rawState.romanceScene.choices.map((choice) => ({ ...(choice || {}) }))
            : [],
          backgroundConfig: rawState.romanceScene.backgroundConfig && typeof rawState.romanceScene.backgroundConfig === "object"
            ? { ...rawState.romanceScene.backgroundConfig }
            : null,
          playerActor: rawState.romanceScene.playerActor && typeof rawState.romanceScene.playerActor === "object"
            ? { ...rawState.romanceScene.playerActor }
            : null,
          npcActor: rawState.romanceScene.npcActor && typeof rawState.romanceScene.npcActor === "object"
            ? { ...rawState.romanceScene.npcActor }
            : null,
          })
    : null;
  mergedState.plasticSurgeryEvent = rawState.plasticSurgeryEvent && typeof rawState.plasticSurgeryEvent === "object"
    ? { ...rawState.plasticSurgeryEvent }
    : null;
  mergedState.romance = rawState.romance && typeof rawState.romance === "object"
    ? {
        activePlan: typeof normalizeRomancePlanSnapshot === "function"
          ? normalizeRomancePlanSnapshot(rawState.romance.activePlan)
          : rawState.romance.activePlan || null,
        activeScene: rawState.romance.activeScene && typeof rawState.romance.activeScene === "object"
          ? (typeof cloneRomanceSceneSnapshot === "function"
            ? cloneRomanceSceneSnapshot(rawState.romance.activeScene)
            : {
                ...rawState.romance.activeScene,
                tags: [...(rawState.romance.activeScene.tags || [])],
                introLines: [...(rawState.romance.activeScene.introLines || [])],
                choices: Array.isArray(rawState.romance.activeScene.choices)
                  ? rawState.romance.activeScene.choices.map((choice) => ({ ...(choice || {}) }))
                  : [],
                backgroundConfig: rawState.romance.activeScene.backgroundConfig && typeof rawState.romance.activeScene.backgroundConfig === "object"
                  ? { ...rawState.romance.activeScene.backgroundConfig }
                  : null,
                playerActor: rawState.romance.activeScene.playerActor && typeof rawState.romance.activeScene.playerActor === "object"
                  ? { ...rawState.romance.activeScene.playerActor }
                  : null,
                npcActor: rawState.romance.activeScene.npcActor && typeof rawState.romance.activeScene.npcActor === "object"
                  ? { ...rawState.romance.activeScene.npcActor }
                  : null,
              })
          : (mergedState.romanceScene
            ? (typeof cloneRomanceSceneSnapshot === "function"
              ? cloneRomanceSceneSnapshot(mergedState.romanceScene)
              : { ...mergedState.romanceScene })
            : null),
        lastOutcome: rawState.romance.lastOutcome && typeof rawState.romance.lastOutcome === "object"
          ? { ...rawState.romance.lastOutcome }
          : null,
      callScene: rawState.romance.callScene && typeof rawState.romance.callScene === "object"
          ? (typeof cloneRomanceCallSceneSnapshot === "function"
            ? cloneRomanceCallSceneSnapshot(rawState.romance.callScene)
            : {
                ...rawState.romance.callScene,
                lines: [...(rawState.romance.callScene.lines || [])],
                tags: [...(rawState.romance.callScene.tags || [])],
                choices: Array.isArray(rawState.romance.callScene.choices)
                  ? rawState.romance.callScene.choices.map((choice) => ({ ...(choice || {}) }))
                  : [],
              })
          : null,
        callSession: rawState.romance.callSession && typeof rawState.romance.callSession === "object"
          ? (typeof cloneRomanceCallSessionSnapshot === "function"
            ? cloneRomanceCallSessionSnapshot(rawState.romance.callSession)
            : {
                ...rawState.romance.callSession,
                beats: Array.isArray(rawState.romance.callSession.beats)
                  ? rawState.romance.callSession.beats.map((beat) => ({
                      ...(beat || {}),
                      lines: Array.isArray(beat?.lines) ? [...beat.lines] : [],
                      choices: Array.isArray(beat?.choices)
                        ? beat.choices.map((choice) => ({
                            ...(choice || {}),
                            responseLines: Array.isArray(choice?.responseLines) ? [...choice.responseLines] : [],
                          }))
                        : [],
                    }))
                  : [],
              })
          : null,
        girlfriendContactIds: Array.isArray(rawState.romance.girlfriendContactIds)
          ? rawState.romance.girlfriendContactIds.map((id) => String(id || "").trim()).filter(Boolean)
          : [],
      }
      : (typeof createDefaultRomanceDomainState === "function"
      ? createDefaultRomanceDomainState()
      : {
          activePlan: null,
          activeScene: mergedState.romanceScene
            ? (typeof cloneRomanceSceneSnapshot === "function"
              ? cloneRomanceSceneSnapshot(mergedState.romanceScene)
              : { ...mergedState.romanceScene })
            : null,
          lastOutcome: null,
          callScene: null,
          callSession: null,
          girlfriendContactIds: [],
        });
  if (typeof syncRomanceDomainState === "function") {
    syncRomanceDomainState(mergedState);
  }
  mergedState.ambientRomance = rawState.ambientRomance && typeof rawState.ambientRomance === "object"
    ? {
        ...rawState.ambientRomance,
        seenEventIds: Array.isArray(rawState.ambientRomance.seenEventIds)
          ? rawState.ambientRomance.seenEventIds.map((id) => String(id || "").trim()).filter(Boolean)
          : [],
        cooldownUntilDayByNpcId: rawState.ambientRomance.cooldownUntilDayByNpcId && typeof rawState.ambientRomance.cooldownUntilDayByNpcId === "object"
          ? { ...rawState.ambientRomance.cooldownUntilDayByNpcId }
          : {},
        followUpStateByNpcId: rawState.ambientRomance.followUpStateByNpcId && typeof rawState.ambientRomance.followUpStateByNpcId === "object"
          ? { ...rawState.ambientRomance.followUpStateByNpcId }
          : {},
      }
    : (typeof createDefaultAmbientRomanceState === "function"
      ? createDefaultAmbientRomanceState()
      : {
          seenEventIds: [],
          cooldownUntilDayByNpcId: {},
          followUpStateByNpcId: {},
          lastTriggerId: "",
          activeEventId: "",
        });
  if (typeof syncAmbientRomanceState === "function") {
    syncAmbientRomanceState(mergedState);
  }
  mergedState.socialScams = rawState.socialScams && typeof rawState.socialScams === "object"
    ? {
        ...rawState.socialScams,
        shownDay: Math.max(0, Math.round(Number(rawState.socialScams.shownDay) || 0)),
        activeEventId: String(rawState.socialScams.activeEventId || "").trim(),
        activeNpcId: String(rawState.socialScams.activeNpcId || "").trim(),
        seenEventIds: Array.isArray(rawState.socialScams.seenEventIds)
          ? rawState.socialScams.seenEventIds.map((id) => String(id || "").trim()).filter(Boolean)
          : [],
        cooldownUntilDayByEventId: rawState.socialScams.cooldownUntilDayByEventId
          && typeof rawState.socialScams.cooldownUntilDayByEventId === "object"
          ? { ...rawState.socialScams.cooldownUntilDayByEventId }
          : {},
        lastResult: rawState.socialScams.lastResult && typeof rawState.socialScams.lastResult === "object"
          ? {
              eventId: String(rawState.socialScams.lastResult.eventId || "").trim(),
              outcome: String(rawState.socialScams.lastResult.outcome || "").trim(),
              amount: Math.max(0, Math.round(Number(rawState.socialScams.lastResult.amount) || 0)),
              day: Math.max(0, Math.round(Number(rawState.socialScams.lastResult.day) || 0)),
            }
          : null,
      }
    : (typeof createDefaultSocialScamState === "function"
      ? createDefaultSocialScamState()
      : {
          shownDay: 0,
          activeEventId: "",
          activeNpcId: "",
          seenEventIds: [],
          cooldownUntilDayByEventId: {},
          lastResult: null,
        });
  if (typeof syncSocialScamState === "function") {
    syncSocialScamState(mergedState);
  }
  mergedState.lottoRetailer = rawState.lottoRetailer && typeof rawState.lottoRetailer === "object"
    ? {
        pendingTickets: Array.isArray(rawState.lottoRetailer.pendingTickets)
          ? rawState.lottoRetailer.pendingTickets.map((ticket, index) => normalizeLottoRetailerTicket(ticket, index, mergedState))
          : [],
        lastDrawSummary: rawState.lottoRetailer.lastDrawSummary && typeof rawState.lottoRetailer.lastDrawSummary === "object"
          ? {
              ...rawState.lottoRetailer.lastDrawSummary,
              lines: [...(rawState.lottoRetailer.lastDrawSummary.lines || [])],
            }
          : null,
        pickSession: normalizeLottoPickSession(rawState.lottoRetailer.pickSession, mergedState),
        dailyPurchaseDay: Math.max(0, Math.round(Number(rawState.lottoRetailer.dailyPurchaseDay) || 0)),
        dailyPurchaseCount: Math.max(0, Math.round(Number(rawState.lottoRetailer.dailyPurchaseCount) || 0)),
      }
    : createDefaultLottoRetailerState();
  mergedState.pendingTurnEvents = Array.isArray(rawState.pendingTurnEvents)
    ? rawState.pendingTurnEvents.map((entry, index) =>
        normalizeTurnBriefingEntry(entry, Number(entry?.day) || Number(mergedState.day) || 1, index)
      )
    : [];
  mergedState.turnBriefing = rawState.turnBriefing && typeof rawState.turnBriefing === "object"
    ? {
        day: Math.max(1, Math.round(Number(rawState.turnBriefing.day) || Number(mergedState.day) || 1)),
        currentIndex: Math.max(0, Math.round(Number(rawState.turnBriefing.currentIndex) || 0)),
        entries: Array.isArray(rawState.turnBriefing.entries)
          ? rawState.turnBriefing.entries.map((entry, index) =>
              normalizeTurnBriefingEntry(
                entry,
                Number(rawState.turnBriefing.day) || Number(mergedState.day) || 1,
                index,
              )
            )
          : [],
      }
    : null;
  mergedState.lastResult = rawState.lastResult
    ? { ...rawState.lastResult, lines: [...(rawState.lastResult.lines || [])] }
    : null;
  mergedState.endingSummary = rawState.endingSummary
    ? {
        ...rawState.endingSummary,
        lines: [...(rawState.endingSummary.lines || [])],
        rank: rawState.endingSummary.rank ? { ...rawState.endingSummary.rank } : null,
      }
    : null;
  mergedState.cleaningGame = rawState.cleaningGame
    ? {
        ...rawState.cleaningGame,
        items: Array.isArray(rawState.cleaningGame.items)
          ? rawState.cleaningGame.items.map((item) => ({ ...item }))
          : [],
      }
    : null;
  if (rawState.startingOrigin && typeof rawState.startingOrigin === "object") {
    const rawOriginTierId = String(rawState.startingOrigin.tierId || "").trim().toLowerCase();
    const startingOriginDefaults = rawOriginTierId && typeof createAppliedSpoonStartState === "function"
      ? createAppliedSpoonStartState(rawOriginTierId)
      : (typeof createDefaultSpoonStartState === "function"
        ? createDefaultSpoonStartState()
        : {});
    mergedState.startingOrigin = {
      ...startingOriginDefaults,
      ...rawState.startingOrigin,
      starterAssetIds: Array.isArray(rawState.startingOrigin.starterAssetIds)
        ? [...rawState.startingOrigin.starterAssetIds]
        : [...(startingOriginDefaults.starterAssetIds || [])],
    };
  } else {
    mergedState.startingOrigin = typeof createDefaultSpoonStartState === "function"
      ? createDefaultSpoonStartState()
      : { tierId: "", label: "", bracket: "", summary: "", toneLabel: "", initialCash: 0, walletCash: 0, bankBalance: 0, starterAssetIds: [], starterVehicleId: "", safetyNetLevel: "none", startHappiness: 45, accent: "#94a3b8", applied: false };
  }
  mergedState.phonePreview = rawState.phonePreview
    ? { ...nextState.phonePreview, ...rawState.phonePreview }
    : createPhoneHomePreview(mergedState.day, mergedState);
  mergedState.phoneAppStatus = rawState.phoneAppStatus && typeof rawState.phoneAppStatus === "object"
    ? Object.fromEntries(Object.entries(rawState.phoneAppStatus).map(([key, value]) => [key, { ...(value || {}) }]))
    : {};
  mergedState.casino = rawState.casino && typeof rawState.casino === "object"
    ? {
        ...(typeof createDefaultCasinoState === "function" ? createDefaultCasinoState() : {}),
        ...rawState.casino,
        exchangeDraft: {
          ...((typeof createDefaultCasinoState === "function" ? createDefaultCasinoState().exchangeDraft : {}) || {}),
          ...(rawState.casino.exchangeDraft || {}),
        },
        blackjack: typeof syncCasinoBlackjackState === "function"
          ? syncCasinoBlackjackState(rawState.casino.blackjack)
          : { ...(rawState.casino.blackjack || {}) },
        slots: typeof syncCasinoSlotsState === "function"
          ? syncCasinoSlotsState(rawState.casino.slots)
          : { ...(rawState.casino.slots || {}) },
        scam: rawState.casino.scam && typeof rawState.casino.scam === "object"
          ? { ...(rawState.casino.scam || {}) }
          : { ...((typeof createDefaultCasinoState === "function" ? createDefaultCasinoState().scam : {}) || {}) },
        lastResult: rawState.casino.lastResult
          ? { ...(rawState.casino.lastResult || {}) }
          : null,
      }
    : (typeof createDefaultCasinoState === "function" ? createDefaultCasinoState() : null);
  mergedState.inventory = rawState.inventory && typeof rawState.inventory === "object"
    ? {
        ...nextState.inventory,
        ...rawState.inventory,
        items: Array.isArray(rawState.inventory.items)
          ? rawState.inventory.items.map((item) => ({ ...item }))
          : [...(nextState.inventory.items || [])].map((item) => ({ ...item })),
        equipped: { ...(nextState.inventory.equipped || {}), ...(rawState.inventory.equipped || {}) },
      }
    : {
        ...nextState.inventory,
        items: [...(nextState.inventory.items || [])].map((item) => ({ ...item })),
        equipped: { ...(nextState.inventory.equipped || {}) },
      };
  mergedState.ownership = rawState.ownership && typeof rawState.ownership === "object"
    ? { ...nextState.ownership, ...rawState.ownership }
    : { ...nextState.ownership };
  mergedState.happiness = rawState.happiness && typeof rawState.happiness === "object"
    ? { ...nextState.happiness, ...rawState.happiness }
    : { ...nextState.happiness };
  mergedState.appearance = rawState.appearance && typeof rawState.appearance === "object"
    ? {
        ...nextState.appearance,
        ...rawState.appearance,
        flags: { ...(nextState.appearance?.flags || {}), ...(rawState.appearance.flags || {}) },
      }
    : {
        ...nextState.appearance,
        flags: { ...(nextState.appearance?.flags || {}) },
      };
  mergedState.npcs = rawState.npcs && typeof rawState.npcs === "object"
    ? {
        ...nextState.npcs,
        ...rawState.npcs,
        relations: Object.fromEntries(
          Object.entries(rawState.npcs.relations || {}).map(([npcId, relation]) => [
            npcId,
            {
              ...(relation || {}),
              flags: { ...(relation?.flags || {}) },
            },
          ])
        ),
      }
    : {
        ...nextState.npcs,
        relations: Object.fromEntries(
          Object.entries(nextState.npcs?.relations || {}).map(([npcId, relation]) => [
            npcId,
            {
              ...(relation || {}),
              flags: { ...(relation?.flags || {}) },
            },
          ])
        ),
      };
  mergedState.world = {
    ...nextState.world,
    ...(rawState.world || {}),
  };
  mergedState.phoneView = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(rawState.phoneView || nextState.phoneView)
    : (rawState.phoneView || nextState.phoneView);
  mergedState.disSearchQuery = typeof rawState.disSearchQuery === "string"
    ? rawState.disSearchQuery
    : nextState.disSearchQuery;
  mergedState.disCommunity = rawState.disCommunity && typeof rawState.disCommunity === "object"
    ? {
        ...((typeof createDefaultDisCommunityState === "function"
          ? createDefaultDisCommunityState()
          : {
              selectedPostId: "",
              draft: { author: "", title: "", content: "" },
              commentDraft: { author: "", content: "" },
            })),
        ...rawState.disCommunity,
        draft: {
          ...((typeof createDefaultDisCommunityState === "function"
            ? createDefaultDisCommunityState().draft
            : { author: "", title: "", content: "" })),
          ...(rawState.disCommunity.draft || {}),
        },
        commentDraft: {
          ...((typeof createDefaultDisCommunityState === "function"
            ? createDefaultDisCommunityState().commentDraft
            : { author: "", content: "" })),
          ...(rawState.disCommunity.commentDraft || {}),
        },
      }
    : (typeof createDefaultDisCommunityState === "function"
      ? createDefaultDisCommunityState()
      : {
          selectedPostId: "",
          draft: { author: "", title: "", content: "" },
          commentDraft: { author: "", content: "" },
        });
  mergedState.disGambleDrafts = rawState.disGambleDrafts && typeof rawState.disGambleDrafts === "object"
    ? {
        "odd-even": String(rawState.disGambleDrafts["odd-even"] ?? nextState.disGambleDrafts["odd-even"] ?? "1000"),
        ladder: String(rawState.disGambleDrafts.ladder ?? nextState.disGambleDrafts.ladder ?? "5000"),
      }
    : { ...(nextState.disGambleDrafts || { "odd-even": "1000", ladder: "5000" }) };
  mergedState.headline = { ...nextState.headline, ...(rawState.headline || {}) };
  mergedState.prologueIntro = rawState.prologueIntro && typeof rawState.prologueIntro === "object"
    ? { ...nextState.prologueIntro, ...rawState.prologueIntro }
    : { ...nextState.prologueIntro };
  mergedState.timeSlot = Number.isFinite(rawState.timeSlot)
    ? rawState.timeSlot
    : getDefaultTimeSlotForState(mergedState);
  mergedState.timeMinuteOffset = Number.isFinite(rawState.timeMinuteOffset)
    ? Math.max(0, Math.min(29, Math.round(rawState.timeMinuteOffset)))
    : 0;

  if (typeof syncPhoneSessionState === "function") {
    syncPhoneSessionState(mergedState);
  }

  if (typeof syncDisCommunityState === "function") {
    syncDisCommunityState(mergedState);
  }

  if (typeof syncJobsDomainState === "function") {
    syncJobsDomainState(mergedState);
  }

  if (typeof syncBankDomainState === "function") {
    syncBankDomainState(mergedState);
  }

  if (typeof syncDialogueState === "function") {
    syncDialogueState(mergedState);
  }

  if (typeof syncMemoryState === "function") {
    syncMemoryState(mergedState);
  }

  if (typeof syncInventoryState === "function") {
    syncInventoryState(mergedState);
  }

  if (typeof syncOwnershipState === "function") {
    syncOwnershipState(mergedState);
  }

  if (typeof syncMetaRunState === "function") {
    syncMetaRunState(mergedState);
  }

  if (typeof syncHappinessState === "function") {
    syncHappinessState(mergedState);
  }

  if (typeof syncAppearanceState === "function") {
    syncAppearanceState(mergedState);
  }

  if (typeof syncNpcState === "function") {
    syncNpcState(mergedState);
  }

  stabilizeRestoredStateForPlay(mergedState);
  syncWorldState(mergedState);
  syncPrologueIntroState(mergedState);
  syncInputGateState(mergedState);
  recoverStaleInputGate(mergedState, { force: true, reason: "hydrate-reset" });

  return mergedState;
}

function getCareerRouteHintLabel(routeId = "") {
  switch (String(routeId || "").trim().toLowerCase()) {
    case "ai":
      return "AI 루트";
    case "electronics":
      return "전자공학 루트";
    case "management":
      return "경영 루트";
    case "finance":
      return "금융 루트";
    default:
      return "";
  }
}

function createCareerRouteHintSnapshot(targetState = state, buildObjective = null) {
  if (!targetState || typeof targetState !== "object" || typeof buildObjective !== "function") {
    return null;
  }

  const routeProgress = typeof getCareerRouteProgress === "function"
    ? getCareerRouteProgress(targetState)
    : {};
  let routeId = String(routeProgress.activeRouteId || "").trim().toLowerCase();

  if (!routeId && (routeProgress.aiStudyBookPublished || routeProgress.aiDepartmentEstablished)) {
    routeId = "ai";
  }

  if (!routeId || routeId !== "ai" || !routeProgress.aiStudyBookPublished) {
    return null;
  }

  const routeLabel = String(routeProgress.activeRouteLabel || getCareerRouteHintLabel(routeId)).trim();
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : (targetState.jobs || {});
  const career = jobsState?.career || null;
  const certifications = typeof getCareerCertificationSnapshotForState === "function"
    ? getCareerCertificationSnapshotForState(targetState)
    : {
        driverLicense: false,
        computerCert: false,
        universityDegree: false,
      };
  const prepState = typeof getCareerPrepSnapshotForState === "function"
    ? getCareerPrepSnapshotForState(targetState)
    : {
        service: 0,
        labor: 0,
        office: 0,
        academic: 0,
      };
  const hasSuit = typeof hasEquippedInventoryItem === "function"
    ? hasEquippedInventoryItem("outfit-suit", targetState)
    : false;
  const careerOffers = typeof buildCareerOffersForState === "function"
    ? buildCareerOffersForState(targetState)
    : (Array.isArray(jobsState?.careerOffers) ? jobsState.careerOffers : []);
  const aiOffer = Array.isArray(careerOffers)
    ? careerOffers.find((offer) => String(offer?.id || "").trim() === "ai-researcher") || null
    : null;
  const activePostingId = typeof getCareerEmploymentPostingId === "function"
    ? getCareerEmploymentPostingId(targetState)
    : "";

  if (!routeProgress.aiDepartmentEstablished) {
    return buildObjective({
      appId: "jobs",
      prompt: "대학가에서 인공지능학과를 찾아보자.",
      title: "AI 루트 힌트",
      body: "도서관에서 만든 AI 서적 덕분에 대학가에서 새 학과 이야기가 돌고 있다. 다음엔 인공지능학과를 직접 찾아가자.",
      tone: "PREP",
      routeLabel,
    });
  }

  if (!certifications.universityDegree) {
    if ((prepState.academic || 0) < 2) {
      return buildObjective({
        appId: "jobs",
        prompt: "대학가에서 학업 준비를 더 쌓자.",
        title: "AI 루트 힌트",
        body: "인공지능학과 루트를 탄 만큼 학업 준비를 더 모아야 한다. 대학가에서 공부를 이어 가며 졸업 심사 단계까지 올리자.",
        tone: "PREP",
        routeLabel,
      });
    }

    return buildObjective({
      appId: "jobs",
      prompt: "대학가에서 졸업 심사를 받아보자.",
      title: "AI 루트 힌트",
      body: "이제 대학 졸업장을 챙길 타이밍이다. 졸업 조건을 마무리해야 연구직 문이 열린다.",
      tone: "PREP",
      routeLabel,
    });
  }

  if (!certifications.computerCert) {
    return buildObjective({
      appId: "jobs",
      prompt: "시험장에서 컴퓨터 자격증을 챙기자.",
      title: "AI 루트 힌트",
      body: "AI 연구원 조건에는 컴퓨터 자격증도 포함된다. 시험장으로 가서 자격증을 먼저 확보하자.",
      tone: "PREP",
      routeLabel,
    });
  }

  if (!hasSuit) {
    return buildObjective({
      appId: "market",
      prompt: "호박마켓에서 정장을 챙기자.",
      title: "AI 루트 힌트",
      body: "연구직 면접은 복장까지 본다. 호박마켓에서 정장을 마련해 두면 다음 단계가 열린다.",
      tone: "GEAR",
      routeLabel,
    });
  }

  if (activePostingId === "ai-researcher") {
    return buildObjective({
      appId: "jobs",
      prompt: "AI 연구원 기본금과 근무를 굴려 자산을 늘리자.",
      title: "AI 루트 힌트",
      body: "이미 AI 연구원으로 들어갔다. 기본금과 근무 수익을 안정적으로 굴리면서 다음 자산 루프를 만들자.",
      tone: "CAREER",
      routeLabel,
    });
  }

  if (career?.status === "employed") {
    return buildObjective({
      appId: "jobs",
      prompt: "지금 루프를 정리하고 AI 연구원 지원 타이밍을 보자.",
      title: "AI 루트 힌트",
      body: "현재 직장을 굴리면서도 AI 루트 준비는 이어 갈 수 있다. 타이밍이 오면 공고 앱에서 연구직으로 넘어가자.",
      tone: "CAREER",
      routeLabel,
    });
  }

  if (aiOffer?.eligible && (Number(aiOffer.successChance) || 0) > 0) {
    return buildObjective({
      appId: "jobs",
      prompt: "공고 앱에서 AI 연구원에 지원하자.",
      title: "AI 루트 힌트",
      body: "연구원 조건을 거의 다 갖췄다. 공고 앱으로 가서 AI 연구원 채용에 바로 지원하자.",
      tone: "CAREER",
      routeLabel,
    });
  }

  if (aiOffer) {
    const firstGate = aiOffer.unmetRequirements?.[0]
      || aiOffer.requirementTags?.[0]
      || "AI 연구원 준비";
    return buildObjective({
      appId: "jobs",
      prompt: `${firstGate}부터 채우자.`,
      title: "AI 루트 힌트",
      body: `AI 연구원으로 가려면 먼저 ${firstGate}을(를) 갖춰야 한다. 부족한 조건부터 하나씩 정리하자.`,
      tone: "PREP",
      routeLabel,
    });
  }

  return buildObjective({
    appId: "jobs",
    prompt: "도서관과 대학가를 오가며 AI 준비를 더 쌓자.",
    title: "AI 루트 힌트",
    body: "AI 루트는 학과 개방, 졸업, 자격증, 정장, 연구직 지원 순서로 이어진다. 아직 비어 있는 준비를 계속 채우자.",
    tone: "PREP",
    routeLabel,
  });
}

function createGameplayObjectiveSnapshot(targetState = null) {
  if (!targetState || typeof targetState !== "object") {
    return null;
  }

  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : (targetState.jobs || {});
  const shiftUi = typeof getScheduledShiftUiModel === "function"
    ? getScheduledShiftUiModel(targetState)
    : null;
  const career = jobsState?.career || null;
  const interviewResult = jobsState?.interviewResult && jobsState.interviewResult.day === targetState.day
    ? jobsState.interviewResult
    : null;
  const liquidFunds = typeof getTotalLiquidFunds === "function"
    ? getTotalLiquidFunds(targetState)
    : (
      (typeof getWalletBalance === "function" ? getWalletBalance(targetState) : Math.max(0, Number(targetState.money) || 0))
      + Math.max(0, Number(targetState.bank?.balance) || 0)
    );
  const certifications = typeof getCareerCertificationSnapshotForState === "function"
    ? getCareerCertificationSnapshotForState(targetState)
    : {
        driverLicense: false,
        computerCert: false,
        universityDegree: false,
      };
  const prepState = typeof getCareerPrepSnapshotForState === "function"
    ? getCareerPrepSnapshotForState(targetState)
    : {
        service: 0,
        labor: 0,
        office: 0,
        academic: 0,
      };
  const hasSuit = typeof hasEquippedInventoryItem === "function"
    ? hasEquippedInventoryItem("outfit-suit", targetState)
    : false;

  const buildObjective = ({
    appId = "",
    prompt = "",
    title = "",
    body = "",
    tone = "NOW",
    routeLabel = "",
  } = {}) => ({
    appId,
    prompt: String(prompt || title || "").trim(),
    title: String(title || prompt || "").trim(),
    body: String(body || "").trim(),
    tone: String(tone || "NOW").trim().toUpperCase(),
    routeLabel: String(routeLabel || "").trim(),
  });

  if (targetState.clockOutSummary) {
    const romanceRoomEvent = typeof getTodayRomanceRoomEvent === "function"
      ? getTodayRomanceRoomEvent(targetState)
      : null;
    if (romanceRoomEvent) {
      return buildObjective({
        appId: "call",
        prompt: romanceRoomEvent.sceneType === "home-invite" ? "집 초대 준비" : `${romanceRoomEvent.label} 약속`,
        title: romanceRoomEvent.title,
        body: romanceRoomEvent.lines?.[1] || romanceRoomEvent.lines?.[0] || "",
        tone: romanceRoomEvent.sceneType === "home-invite" ? "HOME" : "DATE",
      });
    }

    return buildObjective({
      appId: "jobs",
      prompt: "퇴근 정산 확인",
      title: "오늘 근무 정산 받기",
      body: "퇴근 화면에서 정산을 눌러 급여와 결과를 확정하자.",
      tone: "PAY",
    });
  }

  if (shiftUi) {
    if (shiftUi.phase === "missed") {
      return buildObjective({
        appId: "jobs",
        prompt: "결근 처리하기",
        title: `${shiftUi.job?.title || "예약 근무"} 결과 정리`,
        body: `${shiftUi.workplaceLabel || "근무지"} 출근 시간을 놓쳤다. 공고 앱이나 현장에서 결근 처리를 마무리하자.`,
        tone: "ALERT",
      });
    }

    if (shiftUi.canStart) {
      return buildObjective({
        appId: "jobs",
        prompt: `${shiftUi.workplaceLabel || "근무지"} 출근`,
        title: `${shiftUi.job?.title || "예약 근무"} 시작`,
        body: `${shiftUi.workplaceLabel || "근무지"}에 도착했다. 지금 출근해서 이번 턴 수입을 챙기자.`,
        tone: "SHIFT",
      });
    }

    if (shiftUi.canWait) {
      return buildObjective({
        appId: "jobs",
        prompt: `${shiftUi.workplaceLabel || "근무지"} 현장 대기`,
        title: `${shiftUi.job?.title || "예약 근무"} 출근 대기`,
        body: `${shiftUi.workplaceLabel || "근무지"}에 먼저 도착했다. 출근 시간까지 기다렸다가 바로 시작하자.`,
        tone: "SHIFT",
      });
    }

    if (shiftUi.needsTravel) {
      return buildObjective({
        appId: "jobs",
        prompt: `${shiftUi.workplaceLabel || "근무지"}로 이동`,
        title: `${shiftUi.job?.title || "예약 근무"} 출근 준비`,
        body: `${shiftUi.workplaceLabel || "근무지"}에 가야 오늘 근무를 시작할 수 있다.`,
        tone: "SHIFT",
      });
    }
  }

  if (interviewResult) {
    return buildObjective({
      appId: "jobs",
      prompt: "알바 결과 확인",
      title: `${interviewResult.offer?.title || "알바"} 결과 보기`,
      body: "오늘 지원 결과가 나왔다. 공고 앱에서 확인하고 다음 턴 계획을 다시 세우자.",
      tone: "RESULT",
    });
  }

  if (career?.lastOutcomeDay === targetState.day) {
    return buildObjective({
      appId: "jobs",
      prompt: "직장 면접 결과 확인",
      title: career.lastOutcome === "employed" ? "취직 성공" : "면접 결과 확인",
      body: career.lastOutcome === "employed"
        ? "재직 루프가 열렸다. 이제 출근과 자산 성장을 같이 굴리자."
        : "이번 면접 결과가 나왔다. 부족한 조건을 채우고 다시 지원하자.",
      tone: career.lastOutcome === "employed" ? "PASS" : "FAIL",
    });
  }

  if (career?.status === "applied" && Number.isFinite(career.resultDay) && career.resultDay > targetState.day) {
    return buildObjective({
      appId: "jobs",
      prompt: "면접 결과 기다리기",
      title: `${typeof formatTurnLabel === "function" ? formatTurnLabel(career.resultDay) : `${career.resultDay}턴`} 결과 대기`,
      body: "결과가 나올 때까지는 알바로 돈을 벌고 필요한 조건을 더 챙기며 다음 턴을 준비하자.",
      tone: "WAIT",
    });
  }

  if (career?.status === "employed") {
    const lectureGig = typeof getHomeLectureGigDefinition === "function"
      ? getHomeLectureGigDefinition(targetState)
      : null;
    if (lectureGig && canHostHomeLectureGig(targetState)) {
      return buildObjective({
        appId: "jobs",
        prompt: "\uC9D1\uC5D0\uC11C \uAC15\uC5F0 \uD558\uAE30",
        title: lectureGig.objectiveTitle || lectureGig.title,
        body: lectureGig.objectiveBody || `${lectureGig.title}\uC73C\uB85C ${lectureGig.payoutRangeLabel} \uC218\uC775\uC744 \uB0BC \uC900\uBE44\uAC00 \uB418\uC5C8\uB2E4.`,
        tone: "BONUS",
      });
    }
  }

  if (false && career?.status === "employed" && !createCareerRouteHintSnapshot(targetState, buildObjective)) {
    const lectureGig = typeof getHomeLectureGigDefinition === "function"
      ? getHomeLectureGigDefinition(targetState)
      : null;
    if (lectureGig && canHostHomeLectureGig(targetState)) {
      return buildObjective({
        appId: "jobs",
        prompt: "집에서 강연 열기",
        title: lectureGig.objectiveTitle || lectureGig.title,
        body: lectureGig.objectiveBody || `${lectureGig.title}을 열어 ${lectureGig.payoutRangeLabel} 수준의 사례비를 노릴 수 있다.`,
        tone: "BONUS",
      });
    }

    return buildObjective({
      appId: "jobs",
      prompt: "재직 유지하며 자산 늘리기",
      title: "직장 루프 굴리기",
      body: "정기 출근을 놓치지 말고, 남는 돈은 은행과 호박마켓으로 굴려 격차를 벌리자.",
      tone: "CAREER",
    });
  }

  const romanceRoomEvent = typeof getTodayRomanceRoomEvent === "function"
    ? getTodayRomanceRoomEvent(targetState)
    : null;
  if (romanceRoomEvent) {
    return buildObjective({
      appId: "call",
      prompt: romanceRoomEvent.sceneType === "home-invite" ? "집 초대 준비" : `${romanceRoomEvent.label} 약속`,
      title: romanceRoomEvent.title,
      body: romanceRoomEvent.lines?.[1] || romanceRoomEvent.lines?.[0] || "",
      tone: romanceRoomEvent.sceneType === "home-invite" ? "HOME" : "DATE",
    });
  }

  return createCareerRouteHintSnapshot(targetState, buildObjective);

  if (liquidFunds < 50000) {
    return buildObjective({
      appId: "jobs",
      prompt: "오늘 돈 벌기",
      title: "이번 턴 생활비 만들기",
      body: "지금은 스펙보다 현금이 급하다. 공고 앱에서 알바를 잡아 오늘 쓸 돈부터 마련하자.",
      tone: "CASH",
    });
  }

  if (!certifications.universityDegree) {
    if ((prepState.academic || 0) < 2) {
      return buildObjective({
        appId: "jobs",
        prompt: "대학가에서 공부하기",
        title: "졸업 심사 준비하기",
        body: "도서관이나 캠퍼스에서 공부를 쌓아 학업 준비 2를 만든 뒤 졸업 심사를 받자.",
        tone: "PREP",
      });
    }

    return buildObjective({
      appId: "jobs",
      prompt: "대학가에서 졸업 심사 받기",
      title: "대학 졸업장 챙기기",
      body: "졸업장을 따야 사무직과 연구직 지원 루트가 더 안정적으로 열린다.",
      tone: "PREP",
    });
  }

  if (!certifications.computerCert && Math.max(prepState.office || 0, prepState.academic || 0) >= 1) {
    return buildObjective({
      appId: "jobs",
      prompt: "시험장에서 컴퓨터 자격증 보기",
      title: "컴퓨터 자격증 챙기기",
      body: "사무직과 연구직 지원 전에 컴퓨터 자격을 따두면 조건을 맞추기 쉬워진다.",
      tone: "PREP",
    });
  }

  if (!hasSuit && Math.max(prepState.office || 0, prepState.academic || 0) >= 2) {
    return buildObjective({
      appId: "market",
      prompt: "호박마켓에서 정장 사기",
      title: "면접 복장 준비하기",
      body: "정장 세트를 챙겨두면 사무직과 연구직 면접 조건을 맞추고 합격 확률도 올릴 수 있다.",
      tone: "GEAR",
    });
  }

  const careerOffers = typeof buildCareerOffersForState === "function"
    ? buildCareerOffersForState(targetState)
    : (Array.isArray(jobsState?.careerOffers) ? jobsState.careerOffers : []);
  const sortedCareerOffers = [...careerOffers].sort((left, right) => {
    const leftChance = Number(left?.successChance) || 0;
    const rightChance = Number(right?.successChance) || 0;
    if (rightChance !== leftChance) {
      return rightChance - leftChance;
    }
    return (right?.unmetRequirements?.length || 0) - (left?.unmetRequirements?.length || 0);
  });
  const availableCareerOffer = sortedCareerOffers.find((offer) => (Number(offer?.successChance) || 0) > 0);

  if (!jobsState?.careerApplicationDoneToday && availableCareerOffer) {
    return buildObjective({
      appId: "jobs",
      prompt: `공고 앱에서 ${availableCareerOffer.title} 지원하기`,
      title: "직장 지원 넣기",
      body: `${availableCareerOffer.title} 지원 조건이 갖춰졌다. 이번 턴에 바로 지원하고 다음 턴 결과를 기다리자.`,
      tone: "CAREER",
    });
  }

  if (!jobsState?.careerApplicationDoneToday && sortedCareerOffers[0]) {
    const blockedOffer = sortedCareerOffers[0];
    const firstGate = blockedOffer.unmetRequirements?.[0]
      || blockedOffer.requirementTags?.[0]
      || "준비";
    return buildObjective({
      appId: "jobs",
      prompt: "부족한 조건 채우기",
      title: `${blockedOffer.title} 준비하기`,
      body: `${blockedOffer.title}에 가려면 먼저 ${firstGate}부터 챙겨야 한다.`,
      tone: "PREP",
    });
  }

  return buildObjective({
    appId: "jobs",
    prompt: "돈 벌고 다음 준비 하기",
    title: "알바와 준비를 함께 굴리기",
    body: "알바로 현금을 만들고, 대학가와 시험장에서 다음 직장 조건도 같이 채워두자.",
    tone: "NOW",
  });
}

function createPhoneHomePreview(day = 1, targetState = null) {
  const objective = createGameplayObjectiveSnapshot(targetState);
  if (objective) {
    return {
      appId: objective.appId || "",
      kicker: objective.routeLabel ? "HINT" : "GOAL",
      state: objective.tone || "NOW",
      title: objective.title || `${typeof formatTurnLabel === "function" ? formatTurnLabel(day) : `${day}턴`} 목표`,
      body: objective.body || objective.prompt || "",
    };
  }

  return {
    appId: "",
    kicker: "HOME",
    state: "READY",
    title: `${typeof formatTurnLabel === "function" ? formatTurnLabel(day) : `${day}턴`} 스마트폰`,
    body: "Diggle, 뉴스, 플레이스토어, 전화, 갤러리를 바로 열 수 있다.",
  };
}

function createPhoneResultPreview(appId, kicker, title, body) {
  return {
    appId,
    kicker,
    state: "DONE",
    title,
    body,
  };
}

function getPhoneAppStatus(appId, targetState = state) {
  if (!targetState?.phoneAppStatus || typeof targetState.phoneAppStatus !== "object") {
    return null;
  }

  const normalizedAppId = typeof normalizePhoneAppId === "function"
    ? normalizePhoneAppId(appId)
    : String(appId || "");

  return normalizedAppId && targetState.phoneAppStatus[normalizedAppId]
    ? { ...targetState.phoneAppStatus[normalizedAppId] }
    : null;
}

function setPhoneAppStatus(appId, nextStatus = {}, targetState = state) {
  if (!targetState) {
    return null;
  }

  const normalizedAppId = typeof normalizePhoneAppId === "function"
    ? normalizePhoneAppId(appId)
    : String(appId || "");

  if (!normalizedAppId) {
    return null;
  }

  targetState.phoneAppStatus = {
    ...(targetState.phoneAppStatus || {}),
    [normalizedAppId]: {
      ...(nextStatus || {}),
    },
  };

  return getPhoneAppStatus(normalizedAppId, targetState);
}

function canUsePhoneApps(targetState = state) {
  const interactivePrologueStep = typeof getInteractivePrologueStepConfig === "function"
    ? getInteractivePrologueStepConfig(targetState)
    : null;

  if (interactivePrologueStep) {
    return true;
  }

  return !["prologue", "cleanup"].includes(targetState.scene);
}

function canOpenPhoneStage(targetState = state) {
  const interactivePrologueStep = typeof getInteractivePrologueStepConfig === "function"
    ? getInteractivePrologueStepConfig(targetState)
    : null;
  const canExpandInScene = ["room", "outside", "board"].includes(targetState.scene) || Boolean(interactivePrologueStep);

  return Boolean(
    targetState.hasPhone
    && !targetState.phoneMinimized
    && canUsePhoneApps(targetState)
    && canExpandInScene,
  );
}

function canApplyForJobOffer(targetState = state) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : createDefaultJobsState();

  return Boolean(
    targetState?.hasPhone
    && canUsePhoneApps(targetState)
    && !jobsState.applicationDoneToday
    && jobsState?.career?.status !== "employed"
    && !jobsState.scheduledShift,
  );
}

function canApplyForCareerOffer(targetState = state) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : null;
  const careerStatus = jobsState?.career?.status || "idle";

  return Boolean(
    targetState?.hasPhone
    && canUsePhoneApps(targetState)
    && !(jobsState?.careerApplicationDoneToday)
    && !["applied", "employed"].includes(careerStatus),
  );
}

function getShortTermOfferEligibility(offer = null, targetState = state) {
  if (typeof evaluateShortTermJobOfferEligibility === "function") {
    return evaluateShortTermJobOfferEligibility(offer, targetState);
  }

  return {
    eligible: true,
    requirementTags: [],
    unmetRequirements: [],
  };
}

function getShortTermOfferBlockedMessage(offer = null, targetState = state) {
  const eligibility = getShortTermOfferEligibility(offer, targetState);
  return eligibility.eligible
    ? ""
    : (eligibility.unmetRequirements[0] || "지원 조건");
}

function getScheduledShiftForToday(targetState = state) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : targetState?.jobs;
  const scheduledShift = jobsState?.scheduledShift || null;

  if (!scheduledShift || scheduledShift.day !== targetState.day) {
    return null;
  }

  return scheduledShift;
}

function cloneOfferSnapshot(offer) {
  return offer
    ? {
        jobId: offer.jobId || "",
        careerPostingId: offer.careerPostingId || "",
        title: offer.title || "",
        emoji: offer.emoji || "",
        tone: offer.tone || "",
        category: offer.category || "",
        pay: offer.pay,
        shiftStartSlot: offer.shiftStartSlot,
        shiftDurationSlots: offer.shiftDurationSlots,
      }
    : null;
}

function getOfferShiftTiming(offer) {
  if (!offer) {
    return null;
  }

  const startSlot = Number.isFinite(offer.shiftStartSlot) ? offer.shiftStartSlot : DAY_START_TIME_SLOT;
  const durationSlots = Number.isFinite(offer.shiftDurationSlots) ? offer.shiftDurationSlots : 8;

  return {
    startSlot,
    durationSlots,
    endSlot: startSlot + durationSlots,
  };
}

function getScheduledShiftStatus(targetState = state) {
  const scheduledShift = getScheduledShiftForToday(targetState);
  if (!scheduledShift) {
    return null;
  }

  const timing = getOfferShiftTiming(scheduledShift.offer);
  return {
    ...timing,
    scheduledShift,
    waiting: targetState.timeSlot < timing.startSlot,
    active: targetState.timeSlot >= timing.startSlot && targetState.timeSlot < timing.endSlot,
    missed: targetState.timeSlot >= timing.endSlot,
  };
}

function getCareerEmploymentPostingId(targetState = state) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : null;
  const career = jobsState?.career || null;

  if (career?.status !== "employed") {
    return "";
  }

  return String(career.employedJobId || career.postingId || "").trim();
}

function buildCareerShiftForState(targetState = state) {
  const postingId = getCareerEmploymentPostingId(targetState);
  if (!postingId || typeof createCareerShiftOffer !== "function") {
    return null;
  }

  const offer = createCareerShiftOffer(postingId, targetState);
  if (!offer) {
    return null;
  }

  return {
    day: targetState.day,
    offer: typeof cloneOfferSnapshot === "function"
      ? cloneOfferSnapshot(offer)
      : offer,
  };
}

const HOME_LECTURE_BACKGROUND = {
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/commercial/temporary-lecture-hall.jpg",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(11, 14, 24, 0.18) 0%, rgba(11, 14, 24, 0.52) 100%)",
};

const HOME_LECTURE_GIG_DEFINITIONS = {
  "factory-operator": {
    title: "현장 운영 특강",
    venueLabel: "임시 강연장",
    payMin: 220000,
    payMax: 320000,
    introLines: [
      "작은 단체 특강이 잡혔다. 생산 라인에서 버틴 감각을 실무 이야기로 풀어내는 자리다.",
      "현장 안전, 라인 속도, 교대 근무 팁을 정리해서 한 번에 전달하면 사례비가 제법 나온다.",
    ],
    resultLines: [
      "현장 경험담과 안전 루틴 이야기가 반응을 끌어냈다.",
      "다음에도 공장 운영 특강을 맡겨보겠다는 연락이 남았다.",
    ],
    memoryTitle: "현장 특강을 마쳤다",
    memoryBody: "생산 라인 경험을 풀어낸 특강을 마치고 든든한 사례비를 챙겼다.",
    objectiveTitle: "집에서 현장 특강 열기",
    objectiveBody: "오늘 근무를 마쳤다면 집에서 생산 라인 경험을 강연으로 바꿔 추가 수익을 만들 수 있다.",
    tags: ["강연", "생산직", "사례비"],
  },
  "baegeum-electronics-office": {
    title: "사무직 실무 특강",
    venueLabel: "임시 강연장",
    payMin: 280000,
    payMax: 380000,
    introLines: [
      "작은 실무 세미나 자리가 열렸다. 문서 정리, 보고 흐름, 협업 팁을 짧고 강하게 풀어내는 강연이다.",
      "현업 느낌이 살아 있으면 사례비가 꽤 달다. 오늘은 집에서 바로 강연장으로 연결된다.",
    ],
    resultLines: [
      "실무 사례와 보고 요령을 묶어 말하자 분위기가 단단하게 따라왔다.",
      "참석자들 반응이 좋아 다음 특강 제안도 들어왔다.",
    ],
    memoryTitle: "사무직 특강을 마쳤다",
    memoryBody: "실무 경험을 정리한 특강을 마치고 달달한 사례비를 챙겼다.",
    objectiveTitle: "집에서 사무직 특강 열기",
    objectiveBody: "오늘 근무를 마쳤다면 집에서 실무 특강을 열어 추가 수익과 평판을 챙길 수 있다.",
    tags: ["강연", "사무직", "사례비"],
  },
  "baegeum-research-lab": {
    title: "연구 세미나 특강",
    venueLabel: "임시 강연장",
    payMin: 340000,
    payMax: 460000,
    introLines: [
      "소규모 세미나 패널로 초청됐다. 연구 흐름과 실험 메모를 강연용 이야기로 재구성하는 자리다.",
      "연구직 경험이 붙은 강연은 단가가 높다. 집중해서 잘 끝내면 하루 수익이 크게 오른다.",
    ],
    resultLines: [
      "연구 메모와 실험 실패담까지 자연스럽게 풀어내며 세미나를 잘 마쳤다.",
      "전문성이 느껴진다는 평가와 함께 다음 강연 문의도 남았다.",
    ],
    memoryTitle: "연구 세미나를 마쳤다",
    memoryBody: "연구 경험을 풀어낸 세미나를 마치고 두둑한 사례비를 받았다.",
    objectiveTitle: "집에서 연구 세미나 열기",
    objectiveBody: "오늘 근무를 마쳤다면 집에서 연구 세미나를 열어 높은 사례비를 만들 수 있다.",
    tags: ["강연", "연구직", "사례비"],
  },
};

function getHomeLectureGigDefinition(targetState = state) {
  const postingId = getCareerEmploymentPostingId(targetState);
  const definition = postingId ? HOME_LECTURE_GIG_DEFINITIONS[postingId] : null;
  if (!definition) {
    return null;
  }

  const payMin = Math.max(0, Number(definition.payMin) || 0);
  const payMax = Math.max(payMin, Number(definition.payMax) || payMin);
  const rolledPay = typeof randomBetween === "function"
    ? randomBetween(payMin, payMax)
    : payMax;
  const pay = typeof roundToHundred === "function"
    ? roundToHundred(rolledPay)
    : rolledPay;

  return {
    id: `${postingId}-home-lecture`,
    jobId: postingId,
    title: definition.title,
    venueLabel: definition.venueLabel || "임시 강연장",
    pay,
    payMin,
    payMax,
    payoutRangeLabel: `${formatMoney(payMin)}~${formatMoney(payMax)}`,
    introLines: [...(definition.introLines || [])],
    resultLines: [...(definition.resultLines || [])],
    memoryTitle: definition.memoryTitle || `${definition.title}을 마쳤다`,
    memoryBody: definition.memoryBody || `${definition.title}을 마치고 사례비를 챙겼다.`,
    objectiveTitle: definition.objectiveTitle || `${definition.title} 열기`,
    objectiveBody: definition.objectiveBody || "집에서 강연을 열어 추가 수익을 만들 수 있다.",
    tags: [...(definition.tags || ["강연", "사례비"])],
    backgroundConfig: {
      ...HOME_LECTURE_BACKGROUND,
    },
    phase: "intro",
  };
}

function canHostHomeLectureGig(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return false;
  }

  if (getScheduledShiftForToday(targetState)) {
    return false;
  }

  if (targetState.clockOutSummary) {
    return false;
  }

  if (Math.max(0, Math.round(Number(targetState.lectureGigDay) || 0)) === Math.max(0, Math.round(Number(targetState.day) || 0))) {
    return false;
  }

  return Boolean(getHomeLectureGigDefinition(targetState));
}

function returnHomeForLecture(targetState = state) {
  if (!canHostHomeLectureGig(targetState)) {
    return false;
  }

  targetState.scene = "room";
  targetState.currentOffer = null;
  targetState.currentIncident = null;
  targetState.jobMiniGame = null;
  targetState.jobMiniGameResult = null;
  targetState.lastResult = null;
  targetState.phoneView = "home";
  targetState.headline = {
    badge: "집 복귀",
    text: "오늘 근무는 끝났다. 집에서 임시 강연으로 추가 수익을 노릴 수 있다.",
  };

  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  }

  if (targetState === state) {
    renderGame();
  }

  return true;
}

function startHomeLectureGig(targetState = state) {
  if (!canHostHomeLectureGig(targetState)) {
    return false;
  }

  const lectureGig = getHomeLectureGigDefinition(targetState);
  if (!lectureGig) {
    return false;
  }

  targetState.lectureGig = lectureGig;
  targetState.scene = "lecture";
  targetState.currentOffer = null;
  targetState.currentIncident = null;
  targetState.jobMiniGame = null;
  targetState.jobMiniGameResult = null;
  targetState.lastResult = null;
  targetState.phoneView = "home";
  targetState.headline = {
    badge: "임시 강연",
    text: `${lectureGig.title} 준비를 마쳤다. 사례비는 ${lectureGig.payoutRangeLabel} 수준이다.`,
  };

  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  }

  if (targetState === state) {
    renderGame();
  }

  return true;
}

function completeHomeLectureGig(targetState = state) {
  const lectureGig = targetState.lectureGig;
  if (!lectureGig || lectureGig.phase === "result") {
    return false;
  }

  const pay = Math.max(0, Number(lectureGig.pay) || 0);
  const title = lectureGig.title || "임시 강연";

  if (typeof earnBankBalance === "function") {
    earnBankBalance(pay, {
      title: `${title} 사례비`,
      type: "income",
      direction: "in",
      note: "집 강연 정산",
    }, targetState);
  } else if (typeof patchBankDomainState === "function") {
    const bankState = typeof getBankDomainState === "function"
      ? getBankDomainState(targetState)
      : { balance: 0 };
    patchBankDomainState(targetState, {
      balance: bankState.balance + pay,
    });
    if (typeof recordBankTransaction === "function") {
      recordBankTransaction({
        title: `${title} 사례비`,
        amount: pay,
        type: "income",
        direction: "in",
        note: "집 강연 정산",
      }, targetState);
    }
  } else if (typeof earnCash === "function") {
    earnCash(pay, targetState);
  } else {
    targetState.money = Math.max(0, Number(targetState.money) || 0) + pay;
  }

  if (typeof adjustHappiness === "function") {
    adjustHappiness(3, targetState);
  }

  const reachedNightBoundary = spendTimeSlots(2);
  targetState.lectureGigDay = Math.max(0, Math.round(Number(targetState.day) || 0));
  targetState.lectureGig = {
    ...lectureGig,
    phase: "result",
    reachedNightBoundary: Boolean(reachedNightBoundary),
    resultTitle: `${title} 사례비 ${formatMoney(pay)}`,
    resultLines: [
      `계좌로 ${formatMoney(pay)}이 바로 들어왔다.`,
      ...(lectureGig.resultLines || []),
    ],
  };
  targetState.phoneView = "home";
  targetState.headline = {
    badge: "강연 사례비",
    text: `${title}을 마치고 ${formatMoney(pay)}이 계좌로 들어왔다.`,
  };

  if (typeof showMoneyEffect === "function" && pay > 0) {
    showMoneyEffect(pay, { destination: "bank" });
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory(lectureGig.memoryTitle, lectureGig.memoryBody, {
      type: "business",
      source: lectureGig.venueLabel || "임시 강연장",
      tags: [...(lectureGig.tags || []), "강연수익"],
    });
  }

  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  }

  if (targetState === state) {
    renderGame();
  }

  return true;
}

function finishHomeLectureGig(targetState = state) {
  if (!targetState.lectureGig) {
    return false;
  }

  const reachedNightBoundary = Boolean(
    targetState.lectureGig?.reachedNightBoundary
    || hasPendingNightAutoSleep(targetState)
    || targetState.timeSlot >= DAY_END_TIME_SLOT
  );
  targetState.lectureGig = null;
  targetState.scene = "room";
  targetState.phoneView = "home";

  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  }

  if (reachedNightBoundary && targetState === state) {
    advanceDayOrFinish();
    return true;
  }

  if (targetState === state) {
    renderGame();
  }

  return true;
}

const NIGHT_AUTO_SLEEP_START_SLOT = 44;
const NIGHT_AUTO_SLEEP_START_MINUTES = NIGHT_AUTO_SLEEP_START_SLOT * TIME_SLOT_MINUTES;
const AI_RESEARCHER_BASE_INCOME = 300000000;

function hasPendingNightAutoSleep(targetState = state) {
  return Boolean(targetState?.nightAutoSleep?.pending);
}

function clearNightAutoSleepState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return;
  }
  targetState.nightAutoSleep = null;
}

function getAbsoluteDayMinutes(targetState = state) {
  const timeSlot = Math.max(0, Math.round(Number(targetState?.timeSlot) || 0));
  const minuteOffset = Math.max(0, Math.round(Number(targetState?.timeMinuteOffset) || 0));
  return (timeSlot * TIME_SLOT_MINUTES) + minuteOffset;
}

function setAbsoluteDayMinutes(totalMinutes = 0, targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return;
  }

  const safeMinutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const dayEndMinutes = DAY_END_TIME_SLOT * TIME_SLOT_MINUTES;
  const clampedMinutes = Math.min(dayEndMinutes, safeMinutes);
  targetState.timeSlot = Math.min(DAY_END_TIME_SLOT, Math.floor(clampedMinutes / TIME_SLOT_MINUTES));
  targetState.timeMinuteOffset = targetState.timeSlot >= DAY_END_TIME_SLOT
    ? 0
    : Math.max(0, clampedMinutes % TIME_SLOT_MINUTES);
}

function queueNightAutoSleep(targetState = state, source = "") {
  if (!targetState || typeof targetState !== "object") {
    return null;
  }

  const previous = targetState.nightAutoSleep && typeof targetState.nightAutoSleep === "object"
    ? targetState.nightAutoSleep
    : {};
  targetState.timeSlot = NIGHT_AUTO_SLEEP_START_SLOT;
  targetState.timeMinuteOffset = 0;
  targetState.nightAutoSleep = {
    ...previous,
    pending: true,
    source: String(source || previous.source || "").trim(),
    triggeredDay: Math.max(1, Math.round(Number(targetState.day) || 1)),
    triggeredSlot: NIGHT_AUTO_SLEEP_START_SLOT,
    title: "밤이 되어 집으로 돌아갔다",
    lines: [
      "밤 10시가 넘자 거리는 그대로 멈춘 듯 어두워졌다.",
      "더 돌아다니지 못하고 집으로 돌아가 잠을 잤다.",
      "다음 턴은 아침 8시, 집 안에서 다시 시작된다.",
    ],
  };
  return targetState.nightAutoSleep;
}

function advanceClockByMinutes(minutes = 0, { source = "" } = {}, targetState = state) {
  const normalizedMinutes = Math.max(0, Math.round(Number(minutes) || 0));
  if (!normalizedMinutes) {
    return false;
  }

  if (hasPendingNightAutoSleep(targetState)) {
    return true;
  }

  if (
    (Number(targetState?.timeSlot) || 0) >= NIGHT_AUTO_SLEEP_START_SLOT
    && (Number(targetState?.timeSlot) || 0) < DAY_END_TIME_SLOT
  ) {
    queueNightAutoSleep(targetState, source);
    return true;
  }

  const currentMinutes = getAbsoluteDayMinutes(targetState);
  const dayEndMinutes = DAY_END_TIME_SLOT * TIME_SLOT_MINUTES;
  let nextMinutes = Math.min(dayEndMinutes, currentMinutes + normalizedMinutes);
  const reachedNightAutoSleep = currentMinutes < NIGHT_AUTO_SLEEP_START_MINUTES
    && nextMinutes >= NIGHT_AUTO_SLEEP_START_MINUTES;

  if (reachedNightAutoSleep) {
    nextMinutes = NIGHT_AUTO_SLEEP_START_MINUTES;
  }

  const elapsedMinutes = Math.max(0, nextMinutes - currentMinutes);
  setAbsoluteDayMinutes(nextMinutes, targetState);

  if (elapsedMinutes > 0) {
    if (typeof tickStockMarketApp === "function") {
      tickStockMarketApp(targetState);
    }
    if (typeof tickTradingTerminal === "function") {
      tickTradingTerminal("coin", targetState);
      tickTradingTerminal("stocks", targetState);
    }
  }

  if (applyHungerTimePassage(elapsedMinutes, targetState)) {
    if (reachedNightAutoSleep) {
      queueNightAutoSleep(targetState, source);
    }
    return false;
  }

  if (reachedNightAutoSleep) {
    queueNightAutoSleep(targetState, source);
    return true;
  }

  if (targetState.timeSlot >= DAY_END_TIME_SLOT) {
    targetState.timeMinuteOffset = 0;
  }

  return targetState.timeSlot >= DAY_END_TIME_SLOT;
}

function spendTimeSlots(slots = 0) {
  const normalized = Math.max(0, Math.round(slots));
  if (!normalized) {
    return false;
  }

  return advanceClockByMinutes(normalized * TIME_SLOT_MINUTES, {
    source: "spend-time-slots",
  }, state);
}

function advanceTimeToSlot(targetSlot) {
  const nextSlot = Math.max(Math.round(Number(state.timeSlot) || 0), Math.round(targetSlot));
  const currentMinutes = getAbsoluteDayMinutes(state);
  const targetMinutes = Math.max(currentMinutes, nextSlot * TIME_SLOT_MINUTES);
  if (targetMinutes <= currentMinutes) {
    return false;
  }

  return advanceClockByMinutes(targetMinutes - currentMinutes, {
    source: "advance-time-to-slot",
  }, state);
}

function spendMinorTime(minutes = 1) {
  const normalizedMinutes = Math.max(0, Math.round(minutes));
  if (!normalizedMinutes) {
    return false;
  }

  return advanceClockByMinutes(normalizedMinutes, {
    source: "spend-minor-time",
  }, state);
}

function spendPhoneInteractionTime(minutes = PHONE_INTERACTION_MINUTES) {
  const normalizedMinutes = Math.max(
    PHONE_INTERACTION_MINUTES,
    Math.round(Number(minutes) || 0),
  );

  if (spendMinorTime(normalizedMinutes)) {
    advanceDayOrFinish();
    return true;
  }

  return false;
}

function refreshPhoneHomePreviewForState(targetState = state) {
  const route = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(targetState.phoneView || "home")
    : (targetState.phoneView || "home");
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : null;
  const shiftUi = typeof getScheduledShiftUiModel === "function"
    ? getScheduledShiftUiModel(targetState)
    : null;

  if (typeof isPhoneHomeRoute === "function" ? !isPhoneHomeRoute(route) : route !== "home") {
    return;
  }

  const pendingShift = jobsState?.scheduledShift || null;
  const result = jobsState?.interviewResult && jobsState.interviewResult.day === targetState.day
    ? jobsState.interviewResult
    : null;
  const career = jobsState?.career || null;

  if (shiftUi) {
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "SHIFT",
      state: shiftUi.phase === "missed"
        ? "MISSED"
        : (shiftUi.canStart ? "OPEN" : (shiftUi.canWait ? "ONSITE" : "COMMUTE")),
      title: shiftUi.phase === "missed"
        ? `${shiftUi.job?.title || "예약 근무"} 결근 처리`
        : (shiftUi.canStart
          ? `${shiftUi.job?.title || "예약 근무"} 출근 가능`
          : (shiftUi.canWait
            ? `${shiftUi.job?.title || "예약 근무"} 출근 대기`
            : `${shiftUi.job?.title || "예약 근무"} 근무지 이동`)),
      body: shiftUi.phase === "missed"
        ? `${shiftUi.workplaceLabel} ${shiftUi.shiftWindowLabel || "근무"} 시간을 놓쳤다.`
        : (shiftUi.canStart
          ? `${shiftUi.workplaceLabel} ${shiftUi.shiftWindowLabel || "근무"}를 지금 시작할 수 있다.`
          : (shiftUi.canWait
            ? `${shiftUi.workplaceLabel}에 도착했다. ${shiftUi.startLabel || "출근"} 전까지 기다리면 된다.`
            : `${shiftUi.workplaceLabel}에 먼저 도착해야 출근할 수 있다.${shiftUi.workplace?.commuteHint ? ` ${shiftUi.workplace.commuteHint}` : ""}`)),
    };
    return;
  }

  if (pendingShift) {
    const job = typeof getOfferRuntimeDefinition === "function"
      ? getOfferRuntimeDefinition(pendingShift.offer)
      : JOB_LOOKUP[pendingShift.offer.jobId];
    const workplace = typeof getOfferWorkplaceSummary === "function"
      ? getOfferWorkplaceSummary(pendingShift.offer, targetState)
      : null;
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "BOOKED",
      state: "READY",
      title: `${job?.title || "근무"} 예약 완료`,
      body: `${typeof formatTurnLabel === "function" ? formatTurnLabel(pendingShift.day) : `${pendingShift.day}턴`} ${workplace?.workplaceName || "근무지"} 출근이 잡혀 있다.`,
    };
    return;
  }

  if (result) {
    const job = typeof getOfferRuntimeDefinition === "function"
      ? getOfferRuntimeDefinition(result.offer)
      : JOB_LOOKUP[result.offer.jobId];
    targetState.phonePreview = {
      appId: "jobs",
      kicker: result.success ? "PASS" : "FAIL",
      state: result.success ? "BOOKED" : "CLOSED",
      title: `${job?.title || "근무"} 지원 결과`,
      body: result.lines.join(" "),
    };
    return;
  }

  if (career?.lastOutcomeDay === targetState.day) {
    const posting = typeof getCareerPostingById === "function"
      ? getCareerPostingById(career.postingId)
      : null;
    const workplace = typeof getCareerPostingWorkplaceSummaryByPostingId === "function"
      ? getCareerPostingWorkplaceSummaryByPostingId(career.postingId, targetState)
      : null;
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "CAREER",
      state: career.lastOutcome === "employed" ? "PASS" : "FAIL",
      title: `${posting?.title || "직장"} 결과`,
      body: [workplace?.workplaceName, (career.lastLines || []).join(" ")].filter(Boolean).join(" · "),
    };
    return;
  }

  if (career?.status === "applied" && Number.isFinite(career.resultDay) && career.resultDay > targetState.day) {
    const workplace = typeof getCareerPostingWorkplaceSummaryByPostingId === "function"
      ? getCareerPostingWorkplaceSummaryByPostingId(career.postingId, targetState)
      : null;
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "CAREER",
      state: "REVIEW",
      title: "직장 면접 심사중",
      body: `${typeof formatTurnLabel === "function" ? formatTurnLabel(career.resultDay) : `${career.resultDay}턴`} ${workplace?.workplaceName || "근무지"} 결과가 도착할 예정이다.`,
    };
    return;
  }

  if (career?.status === "employed") {
    const posting = typeof getCareerPostingById === "function"
      ? getCareerPostingById(career.postingId)
      : null;
    const workplace = typeof getCareerPostingWorkplaceSummaryByPostingId === "function"
      ? getCareerPostingWorkplaceSummaryByPostingId(career.postingId, targetState)
      : null;
    targetState.phonePreview = {
      appId: "jobs",
      kicker: "CAREER",
      state: "ACTIVE",
      title: posting?.title || "직장",
      body: posting?.unlockJobId
        ? `${workplace?.workplaceName || "근무지"} 루트가 열렸고 더 좋은 공고가 보이기 시작했다.`
        : `${workplace?.workplaceName || "근무지"} 직장 루트가 열린 상태다.`,
    };
    return;
  }

  targetState.phonePreview = createPhoneHomePreview(targetState.day, targetState);
}

function refreshPhoneHomePreview() {
  refreshPhoneHomePreviewForState(state);
}

function getInterviewChanceForOffer(offer) {
  // 알바는 에너지가 있으면 무조건 합격, 0이면 불합격
  return state.energy > 0 ? 1.0 : 0.0;
}

function getCareerPrepSnapshotForState(targetState = state) {
  const rawPrep = targetState?.jobs && typeof targetState.jobs === "object"
    ? targetState.jobs.careerPrep
    : null;

  if (typeof sanitizeCareerPrepSnapshot === "function") {
    return sanitizeCareerPrepSnapshot(rawPrep);
  }

  return {
    service: Math.max(0, Math.round(Number(rawPrep?.service) || 0)),
    labor: Math.max(0, Math.round(Number(rawPrep?.labor) || 0)),
    office: Math.max(0, Math.round(Number(rawPrep?.office) || 0)),
    academic: Math.max(0, Math.round(Number(rawPrep?.academic) || 0)),
  };
}

function getCareerCertificationSnapshotForState(targetState = state) {
  const rawCertifications = targetState?.jobs && typeof targetState.jobs === "object"
    ? targetState.jobs.certifications
    : null;

  if (typeof sanitizeCertificationSnapshot === "function") {
    return sanitizeCertificationSnapshot(rawCertifications);
  }

  return {
    driverLicense: Boolean(rawCertifications?.driverLicense),
    computerCert: Boolean(rawCertifications?.computerCert),
    universityDegree: Boolean(rawCertifications?.universityDegree),
  };
}

function getCareerPrepLabel(prepKey) {
  return CAREER_PREP_LABELS?.[prepKey] || prepKey;
}

function getCareerCertificationLabel(certKey) {
  return CAREER_CERTIFICATION_LABELS?.[certKey] || certKey;
}

function getCareerSuccessChance(posting, targetState = state) {
  if (!posting) {
    return 0;
  }

  const eligibility = typeof evaluateCareerPostingEligibility === "function"
    ? evaluateCareerPostingEligibility(posting, targetState)
    : { eligible: true };
  if (!eligibility.eligible) {
    return 0;
  }

  const prepState = getCareerPrepSnapshotForState(targetState);
  const certifications = getCareerCertificationSnapshotForState(targetState);
  const requiredPrep = Math.max(0, Math.round(Number(posting.requiredPrep) || 0));
  const prepLevel = Math.max(0, Math.round(Number(prepState[posting.prepKey]) || 0));
  const requiredCerts = Array.isArray(posting.requiredCerts) ? posting.requiredCerts : [];
  let chance = Number(posting.baseChance) || 0.4;

  chance += Math.min(prepLevel, Math.max(requiredPrep, 1)) * 0.08;
  requiredCerts.forEach((certKey) => {
    if (certifications[certKey]) {
      chance += 0.12;
    }
  });

  return Math.max(0, Math.min(0.92, chance));
}

function buildCareerOffersForState(targetState = state) {
  const postings = Array.isArray(CAREER_JOB_POSTINGS) ? CAREER_JOB_POSTINGS : [];

  return postings.map((posting) => {
    const eligibility = typeof evaluateCareerPostingEligibility === "function"
      ? evaluateCareerPostingEligibility(posting, targetState)
      : {
          eligible: true,
          requirementTags: [],
          unmetRequirements: [],
        };

    return {
      ...posting,
      requiredPrep: Math.max(0, Math.round(Number(posting.requiredPrep) || 0)),
      prepLevel: Math.max(0, Math.round(Number(getCareerPrepSnapshotForState(targetState)[posting.prepKey]) || 0)),
      requiredCerts: Array.isArray(posting.requiredCerts) ? [...posting.requiredCerts] : [],
      requirementTags: [...(eligibility.requirementTags || [])],
      unmetRequirements: [...(eligibility.unmetRequirements || [])],
      eligible: Boolean(eligibility.eligible),
      successChance: getCareerSuccessChance(posting, targetState),
    };
  });
}

function refreshCareerJobOffers(targetState = state) {
  if (typeof patchJobsDomainState !== "function") {
    return [];
  }

  const offers = buildCareerOffersForState(targetState);
  patchJobsDomainState(targetState, { careerOffers: offers });
  return offers;
}

function resolveCareerProgressForState(targetState = state) {
  if (typeof syncJobsDomainState !== "function" || typeof patchJobsDomainState !== "function") {
    return null;
  }

  const jobsState = syncJobsDomainState(targetState);
  const career = jobsState.career;

  if (career.status !== "applied" || !Number.isFinite(career.resultDay) || career.resultDay > targetState.day) {
    return null;
  }

  const posting = typeof getCareerPostingById === "function"
    ? getCareerPostingById(career.postingId)
    : null;
  const workplace = typeof getCareerPostingWorkplaceSummaryByPostingId === "function"
    ? getCareerPostingWorkplaceSummaryByPostingId(career.postingId, targetState)
    : null;
  const eligibility = typeof evaluateCareerPostingEligibility === "function"
    ? evaluateCareerPostingEligibility(posting, targetState)
    : { eligible: true, unmetRequirements: [] };
  const chance = getCareerSuccessChance(posting, targetState);
  const success = Boolean(posting) && chance > 0 && Math.random() < chance;
  const lines = success
    ? [
        `${posting.title} 면접 결과가 도착했다.`,
        `${workplace?.workplaceName || "근무지"} 입사가 확정됐다.`,
      ]
    : [
        `${posting?.title || "직장"} 면접 결과가 도착했다.`,
        chance <= 0
          ? `${eligibility.unmetRequirements?.[0] || "지원 조건"} 쪽 준비가 아직 부족해 이번에는 떨어졌다. 조건을 더 채우고 다시 지원하자.`
          : "이번에는 연결되지 않았다. 필요한 조건을 더 챙기고 다시 면접을 보자.",
      ];

  patchJobsDomainState(targetState, {
    career: {
      ...career,
      status: success ? "employed" : "rejected",
      resultDay: null,
      employedJobId: success ? posting.id : "",
      lastOutcomeDay: targetState.day,
      lastOutcome: success ? "employed" : "rejected",
      lastLines: lines,
      resultChance: chance,
    },
  });

  if (success && posting?.unlockJobId && targetState.activeJobs instanceof Set) {
    targetState.activeJobs.add(posting.unlockJobId);
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      success ? "직장 면접에 합격했다" : "직장 면접 결과를 확인했다",
      success
        ? `${posting.title} 입사가 확정됐다.`
        : `${posting?.title || "직장"} 면접은 이번에도 이어지지 않았다.`,
      {
        type: "job",
        source: posting?.title || "직장",
        tags: ["직장", success ? "합격" : "불합격", posting?.id].filter(Boolean),
      },
    );
  }

  return {
    posting,
    success,
    chance,
    lines,
  };
}

function gainCareerPrep(prepKey, {
  badge = "준비 상승",
  text = "",
  memoryTitle = "",
  memoryBody = "",
  intelligenceDelta = 0,
  energyDelta = 0,
  happinessDelta = 0,
  slots = 1,
  tags = [],
  ambientRomanceTrigger = "",
  ambientRomanceContext = null,
  targetState = state,
} = {}) {
  const prepState = getCareerPrepSnapshotForState(targetState);
  const nextValue = Math.min(9, (prepState[prepKey] || 0) + 1);

  if (typeof patchJobsDomainState === "function") {
    patchJobsDomainState(targetState, {
      careerPrep: {
        [prepKey]: nextValue,
      },
    });
  }
  refreshCareerJobOffers(targetState);

  targetState.headline = {
    badge,
    text: text || `${getCareerPrepLabel(prepKey)} 수치가 ${nextValue}까지 올랐다.`,
  };

  queueGameplayFeedback({
    title: `${getCareerPrepLabel(prepKey)} 준비`,
    tone: "up",
    chips: [
      {
        label: `${getCareerPrepLabel(prepKey)} +1`,
        tone: "up",
      },
      ...applyPlayerSocialDelta({
        intelligence: intelligenceDelta,
        happiness: happinessDelta,
      }, targetState),
      ...applyPlayerNeedDelta({
        energy: energyDelta,
      }, targetState),
    ],
  }, targetState);

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      memoryTitle || `${getCareerPrepLabel(prepKey)}를 쌓았다`,
      memoryBody || `${getCareerPrepLabel(prepKey)}를 다듬으며 다음 지원을 준비했다.`,
      {
        type: "job",
        source: getCurrentLocationLabel(),
        tags: ["준비", prepKey, ...tags],
      },
    );
  }

  if (spendTimeSlots(slots)) {
    advanceDayOrFinish();
    return;
  }

  if (
    ambientRomanceTrigger
    && typeof tryStartAmbientRomanceEvent === "function"
    && tryStartAmbientRomanceEvent(
      ambientRomanceTrigger,
      ambientRomanceContext || {
        locationId: typeof getCurrentLocationId === "function" ? getCurrentLocationId(targetState) : "",
        locationLabel: typeof getCurrentLocationLabel === "function" ? getCurrentLocationLabel(targetState) : "",
      },
      targetState,
    )
  ) {
    renderGame();
    return;
  }

  renderGame();
}

function earnCareerCertification(certKey, {
  badge = "자격 확보",
  text = "",
  memoryTitle = "",
  memoryBody = "",
  intelligenceDelta = 0,
  energyDelta = 0,
  happinessDelta = 0,
  slots = 2,
  tags = [],
  targetState = state,
} = {}) {
  const certifications = getCareerCertificationSnapshotForState(targetState);
  const certLabel = getCareerCertificationLabel(certKey);

  if (certifications[certKey]) {
    targetState.headline = {
      badge: "이미 보유",
      text: `${certLabel}는 이미 챙겨둔 상태다.`,
    };
    renderGame();
    return;
  }

  if (typeof patchJobsDomainState === "function") {
    patchJobsDomainState(targetState, {
      certifications: {
        [certKey]: true,
      },
    });
  }
  refreshCareerJobOffers(targetState);

  const certificationFeedbackChips = [
    {
      label: `${certLabel} 취득`,
      tone: "up",
    },
    ...applyPlayerSocialDelta({
      intelligence: intelligenceDelta,
      happiness: happinessDelta,
    }, targetState),
    ...applyPlayerNeedDelta({
      energy: energyDelta,
    }, targetState),
  ];

  targetState.headline = {
    badge,
    text: text || `${certLabel}를 확보해 지원 조건이 넓어졌다.`,
  };

  queueGameplayFeedback({
    title: "자격 취득",
    tone: "up",
    chips: certificationFeedbackChips,
  }, targetState);

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      memoryTitle || `${certLabel}를 확보했다`,
      memoryBody || `${certLabel}를 준비해 더 나은 직장 루트를 열었다.`,
      {
        type: "job",
        source: getCurrentLocationLabel(),
        tags: ["자격", certKey, ...tags],
      },
    );
  }

  if (spendTimeSlots(slots)) {
    advanceDayOrFinish();
    return;
  }

  renderGame();
}

function applyToCareerJob(index) {
  if (!canApplyForCareerOffer(state) || typeof patchJobsDomainState !== "function") {
    return;
  }

  const jobsState = syncJobsDomainState(state);
  const offer = jobsState.careerOffers[index];
  if (!offer) {
    return;
  }
  const workplace = typeof getCareerOfferWorkplaceSummary === "function"
    ? getCareerOfferWorkplaceSummary(offer, state)
    : null;
  const blockReason = typeof getCareerPostingFailureReason === "function"
    ? getCareerPostingFailureReason(offer, state)
    : "";

  patchJobsDomainState(state, {
    careerApplicationDoneToday: true,
    career: {
      ...jobsState.career,
      status: "applied",
      postingId: offer.id,
      appliedDay: state.day,
      resultDay: state.day + 1,
      employedJobId: "",
      lastOutcomeDay: null,
      lastOutcome: "",
      lastLines: [],
      resultChance: null,
    },
  });
  refreshCareerJobOffers(state);

  state.headline = {
    badge: "직장 면접 접수",
    text: blockReason
      ? `${offer.title} 면접 신청을 넣었다. 지금 스펙으론 ${blockReason} 때문에 계속 떨어질 수 있다.`
      : `${offer.title} 면접 신청을 넣었다. ${workplace?.workplaceName || "근무지"} 결과는 다음 턴 도착할 예정이다.`,
  };

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      "직장 면접을 신청했다",
      blockReason
        ? `${offer.title} 면접을 신청했지만 아직 ${blockReason} 조건이 부족한 상태다.`
        : `${offer.title}에 지원했다. ${workplace?.workplaceName || "근무지"} 면접에 지금까지 쌓은 준비가 반영된다.`,
      {
        type: "job",
        source: "스마트폰",
        tags: ["직장", "면접", offer.id],
      },
    );
  }

  refreshPhoneHomePreview();
  if (spendTimeSlots(TIME_COSTS.jobApplication)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function openPhoneHome() {
  if (typeof openPhoneHomeRoute === "function") {
    openPhoneHomeRoute(state);
  } else {
    state.phoneView = "home";
    refreshPhoneHomePreview();
  }
  renderGame();
}

function openPhoneJobsApp() {
  if (typeof openPhoneJobsRoute === "function") {
    if (!openPhoneJobsRoute(state)) {
      return;
    }
    renderGame();
    return;
  }

  if (!state.hasPhone || !canUsePhoneApps()) {
    return;
  }

  state.phoneMinimized = false;
  state.phoneView = "jobs/home";
  renderGame();
}

function applyToPhoneJobLegacy(index) {
  applyToPhoneJob(index);
}

function getJobMiniGameDefinition(jobId = "") {
  return JOB_LOOKUP?.[jobId]?.minigame || null;
}

const JOB_MINIGAME_DEBUG_LOG_LIMIT = 60;
const jobMiniGameDebugLog = [];

function getOfferMiniGameKey(offerSnapshot = null) {
  if (typeof getOfferKey === "function") {
    return getOfferKey(offerSnapshot);
  }

  if (!offerSnapshot) {
    return "";
  }

  return String(offerSnapshot.careerPostingId || offerSnapshot.jobId || "").trim();
}

function logJobMiniGameDiagnostic(type = "", details = {}, targetState = state) {
  const entry = {
    type: String(type || "").trim() || "unknown",
    day: Number(targetState?.day || 0),
    timeSlot: Number(targetState?.timeSlot || 0),
    scene: String(targetState?.scene || ""),
    locationId: typeof getCurrentLocationId === "function"
      ? getCurrentLocationId(targetState)
      : "",
    ...(details && typeof details === "object" ? details : {}),
  };

  jobMiniGameDebugLog.push(entry);
  if (jobMiniGameDebugLog.length > JOB_MINIGAME_DEBUG_LOG_LIMIT) {
    jobMiniGameDebugLog.shift();
  }

  try {
    console.info("[job-minigame]", entry.type, entry);
  } catch (error) {
    // Ignore console access failures in embedded runtimes.
  }

  return entry;
}

function getJobMiniGameDebugLog() {
  return jobMiniGameDebugLog.map((entry) => ({ ...entry }));
}

function getOfferMiniGameShiftPhase(offerSnapshot = null, targetState = state) {
  const shiftStatus = typeof getScheduledShiftStatus === "function"
    ? getScheduledShiftStatus(targetState)
    : null;
  if (!shiftStatus?.scheduledShift?.offer) {
    return "";
  }

  const scheduledOfferKey = getOfferMiniGameKey(shiftStatus.scheduledShift.offer);
  const offerKey = getOfferMiniGameKey(offerSnapshot);
  if (offerKey && scheduledOfferKey && offerKey !== scheduledOfferKey) {
    return "";
  }

  if (shiftStatus.active) {
    return "active";
  }
  if (shiftStatus.waiting) {
    return "waiting";
  }
  if (shiftStatus.missed) {
    return "missed";
  }

  return "";
}

function resolveJobMiniGameRestoreLocationId(targetState = state, gameSnapshot = null) {
  const game = gameSnapshot || targetState?.jobMiniGame || null;
  const offer = game?.offer || targetState?.currentOffer || null;
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
  const day = targetState?.day || getCurrentDayNumber();
  const locationMap = typeof getDayWorldLocationMap === "function"
    ? getDayWorldLocationMap(day) || {}
    : {};
  const candidateLocationIds = [
    game?.originLocationId,
    game?.workplaceLocationId,
    workplace?.locationId,
    typeof getCurrentLocationId === "function" ? getCurrentLocationId(targetState) : "",
  ]
    .map((locationId) => String(locationId || "").trim())
    .filter(Boolean);

  return candidateLocationIds.find((locationId) => Boolean(locationMap?.[locationId])) || "";
}

function restoreJobMiniGameOrigin(targetState = state, gameSnapshot = null) {
  if (typeof syncWorldState !== "function") {
    return "";
  }

  const restoreLocationId = resolveJobMiniGameRestoreLocationId(targetState, gameSnapshot);
  const day = targetState?.day || getCurrentDayNumber();

  if (!restoreLocationId) {
    return "";
  }

  const worldState = syncWorldState(targetState);
  worldState.currentLocation = restoreLocationId;
  if (typeof getWorldLocationDistrictId === "function") {
    worldState.currentDistrict = getWorldLocationDistrictId(restoreLocationId, day);
  }

  return restoreLocationId;
}

function createKitchenMiniGameSession() {
  if (typeof MCD_KITCHEN_RECIPES === "undefined" || typeof MCD_KITCHEN_INGREDIENT_POOL === "undefined") {
    return null;
  }

  const recipe = MCD_KITCHEN_RECIPES[Math.floor(Math.random() * MCD_KITCHEN_RECIPES.length)];
  const targetIds = new Set(recipe.targetIds);

  const targetItems = MCD_KITCHEN_INGREDIENT_POOL.filter((ing) => targetIds.has(ing.id));
  const decoyPool = MCD_KITCHEN_INGREDIENT_POOL.filter((ing) => !targetIds.has(ing.id));
  const decoyCount = Math.min(decoyPool.length, 2 + Math.floor(Math.random() * 2));
  const decoyItems = shuffle([...decoyPool]).slice(0, decoyCount);

  const positions = [
    { x: 18, y: 28 }, { x: 50, y: 22 }, { x: 82, y: 28 },
    { x: 14, y: 52 }, { x: 42, y: 56 }, { x: 68, y: 50 }, { x: 87, y: 56 },
    { x: 26, y: 74 }, { x: 56, y: 72 }, { x: 78, y: 75 },
  ];
  const allItems = shuffle([...targetItems, ...decoyItems]);

  const items = allItems.map((ing, i) => {
    const pos = positions[i % positions.length];
    return {
      id: `kitchen-${ing.id}`,
      icon: ing.icon,
      shortLabel: ing.shortLabel,
      label: ing.label,
      x: Math.round(pos.x + (Math.random() * 6 - 3)),
      y: Math.round(pos.y + (Math.random() * 4 - 2)),
      size: 108,
      target: targetIds.has(ing.id),
      tone: targetIds.has(ing.id) ? "primary" : "danger",
      resolved: false,
    };
  });

  const definition = JOB_LOOKUP["mcd-kitchen"]?.minigame || {};
  return {
    id: `mcd-kitchen-${recipe.id}`,
    jobId: "mcd-kitchen",
    title: `${recipe.name} 조리 준비`,
    intro: `오늘 첫 주문은 ${recipe.name}. 필요한 재료만 빠르게 골라 조리 라인을 맞춘다.`,
    note: `${recipe.name} 재료 카드만 선택하세요. 빨간 카드는 잘못된 재료입니다.`,
    baseBonus: Number(definition.baseBonus) || 10000,
    penaltyPerMistake: Number(definition.penaltyPerMistake) || 2600,
    perfectBonus: Number(definition.perfectBonus) || 6500,
    performanceLabels: definition.performanceLabels || {
      perfect: "주방 라인을 완벽하게 맞춰 추가 수당이 붙었다.",
      success: "주방 세팅을 무난하게 마쳐 추가 수당이 붙었다.",
      fail: "조리 순서가 꼬여 추가 수당은 놓쳤다.",
    },
    totalTargets: targetItems.length,
    clearedTargets: 0,
    mistakes: 0,
    items,
  };
}

function createJobMiniGameSession(jobId = "") {
  if (jobId === "mcd-kitchen") {
    return createKitchenMiniGameSession();
  }

  const definition = getJobMiniGameDefinition(jobId);
  if (!definition || !Array.isArray(definition.items) || !definition.items.length) {
    return null;
  }

  const items = definition.items.map((item, index) => ({
    ...item,
    id: item.id || `${jobId}-task-${index + 1}`,
    target: item.target !== false,
    resolved: false,
  }));
  const totalTargets = items.filter((item) => item.target !== false).length;

  return {
    id: definition.id || `${jobId}-minigame`,
    jobId,
    title: definition.title || "알바 미니게임",
    intro: definition.intro || "",
    note: definition.note || "",
    baseBonus: Number.isFinite(definition.baseBonus) ? Number(definition.baseBonus) : 0,
    penaltyPerMistake: Number.isFinite(definition.penaltyPerMistake) ? Number(definition.penaltyPerMistake) : 0,
    perfectBonus: Number.isFinite(definition.perfectBonus) ? Number(definition.perfectBonus) : 0,
    performanceLabels: definition.performanceLabels && typeof definition.performanceLabels === "object"
      ? { ...definition.performanceLabels }
      : {},
    totalTargets,
    clearedTargets: 0,
    mistakes: 0,
    items,
  };
}

function buildJobMiniGameSummary(result = null) {
  if (!result || !result.jobId) {
    return "";
  }

  if (result.cancelled || result.skipped) {
    return "준비를 중단해 추가 수당 없이 다음 단계로 넘어갔다.";
  }

  const definition = getJobMiniGameDefinition(result.jobId);
  const performanceLabels = definition?.performanceLabels || {};

  if (result.bonus > 0) {
    const baseLine = result.perfect
      ? (performanceLabels.perfect || "현장 흐름을 깔끔하게 잡아 추가 수당이 붙었다.")
      : (performanceLabels.success || "핵심 업무를 먼저 처리해 추가 수당이 붙었다.");
    return `${baseLine} ${formatMoney(result.bonus)} 보너스를 받았다.`;
  }

  return performanceLabels.fail || "초반 정리가 흔들려 추가 수당은 붙지 않았다.";
}

function startWorkSceneForOffer(offerSnapshot, {
  clearScheduledShift = false,
  targetState = state,
} = {}) {
  const offer = typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(offerSnapshot)
    : (offerSnapshot ? { ...offerSnapshot } : null);
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : JOB_LOOKUP?.[offer?.jobId];
  if (!offer || !job) {
    return false;
  }
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
  const evaluation = evaluateOfferMiniGameStart(offer, targetState, {
    source: "legacy-start-work-scene",
    shiftPhaseOverride: "active",
  });
  if (!evaluation.ok && evaluation.shouldBlockWorkLoop) {
    return false;
  }
  const offerKey = getOfferMiniGameKey(offer);
  const visitKey = offerKey || offer.jobId || job.id || "work";
  const nextVisitCount = (targetState.jobVisits[visitKey] || 0) + 1;
  const miniGameSession = evaluation.ok ? evaluation.session : null;
  const incident = offer.jobId ? pickIncident(offer.jobId, nextVisitCount, targetState) : null;

  targetState.currentOffer = offer;
  targetState.lastWorkedJobId = offer.jobId || targetState.lastWorkedJobId;
  targetState.jobVisits[visitKey] = nextVisitCount;
  targetState.currentIncident = incident;
  targetState.jobMiniGame = miniGameSession;
  targetState.jobMiniGameResult = null;
  targetState.clockOutSummary = null;

  if (clearScheduledShift) {
    if (typeof patchJobsDomainState === "function") {
      patchJobsDomainState(targetState, {
        scheduledShift: null,
        interviewResult: null,
      });
    } else {
      targetState.nextDayShift = null;
      targetState.interviewResult = null;
    }
  }

  if (!miniGameSession && !incident) {
    return queueWorkClockOutSummary(buildWorkClockOutSummary({
      offerSnapshot: offer,
      pay: Math.max(0, Number(offer.pay) || 0),
      sceneTitle: "근무 종료",
      sceneLines: [
        `${workplace?.workplaceName || job.title}에서 오늘 업무를 마쳤다.`,
        "추가 이벤트 없이 정산만 받고 나온다.",
      ],
      resultLines: [`${workplace?.workplaceName || job.title}에서 오늘 업무를 마쳤다.`],
      headlineBadge: "근무 종료",
      headlineText: `${job.title} 일을 마치고 현장을 나온다.`,
      memoryTags: [offerKey].filter(Boolean),
    }, targetState), targetState);
  }

  targetState.scene = miniGameSession ? "job-minigame" : "incident";
  targetState.phoneView = "home";
  targetState.headline = {
    badge: miniGameSession ? "근무 준비" : "출근 시작",
    text: miniGameSession
      ? `${job.title} 시작 전 ${workplace?.workplaceName || "근무지"} 핵심 업무부터 빠르게 정리한다.`
      : `${job.title} 근무를 위해 ${workplace?.workplaceName || "현장"}으로 향했다.`,
  };
  recordActionMemory("예약 근무를 시작했다", `${job.title} 근무를 위해 ${workplace?.workplaceName || "현장"}으로 향했다.`, {
    type: "job",
    source: workplace?.workplaceName || job.title,
    tags: ["알바", "출근", offer.jobId, workplace?.districtId || "", miniGameSession ? "미니게임" : ""].filter(Boolean),
  });
  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  } else if (typeof refreshPhoneHomePreview === "function") {
    refreshPhoneHomePreview();
  }
  if (targetState === state) {
    renderGame();
  }
  return true;
}

function completeCareerShiftOffer(offerSnapshot, targetState = state) {
  const offer = typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(offerSnapshot)
    : offerSnapshot;
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : null;
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
  const pay = typeof roundToHundred === "function"
    ? roundToHundred(Math.max(0, Number(offer?.pay) || 0))
    : Math.max(0, Number(offer?.pay) || 0);
  const title = offer?.title || job?.title || "직장";
  const bodyLines = [
    `${workplace?.workplaceName || "근무지"}에서 오늘 업무를 마쳤다.`,
    `급여 ${formatMoney(pay)}이 계좌로 입금됐다.`,
  ];

  targetState.currentOffer = offer;
  targetState.currentIncident = null;
  targetState.jobMiniGame = null;
  targetState.jobMiniGameResult = null;

  if (typeof patchJobsDomainState === "function") {
    patchJobsDomainState(targetState, {
      scheduledShift: null,
      interviewResult: null,
    });
  }

  if (typeof earnBankBalance === "function") {
    earnBankBalance(pay, {
      title: `${title} 급여 입금`,
      type: "income",
      direction: "in",
      note: "직장 근무 정산",
    }, targetState);
  } else if (typeof patchBankDomainState === "function") {
    const bankState = typeof getBankDomainState === "function"
      ? getBankDomainState(targetState)
      : { balance: 0 };
    patchBankDomainState(targetState, {
      balance: bankState.balance + pay,
    });
    if (typeof recordBankTransaction === "function") {
      recordBankTransaction({
        title: `${title} 급여 입금`,
        amount: pay,
        type: "income",
        direction: "in",
        note: "직장 근무 정산",
      }, targetState);
    }
  } else if (typeof earnCash === "function") {
    earnCash(pay, targetState);
  } else {
    targetState.money = Math.max(0, Number(targetState.money) || 0) + pay;
  }

  targetState.lastResult = {
    pay,
    depositDestination: "bank",
    lines: bodyLines,
  };
  targetState.scene = "result";
  targetState.phoneView = "home";
  targetState.headline = {
    badge: "직장 급여",
    text: `${title} 근무를 마치고 ${formatMoney(pay)}이 입금됐다.`,
  };

  if (typeof showMoneyEffect === "function" && pay > 0) {
    showMoneyEffect(pay, { destination: "bank" });
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      "직장 근무를 마쳤다",
      `${title} 근무를 마치고 ${formatMoney(pay)}을 받았다.`,
      {
        type: "job",
        source: workplace?.workplaceName || title,
        tags: ["직장", "급여", offer?.careerPostingId || ""].filter(Boolean),
      },
    );
  }

  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  }
}

function createOfferMiniGameRuntimeSession(offerSnapshot, targetState = state, triggerRule = null) {
  const offer = typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(offerSnapshot)
    : (offerSnapshot ? { ...offerSnapshot } : null);
  if (!offer) {
    return null;
  }

  const rule = triggerRule || (typeof getOfferMiniGameTriggerRule === "function"
    ? getOfferMiniGameTriggerRule(offer, targetState)
    : null);
  const runtimeDefinition = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : (JOB_LOOKUP?.[offer.jobId] || null);
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;

  let baseSession = null;
  if (rule?.sessionType === "dynamic-kitchen") {
    baseSession = createKitchenMiniGameSession();
  } else {
    const definition = typeof getOfferMiniGameDefinition === "function"
      ? getOfferMiniGameDefinition(offer)
      : (JOB_LOOKUP?.[offer.jobId]?.minigame || null);
    if (!definition || !Array.isArray(definition.items) || !definition.items.length) {
      return null;
    }

    baseSession = {
      id: definition.id || `${offer.jobId || offer.careerPostingId || "work"}-minigame`,
      title: definition.title || `${runtimeDefinition?.title || "근무"} 준비`,
      intro: definition.intro || "",
      note: definition.note || "",
      baseBonus: Number.isFinite(definition.baseBonus) ? Number(definition.baseBonus) : 0,
      penaltyPerMistake: Number.isFinite(definition.penaltyPerMistake) ? Number(definition.penaltyPerMistake) : 0,
      perfectBonus: Number.isFinite(definition.perfectBonus) ? Number(definition.perfectBonus) : 0,
      performanceLabels: definition.performanceLabels && typeof definition.performanceLabels === "object"
        ? { ...definition.performanceLabels }
        : {},
      items: definition.items.map((item, index) => ({
        ...item,
        id: item.id || `${offer.jobId || offer.careerPostingId || "work"}-task-${index + 1}`,
        target: item.target !== false,
        resolved: false,
      })),
      clearedTargets: 0,
      mistakes: 0,
    };
  }

  if (!baseSession) {
    return null;
  }

  const items = Array.isArray(baseSession.items)
    ? baseSession.items.map((item, index) => ({
        ...item,
        id: item.id || `${offer.jobId || offer.careerPostingId || "work"}-task-${index + 1}`,
        target: item.target !== false,
        resolved: Boolean(item.resolved),
      }))
    : [];
  const totalTargets = Number.isFinite(baseSession.totalTargets)
    ? Number(baseSession.totalTargets)
    : items.filter((item) => item.target !== false).length;

  return {
    ...baseSession,
    id: baseSession.id || `${offer.jobId || offer.careerPostingId || "work"}-minigame`,
    offer,
    offerKey: getOfferMiniGameKey(offer),
    jobId: offer.jobId || baseSession.jobId || offer.careerPostingId || "",
    title: baseSession.title || `${runtimeDefinition?.title || "근무"} 준비`,
    intro: baseSession.intro || "",
    note: baseSession.note || "",
    baseBonus: Number.isFinite(baseSession.baseBonus) ? Number(baseSession.baseBonus) : 0,
    penaltyPerMistake: Number.isFinite(baseSession.penaltyPerMistake) ? Number(baseSession.penaltyPerMistake) : 0,
    perfectBonus: Number.isFinite(baseSession.perfectBonus) ? Number(baseSession.perfectBonus) : 0,
    performanceLabels: baseSession.performanceLabels && typeof baseSession.performanceLabels === "object"
      ? { ...baseSession.performanceLabels }
      : {},
    triggerRuleKey: rule?.key || "",
    triggerRuleLabel: rule?.label || "",
    requiredShiftPhase: rule?.requiredShiftPhase || "",
    originLocationId: typeof getCurrentLocationId === "function"
      ? getCurrentLocationId(targetState)
      : "",
    workplaceLocationId: workplace?.locationId || "",
    totalTargets,
    clearedTargets: Number(baseSession.clearedTargets || 0),
    mistakes: Number(baseSession.mistakes || 0),
    items,
  };
}

function evaluateOfferMiniGameStart(offerSnapshot, targetState = state, {
  source = "work-loop",
  shiftPhaseOverride = "",
} = {}) {
  const offer = typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(offerSnapshot)
    : (offerSnapshot ? { ...offerSnapshot } : null);
  if (!offer) {
    logJobMiniGameDiagnostic("start-missing-offer", { source }, targetState);
    return {
      ok: false,
      code: "offer-missing",
      shouldBlockWorkLoop: true,
    };
  }

  const offerKey = getOfferMiniGameKey(offer);
  const runtimeDefinition = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : (JOB_LOOKUP?.[offer.jobId] || null);
  if (!runtimeDefinition) {
    logJobMiniGameDiagnostic("start-missing-job", {
      source,
      offerKey,
      jobId: offer.jobId || "",
    }, targetState);
    return {
      ok: false,
      code: "job-missing",
      shouldBlockWorkLoop: true,
    };
  }

  const activeGame = targetState.jobMiniGame || null;
  if (activeGame || targetState.scene === "job-minigame") {
    const activeOfferKey = activeGame?.offerKey || getOfferMiniGameKey(activeGame?.offer);
    const code = activeOfferKey && activeOfferKey === offerKey
      ? "duplicate-entry"
      : "minigame-already-active";
    logJobMiniGameDiagnostic(code, {
      source,
      offerKey,
      activeOfferKey,
      activeScene: targetState.scene,
    }, targetState);
    return {
      ok: false,
      code,
      shouldBlockWorkLoop: true,
    };
  }

  const rule = typeof getOfferMiniGameTriggerRule === "function"
    ? getOfferMiniGameTriggerRule(offer, targetState)
    : null;
  if (!rule) {
    logJobMiniGameDiagnostic("trigger-rule-missing", {
      source,
      offerKey,
      jobId: runtimeDefinition.id || offer.jobId || "",
    }, targetState);
    return {
      ok: false,
      code: "trigger-rule-missing",
      shouldBlockWorkLoop: false,
    };
  }

  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  if (!rule.locationIds?.length || !rule.locationIds.includes(currentLocationId)) {
    logJobMiniGameDiagnostic("location-mismatch", {
      source,
      offerKey,
      expectedLocations: [...(rule.locationIds || [])],
      currentLocationId,
    }, targetState);
    return {
      ok: false,
      code: "location-mismatch",
      shouldBlockWorkLoop: true,
    };
  }

  if (rule.requiredShiftPhase) {
    const currentShiftPhase = shiftPhaseOverride || getOfferMiniGameShiftPhase(offer, targetState);
    if (currentShiftPhase !== rule.requiredShiftPhase) {
      logJobMiniGameDiagnostic("shift-phase-mismatch", {
        source,
        offerKey,
        requiredShiftPhase: rule.requiredShiftPhase,
        currentShiftPhase,
      }, targetState);
      return {
        ok: false,
        code: "shift-phase-mismatch",
        shouldBlockWorkLoop: true,
      };
    }
  }

  if (rule.sessionType !== "dynamic-kitchen") {
    const definition = typeof getOfferMiniGameDefinition === "function"
      ? getOfferMiniGameDefinition(offer)
      : null;
    if (!definition) {
      logJobMiniGameDiagnostic("definition-missing", {
        source,
        offerKey,
        ruleKey: rule.key || "",
      }, targetState);
      return {
        ok: false,
        code: "definition-missing",
        shouldBlockWorkLoop: false,
      };
    }
    if (!Array.isArray(definition.items) || !definition.items.length) {
      logJobMiniGameDiagnostic("definition-items-empty", {
        source,
        offerKey,
        ruleKey: rule.key || "",
      }, targetState);
      return {
        ok: false,
        code: "definition-items-empty",
        shouldBlockWorkLoop: false,
      };
    }
  }

  const session = createOfferMiniGameRuntimeSession(offer, targetState, rule);
  if (!session) {
    logJobMiniGameDiagnostic("session-create-failed", {
      source,
      offerKey,
      ruleKey: rule.key || "",
      sessionType: rule.sessionType || "",
    }, targetState);
    return {
      ok: false,
      code: "session-create-failed",
      shouldBlockWorkLoop: false,
    };
  }

  logJobMiniGameDiagnostic("start-ready", {
    source,
    offerKey,
    ruleKey: rule.key || "",
    sessionId: session.id || "",
    sessionType: rule.sessionType || "static",
  }, targetState);
  return {
    ok: true,
    code: "ok",
    shouldBlockWorkLoop: false,
    offer,
    rule,
    session,
  };
}

function createOfferMiniGameSession(offerSnapshot, targetState = state) {
  const evaluation = evaluateOfferMiniGameStart(offerSnapshot, targetState, {
    source: "create-offer-minigame-session",
  });
  return evaluation.ok ? evaluation.session : null;

  const offer = typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(offerSnapshot)
    : (offerSnapshot ? { ...offerSnapshot } : null);
  if (!offer) {
    return null;
  }

  const definition = typeof getOfferMiniGameDefinition === "function"
    ? getOfferMiniGameDefinition(offer)
    : (JOB_LOOKUP?.[offer.jobId]?.minigame || null);
  if (!definition || !Array.isArray(definition.items) || !definition.items.length) {
    return null;
  }

  const runtimeDefinition = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : (JOB_LOOKUP?.[offer.jobId] || null);
  const items = definition.items.map((item, index) => ({
    ...item,
    id: item.id || `${offer.jobId || offer.careerPostingId || "work"}-task-${index + 1}`,
    target: item.target !== false,
    resolved: false,
  }));
  const totalTargets = items.filter((item) => item.target !== false).length;

  return {
    id: definition.id || `${offer.jobId || offer.careerPostingId || "work"}-minigame`,
    offer,
    offerKey: typeof getOfferKey === "function"
      ? getOfferKey(offer)
      : (offer.careerPostingId || offer.jobId || ""),
    jobId: offer.jobId || offer.careerPostingId || "",
    title: definition.title || `${runtimeDefinition?.title || "근무"} 준비`,
    intro: definition.intro || "",
    note: definition.note || "",
    baseBonus: Number.isFinite(definition.baseBonus) ? Number(definition.baseBonus) : 0,
    penaltyPerMistake: Number.isFinite(definition.penaltyPerMistake) ? Number(definition.penaltyPerMistake) : 0,
    perfectBonus: Number.isFinite(definition.perfectBonus) ? Number(definition.perfectBonus) : 0,
    performanceLabels: definition.performanceLabels && typeof definition.performanceLabels === "object"
      ? { ...definition.performanceLabels }
      : {},
    totalTargets,
    clearedTargets: 0,
    mistakes: 0,
    items,
  };
}

function recoverBrokenJobMiniGameState(reason = "broken-state", targetState = state) {
  const game = targetState.jobMiniGame || null;
  const offer = game?.offer && typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(game.offer)
    : (targetState.currentOffer && typeof cloneOfferSnapshot === "function"
      ? cloneOfferSnapshot(targetState.currentOffer)
      : targetState.currentOffer || null);
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : (JOB_LOOKUP?.[game?.jobId] || null);
  const restoredLocationId = restoreJobMiniGameOrigin(targetState, game);

  logJobMiniGameDiagnostic("recover", {
    reason,
    offerKey: getOfferMiniGameKey(offer),
    jobId: offer?.jobId || game?.jobId || "",
    restoredLocationId,
  }, targetState);

  targetState.jobMiniGame = null;

  if (targetState.currentIncident && offer && job) {
    targetState.scene = "incident";
    targetState.headline = {
      badge: "근무 복구",
      text: `${job.title || "근무"} 준비 화면이 꼬여 다음 단계로 넘긴다.`,
    };
  } else if (targetState.clockOutSummary) {
    targetState.scene = "clockout";
  } else if (offer && job) {
    targetState.scene = "outside";
    targetState.headline = {
      badge: "근무 복구",
      text: `${job.title || "근무"} 준비 화면이 꼬여 현장으로 돌아간다.`,
    };
  } else {
    targetState.scene = "room";
  }

  if (targetState === state) {
    renderGame();
  }
  return true;
}

function cancelJobMiniGame(reason = "cancelled", targetState = state) {
  const game = targetState.jobMiniGame;
  if (!game) {
    logJobMiniGameDiagnostic("cancel-missing-game", { reason }, targetState);
    return false;
  }

  const offer = game.offer && typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(game.offer)
    : (targetState.currentOffer && typeof cloneOfferSnapshot === "function"
      ? cloneOfferSnapshot(targetState.currentOffer)
      : targetState.currentOffer || null);
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : (JOB_LOOKUP?.[game.jobId] || null);
  if (!offer || !job) {
    return recoverBrokenJobMiniGameState(`cancel-missing-context:${reason}`, targetState);
  }

  const offerKey = game.offerKey || getOfferMiniGameKey(offer);
  const restoredLocationId = restoreJobMiniGameOrigin(targetState, game);
  const summaryLine = "준비를 중단해 추가 보너스 없이 다음 단계로 넘어간다.";

  targetState.jobMiniGameResult = {
    jobId: offer.jobId || game.jobId || "",
    offer,
    offerKey,
    bonus: 0,
    mistakes: Number(game.mistakes || 0),
    perfect: false,
    skipped: true,
    cancelled: true,
    cancelReason: reason,
  };
  targetState.jobMiniGame = null;

  logJobMiniGameDiagnostic("cancel", {
    reason,
    offerKey,
    jobId: offer.jobId || game.jobId || "",
    restoredLocationId,
  }, targetState);

  targetState.headline = {
    badge: "준비 중단",
    text: summaryLine,
  };

  if (targetState.currentIncident) {
    targetState.scene = "incident";
    if (targetState === state) {
      renderGame();
    }
    return true;
  }

  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
  return queueWorkClockOutSummary(buildWorkClockOutSummary({
    offerSnapshot: offer,
    pay: Number(offer.pay) || 0,
    sceneTitle: "근무 종료",
    sceneLines: [
      summaryLine,
      `${workplace?.workplaceName || job.title || "근무지"}에서 기본 정산만 받고 나온다.`,
    ],
    resultLines: [summaryLine],
    headlineBadge: "근무 종료",
    headlineText: `${job.title || "근무"} 준비를 중단하고 기본 정산만 받았다.`,
    memoryTags: [offerKey].filter(Boolean),
    nextLocationId: game.workplaceLocationId || restoredLocationId,
  }, targetState), targetState);
}

function buildOfferMiniGameSummary(result = null) {
  if (!result) {
    return "";
  }

  if (result.cancelled || result.skipped) {
    return "준비를 중단해 추가 보너스 없이 다음 단계로 넘어갔다.";
  }

  if (!result.offer || typeof getOfferMiniGameDefinition !== "function") {
    return buildJobMiniGameSummary(result);
  }

  const definition = getOfferMiniGameDefinition(result.offer);
  const performanceLabels = definition?.performanceLabels || {};

  if (result.bonus > 0) {
    const baseLine = result.perfect
      ? (performanceLabels.perfect || "업무 준비를 완벽하게 끝내 추가 수당이 붙었다.")
      : (performanceLabels.success || "업무 준비를 안정적으로 마쳐 추가 수당이 붙었다.");
    return `${baseLine} ${formatMoney(result.bonus)} 보너스를 받았다.`;
  }

  return performanceLabels.fail || "준비 흐름이 흔들려 추가 수당은 놓쳤다.";
}

function buildWorkClockOutSummary({
  offerSnapshot,
  pay = 0,
  sceneTitle = "퇴근 준비",
  sceneLines = [],
  resultLines = [],
  headlineBadge = "퇴근",
  headlineText = "",
  changes = null,
  memoryTags = [],
  nextLocationId = "",
} = {}, targetState = state) {
  const offer = typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(offerSnapshot)
    : (offerSnapshot ? { ...offerSnapshot } : null);
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : (JOB_LOOKUP?.[offer?.jobId] || null);
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
  const title = offer?.title || job?.title || "근무";
  const workplaceLabel = workplace?.workplaceName || workplace?.locationLabel || title;
  const resolvedPay = roundToHundred(Math.max(0, Number(pay) || 0));
  const resolvedNextLocationId = nextLocationId
    || (offer?.jobId === "mcd-kitchen"
      ? "mcdonalds-counter"
      : (offer?.jobId === "mcd-counter" ? "mcdonalds-counter" : ""));

  return {
    offer,
    pay: resolvedPay,
    depositDestination: "bank",
    sceneTitle,
    sceneLines: Array.isArray(sceneLines) && sceneLines.length
      ? [...sceneLines]
      : [
          `${workplaceLabel}에서 오늘 업무를 마쳤다.`,
          "정산을 받고 퇴근한다.",
        ],
    resultLines: Array.isArray(resultLines) && resultLines.length
      ? [...resultLines]
      : [`${workplaceLabel}에서 오늘 업무를 마쳤다.`],
    headlineBadge,
    headlineText: headlineText || `${title} 일을 마치고 퇴근한다.`,
    memoryTitle: `${title} 퇴근`,
    memoryBody: `${workplaceLabel}에서 오늘 일을 마치고 ${formatMoney(resolvedPay)} 정산을 받았다.`,
    memorySource: workplaceLabel,
    memoryTags: [
      ...(job?.isCareer ? ["직장"] : ["알바"]),
      "퇴근",
      ...(memoryTags || []),
    ].filter(Boolean),
    nextLocationId: resolvedNextLocationId,
    changes: changes
      ? {
          ...changes,
          add: [...(changes.add || [])],
          remove: [...(changes.remove || [])],
        }
      : null,
  };
}

function queueWorkClockOutSummary(summary, targetState = state) {
  if (!summary) {
    return false;
  }

  targetState.clockOutSummary = {
    ...summary,
    offer: summary.offer && typeof cloneOfferSnapshot === "function"
      ? cloneOfferSnapshot(summary.offer)
      : (summary.offer ? { ...summary.offer } : null),
    sceneLines: [...(summary.sceneLines || [])],
    resultLines: [...(summary.resultLines || [])],
    memoryTags: [...(summary.memoryTags || [])],
    nextLocationId: String(summary.nextLocationId || ""),
    changes: summary.changes
      ? {
          ...summary.changes,
          add: [...(summary.changes.add || [])],
          remove: [...(summary.changes.remove || [])],
        }
      : null,
  };
  targetState.currentIncident = null;
  targetState.jobMiniGame = null;
  targetState.scene = "clockout";
  targetState.phoneView = "home";
  targetState.headline = {
    badge: summary.headlineBadge || "퇴근",
    text: summary.headlineText || "오늘 근무를 마치고 퇴근한다.",
  };

  if (targetState === state) {
    renderGame();
  }
  return true;
}

function completeWorkClockOut(targetState = state) {
  const summary = targetState.clockOutSummary;
  if (!summary) {
    return false;
  }

  const offer = summary.offer && typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(summary.offer)
    : (summary.offer ? { ...summary.offer } : null);
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : (JOB_LOOKUP?.[offer?.jobId] || null);
  const pay = roundToHundred(Math.max(0, Number(summary.pay) || 0));
  const title = offer?.title || job?.title || "근무";

  if (summary.changes?.remove) {
    summary.changes.remove.forEach((jobId) => targetState.activeJobs.delete(jobId));
  }
  if (summary.changes?.add) {
    summary.changes.add.forEach((jobId) => targetState.activeJobs.add(jobId));
  }

  if (typeof earnBankBalance === "function") {
    earnBankBalance(pay, {
      title: `${title} 급여 입금`,
      type: "income",
      direction: "in",
      note: "오늘 근무 정산",
    }, targetState);
  } else if (typeof patchBankDomainState === "function") {
    const bankState = typeof getBankDomainState === "function"
      ? getBankDomainState(targetState)
      : { balance: 0 };
    patchBankDomainState(targetState, {
      balance: bankState.balance + pay,
    });
    if (typeof recordBankTransaction === "function") {
      recordBankTransaction({
        title: `${title} 급여 입금`,
        amount: pay,
        type: "income",
        direction: "in",
        note: "오늘 근무 정산",
      }, targetState);
    }
  } else if (typeof earnCash === "function") {
    earnCash(pay, targetState);
  } else {
    targetState.money = Math.max(0, Number(targetState.money) || 0) + pay;
  }

  targetState.lastResult = {
    pay,
    depositDestination: summary.depositDestination || "bank",
    lines: [
      `${summary.depositDestination === "bank" ? "급여" : "정산"} ${formatMoney(pay)}${summary.depositDestination === "bank" ? "가 계좌로 들어왔다." : "를 받았다."}`,
      ...(summary.resultLines || []),
    ],
  };

  if (Array.isArray(targetState.lastResult?.lines) && targetState.lastResult.lines.length > 0) {
    targetState.lastResult.lines[0] = `${summary.depositDestination === "bank" ? "급여" : "정산"} ${formatMoney(pay)}${summary.depositDestination === "bank" ? "이 계좌로 들어왔다." : "를 받았다."}`;
  }

  if (summary.nextLocationId && typeof syncWorldState === "function") {
    const worldState = syncWorldState(targetState);
    worldState.currentLocation = summary.nextLocationId;
    if (typeof getWorldLocationDistrictId === "function") {
      worldState.currentDistrict = getWorldLocationDistrictId(summary.nextLocationId, targetState.day);
    }
  }

  targetState.clockOutSummary = null;
  targetState.jobMiniGameResult = null;
  targetState.scene = "result";
  targetState.phoneView = "home";
  targetState.headline = {
    badge: "근무 정산",
    text: `${title} 일을 마치고 ${formatMoney(pay)} 정산을 받았다.`,
  };

  if (typeof showMoneyEffect === "function" && pay > 0) {
    showMoneyEffect(pay, { destination: "bank" });
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory(summary.memoryTitle, summary.memoryBody, {
      type: "job",
      source: summary.memorySource || title,
      tags: [...(summary.memoryTags || [])],
    });
  }

  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  } else if (typeof refreshPhoneHomePreview === "function") {
    refreshPhoneHomePreview();
  }

  if (targetState === state) {
    renderGame();
  }
  return true;
}

function startOfferWorkLoop(offerSnapshot, {
  clearScheduledShift = false,
  targetState = state,
} = {}) {
  const offer = typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(offerSnapshot)
    : (offerSnapshot ? { ...offerSnapshot } : null);
  if (!offer) {
    return false;
  }

  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : (JOB_LOOKUP?.[offer.jobId] || null);
  if (!job) {
    return false;
  }

  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
  const offerKey = getOfferMiniGameKey(offer);
  const visitKey = offerKey || job.id || "work";
  const nextVisitCount = (targetState.jobVisits[visitKey] || 0) + 1;
  const evaluation = evaluateOfferMiniGameStart(offer, targetState, {
    source: "start-offer-work-loop",
    shiftPhaseOverride: "active",
  });
  if (!evaluation.ok && evaluation.shouldBlockWorkLoop) {
    return false;
  }
  const miniGameSession = evaluation.ok ? evaluation.session : null;
  const incident = offer.jobId ? pickIncident(offer.jobId, nextVisitCount, targetState) : null;

  targetState.currentOffer = offer;
  if (offer.jobId) {
    targetState.lastWorkedJobId = offer.jobId;
  }
  targetState.jobVisits[visitKey] = nextVisitCount;
  targetState.currentIncident = incident;
  targetState.jobMiniGame = miniGameSession;
  targetState.jobMiniGameResult = null;
  targetState.clockOutSummary = null;

  if (clearScheduledShift) {
    if (typeof patchJobsDomainState === "function") {
      patchJobsDomainState(targetState, {
        scheduledShift: null,
        interviewResult: null,
      });
    } else {
      targetState.nextDayShift = null;
      targetState.interviewResult = null;
    }
  }

  if (!miniGameSession && !incident) {
    return queueWorkClockOutSummary(buildWorkClockOutSummary({
      offerSnapshot: offer,
      pay: Math.max(0, Number(offer.pay) || 0),
      sceneTitle: "근무 종료",
      sceneLines: [
        `${workplace?.workplaceName || job.title}에서 오늘 업무를 마쳤다.`,
        "출입문을 나와 정산을 받고 퇴근한다.",
      ],
      resultLines: [`${workplace?.workplaceName || job.title}에서 오늘 업무를 마쳤다.`],
      headlineBadge: "근무 종료",
      headlineText: `${job.title} 일을 마치고 퇴근한다.`,
      memoryTags: [offerKey],
    }, targetState), targetState);
  }

  targetState.scene = miniGameSession ? "job-minigame" : "incident";
  targetState.phoneView = "home";
  targetState.headline = {
    badge: miniGameSession ? "근무 준비" : "출근 시작",
    text: miniGameSession
      ? `${job.title} 시작 전 ${workplace?.workplaceName || "근무지"} 준비를 빠르게 끝낸다.`
      : `${job.title} 근무를 위해 ${workplace?.workplaceName || "현장"}으로 들어갔다.`,
  };

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      "예약 근무를 시작했다",
      `${job.title} 근무를 위해 ${workplace?.workplaceName || "현장"}으로 들어갔다.`,
      {
        type: "job",
        source: workplace?.workplaceName || job.title,
        tags: [job.isCareer ? "직장" : "알바", "출근", offerKey, workplace?.districtId || "", miniGameSession ? "미니게임" : ""].filter(Boolean),
      },
    );
  }

  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  } else if (typeof refreshPhoneHomePreview === "function") {
    refreshPhoneHomePreview();
  }

  if (targetState === state) {
    renderGame();
  }
  return true;
}

function finishOfferMiniGame() {
  const game = state.jobMiniGame;
  if (!game) {
    return;
  }

  const offer = game.offer && typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(game.offer)
    : (state.currentOffer ? cloneOfferSnapshot(state.currentOffer) : null);
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : (JOB_LOOKUP?.[game.jobId] || null);
  if (!offer || !job) {
    recoverBrokenJobMiniGameState("finish-offer-missing-context", state);
    return;
  }

  const perfect = game.mistakes === 0;
  let bonus = Math.max(0, game.baseBonus - (game.mistakes * game.penaltyPerMistake));
  if (perfect) {
    bonus += game.perfectBonus || 0;
  }
  bonus = roundToHundred(bonus);
  const restoredLocationId = restoreJobMiniGameOrigin(state, game);

  state.jobMiniGameResult = {
    jobId: offer.jobId || game.jobId || "",
    offer,
    offerKey: game.offerKey || getOfferMiniGameKey(offer),
    bonus,
    mistakes: game.mistakes,
    perfect,
  };
  state.jobMiniGame = null;

  logJobMiniGameDiagnostic("finish", {
    offerKey: state.jobMiniGameResult.offerKey,
    jobId: offer.jobId || game.jobId || "",
    bonus,
    mistakes: game.mistakes,
    perfect,
    restoredLocationId,
  }, state);

  const summaryLine = buildOfferMiniGameSummary(state.jobMiniGameResult);
  state.headline = {
    badge: perfect ? "준비 완료" : "준비 마무리",
    text: summaryLine,
  };

  if (typeof recordActionMemory === "function") {
    recordActionMemory(`${job.title} 준비를 마쳤다`, summaryLine, {
      type: "job",
      source: job.title,
      tags: [job.isCareer ? "직장" : "알바", "미니게임", state.jobMiniGameResult.offerKey].filter(Boolean),
    });
  }

  if (state.currentIncident) {
    state.scene = "incident";
    renderGame();
    return;
  }

  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, state)
    : null;
  queueWorkClockOutSummary(buildWorkClockOutSummary({
    offerSnapshot: offer,
    pay: (Number(offer.pay) || 0) + bonus,
    sceneTitle: "근무 종료",
    sceneLines: [
      summaryLine || `${job.title} 준비를 마쳤다.`,
      `${workplace?.workplaceName || job.title}에서 정산을 받고 퇴근한다.`,
    ],
    resultLines: [summaryLine || `${job.title} 업무를 마쳤다.`],
    headlineBadge: "근무 종료",
    headlineText: `${job.title} 일을 마치고 퇴근한다.`,
    memoryTags: [state.jobMiniGameResult.offerKey].filter(Boolean),
  }, state), state);
}

function chooseWorkIncidentOption(index) {
  const incident = state.currentIncident;
  if (!incident) {
    return;
  }

  const choice = incident.choices[index];
  if (!choice) {
    return;
  }

  if (incident.once) {
    state.seenIncidents.add(incident.id);
  }

  const currentOfferKey = typeof getOfferKey === "function"
    ? getOfferKey(state.currentOffer)
    : (state.currentOffer?.careerPostingId || state.currentOffer?.jobId || "");
  const miniGameResult = state.jobMiniGameResult
    && (
      (state.jobMiniGameResult.offerKey && state.jobMiniGameResult.offerKey === currentOfferKey)
      || (!state.jobMiniGameResult.offerKey && state.jobMiniGameResult.jobId === state.currentOffer?.jobId)
    )
      ? state.jobMiniGameResult
      : null;
  const miniGameBonus = Number.isFinite(miniGameResult?.bonus)
    ? Number(miniGameResult.bonus)
    : 0;
  const pay = roundToHundred(calculatePay(state.currentOffer.pay, choice) + miniGameBonus);
  const resultLines = Array.isArray(choice.result) ? [...choice.result] : [];
  const miniGameSummary = buildOfferMiniGameSummary(miniGameResult);
  if (miniGameSummary) {
    resultLines.unshift(miniGameSummary);
  }
  if (choice.changes?.news) {
    resultLines.push(choice.changes.news);
  }

  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(state.currentOffer, state)
    : null;
  queueWorkClockOutSummary(buildWorkClockOutSummary({
    offerSnapshot: state.currentOffer,
    pay,
    sceneTitle: "퇴근 준비",
    sceneLines: [
      resultLines[0] || `${workplace?.workplaceName || "근무지"}에서 오늘 일을 마쳤다.`,
      `${workplace?.workplaceName || "근무지"} 출입문을 나와 정산을 받고 퇴근한다.`,
    ],
    resultLines,
    headlineBadge: choice.changes?.news ? "시장 변화" : "퇴근",
    headlineText: choice.changes?.news || `${state.currentOffer?.title || "근무"} 일을 마치고 퇴근한다.`,
    changes: choice.changes || null,
    memoryTags: [
      currentOfferKey,
      incident.id,
    ].filter(Boolean),
  }, state), state);
}

function completeJobMiniGameTask(itemId) {
  const game = state.jobMiniGame;
  if (state.scene !== "job-minigame" || !game) {
    return;
  }

  const item = game.items.find((entry) => entry.id === itemId);
  if (!item || item.resolved) {
    return;
  }

  item.resolved = true;
  if (item.target !== false) {
    game.clearedTargets += 1;
    spendEnergy(1);
    state.headline = {
      badge: "업무 처리",
      text: `${item.label || item.shortLabel || "핵심 업무"}를 먼저 정리했다.`,
    };
  } else {
    game.mistakes += 1;
    spendEnergy(2);
    state.stamina = Math.max(0, state.stamina - 1);
    state.headline = {
      badge: "동선 흔들림",
      text: `${item.label || item.shortLabel || "불필요한 일"}에 시간을 써서 흐름이 조금 꼬였다.`,
    };
  }

  if (game.clearedTargets >= game.totalTargets) {
    if (typeof finishOfferMiniGame === "function") {
      finishOfferMiniGame();
    } else {
      finishJobMiniGame();
    }
    return;
  }

  renderGame();
}

function finishJobMiniGame() {
  const game = state.jobMiniGame;
  if (!game) {
    return;
  }

  const perfect = game.mistakes === 0;
  let bonus = Math.max(0, game.baseBonus - (game.mistakes * game.penaltyPerMistake));
  if (perfect) {
    bonus += game.perfectBonus || 0;
  }
  bonus = roundToHundred(bonus);
  const restoredLocationId = restoreJobMiniGameOrigin(state, game);

  state.jobMiniGameResult = {
    jobId: game.jobId,
    bonus,
    mistakes: game.mistakes,
    perfect,
  };
  state.jobMiniGame = null;
  state.scene = state.currentIncident ? "incident" : "outside";

  logJobMiniGameDiagnostic("finish-legacy", {
    jobId: game.jobId,
    bonus,
    mistakes: game.mistakes,
    perfect,
    restoredLocationId,
  }, state);

  const summaryLine = buildJobMiniGameSummary(state.jobMiniGameResult);
  state.headline = {
    badge: perfect ? "현장 정리 완료" : "현장 정리 마무리",
    text: summaryLine,
  };
  recordActionMemory(`${JOB_LOOKUP?.[game.jobId]?.title || "알바"} 준비를 마쳤다`, summaryLine, {
    type: "job",
    source: JOB_LOOKUP?.[game.jobId]?.title || "알바",
    tags: ["알바", "미니게임", game.jobId].filter(Boolean),
  });
  renderGame();
}

function startScheduledShiftLegacy() {
  startScheduledShift();
}

function waitInRoom() {
  state.headline = {
    badge: "짧은 휴식",
    text: "방에서 잠깐 쉬며 시간을 보낸다.",
  };
  recordActionMemory("방에서 잠깐 쉬었다", "밖으로 나가기 전에 방에서 숨을 고르며 잠깐 쉬었다.", {
    type: "action",
    source: "집",
    tags: ["일상", "휴식"],
  });
  if (spendTimeSlots(TIME_COSTS.waitInRoom)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function wanderAroundOutside() {
  const locationId = getCurrentLocationId(state);
  const worldState = syncWorldState(state);
  const npcPool = typeof getAdjustedLocationNpcPool === "function"
    ? getAdjustedLocationNpcPool(state, locationId)
    : getAlleyNpcPool(state, locationId);
  const talkableNpcPool = npcPool.filter((entry) => entry?.metadata?.talkable !== false);
  const locationLabel = getCurrentLocationLabel();
  const previousNpcId = typeof getLocationWanderNpcId === "function"
    ? getLocationWanderNpcId(locationId, state)
    : "";
  const assignedAmbientSnapshot = typeof getLocationAmbientNpcSnapshot === "function"
    ? getLocationAmbientNpcSnapshot(state, locationId)
    : null;
  const assignedAmbientNpcId = Array.isArray(assignedAmbientSnapshot?.roster)
    ? String(
        assignedAmbientSnapshot.roster.find((entry) => !entry?.isFallback)?.id
        || ""
      ).trim()
    : "";
  const assignedAmbientNpc = assignedAmbientNpcId
    ? talkableNpcPool.find((entry) => String(entry?.id || "") === assignedAmbientNpcId) || null
    : null;
  const rotatedNpcPool = previousNpcId
    ? talkableNpcPool.filter((entry) => String(entry?.id || "") !== previousNpcId)
    : talkableNpcPool;
  const activeNpc = assignedAmbientNpc || pickWeightedEntry(rotatedNpcPool.length ? rotatedNpcPool : talkableNpcPool);
  const streetRomanceLead = activeNpc && typeof tryAutoStreetRomanceLead === "function"
    ? tryAutoStreetRomanceLead(activeNpc.id, state, {
        locationId,
        locationLabel,
      })
    : null;
  const wanderTags = activeNpc?.tag
    ? ["이동", "탐색", locationId, activeNpc.tag, streetRomanceLead?.tag || ""]
    : ["이동", "탐색", locationId, streetRomanceLead?.tag || ""].filter(Boolean);

  if (!locationId || !talkableNpcPool.length) {
    state.headline = {
      badge: "탐색 불가",
      text: `${locationLabel}은 천천히 걸어봐도 지금은 특별히 만날 사람이 없다.`,
    };
    renderGame();
    return;
  }

  if (hasUsedLocationWander(locationId, state)) {
    setLocationWanderResult(
      locationId,
      `${locationLabel}은 오늘 이미 둘러봤다`,
      [
        "한 바퀴 돌며 사람 흐름을 이미 훑어본 곳이다.",
        "더 둘러보기보다는 다른 장소로 이동하거나 눈에 들어온 사람에게 다가가는 편이 낫다.",
      ],
      state,
    );
    state.headline = {
      badge: "탐색 완료",
      text: `${locationLabel}은 오늘 이미 한 번 돌아봤다.`,
    };
    renderGame();
    return;
  }

  markLocationWanderUsed(locationId, state);
  worldState.alleyNpcVisible = Boolean(activeNpc) && !streetRomanceLead;
  worldState.alleyNpcId = worldState.alleyNpcVisible ? activeNpc?.id || "" : "";
  worldState.activeNpcLocationId = worldState.alleyNpcVisible && activeNpc ? locationId : "";
  if (typeof setLocationWanderNpcId === "function") {
    setLocationWanderNpcId(locationId, worldState.alleyNpcId || activeNpc?.id || "", state);
  }
  setLocationWanderResult(
    locationId,
    streetRomanceLead?.sceneTitle || activeNpc?.sceneTitle || `${locationLabel}을 천천히 돌아다녔다`,
    Array.isArray(streetRomanceLead?.sceneLines) && streetRomanceLead.sceneLines.length
      ? streetRomanceLead.sceneLines
      : Array.isArray(activeNpc?.sceneLines) && activeNpc.sceneLines.length
      ? activeNpc.sceneLines
      : [
        `${locationLabel} 주변을 한 바퀴 돌며 사람들 얼굴을 훑어봤다.`,
        "오늘 이 장소에서는 더 오래 머물기보다 다른 선택을 하는 편이 낫다.",
      ],
    state,
  );
  state.headline = {
    badge: streetRomanceLead?.headlineBadge || (activeNpc ? activeNpc.headlineBadge || "주변 탐색" : "주변 탐색"),
    text: streetRomanceLead?.headlineText || (activeNpc
      ? activeNpc.headlineText || `${locationLabel}에서 낯선 얼굴 하나가 눈에 들어온다.`
      : `${locationLabel} 주변을 천천히 걸으며 사람 흐름을 훑었다.`),
  };
  recordActionMemory(
    `${locationLabel}을 돌아다녔다`,
    streetRomanceLead?.memoryBody || (activeNpc
      ? activeNpc.memoryBody || `${locationLabel}을 서성이다가 ${activeNpc.tag}과 눈이 마주쳤다.`
      : `${locationLabel} 주변을 천천히 걸으며 시간을 보냈다.`),
    {
      type: "travel",
      source: locationLabel,
      tags: wanderTags,
    },
  );
  if (typeof adjustHappiness === "function") {
    adjustHappiness(1, state);
  }
  if (spendTimeSlots(TIME_COSTS.wanderOutside)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function approachAlleyNpc() {
  const locationId = getCurrentLocationId(state);
  const activeNpc = getActiveAlleyNpcConfig(state);
  const fallbackNpcId = typeof getLocationWanderNpcId === "function"
    ? getLocationWanderNpcId(locationId, state)
    : "";
  const resolvedNpcId = activeNpc?.id || fallbackNpcId;
  if (!resolvedNpcId) {
    return;
  }

  startNpcInteraction(resolvedNpcId, "approach-button");
}

function startNpcInteraction(npcId, source = "actor-click") {
  const locationId = getCurrentLocationId(state);
  const locationLabel = getCurrentLocationLabel();
  const activeNpc = getActiveAlleyNpcConfig(state);
  const npcConfig = activeNpc?.id === npcId
    ? activeNpc
    : (
      (typeof getAdjustedLocationNpcPool === "function"
        ? getAdjustedLocationNpcPool(state, locationId)
        : getAlleyNpcPool(state, locationId)
      ).find((entry) => entry.id === npcId) || null
    );

  if (!npcId) {
    return false;
  }

  if (typeof isNpcAvoidingPlayer === "function" && isNpcAvoidingPlayer(npcId, state)) {
    const avoidanceReaction = typeof getNpcAvoidanceReaction === "function"
      ? getNpcAvoidanceReaction(npcId, state, {
          locationId,
          locationLabel,
          source,
        })
      : null;

    if (activeNpc?.id === npcId && typeof clearAlleyNpcState === "function") {
      clearAlleyNpcState(state);
    }
    if (typeof setLocationWanderNpcId === "function") {
      setLocationWanderNpcId(locationId, "", state);
    }
    if (typeof clearAmbientNpcCache === "function") {
      clearAmbientNpcCache(locationId, state);
    }

    state.headline = {
      badge: avoidanceReaction?.badge || "불쾌한 반응",
      text: avoidanceReaction?.text || "상대가 시선을 피하고 빠르게 자리를 뜬다.",
    };
    setLocationWanderResult(
      locationId,
      avoidanceReaction?.title || `${locationLabel}에서 어색한 침묵만 남았다`,
      Array.isArray(avoidanceReaction?.lines) && avoidanceReaction.lines.length
        ? avoidanceReaction.lines
        : [
            "상대는 더 이상 말을 섞고 싶지 않다는 듯 눈길을 피한다.",
            "외모가 낮을수록 이런 불쾌감이 더 빨리 쌓여 대화가 막히기 쉽다.",
          ],
      state,
    );
    renderGame();
    return false;
  }

  if (spendTimeSlots(TIME_COSTS.moveBetweenScenes)) {
    advanceDayOrFinish();
    return true;
  }

  const dialogueActorsSnapshot = typeof getCurrentOutsideSceneConfig === "function"
    ? ((getCurrentOutsideSceneConfig(state)?.actors || []).map((actor) => ({ ...actor })))
    : [];

  const started = typeof startNpcDialogue === "function" && startNpcDialogue(npcId, {
    returnScene: "outside",
    returnLocationId: getCurrentLocationId(state),
    source,
    backgroundSnapshot: typeof getCurrentUiBackgroundSnapshot === "function"
      ? getCurrentUiBackgroundSnapshot()
      : null,
    actorsSnapshot: dialogueActorsSnapshot,
  }, state);

  if (started && typeof recordRecentNpcSighting === "function") {
    recordRecentNpcSighting(npcId, state, locationId);
  }

  if (!started) {
    if (activeNpc?.id === npcId) {
      clearAlleyNpcState(state);
    }
    state.headline = {
      badge: npcConfig?.approachBadge || "스친 사람",
      text: npcConfig?.approachText || "가까이 다가가자 상대가 짧게 반응하고 지나간다.",
    };
    setLocationWanderResult(
      locationId,
      npcConfig?.approachBadge || `${getCurrentLocationLabel()}에서 짧게 스쳤다`,
      [
        npcConfig?.approachText || "가까이 다가가자 상대가 짧게 반응하고 지나간다.",
        "더 오래 붙잡을 분위기는 아니라서 다시 주변을 둘러본다.",
      ],
      state,
    );
  }

  renderGame();
  return started;
}

function handleActorInteraction(npcId) {
  if (state.scene !== "outside" || !npcId) {
    return;
  }

  if (ui.actorsLayer?.classList.contains("dev-position-active")) {
    return;
  }

  startNpcInteraction(npcId, "actor-click");
}

function waitForScheduledShift() {
  if (typeof runWaitForScheduledShiftAction === "function") {
    const result = runWaitForScheduledShiftAction(state);
    if (result && !result.rendered) {
      renderGame();
    }
  }
}

function skipScheduledShiftLegacy() {
  skipScheduledShift();
}

function normalizeStateForCurrentRules() {
  if (typeof ensureSpoonStartState === "function") {
    ensureSpoonStartState(state);
  }

  if (state.day >= 1) {
    state.hasPhone = true;
  }

  if (typeof state.phoneMinimized !== "boolean") {
    state.phoneMinimized = true;
  }

  if (typeof state.phoneStageExpanded !== "boolean") {
    state.phoneStageExpanded = false;
  }

  if (!state.phonePreview || typeof state.phonePreview !== "object") {
    state.phonePreview = createPhoneHomePreview(state.day, state);
  }

  if (!state.phoneAppStatus || typeof state.phoneAppStatus !== "object") {
    state.phoneAppStatus = {};
  }

  state.phoneView = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(state.phoneView || "home")
    : (state.phoneView || "home");

  if (typeof canOpenPhoneStage === "function" && !canOpenPhoneStage(state)) {
    state.phoneStageExpanded = false;
  }

  if (!Number.isFinite(state.timeSlot)) {
    state.timeSlot = getDefaultTimeSlotForState(state);
    state.timeMinuteOffset = 0;
  }

  if (!Number.isFinite(state.timeMinuteOffset)) {
    state.timeMinuteOffset = 0;
  }

  if (typeof state.devPreviewMode !== "boolean") {
    state.devPreviewMode = false;
  }

  if (typeof syncPhoneSessionState === "function") {
    syncPhoneSessionState(state);
  }

  syncInputGateState(state);

  if (typeof syncJobsDomainState === "function") {
    const jobsState = syncJobsDomainState(state);
    const jobsPatch = {};

    if (jobsState.scheduledShift && jobsState.scheduledShift.day < state.day) {
      jobsPatch.scheduledShift = null;
    }

    if (jobsState.interviewResult && jobsState.interviewResult.day !== state.day) {
      jobsPatch.interviewResult = null;
    }

    if (Object.keys(jobsPatch).length && typeof patchJobsDomainState === "function") {
      patchJobsDomainState(state, jobsPatch);
    }

    if (typeof ensureJobOffersReady === "function") {
      ensureJobOffersReady(state);
    }
  }

  if (typeof syncDialogueState === "function") {
    syncDialogueState(state);
    if (state.scene === "dialogue" && !state.dialogue.active) {
      state.scene = state.dialogue.returnScene || "outside";
    }
  }

  if (typeof syncPendingTurnEvents === "function") {
    syncPendingTurnEvents(state);
  }

  if (typeof syncTurnBriefingState === "function") {
    const briefingState = syncTurnBriefingState(state);
    if (state.scene === "turn-briefing" && !briefingState) {
      state.scene = "room";
    } else if (briefingState && state.scene === "room") {
      state.scene = "turn-briefing";
    }
  }

  if (typeof syncMemoryState === "function") {
    syncMemoryState(state);
  }

  if (typeof syncInventoryState === "function") {
    syncInventoryState(state);
  }

  if (typeof syncOwnershipState === "function") {
    syncOwnershipState(state);
  }

  if (typeof syncHomeTransitionState === "function") {
    const homeTransition = syncHomeTransitionState(state);
    if (state.scene === "home-transition" && !homeTransition) {
      state.scene = "room";
    } else if (state.scene !== "home-transition" && homeTransition) {
      state.homeTransition = null;
    }
  }

  if (state.scene === "clockout" && !state.clockOutSummary) {
    state.scene = "room";
  }

  if (state.scene === "lecture" && !state.lectureGig) {
    state.scene = "room";
  }

  if (typeof syncLottoRetailerState === "function") {
    const lottoState = syncLottoRetailerState(state);
    if (state.scene === "lotto-pick" && !lottoState.pickSession) {
      state.scene = "outside";
    }
    if (state.scene === "lotto-result" && !lottoState.lastDrawSummary) {
      state.scene = "outside";
    }
  }

  if (typeof syncRomanceSceneState === "function") {
    const romanceScene = syncRomanceSceneState(state);
    if (state.scene === "romance" && !romanceScene) {
      state.scene = "room";
    }
  }

  ensureHungerState(state);

  if (typeof syncCasinoState === "function") {
    syncCasinoState(state);
  }

  if (typeof syncMetaRunState === "function") {
    syncMetaRunState(state);
  }

  if (typeof syncRealEstateInvestmentState === "function") {
    const realEstateState = syncRealEstateInvestmentState(state);
    if (!realEstateState.ownedBuildingId && Array.isArray(state.pendingTurnEvents)) {
      state.pendingTurnEvents = state.pendingTurnEvents.filter((entry) =>
        !String(entry?.id || "").startsWith("real-estate-income-")
      );
    }
  }

  if (typeof syncHappinessState === "function") {
    syncHappinessState(state);
  }

  if (typeof syncAppearanceState === "function") {
    syncAppearanceState(state);
  }

  if (typeof syncNpcState === "function") {
    syncNpcState(state);
  }

  syncWorldState(state);
  recoverStaleInputGate(state);
  syncInputGateState(state).mode = getCurrentInputGateMode(state);
}

function canPersistState() {
  return Boolean(ui.startScreen?.classList.contains("is-hidden")) && !state.devPreviewMode;
}

let renderPersistTimerId = 0;
let pendingPersistReason = "";

function writePersistedState(reason = "render") {
  if (!canPersistState()) {
    return false;
  }

  try {
    localStorage.setItem(SAVE_STATE_KEY, JSON.stringify(serializeState(state, { reason })));
    return true;
  } catch (error) {
    console.warn("Failed to save game state", error);
    return false;
  }
}

function cancelPendingPersistState() {
  if (renderPersistTimerId) {
    clearTimeout(renderPersistTimerId);
    renderPersistTimerId = 0;
  }
  pendingPersistReason = "";
}

function flushPendingPersistState(reason = "") {
  const resolvedReason = String(reason || pendingPersistReason || "render");
  cancelPendingPersistState();
  return writePersistedState(resolvedReason);
}

function persistState(reason = "render") {
  if (!canPersistState()) {
    cancelPendingPersistState();
    return;
  }

  const normalizedReason = String(reason || "render").trim() || "render";
  if (normalizedReason === "render") {
    pendingPersistReason = normalizedReason;
    if (renderPersistTimerId) {
      clearTimeout(renderPersistTimerId);
    }
    renderPersistTimerId = window.setTimeout(() => {
      flushPendingPersistState("render");
    }, RENDER_SAVE_DEBOUNCE_MS);
    return;
  }

  flushPendingPersistState(normalizedReason);
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(SAVE_STATE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (parsed?.version !== SAVE_STATE_VERSION || !parsed.state) {
      return null;
    }

    return hydrateState(parsed.state);
  } catch (error) {
    console.warn("Failed to load saved game state", error);
    return null;
  }
}

function clearSavedState() {
  cancelPendingPersistState();
  try {
    localStorage.removeItem(SAVE_STATE_KEY);
  } catch (error) {
    console.warn("Failed to clear saved game state", error);
  }
}

function resolveRestoredStatePayload(savedState) {
  if (!savedState) {
    return null;
  }

  if (savedState?.version === SAVE_STATE_VERSION && savedState.state) {
    return hydrateState(savedState.state);
  }

  return hydrateState(savedState);
}

function restoreSavedState(savedState = pendingSavedState || loadSavedState()) {
  const resolvedState = resolveRestoredStatePayload(savedState);
  if (!resolvedState) {
    return false;
  }

  cancelPendingPersistState();
  pendingSavedState = null;
  if (typeof stopRankingRealtimeSubscription === "function") {
    stopRankingRealtimeSubscription();
  }
  if (typeof closeRankingScreen === "function") {
    closeRankingScreen();
  }
  state = resolvedState;
  if (typeof markSceneTextForImmediateReveal === "function") {
    markSceneTextForImmediateReveal();
  }
  hideStartScreen();
  renderGame();
  return true;
}

function hasActionHandler(action) {
  return Boolean(ACTION_HANDLERS[action]);
}

const ACTION_HANDLERS = {
  keepSleeping() {
    recoverEnergy();
    state.timeSlot = PROLOGUE_TIME_SLOTS.introCleanupPrompt;
    state.timeMinuteOffset = 0;
    advanceStoryStep();
    renderGame();
  },
  wakeUp() {
    state.timeSlot = PROLOGUE_TIME_SLOTS.introCleanupPrompt;
    state.timeMinuteOffset = 0;
    advanceStoryStep();
    renderGame();
  },
  beginStandardIntro() {
    state.scene = "prologue";
    state.storyKey = "intro";
    state.storyStep = 0;
    state.timeSlot = PROLOGUE_TIME_SLOTS.introWake;
    state.timeMinuteOffset = 0;
    state.prologueIntro = createDefaultPrologueIntroState(state);
    renderGame();
  },
  goToLivingRoom() {
    prepareDay();
  },
  cleanRoom() {
    return startRegisteredEvent("cleanRoom");
  },
  continueDay() {
    prepareDay();
  },
  sleep() {
    recoverStamina();
    recoverEnergy();
    if (state.storyKey === "intro") {
      state.day = 2;
    }
    prepareDay();
  },
  unlock() {
    state.hasPhone = true;
    prepareDay();
  },
  next() {
    advanceStoryStep();
    renderGame();
  },
  board() {
    enterJobBoard();
  },
  wander() {
    wanderAroundOutside();
  },
  "approach-alley-npc"() {
    approachAlleyNpc();
  },
  "complete-bus-travel"() {
    completeBusTravel();
  },
  "complete-walk-travel"() {
    completeWalkTravel();
  },
  "wait-seoul-rail"() {
    waitForSeoulRailEvent();
  },
  "open-bus-route-app"() {
    openBusPhoneSurface("bus/home");
  },
  "open-bus-timetable-app"() {
    openBusPhoneSurface("bus/timetable");
  },
  "open-bank-app"() {
    if (!state.hasPhone) {
      renderGame();
      return;
    }

    if (typeof openPhoneRoute === "function") {
      openPhoneRoute("bank/home", state);
    } else {
      state.phoneView = "bank/home";
    }
    renderGame();
  },
  "study-office-prep"() {
    gainCareerPrep("office", {
      badge: "이력서 정리",
      text: "도서관에서 이력서와 서류를 정리하며 사무 준비를 했다.",
      memoryTitle: "도서관에서 이력서를 정리했다",
      memoryBody: "조용한 열람실에서 이력서와 서류를 손보며 다음 지원을 준비했다.",
      intelligenceDelta: 2,
      energyDelta: -8,
      tags: ["도서관", "사무"],
    });
  },
  "study-academic-prep"() {
    gainCareerPrep("academic", {
      badge: "도서관 공부",
      text: "도서관에서 강의 자료를 보며 학업 준비를 했다.",
      memoryTitle: "도서관에서 공부했다",
      memoryBody: "강의 자료와 문제집을 훑으며 졸업 심사에 필요한 공부를 했다.",
      intelligenceDelta: 3,
      energyDelta: -10,
      tags: ["도서관", "학업"],
      ambientRomanceTrigger: "study-academic-prep",
      ambientRomanceContext: {
        locationId: "library",
        locationLabel: typeof getCurrentLocationLabel === "function" ? getCurrentLocationLabel(state) : "",
      },
    });
  },
  "write-ai-study-book"() {
    publishAiStudyBook();
  },
  "study-ai-major"() {
    studyAiMajor();
  },
  "take-computer-cert"() {
    earnCareerCertification("computerCert", {
      badge: "시험 통과",
      text: "컴퓨터 자격을 확보해 사무 계열 지원 조건이 넓어졌다.",
      memoryTitle: "시험장에서 컴퓨터 자격을 챙겼다",
      memoryBody: "시험장에 들러 문서 처리와 컴퓨터 활용 자격을 확보했다.",
      intelligenceDelta: 1,
      energyDelta: -6,
      tags: ["시험장", "컴퓨터"],
    });
  },
  "take-driver-license"() {
    earnCareerCertification("driverLicense", {
      badge: "시험 통과",
      text: "운전면허를 확보해 이동이 필요한 일자리 루트가 넓어졌다.",
      memoryTitle: "시험장에서 운전면허를 챙겼다",
      memoryBody: "실기 접수를 마치고 이동이 필요한 루트에 도전할 준비를 끝냈다.",
      energyDelta: -5,
      tags: ["시험장", "운전면허"],
    });
  },
  "get-plastic-surgery"() {
    openPlasticSurgeryConsultation(state);
  },
  "buy-convenience-water"() {
    buyConvenienceStoreItem("buy-convenience-water", state);
  },
  "buy-convenience-kimbap"() {
    buyConvenienceStoreItem("buy-convenience-kimbap", state);
  },
  "buy-convenience-painkiller"() {
    buyConvenienceStoreItem("buy-convenience-painkiller", state);
  },
  "buy-lotto-ticket"() {
    buyLottoRetailerTicket(state);
  },
  "eat-mcdonalds-set"() {
    visitMcDonaldsMenu("eat-mcdonalds-set", state);
  },
  "buy-mcdonalds-coffee"() {
    visitMcDonaldsMenu("buy-mcdonalds-coffee", state);
  },
  "buy-downtown-building"() {
    buyDowntownRealEstateBuilding(state);
  },
  "review-downtown-building"() {
    reviewDowntownRealEstateBuilding(state);
  },
  "study-career-center-review"() {
    const currentMeetings = Number(state.social?.contacts?.careerCenterClerk?.meetings || 0);
    runStudyDistrictEvent({
      badge: "취업 상담",
      text: "취업지원센터에서 이력서와 지원 순서를 상담받았다.",
      memoryTitle: "대학가에서 취업 상담을 받았다",
      memoryBody: "취업지원센터에서 어떤 공고부터 노려야 할지와 서류 순서를 정리했다.",
      prepKey: "office",
      prepGain: 1,
      intelligenceDelta: 1,
      energyDelta: -4,
      happinessDelta: 2,
      routeKey: "career",
      routePatch: {
        campusCareerCenterVisited: true,
        campusCareerCenterVisits: currentMeetings + 1,
      },
      contactId: "careerCenterClerk",
      contactPatch: {
        label: "취업지원센터 직원",
        met: true,
        meetings: currentMeetings + 1,
        lastSeenDay: state.day,
        note: "서류 순서와 지원 흐름을 알려줬다.",
      },
      unlockEventId: "study-career-center-review",
      unlockNpcId: "careerCenterClerk",
      slots: 1,
      tags: ["대학가", "취업지원", "상담"],
    });
  },
  "graduate-university"() {
    const certifications = getCareerCertificationSnapshotForState(state);
    if (certifications.universityDegree) {
      state.headline = {
        badge: "이미 졸업",
        text: "대학 졸업장은 이미 확보한 상태다.",
      };
      renderGame();
      return;
    }

    const prepState = getCareerPrepSnapshotForState(state);
    if ((prepState.academic || 0) < 2) {
      state.headline = {
        badge: "졸업 준비 부족",
        text: "졸업 심사를 받으려면 먼저 대학가에서 공부를 더 쌓아 학업 준비 2를 만들어야 한다.",
      };
      renderGame();
      return;
    }

    earnCareerCertification("universityDegree", {
      badge: "졸업 완료",
      text: "대학 졸업장을 챙겨 직장 지원 기본 자격을 확보했다.",
      memoryTitle: "대학 졸업 심사를 마쳤다",
      memoryBody: "졸업 심사를 통과하고 졸업장을 챙겨 직장 지원에 필요한 기본 자격을 확보했다.",
      tags: ["대학가", "졸업"],
      slots: 2,
    });
  },
  "study-campus-network"() {
    const currentMeetings = Number(state.social?.contacts?.campusSenior?.meetings || 0);
    runStudyDistrictEvent({
      badge: "캠퍼스 대화",
      text: "캠퍼스 공원에서 선배와 이야기하며 학업 준비와 인맥을 챙겼다.",
      memoryTitle: "캠퍼스 공원에서 선배를 만났다",
      memoryBody: "벤치에서 만난 선배가 학원 조교와 계약직 루트를 알려줬다.",
      prepKey: "academic",
      prepGain: 1,
      reputationDelta: 1,
      energyDelta: -3,
      happinessDelta: 4,
      routeKey: "career",
      routePatch: {
        campusNetworkUnlocked: true,
        campusNetworkMeetings: currentMeetings + 1,
      },
      contactId: "campusSenior",
      contactPatch: {
        label: "캠퍼스 선배",
        met: true,
        meetings: currentMeetings + 1,
        lastSeenDay: state.day,
        note: "학원 조교와 계약직 루트 소문을 알고 있다.",
      },
      unlockEventId: "study-campus-network",
      unlockNpcId: "campusSenior",
      slots: 1,
      tags: ["대학가", "공원", "인맥"],
      ambientRomanceTrigger: "study-campus-network",
      ambientRomanceContext: {
        locationId: "campus-park",
        locationLabel: "캠퍼스 공원",
      },
    });
  },
  "enter-casino-venue"() {
    state.casinoVenueScreen = "home";
    state.scene = "casino-floor";
    renderGame();
  },
  home() {
    returnHomeFromOutside();
  },
};

function runAction(action) {
  const handler = ACTION_HANDLERS[action];

  if (!handler) {
    return false;
  }

  return handler();
}

function bindStaticEvents() {
  ui.continueButton?.addEventListener("click", continueSavedGame);
  ui.rankingPreviewButton?.addEventListener("click", openTitleRankingPreview);
  ui.startButton.addEventListener("click", handleStartScreenPrimaryAction);
  ui.nameInput?.addEventListener("input", () => {
    syncStartScreenDrawUi();
  });
  ui.nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleStartScreenPrimaryAction();
    }
  });
  window.addEventListener("keydown", handleWorldKeyDown);
  window.addEventListener("resize", () => {
    renderGame();
  });
  window.addEventListener("scroll", handlePhoneScrollableInteraction, true);
  window.addEventListener("pagehide", () => {
    flushPendingPersistState("render");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushPendingPersistState("render");
    }
  });

  ui.phoneToggleButton?.addEventListener("click", () => {
    runGuardedUiAction(() => {
      togglePhonePanel();
    }, {
      source: "phone-toggle",
      actionId: "phone:toggle-panel",
      allowedModes: ["normal", "phone"],
    });
  });
  ui.cityMapToggleButton?.addEventListener("click", () => {
    runGuardedUiAction(() => {
      if (typeof toggleCityMapOverlay === "function") {
        toggleCityMapOverlay();
      }
    }, {
      source: "map-toggle",
      actionId: "city-map:toggle-overlay",
      allowedModes: ["normal"],
    });
  });
  ui.phoneStageButton?.addEventListener("click", () => {
    runGuardedUiAction(() => {
      togglePhoneStage();
    }, {
      source: "phone-toggle",
      actionId: "phone:toggle-stage",
      allowedModes: ["normal", "phone"],
    });
  });
  ui.phoneBackButton?.addEventListener("click", () => {
    runGuardedUiAction(() => {
      goBackInPhone();
    }, {
      source: "phone-action",
      actionId: "phone:back",
      allowedModes: ["normal", "phone"],
    });
  });
  ui.memoryButton?.addEventListener("click", () => {
    runGuardedUiAction(() => {
      toggleMemoryLog();
    }, {
      source: "overlay-toggle",
      actionId: "memory:toggle",
      allowedModes: ["normal"],
    });
  });
  ui.memoryCloseButton?.addEventListener("click", closeMemoryLog);
  ui.inventoryButton?.addEventListener("click", () => {
    runGuardedUiAction(() => {
      toggleInventoryLog();
    }, {
      source: "overlay-toggle",
      actionId: "inventory:toggle",
      allowedModes: ["normal"],
    });
  });
  ui.inventoryCloseButton?.addEventListener("click", closeInventoryLog);
  ui.inventoryTabs?.addEventListener("click", handleInventoryTabClick);
  ui.inventoryList?.addEventListener("click", handleInventoryListClick);
  ui.characterButton?.addEventListener("click", () => {
    runGuardedUiAction(() => {
      toggleCharacterLog();
    }, {
      source: "overlay-toggle",
      actionId: "character:toggle",
      allowedModes: ["normal"],
    });
  });
  ui.characterCloseButton?.addEventListener("click", closeCharacterLog);
  ui.textbox?.addEventListener("click", handleTextboxClick);
  ui.message?.addEventListener("click", handleCasinoVenueClick);
  ui.phonePanel?.addEventListener("click", handlePhoneScreenClick);
  ui.phoneStage?.addEventListener("click", handlePhoneScreenClick);
  ui.phonePanel?.addEventListener("input", handlePhoneScreenInput);
  ui.phoneStage?.addEventListener("input", handlePhoneScreenInput);
}

function beginStartScreenDraw() {
  if (startScreenDrawState.phase === "drawing") {
    return;
  }

  showSpoonDrawOverlay();
  _handleSpoonDrawClick();
}

function handleStartScreenPrimaryAction() {
  const playerName = String(ui.nameInput?.value || "").trim();
  if (!playerName) {
    ui.nameInput?.focus();
    ui.nameInput?.select();
    return;
  }

  beginStartScreenDraw();
}

async function openTitleRankingPreview() {
  if (typeof showRankingScreen !== "function") {
    return;
  }

  const trigger = ui.rankingPreviewButton || null;
  const originalLabel = trigger?.getAttribute("aria-label") || "랭킹 보기";
  const originalTitle = trigger?.getAttribute("title") || originalLabel;

  if (trigger) {
    trigger.disabled = true;
    trigger.classList.add("is-loading");
    trigger.setAttribute("aria-label", "랭킹 불러오는 중");
    trigger.setAttribute("title", "랭킹 불러오는 중");
  }

  try {
    if (typeof stopRankingRealtimeSubscription === "function") {
      stopRankingRealtimeSubscription();
    }

    const entries = typeof fetchTopRankings === "function"
      ? await fetchTopRankings()
      : [];

    showRankingScreen(null, entries, { previewMode: true });
  } catch (error) {
    console.warn("[ranking] 시작 화면 랭킹 미리보기 로드 실패:", error);
    showRankingScreen(null, [], { previewMode: true });
  } finally {
    if (trigger) {
      trigger.disabled = false;
      trigger.classList.remove("is-loading");
      trigger.setAttribute("aria-label", originalLabel);
      trigger.setAttribute("title", originalTitle);
    }
  }
}

function handlePhoneScreenInput(event) {
  const amountInput = event.target?.closest?.("[data-trading-amount-input]");
  if (amountInput && typeof setTradingTerminalDraftAmount === "function") {
    setTradingTerminalDraftAmount(amountInput.dataset.tradingApp, amountInput.value, state);
    return;
  }

  const disSearchInput = event.target?.closest?.("[data-dis-search-input]");
  if (disSearchInput) {
    const nextQuery = String(disSearchInput.value || "");
    if (state.disSearchQuery !== nextQuery) {
      state.disSearchQuery = nextQuery;
      const selectionStart = typeof disSearchInput.selectionStart === "number"
        ? disSearchInput.selectionStart
        : nextQuery.length;

      renderGame();

      requestAnimationFrame(() => {
        const nextInput = (ui.phoneAppScreen || ui.phoneStage || ui.phonePanel)
          ?.querySelector?.("[data-dis-search-input]");
        if (!nextInput) {
          return;
        }

        nextInput.focus({ preventScroll: true });
        if (typeof nextInput.setSelectionRange === "function") {
          const cursor = Math.min(selectionStart, nextInput.value.length);
          nextInput.setSelectionRange(cursor, cursor);
        }
      });
    }
    return;
  }

  const disCommunityInput = event.target?.closest?.("[data-dis-community-input]");
  if (disCommunityInput) {
    const inputKey = String(disCommunityInput.dataset.disCommunityInput || "").trim().toLowerCase();
    const nextValue = String(disCommunityInput.value || "");

    if (inputKey === "author" || inputKey === "title" || inputKey === "content") {
      if (typeof setDisCommunityDraftField === "function") {
        setDisCommunityDraftField(inputKey, nextValue, state);
      }
      return;
    }

    if (inputKey === "comment-author") {
      if (typeof setDisCommunityCommentDraftField === "function") {
        setDisCommunityCommentDraftField("author", nextValue, state);
      }
      return;
    }

    if (inputKey === "comment-content") {
      if (typeof setDisCommunityCommentDraftField === "function") {
        setDisCommunityCommentDraftField("content", nextValue, state);
      }
      return;
    }
  }

  const stockQtyInput = event.target?.closest?.("[data-stock-qty-input]");
  if (!stockQtyInput || typeof setStockMarketDraftQuantity !== "function") {
    const disGambleInput = event.target?.closest?.("[data-dis-gamble-input]");
    if (!disGambleInput || typeof setDisGambleDraftAmount !== "function") {
      return;
    }

    setDisGambleDraftAmount(disGambleInput.dataset.disGambleInput, disGambleInput.value, state);
    return;
  }

  setStockMarketDraftQuantity(stockQtyInput.value, state);
}

function resetSpoonDrawOverlayState({ keepHidden = true } = {}) {
  stopStartScreenDrawTimer();
  startScreenDrawState.screenMode = keepHidden ? "intro" : "origin";
  startScreenDrawState.phase = "idle";
  startScreenDrawState.previewTierId = "";
  startScreenDrawState.resultTierId = "";
  startScreenDrawState.confirmedTierId = "";
  if (ui.spdDrawBtn) {
    ui.spdDrawBtn.removeEventListener("click", _handleSpoonDrawClick);
    ui.spdDrawBtn.disabled = false;
  }
  if (ui.spdStartBtn) {
    ui.spdStartBtn.removeEventListener("click", _handleSpoonStartClick);
    ui.spdStartBtn.disabled = false;
  }
  _syncSpoonOverlay();
  syncStartScreenDrawUi();
  if (keepHidden && ui.spoonDrawOverlay) {
    ui.spoonDrawOverlay.hidden = true;
    ui.spoonDrawOverlay.setAttribute("aria-hidden", "true");
  }
}

function showSpoonDrawOverlay() {
  if (!ui.spoonDrawOverlay) {
    return;
  }

  resetSpoonDrawOverlayState({ keepHidden: false });
  ui.spoonDrawOverlay.hidden = false;
  ui.spoonDrawOverlay.removeAttribute("aria-hidden");
  if (ui.spdDrawBtn) {
    ui.spdDrawBtn.addEventListener("click", _handleSpoonDrawClick);
  }
  if (ui.spdStartBtn) {
    ui.spdStartBtn.addEventListener("click", _handleSpoonStartClick);
  }
}

function hideSpoonDrawOverlay() {
  resetSpoonDrawOverlayState({ keepHidden: true });
}

function _handleSpoonDrawClick() {
  if (startScreenDrawState.phase === "drawing") {
    return;
  }

  stopStartScreenDrawTimer();
  startScreenDrawState.screenMode = "origin";
  startScreenDrawState.phase = "drawing";
  startScreenDrawState.resultTierId = "";
  startScreenDrawState.confirmedTierId = "";
  startScreenDrawState.previewTierId = typeof getDefaultSpoonStartTier === "function"
    ? getDefaultSpoonStartTier().id
    : "dirt";
  _syncSpoonOverlay();
  syncStartScreenDrawUi();

  let ticks = 0;
  startScreenDrawTimer = setInterval(() => {
    startScreenDrawState.previewTierId = typeof drawSpoonStartTierId === "function"
      ? drawSpoonStartTierId()
      : "dirt";
    ticks += 1;
    _syncSpoonOverlay();
    syncStartScreenDrawUi();

    if (ticks < 15) {
      return;
    }

    stopStartScreenDrawTimer();
    const finalTierId = typeof drawSpoonStartTierId === "function"
      ? drawSpoonStartTierId()
      : startScreenDrawState.previewTierId;
    startScreenDrawState.phase = "result";
    startScreenDrawState.previewTierId = finalTierId;
    startScreenDrawState.resultTierId = finalTierId;
    _syncSpoonOverlay();
    syncStartScreenDrawUi();
  }, 90);
}

function _handleSpoonStartClick() {
  if (startScreenDrawState.phase !== "result") return;
  const tierId = String(startScreenDrawState.resultTierId || startScreenDrawState.previewTierId || "")
    .trim()
    .toLowerCase();
  if (!tierId) {
    return;
  }
  startScreenDrawState.confirmedTierId = tierId;
  startGame(tierId);
}

function _syncSpoonOverlay() {
  if (!ui.spoonDrawOverlay) return;

  const phase = startScreenDrawState.phase || "idle";
  const tierId = String(startScreenDrawState.resultTierId || startScreenDrawState.previewTierId || "")
    .trim()
    .toLowerCase();
  const tier = tierId && typeof getSpoonStartTier === "function"
    ? getSpoonStartTier(tierId)
    : null;

  ui.spoonDrawOverlay.dataset.phase = phase;
  ui.spoonDrawOverlay.dataset.tier = tierId || "";

  // Emblem
  if (ui.spdEmblem) {
    ui.spdEmblem.textContent = phase === "idle" ? "?" : (tier?.emblem || "?");
  }

  // Odds: hide on result
  if (ui.spdOdds) {
    var probabilityLabels = typeof getSpoonStartProbabilityLabels === "function"
      ? getSpoonStartProbabilityLabels()
      : ["금 5%", "은 25%", "흙 70%"];
    var probabilityClasses = ["gold", "silver", "dirt"];
    ui.spdOdds.innerHTML = probabilityLabels.map(function(label, index) {
      var toneClass = probabilityClasses[index] || "dirt";
      return '<span class="spd-odd spd-odd-' + toneClass + '">' + label + '</span>';
    }).join("");
    ui.spdOdds.hidden = phase === "result";
  }

  // Result area
  if (ui.spdResultArea) {
    ui.spdResultArea.hidden = phase !== "result";
    if (phase === "result" && tier) {
      if (ui.spdResultBracket) ui.spdResultBracket.textContent = tier.bracket || "";
      if (ui.spdResultName) ui.spdResultName.textContent = tier.name || "";
      if (ui.spdResultSummary) ui.spdResultSummary.textContent = tier.summary || "";
      if (ui.spdResultChips) {
        var packageChips = typeof getSpoonStartPackageChipLabels === "function"
          ? getSpoonStartPackageChipLabels(tier)
          : [];
        ui.spdResultChips.innerHTML =
          packageChips.map(function (label) {
            return '<span class="spd-result-chip">' + label + '</span>';
          }).join("") +
          '<span class="spd-result-chip">행복도 ' + tier.startHappiness + '</span>';
      }
    }
  }

  // Buttons
  if (ui.spdDrawBtn) {
    ui.spdDrawBtn.hidden = phase === "result";
    ui.spdDrawBtn.disabled = phase === "drawing";
    ui.spdDrawBtn.textContent = phase === "drawing" ? "결정 중..." : "🥄 수저 뽑기";
  }
  if (ui.spdStartBtn) {
    ui.spdStartBtn.hidden = phase !== "result";
  }
}

function startGame(selectedTierIdOverride = "") {
  const playerName = ui.nameInput.value.trim() || "이름 없음";
  const selectedTierId = String(selectedTierIdOverride || "").trim().toLowerCase()
    || String(startScreenDrawState.resultTierId || startScreenDrawState.previewTierId || "").trim().toLowerCase()
    || (typeof drawSpoonStartTierId === "function" ? drawSpoonStartTierId() : "dirt");
  const awaitingExplicitConfirm = startScreenDrawState.phase === "result"
    && Boolean(startScreenDrawState.resultTierId)
    && startScreenDrawState.confirmedTierId !== selectedTierId;

  if (awaitingExplicitConfirm) {
    _syncSpoonOverlay();
    syncStartScreenDrawUi();
    return false;
  }

  clearGameplayFeedback();
  cancelPendingPersistState();
  clearSavedState();
  pendingSavedState = null;
  if (typeof stopRankingRealtimeSubscription === "function") {
    stopRankingRealtimeSubscription();
  }
  if (typeof closeRankingScreen === "function") {
    closeRankingScreen();
  }
  hideSpoonDrawOverlay();
  state = createInitialState();
  state.playerName = playerName;
  if (typeof applySpoonStartPackage === "function") {
    applySpoonStartPackage(state, selectedTierId);
  }
  const originIntroSteps = typeof getSpoonStartOriginIntroSteps === "function"
    ? getSpoonStartOriginIntroSteps(state)
    : [];
  state.storyKey = Array.isArray(originIntroSteps) && originIntroSteps.length
    ? "originIntro"
    : "intro";
  state.storyStep = 0;
  state.prologueIntro = createDefaultPrologueIntroState(state);
  if (typeof ensureJobOffersReady === "function") {
    ensureJobOffersReady(state);
  }

  hideStartScreen();
  resetStartScreenDrawState();
  renderGame();
}

function continueSavedGame() {
  clearGameplayFeedback();
  cancelPendingPersistState();
  resetStartScreenDrawState();
  hideSpoonDrawOverlay();
  if (typeof stopRankingRealtimeSubscription === "function") {
    stopRankingRealtimeSubscription();
  }
  if (typeof closeRankingScreen === "function") {
    closeRankingScreen();
  }
  if (restoreSavedState()) {
    return;
  }

  pendingSavedState = null;
  if (typeof showStartScreen === "function") {
    showStartScreen(false);
  }
}

function startStory(storyKey) {
  state.scene = "prologue";
  state.storyKey = storyKey;
  state.storyStep = 0;
  state.headline = {
    badge: "",
    text: "",
  };
  renderGame();
}

function getActiveStorySteps(targetState = state) {
  const storyData = getDayStoryData(targetState?.day || getCurrentDayNumber());
  if (targetState?.storyKey === "phoneUnlock") {
    return storyData.phoneUnlockSteps;
  }

  if (targetState?.storyKey === "originIntro" && typeof getSpoonStartOriginIntroSteps === "function") {
    const introSteps = getSpoonStartOriginIntroSteps(targetState);
    if (Array.isArray(introSteps) && introSteps.length) {
      return introSteps;
    }
  }

  return storyData.introSteps;
}

function handlePrologueOption(action) {
  if (hasActionHandler(action)) {
    runAction(action);
    return;
  }

  const steps = getActiveStorySteps();

  if (state.storyStep < steps.length - 1) {
    advanceStoryStep();
    renderGame();
    return;
  }

  prepareDay();
}

function prepareDay() {
  prepareDayState(state);
  renderGame();
}

function toggleMemoryLog() {
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(state);
  }
  if (typeof toggleMemoryPanel === "function") {
    toggleMemoryPanel(undefined, state);
  }
  renderGame();
}

function closeMemoryLog() {
  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  renderGame();
}

function toggleInventoryLog() {
  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  if (typeof toggleInventoryPanel === "function") {
    toggleInventoryPanel(undefined, state);
  }
  renderGame();
}

function closeInventoryLog() {
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(state);
  }
  renderGame();
}

function toggleCharacterLog() {
  if (typeof closeMemoryPanel === "function") closeMemoryPanel(state);
  if (typeof closeInventoryPanel === "function") closeInventoryPanel(state);
  state._characterPanelOpen = !state._characterPanelOpen;
  renderGame();
}

function closeCharacterLog() {
  state._characterPanelOpen = false;
  renderGame();
}

function handleInventoryTabClick(event) {
  const tabButton = event.target?.closest?.("[data-inventory-tab]");
  if (!tabButton) {
    return;
  }

  runGuardedUiAction(() => {
    if (typeof setInventoryTab === "function") {
      setInventoryTab(tabButton.dataset.inventoryTab, state);
    }
    renderGame();
  }, {
    source: "overlay-action",
    actionId: `inventory:tab:${tabButton.dataset.inventoryTab || ""}`,
    allowedModes: ["normal"],
  });
}

function handleInventoryListClick(event) {
  const useButton = event.target?.closest?.("[data-inventory-use-id]");
  if (!useButton) {
    return;
  }

  runGuardedUiAction(() => {
    useInventoryConsumable(useButton.dataset.inventoryUseId, state);
  }, {
    source: "overlay-action",
    actionId: `inventory:use:${useButton.dataset.inventoryUseId || ""}`,
    allowedModes: ["normal"],
  });
}

function prepareDayStateLegacy(targetState = state) {
  prepareDayState(targetState);
}

function collectTrash(itemId) {
  if (state.scene !== "cleanup" || !state.cleaningGame) {
    return;
  }

  const item = state.cleaningGame.items.find((entry) => entry.id === itemId);

  if (!item || item.collected) {
    return;
  }

  spendEnergy(1);
  item.collected = true;
  state.cleaningGame.remaining -= 1;

  if (state.cleaningGame.remaining <= 0) {
    if (!finishRegisteredCleanupEvent()) {
      state.cleaningGame = null;
      renderGame();
    }
    return;
  }

  renderGame();
}

/* ── 스마트폰 앱 액션 ────────────────────────────────── */
function finishPhoneAppTimeSpend(timeSpent) {
  const reachedDayEnd = timeSpent.type === "minor"
    ? spendMinorTime(timeSpent.amount)
    : spendTimeSlots(timeSpent.amount);

  if (reachedDayEnd) {
    advanceDayOrFinish();
    return true;
  }

  renderGame();
  return false;
}

function openBusPhoneSurface(route = "bus/home") {
  if (!state.hasPhone) {
    return;
  }

  const hasBusApp = typeof isPhoneAppInstalled === "function"
    ? isPhoneAppInstalled("bus", state)
    : false;

  if (hasBusApp && typeof openPhoneRoute === "function") {
    openPhoneRoute(route, state);
    renderGame();
    return;
  }

  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("playstore", {
      kicker: "STORE",
      title: "배금버스 앱 필요",
      body: "플레이스토어에서 바로 설치 가능.",
      tone: "accent",
    }, state);
  }

  if (typeof openPhoneRoute === "function") {
    openPhoneRoute("playstore/home", state);
  }
  renderGame();
}

function rideBusFromPhone(locationId = "") {
  const targetLocation = String(locationId || "").trim();
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(state)
    : "";
  const canBoard = currentLocationId === "bus-stop" || currentLocationId === "bus-stop-map";

  if (!targetLocation) {
    return;
  }

  if (!canBoard) {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("bus", {
        kicker: "BUS",
        title: "터미널 앞에서만 탑승 가능",
        body: "정류장이나 안내판 앞에서 이용 가능.",
        tone: "fail",
      }, state);
    }
    renderGame();
    return;
  }

  if (targetLocation === "bus-stop") {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("bus", {
        kicker: "BUS",
        title: "현재 정류장",
        body: "다른 정차 구간을 선택.",
        tone: "accent",
      }, state);
    }
    renderGame();
    return;
  }

  handleOutsideOption({
    action: "move",
    targetLocation,
    travelVia: "bus",
  });
}

function buildEscapeEndingSummary() {
  const originLabel = getStartingOriginLabel();
  return {
    noRanking: true,
    originLabel,
    originTierId: getStartingOriginTierId(),
    title: "당신은 배금도시를 떠났다",
    speaker: "메트로폴리스행 고속버스",
    tags: ["도시 이탈", "새로운 자유", originLabel],
    character: "",
    backgroundConfig: typeof DAY01_WORLD_METROPOLIS_ENDING_BACKGROUND !== "undefined"
      ? DAY01_WORLD_METROPOLIS_ENDING_BACKGROUND
      : null,
    lines: [
      "고속버스를 타고 배금도시를 떠났다.",
      `출신 수저 ${originLabel}`,
      "이번 선택은 랭킹에 반영되지 않았다.",
      "당신은 새로운 자유를 찾아 도시 밖으로 나갔다.",
    ],
  };
}

function takeMetropolisExpressBus() {
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(state)
    : "";
  const canBoard = currentLocationId === "bus-stop" || currentLocationId === "bus-stop-map";

  if (!canBoard) {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("bus", {
        kicker: "BUS",
        title: "터미널에서만 고속버스 승차 가능",
        body: "배금시외버스터미널 앞에 도착해야 메트로폴리스행 고속버스를 탈 수 있다.",
        tone: "fail",
      }, state);
    }
    renderGame();
    return;
  }

  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(state);
  }
  if (typeof patchPhoneSession === "function") {
    patchPhoneSession(state, {
      minimized: true,
      stageExpanded: false,
      route: "home",
    });
  }

  clearPendingTravelState(state);
  clearAlleyNpcState(state);
  state.currentOffer = null;
  state.currentIncident = null;
  state.lastResult = null;
  state.scene = "ending";
  state.endingSummary = buildEscapeEndingSummary();
  state.headline = {
    badge: "도시 이탈",
    text: "메트로폴리스행 고속버스가 배금도시 바깥으로 미끄러져 나간다.",
  };
  renderGame();
}

function refreshNewsFeed() {
  const feedItems = typeof getDisInternetFeedEntries === "function"
    ? getDisInternetFeedEntries(state)
    : [];
  const picked = feedItems.length
    ? sample(feedItems)
    : {
        kicker: "NEWS",
        title: "뉴스 대기",
        body: "아직 불러올 수 있는 뉴스가 없습니다.",
        tone: "accent",
      };

  setPhoneAppStatus("news", {
    kicker: picked.kicker,
    title: picked.title,
    body: picked.body,
    tone: picked.tone,
  });
  state.phonePreview = createPhoneResultPreview("news", picked.kicker, picked.title, picked.body);
  setHeadline("📰 뉴스", picked.body);
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function refreshDisInternetFeed() {
  const feedItems = typeof getDisInternetFeedEntries === "function"
    ? getDisInternetFeedEntries(state)
    : [];
  const picked = feedItems.length
    ? sample(feedItems)
    : {
        kicker: "DIGGLE",
        title: "검색 인덱스 대기",
        body: "아직 반영된 실시간 이슈가 없습니다.",
        tone: "accent",
      };

  setPhoneAppStatus("dis", {
    kicker: picked.kicker,
    title: picked.title,
    body: picked.body,
    tone: picked.tone,
  });
  state.phonePreview = createPhoneResultPreview("dis", picked.kicker, picked.title, picked.body);
  setHeadline("🌐 Diggle", picked.body);
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function getDisCommunityScope(actionTarget) {
  return actionTarget?.closest(".dis-community-shell")
    || actionTarget?.closest(".dis-community-compact-shell")
    || actionTarget?.closest(".dis-app")
    || ui.phoneAppScreen
    || ui.phoneStage
    || ui.phonePanel;
}

function openDisCommunityRoute(route, { expandStage = false } = {}) {
  if (typeof openPhoneRoute === "function") {
    openPhoneRoute(route, state);
  }

  if (expandStage && typeof patchPhoneSession === "function") {
    patchPhoneSession(state, {
      minimized: false,
      stageExpanded: true,
      route,
    });
  }

  renderGame();
}

function openDisCommunityPost(postId, { expandStage = false } = {}) {
  if (typeof setDisCommunitySelectedPostId === "function") {
    setDisCommunitySelectedPostId(postId, state);
  }

  if (typeof incrementDisCommunityPostView === "function") {
    incrementDisCommunityPostView(postId);
  }

  openDisCommunityRoute("dis/singularity-read", { expandStage });
}

function submitDisCommunityPostFromPhone(actionTarget) {
  const scopedRoot = getDisCommunityScope(actionTarget);
  const authorInput = scopedRoot?.querySelector('[data-dis-community-input="author"]');
  const titleInput = scopedRoot?.querySelector('[data-dis-community-input="title"]');
  const contentInput = scopedRoot?.querySelector('[data-dis-community-input="content"]');
  const payload = {
    author: String(authorInput?.value ?? state.disCommunity?.draft?.author ?? "").trim(),
    title: String(titleInput?.value ?? state.disCommunity?.draft?.title ?? "").trim(),
    content: String(contentInput?.value ?? state.disCommunity?.draft?.content ?? "").trim(),
  };

  if (typeof setDisCommunityDraftField === "function") {
    setDisCommunityDraftField("author", payload.author, state);
    setDisCommunityDraftField("title", payload.title, state);
    setDisCommunityDraftField("content", payload.content, state);
  }

  if (typeof submitDisCommunityPost !== "function") {
    return;
  }

  submitDisCommunityPost(payload, state).then((result) => {
    if (!result?.ok) {
      state.headline = {
        badge: "Diggle",
        text: "제목과 내용을 입력해야 한다.",
      };
      renderGame();
      return;
    }

    if (typeof setDisCommunityDraftField === "function") {
      setDisCommunityDraftField("title", "", state);
      setDisCommunityDraftField("content", "", state);
    }

    state.headline = {
      badge: "Diggle",
      text: result.online ? "실시간 글이 갤러리에 올라갔다." : "연결이 없어 로컬 미리보기로 저장했다.",
    };
    openDisCommunityRoute("dis/singularity-read", { expandStage: true });
  });
}

function submitDisCommunityCommentFromPhone(actionTarget) {
  const postId = String(actionTarget?.dataset.postId || "").trim();
  const scopedRoot = getDisCommunityScope(actionTarget);
  const authorInput = scopedRoot?.querySelector('[data-dis-community-input="comment-author"]');
  const contentInput = scopedRoot?.querySelector('[data-dis-community-input="comment-content"]');
  const payload = {
    author: String(authorInput?.value ?? state.disCommunity?.commentDraft?.author ?? "").trim(),
    content: String(contentInput?.value ?? state.disCommunity?.commentDraft?.content ?? "").trim(),
  };

  if (typeof setDisCommunityCommentDraftField === "function") {
    setDisCommunityCommentDraftField("author", payload.author, state);
    setDisCommunityCommentDraftField("content", payload.content, state);
  }

  if (typeof submitDisCommunityComment !== "function") {
    return;
  }

  submitDisCommunityComment(postId, payload).then((result) => {
    if (!result?.ok) {
      state.headline = {
        badge: "Diggle",
        text: "댓글 내용을 입력해야 한다.",
      };
      renderGame();
      return;
    }

    if (typeof setDisCommunityCommentDraftField === "function") {
      setDisCommunityCommentDraftField("content", "", state);
    }

    state.headline = {
      badge: "Diggle",
      text: result.online ? "댓글이 실시간으로 반영됐다." : "댓글을 로컬 미리보기에 저장했다.",
    };
    renderGame();
  });
}

function runDisInternetSearch(actionTarget) {
  const scopedRoot = actionTarget?.closest(".dis-search-panel")
    || actionTarget?.closest(".dis-app")
    || ui.phoneAppScreen
    || ui.phoneStage;
  const input = actionTarget?.dataset.query
    ? null
    : scopedRoot?.querySelector("[data-dis-search-input]");
  const query = typeof actionTarget?.dataset.query === "string" && actionTarget.dataset.query.trim()
    ? actionTarget.dataset.query.trim()
    : String(input?.value || "").trim();
  const summary = typeof getDisInternetSearchSummary === "function"
    ? getDisInternetSearchSummary(query, state)
    : {
        kicker: "SEARCH",
        title: "검색",
        body: "검색 결과를 불러오지 못했습니다.",
        tone: "accent",
      };

  state.disSearchQuery = query;
  setPhoneAppStatus("dis", {
    kicker: summary.kicker,
    title: summary.title,
    body: summary.body,
    tone: summary.tone,
  });
  state.phonePreview = createPhoneResultPreview("dis", summary.kicker, summary.title, summary.body);
  setHeadline("🌐 Diggle", summary.body);
  renderGame();
}

function getDisGambleScope(actionTarget) {
  return actionTarget?.closest(".dis-gamble-panel")
    || actionTarget?.closest(".dis-gamble-app")
    || actionTarget?.closest(".dis-app")
    || ui.phoneAppScreen
    || ui.phoneStage;
}

function ensureDisGambleDrafts(targetState = state) {
  if (!targetState) {
    return null;
  }

  if (!targetState.disGambleDrafts || typeof targetState.disGambleDrafts !== "object") {
    targetState.disGambleDrafts = {
      "odd-even": "1000",
      ladder: "5000",
    };
  }

  return targetState.disGambleDrafts;
}

function normalizeDisGambleGameId(gameId = "") {
  return String(gameId || "").toLowerCase() === "ladder" ? "ladder" : "odd-even";
}

function setDisGambleDraftAmount(gameId, nextValue, targetState = state) {
  const drafts = ensureDisGambleDrafts(targetState);
  if (!drafts) {
    return "";
  }

  const normalizedGameId = normalizeDisGambleGameId(gameId);
  drafts[normalizedGameId] = String(nextValue ?? "").replace(/[^\d]/g, "");
  return drafts[normalizedGameId];
}

function getDisGambleBetAmount(gameId, actionTarget) {
  const scopedRoot = getDisGambleScope(actionTarget);
  const input = scopedRoot?.querySelector(`[data-dis-gamble-input="${gameId}"]`);
  const liveValue = String(input?.value ?? "").replace(/[^\d]/g, "");
  if (liveValue) {
    setDisGambleDraftAmount(gameId, liveValue, state);
  }

  const drafts = ensureDisGambleDrafts(state);
  return Math.floor(Number(liveValue || drafts?.[normalizeDisGambleGameId(gameId)] || 0) || 0);
}

function setDisGambleOutcome({
  title,
  body,
  tone = "accent",
  kicker = "SHADOW",
}) {
  setPhoneAppStatus("dis", {
    kicker,
    title,
    body,
    tone,
  });
  state.phonePreview = createPhoneResultPreview("dis", kicker, title, body);
  setHeadline("🌐 Diggle", body);
}

function validateDisGambleBet(gameId, actionTarget) {
  const betAmount = getDisGambleBetAmount(gameId, actionTarget);
  const balance = typeof getWalletBalance === "function"
    ? getWalletBalance(state)
    : state.money;

  if (betAmount < 1000) {
    setDisGambleOutcome({
      title: "베팅 금액 오류",
      body: "최소 1,000원 이상부터 걸 수 있습니다.",
      tone: "fail",
    });
    renderGame();
    return null;
  }

  if (betAmount > balance) {
    setDisGambleOutcome({
      title: "현금 부족",
      body: "손에 쥔 현금보다 큰 금액은 걸 수 없습니다.",
      tone: "fail",
    });
    renderGame();
    return null;
  }

  if (typeof spendCash === "function" && !spendCash(betAmount, state)) {
    setDisGambleOutcome({
      title: "정산 실패",
      body: "지갑 정리에 실패해서 베팅을 진행하지 못했습니다.",
      tone: "fail",
    });
    renderGame();
    return null;
  }

  if (typeof spendCash !== "function") {
    state.money = Math.max(0, state.money - betAmount);
  }

  return betAmount;
}

function isDisGambleScamTriggered(betAmount = 0) {
  const normalizedBet = Math.max(0, Math.floor(Number(betAmount) || 0));
  const scamChance = normalizedBet >= 50000 ? 0.18 : 0.12;
  return Math.random() < scamChance;
}

function runDisOddEven(actionTarget) {
  const betAmount = validateDisGambleBet("odd-even", actionTarget);
  if (!betAmount) {
    return;
  }

  const choice = actionTarget?.dataset.choice === "even" ? "짝" : "홀";
  const choiceKey = actionTarget?.dataset.choice === "even" ? "even" : "odd";

  if (isDisGambleScamTriggered(betAmount)) {
    const message = `홀짝 정산이 지연된다는 문구만 남기고 사이트가 닫혔다. ${formatMoney(betAmount)}은 돌아오지 않았다.`;
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(-betAmount);
    }
    setDisGambleOutcome({
      title: "먹튀 발생",
      body: message,
      tone: "fail",
    });
    finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
    return;
  }

  const rolledNumber = Math.floor(Math.random() * 10) + 1;
  const resultKey = rolledNumber % 2 === 0 ? "even" : "odd";

  if (choiceKey === resultKey) {
    const payout = betAmount * 2;
    if (typeof earnCash === "function") {
      earnCash(payout, state);
    } else {
      state.money += payout;
    }
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(betAmount);
    }
    setDisGambleOutcome({
      title: "홀짝 적중",
      body: `${rolledNumber}이 떠서 ${choice}이 맞았습니다. ${formatMoney(payout)}을 정산받았습니다.`,
      tone: "success",
    });
  } else {
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(-betAmount);
    }
    setDisGambleOutcome({
      title: "홀짝 실패",
      body: `${rolledNumber}이 떠서 ${choice} 선택이 빗나갔습니다. ${formatMoney(betAmount)}을 잃었습니다.`,
      tone: "fail",
    });
  }

  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

function runDisLadder(actionTarget) {
  const betAmount = validateDisGambleBet("ladder", actionTarget);
  if (!betAmount) {
    return;
  }

  const selectedLane = String(actionTarget?.dataset.lane || "left");
  const laneLabels = {
    left: "좌",
    center: "중",
    right: "우",
  };

  if (isDisGambleScamTriggered(betAmount)) {
    const message = `사다리 결과 창이 열리기 직전에 링크가 끊겼다. ${formatMoney(betAmount)}은 먹튀 처리됐다.`;
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(-betAmount);
    }
    setDisGambleOutcome({
      title: "먹튀 발생",
      body: message,
      tone: "fail",
    });
    finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
    return;
  }

  const winningLane = sample(["left", "center", "right"]);
  if (selectedLane === winningLane) {
    const payout = Math.round(betAmount * 2.4);
    if (typeof earnCash === "function") {
      earnCash(payout, state);
    } else {
      state.money += payout;
    }
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(payout - betAmount);
    }
    setDisGambleOutcome({
      title: "사다리 적중",
      body: `${laneLabels[winningLane]} 줄이 당첨으로 열렸습니다. ${formatMoney(payout)}을 정산받았습니다.`,
      tone: "success",
    });
  } else {
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(-betAmount);
    }
    setDisGambleOutcome({
      title: "사다리 실패",
      body: `${laneLabels[winningLane]} 줄이 당첨이었습니다. 선택한 ${laneLabels[selectedLane] || "좌"} 줄은 꽝이어서 ${formatMoney(betAmount)}을 잃었습니다.`,
      tone: "fail",
    });
  }

  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

function installPhoneAppFromStore(appId) {
  const manifest = typeof getPhoneAppManifest === "function"
    ? getPhoneAppManifest(appId, state)
    : null;

  if (!manifest || !manifest.installable) {
    return;
  }

  if (typeof installPhoneApp === "function" && !installPhoneApp(appId, state)) {
    setPhoneAppStatus("playstore", {
      kicker: "STORE",
      title: `${manifest.label} 이미 설치됨`,
      body: "홈 화면에서 바로 확인할 수 있습니다.",
      tone: "accent",
    });
    renderGame();
    return;
  }

  const message = `${manifest.label} 앱이 홈 화면에 추가됐다.`;
  setPhoneAppStatus("playstore", {
    kicker: "INSTALL",
    title: `${manifest.label} 설치 완료`,
    body: message,
    tone: "success",
  });
  state.phonePreview = createPhoneResultPreview("playstore", "INSTALL", `${manifest.label} 설치 완료`, message);
  setHeadline("🛒 플레이스토어", message);
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function callHomeContact() {
  const lines = [
    "엄마가 밥은 꼭 챙겨 먹으라고 했다.",
    "엄마가 오늘도 무사히 버티라고 짧게 말했다.",
    "집에 너무 늦지 말라는 말이 귓가에 남았다.",
  ];
  const message = sample(lines);

  setPhoneAppStatus("call", {
    kicker: "CALL LOG",
    title: "엄마와 통화",
    body: message,
    tone: "accent",
  });
  state.phonePreview = createPhoneResultPreview("call", "CALL", "엄마와 통화", message);
  setHeadline("📞 전화", message);
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function callRomancePhoneContact(contactId = "") {
  if (!contactId || typeof callRomanceContact !== "function") {
    return false;
  }

  return callRomanceContact(contactId, state);
}

function setBankAppStatusMessage({
  kicker = "BANK",
  title = "배금은행",
  body = "",
  tone = "accent",
  previewTitle = title,
} = {}) {
  setPhoneAppStatus("bank", {
    kicker,
    title,
    body,
    tone,
  });
  state.phonePreview = createPhoneResultPreview("bank", kicker, previewTitle, body);
  setHeadline("🏦 은행", body);
}

function setSimpleBankFailureStatus({
  kicker = "BANK",
  title = "처리 불가",
  body = "다시 확인해 주세요.",
} = {}) {
  setBankAppStatusMessage({
    kicker,
    title,
    body,
    tone: "fail",
    previewTitle: title,
  });
}

function resolvePhoneAmountValue(rawValue, maxAmount = 0) {
  const numericMax = Math.max(0, Math.round(Number(maxAmount) || 0));
  const normalized = String(rawValue || "").trim().toLowerCase();

  if (!normalized) {
    return 0;
  }

  if (normalized === "all") {
    return numericMax;
  }

  const parsed = Math.round(Number(normalized) || 0);
  return Math.max(0, Math.min(parsed, numericMax));
}

function getBankTransferRoot(actionTarget) {
  return actionTarget?.closest("[data-bank-transfer-root]") || null;
}

function getBankTransferForm(actionTarget) {
  return getBankTransferRoot(actionTarget)?.querySelector("[data-bank-transfer-form]")
    || actionTarget?.closest("[data-bank-transfer-form]")
    || null;
}

function getBankTransferFormValues(actionTarget) {
  const bankState = typeof getBankDomainState === "function"
    ? getBankDomainState(state)
    : { transferDraft: { recipient: "", amount: "" } };
  const form = getBankTransferForm(actionTarget);
  const recipientInput = form?.querySelector("[data-bank-transfer-input='recipient']");
  const amountInput = form?.querySelector("[data-bank-transfer-input='amount']");

  return {
    recipient: String(recipientInput?.value ?? bankState.transferDraft?.recipient ?? "").trim(),
    amount: String(amountInput?.value ?? bankState.transferDraft?.amount ?? "").trim(),
  };
}

function updateBankTransferDraft(patch = {}) {
  if (typeof patchBankDomainState !== "function") {
    return null;
  }

  const bankState = typeof getBankDomainState === "function"
    ? getBankDomainState(state)
    : { transferDraft: { recipient: "", amount: "" } };

  return patchBankDomainState(state, {
    transferDraft: {
      ...(bankState.transferDraft || {}),
      ...patch,
    },
  });
}

function depositCashToBank(actionTarget) {
  const availableCash = typeof getWalletBalance === "function"
    ? getWalletBalance(state)
    : Math.max(0, Number(state.money) || 0);
  const amount = resolvePhoneAmountValue(actionTarget?.dataset.amount, availableCash);

  if (!amount || availableCash <= 0) {
    setSimpleBankFailureStatus({
      title: "입금 불가",
      body: "현금이 부족합니다.",
    });
    renderGame();
    return;
  }

  if (typeof spendCash === "function" && !spendCash(amount)) {
    setSimpleBankFailureStatus({
      title: "입금 불가",
      body: "현금이 부족합니다.",
    });
    renderGame();
    return;
  }

  const bankState = typeof getBankDomainState === "function"
    ? getBankDomainState(state)
    : { balance: 0 };

  if (typeof patchBankDomainState === "function") {
    if (typeof earnBankBalance === "function") {
      earnBankBalance(amount, {
        title: "현금 입금",
        type: "deposit",
        direction: "in",
        note: "지갑의 현금을 계좌로 이동",
      }, state);
    } else {
      patchBankDomainState(state, {
        balance: bankState.balance + amount,
      });
    }
  } else {
    state.bank = {
      ...(state.bank || {}),
      balance: (state.bank?.balance || 0) + amount,
    };
  }

  showMoneyEffect(-amount);
  recordActionMemory("현금을 계좌에 넣었다", `${formatMoney(amount)}을 계좌로 옮겼다.`, {
    type: "finance",
    source: "은행 앱",
    tags: ["은행", "입금"],
  });
  setBankAppStatusMessage({
    kicker: "DEPOSIT",
    title: "현금 입금 완료",
    body: `${formatMoney(amount)}을 계좌로 옮겼다.`,
    tone: "success",
    previewTitle: "현금 입금 완료",
  });
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function withdrawCashFromBank(actionTarget) {
  const bankState = typeof getBankDomainState === "function"
    ? getBankDomainState(state)
    : { balance: 0 };
  const amount = resolvePhoneAmountValue(actionTarget?.dataset.amount, bankState.balance);

  if (!amount || bankState.balance <= 0) {
    setSimpleBankFailureStatus({
      title: "출금 불가",
      body: "계좌 잔고가 부족합니다.",
    });
    renderGame();
    return;
  }

  const bankSpent = typeof spendBankBalance === "function"
    ? spendBankBalance(amount, {
        title: "현금 출금",
        type: "withdraw",
        direction: "out",
        note: "계좌 잔액을 현금으로 인출",
      }, state)
    : false;

  if (!bankSpent && typeof patchBankDomainState === "function") {
    patchBankDomainState(state, {
      balance: Math.max(0, bankState.balance - amount),
    });
  } else if (!bankSpent) {
    state.bank = {
      ...(state.bank || {}),
      balance: Math.max(0, (state.bank?.balance || 0) - amount),
    };
  }

  if (typeof earnCash === "function") {
    earnCash(amount);
  } else {
    state.money += amount;
  }

  showMoneyEffect(amount);
  recordActionMemory("계좌에서 현금을 뺐다", `${formatMoney(amount)}을 현금으로 인출했다.`, {
    type: "finance",
    source: "은행 앱",
    tags: ["은행", "출금"],
  });
  setBankAppStatusMessage({
    kicker: "WITHDRAW",
    title: "현금 출금 완료",
    body: `${formatMoney(amount)}을 손에 쥐었다.`,
    tone: "accent",
    previewTitle: "현금 출금 완료",
  });
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function fillBankTransferRecipient(actionTarget) {
  const recipient = String(actionTarget?.dataset.recipient || "").trim();

  if (!recipient) {
    return;
  }

  updateBankTransferDraft({ recipient });
  renderGame();
}

function fillBankTransferAmount(actionTarget) {
  const amount = String(actionTarget?.dataset.amount || "").trim();

  if (!amount) {
    return;
  }

  updateBankTransferDraft({ amount });
  renderGame();
}

function submitBankTransfer(actionTarget) {
  const bankState = typeof getBankDomainState === "function"
    ? getBankDomainState(state)
    : { balance: 0, transferDraft: { recipient: "", amount: "" } };
  const formValues = getBankTransferFormValues(actionTarget);
  updateBankTransferDraft(formValues);

  const recipient = formValues.recipient;
  const amount = Math.max(0, Math.round(Number(formValues.amount) || 0));

  if (!recipient) {
    setSimpleBankFailureStatus({
      kicker: "TRANSFER",
      title: "송금 불가",
      body: "받는 사람을 입력하세요.",
    });
    renderGame();
    return;
  }

  if (!amount) {
    setSimpleBankFailureStatus({
      kicker: "TRANSFER",
      title: "송금 불가",
      body: "금액을 입력하세요.",
    });
    renderGame();
    return;
  }

  if (bankState.balance < amount) {
    setSimpleBankFailureStatus({
      kicker: "TRANSFER",
      title: "송금 불가",
      body: "계좌 잔고가 부족합니다.",
    });
    renderGame();
    return;
  }

  if (typeof patchBankDomainState === "function") {
    patchBankDomainState(state, {
      balance: Math.max(0, bankState.balance - amount),
      transferDraft: {
        recipient: "",
        amount: "",
      },
    });
  } else {
    state.bank = {
      ...(state.bank || {}),
      balance: Math.max(0, (state.bank?.balance || 0) - amount),
    };
  }

  if (typeof recordBankTransaction === "function") {
    recordBankTransaction({
      title: `${recipient} 송금`,
      amount: -amount,
      type: "transfer",
      direction: "out",
      note: "즉시 이체",
    });
  }

  if (typeof openPhoneRoute === "function") {
    openPhoneRoute("bank/home", state);
  } else {
    state.phoneView = "bank/home";
  }

  setBankAppStatusMessage({
    kicker: "TRANSFER",
    title: "송금 완료",
    body: `${recipient}에게 ${formatMoney(amount)}을 송금했다.`,
    tone: "success",
    previewTitle: "송금 완료",
  });
  recordActionMemory("송금을 마쳤다", `${recipient}에게 ${formatMoney(amount)}을 보냈다.`, {
    type: "finance",
    source: "은행 앱",
    tags: ["은행", "송금"],
  });
  finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
}

function applyBankLoanActionResult(result, { spendTime = true, route = "bank/loans" } = {}) {
  if (!result) {
    renderGame();
    return;
  }

  if (typeof openPhoneRoute === "function") {
    openPhoneRoute(route, state);
  } else {
    state.phoneView = route;
  }

  setBankAppStatusMessage({
    kicker: result.kicker || "BANK",
    title: result.title || "은행 상태",
    body: result.body || "",
    tone: result.tone || (result.ok ? "success" : "fail"),
    previewTitle: result.title || "은행 상태",
  });

  if (Number.isFinite(result.cashDelta) && result.cashDelta !== 0) {
    showMoneyEffect(result.cashDelta);
  }

  if (spendTime) {
    finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
    return;
  }

  renderGame();
}

function requestBankLoan(actionTarget) {
  const loanType = String(actionTarget?.dataset.loanType || "").trim();
  if (!loanType || typeof createBankLoan !== "function") {
    renderGame();
    return;
  }

  if (typeof updateBankLoanDraft === "function") {
    updateBankLoanDraft({ selectedType: loanType }, state);
  }

  const result = createBankLoan(loanType, state);
  applyBankLoanActionResult(result, { spendTime: true, route: "bank/loans" });
}

function repayBankLoanFromPhone(actionTarget, mode = "minimum") {
  const loanId = String(actionTarget?.dataset.loanId || "").trim();
  if (!loanId || typeof finalizeBankLoanPayment !== "function") {
    renderGame();
    return;
  }

  const result = finalizeBankLoanPayment(loanId, mode, state);
  applyBankLoanActionResult(result, { spendTime: true, route: "bank/loans" });
}

function recordActionMemory(title, body, { type = "action", source = "", tags = [] } = {}) {
  if (typeof recordMemoryEntry !== "function") {
    return null;
  }

  return recordMemoryEntry({
    type,
    title,
    body,
    source,
    tags,
  }, state);
}

function ensureMetaRunStateReady(targetState = state) {
  if (typeof syncMetaRunState === "function") {
    syncMetaRunState(targetState);
  }
  return targetState;
}

function addUnlockEntry(bucket, id, targetState = state) {
  if (!id) {
    return;
  }

  ensureMetaRunStateReady(targetState);
  const list = Array.isArray(targetState.unlocks?.[bucket]) ? targetState.unlocks[bucket] : [];
  if (!list.includes(id)) {
    list.push(id);
  }
  targetState.unlocks[bucket] = list;
}

function patchSocialContact(contactId, patch = {}, targetState = state) {
  if (!contactId) {
    return {};
  }

  ensureMetaRunStateReady(targetState);
  const current = targetState.social.contacts?.[contactId] || {};
  const next = {
    ...current,
    ...patch,
  };
  targetState.social.contacts[contactId] = next;
  return next;
}

function patchProgressionRoute(routeKey, patch = {}, targetState = state) {
  if (!routeKey) {
    return {};
  }

  ensureMetaRunStateReady(targetState);
  const current = targetState.progression.routes?.[routeKey] || {};
  const next = {
    ...current,
    ...patch,
  };
  targetState.progression.routes[routeKey] = next;
  return next;
}

function getCareerRouteProgress(targetState = state) {
  const route = targetState?.progression?.routes?.career;
  const snapshot = route && typeof route === "object" ? route : {};
  return {
    ...snapshot,
    aiStudyBookPublished: Boolean(snapshot.aiStudyBookPublished),
    aiDepartmentEstablished: Boolean(snapshot.aiDepartmentEstablished),
    aiStudyTurns: Math.max(0, Math.round(Number(snapshot.aiStudyTurns) || 0)),
  };
}

function publishAiStudyBook() {
  const careerRoute = getCareerRouteProgress(state);
  if (careerRoute.aiStudyBookPublished) {
    state.headline = {
      badge: "AI 서적 집필",
      text: "이미 도서관에서 인공지능 공부 서적을 만들어 둔 상태다.",
    };
    renderGame();
    return;
  }

  runStudyDistrictEvent({
    badge: "AI 서적 집필",
    text: "도서관 자료를 뒤져 인공지능 공부 서적을 만들었다.",
    memoryTitle: "도서관에서 AI 공부 서적을 만들었다",
    memoryBody: "논문과 강의 노트를 묶어 인공지능 공부 서적을 완성했다. 이 책을 계기로 대학에서 새 전공 이야기가 돌기 시작했다.",
    prepKey: "academic",
    prepGain: 1,
    intelligenceDelta: 4,
    energyDelta: -12,
    happinessDelta: 2,
    routeKey: "career",
    routePatch: {
      activeRouteId: "ai",
      activeRouteLabel: "AI 루트",
      discoveredRouteIds: [...new Set([...(Array.isArray(careerRoute.discoveredRouteIds) ? careerRoute.discoveredRouteIds : []), "ai"])],
      aiStudyBookPublished: true,
      aiStudyBookDay: state.day,
    },
    unlockEventId: "ai-study-book",
    slots: 2,
    tags: ["도서관", "AI", "집필"],
  });
}

function studyAiMajor() {
  const careerRoute = getCareerRouteProgress(state);
  if (!careerRoute.aiStudyBookPublished) {
    state.headline = {
      badge: "AI 학과 미개방",
      text: "먼저 도서관에서 인공지능 공부 서적을 만들어야 대학에 인공지능학과가 신설된다.",
    };
    renderGame();
    return;
  }

  const isFirstDepartmentStudy = !careerRoute.aiDepartmentEstablished;
  const nextStudyTurns = careerRoute.aiStudyTurns + 1;

  runStudyDistrictEvent({
    badge: isFirstDepartmentStudy ? "AI 학과 신설" : "AI 학과 공부",
    text: isFirstDepartmentStudy
      ? "인공지능 공부가 화제가 되어 대학에 인공지능학과가 신설됐다."
      : "인공지능학과 세미나와 실습을 따라가며 AI 공부를 이어 갔다.",
    memoryTitle: isFirstDepartmentStudy
      ? "대학에 인공지능학과가 생겼다"
      : "인공지능학과에서 공부했다",
    memoryBody: isFirstDepartmentStudy
      ? "도서관에서 만든 AI 공부 서적이 퍼지면서 대학에 인공지능학과가 열렸다. 이제 연구직 루트가 본격적으로 보이기 시작한다."
      : "인공지능학과 강의와 세미나를 따라가며 연구직으로 가는 감각을 익혔다.",
    prepKey: "academic",
    prepGain: 1,
    intelligenceDelta: 5,
    energyDelta: -12,
    happinessDelta: isFirstDepartmentStudy ? 4 : 2,
    routeKey: "career",
    routePatch: {
      activeRouteId: "ai",
      activeRouteLabel: "AI 루트",
      discoveredRouteIds: [...new Set([...(Array.isArray(careerRoute.discoveredRouteIds) ? careerRoute.discoveredRouteIds : []), "ai"])],
      aiDepartmentEstablished: true,
      aiDepartmentDay: careerRoute.aiDepartmentEstablished
        ? careerRoute.aiDepartmentDay || state.day
        : state.day,
      aiStudyTurns: nextStudyTurns,
    },
    unlockEventId: isFirstDepartmentStudy ? "ai-department-opened" : "ai-major-study",
    slots: 2,
    tags: ["대학", "AI", "연구"],
  });
}

function resolveAiResearcherBaseIncome(targetState = state) {
  if (getCareerEmploymentPostingId(targetState) !== "ai-researcher") {
    return null;
  }

  const amount = AI_RESEARCHER_BASE_INCOME;
  const title = "AI 연구원 기본금 입금";
  const body = `인공지능 연구원 기본금 ${formatMoney(amount)}이 계좌로 들어왔다.`;
  const lines = [
    "인공지능 연구실 프로젝트가 오늘도 기본금을 지급했다.",
    `기본금 ${formatMoney(amount)}이 계좌로 입금됐다.`,
  ];

  if (typeof earnBankBalance === "function") {
    earnBankBalance(amount, {
      title,
      type: "income",
      direction: "in",
      note: "AI 연구원 기본금",
    }, targetState);
  } else if (typeof patchBankDomainState === "function") {
    const bankState = typeof getBankDomainState === "function"
      ? getBankDomainState(targetState)
      : { balance: 0 };
    patchBankDomainState(targetState, {
      balance: Math.max(0, Number(bankState.balance) || 0) + amount,
    });
    if (typeof recordBankTransaction === "function") {
      recordBankTransaction({
        title,
        amount,
        type: "income",
        direction: "in",
        note: "AI 연구원 기본금",
      }, targetState);
    }
  } else if (typeof earnCash === "function") {
    earnCash(amount, targetState);
  } else {
    targetState.money = Math.max(0, Number(targetState.money) || 0) + amount;
  }

  if (targetState === state && typeof showMoneyEffect === "function") {
    showMoneyEffect(amount, { destination: "bank" });
  }

  return {
    amount,
    badge: "AI 기본금",
    title: "AI 연구원 기본금",
    body,
    lines,
  };
}

function runStudyDistrictEvent({
  badge = "학습 구역",
  text = "",
  memoryTitle = "",
  memoryBody = "",
  prepKey = "",
  prepGain = 0,
  intelligenceDelta = 0,
  reputationDelta = 0,
  crimeDelta = 0,
  attractivenessDelta = 0,
  energyDelta = 0,
  energyGain = 0,
  happinessDelta = 0,
  routeKey = "",
  routePatch = null,
  contactId = "",
  contactPatch = null,
  unlockEventId = "",
  unlockNpcId = "",
  slots = 1,
  tags = [],
  ambientRomanceTrigger = "",
  ambientRomanceContext = null,
} = {}) {
  ensureMetaRunStateReady(state);
  const feedbackChips = [];

  if (prepKey && prepGain > 0 && typeof patchJobsDomainState === "function") {
    const prepState = getCareerPrepSnapshotForState(state);
    patchJobsDomainState(state, {
      careerPrep: {
        [prepKey]: Math.min(9, (prepState[prepKey] || 0) + prepGain),
      },
    });
    refreshCareerJobOffers(state);
    feedbackChips.push({
      label: `${getCareerPrepLabel(prepKey)} +${Math.max(0, Math.round(prepGain))}`,
      tone: "up",
    });
  }

  feedbackChips.push(
    ...applyPlayerSocialDelta({
      intelligence: intelligenceDelta,
      reputation: reputationDelta,
      crime: crimeDelta,
      attractiveness: attractivenessDelta,
      happiness: happinessDelta,
    }, state),
  );
  feedbackChips.push(
    ...applyPlayerNeedDelta({
      energy: energyDelta || energyGain,
    }, state),
  );

  if (routeKey && routePatch && typeof routePatch === "object") {
    patchProgressionRoute(routeKey, routePatch, state);
  }

  if (contactId && contactPatch && typeof contactPatch === "object") {
    patchSocialContact(contactId, contactPatch, state);
  }

  if (unlockEventId) {
    addUnlockEntry("events", unlockEventId, state);
  }

  if (unlockNpcId) {
    addUnlockEntry("npcs", unlockNpcId, state);
  }

  state.headline = {
    badge,
    text,
  };

  queueGameplayFeedback({
    title: badge || "행동 결과",
    tone: "up",
    chips: feedbackChips,
  }, state);

  if (typeof recordActionMemory === "function") {
    recordActionMemory(memoryTitle, memoryBody, {
      type: "event",
      source: getCurrentLocationLabel(),
      tags,
    });
  }

  if (spendTimeSlots(slots)) {
    advanceDayOrFinish();
    return;
  }

  if (
    ambientRomanceTrigger
    && typeof tryStartAmbientRomanceEvent === "function"
    && tryStartAmbientRomanceEvent(
      ambientRomanceTrigger,
      ambientRomanceContext || {
        locationId: typeof getCurrentLocationId === "function" ? getCurrentLocationId(state) : "",
        locationLabel: typeof getCurrentLocationLabel === "function" ? getCurrentLocationLabel(state) : "",
      },
      state,
    )
  ) {
    renderGame();
    return;
  }

  renderGame();
}

function useInventoryConsumable(itemId, targetState = state) {
  const definition = typeof getInventoryItemDefinition === "function"
    ? getInventoryItemDefinition(itemId)
    : null;
  const hungerRestore = Math.max(0, Math.round(Number(definition?.hungerRestore) || 0));
  const hungerMax = typeof HUNGER_MAX === "number" ? HUNGER_MAX : 100;
  const hungerState = ensureHungerState(targetState);

  if (!definition || !definition.id || !definition.useLabel || hungerRestore <= 0) {
    return false;
  }

  if (hungerState.value >= hungerMax) {
    targetState.headline = {
      badge: "배고픔 안정",
      text: `${definition.label}은 지금 먹지 않아도 될 만큼 배고픔이 버텨 주고 있다.`,
    };
    renderGame();
    return false;
  }

  if (typeof consumeInventoryItem === "function" && !consumeInventoryItem(definition.id, 1, targetState)) {
    targetState.headline = {
      badge: "사용 실패",
      text: `${definition.label}이 인벤토리에 남아 있지 않다.`,
    };
    renderGame();
    return false;
  }

  restoreHunger(hungerRestore, targetState, { resetProgress: true });
  targetState.headline = {
    badge: "허기 달램",
    text: `${definition.label}으로 배고픔을 달래 포만감을 ${targetState.hunger}/${hungerMax}까지 회복했다.`,
  };

  queueGameplayFeedback({
    title: `${definition.label} 사용`,
    tone: "up",
    chips: [
      buildGameplayFeedbackDeltaChip("배고픔", hungerRestore),
      {
        label: `${definition.label} 소비`,
        tone: "info",
      },
    ],
  }, targetState);

  if (typeof recordActionMemory === "function") {
    recordActionMemory(`${definition.label} 사용`, definition.useMemoryBody || `${definition.label}으로 배고픔을 달랬다.`, {
      type: "food",
      source: "인벤토리",
      tags: ["인벤토리", "배고픔", definition.id],
    });
  }

  renderGame();
  return true;
}

const PLASTIC_SURGERY_COST = 10000000;
const PLASTIC_SURGERY_GLAM_COST = 12000000;
const PLASTIC_SURGERY_RECOVERY_BACKGROUND = Object.freeze({
  className: "custom-location-bg",
  image: "assets/backgrounds/day01/baegeum-hospital-recovery.png",
  position: "center center",
  size: "cover",
  overlay: "linear-gradient(180deg, rgba(8, 15, 26, 0.06) 0%, rgba(8, 15, 26, 0.22) 100%)",
});
const PLASTIC_SURGERY_PLAN_LIBRARY = Object.freeze({
  natural: Object.freeze({
    id: "natural",
    label: "자연형",
    cost: PLASTIC_SURGERY_COST,
    attractivenessDelta: 2,
    happinessDelta: 8,
    consultationLine: "지금 인상을 크게 해치지 않고 깔끔하게 정리하는 방향이다.",
    memoryLine: "전체 인상을 부드럽고 깔끔하게 정리했다.",
  }),
  defined: Object.freeze({
    id: "defined",
    label: "또렷형",
    cost: PLASTIC_SURGERY_GLAM_COST,
    attractivenessDelta: 3,
    happinessDelta: 10,
    consultationLine: "눈에 띄는 도시형 라인을 살려 첫인상을 더 또렷하게 만든다.",
    memoryLine: "또렷한 라인을 살려 한 단계 강한 인상으로 정리했다.",
  }),
});

function getPlasticSurgeryEventLocationId(targetState = state) {
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  return String(currentLocationId || "baegeum-hospital").trim() || "baegeum-hospital";
}

function getAppearanceLevelForProfileId(profileId = "") {
  const normalizedProfileId = String(profileId || "").trim();

  if (["level3Start", "level3Mid", "level3Final"].includes(normalizedProfileId)) {
    return 3;
  }

  if (normalizedProfileId === "level2") {
    return 2;
  }

  return 1;
}

function getPlasticSurgeryResultProfileId(planId = "", targetState = state) {
  const normalizedPlanId = String(planId || "").trim().toLowerCase();
  const originProfileId = typeof getPlayerOriginAppearanceProfileId === "function"
    ? getPlayerOriginAppearanceProfileId(targetState)
    : "level1";

  if (normalizedPlanId === "defined") {
    if (originProfileId === "level3Start") {
      return "level3Final";
    }
    if (originProfileId === "level2") {
      return "level3Final";
    }
    return "level3Start";
  }

  if (originProfileId === "level3Start") {
    return "level3Final";
  }
  if (originProfileId === "level2") {
    return "level3Mid";
  }
  return "level2";
}

function getPlasticSurgeryPlanDefinition(planId = "", targetState = state) {
  const normalizedPlanId = String(planId || "").trim().toLowerCase();
  const basePlan = PLASTIC_SURGERY_PLAN_LIBRARY[normalizedPlanId] || null;
  if (!basePlan) {
    return null;
  }

  const resultProfileId = getPlasticSurgeryResultProfileId(normalizedPlanId, targetState);
  const expectedAppearanceLevel = getAppearanceLevelForProfileId(resultProfileId);

  return {
    ...basePlan,
    resultProfileId,
    expectedAppearanceLevel,
    expectedAppearanceLabel: `${expectedAppearanceLevel}LV`,
  };
}

function getPlasticSurgeryPlanDefinitions(targetState = state) {
  return Object.keys(PLASTIC_SURGERY_PLAN_LIBRARY)
    .map((planId) => getPlasticSurgeryPlanDefinition(planId, targetState))
    .filter(Boolean);
}

function createPlasticSurgeryEventSnapshot(targetState = state, patch = {}) {
  const currentEvent = targetState?.plasticSurgeryEvent && typeof targetState.plasticSurgeryEvent === "object"
    ? targetState.plasticSurgeryEvent
    : {};
  const fallbackLocationId = getPlasticSurgeryEventLocationId(targetState);
  const resolvedLocationId = String(
    patch.locationId
    || currentEvent.locationId
    || fallbackLocationId
    || "baegeum-hospital"
  ).trim() || "baegeum-hospital";

  return {
    stage: "consultation",
    selectedPlanId: "",
    locationId: resolvedLocationId,
    spentAmount: 0,
    resultProfileId: "",
    afterAppearanceLevel: 0,
    dayEnded: false,
    completed: false,
    ...currentEvent,
    ...patch,
    locationId: resolvedLocationId,
  };
}

function getPlasticSurgerySceneConfig(targetState = state) {
  const plasticEvent = targetState?.plasticSurgeryEvent;
  if (!plasticEvent || typeof plasticEvent !== "object") {
    return null;
  }

  const stage = String(plasticEvent.stage || "consultation").trim().toLowerCase() || "consultation";
  const hospitalLocation = typeof getDayWorldLocationMap === "function"
    ? getDayWorldLocationMap(targetState?.day || getCurrentDayNumber())?.[plasticEvent.locationId || "baegeum-hospital"]
    : null;
  const lobbyBackground = hospitalLocation?.background || null;
  const plan = getPlasticSurgeryPlanDefinition(plasticEvent.selectedPlanId, targetState);
  const afterAppearanceLevel = Math.max(
    1,
    Number(plasticEvent.afterAppearanceLevel) || getPlayerAppearanceLevel(targetState),
  );
  const afterAppearanceLabel = `${afterAppearanceLevel}LV`;
  const sharedPlayerActor = {
    kind: "player",
    alt: "player-plastic-surgery",
    left: 34,
    bottom: 4,
    height: 86,
    zIndex: 2,
  };

  if (stage === "consultation") {
    return {
      stage,
      speaker: "배금병원 성형외과",
      title: "상담실에서 얼굴 라인을 고른다",
      lines: [
        "상담실 거울 옆으로 자연형과 또렷형 시안 카드가 가지런히 놓여 있다.",
        "원장은 지금 인상은 살리되 어느 정도까지 또렷하게 바꿀지 먼저 고르라고 한다.",
      ],
      tags: ["병원", "성형", "상담"],
      backgroundConfig: lobbyBackground,
      actors: [sharedPlayerActor],
      choices: getPlasticSurgeryPlanDefinitions(targetState).map((entry) => ({
        type: "plan",
        planId: entry.id,
        title: `${entry.label}으로 진행한다 · ${entry.expectedAppearanceLabel}`,
        description: `${entry.expectedAppearanceLabel} 목표 · ${entry.consultationLine}`,
        earnText: formatMoney(entry.cost),
      })).concat({
        type: "cancel",
        title: "오늘은 상담만 받고 나온다",
      }),
    };
  }

  if (stage === "procedure") {
    return {
      stage,
      speaker: "수술 준비실",
      title: `${plan?.label || "성형"} 수술 준비`,
      lines: [
        `${formatMoney(plasticEvent.spentAmount || plan?.cost || 0)} 결제가 끝나자 간단한 체크리스트와 동의서가 차례로 넘어온다.`,
        "밝은 조명 아래에서 눈을 감으면 금방 끝난다는 말과 함께 수술대가 천천히 내려온다.",
      ],
      tags: ["병원", "수술", plan?.label || "성형"],
      backgroundConfig: PLASTIC_SURGERY_RECOVERY_BACKGROUND,
      actors: [],
      choices: [
        {
          type: "advance",
          title: "마취가 퍼지는 동안 눈을 감는다",
        },
      ],
    };
  }

  if (stage === "recovery") {
    return {
      stage,
      speaker: "회복실",
      title: "붕대를 감은 채 회복실에서 눈을 뜬다",
      lines: [
        "희미한 소독약 냄새 사이로 간호사가 붓기가 가라앉는 동안 천천히 거울을 보라고 안내한다.",
        "얼굴 라인이 정리된 느낌은 오지만 아직 완전히 실감이 나지 않는다.",
      ],
      tags: ["병원", "회복", plan?.label || "성형"],
      backgroundConfig: PLASTIC_SURGERY_RECOVERY_BACKGROUND,
      actors: [],
      choices: [
        {
          type: "advance",
          title: "천천히 자리에서 일어나 거울 앞으로 간다",
        },
      ],
    };
  }

  return {
    stage: "result",
    speaker: "배금병원 성형외과",
    title: "거울 앞에서 달라진 인상을 확인한다",
    lines: [
      `${plan?.label || "성형"} 수술이 마무리됐다. 거울 속 얼굴은 ${afterAppearanceLabel} 인상에 맞게 더 또렷하게 정리되어 있다.`,
      "병원 로비로 나가면 사람들의 첫 반응도 전보다 달라질 것 같은 확신이 든다.",
    ],
    tags: ["병원", "성형 완료", afterAppearanceLabel],
    backgroundConfig: lobbyBackground || PLASTIC_SURGERY_RECOVERY_BACKGROUND,
    actors: [sharedPlayerActor],
    choices: [
      {
        type: "finish",
        title: "병원 로비로 나온다",
      },
    ],
  };
}

function openPlasticSurgeryConsultation(targetState = state) {
  if (!targetState) {
    return false;
  }

  if (typeof ensurePresentationStateReady === "function") {
    ensurePresentationStateReady(targetState);
  }

  if (targetState.appearance?.surgeryDone) {
    targetState.headline = {
      badge: "성형외과",
      text: "이미 큰 시술은 마쳤다. 지금은 결과를 유지하는 쪽이 더 중요해 보인다.",
    };
    renderGame();
    return false;
  }

  targetState.phoneView = "home";
  targetState.scene = "plastic-surgery";
  targetState.plasticSurgeryEvent = createPlasticSurgeryEventSnapshot(targetState, {
    stage: "consultation",
    selectedPlanId: "",
    spentAmount: 0,
    resultProfileId: "",
    afterAppearanceLevel: 0,
    dayEnded: false,
    completed: false,
  });
  renderGame();
  return true;
}

function performPlasticSurgeryPlan(planId = "", targetState = state) {
  if (!targetState) {
    return false;
  }

  if (typeof ensurePresentationStateReady === "function") {
    ensurePresentationStateReady(targetState);
  }

  const normalizedPlanId = String(planId || "").trim().toLowerCase();
  if (!normalizedPlanId) {
    return openPlasticSurgeryConsultation(targetState);
  }

  if (targetState.appearance?.surgeryDone) {
    targetState.headline = {
      badge: "성형외과",
      text: "이미 큰 시술은 마친 상태라 오늘은 추가 수술 일정을 잡지 않는다.",
    };
    renderGame();
    return false;
  }

  const plan = getPlasticSurgeryPlanDefinition(normalizedPlanId, targetState);
  if (!plan) {
    return openPlasticSurgeryConsultation(targetState);
  }

  targetState.scene = "plastic-surgery";
  targetState.phoneView = "home";
  targetState.plasticSurgeryEvent = createPlasticSurgeryEventSnapshot(targetState, {
    stage: "consultation",
    selectedPlanId: normalizedPlanId,
  });

  if (typeof canAfford === "function" && !canAfford(plan.cost, targetState)) {
    targetState.headline = {
      badge: "상담 보류",
      text: `${formatMoney(plan.cost)}이 있어야 ${plan.label} 수술을 진행할 수 있다.`,
    };
    renderGame();
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(plan.cost, targetState)) {
    targetState.headline = {
      badge: "결제 실패",
      text: "접수 단계에서 결제가 승인되지 않아 상담실로 다시 안내됐다.",
    };
    renderGame();
    return false;
  }

  if (typeof patchAppearanceState === "function") {
    patchAppearanceState({
      profileId: plan.resultProfileId,
      surgeryDone: true,
      attractivenessDelta: plan.attractivenessDelta,
      flags: {
        hadPlasticSurgery: true,
        surgeryPlanId: plan.id,
        surgeryPlanLabel: plan.label,
      },
    }, targetState);
  }

  if (typeof adjustHappiness === "function") {
    adjustHappiness(plan.happinessDelta, targetState);
  }

  if (typeof addUnlockEntry === "function") {
    addUnlockEntry("events", "plastic-surgery", targetState);
  }

  const afterAppearanceLevel = getAppearanceLevelForProfileId(plan.resultProfileId);
  const dayEnded = spendTimeSlots(2);

  targetState.headline = {
    badge: "성형 진행",
    text: `${formatMoney(plan.cost)}을 내고 ${plan.label} 수술을 시작했다. 회복이 끝나면 ${afterAppearanceLevel}LV 인상으로 정리된다.`,
  };
  targetState.plasticSurgeryEvent = createPlasticSurgeryEventSnapshot(targetState, {
    stage: "procedure",
    selectedPlanId: plan.id,
    spentAmount: plan.cost,
    resultProfileId: plan.resultProfileId,
    afterAppearanceLevel,
    dayEnded: Boolean(dayEnded),
    completed: true,
  });

  recordActionMemory("배금병원에서 성형 수술을 받았다", `${formatMoney(plan.cost)}을 내고 ${plan.label} 수술을 진행했다. ${plan.memoryLine}`, {
    type: "event",
    source: getCurrentLocationLabel(),
    tags: ["병원", "성형", plan.label],
  });

  renderGame();
  return true;
}

function finishPlasticSurgeryEvent(targetState = state) {
  const plasticEvent = targetState?.plasticSurgeryEvent;
  if (!targetState || !plasticEvent) {
    return false;
  }

  const plan = getPlasticSurgeryPlanDefinition(plasticEvent.selectedPlanId, targetState);
  const afterAppearanceLevel = Math.max(
    1,
    Number(plasticEvent.afterAppearanceLevel) || getPlayerAppearanceLevel(targetState),
  );
  const locationId = String(plasticEvent.locationId || "baegeum-hospital").trim() || "baegeum-hospital";

  targetState.headline = {
    badge: "성형 완료",
    text: `${plan?.label || "성형"} 수술을 마치고 ${afterAppearanceLevel}LV 인상으로 정리했다.`,
  };
  targetState.scene = "outside";
  targetState.phoneView = "home";
  targetState.plasticSurgeryEvent = null;
  targetState.world = {
    ...(targetState.world && typeof targetState.world === "object" ? targetState.world : {}),
    ...buildWorldLocationPersistencePatch(targetState, locationId),
  };

  if (plasticEvent.dayEnded) {
    advanceDayOrFinish();
    return true;
  }

  renderGame();
  return true;
}

function advancePlasticSurgeryEvent(targetState = state) {
  const plasticEvent = targetState?.plasticSurgeryEvent;
  if (!plasticEvent || typeof plasticEvent !== "object") {
    return false;
  }

  const currentStage = String(plasticEvent.stage || "consultation").trim().toLowerCase();
  if (currentStage === "procedure") {
    targetState.plasticSurgeryEvent = createPlasticSurgeryEventSnapshot(targetState, {
      stage: "recovery",
    });
    renderGame();
    return true;
  }

  if (currentStage === "recovery") {
    targetState.plasticSurgeryEvent = createPlasticSurgeryEventSnapshot(targetState, {
      stage: "result",
    });
    renderGame();
    return true;
  }

  if (currentStage === "result") {
    return finishPlasticSurgeryEvent(targetState);
  }

  return false;
}
const CONVENIENCE_STORE_CATALOG = Object.freeze({
  "buy-convenience-water": Object.freeze({
    itemId: "water-bottle",
    label: "생수",
    price: 1200,
    memoryBody: "편의점 냉장고에서 차가운 생수 한 병을 꺼내 계산했다.",
  }),
  "buy-convenience-kimbap": Object.freeze({
    itemId: "triangle-kimbap",
    label: "삼각김밥",
    price: 1800,
    memoryBody: "급하게 배를 채울 생각으로 삼각김밥을 하나 집어 들고 계산했다.",
  }),
  "buy-convenience-painkiller": Object.freeze({
    itemId: "painkiller",
    label: "진통제",
    price: 3500,
    memoryBody: "몸 상태가 흔들릴 때 버티기 좋게 진통제를 하나 챙겼다.",
  }),
});
const MCDONALDS_MENU_CATALOG = Object.freeze({
  "eat-mcdonalds-set": Object.freeze({
    label: "버거 세트",
    price: 6900,
    hungerGain: 55,
    energyGain: 8,
    happinessGain: 2,
    slots: 1,
    memoryBody: "맥도날드 배금사거리점에서 버거 세트를 먹으며 잠깐 숨을 돌렸다.",
  }),
  "buy-mcdonalds-coffee": Object.freeze({
    label: "커피",
    price: 2500,
    energyGain: 3,
    happinessGain: 1,
    slots: 1,
    memoryBody: "카운터에서 막 나온 커피를 받아 들고 사거리 쪽 풍경을 잠깐 바라봤다.",
  }),
});

const LOTTO_TICKET_PRICE = 1000;
const LOTTO_TICKET_DAILY_LIMIT = 5;
const LOTTO_PICK_NUMBER_COUNT = 6;
const LOTTO_PICK_NUMBER_MAX = 45;
const LOTTO_PICK_OPTION_COUNT = 3;
const LOTTO_SCRATCH_CELL_COUNT = 3;
const LOTTO_SCRATCH_MATCH_COUNT = 3;
const LOTTO_RETAILER_PRIZE_TABLE = Object.freeze([
  Object.freeze({
    id: "miss",
    label: "꽝",
    scratchLabel: "꽝",
    payout: 0,
    weight: 5000,
    badge: "꽝",
    headlineText: "번호가 전부 비껴갔다. 오늘은 종이 한 장만 손에 남았다.",
    memoryBody: "즉석복권 한 장을 샀지만 번호가 전부 빗나갔다.",
  }),
  Object.freeze({
    id: "refund",
    label: "5등",
    scratchLabel: "1천",
    payout: 1000,
    weight: 2000,
    badge: "5등",
    headlineText: "본전은 챙겼다. 다음 장을 다시 노려볼 만하다.",
    memoryBody: "즉석복권에서 본전을 건졌다.",
  }),
  Object.freeze({
    id: "small",
    label: "4등",
    scratchLabel: "1만",
    payout: 10000,
    weight: 1500,
    badge: "4등",
    headlineText: "작게 터졌다. 치킨값 정도는 바로 생겼다.",
    memoryBody: "즉석복권 소액 당첨으로 치킨값이 생겼다.",
  }),
  Object.freeze({
    id: "medium",
    label: "3등",
    scratchLabel: "10만",
    payout: 100000,
    weight: 1000,
    badge: "3등",
    headlineText: "10만 원이 찍혔다. 오늘 하루가 확실히 달라졌다.",
    memoryBody: "즉석복권 3등 당첨으로 10만 원이 생겼다.",
  }),
  Object.freeze({
    id: "large",
    label: "2등",
    scratchLabel: "100만",
    payout: 1000000,
    weight: 400,
    badge: "2등",
    headlineText: "100만 원이 찍혔다. 판매소 직원도 눈이 커졌다.",
    memoryBody: "즉석복권 2등으로 100만 원을 받았다. 손이 조금 떨렸다.",
  }),
  Object.freeze({
    id: "jackpot",
    label: "1등",
    scratchLabel: "1천만",
    payout: 10000000,
    weight: 80,
    badge: "1등",
    headlineText: "1천만 원짜리 잭팟이 찍혔다. 판매소 안 공기가 한순간에 바뀌었다.",
    memoryBody: "즉석복권 1등 당첨. 1천만 원이 손안에 들어왔다.",
  }),
  Object.freeze({
    id: "super",
    label: "특등",
    scratchLabel: "1억",
    payout: 100000000,
    weight: 20,
    badge: "특등 🎉",
    headlineText: "1억이 찍혔다. 숫자를 세 번 다시 읽었는데 맞았다.",
    memoryBody: "즉석복권에서 1억짜리 특등이 터졌다. 평생 기억할 날이다.",
  }),
]);

const LOTTO_MATCH_PRIZE_RULES = Object.freeze({
  first: Object.freeze({
    id: "first",
    rankLabel: "1등",
    payout: 5000000000,
    badge: "로또 1등",
    guide: "번호 6개 전부 일치",
    headlineText: "당첨 기계가 멎을 만큼 큰 금액이 찍혔다. 이번 회차는 인생 역전이다.",
    memoryBody: "로또 1등에 당첨돼 어마어마한 당첨금을 받았다.",
  }),
  second: Object.freeze({
    id: "second",
    rankLabel: "2등",
    payout: 300000000,
    badge: "로또 2등",
    guide: "번호 5개 + 보너스 일치",
    headlineText: "보너스 번호까지 맞아 인생이 흔들릴 만큼 큰 당첨금을 받았다.",
    memoryBody: "로또 2등에 당첨돼 큰 목돈이 생겼다.",
  }),
  third: Object.freeze({
    id: "third",
    rankLabel: "3등",
    payout: 5000000,
    badge: "로또 3등",
    guide: "번호 5개 일치",
    headlineText: "다섯 개가 맞아 한동안 숨통이 트일 정도의 당첨금을 받았다.",
    memoryBody: "로또 3등에 당첨돼 생활 자금이 한 번에 넉넉해졌다.",
  }),
  fourth: Object.freeze({
    id: "fourth",
    rankLabel: "4등",
    payout: 50000,
    badge: "로또 4등",
    guide: "번호 4개 일치",
    headlineText: "네 개가 맞아 식비 걱정을 덜 만큼은 건졌다.",
    memoryBody: "로또 번호 네 개가 맞아 생각보다 괜찮은 수익이 생겼다.",
  }),
  fifth: Object.freeze({
    id: "fifth",
    rankLabel: "5등",
    payout: 5000,
    badge: "로또 5등",
    guide: "번호 3개 일치",
    headlineText: "번호 세 개가 맞아 소액 당첨금을 챙겼다.",
    memoryBody: "로또 번호 세 개가 맞아 소소한 당첨금을 받았다.",
  }),
  miss: Object.freeze({
    id: "miss",
    rankLabel: "낙첨",
    payout: 0,
    badge: "로또 낙첨",
    guide: "일치 2개 이하",
    headlineText: "번호가 크게 비껴갔다. 이번 회차는 다음 기회를 노려야 한다.",
    memoryBody: "로또를 샀지만 번호가 맞지 않았다.",
  }),
});

function createDefaultLottoRetailerState() {
  return {
    pendingTickets: [],
    lastDrawSummary: null,
    pickSession: null,
    dailyPurchaseDay: 0,
    dailyPurchaseCount: 0,
  };
}

function normalizeLottoNumberSet(numbers = []) {
  const values = Array.isArray(numbers)
    ? numbers
      .map((value) => Math.round(Number(value) || 0))
      .filter((value) => value >= 1 && value <= LOTTO_PICK_NUMBER_MAX)
    : [];
  return [...new Set(values)].sort((left, right) => left - right).slice(0, LOTTO_PICK_NUMBER_COUNT);
}

function formatLottoNumberSet(numbers = []) {
  const normalized = normalizeLottoNumberSet(numbers);
  if (!normalized.length) {
    return "-";
  }
  return normalized.map((value) => String(value).padStart(2, "0")).join(", ");
}

function drawUniqueLottoNumbers(count = LOTTO_PICK_NUMBER_COUNT, maxNumber = LOTTO_PICK_NUMBER_MAX) {
  const pool = Array.from({ length: maxNumber }, (_, index) => index + 1);
  const picks = [];

  while (pool.length && picks.length < count) {
    const drawIndex = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(drawIndex, 1)[0]);
  }

  return picks.sort((left, right) => left - right);
}

function drawLottoBonusNumber(winningNumbers = []) {
  const blocked = new Set(normalizeLottoNumberSet(winningNumbers));
  const pool = Array.from({ length: LOTTO_PICK_NUMBER_MAX }, (_, index) => index + 1)
    .filter((value) => !blocked.has(value));
  if (!pool.length) {
    return 0;
  }
  return pool[Math.floor(Math.random() * pool.length)] || 0;
}

function createLottoPickCandidate(index = 0) {
  return {
    id: `lotto-pick-${Date.now()}-${index + 1}-${Math.random().toString(36).slice(2, 6)}`,
    numbers: drawUniqueLottoNumbers(),
  };
}

function normalizeLottoPickCandidate(candidate = null, index = 0) {
  const numbers = normalizeLottoNumberSet(candidate?.numbers);
  return {
    id: String(candidate?.id || `lotto-pick-${index + 1}`).trim() || `lotto-pick-${index + 1}`,
    numbers: numbers.length === LOTTO_PICK_NUMBER_COUNT ? numbers : drawUniqueLottoNumbers(),
  };
}

function createLottoPickSession(targetState = state) {
  const today = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const prizeRule = typeof pickWeightedEntry === "function"
    ? (pickWeightedEntry(LOTTO_RETAILER_PRIZE_TABLE) || LOTTO_RETAILER_PRIZE_TABLE[0])
    : LOTTO_RETAILER_PRIZE_TABLE[0];
  return {
    day: today,
    locationId: typeof getCurrentLocationId === "function"
      ? getCurrentLocationId(targetState) || "lotto-retailer-interior"
      : "lotto-retailer-interior",
    prizeId: prizeRule.id,
    board: buildLottoScratchBoard(prizeRule),
    scratchedCount: 0,
  };
}

function getLottoRetailerPurchaseSnapshot(targetState = state) {
  const lottoState = syncLottoRetailerState(targetState);
  const today = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const purchaseDay = Math.max(0, Math.round(Number(lottoState.dailyPurchaseDay) || 0));
  const purchaseCount = purchaseDay === today
    ? Math.max(0, Math.round(Number(lottoState.dailyPurchaseCount) || 0))
    : 0;
  return {
    today,
    purchaseDay,
    purchaseCount,
    remaining: Math.max(0, LOTTO_TICKET_DAILY_LIMIT - purchaseCount),
  };
}

function getImmediateLottoPrizeRule(matchCount = 0, bonusMatched = false) {
  if (matchCount >= 6) {
    return LOTTO_MATCH_PRIZE_RULES.first;
  }
  if (matchCount === 5 && bonusMatched) {
    return LOTTO_MATCH_PRIZE_RULES.second;
  }
  if (matchCount === 5) {
    return LOTTO_MATCH_PRIZE_RULES.third;
  }
  if (matchCount === 4) {
    return LOTTO_MATCH_PRIZE_RULES.fourth;
  }
  if (matchCount === 3) {
    return LOTTO_MATCH_PRIZE_RULES.fifth;
  }
  return LOTTO_MATCH_PRIZE_RULES.miss;
}

function buildLottoPrizeGuideLines() {
  const totalWeight = LOTTO_RETAILER_PRIZE_TABLE.reduce((sum, entry) => sum + Math.max(0, Number(entry?.weight) || 0), 0);
  return LOTTO_RETAILER_PRIZE_TABLE.map((entry) => {
    const oddsPercent = totalWeight > 0
      ? (Math.max(0, Number(entry?.weight) || 0) / totalWeight) * 100
      : 0;
    const formattedPercent = oddsPercent >= 1
      ? `${oddsPercent.toFixed(2).replace(/\.00$/, "")}%`
      : `${oddsPercent.toFixed(2)}%`;
    return `${entry.label} ${formatMoney(Math.max(0, Number(entry?.payout) || 0))} · ${formattedPercent}`;
  });
}

function getLottoPrizeRuleById(prizeId = "miss") {
  const normalizedPrizeId = String(prizeId || "miss").trim() || "miss";
  return LOTTO_RETAILER_PRIZE_TABLE.find((entry) => entry.id === normalizedPrizeId) || LOTTO_RETAILER_PRIZE_TABLE[0];
}

function createLottoScratchCell(prizeId = "miss", index = 0) {
  const prizeRule = getLottoPrizeRuleById(prizeId);
  return {
    id: `lotto-scratch-${Date.now()}-${index + 1}-${Math.random().toString(36).slice(2, 6)}`,
    prizeId: prizeRule.id,
    revealed: false,
  };
}

function normalizeLottoScratchCell(cell = null, index = 0) {
  const prizeRule = getLottoPrizeRuleById(cell?.prizeId || "miss");
  return {
    id: String(cell?.id || `lotto-scratch-${index + 1}`).trim() || `lotto-scratch-${index + 1}`,
    prizeId: prizeRule.id,
    revealed: Boolean(cell?.revealed),
  };
}

function shuffleLottoScratchValues(values = []) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temporary = result[index];
    result[index] = result[randomIndex];
    result[randomIndex] = temporary;
  }
  return result;
}

function buildLottoScratchBoard(prizeRule = null) {
  const resolvedPrizeRule = prizeRule?.id ? prizeRule : getLottoPrizeRuleById("miss");
  const prizeIds = [];

  if (resolvedPrizeRule.id === "miss") {
    // 3칸 꽝: 모두 다른 값 — 3-of-a-kind 없음
    const decoyPool = shuffleLottoScratchValues(
      LOTTO_RETAILER_PRIZE_TABLE
        .filter((entry) => entry.id !== "miss")
        .map((entry) => entry.id),
    );
    prizeIds.push(decoyPool[0] || "refund");
    prizeIds.push(decoyPool[1] || "small");
    prizeIds.push("miss");
  } else {
    // 3칸 당첨: 모두 같은 값
    for (let i = 0; i < LOTTO_SCRATCH_CELL_COUNT; i++) {
      prizeIds.push(resolvedPrizeRule.id);
    }
  }

  return shuffleLottoScratchValues(prizeIds.slice(0, LOTTO_SCRATCH_CELL_COUNT))
    .map((prizeId, index) => createLottoScratchCell(prizeId, index));
}

function countLottoScratchMatches(board = []) {
  return board.reduce((counts, cell) => {
    const prizeId = getLottoPrizeRuleById(cell?.prizeId || "miss").id;
    counts[prizeId] = (counts[prizeId] || 0) + 1;
    return counts;
  }, {});
}

function formatLottoScratchBreakdown(board = []) {
  const counts = countLottoScratchMatches(board);
  return Object.entries(counts)
    .sort((left, right) => (getLottoPrizeRuleById(right[0]).payout || 0) - (getLottoPrizeRuleById(left[0]).payout || 0))
    .map(([prizeId, count]) => `${getLottoPrizeRuleById(prizeId).scratchLabel || getLottoPrizeRuleById(prizeId).label} ${count}칸`)
    .join(" / ");
}

function resolveLottoScratchPrizeRule(board = []) {
  const counts = countLottoScratchMatches(board);
  const winningRule = LOTTO_RETAILER_PRIZE_TABLE
    .filter((entry) => entry.id !== "miss" && (counts[entry.id] || 0) >= LOTTO_SCRATCH_MATCH_COUNT)
    .sort((left, right) => (Number(right?.payout) || 0) - (Number(left?.payout) || 0))[0];
  return winningRule || getLottoPrizeRuleById("miss");
}

function buildLottoScratchResultSummary(pickSession = null, targetState = state) {
  const board = Array.isArray(pickSession?.board)
    ? pickSession.board.map((cell, index) => normalizeLottoScratchCell(cell, index))
    : [];
  const prizeRule = resolveLottoScratchPrizeRule(board);
  const payout = Math.max(0, Number(prizeRule?.payout) || 0);
  const net = payout - LOTTO_TICKET_PRICE;
  const fallbackLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState) || "lotto-retailer-interior"
    : "lotto-retailer-interior";
  const rawReturnLocationId = String(
    pickSession?.locationId
      || fallbackLocationId
      || "lotto-retailer-interior",
  ).trim() || "lotto-retailer-interior";
  const returnLocationId = rawReturnLocationId === "lotto-retailer"
    ? "lotto-retailer-interior"
    : rawReturnLocationId;
  const scratchLabels = board.map((cell) => getLottoPrizeRuleById(cell?.prizeId || "miss").scratchLabel || "꽝");
  const breakdownLine = formatLottoScratchBreakdown(board);
  const lines = [
    scratchLabels.length ? `긁은 칸: ${scratchLabels.join(" / ")}` : "긁은 칸이 없다.",
    breakdownLine ? `칸 정리: ${breakdownLine}` : "",
    payout > 0
      ? `${prizeRule.scratchLabel || prizeRule.label} 3칸 일치. ${formatMoney(payout)} 당첨이다.`
      : "같은 금액 3칸이 모이지 않아 꽝이다.",
    `복권값 포함 순손익 ${net >= 0 ? "+" : "-"}${formatMoney(Math.abs(net))}`,
    `확률표: ${buildLottoPrizeGuideLines().join(" / ")}`,
  ].filter(Boolean);

  if (prizeRule?.headlineText) {
    lines.push(prizeRule.headlineText);
  }

  return {
    badge: prizeRule?.badge || "즉석복권 결과",
    title: payout > 0
      ? `${prizeRule.scratchLabel || prizeRule.label} 당첨`
      : "즉석복권 꽝",
    lines,
    payout,
    net,
    ticketCount: 1,
    returnScene: "outside",
    returnLocationId,
    prizeId: prizeRule?.id || "miss",
    scratchLabels,
    breakdownLine,
  };
}

function normalizeLottoPickSession(session = null, targetState = state) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const today = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const day = Math.max(1, Math.round(Number(session.day) || today));
  if (Array.isArray(session.candidates)) {
    return null;
  }
  const board = Array.isArray(session.board)
    ? session.board.map((cell, index) => normalizeLottoScratchCell(cell, index))
    : [];

  if (day !== today || !board.length) {
    return null;
  }

  return {
    day,
    locationId: String(session.locationId || "lotto-retailer-interior").trim() || "lotto-retailer-interior",
    prizeId: getLottoPrizeRuleById(session.prizeId || "miss").id,
    board,
    scratchedCount: board.filter((cell) => cell.revealed).length,
  };
}

function normalizeLottoRetailerTicket(ticket = null, fallbackIndex = 0, targetState = state) {
  const fallbackPurchasedDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const purchasedDay = Math.max(1, Math.round(Number(ticket?.purchasedDay) || fallbackPurchasedDay));
  const drawDay = Math.max(purchasedDay + 1, Math.round(Number(ticket?.drawDay) || (purchasedDay + 1)));
  const ticketId = String(ticket?.id || `lotto-ticket-${purchasedDay}-${fallbackIndex + 1}`).trim();

  return {
    id: ticketId || `lotto-ticket-${purchasedDay}-${fallbackIndex + 1}`,
    purchasedDay,
    drawDay,
  };
}

function syncLottoRetailerState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return createDefaultLottoRetailerState();
  }

  const defaults = createDefaultLottoRetailerState();
  const lottoState = targetState.lottoRetailer && typeof targetState.lottoRetailer === "object"
    ? targetState.lottoRetailer
    : {};

  targetState.lottoRetailer = {
    pendingTickets: Array.isArray(lottoState.pendingTickets)
      ? lottoState.pendingTickets.map((ticket, index) => normalizeLottoRetailerTicket(ticket, index, targetState))
      : [],
    lastDrawSummary: lottoState.lastDrawSummary && typeof lottoState.lastDrawSummary === "object"
      ? {
          ...lottoState.lastDrawSummary,
          lines: [...(lottoState.lastDrawSummary.lines || [])],
        }
      : defaults.lastDrawSummary,
    pickSession: normalizeLottoPickSession(lottoState.pickSession, targetState),
    dailyPurchaseDay: Math.max(0, Math.round(Number(lottoState.dailyPurchaseDay) || 0)),
    dailyPurchaseCount: Math.max(0, Math.round(Number(lottoState.dailyPurchaseCount) || 0)),
  };

  return targetState.lottoRetailer;
}

function createLottoRetailerTicket(targetState = state) {
  const lottoState = syncLottoRetailerState(targetState);
  const today = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const sequence = lottoState.pendingTickets.length + 1;

  return {
    id: `lotto-ticket-${today}-${sequence}-${Math.random().toString(36).slice(2, 6)}`,
    purchasedDay: today,
    drawDay: today + 1,
  };
}

function queueLottoRetailerTicket(targetState = state) {
  const lottoState = syncLottoRetailerState(targetState);
  const ticket = createLottoRetailerTicket(targetState);
  lottoState.pendingTickets.push(ticket);
  lottoState.lastDrawSummary = null;
  return ticket;
}

function openLottoRetailerPickSession(targetState = state) {
  if (!targetState) {
    return false;
  }

  const lottoState = syncLottoRetailerState(targetState);
  if (lottoState.pickSession) {
    targetState.scene = "lotto-pick";
    renderGame();
    return true;
  }

  const purchaseSnapshot = getLottoRetailerPurchaseSnapshot(targetState);
  if (purchaseSnapshot.remaining <= 0) {
    targetState.headline = {
      badge: "로또 제한",
      text: `하루에 ${LOTTO_TICKET_DAILY_LIMIT}장까지만 살 수 있다. 내일 다시 오자.`,
    };
    renderGame();
    return false;
  }

  if (typeof canAfford === "function" && !canAfford(LOTTO_TICKET_PRICE, targetState)) {
    targetState.headline = {
      badge: "구매 실패",
      text: `로또 한 장 가격 ${formatMoney(LOTTO_TICKET_PRICE)}이 부족하다.`,
    };
    renderGame();
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(LOTTO_TICKET_PRICE, targetState)) {
    targetState.headline = {
      badge: "구매 실패",
      text: "현금을 꺼내려다 계산이 꼬였다.",
    };
    renderGame();
    return false;
  }

  const today = Math.max(1, Math.round(Number(targetState.day) || 1));
  const liveLottoState = syncLottoRetailerState(targetState);
  liveLottoState.lastDrawSummary = null;
  liveLottoState.pickSession = createLottoPickSession(targetState);
  liveLottoState.dailyPurchaseDay = today;
  liveLottoState.dailyPurchaseCount = purchaseSnapshot.purchaseCount + 1;
  targetState.scene = "lotto-pick";
  if (typeof showMoneyEffect === "function") {
    showMoneyEffect(-LOTTO_TICKET_PRICE);
  }
  renderGame();
  return true;
}

function rerollLottoRetailerPickSession(targetState = state) {
  if (!targetState) {
    return false;
  }

  const lottoState = syncLottoRetailerState(targetState);
  lottoState.pickSession = createLottoPickSession(targetState);
  targetState.scene = "lotto-pick";
  renderGame();
  return true;
}

function buildImmediateLottoDrawSummary(chosenNumbers = [], targetState = state) {
  const normalizedNumbers = normalizeLottoNumberSet(chosenNumbers);
  const winningNumbers = drawUniqueLottoNumbers();
  const bonusNumber = drawLottoBonusNumber(winningNumbers);
  const matchedNumbers = normalizedNumbers.filter((value) => winningNumbers.includes(value));
  const bonusMatched = normalizedNumbers.includes(bonusNumber);
  const prizeRule = getImmediateLottoPrizeRule(matchedNumbers.length, bonusMatched);
  const payout = Math.max(0, Number(prizeRule?.payout) || 0);
  const net = payout - LOTTO_TICKET_PRICE;
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState) || "lotto-retailer-interior"
    : "lotto-retailer-interior";
  const locationId = currentLocationId === "lotto-retailer" ? "lotto-retailer-interior" : currentLocationId;
  const lines = [
    `고른 번호: ${formatLottoNumberSet(normalizedNumbers)}`,
    `당첨 번호: ${formatLottoNumberSet(winningNumbers)} + 보너스 ${String(bonusNumber).padStart(2, "0")}`,
    `일치 번호: ${matchedNumbers.length ? formatLottoNumberSet(matchedNumbers) : "없음"}${bonusMatched ? " / 보너스 일치" : ""}`,
    payout > 0
      ? `${prizeRule.rankLabel} 당첨. ${formatMoney(payout)}을 바로 받았다.`
      : "이번 회차는 낙첨이다.",
    `복권값 포함 순손익: ${net >= 0 ? "+" : "-"}${formatMoney(Math.abs(net))}`,
    `등수 안내: ${buildLottoPrizeGuideLines().join(" / ")}`,
  ];

  if (prizeRule?.headlineText) {
    lines.push(prizeRule.headlineText);
  }

  return {
    badge: prizeRule?.badge || "로또 결과",
    title: payout > 0 ? `${prizeRule.rankLabel} 당첨` : "로또 낙첨",
    lines,
    payout,
    net,
    ticketCount: 1,
    returnScene: "outside",
    returnLocationId: locationId,
    chosenNumbers: [...normalizedNumbers],
    winningNumbers: [...winningNumbers],
    bonusNumber,
    prizeId: prizeRule?.id || "miss",
  };
}

function scratchLottoRetailerCell(cellIndex = 0, targetState = state) {
  if (!targetState) {
    return false;
  }

  const lottoState = syncLottoRetailerState(targetState);
  const pickSession = lottoState.pickSession;
  const board = Array.isArray(pickSession?.board) ? pickSession.board : [];
  const resolvedIndex = Math.max(0, Math.round(Number(cellIndex) || 0));
  const cell = board[resolvedIndex] || null;

  if (!pickSession || !cell) {
    targetState.scene = "outside";
    renderGame();
    return false;
  }

  if (cell.revealed) {
    return false;
  }

  cell.revealed = true;
  pickSession.scratchedCount = board.filter((entry) => entry.revealed).length;

  if (pickSession.scratchedCount < board.length) {
    renderGame();
    return true;
  }

  const summary = buildLottoScratchResultSummary(pickSession, targetState);
  lottoState.pickSession = null;
  lottoState.lastDrawSummary = summary;

  if (summary.payout > 0) {
    if (typeof earnCash === "function") {
      earnCash(summary.payout, targetState);
    } else {
      targetState.money = Math.max(0, Number(targetState.money) || 0) + summary.payout;
    }
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(summary.payout);
    }
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      summary.payout > 0 ? "즉석복권에서 당첨됐다" : "즉석복권이 꽝으로 끝났다",
      summary.payout > 0
        ? `${summary.title} 결과로 ${formatMoney(summary.payout)}을 챙겼다.`
        : "복권을 끝까지 긁었지만 같은 금액 세 칸이 나오지 않았다.",
      {
        type: "gambling",
        source: "배금역 복권판매점",
        tags: ["즉석복권", "스크래치", summary.prizeId || "miss"].filter(Boolean),
      },
    );
  }

  targetState.headline = {
    badge: summary.badge || "즉석복권 결과",
    text: summary.lines[summary.lines.length - 1] || summary.title,
  };
  targetState.scene = "lotto-result";

  spendMinorTime(PHONE_INTERACTION_MINUTES);
  renderGame();
  return true;
}

function confirmLottoRetailerPick(candidateIndex = 0, targetState = state) {
  return scratchLottoRetailerCell(candidateIndex, targetState);

  if (!targetState) {
    return false;
  }

  const lottoState = syncLottoRetailerState(targetState);
  const pickSession = lottoState.pickSession;
  const candidate = Array.isArray(pickSession?.candidates)
    ? pickSession.candidates[Math.max(0, Math.round(Number(candidateIndex) || 0))]
    : null;

  if (!candidate) {
    targetState.scene = "outside";
    renderGame();
    return false;
  }

  const purchaseSnapshot = getLottoRetailerPurchaseSnapshot(targetState);
  if (purchaseSnapshot.remaining <= 0) {
    lottoState.pickSession = null;
    targetState.scene = "outside";
    targetState.headline = {
      badge: "로또 제한",
      text: `하루에 ${LOTTO_TICKET_DAILY_LIMIT}장까지만 살 수 있다. 내일 다시 오자.`,
    };
    renderGame();
    return false;
  }

  if (typeof canAfford === "function" && !canAfford(LOTTO_TICKET_PRICE, targetState)) {
    targetState.headline = {
      badge: "구매 실패",
      text: `로또 한 장 가격 ${formatMoney(LOTTO_TICKET_PRICE)}이 부족하다.`,
    };
    renderGame();
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(LOTTO_TICKET_PRICE, targetState)) {
    targetState.headline = {
      badge: "구매 실패",
      text: "현금을 꺼내려다 계산이 꼬였다.",
    };
    renderGame();
    return false;
  }

  const summary = buildImmediateLottoDrawSummary(candidate.numbers, targetState);
  const today = Math.max(1, Math.round(Number(targetState.day) || 1));
  lottoState.dailyPurchaseDay = today;
  lottoState.dailyPurchaseCount = purchaseSnapshot.purchaseCount + 1;
  lottoState.pickSession = null;
  summary.returnScene = "outside";
  summary.returnLocationId = typeof getCurrentLocationId === "function"
    ? (getCurrentLocationId(targetState) || "lotto-retailer-interior")
    : "lotto-retailer-interior";

  lottoState.lastDrawSummary = summary;

  if (summary.payout > 0) {
    if (typeof earnCash === "function") {
      earnCash(summary.payout, targetState);
    } else {
      targetState.money = Math.max(0, Number(targetState.money) || 0) + summary.payout;
    }
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(summary.payout);
    }
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      summary.payout > 0 ? "로또 즉시 추첨에 당첨됐다" : "로또 즉시 추첨이 낙첨으로 끝났다",
      summary.payout > 0
        ? `${summary.title} 결과로 ${formatMoney(summary.payout)}을 챙겼다.`
        : "번호를 맞춰 봤지만 이번 회차는 꽝이었다.",
      {
        type: "gambling",
        source: "배금역 로또판매장",
        tags: ["로또", "즉시추첨", summary.prizeId || "miss"].filter(Boolean),
      },
    );
  }

  targetState.headline = {
    badge: summary.badge || "로또 결과",
    text: summary.lines[summary.lines.length - 1] || summary.title,
  };
  targetState.scene = "lotto-result";

  spendMinorTime(PHONE_INTERACTION_MINUTES);
  renderGame();
  return true;
}

function cancelLottoRetailerPickSession(targetState = state) {
  if (!targetState) {
    return false;
  }

  targetState.scene = "outside";
  targetState.headline = {
    badge: "즉석복권",
    text: "긁던 복권은 잠깐 보관하고 판매장 화면으로 나온다.",
  };
  renderGame();
  return true;

  if (!targetState) {
    return false;
  }

  const lottoState = syncLottoRetailerState(targetState);
  lottoState.pickSession = null;
  targetState.scene = "outside";
  renderGame();
  return true;
}

function resolvePendingLottoRetailerTickets(targetState = state) {
  const lottoState = syncLottoRetailerState(targetState);
  const legacyPendingCount = Array.isArray(lottoState.pendingTickets)
    ? lottoState.pendingTickets.length
    : 0;
  const legacyInventoryCount = typeof getInventoryItemQuantity === "function"
    ? getInventoryItemQuantity("lotto-ticket", targetState)
    : 0;
  const legacyTicketCount = Math.max(legacyPendingCount, legacyInventoryCount);

  lottoState.pendingTickets = [];
  lottoState.lastDrawSummary = null;

  if (legacyInventoryCount > 0 && typeof consumeInventoryItem === "function") {
    consumeInventoryItem("lotto-ticket", legacyInventoryCount, targetState);
  }

  if (!legacyTicketCount) {
    return null;
  }

  const refund = legacyTicketCount * LOTTO_TICKET_PRICE;
  if (refund > 0) {
    if (typeof earnCash === "function") {
      earnCash(refund, targetState);
    } else {
      targetState.money = Math.max(0, Number(targetState.money) || 0) + refund;
    }
    if (typeof showMoneyEffect === "function") {
      showMoneyEffect(refund);
    }
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      "구형 로또 티켓이 환불 처리됐다",
      `예전 방식으로 발권된 복권 ${legacyTicketCount}장을 정리하고 ${formatMoney(refund)}을 돌려받았다.`,
      {
        type: "gambling",
        source: "배금역 복권판매점",
        tags: ["즉석복권", "환불", "구형복권"],
      },
    );
  }

  if (!targetState.headline?.text) {
    targetState.headline = {
      badge: "즉석복권 전환",
      text: `예전 복권 ${legacyTicketCount}장을 정리하고 ${formatMoney(refund)}을 환불했다.`,
    };
  }

  return null;

  const today = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const dueTickets = lottoState.pendingTickets.filter((ticket) => ticket.drawDay <= today);

  if (!dueTickets.length) {
    lottoState.lastDrawSummary = null;
    return null;
  }

  const results = dueTickets.map((ticket) => ({
    ticket,
    result: typeof pickWeightedEntry === "function"
      ? (pickWeightedEntry(LOTTO_RETAILER_PRIZE_TABLE) || LOTTO_RETAILER_PRIZE_TABLE[0])
      : LOTTO_RETAILER_PRIZE_TABLE[0],
  }));
  const totalCost = dueTickets.length * LOTTO_TICKET_PRICE;
  const totalPayout = results.reduce((sum, entry) => sum + Math.max(0, Number(entry.result?.payout) || 0), 0);
  const net = totalPayout - totalCost;
  const breakdown = new Map();

  results.forEach(({ result }) => {
    const label = String(result?.label || "꽝").trim() || "꽝";
    breakdown.set(label, (breakdown.get(label) || 0) + 1);
  });

  const bestResult = results.reduce((best, entry) => {
    if (!best) {
      return entry.result;
    }
    return (Number(entry.result?.payout) || 0) > (Number(best?.payout) || 0) ? entry.result : best;
  }, null);

  if (typeof consumeInventoryItem === "function") {
    consumeInventoryItem("lotto-ticket", dueTickets.length, targetState);
  }

  lottoState.pendingTickets = lottoState.pendingTickets.filter((ticket) => ticket.drawDay > today);

  if (totalPayout > 0) {
    if (typeof earnCash === "function") {
      earnCash(totalPayout, targetState);
    } else {
      targetState.money = Math.max(0, Number(targetState.money) || 0) + totalPayout;
    }
  }

  const breakdownLine = [...breakdown.entries()]
    .map(([label, count]) => `${label} ${count}장`)
    .join(", ");
  const lines = [
    `어제 산 복권 ${dueTickets.length}장 결과를 확인했다.`,
    breakdownLine ? `결과: ${breakdownLine}.` : "결과를 확인할 복권이 없다.",
    totalPayout > 0
      ? `당첨금 ${formatMoney(totalPayout)}을 챙겼다. 복권값까지 합친 순손익은 ${net >= 0 ? "+" : "-"}${formatMoney(Math.abs(net))}이다.`
      : `이번엔 전부 꽝이다. 복권값 ${formatMoney(totalCost)}만 빠져나갔다.`,
  ];

  lines.push(`등수 안내: ${buildLottoPrizeGuideLines().join(" / ")}`);

  if (bestResult?.headlineText && totalPayout > 0) {
    lines.push(bestResult.headlineText);
  }

  const summary = {
    badge: bestResult?.badge || "로또 결과",
    title: dueTickets.length > 1 ? `복권 ${dueTickets.length}장 결과` : "복권 결과",
    lines,
    payout: totalPayout,
    net,
    ticketCount: dueTickets.length,
    returnScene: "room",
    returnLocationId: typeof getResolvedHomeLocationId === "function"
      ? getResolvedHomeLocationId(targetState)
      : "",
  };

  lottoState.lastDrawSummary = summary;

  if (typeof showMoneyEffect === "function" && totalPayout > 0) {
    showMoneyEffect(totalPayout);
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      totalPayout > 0 ? "어제 산 로또 결과를 확인했다" : "어제 산 로또가 전부 꽝이었다",
      totalPayout > 0
        ? `복권 ${dueTickets.length}장을 확인해 ${formatMoney(totalPayout)} 당첨금을 챙겼다.`
        : `복권 ${dueTickets.length}장을 확인했지만 전부 꽝이었다.`,
      {
        type: "gambling",
        source: "배금역 로또판매장",
        tags: ["로또", totalPayout > 0 ? "당첨" : "꽝", bestResult?.id || ""].filter(Boolean),
      },
    );
  }

  return summary;
}

function dismissLottoRetailerResult(targetState = state) {
  const lottoState = syncLottoRetailerState(targetState);
  const summary = lottoState.lastDrawSummary && typeof lottoState.lastDrawSummary === "object"
    ? lottoState.lastDrawSummary
    : null;
  lottoState.lastDrawSummary = null;

  const fallbackLocationId = summary?.returnLocationId
    || (typeof getCurrentLocationId === "function" ? getCurrentLocationId(targetState) : "")
    || "lotto-retailer-interior";
  const returnLocationId = String(fallbackLocationId).trim() || "lotto-retailer-interior";
  const worldState = typeof syncWorldState === "function"
    ? syncWorldState(targetState)
    : (targetState.world || {});
  worldState.currentLocation = returnLocationId;
  worldState.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(returnLocationId, targetState.day)
    : worldState.currentDistrict;
  targetState.world = worldState;
  targetState.scene = "outside";

  if (hasPendingNightAutoSleep(targetState) && targetState === state) {
    advanceDayOrFinish();
    return;
  }

  renderGame();
  return;

  const returnScene = String(summary?.returnScene || "room").trim() || "room";
  const legacyReturnLocationId = String(summary?.returnLocationId || "").trim();
  if (returnScene === "outside" && legacyReturnLocationId) {
    const legacyWorldState = typeof syncWorldState === "function"
      ? syncWorldState(targetState)
      : (targetState.world || {});
    legacyWorldState.currentLocation = legacyReturnLocationId;
    legacyWorldState.currentDistrict = typeof getWorldLocationDistrictId === "function"
      ? getWorldLocationDistrictId(legacyReturnLocationId, targetState.day)
      : legacyWorldState.currentDistrict;
    targetState.world = legacyWorldState;
    targetState.scene = "outside";
  } else {
    targetState.scene = "room";
  }

  if (hasPendingNightAutoSleep(targetState) && targetState === state) {
    advanceDayOrFinish();
    return;
  }

  renderGame();
}

function markConvenienceCashierSeen(targetState = state) {
  if (typeof patchSocialContact === "function") {
    patchSocialContact("convenienceCashier", {
      label: "편의점 점원",
      met: true,
      lastSeenDay: targetState.day,
      note: "상업 구역 편의점 계산대에서 자주 마주치는 점원이다.",
    }, targetState);
  }

  if (typeof patchNpcRelation === "function") {
    patchNpcRelation("convenience-cashier", { met: true }, targetState);
  }

  if (typeof addUnlockEntry === "function") {
    addUnlockEntry("npcs", "convenience-cashier", targetState);
  }
}

function performPlasticSurgery(targetState = state) {
  if (!targetState) {
    return false;
  }

  if (typeof ensurePresentationStateReady === "function") {
    ensurePresentationStateReady(targetState);
  }

  if (targetState.appearance?.surgeryDone) {
    targetState.headline = {
      badge: "성형외과",
      text: "이미 외형 변화가 반영된 상태라 오늘은 추가 상담이 필요 없어 보인다.",
    };
    renderGame();
    return false;
  }

  if (typeof canAfford === "function" && !canAfford(PLASTIC_SURGERY_COST, targetState)) {
    targetState.headline = {
      badge: "상담 보류",
      text: `${formatMoney(PLASTIC_SURGERY_COST)}이 있어야 배금병원 성형 상담을 진행할 수 있다.`,
    };
    renderGame();
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(PLASTIC_SURGERY_COST, targetState)) {
    targetState.headline = {
      badge: "결제 실패",
      text: "수술 비용이 부족해서 접수 단계에서 다시 돌아나왔다.",
    };
    renderGame();
    return false;
  }

  if (typeof patchAppearanceState === "function") {
    patchAppearanceState({
      profileId: "postSurgery",
      surgeryDone: true,
      attractivenessDelta: 2,
      flags: {
        hadPlasticSurgery: true,
      },
    }, targetState);
  }

  if (typeof adjustHappiness === "function") {
    adjustHappiness(8, targetState);
  }

  if (typeof addUnlockEntry === "function") {
    addUnlockEntry("events", "plastic-surgery", targetState);
  }

  targetState.headline = {
    badge: "성형 완료",
    text: "배금병원에서 큰돈을 쓰고 외형을 새로 정리했다. 이제 주변 반응도 달라질 수 있다.",
  };

  recordActionMemory("배금병원에서 성형 상담을 마쳤다", `${formatMoney(PLASTIC_SURGERY_COST)}을 내고 외형 변화를 선택했다. 이제 사람들의 첫 반응이 달라질 수 있다.`, {
    type: "event",
    source: getCurrentLocationLabel(),
    tags: ["병원", "성형", "외형 변화"],
  });

  if (spendTimeSlots(2)) {
    advanceDayOrFinish();
    return true;
  }

  renderGame();
  return true;
}

function buyConvenienceStoreItem(actionId, targetState = state) {
  const item = CONVENIENCE_STORE_CATALOG[actionId];
  if (!item || !targetState) {
    return false;
  }

  if (typeof canAfford === "function" && !canAfford(item.price, targetState)) {
    targetState.headline = {
      badge: "구매 실패",
      text: `${item.label} 가격인 ${formatMoney(item.price)}이 부족하다.`,
    };
    renderGame();
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(item.price, targetState)) {
    targetState.headline = {
      badge: "구매 실패",
      text: `${item.label} 계산이 중간에 멈췄다.`,
    };
    renderGame();
    return false;
  }

  if (typeof grantInventoryItem === "function") {
    grantInventoryItem(item.itemId, 1, targetState);
  }

  if (typeof adjustHappiness === "function") {
    adjustHappiness(1, targetState);
  }

  markConvenienceCashierSeen(targetState);

  queueGameplayFeedback({
    title: "편의점 구매",
    tone: "info",
    chips: [
      { label: `${item.label} 획득`, tone: "up" },
      { label: `${formatMoney(item.price)} 사용`, tone: "down" },
      buildGameplayFeedbackDeltaChip("행복도", 1),
    ],
  }, targetState);

  targetState.headline = {
    badge: "구매 완료",
    text: `${item.label}을(를) 사고 인벤토리에 챙겨 넣었다.`,
  };

  recordActionMemory(`${item.label}을 샀다`, item.memoryBody, {
    type: "shopping",
    source: getCurrentLocationLabel(),
    tags: ["편의점", item.itemId],
  });

  renderGame();
  return true;
}

function visitMcDonaldsMenu(actionId, targetState = state) {
  const menu = MCDONALDS_MENU_CATALOG[actionId];
  const ambientRomanceTrigger = actionId === "buy-mcdonalds-coffee"
    ? actionId
    : "";
  if (!menu || !targetState) {
    return false;
  }

  if (typeof canAfford === "function" && !canAfford(menu.price, targetState)) {
    targetState.headline = {
      badge: "주문 실패",
      text: `${menu.label} 가격인 ${formatMoney(menu.price)}이 부족하다.`,
    };
    renderGame();
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(menu.price, targetState)) {
    targetState.headline = {
      badge: "주문 실패",
      text: `${menu.label} 결제 도중 주문이 취소됐다.`,
    };
    renderGame();
    return false;
  }

  const energyCap = typeof ENERGY_MAX === "number"
    ? ENERGY_MAX
    : (typeof BASE_ENERGY === "number" ? BASE_ENERGY : 100);
  targetState.energy = Math.min(
    energyCap,
    Math.max(0, Number(targetState.energy || 0)) + Math.max(0, Number(menu.energyGain || 0)),
  );

  if (Number(menu.hungerGain) > 0) {
    restoreHunger(menu.hungerGain, targetState, { resetProgress: true });
  }

  if (typeof adjustHappiness === "function" && menu.happinessGain) {
    adjustHappiness(menu.happinessGain, targetState);
  }

  queueGameplayFeedback({
    title: `${menu.label} 식사`,
    tone: "up",
    chips: [
      buildGameplayFeedbackDeltaChip("배고픔", menu.hungerGain || 0),
      buildGameplayFeedbackDeltaChip("에너지", menu.energyGain || 0),
      buildGameplayFeedbackDeltaChip("행복도", menu.happinessGain || 0),
      { label: `${formatMoney(menu.price)} 사용`, tone: "down" },
    ],
  }, targetState);

  targetState.headline = {
    badge: "식사 완료",
    text: `${menu.label}로 잠깐 숨을 돌리며 다시 움직일 힘을 챙겼다.`,
  };

  recordActionMemory(`${menu.label}로 한숨 돌렸다`, menu.memoryBody, {
    type: "food",
    source: getCurrentLocationLabel(),
    tags: ["맥도날드", "식사"],
  });

  if (spendTimeSlots(Math.max(0, Number(menu.slots || 0)))) {
    advanceDayOrFinish();
    return true;
  }

  if (
    ambientRomanceTrigger
    && typeof tryStartAmbientRomanceEvent === "function"
    && tryStartAmbientRomanceEvent(
      ambientRomanceTrigger,
      {
        locationId: typeof getCurrentLocationId === "function" ? getCurrentLocationId(targetState) : "mcdonalds-counter",
        locationLabel: typeof getCurrentLocationLabel === "function" ? getCurrentLocationLabel(targetState) : "맥도날드 카운터",
      },
      targetState,
    )
  ) {
    renderGame();
    return true;
  }

  renderGame();
  return true;
}

function buyLottoRetailerTicket(targetState = state) {
  return openLottoRetailerPickSession(targetState);

  if (!targetState) {
    return false;
  }

  if (typeof canAfford === "function" && !canAfford(LOTTO_TICKET_PRICE, targetState)) {
    targetState.headline = {
      badge: "구매 실패",
      text: `로또 한 장 값 ${formatMoney(LOTTO_TICKET_PRICE)}이 부족하다.`,
    };
    renderGame();
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(LOTTO_TICKET_PRICE, targetState)) {
    targetState.headline = {
      badge: "구매 실패",
      text: "현금을 꺼내려다 계산이 꼬였다.",
    };
    renderGame();
    return false;
  }

  if (typeof grantInventoryItem === "function") {
    grantInventoryItem("lotto-ticket", 1, targetState);
  }

  const ticket = queueLottoRetailerTicket(targetState);

  targetState.headline = {
    badge: "구매 완료",
    text: `로또 복권을 한 장 샀다. 인벤토리에 넣어두면 ${ticket.drawDay}일차 아침에 결과가 나온다.`,
  };

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      "로또를 샀다",
      "배금역 로또판매장에서 복권 한 장을 사고 다음날 결과를 기다리기로 했다.",
      {
        type: "gambling",
        source: getCurrentLocationLabel(),
        tags: ["로또", "복권구매"],
      },
    );
  }

  if (spendMinorTime(PHONE_INTERACTION_MINUTES)) {
    advanceDayOrFinish();
    return true;
  }

  renderGame();
  return true;
}

function runStocksTrade() {
  if (state.phoneUsedToday) {
    return;
  }

  const market = typeof getStockMarketSnapshot === "function"
    ? getStockMarketSnapshot(state)
    : null;
  const balance = typeof getWalletBalance === "function" ? getWalletBalance(state) : state.money;
  if (balance <= 0) {
    const message = "시드머니가 없어서 오늘 시장에 들어갈 수 없었다.";
    setPhoneAppStatus("stocks", {
      kicker: "MARKET",
      title: "거래 실패",
      body: message,
      tone: "fail",
    });
    setHeadline("📈 증권", message);
    renderGame();
    return;
  }

  const winChance = market?.successChance ?? 0.5;
  const win = Math.random() < winChance;
  const gain = market?.gainAmount ?? 60000;
  const loss = Math.min(balance, market?.lossAmount ?? 30000);
  let message = "";
  let title = "";
  let tone = "accent";

  if (win) {
    if (typeof earnCash === "function") {
      earnCash(gain);
    } else {
      state.money += gain;
    }
    showMoneyEffect(gain);
    title = "장 마감 수익";
    message = market
      ? `오늘 장이 ${market.marketTrend}로 마감해 ${formatMoney(gain)} 수익을 챙겼다.`
      : `오늘 장이 올라 ${formatMoney(gain)} 수익을 챙겼다.`;
    tone = "success";
  } else {
    if (typeof spendCash === "function") {
      spendCash(loss);
    } else {
      state.money = Math.max(0, state.money - loss);
    }
    showMoneyEffect(-loss);
    title = "장 마감 손실";
    message = market
      ? `오늘 장이 ${market.marketTrend}로 흘러 ${formatMoney(loss)} 손실을 봤다.`
      : `오늘 장이 밀려 ${formatMoney(loss)} 손실을 봤다.`;
    tone = "fail";
  }

  setPhoneAppStatus("stocks", {
    kicker: "MARKET CLOSE",
    title,
    body: market
      ? `${message} 변동성은 ${market.volatilityLabel}였다.`
      : message,
    tone,
  });
  state.phonePreview = createPhoneResultPreview("stocks", "STOCK", title, message);
  state.phoneUsedToday = true;
  recordActionMemory("오늘 증시를 정리했다", message, {
    type: "finance",
    source: "증권 앱",
    tags: ["증권", win ? "수익" : "손실"],
  });
  setHeadline("📈 증권", message);
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 주식: 매수 진입 ────────────────────────────────────────
function runStocksEnter() {
  if (state.stocksUsedToday || state.stockHolding) return;

  const betInput = document.getElementById("stk-bet-input")
    || document.querySelector(".stk-app .gbl-bet-input");
  const betAmount = betInput ? Math.floor(Number(betInput.value) || 0) : 0;
  const balance = typeof getWalletBalance === "function" ? getWalletBalance(state) : state.money;

  if (betAmount < 1000) {
    setPhoneAppStatus("stocks", { kicker: "STOCKS", title: "금액 오류", body: "최소 1,000원 이상 입력하세요.", tone: "fail" });
    renderGame(); return;
  }
  if (betAmount > balance) {
    setPhoneAppStatus("stocks", { kicker: "STOCKS", title: "잔고 부족", body: "보유 현금보다 많은 금액은 투자할 수 없습니다.", tone: "fail" });
    renderGame(); return;
  }

  if (typeof spendCash === "function") spendCash(betAmount);
  else state.money = Math.max(0, state.money - betAmount);

  state.stockHolding = { betAmount, buyDay: state.day };
  state.stocksUsedToday = true;

  const message = `${formatMoney(betAmount)}을 증권 시장에 투자했다. 다음 턴 결과를 확인하자.`;
  setPhoneAppStatus("stocks", { kicker: "STOCKS", title: "매수 완료", body: message, tone: "accent" });
  setHeadline("📈 증권", message);
  recordActionMemory("주식을 매수했다", message, { type: "finance", source: "증권 앱", tags: ["증권", "매수"] });
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 주식: 매도 실현 ────────────────────────────────────────
function runStocksSell() {
  if (state.stocksUsedToday || !state.stockHolding) return;

  const market = typeof getStockMarketSnapshot === "function" ? getStockMarketSnapshot(state) : null;
  const returnRate = market ? market.stockDailyReturnRate : 0;
  const holding = state.stockHolding;
  const currentValue = Math.round(holding.betAmount * (1 + returnRate));
  const pnl = currentValue - holding.betAmount;

  if (typeof earnCash === "function") earnCash(currentValue);
  else state.money += currentValue;

  showMoneyEffect(pnl);
  state.stockHolding = null;
  state.stocksUsedToday = true;

  const pnlSign = pnl >= 0 ? "+" : "";
  const tone = pnl >= 0 ? "success" : "fail";
  const message = `보유 주식을 ${formatMoney(currentValue)}에 매도했다. 손익: ${pnlSign}${formatMoney(pnl)} (${(returnRate * 100).toFixed(1)}%)`;
  setPhoneAppStatus("stocks", { kicker: "MARKET CLOSE", title: pnl >= 0 ? "매도 수익" : "매도 손실", body: message, tone });
  setHeadline("📈 증권", message);
  recordActionMemory("주식을 매도했다", message, { type: "finance", source: "증권 앱", tags: ["증권", pnl >= 0 ? "수익" : "손실"] });
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 주식: 보유 유지 ────────────────────────────────────────
function runStocksHold() {
  if (state.stocksUsedToday || !state.stockHolding) return;
  state.stocksUsedToday = true;
  const message = "오늘은 매도하지 않기로 했다. 다음 턴 다시 확인하자.";
  setPhoneAppStatus("stocks", { kicker: "STOCKS", title: "보유 유지", body: message, tone: "accent" });
  setHeadline("📈 증권", message);
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 카지노: 즉시 베팅 ──────────────────────────────────────
function runCasinoBet() {
  if (typeof openPhoneRoute === "function") {
    openPhoneRoute(CASINO_ROUTES.blackjack, state);
  }
  renderGame();
}

// ── 코인: 매수 진입 ────────────────────────────────────────
function runCoinEnter() {
  if (state.coinUsedToday || state.coinHolding) return;

  const betInput = document.getElementById("coin-bet-input")
    || document.querySelector(".coin-app .gbl-bet-input");
  const betAmount = betInput ? Math.floor(Number(betInput.value) || 0) : 0;
  const balance = typeof getWalletBalance === "function" ? getWalletBalance(state) : state.money;

  const selectedRadio = document.querySelector(".coin-tab-radio:checked");
  const coinType = selectedRadio ? selectedRadio.value : "BTC";

  if (typeof isCoinDelisted === "function" && isCoinDelisted(coinType, state)) {
    const coinInfo = typeof getCoinTypeInfo === "function" ? getCoinTypeInfo(coinType) : { label: coinType };
    setPhoneAppStatus("coin", { kicker: "COIN", title: "거래 중단", body: `${coinInfo.label}은 이번 하락장에서 상장폐지되어 더는 매수할 수 없다.`, tone: "fail" });
    renderGame(); return;
  }

  if (betAmount < 1000) {
    setPhoneAppStatus("coin", { kicker: "COIN", title: "금액 오류", body: "최소 1,000원 이상 입력하세요.", tone: "fail" });
    renderGame(); return;
  }
  if (betAmount > balance) {
    setPhoneAppStatus("coin", { kicker: "COIN", title: "잔고 부족", body: "보유 현금보다 많은 금액은 매수할 수 없습니다.", tone: "fail" });
    renderGame(); return;
  }

  if (typeof spendCash === "function") spendCash(betAmount);
  else state.money = Math.max(0, state.money - betAmount);

  const coinInfo = typeof getCoinTypeInfo === "function" ? getCoinTypeInfo(coinType) : { label: coinType };
  state.coinHolding = { betAmount, buyDay: state.day, coinType };
  state.coinUsedToday = true;

  const message = `${coinInfo.label}(${coinType}) ${formatMoney(betAmount)}어치를 매수했다. 다음 턴 결과를 확인하자.`;
  setPhoneAppStatus("coin", { kicker: "COIN", title: "매수 완료", body: message, tone: "accent" });
  setHeadline("🪙 코인", message);
  recordActionMemory("코인을 매수했다", message, { type: "finance", source: "코인 앱", tags: ["코인", "매수", coinType] });
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 코인: 매도 실현 ────────────────────────────────────────
function runCoinSell() {
  if (state.coinUsedToday || !state.coinHolding) return;

  const holding = state.coinHolding;
  const returnRate = typeof getCoinDailyReturnRate === "function"
    ? getCoinDailyReturnRate(holding.coinType, state)
    : 0;
  const currentValue = Math.round(holding.betAmount * (1 + returnRate));
  const pnl = currentValue - holding.betAmount;

  if (typeof earnCash === "function") earnCash(currentValue);
  else state.money += currentValue;

  showMoneyEffect(pnl);
  state.coinHolding = null;
  state.coinUsedToday = true;

  const coinInfo = typeof getCoinTypeInfo === "function" ? getCoinTypeInfo(holding.coinType) : { label: holding.coinType };
  const pnlSign = pnl >= 0 ? "+" : "";
  const tone = pnl >= 0 ? "success" : "fail";
  const message = `${coinInfo.label} 매도 완료. ${formatMoney(currentValue)} 수령. 손익: ${pnlSign}${formatMoney(pnl)} (${(returnRate * 100).toFixed(1)}%)`;
  setPhoneAppStatus("coin", { kicker: "COIN", title: pnl >= 0 ? "매도 수익" : "매도 손실", body: message, tone });
  setHeadline("🪙 코인", message);
  recordActionMemory("코인을 매도했다", message, { type: "finance", source: "코인 앱", tags: ["코인", pnl >= 0 ? "수익" : "손실"] });
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

// ── 코인: 보유 유지 ────────────────────────────────────────
function runCoinHold() {
  if (state.coinUsedToday || !state.coinHolding) return;
  state.coinUsedToday = true;
  const coinInfo = typeof getCoinTypeInfo === "function" ? getCoinTypeInfo(state.coinHolding.coinType) : { label: state.coinHolding.coinType };
  const message = `${coinInfo.label} 보유를 유지하기로 했다. 다음 턴 다시 확인하자.`;
  setPhoneAppStatus("coin", { kicker: "COIN", title: "보유 유지", body: message, tone: "accent" });
  setHeadline("🪙 코인", message);
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

function handleTradingTerminalAction(phoneAction, actionTarget) {
  if (typeof ensureTradingTerminalState !== "function") {
    return false;
  }

  const appId = actionTarget?.dataset.appId;

  if (phoneAction === "terminal-set-mode") {
    setTradingTerminalMode(appId, actionTarget.dataset.mode, state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-set-asset") {
    setTradingTerminalAsset(appId, actionTarget.dataset.asset, state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-toggle-chart") {
    toggleTradingTerminalChart(appId, state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-set-leverage") {
    setTradingTerminalLeverage(appId, Number(actionTarget.dataset.leverage) || 5, state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-set-pct") {
    setTradingTerminalQuickAmount(appId, Number(actionTarget.dataset.pct) || 0, state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-spot-buy") {
    if (tradeTradingTerminalSpot(appId, "buy", state)) {
      renderGame();
    } else {
      renderGame();
    }
    return true;
  }

  if (phoneAction === "terminal-spot-sell") {
    tradeTradingTerminalSpot(appId, "sell", state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-futures-long") {
    tradeTradingTerminalFutures(appId, "long", state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-futures-short") {
    tradeTradingTerminalFutures(appId, "short", state);
    renderGame();
    return true;
  }

  if (phoneAction === "terminal-close-position") {
    closeTradingTerminalPosition(appId, actionTarget.dataset.positionId, state);
    renderGame();
    return true;
  }

  return false;
}

function orderDeliveryMeal() {
  if (state.phoneUsedToday) {
    return;
  }

  const cost = typeof getIndexedPrice === "function"
    ? getIndexedPrice(15000, state)
    : 15000;
  const economy = typeof getTodayEconomy === "function"
    ? getTodayEconomy(state)
    : null;
  if (typeof canAfford === "function" && !canAfford(cost, state)) {
    const message = `잔액이 부족해서 ${formatMoney(cost)}짜리 배달 주문을 넣지 못했다.`;
    setPhoneAppStatus("delivery", {
      kicker: "DELIVERY",
      title: "주문 실패",
      body: message,
      tone: "fail",
    });
    setHeadline("🍔 배달", message);
    renderGame();
    return;
  }

  if (typeof spendCash === "function") {
    spendCash(cost);
  } else {
    state.money = Math.max(0, state.money - cost);
  }
  restoreHunger(typeof HUNGER_MAX === "number" ? HUNGER_MAX : 100, state, { resetProgress: true });
  showMoneyEffect(-cost);

  const message = economy
    ? `물가지수 ${economy.priceIndex.toFixed(2)}가 반영돼 ${formatMoney(cost)}을 지출했다.`
    : `따뜻한 한 끼를 주문했다. ${formatMoney(cost)} 지출.`;
  setPhoneAppStatus("delivery", {
    kicker: "DELIVERY",
    title: "주문 완료",
    body: message,
    tone: "accent",
  });
  state.phonePreview = createPhoneResultPreview("delivery", "DELIVERY", "배달 주문 완료", message);
  state.phoneUsedToday = true;
  setHeadline("🍔 배달", message);
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
}

function watchVideoFeed() {
  if (state.phoneUsedToday) {
    return;
  }

  const message = "짧은 영상을 넘기다 보니 두 시간이 사라졌다.";
  setPhoneAppStatus("video", {
    kicker: "PLAYBACK",
    title: "무한 추천 피드",
    body: message,
    tone: "accent",
  });
  state.phonePreview = createPhoneResultPreview("video", "VIDEO", "짧은 영상 감상", message);
  state.phoneUsedToday = true;
  setHeadline("📺 DIS Tube", message);
  finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.videoApp });
}

function usePhoneApp(appId) {
  if (!state.hasPhone || !canUsePhoneApps()) {
    return;
  }

  if (typeof openPhoneAppRoute === "function") {
    if (!openPhoneAppRoute(appId, state)) {
      return;
    }
    renderGame();
    return;
  }

  if (appId === "jobs") {
    openPhoneJobsApp();
    return;
  }
}

function togglePhoneStage() {
  if (typeof togglePhoneStageState === "function") {
    if (!togglePhoneStageState(state)) {
      return;
    }
    renderGame();
    return;
  }

  if (!canOpenPhoneStage()) {
    return;
  }

  state.phoneStageExpanded = !state.phoneStageExpanded;
  renderGame();
}

function goBackInPhone() {
  if (typeof goBackInPhoneRoute === "function") {
    if (!goBackInPhoneRoute(state)) {
      return;
    }
    renderGame();
    return;
  }

  if (state.phoneMinimized) {
    return;
  }

  const route = typeof normalizePhoneRoute === "function"
    ? normalizePhoneRoute(state.phoneView || "home")
    : (state.phoneView || "home");

  if (typeof isPhoneHomeRoute === "function" ? !isPhoneHomeRoute(route) : route !== "home") {
    openPhoneHome();
    return;
  }

  if (state.phoneStageExpanded) {
    state.phoneStageExpanded = false;
    renderGame();
  }
}

function togglePhonePanel() {
  if (typeof togglePhonePanelState === "function") {
    if (!togglePhonePanelState(state)) {
      return;
    }
    if (spendMinorTime(1)) {
      advanceDayOrFinish();
      return;
    }
    renderGame();
    return;
  }

  if (!state.hasPhone) {
    return;
  }

  state.phoneMinimized = !state.phoneMinimized;
  if (state.phoneMinimized) {
    state.phoneStageExpanded = false;
  }
  if (spendMinorTime(1)) {
    advanceDayOrFinish();
    return;
  }
  renderGame();
}

function handlePhoneScreenClickLegacy(event) {
  return handlePhoneScreenClick(event);
}

function applyToPhoneJob(index) {
  if (typeof runPhoneJobApplicationAction === "function") {
    const result = runPhoneJobApplicationAction(index, state);
    if (result && !result.rendered) {
      renderGame();
    }
    return;
  }
}

function startScheduledShift() {
  if (typeof runStartScheduledShiftAction === "function") {
    const result = runStartScheduledShiftAction(state);
    if (result && !result.rendered) {
      renderGame();
    }
    return;
  }
}

function skipScheduledShift() {
  if (typeof runSkipScheduledShiftAction === "function") {
    const result = runSkipScheduledShiftAction(state);
    if (result && !result.rendered) {
      renderGame();
    }
    return;
  }
}

function prepareDayState(targetState = state) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : null;
  let bankLoanResolution = null;
  const turnBriefingEntries = typeof collectDueTurnEvents === "function"
    ? collectDueTurnEvents(targetState)
    : [];
  const shortTermInterviewResult = jobsState?.interviewResult && jobsState.interviewResult.day === targetState.day
    ? jobsState.interviewResult
    : null;
  const lottoSummary = typeof resolvePendingLottoRetailerTickets === "function"
    ? resolvePendingLottoRetailerTickets(targetState)
    : null;

  targetState.timeSlot = DAY_START_TIME_SLOT;
  targetState.timeMinuteOffset = 0;
  targetState.scene = "room";
  targetState.currentOffer = null;
  targetState.currentIncident = null;
  targetState.jobMiniGame = null;
  targetState.jobMiniGameResult = null;
  targetState.clockOutSummary = null;
  targetState.lastResult = null;
  targetState.endingSummary = null;
  targetState.cleaningGame = null;
  targetState.lectureGig = null;
  if (typeof clearRomanceActiveSceneSnapshot === "function") {
    clearRomanceActiveSceneSnapshot(targetState);
  } else {
    targetState.romanceScene = null;
    if (targetState.romance && typeof targetState.romance === "object") {
      targetState.romance.activeScene = null;
    }
  }
  targetState.hasPhone = true;
  targetState.phoneStageExpanded = false;
  targetState.phoneView = "home";
  targetState.phoneUsedToday = false;
  targetState.stocksUsedToday = false;
  targetState.casinoUsedToday = false;
  targetState.coinUsedToday = false;
  targetState.phonePreview = createPhoneHomePreview(targetState.day, targetState);
  bankLoanResolution = typeof processBankLoansForTurn === "function"
    ? processBankLoansForTurn(targetState)
    : null;
  const nextDailyOffers = buildDayOffersForState(targetState);
  targetState.headline = {
    badge: "",
    text: "",
  };

  syncWorldState(targetState);
  targetState.world.currentLocation = (typeof getResolvedHomeLocationId === "function"
    ? getResolvedHomeLocationId(targetState)
    : getDayHomeLocationId(targetState.day)) || targetState.world.currentLocation;
  targetState.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(targetState.world.currentLocation, targetState.day)
    : targetState.world.currentDistrict;
  clearAlleyNpcState(targetState);
  resetLocationWanderState(targetState);
  clearPendingTravelState(targetState);

  if (typeof resetDialogueState === "function") {
    resetDialogueState(targetState);
  }

  if (typeof resetPhoneSessionForDay === "function") {
    resetPhoneSessionForDay(targetState);
  }

  if (typeof ensureStockMarketAppState === "function") {
    ensureStockMarketAppState(targetState);
  }

  if (typeof ensureTradingTerminalState === "function") {
    ensureTradingTerminalState("coin", targetState);
    ensureTradingTerminalState("stocks", targetState);
  }

  if (typeof tickTradingTerminal === "function") {
    tickTradingTerminal("coin", targetState);
    tickTradingTerminal("stocks", targetState);
  }

  if (typeof patchJobsDomainState === "function") {
    const preservedScheduledShift = jobsState?.scheduledShift && jobsState.scheduledShift.day >= targetState.day
      ? jobsState.scheduledShift
      : null;
    patchJobsDomainState(targetState, {
      dailyOffers: nextDailyOffers,
      scheduledShift: preservedScheduledShift,
      interviewResult: jobsState?.interviewResult && jobsState.interviewResult.day === targetState.day
        ? jobsState.interviewResult
        : null,
      applicationDoneToday: false,
      careerApplicationDoneToday: false,
    });

    const careerProgress = resolveCareerProgressForState(targetState);
    const refreshedDailyOffers = buildDayOffersForState(targetState);
    const employedPostingId = getCareerEmploymentPostingId(targetState);
    const preservedCareerShift = preservedScheduledShift?.offer?.careerPostingId
      ? preservedScheduledShift
      : null;
    const careerScheduledShift = employedPostingId
      ? (preservedCareerShift || buildCareerShiftForState(targetState))
      : preservedScheduledShift;
    patchJobsDomainState(targetState, {
      dailyOffers: refreshedDailyOffers,
      scheduledShift: careerScheduledShift,
    });
    refreshCareerJobOffers(targetState);

    if (careerProgress) {
      turnBriefingEntries.push(normalizeTurnBriefingEntry({
        id: `career-progress-${targetState.day}-${careerProgress.posting?.id || "result"}`,
        day: targetState.day,
        badge: careerProgress.success ? "직장 합격" : "직장 결과",
        title: careerProgress.success
          ? `${careerProgress.posting?.title || "직장"} 합격`
          : `${careerProgress.posting?.title || "직장"} 결과`,
        speaker: "다음날 요약",
        tags: ["직장", careerProgress.success ? "합격" : "불합격"],
        lines: careerProgress.lines || [],
      }, targetState.day, turnBriefingEntries.length));
      targetState.headline = {
        badge: careerProgress.success ? "직장 합격" : "직장 결과",
        text: careerProgress.lines[careerProgress.lines.length - 1] || "",
      };
    } else if (!targetState.headline?.text && careerScheduledShift?.offer?.careerPostingId) {
      const careerJob = typeof getOfferRuntimeDefinition === "function"
        ? getOfferRuntimeDefinition(careerScheduledShift.offer)
        : null;
      const careerWorkplace = typeof getOfferWorkplaceSummary === "function"
        ? getOfferWorkplaceSummary(careerScheduledShift.offer, targetState)
        : null;
      targetState.headline = {
        badge: "직장 출근",
        text: `${careerJob?.title || "직장"} ${careerWorkplace?.workplaceName || "근무지"} 출근이 잡혀 있다.`,
      };
    }
  }

  if (shortTermInterviewResult) {
    turnBriefingEntries.push(normalizeTurnBriefingEntry({
      id: `short-job-result-${targetState.day}-${shortTermInterviewResult.offer?.jobId || "offer"}`,
      day: targetState.day,
      badge: shortTermInterviewResult.success ? "알바 합격" : "알바 결과",
      title: shortTermInterviewResult.success
        ? `${shortTermInterviewResult.offer?.title || "알바"} 합격`
        : `${shortTermInterviewResult.offer?.title || "알바"} 결과`,
      speaker: "다음날 요약",
      tags: ["알바", shortTermInterviewResult.success ? "합격" : "불합격"],
      lines: shortTermInterviewResult.lines || [],
    }, targetState.day, turnBriefingEntries.length));
  }

  refreshPhoneHomePreviewForState(targetState);

  if (typeof patchBankDomainState === "function") {
    patchBankDomainState(targetState, {
      transferDraft: {
        recipient: "",
        amount: "",
      },
    });
  } else if (typeof syncBankDomainState === "function") {
    syncBankDomainState(targetState);
  }

  if (bankLoanResolution) {
    turnBriefingEntries.push(normalizeTurnBriefingEntry({
      id: `bank-loan-${targetState.day}`,
      day: targetState.day,
      badge: bankLoanResolution.seizureTriggered ? "담보 압류" : "대출 상태",
      title: bankLoanResolution.title || "대출 상태",
      speaker: "다음날 요약",
      tone: bankLoanResolution.seizureTriggered ? "danger" : "warning",
      tags: ["은행", "대출"],
      lines: Array.isArray(bankLoanResolution.lines) && bankLoanResolution.lines.length
        ? bankLoanResolution.lines
        : [bankLoanResolution.body || "대출 상태가 갱신됐다."],
    }, targetState.day, turnBriefingEntries.length));

    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("bank", {
        kicker: bankLoanResolution.kicker || "BANK",
        title: bankLoanResolution.title || "대출 상태",
        body: bankLoanResolution.body || "",
        tone: bankLoanResolution.tone || (bankLoanResolution.ok ? "success" : "warning"),
      }, targetState);
    }

    if (!targetState.headline?.text || bankLoanResolution.seizureTriggered) {
      targetState.headline = {
        badge: bankLoanResolution.seizureTriggered ? "담보 압류" : "대출 상태",
        text: bankLoanResolution.body || (bankLoanResolution.lines?.[0] || ""),
      };
    }
  }

  const aiBaseIncomeSummary = typeof resolveAiResearcherBaseIncome === "function"
    ? resolveAiResearcherBaseIncome(targetState)
    : null;
  if (aiBaseIncomeSummary) {
    turnBriefingEntries.push(normalizeTurnBriefingEntry({
      id: `ai-base-income-${targetState.day}`,
      day: targetState.day,
      badge: aiBaseIncomeSummary.badge || "AI 기본금",
      title: aiBaseIncomeSummary.title || "AI 연구원 기본금",
      speaker: "?ㅼ쓬???붿빟",
      tags: ["AI", "기본금", "연구원"],
      lines: aiBaseIncomeSummary.lines || [],
    }, targetState.day, turnBriefingEntries.length));
    if (!targetState.headline?.text) {
      targetState.headline = {
        badge: aiBaseIncomeSummary.badge || "AI 기본금",
        text: aiBaseIncomeSummary.body || (aiBaseIncomeSummary.lines?.[0] || ""),
      };
    }
    refreshPhoneHomePreviewForState(targetState);
  }

  if (lottoSummary) {
    turnBriefingEntries.push(normalizeTurnBriefingEntry({
      id: `lotto-summary-${targetState.day}-${lottoSummary.ticketCount || 0}`,
      day: targetState.day,
      badge: lottoSummary.badge || "로또 결과",
      title: lottoSummary.title || "복권 결과",
      speaker: "다음날 요약",
      tags: ["복권", "결과"],
      lines: lottoSummary.lines || [],
    }, targetState.day, turnBriefingEntries.length));
    if (!targetState.headline?.text) {
      targetState.headline = {
        badge: lottoSummary.badge || "로또 결과",
        text: lottoSummary.lines?.[lottoSummary.lines.length - 1] || "어제 산 복권 결과가 나왔다.",
      };
    }
  }

  const romanceRoomEvent = typeof getTodayRomanceRoomEvent === "function"
    ? getTodayRomanceRoomEvent(targetState)
    : null;
  if (romanceRoomEvent && !targetState.headline?.text) {
    targetState.headline = {
      badge: romanceRoomEvent.headlineBadge || "약속",
      text: romanceRoomEvent.headlineText || romanceRoomEvent.title || "",
    };
  }
  if (turnBriefingEntries.length && typeof startTurnBriefing === "function") {
    startTurnBriefing(turnBriefingEntries, targetState);
  }
}

function handlePhoneScreenClick(event) {
  const appTarget = event.target.closest("[data-phone-app]");
  if (appTarget) {
    runGuardedUiAction(() => {
      if (spendPhoneInteractionTime()) {
        return;
      }
      usePhoneApp(appTarget.dataset.phoneApp);
    }, {
      source: "phone-action",
      actionId: `phone-app:${appTarget.dataset.phoneApp || ""}`,
      allowedModes: ["normal", "phone"],
    });
    return;
  }

  const routeTarget = event.target.closest("[data-phone-route]");
  if (routeTarget) {
    runGuardedUiAction(() => {
      if (spendPhoneInteractionTime()) {
        return;
      }
      if (typeof openPhoneRoute === "function" && openPhoneRoute(routeTarget.dataset.phoneRoute, state)) {
        renderGame();
      }
    }, {
      source: "phone-action",
      actionId: `phone-route:${routeTarget.dataset.phoneRoute || ""}`,
      allowedModes: ["normal", "phone"],
    });
    return;
  }

  const actionTarget = event.target.closest("[data-phone-action]");

  if (!actionTarget) {
    return;
  }

  const {
    phoneAction,
    offerIndex,
    track,
  } = actionTarget.dataset;

  runGuardedUiAction(() => {
    if (spendPhoneInteractionTime()) {
      return;
    }

    if (phoneAction === "close-phone-view") {
      openPhoneHome();
      return;
    }

  if (phoneAction === "install-phone-app") {
    installPhoneAppFromStore(actionTarget.dataset.appId);
    return;
  }

  if (phoneAction === "bus-ride-to-stop") {
    rideBusFromPhone(actionTarget.dataset.locationId);
    return;
  }

  if (phoneAction === "bus-take-express") {
    takeMetropolisExpressBus();
    return;
  }

  if (phoneAction === "refresh-dis-feed") {
    refreshDisInternetFeed();
    return;
  }

  if (phoneAction === "refresh-news-feed") {
    refreshNewsFeed();
    return;
  }

  if (phoneAction === "dis-run-search") {
    runDisInternetSearch(actionTarget);
    return;
  }

  if (phoneAction === "dis-open-community-stage") {
    openDisCommunityRoute("dis/singularity", { expandStage: true });
    return;
  }

  if (phoneAction === "dis-open-community-write-stage") {
    openDisCommunityRoute("dis/singularity-write", { expandStage: true });
    return;
  }

  if (phoneAction === "dis-open-community-post-stage") {
    openDisCommunityPost(actionTarget.dataset.postId, { expandStage: true });
    return;
  }

  if (phoneAction === "dis-open-community-post") {
    openDisCommunityPost(actionTarget.dataset.postId);
    return;
  }

  if (phoneAction === "dis-submit-community-post") {
    submitDisCommunityPostFromPhone(actionTarget);
    return;
  }

  if (phoneAction === "dis-submit-community-comment") {
    submitDisCommunityCommentFromPhone(actionTarget);
    return;
  }

  if (phoneAction === "dis-switch-community-tab") {
    if (typeof setDisCommunityTab === "function") {
      setDisCommunityTab(actionTarget.dataset.tab);
    }
    openDisCommunityRoute("dis/singularity", { expandStage: true });
    return;
  }

  if (phoneAction === "dis-like-community-post") {
    if (typeof likeDisCommunityPost === "function") {
      likeDisCommunityPost(actionTarget.dataset.postId);
    }
    state.headline = {
      badge: "Diggle",
      text: "추천을 눌렀다.",
    };
    renderGame();
    return;
  }

  if (phoneAction === "dis-set-gamble-bet") {
    setDisGambleDraftAmount(actionTarget.dataset.gameId, actionTarget.dataset.amount, state);
    renderGame();
    return;
  }

  if (typeof dispatchRegisteredPhoneAction === "function" && dispatchRegisteredPhoneAction(phoneAction, actionTarget, state)) {
    return;
  }

  if (typeof handleStockMarketAction === "function" && handleStockMarketAction(phoneAction, actionTarget)) {
    return;
  }

  if (handleTradingTerminalAction(phoneAction, actionTarget)) {
    return;
  }

  if (phoneAction === "dis-play-odd-even") {
    runDisOddEven(actionTarget);
    return;
  }

  if (phoneAction === "dis-play-ladder") {
    runDisLadder(actionTarget);
    return;
  }

  if (phoneAction === "call-show-incoming") {
    state.callPending = {
      contactId: actionTarget.dataset.contactId || "",
      label: actionTarget.dataset.label || "연락처",
      kind: actionTarget.dataset.kind || "family",
    };
    if (typeof openPhoneRoute === "function") {
      openPhoneRoute("call/incoming", state);
    } else {
      state.phoneView = "call/incoming";
      renderGame();
    }
    return;
  }

  if (phoneAction === "call-confirm-incoming") {
    const pending = state.callPending || {};
    state.callPending = null;
    if (pending.kind === "romance" && pending.contactId) {
      callRomancePhoneContact(pending.contactId);
    } else {
      callHomeContact();
    }
    state.phoneMinimized = true;
    state.phoneStageExpanded = false;
    state.phoneView = "call/home";
    renderGame();
    return;
  }

  if (phoneAction === "call-reject-incoming") {
    state.callPending = null;
    if (typeof openPhoneRoute === "function") {
      openPhoneRoute("call/home", state);
    } else {
      state.phoneView = "call/home";
      renderGame();
    }
    return;
  }

  if (phoneAction === "call-home-contact") {
    callHomeContact();
    return;
  }

  if (phoneAction === "call-romance-contact") {
    callRomancePhoneContact(actionTarget?.dataset?.contactId || "");
    renderGame();
    return;
  }

  if (phoneAction === "schedule-romance-date") {
    if (typeof scheduleRomanceDate === "function") {
      scheduleRomanceDate(actionTarget?.dataset?.contactId || "", state);
    }
    renderGame();
    return;
  }

  if (phoneAction === "invite-romance-home") {
    if (typeof scheduleRomanceHomeInvite === "function") {
      scheduleRomanceHomeInvite(actionTarget?.dataset?.contactId || "", state);
    }
    renderGame();
    return;
  }

  if (phoneAction === "bank-deposit-cash") {
    depositCashToBank(actionTarget);
    return;
  }

  if (phoneAction === "bank-withdraw-cash") {
    withdrawCashFromBank(actionTarget);
    return;
  }

  if (phoneAction === "bank-fill-recipient") {
    fillBankTransferRecipient(actionTarget);
    return;
  }

  if (phoneAction === "bank-fill-amount") {
    fillBankTransferAmount(actionTarget);
    return;
  }

  if (phoneAction === "bank-transfer-money") {
    submitBankTransfer(actionTarget);
    return;
  }

  if (phoneAction === "bank-take-loan") {
    requestBankLoan(actionTarget);
    return;
  }

  if (phoneAction === "bank-repay-loan-minimum") {
    repayBankLoanFromPhone(actionTarget, "minimum");
    return;
  }

  if (phoneAction === "bank-repay-loan-full") {
    repayBankLoanFromPhone(actionTarget, "full");
    return;
  }

  if (phoneAction === "jobs-set-track") {
    if (typeof setJobsActiveTrack === "function") {
      setJobsActiveTrack(track, state);
    }
    renderGame();
    return;
  }

  if (phoneAction === "apply-career-job") {
    applyToCareerJob(Number(offerIndex));
    return;
  }

  if (phoneAction === "run-stocks-trade") {
    runStocksTrade();
    return;
  }

  if (phoneAction === "run-stocks-enter") {
    runStocksEnter();
    return;
  }

  if (phoneAction === "run-stocks-sell") {
    runStocksSell();
    return;
  }

  if (phoneAction === "run-stocks-hold") {
    runStocksHold();
    return;
  }

  if (phoneAction === "run-casino-bet") {
    runCasinoBet();
    return;
  }

  if (phoneAction === "casino-fill-exchange") {
    fillCasinoExchangeDraft(actionTarget.dataset.direction, Number(actionTarget.dataset.amount) || 0);
    return;
  }

  if (phoneAction === "casino-exchange-in") {
    runCasinoExchangeIn();
    return;
  }

  if (phoneAction === "casino-exchange-out") {
    runCasinoExchangeOut();
    return;
  }

  if (phoneAction === "casino-add-bet") {
    addCasinoBlackjackBet(Number(actionTarget.dataset.amount) || 0);
    return;
  }

  if (phoneAction === "casino-reset-bet") {
    resetCasinoBlackjackBet();
    return;
  }

  if (phoneAction === "casino-start-blackjack") {
    startCasinoBlackjackRound();
    return;
  }

  if (phoneAction === "casino-hit") {
    casinoBlackjackHit();
    return;
  }

  if (phoneAction === "casino-stand") {
    casinoBlackjackStand();
    return;
  }

  if (phoneAction === "casino-double") {
    casinoBlackjackDoubleDown();
    return;
  }

  if (phoneAction === "casino-set-ace") {
    setCasinoBlackjackAcePreference(Number(actionTarget.dataset.ace) || 11);
    return;
  }

  if (phoneAction === "casino-slot-set-bet") {
    setCasinoSlotBet(Number(actionTarget.dataset.amount) || CASINO_SLOT_MIN_BET);
    return;
  }

  if (phoneAction === "run-coin-enter") {
    runCoinEnter();
    return;
  }

  if (phoneAction === "run-coin-sell") {
    runCoinSell();
    return;
  }

  if (phoneAction === "run-coin-hold") {
    runCoinHold();
    return;
  }

  if (phoneAction === "order-delivery-meal") {
    orderDeliveryMeal();
    return;
  }

    if (phoneAction === "watch-video-feed") {
      watchVideoFeed();
    }
  }, {
    source: "phone-action",
    actionId: `phone-action:${phoneAction || "unknown"}`,
    allowedModes: ["normal", "phone"],
  });
}

function buildDayOffersForState(targetState = state) {
  const activeIds = [...targetState.activeJobs];
  const chosenIds = shuffle(activeIds).slice(0, Math.min(3, activeIds.length));

  return chosenIds.map((jobId) => {
    const job = JOB_LOOKUP[jobId];
    const shiftRule = getJobShiftRule(jobId);
    const basePay = roundToHundred(randomBetween(job.payMin, job.payMax));
    const offer = {
      jobId,
      pay: typeof getAdjustedWage === "function"
        ? getAdjustedWage(basePay, targetState)
        : basePay,
      shiftStartSlot: sample(shiftRule.startSlotChoices),
      shiftDurationSlots: shiftRule.durationSlots,
    };
    const eligibility = getShortTermOfferEligibility(offer, targetState);

    return {
      ...offer,
      requirementTags: [...(eligibility.requirementTags || [])],
      unmetRequirements: [...(eligibility.unmetRequirements || [])],
      eligible: Boolean(eligibility.eligible),
    };
  });
}

function buildDayOffers() {
  return buildDayOffersForState(state);
}

function ensureJobOffersReady(targetState = state) {
  if (!targetState || typeof syncJobsDomainState !== "function" || typeof patchJobsDomainState !== "function") {
    return null;
  }

  const jobsState = syncJobsDomainState(targetState);
  const patch = {};
  const hasActiveShortTermJobs = targetState.activeJobs instanceof Set
    ? targetState.activeJobs.size > 0
    : Array.isArray(targetState.activeJobs) && targetState.activeJobs.length > 0;

  if ((!Array.isArray(jobsState.dailyOffers) || !jobsState.dailyOffers.length) && hasActiveShortTermJobs) {
    patch.dailyOffers = buildDayOffersForState(targetState);
  }

  if ((!Array.isArray(jobsState.careerOffers) || !jobsState.careerOffers.length) && typeof buildCareerOffersForState === "function") {
    patch.careerOffers = buildCareerOffersForState(targetState);
  }

  if (Object.keys(patch).length) {
    return patchJobsDomainState(targetState, patch);
  }

  return jobsState;
}

function applyDevReplayPresetToState(targetState, preset, day = targetState.day) {
  if (!targetState || !preset) {
    return;
  }

  if (preset.baseState) {
    applyStatePatch(targetState, preset.baseState);
  }

  switch (preset.type) {
    case "story":
      targetState.scene = "prologue";
      targetState.storyKey = preset.storyKey || "intro";
      targetState.storyStep = Math.max(0, preset.storyStep || 0);
      targetState.cleaningGame = null;
      targetState.phoneMinimized = true;
      targetState.phoneView = "home";
      break;
    case "cleanup": {
      const event = findDayEventById(preset.eventId, day);
      const cleanup = getDayEventConfig(event, day);
      if (event && cleanup) {
        targetState.scene = "cleanup";
        targetState.cleaningGame = {
          eventId: event.id,
          items: cleanup.items.map((item) => ({ ...item })),
          remaining: cleanup.items.length,
        };
      }
      if (preset.storyKey) {
        targetState.storyKey = preset.storyKey;
      }
      if (preset.storyStep != null) {
        targetState.storyStep = preset.storyStep;
      }
      targetState.phoneMinimized = true;
      targetState.phoneView = "home";
      break;
    }
    case "phone":
      targetState.scene = preset.scene || "room";
      targetState.phoneMinimized = preset.phoneMinimized ?? false;
      targetState.phoneView = typeof normalizePhoneRoute === "function"
        ? normalizePhoneRoute(preset.view || "home")
        : (preset.view || "home");
      break;
    case "scene":
    default:
      targetState.scene = preset.scene || "room";
      if (preset.phoneView) {
        targetState.phoneView = typeof normalizePhoneRoute === "function"
          ? normalizePhoneRoute(preset.phoneView)
          : preset.phoneView;
      }
      if (preset.phoneMinimized != null) {
        targetState.phoneMinimized = preset.phoneMinimized;
      }
      break;
  }

  if (preset.state) {
    applyStatePatch(targetState, preset.state);
  }

  if (preset.headline) {
    targetState.headline = {
      ...targetState.headline,
      ...preset.headline,
    };
  }

  if (typeof preset.apply === "function") {
    preset.apply(targetState, {
      day,
      getEventConfig: (eventId) => getDayEventConfig(findDayEventById(eventId, day), day),
    });
  }

  if (typeof isPhoneHomeRoute === "function" ? isPhoneHomeRoute(targetState.phoneView) : targetState.phoneView === "home") {
    refreshPhoneHomePreviewForState(targetState);
  }
}

function createDevReplayState(day, presetId, playerName = state?.playerName) {
  const preset = getDayDevPresets(day).find((entry) => entry.id === presetId);
  if (!preset) {
    return null;
  }

  const nextState = createInitialState();
  nextState.playerName = playerName || nextState.playerName;
  nextState.day = day;
  nextState.day1CleanupDone = day > 1;
  nextState.devPreviewMode = true;
  prepareDayState(nextState);
  applyDevReplayPresetToState(nextState, preset, day);
  return nextState;
}

function selectJobOffer(index) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(state)
    : createDefaultJobsState();
  const offer = jobsState.dailyOffers[index];
  if (!offer) {
    return;
  }

  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, state)
    : null;
  state.currentOffer = offer;
  state.jobVisits[offer.jobId] = (state.jobVisits[offer.jobId] || 0) + 1;
  state.currentIncident = pickIncident(offer.jobId, state.jobVisits[offer.jobId]);
  state.scene = "incident";
  state.headline = {
    badge: JOB_LOOKUP[offer.jobId].category,
    text: `${JOB_LOOKUP[offer.jobId].title} 공고를 잡았다. ${workplace?.workplaceName || "근무지"}에선 오늘 어떤 일이 터질까.`,
  };
  recordActionMemory("공고 하나를 붙잡았다", `${JOB_LOOKUP[offer.jobId].title} 공고를 보고 ${workplace?.workplaceName || "근무지"}에서 오늘 해볼 일로 정했다.`, {
    type: "job",
    source: workplace?.workplaceName || getCurrentLocationLabel(),
    tags: ["알바", "공고", offer.jobId, workplace?.districtId || ""].filter(Boolean),
  });
  renderGame();
}

function pickIncident(jobId, visits) {
  const pack = JOB_EVENTS[jobId];
  if (!pack) {
    return null;
  }
  const critical = pack.critical;

  if (critical && visits >= (critical.minVisits || 1) && !state.seenIncidents.has(critical.id)) {
    return critical;
  }

  return sample(pack.repeatable);
}

function chooseIncidentOption(index) {
  const incident = state.currentIncident;
  if (!incident) {
    return;
  }

  const choice = incident.choices[index];
  if (!choice) {
    return;
  }

  if (incident.once) {
    state.seenIncidents.add(incident.id);
  }

  const miniGameResult = state.jobMiniGameResult?.jobId === state.currentOffer?.jobId
    ? state.jobMiniGameResult
    : null;
  const miniGameBonus = Number.isFinite(miniGameResult?.bonus)
    ? Number(miniGameResult.bonus)
    : 0;
  const pay = roundToHundred(calculatePay(state.currentOffer.pay, choice) + miniGameBonus);
  const resultLines = Array.isArray(choice.result) ? [...choice.result] : [];
  const miniGameSummary = buildJobMiniGameSummary(miniGameResult);
  if (miniGameSummary) {
    resultLines.unshift(miniGameSummary);
  }
  if (typeof earnBankBalance === "function") {
    earnBankBalance(pay, {
      title: `${state.currentOffer.title} 급여 입금`,
      type: "income",
      direction: "in",
      note: "오늘 근무 정산",
    }, state);
  } else if (typeof patchBankDomainState === "function") {
    const bankState = typeof getBankDomainState === "function"
      ? getBankDomainState(state)
      : { balance: 0 };
    patchBankDomainState(state, {
      balance: bankState.balance + pay,
    });
    if (typeof recordBankTransaction === "function") {
      recordBankTransaction({
        title: `${state.currentOffer.title} 급여 입금`,
        amount: pay,
        type: "income",
        direction: "in",
        note: "오늘 근무 정산",
      }, state);
    }
  } else {
    state.money += pay;
  }

  resultLines.unshift(`급여 ${formatMoney(pay)}이 계좌로 입금됐다.`);

  if (choice.changes?.remove) {
    choice.changes.remove.forEach((jobId) => state.activeJobs.delete(jobId));
  }

  if (choice.changes?.add) {
    choice.changes.add.forEach((jobId) => state.activeJobs.add(jobId));
  }

  state.lastResult = {
    pay,
    depositDestination: "bank",
    lines: resultLines,
  };
  state.jobMiniGameResult = null;

  state.headline = choice.changes?.news
    ? {
        badge: "시장 변화",
        text: choice.changes.news,
      }
    : {
        badge: "오늘 정산",
        text: "하루 근무가 끝났다. 내일은 또 다른 공고를 찾는다.",
      };

  state.scene = "result";
  renderGame();
}

function goToNextDay() {
  advanceDayOrFinish();
}

function sleepInRoom() {
  if (getScheduledShiftForToday()) {
    skipScheduledShift();
    return;
  }

  advanceDayOrFinish();
}

function syncHomeTransitionState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return null;
  }

  const homeTransition = targetState.homeTransition;
  if (!homeTransition || typeof homeTransition !== "object") {
    targetState.homeTransition = null;
    return null;
  }

  const allowedStageIds = new Set(["lobby", "transit"]);
  const stageIds = Array.isArray(homeTransition.stageIds)
    ? homeTransition.stageIds
      .map((stageId) => String(stageId || "").trim().toLowerCase())
      .filter((stageId) => allowedStageIds.has(stageId))
    : [];

  if (!stageIds.length) {
    targetState.homeTransition = null;
    return null;
  }

  targetState.homeTransition = {
    direction: homeTransition.direction === "inbound" ? "inbound" : "outbound",
    stageIds,
    currentIndex: Math.max(0, Math.min(stageIds.length - 1, Math.round(Number(homeTransition.currentIndex) || 0))),
    autoOpenMapTargetLocation: String(homeTransition.autoOpenMapTargetLocation || "").trim(),
  };

  return targetState.homeTransition;
}

function getCurrentHomeTransitionStageId(targetState = state) {
  const homeTransition = syncHomeTransitionState(targetState);
  if (!homeTransition) {
    return "";
  }

  return homeTransition.stageIds[homeTransition.currentIndex] || "";
}

function clearHomeTransitionState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return null;
  }

  targetState.homeTransition = null;
  return null;
}

function finalizeHomeRouteTransition(targetState = state) {
  const homeTransition = syncHomeTransitionState(targetState);
  const direction = homeTransition?.direction === "inbound" ? "inbound" : "outbound";
  const autoOpenMapTargetLocation = String(homeTransition?.autoOpenMapTargetLocation || "").trim();

  clearHomeTransitionState(targetState);
  targetState.scene = direction === "inbound" ? "room" : "outside";
  targetState.headline = {
    badge: "",
    text: "",
  };

  if (targetState === state) {
    renderGame();
    if (direction === "outbound" && autoOpenMapTargetLocation) {
      if (typeof openCityMapOverlayToLocation === "function") {
        openCityMapOverlayToLocation(autoOpenMapTargetLocation, targetState);
      } else if (typeof openCityMapOverlay === "function") {
        openCityMapOverlay(targetState);
      }
    }
  }

  return true;
}

function advanceHomeTransition(targetState = state) {
  const homeTransition = syncHomeTransitionState(targetState);
  if (!homeTransition) {
    return false;
  }

  const nextIndex = homeTransition.currentIndex + 1;
  if (nextIndex >= homeTransition.stageIds.length) {
    return finalizeHomeRouteTransition(targetState);
  }

  targetState.homeTransition = {
    ...homeTransition,
    currentIndex: nextIndex,
  };

  if (targetState === state) {
    renderGame();
  }

  return true;
}

function beginHomeRouteTransition(direction = "outbound", {
  spendTime = true,
  autoOpenMapTargetLocation = "",
  targetState = state,
} = {}) {
  const normalizedDirection = direction === "inbound" ? "inbound" : "outbound";
  if (spendTime && spendTimeSlots(TIME_COSTS.moveBetweenScenes)) {
    advanceDayOrFinish();
    return false;
  }

  syncWorldState(targetState);
  targetState.world.currentLocation = (typeof getResolvedHomeLocationId === "function"
    ? getResolvedHomeLocationId(targetState)
    : getDayHomeLocationId(targetState.day)) || targetState.world.currentLocation;
  targetState.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(targetState.world.currentLocation, targetState.day)
    : targetState.world.currentDistrict;
  clearAlleyNpcState(targetState);
  clearWanderResultState(targetState);
  clearPendingTravelState(targetState);

  const stageIds = typeof getSpoonStartHomeRouteStageIds === "function"
    ? getSpoonStartHomeRouteStageIds(targetState, normalizedDirection)
    : [];

  targetState.headline = {
    badge: "",
    text: "",
  };

  if (!Array.isArray(stageIds) || !stageIds.length) {
    clearHomeTransitionState(targetState);
    targetState.scene = normalizedDirection === "inbound" ? "room" : "outside";

    if (targetState === state) {
      renderGame();
      if (normalizedDirection === "outbound" && autoOpenMapTargetLocation) {
        if (typeof openCityMapOverlayToLocation === "function") {
          openCityMapOverlayToLocation(autoOpenMapTargetLocation, targetState);
        } else if (typeof openCityMapOverlay === "function") {
          openCityMapOverlay(targetState);
        }
      }
    }

    return true;
  }

  targetState.homeTransition = {
    direction: normalizedDirection,
    stageIds: [...stageIds],
    currentIndex: 0,
    autoOpenMapTargetLocation: String(autoOpenMapTargetLocation || "").trim(),
  };
  targetState.scene = "home-transition";

  if (targetState === state) {
    renderGame();
  }

  return true;
}

function goOutside(options = {}) {
  if (!beginHomeRouteTransition("outbound", {
    spendTime: options.spendTime !== false,
    autoOpenMapTargetLocation: options.autoOpenMapTargetLocation || "",
    targetState: state,
  })) {
    return;
  }

  recordActionMemory("집 밖으로 나간다", `${getCurrentLocationLabel()} 쪽으로 문을 열고 나간다.`, {
    type: "travel",
    source: "집",
    tags: ["이동", "외출"],
  });
  return;

  if (spendTimeSlots(TIME_COSTS.moveBetweenScenes)) {
    advanceDayOrFinish();
    return;
  }
  syncWorldState(state);
  state.world.currentLocation = (typeof getResolvedHomeLocationId === "function"
    ? getResolvedHomeLocationId(state)
    : getDayHomeLocationId(state.day)) || state.world.currentLocation;
  state.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(state.world.currentLocation, state.day)
    : state.world.currentDistrict;
  clearAlleyNpcState(state);
  clearWanderResultState(state);
  clearPendingTravelState(state);
  state.scene = "outside";
  state.headline = {
    badge: "",
    text: "",
  };
  recordActionMemory("집 밖으로 나갔다", `${getCurrentLocationLabel()} 쪽으로 문을 열고 나갔다.`, {
    type: "travel",
    source: "집",
    tags: ["이동", "외출"],
  });
  renderGame();
}

function completeBusTravel() {
  return completePendingWorldTravel({
    targetState: state,
    fallbackLocationId: "bus-stop",
  });
  const worldState = syncWorldState(state);
  const targetLocation = worldState.pendingTravelTarget;
  const locationMap = getDayWorldLocationMap(state.day);

  if (!targetLocation || !locationMap?.[targetLocation]) {
    worldState.currentLocation = "bus-stop";
    clearAlleyNpcState(state);
    clearWanderResultState(state);
    clearPendingTravelState(state);
    renderGame();
    return;
  }

  worldState.currentLocation = targetLocation;
  worldState.currentDistrict = worldState.pendingTravelDistrict
    || (typeof getWorldLocationDistrictId === "function"
      ? getWorldLocationDistrictId(targetLocation, state.day)
      : worldState.currentDistrict);
  if (worldState.currentDistrict && !worldState.unlockedDistricts.includes(worldState.currentDistrict)) {
    worldState.unlockedDistricts.push(worldState.currentDistrict);
  }
  if (targetLocation && !worldState.unlockedLocations.includes(targetLocation)) {
    worldState.unlockedLocations.push(targetLocation);
  }
  clearAlleyNpcState(state);
  clearWanderResultState(state);
  clearPendingTravelState(state);
  state.world.currentLocation = targetLocation;
  state.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(targetLocation, state.day)
    : state.world.currentDistrict;
  state.headline = {
    badge: "버스 도착",
    text: `${locationMap[targetLocation].label}에 내려 주변을 둘러본다.`,
  };
  recordActionMemory("버스에서 내렸다", `${locationMap[targetLocation].label}에 내려 주변을 둘러봤다.`, {
    type: "travel",
    source: "버스",
    tags: ["이동", "버스", targetLocation],
  });
  renderGame();
}

function completeWalkTravel() {
  return completePendingWorldTravel({
    targetState: state,
    fallbackLocationId: typeof getResolvedHomeLocationId === "function"
      ? getResolvedHomeLocationId(state)
      : getDayHomeLocationId(state.day),
  });
  const worldState = syncWorldState(state);
  const targetLocation = worldState.pendingTravelTarget;
  const locationMap = getDayWorldLocationMap(state.day);
  const travelMethod = getPendingTravelMethodLabel(state);
  const isPureWalkTravel = travelMethod === "도보";

  if (!targetLocation || !locationMap?.[targetLocation]) {
    worldState.currentLocation = (typeof getResolvedHomeLocationId === "function"
      ? getResolvedHomeLocationId(state)
      : getDayHomeLocationId(state.day)) || "apt-alley";
    clearAlleyNpcState(state);
    clearWanderResultState(state);
    clearPendingTravelState(state);
    renderGame();
    return;
  }

  worldState.currentLocation = targetLocation;
  worldState.currentDistrict = worldState.pendingTravelDistrict
    || (typeof getWorldLocationDistrictId === "function"
      ? getWorldLocationDistrictId(targetLocation, state.day)
      : worldState.currentDistrict);
  if (targetLocation === "bus-stop-map") {
    setWorldTerminalTab("route", state);
  }
  if (worldState.currentDistrict && !worldState.unlockedDistricts.includes(worldState.currentDistrict)) {
    worldState.unlockedDistricts.push(worldState.currentDistrict);
  }
  if (targetLocation && !worldState.unlockedLocations.includes(targetLocation)) {
    worldState.unlockedLocations.push(targetLocation);
  }
  clearAlleyNpcState(state);
  clearWanderResultState(state);
  clearPendingTravelState(state);
  state.world.currentLocation = targetLocation;
  state.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(targetLocation, state.day)
    : state.world.currentDistrict;
  state.headline = {
    badge: isPureWalkTravel ? "도보 도착" : "이동 도착",
    text: isPureWalkTravel
      ? `${locationMap[targetLocation].label}에 걸어서 도착했다.`
      : `${locationMap[targetLocation].label}에 ${travelMethod}로 도착했다.`,
  };
  recordActionMemory(isPureWalkTravel ? "걸어서 이동했다" : "이동을 마쳤다", isPureWalkTravel
    ? `${locationMap[targetLocation].label}에 걸어서 도착했다.`
    : `${locationMap[targetLocation].label}에 ${travelMethod}로 도착했다.`, {
    type: "travel",
    source: travelMethod,
    tags: ["이동", ...(travelMethod.includes("버스") ? ["버스"] : []), ...(travelMethod.includes("도보") ? ["도보"] : []), targetLocation],
  });
  renderGame();
}

function waitForSeoulRailEvent() {
  if (spendMinorTime(1)) {
    advanceDayOrFinish();
    return;
  }

  state.headline = {
    badge: "서울행 통로",
    text: "서울역으로 이어질 다음 이벤트는 아직 준비 중이다. 지금은 통로 앞에서 잠시 대기한다.",
  };
  if (typeof recordActionMemory === "function") {
    recordActionMemory("서울역 가는 철도 통로를 확인했다", "아직 본격적인 이동은 열리지 않았고, 통로 앞에서 잠시 대기만 했다.", {
      type: "travel",
      source: "배금역",
      tags: ["철도", "서울역", "대기"],
    });
  }
  renderGame();
}

function handleWorldKeyDown(event) {
  const targetTag = String(event.target?.tagName || "").toUpperCase();
  const isEditableTarget = event.target?.isContentEditable
    || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(targetTag);
  const isTypingTarget = event.target?.isContentEditable
    || ["INPUT", "TEXTAREA", "SELECT"].includes(targetTag);

  if (!isTypingTarget && (event.key === "m" || event.key === "M")) {
    event.preventDefault();
    runGuardedUiAction(() => {
      toggleMemoryLog();
    }, {
      source: "overlay-toggle",
      actionId: "keyboard:memory-toggle",
      allowedModes: ["normal"],
      suppressFeedback: true,
    });
    return;
  }

  if (!isTypingTarget && (event.key === "i" || event.key === "I")) {
    event.preventDefault();
    runGuardedUiAction(() => {
      toggleInventoryLog();
    }, {
      source: "overlay-toggle",
      actionId: "keyboard:inventory-toggle",
      allowedModes: ["normal"],
      suppressFeedback: true,
    });
    return;
  }

  if (event.key === "Escape" && state.inventory?.panelOpen) {
    event.preventDefault();
    closeInventoryLog();
    return;
  }

  if (event.key === "Escape" && state.memory?.panelOpen) {
    event.preventDefault();
    closeMemoryLog();
    return;
  }

  if (!isEditableTarget && event.key === "Escape" && state.scene === "job-minigame") {
    event.preventDefault();
    runGuardedUiAction(() => {
      if (typeof cancelJobMiniGame === "function") {
        cancelJobMiniGame("escape");
      }
    }, {
      source: "minigame-action",
      actionId: "keyboard:cancel-job-minigame",
      allowedModes: ["minigame"],
      suppressFeedback: true,
    });
    return;
  }

  if (!isEditableTarget && ["Enter", " "].includes(event.key) && typeof canAdvanceSceneText === "function" && canAdvanceSceneText()) {
    event.preventDefault();
    runGuardedUiAction(() => {
      advanceSceneText();
    }, {
      source: "textbox-advance",
      actionId: "keyboard:advance-text",
      suppressFeedback: true,
    });
    return;
  }

  if (state.scene !== "outside") {
    return;
  }

  if (["ArrowRight", "ArrowLeft", "a", "A", "d", "D"].includes(event.key)) {
    event.preventDefault();
  }
}

function handleTextboxClick(event) {
  const terminalTabTarget = event.target?.closest?.("[data-terminal-tab]");
  if (terminalTabTarget) {
    runGuardedUiAction(() => {
      setWorldTerminalTab(terminalTabTarget.dataset.terminalTab, state);
      renderGame();
    }, {
      source: "scene-choice",
      actionId: `terminal-tab:${terminalTabTarget.dataset.terminalTab || ""}`,
    });
    return;
  }

  if (!event.target || event.target.closest("#choices, button, a, input, textarea, select")) {
    return;
  }

  if (typeof canAdvanceSceneText === "function" && canAdvanceSceneText()) {
    runGuardedUiAction(() => {
      advanceSceneText();
    }, {
      source: "textbox-advance",
      actionId: "textbox:advance-text",
      suppressFeedback: true,
    });
  }
}

function getInputGateDebugLog(targetState = state) {
  return [...(syncInputGateState(targetState).debugLog || [])];
}

function forceRecoverInputGate(targetState = state, reason = "manual-reset") {
  return recoverStaleInputGate(targetState, {
    force: true,
    reason,
  });
}

function getWorldLocationConfig(locationId = "", targetState = state) {
  const normalizedLocationId = String(locationId || "").trim();
  if (!normalizedLocationId) {
    return null;
  }

  const day = targetState?.day || getCurrentDayNumber();
  return getDayWorldLocationMap(day)?.[normalizedLocationId] || null;
}

function resolveWorldMoveFallbackLocation(preferredLocationId = "", targetState = state) {
  const day = targetState?.day || getCurrentDayNumber();
  const locationMap = getDayWorldLocationMap(day) || {};
  const worldState = syncWorldState(targetState);
  const currentLocationId = getCurrentLocationId(targetState);
  const candidateIds = [
    preferredLocationId,
    worldState.pendingTravelSourceLocationId,
    !isTravelSceneLocationId(currentLocationId) ? currentLocationId : "",
    typeof getResolvedHomeLocationId === "function"
      ? getResolvedHomeLocationId(targetState)
      : getDayHomeLocationId(day),
    getDayHomeLocationId(day),
    ...Object.keys(locationMap),
  ];

  return candidateIds.find((locationId) => {
    const normalizedLocationId = String(locationId || "").trim();
    return normalizedLocationId
      && locationMap[normalizedLocationId]
      && !(typeof isTravelSceneLocationId === "function" && isTravelSceneLocationId(normalizedLocationId));
  }) || "";
}

function getWorldMoveTravelMethod(config = {}, targetState = state) {
  if (typeof config.travelMethod === "string" && config.travelMethod.trim()) {
    return config.travelMethod.trim();
  }

  const normalizedTravelSceneId = String(config.travelSceneId || "").trim();
  const travelMode = normalizedTravelSceneId === "bus-ride" || normalizedTravelSceneId === "express-bus-travel"
    ? "bus"
    : "walk";

  if (typeof getTravelMethodLabelForMode === "function") {
    return getTravelMethodLabelForMode(travelMode, targetState);
  }

  return travelMode === "bus" ? "\uBC84\uC2A4" : "\uB3C4\uBCF4";
}

function shouldResolveWorldMoveDirectly(targetLocation = "", config = {}, targetState = state) {
  if (config.forceTravelMode === true) {
    return false;
  }
  if (config.forceDirectMove === true) {
    return true;
  }

  const normalizedTargetLocation = String(targetLocation || "").trim();
  const currentLocationId = getCurrentLocationId(targetState);
  const currentLocation = getWorldLocationConfig(currentLocationId, targetState);
  const nextLocation = getWorldLocationConfig(normalizedTargetLocation, targetState);

  if (!normalizedTargetLocation || !currentLocation || !nextLocation || currentLocationId === normalizedTargetLocation) {
    return false;
  }

  const currentExits = Array.isArray(currentLocation.exits) ? currentLocation.exits : [];
  if (!currentExits.includes(normalizedTargetLocation)) {
    return false;
  }

  const normalizedTravelSceneId = String(config.travelSceneId || "").trim();
  if (normalizedTravelSceneId === "bus-ride" || normalizedTravelSceneId === "express-bus-travel") {
    return false;
  }

  const explicitTravelMinutes = Number(config.travelMinutes);
  const currentAnchorId = typeof getCityMapAnchorLocationId === "function"
    ? getCityMapAnchorLocationId(currentLocationId, targetState)
    : "";
  const targetAnchorId = typeof getCityMapAnchorLocationId === "function"
    ? getCityMapAnchorLocationId(normalizedTargetLocation, targetState)
    : "";
  const nextExits = Array.isArray(nextLocation.exits) ? nextLocation.exits : [];
  const sameAnchorId = Boolean(currentAnchorId && targetAnchorId && currentAnchorId === targetAnchorId);
  const touchesHiddenLocation = Boolean(currentLocation.cityMapHidden || nextLocation.cityMapHidden);
  const missingMapNode = !currentLocation.mapNode || !nextLocation.mapNode;
  const shortHop = Number.isFinite(explicitTravelMinutes) && explicitTravelMinutes > 0 && explicitTravelMinutes <= TIME_SLOT_MINUTES;
  const edgeLocationHop = currentExits.length <= 2 || nextExits.length <= 2;

  return sameAnchorId || touchesHiddenLocation || missingMapNode || shortHop || edgeLocationHop || config.keepVisible === true;
}

function getDirectWorldMoveMinutes(targetLocation = "", config = {}, targetState = state) {
  const explicitTravelMinutes = Number(config.travelMinutes);
  if (Number.isFinite(explicitTravelMinutes) && explicitTravelMinutes > 0) {
    return Math.max(1, Math.round(explicitTravelMinutes));
  }

  const estimatedTravelMinutes = estimateWalkTravelMinutes(
    getCurrentLocationId(targetState),
    targetLocation,
    targetState
  );
  if (Number.isFinite(estimatedTravelMinutes) && estimatedTravelMinutes > 0) {
    return Math.max(1, Math.min(TIME_SLOT_MINUTES, Math.round(estimatedTravelMinutes)));
  }

  return 4;
}

function finalizeWorldArrival(targetLocation = "", config = {}) {
  const {
    targetState = state,
    fallbackLocationId = "",
    arrivalBadge = "",
    arrivalText = "",
    memoryTitle = "",
    memoryText = "",
    memoryTags = null,
    sourceLabel = "",
    render = true,
  } = config;
  const day = targetState?.day || getCurrentDayNumber();
  const locationMap = getDayWorldLocationMap(day) || {};
  const worldState = syncWorldState(targetState);
  const normalizedTargetLocation = String(targetLocation || "").trim();
  const resolvedTargetLocation = locationMap[normalizedTargetLocation]
    ? normalizedTargetLocation
    : resolveWorldMoveFallbackLocation(fallbackLocationId, targetState);

  if (!resolvedTargetLocation || !locationMap[resolvedTargetLocation]) {
    clearPendingTravelState(targetState);
    clearAlleyNpcState(targetState);
    clearWanderResultState(targetState);
    if (render && targetState === state) {
      renderGame();
    }
    return false;
  }

  const pendingDistrict = worldState.pendingTravelTarget === resolvedTargetLocation
    ? worldState.pendingTravelDistrict
    : "";
  worldState.currentLocation = resolvedTargetLocation;
  worldState.currentDistrict = pendingDistrict
    || (typeof getWorldLocationDistrictId === "function"
      ? getWorldLocationDistrictId(resolvedTargetLocation, day)
      : worldState.currentDistrict);
  if (resolvedTargetLocation === "bus-stop-map") {
    setWorldTerminalTab("route", targetState);
  }
  if (worldState.currentDistrict && !worldState.unlockedDistricts.includes(worldState.currentDistrict)) {
    worldState.unlockedDistricts.push(worldState.currentDistrict);
  }
  if (!worldState.unlockedLocations.includes(resolvedTargetLocation)) {
    worldState.unlockedLocations.push(resolvedTargetLocation);
  }

  clearAlleyNpcState(targetState);
  clearWanderResultState(targetState);
  clearPendingTravelState(targetState);
  targetState.scene = "outside";
  targetState.headline = {
    badge: arrivalBadge,
    text: arrivalText,
  };

  if (memoryTitle && typeof recordActionMemory === "function") {
    recordActionMemory(memoryTitle, memoryText, {
      type: "travel",
      source: sourceLabel || locationMap[resolvedTargetLocation].label || resolvedTargetLocation,
      tags: Array.isArray(memoryTags) ? memoryTags : ["travel", resolvedTargetLocation],
    });
  }

  if (typeof tryStartSocialScamEvent === "function") {
    tryStartSocialScamEvent("world-arrival", {
      locationId: resolvedTargetLocation,
      locationLabel: locationMap[resolvedTargetLocation].label || resolvedTargetLocation,
    }, targetState);
  }

  if (render && targetState === state) {
    if (typeof hideCityMapOverlay === "function") {
      hideCityMapOverlay();
    }
    renderGame();
  }
  return resolvedTargetLocation === normalizedTargetLocation;
}

function performWorldDirectMove(targetLocation = "", config = {}, targetState = state) {
  const normalizedTargetLocation = String(targetLocation || "").trim();
  const currentLocationId = getCurrentLocationId(targetState);
  const currentLabel = getCurrentLocationLabel(targetState);
  const nextLocation = getWorldLocationConfig(normalizedTargetLocation, targetState);

  if (!normalizedTargetLocation || !nextLocation || currentLocationId === normalizedTargetLocation) {
    return false;
  }

  const travelMinutes = getDirectWorldMoveMinutes(normalizedTargetLocation, config, targetState);
  if (spendMinorTime(travelMinutes)) {
    advanceDayOrFinish();
    return true;
  }

  const targetLabel = nextLocation.label || normalizedTargetLocation;
  const durationLabel = formatTravelDurationLabel(travelMinutes);
  const memoryTitle = typeof config.memoryTitle === "string" && config.memoryTitle.trim()
    ? config.memoryTitle.trim()
    : `${targetLabel}\uB85C \uC774\uB3D9\uD588\uB2E4`;
  const memoryText = typeof config.memoryText === "string" && config.memoryText.trim()
    ? config.memoryText.trim()
    : `${currentLabel}\uC5D0\uC11C ${targetLabel}\uAE4C\uC9C0 ${durationLabel} \uC815\uB3C4 \uAC78\uC5B4 \uC790\uB9AC\uB97C \uC62E\uACBC\uB2E4.`;

  return finalizeWorldArrival(normalizedTargetLocation, {
    targetState,
    fallbackLocationId: currentLocationId,
    arrivalBadge: "\uC774\uB3D9 \uC644\uB8CC",
    arrivalText: `${targetLabel}\uC5D0 \uB3C4\uCC29\uD588\uB2E4.`,
    memoryTitle,
    memoryText,
    memoryTags: Array.isArray(config.memoryTags) && config.memoryTags.length
      ? config.memoryTags
      : ["travel", "direct", normalizedTargetLocation],
    sourceLabel: currentLabel,
  });
}

function completePendingWorldTravel(config = {}) {
  const {
    targetState = state,
    fallbackLocationId = "",
  } = config;
  const worldState = syncWorldState(targetState);
  const pendingTargetLocation = String(worldState.pendingTravelTarget || "").trim();
  const nextLocation = getWorldLocationConfig(pendingTargetLocation, targetState);
  const safeFallbackLocation = resolveWorldMoveFallbackLocation(
    fallbackLocationId || worldState.pendingTravelSourceLocationId,
    targetState
  );

  if (!pendingTargetLocation || !nextLocation) {
    const fallbackLabel = getWorldLocationConfig(safeFallbackLocation, targetState)?.label || "\uC548\uC804\uD55C \uC7A5\uC18C";
    return finalizeWorldArrival(safeFallbackLocation, {
      targetState,
      fallbackLocationId: safeFallbackLocation,
      arrivalBadge: "\uC774\uB3D9 \uC624\uB958",
      arrivalText: `\uC774\uB3D9 \uC911 \uBB38\uC81C\uAC00 \uC0DD\uACA8 ${fallbackLabel}\uC73C\uB85C \uB3CC\uC544\uC654\uB2E4.`,
      memoryTitle: "\uC774\uB3D9 \uACBD\uB85C\uB97C \uB2E4\uC2DC \uC815\uB9AC\uD588\uB2E4",
      memoryText: `\uC774\uB3D9 \uC911 \uCDA9\uB3CC\uC774 \uC0DD\uACA8 ${fallbackLabel}\uC5D0\uC11C \uB2E4\uC2DC \uC2DC\uC791\uD588\uB2E4.`,
      memoryTags: ["travel", "fallback", safeFallbackLocation],
      sourceLabel: worldState.pendingTravelSource || fallbackLabel,
    });
  }

  const locationMap = getDayWorldLocationMap(targetState.day) || {};
  const travelMethod = getPendingTravelMethodLabel(targetState);
  const walkLabel = typeof getTravelMethodLabelForMode === "function"
    ? getTravelMethodLabelForMode("walk", targetState)
    : "\uB3C4\uBCF4";
  const currentTravelSceneId = getCurrentLocationId(targetState);
  const usedBusTravel = currentTravelSceneId === "bus-ride"
    || currentTravelSceneId === "express-bus-travel"
    || travelMethod.includes("\uBC84\uC2A4");
  const arrivalBadge = usedBusTravel
    ? "\uBC84\uC2A4 \uB3C4\uCC29"
    : (travelMethod === walkLabel ? "\uB3C4\uBCF4 \uB3C4\uCC29" : "\uC774\uB3D9 \uC644\uB8CC");
  const arrivalText = usedBusTravel
    ? `${locationMap[pendingTargetLocation].label}\uC5D0 \uB0B4\uB824 \uC8FC\uBCC0\uC744 \uB458\uB7EC\uBCF8\uB2E4.`
    : (travelMethod === walkLabel
      ? `${locationMap[pendingTargetLocation].label}\uC5D0 \uAC78\uC5B4\uC11C \uB3C4\uCC29\uD588\uB2E4.`
      : `${locationMap[pendingTargetLocation].label}\uC5D0 ${travelMethod}\uB85C \uB3C4\uCC29\uD588\uB2E4.`);
  const memoryTitle = usedBusTravel
    ? "\uBC84\uC2A4\uC5D0\uC11C \uB0B4\uB838\uB2E4"
    : "\uC774\uB3D9\uC744 \uB9C8\uCE58\uACE0 \uB3C4\uCC29\uD588\uB2E4";

  return finalizeWorldArrival(pendingTargetLocation, {
    targetState,
    fallbackLocationId: safeFallbackLocation,
    arrivalBadge,
    arrivalText,
    memoryTitle,
    memoryText: arrivalText,
    memoryTags: ["travel", ...(usedBusTravel ? ["bus"] : ["walk"]), pendingTargetLocation],
    sourceLabel: travelMethod,
  });
}

function moveToWorldLocation(targetLocation = "", config = {}, targetState = state) {
  const normalizedTargetLocation = String(targetLocation || "").trim();
  if (normalizedTargetLocation === "research-lab-interior" && !canAccessResearchLabInterior(targetState)) {
    targetState.headline = {
      badge: "출입 제한",
      text: "연구원 신분이 아니면 연구동 안으로는 들어갈 수 없다.",
    };
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("jobs", {
        kicker: "ACCESS",
        title: "연구동 출입 제한",
        body: "배금연구소 연구동은 연구원만 출입할 수 있다.",
        tone: "fail",
      }, targetState);
    }
    if (targetState === state) {
      renderGame();
    }
    return false;
  }

  if (shouldResolveWorldMoveDirectly(targetLocation, config, targetState)) {
    return performWorldDirectMove(targetLocation, config, targetState);
  }

  return startWorldTravelToLocation(targetLocation, config, targetState);
}

function startWorldTravelToLocation(targetLocation = "", config = {}, targetState = state) {
  const normalizedTargetLocation = String(targetLocation || "").trim();
  const currentLocationId = getCurrentLocationId(targetState);
  const currentLocation = getCurrentOutsideSceneConfig(targetState);
  const locationMap = getDayWorldLocationMap(targetState.day);
  const currentLabel = currentLocation?.label || getCurrentLocationLabel(targetState);
  const targetLabel = locationMap?.[normalizedTargetLocation]?.label || normalizedTargetLocation;
  const canMove = config.skipExitCheck
    || !Array.isArray(currentLocation?.exits)
    || currentLocation.exits.includes(normalizedTargetLocation);

  if (!normalizedTargetLocation || !locationMap?.[normalizedTargetLocation] || !canMove || currentLocationId === normalizedTargetLocation) {
    return false;
  }

  const resolvedTravelMinutes = Math.round(
    Number(config.travelMinutes)
    || estimateWalkTravelMinutes(currentLocationId, normalizedTargetLocation, targetState)
    || TIME_SLOT_MINUTES
  );
  const allowMinorTravelMinutes = config.forceTravelMode === true || config.allowMinorTravelMinutes === true;
  const travelMinutes = allowMinorTravelMinutes
    ? Math.max(4, resolvedTravelMinutes)
    : Math.max(TIME_SLOT_MINUTES, resolvedTravelMinutes);
  const travelSlots = Number.isFinite(config.travelSlots)
    ? Math.max(TIME_COSTS.moveBetweenScenes, Math.round(config.travelSlots))
    : Math.max(TIME_COSTS.moveBetweenScenes, Math.ceil(travelMinutes / TIME_SLOT_MINUTES));
  const travelMethod = typeof config.travelMethod === "string" && config.travelMethod.trim()
    ? config.travelMethod.trim()
    : (typeof getTravelMethodLabelForMode === "function"
      ? getTravelMethodLabelForMode(config.travelSceneId === "bus-ride" ? "bus" : "walk", state)
      : (config.travelSceneId === "bus-ride" ? "버스" : "도보"));
  const memoryTags = Array.isArray(config.memoryTags) && config.memoryTags.length
    ? config.memoryTags
    : ["이동", travelMethod.includes("버스") ? "bus" : "walk", normalizedTargetLocation];

  const resolvedTravelMethod = getWorldMoveTravelMethod(config, targetState);
  const resolvedMemoryTags = Array.isArray(config.memoryTags) && config.memoryTags.length
    ? config.memoryTags
    : ["travel", resolvedTravelMethod.includes("\uBC84\uC2A4") ? "bus" : "walk", normalizedTargetLocation];
  const reachedDayEnd = spendMinorTime(travelMinutes);
  if (reachedDayEnd) {
    advanceDayOrFinish();
    return true;
  }

  syncWorldState(targetState);
  targetState.world.pendingTravelTarget = normalizedTargetLocation;
  targetState.world.pendingTravelDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(normalizedTargetLocation, targetState.day)
    : targetState.world.pendingTravelDistrict;
  targetState.world.pendingTravelSource = currentLabel;
  targetState.world.pendingTravelSourceLocationId = currentLocationId;
  targetState.world.pendingTravelMinutes = travelMinutes;
  targetState.world.pendingTravelMethod = resolvedTravelMethod;
  targetState.world.currentLocation = typeof config.travelSceneId === "string" && config.travelSceneId.trim()
    ? config.travelSceneId.trim()
    : (resolvedTravelMethod.includes("\uBC84\uC2A4") ? "bus-ride" : "walk-travel");

  recordActionMemory(
    config.memoryTitle || `${targetLabel}로 이동한다`,
    config.memoryText || `${currentLabel}에서 ${targetLabel}까지 ${travelMethod} ${formatTravelDurationLabel(travelMinutes)} 이동 코스를 잡았다.`,
    {
      type: "travel",
      source: currentLabel,
      tags: resolvedMemoryTags,
    }
  );

  clearAlleyNpcState(targetState);
  clearWanderResultState(targetState);
  targetState.headline = {
    badge: "",
    text: "",
  };

  if (typeof hideCityMapOverlay === "function" && targetState === state) {
    hideCityMapOverlay();
  }

  if (targetState === state) {
    renderGame();
  }
  return true;
}

function handleOutsideOption(action) {
  const option = typeof action === "string" ? { action } : action;
  if (!option) {
    return;
  }

  if (option.action === "mcd-apply-job") {
    if (typeof runMcDonaldsJobInquiryAction === "function") {
      const result = runMcDonaldsJobInquiryAction(option.jobId, state);
      if (result && !result.rendered) {
        renderGame();
      }
    }
    return;
  }

  if (option.action === "mcd-check-shift") {
    if (typeof runMcDonaldsShiftCheckAction === "function") {
      const result = runMcDonaldsShiftCheckAction(state);
      if (result && !result.rendered) {
        renderGame();
      }
    }
    return;
  }

  if (option.action === "move-home") {
    const homeLocationId = (typeof getResolvedHomeLocationId === "function"
      ? getResolvedHomeLocationId(state)
      : getDayHomeLocationId(state.day)) || "";
    const currentLocationId = getCurrentLocationId();

    if (!homeLocationId) {
      return;
    }

    if (currentLocationId === homeLocationId) {
      returnHomeFromOutside();
      return;
    }

    const cityMapSummary = typeof getCityMapTravelSummary === "function"
      ? getCityMapTravelSummary(homeLocationId, state)
      : null;
    moveToWorldLocation(homeLocationId, {
      skipExitCheck: Boolean(cityMapSummary) || option.skipExitCheck === true,
      forceTravelMode: Boolean(cityMapSummary),
      travelMinutes: cityMapSummary?.minutes,
      travelSlots: cityMapSummary?.slots,
      travelMethod: cityMapSummary?.methodLabel,
      travelSceneId: cityMapSummary?.sceneId,
      memoryText: cityMapSummary?.routeText
        ? `${cityMapSummary.currentLabel}에서 ${cityMapSummary.targetLabel}까지 ${cityMapSummary.methodLabel} ${cityMapSummary.durationLabel} 코스를 잡았다.`
        : undefined,
      memoryTags: cityMapSummary?.pathModes?.length
        ? ["이동", ...cityMapSummary.pathModes, homeLocationId]
        : ["이동", homeLocationId],
    });
    return;
  }

  if (option.action === "move" && option.targetLocation) {
    const currentLocationId = getCurrentLocationId();
    const shouldUseBusTravel = (currentLocationId === "bus-stop-map" || currentLocationId === "bus-stop")
      && option.travelVia === "bus";
    const cityMapSummary = shouldUseBusTravel || typeof getCityMapTravelSummary !== "function"
      ? null
      : getCityMapTravelSummary(option.targetLocation, state);
    const directTravelMinutes = Number.isFinite(option.travelMinutes)
      ? Math.max(1, Math.round(option.travelMinutes))
      : undefined;
    const directTravelSlots = Number.isFinite(option.travelSlots)
      ? Math.max(1, Math.round(option.travelSlots))
      : undefined;
    const directTravelMethod = typeof option.travelMethod === "string" && option.travelMethod.trim()
      ? option.travelMethod.trim()
      : undefined;
    const directTravelSceneId = typeof option.travelSceneId === "string" && option.travelSceneId.trim()
      ? option.travelSceneId.trim()
      : undefined;

    moveToWorldLocation(option.targetLocation, {
      skipExitCheck: Boolean(cityMapSummary) || shouldUseBusTravel || option.skipExitCheck === true,
      forceTravelMode: Boolean(cityMapSummary) || shouldUseBusTravel,
      forceDirectMove: option.forceDirectMove === true,
      travelMinutes: shouldUseBusTravel
        ? TIME_SLOT_MINUTES
        : (cityMapSummary?.minutes ?? directTravelMinutes),
      travelSlots: shouldUseBusTravel
        ? TIME_COSTS.moveBetweenScenes
        : (cityMapSummary?.slots ?? directTravelSlots),
      travelMethod: shouldUseBusTravel ? "버스" : (cityMapSummary?.methodLabel ?? directTravelMethod),
      travelSceneId: shouldUseBusTravel ? "bus-ride" : (cityMapSummary?.sceneId ?? directTravelSceneId),
      memoryTitle: shouldUseBusTravel ? "버스를 타고 이동한다" : undefined,
      memoryText: shouldUseBusTravel ? undefined : cityMapSummary?.routeText
        ? `${cityMapSummary.currentLabel}에서 ${cityMapSummary.targetLabel}까지 ${cityMapSummary.methodLabel} ${cityMapSummary.durationLabel} 코스를 잡았다.`
        : undefined,
      memoryTags: shouldUseBusTravel
        ? ["이동", "bus", option.targetLocation]
        : (cityMapSummary?.pathModes?.length
          ? ["이동", ...cityMapSummary.pathModes, option.targetLocation]
          : undefined),
    });
    return;
  }

  if (hasActionHandler(option.action)) {
    runAction(option.action);
  }
}

function getCasinoVenueScreenId(targetState = state) {
  const screenId = String(targetState?.casinoVenueScreen || "home").trim().toLowerCase();
  return ["exchange", "blackjack", "slots"].includes(screenId) ? screenId : "home";
}

function setCasinoVenueScreen(screenId = "home", targetState = state) {
  targetState.casinoVenueScreen = getCasinoVenueScreenId({ casinoVenueScreen: screenId });
  return targetState.casinoVenueScreen;
}

function leaveCasinoVenue(targetState = state) {
  setCasinoVenueScreen("home", targetState);
  targetState.scene = "outside";
  renderGame();
}

function handleCasinoVenueClick(event) {
  const routeTarget = event.target?.closest?.("[data-casino-route]");
  if (routeTarget) {
    event.preventDefault();
    event.stopPropagation();
    runGuardedUiAction(() => {
      if (spendPhoneInteractionTime()) {
        return;
      }
      setCasinoVenueScreen(routeTarget.dataset.casinoRoute, state);
      renderGame();
    }, {
      source: "scene-choice",
      actionId: `casino-route:${routeTarget.dataset.casinoRoute || ""}`,
    });
    return;
  }

  const exitTarget = event.target?.closest?.("[data-casino-scene-action='leave']");
  if (exitTarget) {
    event.preventDefault();
    event.stopPropagation();
    runGuardedUiAction(() => {
      if (spendPhoneInteractionTime()) {
        return;
      }
      leaveCasinoVenue(state);
    }, {
      source: "scene-choice",
      actionId: "casino:leave",
    });
    return;
  }

  const actionTarget = event.target?.closest?.("[data-casino-action]");
  if (!actionTarget) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  actionTarget.setAttribute("data-phone-action", actionTarget.dataset.casinoAction || "");
  handlePhoneScreenClick({ target: actionTarget });
  actionTarget.removeAttribute("data-phone-action");
}

function returnHomeFromOutside() {
  const previousLocationLabel = getCurrentLocationLabel();
  if (!beginHomeRouteTransition("inbound", {
    spendTime: true,
    targetState: state,
  })) {
    return;
  }

  recordActionMemory("집으로 돌아온다", `${previousLocationLabel}에서 발길을 돌려 다시 집 안으로 들어간다.`, {
    type: "travel",
    source: previousLocationLabel,
    tags: ["이동", "귀가"],
  });
  return;

  if (spendTimeSlots(TIME_COSTS.moveBetweenScenes)) {
    advanceDayOrFinish();
    return;
  }
  syncWorldState(state);
  state.world.currentLocation = (typeof getResolvedHomeLocationId === "function"
    ? getResolvedHomeLocationId(state)
    : getDayHomeLocationId(state.day)) || state.world.currentLocation;
  state.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(state.world.currentLocation, state.day)
    : state.world.currentDistrict;
  clearAlleyNpcState(state);
  clearWanderResultState(state);
  clearPendingTravelState(state);
  state.scene = "room";
  state.headline = {
    badge: "",
    text: "",
  };
  recordActionMemory("집으로 돌아왔다", `${previousLocationLabel}에서 발길을 돌려 다시 집 안으로 들어왔다.`, {
    type: "travel",
    source: previousLocationLabel,
    tags: ["이동", "귀가"],
  });
  renderGame();
}

function enterJobBoard() {
  const boardHeadline = getDayWorldData().boardHeadline || {};
  if (spendTimeSlots(TIME_COSTS.phoneApp)) {
    advanceDayOrFinish();
    return;
  }
  if (state.hasPhone && (typeof isPhoneAppInstalled !== "function" || isPhoneAppInstalled("jobs", state))) {
    state.phoneMinimized = false;
    state.phoneView = "jobs/home";
    state.headline = {
      badge: "스마트폰",
      text: boardHeadline.phone || "밖에서도 스마트폰으로 오늘 공고를 본다.",
    };
    recordActionMemory("오늘 공고를 확인했다", "밖에서도 스마트폰으로 오늘 공고들을 훑어봤다.", {
      type: "job",
      source: getCurrentLocationLabel(),
      tags: ["알바", "공고", "스마트폰"],
    });
    renderGame();
    return;
  }

  state.scene = "board";
  state.headline = {
    badge: state.hasPhone ? "스마트폰" : (typeof formatTurnLabel === "function" ? formatTurnLabel(state.day) : `${state.day}턴`),
    text: state.hasPhone
      ? (boardHeadline.phone || "밖에서도 스마트폰으로 오늘 공고를 본다.")
      : (boardHeadline.board || "골목 끝 게시판에서 오늘 공고를 확인한다."),
  };
  recordActionMemory("게시판을 살폈다", "골목 끝 게시판에 붙은 오늘 공고를 확인했다.", {
    type: "job",
    source: getCurrentLocationLabel(),
    tags: ["알바", "공고", "게시판"],
  });
  renderGame();
}

function recoverStamina() {
  state.stamina = Math.min(SLEEP_STAMINA_MAX, state.stamina + SLEEP_STAMINA_GAIN);
}

function recoverEnergy() {
  state.energy = Math.min(ENERGY_MAX, state.energy + SLEEP_ENERGY_GAIN);
}

function spendEnergy(amount) {
  state.energy = Math.max(0, state.energy - amount);
}

function completeDayAdvance({ recover = true } = {}) {
  if (typeof settleOwnedRealEstateTurnIncome === "function") {
    settleOwnedRealEstateTurnIncome(Math.max(1, Math.round(Number(state.day) || 1)), state);
  }

  if (state.day >= MAX_DAYS) {
    finishRun();
    return;
  }

  if (recover) {
    recoverStamina();
    recoverEnergy();
  }

  state.day += 1;
  if (typeof applyDailyHappinessDecay === "function") {
    applyDailyHappinessDecay(state);
  }
  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(state);
  }
  clearNightAutoSleepState(state);
  prepareDay();
}

function startNightAutoSleepScene({ recover = true } = {}) {
  const pendingState = queueNightAutoSleep(state, state.nightAutoSleep?.source || "night-auto-sleep");
  state.scene = "night-auto-sleep";
  state.phoneMinimized = true;
  state.phoneStageExpanded = false;
  state.phoneView = "home";
  state.nightAutoSleep = {
    ...(pendingState || {}),
    pending: true,
    recover,
  };
  renderGame();
}

function confirmNightAutoSleep() {
  if (!hasPendingNightAutoSleep(state)) {
    state.scene = "room";
    renderGame();
    return;
  }

  const recover = state.nightAutoSleep?.recover !== false;
  clearNightAutoSleepState(state);
  completeDayAdvance({ recover });
}

function advanceDayOrFinish({ recover = true } = {}) {
  if (hasPendingNightAutoSleep(state)) {
    startNightAutoSleepScene({ recover });
    return;
  }

  completeDayAdvance({ recover });
}

function finishRun() {
  if (typeof stopRankingRealtimeSubscription === "function") {
    stopRankingRealtimeSubscription();
  }
  if (typeof closeRankingScreen === "function") {
    closeRankingScreen();
  }
  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(state);
  }
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(state);
  }
  state.scene = "ranking";
  state.currentOffer = null;
  state.currentIncident = null;
  state.endingSummary = buildEndingSummary();
  state.headline = {
    badge: "최종 정산",
    text: `${MAX_DAYS}턴이 끝났다. 현금과 계좌를 합친 보유 자금으로 마지막 랭킹이 매겨진다.`,
  };

  const summary = state.endingSummary;
  if (summary && Array.isArray(summary.lines) && Number.isFinite(summary.happinessBonus)) {
    const hasHappinessBonusLine = summary.lines.some((line) => String(line || "").includes("행복 보너스"));
    if (!hasHappinessBonusLine) {
      const rankingLineIndex = summary.lines.findIndex((line) =>
        String(line || "").includes(String(summary.rankingMetricLabel || "").trim())
      );
      const insertIndex = rankingLineIndex >= 0 ? rankingLineIndex : Math.min(5, summary.lines.length);
      summary.lines.splice(insertIndex, 0, `행복 보너스 ${formatMoney(summary.happinessBonus)}`);
    }
  }
  state.headline = {
    badge: "최종 정산",
    text: `${MAX_DAYS}일이 끝났다. 최종 순자산과 행복 보너스를 합산해 마지막 순위를 정한다.`,
  };
  persistState("finish-run");
  const myEntry = {
    entryKey: `local:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    name: summary.playerName,
    money: summary.totalCash,
    rank: summary.rank.label,
    job: summary.jobTitle,
    spoon: summary.originLabel,
    spoonId: summary.originTierId,
    happiness: summary.happiness,
    metricLabel: summary.rankingMetricLabel,
  };

  if (typeof stopRankingRealtimeSubscription === "function") {
    stopRankingRealtimeSubscription();
  }

  const showRankingFallbackEnding = (reason = "랭킹 연결 실패") => {
    if (typeof closeRankingScreen === "function") {
      closeRankingScreen();
    }
    state.scene = "ending";
    if (typeof queueGameplayFeedback === "function") {
      queueGameplayFeedback({
        title: reason,
        body: "온라인 랭킹 연결에 실패해도 정산은 계속 볼 수 있다.",
        tone: "warn",
        duration: 2600,
      });
    }
    renderGame();
  };

  const renderRankingEntries = (entries = []) => {
    if (typeof showRankingScreen !== "function") {
      showRankingFallbackEnding("랭킹 화면 로드 실패");
      return;
    }

    try {
      showRankingScreen(myEntry, entries);
    } catch (error) {
      showRankingFallbackEnding("랭킹 화면 오류");
    }
  };

  const beginRankingRealtime = () => {
    if (typeof subscribeTopRankings !== "function") {
      return;
    }

    subscribeTopRankings((entries) => {
      renderRankingEntries(entries);
    });
  };

  if (typeof submitRanking === "function" && typeof fetchTopRankings === "function") {
    submitRanking(myEntry).then((submittedId) => {
      if (submittedId) {
        myEntry.id = submittedId;
      }
      return fetchTopRankings();
    }).then((entries) => {
      renderRankingEntries(entries);
      beginRankingRealtime();
    }).catch(() => {
      renderRankingEntries([myEntry]);
      beginRankingRealtime();
    });
  } else if (typeof showRankingScreen === "function") {
    renderRankingEntries([myEntry]);
  }
}

function getStartingOriginInfo(targetState = state) {
  const originState = typeof ensureSpoonStartState === "function"
    ? ensureSpoonStartState(targetState)
    : (targetState?.startingOrigin || null);
  const label = String(originState?.label || "").trim() || "수저 미정";
  const tierId = String(originState?.tierId || "").trim().toLowerCase();
  return {
    label,
    tierId,
  };
}

function getStartingOriginLabel(targetState = state) {
  return getStartingOriginInfo(targetState).label;
}

function getStartingOriginTierId(targetState = state) {
  return getStartingOriginInfo(targetState).tierId;
}

function buildEndingSummaryLegacy() {
  return buildEndingSummary();
}

function buildEndingSummary() {
  const totalLiquidFunds = typeof getTotalLiquidFunds === "function"
    ? getTotalLiquidFunds(state)
    : Math.max(0, Number(state.money) || 0) + Math.max(0, Number(state.bank?.balance) || 0);
  const assetValue = typeof getOwnershipTotalAssetValue === "function"
    ? getOwnershipTotalAssetValue(state)
    : 0;
  const debtOutstanding = typeof getBankLoanSummary === "function"
    ? Math.max(0, Number(getBankLoanSummary(state)?.totalOutstanding) || 0)
    : 0;
  const netWorth = totalLiquidFunds + assetValue - debtOutstanding;
  const cashOnHand = typeof getWalletBalance === "function"
    ? getWalletBalance(state)
    : Math.max(0, Number(state.money) || 0);
  const bankBalance = typeof getBankBalance === "function"
    ? getBankBalance(state)
    : Math.max(0, Number(state.bank?.balance) || 0);
  const employedPostingId = getCareerEmploymentPostingId(state);
  const employedPosting = employedPostingId && typeof getCareerPostingById === "function"
    ? getCareerPostingById(employedPostingId)
    : null;
  const lastJob = JOB_LOOKUP[state.lastWorkedJobId];
  const jobTitle = employedPosting?.title || lastJob?.title || "무직";
  const originLabel = getStartingOriginLabel(state);
  const originTierId = getStartingOriginTierId(state);
  const happinessState = typeof syncHappinessState === "function"
    ? syncHappinessState(state)
    : createDefaultHappinessState();
  const happinessBonus = Math.max(0, Number(happinessState.value) || 0) * 10000;
  const ownedRealEstate = typeof getOwnedRealEstateInvestmentSummary === "function"
    ? getOwnedRealEstateInvestmentSummary(state)
    : null;
  const rankingValue = netWorth + happinessBonus;
  const rank = getRankByMoney(rankingValue);
  const rankingMetricLabel = "최종 순자산 + 행복 보너스";
  const happinessLabel = typeof getHappinessStatusLabel === "function"
    ? getHappinessStatusLabel(happinessState.status)
    : happinessState.status;
  let happinessComment = "돈은 모였지만 마음까지 채우지는 못했다.";

  if (happinessState.status === "steady") {
    happinessComment = "아슬아슬했지만 마지막까지 버텨낼 정도의 균형은 남겼다.";
  } else if (happinessState.status === "depressed") {
    happinessComment = "버티기는 했지만 마음이 많이 지친 채로 결산을 마쳤다.";
  }

  return {
    totalCash: rankingValue,
    cashOnHand,
    bankBalance,
    assetValue,
    realEstateValue: ownedRealEstate?.estimatedValue || 0,
    realEstateProfit: ownedRealEstate?.cumulativeProfit || 0,
    realEstateLabel: ownedRealEstate?.label || "",
    debtOutstanding,
    netWorth,
    happinessBonus,
    rank,
    rankingMetricLabel,
    jobTitle,
    playerName: state.playerName,
    originLabel,
    originTierId,
    happiness: happinessState.value,
    happinessStatus: happinessState.status,
    title: `${rankingMetricLabel} ${formatMoney(rankingValue)}`,
    lines: [
      `${MAX_DAYS}턴 동안 모은 돈을 간단히 정산했다.`,
      `현금 ${formatMoney(cashOnHand)}`,
      `계좌 잔고 ${formatMoney(bankBalance)}`,
      `보유 자산 가치 ${formatMoney(assetValue)}`,
      ...(ownedRealEstate
        ? [
            `${ownedRealEstate.label} 자산 가치 ${formatMoney(ownedRealEstate.estimatedValue)}`,
            `${ownedRealEstate.label} 누적 수익 ${formatMoney(ownedRealEstate.cumulativeProfit)}`,
          ]
        : []),
      `대출 잔액 ${formatMoney(debtOutstanding)}`,
      `${rankingMetricLabel} ${formatMoney(rankingValue)}`,
      `현재 직업 ${jobTitle}`,
      `출신 수저 ${originLabel}`,
      `최종 행복도 ${happinessState.value} (${happinessLabel})`,
      `최종 랭크 ${rank.label} / ${rank.title}`,
      `랭킹 기준은 ${rankingMetricLabel}이다.`,
      rank.comment,
      happinessComment,
    ],
  };
}

function buildEndingSummaryDeprecated() {
  const totalLiquidFunds = typeof getTotalLiquidFunds === "function"
    ? getTotalLiquidFunds(state)
    : Math.max(0, Number(state.money) || 0) + Math.max(0, Number(state.bank?.balance) || 0);
  const assetValue = typeof getOwnershipTotalAssetValue === "function"
    ? getOwnershipTotalAssetValue(state)
    : 0;
  const debtOutstanding = typeof getBankLoanSummary === "function"
    ? Math.max(0, Number(getBankLoanSummary(state)?.totalOutstanding) || 0)
    : 0;
  const netWorth = totalLiquidFunds + assetValue - debtOutstanding;
  const cashOnHand = typeof getWalletBalance === "function"
    ? getWalletBalance(state)
    : Math.max(0, Number(state.money) || 0);
  const bankBalance = typeof getBankBalance === "function"
    ? getBankBalance(state)
    : Math.max(0, Number(state.bank?.balance) || 0);
  const rank = getRankByMoney(totalLiquidFunds);
  const rankingMetricLabel = "최종 보유 자금";
  const employedPostingId = getCareerEmploymentPostingId(state);
  const employedPosting = employedPostingId && typeof getCareerPostingById === "function"
    ? getCareerPostingById(employedPostingId)
    : null;
  const lastJob = JOB_LOOKUP[state.lastWorkedJobId];
  const jobTitle = employedPosting?.title || lastJob?.title || "무직";
  const originLabel = getStartingOriginLabel(state);
  const originTierId = getStartingOriginTierId(state);
  const happinessState = typeof syncHappinessState === "function"
    ? syncHappinessState(state)
    : createDefaultHappinessState();
  const happinessLabel = typeof getHappinessStatusLabel === "function"
    ? getHappinessStatusLabel(happinessState.status)
    : happinessState.status;
  let happinessComment = "현금은 쥐었지만 마음의 여유까지 챙기진 못했다.";

  if (happinessState.status === "steady") {
    happinessComment = "돈뿐 아니라 삶의 결도 어느 정도 붙잡은 채 이번 주를 넘겼다.";
  } else if (happinessState.status === "depressed") {
    happinessComment = "버티기는 했지만 마음이 많이 깎인 채로 결산표 앞에 섰다.";
  }

  return {
    totalCash: totalLiquidFunds,
    cashOnHand,
    bankBalance,
    assetValue,
    debtOutstanding,
    netWorth,
    rank,
    rankingMetricLabel,
    jobTitle,
    playerName: state.playerName,
    originLabel,
    originTierId,
    happiness: happinessState.value,
    happinessStatus: happinessState.status,
    title: `${rankingMetricLabel} ${formatMoney(totalLiquidFunds)}`,
    lines: [
      `${MAX_DAYS}턴 동안 쥔 현금과 계좌 잔고를 모두 정산했다.`,
      `손 현금 ${formatMoney(cashOnHand)}`,
      `계좌 잔고 ${formatMoney(bankBalance)}`,
      `최종 보유 자금 ${formatMoney(totalLiquidFunds)}`,
      `보유 자산 가치 ${formatMoney(assetValue)}`,
      `남은 대출 ${formatMoney(debtOutstanding)}`,
      `순자산 ${formatMoney(netWorth)}`,
      `출신 수저 ${originLabel}`,
      `최종 행복도 ${happinessState.value} (${happinessLabel})`,
      `최종 정산 ${rank.label} / ${rank.title}`,
      rank.comment,
      happinessComment,
    ],
    lines: [
      `${MAX_DAYS}턴 동안 모은 돈을 간단히 정산했다.`,
      `현금 ${formatMoney(cashOnHand)}`,
      `계좌 잔고 ${formatMoney(bankBalance)}`,
      `${rankingMetricLabel} ${formatMoney(totalLiquidFunds)}`,
      `현재 직업 ${jobTitle}`,
      `출신 수저 ${originLabel}`,
      `최종 행복도 ${happinessState.value} (${happinessLabel})`,
      `최종 랭크 ${rank.label} / ${rank.title}`,
      `랭킹 기준은 ${rankingMetricLabel}이다.`,
      rank.comment,
      happinessComment,
    ],
  };
}

function getRankByMoney(money) {
  return RANK_TABLE.find((entry) => money >= entry.min) || RANK_TABLE[RANK_TABLE.length - 1];
}

function restartToTitle() {
  clearGameplayFeedback();
  cancelPendingPersistState();
  clearSavedState();
  pendingSavedState = null;
  if (typeof stopRankingRealtimeSubscription === "function") {
    stopRankingRealtimeSubscription();
  }
  if (typeof closeRankingScreen === "function") {
    closeRankingScreen();
  }
  resetStartScreenDrawState();
  hideSpoonDrawOverlay();
  ui.nameInput.value = "";
  state = createInitialState();
  showStartScreen(false);
}

function calculatePay(basePay, choice) {
  const multiplier = choice.payMultiplier ?? 1;
  const bonus = choice.bonus ?? 0;
  const rawPay = (basePay * multiplier) + bonus;
  return Math.max(0, roundToHundred(rawPay));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToHundred(value) {
  return Math.round(value / 100) * 100;
}

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  const copy = [...list];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

// 자동 저장 비활성화 (첫 게임 — 이어하기 없음)
