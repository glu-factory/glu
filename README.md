# glu

> develop graphical user interfaces for your favourite command line tools

Providing a generalised means of developing and distributing super lightweight user interfaces. Glu allows developers to make system level calls from the browser; making it trivial to develop a GUI for your favourite command line tools.

The difference between the glu approach compared to more typical approach (such as electron) is that there is:

- No dependency on a binary runtime
- No boilerplate or setup required
- No wrappers around node modules

We have avidly tried to keep dependencies of this project to a minimum (relying on only `ws`). To develop and consume glu apps however you will need to have installed; a version of NodeJS and Google Chrome.

Currently glu is only tested on and likely to work on macOS.

## Quickstart

Glu applications can be installed and ran directly from a GitHub repository. Try running the following command in your terminal.

> Please be sure you trust the developer of any application before running it!

```
npx glu lukejacksonn/create-es-react-app
```

This command will clone [this repo](https://github.com/lukejacksonn/create-es-react-app) into `~/Application Support/glu` (if it doesn't alerady exist) and then runs the application in a headless chome window.

## Launcher

To demonstrate the power of glu we built a glu application to help manage glu applications. We call this the _launcher_. How meta, right!?

To launch the launcher run the following command:

```
npx glu
```

Currently the launcher has quite limited in features – it allows you to launch, view the contents of, launch in vs code and delete an application – but we hope to add more once we get some feedback on usage.

## API

As well as a CLI and GUI, we inject an API into all applications launched via the glu command (known as the `glu` function). All and any interactions with the operating system happens through this function which is bound to `window.glu`.

The function takes a single argument – a command – in the form of a string, much like a terminal. Every time the `glu` function is called, a new connection between the browser window and a native child process is created. Calling the functions returns a promise of some buffered `stdout`:

```js
const version = await glu('node -v');
// => v10.14.1
```

This is especially convenient when working with commands that return a single value in a predictable amount of time.

### glu(cmd, callback)

For long running processes that might return multiple values before exiting, then provide a callback function. The callback function is called every time the child process prints to `stdout` or `stderr`. This happens until the child process exits.

```js
glu('ping google.com')(([stdout, stderr]) => {
  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);
});

// => PING google.com (74.125.193.138): 56 data bytes
// => 64 bytes from 74.125.193.138: icmp_seq=0 ttl=38 time=26.272 ms
```

Some child processes will continue indefinitely unless terminated manually; like the `ping` example above.

For cases like this an `off` function is passed as the second argument to the callback function. This allows the developer to manually terminate a processes at any time.

```js
let count = 0;
glu('ping google.com')(([stdout, stderr], off) => {
  const ping = stdout.match(/time=(\d+)/) || [];
  console.log(ping[1]);
  if (count > 2) off();
  count++;
});

// => 17
// => 15
// => 14
```

As mentioned previously, calls to glu return a promise which resolves when the child process terminates. This means that you can either `await` the result or use `then` and `catch` which will both get passed a string containing all success or error messages (respectively) that was received by stdio during the child processes execution.

```js
glu('npm install')
  .then(stdout => console.log('Install Successful'))
  .catch(stderr => console.error('Install Failed'));

// => Install Successful
```

## Licence

MIT
