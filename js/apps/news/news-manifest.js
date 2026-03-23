const NEWS_APP_CATEGORY_ITEMS = [
  { id: "headlines", label: "헤드라인", icon: "🌐" },
  { id: "foryou", label: "추천", icon: "⭐" },
  { id: "local", label: "지역 뉴스", icon: "📍" },
  { divider: true, id: "divider-1" },
  { id: "world", label: "세계", icon: "🌍" },
  { id: "business", label: "비즈니스", icon: "💼" },
  { id: "tech", label: "기술", icon: "💻" },
  { id: "entertainment", label: "엔터", icon: "🎬" },
  { id: "sports", label: "스포츠", icon: "🏆" },
  { id: "science", label: "과학", icon: "🧪" },
  { id: "health", label: "건강", icon: "🩺" },
];

const NEWS_APP_TOP_CATEGORY_IDS = ["headlines", "foryou", "local", "business", "tech"];

const NEWS_APP_SOURCE_BANK = Object.freeze({
  headlines: ["전국일보", "데일리브리프", "뉴스라인"],
  foryou: ["알고픽", "투데이픽", "추천 뉴스"],
  local: ["배금로컬", "동네속보", "생활 브리핑"],
  world: ["글로벌데스크", "월드리포트", "국제헤드라인"],
  business: ["비즈포커스", "마켓워치", "경제경제"],
  tech: ["테크타임즈", "디지털데일리", "IT브리프"],
  entertainment: ["시네마천국", "컬처픽", "엔터투데이"],
  sports: ["스포츠조아", "경기일보", "스코어보드"],
  science: ["사이언스라인", "리서치데일리", "랩노트"],
  health: ["헬스포스트", "메디컬투데이", "건강 리포트"],
});

const NEWS_APP_TIME_LABELS = [
  "28분 전",
  "1시간 전",
  "2시간 전",
  "3시간 전",
  "4시간 전",
  "5시간 전",
  "6시간 전",
  "7시간 전",
  "8시간 전",
];

const NEWS_APP_VISUAL_MAP = Object.freeze({
  headlines: { tone: "headlines", accent: "G", emoji: "📰", label: "HEADLINES" },
  foryou: { tone: "foryou", accent: "★", emoji: "✨", label: "FOR YOU" },
  local: { tone: "local", accent: "📍", emoji: "🏙️", label: "LOCAL" },
  world: { tone: "world", accent: "🌍", emoji: "🗺️", label: "WORLD" },
  business: { tone: "business", accent: "₩", emoji: "📈", label: "MARKET" },
  tech: { tone: "tech", accent: "AI", emoji: "💻", label: "TECH" },
  entertainment: { tone: "entertainment", accent: "▶", emoji: "🎬", label: "CULTURE" },
  sports: { tone: "sports", accent: "GO", emoji: "🏆", label: "SPORTS" },
  science: { tone: "science", accent: "LAB", emoji: "🧪", label: "SCIENCE" },
  health: { tone: "health", accent: "+", emoji: "🩺", label: "HEALTH" },
});

function getNewsCategoryMeta(categoryId = "headlines") {
  return NEWS_APP_CATEGORY_ITEMS.find((item) => item.id === categoryId) || NEWS_APP_CATEGORY_ITEMS[0];
}

function parseNewsRouteState(screenId = "home") {
  const normalized = String(screenId || "home").trim().toLowerCase() || "home";

  if (normalized === "menu") {
    return {
      activeCategoryId: "headlines",
      menuOpen: true,
    };
  }

  if (normalized.startsWith("menu-")) {
    return {
      activeCategoryId: normalized.slice(5) || "headlines",
      menuOpen: true,
    };
  }

  return {
    activeCategoryId: normalized === "home" ? "headlines" : normalized,
    menuOpen: false,
  };
}

function buildNewsRoute(categoryId = "headlines", menuOpen = false) {
  const normalized = String(categoryId || "headlines").trim().toLowerCase() || "headlines";
  return `news/${menuOpen ? `menu-${normalized}` : normalized}`;
}

function getNewsSourceLabel(categoryId = "headlines", index = 0) {
  const bank = NEWS_APP_SOURCE_BANK[categoryId] || NEWS_APP_SOURCE_BANK.headlines;
  return bank[index % bank.length];
}

function getNewsRelativeTimeLabel(index = 0) {
  return NEWS_APP_TIME_LABELS[index % NEWS_APP_TIME_LABELS.length];
}

