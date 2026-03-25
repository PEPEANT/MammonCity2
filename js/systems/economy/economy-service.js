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

function getMarketFearGreedStatus(value = 50) {
  const safeValue = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

  if (safeValue >= 75) {
    return { label: "극단적 탐욕", toneClass: "is-greed-high" };
  }

  if (safeValue >= 60) {
    return { label: "탐욕", toneClass: "is-greed" };
  }

  if (safeValue >= 45) {
    return { label: "중립", toneClass: "is-neutral" };
  }

  if (safeValue >= 30) {
    return { label: "공포", toneClass: "is-fear" };
  }

  return { label: "극단적 공포", toneClass: "is-fear-high" };
}

function getMarketDirectionProfile(value = 0) {
  const safeValue = Number(value) || 0;

  if (safeValue >= 0.22) {
    return { label: "강세", arrow: "▲", toneClass: "is-up" };
  }

  if (safeValue >= 0.06) {
    return { label: "상승", arrow: "↗", toneClass: "is-up" };
  }

  if (safeValue <= -0.22) {
    return { label: "강한 하락", arrow: "▼", toneClass: "is-down" };
  }

  if (safeValue <= -0.06) {
    return { label: "하락", arrow: "↘", toneClass: "is-down" };
  }

  return { label: "중립", arrow: "•", toneClass: "is-neutral" };
}

function getEconomySnapshot(day = 1) {
  const resolvedDay = getEconomyCalendarDay(day);
  const entry = ECONOMY_CALENDAR?.[resolvedDay] || {};
  const newsPack = entry.newsPack && typeof entry.newsPack === "object"
    ? { ...entry.newsPack }
    : {};
  const monthLabel = String(entry.monthLabel || `${resolvedDay}월`);
  const phaseLabel = String(entry.phaseLabel || `국면 ${resolvedDay}`);
  const phaseShortLabel = String(entry.phaseShortLabel || phaseLabel);
  const phaseTone = String(entry.phaseTone || "neutral");
  const priceIndex = Number(entry.priceIndex) || 1;
  const stockBias = clampEconomyValue(entry.stockBias, -0.4, 0.4);
  const cryptoBias = clampEconomyValue(
    entry.cryptoBias ?? (stockBias * 1.25),
    -0.6,
    0.6,
  );
  const safeAssetBias = clampEconomyValue(
    entry.safeAssetBias ?? (-stockBias * 0.75),
    -0.4,
    0.4,
  );
  const stockVolatility = clampEconomyValue(entry.stockVolatility || 1, 0.8, 1.4);
  const wageMultiplier = clampEconomyValue(entry.wageMultiplier || 1, 0.85, 1.2);
  const exchangeIndex = Math.max(80, Math.round(Number(entry.exchangeIndex) || 100));
  const fearGreed = Math.max(0, Math.min(100, Math.round(Number(entry.fearGreed) || 50)));
  const newsPackId = String(entry.newsPackId || `turn-${String(resolvedDay).padStart(2, "0")}`);
  const headlines = Array.isArray(entry.headlines) && entry.headlines.length
    ? [...entry.headlines]
    : [
        newsPack.macro?.title,
        newsPack.stocks?.title,
        newsPack.crypto?.title,
        newsPack.safe?.title,
        newsPack.local?.title,
      ].filter(Boolean);
  const marketChangePercent = Math.round(((stockBias * 8) + ((stockVolatility - 1) * 2)) * 10) / 10;
  const cryptoChangePercent = Math.round((((cryptoBias * 14) + ((stockVolatility - 1) * 4)) * 10)) / 10;
  const safeAssetChangePercent = Math.round((((safeAssetBias * 10) + ((1 - stockVolatility) * 2)) * 10)) / 10;
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
    monthLabel,
    phaseLabel,
    phaseShortLabel,
    phaseTone,
    fearGreed,
    fearGreedStatus: getMarketFearGreedStatus(fearGreed),
    priceIndex,
    priceChangePercent,
    stockBias,
    cryptoBias,
    safeAssetBias,
    stockVolatility,
    wageMultiplier,
    wageChangePercent,
    exchangeIndex,
    exchangeChange,
    marketChangePercent,
    cryptoChangePercent,
    safeAssetChangePercent,
    marketTrend,
    volatilityLabel,
    stockDirection: getMarketDirectionProfile(stockBias),
    cryptoDirection: getMarketDirectionProfile(cryptoBias),
    safeAssetDirection: getMarketDirectionProfile(safeAssetBias),
    newsPackId,
    newsPack,
    headlines,
  };
}

