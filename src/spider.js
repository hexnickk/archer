const puppeteer = require('puppeteer');
const Rx = require('rxjs/Rx');

const logger = require('./logger')('arrow');
const config = require('../config');
const report = require('../interfaces/report');
const events = require('../interfaces/events');


// const interceptAddEventListners = (elementsWithEvents) => {
//   HTMLElement.prototype._origAddEventListener = HTMLElement.prototype.addEventListener;
//   HTMLElement.prototype.addEventListener = function(event) {
//     elementsWithEvents.push([this, event]);
//     HTMLElement.prototype._origAddEventListener.apply(this, arguments);
//   };
// };


const openURL = async (page, url, messageObservable) => {
  // intercept POST, PUT, .. requests
  await page.setRequestInterception(true);
  page.on('request', interceptedRequest => {
    const method = interceptedRequest.method();
    if (method != 'GET' && method != 'HEAD') {
      messageObservable.next(report(
        page.url(),
        events.ChangingStateRequest,
        {
          url: interceptedRequest.url(),
          method: method,
          headers: interceptedRequest.headers(),
          postData: interceptedRequest.postData(),
        },
      ));
      interceptedRequest.abort();
    } else {
      interceptedRequest.continue();
    }
  });

  // catch alerts and prompts
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

  page.on('console', async msg => {
    logger.debug(`console message: ${msg.text()}`);
  });

  // notify every load and dom update
  const sendDOMUpdates = async () => {
    messageObservable.next(report(
      page.url(),
      events.DomUpdateEvent,
      await page.content(),
    ));
  };
  await page.exposeFunction('sendDOMUpdates', sendDOMUpdates);
  await page.evaluate(() => {
    console.log('hello');
    const targetNode = document.body;
    const config = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    };
    const callback = (mutationsList) => {
      for(const mutation of mutationsList) {
        console.log(mutation);
      }
      window.sendDOMUpdates();
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
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