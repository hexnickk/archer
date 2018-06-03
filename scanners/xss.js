const logger = require('../src/logger')('xss');
const events = require('../interfaces/events');
const path = require('path');
const fs = require('fs');

const payloads = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/payloads.json')));

const scanner = {
  analyse: (report) => {
    if (report.event === events.AlertEvent && report.content == 1) {
      logger.info(`found xss: ${report.url}`);
    }
    if (report.event === events.NewUrlEvent && report.content.startsWith('javascript:')) {
      logger.info(`found xss on ${report.url}, there is redirect to javascript:`);
    }
  },
  generateURLs: (url) => {
    const baseURL = new URL(url);
    const newURLs = [baseURL];
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
  },
  generateCookies: (cookie) => {
    return payloads.reflected.map((payload) => {
      return {
        ...cookie,
        value: payload,
      };
    });
  }
};

module.exports = scanner;
