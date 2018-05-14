#! /usr/bin/env node

const commander = require('commander');
const path = require('path');
const fs = require('fs');
const spider = require('./src/spider');
const logger = require('./utils/logger')('archer');

function main() {
  fs
    .readdirSync(path.join(__dirname, 'payloads'))
    .forEach(file => {
      const payload = require('./payloads/' + file);
      spider
        .testUrl(new URL(commander.url))
        .subscribe(
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
