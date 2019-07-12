#!/usr/bin/env node
(async () => {
  const fs = require('fs');
  const url = require('url');
  const path = require('path');
  const http = require('http');
  const net = require('net');
  const cproc = require('child_process');
  const ws = require('ws');

  const getPort = () =>
    new Promise((res, rej) => {
      const s = net.createServer().listen(0, () => {
        const { port } = s.address();
        s.close(() => res(port));
      });
    });

  // ----------------------------------
  // Generate map of all known mimetypes
  // ----------------------------------

  const mime = Object.entries(require('./types.json')).reduce(
    (all, [type, exts]) =>
      Object.assign(all, ...exts.map(ext => ({ [ext]: type }))),
    {}
  );

  // ----------------------------------
  // Parse arguments from the command line
  // ----------------------------------

  const args = process.argv.slice(2).filter(x => !~x.indexOf('--'));

  const root = args[0] || '.';
  const fallback = args[1] || 'index.html';
  const port = await getPort();
  const subPort = await getPort();
  const reloadPort = await getPort();
  const init = !!~process.argv.indexOf('--init');
  const cwd = process.cwd();

  // ----------------------------------
  // Create an example app if --init
  // ----------------------------------

  if (init) {
    const id = `glu-${Math.random()
      .toString(16)
      .replace('0.', '')
      .slice(5)}`;
    cproc.execSync(
      `mkdir ${id} && cp ${__dirname}/example/* ${id} && cd ${id} && glu`
    );
    return;
  }

  // ----------------------------------
  // Template clientside reload script
  // ----------------------------------

  const glu = body => {
    const socket = new WebSocket(`ws://localhost:${__SUB_PORT__}`);
    const off = () => socket.close();
    socket.addEventListener('open', () => socket.send(body));

    const once = () => {
      return new Promise(resolve => {
        let handler = ({ data }) =>
          socket.removeEventListener('message', handler) || resolve(data);
        socket.addEventListener('message', handler);
      });
    };

    async function* getResponse() {
      while (true) yield await once();
    }

    return cb => {
      return new Promise((res, rej) => {
        socket.addEventListener('close', e =>
          e.code === 1011 ? rej(e) : res(e)
        );
        (async () => {
          for await (const response of getResponse()) cb(response, off);
        })();
      });
    };
  };

  const reloadScript = `
  <script>
    (() => {
      const source = new EventSource('http://localhost:${reloadPort}');
      source.onmessage = e => {
        e.data === 'reload' && location.reload(true);
        e.data === 'close' && window.close();
      }
      const __SUB_PORT__ = ${subPort};
      window.glu = ${glu.toString()}
      window.onunload = e => {
        glu('SIGINT')();
        let start = Date.now(), now = start;
        while (now - start < 10) { now = Date.now() }
      }
    })();
  </script>
`;

  // ----------------------------------
  // Server utility functions
  // ----------------------------------

  const sendError = (res, resource, status) => {
    res.writeHead(status);
    res.end();
    console.log(' \x1b[41m', status, '\x1b[0m', `${resource}`);
  };

  const sendFile = (res, resource, status, file, ext) => {
    res.writeHead(status, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(file, 'binary');
    res.end();
    console.log(' \x1b[42m', status, '\x1b[0m', `${resource}`);
  };

  const sendMessage = (res, channel, data) => {
    res.write(`event: ${channel}\nid: 0\ndata: ${data}\n`);
    res.write('\n\n');
  };

  const isRouteRequest = uri =>
    uri
      .split('/')
      .pop()
      .indexOf('.') === -1
      ? true
      : false;

  // ----------------------------------
  // Start file watching server
  // ----------------------------------

  http
    .createServer((req, res) => {
      // Open the event stream for live reload
      res.writeHead(200, {
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      // Send an initial ack event to stop request pending
      sendMessage(res, 'connected', 'listening');
      // Send a ping event every minute to prevent console errors
      setInterval(sendMessage, 60000, res, 'ping', 'waiting');
      // Watch the target directory for changes and trigger reload
      fs.watch(path.join(cwd, root), { recursive: true }, () =>
        sendMessage(res, 'message', 'reload')
      );
      // Close the browser upon ctrl+c in terminal
      process.on('SIGINT', () => {
        sendMessage(res, 'message', 'close');
        setTimeout(process.exit, 0);
      });
    })
    .listen(parseInt(reloadPort, 10));

  // ----------------------------------
  // Start command running server
  // ----------------------------------

  new ws.Server({ port: subPort }).on('connection', socket => {
    socket.on('message', body => {
      if (body === 'SIGINT') process.exit();
      const [cmd, ...args] = body.split(' ');
      const proc = require('child_process').spawn(cmd, args);
      ['stdout', 'stderr'].map(channel =>
        proc[channel].on('data', out => socket.send(out.toString()))
      );

      proc.on('close', (code, signal) =>
        socket.close(code === 1 ? 1011 : 1000, `${signal}`)
      );
    });
  });

  // ----------------------------------
  // Start static file server
  // ----------------------------------

  http
    .createServer((req, res) => {
      const pathname = url.parse(req.url).pathname;
      const isRoute = isRouteRequest(pathname);
      const status = isRoute && pathname !== '/' ? 301 : 200;
      const resource = isRoute ? `/${fallback}` : decodeURI(pathname);
      const uri = path.join(cwd, root, resource);
      const ext = uri.replace(/^.*[\.\/\\]/, '').toLowerCase();
      isRoute && console.log('\n \x1b[44m', 'RELOADING', '\x1b[0m\n');
      // Check if files exists at the location
      fs.stat(uri, (err, stat) => {
        if (err) return sendError(res, resource, 404);
        // Respond with the contents of the file
        fs.readFile(uri, 'binary', (err, file) => {
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

  cproc.exec(
    `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --app='http://localhost:${port}'`
  );
})();
