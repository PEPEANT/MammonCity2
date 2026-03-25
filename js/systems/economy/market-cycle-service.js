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

function getMarketCycleSessionWindow() {
  const startMinutes = Math.max(0, (Number(typeof DAY_START_TIME_SLOT !== "undefined" ? DAY_START_TIME_SLOT : 16) || 16)
    * (Number(typeof TIME_SLOT_MINUTES !== "undefined" ? TIME_SLOT_MINUTES : 30) || 30));
  const endSlot = typeof NIGHT_AUTO_SLEEP_START_SLOT === "number"
    ? NIGHT_AUTO_SLEEP_START_SLOT
    : (typeof DAY_END_TIME_SLOT !== "undefined" ? DAY_END_TIME_SLOT : 48);
  const endMinutes = Math.max(startMinutes + 1, (Number(endSlot) || 48)
    * (Number(typeof TIME_SLOT_MINUTES !== "undefined" ? TIME_SLOT_MINUTES : 30) || 30));

  return {
    startMinutes,
    endMinutes,
    durationMinutes: Math.max(1, endMinutes - startMinutes),
  };
}

function getMarketCycleAbsoluteMinutes(targetState = state) {
  if (typeof getAbsoluteDayMinutes === "function") {
    return Math.max(0, getAbsoluteDayMinutes(targetState));
  }

  const slotMinutes = Number(typeof TIME_SLOT_MINUTES !== "undefined" ? TIME_SLOT_MINUTES : 30) || 30;
  const timeSlot = Math.max(0, Math.round(Number(targetState?.timeSlot) || 0));
  const minuteOffset = Math.max(0, Math.round(Number(targetState?.timeMinuteOffset) || 0));
  return (timeSlot * slotMinutes) + minuteOffset;
}

function getMarketCycleSessionMinuteCursor(targetState = state) {
  const sessionWindow = getMarketCycleSessionWindow();
  const absoluteMinutes = getMarketCycleAbsoluteMinutes(targetState);
  return clampMarketCycleNumber(
    absoluteMinutes - sessionWindow.startMinutes,
    0,
    sessionWindow.durationMinutes,
  );
}

function getMarketCycleIntradayProfile(appId = "", definition = {}) {
  const normalizedAppId = String(appId || "").trim().toLowerCase();
  const market = String(definition?.market || "").trim().toLowerCase();
  const isMeme = Boolean(definition?.isMeme);
  let profile;

  if (normalizedAppId === "stock-market") {
    if (market === "leveraged") {
      profile = {
        minuteVolatilityMin: 0.008,
        minuteVolatilityMax: 0.022,
        deviationMax: 0.15,
        shockChance: 0.0052,
        shockBoost: 1.8,
        meanReversion: 0.42,
        tradeSizeMin: 24,
        tradeSizeMax: 280,
        tradeDigits: 0,
      };
    } else if (market === "us") {
      profile = {
        minuteVolatilityMin: 0.003,
        minuteVolatilityMax: 0.009,
        deviationMax: 0.07,
        shockChance: 0.0038,
        shockBoost: 1.55,
        meanReversion: 0.34,
        tradeSizeMin: 16,
        tradeSizeMax: 220,
        tradeDigits: 0,
      };
    } else {
      profile = {
        minuteVolatilityMin: 0.002,
        minuteVolatilityMax: 0.006,
        deviationMax: 0.05,
        shockChance: 0.0028,
        shockBoost: 1.35,
        meanReversion: 0.30,
        tradeSizeMin: 28,
        tradeSizeMax: 360,
        tradeDigits: 0,
      };
    }
  } else if (normalizedAppId === "stocks") {
    profile = {
      minuteVolatilityMin: 0.005,
      minuteVolatilityMax: 0.014,
      deviationMax: 0.12,
      shockChance: 0.0042,
      shockBoost: 1.6,
      meanReversion: 0.36,
      tradeSizeMin: 6,
      tradeSizeMax: 64,
      tradeDigits: 0,
    };
  } else if (normalizedAppId === "coin") {
    profile = isMeme
      ? {
          minuteVolatilityMin: 0.012,
          minuteVolatilityMax: 0.032,
          deviationMax: 0.32,
          shockChance: 0.0075,
          shockBoost: 2.15,
          meanReversion: 0.44,
          tradeSizeMin: 0.05,
          tradeSizeMax: 1.6,
          tradeDigits: 3,
        }
      : {
          minuteVolatilityMin: 0.006,
          minuteVolatilityMax: 0.018,
          deviationMax: 0.20,
          shockChance: 0.0055,
          shockBoost: 1.85,
          meanReversion: 0.40,
          tradeSizeMin: 0.02,
          tradeSizeMax: 0.9,
          tradeDigits: 3,
        };
  } else {
    profile = {
      minuteVolatilityMin: 0.003,
      minuteVolatilityMax: 0.010,
      deviationMax: 0.08,
      shockChance: 0.0032,
      shockBoost: 1.45,
      meanReversion: 0.33,
      tradeSizeMin: 8,
      tradeSizeMax: 120,
      tradeDigits: 0,
    };
  }

  const baseVolatility = normalizedAppId === "coin"
    ? (isMeme ? 0.02 : 0.012)
    : normalizedAppId === "stocks"
      ? 0.009
      : market === "leveraged"
        ? 0.018
        : market === "us"
          ? 0.011
          : 0.0075;
  const volatilityScale = clampMarketCycleNumber(
    (Number(definition?.volatility) || baseVolatility) / baseVolatility,
    0.8,
    1.9,
  );

  return {
    ...profile,
    minuteVolatilityMin: profile.minuteVolatilityMin * volatilityScale,
    minuteVolatilityMax: profile.minuteVolatilityMax * volatilityScale,
    deviationMax: profile.deviationMax * (0.9 + ((volatilityScale - 1) * 0.45)),
    minimumMoveThreshold: profile.minuteVolatilityMin * 0.55,
  };
}

