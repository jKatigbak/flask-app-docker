#! /usr/bin/env node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _sourceMapSupport = require('source-map-support');

var _path = require('path');

var _verror = require('verror');

var _bluebird = require('bluebird');

var Bluebird = _interopRequireWildcard(_bluebird);

var _cli = require('../lib/cli');

var _format = require('../lib/format');

var _signals = require('../lib/signals');

var _ramda = require('ramda');

var R = _interopRequireWildcard(_ramda);

var _stream = require('stream');

var _fs = require('fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Bluebird.config({ longStackTraces: true });

(0, _sourceMapSupport.install)();

_commander2.default.usage('--command <cmd> [options] [-- <cucumber-args ...>]').option('-c, --command <cmd>', 'The command to run to start the server', null).option('-p, --port <port>', 'The port to bind', null).option('-h, --host <hostname>', 'The host to bind', null).option('-s, --score', 'Print the score').option('-n, --check-new [dir]', 'Check that additional scenarios have been provided').option('-D, --no-debug', 'Disable debug output').option('-C, --no-colors', 'Disable color output').option('-o, --out-file <path>', 'Writes output to file as well as stdout').parse(process.argv);

if (!_commander2.default.command) {
  console.log('--command is required');

  _commander2.default.outputHelp();
  process.exit(1);
}

global.program = _commander2.default;

const cli = new _cli.Cli({
  cwd: process.cwd(),
  options: _extends({
    featurePaths: [(0, _path.resolve)(__dirname, '../../features')],
    stepPaths: [(0, _path.resolve)(__dirname, '../steps')]
  }, R.pick(['colors', 'score', 'debug', 'port', 'host', 'command', 'checkNew'], _commander2.default)),
  cucumberArgs: _commander2.default.args,
  stdout: getOutStream(_commander2.default.colors, _commander2.default.outFile)
});

const signals = new _signals.SignalBinder();

signals.on('userRequestedExit', opts => cli.exit(opts));

Bluebird // node 8 does not support Promise#finally
.resolve(cli.precheck()).then(({ ok, message }) => {
  if (ok) return cli.run();

  console.log(message);
  return null;
}).catch(err => {
  console.error((0, _verror.fullStack)(err));
  process.exit(1);
}).finally(() => signals.unbind());

function getOutStream(enableColors, filePath) {
  const out = new _stream.PassThrough();

  const noColors = out.pipe(new _format.StripAnsiTransform());

  (enableColors ? out : noColors).pipe(process.stdout, { end: false });

  if (filePath) noColors.pipe((0, _fs.createWriteStream)(filePath));

  return out;
}
//# sourceMappingURL=take-home-integration-test.js.map