# glu

> binding web with native

This library provides a generalised means of developing distributable, super lightweight hybrid apps. It trivialises making system level functions calls from browser based user interfaces.

![glu2](https://user-images.githubusercontent.com/1457604/60849581-56f42600-a1e3-11e9-8e27-32a3e2bd45cc.png)

## Features

Adds native like functionality to almost any web app with a single command. Launchs apps in a chromeless browser with encorporated `glu` function that acts as a portal to the command line! Comes with a static file server with live reload and history API fallback built in; providing a fast, zero-config development environment out of the box.

The difference between this implementation compared to more typical approach (such as electron) is that:

- No reliance on a binary runtime
- No boilerplate or setup required
- No wrappers around node modules

We have avidly tried to keep dependencies of this project to a minimum (relying on only `ws`). To develop and consume glu apps however you will need to have installed a recent version of Nodejs and Google Chrome. Currently glue is only tested on and likely to work on macOS.

## Quickstart

To start a new glu project from scratch, run the following command in your terminal; it will scaffold a minimal example app, demonstrating the `glu` function and its various capabilities.

```
npx glu --init
```

> If you already have an app that you want to extend with glu function then run the command from the same directory as the `index.html` file and omit the `--init` flag.

Upon running the command glu will start the appropriate servers (file, live reload and cli) and open the demo app up a chromeless (chromium) browser window. Opening the developer console for the window (using `cmd`+`option`+`i`) and typing `glu` reveals the built in function which can be ran directly from the console.

## Usage

All interaction with the operating system happen through the `glu` function which is bound to the browsers `window` object and so is available globally. The function takes a single argument – a command – in the form of a string, much like a terminal:

```js
glu("ls");
```

Every time the `glu` function is called, a new connection between the browser window and a native child process is created. The command is not invoked however, until one of the following functions are called:

### once(callback)

The `once` method accepts a callback function that will get passed the `stdout` of the invoked command as data. As the name suggest, this method will terminate automatically as soon as it receives any data. This is convenient for processes that take a near constant time to execute and that return a single value upon exit – for example `ls`, `pwd` or `node -v`.

```js
glu("node -v").once(data => console.log(data));

// => v10.14.1
```

### on(callback)

The `on` methods accepts a callback function that will get passed the `stdout` of the invoked command as data; much like the `once` command. This method however, will not terminate as soon as it receives data, instead it will keep listening out for data until the child process exits. This is convenient for processes that take an arbritary time to execute and return multiple values before exiting – for example `ping`, `traceroute` or `npm install`

```js
glu("ping google.com").on(data => console.log(data));

// => PING google.com (74.125.193.138): 56 data bytes
// => 64 bytes from 74.125.193.138: icmp_seq=0 ttl=38 time=26.272 ms
```

The callback function gets passed `data` as the first argument. It gets passed a function called `off` as the argument. This function allows you to manually terminate a processes that could go on indefinately or might exit in an indeterminate amount of time, and makes it possible to terminate a process conditionally, based on some received data.

```js
glu("ping google.com").on((data, off) => {
  const time = data.match(/time=(\d+)/) || [];
  if (+time[1]) < 15) off();
  console.log(time[1])
})

// => undefined
// => 17
// => 15
// => 14
```

## Licence

MIT