function getTodayEconomy(targetState = state) {
  return getEconomySnapshot(targetState?.day || 1);
}

function getMarketCycleSnapshot(targetState = state) {
  const totalTurns = typeof MAX_DAYS === "number" ? MAX_DAYS : 12;
  const current = getTodayEconomy(targetState);
  const nextTurn = Math.min(totalTurns, current.day + 1);
  const next = current.day < totalTurns
    ? getEconomySnapshot(nextTurn)
    : null;
  const timeline = Array.from({ length: totalTurns }, (_, index) => {
    const turn = index + 1;
    const entry = getEconomySnapshot(turn);
    return {
      turn,
      monthLabel: entry.monthLabel,
      phaseShortLabel: entry.phaseShortLabel,
      phaseTone: entry.phaseTone,
      fearGreed: entry.fearGreed,
      isCurrent: turn === current.day,
      isPast: turn < current.day,
      isFuture: turn > current.day,
    };
  });

  return {
    currentTurn: current.day,
    totalTurns,
    current,
    next,
    fearGreedStatus: current.fearGreedStatus,
    stockDirection: current.stockDirection,
    cryptoDirection: current.cryptoDirection,
    safeDirection: current.safeAssetDirection,
    timeline,
  };
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
  return economy.newsPack?.macro?.title || economy.headlines[0] || "오늘 경제 지표는 비교적 잠잠하다.";
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

  // 베팅 기반 배율: 오늘 시장 변동률 기반 수익/손실 배율
  // 주식: marketChangePercent 그대로 사용 (±2~8% 범위)
  const stockDailyReturnRate = clampEconomyValue(economy.marketChangePercent / 100, -0.15, 0.15);

  return {
    ...economy,
    successChance,
    gainAmount,
    lossAmount,
    stockDailyReturnRate,
    movementText: formatSignedEconomyPercent(economy.marketChangePercent),
    successChanceText: `${Math.round(successChance * 100)}%`,
    cycleLabel: `${economy.monthLabel} · ${economy.phaseLabel}`,
  };
}

// 코인 종류별 변동성 배율
const COIN_TYPES = {
  BTC: {
    label: "비트코인",
    symbol: "BTC",
    volatility: 1.6,
    emoji: "₿",
    shortDescription: "대표 메이저 코인",
    description: "가장 널리 알려진 대표 코인. 밈 코인보다 느리지만 자산 규모가 크고 시장 심리를 강하게 탄다.",
    isMeme: false,
  },
  ETH: {
    label: "이더리움",
    symbol: "ETH",
    volatility: 2.2,
    emoji: "◆",
    shortDescription: "스마트 컨트랙트 메이저",
    description: "비트코인 다음으로 거래가 두꺼운 메이저 코인. 알트장 심리를 끌고 가지만 잡코인보다는 훨씬 단단하다.",
    isMeme: false,
  },
  MAMC: {
    label: "맘코인",
    symbol: "MAMC",
    volatility: 2.5,
    emoji: "🟡",
    shortDescription: "생활형 기준 코인",
    description: "시장 흐름을 비교적 따라가는 기준 코인. 큰 급등락보다 안정적인 편이다.",
    isMeme: false,
  },
  DICE: {
    label: "다이스 코인",
    symbol: "DICE",
    volatility: 14.0,
    emoji: "🎲",
    shortDescription: "주사위 밈 초고변동",
    description: "커뮤니티 밈, 짤, 방송 클립 하나에도 차트가 출렁이는 초고변동 밈코인이다.",
    isMeme: true,
  },
  DIAB: {
    label: "디아블로",
    symbol: "DIAB",
    volatility: 5.0,
    emoji: "🔴",
    shortDescription: "공포 심리 추종형",
    description: "강한 매수·매도 심리에 민감하게 반응하는 공격형 코인이다.",
    isMeme: false,
  },
  MOON: {
    label: "문샷",
    symbol: "MOON",
    volatility: 10.0,
    emoji: "🌙",
    shortDescription: "급등 기대 테마형",
    description: "상장설과 커뮤니티 기대감에 크게 흔들리는 투기성 코인이다.",
    isMeme: true,
  },
};

