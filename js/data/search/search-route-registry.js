const DIGGLE_SEARCH_ROUTE_REGISTRY = Object.freeze([
  Object.freeze({
    id: "market-premium",
    keywords: ["외제차", "고급차", "프리미엄"],
    appId: "market",
    route: "market/premium",
    fallbackRoute: "playstore/home",
    title: "프리미엄 차량 매물",
    body: "당큰마켓 프리미엄 매물 탭으로 이동해 외제차와 고급 직거래 매물을 바로 확인합니다.",
    tags: ["당큰마켓", "외제차", "프리미엄", "직거래"],
  }),
  Object.freeze({
    id: "market-homes",
    keywords: ["부동산", "원룸", "오피스텔", "월세", "전세", "매매"],
    appId: "market",
    route: "market/homes",
    fallbackRoute: "playstore/home",
    title: "부동산 직거래 매물",
    body: "원룸과 오피스텔 같은 부동산 매물을 당큰마켓 부동산 탭에서 바로 확인합니다.",
    tags: ["당큰마켓", "부동산", "원룸", "오피스텔", "직거래"],
  }),
  Object.freeze({
    id: "market-vehicles",
    keywords: ["차량", "중고차", "자전거", "오토바이", "바이크"],
    appId: "market",
    route: "market/vehicles",
    fallbackRoute: "playstore/home",
    title: "이동수단 직거래 매물",
    body: "자전거, 오토바이, 중고차 매물을 당큰마켓에서 바로 비교합니다.",
    tags: ["당큰마켓", "차량", "오토바이", "자전거", "중고차"],
  }),
  Object.freeze({
    id: "market-home",
    keywords: ["당근", "당큰", "직거래", "중고거래"],
    appId: "market",
    route: "market/home",
    fallbackRoute: "playstore/home",
    title: "당큰마켓",
    body: "중고 이동수단과 부동산 직거래 매물을 한 화면에서 바로 확인할 수 있습니다.",
    tags: ["당큰마켓", "직거래", "중고거래"],
  }),
]);

const DIGGLE_HISTORY_ROUTE_ENTRIES = Object.freeze([
  Object.freeze({
    label: "당큰마켓",
    route: "market/home",
  }),
  Object.freeze({
    label: "도박",
    route: "dis/gamble",
  }),
  Object.freeze({
    label: "뉴스",
    route: "news/home",
  }),
]);

function normalizeDiggleRouteQuery(query = "") {
  return String(query || "").trim().toLowerCase();
}

function getDiggleRouteEntryDefinition(query = "") {
  const normalized = normalizeDiggleRouteQuery(query);
  if (!normalized) {
    return null;
  }

  return DIGGLE_SEARCH_ROUTE_REGISTRY.find((entry) => (
    Array.isArray(entry.keywords)
    && entry.keywords.some((keyword) => normalized.includes(String(keyword || "").toLowerCase()))
  )) || null;
}

function buildDiggleRouteSearchEntry(query = "", targetState = state) {
  const entry = getDiggleRouteEntryDefinition(query);
  if (!entry) {
    return null;
  }

  const hasApp = entry.appId && typeof isPhoneAppInstalled === "function"
    ? isPhoneAppInstalled(entry.appId, targetState)
    : true;
  const route = hasApp ? entry.route : (entry.fallbackRoute || entry.route);

  return {
    id: entry.id,
    kicker: "DIRECT",
    title: entry.title,
    body: entry.body,
    tone: "accent",
    tags: [...(entry.tags || [])],
    route,
    routeLabel: hasApp ? "열기" : "설치",
  };
}

function getDiggleHistoryRouteEntries() {
  return DIGGLE_HISTORY_ROUTE_ENTRIES.map((entry) => ({ ...entry }));
}
