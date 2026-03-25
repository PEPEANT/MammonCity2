const SPOON_START_TIER_ALIASES = Object.freeze({
  bronze: "silver",
  steel: "dirt",
});

const SPOON_START_TIERS = Object.freeze([
  Object.freeze({
    id: "gold",
    name: "금수저",
    emblem: "금",
    probability: 5,
    bracket: "상위 5%",
    summary: "현금과 계좌, 차와 옷까지 처음부터 여유가 있는 출발",
    toneLabel: "금빛",
    initialCash: 300000,
    walletCash: 300000,
    bankBalance: 12000000,
    starterStockAmount: 0,
    starterCoinAmount: 100000000,
    starterCoinType: "BTC",
    starterAssetIds: Object.freeze(["phone-used-premium", "outfit-suit"]),
    starterVehicleId: "used-car",
    safetyNetLevel: "large",
    startHappiness: 62,
    accent: "#f4c24d",
    accentSoft: "rgba(244, 194, 77, 0.18)",
    glow: "rgba(244, 194, 77, 0.42)",
    screenOverlay: "linear-gradient(180deg, rgba(120, 82, 11, 0.16) 0%, rgba(12, 10, 7, 0.58) 100%)",
    sceneOverlay: "radial-gradient(circle at 50% 18%, rgba(255, 228, 154, 0.28) 0%, rgba(255, 228, 154, 0) 52%), linear-gradient(180deg, rgba(255, 229, 164, 0.2) 0%, rgba(143, 93, 8, 0.3) 100%)",
  }),
  Object.freeze({
    id: "silver",
    name: "은수저",
    emblem: "은",
    probability: 25,
    bracket: "상위 30%",
    summary: "차분하게 시작할 수 있는 중산층 출발선",
    toneLabel: "은빛",
    initialCash: 150000,
    walletCash: 150000,
    bankBalance: 4000000,
    starterStockAmount: 5000000,
    starterCoinAmount: 0,
    starterCoinType: "",
    starterAssetIds: Object.freeze(["phone-used-premium", "outfit-suit"]),
    starterVehicleId: "used-motorbike",
    safetyNetLevel: "medium",
    startHappiness: 55,
    accent: "#cbd5e1",
    accentSoft: "rgba(203, 213, 225, 0.16)",
    glow: "rgba(203, 213, 225, 0.34)",
    screenOverlay: "linear-gradient(180deg, rgba(80, 96, 120, 0.18) 0%, rgba(10, 12, 18, 0.58) 100%)",
    sceneOverlay: "radial-gradient(circle at 50% 18%, rgba(232, 239, 247, 0.22) 0%, rgba(232, 239, 247, 0) 50%), linear-gradient(180deg, rgba(221, 230, 242, 0.16) 0%, rgba(73, 86, 112, 0.28) 100%)",
  }),
  Object.freeze({
    id: "dirt",
    name: "흙수저",
    emblem: "흙",
    probability: 70,
    bracket: "기본 70%",
    summary: "지갑이 얇고 바로 버텨야 하는 현실적인 시작",
    toneLabel: "흙빛",
    initialCash: 20000,
    walletCash: 20000,
    bankBalance: 200000,
    starterStockAmount: 0,
    starterCoinAmount: 0,
    starterCoinType: "",
    starterAssetIds: Object.freeze([]),
    starterVehicleId: "",
    safetyNetLevel: "none",
    startHappiness: 38,
    accent: "#8d5b37",
    accentSoft: "rgba(141, 91, 55, 0.16)",
    glow: "rgba(141, 91, 55, 0.22)",
    screenOverlay: "linear-gradient(180deg, rgba(74, 43, 22, 0.22) 0%, rgba(6, 6, 8, 0.68) 100%)",
    sceneOverlay: "radial-gradient(circle at 50% 18%, rgba(145, 90, 48, 0.18) 0%, rgba(145, 90, 48, 0) 48%), linear-gradient(180deg, rgba(117, 72, 42, 0.18) 0%, rgba(40, 22, 12, 0.32) 100%)",
  }),
]);

const SPOON_START_TIER_LOOKUP = Object.freeze(
  Object.fromEntries(SPOON_START_TIERS.map((tier) => [tier.id, tier]))
);