function interpolateMarketCycleIntradayAnchor(openPrice = 1, closePrice = 1, progress = 0, tick = 0) {
  const safeProgress = clampMarketCycleNumber(progress, 0, 1);
  const safeOpen = Math.max(1, Number(openPrice) || 1);
  const safeClose = Math.max(1, Number(closePrice) || safeOpen);

  if (safeOpen > 0 && safeClose > 0) {
    const interpolated = Math.exp(
      Math.log(safeOpen) + ((Math.log(safeClose) - Math.log(safeOpen)) * safeProgress),
    );
    return snapMarketCycleSessionPrice(interpolated, tick);
  }

  return snapMarketCycleSessionPrice(safeOpen + ((safeClose - safeOpen) * safeProgress), tick);
}

function normalizeMarketCycleAssetRuntimeState(assetState = null, definition = {}, tick = 0) {
  const seedPrice = snapMarketCycleSessionPrice(
    assetState?.cycleOpen || assetState?.previousClose || definition?.basePrice || 1,
    tick,
  );
  const cycleTargetClose = snapMarketCycleSessionPrice(
    assetState?.cycleTargetClose || assetState?.price || seedPrice,
    tick,
  );
  const normalizedCandles = Array.isArray(assetState?.candles)
    ? assetState.candles
      .map((candle) => (candle && typeof candle === "object"
        ? {
            o: snapMarketCycleSessionPrice(candle.o || seedPrice, tick),
            h: snapMarketCycleSessionPrice(candle.h || candle.o || seedPrice, tick),
            l: snapMarketCycleSessionPrice(candle.l || candle.o || seedPrice, tick),
            c: snapMarketCycleSessionPrice(candle.c || candle.o || seedPrice, tick),
          }
        : null))
      .filter(Boolean)
    : [];
  const normalizedTrades = Array.isArray(assetState?.trades)
    ? assetState.trades
      .map((trade) => (trade && typeof trade === "object"
        ? {
            id: String(trade.id || ""),
            minute: Math.max(1, Math.round(Number(trade.minute) || 0)),
            price: snapMarketCycleSessionPrice(trade.price || seedPrice, tick),
            size: Number(trade.size) || 0,
            side: trade.side === "sell" ? "sell" : "buy",
          }
        : null))
      .filter(Boolean)
    : [];

  return {
    meta: { ...(assetState?.meta || {}), ...definition },
    price: snapMarketCycleSessionPrice(assetState?.price || assetState?.livePrice || seedPrice, tick),
    livePrice: snapMarketCycleSessionPrice(assetState?.livePrice || assetState?.price || seedPrice, tick),
    previousClose: seedPrice,
    cycleOpen: seedPrice,
    cycleTargetClose,
    high24: snapMarketCycleSessionPrice(assetState?.high24 || seedPrice, tick),
    low24: snapMarketCycleSessionPrice(assetState?.low24 || seedPrice, tick),
    volume24: Math.max(0, Math.round(Number(assetState?.volume24) || 0)),
    candles: normalizedCandles,
    trades: normalizedTrades.slice(0, 12),
    recentTrades: normalizedTrades.slice(0, 12),
    tickCount: Math.max(0, Math.round(Number(assetState?.tickCount) || normalizedCandles.length || 0)),
    cycleTurn: Math.max(1, Math.round(Number(assetState?.cycleTurn) || 1)),
    minuteCursor: Math.max(0, Math.round(Number(assetState?.minuteCursor) || 0)),
    currentCandle: assetState?.currentCandle && typeof assetState.currentCandle === "object"
      ? {
          o: snapMarketCycleSessionPrice(assetState.currentCandle.o || seedPrice, tick),
          h: snapMarketCycleSessionPrice(assetState.currentCandle.h || seedPrice, tick),
          l: snapMarketCycleSessionPrice(assetState.currentCandle.l || seedPrice, tick),
          c: snapMarketCycleSessionPrice(assetState.currentCandle.c || seedPrice, tick),
        }
      : null,
  };
}

