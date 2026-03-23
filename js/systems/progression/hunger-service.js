// Hunger and emergency recovery are a progression concern, not core logic.js
// orchestration. Keep the shared state helpers here so UI and gameplay read the
// same rules.

function clampHungerValue(value) {
  const hungerMax = typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3;
  return Math.max(0, Math.min(hungerMax, Math.round(Number(value) || 0)));
}

function createDefaultHungerState() {
  const hungerMax = typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3;
  return {
    value: hungerMax,
    decayProgressMinutes: 0,
    version: typeof HUNGER_SYSTEM_VERSION === "number" ? HUNGER_SYSTEM_VERSION : 1,
  };
}

function ensureHungerState(targetState = state) {
  const defaults = createDefaultHungerState();
  if (!targetState || typeof targetState !== "object") {
    return defaults;
  }

  const hungerMax = typeof HUNGER_MAX === "number" ? HUNGER_MAX : defaults.value;
  const hungerVersion = typeof HUNGER_SYSTEM_VERSION === "number" ? HUNGER_SYSTEM_VERSION : defaults.version;
  const storedVersion = Math.max(0, Math.round(Number(targetState.hungerVersion) || 0));
  const activeVersion = storedVersion || 1;

  if (activeVersion < hungerVersion) {
    const previousMax = activeVersion <= 1 && typeof LEGACY_HUNGER_MAX === "number"
      ? LEGACY_HUNGER_MAX
      : hungerMax;
    const previousInterval = activeVersion <= 1 && typeof LEGACY_HUNGER_DECAY_INTERVAL_MINUTES === "number"
      ? LEGACY_HUNGER_DECAY_INTERVAL_MINUTES
      : HUNGER_DECAY_INTERVAL_MINUTES;
    const previousValue = Math.max(0, Math.min(previousMax, Math.round(Number(targetState.hunger) || previousMax)));
    const previousProgress = Math.max(0, Math.min(previousInterval, Math.round(Number(targetState.hungerDecayProgress) || 0)));
    const valueRatio = previousMax > 0 ? previousValue / previousMax : 1;
    const progressRatio = previousInterval > 0 ? previousProgress / previousInterval : 0;

    targetState.hunger = clampHungerValue(Math.round(valueRatio * hungerMax));
    targetState.hungerDecayProgress = Math.round(progressRatio * HUNGER_DECAY_INTERVAL_MINUTES);
  }

  targetState.hunger = clampHungerValue(targetState.hunger ?? defaults.value);
  targetState.hungerDecayProgress = Math.max(0, Math.round(Number(targetState.hungerDecayProgress) || 0));
  targetState.hungerVersion = hungerVersion;

  return {
    value: targetState.hunger,
    decayProgressMinutes: targetState.hungerDecayProgress,
    version: targetState.hungerVersion,
  };
}

function getHungerStatusTone(targetState = state) {
  const hungerValue = ensureHungerState(targetState).value;
  const hungerMax = typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3;
  const steadyThreshold = Math.max(2, Math.ceil(hungerMax * 0.6));
  const hungryThreshold = Math.max(1, Math.ceil(hungerMax * 0.25));

  if (hungerValue >= hungerMax) {
    return "sated";
  }
  if (hungerValue >= steadyThreshold) {
    return "steady";
  }
  if (hungerValue >= hungryThreshold) {
    return "hungry";
  }
  return "critical";
}

function getHungerStatusLabel(targetState = state) {
  const tone = getHungerStatusTone(targetState);
  if (tone === "sated") {
    return "든든";
  }
  if (tone === "steady") {
    return "보통";
  }
  if (tone === "hungry") {
    return "공복";
  }
  return "위험";
}

function restoreHunger(amount = 0, targetState = state, { resetProgress = true } = {}) {
  const hungerState = ensureHungerState(targetState);
  const nextValue = clampHungerValue(hungerState.value + Math.max(0, Math.round(Number(amount) || 0)));
  targetState.hunger = nextValue;
  if (resetProgress) {
    targetState.hungerDecayProgress = 0;
  }
  return targetState.hunger;
}

function getTotalLiquidFunds(targetState = state) {
  const cash = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : Math.max(0, Number(targetState?.money) || 0);
  const bankBalance = typeof getBankDomainState === "function"
    ? Math.max(0, Number(getBankDomainState(targetState).balance) || 0)
    : Math.max(0, Number(targetState?.bank?.balance) || 0);
  return cash + bankBalance;
}

function spendEmergencyFunds(amount, targetState = state) {
  const cost = Math.max(0, Math.round(Number(amount) || 0));
  if (!cost || getTotalLiquidFunds(targetState) < cost) {
    return null;
  }

  const cashOnHand = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : Math.max(0, Number(targetState?.money) || 0);
  const cashPaid = Math.min(cost, cashOnHand);
  const bankPaid = Math.max(0, cost - cashPaid);

  if (cashPaid > 0) {
    if (typeof spendCash === "function") {
      spendCash(cashPaid, targetState);
    } else if (targetState) {
      targetState.money = Math.max(0, (Number(targetState.money) || 0) - cashPaid);
    }
  }

  if (bankPaid > 0) {
    if (typeof patchBankDomainState === "function" && typeof getBankDomainState === "function") {
      const bankState = getBankDomainState(targetState);
      patchBankDomainState(targetState, {
        balance: Math.max(0, bankState.balance - bankPaid),
      });
    } else if (targetState?.bank) {
      targetState.bank.balance = Math.max(0, (Number(targetState.bank.balance) || 0) - bankPaid);
    }

    if (typeof recordBankTransaction === "function") {
      recordBankTransaction({
        title: "응급 진료비",
        amount: -bankPaid,
        direction: "out",
        type: "emergency",
        note: "배고픔으로 배금병원 응급 이송",
      }, targetState);
    }
  }

  return {
    totalPaid: cost,
    cashPaid,
    bankPaid,
  };
}

