function getNewsAppManifest(targetState = state) {
  return {
    id: "news",
    label: "뉴스",
    icon: "📰",
    openRoute: "news/home",
    installable: false,
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => {
      const feedEntries = typeof getDisInternetFeedEntries === "function"
        ? getDisInternetFeedEntries(targetState)
        : [];
      const feedMarkup = feedEntries.length
        ? feedEntries.map((entry) => buildPhoneAppCardMarkup({
            label: "",
            title: entry.title,
            body: entry.body,
            tone: entry.tone || "",
          })).join("")
        : '<div class="phone-job-empty">아직 정리된 뉴스가 없습니다.</div>';

      const refreshButton = buildPhoneAppActionButtonMarkup({
        action: "refresh-news-feed",
        label: "새로고침",
        className: "dis-refresh-btn",
      });

      return `
        <div class="news-app">
          ${buildPhoneAppScreenHeaderMarkup({
            title: "뉴스",
            showHomeButton: !stageMode,
          })}
          ${buildPhoneAppStatusMarkup("news")}
          <div class="news-feed-list">${feedMarkup}</div>
          <div class="dis-refresh-row">${refreshButton}</div>
        </div>
      `;
    },
  };
}
