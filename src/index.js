'use strict';

import Promise from 'bluebird';
import * as babel from 'babel';
import glob from 'glob';
import globBase from 'glob2Base';
import fs from 'fs';
import {resolve, join, relative, dirname} from 'path';
import merge from 'deepmerge';
import outputFile from 'output-file';
import strip from 'strip-path';
import {normalize as normalizeDot} from 'dot-slash';

const writeFile = Promise.promisify(outputFile);
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
  })
  .then(() => {
    updateMain(pack, basePath, config.dest);
    spliceBabelify(pack.get('browserify.transform'));
    return pack.write();
  });
}

function updateMain (pack, src, dest) {
  const original = pack.get('main');
  const srcRelative = relative(dirname(pack.path), src);
  const destRelative = relative(dirname(pack.path), dest);
  const outputMainPath = join(destRelative, strip(original, srcRelative));
  pack.set('main', normalizeDot(outputMainPath, original));
}

function spliceBabelify (transforms) {
  if (!(transforms && transforms.length)) return;
  const b = 'babelify';
  const index = transforms.findIndex((transform) => {
    if (transform === b) return true;
    if (Array.isArray(transform) && transform.includes(b)) return true;
  });
  if (index > -1) transforms.splice(index, 1);
}
