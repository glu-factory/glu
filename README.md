<img width="100%" src="https://user-images.githubusercontent.com/1457604/75055042-33f55880-54cc-11ea-98bf-14bedd071214.png">

> develop graphical user interfaces for your favourite command line tools

Providing a generalised means of developing and distributing super lightweight desktop applications. Glu allows developers to make system level calls from the browser; making it trivial to develop a GUI for your favourite command line tools using just HTML, CSS and JavaScript!

The difference between glu and a more typical desktop application building approach (such as electron) is that there is:

- No dependency on a binary runtime
- No boilerplate or setup required
- No wrappers around node modules

We have avidly tried to keep dependencies of this project to a minimum (relying on only `servor` and `ws`). However, in order to run, develop and publish glu apps, you will need to have a version of NodeJS and Google Chrome installed.

#### Currently glu only works on macOS. If you have a windows machine and would like to help us reach compatibility then please get in touch or create a pull request

## Quickstart

Glu applications can be installed and ran directly from a GitHub repository. Try running the following command in your terminal.

> ⚠ Please be sure you trust the developer of any application before launching it!

```bash
npx glu glu-factory/file-browser
```

This command will automatically clone [this repo](https://github.com/glu-factory/file-browser) into `~/Application Support/glu` if it doesn't alerady exist and then launches the application in a headless chome window.

## Launcher

To demonstrate the power of glu we built a glu application to help manage glu applications (How meta, right!?). We call this the _launcher_.

To launch the launcher run the following command:

```bash
npx glu
```

The launcher allows you to create, edit, publish and delete applications through a user interface. As well as managing local applications, the launcher facilitates searching for and installing application straight from Github.

### Featured Projects

The launcher displays featured community projects hand picked by the glu. To have an application reviewed as a featured here open a pull request on this repo with your project added to [this file](https://github.com/glu-factory/glu/blob/master/featured-projects.txt).

All project must include an `index.html` and `icon.png` at the root of your project. If the applications passes review then your project will appear in every user's launcher!

## Creating an Application

To get started creating a glu application, select one of the quickstart template within the launcher. This will bootstrap a new project with the glu API bound to the browsers window object.

### API

Any application launched with the `glu` command or ran through the launcher gets the glu API is injected on launch. Any and all interactions with the operating system are executed through this function which will exist at `window.glu`.

The function takes a single argument – a command – in the form of a string, much like a terminal. Every time the `glu` function is called, a new connection between the browser and terminal (via a native child process) is created. Calling the function returns a promise of some buffered `stdout`:

```js
const version = await glu('node -v');
// => v10.14.1
```

This is especially convenient when working with commands that return a single value in a predictable amount of time.

#### glu(cmd, callback)

For long running processes that might return multiple values before exiting, glu provides a callback function. The callback function is called every time the child process prints to `stdout` or `stderr`. This happens until the child process exits.

```js
glu('ping google.com', ([stdout, stderr]) => {
  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);
});

// => PING google.com (74.125.193.138): 56 data bytes
// => 64 bytes from 74.125.193.138: icmp_seq=0 ttl=38 time=26.272 ms
```

The `glu` function passes any stdout of the underlying child process to all callback functions (and the buffered promise result). Therefore, all callback data must be serialisiable. For example, to pass a JSON result from a node script executed with `glu`, then the result would need to be stringified:

```js
console.log(JSON.stringify(result));
```

If it is useful, think of `glu` commands as API endpoints that would usually be fetched over a network.

Some child processes will continue indefinitely unless terminated manually; like the `ping` example above.

For cases like this an `off` function is passed as the second argument to the callback function. This allows the developer to manually terminate a processes at any time.

```js
let count = 0;
glu('ping google.com', ([stdout, stderr], off) => {
  if (count > 2) off();
  const ping = stdout.match(/time=(\d+)/) || [];
  console.log(ping[1]);
  count++;
});

// => 17
// => 15
// => 14
```

As mentioned previously, calls to glu return a promise which resolves when the child process terminates. This means that you can either `await` the result or use `then` and `catch` which will both get passed a string containing all success or error messages (respectively) that were printed to stdout/err during the child process' execution.

```js
glu('npm install')
  .then(stdout => console.log('Install Successful'))
  .catch(stderr => console.error('Install Failed'));

// => Install Successful

try {
  console.log(await glu('npm foobar'));
} catch (err) {
  console.error('Command Failed with error:', err);
}

// => Command Failed with error: ...
```

## Licence

MIT
