function getJobsAppManifest(targetState = state) {
  return {
    id: "jobs",
    label: "공고",
    homeLabel: "공고",
    icon: "💼",
    openRoute: "jobs/home",
    installable: true,
    storeCategory: "생활",
    storeDescription: "알바·직장 공고",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false } = {}) => (
      typeof buildJobsAppScreenMarkup === "function"
        ? buildJobsAppScreenMarkup({ showHomeButton: !stageMode, stageMode })
        : '<div class="phone-job-empty">공고 앱을 불러오지 못했습니다.</div>'
    ),
  };
}
