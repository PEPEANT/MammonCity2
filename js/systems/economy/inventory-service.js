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
  "bag-basic": Object.freeze({
    id: "bag-basic",
    category: "equipment",
    label: "기본 가방",
    icon: "🎒",
    description: "초반 소지품을 정리해 들고 다닐 수 있는 기본 가방이다.",
    equipmentSlot: "bag",
    slotBonus: 0,
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
    },
  };
}

function createDefaultOwnershipState() {
  return {
    residence: "parents-room",
    home: null,
    vehicle: null,
  };
}

function normalizeOwnedAssetId(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
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
  };

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
    },
  };

  ensureEquippedInventoryItem("phone", defaults.equipped.phone, targetState.inventory);
  ensureEquippedInventoryItem("bag", defaults.equipped.bag, targetState.inventory);

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
  if (normalizedItemId && !hasInventoryItem(normalizedItemId, targetState)) {
    return null;
  }

  inventoryState.equipped[normalizedSlot] = normalizedItemId || null;
  return inventoryState.equipped[normalizedSlot];
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

  return true;
}

function setOwnedHome(homeId, targetState = state) {
  const ownershipState = syncOwnershipState(targetState);
  ownershipState.home = normalizeOwnedAssetId(homeId);
  if (ownershipState.home) {
    ownershipState.residence = ownershipState.home;
  }
  return ownershipState.home;
}

function setOwnedVehicle(vehicleId, targetState = state) {
  const ownershipState = syncOwnershipState(targetState);
  ownershipState.vehicle = normalizeOwnedAssetId(vehicleId);
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
      badges.push(slot === "phone" ? "사용 중" : slot === "bag" ? "착용 중" : "장착 중");
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
      description: homeDefinition.description || "",
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
      description: vehicleDefinition.description || "",
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