const DEFAULT_SPOON_START_THEME = Object.freeze({
  accent: "#94a3b8",
  accentSoft: "rgba(148, 163, 184, 0.14)",
  glow: "rgba(148, 163, 184, 0.22)",
  screenOverlay: "linear-gradient(180deg, rgba(22, 25, 35, 0.22) 0%, rgba(8, 10, 18, 0.62) 100%)",
  sceneOverlay: "",
});

function createSpoonStartBackgroundConfig(
  image,
  {
    overlay = "linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.18) 100%)",
    position = "center",
    size = "cover",
    repeat = "no-repeat",
    color = "#050505",
    className = "custom-location-bg",
  } = {},
) {
  return Object.freeze({
    image,
    overlay,
    position,
    size,
    repeat,
    color,
    className,
  });
}

const SPOON_START_VISUAL_TIER_LOOKUP = Object.freeze({
  gold: "golden_spoon",
  silver: "silver_spoon",
  dirt: "dirt_spoon",
  bronze: "silver_spoon",
  steel: "dirt_spoon",
});

const SPOON_START_HOME_CONFIGS = Object.freeze({
  dirt_spoon: Object.freeze({
    id: "dirt_spoon",
    homeLocationId: "apt-alley",
    residenceId: "origin-dirt-home",
    residenceLabel: "배금고시원",
    spawnBackground: createSpoonStartBackgroundConfig("assets/days/dirt_spoon/dirt_spoon_spawn.png"),
    roomBackground: createSpoonStartBackgroundConfig("assets/days/dirt_spoon/dirt_spoon_spawn.png"),
    outsideBackground: createSpoonStartBackgroundConfig("assets/days/dirt_spoon/my_house.png"),
    lobbyBackground: null,
    transitBackground: null,
    spawnPlayerLayout: Object.freeze({
      startLeft: 50,
      bottom: 3,
      height: 88,
      zIndex: 2,
    }),
    roomActorLayout: Object.freeze({
      left: 50,
      bottom: 2,
      height: 92,
      zIndex: 2,
    }),
  }),
  silver_spoon: Object.freeze({
    id: "silver_spoon",
    homeLocationId: "silver-home-front",
    residenceId: "origin-silver-home",
    residenceLabel: "배금아파트",
    spawnBackground: createSpoonStartBackgroundConfig("assets/days/silver_spoon/silverspoon_spawn.jpg"),
    roomBackground: createSpoonStartBackgroundConfig("assets/days/silver_spoon/living_room.png"),
    outsideBackground: createSpoonStartBackgroundConfig("assets/days/silver_spoon/lobby.jpg"),
    lobbyBackground: createSpoonStartBackgroundConfig("assets/days/silver_spoon/lobby.jpg"),
    transitBackground: null,
    spawnPlayerLayout: Object.freeze({
      startLeft: 50,
      bottom: 3,
      height: 88,
      zIndex: 2,
    }),
    roomActorLayout: Object.freeze({
      left: 50,
      bottom: 2,
      height: 92,
      zIndex: 2,
    }),
  }),
  golden_spoon: Object.freeze({
    id: "golden_spoon",
    homeLocationId: "golden-home-front",
    residenceId: "origin-gold-home",
    residenceLabel: "배금복합빌딩",
    spawnBackground: createSpoonStartBackgroundConfig("assets/days/golden_spoon/goldenspoon_spawn.jpg"),
    roomBackground: createSpoonStartBackgroundConfig("assets/days/golden_spoon/goldenspoon_spawn.jpg"),
    outsideBackground: createSpoonStartBackgroundConfig("assets/days/golden_spoon/my_house.jpg"),
    lobbyBackground: createSpoonStartBackgroundConfig("assets/days/golden_spoon/lobby.jpg"),
    transitBackground: createSpoonStartBackgroundConfig("assets/days/golden_spoon/goldenspoon_Underground_Parking Lot.png"),
  }),
});

const SPOON_START_SAFETY_NET_LABELS = Object.freeze({
  large: "가족 지원 든든",
  medium: "가족 지원 있음",
  small: "작은 지원 가능",
  thin: "지원 거의 없음",
  none: "지원 없음",
});

