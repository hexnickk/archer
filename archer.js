#! /usr/bin/env node

const commander = require('commander');
const path = require('path');
const fs = require('fs');
const spider = require('./src/spider');
// const logger = require('./src/logger')('archer');

function main() {
  fs
    .readdirSync(path.join(__dirname, 'scanners'))
    .forEach(file => {
      const scanner = require('./scanners/' + file);
      const urls = scanner.generate(commander.url);
      spider.testURLs(urls).subscribe(scanner.analyse);
    });
}

commander
  .option('-u, --url <url>', 'Web site to analyse')
  .parse(process.argv);

main();
