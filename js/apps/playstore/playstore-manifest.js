function getPlayStoreAppManifest(targetState = state) {
  return {
    id: "playstore",
    label: "플레이스토어",
    icon: "🛒",
    openRoute: "playstore/home",
    installable: false,
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => {
      const catalog = typeof getPhoneStoreCatalog === "function"
        ? getPhoneStoreCatalog(targetState)
        : [];
      const installedApps = typeof getInstalledPhoneAppRegistry === "function"
        ? getInstalledPhoneAppRegistry(targetState).filter((app) => app.installable)
        : [];

      const catalogMarkup = catalog.length
        ? catalog.map((app) => buildPhoneAppCardMarkup({
            label: app.storeCategory || "추천 앱",
            title: `${app.icon} ${app.label}`,
            body: app.storeDescription || "새 앱을 설치해 생활 루프를 확장합니다.",
            actionsHtml: buildPhoneAppActionButtonMarkup({
              action: "install-phone-app",
              label: "설치",
              data: { "app-id": app.id },
            }),
          })).join("")
        : '<div class="phone-job-empty">지금 설치할 수 있는 앱이 없습니다.</div>';

      const installedMarkup = installedApps.length
        ? installedApps.map((app) => `<span class="phone-job-tag">${escapePhoneAppHtml(`${app.icon} ${app.label}`)}</span>`).join("")
        : '<span class="phone-job-tag">아직 추가 설치한 앱이 없습니다.</span>';

      return `
        ${buildPhoneAppScreenHeaderMarkup({
          kicker: "PLAY STORE",
          title: "앱 설치 센터",
          note: "필요한 앱을 설치해서 폰 홈 화면에 추가합니다.",
          showHomeButton: !stageMode,
        })}
        ${buildPhoneAppStatusMarkup("playstore")}
        <section class="phone-app-card">
          <div class="phone-app-card-label">설치된 추가 앱</div>
          <div class="phone-job-tags">${installedMarkup}</div>
        </section>
        ${catalogMarkup}
      `;
    },
  };
}
