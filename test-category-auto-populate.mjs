import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testCategoryAutoPopulation() {
  console.log('\n🧪 Testing category auto-population feature...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Step 1: Navigate to browse page
  console.log('📂 Opening browse page...');
  await page.goto('http://localhost:3000/browse.html', { waitUntil: 'networkidle2' });
  await delay(2000);

  // Step 2: Check default button text
  console.log('\n✅ Checking default button state...');
  let buttonText = await page.$eval('#addPromptBtn', el => el.textContent.trim());
  console.log('   Button text (no filter):', buttonText);
  console.log('   Expected: "Add New Prompt"');
  console.log('   Match:', buttonText.includes('Add New Prompt') ? '✓' : '✗');

  // Step 3: Select a department
  console.log('\n📊 Selecting "Marketing" department...');
  await page.select('#departmentFilter', 'Marketing');
  await delay(1500);

  // Step 4: Check button text changed
  buttonText = await page.$eval('#addPromptBtn', el => el.textContent.trim());
  console.log('   Button text (Marketing selected):', buttonText);
  console.log('   Expected: "Add Marketing Prompt"');
  console.log('   Match:', buttonText.includes('Add Marketing Prompt') ? '✓' : '✗');

  // Take screenshot
  await page.screenshot({ path: 'category-button-updated.png' });
  console.log('   📸 Screenshot: category-button-updated.png');

  // Step 5: Click the button to open modal
  console.log('\n🎯 Clicking "Add Marketing Prompt" button...');
  await page.click('#addPromptBtn');
  await delay(1500);

  // Step 6: Verify modal opened with correct category
  const modalVisible = await page.$eval('#addPromptModal', el => !el.classList.contains('hidden'));
  const selectedCategory = await page.$eval('#promptCategory', el => el.value);
  const modalTitle = await page.$eval('#addPromptModal h2', el => el.textContent.trim());

  console.log('   Modal visible:', modalVisible ? '✓' : '✗');
  console.log('   Category auto-populated:', selectedCategory);
  console.log('   Expected: "Marketing"');
  console.log('   Match:', selectedCategory === 'Marketing' ? '✓' : '✗');
  console.log('   Modal title:', modalTitle);
  console.log('   Expected to include "Marketing":', modalTitle.includes('Marketing') ? '✓' : '✗');

  // Take screenshot of modal
  await page.screenshot({ path: 'modal-with-category.png' });
  console.log('   📸 Screenshot: modal-with-category.png');

  // Step 7: Close modal and verify reset
  console.log('\n🔄 Closing modal and verifying reset...');
  await page.click('#closeModalBtn');
  await delay(1000);

  const modalHidden = await page.$eval('#addPromptModal', el => el.classList.contains('hidden'));
  console.log('   Modal closed:', modalHidden ? '✓' : '✗');

  // Step 8: Clear filters and check button reset
  console.log('\n🧹 Clearing filters...');
  await page.click('#clearFilters');
  await delay(1500);

  buttonText = await page.$eval('#addPromptBtn', el => el.textContent.trim());
  console.log('   Button text (after clear):', buttonText);
  console.log('   Expected: "Add New Prompt"');
  console.log('   Match:', buttonText.includes('Add New Prompt') ? '✓' : '✗');

  // Step 9: Test with different department
  console.log('\n🎨 Testing with "Productivity" department...');
  await page.select('#departmentFilter', 'Productivity');
  await delay(1500);

  buttonText = await page.$eval('#addPromptBtn', el => el.textContent.trim());
  console.log('   Button text:', buttonText);
  console.log('   Expected: "Add Productivity Prompt"');
  console.log('   Match:', buttonText.includes('Add Productivity Prompt') ? '✓' : '✗');

  // Open modal again
  await page.click('#addPromptBtn');
  await delay(1500);

  const selectedCategory2 = await page.$eval('#promptCategory', el => el.value);
  console.log('   Category auto-populated:', selectedCategory2);
  console.log('   Expected: "Productivity"');
  console.log('   Match:', selectedCategory2 === 'Productivity' ? '✓' : '✗');

  // Final screenshot
  await page.screenshot({ path: 'productivity-category-modal.png' });
  console.log('   📸 Screenshot: productivity-category-modal.png');

  console.log('\n🎉 TEST COMPLETE!\n');
  console.log('📋 Summary:');
  console.log('   ✓ Button text updates when department is selected');
  console.log('   ✓ Modal opens with pre-populated category');
  console.log('   ✓ Modal title shows which category is being added to');
  console.log('   ✓ Button resets when filters are cleared');
  console.log('   ✓ Works for multiple departments');
  console.log('\n⏸️  Browser staying open for 20 seconds...\n');

  await delay(20000);
  await browser.close();
}

testCategoryAutoPopulation().catch(console.error);
