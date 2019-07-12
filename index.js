#!/usr/bin/env node
(async () => {
  const fs = require('fs');
  const url = require('url');
  const path = require('path');
  const http = require('http');
  const net = require('net');
  const cproc = require('child_process');
  const ws = require('ws');
  const port = () =>
    new Promise(res => {
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
  const filePort = await port();
  const subPort = await port();
  const reloadPort = await port();
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

    const once = () =>
      new Promise(resolve => {
        let handler = ({ data }) => {
          socket.removeEventListener('message', handler);
          resolve(data);
        };
        socket.addEventListener('message', handler);
      });

    async function* getResponse() {
      while (true) yield await once();
    }

    return cb =>
      new Promise((res, rej) => {
        socket.addEventListener('close', e =>
          e.code === 1011 ? rej(e) : res(e)
        );
        (async () => {
          for await (const response of getResponse()) cb(response, off);
        })();
      });
  };

  const reloadScript = `
  <script>
    (() => {
      let reloading = false;
      const source = new WebSocket('ws://localhost:${reloadPort}');
      source.addEventListener('message', e => {
        if (e.data === 'reload') {
          reloading = true;
          location.reload(true);
        }
        e.data === 'close' && window.close();
      });
      addEventListener('keydown', e => {
        if (e.key === 'r' && e.metaKey) { reloading = true; }
      })
      const __SUB_PORT__ = ${subPort};
      window.glu = ${glu.toString()}
      window.onbeforeunload = e => { !reloading && source.send('SIGINT') }
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

  let fileWatcher;
  let sigIntHandler;

  new ws.Server({ port: reloadPort }).on('connection', socket => {
    // Close the browser upon ctrl+c in terminal
    sigIntHandler = () => {
      socket.send('close');
      socket.close(1011, 'SIGINT');
      setTimeout(process.exit, 0);
    };
    // Watch the target directory for changes and trigger reload
    fileWatcher && fileWatcher.close();
    fileWatcher = fs.watch(path.join(cwd, root), { recursive: true }, () =>
      socket.send('reload')
    );
    // Listen for window closing
    socket.on('message', body => body === 'SIGINT' && sigIntHandler());
  });

  process.on('SIGINT', () => sigIntHandler());

  // ----------------------------------
  // Start command running server
  // ----------------------------------

  new ws.Server({ port: subPort }).on('connection', socket => {
    socket.on('message', body => {
      const [cmd, ...args] = body.split(' ');
      let proc = cproc.spawn(cmd, args);

      ['stdout', 'stderr'].map(channel =>
        proc[channel].on('data', out => socket.send(out.toString()))
      );

      socket.on('close', () => !!proc && proc.kill('SIGINT'));
      proc.on('close', (code, signal) => {
        proc = null;
        socket.close(code > 0 ? 1011 : 1000, `${signal}`);
      });
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
    .listen(parseInt(filePort, 10));

  // ----------------------------------
  // Log startup details to terminal
  // ----------------------------------

  console.log(
    `\n 🗂  Serving files from ./${root} on http://localhost:${filePort}`
  );
  console.log(` 🖥  Using ${fallback} as the fallback for route requests`);
  console.log(` ♻️  Reloading the browser when files under ./${root} change`);

  // ----------------------------------
  // Open the page in the default browser
  // ----------------------------------

  cproc.exec(
    `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --app='http://localhost:${filePort}'`
  );
})();
