const logger = require('../utils/logger')('debug');

const payload = (report) => {
  logger.debug(`url: ${report.url}`);
  logger.debug(`event: ${report.event}`);
  logger.debug(`content: ${report.content}`);
};

module.exports = payload;