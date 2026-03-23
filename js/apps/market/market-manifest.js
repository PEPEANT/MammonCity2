const MARKET_APP_TOP_NAV = Object.freeze([
  { route: "market/vehicles", label: "중고차/오토바이" },
  { route: "market/homes", label: "부동산 직거래" },
  { route: "market/premium", label: "프리미엄 매물" },
  { route: "market/write", label: "내 물건 팔기" },
]);

const MARKET_APP_BOTTOM_TABS = Object.freeze([
  { route: "market/home", label: "홈", icon: "⌂", id: "home" },
  { route: "market/vehicles", label: "이동수단", icon: "🚲", id: "vehicles" },
  { route: "market/homes", label: "부동산", icon: "🏢", id: "homes" },
  { route: "market/chat", label: "채팅", icon: "💬", id: "chat" },
  { route: "market/my", label: "내 거래", icon: "👤", id: "my" },
]);

function buildMarketRoute(screenId = "home") {
  return `market/${String(screenId || "home").trim().toLowerCase() || "home"}`;
}

function parseMarketRouteState(screenId = "home") {
  const normalized = String(screenId || "home").trim().toLowerCase() || "home";

  if (normalized === "write") {
    return { view: "write", activeTab: "home" };
  }

  if (normalized === "chat") {
    return { view: "chat", activeTab: "chat" };
  }

  if (normalized === "my") {
    return { view: "my", activeTab: "my" };
  }

  if (normalized === "vehicles") {
    return { view: "home", activeTab: "vehicles" };
  }

  if (normalized === "homes") {
    return { view: "home", activeTab: "homes" };
  }

  if (normalized === "premium") {
    return { view: "home", activeTab: "premium" };
  }

  if (normalized.startsWith("item-")) {
    return {
      view: "detail",
      activeTab: "home",
      listingId: normalized.slice(5),
    };
  }

  return { view: "home", activeTab: "home" };
}

function buildMarketProductArtMarkup(listing, { detail = false } = {}) {
  if (!listing) {
    return "";
  }

  return `
    <div class="market-product-art is-${escapePhoneAppHtml(listing.imageTone || "default")}${detail ? " is-detail" : ""}">
      <div class="market-product-art-kicker">${escapePhoneAppHtml(listing.detailCategory || "직거래")}</div>
      <div class="market-product-art-center">${escapePhoneAppHtml(listing.imageEmoji || "📦")}</div>
      <div class="market-product-art-label">${escapePhoneAppHtml(listing.imageLabel || "SALE")}</div>
    </div>
  `;
}

function getMarketTemperatureTone(temp = 36.5) {
  if (temp >= 50) {
    return "hot";
  }
  if (temp >= 40) {
    return "warm";
  }
  if (temp >= 36.5) {
    return "steady";
  }
  return "cool";
}

function buildMarketHomeHeaderMarkup(onWriteRoute = "market/write") {
  return `
    <header class="market-app-header">
      <div class="market-app-header-main">
        <h1 class="market-app-logo">호박마켓</h1>
        <nav class="market-app-header-nav" aria-label="호박마켓 상단 메뉴">
          ${MARKET_APP_TOP_NAV.map((entry) => buildPhoneRouteButtonMarkup({
            route: entry.route,
            label: entry.label,
            className: "market-app-header-link",
          })).join("")}
        </nav>
      </div>
      <div class="market-app-header-side">
        <div class="market-app-header-search">
          <span class="market-app-header-search-icon">⌕</span>
          <input type="text" value="" placeholder="중고폰, 정장, 원룸을 검색해보세요" readonly />
        </div>
        <button class="market-app-header-icon-btn" type="button" aria-label="검색">⌕</button>
        <button class="market-app-header-icon-btn" type="button" aria-label="메뉴">☰</button>
        <div class="market-app-header-desktop-actions">
          <button class="market-app-header-icon-btn" type="button" aria-label="알림">🔔</button>
          <button class="market-app-header-icon-btn" type="button" aria-label="채팅">💬</button>
          ${buildPhoneRouteButtonMarkup({
            route: onWriteRoute,
            label: "글쓰기",
            className: "market-app-write-btn",
          })}
        </div>
      </div>
    </header>
  `;
}

