const logger = require('../utils/logger')('debug');

const events = require('../interfaces/events');

const payload = (report) => {
  if (report.event == events.AlertEvent && report.content == 1) {
    logger.info(`found xss: ${report.url}`);
  }
};

module.exports = payload;