function trimNewsCopy(text = "", limit = 120) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  return normalized.length > limit
    ? `${normalized.slice(0, Math.max(0, limit - 1)).trim()}…`
    : normalized;
}

function createNewsStory({
  id,
  categoryIds = [],
  title = "",
  summary = "",
  source = "",
  timeLabel = "",
  tone = "headlines",
  label = "",
  emoji = "",
  accent = "",
  isMajor = false,
  recommended = false,
} = {}) {
  const visual = NEWS_APP_VISUAL_MAP[tone] || NEWS_APP_VISUAL_MAP.headlines;

  return {
    id,
    categoryIds,
    title,
    summary,
    source,
    timeLabel,
    tone: visual.tone,
    visualLabel: label || visual.label,
    visualEmoji: emoji || visual.emoji,
    visualAccent: accent || visual.accent,
    isMajor,
    recommended,
  };
}

function buildNewsStoriesFromFeedEntries(targetState = state) {
  const locationLabel = typeof getCurrentLocationLabel === "function"
    ? getCurrentLocationLabel(targetState)
    : "배금시";
  const feedEntries = typeof getDisInternetFeedEntries === "function"
    ? getDisInternetFeedEntries(targetState)
    : [];
  const feedById = new Map(feedEntries.map((entry) => [entry.id, entry]));

  const economyEntry = feedById.get("economy");
  const marketEntry = feedById.get("market");
  const exchangeEntry = feedById.get("exchange");
  const localEntry = feedById.get("local");
  const memeEntry = feedById.get("meme");

  const stories = [];

  if (memeEntry) {
    stories.push(createNewsStory({
      id: "lead-meme",
      categoryIds: ["headlines", "foryou", "tech", "business"],
      title: memeEntry.title,
      summary: trimNewsCopy(memeEntry.body, 142),
      source: getNewsSourceLabel("tech", 0),
      timeLabel: getNewsRelativeTimeLabel(0),
      tone: "tech",
      isMajor: true,
      recommended: true,
    }));
    stories.push(createNewsStory({
      id: "meme-related",
      categoryIds: ["foryou", "tech", "business"],
      title: `${locationLabel} 투자 커뮤니티, ${memeEntry.title.replace(/\.$/, "")} 이슈로 검색량 확대`,
      summary: "커뮤니티 반응과 실시간 검색량이 동시에 올라오며 관련 피드가 추천 탭 상단으로 묶였다.",
      source: getNewsSourceLabel("foryou", 1),
      timeLabel: getNewsRelativeTimeLabel(3),
      tone: "foryou",
      recommended: true,
    }));
  }

  if (economyEntry) {
    stories.push(createNewsStory({
      id: "economy-lead",
      categoryIds: ["headlines", "business", "local", "foryou"],
      title: economyEntry.title,
      summary: trimNewsCopy(economyEntry.body, 126),
      source: getNewsSourceLabel("business", 0),
      timeLabel: getNewsRelativeTimeLabel(1),
      tone: "business",
      recommended: true,
    }));
    stories.push(createNewsStory({
      id: "local-living-cost",
      categoryIds: ["local", "business"],
      title: `${locationLabel} 생활비 체감도, 한 끼 가격과 함께 다시 주목`,
      summary: "동네 상권과 식비 체감 정보가 묶여 올라오며 지역 뉴스 탭에서 가장 많이 읽힌 기사군으로 잡혔다.",
      source: getNewsSourceLabel("local", 0),
      timeLabel: getNewsRelativeTimeLabel(4),
      tone: "local",
    }));
  }

  if (marketEntry) {
    stories.push(createNewsStory({
      id: "market-wrap",
      categoryIds: ["headlines", "business", "world", "foryou"],
      title: marketEntry.title,
      summary: trimNewsCopy(marketEntry.body, 120),
      source: getNewsSourceLabel("business", 1),
      timeLabel: getNewsRelativeTimeLabel(2),
      tone: "business",
      recommended: true,
    }));
    stories.push(createNewsStory({
      id: "market-watch",
      categoryIds: ["business", "world"],
      title: "개인 투자자들, 오늘 장 마감 분위기와 변동성 지표에 촉각",
      summary: "성공 확률과 움직임 요약이 빠르게 퍼지며 주요 마켓 리포트 카드에 함께 묶였다.",
      source: getNewsSourceLabel("world", 0),
      timeLabel: getNewsRelativeTimeLabel(5),
      tone: "world",
    }));
  }

  if (exchangeEntry) {
    stories.push(createNewsStory({
      id: "exchange-focus",
      categoryIds: ["headlines", "world", "business"],
      title: exchangeEntry.title,
      summary: trimNewsCopy(exchangeEntry.body, 118),
      source: getNewsSourceLabel("world", 1),
      timeLabel: getNewsRelativeTimeLabel(6),
      tone: "world",
    }));
  }

  if (localEntry) {
    stories.push(createNewsStory({
      id: "local-live",
      categoryIds: ["headlines", "local", "foryou"],
      title: localEntry.title,
      summary: trimNewsCopy(localEntry.body, 120),
      source: getNewsSourceLabel("local", 1),
      timeLabel: getNewsRelativeTimeLabel(7),
      tone: "local",
      recommended: true,
    }));
  }

  stories.push(createNewsStory({
    id: "tech-bus-app",
    categoryIds: ["tech", "foryou", "headlines"],
    title: "배금버스 앱 디자인 개편, 노선도와 터미널 시간표를 한 화면에 정리",
    summary: "지도 기반 이동과 앱 내 교통 정보 접근성이 동시에 손질되며 생활형 기술 뉴스로 묶였다.",
    source: getNewsSourceLabel("tech", 1),
    timeLabel: getNewsRelativeTimeLabel(1),
    tone: "tech",
    recommended: true,
  }));
  stories.push(createNewsStory({
    id: "entertainment-busker",
    categoryIds: ["entertainment", "local"],
    title: "역전광장과 캠퍼스 공원 버스킹, 늦은 오후 유동 인구 끌어모아",
    summary: "공연 일정과 현장 분위기를 다룬 문화 브리핑이 지역 뉴스 탭에서도 함께 노출됐다.",
    source: getNewsSourceLabel("entertainment", 0),
    timeLabel: getNewsRelativeTimeLabel(2),
    tone: "entertainment",
  }));
  stories.push(createNewsStory({
    id: "sports-city-run",
    categoryIds: ["sports", "local"],
    title: "배금시 야간 러닝 모임 증가, 역 앞과 하천변 코스 다시 인기",
    summary: "생활 체육 인구가 늘면서 퇴근 이후 모임 공지가 지역 커뮤니티에 빠르게 확산됐다.",
    source: getNewsSourceLabel("sports", 0),
    timeLabel: getNewsRelativeTimeLabel(3),
    tone: "sports",
  }));
  stories.push(createNewsStory({
    id: "science-campus",
    categoryIds: ["science", "tech"],
    title: "대학가 실험동 밤샘 가동, 학기 초 연구 프로젝트 모집 공지 확대",
    summary: "캠퍼스 구역 유동 인구와 함께 연구 지원 정보가 기술·과학 탭에서 동시에 보이기 시작했다.",
    source: getNewsSourceLabel("science", 0),
    timeLabel: getNewsRelativeTimeLabel(4),
    tone: "science",
  }));
  stories.push(createNewsStory({
    id: "health-hospital",
    categoryIds: ["health", "local"],
    title: "배금병원 상담 대기시간 완화, 오전 접수 분산 효과 나타나",
    summary: "병원 구역 안내 동선이 정리되면서 건강 탭에서 가장 많이 본 지역 의료 기사로 올랐다.",
    source: getNewsSourceLabel("health", 0),
    timeLabel: getNewsRelativeTimeLabel(5),
    tone: "health",
  }));

  return stories;
}

