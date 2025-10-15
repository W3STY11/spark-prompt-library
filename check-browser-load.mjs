import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkBrowserLoad() {
  console.log('🔍 Checking if browser loads all prompts...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Listen for network requests
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('prompts_index.json')) {
        const size = response.headers()['content-length'];
        console.log(`📦 Loading prompts_index.json:`);
        console.log(`   URL: ${url}`);
        console.log(`   Status: ${response.status()}`);
        console.log(`   Size: ${size ? (parseInt(size) / 1024 / 1024).toFixed(2) + ' MB' : 'unknown'}`);
      }
    });

    console.log('📍 Navigating to browse page...');
    await page.goto('http://localhost:3002/browse.html', { waitUntil: 'networkidle2' });
    await delay(3000);

    // Check how many prompts are loaded in memory
    const promptsInMemory = await page.evaluate(() => {
      // Access the allPrompts variable from browse.js
      return window.allPrompts ? window.allPrompts.length : 'Variable not found';
    });

    console.log(`\n📊 Prompts loaded in browser memory: ${promptsInMemory}`);

    // Check the results count shown on page
    const resultsCount = await page.evaluate(() => {
      const elem = document.getElementById('resultsCount');
      return elem ? elem.textContent : 'Not found';
    });

    console.log(`📊 Results count shown on page: ${resultsCount}`);

    // Count prompt cards
    const cardCount = await page.evaluate(() => {
      return document.querySelectorAll('.prompt-card').length;
    });

    console.log(`📊 Prompt cards in DOM: ${cardCount}`);

    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'debug-browse-page.png', fullPage: false });

    await delay(3000);

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 Browser closed');
  }
}

checkBrowserLoad().catch(console.error);