const COIN_EVENT_RULES = {
  BTC: [
    {
      id: "etf-demand",
      adjustment: 0.05,
      severity: "normal",
      headline: "비트코인, 기관 수요 기대에 매수세 유입",
      body: "현물 자금 유입 기대가 다시 붙으면서 메이저 코인 쪽으로 자금이 천천히 모이고 있다.",
      topics: ["비트코인", "기관수요", "메이저코인"],
    },
    {
      id: "macro-cooling",
      adjustment: -0.04,
      severity: "normal",
      headline: "비트코인, 거시 변수 경계감에 숨 고르기",
      body: "단기 급등 뒤 차익 실현이 나오며 메이저 코인 전반이 잠시 쉬어 가는 분위기다.",
      topics: ["비트코인", "거시변수", "차익실현"],
    },
  ],
  ETH: [
    {
      id: "ecosystem-demand",
      adjustment: 0.07,
      severity: "normal",
      headline: "이더리움, 생태계 수요 기대에 동반 강세",
      body: "체인 사용량과 대형 자금 유입 기대가 붙으며 이더리움이 메이저 알트 중심으로 움직이고 있다.",
      topics: ["이더리움", "생태계", "메이저알트"],
    },
    {
      id: "fee-pressure",
      adjustment: -0.05,
      severity: "normal",
      headline: "이더리움, 네트워크 부담 경계에 눌림",
      body: "수수료 부담과 차익 실현이 겹치며 단기 상승폭을 일부 되돌리는 흐름이 나왔다.",
      topics: ["이더리움", "수수료부담", "눌림"],
    },
  ],
  MAMC: [
    {
      id: "steady-flow",
      adjustment: 0.00,
      severity: "normal",
      headline: "맘코인, 기준 자산 역할 유지",
      body: "생활형 자금이 꾸준히 유입되며 큰 이슈 없이 흐름을 따라가고 있다.",
      topics: ["맘코인", "기준코인", "생활자금"],
    },
    {
      id: "bank-link",
      adjustment: 0.03,
      severity: "normal",
      headline: "맘코인 결제 연동 기대감에 소폭 강세",
      body: "생활 결제 연동 이야기가 돌며 보수적인 매수세가 붙고 있다.",
      topics: ["맘코인", "결제연동", "생활자산"],
    },
    {
      id: "cooldown",
      adjustment: -0.02,
      severity: "normal",
      headline: "맘코인, 거래량 둔화로 숨 고르기",
      body: "기준 코인답게 변동은 제한적이지만 단기 유입세는 잠시 꺾였다.",
      topics: ["맘코인", "거래량둔화", "숨고르기"],
    },
  ],
  DICE: [
    {
      id: "meme-rally",
      adjustment: 0.18,
      severity: "high",
      headline: "다이스 코인, 주사위 밈 역주행에 매수세 폭주",
      body: "짤 하나가 커뮤니티를 돌면서 거래량이 급증했다. 웃자고 들어온 자금이 차트를 흔드는 중이다.",
      topics: ["다이스 코인", "밈코인", "주사위밈"],
    },
    {
      id: "stream-pump",
      adjustment: 0.28,
      severity: "extreme",
      headline: "다이스 코인, 스트리머 언급 직후 초고변동 돌입",
      body: "실시간 방송에서 이름이 언급되자 추격 매수가 몰렸다. 몇 분 만에 호가가 크게 벌어지는 상황이다.",
      topics: ["다이스 코인", "스트리머펌프", "초고변동"],
    },
    {
      id: "whale-entry",
      adjustment: 0.36,
      severity: "extreme",
      headline: "다이스 코인, 고래 지갑 포착 소문에 급등 베팅 확산",
      body: "정체불명의 큰 지갑이 포착됐다는 루머가 퍼지며 과열 매수가 붙고 있다.",
      topics: ["다이스 코인", "고래지갑", "급등루머"],
    },
    {
      id: "liquidation",
      adjustment: -0.24,
      severity: "high",
      headline: "다이스 코인, 레버리지 청산 경보에 투매 확대",
      body: "과열 포지션이 한 번에 무너지며 밈코인 특유의 급락이 터졌다.",
      topics: ["다이스 코인", "청산경보", "투매"],
    },
    {
      id: "rug-rumor",
      adjustment: -0.34,
      severity: "extreme",
      headline: "다이스 코인, 유동성 이탈 루머에 패닉셀 확산",
      body: "개발팀 이탈설과 유동성 회수 루머가 겹치며 커뮤니티 분위기가 급격히 식었다.",
      topics: ["다이스 코인", "패닉셀", "유동성루머"],
    },
    {
      id: "bot-chaos",
      adjustment: -0.42,
      severity: "extreme",
      headline: "다이스 코인, 봇 매매 충돌로 호가창 난기류",
      body: "봇 주문이 서로 부딪히며 호가창이 튀고 있다. 초고변동 경보가 울릴 만한 움직임이다.",
      topics: ["다이스 코인", "호가창난기류", "초고변동"],
    },
    {
      id: "dice-night",
      adjustment: 0.10,
      severity: "high",
      headline: "다이스 코인, 커뮤니티 주사위 챌린지로 야간 거래 과열",
      body: "짧은 밈 챌린지가 밤새 확산되며 단타성 자금이 몰리고 있다.",
      topics: ["다이스 코인", "커뮤니티챌린지", "야간과열"],
    },
  ],
  DIAB: [
    {
      id: "fear-trade",
      adjustment: 0.05,
      severity: "normal",
      headline: "디아블로, 공포 심리 장세에 반등 시도",
      body: "공격형 자금이 다시 들어오며 변동폭이 서서히 커지고 있다.",
      topics: ["디아블로", "공포심리", "반등시도"],
    },
    {
      id: "sudden-dump",
      adjustment: -0.08,
      severity: "normal",
      headline: "디아블로, 단기 차익 실현에 눌림",
      body: "고점 부담이 커지며 단기 트레이더들의 물량이 쏟아졌다.",
      topics: ["디아블로", "차익실현", "눌림"],
    },
  ],
  MOON: [
    {
      id: "listing-rumor",
      adjustment: 0.12,
      severity: "high",
      headline: "문샷, 상장설 재점화에 기대 매수 유입",
      body: "확정된 건 없지만 상장 루머가 다시 돌며 과열 기대감이 붙고 있다.",
      topics: ["문샷", "상장설", "기대매수"],
    },
    {
      id: "dream-fade",
      adjustment: -0.14,
      severity: "high",
      headline: "문샷, 상장 기대 후퇴에 급락 경계",
      body: "루머가 식자 먼저 들어왔던 자금이 빠르게 빠져나가고 있다.",
      topics: ["문샷", "루머후퇴", "급락경계"],
    },
  ],
};

