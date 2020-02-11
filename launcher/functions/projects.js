const fs = require('fs');
const path = require('path');

const APPDATA =
  process.env.APPDATA ||
  (process.platform == 'darwin'
    ? process.env.HOME + '/Library/Application Support'
    : process.env.HOME + '/.local/share') + '/glu';

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function get() {
  console.log(
    JSON.stringify(
      fs
        .readdirSync(APPDATA)
        .filter(x => x.indexOf('.'))
        .reduce(
          (apps, dir) => ({
            ...apps,
            [dir]: {
              repo: dir.replace('@', '/'),
              name: dir.split('@')[1],
              user: dir.split('@')[0],
              path: path.join(APPDATA, dir),
              mtime: +new Date(fs.statSync(path.join(APPDATA, dir)).mtime)
            }
          }),
          {}
        )
    )
  );
}

const debouncedGet = debounce(get, 100, false);

fs.watch(APPDATA, { recursive: true }, debouncedGet);
get();
