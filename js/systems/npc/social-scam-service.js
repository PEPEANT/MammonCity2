function createDefaultSocialScamState() {
  return {
    shownDay: 0,
    activeEventId: "",
    activeNpcId: "",
    seenEventIds: [],
    cooldownUntilDayByEventId: {},
    lastResult: null,
  };
}

function syncSocialScamState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return createDefaultSocialScamState();
  }

  const defaults = createDefaultSocialScamState();
  const currentState = targetState.socialScams && typeof targetState.socialScams === "object"
    ? targetState.socialScams
    : {};

  targetState.socialScams = {
    shownDay: Math.max(0, Math.round(Number(currentState.shownDay) || 0)),
    activeEventId: String(currentState.activeEventId || "").trim(),
    activeNpcId: String(currentState.activeNpcId || "").trim(),
    seenEventIds: Array.isArray(currentState.seenEventIds)
      ? currentState.seenEventIds.map((id) => String(id || "").trim()).filter(Boolean)
      : [...defaults.seenEventIds],
    cooldownUntilDayByEventId: currentState.cooldownUntilDayByEventId && typeof currentState.cooldownUntilDayByEventId === "object"
      ? Object.fromEntries(
          Object.entries(currentState.cooldownUntilDayByEventId).map(([eventId, day]) => [
            String(eventId || "").trim(),
            Math.max(0, Math.round(Number(day) || 0)),
          ]).filter(([eventId]) => Boolean(eventId))
        )
      : { ...defaults.cooldownUntilDayByEventId },
    lastResult: currentState.lastResult && typeof currentState.lastResult === "object"
      ? {
          eventId: String(currentState.lastResult.eventId || "").trim(),
          outcome: String(currentState.lastResult.outcome || "").trim(),
          amount: Math.max(0, Math.round(Number(currentState.lastResult.amount) || 0)),
          day: Math.max(0, Math.round(Number(currentState.lastResult.day) || 0)),
        }
      : null,
  };

  return targetState.socialScams;
}