function filterNewsStoriesByCategory(stories = [], activeCategoryId = "headlines") {
  if (activeCategoryId === "headlines") {
    return stories;
  }

  if (activeCategoryId === "foryou") {
    return stories.filter((story) => story.recommended || story.isMajor);
  }

  return stories.filter((story) => Array.isArray(story.categoryIds) && story.categoryIds.includes(activeCategoryId));
}

function getNewsStatusMarkup() {
  const status = typeof getPhoneAppStatus === "function"
    ? getPhoneAppStatus("news")
    : null;

  if (!status?.title && !status?.body) {
    return "";
  }

  return `
    <section class="news-status-banner${status.tone ? ` is-${escapePhoneAppHtml(status.tone)}` : ""}">
      ${status.kicker ? `<div class="news-status-kicker">${escapePhoneAppHtml(status.kicker)}</div>` : ""}
      ${status.title ? `<div class="news-status-title">${escapePhoneAppHtml(status.title)}</div>` : ""}
      ${status.body ? `<div class="news-status-body">${escapePhoneAppHtml(status.body)}</div>` : ""}
    </section>
  `;
}

function buildNewsLogoMarkup() {
  return `
    <div class="news-google-logo" aria-label="Google 뉴스">
      <span class="is-blue">G</span>
      <span class="is-red">o</span>
      <span class="is-yellow">o</span>
      <span class="is-blue">g</span>
      <span class="is-green">l</span>
      <span class="is-red">e</span>
      <span class="news-google-logo-tail">뉴스</span>
    </div>
  `;
}

