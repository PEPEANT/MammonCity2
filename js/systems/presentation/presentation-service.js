function clonePresentationPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...value }
    : {};
}

function clampAppearanceAttractiveness(value = 0) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function createDefaultAppearanceState() {
  return {
    profileId: "",
    surgeryDone: false,
    attractiveness: 0,
    flags: {},
  };
}

function createDefaultNpcRelationState() {
  return {
    met: false,
    meetings: 0,
    lastSeenDay: 0,
    affinity: 0,
    attraction: 0,
    annoyance: 0,
    flags: {},
  };
}

function normalizeNpcRelationState(value = {}) {
  const defaults = createDefaultNpcRelationState();
  return {
    ...defaults,
    ...(value && typeof value === "object" ? value : {}),
    met: Boolean(value?.met),
    meetings: Number.isFinite(value?.meetings) ? Number(value.meetings) : defaults.meetings,
    lastSeenDay: Number.isFinite(value?.lastSeenDay) ? Number(value.lastSeenDay) : defaults.lastSeenDay,
    affinity: Number.isFinite(value?.affinity) ? Number(value.affinity) : defaults.affinity,
    attraction: Number.isFinite(value?.attraction) ? Number(value.attraction) : defaults.attraction,
    annoyance: Number.isFinite(value?.annoyance) ? Number(value.annoyance) : defaults.annoyance,
    flags: clonePresentationPlainObject(value?.flags),
  };
}

function createDefaultNpcState() {
  return {
    relations: {},
  };
}

function syncAppearanceState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return createDefaultAppearanceState();
  }

  const defaults = createDefaultAppearanceState();
  const appearanceState = targetState.appearance && typeof targetState.appearance === "object"
    ? targetState.appearance
    : {};

  targetState.appearance = {
    ...defaults,
    ...appearanceState,
    profileId: typeof appearanceState.profileId === "string" && appearanceState.profileId
      ? appearanceState.profileId
      : defaults.profileId,
    surgeryDone: Boolean(appearanceState.surgeryDone),
    attractiveness: clampAppearanceAttractiveness(
      Number.isFinite(appearanceState.attractiveness)
        ? Number(appearanceState.attractiveness)
        : defaults.attractiveness
    ),
    flags: clonePresentationPlainObject(appearanceState.flags),
  };

  return targetState.appearance;
}

function patchAppearanceState(patch = {}, targetState = state) {
  const appearanceState = syncAppearanceState(targetState);
  if (!patch || typeof patch !== "object") {
    return appearanceState;
  }

  const nextAttractiveness = Number.isFinite(patch.attractiveness)
    ? Number(patch.attractiveness)
    : (Number.isFinite(patch.attractivenessDelta)
      ? appearanceState.attractiveness + Number(patch.attractivenessDelta)
      : appearanceState.attractiveness);

  targetState.appearance = {
    ...appearanceState,
    ...patch,
    profileId: typeof patch.profileId === "string" && patch.profileId
      ? patch.profileId
      : appearanceState.profileId,
    surgeryDone: typeof patch.surgeryDone === "boolean"
      ? patch.surgeryDone
      : appearanceState.surgeryDone,
    attractiveness: clampAppearanceAttractiveness(nextAttractiveness),
    flags: patch.flags && typeof patch.flags === "object"
      ? {
          ...appearanceState.flags,
          ...patch.flags,
        }
      : { ...appearanceState.flags },
  };

  delete targetState.appearance.attractivenessDelta;
  return targetState.appearance;
}

function createNormalizedNpcRelationsMap(source = {}) {
  if (!source || typeof source !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(source)
      .filter(([npcId]) => typeof npcId === "string" && npcId)
      .map(([npcId, relation]) => [npcId, normalizeNpcRelationState(relation)])
  );
}

function syncNpcState(targetState = state) {
  if (!targetState || typeof targetState !== "object") {
    return createDefaultNpcState();
  }

  const defaults = createDefaultNpcState();
  const npcState = targetState.npcs && typeof targetState.npcs === "object"
    ? targetState.npcs
    : {};

  targetState.npcs = {
    ...defaults,
    ...npcState,
    relations: createNormalizedNpcRelationsMap(npcState.relations),
  };

  return targetState.npcs;
}

