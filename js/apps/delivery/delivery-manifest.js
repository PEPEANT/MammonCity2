function getDeliveryAppManifest(targetState = state) {
  const economy = typeof getTodayEconomy === "function"
    ? getTodayEconomy(targetState)
    : null;
  const indexedCost = typeof getIndexedPrice === "function"
    ? getIndexedPrice(15000, targetState)
    : 15000;

  return {
    id: "delivery",
    label: "배달",
    icon: "🍔",
    openRoute: "delivery/home",
    installable: true,
    storeCategory: "생활",
    storeDescription: "집에서도 바로 한 끼를 주문할 수 있습니다.",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => `
      ${buildPhoneAppScreenHeaderMarkup({
        kicker: "DELIVERY",
        title: "배달 주문",
        note: "오늘 물가를 반영한 가격으로 바로 주문합니다.",
        showHomeButton: !stageMode,
      })}
      ${buildPhoneAppStatusMarkup("delivery", buildPhoneAppCardMarkup({
        label: "추천 메뉴",
        title: "골목 분식 세트",
        body: economy
          ? `오늘 가격 ${formatCash(indexedCost)}. 물가지수 ${economy.priceIndex.toFixed(2)}가 반영됩니다.`
          : "가격 15,000원. 문 앞까지 빠르게 배달됩니다.",
        tone: economy && economy.priceChangePercent > 0 ? "fail" : "",
      }))}
      ${buildPhoneAppCardMarkup({
        label: "지금 주문",
        title: `한 끼 배달 ${formatCash(indexedCost)}`,
        body: "주문하면 오늘 행동 한 번을 사용합니다.",
        actionsHtml: buildPhoneAppActionButtonMarkup({
          action: "order-delivery-meal",
          label: "주문",
          disabled: Boolean(targetState.phoneUsedToday),
        }),
      })}
    `,
  };
}
