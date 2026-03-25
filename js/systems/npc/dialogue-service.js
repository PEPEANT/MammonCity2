function createDefaultDialogueState() {
  return {
    active: false,
    npcId: "",
    nodeId: "",
    returnScene: "outside",
    returnLocationId: "",
    source: "",
    backgroundSnapshot: null,
    actorsSnapshot: [],
  };
}

function syncDialogueState(targetState = state) {
  if (!targetState) {
    return createDefaultDialogueState();
  }

  const defaults = createDefaultDialogueState();
  const dialogueState = targetState.dialogue && typeof targetState.dialogue === "object"
    ? targetState.dialogue
    : {};
  const backgroundSnapshot = dialogueState.backgroundSnapshot && typeof dialogueState.backgroundSnapshot === "object"
    ? dialogueState.backgroundSnapshot
    : null;
  const actorsSnapshot = Array.isArray(dialogueState.actorsSnapshot)
    ? dialogueState.actorsSnapshot
        .filter((actor) => actor && typeof actor === "object")
        .map((actor) => ({ ...actor }))
    : defaults.actorsSnapshot;

  targetState.dialogue = {
    ...defaults,
    ...dialogueState,
    active: Boolean(dialogueState.active),
    npcId: typeof dialogueState.npcId === "string" ? dialogueState.npcId : defaults.npcId,
    nodeId: typeof dialogueState.nodeId === "string" ? dialogueState.nodeId : defaults.nodeId,
    returnScene: typeof dialogueState.returnScene === "string" && dialogueState.returnScene
      ? dialogueState.returnScene
      : defaults.returnScene,
    returnLocationId: typeof dialogueState.returnLocationId === "string"
      ? dialogueState.returnLocationId
      : defaults.returnLocationId,
    source: typeof dialogueState.source === "string" ? dialogueState.source : defaults.source,
    backgroundSnapshot: backgroundSnapshot
      ? {
          className: typeof backgroundSnapshot.className === "string" ? backgroundSnapshot.className : "",
          background: typeof backgroundSnapshot.background === "string" ? backgroundSnapshot.background : "",
        }
      : defaults.backgroundSnapshot,
    actorsSnapshot,
  };

  return targetState.dialogue;
}

function resetDialogueState(targetState = state) {
  if (!targetState) {
    return createDefaultDialogueState();
  }

  targetState.dialogue = createDefaultDialogueState();
  return targetState.dialogue;
}

function getNpcConfig(npcId = "") {
  return NPC_DATA[String(npcId || "").trim()] || null;
}

function getNpcDialogueEntry(npcId = "") {
  return NPC_DIALOGUES[String(npcId || "").trim()] || null;
}

function getNpcDialogueNode(npcId = "", nodeId = "") {
  const entry = getNpcDialogueEntry(npcId);
  if (!entry?.nodes || !nodeId) {
    return null;
  }

  return entry.nodes[nodeId] || null;
}

function buildDialogueSceneTextProgressKey(npcId = "", nodeId = "", targetState = state) {
  if (typeof buildSceneTextProgressKey !== "function") {
    return "";
  }

  const normalizedNpcId = String(npcId || "").trim();
  const normalizedNodeId = String(nodeId || "").trim();
  if (!normalizedNpcId || !normalizedNodeId) {
    return "";
  }

  const resolvedNode = resolveDialogueNodeForState(
    getNpcDialogueNode(normalizedNpcId, normalizedNodeId),
    targetState,
  );
  if (!resolvedNode) {
    return "";
  }

  return buildSceneTextProgressKey(
    `dialogue:${targetState?.day || 1}:${normalizedNpcId}:${normalizedNodeId}`,
    resolvedNode.title || "",
    resolvedNode.lines || [],
  );
}

function resetDialogueSceneTextProgress(npcId = "", nodeId = "", targetState = state) {
  if (typeof resetSceneTextProgress !== "function") {
    return;
  }

  const progressKey = buildDialogueSceneTextProgressKey(npcId, nodeId, targetState);
  if (progressKey) {
    resetSceneTextProgress(progressKey);
  }
}

function resolveDialogueNodeForState(node = null, targetState = state) {
  if (!node || !targetState || !node.appearanceVariants || typeof node.appearanceVariants !== "object") {
    return node;
  }

  const appearanceLevel = typeof getPlayerAppearanceLevel === "function"
    ? getPlayerAppearanceLevel(targetState)
    : 1;

  const variant = appearanceLevel >= 2 && node.appearanceVariants.level2Plus
    ? node.appearanceVariants.level2Plus
    : null;

  if (!variant || typeof variant !== "object") {
    return node;
  }

  return {
    ...node,
    ...variant,
    lines: Array.isArray(variant.lines)
      ? [...variant.lines]
      : (Array.isArray(node.lines) ? [...node.lines] : []),
    choices: Array.isArray(variant.choices)
      ? variant.choices.map((choice) => ({ ...choice }))
      : (Array.isArray(node.choices) ? node.choices.map((choice) => ({ ...choice })) : []),
    tags: Array.isArray(variant.tags)
      ? [...variant.tags]
      : (Array.isArray(node.tags) ? [...node.tags] : []),
  };
}

