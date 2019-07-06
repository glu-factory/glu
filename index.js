#!/usr/bin/env node

const fs = require("fs");
const url = require("url");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

// ----------------------------------
// Generate map of all known mimetypes
// ----------------------------------

const mime = Object.entries(require("./types.json")).reduce(
  (all, [type, exts]) =>
    Object.assign(all, ...exts.map(ext => ({ [ext]: type }))),
  {}
);

// ----------------------------------
// Parse arguments from the command line
// ----------------------------------

const defaults = {
  root: ".",
  fallback: "index.html",
  port: 8080,
  cmdPort: 6969,
  subPort: 1337,
  reloadPort: 5000,
  browser: "yes"
};

const input = process.argv.slice(2).join(" ");
// Extract positional arguments
const args = input
  .replace(/--([^\s]*)\s[^\s]*(\s)?/g, "")
  .trim()
  .split(" ");
// Extract named arguments
const named = (input.match(/--([^\s]*)\s[^\s]*/g, "") || []).reduce((a, b) => {
  const [key, value] = b.split(" ");
  return Object.assign(a, { [key.replace("--", "")]: value });
}, {});

const options = Object.entries(defaults).reduce(
  (opts, [key, val], i) =>
    Object.assign(opts, { [key]: named[key] || args[i] || val }),
  {}
);

const { root, fallback, port, reloadPort, browser, cmdPort, subPort } = options;
const cwd = process.cwd();

// ----------------------------------
// Template clientside reload script
// ----------------------------------

const reloadScript = `
  <script>
    const source = new EventSource('http://localhost:${reloadPort}');
    source.onmessage = e => location.reload(true);
    window.glu = {
        run: body => fetch('http://localhost:${cmdPort}', { method: 'POST', body }).then(res => res.text()),
        sub: (cmd, cb) => {
            const socket = new WebSocket('ws://localhost:${subPort}');
            socket.addEventListener('message', ({ data }) => cb(data));
            socket.addEventListener('open', () => socket.send(cmd));
        }
    }
  </script>
`;

// ----------------------------------
// Server utility functions
// ----------------------------------

const sendError = (res, resource, status) => {
  res.writeHead(status);
  res.end();
  console.log(" \x1b[41m", status, "\x1b[0m", `${resource}`);
};

const sendFile = (res, resource, status, file, ext) => {
  res.writeHead(status, {
    "Content-Type": mime[ext] || "application/octet-stream",
    "Access-Control-Allow-Origin": "*"
  });
  res.write(file, "binary");
  res.end();
  console.log(" \x1b[42m", status, "\x1b[0m", `${resource}`);
};

const sendMessage = (res, channel, data) => {
  res.write(`event: ${channel}\nid: 0\ndata: ${data}\n`);
  res.write("\n\n");
};

const isRouteRequest = uri =>
  uri
    .split("/")
    .pop()
    .indexOf(".") === -1
    ? true
    : false;

// ----------------------------------
// Start file watching server
// ----------------------------------

http
  .createServer((request, res) => {
    // Open the event stream for live reload
    res.writeHead(200, {
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*"
    });
    // Send an initial ack event to stop request pending
    sendMessage(res, "connected", "awaiting change");
    // Send a ping event every minute to prevent console errors
    setInterval(sendMessage, 60000, res, "ping", "still waiting");
    // Watch the target directory for changes and trigger reload
    fs.watch(path.join(cwd, root), { recursive: true }, () =>
      sendMessage(res, "message", "reloading page")
    );
  })
  .listen(parseInt(reloadPort, 10));

// ----------------------------------
// Start command running server
// ----------------------------------

http
  .createServer((req, res) => {
    res.writeHead(200, {
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*"
    });
    req.on("data", cmd => {
      let stdout;
      try {
        stdout = require("child_process").execSync(cmd.toString());
      } catch (e) {
        stdout = e.toString();
      }
      res.end(stdout);
    });
  })
  .listen(parseInt(cmdPort, 10));

// ----------------------------------
// Start command watching server
// ----------------------------------

new WebSocket.Server({ port: subPort }).on("connection", socket => {
  socket.on("message", body => {
    const [cmd, ...args] = body.split(" ");
    const proc = require("child_process").spawn(cmd, args);
    proc.stdout.on("data", stdout => socket.send(stdout.toString()));
    proc.on("error", e => socket.send(e.toString()));
  });
});

// ----------------------------------
// Start static file server
// ----------------------------------

http
  .createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;
    const isRoute = isRouteRequest(pathname);
    const status = isRoute && pathname !== "/" ? 301 : 200;
    const resource = isRoute ? `/${fallback}` : decodeURI(pathname);
    const uri = path.join(cwd, root, resource);
    const ext = uri.replace(/^.*[\.\/\\]/, "").toLowerCase();
    isRoute && console.log("\n \x1b[44m", "RELOADING", "\x1b[0m\n");
    // Check if files exists at the location
    fs.stat(uri, (err, stat) => {
      if (err) return sendError(res, resource, 404);
      // Respond with the contents of the file
      fs.readFile(uri, "binary", (err, file) => {
        if (err) return sendError(res, resource, 500);
        if (isRoute) file = reloadScript + file;
        sendFile(res, resource, status, file, ext);
      });
    });
  })
  .listen(parseInt(port, 10));

// ----------------------------------
// Log startup details to terminal
// ----------------------------------

console.log(`\n 🗂  Serving files from ./${root} on http://localhost:${port}`);
console.log(` 🖥  Using ${fallback} as the fallback for route requests`);
console.log(` ♻️  Reloading the browser when files under ./${root} change`);

// ----------------------------------
// Open the page in the default browser
// ----------------------------------

// const page = `http://localhost:${port}`;
// const open =
//   process.platform == "darwin"
//     ? "open"
//     : process.platform == "win32"
//     ? "start"
//     : "xdg-open";

// browser !== "no" && require("child_process").exec(open + " " + page);

require("child_process").exec(
  `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --app='http://localhost:${port}'`
);