function ensurePresentationStateReady(targetState = state) {
  syncAppearanceState(targetState);
  syncNpcState(targetState);
  return targetState;
}

function getAppearanceFlag(flagId = "", targetState = state) {
  if (!flagId) {
    return false;
  }

  const appearanceState = syncAppearanceState(targetState);
  return Boolean(appearanceState.flags?.[flagId]);
}

function getNpcRelation(npcId = "", targetState = state) {
  const normalizedNpcId = String(npcId || "").trim();
  if (!normalizedNpcId) {
    return createDefaultNpcRelationState();
  }

  const npcState = syncNpcState(targetState);
  if (!npcState.relations[normalizedNpcId]) {
    npcState.relations[normalizedNpcId] = createDefaultNpcRelationState();
  }

  return npcState.relations[normalizedNpcId];
}

function patchNpcRelation(npcId = "", patch = {}, targetState = state) {
  const normalizedNpcId = String(npcId || "").trim();
  if (!normalizedNpcId) {
    return createDefaultNpcRelationState();
  }

  const relation = getNpcRelation(normalizedNpcId, targetState);
  const nextMeetings = Number.isFinite(patch.meetings)
    ? Number(patch.meetings)
    : (Number.isFinite(patch.meetingsDelta)
      ? relation.meetings + Number(patch.meetingsDelta)
      : relation.meetings);
  const nextLastSeenDay = Number.isFinite(patch.lastSeenDay)
    ? Number(patch.lastSeenDay)
    : relation.lastSeenDay;
  const nextAffinity = Number.isFinite(patch.affinity)
    ? Number(patch.affinity)
    : (Number.isFinite(patch.affinityDelta)
      ? relation.affinity + Number(patch.affinityDelta)
      : relation.affinity);
  const nextAttraction = Number.isFinite(patch.attraction)
    ? Number(patch.attraction)
    : (Number.isFinite(patch.attractionDelta)
      ? relation.attraction + Number(patch.attractionDelta)
      : relation.attraction);
  const nextAnnoyance = Number.isFinite(patch.annoyance)
    ? Number(patch.annoyance)
    : (Number.isFinite(patch.annoyanceDelta)
      ? relation.annoyance + Number(patch.annoyanceDelta)
      : relation.annoyance);

  targetState.npcs.relations[normalizedNpcId] = {
    ...relation,
    ...(patch && typeof patch === "object" ? patch : {}),
    met: typeof patch.met === "boolean" ? patch.met : relation.met,
    meetings: nextMeetings,
    lastSeenDay: nextLastSeenDay,
    affinity: nextAffinity,
    attraction: nextAttraction,
    annoyance: nextAnnoyance,
    flags: patch.flags && typeof patch.flags === "object"
      ? {
          ...relation.flags,
          ...patch.flags,
        }
      : { ...relation.flags },
  };

  delete targetState.npcs.relations[normalizedNpcId].affinityDelta;
  delete targetState.npcs.relations[normalizedNpcId].attractionDelta;
  delete targetState.npcs.relations[normalizedNpcId].annoyanceDelta;
  delete targetState.npcs.relations[normalizedNpcId].meetingsDelta;
  return targetState.npcs.relations[normalizedNpcId];
}

function getNpcDiscomfortThreshold(npcId = "", targetState = state) {
  const appearanceState = syncAppearanceState(targetState);
  const appearanceLevel = typeof getPlayerAppearanceLevel === "function"
    ? getPlayerAppearanceLevel(targetState)
    : 1;
  let threshold = appearanceLevel <= 1 ? 2 : (appearanceLevel === 2 ? 3 : 5);

  if (appearanceState.attractiveness >= 70) {
    threshold += 1;
  } else if (appearanceState.attractiveness <= 10) {
    threshold = Math.max(1, threshold - 1);
  }

  return Math.max(1, threshold);
}

