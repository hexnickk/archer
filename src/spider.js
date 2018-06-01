const puppeteer = require('puppeteer');
const Rx = require('rxjs/Rx');

const logger = require('./logger')('spider');
const config = require('../config');
const report = require('../interfaces/report');
const events = require('../interfaces/events');


const onRequest = (page, messageObservable) => (interceptedRequest) => {
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
};

const onDialog = (page, messageObservable) => async (dialog) => {
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
};

const onConsole = (page, messageObservable) => async (msg) => {
  messageObservable.next(report(
    page.url(),
    events.ConsoleMessageEvent,
    msg.text()
  ));
};

const setListners = async (page, messageObservable) => {
  // intercept POST, PUT, .. requests
  await page.setRequestInterception(true);
  page.on('request', onRequest(page, messageObservable));
  page.on('dialog', onDialog(page, messageObservable));
  page.on('console', onConsole(page, messageObservable));
};

const collectEvents = async (page, url) => {
  const events = [];
  const collectEvent = (element, event) => events.push([element, event]);
  await page.exposeFunction('collectEvent', collectEvent);
  await page.evaluateOnNewDocument(() => {
    HTMLElement.prototype._origAddEventListener = HTMLElement.prototype.addEventListener;
    HTMLElement.prototype.addEventListener = function(event) {
      window.collectEvent(this, event);
      HTMLElement.prototype._origAddEventListener.apply(this, arguments);
    };
  });

  await page.goto(url);

  const eventsBindings = [ 'click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup',
    'change', 'focus', 'blur', 'scroll', 'select', 'submit', 'keydown', 'keypress', 'keyup' ];
  for (const event of eventsBindings) {
    const elements = await page.$$(`[on${event}]`);
    for (const element of elements) {
      collectEvent(element, event);
    }
  }

  return events;
};

const openURL = async (page, url, messageObservable) => {
  setListners(page, messageObservable);

  const events = await collectEvents(page, url);
  for (const [element, event] of events) {
    logger.debug(`Dispatching ${event} on ${element}`);
    await page.evaluate((element, event) => element.dispatchEvent(new Event(event)), element, event);
  }

  // // notify every load and dom update
  // const sendDOMUpdates = async () => {
  //   messageObservable.next(report(
  //     page.url(),
  //     events.DomUpdateEvent,
  //     await page.content(),
  //   ));
  // };
  // await page.exposeFunction('sendDOMUpdates', sendDOMUpdates);
  // await page.evaluate(() => {
  //   console.log('hello');
  //   const targetNode = document.body;
  //   const config = {
  //     attributes: true,
  //     childList: true,
  //     characterData: true,
  //     subtree: true,
  //   };
  //   const callback = (mutationsList) => {
  //     for(const mutation of mutationsList) {
  //       console.log(mutation);
  //     }
  //     window.sendDOMUpdates();
  //   };
  //   const observer = new MutationObserver(callback);
  //   observer.observe(targetNode, config);
  // });

  await page.goto(url);
  // let all callbacks to finish actions
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


exports.testURL = (url) => {
  const messageObservable = new Rx.Subject();
  browseURL(url, messageObservable);
  return messageObservable;
};


const browseURLs = async (urls, messageObservable) => {
  const browser = await createBrowser(messageObservable);
  for (const url of urls) {
    const page = await browser.newPage();
    await openURL(page, url, messageObservable);
  }
  await browser.close();
};


exports.testURLs = (urls) => {
  const messageObservable = new Rx.Subject();
  browseURLs(urls, messageObservable);
  return messageObservable;
};
