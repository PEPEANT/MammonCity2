function getJobRequirementLabel(requirement = {}) {
  const explicitLabel = String(requirement?.label || "").trim();
  if (explicitLabel) {
    return explicitLabel;
  }

  const type = String(requirement?.type || "").trim().toLowerCase();
  if (type === "owned-vehicle-any-of") {
    const vehicleIds = Array.isArray(requirement.vehicleIds) ? requirement.vehicleIds : [];
    const labels = vehicleIds
      .map((vehicleId) => typeof getOwnedVehicleDefinition === "function" ? getOwnedVehicleDefinition(vehicleId) : null)
      .filter(Boolean)
      .map((vehicle) => vehicle.label);

    return labels.length ? labels.join(" 또는 ") : "이동수단";
  }

  if (type === "certification") {
    const certKey = String(requirement.certKey || "").trim();
    return typeof getCareerCertificationLabel === "function"
      ? getCareerCertificationLabel(certKey)
      : certKey;
  }

  if (type === "career-prep") {
    const prepKey = String(requirement.prepKey || "").trim();
    return typeof getCareerPrepLabel === "function"
      ? getCareerPrepLabel(prepKey)
      : prepKey;
  }

  if (type === "equipped-item") {
    const itemId = String(requirement.itemId || "").trim();
    const definition = typeof getInventoryItemDefinition === "function"
      ? getInventoryItemDefinition(itemId)
      : null;
    return definition?.label || itemId || "장비";
  }

  if (type === "equipped-item-any-of") {
    const itemIds = Array.isArray(requirement.itemIds) ? requirement.itemIds : [];
    const labels = itemIds
      .map((itemId) => typeof getInventoryItemDefinition === "function" ? getInventoryItemDefinition(itemId) : null)
      .filter(Boolean)
      .map((item) => item.label);

    return labels.length ? labels.join(" 또는 ") : "장비";
  }

  if (type === "stat-min" || type === "stat-max") {
    return typeof getPlayerStatDisplayLabel === "function"
      ? getPlayerStatDisplayLabel(requirement.statKey || requirement.label || "수치")
      : String(requirement.label || requirement.statKey || "수치");
  }

  return "조건";
}

function evaluateJobRequirement(requirement = {}, targetState = state) {
  const type = String(requirement?.type || "").trim().toLowerCase();
  const label = getJobRequirementLabel(requirement);

  if (!type) {
    return {
      ok: true,
      label,
      satisfiedLabel: `${label} 충족`,
      unmetLabel: label,
    };
  }

  if (type === "owned-vehicle-any-of") {
    const ownership = typeof syncOwnershipState === "function"
      ? syncOwnershipState(targetState)
      : (targetState?.ownership || {});
    const ownedVehicleId = String(ownership?.vehicle || "").trim();
    const vehicleIds = Array.isArray(requirement.vehicleIds) ? requirement.vehicleIds : [];
    const matchedVehicleId = vehicleIds.find((vehicleId) => vehicleId === ownedVehicleId) || "";
    const matchedVehicle = matchedVehicleId && typeof getOwnedVehicleDefinition === "function"
      ? getOwnedVehicleDefinition(matchedVehicleId)
      : null;

    return {
      ok: Boolean(matchedVehicleId),
      type,
      label,
      matchedVehicleId,
      tagLabel: Boolean(matchedVehicleId)
        ? (matchedVehicle?.label ? `${matchedVehicle.label} 보유` : `${label} 보유`)
        : `${label} 필요`,
      satisfiedLabel: matchedVehicle?.label ? `${matchedVehicle.label} 보유` : `${label} 보유`,
      unmetLabel: label,
    };
  }

  if (type === "certification") {
    const certKey = String(requirement.certKey || "").trim();
    const certifications = typeof getCareerCertificationSnapshotForState === "function"
      ? getCareerCertificationSnapshotForState(targetState)
      : {};
    const owned = Boolean(certifications?.[certKey]);
    return {
      ok: owned,
      type,
      label,
      tagLabel: owned ? `${label} 보유` : `${label} 필요`,
      satisfiedLabel: `${label} 보유`,
      unmetLabel: label,
    };
  }

  if (type === "career-prep") {
    const prepKey = String(requirement.prepKey || "").trim();
    const minimum = Math.max(0, Math.round(Number(requirement.min) || 0));
    const prepState = typeof getCareerPrepSnapshotForState === "function"
      ? getCareerPrepSnapshotForState(targetState)
      : {};
    const current = Math.max(0, Math.round(Number(prepState?.[prepKey]) || 0));

    return {
      ok: current >= minimum,
      type,
      label,
      current,
      expected: minimum,
      tagLabel: `${label} ${current}/${minimum}`,
      satisfiedLabel: `${label} ${current}/${minimum}`,
      unmetLabel: `${label} ${minimum}`,
    };
  }

  if (type === "equipped-item") {
    const itemId = String(requirement.itemId || "").trim();
    const equipped = itemId && typeof hasEquippedInventoryItem === "function"
      ? hasEquippedInventoryItem(itemId, targetState)
      : false;

    return {
      ok: equipped,
      type,
      label,
      tagLabel: equipped ? `${label} 착용` : `${label} 필요`,
      satisfiedLabel: `${label} 착용`,
      unmetLabel: label,
    };
  }

  if (type === "equipped-item-any-of") {
    const itemIds = Array.isArray(requirement.itemIds) ? requirement.itemIds : [];
    const equipped = itemIds.length && typeof hasAnyEquippedInventoryItem === "function"
      ? hasAnyEquippedInventoryItem(itemIds, targetState)
      : false;

    return {
      ok: equipped,
      type,
      label,
      tagLabel: equipped ? `${label} 착용` : `${label} 필요`,
      satisfiedLabel: `${label} 착용`,
      unmetLabel: label,
    };
  }

  if (type === "stat-min") {
    const minimum = Math.max(0, Number(requirement.min) || 0);
    const current = typeof getPlayerNumericStatValue === "function"
      ? getPlayerNumericStatValue(requirement.statKey, targetState)
      : Math.max(0, Number(targetState?.[requirement.statKey]) || 0);

    return {
      ok: current >= minimum,
      type,
      label,
      current,
      expected: minimum,
      tagLabel: `${label} ${current}/${minimum}`,
      satisfiedLabel: `${label} ${current}/${minimum}`,
      unmetLabel: `${label} ${minimum}`,
    };
  }

  if (type === "stat-max") {
    const maximum = Math.max(0, Number(requirement.max) || 0);
    const current = typeof getPlayerNumericStatValue === "function"
      ? getPlayerNumericStatValue(requirement.statKey, targetState)
      : Math.max(0, Number(targetState?.[requirement.statKey]) || 0);

    return {
      ok: current <= maximum,
      type,
      label,
      current,
      expected: maximum,
      tagLabel: `${label} ${current}/${maximum}`,
      satisfiedLabel: `${label} ${current}/${maximum}`,
      unmetLabel: `${label} ${maximum} 이하`,
    };
  }

  return {
    ok: true,
    label,
    satisfiedLabel: `${label} 충족`,
    unmetLabel: label,
  };
}

