const TRADING_TERMINAL_STOCK_DEFINITIONS = [
  {
    symbol: "MAMM",
    name: "맘몬중공업",
    icon: "🏢",
    basePrice: 98600,
    volatility: 0.008,
    driftBias: 0.0004,
  },
  {
    symbol: "BGRT",
    name: "배금리테일",
    icon: "🛒",
    basePrice: 43200,
    volatility: 0.010,
    driftBias: 0.0001,
  },
  {
    symbol: "METR",
    name: "메트로모빌",
    icon: "🚉",
    basePrice: 167000,
    volatility: 0.007,
    driftBias: -0.0001,
  },
];

const TRADING_TERMINAL_COIN_BASE_PRICES = Object.freeze({
  DICE: 1250,
  MAMC: 14800,
  DIAB: 6900,
  MOON: 3100,
});

let tradingTerminalTickerId = null;

function clampTradingTerminalValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatTradingTerminalMoney(amount = 0) {
  if (typeof formatMoney === "function") {
    return formatMoney(amount);
  }

  return `${Math.round(Number(amount) || 0).toLocaleString("ko-KR")}원`;
}

function formatTradingTerminalPrice(price = 0) {
  const safePrice = Math.max(0, Number(price) || 0);
  if (safePrice >= 1000) {
    return Math.round(safePrice).toLocaleString("ko-KR");
  }

  return safePrice.toFixed(2);
}

function formatTradingTerminalSignedPrice(price = 0) {
  const safePrice = Number(price) || 0;
  const absolute = Math.abs(safePrice);
  const formatted = formatTradingTerminalPrice(absolute);
  return `${safePrice >= 0 ? "+" : "-"}${formatted}`;
}

function formatTradingTerminalSignedPercent(value = 0) {
  const safeValue = Number(value) || 0;
  return `${safeValue >= 0 ? "+" : ""}${safeValue.toFixed(2)}%`;
}

function formatTradingTerminalSize(appId, value = 0) {
  const safeValue = Math.max(0, Number(value) || 0);
  if (appId === "stocks") {
    return safeValue.toFixed(0);
  }

  if (safeValue >= 100) {
    return safeValue.toFixed(1);
  }

  return safeValue.toFixed(3);
}

function createTradingTerminalCandles(basePrice = 1000, volatility = 0.01) {
  const candles = [];
  let price = Math.max(1, Number(basePrice) || 1);

  for (let index = 0; index < 32; index += 1) {
    const move = (Math.random() - 0.5) * volatility * 2;
    const open = price;
    const close = Math.max(1, open * (1 + move));
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.55);
    const low = Math.max(1, Math.min(open, close) * (1 - Math.random() * volatility * 0.55));
    candles.push({
      o: open,
      h: high,
      l: low,
      c: close,
    });
    price = close;
  }

  return candles;
}

function getTradingTerminalAssetDefinitions(appId, targetState = state) {
  if (appId === "coin") {
    const coinEntries = typeof COIN_TYPES !== "undefined"
      ? Object.entries(COIN_TYPES).sort(([left], [right]) => {
        if (left === "DICE") return -1;
        if (right === "DICE") return 1;
        return 0;
      })
      : [["DICE", {
        symbol: "DICE",
        label: "다이스 코인",
        emoji: "🎲",
        volatility: 14,
      }]];

    return coinEntries.map(([symbol, info]) => {
      const snapshot = typeof getCoinMarketSnapshot === "function"
        ? getCoinMarketSnapshot(symbol, targetState)
        : null;
      return {
        symbol,
        name: info.label,
        icon: info.emoji,
        basePrice: TRADING_TERMINAL_COIN_BASE_PRICES[symbol] || 1000,
        volatility: clampTradingTerminalValue((Number(info.volatility) || 3) * 0.0018, 0.005, 0.032),
        driftBias: clampTradingTerminalValue((snapshot?.returnRate || 0) / 120, -0.005, 0.005),
        shockChance: symbol === "DICE" ? 0.11 : 0.05,
        shockMultiplier: symbol === "DICE" ? 5.2 : 3.2,
      };
    });
  }

  const market = typeof getStockMarketSnapshot === "function"
    ? getStockMarketSnapshot(targetState)
    : null;
  const marketBias = clampTradingTerminalValue((market?.marketChangePercent || 0) / 100 / 28, -0.004, 0.004);

  return TRADING_TERMINAL_STOCK_DEFINITIONS.map((definition) => ({
    ...definition,
    driftBias: clampTradingTerminalValue(definition.driftBias + marketBias, -0.004, 0.004),
    shockChance: 0.04,
    shockMultiplier: 2.4,
  }));
}

function createTradingTerminalAssetState(definition) {
  const basePrice = Math.max(1, Number(definition.basePrice) || 1);
  const candles = createTradingTerminalCandles(basePrice, definition.volatility);
  const lastCandle = candles[candles.length - 1];
  const sessionOpen = candles[0]?.o || basePrice;
  return {
    meta: { ...definition },
    price: lastCandle?.c || basePrice,
    previousClose: sessionOpen,
    high24: Math.max(...candles.map((candle) => candle.h)),
    low24: Math.min(...candles.map((candle) => candle.l)),
    volume24: Math.round(basePrice * (Math.random() * 280 + 120)),
    candles,
    trades: [],
    tickCount: candles.length,
  };
}

