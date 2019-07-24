const fs = require('fs');

const dataDir =
  process.env.APPDATA ||
  (process.platform == 'darwin'
    ? process.env.HOME + '/Library/Preferences'
    : process.env.HOME + '/.local/share') + '/glu';
if (!fs.existsSync(dataDir + '/projects.json')) {
  console.log('{}');
  return;
}
console.log(fs.readFileSync(dataDir + '/projects.json', 'utf8'));
