import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT ?? 8080);
const host = "127.0.0.1";
const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".md", "text/plain; charset=utf-8"],
]);

function isInsideRoot(filePath) {
  const relative = path.relative(root, filePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}`);
  let filePath = path.join(root, decodeURIComponent(url.pathname));

  if (!isInsideRoot(filePath)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    const data = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": types.get(path.extname(filePath)) ?? "application/octet-stream",
    });
    response.end(data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, host, () => {
  console.log(`mathgame local server: http://${host}:${port}/`);
});