function buildBankruptcyEndingSummary() {
  const originLabel = getStartingOriginLabel();
  return {
    noRanking: true,
    originLabel,
    originTierId: getStartingOriginTierId(),
    title: "당신은 파산하였습니다",
    speaker: "배금병원 응급실",
    tags: ["파산", "배고픔", "응급실", originLabel],
    character: "",
    backgroundConfig: typeof DAY01_WORLD_BAEGEUM_HOSPITAL_BACKGROUND !== "undefined"
      ? DAY01_WORLD_BAEGEUM_HOSPITAL_BACKGROUND
      : null,
    lines: [
      "배고픔이 바닥나 배금병원으로 실려 갔다.",
      `출신 수저 ${originLabel}`,
      `${formatMoney(HUNGER_HOSPITAL_COST)} 진료비를 낼 돈이 남아 있지 않았다.`,
      "이번 판은 여기서 끝난다.",
    ],
  };
}

function triggerBankruptcyEnding(targetState = state) {
  if (!targetState) {
    return false;
  }

  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(targetState);
  }
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(targetState);
  }
  targetState._characterPanelOpen = false;
  targetState.scene = "ending";
  targetState.currentOffer = null;
  targetState.currentIncident = null;
  targetState.endingSummary = buildBankruptcyEndingSummary();
  targetState.headline = {
    badge: "파산",
    text: "응급실 비용을 감당하지 못해 이번 판이 그대로 끝났다.",
  };
  return true;
}

function resolveHungerEmergency(targetState = state) {
  if (!targetState || targetState.scene === "ending" || targetState.scene === "ranking") {
    return false;
  }

  const hungerState = ensureHungerState(targetState);
  if (hungerState.value > 0) {
    return false;
  }

  if (getTotalLiquidFunds(targetState) < HUNGER_HOSPITAL_COST) {
    if (typeof recordActionMemory === "function") {
      recordActionMemory("응급실 비용을 감당하지 못했다", "배고픔이 0이 되어 배금병원으로 실려 갔지만 진료비를 낼 돈이 남아 있지 않았다.", {
        type: "event",
        source: "배금병원",
        tags: ["배고픔", "파산", "병원"],
      });
    }
    triggerBankruptcyEnding(targetState);
    return true;
  }

  const payment = spendEmergencyFunds(HUNGER_HOSPITAL_COST, targetState);
  const paidFromBank = Boolean(payment?.bankPaid);
  restoreHunger(typeof HUNGER_MAX === "number" ? HUNGER_MAX : 3, targetState, { resetProgress: true });

  if (typeof resetDialogueState === "function") {
    resetDialogueState(targetState);
  }
  if (typeof closeMemoryPanel === "function") {
    closeMemoryPanel(targetState);
  }
  if (typeof closeInventoryPanel === "function") {
    closeInventoryPanel(targetState);
  }

  targetState._characterPanelOpen = false;
  targetState.scene = "outside";
  syncWorldState(targetState);
  targetState.world.currentLocation = "baegeum-hospital";
  targetState.world.currentDistrict = typeof getWorldLocationDistrictId === "function"
    ? getWorldLocationDistrictId("baegeum-hospital", targetState.day)
    : targetState.world.currentDistrict;
  clearPendingTravelState(targetState);
  clearAlleyNpcState(targetState);
  clearWanderResultState(targetState);
  targetState.headline = {
    badge: "응급 이송",
    text: paidFromBank
      ? `배고픔이 0이 되어 배금병원으로 옮겨졌고 진료비 ${formatMoney(HUNGER_HOSPITAL_COST)}이 현금과 계좌에서 빠져나갔다.`
      : `배고픔이 0이 되어 배금병원으로 옮겨졌고 진료비 ${formatMoney(HUNGER_HOSPITAL_COST)}이 빠져나갔다.`,
  };

  return true;
}

function applyHungerTimePassage(minutes = 0, targetState = state) {
  const normalizedMinutes = Math.max(0, Math.round(Number(minutes) || 0));
  if (!normalizedMinutes || !targetState || targetState.scene === "ending" || targetState.scene === "ranking") {
    return false;
  }

  ensureHungerState(targetState);
  targetState.hungerDecayProgress += normalizedMinutes;

  while (targetState.hungerDecayProgress >= HUNGER_DECAY_INTERVAL_MINUTES && targetState.hunger > 0) {
    targetState.hungerDecayProgress -= HUNGER_DECAY_INTERVAL_MINUTES;
    targetState.hunger = Math.max(0, targetState.hunger - 1);

    if (targetState.hunger <= 0) {
      targetState.hungerDecayProgress = 0;
      return resolveHungerEmergency(targetState);
    }
  }

  return false;
}
