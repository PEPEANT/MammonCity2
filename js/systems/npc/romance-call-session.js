function cloneRomanceCallSessionChoice(choice = null) {
  if (!choice || typeof choice !== "object") {
    return null;
  }

  return {
    ...choice,
    id: String(choice.id || "").trim(),
    label: String(choice.label || "").trim(),
    affectionDelta: Math.round(Number(choice.affectionDelta) || 0),
    happinessDelta: Math.round(Number(choice.happinessDelta) || 0),
    responseLines: Array.isArray(choice.responseLines)
      ? choice.responseLines.map((line) => String(line || "").trim()).filter(Boolean)
      : [],
  };
}

function cloneRomanceCallSessionBeat(beat = null) {
  if (!beat || typeof beat !== "object") {
    return null;
  }

  return {
    ...beat,
    id: String(beat.id || "").trim(),
    narrator: String(beat.narrator || "").trim(),
    speaker: String(beat.speaker || "").trim(),
    lines: Array.isArray(beat.lines)
      ? beat.lines.map((line) => String(line || "").trim()).filter(Boolean)
      : [],
    choices: Array.isArray(beat.choices)
      ? beat.choices.map((choice) => cloneRomanceCallSessionChoice(choice)).filter(Boolean)
      : [],
  };
}

function cloneRomanceCallSessionPhoneSnapshot(phoneSnapshot = null) {
  if (!phoneSnapshot || typeof phoneSnapshot !== "object") {
    return null;
  }

  return {
    phoneView: String(phoneSnapshot.phoneView || "home").trim() || "home",
    minimized: Boolean(phoneSnapshot.minimized),
    stageExpanded: Boolean(phoneSnapshot.stageExpanded),
  };
}

function cloneRomanceCallSessionSnapshot(session = null) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const phase = String(session.phase || "beat").trim().toLowerCase();

  return {
    ...session,
    active: Boolean(session.active),
    id: String(session.id || "").trim(),
    type: String(session.type || "post-date-call").trim(),
    sourceSceneType: String(session.sourceSceneType || "").trim().toLowerCase(),
    contactId: String(session.contactId || "").trim(),
    npcId: String(session.npcId || "").trim(),
    label: String(session.label || "").trim(),
    title: String(session.title || "").trim(),
    tone: String(session.tone || "warm").trim(),
    previousScene: String(session.previousScene || "room").trim() || "room",
    currentBeatIndex: Math.max(0, Math.round(Number(session.currentBeatIndex) || 0)),
    phase: ["beat", "response", "done"].includes(phase) ? phase : "beat",
    awaitingInput: session.awaitingInput !== false,
    awaitingChoice: Boolean(session.awaitingChoice),
    selectedChoiceId: String(session.selectedChoiceId || "").trim(),
    totalHappinessDelta: Math.round(Number(session.totalHappinessDelta) || 0),
    totalAffinityDelta: Math.round(Number(session.totalAffinityDelta) || 0),
    backgroundConfig: session.backgroundConfig && typeof session.backgroundConfig === "object"
      ? { ...session.backgroundConfig }
      : null,
    phoneSnapshot: cloneRomanceCallSessionPhoneSnapshot(session.phoneSnapshot),
    beats: Array.isArray(session.beats)
      ? session.beats.map((beat) => cloneRomanceCallSessionBeat(beat)).filter(Boolean)
      : [],
    result: session.result && typeof session.result === "object"
      ? { ...session.result }
      : null,
  };
}

function getRomanceCallRelationshipStage(contact = null) {
  const normalizedStage = String(contact?.relationshipStage || "").trim().toLowerCase();
  return normalizedStage || (contact?.isGirlfriend ? "serious" : "dating");
}

function buildRomanceGirlfriendSmallTalkCallScene({
  contactId = "",
  contact = null,
  config = null,
  targetState = state,
} = {}) {
  if (!contactId || !contact || !config) {
    return null;
  }

  const dialoguePool = typeof getRomanceGirlfriendPhoneSmalltalkLines === "function"
    ? getRomanceGirlfriendPhoneSmalltalkLines(config.npcId)
    : [];
  const leadLine = dialoguePool.length
    ? (typeof sample === "function" ? sample(dialoguePool) : dialoguePool[0])
    : `${config.label}와 짧게 통화를 하며 오늘 있었던 일을 나눴다.`;
  const relationshipStage = getRomanceCallRelationshipStage(contact);
  const relationshipLine = relationshipStage === "serious"
    ? `${config.label}의 통화 너머로 "오늘도 네 생각이 많이 났어."라는 말이 자연스럽게 따라온다.`
    : `${config.label}는 다음에 또 보자는 말을 남기고 조용히 통화를 마무리한다.`;

  return {
    contactId,
    npcId: config.npcId,
    label: config.label,
    title: `${config.label}와 통화`,
    lines: [
      leadLine,
      relationshipLine,
    ],
    tags: ["통화", "연애"],
    previousScene: String(targetState?.scene || "").trim() || "room",
    headline: `${config.label}와 짧게 통화를 나눴다.`,
  };
}

