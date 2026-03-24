function setJobsActionStatusMessage({
  title = "",
  body = "",
  tone = "accent",
  kicker = "JOBS",
  targetState = state,
} = {}) {
  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("jobs", { kicker, title, body, tone }, targetState);
  }
}

function getScheduledShiftUiModel(targetState = state) {
  const shiftStatus = typeof getScheduledShiftStatus === "function"
    ? getScheduledShiftStatus(targetState)
    : null;
  if (!shiftStatus?.scheduledShift?.offer) {
    return null;
  }

  const offer = shiftStatus.scheduledShift.offer;
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : (JOB_LOOKUP?.[offer.jobId] || null);
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  const isAtWorkplace = Boolean(
    workplace?.locationId
    && currentLocationId
    && workplace.locationId === currentLocationId
  );
  const phase = shiftStatus.waiting
    ? "waiting"
    : (shiftStatus.active ? "active" : "missed");
  const startLabel = typeof formatClockTime === "function"
    ? formatClockTime(shiftStatus.startSlot)
    : "";
  const endLabel = typeof formatClockTime === "function"
    ? formatClockTime(shiftStatus.endSlot)
    : "";
  const shiftWindowLabel = startLabel && endLabel
    ? `${startLabel} - ${endLabel}`
    : "";

  return {
    shiftStatus,
    scheduledShift: shiftStatus.scheduledShift,
    offer,
    job,
    workplace,
    currentLocationId,
    isAtWorkplace,
    phase,
    needsTravel: phase !== "missed" && Boolean(workplace?.locationId) && !isAtWorkplace,
    canWait: phase === "waiting" && isAtWorkplace,
    canStart: phase === "active" && isAtWorkplace,
    startLabel,
    endLabel,
    shiftWindowLabel,
    workplaceLabel: workplace?.workplaceName || workplace?.locationLabel || "근무지",
    workplaceLine: [workplace?.workplaceName, workplace?.locationLabel || workplace?.districtLabel || ""]
      .filter(Boolean)
      .join(" · "),
  };
}

const MCDONALDS_JOB_IDS = new Set(["mcd-counter", "mcd-kitchen"]);
const MCDONALDS_STAGE_LOCATION_BY_JOB_ID = Object.freeze({
  "mcd-counter": "mcdonalds-counter",
  "mcd-kitchen": "mcdonalds-kitchen",
});
const MCDONALDS_STAGE_LABEL_BY_JOB_ID = Object.freeze({
  "mcd-counter": "카운터",
  "mcd-kitchen": "주방",
});
const MCDONALDS_APPLICATION_START_SLOT = DAY_START_TIME_SLOT + 4;
const MCDONALDS_APPLICATION_END_SLOT = DAY_START_TIME_SLOT + 20;

function isMcDonaldsJobId(jobId = "") {
  return MCDONALDS_JOB_IDS.has(String(jobId || "").trim());
}

function isMcDonaldsLocationId(locationId = "") {
  return ["mcdonalds", "mcdonalds-counter", "mcdonalds-kitchen"].includes(String(locationId || "").trim());
}

function getMcDonaldsLocationRole(locationId = "") {
  const normalizedLocationId = String(locationId || "").trim();

  if (normalizedLocationId === "mcdonalds-counter") {
    return "counter";
  }

  if (normalizedLocationId === "mcdonalds-kitchen") {
    return "kitchen";
  }

  if (normalizedLocationId === "mcdonalds") {
    return "exterior";
  }

  return "";
}

function getMcDonaldsJobStageLocationId(jobId = "") {
  return MCDONALDS_STAGE_LOCATION_BY_JOB_ID[String(jobId || "").trim()] || "";
}

function getMcDonaldsJobStageLabel(jobId = "") {
  return MCDONALDS_STAGE_LABEL_BY_JOB_ID[String(jobId || "").trim()] || "근무 구역";
}

function getMcDonaldsApplicationWindowLabel() {
  const startLabel = typeof formatClockTime === "function"
    ? formatClockTime(MCDONALDS_APPLICATION_START_SLOT)
    : "10:00";
  const endLabel = typeof formatClockTime === "function"
    ? formatClockTime(MCDONALDS_APPLICATION_END_SLOT)
    : "18:00";

  return `${startLabel} - ${endLabel}`;
}