function ensureTradingTerminalState(appId, targetState = state) {
  if (!targetState) {
    return null;
  }

  const normalizedAppId = typeof normalizePhoneAppId === "function"
    ? normalizePhoneAppId(appId)
    : String(appId || "");

  if (!normalizedAppId || !["stocks", "coin"].includes(normalizedAppId)) {
    return null;
  }

  if (!targetState.marketTerminals || typeof targetState.marketTerminals !== "object") {
    targetState.marketTerminals = {};
  }

  if (!targetState.marketTerminals[normalizedAppId] || typeof targetState.marketTerminals[normalizedAppId] !== "object") {
    targetState.marketTerminals[normalizedAppId] = {
      appId: normalizedAppId,
      mode: "spot",
      selectedAsset: "",
      chartOpen: true,
      draftAmount: "",
      leverage: normalizedAppId === "coin" ? 10 : 5,
      spotHoldings: {},
      futuresPositions: [],
      nextPositionId: 1,
      assets: {},
    };
  }

  const terminal = targetState.marketTerminals[normalizedAppId];
  const definitions = getTradingTerminalAssetDefinitions(normalizedAppId, targetState);

  definitions.forEach((definition) => {
    if (!terminal.assets[definition.symbol]) {
      terminal.assets[definition.symbol] = createTradingTerminalAssetState(definition);
      return;
    }
    terminal.assets[definition.symbol].meta = { ...definition };
  });

  if (!terminal.selectedAsset || !terminal.assets[terminal.selectedAsset]) {
    terminal.selectedAsset = definitions[0]?.symbol || "";
  }

  terminal.mode = terminal.mode === "futures" ? "futures" : "spot";
  terminal.chartOpen = terminal.chartOpen !== false;
  terminal.draftAmount = String(terminal.draftAmount || "");
  terminal.leverage = clampTradingTerminalValue(Math.round(Number(terminal.leverage) || 5), 1, 50);
  terminal.spotHoldings = terminal.spotHoldings && typeof terminal.spotHoldings === "object"
    ? terminal.spotHoldings
    : {};
  terminal.futuresPositions = Array.isArray(terminal.futuresPositions)
    ? terminal.futuresPositions
    : [];
  terminal.nextPositionId = Math.max(1, Math.round(Number(terminal.nextPositionId) || 1));

  return terminal;
}

function getTradingTerminalAssetState(appId, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  return terminal?.assets?.[terminal.selectedAsset] || null;
}

function getTradingTerminalSpotHoldings(appId, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  if (!terminal) {
    return [];
  }

  return Object.entries(terminal.spotHoldings)
    .map(([symbol, holding]) => {
      const asset = terminal.assets[symbol];
      if (!asset || !holding || !Number(holding.qty)) {
        return null;
      }

      const qty = Number(holding.qty) || 0;
      const avgPrice = Number(holding.avgPrice) || asset.price;
      const currentValue = qty * asset.price;
      const cost = qty * avgPrice;
      const pnl = currentValue - cost;

      return {
        symbol,
        name: asset.meta.name,
        icon: asset.meta.icon,
        qty,
        avgPrice,
        currentValue,
        pnl,
      };
    })
    .filter(Boolean);
}

function getTradingTerminalFuturesPositions(appId, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  if (!terminal) {
    return [];
  }

  return terminal.futuresPositions
    .map((position) => {
      const asset = terminal.assets[position.symbol];
      if (!asset) {
        return null;
      }

      const direction = position.side === "short" ? -1 : 1;
      const priceDelta = (asset.price - position.entryPrice) / position.entryPrice;
      const roe = priceDelta * position.leverage * direction;
      const pnl = position.margin * roe;

      return {
        ...position,
        currentPrice: asset.price,
        pnl,
        roe,
      };
    })
    .filter(Boolean);
}

function calculateLegacyTradingProfit(appId, targetState = state) {
  if (appId === "stocks" && targetState.stockHolding) {
    const market = typeof getStockMarketSnapshot === "function"
      ? getStockMarketSnapshot(targetState)
      : null;
    const returnRate = market?.stockDailyReturnRate || 0;
    return Math.round(targetState.stockHolding.betAmount * returnRate);
  }

  if (appId === "coin" && targetState.coinHolding) {
    const returnRate = typeof getCoinDailyReturnRate === "function"
      ? getCoinDailyReturnRate(targetState.coinHolding.coinType, targetState)
      : 0;
    return Math.round(targetState.coinHolding.betAmount * returnRate);
  }

  return 0;
}

function calculateLegacyTradingValue(appId, targetState = state) {
  if (appId === "stocks" && targetState.stockHolding) {
    const market = typeof getStockMarketSnapshot === "function"
      ? getStockMarketSnapshot(targetState)
      : null;
    const returnRate = market?.stockDailyReturnRate || 0;
    return Math.round(targetState.stockHolding.betAmount * (1 + returnRate));
  }

  if (appId === "coin" && targetState.coinHolding) {
    const returnRate = typeof getCoinDailyReturnRate === "function"
      ? getCoinDailyReturnRate(targetState.coinHolding.coinType, targetState)
      : 0;
    return Math.round(targetState.coinHolding.betAmount * (1 + returnRate));
  }

  return 0;
}

