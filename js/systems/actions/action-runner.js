// Keep the action runner intentionally thin.
// Domain services prepare definitions, this runner only executes shared flow.

function evaluateTypedActionRequirement(requirement = {}, targetState = state) {
  const type = String(requirement?.type || "").trim().toLowerCase();

  if (!type) {
    return { ok: true };
  }

  if (type === "money") {
    const minimum = Math.max(0, Number(requirement.min) || 0);
    const balance = typeof getWalletBalance === "function"
      ? getWalletBalance(targetState)
      : Math.max(0, Number(targetState?.money) || 0);
    return {
      ok: balance >= minimum,
      code: "money",
      requirement,
      current: balance,
      expected: minimum,
    };
  }

  if (type === "owned-vehicle-empty") {
    const ownership = typeof syncOwnershipState === "function"
      ? syncOwnershipState(targetState)
      : (targetState?.ownership || {});
    return {
      ok: !ownership?.vehicle,
      code: "owned-vehicle-empty",
      requirement,
      current: ownership?.vehicle || "",
    };
  }

  if (type === "owned-home-empty") {
    const ownership = typeof syncOwnershipState === "function"
      ? syncOwnershipState(targetState)
      : (targetState?.ownership || {});
    return {
      ok: !ownership?.home,
      code: "owned-home-empty",
      requirement,
      current: ownership?.home || "",
    };
  }

  return { ok: true };
}

function applyTypedActionCost(cost = {}, targetState = state) {
  const type = String(cost?.type || "").trim().toLowerCase();

  if (!type) {
    return { ok: true };
  }

  if (type === "money") {
    const amount = Math.max(0, Number(cost.amount) || 0);
    const success = typeof spendCash === "function"
      ? spendCash(amount, targetState)
      : false;
    return {
      ok: success,
      code: "money",
      cost,
    };
  }

  return { ok: true };
}

function applyTypedActionOperation(operation = {}, targetState = state) {
  const type = String(operation?.type || "").trim().toLowerCase();

  if (!type) {
    return { ok: true };
  }

  if (type === "set-owned-vehicle") {
    if (typeof setOwnedVehicle !== "function") {
      return { ok: false, code: "missing-operation-handler", operation };
    }
    setOwnedVehicle(operation.vehicleId, targetState);
    return { ok: true };
  }

  if (type === "set-owned-home") {
    if (typeof setOwnedHome !== "function") {
      return { ok: false, code: "missing-operation-handler", operation };
    }
    setOwnedHome(operation.homeId, targetState);
    return { ok: true };
  }

  return { ok: true };
}

function runTypedActionDefinition(actionDefinition = {}, targetState = state) {
  const requirements = Array.isArray(actionDefinition?.requirements)
    ? actionDefinition.requirements
    : [];
  const costs = Array.isArray(actionDefinition?.costs)
    ? actionDefinition.costs
    : [];
  const operations = Array.isArray(actionDefinition?.operations)
    ? actionDefinition.operations
    : [];

  for (const requirement of requirements) {
    const result = evaluateTypedActionRequirement(requirement, targetState);
    if (!result?.ok) {
      return {
        ok: false,
        stage: "requirement",
        failedRequirement: requirement,
        result,
      };
    }
  }

  for (const cost of costs) {
    const previewRequirement = evaluateTypedActionRequirement({
      type: cost.type,
      min: cost.amount,
    }, targetState);
    if (!previewRequirement?.ok && String(cost?.type || "").trim().toLowerCase() === "money") {
      return {
        ok: false,
        stage: "cost",
        failedCost: cost,
        result: previewRequirement,
      };
    }
  }

  for (const cost of costs) {
    const result = applyTypedActionCost(cost, targetState);
    if (!result?.ok) {
      return {
        ok: false,
        stage: "cost",
        failedCost: cost,
        result,
      };
    }
  }

  for (const operation of operations) {
    const result = applyTypedActionOperation(operation, targetState);
    if (!result?.ok) {
      return {
        ok: false,
        stage: "operation",
        failedOperation: operation,
        result,
      };
    }
  }

  return {
    ok: true,
    actionDefinition,
  };
}
