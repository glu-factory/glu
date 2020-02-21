const { execSync } = require('child_process');
const [path, user, name, message] = process.argv.slice(2);

try {
  execSync(
    `cd "${path}" && git init && git add . && git commit -m "${message ||
      +new Date()}"`
  );
} catch {}

try {
  execSync(
    `cd "${path}" && git remote add origin git@github.com:${user}/${name}.git`
  );
} catch {}

try {
  execSync(
    `cd "${path}" && git remote set-url origin git@github.com:${user}/${name}.git`
  );
} catch {}

try {
  execSync(`cd "${path}" && git push origin master`);
} catch {}