const COIN_DELISTING_SCHEDULE = Object.freeze([
  {
    symbol: "MOON",
    day: 8,
    phaseLabel: "후퇴 초입",
    reason: "상장 루머가 꺼지고 유동성이 말라 상장폐지 수순에 들어갔다.",
  },
  {
    symbol: "DIAB",
    day: 9,
    phaseLabel: "후퇴기",
    reason: "공포 심리만 남은 채 거래량이 끊기며 상장폐지가 확정됐다.",
  },
  {
    symbol: "MAMC",
    day: 10,
    phaseLabel: "공포기",
    reason: "막판 투매를 버티지 못하고 시장에서 퇴출됐다.",
  },
]);

function getCoinTypeInfo(coinType) {
  const normalizedCoinType = String(coinType || "").trim().toUpperCase();
  return COIN_TYPES[normalizedCoinType] || COIN_TYPES.BTC;
}

function getCoinListingStatus(coinType, targetState = state) {
  const normalizedCoinType = String(coinType || "").trim().toUpperCase();
  const resolvedCoin = getCoinTypeInfo(normalizedCoinType);
  const economy = getTodayEconomy(targetState);
  const delistingEntry = COIN_DELISTING_SCHEDULE.find((entry) => entry.symbol === resolvedCoin.symbol) || null;
  const isDelisted = Boolean(delistingEntry && economy.day >= delistingEntry.day);

  return {
    symbol: resolvedCoin.symbol,
    coin: resolvedCoin,
    day: economy.day,
    isDelisted,
    isListed: !isDelisted,
    delistingEntry,
  };
}

function isCoinDelisted(coinType, targetState = state) {
  return getCoinListingStatus(coinType, targetState).isDelisted;
}

function getTradableCoinEntries(targetState = state) {
  return Object.entries(COIN_TYPES).filter(([symbol]) => !isCoinDelisted(symbol, targetState));
}

