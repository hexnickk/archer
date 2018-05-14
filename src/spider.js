const puppeteer = require('puppeteer');
const Rx = require('rxjs/Rx');

// const logger = require('../utils/logger')('arrow');
const report = require('../interfaces/report');

const browse = async (url, messageObservable) => {
  const browser = await puppeteer.launch({
    executablePath: 'google-chrome-stable',
    args: ['--disable-xss-auditor'],
  });
  browser.on('disconnected', () => messageObservable.complete());

  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    messageObservable.next(report(
      page.url(),
      dialog.message(),
    ));
    await dialog.accept();
  });

  await page.goto(url);
  // await page.screenshot({path: 'test.png'});
  await browser.close();
};


const testUrl = (url) => {
  const messageObservable = new Rx.Subject();
  browse(url, messageObservable);
  return messageObservable;
};


exports.testUrl = testUrl;