'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cucumber = require('cucumber');

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _characters = require('./characters');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ScoreFormatter extends _cucumber.Formatter {
  constructor(options) {
    super(options);
    const { eventBroadcaster } = options;
    this.checkNew = options.checkNew;

    eventBroadcaster.on('test-run-finished', () => this.handleTestRunFinished());
  }
  handleTestRunFinished() {
    const table = new _cliTable2.default({
      head: ['Scenario', 'Points', 'Earned'],
      colAligns: ['left', 'right', 'right'],
      style: {
        head: ['bold', 'blue', 'inverse']
      },
      chars: {
        top: '─', 'top-mid': '─', 'top-left': '┌', 'top-right': '┐',
        bottom: '─', 'bottom-mid': '─', 'bottom-left': '└', 'bottom-right': '┘',
        left: '│', 'left-mid': '', mid: '', 'mid-mid': '',
        right: '│', 'right-mid': '', middle: ' '
      }
    });

    let totalPoints = 0;
    let totalEarned = 0;

    for (const _ref of getScenarios(this.eventDataCollector)) {
      const { name, status, tags } = _ref;

      const points = getPointValue(tags);
      const earned = status === _cucumber.Status.PASSED ? points : 0;

      totalPoints += points;
      totalEarned += earned;

      const color = this.colorFns[status];
      const indicator = _characters.statusCharacters[status];

      table.push([`${color(indicator)} ${name}`, points, color(earned)]);
    }

    table.push(['', '══════', '══════'], [this.colorFns.bold('TOTAL'), this.colorFns.bold(totalPoints), this.colorFns.bold(totalEarned)]);

    this.log(`${table.toString()}\n\n`);

    this.log(`FS_SCORE:${totalEarned}%\n`);
  }
}

exports.default = ScoreFormatter;
const pointRegexp = /^@points=(\d{1,2})$/;

function getPointValue(tags) {
  for (const tag of tags) {
    const matches = pointRegexp.exec(tag.name);
    if (matches) return +matches[1];
  }

  return 0;
}

function* getScenarios({ testCaseMap, pickleMap }) {
  for (const key in testCaseMap) {
    if (!testCaseMap.hasOwnProperty(key)) continue;

    const { name, tags } = pickleMap[key];
    const { result: { status } } = testCaseMap[key];

    yield { name, tags, status };
  }
}
module.exports = exports['default'];
//# sourceMappingURL=score-formatter.js.map