const SOCIAL_SCAM_EVENTS = Object.freeze({
  "cult-recruiter": Object.freeze({
    id: "cult-recruiter",
    triggerId: "world-arrival",
    npcId: "cult-recruiter",
    sceneType: "social-scam-cult",
    speaker: "교회 권유하는 여자",
    title: "낯선 여자가 먼저 말을 건다",
    headlineBadge: "수상한 권유",
    headlineText: "집 앞에서 낯선 여자가 교회 이야기를 꺼냈다.",
    tags: Object.freeze(["사이비", "권유", "거리"]),
    introLines: Object.freeze([
      "낯선 여자가 먼저 다가오더니 미소를 지으며 길을 막아선다.",
      "\"혹시 잠깐 시간 괜찮으세요? 근처 교회에 같이 가시면 마음이 편해질 거예요.\"",
    ]),
    locationIds: Object.freeze([
      "apt-alley",
      "silver-home-front",
      "golden-home-front",
      "city-crossroads",
      "station-front",
      "downtown",
    ]),
    timeBands: Object.freeze(["day", "evening"]),
    lossAmount: 100000,
    cooldownDays: 5,
    bankTransactionTitle: "수상한 헌금 이체",
    bankTransactionNote: "낯선 여자의 권유를 따라갔다가 헌금 명목으로 돈이 빠져나갔다.",
    choices: Object.freeze([
      Object.freeze({
        id: "go-along",
        label: "같이 가본다",
        acceptScam: true,
      }),
      Object.freeze({
        id: "decline",
        label: "사양한다",
        cooldownDays: 2,
        resultTitle: "여자는 아쉬운 표정으로 물러난다",
        resultLines: Object.freeze([
          "정중히 거절하자 여자는 더 붙잡지 않고 발걸음을 돌린다.",
          "찝찝한 기분만 남긴 채 거리를 지나친다.",
        ]),
        resultTags: Object.freeze(["사이비", "거절"]),
        headline: Object.freeze({
          badge: "권유 거절",
          text: "수상한 종교 권유를 조용히 떨쳐냈다.",
        }),
        memory: Object.freeze({
          title: "집 근처에서 수상한 권유를 거절했다",
          body: "낯선 여자가 교회에 같이 가자고 했지만, 더 엮이지 않고 자리를 떴다.",
        }),
      }),
      Object.freeze({
        id: "ignore",
        label: "못 들은 척 지나간다",
        cooldownDays: 1,
        resultTitle: "뒤에서 한두 마디가 들리지만 그대로 지나친다",
        resultLines: Object.freeze([
          "못 들은 척 걸음을 재촉하자 뒤에서 몇 마디가 따라오지만 곧 멀어진다.",
          "오늘은 더 엮이지 않고 넘어갔다.",
        ]),
        resultTags: Object.freeze(["사이비", "무시"]),
        headline: Object.freeze({
          badge: "수상한 접근",
          text: "낯선 권유를 무시하고 자리를 벗어났다.",
        }),
      }),
    ]),
  }),
  "romance-scammer": Object.freeze({
    id: "romance-scammer",
    triggerId: "world-arrival",
    npcId: "romance-scammer",
    sceneType: "social-scam-romance",
    speaker: "번호를 묻는 여자",
    title: "낯선 여자가 먼저 말을 걸어온다",
    headlineBadge: "수상한 접근",
    headlineText: "처음 보는 여자가 갑자기 번호를 물어본다.",
    tags: Object.freeze(["꽃뱀", "사기", "접근"]),
    introLines: Object.freeze([
      "처음 보는 여자가 가까이 다가오더니 시선을 맞추며 말을 건다.",
      "\"저기 혹시 너무 잘생기셔서 그런데 번호 좀 주실 수 있을까요?\"",
    ]),
    locationIds: Object.freeze([
      "city-crossroads",
      "station-front",
      "downtown",
      "office-plaza",
    ]),
    timeBands: Object.freeze(["day", "evening"]),
    lossAmount: 500000,
    cooldownDays: 10,
    bankTransactionTitle: "합의금 이체",
    bankTransactionNote: "번호를 주고 만나다가 성추행 합의금 명목으로 돈이 빠져나갔다.",
    choices: Object.freeze([
      Object.freeze({
        id: "give-number",
        label: "번호를 준다",
        acceptScam: true,
      }),
      Object.freeze({
        id: "decline",
        label: "정중히 거절한다",
        cooldownDays: 3,
        resultTitle: "여자는 민망한 표정으로 웃으며 물러난다",
        resultLines: Object.freeze([
          "번호는 어렵다고 말하자 여자는 짧게 웃고 다른 쪽으로 발걸음을 돌린다.",
          "괜한 예감이 들어 더 오래 붙잡히지 않은 게 다행이라는 생각이 든다.",
        ]),
        resultTags: Object.freeze(["꽃뱀", "거절"]),
        headline: Object.freeze({
          badge: "접근 거절",
          text: "갑작스러운 번호 요청을 넘기고 자리를 벗어났다.",
        }),
        memory: Object.freeze({
          title: "수상한 번호 요청을 거절했다",
          body: "처음 보는 여자가 과하게 친근하게 굴었지만, 번호를 주지 않고 넘겼다.",
        }),
      }),
    ]),
  }),
});

function getSocialScamEventConfig(eventId = "") {
  return SOCIAL_SCAM_EVENTS[String(eventId || "").trim()] || null;
}

function getSocialScamTriggerLocationId(context = {}, targetState = state) {
  const contextLocationId = String(context?.locationId || "").trim();
  if (contextLocationId) {
    return contextLocationId;
  }

  return typeof getCurrentLocationId === "function"
    ? String(getCurrentLocationId(targetState) || "").trim()
    : "";
}

