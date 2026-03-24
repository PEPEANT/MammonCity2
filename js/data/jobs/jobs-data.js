const STARTING_JOB_IDS = [
  "convenience",
  "delivery",
  "tutoring",
  "mcd-counter",
  "mcd-kitchen",
  "warehouse",
  "cleaning",
];

const JOB_SCENE_BACKGROUNDS = {
  delivery: {
    className: "custom-location-bg",
    image: "assets/backgrounds/day01/job-delivery-shift.jpg",
    position: "center center",
    size: "cover",
    overlay: "linear-gradient(180deg, rgba(7, 12, 22, 0.24) 0%, rgba(7, 12, 22, 0.56) 100%)",
  },
  tutoring: {
    className: "custom-location-bg",
    image: "assets/backgrounds/day01/job-tutoring-shift.png",
    position: "center center",
    size: "cover",
    overlay: "linear-gradient(180deg, rgba(8, 18, 16, 0.18) 0%, rgba(8, 18, 16, 0.48) 100%)",
  },
  warehouse: {
    className: "custom-location-bg",
    image: "assets/backgrounds/day01/job-warehouse-shift.jpg",
    position: "center center",
    size: "cover",
    overlay: "linear-gradient(180deg, rgba(9, 12, 20, 0.26) 0%, rgba(9, 12, 20, 0.58) 100%)",
  },
  fastFood: {
    className: "custom-location-bg",
    image: "assets/backgrounds/day01/commercial/mcdonalds-counter.png",
    position: "center center",
    size: "cover",
    overlay: "linear-gradient(180deg, rgba(14, 9, 8, 0.16) 0%, rgba(14, 9, 8, 0.4) 100%)",
  },
  logistics: {
    className: "custom-location-bg",
    image: "assets/backgrounds/day01/commercial/logistics-center-exterior.png",
    position: "center center",
    size: "cover",
    overlay: "linear-gradient(180deg, rgba(9, 12, 20, 0.18) 0%, rgba(9, 12, 20, 0.42) 100%)",
  },
  production: {
    className: "custom-location-bg",
    image: "assets/backgrounds/day01/industrial/production-line.jpg",
    position: "center center",
    size: "cover",
    overlay: "linear-gradient(180deg, rgba(9, 12, 20, 0.18) 0%, rgba(9, 12, 20, 0.42) 100%)",
  },
  office: {
    className: "custom-location-bg",
    image: "assets/backgrounds/day01/industrial/office-work.jpg",
    position: "center center",
    size: "cover",
    overlay: "linear-gradient(180deg, rgba(7, 13, 24, 0.14) 0%, rgba(7, 13, 24, 0.3) 100%)",
  },
  research: {
    className: "custom-location-bg",
    image: "assets/backgrounds/day01/industrial/research-lab-interior.jpg",
    position: "center center",
    size: "cover",
    overlay: "linear-gradient(180deg, rgba(8, 12, 20, 0.14) 0%, rgba(8, 12, 20, 0.32) 100%)",
  },
};

