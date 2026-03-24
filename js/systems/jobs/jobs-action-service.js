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
    startOfferWorkLoop(offer, {
      clearScheduledShift: true,
      targetState,
    });
    return {
      ok: true,
      rendered: true,
    };
  }
  if (typeof startWorkSceneForOffer === "function") {
    startWorkSceneForOffer(offer, {
      clearScheduledShift: true,
      targetState,
    });
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
