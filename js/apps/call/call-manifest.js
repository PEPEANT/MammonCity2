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
        kicker: "CALL",
        title: "연락처",
        note: "가족과 잠깐 통화하며 상황을 정리합니다.",
        showHomeButton: !stageMode,
      })}
      ${buildPhoneAppStatusMarkup("call", buildPhoneAppCardMarkup({
        label: "빠른 연락",
        title: "엄마",
        body: "집에 늦는지, 오늘 하루는 어땠는지 잠깐 통화할 수 있습니다.",
      }))}
      ${buildPhoneAppCardMarkup({
        label: "주 연락처",
        title: "엄마에게 전화",
        body: "1분 정도 짧게 안부를 나눕니다.",
        actionsHtml: buildPhoneAppActionButtonMarkup({
          action: "call-home-contact",
          label: "통화",
        }),
      })}
    `,
  };
}
