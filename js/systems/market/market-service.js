function getMarketPriceText(price = 0) {
  return typeof formatCash === "function"
    ? formatCash(price)
    : `${Math.max(0, Number(price) || 0).toLocaleString("ko-KR")}원`;
}

function isMarketPremiumBuyerEligible(targetState = state) {
  const cash = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : Math.max(0, Number(targetState?.money) || 0);
  const originTierId = typeof getStartingOriginTierId === "function"
    ? getStartingOriginTierId(targetState)
    : "";
  return cash >= 5000000 || ["gold", "silver"].includes(originTierId);
}

function getMarketVisibleListings(activeTab = "home", targetState = state) {
  const listings = typeof getMarketListingCatalog === "function"
    ? getMarketListingCatalog()
    : [];
  const canViewPremium = isMarketPremiumBuyerEligible(targetState);

  if (activeTab === "vehicles") {
    return listings.filter((listing) => listing.categoryId === "vehicles");
  }

  if (activeTab === "homes") {
    return listings.filter((listing) => listing.categoryId === "homes");
  }

  if (activeTab === "premium") {
    return canViewPremium
      ? listings.filter((listing) => Boolean(listing.premiumOnly))
      : [];
  }

  return listings.filter((listing) => !listing.premiumOnly || canViewPremium);
}

function getMarketDetailActionConfig(listing, targetState = state) {
  if (!listing) {
    return {
      actionId: "",
      label: "닫기",
      disabled: true,
    };
  }

  if (listing.premiumOnly && !isMarketPremiumBuyerEligible(targetState)) {
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

function createMarketListingActionDefinition(listing) {
  if (!listing) {
    return null;
  }

  const requirements = [
    { type: "money", min: listing.price },
  ];
  const operations = [];

  if (listing.vehicleId) {
    requirements.push({ type: "owned-vehicle-empty" });
    operations.push({ type: "set-owned-vehicle", vehicleId: listing.vehicleId });
  }

  if (listing.homeId && listing.transactionType === "buy") {
    requirements.push({ type: "owned-home-empty" });
    operations.push({ type: "set-owned-home", homeId: listing.homeId });
  }

  return {
    id: `market-${listing.transactionType}-${listing.id}`,
    requirements,
    costs: [
      { type: "money", amount: listing.price },
    ],
    operations,
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

  if (requirementType === "money") {
    return {
      title: "잔액 부족",
      body: `${getMarketPriceText(listing?.price || 0)}이 필요합니다.`,
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
    return false;
  }

  const message = `${listing.seller}에게 ${listing.title} 문의를 남겼다.`;
  setMarketAppStatusMessage({
    title: "문의 전송",
    body: message,
    tone: "accent",
    targetState,
  });

  if (typeof setHeadline === "function") {
    setHeadline("🥕 당큰마켓", message);
  }
  if (typeof recordActionMemory === "function") {
    recordActionMemory("직거래 문의를 남겼다", message, {
      type: "market",
      source: "당큰마켓",
      tags: ["직거래", listing.categoryId, listing.id].filter(Boolean),
    });
  }
  if (typeof openPhoneRoute === "function") {
    openPhoneRoute("market/chat", targetState);
  }
  if (typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend({ type: "minor", amount: 1 });
  }
  return true;
}

function buyMarketListing(listingId, targetState = state) {
  const listing = typeof getMarketListingById === "function"
    ? getMarketListingById(listingId)
    : null;

  if (!listing || listing.transactionType !== "buy") {
    setMarketAppStatusMessage({
      title: "거래 불가",
      body: "지금은 바로 거래할 수 없는 매물입니다.",
      tone: "fail",
      targetState,
    });
    if (typeof renderGame === "function") {
      renderGame();
    }
    return false;
  }

  if (listing.premiumOnly && !isMarketPremiumBuyerEligible(targetState)) {
    setMarketAppStatusMessage({
      title: "프리미엄 조건 부족",
      body: "현금 여력이나 출발 조건이 부족해 이 매물은 아직 바로 거래할 수 없습니다.",
      tone: "fail",
      targetState,
    });
    if (typeof renderGame === "function") {
      renderGame();
    }
    return false;
  }

  const actionDefinition = createMarketListingActionDefinition(listing);
  const actionResult = typeof runTypedActionDefinition === "function"
    ? runTypedActionDefinition(actionDefinition, targetState)
    : { ok: false };

  if (!actionResult?.ok) {
    const failureMessage = getMarketActionFailureMessage(listing, actionResult);
    setMarketAppStatusMessage({
      ...failureMessage,
      targetState,
    });
    if (typeof renderGame === "function") {
      renderGame();
    }
    return false;
  }

  const resultMessage = `${listing.title} 거래를 마쳤다. ${getMarketPriceText(listing.price)}이 빠져나갔고 이동수단이 추가됐다.`;
  if (typeof showMoneyEffect === "function") {
    showMoneyEffect(-listing.price);
  }
  setMarketAppStatusMessage({
    title: "직거래 완료",
    body: resultMessage,
    tone: "success",
    targetState,
  });
  if (typeof setHeadline === "function") {
    setHeadline("🥕 당큰마켓", resultMessage);
  }
  if (typeof recordActionMemory === "function") {
    recordActionMemory(`${listing.title} 거래를 끝냈다`, resultMessage, {
      type: "market",
      source: "당큰마켓",
      tags: ["직거래", "차량", listing.vehicleId || listing.id].filter(Boolean),
    });
  }
  if (typeof openPhoneRoute === "function") {
    openPhoneRoute("market/my", targetState);
  }
  if (typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend({ type: "minor", amount: 2 });
  }
  return true;
}

function handleMarketAppAction(phoneAction, actionTarget, targetState = state) {
  if (phoneAction === "market-buy-listing") {
    buyMarketListing(actionTarget?.dataset?.listingId, targetState);
    return true;
  }

  if (phoneAction === "market-contact-listing") {
    contactMarketListing(actionTarget?.dataset?.listingId, targetState);
    return true;
  }

  return false;
}