const JOB_MINIGAME_DEFINITIONS = {
  delivery: {
    id: "delivery-route-sprint",
    title: "배달 동선 정리",
    intro: "출근 직후 몰린 주문을 빠르게 훑어 핵심 배차만 먼저 정리하자.",
    note: "파란 업무 카드만 눌러 묶음 주문을 우선 처리하세요.",
    baseBonus: 8000,
    penaltyPerMistake: 2200,
    perfectBonus: 5000,
    performanceLabels: {
      perfect: "배차 흐름을 매끄럽게 정리해 추가 수당이 붙었다.",
      success: "핵심 주문은 챙겨서 무난한 추가 수당을 받았다.",
      fail: "동선 정리가 어수선해 추가 수당은 붙지 않았다.",
    },
    items: [
      { id: "delivery-office", icon: "📦", shortLabel: "오피스", label: "오피스 타워 주문 묶기", x: 23, y: 27, size: 108, target: true, tone: "primary" },
      { id: "delivery-bike", icon: "🛵", shortLabel: "픽업", label: "골목 입구 픽업 확인", x: 41, y: 57, size: 106, target: true, tone: "primary" },
      { id: "delivery-apartment", icon: "🏢", shortLabel: "주상복합", label: "주상복합 배달 정리", x: 61, y: 42, size: 114, target: true, tone: "primary" },
      { id: "delivery-complete", icon: "✅", shortLabel: "완료", label: "배달 완료 콜 정리", x: 78, y: 29, size: 100, target: true, tone: "primary" },
      { id: "delivery-break", icon: "☕", shortLabel: "휴식", label: "괜히 쉬는 시간 잡기", x: 19, y: 64, size: 94, target: false, tone: "danger" },
      { id: "delivery-chat", icon: "💬", shortLabel: "잡담", label: "단톡방 잡담 확인", x: 79, y: 66, size: 96, target: false, tone: "danger" },
    ],
  },
  tutoring: {
    id: "tutoring-focus-check",
    title: "과외 집중 정리",
    intro: "수업 시작 전에 오늘 꼭 짚어야 할 포인트를 먼저 골라보자.",
    note: "초록 업무 카드만 눌러 핵심 개념과 오답을 먼저 정리하세요.",
    baseBonus: 9000,
    penaltyPerMistake: 2500,
    perfectBonus: 6000,
    performanceLabels: {
      perfect: "수업 흐름을 깔끔하게 잡아 부모 상담까지 매끄럽게 이어졌다.",
      success: "핵심 포인트는 챙겨서 수업 몰입도가 안정적으로 올라갔다.",
      fail: "잡담과 딴생각에 끌려 추가 수당 없이 평범하게 끝났다.",
    },
    items: [
      { id: "tutoring-concept", icon: "📘", shortLabel: "개념", label: "핵심 개념 정리", x: 26, y: 31, size: 108, target: true, tone: "success" },
      { id: "tutoring-incorrect", icon: "📝", shortLabel: "오답", label: "오답 노트 체크", x: 58, y: 28, size: 108, target: true, tone: "success" },
      { id: "tutoring-question", icon: "❓", shortLabel: "질문", label: "학생 질문 카드 준비", x: 74, y: 50, size: 102, target: true, tone: "success" },
      { id: "tutoring-homework", icon: "📚", shortLabel: "숙제", label: "숙제 범위 정리", x: 42, y: 60, size: 112, target: true, tone: "success" },
      { id: "tutoring-chat", icon: "💬", shortLabel: "잡담", label: "수업 전 잡담 길게 끌기", x: 18, y: 64, size: 92, target: false, tone: "danger" },
      { id: "tutoring-alert", icon: "🔔", shortLabel: "알림", label: "메신저 알림 딴짓하기", x: 82, y: 33, size: 92, target: false, tone: "danger" },
    ],
  },
  warehouse: {
    id: "warehouse-load-balance",
    title: "상하차 우선 배치",
    intro: "라인이 막히기 전에 먼저 실어야 할 상자와 출고 라벨만 정리하자.",
    note: "노란 업무 카드만 눌러 우선 상차 물량을 빠르게 분류하세요.",
    baseBonus: 10000,
    penaltyPerMistake: 2800,
    perfectBonus: 7000,
    performanceLabels: {
      perfect: "상차 흐름을 깔끔하게 정리해 현장 반장이 보너스를 얹어줬다.",
      success: "라인을 크게 막지 않아 추가 수당이 조금 붙었다.",
      fail: "손이 꼬여 흐름이 밀리면서 추가 수당은 받지 못했다.",
    },
    items: [
      { id: "warehouse-load", icon: "📦", shortLabel: "상차", label: "상차 우선 상자 이동", x: 24, y: 33, size: 116, target: true, tone: "warn" },
      { id: "warehouse-check", icon: "🔎", shortLabel: "검수", label: "출고 라벨 검수", x: 55, y: 26, size: 104, target: true, tone: "warn" },
      { id: "warehouse-route", icon: "🚚", shortLabel: "출고", label: "출고 라인 맞추기", x: 72, y: 48, size: 112, target: true, tone: "warn" },
      { id: "warehouse-stack", icon: "🧱", shortLabel: "분류", label: "무게 맞춰 박스 분류", x: 41, y: 60, size: 112, target: true, tone: "warn" },
      { id: "warehouse-break", icon: "🪑", shortLabel: "휴게", label: "휴게 의자부터 찾기", x: 16, y: 67, size: 92, target: false, tone: "danger" },
      { id: "warehouse-misload", icon: "⚠️", shortLabel: "오입고", label: "잘못 온 상자에 시간 쓰기", x: 82, y: 67, size: 96, target: false, tone: "danger" },
    ],
  },
  fastKitchen: {
    // TODO: 조리 미니게임 - 유저가 제공 예정
    id: "fast-food-kitchen-rush",
    title: "조리 준비",
    intro: "오픈 전 주방 재료와 라인을 빠르게 세팅한다.",
    note: "필요한 카드만 눌러 주방을 정리한다.",
    baseBonus: 10000,
    penaltyPerMistake: 2600,
    perfectBonus: 6500,
    performanceLabels: {
      perfect: "주방 라인을 완벽하게 맞춰 추가 수당이 붙었다.",
      success: "주방 세팅을 무난하게 마쳐 추가 수당이 붙었다.",
      fail: "조리 순서가 꼬여 추가 수당은 놓쳤다.",
    },
    items: [], // TODO: 조리 미니게임 카드 추가 예정
  },
  fastFood: {
    id: "fast-food-counter-rush",
    title: "주문 정리",
    intro: "카운터가 열리기 전에 주문 흐름을 빠르게 맞춘다.",
    note: "필요한 카드만 눌러 카운터를 정리한다.",
    baseBonus: 9000,
    penaltyPerMistake: 2400,
    perfectBonus: 6000,
    performanceLabels: {
      perfect: "주문 흐름을 깔끔하게 맞춰 첫 손님부터 빠르게 받았다.",
      success: "카운터 흐름을 무난하게 정리해 추가 수당이 붙었다.",
      fail: "주문 동선이 꼬여 추가 수당은 놓쳤다.",
    },
    items: [
      { id: "fastfood-order", icon: "ORD", shortLabel: "주문", label: "주문판 정리", x: 24, y: 28, size: 106, target: true, tone: "primary" },
      { id: "fastfood-fries", icon: "FRY", shortLabel: "감튀", label: "감자 튀김 준비", x: 57, y: 24, size: 104, target: true, tone: "primary" },
      { id: "fastfood-drink", icon: "DRK", shortLabel: "음료", label: "음료 컵 세팅", x: 73, y: 48, size: 102, target: true, tone: "primary" },
      { id: "fastfood-receipt", icon: "RCP", shortLabel: "영수", label: "영수증 프린트 확인", x: 42, y: 62, size: 108, target: true, tone: "primary" },
      { id: "fastfood-selfie", icon: "SNS", shortLabel: "사진", label: "카운터 사진 찍기", x: 16, y: 68, size: 92, target: false, tone: "danger" },
      { id: "fastfood-break", icon: "BRK", shortLabel: "휴식", label: "쉬는 시간 먼저 찾기", x: 84, y: 68, size: 94, target: false, tone: "danger" },
    ],
  },
  logistics: {
    id: "logistics-sort-rush",
    title: "출고 분류",
    intro: "트럭 출발 전에 박스와 라벨을 빠르게 맞춘다.",
    note: "출고 카드만 눌러 상차 흐름을 정리한다.",
    baseBonus: 10200,
    penaltyPerMistake: 2800,
    perfectBonus: 7000,
    performanceLabels: {
      perfect: "출고 흐름을 한 번에 맞춰 반장이 보너스를 얹어줬다.",
      success: "물류 라인을 무난하게 맞춰 추가 수당이 붙었다.",
      fail: "박스 흐름이 꼬여 추가 수당은 놓쳤다.",
    },
    items: [
      { id: "logistics-box", icon: "BOX", shortLabel: "박스", label: "출고 박스 정렬", x: 23, y: 31, size: 114, target: true, tone: "warn" },
      { id: "logistics-label", icon: "TAG", shortLabel: "라벨", label: "출고 라벨 확인", x: 56, y: 27, size: 104, target: true, tone: "warn" },
      { id: "logistics-route", icon: "LAN", shortLabel: "동선", label: "상차 라인 맞추기", x: 74, y: 49, size: 110, target: true, tone: "warn" },
      { id: "logistics-scan", icon: "SCN", shortLabel: "스캔", label: "바코드 스캔 정리", x: 40, y: 61, size: 108, target: true, tone: "warn" },
      { id: "logistics-chat", icon: "MSG", shortLabel: "잡담", label: "라인 옆 잡담 끼기", x: 17, y: 67, size: 92, target: false, tone: "danger" },
      { id: "logistics-mix", icon: "ERR", shortLabel: "오적", label: "다른 구역 박스 끼우기", x: 83, y: 67, size: 96, target: false, tone: "danger" },
    ],
  },
  production: {
    id: "production-line-setup",
    title: "라인 준비",
    intro: "라인 가동 전에 부품과 점검표를 맞춘다.",
    note: "필요한 준비 카드만 눌러 생산 라인을 맞춘다.",
    baseBonus: 12000,
    penaltyPerMistake: 3200,
    perfectBonus: 8000,
    performanceLabels: {
      perfect: "라인 준비가 완벽해 첫 사이클부터 속도가 붙었다.",
      success: "생산 라인을 무난하게 맞춰 추가 수당이 붙었다.",
      fail: "준비 흐름이 흔들려 추가 수당은 놓쳤다.",
    },
    items: [
      { id: "production-parts", icon: "PRT", shortLabel: "부품", label: "부품 카트 맞추기", x: 24, y: 30, size: 114, target: true, tone: "warn" },
      { id: "production-check", icon: "CHK", shortLabel: "점검", label: "안전 점검표 확인", x: 56, y: 25, size: 104, target: true, tone: "warn" },
      { id: "production-line", icon: "LIN", shortLabel: "라인", label: "라인 속도 세팅", x: 74, y: 48, size: 112, target: true, tone: "warn" },
      { id: "production-pack", icon: "PKG", shortLabel: "포장", label: "완성품 트레이 정리", x: 41, y: 61, size: 110, target: true, tone: "warn" },
      { id: "production-phone", icon: "APP", shortLabel: "폰", label: "작업 중 폰 보기", x: 17, y: 67, size: 92, target: false, tone: "danger" },
      { id: "production-delay", icon: "LAG", shortLabel: "지연", label: "빈 라인 멍하니 보기", x: 83, y: 67, size: 96, target: false, tone: "danger" },
    ],
  },
  office: {
    id: "office-desk-open",
    title: "사무 정리",
    intro: "업무 시작 전에 문서와 메일을 정리한다.",
    note: "필요한 업무 카드만 눌러 책상을 정리한다.",
    baseBonus: 11000,
    penaltyPerMistake: 2600,
    perfectBonus: 7000,
    performanceLabels: {
      perfect: "업무 흐름을 깔끔하게 정리해 팀장이 바로 맡겼다.",
      success: "사무 흐름을 안정적으로 맞춰 추가 수당이 붙었다.",
      fail: "문서 흐름이 꼬여 추가 수당은 놓쳤다.",
    },
    items: [
      { id: "office-mail", icon: "MAIL", shortLabel: "메일", label: "메일함 정리", x: 24, y: 29, size: 108, target: true, tone: "primary" },
      { id: "office-sheet", icon: "DOC", shortLabel: "문서", label: "문서 파일 열기", x: 58, y: 25, size: 104, target: true, tone: "primary" },
      { id: "office-plan", icon: "PLAN", shortLabel: "일정", label: "일정표 확인", x: 74, y: 48, size: 110, target: true, tone: "primary" },
      { id: "office-report", icon: "REP", shortLabel: "보고", label: "보고서 초안 정리", x: 42, y: 61, size: 110, target: true, tone: "primary" },
      { id: "office-feed", icon: "SNS", shortLabel: "피드", label: "사내 피드만 보기", x: 17, y: 67, size: 92, target: false, tone: "danger" },
      { id: "office-coffee", icon: "BRK", shortLabel: "휴식", label: "커피만 다시 타기", x: 83, y: 67, size: 94, target: false, tone: "danger" },
    ],
  },
  research: {
    id: "research-lab-setup",
    title: "실험 준비",
    intro: "실험 시작 전에 시료와 기록표를 맞춘다.",
    note: "필요한 준비 카드만 눌러 실험실을 정리한다.",
    baseBonus: 13200,
    penaltyPerMistake: 3200,
    perfectBonus: 9000,
    performanceLabels: {
      perfect: "실험 준비가 깔끔해 오늘 데이터가 안정적으로 나왔다.",
      success: "연구실 흐름을 잘 맞춰 추가 수당이 붙었다.",
      fail: "준비 흐름이 흔들려 추가 수당은 놓쳤다.",
    },
    items: [
      { id: "research-sample", icon: "SMP", shortLabel: "시료", label: "시료 트레이 정리", x: 24, y: 29, size: 110, target: true, tone: "success" },
      { id: "research-log", icon: "LOG", shortLabel: "기록", label: "실험 기록표 확인", x: 56, y: 25, size: 104, target: true, tone: "success" },
      { id: "research-mix", icon: "MIX", shortLabel: "배합", label: "배합 순서 점검", x: 74, y: 48, size: 110, target: true, tone: "success" },
      { id: "research-scan", icon: "SCN", shortLabel: "측정", label: "측정 장비 준비", x: 42, y: 61, size: 110, target: true, tone: "success" },
      { id: "research-break", icon: "BRK", shortLabel: "잡담", label: "실험 전 잡담하기", x: 17, y: 67, size: 92, target: false, tone: "danger" },
      { id: "research-skip", icon: "SKP", shortLabel: "생략", label: "기록표 건너뛰기", x: 83, y: 67, size: 96, target: false, tone: "danger" },
    ],
  },
};

