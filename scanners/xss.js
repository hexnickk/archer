const logger = require('../src/logger')('xss');
const events = require('../interfaces/events');
const path = require('path');
const fs = require('fs');

const payloads = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/payloads.json')));

const fuzzForms = async (page, url) => {
  logger.debug('fuzzing inputs to detect dom xss');
  for (const payload of payloads.reflected) {
    const pageForms = await page.$$('form');
    for (const pageForm of pageForms) {
      const formInputs = await pageForm.asElement().$$('input');
      await Promise.all(formInputs.map((element) => element.type(payload)));

      const formButton = await pageForm.$('[onclick]');
      if (formButton) {
        await page.evaluate((element) => element.dispatchEvent(new Event('click')), formButton);
        await page.waitFor(100);
      }
    }
    await page.goto(url);
  }
};

const submitForms = async(page, url) => {
  logger.debug('submiting inputs with xss payload');
  for (const payload of payloads.reflected) {
    const pageForm = await page.$('form');
    if (pageForm) {
      const formInputs = await pageForm.asElement().$$('input');
      await Promise.all(formInputs.map((element) => element.type(payload)));
      await page.evaluate((form) => form.submit(), pageForm);
      await page.waitFor(100);
      await page.goto(url);
    } else {
      logger.debug('No forms found');
    }
  }
};

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
  },
  callback: async (page, url) => {
    await fuzzForms(page, url);
    await submitForms(page, url);
  },
};

module.exports = scanner;
