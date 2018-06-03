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
      events.ChangingStateRequestEvent,
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

const onDialog = (page, messageObservable) => (dialog) => {
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
  dialog.accept();
};

const onConsole = (page, messageObservable) => (msg) => {
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
  logger.debug('collecting events...');
  const events = [];
  const collectEvent = (element, event) => {
    logger.debug(`found ${element} with ${event}`);
    events.push([element, event]);
  };

  // Search for events in javascript
  await page.exposeFunction('collectEvent', collectEvent);
  await page.evaluateOnNewDocument(() => {
    HTMLElement.prototype._origAddEventListener = HTMLElement.prototype.addEventListener;
    HTMLElement.prototype.addEventListener = function(event) {
      window.collectEvent(this, event);
      HTMLElement.prototype._origAddEventListener.apply(this, arguments);
    };
  });

  await page.goto(url);
  // Search for events in html
  const eventsBindings = [ 'click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup',
    'change', 'focus', 'blur', 'scroll', 'select', 'submit', 'keydown', 'keypress', 'keyup' ];
  for (const event of eventsBindings) {
    const elements = await page.$$(`[on${event}]`);
    for (const element of elements) {
      collectEvent(element.asElement(), event);
    }
  }

  return events;
};

const collectLinks = async (page) => {
  logger.debug('collecting links...');
  const elements = await page.$$('a');
  return Promise.all(elements.map((element) => element.getProperty('href')));
};

const collectCookies = async (page, url, messageObservable) => {
  // collect current cookies
  logger.debug('collecting cookies...');
  await page.goto(url);
  const pageCookies = await page.cookies();
  pageCookies.map((pageCookie) => messageObservable.next(report(
    page.url(),
    events.NewCookieEvent,
    pageCookie,
  )));

  // subscribe to new cookies
  await page.exposeFunction('cookiesListner', (changeInfo) => {
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/cookies/onChanged
    if (!changeInfo.removed) {
      messageObservable.next(report(
        page.url(),
        events.NewCookieEvent,
        changeInfo.cookie
      ));
    }
  });
  await page.evaluateOnNewDocument(() => {
    browser.cookies.onChanged.addListener(window.cookiesListner);
  });
};

const openURL = async (page, url, messageObservable) => {
  logger.debug(`opening ${url}`);
  await collectCookies(page, url, messageObservable);
  await setListners(page, messageObservable);
  await page.goto(url);

  const pageEvents = await collectEvents(page, url);
  for (const [pageElement, pageEvent] of pageEvents) {
    logger.debug(`Dispatching ${pageEvent} on ${pageElement}`);
    await page.evaluate((element, event) => element.dispatchEvent(new Event(event)), pageElement, pageEvent);
    // TODO: drop changes
    // await page.goto(url);
  }

  const links = await collectLinks(page);
  links.map(async (link) => messageObservable.next(report(
    page.url(),
    events.NewUrlEvent,
    await link.jsonValue(),
  )));

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

  // let all callbacks to finish actions
  await page.waitFor(100);
};

const createBrowser = async(messageObservable) => {
  const browser = await puppeteer.launch({
    executablePath: config.chrome.binary,
    args: config.chrome.args,
    // headless: false,
    // slowMo: 250,
  });
  browser.on('disconnected', () => messageObservable.complete());
  return browser;
};

const testURL = async (url, cookies, messageObservable) => {
  const browser = await createBrowser(messageObservable);
  const page = await browser.newPage();
  cookies.map((cookie) => page.setCookie(cookie));
  await openURL(page, url, messageObservable);
  await browser.close();
};

exports.testURL = (url, cookies = []) => {
  const messageObservable = new Rx.Subject();
  testURL(url, cookies, messageObservable);
  return messageObservable;
};
