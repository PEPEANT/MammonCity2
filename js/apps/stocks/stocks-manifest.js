const STOCK_MARKET_GROUPS = Object.freeze([
  { id: "kr", label: "국내주식" },
  { id: "us", label: "미국주식" },
  { id: "leveraged", label: "레버리지" },
]);

const STOCK_MARKET_DEFINITIONS = Object.freeze([
  {
    symbol: "KR_SAMSUNG",
    market: "kr",
    name: "삼성전자",
    shortName: "삼성전자",
    code: "005930",
    badge: "국내",
    icon: "삼",
    basePrice: 74800,
    tick: 100,
    volatility: 0.0060,
    driftBias: 0.0001,
  },
  {
    symbol: "KR_HYNIX",
    market: "kr",
    name: "SK하이닉스",
    shortName: "하이닉스",
    code: "000660",
    badge: "국내",
    icon: "하",
    basePrice: 188000,
    tick: 500,
    volatility: 0.0085,
    driftBias: 0.0002,
  },
  {
    symbol: "KR_NAVER",
    market: "kr",
    name: "NAVER",
    shortName: "NAVER",
    code: "035420",
    badge: "국내",
    icon: "N",
    basePrice: 212000,
    tick: 500,
    volatility: 0.0070,
    driftBias: 0.00005,
  },
  {
    symbol: "US_NVDA",
    market: "us",
    name: "엔비디아",
    shortName: "NVDA",
    code: "NVDA",
    badge: "미국",
    icon: "N",
    basePrice: 176000,
    tick: 100,
    volatility: 0.0110,
    driftBias: 0.00025,
  },
  {
    symbol: "US_TSLA",
    market: "us",
    name: "테슬라",
    shortName: "TSLA",
    code: "TSLA",
    badge: "미국",
    icon: "T",
    basePrice: 348000,
    tick: 100,
    volatility: 0.0135,
    driftBias: -0.0001,
  },
  {
    symbol: "US_MSTR",
    market: "us",
    name: "Strategy",
    shortName: "Strategy",
    code: "MSTR",
    badge: "미국",
    icon: "S",
    basePrice: 486000,
    tick: 100,
    volatility: 0.0185,
    driftBias: 0.00035,
  },
  {
    symbol: "US_AAPL",
    market: "us",
    name: "애플",
    shortName: "AAPL",
    code: "AAPL",
    badge: "미국",
    icon: "A",
    basePrice: 314000,
    tick: 100,
    volatility: 0.0075,
    driftBias: 0.00015,
  },
  {
    symbol: "LEV_KR2X",
    market: "leveraged",
    name: "코스피 레버리지 2X",
    shortName: "KOSPI 2X",
    code: "2X",
    badge: "2배",
    icon: "2X",
    basePrice: 19300,
    tick: 10,
    volatility: 0.0150,
    driftBias: 0.0001,
  },
  {
    symbol: "LEV_MSTU",
    market: "leveraged",
    name: "MSTU 2X",
    shortName: "MSTU",
    code: "MSTU",
    badge: "MSTR 2배",
    icon: "MU",
    basePrice: 38200,
    tick: 50,
    volatility: 0.0200,
    driftBias: 0.0003,
  },
]);

function formatStockMarketMoney(amount = 0) {
  if (typeof formatTradingTerminalMoney === "function") {
    return formatTradingTerminalMoney(amount);
  }

  if (typeof formatMoney === "function") {
    return formatMoney(amount);
  }

  return `${Math.round(Number(amount) || 0).toLocaleString("ko-KR")}원`;
}

function formatStockMarketPrice(amount = 0) {
  return `${Math.round(Math.max(0, Number(amount) || 0)).toLocaleString("ko-KR")}원`;
}

function formatStockMarketSignedMoney(amount = 0) {
  const safeAmount = Number(amount) || 0;
  return `${safeAmount >= 0 ? "+" : "-"}${formatStockMarketMoney(Math.abs(safeAmount))}`;
}

function formatStockMarketSignedPercent(value = 0, digits = 2) {
  const safeValue = Number(value) || 0;
  return `${safeValue >= 0 ? "+" : ""}${safeValue.toFixed(digits)}%`;
}

