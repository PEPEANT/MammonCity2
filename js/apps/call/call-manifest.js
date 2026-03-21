function getCallAppManifest(targetState = state) {
  return {
    id: "call",
    label: "전화",
    icon: "📞",
    openRoute: "call/home",
    installable: false,
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => `
      ${buildPhoneAppScreenHeaderMarkup({
        title: "전화",
        showHomeButton: !stageMode,
      })}
      ${buildPhoneAppStatusMarkup("call", buildPhoneAppCardMarkup({
        title: "엄마",
      }))}
      ${buildPhoneAppCardMarkup({
        title: "엄마",
        actionsHtml: buildPhoneAppActionButtonMarkup({
          action: "call-home-contact",
          label: "전화",
        }),
      })}
    `,
  };
}
