#!/usr/bin/env node

const fs = require('fs');
const url = require('url');
const path = require('path');
const http = require('http');
const net = require('net');
const childProcess = require('child_process');
const ws = require('ws');
const servor = require('servor');

const availablePort = () =>
  new Promise(res => {
    const s = net.createServer().listen(0, () => {
      const { port } = s.address();
      s.close(() => res(port));
    });
  });

(async () => {
  const args = process.argv.slice(2).filter(x => !~x.indexOf('--'));
  const ignore = !!~process.argv.indexOf('--ignore');
  const root = args[0] || '.';
  const fallback = args[1] || 'index.html';
  const filePort = await availablePort();
  const gluPort = await availablePort();
  const closePort = await availablePort();
  const dirname = root.startsWith('/') ? root : path.join(process.cwd(), root);
  let exit = () => process.exit();
  process.on('SIGINT', () => exit());

  // ----------------------------------
  // Template client side reload script

  const glu = body => {
    const socket = new WebSocket(`ws://localhost:${__GLU_PORT__}`);
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

  const clientScript = `
    (() => {
      let reloading = false;
      new EventSource('/livereload').onmessage = e => { reloading = true };
      const proc = new WebSocket('ws://localhost:${closePort}');
      proc.addEventListener('message', e => e.data === 'SIGINT' && window.close());
      addEventListener('keydown', e => e.key === 'r' && e.metaKey && (reloading = true));
      window.onbeforeunload = e => { !reloading && proc.send('SIGINT') };
      const __GLU_PORT__ = ${gluPort};
      window.glu = ${glu.toString()}
    })();
  `;

  // ----------------------------------
  // Start close listening socket

  new ws.Server({ port: closePort }).on('connection', socket => {
    // Close the browser upon ctrl+c in terminal
    exit = () => {
      socket.send('SIGINT');
      socket.close(1011, 'SIGINT');
      setTimeout(process.exit, 0);
    };
    // Listen for window closing
    socket.on('message', body => body === 'SIGINT' && exit());
  });

  // ----------------------------------
  // Start command running socket

  new ws.Server({ port: gluPort }).on('connection', socket => {
    socket.on('message', body => {
      // Extract command and arguments then run as child process
      const [cmd, ...args] = body.split(' ');
      let proc = childProcess.spawn(cmd, args, { cwd: dirname });
      // Forward standard out and error to the socket
      ['stdout', 'stderr'].map(channel =>
        proc[channel].on('data', out => socket.send(out.toString()))
      );
      // Kill any child process if the socket is closed
      socket.on('close', () => !!proc && proc.kill('SIGINT'));
      // Close any socket if the child process is killed
      proc.on('close', (code, signal) => {
        proc = null;
        socket.close(code > 0 ? 1011 : 1000, `${signal}`);
      });
    });
  });

  // ----------------------------------
  // Start static file server

  servor({
    root,
    fallback,
    port: filePort,
    browse: false,
    reload: true,
    silent: true,
    inject: clientScript
  });

  // ----------------------------------
  // Update recent glu projects info

  const dataDir =
    process.env.APPDATA ||
    (process.platform == 'darwin'
      ? process.env.HOME + '/Library/Preferences'
      : process.env.HOME + '/.local/share') + '/glu';
  const dataFile = dataDir + '/projects.json';
  !fs.existsSync(dataDir) && fs.mkdirSync(dataDir);
  !fs.existsSync(dataFile) && fs.writeFileSync(dataFile, '{}');
  let projects = JSON.parse(fs.readFileSync(dataFile));
  // Don't include ignored projects in recent projects list
  if (!ignore && fs.existsSync(path.join(dirname, 'index.html'))) {
    projects[dirname] = {
      ...projects[dirname],
      openTime: Date.now()
    };
  }
  fs.writeFileSync(dataFile, JSON.stringify(projects));

  // ----------------------------------
  // Open in headless chrome

  childProcess.exec(
    `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --app='http://localhost:${filePort}'`
  );
})();
