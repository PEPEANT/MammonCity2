function getMarketPriceText(price = 0) {
  return typeof formatCash === "function"
    ? formatCash(price)
    : `${Math.max(0, Number(price) || 0).toLocaleString("ko-KR")}원`;
}

function isMarketPremiumBuyerEligible(targetState = state) {
  const liquidFunds = typeof getTotalLiquidFunds === "function"
    ? getTotalLiquidFunds(targetState)
    : (
      (typeof getWalletBalance === "function"
        ? getWalletBalance(targetState)
        : Math.max(0, Number(targetState?.money) || 0))
      + Math.max(0, Number(targetState?.bank?.balance) || 0)
    );
  const originTierId = typeof getStartingOriginTierId === "function"
    ? getStartingOriginTierId(targetState)
    : "";
  return liquidFunds >= 5000000 || ["gold", "silver"].includes(originTierId);
}

function canViewMarketListing(listing, targetState = state) {
  return !listing?.premiumOnly || isMarketPremiumBuyerEligible(targetState);
}

function getMarketVisibleListings(activeTab = "home", targetState = state) {
  const listings = typeof getMarketListingCatalog === "function"
    ? getMarketListingCatalog()
    : [];
  const visibleListings = listings.filter((listing) => canViewMarketListing(listing, targetState));

  if (activeTab === "vehicles") {
    return visibleListings.filter((listing) => listing.categoryId === "vehicles");
  }

  if (activeTab === "homes") {
    return visibleListings.filter((listing) => listing.categoryId === "homes");
  }

  if (activeTab === "premium") {
    return visibleListings.filter((listing) => Boolean(listing.premiumOnly));
  }

  return visibleListings;
}

function getMarketDetailActionConfig(listing, targetState = state) {
  if (!listing) {
    return {
      actionId: "",
      label: "닫기",
      disabled: true,
    };
  }

  if (!canViewMarketListing(listing, targetState)) {
    return {
      actionId: "",
      label: "조건 부족",
      disabled: true,
    };
  }

  if (listing.transactionType === "buy") {
    return {
      actionId: "market-buy-listing",
      label: listing.buttonLabel || "거래하기",
      disabled: false,
    };
  }

  return {
    actionId: "market-contact-listing",
    label: listing.buttonLabel || "문의하기",
    disabled: false,
  };
}

function setMarketAppStatusMessage({
  title = "",
  body = "",
  tone = "accent",
  kicker = "MARKET",
  targetState = state,
} = {}) {
  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("market", { kicker, title, body, tone }, targetState);
  }
  if (typeof createPhoneResultPreview === "function") {
    targetState.phonePreview = createPhoneResultPreview("market", kicker, title, body);
  }
}

function buildMarketStatusOnlyResult({
  title = "",
  body = "",
  tone = "fail",
  code = "market-action-failed",
  targetState = state,
} = {}) {
  setMarketAppStatusMessage({
    title,
    body,
    tone,
    targetState,
  });
  return {
    ok: false,
    code,
  };
}

function getMarketListingKind(listing) {
  if (listing?.vehicleId) {
    return "vehicle";
  }
  if (listing?.homeId) {
    return "home";
  }
  if (listing?.itemId) {
    return "item";
  }
  return "listing";
}

function getMarketListingSettlementChannel(listing) {
  const kind = getMarketListingKind(listing);
  return kind === "vehicle" || kind === "home" ? "bank" : "cash";
}

function createMarketAssetRecordPayload(listing, targetState = state) {
  if (!listing) {
    return {};
  }

  return {
    listingId: listing.id,
    acquiredSource: "market",
    acquiredDay: Math.max(1, Math.round(Number(targetState?.day) || 1)),
    purchasePrice: Math.max(0, Math.round(Number(listing.price) || 0)),
    estimatedValue: Math.max(
      0,
      Math.round(Number(listing.resalePrice ?? Math.round((Number(listing.price) || 0) * 0.68)) || 0)
    ),
    note: `호박마켓 직거래 · ${listing.seller || "판매자"}`,
  };
}

