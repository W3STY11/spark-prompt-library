import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function viewManuallyFixedPrompt() {
  console.log('✅ Viewing manually fixed prompt with image section...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('📄 Opening manually fixed prompt...');
  await page.goto('http://localhost:3002/prompts/prompt_1760468269592_tolwxowvg.html', { waitUntil: 'networkidle2' });
  await delay(2000);

  // Check if image section exists
  const hasImageSection = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2'));
    return headings.some(h => h.textContent.includes('📷 Example Screenshot'));
  });

  console.log(`   Image section found: ${hasImageSection ? '✅ YES' : '❌ NO'}`);

  // Count images
  const imageCount = await page.evaluate(() => {
    return document.querySelectorAll('img[src*="/thumbnails/"]').length;
  });

  console.log(`   Images found: ${imageCount}`);

  // Check if images loaded
  const imageLoaded = await page.evaluate(() => {
    const img = document.querySelector('img[src*="/thumbnails/"]');
    return img ? img.complete && img.naturalHeight > 0 : false;
  });

  console.log(`   Image loaded successfully: ${imageLoaded ? '✅ YES' : '❌ NO'}`);

  console.log('\n📸 Taking full-page screenshot...');
  await page.screenshot({ path: 'manually-fixed-with-image.png', fullPage: true });

  console.log('\n✅ Screenshot saved: manually-fixed-with-image.png');
  console.log('⏸️  Browser stays open for 10 seconds...');

  await delay(10000);

  await browser.close();
  console.log('\n🏁 Done!\n');
}

viewManuallyFixedPrompt().catch(console.error);
