const INVENTORY_TABS = Object.freeze([
  { id: "carry", label: "소지품" },
  { id: "equipment", label: "장비" },
  { id: "document", label: "문서" },
  { id: "asset", label: "자산" },
]);

const INVENTORY_ITEM_CATALOG = Object.freeze({
  "phone-basic": Object.freeze({
    id: "phone-basic",
    category: "equipment",
    label: "기본 스마트폰",
    icon: "📱",
    description: "현재 쓰고 있는 기본 스마트폰이다.",
    equipmentSlot: "phone",
  }),
  "phone-used-premium": Object.freeze({
    id: "phone-used-premium",
    category: "equipment",
    label: "중고 프리미엄 스마트폰",
    icon: "📱",
    description: "호박마켓에서 구한 상위 모델 스마트폰이다. 화면 상태가 좋아서 오래 쓸 만하다.",
    equipmentSlot: "phone",
  }),
  "bag-basic": Object.freeze({
    id: "bag-basic",
    category: "equipment",
    label: "기본 가방",
    icon: "🎒",
    description: "초반 소지품을 정리해 들고 다닐 수 있는 기본 가방이다.",
    equipmentSlot: "bag",
    slotBonus: 0,
  }),
  "outfit-suit": Object.freeze({
    id: "outfit-suit",
    category: "equipment",
    label: "정장 세트",
    icon: "👔",
    description: "면접이나 사무 출근 때 체면을 챙기기 좋은 기본 정장 세트다.",
    equipmentSlot: "outfit",
  }),
  "appliance-mini-fridge": Object.freeze({
    id: "appliance-mini-fridge",
    category: "asset",
    label: "미니 냉장고",
    icon: "🧊",
    description: "원룸이나 자취방에 두기 좋은 소형 가전이다.",
  }),
  "water-bottle": Object.freeze({
    id: "water-bottle",
    hungerRestore: 1,
    useLabel: "마신다",
    useMemoryBody: "가방 안에서 생수를 꺼내 몇 모금 넘기며 비어 가던 속을 잠깐 달랬다.",
    category: "carry",
    label: "생수",
    icon: "🥤",
    description: "편의점에서 산 작은 생수병이다.",
  }),
  "triangle-kimbap": Object.freeze({
    id: "triangle-kimbap",
    hungerRestore: 3,
    useLabel: "먹는다",
    useMemoryBody: "챙겨 둔 삼각김밥을 꺼내 허겁지겁 먹고 다시 움직일 기운을 붙잡았다.",
    category: "carry",
    label: "삼각김밥",
    icon: "🍙",
    description: "급하게 한 끼를 때울 수 있는 편의점 삼각김밥이다.",
  }),
  painkiller: Object.freeze({
    id: "painkiller",
    category: "carry",
    label: "진통제",
    icon: "💊",
    description: "몸이 쑤실 때 버티기 좋게 해주는 진통제다.",
  }),
});

