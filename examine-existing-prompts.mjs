import puppeteer from 'puppeteer';
import fs from 'fs';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function examinePrompts() {
  // Read the index
  const index = JSON.parse(fs.readFileSync('/home/aiwithnick/Spark_AI_Prompt_Library_FINAL/public/prompts_index.json', 'utf-8'));

  // Filter out test prompts, get original ones only
  const originalPrompts = index.prompts.filter(p =>
    !p.title.toLowerCase().includes('test') &&
    !p.title.toLowerCase().includes('debug') &&
    !p.title.toLowerCase().includes('puppeteer')
  );

  // Pick 7 random prompts
  const randomPrompts = [];
  const used = new Set();
  while (randomPrompts.length < 7 && randomPrompts.length < originalPrompts.length) {
    const idx = Math.floor(Math.random() * originalPrompts.length);
    if (!used.has(idx)) {
      used.add(idx);
      randomPrompts.push(originalPrompts[idx]);
    }
  }

  console.log('📚 Examining 7 random existing prompts:\n');
  randomPrompts.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title} (${p.department})`);
  });

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  for (let i = 0; i < randomPrompts.length; i++) {
    const prompt = randomPrompts[i];
    console.log(`\n📄 Opening prompt ${i + 1}/${randomPrompts.length}: ${prompt.title}`);

    const url = `http://localhost:3002${prompt.file}`;
    await page.goto(url, { waitUntil: 'networkidle2' });
    await delay(2000);

    const filename = `existing-prompt-${i + 1}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`   ✅ Screenshot saved: ${filename}`);

    await delay(1000);
  }

  console.log('\n🏁 Done! Check the existing-prompt-*.png files');
  await delay(5000);
  await browser.close();
}

examinePrompts().catch(console.error);