function getSocialScamChanceForEvent(event = null, targetState = state) {
  if (!event) {
    return 0;
  }

  if (event.id === "cult-recruiter") {
    const appearanceLevel = typeof getPlayerAppearanceLevel === "function"
      ? getPlayerAppearanceLevel(targetState)
      : 1;
    const originTierId = typeof getStartingOriginTierId === "function"
      ? getStartingOriginTierId(targetState)
      : String(targetState?.startingOrigin?.tierId || "").trim().toLowerCase();

    if (originTierId === "dirt" && appearanceLevel <= 1) {
      return 0.08;
    }
    if (originTierId === "dirt") {
      return 0.04;
    }
    if (appearanceLevel <= 1) {
      return 0.03;
    }
    return 0.01;
  }

  if (event.id === "romance-scammer") {
    return 0.008;
  }

  return 0;
}

function buildSocialScamLossBreakdownText(payment = null) {
  if (!payment || typeof payment !== "object") {
    return "";
  }

  const parts = [];
  if (payment.cashPaid > 0) {
    parts.push(`현금 ${formatMoney(payment.cashPaid)}`);
  }
  if (payment.bankPaid > 0) {
    parts.push(`계좌 ${formatMoney(payment.bankPaid)}`);
  }
  return parts.join(", ");
}

function spendSocialScamFunds(amount = 0, targetState = state, {
  transactionTitle = "수상한 이체",
  transactionNote = "",
  transactionType = "social-scam",
} = {}) {
  const lossAmount = Math.max(0, Math.round(Number(amount) || 0));
  const liquidFunds = typeof getTotalLiquidFunds === "function"
    ? getTotalLiquidFunds(targetState)
    : Math.max(0, Number(targetState?.money) || 0) + Math.max(0, Number(targetState?.bank?.balance) || 0);

  if (!lossAmount || liquidFunds < lossAmount) {
    return null;
  }

  const cashBalance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : Math.max(0, Number(targetState?.money) || 0);
  const cashPaid = Math.min(lossAmount, cashBalance);
  const bankPaid = Math.max(0, lossAmount - cashPaid);

  if (cashPaid > 0) {
    if (typeof spendCash === "function") {
      spendCash(cashPaid, targetState);
    } else if (targetState) {
      targetState.money = Math.max(0, (Number(targetState.money) || 0) - cashPaid);
    }
  }

  if (bankPaid > 0) {
    if (typeof spendBankBalance === "function") {
      spendBankBalance(bankPaid, { record: false }, targetState);
    } else if (typeof setBankBalance === "function" && typeof getBankBalance === "function") {
      setBankBalance(Math.max(0, getBankBalance(targetState) - bankPaid), targetState);
    } else if (targetState?.bank) {
      targetState.bank.balance = Math.max(0, (Number(targetState.bank.balance) || 0) - bankPaid);
    }

    if (typeof recordBankTransaction === "function") {
      recordBankTransaction({
        title: transactionTitle,
        amount: -bankPaid,
        direction: "out",
        type: transactionType,
        note: transactionNote,
        displayAmountLabel: `-${formatMoney(lossAmount)}`,
      }, targetState);
    }
  }

  return {
    totalPaid: lossAmount,
    cashPaid,
    bankPaid,
  };
}

function isSocialScamEventEligible(event = null, triggerId = "", context = {}, targetState = state) {
  if (!event || String(event.triggerId || "").trim() !== String(triggerId || "").trim()) {
    return false;
  }

  if (!targetState || targetState.scene !== "outside" || targetState.currentIncident || targetState.jobMiniGame) {
    return false;
  }

  const socialScamState = syncSocialScamState(targetState);
  const currentDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const locationId = getSocialScamTriggerLocationId(context, targetState);
  const timeBand = typeof getWorldTimeBand === "function"
    ? getWorldTimeBand(targetState)
    : "day";
  const lossAmount = Math.max(0, Math.round(Number(event.lossAmount) || 0));
  const liquidFunds = typeof getTotalLiquidFunds === "function"
    ? getTotalLiquidFunds(targetState)
    : Math.max(0, Number(targetState?.money) || 0) + Math.max(0, Number(targetState?.bank?.balance) || 0);

  if (socialScamState.activeEventId || socialScamState.shownDay === currentDay) {
    return false;
  }
  if ((socialScamState.cooldownUntilDayByEventId[event.id] || 0) >= currentDay) {
    return false;
  }
  if (Array.isArray(event.locationIds) && event.locationIds.length && !event.locationIds.includes(locationId)) {
    return false;
  }
  if (Array.isArray(event.timeBands) && event.timeBands.length && !event.timeBands.includes(timeBand)) {
    return false;
  }
  if (lossAmount <= 0 || liquidFunds < lossAmount) {
    return false;
  }

  return getSocialScamChanceForEvent(event, targetState) > 0;
}