function snapStockMarketPrice(price = 0, tick = 1) {
  const safeTick = Math.max(1, Number(tick) || 1);
  const safePrice = Math.max(safeTick, Number(price) || safeTick);
  return Math.round(safePrice / safeTick) * safeTick;
}

function createStockMarketCandles(basePrice = 1000, tick = 100, volatility = 0.01) {
  const candles = [];
  let price = snapStockMarketPrice(basePrice, tick);

  for (let index = 0; index < 30; index += 1) {
    const move = (Math.random() - 0.5) * volatility * 2;
    const open = price;
    const close = snapStockMarketPrice(open * (1 + move), tick);
    const high = snapStockMarketPrice(Math.max(open, close) * (1 + Math.random() * volatility * 0.55), tick);
    const low = snapStockMarketPrice(Math.max(tick, Math.min(open, close) * (1 - Math.random() * volatility * 0.55)), tick);
    candles.push({
      o: open,
      h: Math.max(open, close, high),
      l: Math.min(open, close, low),
      c: close,
    });
    price = close;
  }

  return candles;
}

function getStockMarketAppDefinitions(targetState = state) {
  const market = typeof getStockMarketSnapshot === "function"
    ? getStockMarketSnapshot(targetState)
    : null;
  const marketBias = typeof clampTradingTerminalValue === "function"
    ? clampTradingTerminalValue((market?.marketChangePercent || 0) / 100 / 40, -0.004, 0.004)
    : 0;

  return STOCK_MARKET_DEFINITIONS.map((definition) => {
    const marketMultiplier = definition.market === "leveraged"
      ? 1.75
      : definition.market === "us"
        ? 1.15
        : 1;

    return {
      ...definition,
      driftBias: (definition.driftBias || 0) + (marketBias * marketMultiplier),
      shockChance: definition.market === "leveraged" ? 0.08 : definition.market === "us" ? 0.06 : 0.04,
      shockMultiplier: definition.market === "leveraged" ? 4.4 : definition.market === "us" ? 3.0 : 2.2,
    };
  });
}

function createStockMarketAssetState(definition, targetState = state) {
  if (typeof buildMarketCycleAssetState === "function") {
    return buildMarketCycleAssetState({
      appId: "stock-market",
      definition,
      targetState,
      tick: definition.tick || 0,
      candleCount: 30,
    });
  }

  const candles = createStockMarketCandles(definition.basePrice, definition.tick, definition.volatility);
  const sessionOpen = candles[0]?.o || definition.basePrice;
  const lastCandle = candles[candles.length - 1];

  return {
    meta: { ...definition },
    price: lastCandle?.c || definition.basePrice,
    previousClose: sessionOpen,
    high24: Math.max(...candles.map((candle) => candle.h)),
    low24: Math.min(...candles.map((candle) => candle.l)),
    volume24: Math.round((definition.basePrice / Math.max(1, definition.tick)) * (Math.random() * 1000 + 400)),
    candles,
    trades: [],
    tickCount: candles.length,
  };
}

function ensureStockMarketAppState(targetState = state) {
  if (!targetState) {
    return null;
  }

  if (!targetState.stockMarketApp || typeof targetState.stockMarketApp !== "object") {
    targetState.stockMarketApp = {
      selectedGroup: "kr",
      selectedAsset: "",
      orderMode: "buy",
      draftQuantity: "",
      assets: {},
      holdings: {},
      lastSyncedTurn: 0,
    };
  }

  const app = targetState.stockMarketApp;
  const definitions = getStockMarketAppDefinitions(targetState);
  const currentTurn = typeof getMarketCycleTurnNumber === "function"
    ? getMarketCycleTurnNumber(targetState)
    : Math.max(1, Math.round(Number(targetState?.day) || 1));
  const shouldResyncAssets = app.lastSyncedTurn !== currentTurn;

  definitions.forEach((definition) => {
    if (!app.assets[definition.symbol] || shouldResyncAssets) {
      app.assets[definition.symbol] = createStockMarketAssetState(definition, targetState);
      return;
    }

    app.assets[definition.symbol].meta = { ...definition };
  });

  const validGroupIds = STOCK_MARKET_GROUPS.map((group) => group.id);
  if (!validGroupIds.includes(app.selectedGroup)) {
    app.selectedGroup = "kr";
  }

  app.orderMode = app.orderMode === "sell" ? "sell" : "buy";
  app.draftQuantity = String(app.draftQuantity || "").replace(/[^\d]/g, "");
  app.holdings = app.holdings && typeof app.holdings === "object"
    ? app.holdings
    : {};
  app.lastSyncedTurn = currentTurn;

  const visibleDefinitions = definitions.filter((definition) => definition.market === app.selectedGroup);
  if (!app.selectedAsset || !visibleDefinitions.some((definition) => definition.symbol === app.selectedAsset)) {
    app.selectedAsset = visibleDefinitions[0]?.symbol || definitions[0]?.symbol || "";
  }

  return app;
}

