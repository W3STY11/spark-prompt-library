import puppeteer from 'puppeteer';

async function captureLivePrompt() {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Opening prompt from LIVE LIBRARY at localhost:3002...');

  // Go to browse page first
  await page.goto('http://localhost:3002/browse.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Click on first prompt card
  console.log('Clicking first prompt card...');
  await page.click('.prompt-card');
  await new Promise(r => setTimeout(r, 3000));

  console.log('Taking screenshot of how prompt appears in LIVE library...');
  await page.screenshot({ path: 'LIVE-LIBRARY-PROMPT-VIEW.png', fullPage: true });
  console.log('✅ Screenshot saved: LIVE-LIBRARY-PROMPT-VIEW.png');

  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
}

captureLivePrompt().catch(console.error);
