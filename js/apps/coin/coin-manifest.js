function getCoinAppManifest(targetState = state) {
  return {
    id: "coin",
    label: "코인",
    icon: "🪙",
    openRoute: "coin/home",
    installable: true,
    storeCategory: "투자",
    storeDescription: "코인 거래 앱",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => (
      stageMode
        ? buildTradingTerminalStageMarkup("coin", targetState, {
            title: "코인",
          })
        : buildTradingTerminalCompactMarkup("coin", targetState, {
            title: "코인",
          })
    ),
  };
}