function getMarketUnlockJobLabels(listing) {
  const jobIds = Array.isArray(listing?.unlockJobIds) ? listing.unlockJobIds : [];
  return jobIds
    .map((jobId) => JOB_LOOKUP?.[jobId]?.title || "")
    .filter(Boolean);
}

function createMarketListingActionDefinition(listing) {
  if (!listing) {
    return null;
  }

  const settlementChannel = getMarketListingSettlementChannel(listing);
  const balanceRequirementType = settlementChannel === "bank" ? "bank-balance" : "money";
  const requirements = [
    { type: balanceRequirementType, min: listing.price },
  ];
  const operations = [];
  const costs = [
    {
      type: balanceRequirementType,
      amount: listing.price,
      meta: settlementChannel === "bank"
        ? {
            title: `${listing.title} 거래`,
            type: "asset-purchase",
            direction: "out",
            note: listing.vehicleId
              ? "호박마켓 차량 거래"
              : "호박마켓 부동산 거래",
            displayAmountLabel: `-${getMarketPriceText(listing.price)}`,
          }
        : {},
    },
  ];

  if (listing.vehicleId) {
    requirements.push({ type: "owned-vehicle-empty" });
    operations.push({
      type: "set-owned-vehicle",
      vehicleId: listing.vehicleId,
      record: createMarketAssetRecordPayload(listing),
    });
  }

  if (listing.homeId && listing.transactionType === "buy") {
    requirements.push({ type: "owned-home-empty" });
    operations.push({
      type: "set-owned-home",
      homeId: listing.homeId,
      record: createMarketAssetRecordPayload(listing),
    });
  }

  if (listing.itemId) {
    requirements.push({ type: "inventory-item-absent", itemId: listing.itemId });
    operations.push({
      type: "grant-inventory-item",
      itemId: listing.itemId,
      quantity: listing.itemQuantity ?? 1,
    });
    if (listing.equipSlot) {
      operations.push({
        type: "equip-inventory-item",
        slot: listing.equipSlot,
        itemId: listing.itemId,
      });
    }
  }

  (listing.unlockJobIds || []).forEach((jobId) => {
    operations.push({ type: "unlock-job", jobId });
  });

  return {
    id: `market-${listing.transactionType}-${listing.id}`,
    requirements,
    costs,
    operations,
  };
}

function getMarketPurchaseResultMessage(listing) {
  const kind = getMarketListingKind(listing);
  const unlockLabels = getMarketUnlockJobLabels(listing);
  const unlockText = unlockLabels.length
    ? ` ${unlockLabels.join(", ")} 공고도 새로 보이기 시작했다.`
    : "";

  if (kind === "vehicle") {
    const vehicleLabel = typeof getOwnedVehicleDefinition === "function"
      ? getOwnedVehicleDefinition(listing.vehicleId)?.label || "이동수단"
      : "이동수단";
    return `${listing.title} 거래를 마쳤다. 계좌에서 ${getMarketPriceText(listing.price)}이 빠져나갔고 ${vehicleLabel}을 굴릴 수 있게 됐다.${unlockText}`;
  }

  if (kind === "home") {
    const homeLabel = typeof getOwnedHomeDefinition === "function"
      ? getOwnedHomeDefinition(listing.homeId)?.label || "새 거처"
      : "새 거처";
    return `${listing.title} 계약을 마쳤다. 계좌에서 ${getMarketPriceText(listing.price)}을 넣고 거처를 ${homeLabel}으로 옮겼다.${unlockText}`;
  }

  if (kind === "item") {
    const itemDefinition = typeof getInventoryItemDefinition === "function"
      ? getInventoryItemDefinition(listing.itemId)
      : null;
    const itemLabel = itemDefinition?.label || listing.title;
    const equippedText = listing.equipSlot
      ? " 바로 사용 상태로 맞춰뒀다."
      : " 자산 목록에 추가해뒀다.";
    return `${itemLabel} 거래를 마쳤다. ${getMarketPriceText(listing.price)}이 빠져나갔다.${equippedText}${unlockText}`;
  }

  return `${listing.title} 거래를 마쳤다. ${getMarketPriceText(listing.price)}이 빠져나갔다.${unlockText}`;
}

