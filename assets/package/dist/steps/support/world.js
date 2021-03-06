'use strict';

var _cucumber = require('cucumber');

var _ramda = require('ramda');

var _requestDebug = require('request-debug');

var _requestDebug2 = _interopRequireDefault(_requestDebug);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _url = require('url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _cucumber.defineSupportCode)(({ Before, setWorldConstructor, eventBroadcaster, runner }) => {
  (0, _requestDebug2.default)(_requestPromise2.default, (type, data) => eventBroadcaster.emit(type, data));

  Before(function () {
    this.resetRequest();
  });

  setWorldConstructor(function ({ attach }) {
    let req, res;

    const request = _requestPromise2.default.defaults({
      json: true,
      useQuerystring: true,
      proxy: false,
      baseUrl: (0, _url.format)({
        protocol: 'http',
        hostname: '127.0.0.1',
        port: runner.runConfig.port
      }),
      simple: false,
      resolveWithFullResponse: true
    });

    function getResponse() {
      return res || (res = request(req));
    }

    return {
      request,
      attach,

      updateRequest(obj) {
        req = (0, _ramda.mergeDeepRight)(req, obj); // request opts don't have any arrays, so this should do fine.
      },

      getResponse,
      getResponseBody() {
        return getResponse().promise().get('body');
      },

      resetRequest() {
        req = {};
        res = null;
      }
    };
  });
});
//# sourceMappingURL=world.js.map