const logger = require('../src/logger')('debug');
const events = require('../interfaces/events');

const payload = '</script><script>alert(1)</script>';

const scanner = {
  analyse: (report) => {
    if (report.event == events.AlertEvent && report.content == 1) {
      logger.info(`found xss: ${report.url}`);
    }
  },
  generate: (url) => {
    const baseURL = new URL(url);
    const newURLs = [];
    // TODO: rewrite with map
    for (let name of baseURL.searchParams.keys()) {
      const newURL = new URL(url);
      newURL.searchParams.set(name, payload);
      newURLs.push(newURL);
    }
    return newURLs;
  }
};

module.exports = scanner;