const JOBS = [
  {
    id: "convenience",
    title: "야간 편의점",
    emoji: "🏪",
    tone: "cobalt",
    category: "생활",
    payMin: 68000,
    payMax: 82000,
    description: "카운터, 진열, 술 취한 손님 응대를 한 번에 맡는 심야 근무.",
    tags: ["카운터", "야간", "진열"],
  },
  {
    id: "delivery",
    title: "근거리 배달",
    emoji: "🛵",
    tone: "ember",
    category: "이동",
    payMin: 76000,
    payMax: 108000,
    sceneBackground: JOB_SCENE_BACKGROUNDS.delivery,
    minigame: JOB_MINIGAME_DEFINITIONS.delivery,
    description: "자전거와 오토바이로 점심 주문을 몰아서 처리하는 입문 배달 콜.",
    requirements: [
      {
        type: "owned-vehicle-any-of",
        vehicleIds: ["bicycle", "used-motorbike"],
        label: "자전거 또는 오토바이",
      },
    ],
    tags: ["피크타임", "이동", "날씨영향"],
  },
  {
    id: "delivery-motorbike",
    title: "오토바이 피크 배달",
    emoji: "🛵",
    tone: "ember",
    category: "이동",
    payMin: 98000,
    payMax: 142000,
    sceneBackground: JOB_SCENE_BACKGROUNDS.delivery,
    minigame: JOB_MINIGAME_DEFINITIONS.delivery,
    description: "오토바이로 피크 시간대 콜을 더 공격적으로 돌리는 상위 배달 루트.",
    requirements: [
      {
        type: "owned-vehicle-any-of",
        vehicleIds: ["used-motorbike"],
        label: "중고 오토바이",
      },
    ],
    tags: ["오토바이", "피크타임", "고수익"],
  },
  {
    id: "delivery-courier",
    title: "장거리 퀵 배송",
    emoji: "🚗",
    tone: "steel",
    category: "이동",
    payMin: 118000,
    payMax: 168000,
    sceneBackground: JOB_SCENE_BACKGROUNDS.delivery,
    minigame: JOB_MINIGAME_DEFINITIONS.delivery,
    description: "차량으로 도시 외곽까지 물건을 빼는 장거리 퀵 배송 루트.",
    requirements: [
      {
        type: "owned-vehicle-any-of",
        vehicleIds: ["used-car", "foreign-car"],
        label: "차량",
      },
      {
        type: "certification",
        certKey: "driverLicense",
      },
    ],
    tags: ["장거리", "차량", "퀵배송"],
  },
  {
    id: "tutoring",
    title: "중학생 과외",
    emoji: "📚",
    tone: "mint",
    category: "교육",
    payMin: 92000,
    payMax: 126000,
    sceneBackground: JOB_SCENE_BACKGROUNDS.tutoring,
    minigame: JOB_MINIGAME_DEFINITIONS.tutoring,
    description: "수학이나 영어를 봐 주는 1:1 방문 과외.",
    tags: ["설명", "학부모", "준비물"],
  },
  {
    id: "mcd-counter",
    title: "맥도날드 카운터",
    emoji: "🍔",
    tone: "berry",
    category: "서비스",
    payMin: 72000,
    payMax: 92000,
    sceneBackground: JOB_SCENE_BACKGROUNDS.fastFood,
    minigame: JOB_MINIGAME_DEFINITIONS.fastFood,
    description: "맥도날드 카운터에서 주문, 음료, 픽업 흐름을 맞추는 알바.",
    tags: ["맥도날드", "카운터", "주문"],
  },
  {
    id: "mcd-kitchen",
    title: "맥도날드 조리",
    emoji: "🍟",
    tone: "berry",
    category: "서비스",
    payMin: 75000,
    payMax: 96000,
    sceneBackground: JOB_SCENE_BACKGROUNDS.fastFood,
    minigame: JOB_MINIGAME_DEFINITIONS.fastKitchen,
    description: "맥도날드 주방에서 조리 라인을 맞추는 알바.",
    tags: ["맥도날드", "조리", "주방"],
  },
  {
    id: "warehouse",
    title: "새벽 물류",
    emoji: "📦",
    tone: "steel",
    category: "현장",
    payMin: 82000,
    payMax: 106000,
    sceneBackground: JOB_SCENE_BACKGROUNDS.warehouse,
    minigame: JOB_MINIGAME_DEFINITIONS.warehouse,
    description: "분류대와 스캔건 사이를 계속 오가는 새벽 물류 파트.",
    tags: ["새벽", "분류", "현장"],
  },
  {
    id: "cleaning",
    title: "오피스 청소",
    emoji: "🧽",
    tone: "aqua",
    category: "관리",
    payMin: 66000,
    payMax: 84000,
    description: "퇴근한 사무실을 다시 정리하는 마감 청소 근무.",
    tags: ["마감", "정리", "사무실"],
  },
  {
    id: "smart_store",
    title: "무인매장 안내",
    emoji: "🖥️",
    tone: "cobalt",
    category: "전환",
    payMin: 76000,
    payMax: 94000,
    description: "직원이 빠진 무인매장에서 결제 오류와 재고만 챙기는 알바.",
    requirements: [
      {
        type: "equipped-item",
        itemId: "phone-used-premium",
        label: "중고 프리미엄 스마트폰",
      },
    ],
    tags: ["무인매장", "안내", "오류응대"],
  },
  {
    id: "dispatch_monitor",
    title: "배차 모니터",
    emoji: "🛰️",
    tone: "ember",
    category: "전환",
    payMin: 78000,
    payMax: 98000,
    description: "배달 로봇과 라이더 동선을 모니터링하는 관제 근무.",
    requirements: [
      {
        type: "certification",
        certKey: "computerCert",
      },
      {
        type: "equipped-item",
        itemId: "phone-used-premium",
        label: "중고 프리미엄 스마트폰",
      },
      {
        type: "equipped-item",
        itemId: "outfit-suit",
        label: "정장 세트",
      },
    ],
    tags: ["관제", "모니터", "배차"],
  },
  {
    id: "study_coach",
    title: "학습 코치",
    emoji: "🧠",
    tone: "mint",
    category: "전환",
    payMin: 96000,
    payMax: 138000,
    description: "AI 앱이 못 챙기는 설명과 진도 점검만 맡는 코칭 알바.",
    requirements: [
      {
        type: "stat-min",
        statKey: "intelligence",
        min: 20,
      },
      {
        type: "equipped-item",
        itemId: "outfit-suit",
        label: "정장 세트",
      },
    ],
    tags: ["코칭", "설명", "숙제점검"],
  },
  {
    id: "robot_floor",
    title: "서빙봇 케어",
    emoji: "🤖",
    tone: "berry",
    category: "전환",
    payMin: 76000,
    payMax: 94000,
    description: "서빙봇이 막히지 않게 동선을 풀어 주는 홀 관리 근무.",
    tags: ["로봇", "홀관리", "동선"],
  },
  {
    id: "line_inspector",
    title: "자동화 라인 점검",
    emoji: "🛠️",
    tone: "steel",
    category: "전환",
    payMin: 86000,
    payMax: 112000,
    description: "사람 대신 돌아가는 라인의 센서와 정지 버튼만 확인하는 일.",
    tags: ["센서", "점검", "정지버튼"],
  },
  {
    id: "closing_checker",
    title: "마감 점검",
    emoji: "🪣",
    tone: "aqua",
    category: "전환",
    payMin: 70000,
    payMax: 86000,
    description: "청소로봇이 놓친 구역만 눈으로 다시 확인하는 마감 근무.",
    tags: ["마감확인", "체크리스트", "관리"],
  },
];