function getNpcDialogueStartNodeId(npcId = "", targetState = state, context = {}) {
  const entry = getNpcDialogueEntry(npcId);
  if (!entry) {
    return "";
  }

  const presentation = typeof getNpcPresentation === "function"
    ? getNpcPresentation(npcId, targetState, {
        ...context,
        source: context.source || "dialogue-start",
      })
    : null;
  if (presentation?.startNodeId && entry.nodes?.[presentation.startNodeId]) {
    return presentation.startNodeId;
  }

  if (typeof entry.startNodeSelector === "function") {
    const selectedNodeId = entry.startNodeSelector(targetState, context, presentation);
    if (selectedNodeId && entry.nodes?.[selectedNodeId]) {
      return selectedNodeId;
    }
  }

  if (entry.startNodeId && entry.nodes?.[entry.startNodeId]) {
    return entry.startNodeId;
  }

  return Object.keys(entry.nodes || {})[0] || "";
}

function applyDialogueEffects(effects = {}, targetState = state, context = {}) {
  if (!effects || typeof effects !== "object" || !targetState) {
    return;
  }

  if (effects.headline && typeof effects.headline === "object") {
    targetState.headline = {
      badge: effects.headline.badge || "",
      text: effects.headline.text || "",
    };
  }

  if (effects.memory && typeof recordMemoryEntry === "function") {
    recordMemoryEntry({
      retention: "ending",
      ...effects.memory,
    }, targetState);
  }

  if (Number.isFinite(effects.moneyDelta)) {
    targetState.money = Math.max(0, targetState.money + Math.round(effects.moneyDelta));
  }

  if (effects.appearance && typeof patchAppearanceState === "function") {
    patchAppearanceState(effects.appearance, targetState);
  }

  if (effects.npcRelation && typeof patchNpcRelation === "function") {
    patchNpcRelation(effects.npcId || context.npcId, effects.npcRelation, targetState);
  }

  if (effects.socialContact && typeof unlockRomanceContactFromEffect === "function") {
    unlockRomanceContactFromEffect(effects.socialContact, targetState, {
      npcId: effects.npcId || context.npcId,
      source: context.source || "dialogue",
      locationId: context.locationId || "",
    });
  }

  if (effects.nextTurnEvent && typeof queueNextTurnEvent === "function") {
    queueNextTurnEvent(effects.nextTurnEvent, targetState, {
      dayOffset: effects.nextTurnEvent.dayOffset,
      absoluteDay: effects.nextTurnEvent.day,
    });
  }
}

function startNpcDialogue(npcId, options = {}, targetState = state) {
  const resolvedNpcId = String(npcId || "").trim();
  const startNodeId = options.nodeId || getNpcDialogueStartNodeId(resolvedNpcId, targetState, options);

  if (!resolvedNpcId || !startNodeId || !getNpcDialogueNode(resolvedNpcId, startNodeId)) {
    return false;
  }

  if (typeof patchNpcRelation === "function") {
    patchNpcRelation(resolvedNpcId, {
      met: true,
      meetingsDelta: 1,
      lastSeenDay: targetState?.day || 0,
    }, targetState);
  }

  const dialogueState = syncDialogueState(targetState);
  dialogueState.active = true;
  dialogueState.npcId = resolvedNpcId;
  dialogueState.nodeId = startNodeId;
  dialogueState.returnScene = options.returnScene || targetState.scene || "outside";
  dialogueState.returnLocationId = options.returnLocationId || "";
  dialogueState.source = options.source || "";
  dialogueState.backgroundSnapshot = options.backgroundSnapshot && typeof options.backgroundSnapshot === "object"
    ? {
        className: typeof options.backgroundSnapshot.className === "string" ? options.backgroundSnapshot.className : "",
        background: typeof options.backgroundSnapshot.background === "string" ? options.backgroundSnapshot.background : "",
      }
    : null;
  dialogueState.actorsSnapshot = Array.isArray(options.actorsSnapshot)
    ? options.actorsSnapshot
        .filter((actor) => actor && typeof actor === "object")
        .map((actor) => ({ ...actor }))
    : [];
  if (typeof resetSceneTextProgressByPrefix === "function") {
    resetSceneTextProgressByPrefix(`dialogue:${targetState?.day || 1}:${resolvedNpcId}:`);
  }
  resetDialogueSceneTextProgress(resolvedNpcId, startNodeId, targetState);
  targetState.scene = "dialogue";

  return true;
}

