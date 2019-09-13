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

  const ignore = !!~process.argv.indexOf('--ignore');
  const root = args[0] || '.';
  const fallback = args[1] || 'index.html';
  const filePort = await port();
  const subPort = await port();
  const reloadPort = await port();

  // the current working directory,
  // i.e. the directory from which you invoked the `glu` command.
  const cwd = process.cwd();
  // the name of the directory we are serving `index.html` from
  const dirname = root.startsWith('/') ? root : path.join(process.cwd(), root);

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
          for await (const response of getResponse()) cb && cb(response, off);
        })();
      });
  };

  const reloadScript = `
  <script type="module">
    (() => {
      fetch('./manifest.json').then(res => res.json())
        .then(manifest => {
          if(manifest.dimensions) window.resizeTo(
            manifest.dimensions.width,
            manifest.dimensions.height
          )
        });
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
      window.__dirname = '${dirname}';
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
  let sigIntHandler = () => process.exit();

  new ws.Server({ port: reloadPort }).on('connection', socket => {
    // Close the browser upon ctrl+c in terminal
    sigIntHandler = () => {
      socket.send('close');
      socket.close(1011, 'SIGINT');
      setTimeout(process.exit, 0);
    };
    // Watch the target directory for changes and trigger reload
    fileWatcher && fileWatcher.close();
    fileWatcher = fs.watch(dirname, { recursive: true }, () =>
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
      let proc = cproc.spawn(cmd, args, {
        cwd
      });

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
      const uri = pathname.startsWith('/~')
        ? decodeURI(pathname).slice(2)
        : path.join(dirname, resource);
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
  // Update recent glu projects info
  // ----------------------------------
  const dataDir =
    process.env.APPDATA ||
    (process.platform == 'darwin'
      ? process.env.HOME + '/Library/Preferences'
      : process.env.HOME + '/.local/share') + '/glu';
  const dataFile = dataDir + '/projects.json';
  !fs.existsSync(dataDir) && fs.mkdirSync(dataDir);
  !fs.existsSync(dataFile) && fs.writeFileSync(dataFile, '{}');
  let projects = JSON.parse(fs.readFileSync(dataFile));
  // don't include ignored projects in recent projects list
  if (!ignore) {
    projects[dirname] = {
      ...projects[dirname],
      openTime: Date.now()
    };
  }
  fs.writeFileSync(dataFile, JSON.stringify(projects));

  // ----------------------------------
  // Log startup details to terminal
  // ----------------------------------

  console.log(
    `\n 🗂  Serving files from ${root} on http://localhost:${filePort}`
  );
  console.log(` 🖥  Using ${fallback} as the fallback for route requests`);
  console.log(` ♻️  Reloading the browser when files under ${root} change`);

  // ----------------------------------
  // Open the page in the default browser
  // ----------------------------------

  cproc.exec(
    `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --app='http://localhost:${filePort}'`
  );
})();
