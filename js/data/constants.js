const BASE_STAMINA = 100;
const BASE_ENERGY = 100;
// 업데이트마다 조금씩 늘릴 것 (현재: 12턴 / 목표: 30턴)
const MAX_TURNS = 12;
const MAX_DAYS = MAX_TURNS;
const TIME_SLOT_MINUTES = 30;
const DAY_START_TIME_SLOT = 16;
const DAY_END_TIME_SLOT = 48;
const SLEEP_STAMINA_MAX = 100;
const SLEEP_STAMINA_GAIN = 10;
const ENERGY_MAX = 100;
const SLEEP_ENERGY_GAIN = 10;
const LEGACY_HUNGER_MAX = 3;
const LEGACY_HUNGER_DECAY_INTERVAL_MINUTES = 7 * 60;
const LEGACY_HUNGER_V2_MAX = 5;
const LEGACY_HUNGER_V2_DECAY_INTERVAL_MINUTES = 4.5 * 60;
const HUNGER_SYSTEM_VERSION = 3;
const HUNGER_MAX = 100;
const HUNGER_DECAY_INTERVAL_MINUTES = 30;
const HUNGER_HOSPITAL_COST = 100000;

const RANK_TABLE = [
  { min: 2800000, label: "S", title: "배금도시 전설", comment: "돈 냄새를 제일 빨리 맡는 사람으로 기록됐다." },
  { min: 2300000, label: "A", title: "현실 감각 장인", comment: "어지간한 하루짜리 공고는 다 돈으로 바꿔 냈다." },
  { min: 1800000, label: "B", title: "생존형 알바러", comment: "흔들리면서도 꾸준히 손에 쥐는 법을 익혔다." },
  { min: 1300000, label: "C", title: "버티는 중", comment: "비틀거리긴 했지만 끝까지 살아남긴 했다." },
  { min: 0, label: "D", title: "다시 뛰어야 함", comment: "이번 달은 몸만 굴렀고 손에 남은 건 적었다." },
];

function normalizeTurnNumber(turn = 1) {
  return Math.max(1, Math.floor(Number(turn) || 1));
}

function formatTurnLabel(turn = 1) {
  return `${normalizeTurnNumber(turn)}턴`;
}

function formatTurnProgress(currentTurn = 1, totalTurns = MAX_DAYS) {
  return `${normalizeTurnNumber(currentTurn)}/${normalizeTurnNumber(totalTurns)}`;
}

function formatTurnBadge(turn = 1) {
  return `TURN ${String(normalizeTurnNumber(turn)).padStart(2, "0")}`;
}