const OWNED_HOME_CATALOG = Object.freeze({
  "parents-room": Object.freeze({
    id: "parents-room",
    label: "부모님 집",
    icon: "🏠",
    description: "현재 머무는 기본 거처다.",
    deedLabel: "부모님 집 관련 서류",
    deedDescription: "직접 소유 문서는 아니지만 거주 정보를 확인하는 용도다.",
  }),
  "goshiwon": Object.freeze({
    id: "goshiwon",
    label: "고시원",
    icon: "🚪",
    description: "혼자 버티기 시작한 작은 방이다.",
    deedLabel: "고시원 계약서",
    deedDescription: "현재 거주 고시원 계약을 증명하는 서류다.",
  }),
  "oneroom": Object.freeze({
    id: "oneroom",
    label: "원룸",
    icon: "🏢",
    description: "본격적으로 독립을 시작한 첫 집이다.",
    deedLabel: "원룸 계약서",
    deedDescription: "원룸 거주 계약을 증명하는 서류다.",
  }),
  "officetel": Object.freeze({
    id: "officetel",
    label: "오피스텔",
    icon: "🏙️",
    description: "도시적인 생활감이 느껴지는 주거 공간이다.",
    deedLabel: "오피스텔 계약서",
    deedDescription: "오피스텔 보유 또는 거주 계약을 증명하는 서류다.",
  }),
  "apartment": Object.freeze({
    id: "apartment",
    label: "아파트",
    icon: "🏗️",
    description: "넓고 안정적인 주거 자산이다.",
    deedLabel: "아파트 등기 서류",
    deedDescription: "아파트 보유를 증명하는 서류다.",
  }),
  "penthouse": Object.freeze({
    id: "penthouse",
    label: "펜트하우스",
    icon: "🏰",
    description: "상징성이 강한 최고급 주거 자산이다.",
    deedLabel: "펜트하우스 등기 서류",
    deedDescription: "펜트하우스 보유를 증명하는 서류다.",
  }),
  "hideout": Object.freeze({
    id: "hideout",
    label: "비밀 아지트",
    icon: "🕳️",
    description: "밖에 드러나지 않는 은밀한 거처다.",
    deedLabel: "은닉 거처 문서",
    deedDescription: "비밀 거처 접근 권한을 증명하는 서류다.",
  }),
});

const OWNED_VEHICLE_CATALOG = Object.freeze({
  bicycle: Object.freeze({
    id: "bicycle",
    label: "자전거",
    icon: "🚲",
    description: "짧은 거리를 빠르게 오갈 수 있는 탈것이다.",
    keyLabel: "자전거 열쇠",
    keyDescription: "자전거 잠금 해제에 필요한 열쇠다.",
  }),
  "used-motorbike": Object.freeze({
    id: "used-motorbike",
    label: "중고 오토바이",
    icon: "🛵",
    description: "배달과 장거리 이동에 바로 쓸 수 있는 실속형 오토바이다.",
    keyLabel: "오토바이 키",
    keyDescription: "중고 오토바이 시동과 잠금 해제에 필요한 키다.",
  }),
  "used-car": Object.freeze({
    id: "used-car",
    label: "중고차",
    icon: "🚗",
    description: "이동 효율을 끌어올려 줄 실용적인 차량이다.",
    keyLabel: "자동차 키",
    keyDescription: "중고차 시동과 잠금 해제에 필요한 키다.",
  }),
  "foreign-car": Object.freeze({
    id: "foreign-car",
    label: "외제차",
    icon: "🏎️",
    description: "과시성과 성능을 동시에 갖춘 고급 차량이다.",
    keyLabel: "스마트 키",
    keyDescription: "외제차 시동과 잠금 해제에 필요한 스마트 키다.",
  }),
});

const OWNED_VEHICLE_TRAVEL_PROFILES = Object.freeze({
  bicycle: Object.freeze({
    id: "bicycle",
    label: "자전거",
    shortLabel: "자전거",
    sameDistrictMultiplier: 0.72,
    crossDistrictMultiplier: 0.84,
  }),
  "used-motorbike": Object.freeze({
    id: "used-motorbike",
    label: "오토바이",
    shortLabel: "오토바이",
    sameDistrictMultiplier: 0.54,
    crossDistrictMultiplier: 0.68,
  }),
  "used-car": Object.freeze({
    id: "used-car",
    label: "차량",
    shortLabel: "차량",
    sameDistrictMultiplier: 0.58,
    crossDistrictMultiplier: 0.72,
  }),
  "foreign-car": Object.freeze({
    id: "foreign-car",
    label: "차량",
    shortLabel: "고급차",
    sameDistrictMultiplier: 0.5,
    crossDistrictMultiplier: 0.64,
  }),
});

function getInventoryTabs() {
  return INVENTORY_TABS.map((tab) => ({ ...tab }));
}

function normalizeInventoryTab(tab = "carry") {
  const normalized = String(tab || "").trim().toLowerCase();
  return INVENTORY_TABS.some((entry) => entry.id === normalized) ? normalized : "carry";
}

