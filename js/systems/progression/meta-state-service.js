function cloneMetaPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...value }
    : {};
}

function normalizeMetaIdList(values = [], fallback = []) {
  const source = Array.isArray(values) ? values : fallback;
  const seen = new Set();
  return source.filter((value) => {
    if (typeof value !== "string" || !value || seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

function createDefaultProgressionState() {
  return {
    routes: {
      career: {},
      crime: {},
      startup: {},
      corporate: {},
      investor: {},
    },
  };
}

function createDefaultUnlocksState() {
  return {
    jobs: [],
    locations: [],
    apps: [],
    routes: [],
    events: [],
    npcs: [],
  };
}

function createDefaultSocialState() {
  return {
    contacts: {},
    factions: {},
  };
}

function createDefaultRiskState() {
  return {
    crime: 0,
    heat: 0,
    debt: 0,
    gambling: 0,
  };
}

function createDefaultBusinessState() {
  return {
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
}

function syncMetaRunState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return {
      progression: createDefaultProgressionState(),
      unlocks: createDefaultUnlocksState(),
      social: createDefaultSocialState(),
      risk: createDefaultRiskState(),
      business: createDefaultBusinessState(),
    };
  }

  const progressionDefaults = createDefaultProgressionState();
  const unlockDefaults = createDefaultUnlocksState();
  const socialDefaults = createDefaultSocialState();
  const riskDefaults = createDefaultRiskState();
  const businessDefaults = createDefaultBusinessState();

  targetState.progression = {
    ...progressionDefaults,
    ...(targetState.progression || {}),
    routes: {
      ...progressionDefaults.routes,
      ...cloneMetaPlainObject(targetState.progression?.routes),
    },
  };

  targetState.unlocks = {
    ...unlockDefaults,
    ...(targetState.unlocks || {}),
    jobs: normalizeMetaIdList(targetState.unlocks?.jobs, unlockDefaults.jobs),
    locations: normalizeMetaIdList(targetState.unlocks?.locations, unlockDefaults.locations),
    apps: normalizeMetaIdList(targetState.unlocks?.apps, unlockDefaults.apps),
    routes: normalizeMetaIdList(targetState.unlocks?.routes, unlockDefaults.routes),
    events: normalizeMetaIdList(targetState.unlocks?.events, unlockDefaults.events),
    npcs: normalizeMetaIdList(targetState.unlocks?.npcs, unlockDefaults.npcs),
  };

  targetState.social = {
    ...socialDefaults,
    ...(targetState.social || {}),
    contacts: cloneMetaPlainObject(targetState.social?.contacts),
    factions: cloneMetaPlainObject(targetState.social?.factions),
  };

  targetState.risk = {
    ...riskDefaults,
    ...(targetState.risk || {}),
    crime: Math.max(0, Number(targetState.risk?.crime) || 0),
    heat: Math.max(0, Number(targetState.risk?.heat) || 0),
    debt: Math.max(0, Number(targetState.risk?.debt) || 0),
    gambling: Math.max(0, Number(targetState.risk?.gambling) || 0),
  };

  targetState.business = {
    ...businessDefaults,
    ...(targetState.business || {}),
    ventures: cloneMetaPlainObject(targetState.business?.ventures),
    ledger: Array.isArray(targetState.business?.ledger)
      ? targetState.business.ledger.map((entry) => ({ ...(entry || {}) }))
      : [],
    permits: cloneMetaPlainObject(targetState.business?.permits),
    staff: cloneMetaPlainObject(targetState.business?.staff),
    realEstate: {
      ...(businessDefaults.realEstate || {}),
      ...cloneMetaPlainObject(targetState.business?.realEstate),
    },
  };

  return targetState;
}