function normalizeSpoonStartTierId(tierId = "") {
  const normalized = String(tierId || "").trim().toLowerCase();
  return SPOON_START_TIER_ALIASES[normalized] || normalized;
}

function getSpoonStartTier(tierId = "") {
  const normalized = normalizeSpoonStartTierId(tierId);
  return SPOON_START_TIER_LOOKUP[normalized] || null;
}

function getDefaultSpoonStartTier() {
  return getSpoonStartTier("dirt") || SPOON_START_TIERS[SPOON_START_TIERS.length - 1];
}

function getSpoonStartVisualTierId(tierId = "") {
  const normalized = normalizeSpoonStartTierId(tierId);
  return SPOON_START_VISUAL_TIER_LOOKUP[normalized] || "";
}

function getSpoonStartHomeConfigByVisualTierId(visualTierId = "") {
  const normalized = String(visualTierId || "").trim().toLowerCase();
  return SPOON_START_HOME_CONFIGS[normalized] || null;
}

function getSpoonStartHomeConfigByResidenceId(residenceId = "") {
  const normalized = String(residenceId || "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return Object.values(SPOON_START_HOME_CONFIGS).find(
    (config) => String(config?.residenceId || "").trim().toLowerCase() === normalized
  ) || null;
}

function getSpoonStartHomeConfigByHomeLocationId(locationId = "") {
  const normalized = String(locationId || "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return Object.values(SPOON_START_HOME_CONFIGS).find(
    (config) => String(config?.homeLocationId || "").trim().toLowerCase() === normalized
  ) || null;
}

function cloneSpoonStartBackgroundConfig(background = null) {
  return background ? { ...background } : null;
}

function cloneSpoonStartActorLayout(layout = null) {
  return layout ? { ...layout } : null;
}

function createDefaultSpoonStartState() {
  return {
    tierId: "",
    visualTierId: "",
    label: "",
    bracket: "",
    summary: "",
    toneLabel: "",
    initialCash: 0,
    walletCash: 0,
    bankBalance: 0,
    starterStockAmount: 0,
    starterCoinAmount: 0,
    starterCoinType: "",
    starterAssetIds: [],
    starterVehicleId: "",
    safetyNetLevel: "none",
    startHappiness: 45,
    accent: DEFAULT_SPOON_START_THEME.accent,
    homeLocationId: "",
    applied: false,
  };
}

function createAppliedSpoonStartState(tierId = "") {
  const tier = getSpoonStartTier(tierId) || getDefaultSpoonStartTier();
  const visualTierId = getSpoonStartVisualTierId(tier.id);
  const homeConfig = getSpoonStartHomeConfigByVisualTierId(visualTierId);
  return {
    tierId: tier.id,
    visualTierId,
    label: tier.name,
    bracket: tier.bracket,
    summary: tier.summary,
    toneLabel: tier.toneLabel,
    initialCash: tier.initialCash,
    walletCash: tier.walletCash,
    bankBalance: tier.bankBalance,
    starterStockAmount: Math.max(0, Math.round(Number(tier.starterStockAmount) || 0)),
    starterCoinAmount: Math.max(0, Math.round(Number(tier.starterCoinAmount) || 0)),
    starterCoinType: String(tier.starterCoinType || "").trim().toUpperCase(),
    starterAssetIds: [...(tier.starterAssetIds || [])],
    starterVehicleId: tier.starterVehicleId || "",
    safetyNetLevel: tier.safetyNetLevel || "none",
    startHappiness: tier.startHappiness,
    accent: tier.accent,
    homeLocationId: homeConfig?.homeLocationId || "",
    applied: true,
  };
}

