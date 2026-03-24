function cloneJobsOfferSnapshot(offer) {
  return offer
    ? {
        ...offer,
        requirementTags: [...(offer.requirementTags || [])],
        unmetRequirements: [...(offer.unmetRequirements || [])],
      }
    : null;
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

function createDefaultCareerStatus() {
  return {
    status: "idle",
    postingId: "",
    appliedDay: null,
    resultDay: null,
    employedJobId: "",
    lastOutcomeDay: null,
    lastOutcome: "",
    lastLines: [],
    resultChance: null,
  };
}

function sanitizeCareerPrepSnapshot(prep = {}) {
  const defaults = {
    service: 0,
    labor: 0,
    office: 0,
    academic: 0,
  };

  return Object.fromEntries(
    Object.keys(defaults).map((key) => [
      key,
      Math.max(0, Math.round(Number(prep[key] ?? defaults[key]) || 0)),
    ]),
  );
}

function sanitizeCertificationSnapshot(certifications = {}) {
  const defaults = {
    driverLicense: false,
    computerCert: false,
    universityDegree: false,
  };

  return Object.fromEntries(
    Object.keys(defaults).map((key) => [key, Boolean(certifications[key])]),
  );
}

function cloneCareerStatusSnapshot(career) {
  const defaults = createDefaultCareerStatus();
  return {
    ...defaults,
    ...(career || {}),
    lastLines: [...((career && career.lastLines) || [])],
    resultChance: Number.isFinite(career?.resultChance) ? career.resultChance : null,
  };
}

function cloneCareerOfferSnapshot(offer) {
  return offer
    ? {
        ...offer,
        requiredCerts: [...(offer.requiredCerts || [])],
        requirementTags: [...(offer.requirementTags || [])],
        unmetRequirements: [...(offer.unmetRequirements || [])],
      }
    : null;
}

function clearLegacyJobsAliases(targetState) {
  if (!targetState || typeof targetState !== "object") {
    return;
  }

  delete targetState.dayOffers;
  delete targetState.nextDayShift;
  delete targetState.interviewResult;
  delete targetState.jobApplicationDoneToday;
}

function createDefaultJobsState() {
  return {
    dailyOffers: [],
    scheduledShift: null,
    interviewResult: null,
    applicationDoneToday: false,
    activeTrack: "short-term",
    careerOffers: [],
    career: createDefaultCareerStatus(),
    careerPrep: sanitizeCareerPrepSnapshot(),
    certifications: sanitizeCertificationSnapshot(),
    careerApplicationDoneToday: false,
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
  const legacyDailyOffers = Array.isArray(targetState.dayOffers)
    ? targetState.dayOffers.map(cloneJobsOfferSnapshot)
    : null;
  const legacyScheduledShift = cloneScheduledShiftSnapshot(targetState.nextDayShift);
  const legacyInterviewResult = cloneInterviewResultSnapshot(targetState.interviewResult);
  const legacyApplicationDoneToday = typeof targetState.jobApplicationDoneToday === "boolean"
    ? targetState.jobApplicationDoneToday
    : null;
  const resolved = {
    dailyOffers: legacyDailyOffers
      || (Array.isArray(nested.dailyOffers) ? nested.dailyOffers.map(cloneJobsOfferSnapshot) : defaults.dailyOffers),
    scheduledShift: legacyScheduledShift
      || cloneScheduledShiftSnapshot(nested.scheduledShift)
      || defaults.scheduledShift,
    interviewResult: legacyInterviewResult
      || cloneInterviewResultSnapshot(nested.interviewResult)
      || defaults.interviewResult,
    applicationDoneToday: legacyApplicationDoneToday != null
      ? legacyApplicationDoneToday
      : (typeof nested.applicationDoneToday === "boolean" ? nested.applicationDoneToday : defaults.applicationDoneToday),
    activeTrack: nested.activeTrack === "career" ? "career" : defaults.activeTrack,
    careerOffers: Array.isArray(nested.careerOffers) && nested.careerOffers.length
      ? nested.careerOffers.map(cloneCareerOfferSnapshot)
      : (typeof buildCareerOffersForState === "function"
        ? buildCareerOffersForState(targetState)
        : defaults.careerOffers),
    career: cloneCareerStatusSnapshot(nested.career),
    careerPrep: sanitizeCareerPrepSnapshot(nested.careerPrep),
    certifications: sanitizeCertificationSnapshot(nested.certifications),
    careerApplicationDoneToday: typeof nested.careerApplicationDoneToday === "boolean"
      ? nested.careerApplicationDoneToday
      : defaults.careerApplicationDoneToday,
  };

  targetState.jobs = resolved;
  clearLegacyJobsAliases(targetState);

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
    activeTrack: patch.activeTrack === "career" ? "career" : (patch.activeTrack === "short-term" ? "short-term" : current.activeTrack),
    careerOffers: Object.prototype.hasOwnProperty.call(patch, "careerOffers")
      ? (Array.isArray(patch.careerOffers) ? patch.careerOffers.map(cloneCareerOfferSnapshot) : [])
      : current.careerOffers.map(cloneCareerOfferSnapshot),
    career: Object.prototype.hasOwnProperty.call(patch, "career")
      ? cloneCareerStatusSnapshot({ ...current.career, ...(patch.career || {}) })
      : cloneCareerStatusSnapshot(current.career),
    careerPrep: Object.prototype.hasOwnProperty.call(patch, "careerPrep")
      ? sanitizeCareerPrepSnapshot({ ...current.careerPrep, ...(patch.careerPrep || {}) })
      : sanitizeCareerPrepSnapshot(current.careerPrep),
    certifications: Object.prototype.hasOwnProperty.call(patch, "certifications")
      ? sanitizeCertificationSnapshot({ ...current.certifications, ...(patch.certifications || {}) })
      : sanitizeCertificationSnapshot(current.certifications),
    careerApplicationDoneToday: Object.prototype.hasOwnProperty.call(patch, "careerApplicationDoneToday")
      ? Boolean(patch.careerApplicationDoneToday)
      : current.careerApplicationDoneToday,
  };

  targetState.jobs = next;
  clearLegacyJobsAliases(targetState);

  return next;
}

function setJobsActiveTrack(track, targetState = state) {
  if (track !== "career" && track !== "short-term") {
    return getJobsDomainState(targetState);
  }

  return patchJobsDomainState(targetState, { activeTrack: track });
}

function createJobsAppViewModel(targetState = state) {
  const jobsState = getJobsDomainState(targetState);
  const careerOutcome = jobsState.career.lastOutcomeDay === targetState.day
    ? cloneCareerStatusSnapshot(jobsState.career)
    : null;

  return {
    day: targetState.day,
    activeTrack: jobsState.activeTrack,
    offers: jobsState.dailyOffers.map(cloneJobsOfferSnapshot),
    bookedShift: cloneScheduledShiftSnapshot(jobsState.scheduledShift),
    result: jobsState.interviewResult && jobsState.interviewResult.day === targetState.day
      ? cloneInterviewResultSnapshot(jobsState.interviewResult)
      : null,
    applicationDoneToday: jobsState.applicationDoneToday,
    canApply: typeof canApplyForJobOffer === "function" ? canApplyForJobOffer(targetState) : false,
    careerOffers: jobsState.careerOffers.map(cloneCareerOfferSnapshot),
    career: cloneCareerStatusSnapshot(jobsState.career),
    careerOutcome,
    careerPrep: sanitizeCareerPrepSnapshot(jobsState.careerPrep),
    certifications: sanitizeCertificationSnapshot(jobsState.certifications),
    careerApplicationDoneToday: jobsState.careerApplicationDoneToday,
    careerCanApply: typeof canApplyForCareerOffer === "function" ? canApplyForCareerOffer(targetState) : false,
  };
}
