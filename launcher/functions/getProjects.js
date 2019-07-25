const fs = require('fs');
const { APP_DATA } = require('./utils.js');

// Fetch all the known projects
const file = APP_DATA + '/projects.json';
const projects = fs.existsSync(file)
  ? JSON.parse(fs.readFileSync(file, 'utf8'))
  : {};

// Filter out projects that don't exist
Object.keys(projects).map(key => !fs.existsSync(key) && delete projects[key]);
fs.writeFileSync(file, JSON.stringify(projects));

// Return list of existing projects
console.log(JSON.stringify(projects));