function ensureSpoonStartState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return createDefaultSpoonStartState();
  }

  const currentState = targetState.startingOrigin && typeof targetState.startingOrigin === "object"
    ? targetState.startingOrigin
    : createDefaultSpoonStartState();
  const normalizedTierId = normalizeSpoonStartTierId(currentState.tierId);
  const derivedState = normalizedTierId
    ? createAppliedSpoonStartState(normalizedTierId)
    : createDefaultSpoonStartState();
  const visualTierId = String(
    currentState.visualTierId
    || derivedState.visualTierId
    || getSpoonStartVisualTierId(normalizedTierId)
    || ""
  ).trim().toLowerCase();
  const homeConfig = getSpoonStartHomeConfigByVisualTierId(visualTierId);

  targetState.startingOrigin = {
    ...createDefaultSpoonStartState(),
    ...derivedState,
    ...currentState,
    tierId: normalizedTierId,
    label: derivedState.label || currentState.label || "",
    bracket: derivedState.bracket || currentState.bracket || "",
    summary: derivedState.summary || currentState.summary || "",
    toneLabel: derivedState.toneLabel || currentState.toneLabel || "",
    accent: derivedState.accent || currentState.accent || DEFAULT_SPOON_START_THEME.accent,
    safetyNetLevel: derivedState.safetyNetLevel || currentState.safetyNetLevel || "none",
    visualTierId,
    applied: Boolean(currentState.applied || normalizedTierId),
    starterAssetIds: Array.isArray(currentState.starterAssetIds)
      ? [...currentState.starterAssetIds]
      : [...(derivedState.starterAssetIds || [])],
    homeLocationId: String(currentState.homeLocationId || homeConfig?.homeLocationId || derivedState.homeLocationId || "").trim(),
  };

  return targetState.startingOrigin;
}

function getSpoonStartHomeConfig(targetState = state) {
  const originState = ensureSpoonStartState(targetState);
  const visualTierId = String(originState?.visualTierId || "").trim().toLowerCase();
  const currentResidenceId = String(targetState?.ownership?.residence || "").trim().toLowerCase();
  const currentHomeLocationId = String(
    originState?.homeLocationId
    || targetState?.world?.currentLocation
    || ""
  ).trim().toLowerCase();
  const config = getSpoonStartHomeConfigByVisualTierId(visualTierId)
    || getSpoonStartHomeConfigByResidenceId(currentResidenceId)
    || getSpoonStartHomeConfigByHomeLocationId(currentHomeLocationId);

  if (!config) {
    return null;
  }

  return {
    ...config,
    spawnBackground: cloneSpoonStartBackgroundConfig(config.spawnBackground),
    roomBackground: cloneSpoonStartBackgroundConfig(config.roomBackground),
    outsideBackground: cloneSpoonStartBackgroundConfig(config.outsideBackground),
    lobbyBackground: cloneSpoonStartBackgroundConfig(config.lobbyBackground),
    transitBackground: cloneSpoonStartBackgroundConfig(config.transitBackground),
    spawnPlayerLayout: cloneSpoonStartActorLayout(config.spawnPlayerLayout),
    roomActorLayout: cloneSpoonStartActorLayout(config.roomActorLayout),
  };
}

function getSpoonStartSpawnPlayerLayout(targetState = state) {
  return cloneSpoonStartActorLayout(getSpoonStartHomeConfig(targetState)?.spawnPlayerLayout);
}

function getSpoonStartRoomActorLayout(targetState = state) {
  return cloneSpoonStartActorLayout(getSpoonStartHomeConfig(targetState)?.roomActorLayout);
}

function getSpoonStartHomeLocationId(targetState = state) {
  return getSpoonStartHomeConfig(targetState)?.homeLocationId || "";
}

function getSpoonStartOriginIntroSteps(targetState = state) {
  const originState = ensureSpoonStartState(targetState);
  const visualTierId = String(originState?.visualTierId || "").trim().toLowerCase();
  const homeConfig = getSpoonStartHomeConfig(targetState);
  const introBackground = cloneSpoonStartBackgroundConfig(
    homeConfig?.lobbyBackground
    || homeConfig?.outsideBackground
    || homeConfig?.spawnBackground
  );

  if (visualTierId === "silver_spoon") {
    return [
      {
        speaker: "나레이션",
        title: "여기는 한강뷰 아파트다.",
        lines: [
          "나는 이곳에서 부족함 없이 태어났다.",
          "문을 나서면 바로 아파트 로비 앞이다.",
        ],
        character: "",
        background: introBackground,
        options: [
          {
            title: "계속",
            action: "beginStandardIntro",
          },
        ],
      },
    ];
  }

  return [];
}

