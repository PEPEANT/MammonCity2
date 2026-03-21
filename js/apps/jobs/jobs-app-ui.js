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
  return typeof formatCash === "function"
    ? formatCash(amount)
    : `${(Number.isFinite(amount) ? amount : 0).toLocaleString("ko-KR")}원`;
}

function formatJobsAppPercent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

function buildJobsAppTrackTabs(activeTrack = "short-term") {
  const tracks = [
    { id: "short-term", label: "단기알바" },
    { id: "career", label: "직장지원" },
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

function buildShortTermJobsContent(viewModel) {
  const offerCards = viewModel.offers.map((offer, index) => {
    const job = JOB_LOOKUP[offer.jobId];
    const tags = (job.tags || []).slice(0, 2).map((tag) => `<span class="phone-job-tag">${escapeJobsAppHtml(tag)}</span>`).join("");
    const disabledReason = viewModel.bookedShift
      ? "예약된 출근이 있어 지금은 새 알바를 넣을 수 없습니다."
      : viewModel.applicationDoneToday
        ? "오늘은 이미 단기알바 지원을 마쳤습니다."
        : "";

    return `
      <article class="phone-job-card">
        <div class="phone-job-card-top">
          <div class="phone-job-card-title">${escapeJobsAppHtml(job.emoji)} ${escapeJobsAppHtml(job.title)}</div>
          <div class="phone-job-pay">${formatJobsAppCash(offer.pay)}</div>
        </div>
        <div class="phone-job-meta">
          <div class="phone-job-tags">${tags}</div>
          <button
            class="phone-job-apply"
            type="button"
            data-phone-action="apply-job"
            data-offer-index="${index}"
            ${viewModel.canApply ? "" : "disabled"}
            title="${escapeJobsAppHtml(disabledReason)}"
          >
            ${viewModel.canApply ? "지원" : "마감"}
          </button>
        </div>
      </article>
    `;
  }).join("");

  const statusCards = [];

  if (viewModel.bookedShift) {
    const job = JOB_LOOKUP[viewModel.bookedShift.offer.jobId];
    const dueToday = viewModel.bookedShift.day === viewModel.day;
    statusCards.push(`
      <section class="phone-job-status-card is-booked">
        <div class="phone-job-status-label">
          <span>${dueToday ? "TODAY SHIFT" : "BOOKED SHIFT"}</span>
          <span>DAY ${String(viewModel.bookedShift.day).padStart(2, "0")}</span>
        </div>
        <div class="phone-job-status-title">${escapeJobsAppHtml(job.emoji)} ${escapeJobsAppHtml(job.title)}</div>
        <div class="phone-job-status-body">
          ${dueToday ? "오늘은 이 알바로 출근할 수 있다." : `${viewModel.bookedShift.day}일차 출근이 예약돼 있다.`}
        </div>
        ${dueToday ? '<button class="phone-job-apply" type="button" data-phone-action="go-shift">출근하기</button>' : ""}
      </section>
    `);
  }

  if (viewModel.result) {
    const job = JOB_LOOKUP[viewModel.result.offer.jobId];
    statusCards.push(`
      <section class="phone-job-status-card ${viewModel.result.success ? "is-success" : "is-fail"}">
        <div class="phone-job-status-label">
          <span>${viewModel.result.success ? "INTERVIEW PASS" : "INTERVIEW FAIL"}</span>
          <span>${Math.round((viewModel.result.chance || 0) * 100)}%</span>
        </div>
        <div class="phone-job-status-title">${escapeJobsAppHtml(job.emoji)} ${escapeJobsAppHtml(job.title)}</div>
        <div class="phone-job-status-body">${escapeJobsAppHtml((viewModel.result.lines || []).join(" "))}</div>
      </section>
    `);
  }

  return `
    ${statusCards.join("")}
    ${offerCards || '<div class="phone-job-empty">오늘 확인할 단기알바가 없습니다.</div>'}
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
    .map(([certKey]) => `<span class="phone-job-tag">${escapeJobsAppHtml(getCareerCertificationLabel(certKey))}</span>`)
    .join("");

  return `
    <section class="phone-app-card is-accent">
      <div class="phone-app-card-title">준비</div>
      <div class="phone-career-summary-grid">${prepCards}</div>
      <div class="phone-career-cert-row">
        ${certTags || '<span class="phone-job-tag">보유 자격 없음</span>'}
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

  if (viewModel.careerOutcome) {
    cards.push(`
      <section class="phone-job-status-card ${viewModel.careerOutcome.lastOutcome === "employed" ? "is-success" : "is-fail"}">
        <div class="phone-job-status-label">
          <span>${viewModel.careerOutcome.lastOutcome === "employed" ? "CAREER PASS" : "CAREER FAIL"}</span>
          <span>${viewModel.careerOutcome.resultChance != null ? formatJobsAppPercent(viewModel.careerOutcome.resultChance) : "-"}</span>
        </div>
        <div class="phone-job-status-title">${escapeJobsAppHtml(currentPosting?.emoji || "💼")} ${escapeJobsAppHtml(currentPosting?.title || "직장지원")}</div>
        <div class="phone-job-status-body">${escapeJobsAppHtml((viewModel.careerOutcome.lastLines || []).join(" "))}</div>
      </section>
    `);
  } else if (career.status === "applied" && Number.isFinite(career.resultDay) && career.resultDay > viewModel.day) {
    cards.push(`
      <section class="phone-job-status-card is-booked">
        <div class="phone-job-status-label">
          <span>CAREER REVIEW</span>
          <span>DAY ${String(career.resultDay).padStart(2, "0")}</span>
        </div>
        <div class="phone-job-status-title">${escapeJobsAppHtml(currentPosting?.emoji || "💼")} ${escapeJobsAppHtml(currentPosting?.title || "직장지원")}</div>
        <div class="phone-job-status-body">지원서는 접수됐다. 결과는 다음 날 확인할 수 있다.</div>
      </section>
    `);
  } else if (career.status === "employed") {
    cards.push(`
      <section class="phone-job-status-card is-booked">
        <div class="phone-job-status-label">
          <span>CAREER ACTIVE</span>
          <span>OPEN</span>
        </div>
        <div class="phone-job-status-title">${escapeJobsAppHtml(currentPosting?.emoji || "💼")} ${escapeJobsAppHtml(currentPosting?.title || "직장지원")}</div>
        <div class="phone-job-status-body">장기 루트가 열린 상태다. 더 좋은 공고가 풀리기 시작했다.</div>
      </section>
    `);
  }

  return cards.join("");
}

function buildCareerJobsContent(viewModel) {
  const careerStatusCards = buildCareerStatusCards(viewModel);
  const offerCards = viewModel.careerOffers.map((offer, index) => {
    const disabledReason = viewModel.career.status === "employed"
      ? "이미 장기 근무 루트가 열린 상태입니다."
      : viewModel.career.status === "applied"
        ? "심사 결과가 나올 때까지는 새 직장지원을 넣을 수 없습니다."
        : viewModel.careerApplicationDoneToday
          ? "오늘은 이미 직장지원을 넣었습니다."
          : (!offer.eligible ? `필요 조건: ${offer.unmetRequirements.join(", ")}` : "");
    const disabled = !viewModel.careerCanApply || !offer.eligible;
    const buttonLabel = viewModel.career.status === "employed"
      ? "재직중"
      : viewModel.career.status === "applied"
        ? "심사중"
        : viewModel.careerApplicationDoneToday
          ? "내일 지원"
          : offer.eligible
            ? "지원"
            : "조건 부족";

    return `
      <article class="phone-job-card">
        <div class="phone-job-card-top">
          <div class="phone-job-card-title">${escapeJobsAppHtml(offer.emoji)} ${escapeJobsAppHtml(offer.title)}</div>
          <div class="phone-job-pay">${formatJobsAppPercent(offer.successChance)}</div>
        </div>
        <div class="phone-job-meta">
          <div class="phone-job-tags">
            ${(offer.requirementTags || []).map((tag) => `<span class="phone-job-tag">${escapeJobsAppHtml(tag)}</span>`).join("")}
          </div>
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
    ${offerCards || '<div class="phone-job-empty">지금 열려 있는 직장지원 공고가 없습니다.</div>'}
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
        certifications: { driverLicense: false, computerCert: false },
        careerApplicationDoneToday: false,
        careerCanApply: typeof canApplyForCareerOffer === "function" ? canApplyForCareerOffer() : false,
      };

  const trackTitle = viewModel.activeTrack === "career" ? "직장지원" : "단기알바";
  const contentMarkup = viewModel.activeTrack === "career"
    ? buildCareerJobsContent(viewModel)
    : buildShortTermJobsContent(viewModel);

  return `
    <div class="phone-app-screen-top ${stageMode ? "is-stage-mode" : ""}">
      <div class="phone-app-screen-copy">
        <div class="phone-app-screen-title">${escapeJobsAppHtml(trackTitle)}</div>
      </div>
      ${showHomeButton ? '<button class="phone-app-mini-btn" type="button" data-phone-action="close-phone-view">홈</button>' : ""}
    </div>
    ${buildJobsAppTrackTabs(viewModel.activeTrack)}
    ${contentMarkup}
  `;
}
