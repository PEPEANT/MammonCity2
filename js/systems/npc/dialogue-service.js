function createDefaultDialogueState() {
  return {
    active: false,
    npcId: "",
    nodeId: "",
    returnScene: "outside",
    returnLocationId: "",
    source: "",
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

function getNpcDialogueStartNodeId(npcId = "") {
  const entry = getNpcDialogueEntry(npcId);
  if (!entry) {
    return "";
  }

  if (entry.startNodeId && entry.nodes?.[entry.startNodeId]) {
    return entry.startNodeId;
  }

  return Object.keys(entry.nodes || {})[0] || "";
}

function applyDialogueEffects(effects = {}, targetState = state) {
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
}

function startNpcDialogue(npcId, options = {}, targetState = state) {
  const resolvedNpcId = String(npcId || "").trim();
  const startNodeId = options.nodeId || getNpcDialogueStartNodeId(resolvedNpcId);

  if (!resolvedNpcId || !startNodeId || !getNpcDialogueNode(resolvedNpcId, startNodeId)) {
    return false;
  }

  const dialogueState = syncDialogueState(targetState);
  dialogueState.active = true;
  dialogueState.npcId = resolvedNpcId;
  dialogueState.nodeId = startNodeId;
  dialogueState.returnScene = options.returnScene || targetState.scene || "outside";
  dialogueState.returnLocationId = options.returnLocationId || "";
  dialogueState.source = options.source || "";
  targetState.scene = "dialogue";

  return true;
}

function getActiveDialogueNode(targetState = state) {
  const dialogueState = syncDialogueState(targetState);
  if (!dialogueState.active || !dialogueState.npcId || !dialogueState.nodeId) {
    return null;
  }

  const npc = getNpcConfig(dialogueState.npcId);
  const node = getNpcDialogueNode(dialogueState.npcId, dialogueState.nodeId);
  if (!npc || !node) {
    return null;
  }

  return {
    ...node,
    npcId: dialogueState.npcId,
    nodeId: dialogueState.nodeId,
    speaker: node.speaker || npc.name,
    tags: Array.isArray(node.tags) && node.tags.length
      ? [...node.tags]
      : [...(npc.tags || []), "대화"],
  };
}

function endNpcDialogue(targetState = state, { headline = null } = {}) {
  const dialogueState = syncDialogueState(targetState);
  const activeNpcId = dialogueState.npcId;
  const returnScene = dialogueState.returnScene || "outside";
  const returnLocationId = dialogueState.returnLocationId || "";

  if (headline && typeof headline === "object") {
    targetState.headline = {
      badge: headline.badge || "",
      text: headline.text || "",
    };
  }

  resetDialogueState(targetState);
  targetState.scene = returnScene;

  if (returnScene === "outside" && typeof syncWorldState === "function") {
    const worldState = syncWorldState(targetState);
    if (returnLocationId) {
      worldState.currentLocation = returnLocationId;
    }
    if (worldState.alleyNpcId === activeNpcId && typeof clearAlleyNpcState === "function") {
      clearAlleyNpcState(targetState);
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
    applyDialogueEffects(choice.effects, targetState);
  }

  if (choice.next) {
    const nextNode = getNpcDialogueNode(activeNode.npcId, choice.next);
    if (!nextNode) {
      endNpcDialogue(targetState);
      return false;
    }

    syncDialogueState(targetState).nodeId = choice.next;
    return true;
  }

  endNpcDialogue(targetState, {
    headline: choice.headline || null,
  });
  return true;
}
