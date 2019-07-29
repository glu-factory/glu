const fs = require('fs');
const sane = require('sane');
const { APP_DATA } = require('./utils.js');

// Fetch all the known projects
const file = APP_DATA + '/projects.json';
!fs.existsSync(file) && fs.writeFileSync(file, '{}');

var watcher = sane(APP_DATA, { glob: 'projects.json' });
watcher.on('ready', list);
watcher.on('change', list);

function list() {
  const projects = JSON.parse(fs.readFileSync(file, 'utf8'));
  const keys = Object.keys(projects);

  // Filter out projects that don't exist
  const exists = keys
    .filter(key => fs.existsSync(key))
    .reduce((a, k) => ({ ...a, [k]: projects[k] }), {});

  // Rewrite projects omitting anhy that don't exist
  if (!keys.every(k => exists[k])) {
    fs.writeFileSync(file, JSON.stringify(exists));
  }

  // Return list of existing projects
  console.log(JSON.stringify(exists));
}
