import puppeteer from 'puppeteer';

async function checkPrompt() {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Go to the newest prompt
  await page.goto('http://localhost:3002/prompts/prompt_1760468644512_i4z5bqci1.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'current-new-prompt.png', fullPage: true });

  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
}

checkPrompt().catch(console.error);
