const PLAYER_STAT_LABELS = Object.freeze({
  intelligence: "지능",
  reputation: "평판",
  crime: "범죄도",
  stamina: "체력",
  energy: "에너지",
  hunger: "배고픔",
  happiness: "행복도",
  attractiveness: "외모",
  "career-prep-service": "서비스 준비",
  "career-prep-labor": "현장 준비",
  "career-prep-office": "사무 준비",
  "career-prep-academic": "학업 준비",
});

const PLAYER_PHONE_TIER_BY_ITEM = Object.freeze({
  "phone-basic": 1,
  "phone-used-premium": 2,
});

function getPlayerStatDisplayLabel(statKey = "") {
  const normalized = String(statKey || "").trim().toLowerCase();
  return PLAYER_STAT_LABELS[normalized] || String(statKey || "").trim() || "수치";
}

function getEquippedInventoryItemId(slotId = "", targetState = state) {
  const normalizedSlot = String(slotId || "").trim();
  if (!normalizedSlot || typeof syncInventoryState !== "function") {
    return "";
  }

  const inventoryState = syncInventoryState(targetState);
  return String(inventoryState?.equipped?.[normalizedSlot] || "").trim();
}

function getEquippedInventoryItemDefinition(slotId = "", targetState = state) {
  const itemId = getEquippedInventoryItemId(slotId, targetState);
  if (!itemId || typeof getInventoryItemDefinition !== "function") {
    return null;
  }
  return getInventoryItemDefinition(itemId);
}

function hasEquippedInventoryItem(itemId = "", targetState = state) {
  const normalizedItemId = String(itemId || "").trim();
  if (!normalizedItemId || typeof syncInventoryState !== "function") {
    return false;
  }

  const inventoryState = syncInventoryState(targetState);
  return Object.values(inventoryState?.equipped || {}).some((equippedId) => String(equippedId || "").trim() === normalizedItemId);
}

function hasAnyEquippedInventoryItem(itemIds = [], targetState = state) {
  const normalizedIds = Array.isArray(itemIds)
    ? itemIds.map((itemId) => String(itemId || "").trim()).filter(Boolean)
    : [];
  if (!normalizedIds.length) {
    return false;
  }

  return normalizedIds.some((itemId) => hasEquippedInventoryItem(itemId, targetState));
}

function getPlayerPhoneTier(targetState = state) {
  const phoneId = getEquippedInventoryItemId("phone", targetState);
  return PLAYER_PHONE_TIER_BY_ITEM[phoneId] || 0;
}

function getPlayerNumericStatValue(statKey = "", targetState = state) {
  const normalized = String(statKey || "").trim().toLowerCase();
  const prepState = typeof getCareerPrepSnapshotForState === "function"
    ? getCareerPrepSnapshotForState(targetState)
    : { service: 0, labor: 0, office: 0, academic: 0 };
  const happinessState = typeof syncHappinessState === "function"
    ? syncHappinessState(targetState)
    : { value: Number(targetState?.happiness?.value) || 0 };
  const hungerState = typeof ensureHungerState === "function"
    ? ensureHungerState(targetState)
    : { value: Number(targetState?.hunger) || 0 };
  const appearanceState = typeof syncAppearanceState === "function"
    ? syncAppearanceState(targetState)
    : (targetState?.appearance || { attractiveness: 0 });

  switch (normalized) {
    case "intelligence":
    case "지능":
      return Math.max(0, Number(targetState?.지능) || 0);
    case "reputation":
    case "평판":
      return Math.max(0, Number(targetState?.평판) || 0);
    case "crime":
    case "범죄도":
      return Math.max(0, Number(targetState?.범죄도) || 0);
    case "stamina":
    case "체력":
      return Math.max(0, Number(targetState?.stamina) || 0);
    case "energy":
    case "에너지":
      return Math.max(0, Number(targetState?.energy) || 0);
    case "hunger":
    case "배고픔":
      return Math.max(0, Number(hungerState?.value) || 0);
    case "happiness":
    case "행복도":
      return Math.max(0, Number(happinessState?.value) || 0);
    case "attractiveness":
    case "appearance.attractiveness":
    case "외모":
      return Math.max(0, Number(appearanceState?.attractiveness) || 0);
    case "career-prep-service":
    case "service":
      return Math.max(0, Number(prepState?.service) || 0);
    case "career-prep-labor":
    case "labor":
      return Math.max(0, Number(prepState?.labor) || 0);
    case "career-prep-office":
    case "office":
      return Math.max(0, Number(prepState?.office) || 0);
    case "career-prep-academic":
    case "academic":
      return Math.max(0, Number(prepState?.academic) || 0);
    default:
      return Math.max(0, Number(targetState?.[statKey]) || 0);
  }
}