function buildRomancePostDateCallSessionBlueprint({
  contactId = "",
  contact = null,
  config = null,
  sourceScene = null,
  targetState = state,
} = {}) {
  if (!contactId || !contact || !config) {
    return null;
  }

  const relationshipStage = getRomanceCallRelationshipStage(contact);
  const packs = typeof getRomancePostDateCallPacks === "function"
    ? getRomancePostDateCallPacks({ relationshipStage })
    : [];
  const selectedPack = packs.length
    ? (typeof sample === "function" ? sample(packs) : packs[0])
    : null;

  if (!selectedPack) {
    return null;
  }

  return cloneRomanceCallSessionSnapshot({
    id: `${selectedPack.id}:${contactId}:${Math.max(1, Math.round(Number(targetState?.day) || 1))}`,
    active: true,
    type: "post-date-call",
    sourceSceneType: String(sourceScene?.sceneType || targetState?.romanceScene?.sceneType || "").trim().toLowerCase(),
    contactId,
    npcId: config.npcId,
    label: config.label,
    title: selectedPack.title || `${config.label}와 통화`,
    tone: String(selectedPack.tone || "warm").trim(),
    previousScene: "room",
    currentBeatIndex: 0,
    phase: "beat",
    awaitingInput: true,
    awaitingChoice: false,
    selectedChoiceId: "",
    totalHappinessDelta: 0,
    totalAffinityDelta: 0,
    backgroundConfig: sourceScene?.backgroundConfig && typeof sourceScene.backgroundConfig === "object"
      ? { ...sourceScene.backgroundConfig }
      : null,
    phoneSnapshot: {
      phoneView: String(targetState?.phoneView || "home").trim() || "home",
      minimized: Boolean(targetState?.phoneMinimized),
      stageExpanded: Boolean(targetState?.phoneStageExpanded),
    },
    beats: Array.isArray(selectedPack.beats) ? selectedPack.beats : [],
    result: null,
  });
}

function getRomanceCallSessionCurrentBeat(session = null) {
  const safeSession = cloneRomanceCallSessionSnapshot(session);
  if (!safeSession || !Array.isArray(safeSession.beats) || !safeSession.beats.length) {
    return null;
  }

  return safeSession.beats[safeSession.currentBeatIndex] || null;
}

function getRomanceCallSessionSelectedChoice(session = null) {
  const safeSession = cloneRomanceCallSessionSnapshot(session);
  const currentBeat = getRomanceCallSessionCurrentBeat(safeSession);
  if (!safeSession || !currentBeat) {
    return null;
  }

  return (currentBeat.choices || []).find((choice) => choice.id === safeSession.selectedChoiceId) || null;
}

function buildRomanceCallSessionProgressKey(session = null) {
  const safeSession = cloneRomanceCallSessionSnapshot(session);
  if (!safeSession?.id) {
    return "";
  }

  const choiceKey = safeSession.selectedChoiceId || "pending";
  return `romance-call-session:${safeSession.id}:${safeSession.currentBeatIndex}:${safeSession.phase}:${choiceKey}`;
}

function getRomanceCallSessionRenderModel(targetState = state) {
  if (typeof getRomanceCallSession !== "function") {
    return null;
  }

  const session = getRomanceCallSession(targetState);
  const safeSession = cloneRomanceCallSessionSnapshot(session);
  const beat = getRomanceCallSessionCurrentBeat(safeSession);
  if (!safeSession?.active || !beat) {
    return null;
  }

  const selectedChoice = getRomanceCallSessionSelectedChoice(safeSession);
  const showingResponse = safeSession.phase === "response" && selectedChoice;
  const visibleLines = showingResponse
    ? (selectedChoice.responseLines || [])
    : (beat.lines || []);
  const tags = ["통화", safeSession.type === "post-date-call" ? "데이트 뒤" : "연락"];

  if (showingResponse) {
    const happinessDelta = Math.round(Number(selectedChoice.happinessDelta) || 0);
    const affinityDelta = Math.round(Number(selectedChoice.affectionDelta) || 0);
    if (happinessDelta !== 0) {
      tags.push(`행복 ${happinessDelta > 0 ? "+" : ""}${happinessDelta}`);
    }
    if (affinityDelta !== 0) {
      tags.push(`호감 ${affinityDelta > 0 ? "+" : ""}${affinityDelta}`);
    }
  } else if (safeSession.tone) {
    tags.push(safeSession.tone);
  }

  return {
    session: safeSession,
    beat,
    selectedChoice,
    speaker: beat.speaker || safeSession.label || "통화",
    title: beat.narrator || safeSession.title || "전화 통화",
    lines: visibleLines,
    tags,
    progressKey: buildRomanceCallSessionProgressKey(safeSession),
    choices: showingResponse ? [] : (beat.choices || []),
    advanceLabel: showingResponse
      ? (safeSession.currentBeatIndex < safeSession.beats.length - 1 ? "다음 대화" : "통화 마치기")
      : ((beat.choices || []).length ? "" : "통화 마치기"),
    backgroundConfig: safeSession.backgroundConfig,
    sourceSceneType: safeSession.sourceSceneType,
  };
}