function getCoinEventRule(coinType, targetState = state) {
  const listingStatus = getCoinListingStatus(coinType, targetState);
  const coin = listingStatus.coin;
  const economy = getTodayEconomy(targetState);
  if (listingStatus.isDelisted) {
    return {
      id: `delisted-${coin.symbol.toLowerCase()}`,
      adjustment: -1,
      severity: "extreme",
      headline: `${coin.label}, ${listingStatus.delistingEntry?.phaseLabel || economy.phaseLabel}에 상장폐지`,
      body: listingStatus.delistingEntry?.reason || `${coin.label} 거래가 중단되고 상장폐지 처리됐다.`,
      topics: [coin.label, coin.symbol, "상장폐지"],
    };
  }

  const rules = COIN_EVENT_RULES[coin.symbol] || COIN_EVENT_RULES.BTC || COIN_EVENT_RULES.MAMC;
  let eligibleRules = rules;

  if (economy.cryptoBias >= 0.08) {
    const positiveRules = rules.filter((rule) => (rule.adjustment || 0) >= 0);
    if (positiveRules.length) {
      eligibleRules = positiveRules;
    }
  } else if (economy.cryptoBias <= -0.08) {
    const negativeRules = rules.filter((rule) => (rule.adjustment || 0) <= 0);
    if (negativeRules.length) {
      eligibleRules = negativeRules;
    }
  } else {
    const mildRules = rules.filter((rule) => Math.abs(rule.adjustment || 0) <= 0.10);
    if (mildRules.length) {
      eligibleRules = mildRules;
    }
  }

  const seed = Array.from(`${coin.symbol}:${economy.day}:${economy.fearGreed}:${economy.phaseLabel}`)
    .reduce((sum, char, index) => sum + (char.charCodeAt(0) * (index + 3)), 0);
  return eligibleRules[seed % eligibleRules.length] || rules[0];
}

function getCoinMarketSnapshot(coinType, targetState = state) {
  const stockSnapshot = getStockMarketSnapshot(targetState);
  const economy = getTodayEconomy(targetState);
  const listingStatus = getCoinListingStatus(coinType, targetState);
  const coin = listingStatus.coin;
  const event = getCoinEventRule(coinType, targetState);
  if (listingStatus.isDelisted) {
    return {
      ...coin,
      event,
      returnRate: -1,
      direction: "down",
      isDelisted: true,
      movementText: formatSignedEconomyPercent(-100),
      eventKicker: "상장폐지",
      monthLabel: economy.monthLabel,
      phaseLabel: economy.phaseLabel,
      fearGreed: economy.fearGreed,
      topics: [...new Set([
        coin.label,
        coin.symbol,
        "상장폐지",
        ...(Array.isArray(event.topics) ? event.topics : []),
      ].filter(Boolean))],
    };
  }

  const phaseBoost = 1 + (Math.max(0, stockSnapshot.stockVolatility - 1) * (coin.isMeme ? 1.15 : 0.65));
  const eventBoost = coin.isMeme ? 0.82 : 0.56;
  const sentimentBoost = ((economy.fearGreed - 50) / 100) * (coin.isMeme ? 0.10 : 0.06);
  const cycleDrift = economy.cryptoBias * (coin.isMeme ? 0.55 : 0.35) * phaseBoost;
  const marketCarry = stockSnapshot.stockDailyReturnRate * (coin.isMeme ? 0.55 : 0.42);
  const rawReturnRate = cycleDrift + marketCarry + ((event.adjustment || 0) * eventBoost) + sentimentBoost;
  const returnRate = clampEconomyValue(
    rawReturnRate,
    coin.isMeme ? -0.95 : -0.80,
    coin.isMeme ? 3.20 : 2.00,
  );
  const direction = returnRate >= 0 ? "up" : "down";

  return {
    ...coin,
    event,
    returnRate,
    direction,
    isDelisted: false,
    movementText: formatSignedEconomyPercent(returnRate * 100),
    eventKicker: coin.isMeme
      ? (event.severity === "extreme" ? "초고변동 이벤트" : "밈코인 속보")
      : "코인 이슈",
    monthLabel: economy.monthLabel,
    phaseLabel: economy.phaseLabel,
    fearGreed: economy.fearGreed,
    topics: [...new Set([
      coin.label,
      coin.symbol,
      ...(Array.isArray(event.topics) ? event.topics : []),
    ].filter(Boolean))],
  };
}

function getFeaturedMemeCoinSnapshot(targetState = state) {
  return getCoinMarketSnapshot("DICE", targetState);
}

function getCoinDailyReturnRate(coinType, targetState = state) {
  return getCoinMarketSnapshot(coinType, targetState).returnRate;
}