function isMcDonaldsApplicationWindowOpen(targetState = state) {
  const currentSlot = Math.max(0, Math.round(Number(targetState?.timeSlot) || 0));
  return currentSlot >= MCDONALDS_APPLICATION_START_SLOT
    && currentSlot < MCDONALDS_APPLICATION_END_SLOT;
}

function buildMcDonaldsShiftWindowLabel(offer = null) {
  if (!offer || typeof getOfferShiftTiming !== "function") {
    return "";
  }

  const timing = getOfferShiftTiming(offer);
  if (!timing) {
    return "";
  }

  const startLabel = typeof formatClockTime === "function"
    ? formatClockTime(timing.startSlot)
    : "";
  const endLabel = typeof formatClockTime === "function"
    ? formatClockTime(timing.endSlot)
    : "";

  return startLabel && endLabel ? `${startLabel} - ${endLabel}` : "";
}

function setMcDonaldsVenueMessage({
  badge = "맥도날드",
  text = "",
  title = "",
  body = "",
  tone = "accent",
  targetState = state,
} = {}) {
  if (!targetState) {
    return;
  }

  if (text) {
    targetState.headline = {
      badge,
      text,
    };
  }

  setJobsActionStatusMessage({
    kicker: "MCD",
    title: title || badge,
    body: body || text,
    tone,
    targetState,
  });
}

function getMcDonaldsVenueState(targetState = state) {
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : createDefaultJobsState();
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  const locationRole = getMcDonaldsLocationRole(currentLocationId);

  if (!locationRole) {
    return null;
  }

  const offerEntries = Array.isArray(jobsState.dailyOffers)
    ? jobsState.dailyOffers
      .map((offer, index) => ({ offer, index }))
      .filter(({ offer }) => isMcDonaldsJobId(offer?.jobId))
    : [];
  const offerIndexByJobId = Object.fromEntries(
    offerEntries.map(({ offer, index }) => [offer.jobId, index]),
  );
  const offerByJobId = Object.fromEntries(
    offerEntries.map(({ offer }) => [offer.jobId, offer]),
  );
  const interviewResult = jobsState.interviewResult?.offer && isMcDonaldsJobId(jobsState.interviewResult.offer.jobId)
    ? jobsState.interviewResult
    : null;
  const scheduledShift = jobsState.scheduledShift?.offer && isMcDonaldsJobId(jobsState.scheduledShift.offer.jobId)
    ? jobsState.scheduledShift
    : null;
  const shiftJobId = String(scheduledShift?.offer?.jobId || "").trim();
  const shiftStageLocationId = getMcDonaldsJobStageLocationId(shiftJobId);
  const shiftStageLabel = getMcDonaldsJobStageLabel(shiftJobId);
  const shiftUi = scheduledShift?.day === targetState.day && typeof getScheduledShiftUiModel === "function"
    ? getScheduledShiftUiModel(targetState)
    : null;
  const shiftWindowLabel = shiftUi?.shiftWindowLabel || buildMcDonaldsShiftWindowLabel(scheduledShift?.offer);
  const shiftDayLabel = scheduledShift && typeof formatTurnLabel === "function"
    ? formatTurnLabel(scheduledShift.day)
    : (scheduledShift ? `${scheduledShift.day}턴` : "");
  const canApplyHere = !jobsState.applicationDoneToday
    && jobsState?.career?.status !== "employed"
    && !jobsState.scheduledShift;
  const applicationWindowOpen = isMcDonaldsApplicationWindowOpen(targetState);
  const hasCounterOffer = Boolean(offerByJobId["mcd-counter"]);
  const hasKitchenOffer = Boolean(offerByJobId["mcd-kitchen"]);
  const hasRejectedResultToday = Boolean(interviewResult && !interviewResult.success);
  const hasAcceptedResultToday = Boolean(interviewResult && interviewResult.success);
  let phase = "customer";

  if (scheduledShift?.day === targetState.day && shiftUi?.phase === "active") {
    phase = "shift-active";
  } else if (scheduledShift?.day === targetState.day && shiftUi?.phase === "waiting") {
    phase = "shift-waiting";
  } else if (scheduledShift?.day === targetState.day && shiftUi?.phase === "missed") {
    phase = "shift-missed";
  } else if (scheduledShift?.day > targetState.day || hasAcceptedResultToday) {
    phase = "hired";
  } else if (hasRejectedResultToday) {
    phase = "rejected";
  } else if ((hasCounterOffer || hasKitchenOffer) && canApplyHere && applicationWindowOpen) {
    phase = "apply-ready";
  } else if ((hasCounterOffer || hasKitchenOffer) && canApplyHere && !applicationWindowOpen) {
    phase = "apply-closed";
  } else if (hasCounterOffer || hasKitchenOffer) {
    phase = "apply-locked";
  }

  return {
    locationId: currentLocationId,
    locationRole,
    jobsState,
    phase,
    offerEntries,
    offerIndexByJobId,
    offerByJobId,
    hasCounterOffer,
    hasKitchenOffer,
    canApplyHere,
    applicationWindowOpen,
    applicationWindowLabel: getMcDonaldsApplicationWindowLabel(),
    interviewResult,
    scheduledShift,
    shiftUi,
    shiftJobId,
    shiftStageLocationId,
    shiftStageLabel,
    shiftWindowLabel,
    shiftDayLabel,
    isAtShiftStage: Boolean(shiftStageLocationId && shiftStageLocationId === currentLocationId),
    shouldUseKiosk: locationRole === "counter"
      && !(scheduledShift?.day === targetState.day && shiftUi?.phase === "active" && shiftStageLocationId === "mcdonalds-counter"),
    canEnterKitchen: Boolean(
      locationRole === "counter"
      && shiftStageLocationId === "mcdonalds-kitchen"
      && scheduledShift?.day === targetState.day
      && shiftUi?.phase !== "missed"
    ),
  };
}