function buildMarketProductListMarkup(listings = []) {
  return listings.map((listing) => `
    <button
      class="market-product-card"
      type="button"
      data-phone-route="${escapePhoneAppHtml(buildMarketRoute(`item-${listing.id}`))}"
    >
      <div class="market-product-card-thumb">
        ${buildMarketProductArtMarkup(listing)}
      </div>
      <div class="market-product-card-copy">
        <div class="market-product-card-title">${escapePhoneAppHtml(listing.title)}</div>
        <div class="market-product-card-meta">${escapePhoneAppHtml(`${listing.location} · ${listing.timeLabel}`)}</div>
        <div class="market-product-card-price">${escapePhoneAppHtml(getMarketPriceText(listing.price))}</div>
        <div class="market-product-card-stats">
          ${listing.chats > 0 ? `<span>💬 ${escapePhoneAppHtml(String(listing.chats))}</span>` : ""}
          ${listing.likes > 0 ? `<span>♡ ${escapePhoneAppHtml(String(listing.likes))}</span>` : ""}
        </div>
      </div>
    </button>
  `).join("");
}

function buildMarketBottomNavMarkup(activeTab = "home") {
  return `
    <nav class="market-bottom-nav" aria-label="호박마켓 하단 메뉴">
      ${MARKET_APP_BOTTOM_TABS.map((tab) => buildPhoneRouteButtonMarkup({
        route: tab.route,
        label: `${tab.icon}\n${tab.label}`,
        className: `market-bottom-nav-btn${activeTab === tab.id ? " is-active" : ""}`,
      })).join("")}
    </nav>
  `;
}

function buildMarketHomeViewMarkup(routeState, { targetState = state } = {}) {
  const listings = typeof getMarketVisibleListings === "function"
    ? getMarketVisibleListings(routeState.activeTab, targetState)
    : [];
  const canViewPremium = typeof isMarketPremiumBuyerEligible === "function"
    ? isMarketPremiumBuyerEligible(targetState)
    : false;
  const title = routeState.activeTab === "vehicles"
    ? "믿을 수 있는 이동수단 직거래"
    : routeState.activeTab === "homes"
      ? "직거래 부동산 매물"
      : routeState.activeTab === "premium"
        ? "프리미엄 직거래"
        : "믿을 수 있는 중고거래";
  const premiumGateMarkup = routeState.activeTab === "premium" && !canViewPremium
    ? `
      <div class="market-empty-state">
        <div class="market-empty-state-title">프리미엄 매물 열람 조건 부족</div>
        <div class="market-empty-state-body">현금 여력이 충분하거나 상위 출발 패키지일 때 고급 차량/매물이 먼저 노출됩니다.</div>
      </div>
    `
    : "";
  const listingsMarkup = listings.length
    ? buildMarketProductListMarkup(listings)
    : '<div class="market-empty-state"><div class="market-empty-state-title">표시할 매물이 없습니다.</div><div class="market-empty-state-body">다른 탭이나 검색어로 다시 확인해 보세요.</div></div>';
  const statusMarkup = typeof buildPhoneAppStatusMarkup === "function"
    ? buildPhoneAppStatusMarkup("market")
    : "";

  return `
    <section class="market-app-shell">
      <div class="market-app-home-view">
        ${buildMarketHomeHeaderMarkup()}
        <main class="market-app-home-main">
          <div class="market-app-mobile-location">
            <div class="market-app-mobile-location-copy">
              <span>배금시</span>
              <span class="market-app-mobile-location-arrow">⌄</span>
            </div>
            <button class="market-app-mobile-filter" type="button" aria-label="필터">☷</button>
          </div>
          <div class="market-app-home-body">
            <h2 class="market-app-home-title">${escapePhoneAppHtml(title)}</h2>
            ${statusMarkup}
            ${premiumGateMarkup}
            <div class="market-product-list">
              ${listingsMarkup}
            </div>
          </div>
        </main>
        <button class="market-floating-write" type="button" data-phone-route="market/write" aria-label="글쓰기">＋</button>
        ${buildMarketBottomNavMarkup(routeState.activeTab)}
      </div>
    </section>
  `;
}

