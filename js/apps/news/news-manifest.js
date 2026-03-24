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

const NEWS_APP_TURN_CATEGORY_LIBRARY = Object.freeze({
  1: {
    tech: {
      title: "VC 한파에 AI 스타트업 채용 동결... '데모보다 현금흐름' 강조",
      summary: "생성형 AI 기대는 남았지만 투자자는 사용자 수보다 잔고와 생존 전략을 먼저 묻기 시작했다.",
    },
    entertainment: {
      title: "{location} 소규모 공연 할인전... 문화소비도 방어 모드",
      summary: "흥행보다 가성비가 먼저 언급되며 밤 시간 지갑이 눈에 띄게 무거워졌다.",
    },
    sports: {
      title: "스폰서 예산 축소 여파... 지역 생활체육 대회도 규모 조정",
      summary: "브랜드 노출보다 비용 절감이 앞서며 대형 이벤트보다 소규모 모임이 늘어난다.",
    },
    science: {
      title: "연구비 집행 보수화... 반도체·바이오 실험 일정도 늦어져",
      summary: "기관은 성과보다 리스크 관리에 무게를 두며 신규 프로젝트 승인 속도를 늦춘다.",
    },
    health: {
      title: "불면·스트레스 상담 늘었다... 경기 냉각에 정신건강 이슈 부각",
      summary: "투자 손실과 생활비 압박이 겹치며 잠을 못 잔다는 호소가 지역 병원에 늘었다.",
    },
  },
  2: {
    tech: {
      title: "테크업계 '다운라운드' 공포... 앱 지표보다 런웨이 점검",
      summary: "화려한 발표보다 버티는 시간이 중요해지며 채용과 마케팅이 함께 줄어든다.",
    },
    entertainment: {
      title: "신작보다 재방문 할인... 공연장도 조용한 비수기",
      summary: "악재에도 놀라지 않는 대신 지갑을 닫는 체념형 소비가 문화시장에 번진다.",
    },
    sports: {
      title: "운동 모임도 가성비 전환... 회비 낮춘 러닝클럽만 살아남아",
      summary: "장비 구매 대신 무료 코스와 소규모 모임이 인기를 얻는 침체형 스포츠 뉴스다.",
    },
    science: {
      title: "학회 출장은 줄이고 온라인 발표 확대... 연구현장도 비용 절감",
      summary: "프로젝트는 이어지지만 누구도 공격적으로 예산을 쓰지 않는 분위기다.",
    },
    health: {
      title: "검진 미루는 사람 늘었다... '지금은 버티는 게 먼저'",
      summary: "예방보다 생존이 우선이 되며 병원 예약도 필요한 것만 남기는 흐름이 강하다.",
    },
  },
  3: {
    tech: {
      title: "반값 매물 된 SaaS들... 일부 VC 저가매수 검토",
      summary: "싸졌다는 인식이 퍼지며 기술주와 스타트업에도 선별 투자 문의가 조금씩 늘어난다.",
    },
    entertainment: {
      title: "작은 공연부터 관객 복귀... '완전한 회복은 아직' 신중론",
      summary: "예매율은 살아나지만 업계는 데드캣 바운스가 아닌지 살피는 표정이다.",
    },
    sports: {
      title: "봄철 대회 참가 신청 반등... 관망하던 동호인들도 다시 몸 푼다",
      summary: "체육 소비는 작게 살아나지만 후원과 대형 행사 복귀는 조금 더 시간이 필요하다.",
    },
    science: {
      title: "AI·반도체 연구주 일부 반등... 실험 장비 발주 문의 회복",
      summary: "연구 현장도 완전한 낙관은 아니지만 바닥을 확인하려는 움직임이 감지된다.",
    },
    health: {
      title: "수면클리닉 예약 회복... 공포 잦아들며 관리 수요 조금씩 복귀",
      summary: "위기 직후의 긴장감이 누그러지며 미뤘던 건강 관리가 천천히 돌아온다.",
    },
  },
  4: {
    tech: {
      title: "AI 데모데이 다시 붐... 생산성 소프트웨어 목표가 상향",
      summary: "회복 기류와 함께 기술기업의 성장 스토리가 다시 시장 전면으로 떠오른다.",
    },
    entertainment: {
      title: "영화·공연 예매율 개선... '최악은 지났다' 문화업계 안도",
      summary: "작년 내내 미뤄졌던 소비가 소폭 돌아오며 흥행 기대 기사도 늘어난다.",
    },
    sports: {
      title: "{location} 야간 경기 티켓도 다시 팔린다... 관중 회복세",
      summary: "퇴근 뒤 여가가 살아나면서 스포츠가 회복 심리를 보여주는 지표처럼 취급된다.",
    },
    science: {
      title: "반도체·로봇 연구과제 경쟁 재점화... 지원사업 공고 확대",
      summary: "기술 회복 기대가 연구비 집행과 신규 프로젝트 모집으로 이어지는 초입이다.",
    },
    health: {
      title: "피트니스·건강관리 앱 결제 반등... 자기관리 수요 되살아나",
      summary: "소비심리가 풀리며 병원보다 웰니스 쪽 지출이 먼저 살아나는 모습이다.",
    },
  },
  5: {
    tech: {
      title: "AI 인프라 투자 재가속... 클라우드·반도체 생태계 동반 강세",
      summary: "기업들은 다시 성장 스토리를 말하고, 투자자는 비용보다 확장성을 먼저 본다.",
    },
    entertainment: {
      title: "페스티벌 라인업 확대... 브랜드 협찬도 하나둘 복귀",
      summary: "사람이 몰리는 곳에 돈도 붙기 시작하며 문화 뉴스가 다시 화려해진다.",
    },
    sports: {
      title: "스포츠 브랜드 신제품 판매 회복... 러닝·트레일 장비 인기",
      summary: "경기 회복과 함께 운동도 소비가 되는 분위기가 뚜렷해진다.",
    },
    science: {
      title: "AI·바이오 공동연구 펀딩 확대... 대학가 연구실 불 다시 켜져",
      summary: "기술 낙관론이 연구개발 자금 유입으로 번지며 실험실 분위기도 빠르게 살아난다.",
    },
    health: {
      title: "프리미엄 검진·건강식 수요 증가... '몸에도 투자' 인식 확산",
      summary: "불황기에 줄였던 자기관리 소비가 복귀하며 건강 시장이 회복 신호를 보낸다.",
    },
  },
  6: {
    tech: {
      title: "안 사면 늦는다... AI 관련주·앱 지표 모두 추격 매수",
      summary: "생산성 혁신 서사가 과장되기 시작하며 사용자 성장률 하나에도 밸류가 크게 튄다.",
    },
    entertainment: {
      title: "콘서트 암표·굿즈 완판 행렬... 문화소비에도 FOMO 번졌다",
      summary: "지금 즐기지 않으면 늦는다는 심리가 가격 민감도를 빠르게 무디게 만든다.",
    },
    sports: {
      title: "프리미엄 좌석·유니폼 판매 급증... 팬심도 위험선호 모드",
      summary: "스포츠 소비가 경험 투자에서 과시성 소비로 넘어가는 시점이 포착된다.",
    },
    science: {
      title: "AI 논문·스타트업 스핀오프 붐... 연구실도 '속도전' 모드",
      summary: "검증보다 발표와 확장이 앞서며 기술·과학 뉴스가 같이 달아오른다.",
    },
    health: {
      title: "헬스장·러닝앱 신규 가입 폭증... 바디프로필 열풍 재점화",
      summary: "건강 관리마저 수익 인증 문화처럼 과열되며 단기 성과 집착이 짙어진다.",
    },
  },
  7: {
    tech: {
      title: "'이번엔 다르다' AI 과열론... 적자 기업도 기대감만으로 급등",
      summary: "실적보다 꿈이 비싸게 거래되며 테크 뉴스가 거의 홍보 기사처럼 소비된다.",
    },
    entertainment: {
      title: "유명 페스티벌 티켓 웃돈 거래... 엔터업계도 과열 신호",
      summary: "콘텐츠 가치보다 희소성과 인증 욕구가 가격을 밀어 올리는 국면이다.",
    },
    sports: {
      title: "고가 장비·프리미엄 클래스 불티... 취미도 빚내서 즐긴다",
      summary: "운동과 스포츠가 건강이 아니라 과시와 소비의 언어로 빠르게 이동한다.",
    },
    science: {
      title: "AI 스타트업 밸류 1년 새 급등... 교수 창업 러시까지",
      summary: "연구와 사업의 경계가 흐려지며 검증보다 자금 조달 기사에 더 관심이 몰린다.",
    },
    health: {
      title: "고가 웰니스·주사 시술 열풍... 자기관리 시장도 '이번엔 다르다'",
      summary: "회복을 넘어 과열이 붙으며 건강 산업도 기대감이 가격을 끌어올리는 구간이다.",
    },
  },
  8: {
    tech: {
      title: "밈 앱·AI 테마주 광풍... '실적보다 다운로드 스샷'이 통했다",
      summary: "숫자의 질보다 커뮤니티 열기와 캡처 이미지가 더 강한 가격 재료로 작동한다.",
    },
    entertainment: {
      title: "버추얼 아이돌·숏폼 스타 몸값 폭등... 엔터업계도 거품 논란",
      summary: "광고 단가와 행사 개런티가 비상식적으로 뛰며 시장은 정점을 향해 달린다.",
    },
    sports: {
      title: "한정판 스니커즈·굿즈 리셀 과열... 취미시장에도 광풍",
      summary: "운동은 더 이상 운동이 아니라 차익과 인증의 소재가 되며 피로가 누적된다.",
    },
    science: {
      title: "AI 쇼케이스는 화려한데 검증은 뒷전... 과학계 안팎도 시끌",
      summary: "시연 영상이 논문보다 더 빨리 퍼지며 연구 성과의 진짜 가치가 흐려진다.",
    },
    health: {
      title: "디톡스·속성 감량 광고 범람... 건강시장도 과장 마케팅 정점",
      summary: "효과보다 자극적인 문구가 앞서며 규제 필요성이 조용히 거론되기 시작한다.",
    },
  },
  9: {
    tech: {
      title: "내부자 매도와 AI 거품 경고... 테크업계도 균열 감지",
      summary: "오랫동안 좋기만 하던 기사 톤에 처음으로 밸류 부담과 경계 문구가 붙는다.",
    },
    entertainment: {
      title: "흥행작은 남았지만 군중 열기는 식었다... 행사 취소도 드문드문",
      summary: "겉으론 활기롭지만 가격 부담과 피로감이 동시에 커지며 균열이 보인다.",
    },
    sports: {
      title: "고가 스포츠 소비 둔화... 프리미엄 티켓 resale도 식기 시작",
      summary: "과열됐던 팬덤 소비가 진정되며 실속형 지출로 돌아가려는 움직임이 확인된다.",
    },
    science: {
      title: "화려한 데모 뒤 검증 요구 커져... 연구비도 선별 집행",
      summary: "기술 낙관이 한풀 꺾이자 연구 현장도 속도보다 재현 가능성을 다시 묻는다.",
    },
    health: {
      title: "과장 광고 단속 예고... 웰니스 시장도 '거품' 지적",
      summary: "과열 마케팅이 규제 레이더에 들어오며 건강 업계 심리도 눈에 띄게 식는다.",
    },
  },
  10: {
    tech: {
      title: "기술주 급락 쇼크... AI 대장주 하루 만에 기대 프리미엄 증발",
      summary: "과열의 상징이던 종목부터 무너지며 테크 뉴스의 문체가 곧장 공포 모드로 바뀐다.",
    },
    entertainment: {
      title: "공연·행사 취소 속출... 소비심리 급랭에 문화시장 직격탄",
      summary: "가장 먼저 줄일 수 있는 지출부터 잘리며 문화업계는 냉각 충격을 크게 맞는다.",
    },
    sports: {
      title: "헬스·레저 소비 급감... 고가 장비 중고 매물 한꺼번에 쏟아져",
      summary: "과열기 동안 쌓였던 소비가 급랭하며 스포츠 시장도 매물과 할인 뉴스가 늘어난다.",
    },
    science: {
      title: "VC 자금 급랭... AI·바이오 연구 프로젝트 일정 연기",
      summary: "발표 때는 빨랐던 자금이 순식간에 얼어붙으며 연구현장도 현실 점검에 들어간다.",
    },
    health: {
      title: "불안·공황 상담 증가... 투자 충격이 정신건강 수요 자극",
      summary: "손실과 스트레스가 겹치며 건강 뉴스도 회복보다 위기 관리 기사 비중이 커진다.",
    },
  },
  11: {
    tech: {
      title: "대량 해고·서비스 종료 공포... 테크업계 패닉셀의 그림자",
      summary: "살아남는 기업보다 사라지는 기업 이야기가 더 많이 회자되며 신뢰가 흔들린다.",
    },
    entertainment: {
      title: "OTT 해지·공연 환불 문의 급증... 문화 소비도 손절 모드",
      summary: "즐길 여유보다 현금 확보가 먼저가 되며 엔터시장도 패닉성 축소에 들어간다.",
    },
    sports: {
      title: "동호회 회비 미납 늘고 대회 참가 취소... 취미도 멈췄다",
      summary: "과열기에 늘었던 모임과 소비가 한꺼번에 꺼지며 체육 시장도 얼어붙는다.",
    },
    science: {
      title: "연구과제 구조조정 본격화... 실험실도 생존 우선",
      summary: "검증과 축소가 핵심 키워드가 되며 과학 뉴스도 미래보다 버티기에 초점이 간다.",
    },
    health: {
      title: "'현금이 최고의 약' 자조 확산... 검진과 치료도 미루는 사람들",
      summary: "정신건강 수요는 커지지만 비용 부담으로 실제 치료 접근성은 더 나빠지는 역설이 나타난다.",
    },
  },
  12: {
    tech: {
      title: "버블 걷히자 진짜 실력주만 남았다... 테크업계 옥석 가리기",
      summary: "광풍이 지나간 뒤 매출과 현금흐름이 있는 기업에만 천천히 관심이 다시 붙는다.",
    },
    entertainment: {
      title: "대형 흥행보다 작은 회복... 동네 공연과 영화관부터 관객 돌아와",
      summary: "화려하진 않지만 무너졌던 문화 수요가 조심스럽게 바닥을 다지는 흐름이다.",
    },
    sports: {
      title: "무리한 소비는 꺼졌지만 달리기·헬스는 남았다... 일상형 운동 복귀",
      summary: "과시성 지출은 줄고 꾸준히 계속할 수 있는 운동 문화가 다시 자리 잡는다.",
    },
    science: {
      title: "기초연구와 실용기술 재평가... 과학계도 다음 사이클 준비",
      summary: "속도전이 끝난 자리에서 재현성과 실용성이 다시 중요한 기준으로 떠오른다.",
    },
    health: {
      title: "회복보다 재정비... 수면·식단·기초검진 같은 기본 관리 재조명",
      summary: "과열과 공포를 다 겪은 뒤에야 건강 뉴스는 다시 꾸준함의 가치를 말하기 시작한다.",
    },
  },
});

