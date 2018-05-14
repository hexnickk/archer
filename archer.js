#! /usr/bin/env node

const commander = require('commander');

const arrow = require('./src/arrow');

commander
  .option('-u, --url <url>', 'Web site to analyse')
  .parse(process.argv);

arrow.testUrl(commander.url);