const JOB_LOOKUP = Object.fromEntries(JOBS.map((job) => [job.id, job]));

// ── 맥도날드 주방 미니게임 데이터 ──────────────────────────────
const MCD_KITCHEN_INGREDIENT_POOL = [
  { id: "bottom-bun",    icon: "🍞", shortLabel: "아래빵",    label: "아래 빵 세팅" },
  { id: "top-bun",       icon: "🍔", shortLabel: "위빵",      label: "참깨빵 올리기" },
  { id: "middle-bun",    icon: "🥖", shortLabel: "중간빵",    label: "중간 빵 넣기" },
  { id: "beef-patty",    icon: "🥩", shortLabel: "소고기패티", label: "소고기 패티 굽기" },
  { id: "chicken-patty", icon: "🍗", shortLabel: "치킨패티",  label: "치킨 패티 튀기기" },
  { id: "cheese",        icon: "🧀", shortLabel: "치즈",      label: "치즈 슬라이스" },
  { id: "lettuce",       icon: "🥬", shortLabel: "양상추",    label: "양상추 올리기" },
  { id: "tomato",        icon: "🍅", shortLabel: "토마토",    label: "토마토 슬라이스" },
  { id: "pickle",        icon: "🥒", shortLabel: "피클",      label: "피클 올리기" },
  { id: "onion",         icon: "🧅", shortLabel: "양파",      label: "양파 넣기" },
  { id: "ketchup",       icon: "🟥", shortLabel: "케첩",      label: "케첩 뿌리기" },
  { id: "mayo",          icon: "⬜", shortLabel: "마요",      label: "마요네즈 바르기" },
  { id: "mac-sauce",     icon: "🟧", shortLabel: "빅맥소스",  label: "빅맥소스 바르기" },
];

