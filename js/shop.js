// ════════════════════════════════════════════════════════════
//  shop.js  —  상점 시스템 (미연결 독립 모듈)
//  index.html에 <script src="js/shop.js"> 추가 전까지 작동 안 함
// ════════════════════════════════════════════════════════════

// ─── 아이템 데이터 ────────────────────────────────────────────
const SHOP_ITEMS = [
  // ── 소모품 (하루 1회 효과, 사용 후 사라짐) ─────────────────
  {
    id: "coffee",
    name: "아메리카노",
    emoji: "☕",
    category: "소모품",
    price: 5000,
    effect: "오늘 알바 수입 +8%",
    type: "consumable",
    applyFn: (pay) => Math.floor(pay * 1.08),
  },
  {
    id: "energy_drink",
    name: "에너지 드링크",
    emoji: "⚡",
    category: "소모품",
    price: 3000,
    effect: "오늘 알바 수입 +5%, 내일도 유지",
    type: "consumable",
    applyFn: (pay) => Math.floor(pay * 1.05),
  },
  {
    id: "gimbap",
    name: "편의점 김밥",
    emoji: "🍱",
    category: "소모품",
    price: 2000,
    effect: "오늘 이벤트 보너스 +3,000원",
    type: "consumable",
    applyFn: (pay) => pay + 3000,
  },

  // ── 장비 (영구 효과, 한 번 사면 계속 적용) ──────────────────
  {
    id: "bike",
    name: "중고 자전거",
    emoji: "🚲",
    category: "장비",
    price: 60000,
    effect: "배달 알바 수입 +15% 영구",
    type: "equipment",
    targetJob: "delivery",
    multiplier: 1.15,
  },
  {
    id: "raincoat",
    name: "우비",
    emoji: "🌧️",
    category: "장비",
    price: 18000,
    effect: "비 이벤트 패널티 제거",
    type: "equipment",
    targetJob: "delivery",
    removePenalty: "rain",
  },
  {
    id: "notebook",
    name: "노트 & 펜",
    emoji: "📒",
    category: "장비",
    price: 8000,
    effect: "과외·코칭 알바 수입 +10% 영구",
    type: "equipment",
    targetJob: ["tutoring", "study_coach"],
    multiplier: 1.10,
  },
  {
    id: "earphone",
    name: "이어폰",
    emoji: "🎧",
    category: "장비",
    price: 15000,
    effect: "물류·점검 알바 수입 +10% 영구",
    type: "equipment",
    targetJob: ["warehouse", "line_inspector"],
    multiplier: 1.10,
  },
  {
    id: "suit",
    name: "깔끔한 정장",
    emoji: "👔",
    category: "장비",
    price: 120000,
    effect: "모든 알바 수입 +5% 영구",
    type: "equipment",
    targetJob: "all",
    multiplier: 1.05,
  },

  // ── 정보 (특수 공고 해금) ─────────────────────────────────
  {
    id: "job_tip",
    name: "구인 앱 프리미엄",
    emoji: "📱",
    category: "정보",
    price: 30000,
    effect: "매일 공고 1개 추가 노출",
    type: "info",
    extraSlot: 1,
  },
  {
    id: "map",
    name: "골목 지도",
    emoji: "🗺️",
    category: "정보",
    price: 10000,
    effect: "배달 오배송 이벤트 발생 확률 -50%",
    type: "info",
    reduceEvent: "delivery-misroute",
  },
];

// ─── 상점 상태 ────────────────────────────────────────────────
// TODO: game.js의 state 객체와 연결 필요
const shopState = {
  isOpen: false,
  currentTab: "shop",   // "shop" | "inventory"
  inventory: [],         // 보유 아이템 id 목록
  // 아래는 연결 시 game state에서 받아올 값
  // money: () => state.money,
};

// ─── 아이템 조회 유틸 ─────────────────────────────────────────
function getItem(id) {
  return SHOP_ITEMS.find((i) => i.id === id) ?? null;
}

function isOwned(id) {
  return shopState.inventory.includes(id);
}

function canAfford(item) {
  // TODO: state.money 연결 후 실제 잔액 비교
  // return state.money >= item.price;
  return false; // placeholder
}