function getAllSpoonStartHomeLocationIds() {
  return [...new Set(
    Object.values(SPOON_START_HOME_CONFIGS)
      .map((config) => String(config?.homeLocationId || "").trim())
      .filter(Boolean)
  )];
}

function getSpoonStartResidenceId(targetState = state) {
  return String(getSpoonStartHomeConfig(targetState)?.residenceId || "").trim().toLowerCase();
}

function isSpoonStartResidenceId(residenceId = "") {
  const normalized = String(residenceId || "").trim().toLowerCase();
  return Object.values(SPOON_START_HOME_CONFIGS).some((config) => config.residenceId === normalized);
}

function shouldUseSpoonStartResidence(targetState = state) {
  const ownershipState = typeof syncOwnershipState === "function"
    ? syncOwnershipState(targetState)
    : (targetState?.ownership || null);
  const currentResidenceId = String(ownershipState?.residence || "").trim().toLowerCase();

  if (ownershipState?.home) {
    return false;
  }

  return !currentResidenceId || currentResidenceId === "parents-room" || isSpoonStartResidenceId(currentResidenceId);
}

function syncSpoonStartResidence(targetState = state) {
  if (!targetState || typeof targetState !== "object" || typeof syncOwnershipState !== "function") {
    return "";
  }

  const ownershipState = syncOwnershipState(targetState);
  const preferredResidenceId = getSpoonStartResidenceId(targetState);
  const currentResidenceId = String(ownershipState?.residence || "").trim().toLowerCase();

  if (!preferredResidenceId || ownershipState.home) {
    return currentResidenceId;
  }

  if (!currentResidenceId || currentResidenceId === "parents-room" || isSpoonStartResidenceId(currentResidenceId)) {
    ownershipState.residence = preferredResidenceId;
  }

  return String(ownershipState.residence || "").trim().toLowerCase();
}

function getSpoonStartHomeRouteStageIds(targetState = state, direction = "outbound") {
  const homeConfig = getSpoonStartHomeConfig(targetState);
  const stageIds = [];

  if (homeConfig?.lobbyBackground) {
    stageIds.push("lobby");
  }
  if (homeConfig?.transitBackground) {
    stageIds.push("transit");
  }

  return direction === "inbound"
    ? [...stageIds].reverse()
    : stageIds;
}

function getSpoonStartVisualTheme(tierId = "") {
  const tier = getSpoonStartTier(tierId);
  return tier
    ? {
        accent: tier.accent,
        accentSoft: tier.accentSoft,
        glow: tier.glow,
        screenOverlay: tier.screenOverlay,
        sceneOverlay: tier.sceneOverlay,
      }
    : { ...DEFAULT_SPOON_START_THEME };
}

function getSpoonStartProbabilityLabels() {
  return SPOON_START_TIERS.map((tier) => `${tier.name.replace("수저", "")} ${tier.probability}%`);
}

function drawSpoonStartTierId() {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const tier of SPOON_START_TIERS) {
    cumulative += tier.probability;
    if (roll < cumulative) {
      return tier.id;
    }
  }

  return getDefaultSpoonStartTier().id;
}

function formatSpoonStartAmount(amount = 0) {
  const safeAmount = Math.max(0, Math.round(Number(amount) || 0));
  return `${safeAmount.toLocaleString("ko-KR")}원`;
}

function getSpoonStartSafetyNetLabel(level = "") {
  const normalized = String(level || "").trim().toLowerCase();
  return SPOON_START_SAFETY_NET_LABELS[normalized] || SPOON_START_SAFETY_NET_LABELS.none;
}

