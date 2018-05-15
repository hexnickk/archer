const puppeteer = require('puppeteer');
const Rx = require('rxjs/Rx');

// const logger = require('./logger')('arrow');
const config = require('../config/config');
const report = require('../interfaces/report');
const events = require('../interfaces/events');


const openURL = async (page, url, messageObservable) => {
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
  // let all callbacks to perform actions
  await page.waitFor(100);
};


// TODO: move browser creation to separate file as singleton
const createBrowser = async(messageObservable) => {
  const browser = await puppeteer.launch({
    executablePath: config.chrome.binary,
    args: config.chrome.args,
  });
  browser.on('disconnected', () => messageObservable.complete());
  return browser;
};


const browseURL = async (url, messageObservable) => {
  const browser = await createBrowser(messageObservable);

  const page = await browser.newPage();
  await openURL(page, url, messageObservable);

  await browser.close();
};


const browseURLs = async (urls, messageObservable) => {
  const browser = await createBrowser(messageObservable);

  for (const url of urls) {
    const page = await browser.newPage();
    await openURL(page, url, messageObservable);
  }

  await browser.close();
};


const testURL = (url) => {
  const messageObservable = new Rx.Subject();
  browseURL(url, messageObservable);
  return messageObservable;
};


const testURLs = (urls) => {
  const messageObservable = new Rx.Subject();
  browseURLs(urls, messageObservable);
  return messageObservable;
};


exports.testURL = testURL;
exports.testURLs = testURLs;