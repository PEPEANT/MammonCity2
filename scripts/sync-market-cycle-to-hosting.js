const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");
const hostingRoot = path.resolve(projectRoot, "..", "Mammon.com");
const sourceFiles = [
  path.join(projectRoot, "js", "data", "economy", "economy-calendar.js"),
  path.join(projectRoot, "js", "systems", "economy", "economy-service.js"),
];
const outputPath = path.join(hostingRoot, "assets", "data", "market-cycle.json");

const context = {
  console,
  state: { day: 1 },
  MAX_DAYS: 12,
};

vm.createContext(context);

sourceFiles.forEach((filePath) => {
  const code = fs.readFileSync(filePath, "utf8");
  vm.runInContext(code, context, { filename: filePath });
});

if (typeof context.getEconomySnapshot !== "function") {
  throw new Error("getEconomySnapshot is not available after loading economy sources.");
}

const turns = Array.from({ length: context.MAX_DAYS }, (_, index) => {
  const snapshot = context.getEconomySnapshot(index + 1);
  return {
    turn: snapshot.day,
    monthLabel: snapshot.monthLabel,
    phaseLabel: snapshot.phaseLabel,
    phaseShortLabel: snapshot.phaseShortLabel,
    phaseTone: snapshot.phaseTone,
    fearGreed: snapshot.fearGreed,
    marketTrend: snapshot.marketTrend,
    volatilityLabel: snapshot.volatilityLabel,
    priceChangePercent: snapshot.priceChangePercent,
    stockBias: snapshot.stockBias,
    cryptoBias: snapshot.cryptoBias,
    safeAssetBias: snapshot.safeAssetBias,
    stockDirection: snapshot.stockDirection,
    cryptoDirection: snapshot.cryptoDirection,
    safeAssetDirection: snapshot.safeAssetDirection,
    newsPack: snapshot.newsPack,
  };
});

const payload = {
  cycleId: "annual-v1",
  totalTurns: turns.length,
  turns,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");

console.log(`Synced market cycle JSON to ${outputPath}`);