function getSpoonStartStarterAssetLabels(tierId = "") {
  const tier = typeof tierId === "object" && tierId
    ? tierId
    : getSpoonStartTier(tierId);
  if (!tier) {
    return [];
  }

  const labels = [];
  const vehicleId = String(tier.starterVehicleId || "").trim();
  if (vehicleId && typeof getOwnedVehicleDefinition === "function") {
    const vehicle = getOwnedVehicleDefinition(vehicleId);
    if (vehicle?.label) {
      labels.push(vehicle.label);
    }
  }

  (tier.starterAssetIds || []).forEach((itemId) => {
    if (typeof getInventoryItemDefinition !== "function") {
      return;
    }

    const definition = getInventoryItemDefinition(itemId);
    if (definition?.label) {
      labels.push(definition.label);
    }
  });

  const starterStockAmount = Math.max(0, Math.round(Number(tier.starterStockAmount) || 0));
  if (starterStockAmount > 0) {
    labels.push(`주식 ${formatSpoonStartAmount(starterStockAmount)}`);
  }

  const starterCoinAmount = Math.max(0, Math.round(Number(tier.starterCoinAmount) || 0));
  if (starterCoinAmount > 0) {
    const starterCoinType = String(tier.starterCoinType || "").trim().toUpperCase();
    const coinLabel = typeof getCoinTypeInfo === "function"
      ? (getCoinTypeInfo(starterCoinType)?.label || starterCoinType || "코인")
      : (starterCoinType || "코인");
    labels.push(`${coinLabel} ${formatSpoonStartAmount(starterCoinAmount)}`);
  }

  return labels;
}

function getSpoonStartPackageChipLabels(tierId = "") {
  const tier = typeof tierId === "object" && tierId
    ? tierId
    : getSpoonStartTier(tierId);
  if (!tier) {
    return [];
  }

  const chips = [
    `손현금 ${formatSpoonStartAmount(tier.walletCash)}`,
    `계좌 ${formatSpoonStartAmount(tier.bankBalance)}`,
  ];
  const assetLabels = getSpoonStartStarterAssetLabels(tier);

  if (assetLabels.length === 1) {
    chips.push(`시작 자산 ${assetLabels[0]}`);
  } else if (assetLabels.length > 1) {
    chips.push(`시작 자산 ${assetLabels[0]} 외 ${assetLabels.length - 1}`);
  } else {
    chips.push(getSpoonStartSafetyNetLabel(tier.safetyNetLevel));
  }

  return chips;
}

function getSpoonStartStageBackground(stageId = "", targetState = state, fallbackBackground = null) {
  const normalizedStageId = String(stageId || "").trim().toLowerCase();
  const currentDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  if (normalizedStageId === "spawn" && currentDay !== 1) {
    return fallbackBackground;
  }

  if (normalizedStageId !== "spawn") {
    syncSpoonStartResidence(targetState);
    if (!shouldUseSpoonStartResidence(targetState)) {
      return fallbackBackground;
    }
  }

  const homeConfig = getSpoonStartHomeConfig(targetState);
  let preferredBackground = null;

  switch (normalizedStageId) {
    case "spawn":
      preferredBackground = homeConfig?.spawnBackground || null;
      break;
    case "room":
      preferredBackground = homeConfig?.roomBackground || null;
      break;
    case "outside-home":
      preferredBackground = homeConfig?.outsideBackground || null;
      break;
    case "lobby":
      preferredBackground = homeConfig?.lobbyBackground || null;
      break;
    case "transit":
      preferredBackground = homeConfig?.transitBackground || null;
      break;
    default:
      preferredBackground = null;
      break;
  }

  const baseBackground = preferredBackground || fallbackBackground;
  return baseBackground
    ? getSpoonStartSceneBackground(baseBackground, targetState)
    : null;
}