function startRomancePostDateCallSession({
  contactId = "",
  config = null,
  sourceScene = null,
  targetState = state,
} = {}) {
  if (!targetState || !contactId || !config || typeof setRomanceCallSession !== "function") {
    return false;
  }

  const contact = targetState.social?.contacts?.[contactId] || null;
  if (!contact) {
    return false;
  }

  const session = buildRomancePostDateCallSessionBlueprint({
    contactId,
    contact,
    config,
    sourceScene,
    targetState,
  });

  if (!session) {
    return false;
  }

  if (typeof resetSceneTextProgressByPrefix === "function") {
    resetSceneTextProgressByPrefix(`romance-call-session:${session.id}:`);
  }

  if (typeof clearRomanceCallScene === "function") {
    clearRomanceCallScene(targetState);
  }

  setRomanceCallSession(session, targetState);
  targetState.phoneMinimized = true;
  targetState.phoneStageExpanded = false;
  targetState.scene = "romance-call";
  return true;
}

function chooseRomanceCallSessionChoice(index = 0, targetState = state) {
  if (typeof getRomanceCallSession !== "function" || typeof setRomanceCallSession !== "function") {
    return false;
  }

  const session = cloneRomanceCallSessionSnapshot(getRomanceCallSession(targetState));
  const beat = getRomanceCallSessionCurrentBeat(session);
  const choice = beat?.choices?.[index] || null;
  if (!session?.active || !beat || !choice) {
    return false;
  }

  const happinessDelta = Math.round(Number(choice.happinessDelta) || 0);
  const affinityDelta = Math.round(Number(choice.affectionDelta) || 0);

  if (happinessDelta !== 0 && typeof adjustHappiness === "function") {
    adjustHappiness(happinessDelta, targetState);
  }

  if (affinityDelta !== 0 && typeof patchNpcRelation === "function") {
    patchNpcRelation(session.npcId, {
      affinityDelta,
      lastSeenDay: Math.max(1, Math.round(Number(targetState?.day) || 1)),
    }, targetState);
  }

  if (typeof patchSocialContact === "function" && session.contactId) {
    patchSocialContact(session.contactId, {
      lastContactDay: Math.max(1, Math.round(Number(targetState?.day) || 1)),
    }, targetState);
  }

  const nextSession = {
    ...session,
    phase: "response",
    awaitingChoice: false,
    awaitingInput: true,
    selectedChoiceId: choice.id,
    totalHappinessDelta: session.totalHappinessDelta + happinessDelta,
    totalAffinityDelta: session.totalAffinityDelta + affinityDelta,
    result: {
      lastChoiceId: choice.id,
      lastHappinessDelta: happinessDelta,
      lastAffinityDelta: affinityDelta,
    },
  };

  setRomanceCallSession(nextSession, targetState);

  if (typeof resetSceneTextProgressByPrefix === "function") {
    resetSceneTextProgressByPrefix(`romance-call-session:${nextSession.id}:${nextSession.currentBeatIndex}:response`);
  }

  if (!Array.isArray(choice.responseLines) || !choice.responseLines.length) {
    return advanceRomanceCallSession(targetState);
  }

  return true;
}