function buildMarketDetailViewMarkup(listing, { targetState = state } = {}) {
  if (!listing) {
    return '<div class="market-empty-state"><div class="market-empty-state-title">매물을 찾지 못했습니다.</div><div class="market-empty-state-body">목록으로 돌아가 다시 확인해 보세요.</div></div>';
  }

  const tempTone = getMarketTemperatureTone(listing.temperature);
  const actionConfig = typeof getMarketDetailActionConfig === "function"
    ? getMarketDetailActionConfig(listing, targetState)
    : { actionId: "", label: "닫기", disabled: true };

  return `
    <section class="market-detail-view">
      <header class="market-detail-header">
        ${buildPhoneRouteButtonMarkup({
          route: "market/home",
          label: "‹",
          className: "market-detail-header-btn",
        })}
        <div class="market-detail-header-actions">
          <button class="market-detail-header-btn" type="button" aria-label="공유">↗</button>
          <button class="market-detail-header-btn" type="button" aria-label="더보기">⋮</button>
        </div>
      </header>

      <div class="market-detail-hero">
        ${buildMarketProductArtMarkup(listing, { detail: true })}
      </div>

      <div class="market-detail-seller">
        <div class="market-detail-seller-avatar">👤</div>
        <div class="market-detail-seller-copy">
          <div class="market-detail-seller-name">${escapePhoneAppHtml(listing.seller)}</div>
          <div class="market-detail-seller-location">${escapePhoneAppHtml(listing.location)}</div>
        </div>
        <div class="market-detail-temp">
          <div class="market-detail-temp-value is-${escapePhoneAppHtml(tempTone)}">${escapePhoneAppHtml(`${listing.temperature.toFixed(1)} °C 🙂`)}</div>
          <div class="market-detail-temp-bar"><span class="is-${escapePhoneAppHtml(tempTone)}" style="width:${escapePhoneAppHtml(String(Math.min(listing.temperature, 60) / 60 * 100))}%"></span></div>
          <div class="market-detail-temp-label">거래온도</div>
        </div>
      </div>

      <div class="market-detail-body">
        <h1 class="market-detail-title">${escapePhoneAppHtml(listing.title)}</h1>
        <div class="market-detail-meta">${escapePhoneAppHtml(`${listing.detailCategory} · ${listing.timeLabel}`)}</div>
        <p class="market-detail-description">${escapePhoneAppHtml(listing.description)}</p>
        <div class="market-detail-stats">
          <span>관심 ${escapePhoneAppHtml(String(listing.likes))}</span>
          <span>·</span>
          <span>채팅 ${escapePhoneAppHtml(String(listing.chats))}</span>
          <span>·</span>
          <span>조회 125</span>
        </div>
      </div>

      <div class="market-detail-bottom-bar">
        <button class="market-detail-like-btn" type="button" aria-label="관심">♡</button>
        <div class="market-detail-divider"></div>
        <div class="market-detail-price-block">
          <span class="market-detail-price">${escapePhoneAppHtml(getMarketPriceText(listing.price))}</span>
          <span class="market-detail-price-note">${escapePhoneAppHtml(listing.transactionType === "buy" ? "가격 제안 불가" : "직거래 문의 우선")}</span>
        </div>
        ${actionConfig.actionId
          ? buildPhoneAppActionButtonMarkup({
              action: actionConfig.actionId,
              label: actionConfig.label,
              disabled: actionConfig.disabled,
              data: { "listing-id": listing.id },
              className: "market-detail-action-btn",
            })
          : `<button class="market-detail-action-btn" type="button" disabled>${escapePhoneAppHtml(actionConfig.label)}</button>`}
      </div>
    </section>
  `;
}

function buildMarketWriteViewMarkup() {
  return `
    <section class="market-write-view">
      <header class="market-write-header">
        ${buildPhoneRouteButtonMarkup({
          route: "market/home",
          label: "‹",
          className: "market-write-back-btn",
        })}
        <h1 class="market-write-title">내 물건 팔기</h1>
        <button class="market-write-complete-btn" type="button">완료</button>
      </header>
      <div class="market-write-body">
        <div class="market-write-image-row">
          <button class="market-write-image-picker" type="button">
            <span class="market-write-image-icon">🖼️</span>
            <span class="market-write-image-count">0/10</span>
          </button>
        </div>
        <div class="market-write-form">
          <input type="text" placeholder="글 제목" readonly />
          <div class="market-write-price-row">
            <span>₩</span>
            <input type="text" placeholder="가격 (선택사항)" readonly />
          </div>
          <textarea readonly placeholder="게시글 내용을 작성해주세요. 차량 상태, 거래 희망 장소, 계약 조건 등을 적어두면 좋습니다."></textarea>
        </div>
      </div>
    </section>
  `;
}

function buildMarketChatViewMarkup() {
  const threads = typeof getMarketChatThreads === "function"
    ? getMarketChatThreads()
    : [];

  return `
    <section class="market-chat-view">
      ${buildMarketHomeHeaderMarkup()}
      <div class="market-chat-body">
        <div class="market-chat-section-title">거래 채팅</div>
        ${typeof buildPhoneAppStatusMarkup === "function" ? buildPhoneAppStatusMarkup("market") : ""}
        ${threads.map((thread) => `
          <article class="market-chat-item">
            <div class="market-chat-avatar">💬</div>
            <div class="market-chat-copy">
              <div class="market-chat-name">${escapePhoneAppHtml(thread.name)}</div>
              <div class="market-chat-snippet">${escapePhoneAppHtml(thread.snippet)}</div>
            </div>
            <div class="market-chat-time">${escapePhoneAppHtml(thread.timeLabel)}</div>
          </article>
        `).join("")}
      </div>
      ${buildMarketBottomNavMarkup("chat")}
    </section>
  `;
}

