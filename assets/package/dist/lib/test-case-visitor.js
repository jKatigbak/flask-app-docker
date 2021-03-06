'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTestCaseVisitor = createTestCaseVisitor;

var _gherkin_document_parser = require('cucumber/lib/formatter/helpers/gherkin_document_parser');

var _pickle_parser = require('cucumber/lib/formatter/helpers/pickle_parser');

var _keyword_type = require('cucumber/lib/formatter/helpers/keyword_type');

var _keyword_type2 = _interopRequireDefault(_keyword_type);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createTestCaseVisitor({ gherkinDocument, pickle, testCase }) {
  const stepLineToKeywordMap = (0, _gherkin_document_parser.getStepLineToKeywordMap)(gherkinDocument);
  const stepLineToPickledStepMap = (0, _pickle_parser.getStepLineToPickledStepMap)(pickle);

  return {
    testCase,
    pickle,
    *getSteps() {
      let previousKeywordType = _keyword_type2.default.PRECONDITION;

      for (const testStep of testCase.steps) {
        if (!testStep.sourceLocation) continue;

        const pickleStep = stepLineToPickledStepMap[testStep.sourceLocation.line];
        const keyword = (0, _pickle_parser.getStepKeyword)({ pickleStep, stepLineToKeywordMap });
        const keywordType = (0, _keyword_type.getStepKeywordType)({
          keyword,
          language: gherkinDocument.feature.language,
          previousKeywordType
        });

        yield {
          testStep, pickleStep, keyword, keywordType,
          get dataTable() {
            return pickleStep.arguments.length === 1 && pickleStep.arguments[0].hasOwnProperty('rows') && pickleStep.arguments[0];
          },
          get docString() {
            return pickleStep.arguments.length === 1 && pickleStep.arguments[0].hasOwnProperty('content') && pickleStep.arguments[0];
          }
        };

        previousKeywordType = keywordType;
      }
    }
  };
}
//# sourceMappingURL=test-case-visitor.js.map