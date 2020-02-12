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

The function takes a single argument – a command – in the form of a string, much like a terminal:

```js
glu('ls')(console.log);
```

Every time the `glu` function is called, a connection between the browser window and a native child process is created.

### glu(cmd)(callback)

The provided callback is repeatedly called with any output to `stdout` until the invoked process exits.

```js
glu('node -v')(stdout => console.log(stdout));

// => v10.14.1
```

This works for synchronous processes that output just once (like `node -v`) but also for processes that take indeterminate amount of time to execute and potentially print to `stdout` multiple times. This is convenient for process like `ping`, `traceroute` or `npm install` for example.

```js
glu('ping google.com')(stdout => console.log(stdout));

// => PING google.com (74.125.193.138): 56 data bytes
// => 64 bytes from 74.125.193.138: icmp_seq=0 ttl=38 time=26.272 ms
```

Some processes will continue indefinitely – for example `ping`. For cases like this an `off` function is passed as the second argument to the callback function. This allows the developer to manually terminate a processes at any time or conditionally based on some distinct output.

```js
glu("ping google.com")((stdout, off) => {
  const time = stdout.match(/time=(\d+)/) || [];
  if (+time[1]) < 15) off();
  console.log(time[1])
})

// => 17
// => 15
// => 14
```

As well as accepting a callback function, calls to glu return a promise which resolves when the child process terminates; essentially making a single or multiple return process synchronous.

```js
const exit = await glu('npm install')(stdout => console.log(stdout);
exit === '0'
  ? console.log('Install Successful')
  : console.log('Install Failed');
```

## Licence

MIT