function getNpcDiscomfortDeltaForDialogue(npcId = "", targetState = state) {
  // Neutral small talk should not instantly push ambient NPCs into avoidance.
  // If a route needs discomfort, it should add annoyance explicitly via choice effects.
  return 0;
}

function isNpcAvoidingPlayer(npcId = "", targetState = state) {
  const normalizedNpcId = String(npcId || "").trim();
  if (!normalizedNpcId) {
    return false;
  }

  const relation = getNpcRelation(normalizedNpcId, targetState);
  return Number(relation.annoyance || 0) >= getNpcDiscomfortThreshold(normalizedNpcId, targetState);
}

function applyNpcDialogueDiscomfort(npcId = "", targetState = state, options = {}) {
  const normalizedNpcId = String(npcId || "").trim();
  if (!normalizedNpcId) {
    return {
      npcId: "",
      annoyance: 0,
      annoyanceDelta: 0,
      threshold: getNpcDiscomfortThreshold("", targetState),
      avoidingPlayer: false,
    };
  }

  const annoyanceDelta = Number.isFinite(options.annoyanceDelta)
    ? Number(options.annoyanceDelta)
    : getNpcDiscomfortDeltaForDialogue(normalizedNpcId, targetState);
  const relation = annoyanceDelta > 0
    ? patchNpcRelation(normalizedNpcId, {
        annoyanceDelta,
        lastSeenDay: Number(targetState?.day || 0),
      }, targetState)
    : getNpcRelation(normalizedNpcId, targetState);
  const threshold = getNpcDiscomfortThreshold(normalizedNpcId, targetState);

  return {
    npcId: normalizedNpcId,
    annoyance: Number(relation.annoyance || 0),
    annoyanceDelta: Math.max(0, annoyanceDelta),
    threshold,
    avoidingPlayer: Number(relation.annoyance || 0) >= threshold,
  };
}

function getNpcAvoidanceReaction(npcId = "", targetState = state, context = {}) {
  const normalizedNpcId = String(npcId || "").trim();
  const presentation = normalizedNpcId
    ? getNpcPresentation(normalizedNpcId, targetState, {
        ...context,
        source: context.source || "npc-avoidance",
      })
    : null;
  const npcName = presentation?.name
    || (typeof getNpcConfig === "function" ? getNpcConfig(normalizedNpcId)?.name : "")
    || "상대";
  const relation = normalizedNpcId
    ? getNpcRelation(normalizedNpcId, targetState)
    : createDefaultNpcRelationState();
  const threshold = getNpcDiscomfortThreshold(normalizedNpcId, targetState);
  const appearanceLevel = typeof getPlayerAppearanceLevel === "function"
    ? getPlayerAppearanceLevel(targetState)
    : 1;
  const locationId = String(context.locationId || "").trim();
  const day = Number(targetState?.day || 0);
  const locationLabel = String(context.locationLabel || "").trim()
    || (typeof getDayWorldLocationMap === "function"
      ? getDayWorldLocationMap(day)?.[locationId]?.label || ""
      : "")
    || "거리";
  const severeAvoidance = Number(relation.annoyance || 0) >= threshold + 1 || appearanceLevel <= 1;

  return {
    badge: severeAvoidance ? "불쾌감 누적" : "차가운 반응",
    text: severeAvoidance
      ? `${npcName}이 불쾌한 표정을 감추지 못하고 서둘러 자리를 피한다.`
      : `${npcName}이 더는 말을 섞고 싶지 않다는 듯 거리를 둔다.`,
    title: `${locationLabel}에서 ${npcName}이 거리를 둔다`,
    lines: [
      severeAvoidance
        ? `${npcName}은 당신을 보자마자 표정을 굳히고 발걸음을 돌린다.`
        : `${npcName}은 시선을 피한 채 짧게 손사래를 치고 멀어진다.`,
      appearanceLevel <= 1
        ? "외모가 낮을수록 이런 불쾌감이 더 빠르게 쌓인다. 외모를 올리면 다시 대화가 열릴 여지가 생긴다."
        : "상대의 불쾌감이 누적돼 지금은 대화를 이어가기 어렵다.",
    ],
  };
}

