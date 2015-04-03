'use strict';

import Promise from 'bluebird';
import * as babel from 'babel';
import glob from 'glob';
import globBase from 'glob2Base';
import fs from 'fs';
import {resolve} from 'path';
import merge from 'deepmerge';
import writeFile from 'output-file';

writeFile = Promise.promisify(writeFile);
Promise.promisifyAll(fs);
Promise.promisifyAll(babel);

export default function babelify (pack, config = {}) {
  config = merge({
    src: './src/**/*.js'
  }, config);
  let basePath;
  return new Promise((resolve, reject) => {
    const globber = glob(config.src, function (err, results) {
      if (err) return reject(err);
      return resolve(results);
    });
    basePath = globBase(globber);
  })
  .map((file) => {
    return babel.transformFileAsync(file)
      .get('code')
      .then((code) => {
        return writeFile(resolve(config.dest, file.split(basePath)[1]), code);
      });
  });
}
