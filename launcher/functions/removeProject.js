const fs = require('fs');
const { APP_DATA } = require('./utils.js');

const args = process.argv.slice(2).filter(x => !~x.indexOf('--'));
const path = args[0];

// Fetch all the known projects
const file = APP_DATA + '/projects.json';
const projects = fs.existsSync(file)
  ? JSON.parse(fs.readFileSync(file, 'utf8'))
  : {};

delete projects[path];
fs.writeFileSync(file, JSON.stringify(projects));
