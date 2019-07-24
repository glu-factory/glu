const fs = require('fs');

const args = process.argv.slice(2).filter(x => !~x.indexOf('--'));
const projectPath = args[0];

const dataFile =
  process.env.APPDATA ||
  (process.platform == 'darwin'
    ? process.env.HOME + '/Library/Preferences'
    : process.env.HOME + '/.local/share') + '/glu/projects.json';
if (fs.existsSync(dataFile)) {
  const projects = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  delete projects[projectPath];
  fs.writeFileSync(dataFile, JSON.stringify(projects));
}