const NEWS_APP_DYNAMIC_CATEGORY_STORY_CONFIGS = Object.freeze([
  {
    id: "cycle-preview",
    key: "preview",
    categoryIds: ["foryou", "business", "world"],
    sourceCategory: "foryou",
    sourceIndex: 2,
    timeIndex: 8,
    tone: "foryou",
    label: "OUTLOOK",
    emoji: "🔭",
    accent: "NEXT",
    recommended: true,
  },
  {
    id: "tech-turn",
    key: "tech",
    categoryIds: ["tech", "foryou", "headlines"],
    sourceCategory: "tech",
    sourceIndex: 1,
    timeIndex: 1,
    tone: "tech",
    recommended: true,
  },
  {
    id: "entertainment-turn",
    key: "entertainment",
    categoryIds: ["entertainment", "foryou", "local"],
    sourceCategory: "entertainment",
    sourceIndex: 0,
    timeIndex: 2,
    tone: "entertainment",
  },
  {
    id: "sports-turn",
    key: "sports",
    categoryIds: ["sports", "local", "foryou"],
    sourceCategory: "sports",
    sourceIndex: 0,
    timeIndex: 3,
    tone: "sports",
  },
  {
    id: "science-turn",
    key: "science",
    categoryIds: ["science", "tech", "world"],
    sourceCategory: "science",
    sourceIndex: 0,
    timeIndex: 4,
    tone: "science",
  },
  {
    id: "health-turn",
    key: "health",
    categoryIds: ["health", "local", "foryou"],
    sourceCategory: "health",
    sourceIndex: 0,
    timeIndex: 5,
    tone: "health",
  },
]);