function buildNewsTopTabsMarkup(activeCategoryId = "headlines") {
  return `
    <div class="news-top-tabs" role="tablist" aria-label="뉴스 카테고리">
      ${NEWS_APP_TOP_CATEGORY_IDS.map((categoryId) => {
        const category = getNewsCategoryMeta(categoryId);
        return buildPhoneRouteButtonMarkup({
          route: buildNewsRoute(categoryId),
          label: category.label,
          className: `news-top-tab${activeCategoryId === categoryId ? " is-active" : ""}`,
        });
      }).join("")}
    </div>
  `;
}

function buildNewsDrawerMarkup(activeCategoryId = "headlines") {
  return `
    <div class="news-drawer-layer">
      ${buildPhoneRouteButtonMarkup({
        route: buildNewsRoute(activeCategoryId),
        label: "닫기",
        className: "news-drawer-backdrop",
      })}
      <aside class="news-drawer" aria-label="뉴스 카테고리">
        <div class="news-drawer-head">
          ${buildNewsLogoMarkup()}
        </div>
        <div class="news-drawer-list">
          ${NEWS_APP_CATEGORY_ITEMS.map((item, index) => {
            if (item.divider) {
              return `<div class="news-drawer-divider" aria-hidden="true"></div>`;
            }

            return buildPhoneRouteButtonMarkup({
              route: buildNewsRoute(item.id),
              label: `${item.icon} ${item.label}`,
              className: `news-drawer-item${activeCategoryId === item.id ? " is-active" : ""}`,
              data: { index },
            });
          }).join("")}
        </div>
        <div class="news-drawer-footer">
          <span>⚙️ 설정</span>
          <span>❔ 도움말</span>
        </div>
      </aside>
    </div>
  `;
}

function buildNewsHeroCardMarkup(story = null) {
  if (!story) {
    return "";
  }

  return `
    <article class="news-hero-card">
      <div class="news-hero-copy">
        <div class="news-story-tag">${escapePhoneAppHtml(story.visualLabel)}</div>
        <h2 class="news-hero-title">${escapePhoneAppHtml(story.title)}</h2>
        <p class="news-hero-summary">${escapePhoneAppHtml(story.summary)}</p>
        <div class="news-story-meta">
          <span class="news-story-source">${escapePhoneAppHtml(story.source)}</span>
          <span class="news-story-dot">•</span>
          <span>${escapePhoneAppHtml(story.timeLabel)}</span>
        </div>
        <div class="news-story-tools" aria-hidden="true">
          <span class="news-story-tool">🔖</span>
          <span class="news-story-tool">⋮</span>
        </div>
      </div>
      <div class="news-hero-visual is-${escapePhoneAppHtml(story.tone)}" aria-hidden="true">
        <span class="news-hero-emoji">${escapePhoneAppHtml(story.visualEmoji)}</span>
        <span class="news-hero-accent">${escapePhoneAppHtml(story.visualAccent)}</span>
      </div>
    </article>
  `;
}

function buildNewsCardMarkup(story = null) {
  if (!story) {
    return "";
  }

  return `
    <article class="news-story-card">
      <div class="news-story-card-copy">
        <div class="news-story-card-kicker">${escapePhoneAppHtml(story.visualLabel)}</div>
        <h3 class="news-story-card-title">${escapePhoneAppHtml(story.title)}</h3>
        <div class="news-story-meta">
          <span class="news-story-source">${escapePhoneAppHtml(story.source)}</span>
          <span class="news-story-dot">•</span>
          <span>${escapePhoneAppHtml(story.timeLabel)}</span>
        </div>
      </div>
      <div class="news-story-card-visual is-${escapePhoneAppHtml(story.tone)}" aria-hidden="true">
        <span class="news-story-card-emoji">${escapePhoneAppHtml(story.visualEmoji)}</span>
        <span class="news-story-card-accent">${escapePhoneAppHtml(story.visualAccent)}</span>
      </div>
      <div class="news-story-card-tools" aria-hidden="true">
        <span class="news-story-tool">🔖</span>
        <span class="news-story-tool">↗</span>
        <span class="news-story-tool">⋮</span>
      </div>
    </article>
  `;
}

