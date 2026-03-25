const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");

const parseTargets = [
  "js/logic.js",
  "js/ui.js",
  "js/systems/ranking-service.js",
  "js/apps/jobs/jobs-app-state.js",
  "js/devices/phone/phone-session.js",
  "js/systems/world/world-runtime-service.js",
];

const textChecks = [
  {
    label: "legacy unused helpers removed",
    file: "js/logic.js",
    test: (text) => !text.includes("unusedLegacy"),
    failMessage: "`js/logic.js` still contains `unusedLegacy` helpers.",
  },
  {
    label: "legacy ranking helper removed",
    file: "js/ui.js",
    test: (text) => !text.includes("unusedLegacy"),
    failMessage: "`js/ui.js` still contains a legacy helper.",
  },
  {
    label: "single ranking screen renderer",
    file: "js/ui.js",
    test: (text) => (text.match(/function showRankingScreen\s*\(/g) || []).length === 1,
    failMessage: "`showRankingScreen` should be defined exactly once in `js/ui.js`.",
  },
  {
    label: "ranking service keeps latest browser entry",
    file: "js/systems/ranking-service.js",
    test: (text) => text.includes("const identityKey = getRankingIdentityKey();")
      && !text.includes("const shouldUpdate ="),
    failMessage: "`submitRanking()` should overwrite the current browser entry instead of skipping lower or tied runs.",
  },
  {
    label: "ranking restart does not delete saved entry",
    file: "js/systems/ranking-service.js",
    test: (text) => !text.includes('closest("#ranking-restart-btn")')
      && !text.includes("deleteCurrentRankingEntry"),
    failMessage: "Restarting from the ranking screen should not delete the saved leaderboard entry.",
  },
  {
    label: "save scene sanitizer exists",
    file: "js/logic.js",
    test: (text) => text.includes("function buildPersistenceSceneFrame("),
    failMessage: "Save-state sanitizer helper is missing from `js/logic.js`.",
  },
  {
    label: "restore payload normalizer exists",
    file: "js/logic.js",
    test: (text) => text.includes("function resolveRestoredStatePayload("),
    failMessage: "Restore-state payload normalizer is missing from `js/logic.js`.",
  },
  {
    label: "save set fallback exists",
    file: "js/logic.js",
    test: (text) => text.includes("currentState?.activeJobs instanceof Set")
      && text.includes("currentState?.seenIncidents instanceof Set"),
    failMessage: "Save-state Set fallback for active jobs / incidents is missing from `js/logic.js`.",
  },
  {
    label: "plastic surgery consultation exists",
    file: "js/logic.js",
    test: (text) => text.includes("function openPlasticSurgeryConsultation(")
      && text.includes("function performPlasticSurgeryPlan("),
    failMessage: "Plastic surgery consultation flow helpers are missing from `js/logic.js`.",
  },
  {
    label: "plastic surgery scene renderer exists",
    file: "js/ui.js",
    test: (text) => text.includes("function renderPlasticSurgeryScene("),
    failMessage: "Plastic surgery scene renderer is missing from `js/ui.js`.",
  },
  {
    label: "global hidden fallback exists",
    file: "css/components.css",
    test: (text) => /\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/m.test(text),
    failMessage: "Global `[hidden]` fallback is missing from `css/components.css`.",
  },
  {
    label: "start screen continue button defaults hidden",
    file: "index.html",
    test: (text) => /id=\"continue-button\"[^>]*hidden/.test(text),
    failMessage: "`continue-button` should default to hidden in `index.html`.",
  },
  {
    label: "spoon confirm button defaults hidden",
    file: "index.html",
    test: (text) => /id=\"spd-start-btn\"[^>]*hidden/.test(text),
    failMessage: "`spd-start-btn` should default to hidden in `index.html`.",
  },
];

let failed = false;

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function logPass(message) {
  console.log(`PASS ${message}`);
}

function logFail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

for (const relativePath of parseTargets) {
  try {
    new Function(readRepoFile(relativePath));
    logPass(`parse ${relativePath}`);
  } catch (error) {
    logFail(`parse ${relativePath}: ${error.message}`);
  }
}

for (const check of textChecks) {
  try {
    const fileText = readRepoFile(check.file);
    if (check.test(fileText)) {
      logPass(check.label);
    } else {
      logFail(check.failMessage);
    }
  } catch (error) {
    logFail(`${check.label}: ${error.message}`);
  }
}

const requiredAssetPaths = [
  "assets/backgrounds/day01/baegeum-hospital-recovery.png",
];

for (const relativePath of requiredAssetPaths) {
  if (fs.existsSync(path.join(repoRoot, relativePath))) {
    logPass(`asset ${relativePath}`);
  } else {
    logFail(`Missing required asset: ${relativePath}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("Core smoke checks passed.");