const MCD_KITCHEN_RECIPES = [
  {
    id: "cheeseburger",
    name: "치즈버거",
    targetIds: ["bottom-bun", "beef-patty", "cheese", "pickle", "ketchup", "top-bun"],
  },
  {
    id: "bulgogi",
    name: "불고기버거",
    targetIds: ["bottom-bun", "beef-patty", "mac-sauce", "lettuce", "top-bun"],
  },
  {
    id: "mcchicken",
    name: "맥치킨",
    targetIds: ["bottom-bun", "chicken-patty", "lettuce", "mayo", "top-bun"],
  },
  {
    id: "bigmac",
    name: "빅맥",
    targetIds: ["bottom-bun", "beef-patty", "cheese", "middle-bun", "pickle", "lettuce", "mac-sauce", "top-bun"],
  },
  {
    id: "shanghai",
    name: "상하이버거",
    targetIds: ["bottom-bun", "chicken-patty", "tomato", "lettuce", "mayo", "top-bun"],
  },
];

if (JOB_LOOKUP.warehouse) {
  Object.assign(JOB_LOOKUP.warehouse, {
    title: "배금 물류센터",
    sceneBackground: JOB_SCENE_BACKGROUNDS.logistics,
    minigame: JOB_MINIGAME_DEFINITIONS.logistics,
    description: "배금 물류센터에서 상차 전 박스와 라벨을 맞추는 물류 알바.",
    tags: ["물류센터", "상차", "분류"],
  });
}