function summarizeRequirementEvaluations(evaluations = []) {
  const unmetRequirements = evaluations
    .filter((entry) => !entry.ok)
    .map((entry) => entry.unmetLabel)
    .filter(Boolean);
  const requirementTags = evaluations
    .map((entry) => entry.tagLabel || (entry.ok ? entry.satisfiedLabel : `${entry.unmetLabel} 필요`))
    .filter(Boolean);

  return {
    eligible: unmetRequirements.length === 0,
    requirementTags,
    unmetRequirements,
    evaluations,
  };
}

function evaluateShortTermJobOfferEligibility(offer = null, targetState = state) {
  const job = offer?.jobId ? JOB_LOOKUP?.[offer.jobId] : null;
  const requirements = Array.isArray(job?.requirements) ? job.requirements : [];
  const evaluations = requirements.map((requirement) => evaluateJobRequirement(requirement, targetState));
  return summarizeRequirementEvaluations(evaluations);
}

function getShortTermJobFailureReason(offer = null, targetState = state) {
  const eligibility = evaluateShortTermJobOfferEligibility(offer, targetState);
  if (eligibility.eligible) {
    return "";
  }

  return eligibility.unmetRequirements[0] || "지원 조건";
}

function buildCareerPostingRequirements(posting = null) {
  if (!posting || typeof posting !== "object") {
    return [];
  }

  const requirements = [];
  if (posting.prepKey) {
    requirements.push({
      type: "career-prep",
      prepKey: posting.prepKey,
      min: Math.max(0, Math.round(Number(posting.requiredPrep) || 0)),
    });
  }

  const requiredCerts = Array.isArray(posting.requiredCerts) ? posting.requiredCerts : [];
  requiredCerts.forEach((certKey) => {
    requirements.push({
      type: "certification",
      certKey,
    });
  });

  if (Array.isArray(posting.requirements)) {
    posting.requirements.forEach((requirement) => {
      requirements.push({ ...(requirement || {}) });
    });
  }

  return requirements;
}

function evaluateCareerPostingEligibility(posting = null, targetState = state) {
  const requirements = buildCareerPostingRequirements(posting);
  const evaluations = requirements.map((requirement) => evaluateJobRequirement(requirement, targetState));
  return summarizeRequirementEvaluations(evaluations);
}

function getCareerPostingFailureReason(posting = null, targetState = state) {
  const eligibility = evaluateCareerPostingEligibility(posting, targetState);
  if (eligibility.eligible) {
    return "";
  }

  return eligibility.unmetRequirements[0] || "지원 조건";
}
