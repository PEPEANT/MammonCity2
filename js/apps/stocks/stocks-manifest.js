function getStocksAppManifest(targetState = state) {
  const market = typeof getStockMarketSnapshot === "function"
    ? getStockMarketSnapshot(targetState)
    : null;

  return {
    id: "stocks",
    label: "증권",
    icon: "📈",
    openRoute: "stocks/home",
    installable: true,
    storeCategory: "재테크",
    storeDescription: "하루 한 번 시장을 확인하고 작은 승부를 걸 수 있습니다.",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => {
      const isUp        = market ? market.marketChangePercent >= 0 : true;
      const movText     = market ? escapePhoneAppHtml(market.movementText) : "—";
      const winPct      = market ? Math.round(market.successChance * 100) : 50;
      const winText     = `${winPct}%`;
      const volLabel    = market ? escapePhoneAppHtml(market.volatilityLabel) : "—";
      const trendLabel  = market ? escapePhoneAppHtml(market.marketTrend) : "—";
      const gainText    = market ? escapePhoneAppHtml(formatCash(market.gainAmount)) : "—";
      const lossText    = market ? escapePhoneAppHtml(formatCash(market.lossAmount)) : "—";
      const walletText  = typeof formatMoney === "function"
        ? escapePhoneAppHtml(formatMoney(targetState.money || 0))
        : "—";
      const alreadyTraded = Boolean(targetState.phoneUsedToday);
      const dayNum = escapePhoneAppHtml(String(targetState.day || 1));

      // 한국 주식 관행: 상승=빨강, 하락=파랑
      const upColor   = "#f4483a";
      const downColor = "#3b82f6";
      const tickerColor = isUp ? upColor : downColor;
      const tickerArrow = isUp ? "▲" : "▼";
      const winBarW   = Math.round(winPct);

      // 승률 바 색상
      const winBarColor = winPct >= 60 ? upColor : winPct >= 45 ? "#facc15" : downColor;

      const homeBtn = !stageMode
        ? `<button class="stk-home-btn" type="button" data-phone-action="close-phone-view">홈</button>`
        : "";

      return `
        <div class="stk-app">

          <!-- 앱 헤더 -->
          <div class="stk-header">
            <div class="stk-header-left">
              <div class="stk-header-logo">M</div>
              <div>
                <div class="stk-header-name">MAMMON 증권</div>
                <div class="stk-header-sub">DAY ${dayNum} · 장 열림</div>
              </div>
            </div>
            ${homeBtn}
          </div>

          <!-- 총 자산 카드 (포트폴리오 카드) -->
          <div class="stk-asset-card">
            <div class="stk-asset-wave" aria-hidden="true">
              <svg viewBox="0 0 200 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 45 L20 35 L50 42 L80 20 L110 30 L140 10 L170 22 L200 14 V60 H0Z"
                  fill="rgba(255,255,255,0.08)"/>
                <path d="M0 45 L20 35 L50 42 L80 20 L110 30 L140 10 L170 22 L200 14"
                  fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stk-asset-label">보유 현금</div>
            <div class="stk-asset-value">${walletText}</div>
            <div class="stk-asset-row">
              <span class="stk-asset-badge" style="color:${tickerColor}">
                ${tickerArrow} ${movText} &nbsp;·&nbsp; ${trendLabel}
              </span>
            </div>
          </div>

          <!-- 시장 지수 행 -->
          <div class="stk-index-strip">
            <div class="stk-index-item">
              <div class="stk-index-name">MAMMON IDX</div>
              <div class="stk-index-val" style="color:${tickerColor}">${tickerArrow} ${movText}</div>
            </div>
            <div class="stk-index-divider"></div>
            <div class="stk-index-item">
              <div class="stk-index-name">변동성</div>
              <div class="stk-index-val">${volLabel}</div>
            </div>
            <div class="stk-index-divider"></div>
            <div class="stk-index-item">
              <div class="stk-index-name">승률</div>
              <div class="stk-index-val" style="color:${winBarColor}">${winText}</div>
            </div>
          </div>

          <!-- 승률 프로그레스 바 -->
          <div class="stk-win-bar-wrap">
            <div class="stk-win-bar-track">
              <div class="stk-win-bar-fill" style="width:${winBarW}%;background:${winBarColor}"></div>
            </div>
            <div class="stk-win-bar-labels">
              <span>손실 리스크</span>
              <span>오늘 승률 ${winText}</span>
            </div>
          </div>

          <!-- 예상 손익 카드 -->
          <div class="stk-pnl-row">
            <div class="stk-pnl-card stk-pnl-gain">
              <div class="stk-pnl-label">예상 수익</div>
              <div class="stk-pnl-value">+${gainText}</div>
            </div>
            <div class="stk-pnl-card stk-pnl-loss">
              <div class="stk-pnl-label">예상 손실</div>
              <div class="stk-pnl-value">-${lossText}</div>
            </div>
          </div>

          <!-- 거래 버튼 -->
          <div class="stk-order-wrap">
            <button
              class="stk-order-btn${alreadyTraded ? " is-done" : isUp ? " is-up" : " is-down"}"
              type="button"
              data-phone-action="run-stocks-trade"
              ${alreadyTraded ? "disabled" : ""}
            >
              ${alreadyTraded
                ? "오늘 거래 완료"
                : `원터치 거래 실행`}
            </button>
            <div class="stk-order-note">하루 1회 · 결과는 즉시 반영됩니다</div>
          </div>

        </div>
      `;
    },
  };
}
