#! /usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import * as commander from 'commander';

import spider from './src/spider';
import * as events from './interfaces/events';
import createLogger from './src/logger';
import { exitOnError } from 'winston';
const logger = createLogger('archer')

const scanners = fs
  .readdirSync(path.join(__dirname, 'scanners'))
  .map(file => require('./scanners/' + file).default);

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
        .map((cookie) => spider(report.url, [cookie]))
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
      .map((url) => spider(url, [], scanner.callback))
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