function calculateTradingTerminalSummary(appId, targetState = state) {
  const walletBalance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : (targetState.money || 0);
  const spotHoldings = getTradingTerminalSpotHoldings(appId, targetState);
  const futuresPositions = getTradingTerminalFuturesPositions(appId, targetState);
  const spotValue = spotHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const spotPnl = spotHoldings.reduce((sum, holding) => sum + holding.pnl, 0);
  const futuresPnl = futuresPositions.reduce((sum, position) => sum + position.pnl, 0);
  const legacyProfit = calculateLegacyTradingProfit(appId, targetState);
  const legacyValue = calculateLegacyTradingValue(appId, targetState);
  const openProfit = Math.round(spotPnl + futuresPnl + legacyProfit);
  const totalEquity = Math.round(walletBalance + spotValue + legacyValue + futuresPnl);

  return {
    walletBalance,
    spotValue: Math.round(spotValue),
    futuresPnl: Math.round(futuresPnl),
    legacyProfit: Math.round(legacyProfit),
    legacyValue: Math.round(legacyValue),
    openProfit,
    totalEquity,
    spotHoldings,
    futuresPositions,
  };
}

function createTradingTerminalTrade(assetState, appId, sideHint = "") {
  const side = sideHint || (Math.random() > 0.5 ? "buy" : "sell");
  const size = appId === "stocks"
    ? Math.max(1, Math.round(Math.random() * 160))
    : Math.max(0.05, Number((Math.random() * 8).toFixed(3)));
  return {
    id: Date.now() + Math.random(),
    price: assetState.price,
    side,
    size,
  };
}

function tickTradingTerminal(appId, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  if (!terminal) {
    return;
  }

  Object.values(terminal.assets).forEach((assetState) => {
    const { meta } = assetState;
    const randomMove = (Math.random() - 0.5) * meta.volatility * 1.8;
    const shockTriggered = Math.random() < (meta.shockChance || 0.04);
    const shockMove = shockTriggered
      ? (Math.random() - 0.5) * meta.volatility * (meta.shockMultiplier || 3)
      : 0;
    const move = clampTradingTerminalValue(randomMove + (meta.driftBias || 0) + shockMove, -0.18, 0.18);
    const nextPrice = Math.max(1, assetState.price * (1 + move));
    assetState.tickCount += 1;
    assetState.price = nextPrice;
    assetState.high24 = Math.max(assetState.high24, nextPrice);
    assetState.low24 = Math.min(assetState.low24, nextPrice);
    assetState.volume24 += Math.round(Math.abs(move) * meta.basePrice * (Math.random() * 40 + 8));

    const candles = assetState.candles;
    if (!candles.length || assetState.tickCount % 3 === 0) {
      candles.push({
        o: nextPrice,
        h: nextPrice,
        l: nextPrice,
        c: nextPrice,
      });
      if (candles.length > 36) {
        candles.shift();
      }
    } else {
      const candle = candles[candles.length - 1];
      candle.c = nextPrice;
      candle.h = Math.max(candle.h, nextPrice);
      candle.l = Math.min(candle.l, nextPrice);
    }

    if (Math.random() > 0.26) {
      assetState.trades.unshift(createTradingTerminalTrade(assetState, appId, move >= 0 ? "buy" : "sell"));
      assetState.trades = assetState.trades.slice(0, 14);
    }
  });

  const survivingPositions = [];
  let liquidationMessage = "";

  terminal.futuresPositions.forEach((position) => {
    const asset = terminal.assets[position.symbol];
    if (!asset) {
      return;
    }

    const direction = position.side === "short" ? -1 : 1;
    const priceDelta = (asset.price - position.entryPrice) / position.entryPrice;
    const roe = priceDelta * position.leverage * direction;
    const equityLeft = position.margin * (1 + roe);

    if (equityLeft <= position.margin * 0.05) {
      liquidationMessage = `${position.symbol} ${position.side === "short" ? "숏" : "롱"} 포지션이 강제청산되었습니다.`;
      return;
    }

    survivingPositions.push(position);
  });

  terminal.futuresPositions = survivingPositions;

  if (liquidationMessage && typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus(appId, {
      kicker: "LIQUIDATION",
      title: "선물 포지션 정리",
      body: liquidationMessage,
      tone: "fail",
    }, targetState);
  }
}

function getTradingTerminalOrderBook(appId, targetState = state) {
  const asset = getTradingTerminalAssetState(appId, targetState);
  if (!asset) {
    return { asks: [], bids: [] };
  }

  const spreadBase = appId === "coin"
    ? Math.max(asset.price * 0.0022, 0.5)
    : Math.max(asset.price * 0.0012, 10);
  const asks = [];
  const bids = [];

  for (let level = 6; level >= 1; level -= 1) {
    const askPrice = asset.price + spreadBase * level;
    const bidPrice = Math.max(1, asset.price - spreadBase * level);
    const askSize = appId === "stocks"
      ? Math.round(Math.random() * 140 + 12)
      : Number((Math.random() * 7 + 0.2).toFixed(3));
    const bidSize = appId === "stocks"
      ? Math.round(Math.random() * 140 + 12)
      : Number((Math.random() * 7 + 0.2).toFixed(3));

    asks.push({ price: askPrice, size: askSize });
    bids.push({ price: bidPrice, size: bidSize });
  }

  return { asks, bids };
}

