'use strict';

import Promise from 'bluebird';
import babel from 'babel-core';
import glob from 'glob';
import fs from 'fs';
import {basename} from 'path';

glob = Promise.promisify(glob);
Promise.promisifyAll(fs);

export default function babelify () {
  return fs.mkdirAsync('./release/es5')
    .then(function () {
      return glob('./src/*.js');
    })
    .map(function (file) {
      const filename = basename(file);
      return fs.readFileAsync(file)
        .then(function (code) {
          return babel.transform(code);
        })
        .then(function (code) {
          fs.writeFileAsync(`./release/es5/${filename}`, code);
        });
    });
}
