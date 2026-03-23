function buildGalleryItemsMarkup(targetState = state) {
  const currentLocation = typeof getCurrentLocationLabel === "function"
    ? getCurrentLocationLabel(targetState)
    : "배금시";
  const items = [
    { title: typeof formatTurnBadge === "function" ? formatTurnBadge(1) : "TURN 01" },
    { title: currentLocation },
    { title: "부모님집" },
    { title: "야간 하늘" },
  ];

  return items.map((item) => `
    <article class="phone-gallery-item">
      <div class="phone-gallery-thumb"></div>
      <div class="phone-gallery-title">${escapePhoneAppHtml(item.title)}</div>
      ${item.note ? `<div class="phone-gallery-note">${escapePhoneAppHtml(item.note)}</div>` : ""}
    </article>
  `).join("");
}

function getGalleryAppManifest(targetState = state) {
  return {
    id: "gallery",
    label: "갤러리",
    icon: "🖼️",
    openRoute: "gallery/home",
    installable: false,
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => `
      ${buildPhoneAppScreenHeaderMarkup({
        title: "갤러리",
        showHomeButton: !stageMode,
      })}
      <section class="phone-app-card">
        <div class="phone-app-card-title">최근 사진</div>
        <div class="phone-gallery-grid">
          ${buildGalleryItemsMarkup(targetState)}
        </div>
      </section>
    `,
  };
}
