const logger = require('../src/logger')('xss');
const events = require('../interfaces/events');
const path = require('path');
const fs = require('fs');

const scanner = {
  analyse: (report) => {
    if (report.event === events.AlertEvent && report.content == 1) {
      logger.info(`found xss: ${report.url}`);
    }
  },
  generate: (url) => {
    const baseURL = new URL(url);
    const newURLs = [baseURL];
    const fileData = fs.readFileSync(path.join(__dirname, '../config/payloads.json'));
    const payloads = JSON.parse(fileData);
    // TODO: rewrite with map
    for (let name of baseURL.searchParams.keys()) {
      for (let payload of payloads.reflected) {
        const newURL = new URL(url);
        newURL.searchParams.set(name, payload);
        newURLs.push(newURL);
      }
    }
    for (let payload of payloads.hash) {
      const newURL = new URL(url);
      newURL.hash = payload;
      newURLs.push(newURL);
    }
    return newURLs;
  }
};

module.exports = scanner;
