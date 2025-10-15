import puppeteer from 'puppeteer';

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testAddPromptForm() {
  console.log('🚀 Starting Puppeteer test for Add New Prompt form...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Listen for console messages
    page.on('console', msg => {
      console.log('🌐 Browser:', msg.text());
    });

    // Listen for network requests
    page.on('request', request => {
      if (request.url().includes('/api/prompts')) {
        console.log('📤 API Request:', request.method(), request.url());
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/prompts')) {
        console.log('📥 API Response:', response.status(), response.url());
      }
    });

    // Navigate to browse page
    console.log('📍 Navigating to browse page...');
    await page.goto('http://localhost:3002/browse.html', { waitUntil: 'networkidle2' });
    await delay(2000);

    console.log('📸 Taking screenshot 1: Browse page loaded');
    await page.screenshot({ path: 'test-1-browse-page.png', fullPage: false });

    // Click "Add New Prompt" button
    console.log('🔘 Clicking "Add New Prompt" button...');
    await page.click('#addPromptBtn');
    await delay(1000);

    console.log('📸 Taking screenshot 2: Modal opened');
    await page.screenshot({ path: 'test-2-modal-open.png', fullPage: false });

    // Fill out the form
    console.log('📝 Filling out form fields...');

    // Select category
    await page.select('#promptCategory', 'Business');
    console.log('✅ Selected category: Business');

    // Fill title
    await page.type('#promptTitle', 'Puppeteer Test Prompt');
    console.log('✅ Filled title');

    // Fill description
    await page.type('#promptDescription', 'This is a test prompt created by Puppeteer automation to verify the Add New Prompt functionality works correctly.');
    console.log('✅ Filled description');

    // Fill prompt text
    await page.type('#promptText', 'This is the actual prompt content that would be used. It demonstrates that the form can capture and submit all required fields to the API successfully.');
    console.log('✅ Filled prompt text');

    // Fill tags
    await page.type('#promptTags', 'test, automation, puppeteer');
    console.log('✅ Filled tags');

    await delay(500);

    console.log('📸 Taking screenshot 3: Form filled out');
    await page.screenshot({ path: 'test-3-form-filled.png', fullPage: false });

    // Submit the form
    console.log('🚀 Submitting form...');
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/api/prompts') && response.status() === 200,
        { timeout: 10000 }
      ),
      page.click('#submitPromptBtn')
    ]);

    console.log('✅ Form submitted successfully!');
    await delay(2000);

    console.log('📸 Taking screenshot 4: After submission');
    await page.screenshot({ path: 'test-4-after-submit.png', fullPage: false });

    // Check if the new prompt appears in the grid
    console.log('🔍 Checking if new prompt appears in grid...');
    await delay(2000);

    const promptCards = await page.$$('.prompt-card');
    console.log(`📊 Found ${promptCards.length} prompt cards on page`);

    // Search for our test prompt
    const testPromptExists = await page.evaluate(() => {
      const cards = document.querySelectorAll('.prompt-card');
      for (const card of cards) {
        if (card.textContent.includes('Puppeteer Test Prompt')) {
          return true;
        }
      }
      return false;
    });

    if (testPromptExists) {
      console.log('✅ SUCCESS! New prompt appears in the browse grid!');
    } else {
      console.log('⚠️  New prompt not found in grid (may need to scroll or refresh)');
    }

    console.log('📸 Taking screenshot 5: Final browse view');
    await page.screenshot({ path: 'test-5-final-browse.png', fullPage: true });

    console.log('\n✨ Test completed! Check the screenshots:');
    console.log('   - test-1-browse-page.png');
    console.log('   - test-2-modal-open.png');
    console.log('   - test-3-form-filled.png');
    console.log('   - test-4-after-submit.png');
    console.log('   - test-5-final-browse.png');

    // Keep browser open for 5 seconds so user can see
    await delay(5000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('\n🏁 Browser closed');
  }
}

testAddPromptForm().catch(console.error);