function runMcDonaldsJobInquiryAction(jobId = "", targetState = state) {
  const normalizedJobId = String(jobId || "").trim();
  const venueState = getMcDonaldsVenueState(targetState);
  if (!venueState || !isMcDonaldsJobId(normalizedJobId)) {
    return {
      ok: false,
      code: "mcd-venue-unavailable",
    };
  }

  const offerIndex = Number.isInteger(venueState.offerIndexByJobId[normalizedJobId])
    ? venueState.offerIndexByJobId[normalizedJobId]
    : -1;
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition({ jobId: normalizedJobId })
    : JOB_LOOKUP?.[normalizedJobId];
  const jobTitle = job?.title || "맥도날드 알바";

  if (offerIndex < 0) {
    setMcDonaldsVenueMessage({
      badge: "채용 없음",
      text: `${jobTitle} 문의를 넣었지만 오늘은 해당 자리가 비어 있지 않다고 한다.`,
      title: "오늘 채용 없음",
      body: "오늘 공고가 열려 있을 때만 현장 문의를 받을 수 있습니다.",
      tone: "fail",
      targetState,
    });
    return {
      ok: false,
      code: "mcd-offer-not-found",
    };
  }

  if (venueState.jobsState?.applicationDoneToday) {
    setMcDonaldsVenueMessage({
      badge: "지원 완료",
      text: "오늘은 이미 다른 알바 지원을 넣어서 추가 문의를 받지 않는다고 한다.",
      title: "오늘 지원 마감",
      body: "하루에 한 번만 단기 알바 지원이 가능합니다.",
      targetState,
    });
    return {
      ok: false,
      code: "mcd-application-already-used",
    };
  }

  if (venueState.jobsState?.scheduledShift) {
    setMcDonaldsVenueMessage({
      badge: "근무 일정 있음",
      text: "이미 잡힌 근무가 있어서 추가 알바 문의는 받지 않는다고 한다.",
      title: "추가 지원 불가",
      body: "예약된 근무를 마친 뒤 다시 문의하세요.",
      targetState,
    });
    return {
      ok: false,
      code: "mcd-scheduled-shift-exists",
    };
  }

  if (!venueState.applicationWindowOpen) {
    setMcDonaldsVenueMessage({
      badge: "지원 시간 아님",
      text: `알바 문의는 ${venueState.applicationWindowLabel} 사이에만 받는다고 한다.`,
      title: "채용 문의 시간 아님",
      body: `지금은 손님 응대 시간이라 현장 채용 문의를 받지 않습니다. ${venueState.applicationWindowLabel}에 다시 오세요.`,
      tone: "fail",
      targetState,
    });
    return {
      ok: false,
      code: "mcd-application-window-closed",
    };
  }

  return typeof runPhoneJobApplicationAction === "function"
    ? runPhoneJobApplicationAction(offerIndex, targetState)
    : {
        ok: false,
        code: "mcd-apply-handler-missing",
      };
}

