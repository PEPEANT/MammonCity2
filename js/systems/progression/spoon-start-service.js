const SPOON_START_TIERS = Object.freeze([
  Object.freeze({
    id: "gold",
    name: "금수저",
    emblem: "금",
    probability: 1,
    bracket: "상위 1%",
    summary: "부족함 거의 없는 출발",
    toneLabel: "금빛",
    initialCash: 320000,
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
    probability: 4,
    bracket: "상위 5%",
    summary: "안정적인 지원이 있는 출발",
    toneLabel: "은빛",
    initialCash: 200000,
    startHappiness: 55,
    accent: "#cbd5e1",
    accentSoft: "rgba(203, 213, 225, 0.16)",
    glow: "rgba(203, 213, 225, 0.34)",
    screenOverlay: "linear-gradient(180deg, rgba(80, 96, 120, 0.18) 0%, rgba(10, 12, 18, 0.58) 100%)",
    sceneOverlay: "radial-gradient(circle at 50% 18%, rgba(232, 239, 247, 0.22) 0%, rgba(232, 239, 247, 0) 50%), linear-gradient(180deg, rgba(221, 230, 242, 0.16) 0%, rgba(73, 86, 112, 0.28) 100%)",
  }),
  Object.freeze({
    id: "bronze",
    name: "동수저",
    emblem: "동",
    probability: 15,
    bracket: "상위 20%",
    summary: "무난하지만 직접 굴려야 한다",
    toneLabel: "동빛",
    initialCash: 120000,
    startHappiness: 48,
    accent: "#cf7c56",
    accentSoft: "rgba(207, 124, 86, 0.16)",
    glow: "rgba(207, 124, 86, 0.28)",
    screenOverlay: "linear-gradient(180deg, rgba(121, 65, 36, 0.18) 0%, rgba(9, 10, 14, 0.58) 100%)",
    sceneOverlay: "radial-gradient(circle at 50% 18%, rgba(233, 170, 130, 0.18) 0%, rgba(233, 170, 130, 0) 50%), linear-gradient(180deg, rgba(225, 150, 111, 0.14) 0%, rgba(96, 51, 28, 0.28) 100%)",
  }),
  Object.freeze({
    id: "steel",
    name: "쇠수저",
    emblem: "쇠",
    probability: 30,
    bracket: "중간권",
    summary: "버티려면 계산이 필요한 출발",
    toneLabel: "강철빛",
    initialCash: 60000,
    startHappiness: 43,
    accent: "#7f95b2",
    accentSoft: "rgba(127, 149, 178, 0.16)",
    glow: "rgba(127, 149, 178, 0.24)",
    screenOverlay: "linear-gradient(180deg, rgba(52, 65, 88, 0.22) 0%, rgba(8, 10, 18, 0.62) 100%)",
    sceneOverlay: "radial-gradient(circle at 50% 18%, rgba(156, 178, 212, 0.16) 0%, rgba(156, 178, 212, 0) 50%), linear-gradient(180deg, rgba(123, 146, 182, 0.13) 0%, rgba(39, 50, 72, 0.28) 100%)",
  }),
  Object.freeze({
    id: "dirt",
    name: "흙수저",
    emblem: "흙",
    probability: 50,
    bracket: "하위권",
    summary: "가진 건 적지만 뒤집을 여지는 남아 있다",
    toneLabel: "흙빛",
    initialCash: 20000,
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

function getSpoonStartTier(tierId = "") {
  const normalized = String(tierId || "").trim().toLowerCase();
  return SPOON_START_TIER_LOOKUP[normalized] || null;
}

function getDefaultSpoonStartTier() {
  return getSpoonStartTier("steel") || SPOON_START_TIERS[0];
}

function createDefaultSpoonStartState() {
  return {
    tierId: "",
    label: "",
    bracket: "",
    summary: "",
    toneLabel: "",
    initialCash: 0,
    startHappiness: 45,
    accent: DEFAULT_SPOON_START_THEME.accent,
    applied: false,
  };
}

function createAppliedSpoonStartState(tierId = "") {
  const tier = getSpoonStartTier(tierId) || getDefaultSpoonStartTier();
  return {
    tierId: tier.id,
    label: tier.name,
    bracket: tier.bracket,
    summary: tier.summary,
    toneLabel: tier.toneLabel,
    initialCash: tier.initialCash,
    startHappiness: tier.startHappiness,
    accent: tier.accent,
    applied: true,
  };
}

function ensureSpoonStartState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return createDefaultSpoonStartState();
  }

  if (!targetState.startingOrigin || typeof targetState.startingOrigin !== "object") {
    targetState.startingOrigin = createDefaultSpoonStartState();
  }

  return targetState.startingOrigin;
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

function applySpoonStartPackage(targetState = state, tierId = "") {
  if (!targetState || typeof targetState !== "object") {
    return createDefaultSpoonStartState();
  }

  const originState = createAppliedSpoonStartState(tierId);
  targetState.startingOrigin = { ...originState };
  targetState.money = originState.initialCash;

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
