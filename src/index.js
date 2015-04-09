'use strict';

import Promise from 'bluebird';
import * as babel from 'babel';
import globC from 'glob';
import globBase from 'glob2Base';
import {Minimatch} from 'minimatch';
import fs from 'fs';
import {resolve, join, relative, dirname} from 'path';
import merge from 'deepmerge';
import outputFile from 'output-file';
import strip from 'strip-path';
import {normalize as normalizeDot} from 'dot-slash';

const glob = Promise.promisify(globC);
const writeFile = Promise.promisify(outputFile);
Promise.promisifyAll(fs);
Promise.promisifyAll(babel);

export function defaults (pack, config) {
  config = merge({
    src: './src/**/*.js'
  }, config);

  config.srcPath = globBase({
    minimatch: new Minimatch(config.src)
  });

  return config;
}

export function build (pack, config) {
  return glob(config.src)
    .map((file) => {
      return babel.transformFileAsync(file)
        .get('code')
        .then((code) => {
          return writeFile(resolve(config.dest, file.split(config.srcPath)[1]), code);
        });
    });
}

export function after (pack, config) {
  updateMain(pack, config);
  spliceBabelify(pack, config);
  return pack.write();
}

function updateMain (pack, config) {
  const original = pack.get('main');
  const srcRelative = relative(dirname(pack.path), config.srcPath);
  const destRelative = relative(dirname(pack.path), config.dest);
  const outputMainPath = join(destRelative, strip(original, srcRelative));
  pack.set('main', normalizeDot(outputMainPath, original));
}

function spliceBabelify (pack, config) {
  const transforms = pack.get('browserify.transform');
  if (!(transforms && transforms.length)) return;
  const b = 'babelify';
  const index = transforms.findIndex((transform) => {
    if (transform === b) return true;
    if (Array.isArray(transform) && transform.includes(b)) return true;
  });
  if (index > -1) transforms.splice(index, 1);
}