function runMcDonaldsShiftCheckAction(targetState = state) {
  const venueState = getMcDonaldsVenueState(targetState);
  if (!venueState) {
    return {
      ok: false,
      code: "mcd-venue-unavailable",
    };
  }

  if (venueState.interviewResult && !venueState.interviewResult.success) {
    setMcDonaldsVenueMessage({
      badge: "채용 불합격",
      text: "오늘 문의한 알바는 이번에는 연결되지 않았다고 한다.",
      title: "오늘은 채용 보류",
      body: "맥도날드 매니저가 다음 공고가 열리면 다시 들르라고 말합니다.",
      tone: "fail",
      targetState,
    });
    return {
      ok: false,
      code: "mcd-interview-rejected",
    };
  }

  if (!venueState.scheduledShift) {
    setMcDonaldsVenueMessage({
      badge: "손님 모드",
      text: "지금 맡은 맥도날드 근무는 없어서 손님처럼 키오스크만 이용할 수 있다.",
      title: "예약된 근무 없음",
      body: "현장 근무 일정이 없으면 키오스크 주문만 가능합니다.",
      targetState,
    });
    return {
      ok: false,
      code: "mcd-shift-not-found",
    };
  }

  if (venueState.scheduledShift.day > targetState.day) {
    setMcDonaldsVenueMessage({
      badge: "출근 시간 아님",
      text: `${venueState.shiftDayLabel} ${venueState.shiftWindowLabel} ${venueState.shiftStageLabel} 출근이라고 다시 안내받았다.`,
      title: "아직 출근할 날이 아님",
      body: `${venueState.shiftDayLabel} ${venueState.shiftWindowLabel} ${venueState.shiftStageLabel} 근무가 예약돼 있습니다.`,
      targetState,
    });
    return {
      ok: false,
      code: "mcd-shift-future",
    };
  }

  if (!venueState.shiftUi) {
    setMcDonaldsVenueMessage({
      badge: "근무 확인 불가",
      text: "오늘 맥도날드 근무 상태를 다시 불러오지 못했다.",
      title: "근무 상태 확인 필요",
      body: "장소를 다시 이동한 뒤 한 번 더 확인해 주세요.",
      tone: "fail",
      targetState,
    });
    return {
      ok: false,
      code: "mcd-shift-ui-missing",
    };
  }

  if ((venueState.shiftUi.phase === "waiting" || venueState.shiftUi.phase === "active") && !venueState.shiftUi.isAtWorkplace) {
    setMcDonaldsVenueMessage({
      badge: "근무 위치 다름",
      text: `${venueState.shiftStageLabel}으로 가야 출근 처리가 된다.`,
      title: "근무 위치 이동 필요",
      body: `${venueState.shiftUi.workplaceLabel || venueState.shiftStageLabel}에 도착해야 근무를 시작할 수 있습니다.`,
      targetState,
    });
    return {
      ok: false,
      code: "mcd-shift-stage-required",
    };
  }

  if (venueState.shiftUi.phase === "missed") {
    return typeof runSkipScheduledShiftAction === "function"
      ? runSkipScheduledShiftAction(targetState)
      : {
          ok: false,
          code: "mcd-skip-handler-missing",
        };
  }

  if (venueState.shiftUi.phase === "waiting") {
    return typeof runWaitForScheduledShiftAction === "function"
      ? runWaitForScheduledShiftAction(targetState)
      : {
          ok: false,
          code: "mcd-wait-handler-missing",
        };
  }

  if (venueState.shiftUi.phase === "active") {
    return typeof runStartScheduledShiftAction === "function"
      ? runStartScheduledShiftAction(targetState)
      : {
          ok: false,
          code: "mcd-start-handler-missing",
        };
  }

  setMcDonaldsVenueMessage({
    badge: "출근 시간 아님",
    text: `${venueState.shiftStageLabel} 근무 시간은 ${venueState.shiftWindowLabel || "오늘 근무 시간"}이다.`,
    title: "근무 시간 확인",
    body: "지금은 근무를 시작할 수 있는 시간이 아닙니다.",
    targetState,
  });
  return {
    ok: false,
    code: "mcd-shift-not-active",
  };
}

