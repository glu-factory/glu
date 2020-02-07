#!/usr/bin/env node

const fs = require('fs');
const url = require('url');
const path = require('path');
const http = require('http');
const net = require('net');
const os = require('os');
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

const APPDATA =
  process.env.APPDATA ||
  (process.platform == 'darwin'
    ? process.env.HOME + '/Library/Application Support'
    : process.env.HOME + '/.local/share') + '/glu';

(async () => {
  const app = process.argv[2];
  const root = app
    ? path.join(APPDATA, app.replace('/', '@'))
    : path.join(__dirname, 'launcher');

  if (!fs.existsSync(APPDATA)) fs.mkdirSync(APPDATA);
  if (app && !fs.existsSync(root)) {
    const dir = app.replace('/', '@');
    const cmd = `git clone https://github.com/${app} ${dir}`;
    childProcess.execSync(cmd, { cwd: APPDATA });
  }

  let APPDATA_SERVER;
  if (!app) {
    APPDATA_SERVER = await servor({ root: APPDATA });
  }

  const gluPort = await availablePort();
  const closePort = await availablePort();

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
    <script>
      (() => {
        let reloading = false;
        new EventSource('/livereload').onmessage = e => { reloading = true };
        const proc = new WebSocket('ws://localhost:${closePort}');
        proc.addEventListener('message', e => e.data === 'SIGINT' && window.close());
        addEventListener('keydown', e => e.key === 'r' && e.metaKey && (reloading = true));
        window.onbeforeunload = e => { !reloading && proc.send('SIGINT') };
        const __GLU_PORT__ = ${gluPort};
        window.glu = ${glu.toString()};
        window.glu.cwd = () => "${process.cwd()}";
        window.__dirname = "${root}";
        window.$HOME = "${os.homedir()}";
        ${
          app
            ? ''
            : `
          window.glu.APPDATA = "${APPDATA}";
          window.glu.APPDATA_SERVER = "${APPDATA_SERVER.url}";
        `
        }
      })();
    </script>
  `;

  // ----------------------------------
  // Setup a default process exit listener

  let exit = () => process.exit();
  process.on('SIGINT', () => exit());

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
      const [cmd, ...args] = body.match(/(?:[^\s"]+|"[^"]*")+/g);
      let proc = childProcess.spawn(
        cmd,
        args.map(x => x.replace(/"/g, '')),
        { cwd: root }
      );
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

  const { port } = await servor({
    root,
    browse: false,
    reload: true,
    silent: true,
    inject: clientScript
  });

  // ----------------------------------
  // Open in headless chrome

  childProcess.exec(
    `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --app='http://localhost:${port}'`
  );
})();
