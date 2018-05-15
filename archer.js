#! /usr/bin/env node

const commander = require('commander');
const path = require('path');
const fs = require('fs');

const spider = require('./src/spider');
const events = require('./interfaces/events');
const logger = require('./src/logger')('archer');


const requestIntercepter = (report) => {
  if (report.event == events.ChangingStateRequest) {
    const method = report.content.method;
    const url = report.content.url;
    const headers = JSON.stringify(report.content.headers, null, 4);
    const postData = report.content.postData;
    logger.debug(`got changing state request:\n ${method} ${url}\n${headers}\n\n${postData}`);
  }
};


function main() {
  fs
    .readdirSync(path.join(__dirname, 'scanners'))
    .forEach(file => {
      const scanner = require('./scanners/' + file);
      const urls = scanner.generate(commander.url);
      const page = spider.testURLs(urls);
      page.subscribe(scanner.analyse);
      page.subscribe(requestIntercepter);
    });
}


commander
  .option('-u, --url <url>', 'Web site to analyse')
  .parse(process.argv);

main();