const NEWS_APP_CATEGORY_STORY_PRIORITY = Object.freeze({
  foryou: Object.freeze({
    "foryou-signal": 0,
    "cycle-preview": 1,
    "economy-lead": 2,
    "market-wrap": 3,
    "local-live": 4,
    "tech-turn": 5,
    "meme-related": 6,
  }),
  world: Object.freeze({
    "exchange-focus": 0,
    "cycle-preview": 1,
    "market-wrap": 2,
    "market-watch": 3,
    "science-turn": 4,
  }),
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

function getNewsTurnStoryLibrary(day = 1) {
  const safeDay = Math.max(1, Math.min(12, Math.floor(Number(day) || 1)));
  return NEWS_APP_TURN_CATEGORY_LIBRARY[safeDay] || NEWS_APP_TURN_CATEGORY_LIBRARY[1];
}

function fillNewsTemplateCopy(text = "", variables = {}) {
  return String(text || "").replace(/\{(\w+)\}/g, (match, key) => {
    const value = variables[key];
    return value == null ? "" : String(value);
  });
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

function sortNewsStoriesForCategory(stories = [], activeCategoryId = "headlines") {
  const priorityMap = NEWS_APP_CATEGORY_STORY_PRIORITY[activeCategoryId];
  if (!priorityMap) {
    return stories;
  }

  return stories
    .map((story, index) => ({
      story,
      index,
      priority: Object.prototype.hasOwnProperty.call(priorityMap, story.id)
        ? priorityMap[story.id]
        : 999 + index,
    }))
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }
      return left.index - right.index;
    })
    .map((entry) => entry.story);
}

