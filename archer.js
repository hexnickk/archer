#! /usr/bin/env node

const commander = require('commander');
const path = require('path');
const fs = require('fs');
const spider = require('./src/spider');
const logger = require('./src/logger')('archer');

function main() {
  fs
    .readdirSync(path.join(__dirname, 'scanners'))
    .forEach(file => {
      const scanner = require('./scanners/' + file);
      for( let generatedURL of scanner.generate(new URL(commander.url))) {
        const page = spider.testUrl(generatedURL);
        page.subscribe(
          scanner.analyse,
          err => logger.err(err),
          () => logger.info(`${file} completed`)
        );
      }
    });
}

commander
  .option('-u, --url <url>', 'Web site to analyse')
  .parse(process.argv);

main();