function buildMarketCycleRuntimeTrade({
  appId = "",
  definition,
  turn = 1,
  minute = 1,
  price = 1,
  previousPrice = 1,
  profile,
  tick = 0,
} = {}) {
  const normalizedProfile = profile || getMarketCycleIntradayProfile(appId, definition);
  const size = getMarketCycleBookSize(
    ["market-trade", appId, definition?.symbol || definition?.code || definition?.name, turn, minute],
    normalizedProfile.tradeSizeMin,
    normalizedProfile.tradeSizeMax,
    normalizedProfile.tradeDigits || 0,
  );

  return {
    id: `${definition?.symbol || definition?.code || definition?.name}-${turn}-${minute}`,
    minute,
    price: snapMarketCycleSessionPrice(price, tick),
    size,
    side: price >= previousPrice ? "buy" : "sell",
  };
}

function stepMarketCycleAssetRuntime({
  appId = "",
  definition,
  assetState,
  tick = 0,
  candleCount = 30,
  minute = 1,
} = {}) {
  const nextAssetState = normalizeMarketCycleAssetRuntimeState(assetState, definition, tick);
  const sessionWindow = getMarketCycleSessionWindow();
  const normalizedMinute = clampMarketCycleNumber(
    Math.max(1, Math.round(Number(minute) || (nextAssetState.minuteCursor + 1))),
    1,
    sessionWindow.durationMinutes,
  );
  const profile = getMarketCycleIntradayProfile(appId, definition);
  const previousPrice = snapMarketCycleSessionPrice(
    nextAssetState.livePrice || nextAssetState.price || nextAssetState.cycleOpen || definition?.basePrice || 1,
    tick,
  );
  const progress = normalizedMinute / sessionWindow.durationMinutes;
  const anchorPrice = interpolateMarketCycleIntradayAnchor(
    nextAssetState.cycleOpen,
    nextAssetState.cycleTargetClose,
    progress,
    tick,
  );
  const deviationEnvelope = Math.max(
    0.012,
    profile.deviationMax * Math.sin(Math.PI * progress),
  );
  const priceFloor = Math.max(1, anchorPrice * (1 - deviationEnvelope));
  const priceCeiling = Math.max(priceFloor, anchorPrice * (1 + deviationEnvelope));
  const rng = createMarketCycleRandomGenerator(createMarketCycleSeed(
    appId,
    definition?.symbol || definition?.code || definition?.name,
    nextAssetState.cycleTurn,
    "intraday-minute",
    normalizedMinute,
  ));
  const noiseMin = profile.minuteVolatilityMin * (0.85 + (rng() * 0.35));
  const noiseMax = profile.minuteVolatilityMax * (0.9 + (rng() * 0.3));
  const noiseMagnitude = noiseMin + (rng() * Math.max(0.0001, noiseMax - noiseMin));
  const noiseRatio = ((rng() - 0.5) * 2) * noiseMagnitude;
  const shockRatio = rng() < (profile.shockChance * (0.8 + (Math.sin(Math.PI * progress) * 0.45)))
    ? (((rng() - 0.5) * 2) * noiseMagnitude * profile.shockBoost)
    : 0;
  const anchorGapRatio = (anchorPrice - previousPrice) / Math.max(1, previousPrice);
  const attractionRatio = clampMarketCycleNumber(
    anchorGapRatio * profile.meanReversion,
    -profile.minuteVolatilityMax * 1.1,
    profile.minuteVolatilityMax * 1.1,
  );
  const totalSignal = noiseRatio + shockRatio + attractionRatio;
  const unclampedPrice = previousPrice * (1 + totalSignal);
  const boundedPrice = clampMarketCycleNumber(unclampedPrice, priceFloor, priceCeiling);
  let nextPrice = snapMarketCycleSessionPrice(boundedPrice, tick);

  if (nextPrice === previousPrice && Math.abs(totalSignal) >= profile.minimumMoveThreshold) {
    const forcedStep = tick >= 1
      ? tick
      : Math.max(0.01, Math.abs(previousPrice) * profile.minimumMoveThreshold);
    const forcedPrice = previousPrice + ((totalSignal >= 0 ? 1 : -1) * forcedStep);
    nextPrice = snapMarketCycleSessionPrice(
      clampMarketCycleNumber(forcedPrice, priceFloor, priceCeiling),
      tick,
    );
  }

  if (nextPrice === previousPrice && tick >= 1 && Math.abs(totalSignal) >= profile.minimumMoveThreshold) {
    const forcedPrice = clampMarketCycleNumber(
      previousPrice + ((totalSignal >= 0 ? 1 : -1) * tick),
      priceFloor,
      priceCeiling,
    );
    nextPrice = snapMarketCycleSessionPrice(forcedPrice, tick);
  }

  const wickScale = noiseMagnitude * (0.3 + (rng() * 0.8));
  const candleHigh = snapMarketCycleSessionPrice(
    Math.max(previousPrice, nextPrice) * (1 + (wickScale * (0.18 + (rng() * 0.42)))),
    tick,
  );
  const candleLow = snapMarketCycleSessionPrice(
    Math.max(1, Math.min(previousPrice, nextPrice) * (1 - (wickScale * (0.18 + (rng() * 0.42))))),
    tick,
  );
  const candle = {
    o: previousPrice,
    h: Math.max(previousPrice, nextPrice, candleHigh),
    l: Math.min(previousPrice, nextPrice, candleLow),
    c: nextPrice,
  };
  const trade = buildMarketCycleRuntimeTrade({
    appId,
    definition,
    turn: nextAssetState.cycleTurn,
    minute: normalizedMinute,
    price: nextPrice,
    previousPrice,
    profile,
    tick,
  });
  const volumeDelta = appId === "stock-market"
    ? Math.max(1, Math.round(Number(trade.size) || 1))
    : Math.max(1, Math.round(nextPrice * Math.max(0, Number(trade.size) || 0)));

  nextAssetState.livePrice = nextPrice;
  nextAssetState.price = nextPrice;
  nextAssetState.minuteCursor = normalizedMinute;
  nextAssetState.tickCount = normalizedMinute;
  nextAssetState.currentCandle = candle;
  nextAssetState.high24 = Math.max(nextAssetState.high24, candle.h, nextPrice, nextAssetState.cycleOpen);
  nextAssetState.low24 = Math.min(nextAssetState.low24, candle.l, nextPrice, nextAssetState.cycleOpen);
  nextAssetState.volume24 += volumeDelta;
  nextAssetState.candles = [...(nextAssetState.candles || []), candle].slice(-Math.max(8, candleCount));
  nextAssetState.trades = [trade, ...(nextAssetState.trades || [])].slice(0, 12);
  nextAssetState.recentTrades = nextAssetState.trades.slice(0, 12);

  return nextAssetState;
}

