import puppeteer from 'puppeteer';

async function viewRealPrompt() {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Opening existing library prompt...');
  await page.goto('http://localhost:3002/prompts/00034c3b30f1850fa58c16c9f7145319.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: 'existing-library-prompt-structure.png', fullPage: true });
  console.log('✅ Screenshot saved: existing-library-prompt-structure.png');

  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
}

viewRealPrompt().catch(console.error);