function getPlayerOriginAppearanceProfileId(targetState = state) {
  const tierId = String(targetState?.startingOrigin?.tierId || "").trim().toLowerCase();

  if (tierId === "gold") {
    return "level3Start";
  }

  if (tierId === "silver") {
    return "level2";
  }

  return "level1";
}

function getPlayerAppearanceLevel(targetState = state) {
  const resolvedProfileId = resolvePlayerAppearanceProfileId(targetState);

  if (["level3Start", "level3Mid", "level3Final"].includes(resolvedProfileId)) {
    return 3;
  }

  if (resolvedProfileId === "level2") {
    return 2;
  }

  return 1;
}

function getPlayerAppearanceLevelLabel(targetState = state) {
  return `${getPlayerAppearanceLevel(targetState)}LV`;
}

function resolvePlayerAppearanceProfileId(targetState = state) {
  const appearanceState = syncAppearanceState(targetState);
  const explicitProfileId = String(appearanceState.profileId || "").trim();
  const originProfileId = getPlayerOriginAppearanceProfileId(targetState);

  if ([
    "level1",
    "level2",
    "level3Start",
    "level3Mid",
    "level3Final",
  ].includes(explicitProfileId)) {
    return explicitProfileId;
  }

  if (appearanceState.surgeryDone || explicitProfileId === "postSurgery" || explicitProfileId === "postSurgeryGold") {
    if (originProfileId === "level3Start") {
      return "level3Final";
    }
    if (originProfileId === "level2") {
      return "level3Mid";
    }
    return "level2";
  }

  if (explicitProfileId === "gold") {
    return "level3Start";
  }

  if (["silver", "postSurgery"].includes(explicitProfileId)) {
    return "level2";
  }

  if (explicitProfileId === "default") {
    return originProfileId;
  }

  return originProfileId;
}

function getPlayerPresentation(targetState = state, context = {}) {
  const appearanceState = syncAppearanceState(targetState);
  const playerArt = CHARACTER_ART?.player || {};
  const resolvedProfileId = resolvePlayerAppearanceProfileId(targetState);
  const resolvedSrc = playerArt[resolvedProfileId]
    || (appearanceState.surgeryDone ? playerArt.postSurgery : "")
    || playerArt.default
    || playerArt.standing
    || "";

  return {
    profileId: resolvedProfileId,
    src: resolvedSrc,
    alt: "player",
    surgeryDone: Boolean(appearanceState.surgeryDone),
    attractiveness: appearanceState.attractiveness,
    appearanceLevel: getPlayerAppearanceLevel(targetState),
    appearanceLevelLabel: getPlayerAppearanceLevelLabel(targetState),
    flags: { ...(appearanceState.flags || {}) },
    context: { ...(context || {}) },
  };
}

function matchesNpcPresentationRule(rule = {}, targetState = state, context = {}, relation = {}) {
  if (!rule || typeof rule !== "object") {
    return false;
  }

  const appearanceState = syncAppearanceState(targetState);

  if (rule.locationId) {
    const allowedLocationIds = Array.isArray(rule.locationId) ? rule.locationId : [rule.locationId];
    if (!allowedLocationIds.includes(context.locationId)) {
      return false;
    }
  }

  if (typeof rule.playerSurgeryDone === "boolean" && appearanceState.surgeryDone !== rule.playerSurgeryDone) {
    return false;
  }

  if (rule.playerAppearanceFlag) {
    const requiredFlags = Array.isArray(rule.playerAppearanceFlag)
      ? rule.playerAppearanceFlag
      : [rule.playerAppearanceFlag];
    if (!requiredFlags.every((flagId) => getAppearanceFlag(flagId, targetState))) {
      return false;
    }
  }

  if (rule.npcRelationFlag) {
    const requiredFlags = Array.isArray(rule.npcRelationFlag)
      ? rule.npcRelationFlag
      : [rule.npcRelationFlag];
    if (!requiredFlags.every((flagId) => Boolean(relation.flags?.[flagId]))) {
      return false;
    }
  }

  if (rule.missingNpcRelationFlag) {
    const forbiddenFlags = Array.isArray(rule.missingNpcRelationFlag)
      ? rule.missingNpcRelationFlag
      : [rule.missingNpcRelationFlag];
    if (!forbiddenFlags.every((flagId) => !relation.flags?.[flagId])) {
      return false;
    }
  }

  if (Number.isFinite(rule.minNpcAttraction) && relation.attraction < Number(rule.minNpcAttraction)) {
    return false;
  }

  if (Number.isFinite(rule.minPlayerAttractiveness)
    && appearanceState.attractiveness < Number(rule.minPlayerAttractiveness)) {
    return false;
  }

  return true;
}

