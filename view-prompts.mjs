import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function viewPrompts() {
  console.log('🔍 Opening both test prompt pages...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // View Puppeteer Test Prompt (WITHOUT image)
  console.log('📄 Opening Puppeteer Test Prompt...');
  await page.goto('http://localhost:3002/prompts/prompt_1760467289813_njwc4zzuh.html', { waitUntil: 'networkidle2' });
  await delay(2000);
  
  console.log('📸 Screenshot 1: Puppeteer Test Prompt (no image)');
  await page.screenshot({ path: 'prompt-1-without-image.png', fullPage: true });

  // View Test Prompt with Image
  console.log('\n📄 Opening Test Prompt with Image...');
  await page.goto('http://localhost:3002/prompts/prompt_1760467605901_x8ouhnaqe.html', { waitUntil: 'networkidle2' });
  await delay(2000);
  
  console.log('📸 Screenshot 2: Test Prompt with Image');
  await page.screenshot({ path: 'prompt-2-with-image.png', fullPage: true });

  console.log('\n✅ Screenshots saved:');
  console.log('   - prompt-1-without-image.png');
  console.log('   - prompt-2-with-image.png');
  console.log('\n⏸️  Browser stays open for 10 seconds...');

  await delay(10000);

  await browser.close();
  console.log('\n🏁 Done!\n');
}

viewPrompts().catch(console.error);