function getStockMarketSelectedAssetState(targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  return app?.assets?.[app.selectedAsset] || null;
}

function getStockMarketVisibleDefinitions(targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  if (!app) {
    return [];
  }

  return getStockMarketAppDefinitions(targetState)
    .filter((definition) => definition.market === app.selectedGroup);
}

function setStockMarketGroup(groupId, targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  if (!app || !STOCK_MARKET_GROUPS.some((group) => group.id === groupId)) {
    return false;
  }

  app.selectedGroup = groupId;
  const visibleDefinitions = getStockMarketVisibleDefinitions(targetState);
  if (!visibleDefinitions.some((definition) => definition.symbol === app.selectedAsset)) {
    app.selectedAsset = visibleDefinitions[0]?.symbol || app.selectedAsset;
  }
  return true;
}

function setStockMarketAsset(symbol, targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  const asset = app?.assets?.[symbol];
  if (!app || !asset) {
    return false;
  }

  app.selectedAsset = symbol;
  app.selectedGroup = asset.meta.market;
  return true;
}

function setStockMarketOrderMode(mode, targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  if (!app) {
    return false;
  }

  app.orderMode = mode === "sell" ? "sell" : "buy";
  return true;
}

function setStockMarketDraftQuantity(value, targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  if (!app) {
    return;
  }

  app.draftQuantity = String(value ?? "").replace(/[^\d]/g, "");
}

function getStockMarketDraftQuantity(targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  return Math.max(0, Math.floor(Number(app?.draftQuantity) || 0));
}

function setStockMarketQuickQuantity(percent, targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  const asset = getStockMarketSelectedAssetState(targetState);
  if (!app || !asset) {
    return 0;
  }

  const safePercent = typeof clampTradingTerminalValue === "function"
    ? clampTradingTerminalValue(Number(percent) || 0, 0, 1)
    : Math.max(0, Math.min(1, Number(percent) || 0));

  const walletBalance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : (targetState.money || 0);
  const holdingQty = Math.floor(Number(app.holdings?.[app.selectedAsset]?.qty) || 0);
  const maxQty = app.orderMode === "sell"
    ? holdingQty
    : Math.floor(walletBalance / Math.max(1, asset.price));
  const nextQty = Math.max(0, Math.floor(maxQty * safePercent));
  setStockMarketDraftQuantity(nextQty, targetState);
  return nextQty;
}