function createDefaultInventoryState() {
  return {
    panelOpen: false,
    activeTab: "carry",
    slotLimit: 8,
    items: [
      { id: "phone-basic", qty: 1 },
      { id: "bag-basic", qty: 1 },
    ],
    equipped: {
      phone: "phone-basic",
      bag: "bag-basic",
      outfit: null,
    },
  };
}

function createDefaultOwnershipState() {
  return {
    residence: "parents-room",
    home: null,
    vehicle: null,
    homeAsset: null,
    vehicleAsset: null,
  };
}

function normalizeOwnedAssetId(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function getOwnedAssetCatalogDefinition(kind = "", assetId = "") {
  const normalizedKind = String(kind || "").trim().toLowerCase();
  if (normalizedKind === "home") {
    return getOwnedHomeDefinition(assetId);
  }
  if (normalizedKind === "vehicle") {
    return getOwnedVehicleDefinition(assetId);
  }
  return null;
}

function getOwnedAssetMarketListing(kind = "", assetId = "") {
  const normalizedKind = String(kind || "").trim().toLowerCase();
  const normalizedAssetId = normalizeOwnedAssetId(assetId);
  if (!normalizedKind || !normalizedAssetId || typeof getMarketListingCatalog !== "function") {
    return null;
  }

  return getMarketListingCatalog().find((listing) => (
    normalizedKind === "home"
      ? listing.homeId === normalizedAssetId
      : listing.vehicleId === normalizedAssetId
  )) || null;
}

function getOwnedAssetFallbackEstimatedValue(kind = "", assetId = "") {
  const listing = getOwnedAssetMarketListing(kind, assetId);
  if (Number.isFinite(listing?.resalePrice)) {
    return Math.max(0, Math.round(Number(listing.resalePrice) || 0));
  }
  if (Number.isFinite(listing?.price)) {
    const rawPrice = Math.max(0, Number(listing.price) || 0);
    const multiplier = String(kind || "").trim().toLowerCase() === "home" ? 0.78 : 0.72;
    return Math.max(0, Math.round(rawPrice * multiplier));
  }
  return 0;
}

function normalizeOwnedAssetRecord(record = null, kind = "", fallbackAssetId = "") {
  const normalizedKind = String(kind || "").trim().toLowerCase();
  const assetId = normalizeOwnedAssetId(record?.assetId) || normalizeOwnedAssetId(fallbackAssetId);
  if (!assetId || !["home", "vehicle"].includes(normalizedKind)) {
    return null;
  }

  const definition = getOwnedAssetCatalogDefinition(normalizedKind, assetId);
  const listing = getOwnedAssetMarketListing(normalizedKind, assetId);
  const acquiredDay = Math.max(1, Math.round(Number(record?.acquiredDay) || 1));
  const fallbackEstimatedValue = getOwnedAssetFallbackEstimatedValue(normalizedKind, assetId);

  return {
    kind: normalizedKind,
    assetId,
    listingId: String(record?.listingId || listing?.id || ""),
    label: String(record?.label || definition?.label || assetId),
    icon: String(record?.icon || definition?.icon || (normalizedKind === "home" ? "🏠" : "🚗")),
    acquiredDay,
    acquiredSource: String(record?.acquiredSource || record?.source || "system"),
    purchasePrice: Math.max(0, Math.round(Number(record?.purchasePrice) || 0)),
    estimatedValue: Math.max(
      0,
      Math.round(
        Number.isFinite(record?.estimatedValue)
          ? Number(record.estimatedValue)
          : fallbackEstimatedValue
      )
    ),
    lastValuationDay: Math.max(
      acquiredDay,
      Math.round(Number(record?.lastValuationDay) || acquiredDay)
    ),
    note: String(record?.note || ""),
    isStarterAsset: Boolean(record?.isStarterAsset),
  };
}

function createOwnedAssetRecord(kind = "", assetId = "", record = {}, targetState = state) {
  const currentDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  return normalizeOwnedAssetRecord({
    acquiredDay: currentDay,
    lastValuationDay: currentDay,
    ...record,
    kind,
    assetId,
  }, kind, assetId);
}

function syncOwnershipState(targetState = state) {
  if (!targetState) {
    return createDefaultOwnershipState();
  }

  const defaults = createDefaultOwnershipState();
  const ownershipState = targetState.ownership && typeof targetState.ownership === "object"
    ? targetState.ownership
    : {};

  targetState.ownership = {
    residence: normalizeOwnedAssetId(ownershipState.residence) || defaults.residence,
    home: normalizeOwnedAssetId(ownershipState.home),
    vehicle: normalizeOwnedAssetId(ownershipState.vehicle),
    homeAsset: null,
    vehicleAsset: null,
  };

  targetState.ownership.homeAsset = targetState.ownership.home
    ? normalizeOwnedAssetRecord(ownershipState.homeAsset, "home", targetState.ownership.home)
    : null;
  targetState.ownership.vehicleAsset = targetState.ownership.vehicle
    ? normalizeOwnedAssetRecord(ownershipState.vehicleAsset, "vehicle", targetState.ownership.vehicle)
    : null;

  return targetState.ownership;
}

function normalizeInventoryQuantity(value) {
  const quantity = Math.floor(Number(value) || 0);
  return quantity > 0 ? quantity : 0;
}

function normalizeInventoryItems(items = []) {
  const mergedItems = new Map();

  items.forEach((item) => {
    const itemId = String(item?.id || "").trim();
    const qty = normalizeInventoryQuantity(item?.qty ?? item?.quantity ?? 1);
    if (!itemId || !qty) {
      return;
    }

    if (!mergedItems.has(itemId)) {
      mergedItems.set(itemId, { id: itemId, qty: 0 });
    }

    mergedItems.get(itemId).qty += qty;
  });

  return [...mergedItems.values()];
}

function inventoryStateHasItem(itemId, inventoryState) {
  const normalizedItemId = String(itemId || "").trim();
  if (!normalizedItemId || !inventoryState || !Array.isArray(inventoryState.items)) {
    return false;
  }

  return inventoryState.items.some((item) => item.id === normalizedItemId && item.qty > 0);
}

function hasInventoryItem(itemId, targetState = state) {
  const inventoryState = syncInventoryState(targetState);
  return inventoryStateHasItem(itemId, inventoryState);
}

function ensureEquippedInventoryItem(slot, fallbackId, inventoryState) {
  const equippedId = String(inventoryState?.equipped?.[slot] || "").trim();
  if (equippedId && inventoryStateHasItem(equippedId, inventoryState)) {
    return equippedId;
  }

  if (fallbackId && inventoryStateHasItem(fallbackId, inventoryState)) {
    inventoryState.equipped[slot] = fallbackId;
    return fallbackId;
  }

  inventoryState.equipped[slot] = null;
  return null;
}

function syncInventoryState(targetState = state) {
  if (!targetState) {
    return createDefaultInventoryState();
  }

  const defaults = createDefaultInventoryState();
  const inventoryState = targetState.inventory && typeof targetState.inventory === "object"
    ? targetState.inventory
    : {};
  const items = normalizeInventoryItems(Array.isArray(inventoryState.items) ? inventoryState.items : defaults.items);
  const slotLimit = Math.max(1, Math.round(Number(inventoryState.slotLimit) || defaults.slotLimit));

  targetState.inventory = {
    panelOpen: Boolean(inventoryState.panelOpen),
    activeTab: normalizeInventoryTab(inventoryState.activeTab || defaults.activeTab),
    slotLimit,
    items,
    equipped: {
      phone: inventoryState.equipped?.phone || defaults.equipped.phone,
      bag: inventoryState.equipped?.bag || defaults.equipped.bag,
      outfit: Object.prototype.hasOwnProperty.call(inventoryState.equipped || {}, "outfit")
        ? inventoryState.equipped.outfit
        : defaults.equipped.outfit,
    },
  };

  ensureEquippedInventoryItem("phone", defaults.equipped.phone, targetState.inventory);
  ensureEquippedInventoryItem("bag", defaults.equipped.bag, targetState.inventory);
  ensureEquippedInventoryItem("outfit", defaults.equipped.outfit, targetState.inventory);

  return targetState.inventory;
}

function getInventoryCatalog() {
  return { ...INVENTORY_ITEM_CATALOG };
}

function getInventoryItemDefinition(itemId = "") {
  const normalized = String(itemId || "").trim();
  if (!normalized) {
    return null;
  }

  return INVENTORY_ITEM_CATALOG[normalized] || {
    id: normalized,
    category: "carry",
    label: normalized,
    description: "아직 설명이 정리되지 않은 아이템이다.",
  };
}

function getOwnedHomeDefinition(homeId = "") {
  return OWNED_HOME_CATALOG[String(homeId || "").trim()] || null;
}

function getOwnedVehicleDefinition(vehicleId = "") {
  return OWNED_VEHICLE_CATALOG[String(vehicleId || "").trim()] || null;
}

function getOwnedHomeAssetRecord(targetState = state) {
  const ownershipState = syncOwnershipState(targetState);
  return ownershipState.homeAsset ? { ...ownershipState.homeAsset } : null;
}

function getOwnedVehicleAssetRecord(targetState = state) {
  const ownershipState = syncOwnershipState(targetState);
  return ownershipState.vehicleAsset ? { ...ownershipState.vehicleAsset } : null;
}

function getOwnedAssetRecord(kind = "", targetState = state) {
  const normalizedKind = String(kind || "").trim().toLowerCase();
  if (normalizedKind === "home") {
    return getOwnedHomeAssetRecord(targetState);
  }
  if (normalizedKind === "vehicle") {
    return getOwnedVehicleAssetRecord(targetState);
  }
  return null;
}

function getOwnershipAssetPortfolio(targetState = state) {
  const portfolio = [];
  const homeAsset = getOwnedHomeAssetRecord(targetState);
  const vehicleAsset = getOwnedVehicleAssetRecord(targetState);

  if (homeAsset) {
    portfolio.push(homeAsset);
  }
  if (vehicleAsset) {
    portfolio.push(vehicleAsset);
  }

  return portfolio;
}

function getOwnershipTotalAssetValue(targetState = state) {
  return getOwnershipAssetPortfolio(targetState).reduce((sum, asset) => (
    sum + Math.max(0, Math.round(Number(asset?.estimatedValue) || 0))
  ), 0);
}

function getOwnershipNetWorth(targetState = state) {
  const liquidFunds = typeof getTotalLiquidFunds === "function"
    ? getTotalLiquidFunds(targetState)
    : (
      (typeof getWalletBalance === "function"
        ? getWalletBalance(targetState)
        : Math.max(0, Number(targetState?.money) || 0))
      + Math.max(0, Number(targetState?.bank?.balance) || 0)
    );
  const assetValue = getOwnershipTotalAssetValue(targetState);
  const debtOutstanding = typeof getBankLoanSummary === "function"
    ? Math.max(0, Number(getBankLoanSummary(targetState)?.totalOutstanding) || 0)
    : 0;

  return liquidFunds + assetValue - debtOutstanding;
}

function getOwnedVehicleTravelProfile(targetState = state) {
  const ownershipState = syncOwnershipState(targetState);
  const vehicleId = String(ownershipState?.vehicle || "").trim();
  if (!vehicleId) {
    return null;
  }

  return OWNED_VEHICLE_TRAVEL_PROFILES[vehicleId] || null;
}

function getTravelMethodLabelForMode(mode = "walk", targetState = state) {
  const normalizedMode = String(mode || "walk").trim().toLowerCase();
  if (normalizedMode === "bus") {
    return "버스";
  }

  const travelProfile = getOwnedVehicleTravelProfile(targetState);
  if (normalizedMode === "walk" && travelProfile?.label) {
    return travelProfile.label;
  }

  return "도보";
}

function adjustTravelMinutesForOwnedVehicle(baseMinutes = 0, {
  fromLocationId = "",
  toLocationId = "",
  mode = "walk",
} = {}, targetState = state) {
  const normalizedBase = Math.max(1, Math.round(Number(baseMinutes) || 0));
  const normalizedMode = String(mode || "walk").trim().toLowerCase();
  if (normalizedMode !== "walk") {
    return normalizedBase;
  }

  const travelProfile = getOwnedVehicleTravelProfile(targetState);
  if (!travelProfile) {
    return normalizedBase;
  }

  const day = targetState?.day || 1;
  const fromDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(fromLocationId, day)
    : "";
  const toDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId(toLocationId, day)
    : "";
  const sameDistrict = Boolean(fromDistrict && toDistrict && fromDistrict === toDistrict);
  const multiplier = sameDistrict
    ? Number(travelProfile.sameDistrictMultiplier)
    : Number(travelProfile.crossDistrictMultiplier);
  const adjusted = Math.round(normalizedBase * (Number.isFinite(multiplier) ? multiplier : 1));

  return Math.max(8, adjusted);
}

function getInventorySlotLimit(targetState = state) {
  const inventoryState = syncInventoryState(targetState);
  const bagId = inventoryState.equipped?.bag;
  const bagDefinition = getInventoryItemDefinition(bagId);
  const slotBonus = Number.isFinite(bagDefinition?.slotBonus) ? bagDefinition.slotBonus : 0;
  return Math.max(1, inventoryState.slotLimit + slotBonus);
}

function getInventoryCarryLoad(targetState = state) {
  const inventoryState = syncInventoryState(targetState);
  return inventoryState.items.reduce((total, item) => {
    const definition = getInventoryItemDefinition(item.id);
    return definition?.category === "carry" ? total + item.qty : total;
  }, 0);
}

function getInventoryResidenceLabel(targetState = state) {
  const ownershipState = syncOwnershipState(targetState);
  const residenceDefinition = getOwnedHomeDefinition(ownershipState.residence);
  return residenceDefinition?.label || "거처 미정";
}

function getEquippedInventoryItemId(slot, targetState = state) {
  return syncInventoryState(targetState).equipped?.[slot] || null;
}

function setEquippedInventoryItem(slot, itemId, targetState = state) {
  const normalizedSlot = String(slot || "").trim();
  const normalizedItemId = String(itemId || "").trim();
  if (!normalizedSlot) {
    return null;
  }

  const inventoryState = syncInventoryState(targetState);
  if (normalizedItemId && !inventoryStateHasItem(normalizedItemId, inventoryState)) {
    return null;
  }

  inventoryState.equipped[normalizedSlot] = normalizedItemId || null;
  return inventoryState.equipped[normalizedSlot];
}

function getInventoryItemQuantity(itemId, targetState = state) {
  const normalizedItemId = String(itemId || "").trim();
  if (!normalizedItemId) {
    return 0;
  }

  const inventoryState = syncInventoryState(targetState);
  const item = inventoryState.items.find((entry) => entry.id === normalizedItemId);
  return normalizeInventoryQuantity(item?.qty ?? 0);
}

function grantInventoryItem(itemId, quantity = 1, targetState = state) {
  const normalizedItemId = String(itemId || "").trim();
  const normalizedQuantity = normalizeInventoryQuantity(quantity);
  if (!normalizedItemId || !normalizedQuantity || !targetState) {
    return null;
  }

  const inventoryState = syncInventoryState(targetState);
  const existingItem = inventoryState.items.find((item) => item.id === normalizedItemId);

  if (existingItem) {
    existingItem.qty += normalizedQuantity;
  } else {
    inventoryState.items.push({
      id: normalizedItemId,
      qty: normalizedQuantity,
    });
  }

  return inventoryState.items.find((item) => item.id === normalizedItemId) || null;
}

function consumeInventoryItem(itemId, quantity = 1, targetState = state) {
  const normalizedItemId = String(itemId || "").trim();
  const normalizedQuantity = normalizeInventoryQuantity(quantity);
  if (!normalizedItemId || !normalizedQuantity || !targetState) {
    return false;
  }

  const inventoryState = syncInventoryState(targetState);
  const existingItem = inventoryState.items.find((item) => item.id === normalizedItemId);
  if (!existingItem || existingItem.qty < normalizedQuantity) {
    return false;
  }

  existingItem.qty -= normalizedQuantity;
  inventoryState.items = inventoryState.items.filter((item) => item.qty > 0);

  const defaults = createDefaultInventoryState();
  ensureEquippedInventoryItem("phone", defaults.equipped.phone, inventoryState);
  ensureEquippedInventoryItem("bag", defaults.equipped.bag, inventoryState);
  ensureEquippedInventoryItem("outfit", defaults.equipped.outfit, inventoryState);

  return true;
}

function setOwnedHome(homeId, targetState = state, record = {}) {
  const ownershipState = syncOwnershipState(targetState);
  const previousHomeId = ownershipState.home;
  const nextHomeId = normalizeOwnedAssetId(homeId);
  const baseRecord = previousHomeId === nextHomeId && ownershipState.homeAsset
    ? ownershipState.homeAsset
    : {};
  ownershipState.home = nextHomeId;
  ownershipState.homeAsset = nextHomeId
    ? createOwnedAssetRecord("home", nextHomeId, { ...baseRecord, ...(record || {}) }, targetState)
    : null;
  if (ownershipState.home) {
    ownershipState.residence = ownershipState.home;
  } else if (ownershipState.residence === previousHomeId || !ownershipState.residence) {
    ownershipState.residence = createDefaultOwnershipState().residence;
  }
  return ownershipState.home;
}

function setOwnedVehicle(vehicleId, targetState = state, record = {}) {
  const ownershipState = syncOwnershipState(targetState);
  const previousVehicleId = ownershipState.vehicle;
  const nextVehicleId = normalizeOwnedAssetId(vehicleId);
  const baseRecord = previousVehicleId === nextVehicleId && ownershipState.vehicleAsset
    ? ownershipState.vehicleAsset
    : {};
  ownershipState.vehicle = nextVehicleId;
  ownershipState.vehicleAsset = nextVehicleId
    ? createOwnedAssetRecord("vehicle", nextVehicleId, { ...baseRecord, ...(record || {}) }, targetState)
    : null;
  return ownershipState.vehicle;
}

function setInventoryTab(tab, targetState = state) {
  const inventoryState = syncInventoryState(targetState);
  inventoryState.activeTab = normalizeInventoryTab(tab);
  return inventoryState.activeTab;
}

function toggleInventoryPanel(forceOpen, targetState = state) {
  const inventoryState = syncInventoryState(targetState);
  inventoryState.panelOpen = typeof forceOpen === "boolean"
    ? forceOpen
    : !inventoryState.panelOpen;
  return inventoryState.panelOpen;
}

function closeInventoryPanel(targetState = state) {
  return toggleInventoryPanel(false, targetState);
}

function buildInventoryEntryFromItem(item, targetState = state) {
  const inventoryState = syncInventoryState(targetState);
  const definition = getInventoryItemDefinition(item?.id);
  if (!definition) {
    return null;
  }

  const quantity = normalizeInventoryQuantity(item?.qty ?? 1) || 1;
  const badges = [];

  Object.entries(inventoryState.equipped || {}).forEach(([slot, equippedItemId]) => {
    if (equippedItemId === definition.id) {
      badges.push(
        slot === "phone"
          ? "사용 중"
          : (slot === "bag" || slot === "outfit")
            ? "착용 중"
            : "장착 중"
      );
    }
  });

  return {
    key: `item:${definition.id}`,
    itemId: definition.id,
    category: definition.category || "carry",
    label: definition.label || definition.id,
    icon: definition.icon || "📦",
    description: definition.description || "",
    quantity,
    badges,
    actionLabel: typeof definition.useLabel === "string" ? definition.useLabel : "",
    source: "inventory",
  };
}

function buildOwnershipInventoryEntries(targetState = state) {
  const ownershipState = syncOwnershipState(targetState);
  const documentEntries = [];
  const carryEntries = [];
  const assetEntries = [];
  const homeAsset = getOwnedHomeAssetRecord(targetState);
  const vehicleAsset = getOwnedVehicleAssetRecord(targetState);

  const homeDefinition = getOwnedHomeDefinition(ownershipState.home);
  if (homeDefinition) {
    documentEntries.push({
      key: `ownership-document:home:${homeDefinition.id}`,
      category: "document",
      label: homeDefinition.deedLabel || `${homeDefinition.label} 문서`,
      icon: "📄",
      description: homeDefinition.deedDescription || `${homeDefinition.label} 관련 문서다.`,
      quantity: 1,
      badges: ["소유 연동"],
      source: "ownership",
    });
    assetEntries.push({
      key: `ownership-asset:home:${homeDefinition.id}`,
      category: "asset",
      label: homeDefinition.label,
      icon: homeDefinition.icon || "🏠",
      description: [
        homeDefinition.description || "",
        homeAsset?.estimatedValue > 0 && typeof formatCash === "function"
          ? `현재 평가 ${formatCash(homeAsset.estimatedValue)}`
          : "",
      ].filter(Boolean).join(" · "),
      quantity: 1,
      badges: ["부동산"],
      source: "ownership",
    });
  }

  const vehicleDefinition = getOwnedVehicleDefinition(ownershipState.vehicle);
  if (vehicleDefinition) {
    carryEntries.push({
      key: `ownership-carry:vehicle-key:${vehicleDefinition.id}`,
      category: "carry",
      label: vehicleDefinition.keyLabel || `${vehicleDefinition.label} 키`,
      icon: "🔑",
      description: vehicleDefinition.keyDescription || `${vehicleDefinition.label} 운용에 필요한 키다.`,
      quantity: 1,
      badges: ["소유 연동"],
      source: "ownership",
    });
    assetEntries.push({
      key: `ownership-asset:vehicle:${vehicleDefinition.id}`,
      category: "asset",
      label: vehicleDefinition.label,
      icon: vehicleDefinition.icon || "🚗",
      description: [
        vehicleDefinition.description || "",
        vehicleAsset?.estimatedValue > 0 && typeof formatCash === "function"
          ? `현재 평가 ${formatCash(vehicleAsset.estimatedValue)}`
          : "",
      ].filter(Boolean).join(" · "),
      quantity: 1,
      badges: ["차량"],
      source: "ownership",
    });
  }

  return {
    carry: carryEntries,
    equipment: [],
    document: documentEntries,
    asset: assetEntries,
  };
}

function getInventoryEntriesByTab(tab = "carry", targetState = state) {
  const inventoryState = syncInventoryState(targetState);
  const normalizedTab = normalizeInventoryTab(tab);
  const directEntries = inventoryState.items
    .map((item) => buildInventoryEntryFromItem(item, targetState))
    .filter(Boolean)
    .filter((entry) => entry.category === normalizedTab);
  const ownershipEntries = buildOwnershipInventoryEntries(targetState)[normalizedTab] || [];

  return [...directEntries, ...ownershipEntries];
}

function getInventoryTabCounts(targetState = state) {
  return Object.fromEntries(
    INVENTORY_TABS.map((tab) => [tab.id, getInventoryEntriesByTab(tab.id, targetState).length]),
  );
}

function getInventoryBadgeCount(targetState = state) {
  const counts = getInventoryTabCounts(targetState);
  return Object.values(counts).reduce((total, value) => total + value, 0);
}
