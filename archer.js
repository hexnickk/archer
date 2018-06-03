#! /usr/bin/env node

const commander = require('commander');
const path = require('path');
const fs = require('fs');

const spider = require('./src/spider');
const events = require('./interfaces/events');
const logger = require('./src/logger')('archer');

const scanners = fs
  .readdirSync(path.join(__dirname, 'scanners'))
  .map(file => require('./scanners/' + file));


const debugObserver = (report) => {
  const contentStr = String(report.content);
  const content = contentStr.substr(0, 25) + (contentStr.length > 25 ? '...' : '');
  logger.debug(`${report.event} from ${report.url} with content '${content}'`);
};

const requestIntercepter = (report) => {
  if (report.event == events.ChangingStateRequestEvent) {
    const method = report.content.method;
    const url = report.content.url;
    const headers = JSON.stringify(report.content.headers, null, 4);
    const postData = report.content.postData;
    logger.debug(`got changing state request:\n ${method} ${url}\n${headers}\n\n${postData}`);
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
          page.subscribe.debugObserver();
        });
    });
  }
};

function main() {
  scanners.map((scanner) => {
    scanner
      .generateURLs(commander.url)
      .map((url) => spider.testURL(url))
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

main();
