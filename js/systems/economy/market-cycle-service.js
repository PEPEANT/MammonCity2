function clampMarketCycleNumber(value, min, max) {
  const safeValue = Number(value) || 0;
  return Math.min(max, Math.max(min, safeValue));
}

function createMarketCycleSeed(...parts) {
  const source = parts
    .flatMap((part) => Array.isArray(part) ? part : [part])
    .map((part) => String(part ?? ""))
    .join("|");

  let seed = 1;
  for (let index = 0; index < source.length; index += 1) {
    seed = ((seed * 33) + source.charCodeAt(index) + index + 7) % 2147483647;
  }
  return Math.max(1, seed);
}

function createMarketCycleRandomGenerator(seed = 1) {
  let value = Math.max(1, Math.floor(Number(seed) || 1)) % 2147483647;
  return function nextRandom() {
    value = (value * 48271) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function getMarketCycleTurnNumber(targetState = state) {
  return Math.max(1, Math.round(Number(targetState?.day) || 1));
}

function createMarketCycleScopedState(targetState = state, day = 1) {
  return {
    ...(targetState && typeof targetState === "object" ? targetState : {}),
    day: Math.max(1, Math.round(Number(day) || 1)),
  };
}

function snapMarketCycleSessionPrice(price = 0, tick = 0) {
  const safePrice = Math.max(1, Number(price) || 1);
  const safeTick = Math.max(0, Number(tick) || 0);

  if (safeTick >= 1) {
    return Math.max(safeTick, Math.round(safePrice / safeTick) * safeTick);
  }

  if (safePrice >= 1000) {
    return Math.round(safePrice);
  }

  return Number(safePrice.toFixed(2));
}

function resolveStockMarketTurnReturn(definition, turn, targetState = state) {
  const scopedState = createMarketCycleScopedState(targetState, turn);
  const snapshot = typeof getStockMarketSnapshot === "function"
    ? getStockMarketSnapshot(scopedState)
    : null;
  const marketMultiplier = definition.market === "leveraged"
    ? 1.85
    : definition.market === "us"
      ? 1.18
      : 1;
  const baseReturn = (snapshot?.stockDailyReturnRate || 0) * marketMultiplier;
  const definitionTilt = clampMarketCycleNumber((definition.driftBias || 0) * 36, -0.04, 0.04);
  const volatilityTilt = ((snapshot?.stockVolatility || 1) - 1) * (definition.market === "leveraged" ? 0.20 : 0.08);
  const blendedReturn = baseReturn + definitionTilt + volatilityTilt;

  return clampMarketCycleNumber(
    blendedReturn,
    definition.market === "leveraged" ? -0.28 : -0.16,
    definition.market === "leveraged" ? 0.28 : 0.16,
  );
}

function resolveTradingTerminalTurnReturn(appId, definition, turn, targetState = state) {
  const scopedState = createMarketCycleScopedState(targetState, turn);

  if (appId === "coin") {
    const snapshot = typeof getCoinMarketSnapshot === "function"
      ? getCoinMarketSnapshot(definition.symbol, scopedState)
      : null;
    const damping = definition.isMeme ? 0.38 : 0.55;
    const dampedReturn = (snapshot?.returnRate || 0) * damping;
    return clampMarketCycleNumber(
      dampedReturn,
      definition.isMeme ? -0.55 : -0.30,
      definition.isMeme ? 0.95 : 0.50,
    );
  }

  const snapshot = typeof getStockMarketSnapshot === "function"
    ? getStockMarketSnapshot(scopedState)
    : null;
  const baseReturn = snapshot?.stockDailyReturnRate || 0;
  const definitionTilt = clampMarketCycleNumber((definition.driftBias || 0) * 34, -0.05, 0.05);
  return clampMarketCycleNumber(baseReturn + definitionTilt, -0.20, 0.22);
}

function resolveMarketCycleTurnClose({
  appId = "",
  definition,
  previousClose = 1,
  turn = 1,
  tick = 0,
  targetState = state,
} = {}) {
  const turnReturn = appId === "stock-market"
    ? resolveStockMarketTurnReturn(definition, turn, targetState)
    : resolveTradingTerminalTurnReturn(appId, definition, turn, targetState);
  const seed = createMarketCycleSeed(appId, definition.symbol || definition.code || definition.name, turn, "turn-close");
  const rng = createMarketCycleRandomGenerator(seed);
  const pureNoise = ((rng() - 0.5) * (definition.volatility || 0.01) * 0.16);
  const momentumNoise = ((rng() - 0.5) * Math.abs(turnReturn) * 0.08);
  const nextClose = previousClose * (1 + turnReturn + pureNoise + momentumNoise);

  return snapMarketCycleSessionPrice(nextClose, tick);
}

function buildMarketCycleCandles({
  appId = "",
  definition,
  turn = 1,
  openPrice = 1,
  closePrice = 1,
  tick = 0,
  candleCount = 30,
} = {}) {
  const candles = [];
  const totalCandles = Math.max(8, Math.floor(Number(candleCount) || 30));
  const baseVolatility = Math.max(0.003, Number(definition?.volatility) || 0.01);
  const totalDrift = closePrice - openPrice;
  let previousClose = snapMarketCycleSessionPrice(openPrice, tick);

  for (let index = 0; index < totalCandles; index += 1) {
    const progress = (index + 1) / totalCandles;
    const seed = createMarketCycleSeed(
      appId,
      definition?.symbol || definition?.code || definition?.name,
      turn,
      "candle",
      index,
    );
    const rng = createMarketCycleRandomGenerator(seed);
    const noiseScale = baseVolatility * (0.24 + (Math.abs(totalDrift) / Math.max(1, openPrice)) * 0.8);
    const targetClose = openPrice + (totalDrift * progress);
    const swing = (rng() - 0.5) * noiseScale;
    let candleClose = snapMarketCycleSessionPrice(targetClose * (1 + swing), tick);

    if (index === totalCandles - 1) {
      candleClose = snapMarketCycleSessionPrice(closePrice, tick);
    }

    const candleOpen = previousClose;
    const wickRatio = noiseScale * (0.6 + (rng() * 0.9));
    const high = snapMarketCycleSessionPrice(
      Math.max(candleOpen, candleClose) * (1 + wickRatio * (0.35 + (rng() * 0.5))),
      tick,
    );
    const low = snapMarketCycleSessionPrice(
      Math.max(1, Math.min(candleOpen, candleClose) * (1 - wickRatio * (0.35 + (rng() * 0.5)))),
      tick,
    );

    candles.push({
      o: candleOpen,
      h: Math.max(candleOpen, candleClose, high),
      l: Math.min(candleOpen, candleClose, low),
      c: candleClose,
    });
    previousClose = candleClose;
  }

  return candles;
}

function buildMarketCycleTrades({
  appId = "",
  definition,
  turn = 1,
  candles = [],
  basePrice = 1,
} = {}) {
  const tradeCount = Math.min(10, Math.max(4, Math.floor(candles.length / 3)));
  const trades = [];

  for (let index = 0; index < tradeCount; index += 1) {
    const candle = candles[Math.max(0, candles.length - 1 - index)] || { o: basePrice, c: basePrice };
    const seed = createMarketCycleSeed(
      appId,
      definition?.symbol || definition?.code || definition?.name,
      turn,
      "trade",
      index,
    );
    const rng = createMarketCycleRandomGenerator(seed);
    const size = appId === "coin"
      ? Number((0.2 + (rng() * 7)).toFixed(3))
      : Math.max(1, Math.round((rng() * (appId === "stock-market" ? 2200 : 140)) + 12));

    trades.push({
      id: `${definition?.symbol || definition?.code || definition?.name}-${turn}-${index}`,
      price: candle.c,
      size,
      side: candle.c >= candle.o ? "buy" : "sell",
    });
  }

  return trades;
}

function buildMarketCycleAssetState({
  appId = "",
  definition,
  targetState = state,
  tick = 0,
  candleCount = 30,
} = {}) {
  const currentTurn = getMarketCycleTurnNumber(targetState);
  let turnOpen = snapMarketCycleSessionPrice(definition.basePrice, tick);

  for (let turn = 1; turn < currentTurn; turn += 1) {
    turnOpen = resolveMarketCycleTurnClose({
      appId,
      definition,
      previousClose: turnOpen,
      turn,
      tick,
      targetState,
    });
  }

  const currentClose = resolveMarketCycleTurnClose({
    appId,
    definition,
    previousClose: turnOpen,
    turn: currentTurn,
    tick,
    targetState,
  });
  const candles = buildMarketCycleCandles({
    appId,
    definition,
    turn: currentTurn,
    openPrice: turnOpen,
    closePrice: currentClose,
    tick,
    candleCount,
  });
  const trades = buildMarketCycleTrades({
    appId,
    definition,
    turn: currentTurn,
    candles,
    basePrice: currentClose,
  });
  const high24 = Math.max(...candles.map((candle) => candle.h), currentClose, turnOpen);
  const low24 = Math.min(...candles.map((candle) => candle.l), currentClose, turnOpen);
  const seed = createMarketCycleSeed(appId, definition.symbol || definition.code || definition.name, currentTurn, "volume");
  const rng = createMarketCycleRandomGenerator(seed);
  const absoluteMove = Math.abs((currentClose - turnOpen) / Math.max(1, turnOpen));
  const volumeBase = tick >= 1
    ? Math.max(1200, Math.round(definition.basePrice / Math.max(1, tick)))
    : Math.max(120, Math.round(definition.basePrice / 6));
  const volume24 = Math.round(volumeBase * (1.15 + absoluteMove * 18 + (rng() * 1.9)));

  return {
    meta: { ...definition },
    price: currentClose,
    previousClose: turnOpen,
    high24,
    low24,
    volume24,
    candles,
    trades,
    tickCount: candles.length,
    cycleTurn: currentTurn,
  };
}

function getMarketCycleBookSize(seedParts, min, max, digits = 0) {
  const safeMin = Number(min) || 0;
  const safeMax = Math.max(safeMin, Number(max) || safeMin);
  const rng = createMarketCycleRandomGenerator(createMarketCycleSeed(seedParts));
  const value = safeMin + ((safeMax - safeMin) * rng());

  if (digits > 0) {
    return Number(value.toFixed(digits));
  }

  return Math.round(value);
}