function buildMarketMyViewMarkup(targetState = state) {
  const ownedEntries = typeof getMarketOwnedEntries === "function"
    ? getMarketOwnedEntries(targetState)
    : [];
  const ownedCards = ownedEntries.map((entry) => `
    <article class="market-owned-card">
      <div class="market-owned-card-label">${escapePhoneAppHtml(
        entry.kind === "vehicle"
          ? "차량"
          : entry.kind === "home"
            ? "주거"
            : "생활 자산"
      )}</div>
      <div class="market-owned-card-title">${escapePhoneAppHtml(`${entry.icon || "📦"} ${entry.cardTitle || entry.title}`)}</div>
      <div class="market-owned-card-body">${escapePhoneAppHtml(entry.description || "")}</div>
      <div class="market-owned-card-meta">
        ${entry.acquiredSourceLabel ? `<span>취득 ${escapePhoneAppHtml(entry.acquiredSourceLabel)} · ${escapePhoneAppHtml(String(entry.acquiredDay || 1))}턴</span>` : ""}
        <span>매입가 ${escapePhoneAppHtml(getMarketPriceText(entry.purchasePrice))}</span>
        <span>${escapePhoneAppHtml(entry.kind === "vehicle" || entry.kind === "home" ? "현재 평가" : "즉시 되팔기")} ${escapePhoneAppHtml(getMarketPriceText(entry.resalePrice))}</span>
        ${entry.quantity > 1 ? `<span>수량 ${escapePhoneAppHtml(String(entry.quantity))}</span>` : ""}
        ${Array.isArray(entry.unlockJobLabels) && entry.unlockJobLabels.length
          ? `<span>해금 ${escapePhoneAppHtml(entry.unlockJobLabels.join(", "))}</span>`
          : ""}
      </div>
      ${!entry.canSell && entry.saleLockedReason
        ? `<div class="market-owned-card-body is-warning">${escapePhoneAppHtml(entry.saleLockedReason)}</div>`
        : ""}
      <div class="market-owned-card-actions">
        ${entry.canSell
          ? buildPhoneAppActionButtonMarkup({
              action: "market-sell-owned-entry",
              label: "되팔기",
              data: { "entry-id": entry.entryId },
              className: "market-owned-card-btn",
            })
          : '<button class="market-owned-card-btn is-muted" type="button" disabled>상담 예정</button>'}
      </div>
    </article>
  `);

  return `
    <section class="market-my-view">
      ${buildMarketHomeHeaderMarkup()}
      <div class="market-my-body">
        <div class="market-chat-section-title">내 거래</div>
        ${typeof buildPhoneAppStatusMarkup === "function" ? buildPhoneAppStatusMarkup("market") : ""}
        ${ownedCards.length
          ? ownedCards.join("")
          : '<div class="market-empty-state"><div class="market-empty-state-title">아직 거래한 자산이 없습니다.</div><div class="market-empty-state-body">호박마켓에서 이동수단, 중고폰, 정장, 원룸 매물을 먼저 확인해 보세요.</div></div>'}
      </div>
      ${buildMarketBottomNavMarkup("my")}
    </section>
  `;
}

function buildMarketAppScreenMarkup({ screenId = "home", targetState = state } = {}) {
  const routeState = parseMarketRouteState(screenId);

  if (routeState.view === "write") {
    return buildMarketWriteViewMarkup();
  }

  if (routeState.view === "chat") {
    return buildMarketChatViewMarkup();
  }

  if (routeState.view === "my") {
    return buildMarketMyViewMarkup(targetState);
  }

  if (routeState.view === "detail") {
    const listing = typeof getMarketListingById === "function"
      ? getMarketListingById(routeState.listingId)
      : null;
    return buildMarketDetailViewMarkup(listing, { targetState });
  }

  return buildMarketHomeViewMarkup(routeState, { targetState });
}

function getMarketAppManifest(targetState = state) {
  return {
    id: "market",
    label: "호박마켓",
    homeLabel: "호박",
    icon: "🎃",
    openRoute: "market/home",
    screenMode: "fullbleed",
    installable: true,
    storeCategory: "생활",
    storeDescription: "중고 이동수단 / 직거래",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ screenId = "home", targetState: routeTargetState = targetState } = {}) => (
      buildMarketAppScreenMarkup({
        screenId,
        targetState: routeTargetState,
      })
    ),
  };
}
