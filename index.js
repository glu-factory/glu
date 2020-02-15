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

(async () => {
  const APPDATA =
    process.env.APPDATA ||
    (process.platform == 'darwin'
      ? process.env.HOME + '/Library/Application Support'
      : process.env.HOME + '/.local/share') + '/glu';

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

  const appify = (name, port) => {
    const chromePath =
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const resourcePath = `/Applications/${name}.app/Contents/Resources`;
    const execPath = `/Applications/${name}.app/Contents/MacOS`;
    const profilePath = `/Applications/${name}.app/Contents/Profile`;
    const plistPath = `/Applications/${name}.app/Contents/Info.plist`;

    console.log('making dirs..', resourcePath);
    const dirs = [resourcePath, execPath, profilePath];
    for (let dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const iconPath = `${root}/templates/vanilla/logo.png`;
    console.log('making icon..', iconPath, resourcePath);
    childProcess.execSync(
      `sips -s format tiff "${iconPath}" --out "${resourcePath}/icon.tiff" --resampleWidth 128 >& /dev/null`
    );
    childProcess.execSync(
      `tiff2icns -noLarge "${resourcePath}/icon.tiff" >& /dev/null`
    );

    //     const executable = `#!/bin/sh
    //       node ${__dirname}/launch.js "${root}" | (
    //         read foo;
    //         exec "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"  --app="http://localhost:$foo" --user-data-dir="${profilePath}" --no-first-run --no-default-browser-check "$@"
    //       )
    // `;

    const executable = `#!/bin/sh
          exec("usr/bin/node", "${__dirname}/launch.js '${root}'")
    `;

    console.log(root);
    //     const executable = `#!/bin/sh
    //     exec "node" -e "const cp = require('child_process'); cp.spawn('node', ['${__dirname}/launch.js', '${root}']);" &
    //     exec "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --app="http://example.com" --user-data-dir="/Applications/GluLauncher.app/Contents/Profile" --no-first-run --no-default-browser-check
    // `;

    // const executable = `#!/usr/bin/env node
    // const cp = require('child_process');
    // setTimeout(() => {
    //   console.log('asdf');
    // }, 5000);
    // cp.spawn('sudo', ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '--app="http://example.com"', '--user-data-dir="${profilePath}"', '--no-first-run', '--no-default-browser-check']);

    // `;

    //     const executable = `#!/bin/sh
    // exec "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --app="http://example.com" --user-data-dir="/Applications/GluLauncher.app/Contents/Profile" --no-first-run --no-default-browser-check
    // `;

    // &
    // exec "${chromePath}"  --app="http://localhost:${port}" --user-data-dir="${profilePath}" --no-first-run --no-default-browser-check "\$@"

    console.log(__dirname);
    console.log('making executable..');
    fs.writeFileSync(`${execPath}/${name}`, executable);
    childProcess.execSync(`chmod +x "${execPath}/${name}"`);

    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" “http://www.apple.com/DTDs/PropertyList-1.0.dtd”>
<plist version=”1.0″>
<dict>
<key>CFBundleExecutable</key>
<string>${name}</string>
<key>CFBundleIconFile</key>
<string>icon</string>
</dict>
</plist>`;

    console.log('making plist..');
    fs.writeFileSync(plistPath, plist);

    console.log('chmoding..');
    // fs.chmodSync(`${execPath}/${name}`, 0755);

    return `/Applications/${name}.app`;
  };

  const appPath = appify('GluLauncher', 8080);

  childProcess.exec(
    `open -a "${appPath}"`
    // `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --app='http://localhost:${port}'`
  );
})();
