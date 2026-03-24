const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = Math.max(1, Number(process.argv[2]) || 4173);

const mimeTypes = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  webp: "image/webp",
  ico: "image/x-icon",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};

const server = http.createServer((req, res) => {
  const requestPath = String((req.url || "/").split("?")[0] || "/");
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.join(root, decodeURIComponent(normalizedPath.replace(/^\/+/, "")));

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.statusCode = 404;
      res.end("not found");
      return;
    }

    const extension = path.extname(filePath).slice(1).toLowerCase();
    res.setHeader("Content-Type", mimeTypes[extension] || "application/octet-stream");
    res.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`MammonCity static server listening on http://127.0.0.1:${port}`);
});
