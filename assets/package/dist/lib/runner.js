'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Runner = undefined;

var _net = require('net');

var _crossSpawn = require('cross-spawn');

var _crossSpawn2 = _interopRequireDefault(_crossSpawn);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _stream = require('stream');

var _getStream = require('get-stream');

var _getStream2 = _interopRequireDefault(_getStream);

var _shellQuote = require('shell-quote');

var _signals = require('./signals');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const log = (0, _debug2.default)('take-home-tester:child-process');

const connectAttempts = 10;
const connectDelayMS = 1000;
const connectTimeoutDelay = 200;

const signalWaitTime = 1000;

class Runner {
  static get maxConnectTimeout() {
    return connectAttempts * (connectDelayMS + connectTimeoutDelay);
  }

  constructor(runConfig) {
    this.runConfig = runConfig;
  }

  start() {
    const { command, host, port } = this.runConfig;

    const env = {
      PATH: process.env.PATH,
      DEBUG: process.env.DEBUG,
      NODE_DEBUG: process.env.NODE_DEBUG,
      PORT: port,
      HOST: host,
      APPDATA: process.env.APPDATA // for windows
    };

    log('Spawning', { command, env });

    this.child = spawn(command, {
      env,
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    this.child.once('exit', (code, signal) => {
      log(`Child pid ${this.child.pid} has exited with ${code ? `code ${code}` : signal}`);
      this.child = null;
      this.isStopping = false;
    });

    return getMergedOutputs(this.child);
  }

  stop() {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (!_this.child) return;

      const exitPromise = new _bluebird2.default(function (resolve) {
        return _this.child.once('exit', resolve);
      });

      if (_this.isStopping) {
        yield exitPromise;
        return;
      }

      log('Stopping runner');

      _this.isStopping = true;

      for (const signal of _signals.signalEscalations) {
        yield signal(_this.child.pid);
        yield exitPromise.timeout(signalWaitTime).catchReturn();
        if (!_this.child) return;
      }

      throw new Error(`Could not kill process ${_this.child.pid}`);
    })();
  }

  forceStop() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (!_this2.child) return;
      _this2.isStopping = true;

      log('FORCE stopping runner');
      yield _signals.signalEscalations[_signals.signalEscalations.length - 1](_this2.child.pid);
    })();
  }

  waitForServerAvailable() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      for (let remaining = connectAttempts; remaining > 0; remaining--) {
        if (!_this3.child) {
          log('Child closed unexpectedly');
          break;
        }

        log('Waiting for server to become available. Attempts remaining: ', remaining);

        const { ok, socket } = yield connect(_this3.runConfig);

        if (ok) {
          socket.end();
          return;
        } else {
          yield _bluebird2.default.delay(connectDelayMS);
        }
      }

      throw new Error('Unable to connect to server.');
    })();
  }

  waitForServerUnavailable() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      for (let remaining = connectAttempts; remaining > 0; remaining--) {
        if (_this4.isStopping) {
          log('Runner stopping');
          break;
        }

        log('Waiting for server to become unavailable. Attempts remaining: ', remaining);

        const { ok, socket } = yield connect(_this4.runConfig);

        if (ok) {
          // wait for the socket to fail
          socket.end();
          yield _bluebird2.default.delay(connectDelayMS);
        } else {
          return;
        }
      }

      throw new Error('Timed out waiting for server to exit.');
    })();
  }
}

exports.Runner = Runner;
function spawn(cmd, opts) {
  const [proc, ...args] = (0, _shellQuote.parse)(cmd);
  return (0, _crossSpawn2.default)(proc, args, opts);
}

function connect({ host, port, timeout = connectTimeoutDelay }) {
  log('connect', { host, port, timeout });

  return new _bluebird2.default(resolve => {
    const socket = (0, _net.createConnection)(port, host);

    socket.setTimeout(timeout);

    socket.once('connect', () => resolve({ ok: true, socket })).once('error', error => resolve({ ok: false, error }));
  });
}

function getMergedOutputs(child) {
  const out = new _stream.PassThrough();

  child.stdout.pipe(out);
  child.stderr.pipe(out);

  return (0, _getStream2.default)(out);
}
//# sourceMappingURL=runner.js.map