function getActiveDialogueNode(targetState = state) {
  const dialogueState = syncDialogueState(targetState);
  if (!dialogueState.active || !dialogueState.npcId || !dialogueState.nodeId) {
    return null;
  }

  const npc = getNpcConfig(dialogueState.npcId);
  const baseNode = getNpcDialogueNode(dialogueState.npcId, dialogueState.nodeId);
  const node = resolveDialogueNodeForState(baseNode, targetState);
  const presentation = typeof getNpcPresentation === "function"
    ? getNpcPresentation(dialogueState.npcId, targetState, {
        scene: "dialogue",
        source: dialogueState.source || "dialogue",
        locationId: dialogueState.returnLocationId || "",
      })
    : null;

  if (!npc || !node) {
    return null;
  }

  return {
    ...node,
    npcId: dialogueState.npcId,
    nodeId: dialogueState.nodeId,
    speaker: node.speaker || presentation?.name || npc.name,
    tags: Array.isArray(node.tags) && node.tags.length
      ? [...node.tags]
      : [...(presentation?.tags || npc.tags || []), "dialogue"],
    presentation,
  };
}

function endNpcDialogue(targetState = state, { headline = null } = {}) {
  const dialogueState = syncDialogueState(targetState);
  const activeNpcId = dialogueState.npcId;
  const returnScene = dialogueState.returnScene || "outside";
  const returnLocationId = dialogueState.returnLocationId || "";
  const discomfortResult = activeNpcId && typeof applyNpcDialogueDiscomfort === "function"
    ? applyNpcDialogueDiscomfort(activeNpcId, targetState)
    : null;
  const blockedByDiscomfort = Boolean(discomfortResult?.avoidingPlayer);

  if (headline && typeof headline === "object") {
    targetState.headline = {
      badge: headline.badge || "",
      text: headline.text || "",
    };
  }

  if (activeNpcId && typeof tryUnlockRomanceContactFromDialogue === "function") {
    tryUnlockRomanceContactFromDialogue(activeNpcId, targetState, {
      source: dialogueState.source || "dialogue",
      locationId: returnLocationId || "",
    });
  }

  resetDialogueState(targetState);
  targetState.scene = returnScene;

  if (returnScene === "outside" && typeof syncWorldState === "function") {
    const worldState = syncWorldState(targetState);
    if (returnLocationId) {
      worldState.currentLocation = returnLocationId;
      if (typeof setLocationWanderNpcId === "function") {
        setLocationWanderNpcId(returnLocationId, "", targetState);
      }
      if (typeof clearAmbientNpcCache === "function") {
        clearAmbientNpcCache(returnLocationId, targetState);
      }
    }
    if (worldState.alleyNpcId === activeNpcId && typeof clearAlleyNpcState === "function") {
      clearAlleyNpcState(targetState);
    }
    if (blockedByDiscomfort) {
      const avoidanceReaction = typeof getNpcAvoidanceReaction === "function"
        ? getNpcAvoidanceReaction(activeNpcId, targetState, {
            locationId: returnLocationId,
            source: dialogueState.source || "dialogue-end",
          })
        : null;
      targetState.headline = {
        badge: avoidanceReaction?.badge || "불쾌감 누적",
        text: avoidanceReaction?.text || "상대가 표정을 굳힌 채 서둘러 자리를 뜬다.",
      };
      if (returnLocationId && typeof setLocationWanderResult === "function") {
        setLocationWanderResult(
          returnLocationId,
          avoidanceReaction?.title || "상대가 자리를 피했다",
          Array.isArray(avoidanceReaction?.lines) && avoidanceReaction.lines.length
            ? avoidanceReaction.lines
            : [
                "상대는 불쾌한 기색을 숨기지 않고 빠르게 멀어진다.",
                "외모가 낮을수록 불쾌감이 더 빨리 누적돼 다시 말을 걸기 어려워진다.",
              ],
          targetState,
        );
      }
    }
  }

  return true;
}

function chooseDialogueOption(index, targetState = state) {
  const activeNode = getActiveDialogueNode(targetState);
  const choices = Array.isArray(activeNode?.choices) ? activeNode.choices : [];
  const choice = choices[index];

  if (!choice) {
    return false;
  }

  if (choice.effects) {
    applyDialogueEffects(choice.effects, targetState, {
      npcId: activeNode?.npcId || "",
      source: syncDialogueState(targetState)?.source || "dialogue",
      locationId: syncDialogueState(targetState)?.returnLocationId || "",
    });
  }

  if (choice.next) {
    const nextNode = getNpcDialogueNode(activeNode.npcId, choice.next);
    if (!nextNode) {
      endNpcDialogue(targetState);
      return false;
    }

    resetDialogueSceneTextProgress(activeNode.npcId, choice.next, targetState);
    syncDialogueState(targetState).nodeId = choice.next;
    return true;
  }

  endNpcDialogue(targetState, {
    headline: choice.headline || null,
  });
  return true;
}