function calculateStockMarketHoldings(targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  if (!app) {
    return [];
  }

  const holdings = Object.entries(app.holdings)
    .map(([symbol, holding]) => {
      const asset = app.assets[symbol];
      if (!asset || !holding || !Number(holding.qty)) {
        return null;
      }

      const qty = Math.floor(Number(holding.qty) || 0);
      const avgPrice = Math.max(0, Math.floor(Number(holding.avgPrice) || asset.price));
      const currentValue = qty * asset.price;
      const costBasis = qty * avgPrice;
      const pnl = currentValue - costBasis;
      const returnRate = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      return {
        symbol,
        code: asset.meta.code,
        name: asset.meta.name,
        shortName: asset.meta.shortName,
        badge: asset.meta.badge,
        qty,
        avgPrice,
        currentValue,
        pnl,
        returnRate,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.currentValue - left.currentValue);

  const legacyHolding = getLegacyStockMarketHolding(targetState);
  if (legacyHolding) {
    holdings.push(legacyHolding);
  }

  return holdings.sort((left, right) => right.currentValue - left.currentValue);
}

function getLegacyStockMarketHolding(targetState = state) {
  const principal = Math.max(0, Math.round(Number(targetState?.stockHolding?.betAmount) || 0));
  if (principal <= 0) {
    return null;
  }

  const pnl = calculateStockMarketLegacyProfit(targetState);
  const currentValue = calculateStockMarketLegacyValue(targetState);

  return {
    symbol: "SEED",
    code: "SEED",
    name: "시드 주식 보유분",
    shortName: "시드",
    badge: "초기",
    qty: 1,
    avgPrice: principal,
    currentValue,
    pnl,
    returnRate: principal > 0 ? (pnl / principal) * 100 : 0,
  };
}

function calculateStockMarketLegacyProfit(targetState = state) {
  if (typeof calculateLegacyTradingProfit === "function") {
    return calculateLegacyTradingProfit("stocks", targetState);
  }

  return 0;
}

function calculateStockMarketLegacyValue(targetState = state) {
  if (typeof calculateLegacyTradingValue === "function") {
    return calculateLegacyTradingValue("stocks", targetState);
  }

  return 0;
}

function calculateStockMarketSummary(targetState = state) {
  const walletBalance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : (targetState.money || 0);
  const holdings = calculateStockMarketHoldings(targetState);
  const holdingsValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const holdingsProfit = holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  const openProfit = Math.round(holdingsProfit);
  const totalEquity = Math.round(walletBalance + holdingsValue);

  return {
    walletBalance,
    holdingsValue: Math.round(holdingsValue),
    openProfit,
    totalEquity,
    holdings,
  };
}

function tickStockMarketApp(targetState = state) {
  ensureStockMarketAppState(targetState);
}

function getStockMarketOrderBook(targetState = state) {
  const asset = getStockMarketSelectedAssetState(targetState);
  if (!asset) {
    return { asks: [], bids: [] };
  }

  const tick = asset.meta.tick || 100;
  const maxBookSize = asset.meta.market === "leveraged" ? 3000 : asset.meta.market === "us" ? 2200 : 1800;
  const asks = [];
  const bids = [];

  for (let level = 5; level >= 1; level -= 1) {
    asks.push({
      price: snapStockMarketPrice(asset.price + (tick * level), tick),
      size: typeof getMarketCycleBookSize === "function"
        ? getMarketCycleBookSize(
          ["stock-book", asset.meta.symbol, asset.cycleTurn || 0, "ask", level],
          30,
          maxBookSize + 30,
        )
        : Math.floor(Math.random() * maxBookSize) + 30,
    });
  }

  for (let level = 1; level <= 5; level += 1) {
    bids.push({
      price: snapStockMarketPrice(asset.price - (tick * level), tick),
      size: typeof getMarketCycleBookSize === "function"
        ? getMarketCycleBookSize(
          ["stock-book", asset.meta.symbol, asset.cycleTurn || 0, "bid", level],
          30,
          maxBookSize + 30,
        )
        : Math.floor(Math.random() * maxBookSize) + 30,
    });
  }

  const sizeMax = Math.max(1, ...asks.map((entry) => entry.size), ...bids.map((entry) => entry.size));

  return {
    asks: asks.map((entry) => ({
      ...entry,
      fill: Math.max(12, Math.round((entry.size / sizeMax) * 100)),
    })),
    bids: bids.map((entry) => ({
      ...entry,
      fill: Math.max(12, Math.round((entry.size / sizeMax) * 100)),
    })),
  };
}

function tradeStockMarket(side = "buy", targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  const asset = getStockMarketSelectedAssetState(targetState);
  if (!app || !asset) {
    return false;
  }

  const quantity = getStockMarketDraftQuantity(targetState);
  const walletBalance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : (targetState.money || 0);
  const totalAmount = quantity * asset.price;

  if (quantity < 1) {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("stocks", {
        kicker: "STOCK",
        title: "수량을 입력하세요",
        body: "최소 1주 이상부터 주문할 수 있습니다.",
        tone: "fail",
      }, targetState);
    }
    return false;
  }

  if (side === "buy") {
    if (totalAmount > walletBalance) {
      if (typeof setPhoneAppStatus === "function") {
        setPhoneAppStatus("stocks", {
          kicker: "STOCK",
          title: "주문 가능 금액 부족",
          body: "주문 가능 현금보다 큰 수량은 살 수 없습니다.",
          tone: "fail",
        }, targetState);
      }
      return false;
    }

    if (typeof spendCash === "function" && !spendCash(totalAmount, targetState)) {
      return false;
    }

    const current = app.holdings[app.selectedAsset] || { qty: 0, avgPrice: asset.price };
    const totalQty = Math.floor(current.qty || 0) + quantity;
    const totalCost = (Math.floor(current.qty || 0) * Math.floor(current.avgPrice || asset.price)) + totalAmount;
    app.holdings[app.selectedAsset] = {
      qty: totalQty,
      avgPrice: totalQty > 0 ? Math.floor(totalCost / totalQty) : asset.price,
    };

    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("stocks", {
        kicker: "STOCK BUY",
        title: `${asset.meta.name} ${quantity.toLocaleString("ko-KR")}주 매수`,
        body: `${formatStockMarketMoney(totalAmount)} 주문을 넣었습니다.`,
        tone: "success",
      }, targetState);
    }
    if (typeof showMoneyEffect === "function" && targetState === state) {
      showMoneyEffect(-totalAmount);
    }
    return true;
  }

  const holding = app.holdings[app.selectedAsset];
  if (!holding || holding.qty < quantity) {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("stocks", {
        kicker: "STOCK SELL",
        title: "보유 주식 부족",
        body: "입력한 수량만큼 보유하고 있지 않습니다.",
        tone: "fail",
      }, targetState);
    }
    return false;
  }

  const realizedCost = quantity * Math.floor(holding.avgPrice || asset.price);
  const realizedPnl = totalAmount - realizedCost;
  holding.qty -= quantity;
  if (holding.qty <= 0) {
    delete app.holdings[app.selectedAsset];
  }

  if (typeof earnCash === "function") {
    earnCash(totalAmount, targetState);
  } else {
    targetState.money += totalAmount;
  }

  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("stocks", {
      kicker: "STOCK SELL",
      title: `${asset.meta.name} ${quantity.toLocaleString("ko-KR")}주 매도`,
      body: `${formatStockMarketMoney(totalAmount)} 수령 · 손익 ${formatStockMarketSignedMoney(realizedPnl)}`,
      tone: realizedPnl >= 0 ? "success" : "fail",
    }, targetState);
  }
  if (typeof showMoneyEffect === "function" && targetState === state) {
    showMoneyEffect(totalAmount);
  }
  return true;
}

