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
    storeDescription: "배달 앱",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => `
      ${buildPhoneAppScreenHeaderMarkup({
        title: "배달",
        showHomeButton: !stageMode,
      })}
      ${buildPhoneAppStatusMarkup("delivery", buildPhoneAppCardMarkup({
        title: "골목 분식 세트",
        body: economy
          ? formatCash(indexedCost)
          : "15,000원",
        tone: economy && economy.priceChangePercent > 0 ? "fail" : "",
      }))}
      ${buildPhoneAppCardMarkup({
        title: `주문 ${formatCash(indexedCost)}`,
        actionsHtml: buildPhoneAppActionButtonMarkup({
          action: "order-delivery-meal",
          label: "주문",
          disabled: Boolean(targetState.phoneUsedToday),
        }),
      })}
    `,
  };
}
