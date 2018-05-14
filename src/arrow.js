const puppeteer = require('puppeteer');

const logger = require('../utils/logger');

async function testUrl(url) {
  const browser = await puppeteer.launch({
    executablePath: 'google-chrome-stable',
    args: ['--disable-xss-auditor'],
  });
  try {
    const page = await browser.newPage();
    page.on('dialog', async dialog => {
      logger.info(`alert with message: ${dialog.message()}`);
      await dialog.accept();
    });
    await page.goto(url);
    await page.screenshot({path: 'test.png'});
  } catch (err) {
    logger.error(err);
  }

  await browser.close();
}

exports.testUrl = testUrl;