function recoverMcDonaldsVenueLocation(targetState = state) {
  if (!targetState || targetState.scene !== "outside") {
    return false;
  }

  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  if (currentLocationId !== "mcdonalds-kitchen") {
    return false;
  }

  const venueState = getMcDonaldsVenueState(targetState);
  const keepKitchenLocation = Boolean(
    venueState?.scheduledShift?.day === targetState.day
    && venueState.shiftStageLocationId === "mcdonalds-kitchen"
    && venueState.shiftUi?.phase !== "missed"
  );

  if (keepKitchenLocation) {
    return false;
  }

  if (typeof syncWorldState === "function") {
    const worldState = syncWorldState(targetState);
    worldState.currentLocation = "mcdonalds-counter";
    if (typeof getWorldLocationDistrictId === "function") {
      worldState.currentDistrict = getWorldLocationDistrictId("mcdonalds-counter", targetState.day);
    }
  } else if (targetState.world && typeof targetState.world === "object") {
    targetState.world.currentLocation = "mcdonalds-counter";
  }

  return true;
}

function runPhoneJobApplicationAction(offerIndex, targetState = state) {
  if (typeof canApplyForJobOffer === "function" && !canApplyForJobOffer(targetState)) {
    return {
      ok: false,
      code: "apply-locked",
    };
  }

  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : createDefaultJobsState();
  const offer = jobsState.dailyOffers?.[offerIndex];
  if (!offer) {
    return {
      ok: false,
      code: "offer-not-found",
    };
  }

  const blockReason = typeof getShortTermOfferBlockedMessage === "function"
    ? getShortTermOfferBlockedMessage(offer, targetState)
    : "";
  if (blockReason) {
    targetState.headline = {
      badge: "지원 조건 부족",
      text: `${blockReason} 조건이 맞아야 ${JOB_LOOKUP?.[offer.jobId]?.title || "이 알바"}에 지원할 수 있다.`,
    };
    setJobsActionStatusMessage({
      kicker: "REQUIREMENT",
      title: "지원 조건 부족",
      body: `${blockReason} 조건을 맞춘 뒤 다시 지원할 수 있습니다.`,
      tone: "fail",
      targetState,
    });
    return {
      ok: false,
      code: "requirement-blocked",
    };
  }

  const job = JOB_LOOKUP?.[offer.jobId];
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
  const workplaceLabel = workplace?.workplaceName || workplace?.locationLabel || "";
  const chance = typeof getInterviewChanceForOffer === "function"
    ? getInterviewChanceForOffer(offer)
    : 0;
  const success = Math.random() < chance;
  const nextTurnLabel = typeof formatTurnLabel === "function"
    ? formatTurnLabel(targetState.day + 1)
    : `${targetState.day + 1}턴`;
  const interviewResult = {
    day: targetState.day,
    success,
    chance,
    offer: typeof cloneOfferSnapshot === "function" ? cloneOfferSnapshot(offer) : offer,
    lines: success
    ? [
        `${job?.title || "알바"} 지원 결과가 도착했다.`,
        `${nextTurnLabel}${workplaceLabel ? ` ${workplaceLabel}` : ""} 출근이 잡혔다.`,
      ]
      : [
          `${job?.title || "알바"} 지원 결과가 도착했다.`,
          "이번에는 채용이 이어지지 않았다.",
        ],
  };
  const nextDayShift = success
    ? {
        day: targetState.day + 1,
        offer: typeof cloneOfferSnapshot === "function" ? cloneOfferSnapshot(offer) : offer,
      }
    : null;

  if (typeof patchJobsDomainState === "function") {
    patchJobsDomainState(targetState, {
      applicationDoneToday: true,
      interviewResult,
      scheduledShift: nextDayShift,
    });
  }

  targetState.headline = success
    ? {
        badge: "면접 합격",
        text: `${job?.title || "알바"}에 붙었고 ${nextTurnLabel}${workplaceLabel ? ` ${workplaceLabel}` : ""} 출근이 예약됐다.`,
      }
    : {
        badge: "면접 결과",
        text: `${job?.title || "알바"} 지원은 이번에는 이어지지 않았다.`,
      };

  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      "공고에 지원했다",
      success
        ? `${job?.title || "알바"} 지원 결과가 좋아서 ${nextTurnLabel}${workplaceLabel ? ` ${workplaceLabel}` : ""} 출근이 잡혔다.`
        : `${job?.title || "알바"} 공고에 지원했지만 이번에는 이어지지 않았다.`,
      {
        type: "job",
        source: "스마트폰",
        tags: ["알바", "지원", offer.jobId].filter(Boolean),
      },
    );
  }

  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  } else if (typeof refreshPhoneHomePreview === "function") {
    refreshPhoneHomePreview();
  }

  if (typeof spendTimeSlots === "function" && spendTimeSlots(TIME_COSTS.jobApplication)) {
    if (typeof advanceDayOrFinish === "function") {
      advanceDayOrFinish();
      return {
        ok: true,
        rendered: true,
      };
    }
  }

  return {
    ok: true,
    rendered: false,
  };
}

