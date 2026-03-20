function getDisInternetTopics(targetState = state) {
  const locationLabel = typeof getCurrentLocationLabel === "function"
    ? getCurrentLocationLabel(targetState)
    : "배금시";
  const economy = typeof getTodayEconomy === "function"
    ? getTodayEconomy(targetState)
    : null;

  return [
    `${targetState.day}일차 생존 팁`,
    `${locationLabel} 실시간`,
    economy ? `물가 ${economy.priceIndex.toFixed(2)}` : "오늘 경제 지표",
    "오늘 공고 모아보기",
  ];
}

function getDisAppManifest(targetState = state) {
  return {
    id: "dis",
    label: "DIS 인터넷",
    icon: "🌐",
    openRoute: "dis/home",
    installable: false,
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => {
      const economy = typeof getTodayEconomy === "function"
        ? getTodayEconomy(targetState)
        : null;
      const stockMarket = typeof getStockMarketSnapshot === "function"
        ? getStockMarketSnapshot(targetState)
        : null;
      const economyHeadline = typeof getEconomyHeadline === "function"
        ? getEconomyHeadline(targetState)
        : "오늘 경제 지표를 불러오지 못했습니다.";
      const mealPrice = typeof getIndexedPrice === "function"
        ? getIndexedPrice(3500, targetState)
        : 3500;
      const topics = getDisInternetTopics(targetState);

      // 한국 주식 관행: 상승=빨강, 하락=파랑
      // 물가: 오르면 나쁨=빨강, 내리면 좋음=파랑
      const priceUp = economy ? economy.priceChangePercent > 0 : false;
      const priceArrow = economy
        ? (economy.priceChangePercent > 0 ? "▲" : economy.priceChangePercent < 0 ? "▼" : "—")
        : "—";
      const priceColor = priceUp ? "#f4483a" : "#3b82f6";

      // 주식 방향
      const mktUp = stockMarket ? stockMarket.marketChangePercent >= 0 : false;
      const mktArrow = stockMarket
        ? (stockMarket.marketChangePercent >= 0 ? "▲" : "▼")
        : "—";
      const mktColor = mktUp ? "#f4483a" : "#3b82f6";

      // 환율 방향
      const exArrow = economy
        ? (economy.exchangeChange > 0 ? "▲" : economy.exchangeChange < 0 ? "▼" : "—")
        : "—";

      const topicsHtml = topics
        .map((t) => `<span class="dis-tag">${escapePhoneAppHtml(t)}</span>`)
        .join("");

      const refreshButton = buildPhoneAppActionButtonMarkup({
        action: "refresh-dis-feed",
        label: "새로고침",
        className: "dis-refresh-btn",
      });

      return `
        ${buildPhoneAppScreenHeaderMarkup({
          kicker: "DIS INTERNET",
          title: "실시간 피드",
          note: "오늘 경제·물가·시장 흐름",
          showHomeButton: !stageMode,
        })}

        <div class="dis-headline-card">
          <div class="dis-headline-kicker">📰 오늘의 헤드라인</div>
          <div class="dis-headline-text">${escapePhoneAppHtml(economyHeadline)}</div>
        </div>

        <div class="dis-index-grid">
          <div class="dis-index-cell">
            <div class="dis-index-label">물가지수</div>
            <div class="dis-index-value" style="color:${priceColor}">${priceArrow} ${economy ? economy.priceIndex.toFixed(2) : "—"}</div>
            <div class="dis-index-sub">끼니 약 ${escapePhoneAppHtml(formatCash(mealPrice))}</div>
          </div>
          <div class="dis-index-cell">
            <div class="dis-index-label">주식지수</div>
            <div class="dis-index-value" style="color:${mktColor}">${mktArrow} ${stockMarket ? escapePhoneAppHtml(stockMarket.movementText) : "—"}</div>
            <div class="dis-index-sub">${stockMarket ? escapePhoneAppHtml(stockMarket.marketTrend) : "—"}</div>
          </div>
          <div class="dis-index-cell">
            <div class="dis-index-label">임금지수</div>
            <div class="dis-index-value">${economy ? escapePhoneAppHtml(`×${economy.wageMultiplier.toFixed(2)}`) : "—"}</div>
            <div class="dis-index-sub">${economy ? (economy.wageChangePercent > 0 ? `+${economy.wageChangePercent}%` : `${economy.wageChangePercent}%`) : "—"}</div>
          </div>
          <div class="dis-index-cell">
            <div class="dis-index-label">환율지수</div>
            <div class="dis-index-value">${exArrow} ${economy ? economy.exchangeIndex : "—"}</div>
            <div class="dis-index-sub">${economy ? (economy.exchangeChange === 0 ? "기준선" : `기준 ${economy.exchangeChange > 0 ? "+" : ""}${economy.exchangeChange}p`) : "—"}</div>
          </div>
        </div>

        <div class="dis-topic-section">
          <div class="dis-topic-label">실시간 키워드</div>
          <div class="dis-topics">${topicsHtml}</div>
          <div class="dis-refresh-row">${refreshButton}</div>
        </div>
      `;
    },
  };
}
