#!/usr/bin/env node
process.on('SIGPIPE', process.exit);

const fs = require('fs');
const url = require('url');
const path = require('path');
const http = require('http');
const net = require('net');
const os = require('os');
const childProcess = require('child_process');
const ws = require('ws');
const servor = require('servor');

(async () => {
  const APPDATA =
    process.env.APPDATA ||
    (process.platform == 'darwin'
      ? process.env.HOME + '/Library/Application Support'
      : process.env.HOME + '/.local/share') + '/glu';

  const availablePort = () =>
    new Promise(res => {
      const s = net.createServer().listen(0, () => {
        const { port } = s.address();
        s.close(() => res(port));
      });
    });

  const app = process.argv[2];

  const gluPort = await availablePort();
  const closePort = await availablePort();

  let APPDATA_SERVER;
  if (!app) {
    APPDATA_SERVER = await servor({ root: APPDATA });
  }

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
        window.DONT_KILL = false;
        new EventSource('/livereload').onmessage = e => { DONT_KILL = true };
        const proc = new WebSocket('ws://localhost:${closePort}');
        proc.addEventListener('message', e => e.data === 'SIGINT' && window.close());
        addEventListener('keydown', e => e.key === 'r' && e.metaKey && (DONT_KILL = true));
        window.onbeforeunload = e => { !DONT_KILL && proc.send('SIGINT') };
        const __GLU_PORT__ = ${gluPort};
        window.glu = ${glu.toString()};
        window.glu.cwd = () => "${process.cwd()}";
        window.__dirname = "${app}";
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
  // process.on('SIGINT', () => exit());

  // ----------------------------------
  // Start close listening socket

  new ws.Server({ port: closePort }).on('connection', socket => {
    // Close the browser upon ctrl+c in terminal
    // Listen for window closing
    socket.on('message', body => {
      console.log(body);
    });
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
        { cwd: app }
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

  const { port } = await servor({
    root: app,
    browse: false,
    reload: true,
    silent: true,
    inject: clientScript,
    port: 5001
  });

  console.log(port);
})();