function buildSocialScamScene(event = null, triggerId = "", context = {}, targetState = state) {
  if (!event) {
    return null;
  }

  const npcConfig = typeof getNpcConfig === "function"
    ? getNpcConfig(event.npcId)
    : null;
  const locationId = getSocialScamTriggerLocationId(context, targetState);
  const locationLabel = context?.locationLabel
    || (typeof getWorldLocationConfig === "function"
      ? getWorldLocationConfig(locationId, targetState?.day)?.label || ""
      : "")
    || (typeof getCurrentLocationLabel === "function"
      ? getCurrentLocationLabel(targetState)
      : "")
    || locationId;

  return {
    sceneType: String(event.sceneType || "social-scam").trim() || "social-scam",
    eventId: event.id,
    sourceTriggerId: String(triggerId || event.triggerId || "").trim(),
    npcId: String(event.npcId || "").trim(),
    label: String(event.speaker || npcConfig?.name || "낯선 사람").trim(),
    speaker: String(event.speaker || npcConfig?.name || "낯선 사람").trim(),
    title: String(event.title || "").trim(),
    tags: Array.isArray(event.tags) ? [...event.tags] : ["사기", "접근"],
    introLines: Array.isArray(event.introLines) ? [...event.introLines] : [],
    backgroundConfig: null,
    plannedCost: Math.max(0, Math.round(Number(event.lossAmount) || 0)),
    venueLabel: locationLabel,
    returnScene: "outside",
    returnLocationId: locationId,
    choices: Array.isArray(event.choices)
      ? event.choices.map((choice) => cloneRomanceSceneChoice(choice)).filter(Boolean)
      : [],
    playerActor: {
      src: CHARACTER_ART?.player?.standing || "",
      alt: "player-social-scam",
      left: 28,
      bottom: 4,
      height: 86,
      zIndex: 2,
    },
    npcActor: {
      src: npcConfig?.art || "",
      alt: event.npcId || "social-scam-npc",
      left: 72,
      bottom: 5,
      height: 88,
      zIndex: 2,
    },
  };
}

function buildSocialScamAcceptedOutcome(event = null, scene = null, payment = null) {
  const paidAmount = Math.max(0, Math.round(Number(payment?.totalPaid) || 0));
  const breakdownText = buildSocialScamLossBreakdownText(payment);

  if (event?.id === "cult-recruiter") {
    return {
      title: "같이 따라갔다가 헌금을 뜯겼다",
      lines: [
        `정신을 차리고 나오니 헌금 명목으로 ${formatMoney(paidAmount)}이 빠져나가 있었다.`,
        breakdownText ? `빠져나간 돈은 ${breakdownText} 쪽에서 메워졌다.` : "생각보다 허무하게 돈만 뜯기고 끝났다.",
      ],
      tags: ["사이비", "헌금", "손실"],
      headline: {
        badge: "헌금 갈취",
        text: `수상한 권유를 따라갔다가 ${formatMoney(paidAmount)}을 잃었다.`,
      },
      memory: {
        title: "수상한 모임에서 돈을 뜯겼다",
        body: `${scene?.venueLabel || "거리"}에서 말을 건 여자를 따라갔다가 헌금 명목으로 ${formatMoney(paidAmount)}을 잃었다.`,
      },
    };
  }

  return {
    title: "번호를 준 뒤 합의금을 뜯겼다",
    lines: [
      `번호를 주고 몇 번 만난 뒤, 갑자기 성추행 합의금 명목으로 ${formatMoney(paidAmount)}이 빠져나갔다.`,
      breakdownText ? `빠져나간 돈은 ${breakdownText} 쪽에서 끌어다 메웠다.` : "좋은 일인 줄 알았는데 남은 건 찜찜한 손실뿐이다.",
    ],
    tags: ["꽃뱀", "합의금", "손실"],
    headline: {
      badge: "합의금 갈취",
      text: `수상한 만남 끝에 ${formatMoney(paidAmount)}을 잃었다.`,
    },
    memory: {
      title: "번호를 줬다가 합의금을 뜯겼다",
      body: `${scene?.venueLabel || "거리"}에서 번호를 준 뒤 엮였다가 합의금 명목으로 ${formatMoney(paidAmount)}을 잃었다.`,
    },
  };
}