const CAREER_PREP_LABELS = {
  service: "서비스 준비",
  labor: "생산직 준비",
  office: "사무직 준비",
  academic: "연구직 준비",
};

const CAREER_CERTIFICATION_LABELS = {
  driverLicense: "운전면허",
  computerCert: "컴퓨터 자격",
  universityDegree: "대학 졸업",
};

const CAREER_JOB_POSTINGS = [
  {
    id: "factory-operator",
    title: "배금전자 생산직 신입",
    emoji: "🏭",
    tone: "steel",
    categoryLabel: "생산직",
    payMin: 138000,
    payMax: 176000,
    shiftStartSlot: 18,
    shiftDurationSlots: 12,
    prepKey: "labor",
    requiredPrep: 0,
    requiredCerts: ["universityDegree"],
    requirements: [
      {
        type: "stat-min",
        statKey: "stamina",
        min: 45,
      },
    ],
    baseChance: 0.28,
    description: "배금디지털단지 외곽 생산동에서 교대 라인과 설비 보조를 맡을 신입을 찾는다. 대학 졸업은 기본이고 체력도 받쳐줘야 한다.",
  },
  {
    id: "baegeum-electronics-office",
    title: "배금전자 사무직 신입",
    emoji: "💼",
    tone: "cobalt",
    categoryLabel: "사무직",
    payMin: 152000,
    payMax: 194000,
    shiftStartSlot: 19,
    shiftDurationSlots: 10,
    prepKey: "office",
    requiredPrep: 3,
    requiredCerts: ["universityDegree", "computerCert"],
    requirements: [
      {
        type: "stat-min",
        statKey: "intelligence",
        min: 20,
      },
      {
        type: "equipped-item",
        itemId: "outfit-suit",
        label: "정장 세트",
      },
    ],
    baseChance: 0.22,
    description: "배금전자 사무동에서 문서, 일정, 부서 행정을 맡을 신입 채용이다. 대학 졸업과 사무 준비도가 먼저 요구된다.",
  },
  {
    id: "baegeum-research-lab",
    title: "배금연구소 연구직 신입",
    emoji: "🧪",
    tone: "mint",
    categoryLabel: "연구직",
    payMin: 178000,
    payMax: 228000,
    shiftStartSlot: 20,
    shiftDurationSlots: 10,
    prepKey: "academic",
    requiredPrep: 4,
    requiredCerts: ["universityDegree", "computerCert"],
    requirements: [
      {
        type: "stat-min",
        statKey: "intelligence",
        min: 30,
      },
      {
        type: "equipped-item",
        itemId: "outfit-suit",
        label: "정장 세트",
      },
    ],
    baseChance: 0.16,
    description: "배금연구소에서 데이터 정리와 실험 보조를 맡는 연구직 루트다. 대학 졸업과 높은 연구 준비도가 없으면 면접에서 계속 떨어진다.",
  },
];

