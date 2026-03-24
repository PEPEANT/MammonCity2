function buildCasinoWidgetLegacyMarkup({ targetState = state } = {}) {
  const casinoState = syncCasinoState(targetState);
  const chipBalance = getCasinoChipBalance(targetState);
  const scamActive = Boolean(casinoState.scam?.active);
  const roundActive = typeof hasActiveCasinoBlackjackRound === "function"
    ? hasActiveCasinoBlackjackRound(targetState)
    : false;
  const statusTone = scamActive ? "is-scam" : roundActive ? "is-live" : "is-open";
  const statusText = scamActive ? "먹튀 주의" : roundActive ? "게임 진행 중" : "24시간 운영 중";

  return `
    <div class="csw-card ${statusTone}">
      <div class="csw-top">
        <div class="csw-brand"><span class="csw-n">NEON</span><span class="csw-s">SHADOW</span></div>
        <div class="csw-conn ${statusTone}"><span class="csw-conn-dot"></span>${escapePhoneAppHtml(statusText)}</div>
      </div>
      <div class="csw-tagline">무허가 사설 카지노 · 미러 접속</div>
      <div class="csw-bal">
        <span class="csw-bal-label">보유 칩</span>
        <strong class="csw-bal-val">${escapePhoneAppHtml(formatMoney(chipBalance))}</strong>
      </div>
      <button class="csw-enter-btn" type="button" data-phone-route="${CASINO_ROUTES.home}">입장하기 →</button>
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

  const statusTitle = scamActive ? "먹튀 발생"
    : (casinoState.lastResult?.title || (roundActive ? "블랙잭 진행 중" : casinoState.usedToday ? "블랙잭 종료" : "카지노 오픈"));
  const statusBadge = scamActive ? "LOCK" : roundActive ? "LIVE" : casinoState.usedToday ? "DONE" : "OPEN";

  const blackjackTag = roundActive ? "진행 중" : casinoState.usedToday ? "오늘 종료" : "바로 이용";
  const slotTag = `${escapePhoneAppHtml(formatMoney(slotsState.bet))} 베팅`;

  const statusBg = scamActive ? "is-scam" : roundActive ? "is-live" : casinoState.usedToday ? "is-done" : "is-open";

  const bjTagTone = roundActive ? "is-live" : casinoState.usedToday ? "is-done" : "is-open";
  const mirrorIndex = ((targetState?.day || 1) % 5) + 1;
  const mirrorUrl = `ns-mirror-0${mirrorIndex}.net/lobby`;

  return `
    <div class="casino-app csm-screen">

      <div class="csm-chrome">
        <span class="csm-chrome-icon">🔒</span>
        <span class="csm-chrome-url">${escapePhoneAppHtml(mirrorUrl)}</span>
        <span class="csm-chrome-conn ${scamActive ? "is-scam" : "is-ok"}">${scamActive ? "차단됨" : "접속됨"}</span>
      </div>

      <div class="csm-hero">
        <div class="csm-brand">
          <span class="csm-brand-neon">NEON</span>
          <span class="csm-brand-shadow">SHADOW</span>
        </div>
        <div class="csm-hero-sub">무허가 사설 카지노 · 24시간 운영</div>
      </div>

      <div class="csm-bal-row">
        <div class="csm-bal-item">
          <span class="csm-bal-label">현금</span>
          <strong class="csm-bal-val">${escapePhoneAppHtml(formatMoney(cashBalance))}</strong>
        </div>
        <div class="csm-bal-divider"></div>
        <div class="csm-bal-item">
          <span class="csm-bal-label">칩</span>
          <strong class="csm-bal-val is-chip">${escapePhoneAppHtml(formatMoney(chipBalance))}</strong>
        </div>
        <button class="csm-exchange-btn" type="button" data-phone-route="${CASINO_ROUTES.exchange}">환전 →</button>
      </div>

      <div class="csm-rooms">
        <button class="csm-room-btn is-bj" type="button" data-phone-route="${CASINO_ROUTES.blackjack}">
          <div class="csm-room-emblem">♠</div>
          <div class="csm-room-info">
            <div class="csm-room-name">블랙잭</div>
            <div class="csm-room-code">TABLE 01</div>
          </div>
          <div class="csm-room-tag ${bjTagTone}">${escapePhoneAppHtml(blackjackTag)}</div>
        </button>

        <button class="csm-room-btn is-sl" type="button" data-phone-route="${CASINO_ROUTES.slots}">
          <div class="csm-room-emblem">BAR</div>
          <div class="csm-room-info">
            <div class="csm-room-name">슬롯머신</div>
            <div class="csm-room-code">${escapePhoneAppHtml(slotTag)}</div>
          </div>
          <div class="csm-room-tag is-open">GO</div>
        </button>
      </div>

      <div class="csm-notice ${statusBg}">
        <span class="csm-notice-dot"></span>
        <span class="csm-notice-text">${escapePhoneAppHtml(statusTitle)}</span>
        <span class="csm-notice-badge">${escapePhoneAppHtml(statusBadge)}</span>
      </div>

    </div>
  `;
}

function buildCasinoWidgetMarkup({ targetState = state } = {}) {
  const casinoState = syncCasinoState(targetState);
  const chipBalance = getCasinoChipBalance(targetState);
  const cashBalance = getCasinoCashBalance(targetState);
  const scamActive = Boolean(casinoState.scam?.active);
  const roundActive = typeof hasActiveCasinoBlackjackRound === "function"
    ? hasActiveCasinoBlackjackRound(targetState)
    : false;
  const statusTone = scamActive
    ? "is-scam"
    : roundActive
      ? "is-live"
      : casinoState.usedToday
        ? "is-done"
        : "is-open";
  const statusText = scamActive
    ? "주의: 환전소 사기 이벤트가 진행 중입니다."
    : roundActive
      ? "블랙잭 라운드가 진행 중입니다."
      : casinoState.usedToday
        ? "오늘 이용 기록이 있어 보수적으로 운영됩니다."
        : "작은 화면에서는 잔액과 바로 가기만 표시합니다.";
  const statusMarkup = typeof buildPhoneAppStatusMarkup === "function"
    ? buildPhoneAppStatusMarkup("casino")
    : "";

  return `
    <section class="casino-compact-shell">
      <div class="casino-compact-head">
        <div class="casino-compact-kicker">CASINO</div>
        <div class="casino-compact-title">네온 카지노</div>
        <div class="casino-compact-note">작은 화면에서는 잔액과 게임 입장만 빠르게 확인합니다.</div>
      </div>
      ${statusMarkup}
      <div class="casino-compact-balance">
        <div class="casino-compact-balance-item">
          <span class="casino-compact-balance-label">현금</span>
          <strong class="casino-compact-balance-value">${escapePhoneAppHtml(formatMoney(cashBalance))}</strong>
        </div>
        <div class="casino-compact-balance-item is-chip">
          <span class="casino-compact-balance-label">칩</span>
          <strong class="casino-compact-balance-value">${escapePhoneAppHtml(formatMoney(chipBalance))}</strong>
        </div>
      </div>
      <div class="casino-compact-actions">
        ${buildPhoneRouteButtonMarkup({
          route: CASINO_ROUTES.exchange,
          label: "환전소",
          className: "casino-compact-action is-primary",
        })}
        ${buildPhoneRouteButtonMarkup({
          route: CASINO_ROUTES.blackjack,
          label: "블랙잭",
          className: "casino-compact-action",
        })}
        ${buildPhoneRouteButtonMarkup({
          route: CASINO_ROUTES.slots,
          label: "슬롯",
          className: "casino-compact-action",
        })}
      </div>
      <div class="casino-compact-status ${statusTone}">
        ${escapePhoneAppHtml(statusText)}
      </div>
    </section>
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
