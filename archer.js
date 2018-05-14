#! /usr/bin/env node

const puppeteer = require('puppeteer');
const commander = require('commander');

async function testUrl(url) {
  const browser = await puppeteer.launch({
    executablePath: 'google-chrome-stable',
    args: ['--disable-xss-auditor'],
  });
  try {
    const page = await browser.newPage();
    page.on('dialog', async dialog => {
      console.info(`Got alert with message: ${dialog.message()}`);
      await dialog.accept();
    });
    await page.goto(url);
    await page.screenshot({path: 'test.png'});
  } catch (err) {
    console.error(err);
  }

  await browser.close();
}

commander
  .option('-u, --url <url>', 'Web site to analyse')
  .parse(process.argv);

testUrl(commander.url);