function getPlayerLifestyleSnapshot(targetState = state) {
  const ownershipState = typeof syncOwnershipState === "function"
    ? syncOwnershipState(targetState)
    : (targetState?.ownership || {});
  const phoneDefinition = getEquippedInventoryItemDefinition("phone", targetState);
  const outfitDefinition = getEquippedInventoryItemDefinition("outfit", targetState);
  const residenceDefinition = typeof getOwnedHomeDefinition === "function"
    ? getOwnedHomeDefinition(ownershipState?.home || ownershipState?.residence || "")
    : null;
  const vehicleDefinition = typeof getOwnedVehicleDefinition === "function"
    ? getOwnedVehicleDefinition(ownershipState?.vehicle || "")
    : null;
  const liquidFunds = typeof getTotalLiquidFunds === "function"
    ? getTotalLiquidFunds(targetState)
    : (
      (typeof getWalletBalance === "function"
        ? getWalletBalance(targetState)
        : Math.max(0, Number(targetState?.money) || 0))
      + Math.max(0, Number(targetState?.bank?.balance) || 0)
    );
  const assetValue = typeof getOwnershipTotalAssetValue === "function"
    ? getOwnershipTotalAssetValue(targetState)
    : 0;
  const netWorth = typeof getOwnershipNetWorth === "function"
    ? getOwnershipNetWorth(targetState)
    : liquidFunds + assetValue;

  return {
    cashOnHand: typeof getWalletBalance === "function"
      ? getWalletBalance(targetState)
      : Math.max(0, Number(targetState?.money) || 0),
    bankBalance: typeof getBankBalance === "function"
      ? getBankBalance(targetState)
      : Math.max(0, Number(targetState?.bank?.balance) || 0),
    netWorth,
    homeLabel: residenceDefinition?.label || ownershipState?.residence || "거처 없음",
    vehicleLabel: vehicleDefinition?.label || "이동수단 없음",
    phoneLabel: phoneDefinition?.label || "기본 스마트폰",
    outfitLabel: outfitDefinition?.label || "기본 복장",
  };
}

function getPlayerHardGateStatuses(targetState = state) {
  const certifications = typeof getCareerCertificationSnapshotForState === "function"
    ? getCareerCertificationSnapshotForState(targetState)
    : { driverLicense: false, computerCert: false };
  const ownershipState = typeof syncOwnershipState === "function"
    ? syncOwnershipState(targetState)
    : (targetState?.ownership || {});
  const vehicleId = String(ownershipState?.vehicle || "").trim();
  const hasBike = ["bicycle", "used-motorbike"].includes(vehicleId);
  const hasMotorbike = vehicleId === "used-motorbike";
  const hasCar = ["used-car", "foreign-car"].includes(vehicleId);
  const hasSuit = hasEquippedInventoryItem("outfit-suit", targetState);
  const hasPremiumPhone = getPlayerPhoneTier(targetState) >= 2;
  const intelligence = getPlayerNumericStatValue("intelligence", targetState);

  return [
    { label: "정장 세트", ready: hasSuit },
    { label: "프리미엄 폰", ready: hasPremiumPhone },
    { label: "근거리 배달", ready: hasBike },
    { label: "오토바이 배달", ready: hasMotorbike },
    { label: "장거리 퀵", ready: hasCar && Boolean(certifications.driverLicense) },
    { label: "사무지원", ready: hasSuit && Boolean(certifications.computerCert) && intelligence >= 18 },
  ];
}

