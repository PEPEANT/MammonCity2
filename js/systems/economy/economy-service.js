function getEconomyCalendarDay(day = 1) {
  const safeDay = Math.max(1, Math.floor(Number(day) || 1));
  const knownDays = Object.keys(ECONOMY_CALENDAR || {})
    .map((key) => Number(key))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (!knownDays.length) {
    return 1;
  }

  if (ECONOMY_CALENDAR[safeDay]) {
    return safeDay;
  }

  return knownDays.reduce((resolvedDay, currentDay) => (
    currentDay <= safeDay ? currentDay : resolvedDay
  ), knownDays[0]);
}

function clampEconomyValue(value, min, max) {
  const safeValue = Number(value) || 0;
  return Math.min(max, Math.max(min, safeValue));
}

function roundEconomyCurrency(value) {
  if (typeof roundToHundred === "function") {
    return roundToHundred(value);
  }

  return Math.round((Number(value) || 0) / 100) * 100;
}

function formatSignedEconomyPercent(value, fractionDigits = 1) {
  const safeDigits = Math.max(0, Math.min(2, Math.floor(fractionDigits) || 0));
  const safeValue = Number.isFinite(value) ? value : 0;
  const sign = safeValue > 0 ? "+" : "";
  return `${sign}${safeValue.toFixed(safeDigits)}%`;
}

function getEconomySnapshot(day = 1) {
  const resolvedDay = getEconomyCalendarDay(day);
  const entry = ECONOMY_CALENDAR?.[resolvedDay] || {};
  const priceIndex = Number(entry.priceIndex) || 1;
  const stockBias = clampEconomyValue(entry.stockBias, -0.4, 0.4);
  const stockVolatility = clampEconomyValue(entry.stockVolatility || 1, 0.8, 1.4);
  const wageMultiplier = clampEconomyValue(entry.wageMultiplier || 1, 0.85, 1.2);
  const exchangeIndex = Math.max(80, Math.round(Number(entry.exchangeIndex) || 100));
  const headlines = Array.isArray(entry.headlines) ? [...entry.headlines] : [];
  const marketChangePercent = Math.round(((stockBias * 8) + ((stockVolatility - 1) * 2)) * 10) / 10;
  const priceChangePercent = Math.round((priceIndex - 1) * 1000) / 10;
  const wageChangePercent = Math.round((wageMultiplier - 1) * 1000) / 10;
  const exchangeChange = exchangeIndex - 100;
  const marketTrend = marketChangePercent >= 1.2
    ? "강한 상승"
    : marketChangePercent >= 0.2
      ? "상승"
      : marketChangePercent <= -1.2
        ? "강한 하락"
        : marketChangePercent <= -0.2
          ? "하락"
          : "횡보";
  const volatilityLabel = stockVolatility >= 1.2
    ? "매우 높음"
    : stockVolatility >= 1.08
      ? "높음"
      : stockVolatility <= 0.92
        ? "낮음"
        : "보통";

  return {
    day: resolvedDay,
    priceIndex,
    priceChangePercent,
    stockBias,
    stockVolatility,
    wageMultiplier,
    wageChangePercent,
    exchangeIndex,
    exchangeChange,
    marketChangePercent,
    marketTrend,
    volatilityLabel,
    headlines,
  };
}

function getTodayEconomy(targetState = state) {
  return getEconomySnapshot(targetState?.day || 1);
}

function getIndexedPrice(basePrice, targetState = state) {
  const economy = getTodayEconomy(targetState);
  return Math.max(0, roundEconomyCurrency((Number(basePrice) || 0) * economy.priceIndex));
}

function getAdjustedWage(basePay, targetState = state) {
  const economy = getTodayEconomy(targetState);
  return Math.max(0, roundEconomyCurrency((Number(basePay) || 0) * economy.wageMultiplier));
}

function getEconomyHeadline(targetState = state) {
  const economy = getTodayEconomy(targetState);
  return economy.headlines[0] || "오늘 경제 지표는 비교적 잠잠하다.";
}

function getStockMarketSnapshot(targetState = state) {
  const economy = getTodayEconomy(targetState);
  const successChance = clampEconomyValue(0.5 + (economy.stockBias * 0.35), 0.22, 0.78);
  const gainAmount = Math.max(
    1000,
    roundEconomyCurrency(60000 * (0.9 + (economy.stockVolatility * 0.35) + (Math.max(0, economy.stockBias) * 0.6))),
  );
  const lossAmount = Math.max(
    1000,
    roundEconomyCurrency(30000 * (0.95 + (economy.stockVolatility * 0.4) + (Math.max(0, -economy.stockBias) * 0.6))),
  );

  return {
    ...economy,
    successChance,
    gainAmount,
    lossAmount,
    movementText: formatSignedEconomyPercent(economy.marketChangePercent),
    successChanceText: `${Math.round(successChance * 100)}%`,
  };
}