function completeMarketListingPurchase(listing, targetState = state) {
  const resultMessage = getMarketPurchaseResultMessage(listing);
  if (getMarketListingSettlementChannel(listing) === "cash" && typeof showMoneyEffect === "function") {
    showMoneyEffect(-listing.price);
  }
  setMarketAppStatusMessage({
    title: "직거래 완료",
    body: resultMessage,
    tone: "success",
    targetState,
  });
  if (typeof setHeadline === "function") {
    setHeadline("🎃 호박마켓", resultMessage);
  }
  if (typeof recordActionMemory === "function") {
    recordActionMemory(`${listing.title} 거래를 끝냈다`, resultMessage, {
      type: "market",
      source: "호박마켓",
      tags: [
        "직거래",
        listing.categoryId,
        listing.vehicleId || listing.homeId || listing.itemId || listing.id,
      ].filter(Boolean),
    });
  }
  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  }
  if (typeof openPhoneRoute === "function") {
    openPhoneRoute("market/my", targetState);
  }
  if (typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend({ type: "minor", amount: 2 });
  }
  return {
    ok: true,
    listing,
  };
}

function getMarketActionFailureMessage(listing, actionResult = {}) {
  const requirementType = String(
    actionResult?.failedRequirement?.type
    || actionResult?.failedCost?.type
    || actionResult?.result?.code
    || ""
  ).trim().toLowerCase();

  if (requirementType === "owned-vehicle-empty") {
    return {
      title: "기존 탈것 정리 필요",
      body: "현재 보유 중인 탈것을 먼저 정리한 뒤 다시 거래할 수 있습니다.",
      tone: "fail",
    };
  }

  if (requirementType === "owned-home-empty") {
    return {
      title: "기존 거처 정리 필요",
      body: "현재 보유 중인 집을 먼저 정리한 뒤 다시 계약할 수 있습니다.",
      tone: "fail",
    };
  }

  if (requirementType === "inventory-item-absent") {
    return {
      title: "이미 보유 중",
      body: `${listing?.title || "이 매물"}은 이미 가지고 있어 지금 바로 다시 거래할 필요가 없습니다.`,
      tone: "fail",
    };
  }

  if (requirementType === "money") {
    return {
      title: "잔액 부족",
      body: `${getMarketPriceText(listing?.price || 0)}이 필요합니다.`,
      tone: "fail",
    };
  }

  if (requirementType === "bank-balance") {
    return {
      title: "계좌 잔액 부족",
      body: `이 거래는 계좌에서 ${getMarketPriceText(listing?.price || 0)}이 빠져나갑니다.`,
      tone: "fail",
    };
  }

  if (requirementType === "no-active-collateral-loan") {
    return {
      title: "담보 대출 우선 정리",
      body: "담보로 잡힌 자산이라 대출을 먼저 상환해야 되팔 수 있습니다.",
      tone: "fail",
    };
  }

  return {
    title: "거래 실패",
    body: "지금은 이 매물을 거래할 수 없습니다.",
    tone: "fail",
  };
}

function contactMarketListing(listingId, targetState = state) {
  const listing = typeof getMarketListingById === "function"
    ? getMarketListingById(listingId)
    : null;

  if (!listing) {
    return buildMarketStatusOnlyResult({
      title: "매물 없음",
      body: "지금은 이 매물을 찾을 수 없습니다.",
      tone: "fail",
      code: "listing-not-found",
      targetState,
    });
  }

  const message = `${listing.seller}에게 ${listing.title} 문의를 남겼다.`;
  setMarketAppStatusMessage({
    title: "문의 전송",
    body: message,
    tone: "accent",
    targetState,
  });

  if (typeof setHeadline === "function") {
    setHeadline("🎃 호박마켓", message);
  }
  if (typeof recordActionMemory === "function") {
    recordActionMemory("직거래 문의를 남겼다", message, {
      type: "market",
      source: "호박마켓",
      tags: ["직거래", listing.categoryId, listing.id].filter(Boolean),
    });
  }
  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  }
  if (typeof openPhoneRoute === "function") {
    openPhoneRoute("market/chat", targetState);
  }
  if (typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
  }
  return {
    ok: true,
    listing,
  };
}