function createPlayerStatSections(targetState = state) {
  const happinessState = typeof syncHappinessState === "function"
    ? syncHappinessState(targetState)
    : createDefaultHappinessState();
  const happinessMeta = typeof getHappinessStatusLabel === "function"
    ? getHappinessStatusLabel(happinessState.status)
    : "";
  const hungerState = typeof ensureHungerState === "function"
    ? ensureHungerState(targetState)
    : { value: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3 };
  const hungerMeta = typeof getHungerStatusLabel === "function"
    ? getHungerStatusLabel(targetState)
    : "";
  const hungerMetaCls = typeof getHungerStatusTone === "function"
    ? getHungerStatusTone(targetState)
    : "";
  const certifications = typeof getCareerCertificationSnapshotForState === "function"
    ? getCareerCertificationSnapshotForState(targetState)
    : { driverLicense: false, computerCert: false };
  const prepState = typeof getCareerPrepSnapshotForState === "function"
    ? getCareerPrepSnapshotForState(targetState)
    : { service: 0, labor: 0, office: 0, academic: 0 };
  const lifestyle = getPlayerLifestyleSnapshot(targetState);
  const hardGateStatuses = getPlayerHardGateStatuses(targetState);

  const formatDisplayValue = (value) => {
    if (typeof formatCash === "function" && Number.isFinite(value)) {
      return formatCash(value);
    }
    return String(value ?? "");
  };

  return [
    {
      id: "life",
      label: "생활",
      bars: [
        { key: "stamina", label: "체력", cls: "stamina", max: typeof SLEEP_STAMINA_MAX === "number" ? SLEEP_STAMINA_MAX : 200, value: getPlayerNumericStatValue("stamina", targetState) },
        { key: "energy", label: "에너지", cls: "energy", max: typeof ENERGY_MAX === "number" ? ENERGY_MAX : 200, value: getPlayerNumericStatValue("energy", targetState) },
        { key: "happiness", label: "행복도", cls: "happiness", max: 100, value: happinessState.value, meta: happinessMeta, metaCls: happinessState.status },
        { key: "hunger", label: "배고픔", cls: "hunger", max: typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3, value: hungerState.value, meta: hungerMeta, metaCls: hungerMetaCls },
      ],
    },
    {
      id: "social",
      label: "사회",
      bars: [
        { key: "intelligence", label: "지능", cls: "intelligence", max: 100, value: getPlayerNumericStatValue("intelligence", targetState) },
        { key: "reputation", label: "평판", cls: "reputation", max: 100, value: getPlayerNumericStatValue("reputation", targetState) },
        { key: "crime", label: "범죄도", cls: "crime", max: 100, value: getPlayerNumericStatValue("crime", targetState) },
        { key: "attractiveness", label: "외모", cls: "attractiveness", max: 100, value: getPlayerNumericStatValue("attractiveness", targetState) },
      ],
    },
    {
      id: "jobs",
      label: "직업",
      bars: [
        { key: "career-prep-service", label: "서비스", cls: "service", max: 9, value: prepState.service },
        { key: "career-prep-labor", label: "현장", cls: "labor", max: 9, value: prepState.labor },
        { key: "career-prep-office", label: "사무", cls: "office", max: 9, value: prepState.office },
        { key: "career-prep-academic", label: "학업", cls: "academic", max: 9, value: prepState.academic },
      ],
      chips: [
        ...Object.entries(certifications).map(([certKey, owned]) => ({
          label: `${typeof getCareerCertificationLabel === "function"
            ? getCareerCertificationLabel(certKey)
            : certKey} ${owned ? "보유" : "없음"}`,
          tone: owned ? "ready" : "missing",
        })),
        ...hardGateStatuses.map((gate) => ({
          label: `${gate.label} ${gate.ready ? "가능" : "잠김"}`,
          tone: gate.ready ? "ready" : "missing",
        })),
      ],
    },
    {
      id: "lifestyle",
      label: "생활수준",
      summaries: [
        { label: "손 현금", value: formatDisplayValue(lifestyle.cashOnHand) },
        { label: "계좌 잔고", value: formatDisplayValue(lifestyle.bankBalance) },
        { label: "순자산", value: formatDisplayValue(lifestyle.netWorth) },
        { label: "거처", value: lifestyle.homeLabel },
        { label: "이동수단", value: lifestyle.vehicleLabel },
        { label: "폰", value: lifestyle.phoneLabel },
        { label: "복장", value: lifestyle.outfitLabel },
      ],
    },
  ];
}