// ─── 구매 처리 ───────────────────────────────────────────────
function buyItem(id) {
  const item = getItem(id);
  if (!item) return;
  if (isOwned(id) && item.type !== "consumable") return; // 장비는 중복 구매 불가
  // TODO: state.money -= item.price;
  // TODO: 소모품이면 consumableBuffer에, 장비면 inventory에 추가
  shopState.inventory.push(id);
  renderShop();
}

// ─── 효과 적용 (logic.js에서 호출 예정) ─────────────────────
// 알바 수입 계산 시 장비 버프 적용
function applyEquipmentBonus(pay, jobId) {
  let result = pay;
  shopState.inventory.forEach((id) => {
    const item = getItem(id);
    if (!item || item.type !== "equipment") return;
    if (
      item.targetJob === "all" ||
      item.targetJob === jobId ||
      (Array.isArray(item.targetJob) && item.targetJob.includes(jobId))
    ) {
      if (item.multiplier) result = Math.floor(result * item.multiplier);
    }
  });
  return result;
}

// 소모품 하루치 적용 후 제거
function consumeDaily(pay, jobId) {
  // TODO: consumableBuffer를 순회하며 applyFn 적용 후 비우기
  return pay;
}

// ─── UI 렌더링 ───────────────────────────────────────────────
function openShop() {
  shopState.isOpen = true;
  document.getElementById("shop-overlay").classList.add("open");
  renderShop();
}

function closeShop() {
  shopState.isOpen = false;
  document.getElementById("shop-overlay").classList.remove("open");
}

function switchTab(tab) {
  shopState.currentTab = tab;
  document.querySelectorAll(".shop-tab").forEach((el) => {
    el.classList.toggle("active", el.dataset.tab === tab);
  });
  renderShop();
}

function renderShop() {
  const grid = document.getElementById("shop-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (shopState.currentTab === "inventory") {
    renderInventory(grid);
    return;
  }

  // 상점 탭: 전체 아이템 표시
  SHOP_ITEMS.forEach((item) => {
    const owned = isOwned(item.id);
    const afford = canAfford(item);

    const card = document.createElement("div");
    card.className = [
      "shop-item",
      owned && item.type !== "consumable" ? "owned" : "",
      !afford && !owned ? "cant-afford" : "",
    ]
      .filter(Boolean)
      .join(" ");

    card.innerHTML = `
      <div class="item-top">
        <span class="item-emoji">${item.emoji}</span>
        <span class="item-name">${item.name}</span>
      </div>
      <div class="item-effect">${item.effect}</div>
      <div class="item-footer">
        <span class="item-price">${item.price.toLocaleString("ko-KR")}원</span>
        <button class="item-buy-btn ${owned && item.type !== "consumable" ? "owned" : ""}"
          ${owned && item.type !== "consumable" ? "disabled" : ""}
          onclick="buyItem('${item.id}')">
          ${owned && item.type !== "consumable" ? "보유중" : "구매"}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderInventory(grid) {
  if (shopState.inventory.length === 0) {
    grid.innerHTML = `<div class="inventory-empty">보유 중인 아이템이 없습니다.</div>`;
    return;
  }
  shopState.inventory.forEach((id) => {
    const item = getItem(id);
    if (!item) return;
    const card = document.createElement("div");
    card.className = "shop-item owned";
    card.innerHTML = `
      <div class="item-top">
        <span class="item-emoji">${item.emoji}</span>
        <span class="item-name">${item.name}</span>
      </div>
      <div class="item-effect">${item.effect}</div>
      <div class="item-footer">
        <span class="item-price" style="color:#7fff7f">${item.type === "equipment" ? "장비" : item.type === "consumable" ? "소모품" : "정보"}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─── 연결 체크리스트 (연결 시 TODO 제거) ─────────────────────
// [ ] index.html에 <link rel="stylesheet" href="css/shop.css"> 추가
// [ ] index.html에 <script src="js/shop.js"></script> 추가
// [ ] index.html에 #shop-overlay HTML 마크업 추가
// [ ] index.html에 #shop-open-btn 버튼 추가
// [ ] state.js의 money와 canAfford() 연결
// [ ] logic.js의 selectJob() 안에서 applyEquipmentBonus() 호출
// [ ] nextDay() 안에서 consumeDaily() 호출
