# glu

> binding web with native

Providing a generalised means of developing distributable, super lightweight hybrid apps; glu makes it possible to execute system level functions calls from browser based user interfaces.

![glu](https://user-images.githubusercontent.com/1457604/60849581-56f42600-a1e3-11e9-8e27-32a3e2bd45cc.png)

## Features

Adds native like functionality to almost any web app with a single command. Launchs apps in a chromeless browser with encorporated `glu` function that acts as a portal to the command line! Comes with a static file server with live reload and history API fallback built in; providing a fast, zero-config development environment out of the box.

The difference between this implementation compared to more typical approach (such as electron) is that:

- No reliance on a binary runtime
- No boilerplate or setup required
- No wrappers around node modules

We have avidly tried to keep dependencies of this project to a minimum (relying on only `ws`). To develop and consume glu apps however you will need to have installed a recent version of Nodejs and Google Chrome. Currently glu is only tested on and likely to work on macOS.

## Quickstart

To start a new glu project from scratch, run the following command in your terminal; it will scaffold a minimal example app, demonstrating the `glu` function and its various capabilities.

```
npx glu --init
```

> To extend an existing app with glu then run the command from the same directory as the `index.html` file and omit the `--init` flag.

Upon running the command glu will start the appropriate servers (file, live reload and cli) and open the demo app up a chromeless (chromium) browser window. Opening the developer console for the window (using `cmd`+`option`+`i`) and typing `glu` reveals the built in function which can be ran directly from the console.

## Usage

All interaction with the operating system happen through the `glu` function which is bound to the browsers `window` object and so is available globally. The function takes a single argument – a command – in the form of a string, much like a terminal:

```js
glu('ls');
```

Every time the `glu` function is called, a new connection between the browser window and a native process is created. The command is not executed however, until a callback function is provided:

### glu(cmd)(callback)

Once a callback function has been supplied it will get repeatedly called with any output to `stdout` until the invoked process exits. This is convenient for processes that take a near constant time to execute and that return a single value upon exit – for example `ls`, `pwd` or `node -v`.

```js
glu('node -v')(data => console.log(data));

// => v10.14.1
```

Processes that take an indeterminate amount of time to exit and potentially print to `stdout` multiple times are handled in exactly the same manner. This is convenient for process like `traceroute` or `npm install` for example.

```js
glu('ping google.com')(data => console.log(data));

// => PING google.com (74.125.193.138): 56 data bytes
// => 64 bytes from 74.125.193.138: icmp_seq=0 ttl=38 time=26.272 ms
```

Until now glu has presumed that all processes will exit at some point in time. However, some processes will continue indefinitely – for example `ping`. For cases like this an `off` function is passed as the second argument to the callback function. This allows the developer to manually terminate a processes at any time or conditionally based on some distinct data.

```js
glu("ping google.com")((data, off) => {
  const time = data.match(/time=(\d+)/) || [];
  if (+time[1]) < 15) off();
  console.log(time[1])
})

// => undefined
// => 17
// => 15
// => 14
```

As well as accepting a callback function, calls to glu return a promise so it is possible to await both an exit and a termination; essentially making a single or multiple return process synchronous.

```js
const exit = await glu('npm install')(data => console.log(data));
exit === '0'
  ? console.log('Install Successful')
  : console.log('Install Failed');
```

## Licence

MIT