function buildRomanceCallSessionSummary(session = null) {
  const safeSession = cloneRomanceCallSessionSnapshot(session);
  if (!safeSession) {
    return {
      title: "통화 종료",
      body: "짧은 통화를 마쳤다.",
      headlineText: "짧은 통화를 마쳤다.",
      note: "짧은 통화를 마쳤다.",
    };
  }

  const label = safeSession.label || "상대";
  const happinessDelta = Math.round(Number(safeSession.totalHappinessDelta) || 0);
  const affinityDelta = Math.round(Number(safeSession.totalAffinityDelta) || 0);

  if (happinessDelta >= 3 || affinityDelta >= 2) {
    return {
      title: `${label}와 기분 좋은 통화`,
      body: `${label}와 헤어진 뒤에도 분위기 좋게 대화를 이어갔다.`,
      headlineText: `${label}와의 통화가 꽤 좋았다.`,
      note: `${label}와 헤어진 뒤에도 기분 좋게 통화를 이어갔다.`,
    };
  }

  if (happinessDelta <= -2 || affinityDelta <= -2) {
    return {
      title: `${label}와 조금 어색한 통화`,
      body: `${label}와 통화가 살짝 어색하게 끝났다.`,
      headlineText: `${label}와의 통화가 조금 어색하게 끝났다.`,
      note: `${label}와 통화가 조금 어색하게 끝났다.`,
    };
  }

  return {
    title: `${label}와 짧은 통화`,
    body: `${label}와 짧게 대화를 마무리했다.`,
    headlineText: `${label}와 통화를 마쳤다.`,
    note: `${label}와 짧게 통화를 마쳤다.`,
  };
}

function finishRomanceCallSession(targetState = state) {
  if (typeof getRomanceCallSession !== "function" || typeof clearRomanceCallSession !== "function") {
    return false;
  }

  const session = cloneRomanceCallSessionSnapshot(getRomanceCallSession(targetState));
  if (!session?.active) {
    return false;
  }

  const summary = buildRomanceCallSessionSummary(session);
  const previousScene = String(session.previousScene || "room").trim() || "room";
  const phoneSnapshot = cloneRomanceCallSessionPhoneSnapshot(session.phoneSnapshot);

  clearRomanceCallSession(targetState);

  if (phoneSnapshot) {
    targetState.phoneView = phoneSnapshot.phoneView || targetState.phoneView;
  }
  targetState.phoneMinimized = true;
  targetState.phoneStageExpanded = false;

  targetState.scene = previousScene;

  if (typeof patchSocialContact === "function" && session.contactId) {
    patchSocialContact(session.contactId, {
      lastContactDay: Math.max(1, Math.round(Number(targetState?.day) || 1)),
      note: summary.note,
    }, targetState);
  }

  if (typeof resetSceneTextProgressByPrefix === "function") {
    resetSceneTextProgressByPrefix(`romance-call-session:${session.id}:`);
  }

  if (typeof applyRomanceActionResult === "function") {
    applyRomanceActionResult({
      phoneStatus: {
        kicker: "CALL",
        title: summary.title,
        body: summary.body,
        tone: session.totalHappinessDelta >= 0 ? "accent" : "muted",
      },
      phonePreview: {
        kicker: "CALL",
        title: summary.title,
        body: summary.body,
      },
      headline: {
        badge: "통화 마침",
        text: summary.headlineText,
      },
      finishPhoneTime: {
        type: "minor",
        amount: 2,
      },
      outcome: {
        kind: "post-date-call",
        status: "completed",
        contactId: session.contactId,
        npcId: session.npcId,
        happinessDelta: session.totalHappinessDelta,
        affinityDelta: session.totalAffinityDelta,
      },
    }, targetState);
  }

  if (targetState === state && typeof renderGame === "function") {
    renderGame();
  }
  return true;
}

function advanceRomanceCallSession(targetState = state) {
  if (typeof getRomanceCallSession !== "function" || typeof setRomanceCallSession !== "function") {
    return false;
  }

  const session = cloneRomanceCallSessionSnapshot(getRomanceCallSession(targetState));
  const beat = getRomanceCallSessionCurrentBeat(session);
  if (!session?.active || !beat) {
    return finishRomanceCallSession(targetState);
  }

  if (session.phase === "response") {
    const hasNextBeat = session.currentBeatIndex < session.beats.length - 1;
    if (!hasNextBeat) {
      return finishRomanceCallSession(targetState);
    }

    const nextSession = {
      ...session,
      currentBeatIndex: session.currentBeatIndex + 1,
      phase: "beat",
      awaitingInput: true,
      awaitingChoice: false,
      selectedChoiceId: "",
      result: null,
    };
    setRomanceCallSession(nextSession, targetState);

    if (typeof resetSceneTextProgressByPrefix === "function") {
      resetSceneTextProgressByPrefix(`romance-call-session:${nextSession.id}:${nextSession.currentBeatIndex}:beat`);
    }
    return true;
  }

  if (!Array.isArray(beat.choices) || !beat.choices.length) {
    return finishRomanceCallSession(targetState);
  }

  return false;
}
