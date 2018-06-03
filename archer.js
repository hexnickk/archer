#! /usr/bin/env node

const path = require('path');
const fs = require('fs');
const commander = require('commander');

const spider = require('./src/spider');
const events = require('./interfaces/events');
const logger = require('./src/logger')('archer');

const scanners = fs
  .readdirSync(path.join(__dirname, 'scanners'))
  .map(file => require('./scanners/' + file));


const debugObserver = (report) => {
  let contentStr;
  if (typeof report.content !== 'string') {
    contentStr = JSON.stringify(report.content, null, 4);
  } else {
    contentStr = String(report.content);
    contentStr = contentStr.substr(0, 25) + (contentStr.length > 25 ? '...' : '');
  }
  logger.debug(`${report.event} from ${report.url} with content '${contentStr}'`);
};

const requestIntercepter = (report) => {
  if (report.event == events.ChangingStateRequestEvent) {
    const method = report.content.method;
    const url = report.content.url;
    const headers = JSON.stringify(report.content.headers, null, 4);
    const postData = report.content.postData;
    logger.debug(`Got state changins request:\n ${method} ${url}\n${headers}\n\n${postData}`);
  }
};

const cookiesObserver = (report) => {
  if (report.event === events.NewCookieEvent) {
    scanners.map((scanner) => {
      scanner
        .generateCookies(report.content)
        .map((cookie) => spider.testURL(report.url, [cookie]))
        .map((page) => {
          page.subscribe(scanner.analyse);
          page.subscribe(debugObserver);
          // TODO: check recursion
          // page.subscribe(debugObserver);
        });
    });
  }
};

function testUrl(url) {
  scanners.map((scanner) => {
    scanner
      .generateURLs(url)
      .map((url) => spider.testURL(url, [], scanner.callback))
      .map((page) => {
        page.subscribe(scanner.analyse);
        page.subscribe(requestIntercepter);
        page.subscribe(debugObserver);
        page.subscribe(cookiesObserver);
      });
  });
}

commander
  .option('-u, --url <url>', 'Web site to analyse')
  .parse(process.argv);

testUrl(commander.url);
