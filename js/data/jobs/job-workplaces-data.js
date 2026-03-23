const JOB_WORKPLACE_REGISTRY = {
  convenience: {
    employerName: "배금24",
    workplaceName: "배금24 사거리점",
    locationId: "convenience-store",
    districtId: "commercial",
    routeStopId: "city-crossroads",
    commuteHint: "버스정류장에서 사거리 쪽으로 걸으면 바로 보인다.",
  },
  delivery: {
    employerName: "배금모빌리티",
    workplaceName: "배금모빌리티 관제센터",
    locationId: "mobility-control-center",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "배금 100번을 타고 오피스플라자에서 내리면 된다.",
  },
  "delivery-motorbike": {
    employerName: "배금모빌리티",
    workplaceName: "배금모빌리티 라이더 허브",
    locationId: "mobility-control-center",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "오피스플라자 정류장에서 로비 안쪽 관제층으로 올라가면 된다.",
  },
  "delivery-courier": {
    employerName: "배금퀵",
    workplaceName: "배금퀵 물류허브",
    locationId: "logistics-hub",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "오피스플라자에서 물류동 쪽 표지판만 따라가면 된다.",
  },
  tutoring: {
    employerName: "배금학습연구소",
    workplaceName: "배금학습연구소 대학가센터",
    locationId: "university-district",
    districtId: "study",
    routeStopId: "library",
    commuteHint: "도서관 구역에서 대학가 방향으로 이어지는 골목을 따라 들어간다.",
  },
  cafe: {
    employerName: "모닝브루",
    workplaceName: "모닝브루 오피스플라자점",
    locationId: "tower-cafe",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "오피스플라자 로비 카페라 출근 시간엔 직장인이 몰린다.",
  },
  warehouse: {
    employerName: "배금로지스",
    workplaceName: "배금로지스 상하차동",
    locationId: "logistics-hub",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "회사구역 끝 물류동에서 새벽 상하차가 시작된다.",
  },
  cleaning: {
    employerName: "클린웨이",
    workplaceName: "오피스플라자 야간관리실",
    locationId: "office-plaza",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "오피스플라자 로비에서 야간 점검팀과 합류한다.",
  },
  smart_store: {
    employerName: "픽셀24",
    workplaceName: "픽셀24 다운타운 무인점",
    locationId: "downtown",
    districtId: "commercial",
    routeStopId: "downtown",
    commuteHint: "중심상업구역 안쪽 무인매장 라인에 있는 점포다.",
  },
  dispatch_monitor: {
    employerName: "배금모빌리티",
    workplaceName: "배차 모니터링실",
    locationId: "mobility-control-center",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "관제센터 모니터링실에서 라이더 동선을 감시한다.",
  },
  study_coach: {
    employerName: "배금러닝랩",
    workplaceName: "러닝랩 대학가 코칭실",
    locationId: "university-district",
    districtId: "study",
    routeStopId: "library",
    commuteHint: "대학가 학습지원 건물 안쪽 코칭실에서 학생을 받는다.",
  },
  robot_floor: {
    employerName: "로보키친",
    workplaceName: "로보키친 오피스플라자점",
    locationId: "tower-cafe",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "오피스플라자 식음 라운지 안쪽에서 서빙봇을 관리한다.",
  },
  line_inspector: {
    employerName: "배금오토메이션",
    workplaceName: "오토메이션 라인 점검동",
    locationId: "logistics-hub",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "물류허브 센서 라인 쪽으로 바로 투입된다.",
  },
  closing_checker: {
    employerName: "클린웨이",
    workplaceName: "오피스플라자 마감점검팀",
    locationId: "office-plaza",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "퇴근 이후 회사구역 사무실을 순서대로 돌며 마감한다.",
  },
};

const CAREER_POSTING_WORKPLACE_REGISTRY = {
  "office-assistant": {
    employerName: "배금비즈센터",
    workplaceName: "오피스플라자 서무팀",
    locationId: "office-plaza",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "배금 100번 회사구역 정류장에서 내려 바로 출근 동선이 이어진다.",
  },
  "learning-center-clerk": {
    employerName: "배금학원네트워크",
    workplaceName: "대학가 학습지원센터",
    locationId: "university-district",
    districtId: "study",
    routeStopId: "library",
    commuteHint: "도서관 구역 버스 정류장에서 대학가 안쪽 지원센터로 이어진다.",
  },
  "field-runner": {
    employerName: "배금모빌리티",
    workplaceName: "현장순회 지원실",
    locationId: "mobility-control-center",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "오피스플라자 관제센터에서 출발해 여러 현장을 순회한다.",
  },
};

function cloneJobWorkplaceSnapshot(workplace = null) {
  if (!workplace) {
    return null;
  }

  return {
    ...workplace,
  };
}

function enrichJobWorkplaceSummary(workplace = null, targetState = state) {
  const snapshot = cloneJobWorkplaceSnapshot(workplace);
  if (!snapshot) {
    return null;
  }

  const day = targetState?.day || (typeof getCurrentDayNumber === "function" ? getCurrentDayNumber() : 1);
  const locationMap = typeof getDayWorldLocationMap === "function"
    ? getDayWorldLocationMap(day) || {}
    : {};

  return {
    ...snapshot,
    locationLabel: locationMap[snapshot.locationId]?.label || snapshot.workplaceName || snapshot.locationId,
    districtLabel: typeof getWorldDistrictLabel === "function"
      ? getWorldDistrictLabel(snapshot.districtId, day)
      : (snapshot.districtId || ""),
    routeStopLabel: locationMap[snapshot.routeStopId]?.label || snapshot.routeStopId || "",
  };
}

function getJobWorkplaceSummaryByJobId(jobId = "", targetState = state) {
  return enrichJobWorkplaceSummary(JOB_WORKPLACE_REGISTRY[String(jobId || "").trim()] || null, targetState);
}

function getCareerPostingWorkplaceSummaryByPostingId(postingId = "", targetState = state) {
  return enrichJobWorkplaceSummary(CAREER_POSTING_WORKPLACE_REGISTRY[String(postingId || "").trim()] || null, targetState);
}

function getOfferWorkplaceSummary(offer = null, targetState = state) {
  return getJobWorkplaceSummaryByJobId(offer?.jobId || "", targetState);
}

function getCareerOfferWorkplaceSummary(offer = null, targetState = state) {
  return getCareerPostingWorkplaceSummaryByPostingId(offer?.id || offer?.postingId || "", targetState);
}

function isOfferWorkplaceLocation(offer = null, locationId = "", targetState = state) {
  const workplace = getOfferWorkplaceSummary(offer, targetState);
  return Boolean(workplace?.locationId) && workplace.locationId === String(locationId || "").trim();
}

function formatWorkplaceSummaryLine(workplace = null) {
  if (!workplace) {
    return "";
  }

  const parts = [workplace.employerName, workplace.workplaceName].filter(Boolean);
  return parts.join(" · ");
}
