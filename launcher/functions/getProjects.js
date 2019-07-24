const fs = require('fs');

const dataDir =
  process.env.APPDATA ||
  (process.platform == 'darwin'
    ? process.env.HOME + '/Library/Preferences'
    : process.env.HOME + '/.local/share') + '/glu';
const dataFile = dataDir + '/projects.json';
if (!fs.existsSync(dataFile)) return console.log('{}');
const projects = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
// remove projects that have been manually deleted
Object.keys(projects).map(key => !fs.existsSync(key) && delete projects[key]);
fs.writeFileSync(dataFile, JSON.stringify(projects));
console.log(JSON.stringify(projects));
