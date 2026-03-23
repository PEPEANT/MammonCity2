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

  if (type === "bank-balance") {
    const minimum = Math.max(0, Number(requirement.min) || 0);
    const balance = typeof getBankBalance === "function"
      ? getBankBalance(targetState)
      : Math.max(0, Number(targetState?.bank?.balance) || 0);
    return {
      ok: balance >= minimum,
      code: "bank-balance",
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

  if (type === "inventory-item-absent") {
    const itemId = String(requirement.itemId || "").trim();
    const owned = itemId && typeof hasInventoryItem === "function"
      ? hasInventoryItem(itemId, targetState)
      : false;
    return {
      ok: !owned,
      code: "inventory-item-absent",
      requirement,
      current: itemId,
    };
  }

  if (type === "no-active-collateral-loan") {
    const collateralKind = String(requirement.collateralKind || "").trim().toLowerCase();
    const collateralId = String(requirement.collateralId || "").trim();
    const blocked = collateralKind && collateralId && typeof hasCollateralLoan === "function"
      ? hasCollateralLoan(collateralKind, collateralId, targetState)
      : false;
    return {
      ok: !blocked,
      code: "no-active-collateral-loan",
      requirement,
      current: collateralId,
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

  if (type === "bank-balance") {
    const amount = Math.max(0, Number(cost.amount) || 0);
    const success = typeof spendBankBalance === "function"
      ? spendBankBalance(amount, cost.meta || {}, targetState)
      : false;
    return {
      ok: success,
      code: "bank-balance",
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
    setOwnedVehicle(operation.vehicleId, targetState, operation.record || operation.meta || {});
    return { ok: true };
  }

  if (type === "set-owned-home") {
    if (typeof setOwnedHome !== "function") {
      return { ok: false, code: "missing-operation-handler", operation };
    }
    setOwnedHome(operation.homeId, targetState, operation.record || operation.meta || {});
    return { ok: true };
  }

  if (type === "clear-owned-vehicle") {
    if (typeof setOwnedVehicle !== "function") {
      return { ok: false, code: "missing-operation-handler", operation };
    }
    setOwnedVehicle(null, targetState, operation.meta || {});
    return { ok: true };
  }

  if (type === "clear-owned-home") {
    if (typeof setOwnedHome !== "function") {
      return { ok: false, code: "missing-operation-handler", operation };
    }
    setOwnedHome(null, targetState, operation.meta || {});
    return { ok: true };
  }

  if (type === "grant-inventory-item") {
    if (typeof grantInventoryItem !== "function") {
      return { ok: false, code: "missing-operation-handler", operation };
    }
    grantInventoryItem(operation.itemId, operation.quantity ?? 1, targetState);
    return { ok: true };
  }

  if (type === "remove-inventory-item") {
    if (typeof consumeInventoryItem !== "function") {
      return { ok: false, code: "missing-operation-handler", operation };
    }
    const success = consumeInventoryItem(operation.itemId, operation.quantity ?? 1, targetState);
    return success
      ? { ok: true }
      : { ok: false, code: "inventory-item-missing", operation };
  }

  if (type === "equip-inventory-item") {
    if (typeof setEquippedInventoryItem !== "function") {
      return { ok: false, code: "missing-operation-handler", operation };
    }
    setEquippedInventoryItem(operation.slot, operation.itemId, targetState);
    return { ok: true };
  }

  if (type === "unlock-job") {
    const jobId = String(operation.jobId || "").trim();
    if (!jobId) {
      return { ok: false, code: "job-id-missing", operation };
    }
    if (!(targetState.activeJobs instanceof Set)) {
      targetState.activeJobs = new Set(Array.isArray(targetState.activeJobs) ? targetState.activeJobs : []);
    }
    targetState.activeJobs.add(jobId);
    return { ok: true };
  }

  if (type === "earn-money") {
    if (typeof earnCash !== "function") {
      return { ok: false, code: "missing-operation-handler", operation };
    }
    earnCash(operation.amount, targetState);
    return { ok: true };
  }

  if (type === "earn-bank-balance") {
    if (typeof earnBankBalance !== "function") {
      return { ok: false, code: "missing-operation-handler", operation };
    }
    earnBankBalance(operation.amount, operation.meta || {}, targetState);
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

function normalizeActionRunnerResult(result) {
  if (result == null) {
    return {
      ok: true,
      rendered: false,
    };
  }

  if (typeof result === "boolean") {
    return {
      ok: result,
      rendered: false,
    };
  }

  if (typeof result === "object") {
    return {
      ok: result.ok !== false,
      rendered: Boolean(result.rendered),
      ...result,
    };
  }

  return {
    ok: true,
    rendered: false,
  };
}

function runActionRequest(actionRequest = {}, targetState = state) {
  if (!actionRequest || typeof actionRequest !== "object") {
    return {
      handled: false,
      ok: false,
      rendered: false,
    };
  }

  let typedActionResult = null;

  if (actionRequest.definition) {
    typedActionResult = runTypedActionDefinition(actionRequest.definition, targetState);
    if (!typedActionResult?.ok) {
      const failureResult = normalizeActionRunnerResult(
        typeof actionRequest.onTypedFailure === "function"
          ? actionRequest.onTypedFailure(typedActionResult, targetState)
          : { ok: false }
      );

      if (!failureResult.rendered && actionRequest.autoRender !== false && typeof renderGame === "function") {
        renderGame();
        failureResult.rendered = true;
      }

      return {
        handled: true,
        ok: false,
        stage: typedActionResult.stage || "typed-action",
        typedActionResult,
        ...failureResult,
      };
    }
  }

  const performResult = normalizeActionRunnerResult(
    typeof actionRequest.perform === "function"
      ? actionRequest.perform(targetState, { typedActionResult, actionRequest })
      : { ok: true }
  );

  if (!performResult.rendered && actionRequest.autoRender !== false && typeof renderGame === "function") {
    renderGame();
    performResult.rendered = true;
  }

  return {
    handled: true,
    stage: "complete",
    typedActionResult,
    ...performResult,
  };
}

function resolveRegisteredPhoneActionRequest(phoneAction = "", actionTarget = null, targetState = state) {
  const resolvers = [
    typeof resolveMarketPhoneActionRequest === "function" ? resolveMarketPhoneActionRequest : null,
    typeof resolveJobsPhoneActionRequest === "function" ? resolveJobsPhoneActionRequest : null,
  ].filter(Boolean);

  for (const resolver of resolvers) {
    const request = resolver(phoneAction, actionTarget, targetState);
    if (request) {
      return request;
    }
  }

  return null;
}

function dispatchRegisteredPhoneAction(phoneAction = "", actionTarget = null, targetState = state) {
  const actionRequest = resolveRegisteredPhoneActionRequest(phoneAction, actionTarget, targetState);
  if (!actionRequest) {
    return false;
  }

  runActionRequest(actionRequest, targetState);
  return true;
}