const CAREER_JOB_POSTING_LOOKUP = Object.fromEntries(
  CAREER_JOB_POSTINGS.map((posting) => [posting.id, posting]),
);

if (CAREER_JOB_POSTING_LOOKUP["factory-operator"]) {
  Object.assign(CAREER_JOB_POSTING_LOOKUP["factory-operator"], {
    sceneBackground: JOB_SCENE_BACKGROUNDS.production,
    minigame: JOB_MINIGAME_DEFINITIONS.production,
  });
}

if (CAREER_JOB_POSTING_LOOKUP["baegeum-electronics-office"]) {
  Object.assign(CAREER_JOB_POSTING_LOOKUP["baegeum-electronics-office"], {
    sceneBackground: JOB_SCENE_BACKGROUNDS.office,
    minigame: JOB_MINIGAME_DEFINITIONS.office,
  });
}

if (CAREER_JOB_POSTING_LOOKUP["baegeum-research-lab"]) {
  Object.assign(CAREER_JOB_POSTING_LOOKUP["baegeum-research-lab"], {
    sceneBackground: JOB_SCENE_BACKGROUNDS.research,
    minigame: JOB_MINIGAME_DEFINITIONS.research,
  });
}

function getCareerPostingById(postingId) {
  return CAREER_JOB_POSTING_LOOKUP[postingId] || null;
}