function createMarketOwnedEntryFromListing(listing, targetState = state) {
  const kind = getMarketListingKind(listing);
  const ownership = typeof syncOwnershipState === "function"
    ? syncOwnershipState(targetState)
    : (targetState?.ownership || {});
  const ownedAssetRecord = kind === "vehicle"
    ? (typeof getOwnedVehicleAssetRecord === "function" ? getOwnedVehicleAssetRecord(targetState) : null)
    : kind === "home"
      ? (typeof getOwnedHomeAssetRecord === "function" ? getOwnedHomeAssetRecord(targetState) : null)
      : null;
  const itemQuantity = listing?.itemId && typeof getInventoryItemQuantity === "function"
    ? getInventoryItemQuantity(listing.itemId, targetState)
    : 0;

  if (kind === "vehicle" && ownership?.vehicle !== listing.vehicleId) {
    return null;
  }
  if (kind === "home" && ownership?.home !== listing.homeId) {
    return null;
  }
  if (kind === "item" && itemQuantity <= 0) {
    return null;
  }

  const assetDefinition = kind === "vehicle"
    ? (typeof getOwnedVehicleDefinition === "function" ? getOwnedVehicleDefinition(listing.vehicleId) : null)
    : kind === "home"
      ? (typeof getOwnedHomeDefinition === "function" ? getOwnedHomeDefinition(listing.homeId) : null)
      : (typeof getInventoryItemDefinition === "function" ? getInventoryItemDefinition(listing.itemId) : null);
  const purchasePrice = kind === "item"
    ? Number(listing.price) || 0
    : Math.max(0, Number(ownedAssetRecord?.purchasePrice ?? listing.price) || 0);
  const resalePrice = kind === "item"
    ? Math.max(0, Number(listing.resalePrice ?? Math.round((Number(listing.price) || 0) * 0.68)) || 0)
    : Math.max(
        0,
        Number(
          ownedAssetRecord?.estimatedValue
          ?? listing.resalePrice
          ?? Math.round((Number(listing.price) || 0) * 0.68)
        ) || 0
      );
  const hasBlockingLoan = ["vehicle", "home"].includes(kind) && typeof hasCollateralLoan === "function"
    ? hasCollateralLoan(kind, kind === "vehicle" ? listing.vehicleId : listing.homeId, targetState)
    : false;
  const saleLockedReason = hasBlockingLoan
    ? "담보 대출이 남아 있어 먼저 상환해야 합니다."
    : (resalePrice > 0 ? "" : "이 자산은 상담 절차가 필요합니다.");
  const acquiredSourceLabel = ownedAssetRecord?.acquiredSource === "origin"
    ? "출생 패키지"
    : ownedAssetRecord?.acquiredSource === "market"
      ? "호박마켓"
      : (ownedAssetRecord?.acquiredSource || "");

  return {
    entryId: listing.id,
    listingId: listing.id,
    kind,
    assetId: kind === "vehicle" ? listing.vehicleId : (kind === "home" ? listing.homeId : listing.itemId),
    title: assetDefinition?.label || listing.title,
    cardTitle: listing.title,
    icon: assetDefinition?.icon || listing.imageEmoji || "📦",
    description: assetDefinition?.description || listing.description || "",
    purchasePrice,
    resalePrice,
    quantity: kind === "item" ? itemQuantity : 1,
    unlockJobLabels: getMarketUnlockJobLabels(listing),
    acquiredDay: Math.max(1, Number(ownedAssetRecord?.acquiredDay) || Number(targetState?.day) || 1),
    acquiredSourceLabel,
    canSell: resalePrice > 0 && !hasBlockingLoan,
    saleLockedReason,
  };
}

function getMarketOwnedEntries(targetState = state) {
  const listings = typeof getMarketListingCatalog === "function"
    ? getMarketListingCatalog()
    : [];

  return listings
    .map((listing) => createMarketOwnedEntryFromListing(listing, targetState))
    .filter(Boolean);
}

function getMarketOwnedEntryById(entryId = "", targetState = state) {
  const normalized = String(entryId || "").trim();
  if (!normalized) {
    return null;
  }

  return getMarketOwnedEntries(targetState).find((entry) => entry.entryId === normalized) || null;
}

