# glu

> binding browser and operating system

![glu](https://user-images.githubusercontent.com/1457604/60772603-e10f9200-a0f0-11e9-9155-486651d277ec.png)

This library provides a super lightweight, generalised means of making apps that desire access both system and browser APIs. It allows you to build user interfaces with web technologies (html, css, and javascript) whilst making it trivial to call OS level functions like accessing the file system and invoking scripts.

The difference between this implementation compared to more typical approach (such as electron) is that:

- No reliance on a binary runtime
- No boilerplate or setup required
- No wrappers around node modules

This allows you to add native functionality to almost any local web application. Your app will be launched in a chromeless browser from where you can call on the command line using via Glu! In addition to this, Glu includes a static file server with live reload and history API fallback behavior built in, providing a fast and zero-config development environment out of the box.

## Usage

To start a new glu project from scratch, run the following command in your terminal; it will create a minimal demo app for you. If you already have an app that you want to extend with glu capabilities then run the command from the project root (any directory with an `index.html` file) and omit the `--init` flag:

```
npx glu --init
```

Running the command will cause glu to start the appropriate servers (file, live reload, cli) and open your app up a chromeless (chromium) browser window. If you open the developer console for the window (using the shortcut `cmd+option+i`) and type `glu` then you will be able to see the exposed methods.

There are currently just two functions available:

### run(cmd)

This is a one time async call that returns the promise of the first text printed to stdout. It accepts a string `cmd` that gets passed to `process.execSync`. You can await the result from your app, for example:

```js
glu.run("ls").then(console.log);
```

### sub(cmd, cb)

This creates an ongoing subscription to the stdout of a process. It accepts a string `cmd` that will be passed to `process.spawn` and a callback function `cb` which will be invoked every time the process writes to stdout, for example:

```js
glu.sub("npm install", console.log);
```

## Licence

MIT
