const puppeteer = require('puppeteer');
const Rx = require('rxjs/Rx');

// const logger = require('../utils/logger')('arrow');
const report = require('../interfaces/report');
const events = require('../interfaces/events');

const browse = async (url, messageObservable) => {
  const browser = await puppeteer.launch({
    executablePath: 'google-chrome-stable',
    args: ['--disable-xss-auditor'],
  });
  browser.on('disconnected', () => messageObservable.complete());

  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    const eventTranslation = {
      'alert': events.AlertEvent,
      'prompt': events.PromptEvent,
      'confirm': events.ConfirmEvent,
      'beforeunload': events.BeforeunloadEvent,
    };
    messageObservable.next(report(
      page.url(),
      eventTranslation[dialog.type()],
      dialog.message(),
    ));
    await dialog.accept();
  });
  page.on('load', async () => {
    messageObservable.next(report(
      page.url(),
      events.PageLoadEvent,
      await page.content(),
    ));
  });

  await page.goto(url);
  // let all callbacks to perform
  await page.waitFor(100);
  await browser.close();
};


const testUrl = (url) => {
  const messageObservable = new Rx.Subject();
  browse(url, messageObservable);
  return messageObservable;
};


exports.testUrl = testUrl;