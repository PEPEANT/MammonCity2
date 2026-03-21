function buildCasinoWidgetMarkup({ targetState = state } = {}) {
  const casinoState = syncCasinoState(targetState);
  const chipBalance = getCasinoChipBalance(targetState);
  const cashBalance = getCasinoCashBalance(targetState);
  const scamActive = Boolean(casinoState.scam?.active);
  const roundActive = typeof hasActiveCasinoBlackjackRound === "function"
    ? hasActiveCasinoBlackjackRound(targetState)
    : false;
  const badge = scamActive ? "LOCK" : roundActive ? "LIVE" : "OPEN";
  const badgeTone = scamActive ? "is-lock" : roundActive ? "is-live" : "is-open";
  const withdrawDisabled = scamActive ? "disabled" : "";

  return `
    <div class="casino-widget">
      <div class="casino-widget-header">
        <span class="casino-widget-kicker">MAMMON CASINO</span>
        <span class="casino-widget-badge ${badgeTone}">${badge}</span>
      </div>
      <div class="casino-widget-chips">
        <span class="casino-widget-label">게임머니</span>
        <strong class="casino-widget-value">${escapePhoneAppHtml(formatMoney(chipBalance))}</strong>
      </div>
      <div class="casino-widget-cash">
        <span class="casino-widget-label">보유 현금</span>
        <span class="casino-widget-cash-value">${escapePhoneAppHtml(formatMoney(cashBalance))}</span>
      </div>
      <div class="casino-widget-action-row">
        <button class="casino-widget-btn is-in" type="button" data-phone-route="${CASINO_ROUTES.exchange}">입금</button>
        <button class="casino-widget-btn is-out" type="button" data-phone-route="${CASINO_ROUTES.exchange}" ${withdrawDisabled}>출금</button>
      </div>
      <button class="casino-widget-play-btn" type="button" data-phone-route="${CASINO_ROUTES.blackjack}">게임하기</button>
    </div>
  `;
}

function buildCasinoHomeScreenMarkup({ stageMode = false, targetState = state } = {}) {
  if (!stageMode) {
    return buildCasinoWidgetMarkup({ targetState });
  }

  const casinoState = syncCasinoState(targetState);
  const chipBalance = getCasinoChipBalance(targetState);
  const cashBalance = getCasinoCashBalance(targetState);
  const scamState = casinoState.scam || {};
  const scamActive = Boolean(scamState.active);
  const roundActive = typeof hasActiveCasinoBlackjackRound === "function"
    ? hasActiveCasinoBlackjackRound(targetState)
    : false;
  const slotsState = casinoState.slots;

  const statusTone = scamActive ? "fail"
    : (casinoState.lastResult?.tone || (roundActive ? "success" : casinoState.usedToday ? "accent" : "success"));
  const statusTitle = scamActive ? "먹튀 발생"
    : (casinoState.lastResult?.title || (roundActive ? "블랙잭 진행 중" : casinoState.usedToday ? "블랙잭 종료" : "카지노 오픈"));
  const statusBadge = scamActive ? "LOCK" : roundActive ? "LIVE" : casinoState.usedToday ? "DONE" : "OPEN";

  const blackjackTag = roundActive ? "진행 중" : casinoState.usedToday ? "오늘 종료" : "바로 이용";
  const exchangeTag = scamActive ? "출금 중단" : chipBalance > 0 ? "칩 정리" : "칩 준비";
  const slotTag = `${escapePhoneAppHtml(formatMoney(slotsState.bet))} 베팅`;

  const statusPill = scamActive
    ? `잃은 칩 ${escapePhoneAppHtml(formatMoney(scamState.lostAmount || 0))}`
    : `블랙잭 ${casinoState.usedToday ? "종료" : roundActive ? "진행 중" : "대기"}`;

  return `
    <div class="casino-app casino-home-screen is-stage">
      <div class="casino-home-hero">
        <div class="casino-app-top">
          <div class="casino-app-copy">
            <span class="casino-app-kicker">CASINO FLOOR</span>
            <div class="casino-app-title">MAMMON 카지노</div>
          </div>
        </div>
      </div>

      <div class="casino-home-balance-grid">
        <div class="casino-home-balance-card">
          <span class="casino-home-balance-label">보유 현금</span>
          <strong class="casino-home-balance-value">${escapePhoneAppHtml(formatMoney(cashBalance))}</strong>
        </div>
        <div class="casino-home-balance-card">
          <span class="casino-home-balance-label">게임머니</span>
          <strong class="casino-home-balance-value">${escapePhoneAppHtml(formatMoney(chipBalance))}</strong>
        </div>
      </div>

      <div class="casino-home-route-list">
        <button class="casino-home-route-card is-exchange" type="button" data-phone-route="${CASINO_ROUTES.exchange}">
          <div class="casino-home-route-head">
            <div class="casino-home-route-copy">
              <span class="casino-home-route-kicker">EXCHANGE</span>
              <span class="casino-home-route-title">환전소</span>
            </div>
            <span class="casino-home-route-tag">${escapePhoneAppHtml(exchangeTag)}</span>
          </div>
        </button>

        <button class="casino-home-route-card is-blackjack" type="button" data-phone-route="${CASINO_ROUTES.blackjack}">
          <div class="casino-home-route-head">
            <div class="casino-home-route-copy">
              <span class="casino-home-route-kicker">TABLE 01</span>
              <span class="casino-home-route-title">블랙잭</span>
            </div>
            <span class="casino-home-route-tag">${escapePhoneAppHtml(blackjackTag)}</span>
          </div>
        </button>

        <button class="casino-home-route-card is-slots" type="button" data-phone-route="${CASINO_ROUTES.slots}">
          <div class="casino-home-route-head">
            <div class="casino-home-route-copy">
              <span class="casino-home-route-kicker">MACHINE 07</span>
              <span class="casino-home-route-title">슬롯머신</span>
            </div>
            <span class="casino-home-route-tag">${slotTag}</span>
          </div>
        </button>
      </div>

      <div class="casino-home-status-card tone-${escapePhoneAppHtml(statusTone)}">
        <div class="casino-home-status-head">
          <div>
            <div class="casino-home-status-kicker">TODAY</div>
            <div class="casino-home-status-title">${escapePhoneAppHtml(statusTitle)}</div>
          </div>
          <div class="casino-home-status-badge">${escapePhoneAppHtml(statusBadge)}</div>
        </div>
        <div class="casino-home-meta">
          <span class="casino-home-pill">${statusPill}</span>
          <span class="casino-home-pill">슬롯 ${escapePhoneAppHtml(formatMoney(slotsState.bet))}</span>
        </div>
      </div>
    </div>
  `;
}

function getCasinoAppManifest(targetState = state) {
  return {
    id: "casino",
    label: "카지노",
    icon: "🎰",
    openRoute: CASINO_ROUTES.home,
    installable: true,
    storeCategory: "오락",
    storeDescription: "환전소, 블랙잭, 슬롯머신을 한곳에서 관리하는 카지노 앱",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false, screenId = "home" } = {}) => {
      if (screenId === "exchange") {
        return buildCasinoExchangeScreenMarkup({ stageMode, targetState });
      }

      if (screenId === "blackjack") {
        return buildCasinoBlackjackScreenMarkup({ stageMode, targetState });
      }

      if (screenId === "slots") {
        return buildCasinoSlotsScreenMarkup({ stageMode, targetState });
      }

      return buildCasinoHomeScreenMarkup({ stageMode, targetState });
    },
  };
}
