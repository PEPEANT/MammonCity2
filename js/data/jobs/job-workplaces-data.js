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
    employerName: "배금라이더",
    workplaceName: "배금역 앞 라이더 집결지",
    locationId: "logistics-center",
    districtId: "commercial",
    routeStopId: "station-front",
    commuteHint: "배금역 앞 광장 쪽으로 가면 라이더들이 모여 있는 집결지를 바로 찾을 수 있다.",
  },
  "delivery-motorbike": {
    employerName: "배금라이더",
    workplaceName: "다운타운 오토바이 집결지",
    locationId: "downtown",
    districtId: "commercial",
    routeStopId: "downtown",
    commuteHint: "다운타운 안쪽 라이더 쉼터로 들어가면 오토바이 배달 팀이 대기하고 있다.",
  },
  "delivery-courier": {
    employerName: "배금퀵",
    workplaceName: "배금역 앞 퀵 집하장",
    locationId: "station-front",
    districtId: "commercial",
    routeStopId: "station-front",
    commuteHint: "배금역 앞 퀵 집하장으로 들어가면 장거리 배송 배차표가 보인다.",
  },
  tutoring: {
    employerName: "배금학습연구소",
    workplaceName: "배금학습연구소 대학가센터",
    locationId: "university-district",
    districtId: "study",
    routeStopId: "library",
    commuteHint: "도서관 구역에서 대학가 방향으로 이어지는 골목을 따라 들어간다.",
  },
  "mcd-counter": {
    employerName: "맥도날드",
    workplaceName: "맥도날드 배금거리점 카운터",
    locationId: "mcdonalds-counter",
    districtId: "commercial",
    routeStopId: "mcdonalds",
    commuteHint: "배금거리 맥도날드 안으로 들어가면 카운터 바로 앞에 선다.",
  },
  "mcd-kitchen": {
    employerName: "맥도날드",
    workplaceName: "맥도날드 배금거리점 주방",
    locationId: "mcdonalds-kitchen",
    districtId: "commercial",
    routeStopId: "mcdonalds",
    commuteHint: "카운터 안쪽 직원문을 지나 주방 라인으로 들어가면 된다.",
  },
  warehouse: {
    employerName: "배금상가물류",
    workplaceName: "배금역 상가 하역장",
    locationId: "station-front",
    districtId: "commercial",
    routeStopId: "station-front",
    commuteHint: "역 앞 상가 뒤쪽 하역장으로 돌면 새벽 상하차 팀이 모여 있다.",
  },
  cleaning: {
    employerName: "클린웨이",
    workplaceName: "다운타운 야간관리실",
    locationId: "downtown",
    districtId: "commercial",
    routeStopId: "downtown",
    commuteHint: "다운타운 건물 관리실로 들어가면 야간 점검표를 받게 된다.",
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
    employerName: "배금라이더",
    workplaceName: "다운타운 배차지원실",
    locationId: "downtown",
    districtId: "commercial",
    routeStopId: "downtown",
    commuteHint: "다운타운 콜센터 안쪽 배차지원실에서 배달 동선을 모니터링한다.",
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
    workplaceName: "로보키친 다운타운점",
    locationId: "downtown",
    districtId: "commercial",
    routeStopId: "downtown",
    commuteHint: "다운타운 매장 홀 안쪽에서 서빙봇과 주문 동선을 관리한다.",
  },
  line_inspector: {
    employerName: "배금오토메이션",
    workplaceName: "배금역 자동설비 점검실",
    locationId: "station-interior",
    districtId: "commercial",
    routeStopId: "station-front",
    commuteHint: "역사 내부 자동설비 점검실에서 고장 알림과 센서 상태를 확인한다.",
  },
  closing_checker: {
    employerName: "클린웨이",
    workplaceName: "다운타운 마감점검팀",
    locationId: "downtown",
    districtId: "commercial",
    routeStopId: "downtown",
    commuteHint: "다운타운 상가 마감 이후 체크리스트를 들고 순서대로 점검한다.",
  },
};

const CAREER_POSTING_WORKPLACE_REGISTRY = {
  "factory-operator": {
    employerName: "배금전자",
    workplaceName: "배금전자 생산동",
    locationId: "production-line",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "배금디지털단지 입구에서 외곽 생산동 쪽으로 따라가면 교대 라인이 이어진다.",
  },
  "baegeum-electronics-office": {
    employerName: "배금전자",
    workplaceName: "배금전자 사무동",
    locationId: "mobility-control-center",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "배금디지털단지 입구에서 안쪽 사무동으로 들어가면 면접 접수 데스크가 보인다.",
  },
  "baegeum-research-lab": {
    employerName: "배금연구소",
    workplaceName: "배금연구소",
    locationId: "research-lab-interior",
    districtId: "industrial",
    routeStopId: "office-plaza",
    commuteHint: "배금디지털단지 안쪽 연구동으로 들어가면 연구지원 면접실이 이어진다.",
  },
};

JOB_WORKPLACE_REGISTRY.warehouse.locationId = "logistics-center";
JOB_WORKPLACE_REGISTRY.warehouse.workplaceName = "배금 물류센터";
JOB_WORKPLACE_REGISTRY.warehouse.commuteHint = "배금역 광장에서 물류센터 앞으로 걸어가면 출고 택이 보인다.";
CAREER_POSTING_WORKPLACE_REGISTRY["factory-operator"].locationId = "production-line";
CAREER_POSTING_WORKPLACE_REGISTRY["factory-operator"].workplaceName = "배금전자 생산라인";
CAREER_POSTING_WORKPLACE_REGISTRY["factory-operator"].commuteHint = "배금디지털단지 입구에서 공장 앞을 지나 생산라인 입구로 들어가면 된다.";
CAREER_POSTING_WORKPLACE_REGISTRY["baegeum-research-lab"].locationId = "research-lab-interior";
CAREER_POSTING_WORKPLACE_REGISTRY["baegeum-research-lab"].workplaceName = "배금연구소 연구동";
CAREER_POSTING_WORKPLACE_REGISTRY["baegeum-research-lab"].commuteHint = "배금디지털단지 안쪽 연구소 앞을 지나 연구동으로 들어가면 된다.";

JOB_WORKPLACE_REGISTRY.warehouse.employerName = "배금 물류센터";
JOB_WORKPLACE_REGISTRY.warehouse.workplaceName = "배금 물류센터 상차장";
JOB_WORKPLACE_REGISTRY.warehouse.routeStopId = "station-front";

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
  if (offer?.careerPostingId) {
    return getCareerPostingWorkplaceSummaryByPostingId(offer.careerPostingId, targetState);
  }
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

