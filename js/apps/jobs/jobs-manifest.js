function getJobsAppManifest(targetState = state) {
  return {
    id: "jobs",
    label: "공고",
    icon: "💼",
    openRoute: "jobs/home",
    installable: true,
    storeCategory: "생활",
    storeDescription: "오늘의 알바 공고를 확인하고 바로 지원할 수 있습니다.",
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
