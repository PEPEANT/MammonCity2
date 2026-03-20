function getVideoAppManifest(targetState = state) {
  return {
    id: "video",
    label: "DIS Tube",
    icon: "📺",
    openRoute: "video/home",
    installable: true,
    storeCategory: "오락",
    storeDescription: "짧은 영상을 보다 보면 시간이 크게 사라집니다.",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => `
      ${buildPhoneAppScreenHeaderMarkup({
        kicker: "DIS TUBE",
        title: "짧은 영상 피드",
        note: "멍하니 보다 보면 시간 감각이 흐려집니다.",
        showHomeButton: !stageMode,
      })}
      ${buildPhoneAppStatusMarkup("video", buildPhoneAppCardMarkup({
        label: "추천 피드",
        title: "지금 뜨는 영상",
        body: "웃긴 영상, 도시 괴담, 자극적인 소비 브이로그가 끝없이 이어집니다.",
      }))}
      ${buildPhoneAppCardMarkup({
        label: "연속 재생",
        title: "쇼츠 보기",
        body: "시간이 크게 흐르며 오늘 행동 한 번을 사용합니다.",
        actionsHtml: buildPhoneAppActionButtonMarkup({
          action: "watch-video-feed",
          label: "재생",
          disabled: Boolean(targetState.phoneUsedToday),
        }),
      })}
    `,
  };
}