function setTradingTerminalDraftAmount(appId, nextValue, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  if (!terminal) {
    return;
  }

  terminal.draftAmount = String(nextValue ?? "").replace(/[^\d]/g, "");
}

function getTradingTerminalDraftAmount(appId, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  return Math.floor(Number(terminal?.draftAmount) || 0);
}

function setTradingTerminalMode(appId, mode, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  if (!terminal) {
    return false;
  }

  terminal.mode = mode === "futures" ? "futures" : "spot";
  return true;
}

function setTradingTerminalAsset(appId, symbol, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  if (!terminal || !terminal.assets[symbol]) {
    return false;
  }

  terminal.selectedAsset = symbol;
  return true;
}

function toggleTradingTerminalChart(appId, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  if (!terminal) {
    return false;
  }

  terminal.chartOpen = !terminal.chartOpen;
  return true;
}

function setTradingTerminalLeverage(appId, leverage, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  if (!terminal) {
    return false;
  }

  terminal.leverage = clampTradingTerminalValue(Math.round(Number(leverage) || terminal.leverage || 5), 1, 50);
  return true;
}

function setTradingTerminalQuickAmount(appId, percent, targetState = state) {
  const walletBalance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : (targetState.money || 0);
  const safePercent = clampTradingTerminalValue(Number(percent) || 0, 0, 1);
  const nextAmount = Math.floor(walletBalance * safePercent / 100) * 100;
  setTradingTerminalDraftAmount(appId, nextAmount, targetState);
  return nextAmount;
}

function setTradingTerminalStatus(appId, { kicker, title, body, tone = "accent" } = {}, targetState = state) {
  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus(appId, { kicker, title, body, tone }, targetState);
  }
  if (targetState === state && typeof createPhoneResultPreview === "function") {
    state.phonePreview = createPhoneResultPreview(appId, kicker, title, body);
  }
}

function tradeTradingTerminalSpot(appId, side = "buy", targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  const asset = getTradingTerminalAssetState(appId, targetState);
  if (!terminal || !asset) {
    return false;
  }

  const amount = getTradingTerminalDraftAmount(appId, targetState);
  const walletBalance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : (targetState.money || 0);

  if (amount < 1000) {
    setTradingTerminalStatus(appId, {
      kicker: "ORDER",
      title: "주문 금액 오류",
      body: "최소 1,000원 이상부터 주문할 수 있습니다.",
      tone: "fail",
    }, targetState);
    return false;
  }

  if (side === "buy") {
    if (amount > walletBalance) {
      setTradingTerminalStatus(appId, {
        kicker: "ORDER",
        title: "잔액 부족",
        body: "주문 가능 현금보다 큰 금액은 바로 매수할 수 없습니다.",
        tone: "fail",
      }, targetState);
      return false;
    }

    if (typeof spendCash === "function" && !spendCash(amount, targetState)) {
      return false;
    }

    const qty = amount / asset.price;
    const current = terminal.spotHoldings[terminal.selectedAsset] || { qty: 0, avgPrice: asset.price };
    const totalCost = (current.qty * current.avgPrice) + amount;
    const totalQty = current.qty + qty;

    terminal.spotHoldings[terminal.selectedAsset] = {
      qty: totalQty,
      avgPrice: totalQty > 0 ? totalCost / totalQty : asset.price,
    };

    setTradingTerminalStatus(appId, {
      kicker: "SPOT BUY",
      title: `${terminal.selectedAsset} 매수 완료`,
      body: `${formatTradingTerminalMoney(amount)} 규모로 ${asset.meta.name} 현물을 편입했습니다.`,
      tone: "success",
    }, targetState);
    if (typeof showMoneyEffect === "function" && targetState === state) {
      showMoneyEffect(-amount);
    }
    return true;
  }

  const holding = terminal.spotHoldings[terminal.selectedAsset];
  if (!holding || holding.qty <= 0) {
    setTradingTerminalStatus(appId, {
      kicker: "SPOT SELL",
      title: "보유 수량 없음",
      body: "현재 선택한 자산의 현물 보유분이 없습니다.",
      tone: "fail",
    }, targetState);
    return false;
  }

  const availableValue = holding.qty * asset.price;
  const sellAmount = Math.min(amount, availableValue);
  if (sellAmount <= 0) {
    return false;
  }

  const qtyToSell = sellAmount / asset.price;
  const costBasis = qtyToSell * holding.avgPrice;
  const pnl = sellAmount - costBasis;

  holding.qty = Math.max(0, holding.qty - qtyToSell);
  if (holding.qty <= 0.000001) {
    delete terminal.spotHoldings[terminal.selectedAsset];
  }

  if (typeof earnCash === "function") {
    earnCash(sellAmount, targetState);
  } else {
    targetState.money += sellAmount;
  }

  setTradingTerminalStatus(appId, {
    kicker: "SPOT SELL",
    title: `${terminal.selectedAsset} 매도 완료`,
    body: `${formatTradingTerminalMoney(sellAmount)}을 회수했습니다. 손익 ${pnl >= 0 ? "+" : ""}${formatTradingTerminalMoney(pnl)}.`,
    tone: pnl >= 0 ? "success" : "fail",
  }, targetState);
  if (typeof showMoneyEffect === "function" && targetState === state) {
    showMoneyEffect(Math.round(pnl));
  }
  return true;
}

