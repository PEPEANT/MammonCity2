function buildGalleryItemsMarkup(targetState = state) {
  const currentLocation = typeof getCurrentLocationLabel === "function"
    ? getCurrentLocationLabel(targetState)
    : "배금시";
  const items = [
    { title: "DAY 01", note: "기본 셀카" },
    { title: currentLocation, note: "오늘의 풍경" },
    { title: "부모님집", note: "방 안의 기록" },
    { title: "야간 하늘", note: "저장된 스냅" },
  ];

  return items.map((item) => `
    <article class="phone-gallery-item">
      <div class="phone-gallery-thumb"></div>
      <div class="phone-gallery-title">${escapePhoneAppHtml(item.title)}</div>
      <div class="phone-gallery-note">${escapePhoneAppHtml(item.note)}</div>
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
        kicker: "GALLERY",
        title: "저장된 사진",
        note: "도시를 버티며 남긴 장면들을 모아 봅니다.",
        showHomeButton: !stageMode,
      })}
      <section class="phone-app-card">
        <div class="phone-app-card-label">최근 앨범</div>
        <div class="phone-gallery-grid">
          ${buildGalleryItemsMarkup(targetState)}
        </div>
      </section>
    `,
  };
}
