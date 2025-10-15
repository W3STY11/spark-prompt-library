import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function viewFinalPrompt() {
  console.log('🔍 Opening the final test prompt with image fix...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // View Complete Test with Image - FINAL
  console.log('📄 Opening "Complete Test with Image - FINAL"...');
  await page.goto('http://localhost:3002/prompts/prompt_1760467912079_7g4x9haqb.html', { waitUntil: 'networkidle2' });
  await delay(2000);

  console.log('📸 Taking full-page screenshot to verify image display...');
  await page.screenshot({ path: 'final-prompt-with-image-fix.png', fullPage: true });

  console.log('\n✅ Screenshot saved: final-prompt-with-image-fix.png');
  console.log('⏸️  Browser stays open for 10 seconds for manual inspection...');

  await delay(10000);

  await browser.close();
  console.log('\n🏁 Done! Image display should be visible in the screenshot.\n');
}

viewFinalPrompt().catch(console.error);