function tradeTradingTerminalFutures(appId, side = "long", targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  const asset = getTradingTerminalAssetState(appId, targetState);
  if (!terminal || !asset) {
    return false;
  }

  const amount = getTradingTerminalDraftAmount(appId, targetState);
  const walletBalance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : (targetState.money || 0);

  if (amount < 1000) {
    setTradingTerminalStatus(appId, {
      kicker: "FUTURES",
      title: "증거금 오류",
      body: "선물 포지션은 최소 1,000원 증거금부터 열 수 있습니다.",
      tone: "fail",
    }, targetState);
    return false;
  }

  if (amount > walletBalance) {
    setTradingTerminalStatus(appId, {
      kicker: "FUTURES",
      title: "증거금 부족",
      body: "지금 가진 현금보다 큰 증거금은 넣을 수 없습니다.",
      tone: "fail",
    }, targetState);
    return false;
  }

  if (typeof spendCash === "function" && !spendCash(amount, targetState)) {
    return false;
  }

  terminal.futuresPositions.push({
    id: terminal.nextPositionId,
    symbol: terminal.selectedAsset,
    side: side === "short" ? "short" : "long",
    entryPrice: asset.price,
    margin: amount,
    leverage: terminal.leverage,
  });
  terminal.nextPositionId += 1;

  setTradingTerminalStatus(appId, {
    kicker: "FUTURES",
    title: `${terminal.selectedAsset} ${side === "short" ? "숏" : "롱"} 진입`,
    body: `${formatTradingTerminalMoney(amount)} 증거금 · x${terminal.leverage} 레버리지로 포지션을 열었습니다.`,
    tone: "accent",
  }, targetState);
  if (typeof showMoneyEffect === "function" && targetState === state) {
    showMoneyEffect(-amount);
  }
  return true;
}

function closeTradingTerminalPosition(appId, positionId, targetState = state) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  if (!terminal) {
    return false;
  }

  const index = terminal.futuresPositions.findIndex((position) => String(position.id) === String(positionId));
  if (index < 0) {
    return false;
  }

  const [position] = terminal.futuresPositions.splice(index, 1);
  const asset = terminal.assets[position.symbol];
  if (!asset) {
    return false;
  }

  const direction = position.side === "short" ? -1 : 1;
  const priceDelta = (asset.price - position.entryPrice) / position.entryPrice;
  const pnl = position.margin * priceDelta * position.leverage * direction;
  const settlement = Math.max(0, position.margin + pnl);

  if (typeof earnCash === "function") {
    earnCash(settlement, targetState);
  } else {
    targetState.money += settlement;
  }

  setTradingTerminalStatus(appId, {
    kicker: "FUTURES CLOSE",
    title: `${position.symbol} 포지션 정리`,
    body: `${formatTradingTerminalMoney(settlement)}을 회수했습니다. 손익 ${pnl >= 0 ? "+" : ""}${formatTradingTerminalMoney(pnl)}.`,
    tone: pnl >= 0 ? "success" : "fail",
  }, targetState);
  if (typeof showMoneyEffect === "function" && targetState === state) {
    showMoneyEffect(Math.round(pnl));
  }
  return true;
}

