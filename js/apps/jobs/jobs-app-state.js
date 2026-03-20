function cloneJobsOfferSnapshot(offer) {
  return offer ? { ...offer } : null;
}

function cloneScheduledShiftSnapshot(shift) {
  return shift?.offer
    ? {
        ...shift,
        offer: cloneJobsOfferSnapshot(shift.offer),
      }
    : null;
}

function cloneInterviewResultSnapshot(result) {
  return result?.offer
    ? {
        ...result,
        offer: cloneJobsOfferSnapshot(result.offer),
        lines: [...(result.lines || [])],
      }
    : null;
}

function createDefaultJobsState() {
  return {
    dailyOffers: [],
    scheduledShift: null,
    interviewResult: null,
    applicationDoneToday: false,
  };
}

function syncJobsDomainState(targetState = state) {
  if (!targetState) {
    return createDefaultJobsState();
  }

  const defaults = createDefaultJobsState();
  const nested = targetState.jobs && typeof targetState.jobs === "object"
    ? targetState.jobs
    : {};
  const resolved = {
    dailyOffers: Array.isArray(targetState.dayOffers)
      ? targetState.dayOffers.map(cloneJobsOfferSnapshot)
      : (Array.isArray(nested.dailyOffers) ? nested.dailyOffers.map(cloneJobsOfferSnapshot) : defaults.dailyOffers),
    scheduledShift: cloneScheduledShiftSnapshot(targetState.nextDayShift)
      || cloneScheduledShiftSnapshot(nested.scheduledShift)
      || defaults.scheduledShift,
    interviewResult: cloneInterviewResultSnapshot(targetState.interviewResult)
      || cloneInterviewResultSnapshot(nested.interviewResult)
      || defaults.interviewResult,
    applicationDoneToday: typeof targetState.jobApplicationDoneToday === "boolean"
      ? targetState.jobApplicationDoneToday
      : (typeof nested.applicationDoneToday === "boolean" ? nested.applicationDoneToday : defaults.applicationDoneToday),
  };

  targetState.jobs = resolved;
  targetState.dayOffers = resolved.dailyOffers.map(cloneJobsOfferSnapshot);
  targetState.nextDayShift = cloneScheduledShiftSnapshot(resolved.scheduledShift);
  targetState.interviewResult = cloneInterviewResultSnapshot(resolved.interviewResult);
  targetState.jobApplicationDoneToday = resolved.applicationDoneToday;

  return resolved;
}

function getJobsDomainState(targetState = state) {
  return syncJobsDomainState(targetState);
}

function patchJobsDomainState(targetState = state, patch = {}) {
  if (!targetState) {
    return createDefaultJobsState();
  }

  const current = syncJobsDomainState(targetState);
  const next = {
    ...current,
    ...patch,
    dailyOffers: Array.isArray(patch.dailyOffers)
      ? patch.dailyOffers.map(cloneJobsOfferSnapshot)
      : current.dailyOffers.map(cloneJobsOfferSnapshot),
    scheduledShift: Object.prototype.hasOwnProperty.call(patch, "scheduledShift")
      ? cloneScheduledShiftSnapshot(patch.scheduledShift)
      : cloneScheduledShiftSnapshot(current.scheduledShift),
    interviewResult: Object.prototype.hasOwnProperty.call(patch, "interviewResult")
      ? cloneInterviewResultSnapshot(patch.interviewResult)
      : cloneInterviewResultSnapshot(current.interviewResult),
    applicationDoneToday: Object.prototype.hasOwnProperty.call(patch, "applicationDoneToday")
      ? Boolean(patch.applicationDoneToday)
      : current.applicationDoneToday,
  };

  targetState.jobs = next;
  targetState.dayOffers = next.dailyOffers.map(cloneJobsOfferSnapshot);
  targetState.nextDayShift = cloneScheduledShiftSnapshot(next.scheduledShift);
  targetState.interviewResult = cloneInterviewResultSnapshot(next.interviewResult);
  targetState.jobApplicationDoneToday = next.applicationDoneToday;

  return next;
}

function createJobsAppViewModel(targetState = state) {
  const jobsState = getJobsDomainState(targetState);

  return {
    day: targetState.day,
    offers: jobsState.dailyOffers.map(cloneJobsOfferSnapshot),
    bookedShift: cloneScheduledShiftSnapshot(jobsState.scheduledShift),
    result: jobsState.interviewResult && jobsState.interviewResult.day === targetState.day
      ? cloneInterviewResultSnapshot(jobsState.interviewResult)
      : null,
    applicationDoneToday: jobsState.applicationDoneToday,
    canApply: typeof canApplyForJobOffer === "function" ? canApplyForJobOffer() : false,
  };
}