function pickSocialScamEvent(candidates = []) {
  const triggeredEntries = candidates.filter(({ chance }) => Math.random() <= chance);
  if (!triggeredEntries.length) {
    return null;
  }

  const totalWeight = triggeredEntries.reduce((sum, entry) => sum + Math.max(0, Number(entry.chance) || 0), 0);
  if (totalWeight <= 0) {
    return triggeredEntries[0]?.event || null;
  }

  let roll = Math.random() * totalWeight;
  for (const entry of triggeredEntries) {
    roll -= Math.max(0, Number(entry.chance) || 0);
    if (roll <= 0) {
      return entry.event;
    }
  }

  return triggeredEntries[0]?.event || null;
}

function tryStartSocialScamEvent(triggerId = "", context = {}, targetState = state) {
  const normalizedTriggerId = String(triggerId || "").trim();
  if (!normalizedTriggerId) {
    return false;
  }

  const candidates = Object.values(SOCIAL_SCAM_EVENTS)
    .filter((event) => isSocialScamEventEligible(event, normalizedTriggerId, context, targetState))
    .map((event) => ({
      event,
      chance: getSocialScamChanceForEvent(event, targetState),
    }))
    .filter(({ chance }) => chance > 0);
  if (!candidates.length) {
    return false;
  }

  const selectedEvent = pickSocialScamEvent(candidates);
  if (!selectedEvent) {
    return false;
  }

  const nextScene = buildSocialScamScene(selectedEvent, normalizedTriggerId, context, targetState);
  if (!nextScene) {
    return false;
  }

  const currentDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const socialScamState = syncSocialScamState(targetState);
  socialScamState.shownDay = currentDay;
  socialScamState.activeEventId = selectedEvent.id;
  socialScamState.activeNpcId = selectedEvent.npcId;
  if (!socialScamState.seenEventIds.includes(selectedEvent.id)) {
    socialScamState.seenEventIds = [...socialScamState.seenEventIds, selectedEvent.id];
  }

  setRomanceActiveSceneSnapshot(nextScene, targetState);
  targetState.scene = "romance";
  targetState.headline = {
    badge: String(selectedEvent.headlineBadge || "수상한 접근").trim(),
    text: String(selectedEvent.headlineText || selectedEvent.title || "").trim(),
  };
  return true;
}