function buildTradingTerminalCandlesMarkup(appId, targetState = state) {
  const asset = getTradingTerminalAssetState(appId, targetState);
  const candles = asset?.candles || [];
  if (!candles.length) {
    return '<div class="trade-terminal-empty">아직 차트가 준비되지 않았습니다.</div>';
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
    const bodyHeight = Math.max(1.4, ((bodyTop - bodyBottom) / range) * 100);
    const toneClass = candle.c >= candle.o ? "is-up" : "is-down";

    return `
      <span
        class="trade-terminal-candle ${toneClass}"
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

function buildTradingTerminalCompactMarkup(appId, targetState = state, options = {}) {
  const summary = calculateTradingTerminalSummary(appId, targetState);
  const profit = summary.openProfit;
  const profitTone = profit >= 0 ? "is-up" : "is-down";
  const holdingsCount = summary.spotHoldings.length + summary.futuresPositions.length;
  const holdingsLabel = appId === "stocks" ? "보유종목" : "보유자산";
  const holdingsText = appId === "stocks"
    ? `${holdingsCount}개 종목`
    : `${holdingsCount}개 보유`;

  return `
    <div class="trade-summary-app ${appId === "coin" ? "is-coin" : "is-stocks"}">
      <div class="trade-summary-grid is-compact-stack">
        <section class="trade-summary-card">
          <span class="trade-summary-label">현재 돈</span>
          <strong class="trade-summary-value">${escapePhoneAppHtml(formatTradingTerminalMoney(summary.walletBalance))}</strong>
        </section>
        <section class="trade-summary-card ${profitTone}">
          <span class="trade-summary-label">현재 수익</span>
          <strong class="trade-summary-value">${escapePhoneAppHtml(`${profit >= 0 ? "+" : ""}${formatTradingTerminalMoney(profit)}`)}</strong>
        </section>
        <section class="trade-summary-card is-holdings">
          <span class="trade-summary-label">${escapePhoneAppHtml(holdingsLabel)}</span>
          <strong class="trade-summary-value">${escapePhoneAppHtml(holdingsText)}</strong>
        </section>
      </div>
    </div>
  `;
}

function buildTradingTerminalStageMarkup(appId, targetState = state, options = {}) {
  const terminal = ensureTradingTerminalState(appId, targetState);
  const asset = getTradingTerminalAssetState(appId, targetState);
  if (!terminal || !asset) {
    return '<div class="trade-terminal-empty">거래소를 불러오지 못했습니다.</div>';
  }

  const summary = calculateTradingTerminalSummary(appId, targetState);
  const orderBook = getTradingTerminalOrderBook(appId, targetState);
  const changePercent = ((asset.price - asset.previousClose) / Math.max(1, asset.previousClose)) * 100;
  const changeTone = changePercent >= 0 ? "is-up" : "is-down";
  const modeLabel = terminal.mode === "futures" ? "FUTURES" : "SPOT";
  const leverageChoices = [5, 10, 20, 50];
  const assetDefinitions = getTradingTerminalAssetDefinitions(appId, targetState);
  const compactProfit = summary.openProfit;
  const recentTrades = asset.trades.slice(0, 10);
  const headerKicker = Object.prototype.hasOwnProperty.call(options, "kicker")
    ? String(options.kicker || "")
    : "";
  const headerTitle = Object.prototype.hasOwnProperty.call(options, "title")
    ? String(options.title || "")
    : (appId === "coin" ? "코인" : "주식");
  const headerNote = Object.prototype.hasOwnProperty.call(options, "note")
    ? String(options.note || "")
    : "";
  const priceChangeText = formatTradingTerminalSignedPrice(asset.price - asset.previousClose);
  const primaryOrderActions = terminal.mode === "futures"
    ? `
      <button class="trade-terminal-order-btn is-up" type="button" data-phone-action="terminal-futures-long" data-app-id="${escapePhoneAppHtml(appId)}">롱 진입</button>
      <button class="trade-terminal-order-btn is-down" type="button" data-phone-action="terminal-futures-short" data-app-id="${escapePhoneAppHtml(appId)}">숏 진입</button>
    `
    : `
      <button class="trade-terminal-order-btn is-up" type="button" data-phone-action="terminal-spot-buy" data-app-id="${escapePhoneAppHtml(appId)}">매수</button>
      <button class="trade-terminal-order-btn is-down" type="button" data-phone-action="terminal-spot-sell" data-app-id="${escapePhoneAppHtml(appId)}">매도</button>
    `;

  const spotHoldingsMarkup = summary.spotHoldings.length
    ? summary.spotHoldings.map((holding) => `
      <div class="trade-terminal-position-row">
        <div class="trade-terminal-position-copy">
          <div class="trade-terminal-position-title">${escapePhoneAppHtml(`${holding.icon} ${holding.symbol}`)}</div>
          <div class="trade-terminal-position-sub">${escapePhoneAppHtml(`${holding.name} · 평균 ${formatTradingTerminalPrice(holding.avgPrice)}`)}</div>
        </div>
        <div class="trade-terminal-position-meta">
          <div class="trade-terminal-position-main">${escapePhoneAppHtml(formatTradingTerminalMoney(holding.currentValue))}</div>
          <div class="trade-terminal-position-pnl ${holding.pnl >= 0 ? "is-up" : "is-down"}">${escapePhoneAppHtml(`${holding.pnl >= 0 ? "+" : ""}${formatTradingTerminalMoney(holding.pnl)}`)}</div>
        </div>
      </div>
    `).join("")
    : '<div class="trade-terminal-empty">현물 보유 자산이 없습니다.</div>';

  const futuresMarkup = summary.futuresPositions.length
    ? summary.futuresPositions.map((position) => `
      <div class="trade-terminal-position-row">
        <div class="trade-terminal-position-copy">
          <div class="trade-terminal-position-title">${escapePhoneAppHtml(`${position.symbol} ${position.side === "short" ? "숏" : "롱"} x${position.leverage}`)}</div>
          <div class="trade-terminal-position-sub">${escapePhoneAppHtml(`진입 ${formatTradingTerminalPrice(position.entryPrice)} · 증거금 ${formatTradingTerminalMoney(position.margin)}`)}</div>
        </div>
        <div class="trade-terminal-position-meta">
          <div class="trade-terminal-position-pnl ${position.pnl >= 0 ? "is-up" : "is-down"}">${escapePhoneAppHtml(`${position.pnl >= 0 ? "+" : ""}${formatTradingTerminalMoney(position.pnl)}`)}</div>
          <button class="trade-terminal-close-btn" type="button" data-phone-action="terminal-close-position" data-app-id="${escapePhoneAppHtml(appId)}" data-position-id="${escapePhoneAppHtml(position.id)}">정리</button>
        </div>
      </div>
    `).join("")
    : '<div class="trade-terminal-empty">열린 선물 포지션이 없습니다.</div>';

  return `
    <div class="trade-terminal ${appId === "coin" ? "is-coin" : "is-stocks"}" data-trading-app="${escapePhoneAppHtml(appId)}">
      <div class="trade-terminal-header">
        <div class="trade-terminal-header-copy">
          ${headerKicker ? `<div class="trade-terminal-kicker">${escapePhoneAppHtml(headerKicker)}</div>` : ""}
          <div class="trade-terminal-title">${escapePhoneAppHtml(headerTitle)}</div>
          ${headerNote ? `<div class="trade-terminal-note">${escapePhoneAppHtml(headerNote)}</div>` : ""}
        </div>
        <div class="trade-terminal-equity">
          <div class="trade-terminal-equity-label">TOTAL EQUITY</div>
          <div class="trade-terminal-equity-value">${escapePhoneAppHtml(formatTradingTerminalMoney(summary.totalEquity))}</div>
        </div>
      </div>

      <div class="trade-terminal-summary-strip">
        <div class="trade-terminal-summary-card">
          <span class="trade-terminal-summary-label">보유 현금</span>
          <strong class="trade-terminal-summary-value">${escapePhoneAppHtml(formatTradingTerminalMoney(summary.walletBalance))}</strong>
        </div>
        <div class="trade-terminal-summary-card ${compactProfit >= 0 ? "is-up" : "is-down"}">
          <span class="trade-terminal-summary-label">현재 손익</span>
          <strong class="trade-terminal-summary-value">${escapePhoneAppHtml(`${compactProfit >= 0 ? "+" : ""}${formatTradingTerminalMoney(compactProfit)}`)}</strong>
        </div>
        <div class="trade-terminal-summary-card">
          <span class="trade-terminal-summary-label">거래 모드</span>
          <strong class="trade-terminal-summary-value">${escapePhoneAppHtml(modeLabel)}</strong>
        </div>
      </div>

      <div class="trade-terminal-toggle-row">
        <div class="trade-terminal-mode-tabs">
          <button class="trade-terminal-mode-btn ${terminal.mode === "spot" ? "is-active" : ""}" type="button" data-phone-action="terminal-set-mode" data-app-id="${escapePhoneAppHtml(appId)}" data-mode="spot">현물</button>
          <button class="trade-terminal-mode-btn ${terminal.mode === "futures" ? "is-active" : ""}" type="button" data-phone-action="terminal-set-mode" data-app-id="${escapePhoneAppHtml(appId)}" data-mode="futures">선물</button>
        </div>
        <button class="trade-terminal-chart-toggle" type="button" data-phone-action="terminal-toggle-chart" data-app-id="${escapePhoneAppHtml(appId)}">${terminal.chartOpen ? "차트 접기" : "차트 펴기"}</button>
      </div>

      <div class="trade-terminal-asset-tabs">
        ${assetDefinitions.map((definition) => `
          <button class="trade-terminal-asset-tab ${terminal.selectedAsset === definition.symbol ? "is-active" : ""}" type="button" data-phone-action="terminal-set-asset" data-app-id="${escapePhoneAppHtml(appId)}" data-asset="${escapePhoneAppHtml(definition.symbol)}">
            <span class="trade-terminal-asset-symbol">${escapePhoneAppHtml(`${definition.icon} ${definition.symbol}`)}</span>
            <span class="trade-terminal-asset-name">${escapePhoneAppHtml(definition.name)}</span>
          </button>
        `).join("")}
      </div>

      <div class="trade-terminal-price-panel ${changeTone}">
        <div class="trade-terminal-price-main">
          <div class="trade-terminal-price-symbol">${escapePhoneAppHtml(`${asset.meta.symbol}/KRW`)}</div>
          <div class="trade-terminal-price-value">${escapePhoneAppHtml(formatTradingTerminalPrice(asset.price))}</div>
          <div class="trade-terminal-price-change">${escapePhoneAppHtml(`${formatTradingTerminalSignedPercent(changePercent)} · ${priceChangeText}`)}</div>
        </div>
        <div class="trade-terminal-price-stats">
          <span>고가 ${escapePhoneAppHtml(formatTradingTerminalPrice(asset.high24))}</span>
          <span>저가 ${escapePhoneAppHtml(formatTradingTerminalPrice(asset.low24))}</span>
          <span>거래량 ${escapePhoneAppHtml(formatTradingTerminalMoney(asset.volume24))}</span>
        </div>
      </div>

      <div class="trade-terminal-chart-card ${terminal.chartOpen ? "" : "is-collapsed"}">
        <div class="trade-terminal-chart-grid">${buildTradingTerminalCandlesMarkup(appId, targetState)}</div>
      </div>

      <div class="trade-terminal-market-grid">
        <section class="trade-terminal-book-card">
          <div class="trade-terminal-section-title">호가창</div>
          <div class="trade-terminal-book">
            <div class="trade-terminal-book-side is-ask">
              ${orderBook.asks.map((level) => `
                <div class="trade-terminal-book-row">
                  <span>${escapePhoneAppHtml(formatTradingTerminalPrice(level.price))}</span>
                  <span>${escapePhoneAppHtml(formatTradingTerminalSize(appId, level.size))}</span>
                </div>
              `).join("")}
            </div>
            <div class="trade-terminal-book-current">${escapePhoneAppHtml(formatTradingTerminalPrice(asset.price))}</div>
            <div class="trade-terminal-book-side is-bid">
              ${orderBook.bids.map((level) => `
                <div class="trade-terminal-book-row">
                  <span>${escapePhoneAppHtml(formatTradingTerminalPrice(level.price))}</span>
                  <span>${escapePhoneAppHtml(formatTradingTerminalSize(appId, level.size))}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </section>

        <section class="trade-terminal-trades-card">
          <div class="trade-terminal-section-title">실시간 체결</div>
          <div class="trade-terminal-trades">
            ${recentTrades.length
              ? recentTrades.map((trade) => `
                <div class="trade-terminal-trade-row ${trade.side === "buy" ? "is-up" : "is-down"}">
                  <span>${escapePhoneAppHtml(formatTradingTerminalPrice(trade.price))}</span>
                  <span>${escapePhoneAppHtml(formatTradingTerminalSize(appId, trade.size))}</span>
                </div>
              `).join("")
              : '<div class="trade-terminal-empty">체결 내역이 곧 들어옵니다.</div>'}
          </div>
        </section>
      </div>

      <section class="trade-terminal-order-card">
        <div class="trade-terminal-section-title">${escapePhoneAppHtml(terminal.mode === "futures" ? "선물 주문" : "현물 주문")}</div>
        ${terminal.mode === "futures" ? `
          <div class="trade-terminal-leverage-row">
            ${leverageChoices.map((choice) => `
              <button class="trade-terminal-leverage-btn ${terminal.leverage === choice ? "is-active" : ""}" type="button" data-phone-action="terminal-set-leverage" data-app-id="${escapePhoneAppHtml(appId)}" data-leverage="${choice}">x${choice}</button>
            `).join("")}
          </div>
        ` : ""}
        <div class="trade-terminal-order-input-wrap">
          <input
            class="trade-terminal-order-input"
            type="number"
            min="1000"
            step="1000"
            inputmode="numeric"
            placeholder="주문 금액"
            value="${escapePhoneAppHtml(String(terminal.draftAmount || ""))}"
            data-trading-amount-input
            data-trading-app="${escapePhoneAppHtml(appId)}"
          />
          <span class="trade-terminal-order-unit">KRW</span>
        </div>
        <div class="trade-terminal-quick-row">
          <button class="trade-terminal-quick-btn" type="button" data-phone-action="terminal-set-pct" data-app-id="${escapePhoneAppHtml(appId)}" data-pct="0.1">10%</button>
          <button class="trade-terminal-quick-btn" type="button" data-phone-action="terminal-set-pct" data-app-id="${escapePhoneAppHtml(appId)}" data-pct="0.25">25%</button>
          <button class="trade-terminal-quick-btn" type="button" data-phone-action="terminal-set-pct" data-app-id="${escapePhoneAppHtml(appId)}" data-pct="0.5">50%</button>
          <button class="trade-terminal-quick-btn" type="button" data-phone-action="terminal-set-pct" data-app-id="${escapePhoneAppHtml(appId)}" data-pct="1">100%</button>
        </div>
        <div class="trade-terminal-order-actions">${primaryOrderActions}</div>
      </section>

      <section class="trade-terminal-positions-card">
        <div class="trade-terminal-section-title">현물 보유</div>
        <div class="trade-terminal-positions-list">${spotHoldingsMarkup}</div>
      </section>

      <section class="trade-terminal-positions-card">
        <div class="trade-terminal-section-title">선물 포지션</div>
        <div class="trade-terminal-positions-list">${futuresMarkup}</div>
      </section>
    </div>
  `;
}

function shouldTickTradingTerminal(targetState = state) {
  if (!targetState?.hasPhone || !targetState.phoneStageExpanded) {
    return "";
  }

  const routeInfo = typeof parsePhoneRoute === "function"
    ? parsePhoneRoute(targetState.phoneView || "home")
    : { appId: "" };

  return ["stocks", "coin"].includes(routeInfo.appId) ? routeInfo.appId : "";
}

function isTradingTerminalInputFocused() {
  return Boolean(document.activeElement?.matches?.("[data-trading-amount-input], [data-stock-qty-input]"));
}

function startTradingTerminalTicker() {
  if (tradingTerminalTickerId) {
    return tradingTerminalTickerId;
  }

  tradingTerminalTickerId = window.setInterval(() => {
    if (typeof state === "undefined" || !state) {
      return;
    }

    const activeAppId = shouldTickTradingTerminal(state);
    if (!activeAppId) {
      return;
    }

    if (isTradingTerminalInputFocused()) {
      const activeInput = document.activeElement;
      if (activeInput?.dataset?.tradingApp) {
        setTradingTerminalDraftAmount(activeInput.dataset.tradingApp, activeInput.value, state);
      } else if (activeInput?.matches?.("[data-stock-qty-input]") && typeof setStockMarketDraftQuantity === "function") {
        setStockMarketDraftQuantity(activeInput.value, state);
      }
      return;
    }

    if (activeAppId === "stocks" && typeof tickStockMarketApp === "function") {
      tickStockMarketApp(state);
    } else {
      tickTradingTerminal(activeAppId, state);
    }

    if (typeof shouldDeferPhoneUiRerender === "function" && shouldDeferPhoneUiRerender()) {
      return;
    }

    if (typeof renderGame === "function") {
      renderGame();
    }
  }, 1100);

  return tradingTerminalTickerId;
}
