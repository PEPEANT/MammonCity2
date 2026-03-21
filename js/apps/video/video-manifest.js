function getVideoAppManifest(targetState = state) {
  return {
    id: "video",
    label: "DIS Tube",
    icon: "📺",
    openRoute: "video/home",
    installable: true,
    storeCategory: "오락",
    storeDescription: "영상 앱",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => `
      ${buildPhoneAppScreenHeaderMarkup({
        title: "영상",
        showHomeButton: !stageMode,
      })}
      ${buildPhoneAppStatusMarkup("video", buildPhoneAppCardMarkup({
        title: "추천 영상",
      }))}
      ${buildPhoneAppCardMarkup({
        title: "쇼츠",
        actionsHtml: buildPhoneAppActionButtonMarkup({
          action: "watch-video-feed",
          label: "재생",
          disabled: Boolean(targetState.phoneUsedToday),
        }),
      })}
    `,
  };
}