function runWaitForScheduledShiftAction(targetState = state) {
  const shiftUi = getScheduledShiftUiModel(targetState);
  if (!shiftUi) {
    return {
      ok: false,
      code: "shift-not-found",
    };
  }

  targetState.headline = {
    badge: "출근 대기",
    text: `${shiftUi.startLabel || "출근"}까지 시간을 보낸다.`,
  };

  if (typeof recordActionMemory === "function") {
    const sourceLabel = shiftUi.isAtWorkplace
      ? shiftUi.workplaceLabel
      : (typeof getCurrentLocationLabel === "function" ? getCurrentLocationLabel(targetState) : "현재 위치");
    const shiftTag = shiftUi.job?.isCareer ? "직장" : "알바";
    const offerTag = shiftUi.offer?.careerPostingId || shiftUi.offer?.jobId || "";
    recordActionMemory(
      "출근 전까지 기다렸다",
      shiftUi.job
        ? `${shiftUi.workplaceLabel} ${shiftUi.job.title} 출근 시간에 맞추려고 잠깐 대기했다.`
        : `${shiftUi.startLabel || "출근"}까지 시간을 보냈다.`,
      {
        type: "job",
        source: sourceLabel,
        tags: [shiftTag, "대기", offerTag].filter(Boolean),
      },
    );
  }

  if (typeof advanceTimeToSlot === "function" && advanceTimeToSlot(shiftUi.shiftStatus.startSlot)) {
    if (typeof advanceDayOrFinish === "function") {
      advanceDayOrFinish();
      return {
        ok: true,
        rendered: true,
      };
    }
  }

  return {
    ok: true,
    rendered: false,
  };
}