function buildStockMarketCandlesMarkup(targetState = state) {
  const asset = getStockMarketSelectedAssetState(targetState);
  const candles = asset?.candles || [];
  if (!candles.length) {
    return '<div class="stock-market-empty">차트를 불러오는 중입니다.</div>';
  }

  const maxHigh = Math.max(...candles.map((candle) => candle.h));
  const minLow = Math.min(...candles.map((candle) => candle.l));
  const range = Math.max(1, maxHigh - minLow);

  return candles.map((candle) => {
    const bodyTop = Math.max(candle.o, candle.c);
    const bodyBottom = Math.min(candle.o, candle.c);
    const wickBottom = ((candle.l - minLow) / range) * 100;
    const wickHeight = ((candle.h - candle.l) / range) * 100;
    const bodyBottomPercent = ((bodyBottom - minLow) / range) * 100;
    const bodyHeight = Math.max(2, ((bodyTop - bodyBottom) / range) * 100);
    const toneClass = candle.c > candle.o ? "is-up" : candle.c < candle.o ? "is-down" : "is-flat";

    return `
      <span
        class="stock-market-candle ${toneClass}"
        style="
          --wick-bottom:${wickBottom}%;
          --wick-height:${wickHeight}%;
          --body-bottom:${bodyBottomPercent}%;
          --body-height:${bodyHeight}%;
        "
      ></span>
    `;
  }).join("");
}

