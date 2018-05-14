const logger = require('../src/logger')('debug');

const scanner = {
  analyze: (report) => {
    logger.debug(`url: ${report.url}`);
    logger.debug(`event: ${report.event}`);
    logger.debug(`content: ${report.content}`);
  },
  generate: (url) => [url],
};

module.exports = scanner;