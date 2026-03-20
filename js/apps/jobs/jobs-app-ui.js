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

function buildJobsAppScreenMarkup({ showHomeButton = true, stageMode = false } = {}) {
  const viewModel = typeof createJobsAppViewModel === "function"
    ? createJobsAppViewModel(state)
    : {
        day: state.day,
        offers: Array.isArray(state.dayOffers) ? state.dayOffers : [],
        bookedShift: state.nextDayShift || null,
        result: state.interviewResult && state.interviewResult.day === state.day ? state.interviewResult : null,
        applicationDoneToday: Boolean(state.jobApplicationDoneToday),
        canApply: typeof canApplyForJobOffer === "function" ? canApplyForJobOffer() : false,
      };

  const offerCards = viewModel.offers.map((offer, index) => {
    const job = JOB_LOOKUP[offer.jobId];
    const tags = (job.tags || []).slice(0, 2).map((tag) => `<span class="phone-job-tag">${escapeJobsAppHtml(tag)}</span>`).join("");
    const disabledReason = viewModel.bookedShift
      ? "예약된 출근이 있습니다."
      : viewModel.applicationDoneToday
        ? "오늘은 이미 지원했습니다."
        : "";

    return `
      <article class="phone-job-card">
        <div class="phone-job-card-top">
          <div class="phone-job-card-title">${escapeJobsAppHtml(job.emoji)} ${escapeJobsAppHtml(job.title)}</div>
          <div class="phone-job-pay">${formatJobsAppCash(offer.pay)}</div>
        </div>
        <div class="phone-job-card-body">${escapeJobsAppHtml(job.description || "오늘 바로 연결되는 단기 공고입니다.")}</div>
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
          ${dueToday ? "오늘은 이 근무로 출근할 수 있습니다." : `${viewModel.bookedShift.day}일차 출근이 예약되어 있습니다.`}
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
    <div class="phone-app-screen-top ${stageMode ? "is-stage-mode" : ""}">
      <div class="phone-app-screen-copy">
        <span class="phone-app-screen-kicker">JOB APP</span>
        <div class="phone-app-screen-title">오늘의 공고</div>
        <div class="phone-app-screen-note">공고를 보고 지원하면 면접 결과가 바로 도착합니다.</div>
      </div>
      ${showHomeButton ? '<button class="phone-app-mini-btn" type="button" data-phone-action="close-phone-view">홈</button>' : ""}
    </div>
    ${statusCards.join("")}
    ${offerCards || '<div class="phone-job-empty">오늘 확인할 공고가 없습니다.</div>'}
  `;
}
