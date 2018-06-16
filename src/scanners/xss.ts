import * as path from 'path';
import * as fs from 'fs';
import { URL } from 'url';

import events from '../interfaces/events';
import createLogger from '../utils/logger';
const logger = createLogger('xss');

const payloads = {
  reflected: [
    '<script>alert(1)</script>',
    '</script><script>alert(1)</script>',
    '"\'><script>alert(1)</script>',
    'javascript:alert(1)',
  ],
  hash: [
    'alert(1)',
  ],
};

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

const submitForms = async (page, url) => {
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

export default {
  analyse: (report) => {
    if (report.event === events.AlertEvent && report.content === 1) {
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
    for (const name of baseURL.searchParams.keys()) {
      for (const payload of payloads.reflected) {
        const newURL = new URL(url);
        newURL.searchParams.set(name, payload);
        newURLs.push(newURL);
      }
    }
    for (const payload of payloads.hash) {
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
