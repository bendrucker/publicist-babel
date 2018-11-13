# publicist-es5 [![Build Status](https://travis-ci.org/bendrucker/publicist-es5.svg?branch=master)](https://travis-ci.org/bendrucker/publicist-es5) [![Greenkeeper badge](https://badges.greenkeeper.io/bendrucker/publicist-es5.svg)](https://greenkeeper.io/)

ESNext -> ES5 build task for [publicist](https://github.com/bendrucker/publicist).

## Installing

```sh
npm install --save-dev publicist-es5
```

## API

See the [publicist plugin docs](https://github.com/bendrucker/publicist#plugins) for full details on how publicist-es5 will be called.

##### Configuration

publicist-es5 loads the following default configuration which you can selectively override via publicist:

* `src`: A glob indicating the location of the source files. Defaults to `./src/**/*.js`.

##### Build

Builds each source file writes it to the specified `dest` from your configuration.

##### After

Updates your `package.json`:

* Updates the `main` entry to correspond to the built files instead of the ESNext source
* Removes `'babelify'` from `pkg.browserify.transform` if it was present