function syncMarketCycleAssetState(
  assetState = null,
  {
    appId = "",
    definition,
    targetState = state,
    tick = 0,
    candleCount = 30,
    forceRebuild = false,
  } = {},
) {
  const currentTurn = getMarketCycleTurnNumber(targetState);
  let turnOpen = snapMarketCycleSessionPrice(definition?.basePrice || 1, tick);

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

  const targetClose = resolveMarketCycleTurnClose({
    appId,
    definition,
    previousClose: turnOpen,
    turn: currentTurn,
    tick,
    targetState,
  });
  const sessionMinute = getMarketCycleSessionMinuteCursor(targetState);
  const canReuse = !forceRebuild
    && assetState
    && typeof assetState === "object"
    && Number(assetState.cycleTurn) === currentTurn
    && Number(assetState.cycleOpen) > 0
    && Number(assetState.cycleTargetClose) > 0
    && Number(assetState.minuteCursor) <= sessionMinute;

  let nextAssetState = canReuse
    ? normalizeMarketCycleAssetRuntimeState(assetState, definition, tick)
    : {
        meta: { ...definition },
        price: turnOpen,
        livePrice: turnOpen,
        previousClose: turnOpen,
        cycleOpen: turnOpen,
        cycleTargetClose: targetClose,
        high24: turnOpen,
        low24: turnOpen,
        volume24: 0,
        candles: [{ o: turnOpen, h: turnOpen, l: turnOpen, c: turnOpen }],
        trades: [],
        recentTrades: [],
        tickCount: 0,
        cycleTurn: currentTurn,
        minuteCursor: 0,
        currentCandle: { o: turnOpen, h: turnOpen, l: turnOpen, c: turnOpen },
      };

  nextAssetState.meta = { ...definition };
  nextAssetState.previousClose = turnOpen;
  nextAssetState.cycleOpen = turnOpen;
  nextAssetState.cycleTargetClose = targetClose;
  nextAssetState.cycleTurn = currentTurn;

  if (sessionMinute < nextAssetState.minuteCursor) {
    nextAssetState = {
      meta: { ...definition },
      price: turnOpen,
      livePrice: turnOpen,
      previousClose: turnOpen,
      cycleOpen: turnOpen,
      cycleTargetClose: targetClose,
      high24: turnOpen,
      low24: turnOpen,
      volume24: 0,
      candles: [{ o: turnOpen, h: turnOpen, l: turnOpen, c: turnOpen }],
      trades: [],
      recentTrades: [],
      tickCount: 0,
      cycleTurn: currentTurn,
      minuteCursor: 0,
      currentCandle: { o: turnOpen, h: turnOpen, l: turnOpen, c: turnOpen },
    };
  }

  while (nextAssetState.minuteCursor < sessionMinute) {
    nextAssetState = stepMarketCycleAssetRuntime({
      appId,
      definition,
      assetState: nextAssetState,
      tick,
      candleCount,
      minute: nextAssetState.minuteCursor + 1,
    });
  }

  nextAssetState.trades = (nextAssetState.trades || []).slice(0, 12);
  nextAssetState.recentTrades = nextAssetState.trades.slice(0, 12);
  nextAssetState.candles = (nextAssetState.candles || []).slice(-Math.max(8, candleCount));
  nextAssetState.price = snapMarketCycleSessionPrice(nextAssetState.livePrice || turnOpen, tick);
  nextAssetState.high24 = Math.max(nextAssetState.high24, nextAssetState.price, turnOpen);
  nextAssetState.low24 = Math.min(nextAssetState.low24, nextAssetState.price, turnOpen);

  return nextAssetState;
}

function buildMarketCycleAssetState({
  appId = "",
  definition,
  targetState = state,
  tick = 0,
  candleCount = 30,
} = {}) {
  return syncMarketCycleAssetState(null, {
    appId,
    definition,
    targetState,
    tick,
    candleCount,
    forceRebuild: true,
  });
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
