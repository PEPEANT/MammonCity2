const CASINO_ROUTES = Object.freeze({
  home: "casino/home",
  exchange: "casino/exchange",
  blackjack: "casino/blackjack",
  slots: "casino/slots",
});

const CASINO_EXCHANGE_MIN_AMOUNT = 1000;
const CASINO_EXIT_SCAM_THRESHOLD = 10000000;
const CASINO_BLACKJACK_MIN_BET = 1000;
const CASINO_BLACKJACK_DECK_COUNT = 6;
const CASINO_SLOT_MIN_BET = 10000;

function createDefaultCasinoBlackjackState() {
  return {
    phase: "betting",
    dealerHidden: true,
    bet: 0,
    playerAcePreference: 11,
    playerHand: [],
    dealerHand: [],
    shoe: [],
    messageTitle: "",
    messageBody: "",
    resultTone: "accent",
    outcome: "",
  };
}

function createDefaultCasinoSlotsState() {
  return {
    phase: "idle",
    bet: 100000,
    spinBet: 0,
    lastWin: 0,
    lastMessage: "레버를 당겨주세요!",
    reelSymbolIds: ["dice", "dice", "dice"],
    resultTone: "accent",
  };
}

function createDefaultCasinoState() {
  return {
    chips: 0,
    usedToday: false,
    exchangeDraft: {
      buy: "",
      sell: "",
    },
    blackjack: createDefaultCasinoBlackjackState(),
    slots: createDefaultCasinoSlotsState(),
    scam: {
      active: false,
      triggeredDay: 0,
      lostAmount: 0,
    },
    lastResult: null,
  };
}

function cloneCasinoCard(card) {
  if (!card || typeof card !== "object") {
    return null;
  }
  return {
    suit: String(card.suit || ""),
    value: String(card.value || ""),
  };
}

function cloneCasinoCardList(cards) {
  return Array.isArray(cards)
    ? cards.map((card) => cloneCasinoCard(card)).filter(Boolean)
    : [];
}

function syncCasinoBlackjackState(rawState) {
  const defaults = createDefaultCasinoBlackjackState();
  const existing = rawState && typeof rawState === "object" ? rawState : {};

  return {
    ...defaults,
    ...existing,
    dealerHidden: typeof existing.dealerHidden === "boolean"
      ? existing.dealerHidden
      : defaults.dealerHidden,
    bet: Math.max(0, Math.round(Number(existing.bet) || 0)),
    playerAcePreference: existing.playerAcePreference === 1 ? 1 : 11,
    playerHand: cloneCasinoCardList(existing.playerHand),
    dealerHand: cloneCasinoCardList(existing.dealerHand),
    shoe: cloneCasinoCardList(existing.shoe),
    messageTitle: String(existing.messageTitle || ""),
    messageBody: String(existing.messageBody || ""),
    resultTone: String(existing.resultTone || defaults.resultTone),
    outcome: String(existing.outcome || ""),
  };
}

function syncCasinoSlotsState(rawState) {
  const defaults = createDefaultCasinoSlotsState();
  const existing = rawState && typeof rawState === "object" ? rawState : {};
  const reelSymbolIds = Array.isArray(existing.reelSymbolIds)
    ? existing.reelSymbolIds.slice(0, 3).map((symbolId) => String(symbolId || "dice"))
    : [...defaults.reelSymbolIds];

  while (reelSymbolIds.length < 3) {
    reelSymbolIds.push("dice");
  }

  return {
    ...defaults,
    ...existing,
    phase: String(existing.phase || defaults.phase) === "spinning" ? "spinning" : "idle",
    bet: Math.max(CASINO_SLOT_MIN_BET, Math.round(Number(existing.bet) || defaults.bet)),
    spinBet: Math.max(0, Math.round(Number(existing.spinBet) || 0)),
    lastWin: Math.max(0, Math.round(Number(existing.lastWin) || 0)),
    lastMessage: String(existing.lastMessage || defaults.lastMessage),
    reelSymbolIds,
    resultTone: String(existing.resultTone || defaults.resultTone),
  };
}

function syncCasinoState(targetState = state) {
  const defaults = createDefaultCasinoState();
  const existing = targetState?.casino && typeof targetState.casino === "object"
    ? targetState.casino
    : {};

  targetState.casino = {
    ...defaults,
    ...existing,
    chips: Math.max(0, Math.round(Number(existing.chips) || 0)),
    usedToday: Boolean(
      typeof targetState?.casinoUsedToday === "boolean"
        ? targetState.casinoUsedToday
        : existing.usedToday
    ),
    exchangeDraft: {
      ...defaults.exchangeDraft,
      ...(existing.exchangeDraft || {}),
    },
    blackjack: syncCasinoBlackjackState(existing.blackjack),
    slots: syncCasinoSlotsState(existing.slots),
    scam: existing.scam && typeof existing.scam === "object"
      ? {
          active: Boolean(existing.scam.active),
          triggeredDay: Math.max(0, Math.round(Number(existing.scam.triggeredDay) || 0)),
          lostAmount: Math.max(0, Math.round(Number(existing.scam.lostAmount) || 0)),
        }
      : { ...defaults.scam },
    lastResult: existing.lastResult && typeof existing.lastResult === "object"
      ? {
          title: String(existing.lastResult.title || ""),
          body: String(existing.lastResult.body || ""),
          tone: String(existing.lastResult.tone || "accent"),
          delta: Math.round(Number(existing.lastResult.delta) || 0),
        }
      : null,
  };

  targetState.casinoUsedToday = targetState.casino.usedToday;
  return targetState.casino;
}

function resetCasinoBlackjackRound(targetState = state) {
  const casinoState = syncCasinoState(targetState);
  casinoState.blackjack = createDefaultCasinoBlackjackState();
  return casinoState.blackjack;
}

function setCasinoUsedToday(value, targetState = state) {
  const casinoState = syncCasinoState(targetState);
  casinoState.usedToday = Boolean(value);
  targetState.casinoUsedToday = casinoState.usedToday;
  return casinoState.usedToday;
}

function getCasinoChipBalance(targetState = state) {
  return syncCasinoState(targetState).chips;
}

function getCasinoCashBalance(targetState = state) {
  return Math.max(0, Math.round(Number(targetState?.money) || 0));
}

function hasActiveCasinoBlackjackRound(targetState = state) {
  const blackjackState = syncCasinoState(targetState).blackjack;
  return blackjackState.phase === "player-turn" || blackjackState.phase === "dealer-turn";
}

function canUseCasinoExchange(targetState = state) {
  const blackjackState = syncCasinoState(targetState).blackjack;
  return blackjackState.phase === "betting" || blackjackState.phase === "result";
}

function isCasinoScamActive(targetState = state) {
  return Boolean(syncCasinoState(targetState).scam?.active);
}

function activateCasinoExitScam(targetState = state) {
  const casinoState = syncCasinoState(targetState);
  const lostAmount = Math.max(0, Math.round(Number(casinoState.chips) || 0));

  casinoState.scam = {
    active: true,
    triggeredDay: Math.max(1, Math.round(Number(targetState?.day) || 1)),
    lostAmount,
  };
  casinoState.chips = 0;
  return casinoState.scam;
}