function buildTurnDrivenNewsStories(targetState = state) {
  const economy = typeof getTodayEconomy === "function"
    ? getTodayEconomy(targetState)
    : null;
  const marketCycle = typeof getMarketCycleSnapshot === "function"
    ? getMarketCycleSnapshot(targetState)
    : null;
  const day = economy?.day || targetState?.day || 1;
  const locationLabel = typeof getCurrentLocationLabel === "function"
    ? getCurrentLocationLabel(targetState)
    : "배금시";
  const variables = {
    location: locationLabel,
    month: economy?.monthLabel || `${day}월`,
    phase: economy?.phaseLabel || "시장 국면",
    nextMonth: marketCycle?.next?.monthLabel || economy?.monthLabel || `${day}월`,
    nextPhase: marketCycle?.next?.phaseLabel || economy?.phaseLabel || "다음 국면",
  };
  const newsPack = economy?.newsPack || {};
  const library = getNewsTurnStoryLibrary(day);

  return NEWS_APP_DYNAMIC_CATEGORY_STORY_CONFIGS.reduce((stories, config) => {
    const sourceEntry = config.key === "preview"
      ? newsPack.preview
      : library[config.key];

    if (!sourceEntry?.title) {
      return stories;
    }

    const title = fillNewsTemplateCopy(sourceEntry.title, variables);
    const summary = trimNewsCopy(
      fillNewsTemplateCopy(sourceEntry.summary || sourceEntry.body || "", variables),
      config.key === "preview" ? 120 : 138,
    );

    if (!title || !summary) {
      return stories;
    }

    stories.push(createNewsStory({
      id: config.id,
      categoryIds: config.categoryIds,
      title,
      summary,
      source: getNewsSourceLabel(config.sourceCategory, config.sourceIndex),
      timeLabel: getNewsRelativeTimeLabel(config.timeIndex),
      tone: config.tone,
      label: config.label || "",
      emoji: config.emoji || "",
      accent: config.accent || "",
      recommended: Boolean(config.recommended),
    }));

    return stories;
  }, []);
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
      categoryIds: ["headlines", "tech", "business"],
      title: memeEntry.title,
      summary: trimNewsCopy(memeEntry.body, 142),
      source: getNewsSourceLabel("tech", 0),
      timeLabel: getNewsRelativeTimeLabel(0),
      tone: "tech",
    }));
    stories.push(createNewsStory({
      id: "foryou-signal",
      categoryIds: ["foryou"],
      title: `추천 급상승: ${memeEntry.title.replace(/\.$/, "")}`,
      summary: "검색량, 커뮤니티 반응, 시세 변동이 동시에 붙으며 추천 탭 알고리즘이 오늘 가장 먼저 밀어 올린 이슈다.",
      source: getNewsSourceLabel("foryou", 0),
      timeLabel: getNewsRelativeTimeLabel(0),
      tone: "foryou",
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

  stories.push(...buildTurnDrivenNewsStories(targetState));

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

function buildNewsHeroCardMarkup(story = null, { headlinesOnly = false } = {}) {
  if (!story) {
    return "";
  }

  const summaryMarkup = !headlinesOnly && story.summary
    ? `<p class="news-hero-summary">${escapePhoneAppHtml(story.summary)}</p>`
    : "";
  const toolsMarkup = !headlinesOnly
    ? `
        <div class="news-story-tools" aria-hidden="true">
          <span class="news-story-tool">🔖</span>
          <span class="news-story-tool">⋮</span>
        </div>
      `
    : "";
  const visualMarkup = !headlinesOnly
    ? `
      <div class="news-hero-visual is-${escapePhoneAppHtml(story.tone)}" aria-hidden="true">
        <span class="news-hero-emoji">${escapePhoneAppHtml(story.visualEmoji)}</span>
        <span class="news-hero-accent">${escapePhoneAppHtml(story.visualAccent)}</span>
      </div>
    `
    : "";

  return `
    <article class="news-hero-card${headlinesOnly ? " is-headline-only" : ""}">
      <div class="news-hero-copy">
        <div class="news-story-tag">${escapePhoneAppHtml(story.visualLabel)}</div>
        <h2 class="news-hero-title">${escapePhoneAppHtml(story.title)}</h2>
        ${summaryMarkup}
        <div class="news-story-meta">
          <span class="news-story-source">${escapePhoneAppHtml(story.source)}</span>
          <span class="news-story-dot">•</span>
          <span>${escapePhoneAppHtml(story.timeLabel)}</span>
        </div>
        ${toolsMarkup}
      </div>
      ${visualMarkup}
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
  const stories = sortNewsStoriesForCategory(
    filterNewsStoriesByCategory(buildNewsStoriesFromFeedEntries(targetState), routeState.activeCategoryId),
    routeState.activeCategoryId,
  );
  const heroStory = stories[0] || null;
  const regularStories = heroStory ? stories.slice(1) : stories;
  const panelHeadlineOnlyMode = !stageMode;

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
          <div class="news-app-story-stack${panelHeadlineOnlyMode ? " is-headline-only" : ""}">
            ${buildNewsHeroCardMarkup(heroStory, { headlinesOnly: panelHeadlineOnlyMode })}
            ${panelHeadlineOnlyMode
              ? (regularStories.length ? `
                <div class="news-compact-list news-headline-list" aria-label="헤드라인 목록">
                  ${regularStories.map((story) => buildNewsCompactCardMarkup(story)).join("")}
                </div>
              ` : "")
              : `
                <section class="news-compact-section" aria-label="짧게 보기">
                  <div class="news-compact-section-head">짧게 보기</div>
                  <div class="news-compact-list">
                    ${regularStories.map((story) => buildNewsCompactCardMarkup(story)).join("")}
                  </div>
                </section>
                <div class="news-app-grid">
                  ${regularStories.map((story) => buildNewsCardMarkup(story)).join("")}
                </div>
              `}
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