function isCareerShiftOffer(offer = null) {
  return Boolean(offer?.careerPostingId);
}

function getOfferKey(offer = null) {
  if (!offer) {
    return "";
  }

  if (offer.careerPostingId) {
    return String(offer.careerPostingId || "").trim();
  }

  return String(offer.jobId || "").trim();
}

function getOfferRuntimeDefinition(offer = null) {
  if (!offer) {
    return null;
  }

  if (isCareerShiftOffer(offer)) {
    const posting = getCareerPostingById(offer.careerPostingId);
    return {
      ...(posting || {}),
      id: offer.careerPostingId,
      title: offer.title || posting?.title || "직장",
      emoji: offer.emoji || posting?.emoji || "💼",
      tone: offer.tone || posting?.tone || "cobalt",
      category: offer.category || posting?.categoryLabel || "직장",
      isCareer: true,
    };
  }

  const job = JOB_LOOKUP[offer.jobId] || null;
  return job
    ? {
        ...job,
        title: offer.title || job.title,
        emoji: offer.emoji || job.emoji,
        tone: offer.tone || job.tone,
        category: offer.category || job.category,
        isCareer: false,
      }
    : null;
}

function getOfferMiniGameDefinition(offer = null) {
  const runtimeDefinition = getOfferRuntimeDefinition(offer);
  return runtimeDefinition?.minigame || null;
}

function createCareerShiftOffer(postingId = "", targetState = state) {
  const posting = getCareerPostingById(postingId);
  if (!posting) {
    return null;
  }

  const basePay = typeof randomBetween === "function"
    ? randomBetween(posting.payMin, posting.payMax)
    : posting.payMin;
  const roundedPay = typeof roundToHundred === "function"
    ? roundToHundred(basePay)
    : basePay;

  return {
    careerPostingId: posting.id,
    title: posting.title,
    emoji: posting.emoji,
    tone: posting.tone,
    category: posting.categoryLabel || "직장",
    pay: typeof getAdjustedWage === "function"
      ? getAdjustedWage(roundedPay, targetState)
      : roundedPay,
    shiftStartSlot: Number.isFinite(posting.shiftStartSlot) ? posting.shiftStartSlot : DAY_START_TIME_SLOT,
    shiftDurationSlots: Number.isFinite(posting.shiftDurationSlots) ? posting.shiftDurationSlots : 8,
  };
}
