import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function showTestPrompts() {
  console.log('\n🚀 Opening browse page to show test prompts...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('📍 Navigating to browse page...');
  await page.goto('http://localhost:3002/browse.html', { waitUntil: 'networkidle2' });
  await delay(2000);

  console.log('📊 Counting total prompts loaded...');
  const totalCount = await page.evaluate(() => {
    const elem = document.getElementById('resultsCount');
    return elem ? elem.textContent : 'unknown';
  });
  console.log(`   Total prompts: ${totalCount}`);

  console.log('\n🔍 Searching for "test" to find our new prompts...');
  await page.type('#searchInput', 'test');
  await delay(2000);

  const searchResults = await page.$$('.prompt-card');
  console.log(`   Found ${searchResults.length} prompts with "test"`);

  console.log('\n📸 Taking screenshot of search results...');
  await page.screenshot({ path: 'final-test-prompts-view.png', fullPage: false });

  console.log('\n✅ Screenshot saved as: final-test-prompts-view.png');
  console.log('   You can see both test prompts in the browser now!');
  console.log('\n🌐 Browse page URL: http://localhost:3002/browse.html');
  console.log('\n⏸️  Browser will stay open for 30 seconds so you can explore...');

  await delay(30000);

  await browser.close();
  console.log('\n🏁 Browser closed\n');
}

showTestPrompts().catch(console.error);