function runStartScheduledShiftAction(targetState = state) {
  const shiftStatus = typeof getScheduledShiftStatus === "function"
    ? getScheduledShiftStatus(targetState)
    : null;

  if (!shiftStatus) {
    return {
      ok: false,
      code: "shift-not-found",
    };
  }

  if (shiftStatus.waiting) {
    if (typeof waitForScheduledShift === "function") {
      waitForScheduledShift();
      return {
        ok: true,
        rendered: true,
      };
    }
    return {
      ok: false,
      code: "waiting-handler-missing",
    };
  }

  if (shiftStatus.missed) {
    return runSkipScheduledShiftAction(targetState);
  }

  const scheduledShift = shiftStatus.scheduledShift;
  const offer = typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(scheduledShift.offer)
    : scheduledShift.offer;
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : JOB_LOOKUP?.[offer?.jobId];
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
  const workplaceLabel = workplace?.workplaceName || workplace?.locationLabel || "";
  const currentLocationId = typeof getCurrentLocationId === "function"
    ? getCurrentLocationId(targetState)
    : "";
  const isCareerOffer = typeof isCareerShiftOffer === "function"
    ? isCareerShiftOffer(offer)
    : Boolean(offer?.careerPostingId);
  const offerTag = offer?.careerPostingId || offer?.jobId || "";
  const blockReason = !isCareerOffer && typeof getShortTermOfferBlockedMessage === "function"
    ? getShortTermOfferBlockedMessage(offer, targetState)
    : "";

  if (workplace?.locationId && workplace.locationId !== currentLocationId) {
    targetState.headline = {
      badge: "근무지 미도착",
      text: `${workplaceLabel || "근무지"}에 도착해야 ${job?.title || "알바"} 출근을 시작할 수 있다.`,
    };
    setJobsActionStatusMessage({
      kicker: "COMMUTE",
      title: "근무지로 이동 필요",
      body: `${workplaceLabel || "근무지"}에 먼저 가야 한다. ${workplace?.commuteHint || "지도에서 근무지를 확인해 이동하세요."}`,
      tone: "warn",
      targetState,
    });
    if (typeof refreshPhoneHomePreviewForState === "function") {
      refreshPhoneHomePreviewForState(targetState);
    } else if (typeof refreshPhoneHomePreview === "function") {
      refreshPhoneHomePreview();
    }
    return {
      ok: false,
      code: "workplace-travel-required",
    };
  }

  if (blockReason) {
    if (typeof patchJobsDomainState === "function") {
      patchJobsDomainState(targetState, {
        scheduledShift: null,
        interviewResult: null,
      });
    }
    targetState.currentOffer = offer;
    targetState.lastResult = {
      pay: 0,
      lines: [
        `${job?.title || "알바"}${workplaceLabel ? ` ${workplaceLabel}` : ""} 출근을 준비했지만 ${blockReason} 조건이 맞지 않았다.`,
        "오늘 근무는 무산됐고 다시 준비를 갖춰야 한다.",
      ],
    };
    targetState.phoneView = "home";
    targetState.scene = "result";
    targetState.headline = {
      badge: "출근 무산",
      text: `${blockReason} 조건이 맞지 않아 ${job?.title || "알바"}${workplaceLabel ? ` ${workplaceLabel}` : ""} 근무가 취소됐다.`,
    };
    if (typeof recordActionMemory === "function") {
      recordActionMemory(
        "예약 근무가 무산됐다",
        `${job?.title || "알바"}${workplaceLabel ? ` ${workplaceLabel}` : ""} 현장에 가려 했지만 ${blockReason} 조건이 맞지 않아 오늘 근무가 취소됐다.`,
        {
          type: "job",
          source: job?.title || "알바",
          tags: ["알바", "출근 실패", offer?.jobId].filter(Boolean),
        },
      );
    }
    if (typeof refreshPhoneHomePreviewForState === "function") {
      refreshPhoneHomePreviewForState(targetState);
    } else if (typeof refreshPhoneHomePreview === "function") {
      refreshPhoneHomePreview();
    }
    return {
      ok: false,
      code: "requirement-blocked",
    };
  }

  targetState.timeSlot = Math.max(targetState.timeSlot, shiftStatus.startSlot) + shiftStatus.durationSlots;
  targetState.timeMinuteOffset = 0;
  if (typeof startOfferWorkLoop === "function") {
    const started = startOfferWorkLoop(offer, {
      clearScheduledShift: true,
      targetState,
    });
    if (!started) {
      return {
        ok: false,
        code: "work-loop-not-started",
      };
    }
    return {
      ok: true,
      rendered: true,
    };
  }
  if (typeof startWorkSceneForOffer === "function") {
    const started = startWorkSceneForOffer(offer, {
      clearScheduledShift: true,
      targetState,
    });
    if (!started) {
      return {
        ok: false,
        code: "work-scene-not-started",
      };
    }
    return {
      ok: true,
      rendered: true,
    };
  }

  return {
    ok: false,
    code: "start-work-handler-missing",
  };
}