function buildStockMarketCompactMarkup(targetState = state) {
  const summary = calculateStockMarketSummary(targetState);
  const profit = summary.openProfit;
  const holdingsCount = summary.holdings.length;

  return `
    <div class="trade-summary-app stock-market-summary">
      <div class="trade-summary-grid is-compact-stack">
        <section class="trade-summary-card">
          <span class="trade-summary-label">현재 돈</span>
          <strong class="trade-summary-value">${escapePhoneAppHtml(formatStockMarketMoney(summary.walletBalance))}</strong>
        </section>
        <section class="trade-summary-card ${profit >= 0 ? "is-up" : "is-down"}">
          <span class="trade-summary-label">현재 수익</span>
          <strong class="trade-summary-value">${escapePhoneAppHtml(formatStockMarketSignedMoney(profit))}</strong>
        </section>
        <section class="trade-summary-card is-holdings">
          <span class="trade-summary-label">보유종목</span>
          <strong class="trade-summary-value">${escapePhoneAppHtml(`${holdingsCount}개 종목`)}</strong>
        </section>
      </div>
    </div>
  `;
}

function buildStockMarketStageMarkup(targetState = state) {
  const app = ensureStockMarketAppState(targetState);
  const asset = getStockMarketSelectedAssetState(targetState);
  if (!app || !asset) {
    return '<div class="stock-market-empty">주식 앱을 불러오지 못했습니다.</div>';
  }

  const summary = calculateStockMarketSummary(targetState);
  const visibleDefinitions = getStockMarketVisibleDefinitions(targetState);
  const orderBook = getStockMarketOrderBook(targetState);
  const changeAmount = asset.price - asset.previousClose;
  const changePercent = (changeAmount / Math.max(1, asset.previousClose)) * 100;
  const changeTone = changeAmount > 0 ? "is-up" : changeAmount < 0 ? "is-down" : "is-flat";
  const quantity = getStockMarketDraftQuantity(targetState);
  const estimatedAmount = quantity * asset.price;
  const orderModeLabel = app.orderMode === "sell" ? "판매" : "구매";
  const recentTrades = asset.trades.slice(0, 6);

  const holdingsMarkup = summary.holdings.length
    ? summary.holdings.map((holding) => `
      <div class="stock-market-holding-item">
        <div class="stock-market-holding-copy">
          <div class="stock-market-holding-name">${escapePhoneAppHtml(holding.name)}</div>
          <div class="stock-market-holding-meta">${escapePhoneAppHtml(`${holding.qty.toLocaleString("ko-KR")}주 · 평단 ${formatStockMarketPrice(holding.avgPrice)}`)}</div>
        </div>
        <div class="stock-market-holding-side">
          <div class="stock-market-holding-value">${escapePhoneAppHtml(formatStockMarketMoney(holding.currentValue))}</div>
          <div class="stock-market-holding-profit ${holding.pnl >= 0 ? "is-up" : "is-down"}">${escapePhoneAppHtml(`${formatStockMarketSignedMoney(holding.pnl)} (${formatStockMarketSignedPercent(holding.returnRate, 1)})`)}</div>
        </div>
      </div>
    `).join("")
    : '<div class="stock-market-empty">보유한 주식이 없어요.</div>';

  return `
    <div class="stock-market-stage">
      <section class="stock-market-header-card">
        <div class="stock-market-header-top">
          <div>
            <div class="stock-market-header-title">주식</div>
          </div>
          <div class="stock-market-wallet-pill">
            <span>주문 가능</span>
            <strong>${escapePhoneAppHtml(formatStockMarketMoney(summary.walletBalance))}</strong>
          </div>
        </div>
        <div class="stock-market-group-tabs">
          ${STOCK_MARKET_GROUPS.map((group) => `
            <button
              class="stock-market-group-tab ${app.selectedGroup === group.id ? "is-active" : ""}"
              type="button"
              data-phone-action="stock-market-set-group"
              data-group="${escapePhoneAppHtml(group.id)}"
            >${escapePhoneAppHtml(group.label)}</button>
          `).join("")}
        </div>
      </section>

      <section class="stock-market-asset-strip">
        ${visibleDefinitions.map((definition) => `
          <button
            class="stock-market-asset-chip ${app.selectedAsset === definition.symbol ? "is-active" : ""}"
            type="button"
            data-phone-action="stock-market-set-asset"
            data-asset="${escapePhoneAppHtml(definition.symbol)}"
          >
            <span class="stock-market-asset-chip-name">${escapePhoneAppHtml(definition.shortName)}</span>
            <span class="stock-market-asset-chip-meta">${escapePhoneAppHtml(`${definition.code} · ${definition.badge}`)}</span>
          </button>
        `).join("")}
      </section>

      <section class="stock-market-price-card">
        <div class="stock-market-price-top">
          <div>
            <div class="stock-market-price-name">${escapePhoneAppHtml(asset.meta.name)}</div>
            <div class="stock-market-price-sub">${escapePhoneAppHtml(`${asset.meta.code} · ${asset.meta.badge}`)}</div>
          </div>
          <span class="stock-market-price-badge ${changeTone}">${escapePhoneAppHtml(asset.meta.market === "leveraged" ? "고변동" : asset.meta.market === "us" ? "미국장" : "국내장")}</span>
        </div>
        <div class="stock-market-price-value ${changeTone}">${escapePhoneAppHtml(formatStockMarketPrice(asset.price))}</div>
        <div class="stock-market-price-change ${changeTone}">${escapePhoneAppHtml(`${changeAmount >= 0 ? "▲" : "▼"} ${formatStockMarketPrice(Math.abs(changeAmount))} (${formatStockMarketSignedPercent(changePercent)})`)}</div>
        <div class="stock-market-mini-stats">
          <span>고가 ${escapePhoneAppHtml(formatStockMarketPrice(asset.high24))}</span>
          <span>저가 ${escapePhoneAppHtml(formatStockMarketPrice(asset.low24))}</span>
          <span>거래량 ${escapePhoneAppHtml(asset.volume24.toLocaleString("ko-KR"))}</span>
        </div>
      </section>

      <section class="stock-market-order-card">
        <div class="stock-market-section-head">
          <h3>${escapePhoneAppHtml(`${orderModeLabel} 주문`)}</h3>
          <span>${escapePhoneAppHtml(quantity > 0 ? formatStockMarketMoney(estimatedAmount) : "수량 입력")}</span>
        </div>
        <div class="stock-market-order-mode">
          <button class="stock-market-order-mode-btn ${app.orderMode === "buy" ? "is-active is-buy" : ""}" type="button" data-phone-action="stock-market-set-order-mode" data-mode="buy">구매</button>
          <button class="stock-market-order-mode-btn ${app.orderMode === "sell" ? "is-active is-sell" : ""}" type="button" data-phone-action="stock-market-set-order-mode" data-mode="sell">판매</button>
        </div>
        <div class="stock-market-order-input-wrap">
          <input
            class="stock-market-order-input"
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
            placeholder="${escapePhoneAppHtml(app.orderMode === "buy" ? "몇 주 구매할까요?" : "몇 주 판매할까요?")}"
            value="${escapePhoneAppHtml(String(app.draftQuantity || ""))}"
            data-stock-qty-input
          />
          <span class="stock-market-order-unit">주</span>
        </div>
        <div class="stock-market-quick-row">
          <button class="stock-market-quick-btn" type="button" data-phone-action="stock-market-set-pct" data-pct="0.1">10%</button>
          <button class="stock-market-quick-btn" type="button" data-phone-action="stock-market-set-pct" data-pct="0.25">25%</button>
          <button class="stock-market-quick-btn" type="button" data-phone-action="stock-market-set-pct" data-pct="0.5">50%</button>
          <button class="stock-market-quick-btn is-max" type="button" data-phone-action="stock-market-set-pct" data-pct="1">최대</button>
        </div>
        <button class="stock-market-submit-btn ${app.orderMode === "buy" ? "is-buy" : "is-sell"}" type="button" data-phone-action="stock-market-submit">${escapePhoneAppHtml(app.orderMode === "buy" ? "구매하기" : "판매하기")}</button>
      </section>

      <section class="stock-market-chart-card">
        <div class="stock-market-section-head">
          <h3>차트</h3>
          <span>실시간 변동</span>
        </div>
        <div class="stock-market-chart-panel">
          <div class="stock-market-chart-grid">${buildStockMarketCandlesMarkup(targetState)}</div>
        </div>
      </section>

      <section class="stock-market-asset-card">
        <div class="stock-market-section-head">
          <h3>내 자산</h3>
          <span>평가 손익 반영</span>
        </div>
        <div class="stock-market-balance-panel">
          <div class="stock-market-balance-item">
            <span>총 자산</span>
            <strong>${escapePhoneAppHtml(formatStockMarketMoney(summary.totalEquity))}</strong>
          </div>
          <div class="stock-market-balance-item">
            <span>현재 수익</span>
            <strong class="${summary.openProfit >= 0 ? "is-up" : "is-down"}">${escapePhoneAppHtml(formatStockMarketSignedMoney(summary.openProfit))}</strong>
          </div>
        </div>
      </section>

      <section class="stock-market-holdings-card">
        <div class="stock-market-section-head">
          <h3>보유 주식</h3>
          <span>${escapePhoneAppHtml(`${summary.holdings.length}개 종목`)}</span>
        </div>
        <div class="stock-market-holdings-list">${holdingsMarkup}</div>
      </section>

      <section class="stock-market-book-card">
        <div class="stock-market-section-head">
          <h3>현재 호가</h3>
          <span>매도 / 매수</span>
        </div>
        <div class="stock-market-book-grid">
          <div class="stock-market-book-side is-ask">
            ${orderBook.asks.map((entry) => `
              <div class="stock-market-book-row is-ask">
                <div class="stock-market-book-fill" style="width:${entry.fill}%"></div>
                <span class="stock-market-book-price">${escapePhoneAppHtml(formatStockMarketPrice(entry.price))}</span>
                <span class="stock-market-book-size">${escapePhoneAppHtml(entry.size.toLocaleString("ko-KR"))}</span>
              </div>
            `).join("")}
          </div>
          <div class="stock-market-book-side is-bid">
            ${orderBook.bids.map((entry) => `
              <div class="stock-market-book-row is-bid">
                <div class="stock-market-book-fill" style="width:${entry.fill}%"></div>
                <span class="stock-market-book-price">${escapePhoneAppHtml(formatStockMarketPrice(entry.price))}</span>
                <span class="stock-market-book-size">${escapePhoneAppHtml(entry.size.toLocaleString("ko-KR"))}</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="stock-market-trade-tape">
          ${recentTrades.length
            ? recentTrades.map((trade) => `
              <span class="stock-market-trade-chip ${trade.side === "buy" ? "is-up" : "is-down"}">
                ${escapePhoneAppHtml(`${formatStockMarketPrice(trade.price)} · ${trade.size.toLocaleString("ko-KR")}주`)}
              </span>
            `).join("")
            : '<span class="stock-market-trade-chip">체결 대기</span>'}
        </div>
      </section>
    </div>
  `;
}

function handleStockMarketAction(phoneAction, actionTarget) {
  if (phoneAction === "stock-market-set-group") {
    setStockMarketGroup(actionTarget?.dataset.group, state);
    renderGame();
    return true;
  }

  if (phoneAction === "stock-market-set-asset") {
    setStockMarketAsset(actionTarget?.dataset.asset, state);
    renderGame();
    return true;
  }

  if (phoneAction === "stock-market-set-order-mode") {
    setStockMarketOrderMode(actionTarget?.dataset.mode, state);
    renderGame();
    return true;
  }

  if (phoneAction === "stock-market-set-pct") {
    setStockMarketQuickQuantity(Number(actionTarget?.dataset.pct) || 0, state);
    renderGame();
    return true;
  }

  if (phoneAction === "stock-market-submit") {
    const app = ensureStockMarketAppState(state);
    tradeStockMarket(app?.orderMode || "buy", state);
    renderGame();
    return true;
  }

  return false;
}

function getStocksAppManifest(targetState = state) {
  return {
    id: "stocks",
    label: "증권",
    icon: "📈",
    openRoute: "stocks/home",
    installable: true,
    storeCategory: "재테크",
    storeDescription: "주식 거래 앱",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => (
      stageMode
        ? buildStockMarketStageMarkup(targetState)
        : buildStockMarketCompactMarkup(targetState)
    ),
  };
}
