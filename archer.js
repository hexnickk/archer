#! /usr/bin/env node

const commander = require('commander');
const path = require('path');
const fs = require('fs');
const spider = require('./src/spider');
const logger = require('./utils/logger')('archer');

function main() {
  const page = spider.testUrl(new URL(commander.url));
  fs
    .readdirSync(path.join(__dirname, 'scanners'))
    .forEach(file => {
      const payload = require('./scanners/' + file);
      page.subscribe(
        payload,
        err => logger.err(err),
        () => logger.info(`${file} completed`)
      );
    });
}

commander
  .option('-u, --url <url>', 'Web site to analyse')
  .parse(process.argv);

main();