function createMarketOwnedEntrySaleDefinition(entry) {
  if (!entry) {
    return null;
  }

  const requirements = [];
  const operations = [];

  if (entry.kind === "vehicle") {
    requirements.push({
      type: "no-active-collateral-loan",
      collateralKind: "vehicle",
      collateralId: entry.assetId,
    });
    operations.push({ type: "clear-owned-vehicle" });
  } else if (entry.kind === "home") {
    requirements.push({
      type: "no-active-collateral-loan",
      collateralKind: "home",
      collateralId: entry.assetId,
    });
    operations.push({ type: "clear-owned-home" });
  } else if (entry.kind === "item") {
    const listing = typeof getMarketListingById === "function"
      ? getMarketListingById(entry.listingId)
      : null;
    operations.push({
      type: "remove-inventory-item",
      itemId: listing?.itemId,
      quantity: 1,
    });
  }

  operations.push(
    entry.kind === "vehicle" || entry.kind === "home"
      ? {
          type: "earn-bank-balance",
          amount: entry.resalePrice,
          meta: {
            title: `${entry.cardTitle} 되팔기`,
            type: "asset-sale",
            direction: "in",
            note: entry.kind === "vehicle" ? "호박마켓 차량 되팔기" : "호박마켓 부동산 정리",
            displayAmountLabel: `+${getMarketPriceText(entry.resalePrice)}`,
          },
        }
      : {
          type: "earn-money",
          amount: entry.resalePrice,
        }
  );

  return {
    id: `market-sell-owned:${entry.entryId}`,
    requirements,
    operations,
  };
}

function getMarketOwnedSaleMessage(entry) {
  if (!entry) {
    return "자산을 정리했다.";
  }

  if (entry.kind === "vehicle") {
    return `${entry.cardTitle}을 정리하고 ${getMarketPriceText(entry.resalePrice)}을 계좌로 회수했다.`;
  }

  if (entry.kind === "home") {
    return `${entry.cardTitle} 계약을 정리하고 ${getMarketPriceText(entry.resalePrice)}을 계좌로 회수했다.`;
  }

  return `${entry.cardTitle}을 되팔아 ${getMarketPriceText(entry.resalePrice)}을 회수했다.`;
}

function completeMarketOwnedEntrySale(entry, targetState = state) {
  const message = getMarketOwnedSaleMessage(entry);
  if (entry.kind === "item" && typeof showMoneyEffect === "function") {
    showMoneyEffect(entry.resalePrice);
  }
  setMarketAppStatusMessage({
    title: "되팔기 완료",
    body: message,
    tone: "success",
    targetState,
  });
  if (typeof setHeadline === "function") {
    setHeadline("🎃 호박마켓", message);
  }
  if (typeof recordActionMemory === "function") {
    recordActionMemory(`${entry.cardTitle}을 정리했다`, message, {
      type: "market",
      source: "호박마켓",
      tags: ["직거래", "되팔기", entry.kind, entry.entryId].filter(Boolean),
    });
  }
  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  }
  if (typeof openPhoneRoute === "function") {
    openPhoneRoute("market/my", targetState);
  }
  if (typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
  }
  return {
    ok: true,
    entry,
  };
}

function buyMarketListing(listingId, targetState = state) {
  const actionRequest = buildMarketBuyActionRequest(listingId, targetState);
  if (!actionRequest) {
    return {
      ok: false,
      code: "action-request-missing",
    };
  }

  if (typeof runActionRequest === "function") {
    return runActionRequest(actionRequest, targetState);
  }

  const result = actionRequest.perform?.(targetState) || { ok: false, code: "perform-missing" };
  if (!result?.rendered && typeof renderGame === "function") {
    renderGame();
  }
  return result;
}