function applySpoonStartPackage(targetState = state, tierId = "") {
  if (!targetState || typeof targetState !== "object") {
    return createDefaultSpoonStartState();
  }

  const originState = createAppliedSpoonStartState(tierId);
  targetState.startingOrigin = { ...originState };
  targetState.money = originState.walletCash;

  if (typeof setBankBalance === "function") {
    setBankBalance(originState.bankBalance, targetState);
  } else {
    if (!targetState.bank || typeof targetState.bank !== "object") {
      targetState.bank = typeof createDefaultBankState === "function"
        ? createDefaultBankState()
        : { balance: 0, transactions: [], transferDraft: { recipient: "", amount: "" } };
    }
    targetState.bank.balance = Math.max(0, Math.round(Number(originState.bankBalance) || 0));
  }

  if (typeof patchBankDomainState === "function") {
    patchBankDomainState(targetState, { transactions: [] });
  } else if (Array.isArray(targetState.bank?.transactions)) {
    targetState.bank.transactions = [];
  }

  if (originState.bankBalance > 0 && typeof recordBankTransaction === "function") {
    recordBankTransaction({
      title: "출생 자산 입금",
      amount: originState.bankBalance,
      type: "origin",
      direction: "in",
      note: `${originState.label} 출생 패키지`,
    }, targetState);
  }

  targetState.stockHolding = null;
  targetState.coinHolding = null;
  targetState.stocksUsedToday = false;
  targetState.coinUsedToday = false;

  if (originState.starterStockAmount > 0) {
    targetState.stockHolding = {
      betAmount: originState.starterStockAmount,
      buyDay: Math.max(1, Math.round(Number(targetState.day) || 1)),
      source: "origin",
    };
  }

  if (originState.starterCoinAmount > 0) {
    targetState.coinHolding = {
      betAmount: originState.starterCoinAmount,
      buyDay: Math.max(1, Math.round(Number(targetState.day) || 1)),
      coinType: String(originState.starterCoinType || "BTC").trim().toUpperCase(),
      source: "origin",
    };
  }

  if (typeof syncOwnershipState === "function") {
    const ownershipState = syncOwnershipState(targetState);
    ownershipState.home = null;
    ownershipState.homeAsset = null;
    ownershipState.residence = getSpoonStartResidenceId(targetState) || ownershipState.residence;
  }

  if (Array.isArray(originState.starterAssetIds)) {
    originState.starterAssetIds.forEach((itemId) => {
      if (typeof grantInventoryItem === "function") {
        grantInventoryItem(itemId, 1, targetState);
      }
      if (typeof getInventoryItemDefinition === "function" && typeof setEquippedInventoryItem === "function") {
        const definition = getInventoryItemDefinition(itemId);
        if (definition?.equipmentSlot) {
          setEquippedInventoryItem(definition.equipmentSlot, itemId, targetState);
        }
      }
    });
  }

  if (originState.starterVehicleId && typeof setOwnedVehicle === "function") {
    setOwnedVehicle(originState.starterVehicleId, targetState, {
      acquiredSource: "origin",
      purchasePrice: 0,
      note: `${originState.label} 출생 패키지`,
      isStarterAsset: true,
    });
  }

  if (typeof setHappinessValue === "function") {
    setHappinessValue(originState.startHappiness, targetState);
  } else {
    if (!targetState.happiness || typeof targetState.happiness !== "object") {
      targetState.happiness = typeof createDefaultHappinessState === "function"
        ? createDefaultHappinessState()
        : { value: 45, status: "low", dailyDecay: 5, lastModifiedDay: 1 };
    }
    targetState.happiness.value = originState.startHappiness;
  }

  if (typeof syncWorldState === "function") {
    const worldState = syncWorldState(targetState);
    const homeLocationId = originState.homeLocationId || "";
    const knownHomeLocationIds = getAllSpoonStartHomeLocationIds();

    if (homeLocationId) {
      worldState.currentLocation = homeLocationId;
      worldState.currentDistrict = typeof getWorldLocationDistrictId === "function"
        ? getWorldLocationDistrictId(homeLocationId, targetState.day || 1)
        : worldState.currentDistrict;
      worldState.unlockedLocations = (Array.isArray(worldState.unlockedLocations)
        ? worldState.unlockedLocations
        : []
      ).filter((locationId) => !knownHomeLocationIds.includes(locationId) || locationId === homeLocationId);

      if (!worldState.unlockedLocations.includes(homeLocationId)) {
        worldState.unlockedLocations.unshift(homeLocationId);
      }
    }
  }

  return targetState.startingOrigin;
}

function getSpoonStartSceneBackground(baseBackground = null, targetState = state) {
  if (!baseBackground || typeof baseBackground !== "object" || !baseBackground.image) {
    return baseBackground;
  }

  if ((targetState?.day || 1) !== 1) {
    return baseBackground;
  }

  const originState = ensureSpoonStartState(targetState);
  const theme = getSpoonStartVisualTheme(originState.tierId);
  if (!originState?.tierId || !theme.sceneOverlay) {
    return baseBackground;
  }

  return {
    ...baseBackground,
    overlay: `${theme.sceneOverlay}, ${baseBackground.overlay || "linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.18) 100%)"}`,
  };
}
