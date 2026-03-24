function escapeJobsAppHtml(text) {
  if (typeof escapeHtml === "function") {
    return escapeHtml(String(text ?? ""));
  }

  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatJobsAppCash(amount) {
  const normalizedAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return typeof formatCash === "function"
    ? formatCash(normalizedAmount)
    : `${normalizedAmount.toLocaleString("ko-KR")}원`;
}

function formatJobsAppPercent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

function getJobsOfferWorkplaceSummary(offer, targetState = state) {
  return typeof getOfferWorkplaceSummary === "function"
    ? getOfferWorkplaceSummary(offer, targetState)
    : null;
}

function getCareerJobsOfferWorkplaceSummary(offer, targetState = state) {
  return typeof getCareerOfferWorkplaceSummary === "function"
    ? getCareerOfferWorkplaceSummary(offer, targetState)
    : null;
}

function getJobsOfferDefinition(offer) {
  return typeof getOfferRuntimeDefinition === "function"
    ? (getOfferRuntimeDefinition(offer) || { title: "근무", emoji: "💼", tags: [], category: "직장" })
    : (JOB_LOOKUP?.[offer?.jobId] || { title: "근무", emoji: "💼", tags: [], category: "직장" });
}

function buildJobsTagMarkup(tags = [], limit = 3) {
  return tags
    .filter(Boolean)
    .slice(0, limit)
    .map((tag) => `<span class="phone-job-tag">${escapeJobsAppHtml(tag)}</span>`)
    .join("");
}

function buildJobsWorkplaceInfoMarkup(workplace = null) {
  if (!workplace) {
    return "";
  }

  const title = workplace.workplaceName || workplace.employerName || "근무지";
  const meta = [
    workplace.employerName && workplace.employerName !== title ? workplace.employerName : "",
    workplace.locationLabel,
    workplace.districtLabel,
  ].filter(Boolean);

  return `
    <div class="phone-job-workplace">
      <div class="phone-job-workplace-title">${escapeJobsAppHtml(title)}</div>
      ${meta.length ? `<div class="phone-job-workplace-meta">${escapeJobsAppHtml(meta.join(" · "))}</div>` : ""}
    </div>
  `;
}

function buildJobsAppTrackTabs(activeTrack = "short-term") {
  const tracks = [
    { id: "short-term", label: "알바" },
    { id: "career", label: "직장" },
  ];

  return `
    <div class="phone-app-tab-row" role="tablist" aria-label="공고 종류">
      ${tracks.map((track) => `
        <button
          class="phone-app-tab ${activeTrack === track.id ? "is-active" : ""}"
          type="button"
          role="tab"
          aria-selected="${activeTrack === track.id}"
          data-phone-action="jobs-set-track"
          data-track="${track.id}"
        >
          ${escapeJobsAppHtml(track.label)}
        </button>
      `).join("")}
    </div>
  `;
}

function buildJobsStatusCardMarkup({
  toneClass = "is-booked",
  labelLeft = "",
  labelRight = "",
  title = "",
  body = "",
  workplace = null,
  actionMarkup = "",
}) {
  return `
    <section class="phone-job-status-card ${escapeJobsAppHtml(toneClass)}">
      <div class="phone-job-status-label">
        <span>${escapeJobsAppHtml(labelLeft)}</span>
        <span>${escapeJobsAppHtml(labelRight)}</span>
      </div>
      <div class="phone-job-status-title">${escapeJobsAppHtml(title)}</div>
      ${body ? `<div class="phone-job-status-body">${escapeJobsAppHtml(body)}</div>` : ""}
      ${buildJobsWorkplaceInfoMarkup(workplace)}
      ${actionMarkup}
    </section>
  `;
}

function getTodayShiftCardConfig(targetState = state) {
  const shiftUi = typeof getScheduledShiftUiModel === "function"
    ? getScheduledShiftUiModel(targetState)
    : null;
  const workplaceLabel = shiftUi?.workplaceLabel || shiftUi?.workplace?.workplaceName || "근무지";

  if (!shiftUi) {
    return {
      toneClass: "is-booked",
      label: "예약",
      body: "예약 근무 확인 불가",
      actionMarkup: "",
    };
  }

  if (shiftUi.phase === "missed") {
    return {
      toneClass: "is-fail",
      label: "지각",
      body: `${workplaceLabel} 시간 지남`,
      actionMarkup: '<button class="phone-job-apply" type="button" data-phone-action="skip-shift">결근</button>',
    };
  }

  if (shiftUi.canStart) {
    return {
      toneClass: "is-success",
      label: "출근",
      body: `${workplaceLabel} 바로 출근`,
      actionMarkup: '<button class="phone-job-apply" type="button" data-phone-action="go-shift">출근</button>',
    };
  }

  if (shiftUi.canWait) {
    return {
      toneClass: "is-booked",
      label: "도착",
      body: `${workplaceLabel} 대기 중`,
      actionMarkup: '<button class="phone-job-apply" type="button" data-phone-action="go-shift">대기</button>',
    };
  }

  return {
    toneClass: "is-booked",
    label: "이동",
    body: `${workplaceLabel} 먼저 이동`,
    actionMarkup: '<button class="phone-job-apply" type="button" data-phone-action="jobs-open-shift-route">경로</button>',
  };
}

function buildBookedShiftStatusMarkup(bookedShift, day) {
  if (!bookedShift?.offer) {
    return "";
  }

  const job = getJobsOfferDefinition(bookedShift.offer);
  const workplace = getJobsOfferWorkplaceSummary(bookedShift.offer);
  const dueToday = bookedShift.day === day;
  const todayShiftCard = dueToday ? getTodayShiftCardConfig(state) : null;

  return buildJobsStatusCardMarkup({
    toneClass: todayShiftCard?.toneClass || "is-booked",
    labelLeft: dueToday ? (todayShiftCard?.label || "예약") : "예약",
    labelRight: typeof formatTurnBadge === "function"
      ? formatTurnBadge(bookedShift.day)
      : `TURN ${String(bookedShift.day).padStart(2, "0")}`,
    title: `${job.emoji} ${job.title}`,
    body: dueToday
      ? (todayShiftCard?.body || "오늘 출근 확인")
      : `${typeof formatTurnLabel === "function" ? formatTurnLabel(bookedShift.day) : `${bookedShift.day}턴`} 출근 예약`,
    workplace,
    actionMarkup: dueToday ? (todayShiftCard?.actionMarkup || "") : "",
  });
}

function buildShortTermJobsContent(viewModel) {
  const bookedShift = viewModel.bookedShift?.offer?.careerPostingId
    ? null
    : viewModel.bookedShift;
  const offerCards = viewModel.offers.map((offer, index) => {
    const job = getJobsOfferDefinition(offer);
    const workplace = getJobsOfferWorkplaceSummary(offer);
    const tags = buildJobsTagMarkup([...(job.tags || []).slice(0, 1), ...((offer.requirementTags || []).slice(0, 2))]);
    const disabledReason = viewModel.career?.status === "employed"
      ? "재직중"
      : bookedShift
      ? "예약 근무 있음"
      : viewModel.applicationDoneToday
        ? "오늘 신청 완료"
        : (!offer.eligible ? `요건 부족: ${(offer.unmetRequirements || []).join(", ")}` : "");
    const disabled = !viewModel.canApply || !offer.eligible;
    const buttonLabel = !viewModel.canApply
      ? "마감"
      : offer.eligible
        ? "지원"
        : "요건";

    return `
      <article class="phone-job-card">
        <div class="phone-job-card-top">
          <div class="phone-job-card-title">${escapeJobsAppHtml(job.emoji)} ${escapeJobsAppHtml(job.title)}</div>
          <div class="phone-job-pay">${formatJobsAppCash(offer.pay)}</div>
        </div>
        ${buildJobsWorkplaceInfoMarkup(workplace)}
        <div class="phone-job-meta">
          <div class="phone-job-tags">${tags}</div>
          <button
            class="phone-job-apply"
            type="button"
            data-phone-action="apply-job"
            data-offer-index="${index}"
            ${disabled ? "disabled" : ""}
            title="${escapeJobsAppHtml(disabledReason)}"
          >
            ${escapeJobsAppHtml(buttonLabel)}
          </button>
        </div>
      </article>
    `;
  }).join("");

  const statusCards = [];

  if (bookedShift) {
    statusCards.push(buildBookedShiftStatusMarkup(bookedShift, viewModel.day));
  }

  if (viewModel.result) {
    const job = getJobsOfferDefinition(viewModel.result.offer);
    const workplace = getJobsOfferWorkplaceSummary(viewModel.result.offer);
    statusCards.push(buildJobsStatusCardMarkup({
      toneClass: viewModel.result.success ? "is-success" : "is-fail",
      labelLeft: viewModel.result.success ? "합격" : "불합격",
      labelRight: formatJobsAppPercent(viewModel.result.chance || 0),
      title: `${job.emoji} ${job.title}`,
      body: viewModel.result.success ? "오늘 근무 가능" : "이번 지원 탈락",
      workplace,
    }));
  }

  return `
    ${statusCards.join("")}
    ${offerCards || '<div class="phone-job-empty">오늘 알바 공고 없음</div>'}
  `;
}

function buildCareerPrepSummary(viewModel) {
  const prepCards = Object.entries(viewModel.careerPrep || {}).map(([prepKey, value]) => `
    <div class="phone-career-summary-card">
      <div class="phone-career-summary-label">${escapeJobsAppHtml(getCareerPrepLabel(prepKey))}</div>
      <div class="phone-career-summary-value">${escapeJobsAppHtml(String(value))}</div>
    </div>
  `).join("");

  const certTags = Object.entries(viewModel.certifications || {})
    .filter(([, owned]) => owned)
    .map(([certKey]) => getCareerCertificationLabel(certKey));

  return `
    <section class="phone-app-card is-accent">
      <div class="phone-app-card-title">준비도</div>
      <div class="phone-career-summary-grid">${prepCards}</div>
      <div class="phone-career-cert-row">
        ${buildJobsTagMarkup(certTags, 3) || '<span class="phone-job-tag">자격 없음</span>'}
      </div>
    </section>
  `;
}

function buildCareerStatusCards(viewModel) {
  const cards = [];
  const career = viewModel.career || {};
  const currentPosting = typeof getCareerPostingById === "function"
    ? getCareerPostingById(career.postingId)
    : null;
  const workplace = getCareerJobsOfferWorkplaceSummary(currentPosting);
  const title = `${currentPosting?.emoji || "💼"} ${currentPosting?.title || "직장"}`;

  if (viewModel.careerOutcome) {
    cards.push(buildJobsStatusCardMarkup({
      toneClass: viewModel.careerOutcome.lastOutcome === "employed" ? "is-success" : "is-fail",
      labelLeft: viewModel.careerOutcome.lastOutcome === "employed" ? "합격" : "불합격",
      labelRight: viewModel.careerOutcome.resultChance != null
        ? formatJobsAppPercent(viewModel.careerOutcome.resultChance)
        : "-",
      title,
      body: viewModel.careerOutcome.lastOutcome === "employed" ? "입사 완료" : "이번 면접 탈락",
      workplace,
    }));
  } else if (career.status === "applied" && Number.isFinite(career.resultDay) && career.resultDay > viewModel.day) {
    cards.push(buildJobsStatusCardMarkup({
      toneClass: "is-booked",
      labelLeft: "심사중",
      labelRight: typeof formatTurnBadge === "function"
        ? formatTurnBadge(career.resultDay)
        : `TURN ${String(career.resultDay).padStart(2, "0")}`,
      title,
      body: "다음 턴 결과",
      workplace,
    }));
  } else if (career.status === "employed") {
    cards.push(buildJobsStatusCardMarkup({
      toneClass: "is-booked",
      labelLeft: "재직중",
      labelRight: "OPEN",
      title,
      body: "입사 완료",
      workplace,
    }));
  }

  return cards.join("");
}

function buildCareerJobsContent(viewModel) {
  const careerStatusCards = buildCareerStatusCards(viewModel);
  const scheduledCareerShift = viewModel.bookedShift?.offer?.careerPostingId
    ? buildBookedShiftStatusMarkup(viewModel.bookedShift, viewModel.day)
    : "";
  const offerCards = viewModel.careerOffers.map((offer, index) => {
    const workplace = getCareerJobsOfferWorkplaceSummary(offer);
    const requirementLine = (offer.unmetRequirements || []).join(", ");
    const disabledReason = viewModel.career.status === "employed"
      ? "이미 재직중"
      : viewModel.career.status === "applied"
        ? "면접 결과 대기중"
        : viewModel.careerApplicationDoneToday
          ? "오늘 신청 완료"
          : (!offer.eligible ? `요건 부족: ${requirementLine}` : "");
    const disabled = !viewModel.careerCanApply;
    const buttonLabel = viewModel.career.status === "employed"
      ? "재직"
      : viewModel.career.status === "applied"
        ? "대기"
        : viewModel.careerApplicationDoneToday
          ? "내일"
          : "신청";
    const tags = buildJobsTagMarkup([
      offer.categoryLabel,
      ...((offer.requirementTags || []).slice(0, 2)),
    ]);

    return `
      <article class="phone-job-card">
        <div class="phone-job-card-top">
          <div class="phone-job-card-title">${escapeJobsAppHtml(offer.emoji)} ${escapeJobsAppHtml(offer.title)}</div>
          <div class="phone-job-pay">${formatJobsAppPercent(offer.successChance)}</div>
        </div>
        ${buildJobsWorkplaceInfoMarkup(workplace)}
        <div class="phone-job-meta">
          <div class="phone-job-tags">${tags}</div>
          <button
            class="phone-job-apply"
            type="button"
            data-phone-action="apply-career-job"
            data-offer-index="${index}"
            ${disabled ? "disabled" : ""}
            title="${escapeJobsAppHtml(disabledReason)}"
          >
            ${escapeJobsAppHtml(buttonLabel)}
          </button>
        </div>
      </article>
    `;
  }).join("");

  return `
    ${buildCareerPrepSummary(viewModel)}
    ${careerStatusCards}
    ${scheduledCareerShift}
    ${offerCards || '<div class="phone-job-empty">오늘 직장 공고 없음</div>'}
  `;
}

function buildJobsAppScreenMarkup({ showHomeButton = true, stageMode = false } = {}) {
  const fallbackJobsState = state.jobs && typeof state.jobs === "object"
    ? state.jobs
    : {};
  const viewModel = typeof createJobsAppViewModel === "function"
    ? createJobsAppViewModel(state)
    : {
        day: state.day,
        activeTrack: "short-term",
        offers: Array.isArray(fallbackJobsState.dailyOffers) ? fallbackJobsState.dailyOffers : [],
        bookedShift: fallbackJobsState.scheduledShift || null,
        result: fallbackJobsState.interviewResult && fallbackJobsState.interviewResult.day === state.day
          ? fallbackJobsState.interviewResult
          : null,
        applicationDoneToday: Boolean(fallbackJobsState.applicationDoneToday),
        canApply: typeof canApplyForJobOffer === "function" ? canApplyForJobOffer() : false,
        careerOffers: [],
        career: { status: "idle" },
        careerOutcome: null,
        careerPrep: { service: 0, labor: 0, office: 0, academic: 0 },
        certifications: { driverLicense: false, computerCert: false, universityDegree: false },
        careerApplicationDoneToday: false,
        careerCanApply: typeof canApplyForCareerOffer === "function" ? canApplyForCareerOffer() : false,
      };

  const contentMarkup = viewModel.activeTrack === "career"
    ? buildCareerJobsContent(viewModel)
    : buildShortTermJobsContent(viewModel);

  return `
    <div class="phone-app-screen-top ${stageMode ? "is-stage-mode" : ""}">
      <div class="phone-app-screen-copy">
        <div class="phone-app-screen-title">공고</div>
      </div>
      ${showHomeButton ? '<button class="phone-app-mini-btn" type="button" data-phone-action="close-phone-view">홈</button>' : ""}
    </div>
    ${buildJobsAppTrackTabs(viewModel.activeTrack)}
    ${contentMarkup}
  `;
}