function buildMarketBuyActionRequest(listingId, targetState = state) {
  const listing = typeof getMarketListingById === "function"
    ? getMarketListingById(listingId)
    : null;

  if (!listing || listing.transactionType !== "buy") {
    return {
      id: `market-buy-listing:${listingId || "unknown"}`,
      perform: () => buildMarketStatusOnlyResult({
        title: "거래 불가",
        body: "지금은 바로 거래할 수 없는 매물입니다.",
        tone: "fail",
        code: "listing-unavailable",
        targetState,
      }),
    };
  }

  if (!canViewMarketListing(listing, targetState)) {
    return {
      id: `market-buy-listing:${listing.id}:premium-locked`,
      perform: () => buildMarketStatusOnlyResult({
        title: "프리미엄 조건 부족",
        body: "현금 여력이나 출발 조건이 부족해 이 매물은 아직 바로 거래할 수 없습니다.",
        tone: "fail",
        code: "premium-locked",
        targetState,
      }),
    };
  }

  return {
    id: `market-buy-listing:${listing.id}`,
    definition: createMarketListingActionDefinition(listing),
    onTypedFailure: (actionResult) => {
      const failureMessage = getMarketActionFailureMessage(listing, actionResult);
      setMarketAppStatusMessage({
        ...failureMessage,
        targetState,
      });
      return {
        ok: false,
        code: "typed-action-failed",
        actionResult,
      };
    },
    perform: () => completeMarketListingPurchase(listing, targetState),
  };
}

function buildMarketSellOwnedEntryActionRequest(entryId, targetState = state) {
  const entry = getMarketOwnedEntryById(entryId, targetState);
  if (!entry) {
    return {
      id: `market-sell-owned-entry:${entryId || "unknown"}`,
      perform: () => buildMarketStatusOnlyResult({
        title: "보유 자산 없음",
        body: "지금은 정리할 수 있는 거래 자산을 찾지 못했습니다.",
        tone: "fail",
        code: "owned-entry-missing",
        targetState,
      }),
    };
  }

  if (!entry.canSell) {
    return {
      id: `market-sell-owned-entry:${entry.entryId}:locked`,
      perform: () => buildMarketStatusOnlyResult({
        title: "정리 준비 중",
        body: entry.saleLockedReason || "이 자산의 되팔기는 아직 직접 거래가 아니라 상담 절차가 필요합니다.",
        tone: "accent",
        code: "owned-entry-sell-locked",
        targetState,
      }),
    };
  }

  return {
    id: `market-sell-owned-entry:${entry.entryId}`,
    definition: createMarketOwnedEntrySaleDefinition(entry),
    onTypedFailure: () => buildMarketStatusOnlyResult({
      title: "되팔기 실패",
      body: "자산 정리 도중 문제가 생겨 거래를 끝내지 못했습니다.",
      tone: "fail",
      code: "owned-entry-sell-failed",
      targetState,
    }),
    perform: () => completeMarketOwnedEntrySale(entry, targetState),
  };
}

function buildMarketContactActionRequest(listingId, targetState = state) {
  return {
    id: `market-contact-listing:${listingId || "unknown"}`,
    perform: () => contactMarketListing(listingId, targetState),
  };
}

function resolveMarketPhoneActionRequest(phoneAction, actionTarget, targetState = state) {
  if (phoneAction === "market-buy-listing") {
    return buildMarketBuyActionRequest(actionTarget?.dataset?.listingId, targetState);
  }

  if (phoneAction === "market-contact-listing") {
    return buildMarketContactActionRequest(actionTarget?.dataset?.listingId, targetState);
  }

  if (phoneAction === "market-sell-owned-entry") {
    return buildMarketSellOwnedEntryActionRequest(actionTarget?.dataset?.entryId, targetState);
  }

  return null;
}

function handleMarketAppAction(phoneAction, actionTarget, targetState = state) {
  if (typeof dispatchRegisteredPhoneAction === "function") {
    return dispatchRegisteredPhoneAction(phoneAction, actionTarget, targetState);
  }

  const actionRequest = resolveMarketPhoneActionRequest(phoneAction, actionTarget, targetState);
  if (!actionRequest) {
    return false;
  }

  if (typeof runActionRequest === "function") {
    runActionRequest(actionRequest, targetState);
    return true;
  }

  const result = actionRequest.perform?.(targetState) || { ok: true };
  if (!result?.rendered && typeof renderGame === "function") {
    renderGame();
  }
  return true;
}
