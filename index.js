#!/usr/bin/env node
(async () => {
  const fs = require('fs');
  const url = require('url');
  const path = require('path');
  const http = require('http');
  const net = require('net');
  const cproc = require('child_process');
  const ws = require('ws');
  const servor = require('servor');

  const port = () =>
    new Promise(res => {
      const s = net.createServer().listen(0, () => {
        const { port } = s.address();
        s.close(() => res(port));
      });
    });

  // ----------------------------------
  // Parse arguments from the command line
  // ----------------------------------

  const args = process.argv.slice(2).filter(x => !~x.indexOf('--'));

  const ignore = !!~process.argv.indexOf('--ignore');
  const root = args[0] || '.';
  const fallback = args[1] || 'index.html';
  const filePort = await port();
  const subPort = await port();
  const closeHandlerPort = await port();

  // the name of the directory we are serving `index.html` from
  const cwd = process.cwd();
  // the current working directory,
  // i.e. the directory from which you invoked the `glu` command.
  const dirname = root.startsWith('/') ? root : path.join(process.cwd(), root);

  // ----------------------------------
  // Template clientside reload script
  // ----------------------------------

  const glu = body => {
    const socket = new WebSocket(`ws://localhost:${__COMMAND_SOCKET_PORT__}`);
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
    /**
     *  -------------------- GLU SCRIPT ---------------------
     */
    (() => {
      fetch('./manifest.json').then(res => res.json())
        .then(manifest => {
          if(manifest.dimensions) window.resizeTo(
            manifest.dimensions.width,
            manifest.dimensions.height
          )
        });
      let reloading = false;
      new EventSource('/livereload').onmessage = e => {
        reloading = true;
      }
      const closeSocket = new WebSocket('ws://localhost:${closeHandlerPort}');
      closeSocket.addEventListener('message', e => {
        e.data === 'close' && window.close();
      });
      addEventListener('keydown', e => {
        if (e.key === 'r' && e.metaKey) { reloading = true; }
      })
      const __COMMAND_SOCKET_PORT__ = ${subPort};
      window.glu = ${glu.toString()}
      window.onbeforeunload = e => { !reloading && closeSocket.send('SIGINT') }
      window.__dirname = '${cwd}';
    })();
`;

  // ----------------------------------
  // Start file watching server
  // ----------------------------------

  let fileWatcher;
  let sigIntHandler = () => process.exit();

  new ws.Server({ port: closeHandlerPort }).on('connection', socket => {
    // Close the browser upon ctrl+c in terminal
    sigIntHandler = () => {
      socket.send('close');
      socket.close(1011, 'SIGINT');
      setTimeout(process.exit, 0);
    };
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
        cwd: dirname
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

  servor({
    root,
    fallback,
    port: filePort,
    browse: false,
    reload: true,
    silent: true,
    inject: reloadScript
  });

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
  if (!ignore && fs.existsSync(path.join(dirname, 'index.html'))) {
    projects[dirname] = {
      ...projects[dirname],
      openTime: Date.now()
    };
  }
  fs.writeFileSync(dataFile, JSON.stringify(projects));

  // Open in headless chrome
  cproc.exec(
    `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --app='http://localhost:${filePort}'`
  );
})();