function runSkipScheduledShiftAction(targetState = state) {
  const scheduledShift = typeof getScheduledShiftForToday === "function"
    ? getScheduledShiftForToday(targetState)
    : null;

  if (!scheduledShift) {
    return {
      ok: false,
      code: "shift-not-found",
    };
  }

  const offer = typeof cloneOfferSnapshot === "function"
    ? cloneOfferSnapshot(scheduledShift.offer)
    : scheduledShift.offer;
  const job = typeof getOfferRuntimeDefinition === "function"
    ? getOfferRuntimeDefinition(offer)
    : JOB_LOOKUP?.[offer?.jobId];
  const workplace = typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
  const workplaceLabel = workplace?.workplaceName || workplace?.locationLabel || "";
  const offerTag = offer?.careerPostingId || offer?.jobId || "";

  targetState.currentOffer = offer;
  targetState.lastResult = {
    pay: 0,
    lines: [
      `${job?.title || "알바"}${workplaceLabel ? ` ${workplaceLabel}` : ""} 출근을 놓쳤다.`,
      "예약된 근무가 날아가고 오늘은 돈을 벌지 못했다.",
    ],
  };
  if (typeof patchJobsDomainState === "function") {
    patchJobsDomainState(targetState, {
      scheduledShift: null,
      interviewResult: null,
    });
  }
  targetState.phoneView = "home";
  targetState.scene = "result";
  targetState.headline = {
    badge: "결근",
    text: `${job?.title || "알바"}${workplaceLabel ? ` ${workplaceLabel}` : ""} 예약 근무를 놓쳤다.`,
  };
  if (typeof recordActionMemory === "function") {
    recordActionMemory(
      "예약 근무를 놓쳤다",
      `${job?.title || "알바"}${workplaceLabel ? ` ${workplaceLabel}` : ""} 출근 시간에 맞추지 못해 오늘 근무가 사라졌다.`,
      {
        type: "job",
        source: job?.title || "근무",
        tags: [job?.isCareer ? "직장" : "알바", "결근", offerTag].filter(Boolean),
      },
    );
  }
  if (typeof refreshPhoneHomePreviewForState === "function") {
    refreshPhoneHomePreviewForState(targetState);
  } else if (typeof refreshPhoneHomePreview === "function") {
    refreshPhoneHomePreview();
  }

  return {
    ok: true,
    rendered: false,
  };
}

function runOpenScheduledShiftRouteAction(targetState = state) {
  const shiftUi = getScheduledShiftUiModel(targetState);
  if (!shiftUi?.workplace?.locationId) {
    return {
      ok: false,
      code: "shift-route-not-found",
    };
  }

  if (targetState.scene !== "outside") {
    if (typeof goOutside === "function") {
      goOutside({
        autoOpenMapTargetLocation: shiftUi.workplace.locationId,
      });
      return {
        ok: true,
        rendered: true,
      };
    }

    return {
      ok: false,
      code: "outside-required",
    };
  }

  if (typeof openCityMapOverlayToLocation === "function") {
    openCityMapOverlayToLocation(shiftUi.workplace.locationId, targetState);
    return {
      ok: true,
      rendered: true,
    };
  }

  if (typeof openCityMapOverlay === "function") {
    openCityMapOverlay(targetState);
    return {
      ok: true,
      rendered: true,
    };
  }

  return {
    ok: false,
    code: "city-map-unavailable",
  };
}

function resolveJobsPhoneActionRequest(phoneAction, actionTarget, targetState = state) {
  if (phoneAction === "apply-job") {
    return {
      id: "jobs-apply-short-term",
      perform: () => runPhoneJobApplicationAction(Number(actionTarget?.dataset?.offerIndex), targetState),
    };
  }

  if (phoneAction === "go-shift") {
    return {
      id: "jobs-go-shift",
      perform: () => runStartScheduledShiftAction(targetState),
    };
  }

  if (phoneAction === "jobs-open-shift-route") {
    return {
      id: "jobs-open-shift-route",
      perform: () => runOpenScheduledShiftRouteAction(targetState),
    };
  }

  if (phoneAction === "skip-shift") {
    return {
      id: "jobs-skip-shift",
      perform: () => runSkipScheduledShiftAction(targetState),
    };
  }

  return null;
}
