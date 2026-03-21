function buildPlayStoreCatalogRowMarkup(app) {
  return `
    <div class="playstore-row">
      <div class="playstore-row-copy">
        <div class="playstore-row-title">${escapePhoneAppHtml(`${app.icon} ${app.label}`)}</div>
        <div class="playstore-row-meta">${escapePhoneAppHtml(app.storeCategory || "앱")}</div>
      </div>
      ${buildPhoneAppActionButtonMarkup({
        action: "install-phone-app",
        label: "설치",
        data: { "app-id": app.id },
        className: "playstore-install-btn",
      })}
    </div>
  `;
}

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
        ? catalog.map((app) => buildPlayStoreCatalogRowMarkup(app)).join("")
        : '<div class="phone-job-empty">설치 가능한 앱이 없습니다.</div>';

      const installedMarkup = installedApps.length
        ? installedApps.map((app) => `
            <span class="playstore-installed-chip">${escapePhoneAppHtml(`${app.icon} ${app.label}`)}</span>
          `).join("")
        : '<span class="playstore-installed-chip is-empty">추가 설치 앱 없음</span>';

      return `
        <div class="playstore-app">
          ${buildPhoneAppScreenHeaderMarkup({
            title: "앱",
            showHomeButton: !stageMode,
          })}
          ${buildPhoneAppStatusMarkup("playstore")}
          <section class="playstore-installed-block">
            <div class="playstore-section-title">설치 앱</div>
            <div class="playstore-installed-list">${installedMarkup}</div>
          </section>
          <section class="playstore-list">
            ${catalogMarkup}
          </section>
        </div>
      `;
    },
  };
}