function buildNewsCompactCardMarkup(story = null) {
  if (!story) {
    return "";
  }

  return `
    <article class="news-compact-card">
      <div class="news-compact-dot is-${escapePhoneAppHtml(story.tone)}" aria-hidden="true"></div>
      <div class="news-compact-copy">
        <div class="news-compact-kicker-row">
          <span class="news-compact-kicker">${escapePhoneAppHtml(story.visualLabel)}</span>
          <span class="news-compact-time">${escapePhoneAppHtml(story.timeLabel)}</span>
        </div>
        <h3 class="news-compact-title">${escapePhoneAppHtml(story.title)}</h3>
        <div class="news-compact-meta">
          <span class="news-story-source">${escapePhoneAppHtml(story.source)}</span>
        </div>
      </div>
    </article>
  `;
}

function buildNewsEmptyMarkup(activeCategoryId = "headlines") {
  const category = getNewsCategoryMeta(activeCategoryId);
  return `
    <div class="news-empty-state">
      <div class="news-empty-icon" aria-hidden="true">${escapePhoneAppHtml(category.icon || "📰")}</div>
      <div class="news-empty-title">${escapePhoneAppHtml(category.label)} 소식이 아직 없습니다.</div>
      <div class="news-empty-copy">다른 카테고리를 보거나 새로고침해서 최신 묶음을 다시 불러오세요.</div>
    </div>
  `;
}

function buildNewsScreenMarkup({ stageMode = false, screenId = "home" } = {}, targetState = state) {
  const routeState = parseNewsRouteState(screenId);
  const activeCategory = getNewsCategoryMeta(routeState.activeCategoryId);
  const stories = filterNewsStoriesByCategory(buildNewsStoriesFromFeedEntries(targetState), routeState.activeCategoryId);
  const heroStory = stories.find((story) => story.isMajor) || stories[0] || null;
  const regularStories = stories.filter((story) => story.id !== heroStory?.id);

  return `
    <div class="news-google-app">
      <header class="news-app-header">
        <div class="news-app-header-main">
          ${buildPhoneRouteButtonMarkup({
            route: buildNewsRoute(routeState.activeCategoryId, true),
            label: "☰",
            className: "news-app-icon-btn is-menu",
          })}
          ${buildNewsLogoMarkup()}
        </div>
        <div class="news-app-header-right">
          <span class="news-app-icon-btn is-grid" aria-hidden="true">◫</span>
          <span class="news-app-avatar" aria-hidden="true">유</span>
        </div>
      </header>

      <div class="news-app-search-row">
        <div class="news-app-search-shell" role="search">
          <span class="news-app-search-icon" aria-hidden="true">⌕</span>
          <span class="news-app-search-placeholder">주제, 위치, 매체 검색</span>
        </div>
      </div>

      ${buildNewsTopTabsMarkup(routeState.activeCategoryId)}
      ${getNewsStatusMarkup()}

      <main class="news-app-content">
        <div class="news-app-section-head">
          <h1 class="news-app-section-title">${escapePhoneAppHtml(activeCategory.label)}</h1>
          ${buildPhoneAppActionButtonMarkup({
            action: "refresh-news-feed",
            label: "새로고침",
            className: "news-refresh-btn",
          })}
        </div>

        ${heroStory ? `
          <div class="news-app-story-stack">
            ${buildNewsHeroCardMarkup(heroStory)}
            <section class="news-compact-section" aria-label="짧게 보기">
              <div class="news-compact-section-head">짧게 보기</div>
              <div class="news-compact-list">
                ${regularStories.map((story) => buildNewsCompactCardMarkup(story)).join("")}
              </div>
            </section>
            <div class="news-app-grid">
              ${regularStories.map((story) => buildNewsCardMarkup(story)).join("")}
            </div>
          </div>
        ` : buildNewsEmptyMarkup(routeState.activeCategoryId)}
      </main>

      ${routeState.menuOpen ? buildNewsDrawerMarkup(routeState.activeCategoryId) : ""}
    </div>
  `;
}

function getNewsAppManifest(targetState = state) {
  return {
    id: "news",
    label: "뉴스",
    icon: "📰",
    openRoute: "news/home",
    screenMode: "fullbleed",
    installable: false,
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false, screenId = "home" } = {}) => (
      buildNewsScreenMarkup({ stageMode, screenId }, targetState)
    ),
  };
}
