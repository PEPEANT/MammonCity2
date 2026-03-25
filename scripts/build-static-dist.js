const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");

const entriesToCopy = [
  "index.html",
  "game.html",
  "css",
  "js",
  "assets",
];

function ensureCleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyEntry(relativePath) {
  const sourcePath = path.join(projectRoot, relativePath);
  const targetPath = path.join(distRoot, relativePath);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing build entry: ${relativePath}`);
  }

  const stat = fs.statSync(sourcePath);
  if (stat.isDirectory()) {
    fs.cpSync(sourcePath, targetPath, {
      recursive: true,
      force: true,
    });
    return;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

ensureCleanDir(distRoot);
entriesToCopy.forEach(copyEntry);

console.log(`Built static dist at ${path.relative(projectRoot, distRoot)}`);