function getNpcPresentation(npcId = "", targetState = state, context = {}) {
  const normalizedNpcId = String(npcId || "").trim();
  if (!normalizedNpcId) {
    return null;
  }

  const npcConfig = typeof getNpcConfig === "function"
    ? getNpcConfig(normalizedNpcId)
    : NPC_DATA?.[normalizedNpcId] || null;

  if (!npcConfig) {
    return null;
  }

  const relation = getNpcRelation(normalizedNpcId, targetState);
  const dialogueEntry = typeof getNpcDialogueEntry === "function"
    ? getNpcDialogueEntry(normalizedNpcId)
    : NPC_DIALOGUES?.[normalizedNpcId] || null;
  const presentationVariants = Array.isArray(npcConfig.presentations) ? npcConfig.presentations : [];
  const matchedVariant = presentationVariants.find((variant) =>
    matchesNpcPresentationRule(variant.when || variant, targetState, context, relation)
  ) || null;
  const defaultStartNodeId = npcConfig.startNodeId || dialogueEntry?.startNodeId || "";

  return {
    npcId: normalizedNpcId,
    name: matchedVariant?.name || npcConfig.name || normalizedNpcId,
    art: matchedVariant?.art || npcConfig.art || "",
    startNodeId: matchedVariant?.startNodeId || defaultStartNodeId,
    tags: Array.isArray(matchedVariant?.tags) && matchedVariant.tags.length
      ? [...matchedVariant.tags]
      : [...(npcConfig.tags || [])],
    attitude: matchedVariant?.attitude || npcConfig.attitude || "",
    relation: {
      ...relation,
      flags: { ...(relation.flags || {}) },
    },
    context: { ...(context || {}) },
  };
}

function resolveSceneActorPresentation(actor = {}, targetState = state, context = {}) {
  if (!actor || typeof actor !== "object") {
    return actor;
  }

  const resolvedActor = { ...actor };
  const preserveExplicitSrc = Boolean(
    String(resolvedActor.src || "").trim()
    && (resolvedActor.preserveSrc || resolvedActor.forceSrc || resolvedActor.lockPresentationArt)
  );
  const actorKey = String(resolvedActor.npcId || resolvedActor.id || resolvedActor.alt || "").trim().toLowerCase();
  const actorAlt = String(resolvedActor.alt || "").trim().toLowerCase();
  const isPlayerActor = resolvedActor.kind === "player"
    || actorKey === "player"
    || actorAlt === "player"
    || actorKey.startsWith("player")
    || actorAlt.startsWith("player");

  if (isPlayerActor) {
    const presentation = getPlayerPresentation(targetState, context);
    if (presentation?.src) {
      resolvedActor.src = presentation.src;
    }
    resolvedActor.alt = presentation?.alt || resolvedActor.alt || "player";
    resolvedActor.presentation = presentation;
    return resolvedActor;
  }

  const npcId = resolvedActor.npcId || (NPC_DATA?.[actorKey] ? actorKey : "");
  if (!npcId) {
    return resolvedActor;
  }

  const presentation = getNpcPresentation(npcId, targetState, context);
  if (presentation?.art && !preserveExplicitSrc) {
    resolvedActor.src = presentation.art;
  }
  if (presentation?.name) {
    resolvedActor.alt = presentation.name;
  }
  resolvedActor.npcId = npcId;
  resolvedActor.presentation = presentation;
  return resolvedActor;
}
