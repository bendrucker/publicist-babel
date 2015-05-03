'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _interopRequireWildcard = function (obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } };

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.defaults = defaults;
exports.build = build;
exports.after = after;

var _Promise = require('bluebird');

var _Promise2 = _interopRequireDefault(_Promise);

var _import = require('babel');

var babel = _interopRequireWildcard(_import);

var _globC = require('glob');

var _globC2 = _interopRequireDefault(_globC);

var _globBase = require('glob2Base');

var _globBase2 = _interopRequireDefault(_globBase);

var _Minimatch = require('minimatch');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _resolve$join$relative$dirname = require('path');

var _merge = require('deepmerge');

var _merge2 = _interopRequireDefault(_merge);

var _outputFile = require('output-file');

var _outputFile2 = _interopRequireDefault(_outputFile);

var _strip = require('strip-path');

var _strip2 = _interopRequireDefault(_strip);

var _normalizeDot = require('dot-slash');

'use strict';

var glob = _Promise2['default'].promisify(_globC2['default']);
var writeFile = _Promise2['default'].promisify(_outputFile2['default']);
_Promise2['default'].promisifyAll(_fs2['default']);
_Promise2['default'].promisifyAll(babel);

function defaults(pack, config) {
  config = _merge2['default']({
    src: './src/**/*.js'
  }, config);

  config.srcPath = _globBase2['default']({
    minimatch: new _Minimatch.Minimatch(config.src)
  });

  return config;
}

function build(pack, config) {
  return glob(config.src).map(function (file) {
    return babel.transformFileAsync(file).get('code').then(function (code) {
      return writeFile(_resolve$join$relative$dirname.resolve(config.dest, file.split(config.srcPath)[1]), code);
    });
  });
}

function after(pack, config) {
  updateMain(pack, config);
  spliceBabelify(pack, config);
}

function updateMain(pack, config) {
  var original = pack.get('main');
  var srcRelative = _resolve$join$relative$dirname.relative(_resolve$join$relative$dirname.dirname(pack.path), config.srcPath);
  var destRelative = _resolve$join$relative$dirname.relative(_resolve$join$relative$dirname.dirname(pack.path), config.dest);
  var outputMainPath = _resolve$join$relative$dirname.join(destRelative, _strip2['default'](original, srcRelative));
  pack.set('main', _normalizeDot.normalize(outputMainPath, original));
}

function spliceBabelify(pack, config) {
  var transforms = pack.get('browserify.transform');
  if (!(transforms && transforms.length)) {
    return;
  }var b = 'babelify';
  var index = transforms.findIndex(function (transform) {
    if (transform === b) return true;
    if (Array.isArray(transform) && transform.includes(b)) return true;
  });
  if (index > -1) transforms.splice(index, 1);
}