function applySocialScamChoice(choice = null, scene = null, targetState = state) {
  if (!choice || !scene) {
    return false;
  }

  const event = getSocialScamEventConfig(scene.eventId);
  if (!event) {
    return false;
  }

  const socialScamState = syncSocialScamState(targetState);
  const currentDay = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const cooldownDays = Math.max(
    0,
    Math.round(Number(choice.cooldownDays) || Number(event.cooldownDays) || 0),
  );
  if (cooldownDays > 0) {
    socialScamState.cooldownUntilDayByEventId[event.id] = currentDay + cooldownDays;
  }

  let resultTitle = String(choice.resultTitle || scene.title || "").trim();
  let resultLines = Array.isArray(choice.resultLines) && choice.resultLines.length
    ? [...choice.resultLines]
    : [...(scene.introLines || [])];
  let resultTags = Array.isArray(choice.resultTags) && choice.resultTags.length
    ? [...choice.resultTags]
    : [...(scene.tags || [])];
  let resultHeadline = choice.headline && typeof choice.headline === "object"
    ? {
        badge: String(choice.headline.badge || "").trim(),
        text: String(choice.headline.text || "").trim(),
      }
    : null;
  let memoryConfig = choice.memory && typeof choice.memory === "object"
    ? {
        title: String(choice.memory.title || "").trim(),
        body: String(choice.memory.body || "").trim(),
      }
    : null;
  let amountPaid = 0;

  if (choice.acceptScam) {
    const payment = spendSocialScamFunds(event.lossAmount, targetState, {
      transactionTitle: event.bankTransactionTitle,
      transactionNote: event.bankTransactionNote,
      transactionType: "social-scam",
    });
    const acceptedOutcome = buildSocialScamAcceptedOutcome(event, scene, payment);

    resultTitle = String(acceptedOutcome.title || resultTitle).trim();
    resultLines = Array.isArray(acceptedOutcome.lines) && acceptedOutcome.lines.length
      ? [...acceptedOutcome.lines]
      : resultLines;
    resultTags = Array.isArray(acceptedOutcome.tags) && acceptedOutcome.tags.length
      ? [...acceptedOutcome.tags]
      : resultTags;
    resultHeadline = acceptedOutcome.headline && typeof acceptedOutcome.headline === "object"
      ? {
          badge: String(acceptedOutcome.headline.badge || "").trim(),
          text: String(acceptedOutcome.headline.text || "").trim(),
        }
      : resultHeadline;
    memoryConfig = acceptedOutcome.memory && typeof acceptedOutcome.memory === "object"
      ? {
          title: String(acceptedOutcome.memory.title || "").trim(),
          body: String(acceptedOutcome.memory.body || "").trim(),
        }
      : memoryConfig;
    amountPaid = Math.max(0, Math.round(Number(payment?.totalPaid) || 0));
  }

  socialScamState.lastResult = {
    eventId: String(event.id || "").trim(),
    outcome: String(choice.id || "").trim(),
    amount: amountPaid,
    day: currentDay,
  };

  if (resultHeadline) {
    targetState.headline = resultHeadline;
  }
  if (memoryConfig?.title && memoryConfig?.body && typeof recordActionMemory === "function") {
    recordActionMemory(memoryConfig.title, memoryConfig.body, {
      type: "risk",
      source: scene.venueLabel || scene.label || "거리",
      tags: ["social-scam", event.id, ...(resultTags || [])],
    });
  }

  setRomanceActiveSceneSnapshot({
    ...scene,
    title: resultTitle,
    introLines: resultLines,
    tags: resultTags,
    choices: [],
    resolvedChoiceId: String(choice.id || "").trim(),
    sceneOutcomeType: "social-scam-finished",
    plannedCost: 0,
  }, targetState);

  return true;
}

function chooseSocialScamChoice(index = 0, targetState = state) {
  const scene = syncRomanceSceneState(targetState);
  const choices = Array.isArray(scene?.choices) ? scene.choices : [];
  const choice = choices[index];
  if (!scene || !choice) {
    return false;
  }

  return applySocialScamChoice(choice, scene, targetState);
}

function completeSocialScamScene(targetState = state) {
  const scene = syncRomanceSceneState(targetState);
  const sceneType = String(scene?.sceneType || "").trim().toLowerCase();
  if (!scene || !sceneType.startsWith("social-scam")) {
    return false;
  }

  const socialScamState = syncSocialScamState(targetState);
  socialScamState.activeEventId = "";
  socialScamState.activeNpcId = "";

  const returnScene = String(scene.returnScene || "outside").trim() || "outside";
  const returnLocationId = String(scene.returnLocationId || "").trim();

  clearRomanceActiveSceneSnapshot(targetState);
  targetState.scene = returnScene;

  if (returnScene === "outside" && typeof syncWorldState === "function") {
    const worldState = syncWorldState(targetState);
    if (returnLocationId) {
      worldState.currentLocation = returnLocationId;
      if (typeof getWorldLocationDistrictId === "function") {
        worldState.currentDistrict = getWorldLocationDistrictId(
          returnLocationId,
          targetState?.day || getCurrentDayNumber(),
        ) || worldState.currentDistrict;
      }
    }
  }

  return true;
}
