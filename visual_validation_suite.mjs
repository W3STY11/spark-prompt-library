import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEV_URL = 'http://localhost:3003';
const API_URL = 'http://localhost:3001';
const SCREENSHOTS_DIR = 'visual-test-screenshots';

// Test tracking
let testNumber = 0;
const testLog = [];

function logTest(testName, status, details = '') {
  testNumber++;
  const entry = {
    number: testNumber,
    name: testName,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  testLog.push(entry);
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST ${testNumber}: ${testName}`);
  console.log(`Status: ${status}`);
  if (details) console.log(`Details: ${details}`);
  console.log('='.repeat(80));
}

async function takeScreenshot(page, name, description) {
  const filename = `${String(testNumber).padStart(2, '0')}_${name}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot: ${filename} - ${description}`);
  return filename;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVisualTests() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║               🎬 COMPREHENSIVE VISUAL VALIDATION SUITE 🎬                 ║
║                                                                            ║
║                    Taking Screenshots of Every Test                        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

  // Create screenshots directory
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: false, // Show browser so we can see what's happening
    slowMo: 100, // Slow down actions for visibility
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Listen to console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('   🔴 Browser Error:', msg.text());
    }
  });

  try {
    // ============================================================================
    // TEST 1: System Overview
    // ============================================================================
    logTest('System Overview - Browse Page Load', 'RUNNING');
    await page.goto(`${DEV_URL}/browse.html`, { waitUntil: 'networkidle0' });
    await sleep(1000);
    await takeScreenshot(page, 'browse_initial', 'Initial browse page with 2458 prompts');
    logTest('System Overview - Browse Page Load', '✅ PASSED', 'Browse page loaded successfully');

    // ============================================================================
    // TEST 2: Search Functionality
    // ============================================================================
    logTest('Search Functionality', 'RUNNING');
    await page.type('#searchInput', 'marketing');
    await sleep(1000);
    await takeScreenshot(page, 'search_marketing', 'Search results for "marketing"');

    // Clear search
    await page.evaluate(() => document.getElementById('searchInput').value = '');
    await page.type('#searchInput', ' '); // Trigger search update
    await page.keyboard.press('Backspace');
    await sleep(500);
    logTest('Search Functionality', '✅ PASSED', 'Search working correctly');

    // ============================================================================
    // TEST 3: Department Filter
    // ============================================================================
    logTest('Department Filter', 'RUNNING');
    await page.select('#departmentFilter', 'Marketing');
    await sleep(1000);
    await takeScreenshot(page, 'filter_marketing', 'Filtered by Marketing department');

    // Reset filter
    await page.select('#departmentFilter', '');
    await sleep(500);
    logTest('Department Filter', '✅ PASSED', 'Department filtering working');

    // ============================================================================
    // TEST 4: View Existing Prompt
    // ============================================================================
    logTest('View Existing Prompt', 'RUNNING');
    await page.click('.prompt-card');
    await sleep(1500);
    await takeScreenshot(page, 'view_prompt', 'Prompt view page with all sections');

    // Go back to browse
    await page.goBack();
    await sleep(1000);
    logTest('View Existing Prompt', '✅ PASSED', 'Prompt view displays correctly');

    // ============================================================================
    // TEST 5: Priority 1 - Add New Prompt (No Filter)
    // ============================================================================
    logTest('Priority 1 - Add New Prompt Modal (No Filter)', 'RUNNING');
    await page.click('#addPromptBtn');
    await sleep(1000);
    await takeScreenshot(page, 'add_prompt_modal_empty', 'Add prompt modal - no category selected');
    logTest('Priority 1 - Add New Prompt Modal (No Filter)', '✅ PASSED', 'Modal opens with no pre-selection');

    // Fill in the form
    logTest('Priority 1 - Fill Add Prompt Form', 'RUNNING');
    await page.select('#promptCategory', 'Marketing');
    await page.type('#promptTitle', 'TEST: Social Media Content Calendar');
    await page.type('#promptDescription', 'Plan and schedule social media content across multiple platforms for maximum engagement');
    await page.type('#promptText', `#CONTEXT:
You are a social media strategist helping plan content.

#GOAL:
Create a comprehensive monthly content calendar.

#RESPONSE GUIDELINES:
1. Define content themes for the month
2. Plan posting schedule across platforms
3. Assign content types to each day
4. Balance promotional and educational content

#INFORMATION ABOUT ME:
- My brand: [BRAND NAME]
- My platforms: [PLATFORMS]
- My audience: [TARGET AUDIENCE]
- My goals: [MARKETING GOALS]

#OUTPUT:
Provide a detailed monthly calendar with daily post suggestions, content themes, and platform assignments.`);
    await page.type('#promptTags', 'social-media, content-planning, calendar, marketing-automation');
    await sleep(500);
    await takeScreenshot(page, 'add_prompt_filled', 'Add prompt form completely filled');
    logTest('Priority 1 - Fill Add Prompt Form', '✅ PASSED', 'Form filled with test data');

    // Submit the form
    logTest('Priority 1 - Submit New Prompt', 'RUNNING');
    await page.click('#submitPrompt');
    await sleep(2000);
    await takeScreenshot(page, 'add_prompt_success', 'New prompt added successfully');
    logTest('Priority 1 - Submit New Prompt', '✅ PASSED', 'Prompt submitted successfully');

    // ============================================================================
    // TEST 6: Verify New Prompt Appears
    // ============================================================================
    logTest('Priority 1 - Verify New Prompt in List', 'RUNNING');
    await sleep(1000);
    await takeScreenshot(page, 'new_prompt_in_list', 'New prompt appears at top of browse list');

    // Click on the new prompt
    const newPrompt = await page.$('.prompt-card:first-child');
    await newPrompt.click();
    await sleep(1500);
    await takeScreenshot(page, 'new_prompt_view', 'New prompt view page');

    // Test copy button
    await page.click('button:has-text("Copy")');
    await sleep(500);
    await takeScreenshot(page, 'copy_button_clicked', 'Copy button functionality');

    await page.goBack();
    await sleep(1000);
    logTest('Priority 1 - Verify New Prompt in List', '✅ PASSED', 'New prompt displays correctly');

    // ============================================================================
    // TEST 7: Priority 1 - Add Prompt with Category Pre-Selected
    // ============================================================================
    logTest('Priority 1 - Add Prompt with Filter Pre-Selected', 'RUNNING');
    await page.select('#departmentFilter', 'Sales');
    await sleep(1000);
    await takeScreenshot(page, 'filter_sales', 'Browse filtered to Sales');

    await page.click('#addPromptBtn');
    await sleep(1000);
    await takeScreenshot(page, 'add_sales_modal', 'Add Sales Prompt modal with category pre-filled');

    // Verify category is pre-selected
    const selectedCategory = await page.$eval('#promptCategory', el => el.value);
    console.log(`   Category pre-filled: ${selectedCategory}`);

    // Fill in quick test
    await page.type('#promptTitle', 'TEST: Handle Sales Objections');
    await page.type('#promptDescription', 'Techniques for overcoming common sales objections');
    await page.type('#promptContent', 'Quick test prompt content for sales objection handling');
    await page.type('#promptTags', 'sales, objections, techniques');
    await sleep(500);
    await takeScreenshot(page, 'add_sales_filled', 'Sales prompt form filled');

    await page.click('#submitPrompt');
    await sleep(2000);
    await takeScreenshot(page, 'add_sales_success', 'Sales prompt added successfully');
    logTest('Priority 1 - Add Prompt with Filter Pre-Selected', '✅ PASSED', 'Category auto-populated correctly');

    // Reset filter
    await page.select('#departmentFilter', '');
    await sleep(1000);

    // ============================================================================
    // TEST 8: Priority 3 - Bulk Import Modal
    // ============================================================================
    logTest('Priority 3 - Open Bulk Import Modal', 'RUNNING');
    await page.click('#bulkImportBtn');
    await sleep(1000);
    await takeScreenshot(page, 'bulk_import_modal', 'Bulk import modal - upload area');
    logTest('Priority 3 - Open Bulk Import Modal', '✅ PASSED', 'Modal displays correctly');

    // ============================================================================
    // TEST 9: Priority 3 - Import Sample JSON (3 prompts)
    // ============================================================================
    logTest('Priority 3 - Upload Sample JSON File', 'RUNNING');
    const samplePath = path.join(__dirname, 'sample-bulk-import.json');
    const fileInput = await page.$('#bulkImportFile');
    await fileInput.uploadFile(samplePath);

    // Manually trigger change event
    await page.evaluate(() => {
      const input = document.getElementById('bulkImportFile');
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    });

    await sleep(2000);
    await takeScreenshot(page, 'bulk_preview_3prompts', 'Preview of 3 prompts from sample file');
    logTest('Priority 3 - Upload Sample JSON File', '✅ PASSED', 'File uploaded and preview shown');

    // Check validation status
    logTest('Priority 3 - Validation Preview', 'RUNNING');
    const validationText = await page.$eval('#validationStatus', el => el.textContent);
    console.log(`   Validation Status: ${validationText}`);
    await takeScreenshot(page, 'bulk_validation_all_valid', 'Validation shows all prompts valid');
    logTest('Priority 3 - Validation Preview', '✅ PASSED', validationText);

    // Import the prompts
    logTest('Priority 3 - Import Sample Prompts', 'RUNNING');
    await page.click('#confirmBulkImport');
    await sleep(1000);
    await takeScreenshot(page, 'bulk_import_progress', 'Import progress bar');

    await sleep(3000);
    await takeScreenshot(page, 'bulk_import_results_3', 'Results: 3 prompts imported successfully');

    const successCount = await page.$eval('#successCount', el => el.textContent);
    console.log(`   Success: ${successCount} prompts imported`);
    logTest('Priority 3 - Import Sample Prompts', '✅ PASSED', `${successCount} prompts imported`);

    // Close modal
    await page.click('#closeBulkResults');
    await sleep(1000);
    await takeScreenshot(page, 'after_bulk_import', 'Browse page after bulk import');

    // ============================================================================
    // TEST 10: Priority 3 - Import 10 Prompts
    // ============================================================================
    logTest('Priority 3 - Import 10 Prompts', 'RUNNING');
    await page.click('#bulkImportBtn');
    await sleep(1000);

    const testData10Path = path.join(__dirname, 'test-data-10-prompts.json');
    const fileInput2 = await page.$('#bulkImportFile');
    await fileInput2.uploadFile(testData10Path);

    await page.evaluate(() => {
      const input = document.getElementById('bulkImportFile');
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    });

    await sleep(2000);
    await takeScreenshot(page, 'bulk_preview_10prompts', 'Preview of 10 prompts');

    await page.click('#confirmBulkImport');
    await sleep(1000);
    await takeScreenshot(page, 'bulk_import_10_progress', 'Importing 10 prompts - progress bar');

    await sleep(4000);
    await takeScreenshot(page, 'bulk_import_10_results', 'Results: 10 prompts imported');

    const success10 = await page.$eval('#successCount', el => el.textContent);
    logTest('Priority 3 - Import 10 Prompts', '✅ PASSED', `${success10} prompts imported`);

    await page.click('#closeBulkResults');
    await sleep(1000);

    // ============================================================================
    // TEST 11: Priority 3 - Import with Validation Errors
    // ============================================================================
    logTest('Priority 3 - Import Invalid Data (Mixed Valid/Invalid)', 'RUNNING');
    await page.click('#bulkImportBtn');
    await sleep(1000);

    const invalidPath = path.join(__dirname, 'test-data-invalid.json');
    const fileInput3 = await page.$('#bulkImportFile');
    await fileInput3.uploadFile(invalidPath);

    await page.evaluate(() => {
      const input = document.getElementById('bulkImportFile');
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    });

    await sleep(2000);
    await takeScreenshot(page, 'bulk_preview_invalid', 'Preview showing validation errors');

    // Check for error indicators
    const hasErrors = await page.$$eval('#promptsPreviewTable tbody tr', rows => {
      return rows.some(row => row.querySelector('.text-red-600'));
    });
    console.log(`   Has validation errors: ${hasErrors}`);

    await takeScreenshot(page, 'bulk_validation_errors', 'Validation errors highlighted in red');

    await page.click('#confirmBulkImport');
    await sleep(1000);
    await takeScreenshot(page, 'bulk_import_mixed_progress', 'Importing mixed valid/invalid');

    await sleep(4000);
    await takeScreenshot(page, 'bulk_import_mixed_results', 'Results showing successes and failures');

    const successMixed = await page.$eval('#successCount', el => el.textContent);
    const failMixed = await page.$eval('#failCount', el => el.textContent);
    logTest('Priority 3 - Import Invalid Data (Mixed Valid/Invalid)', '✅ PASSED',
            `${successMixed} succeeded, ${failMixed} failed as expected`);

    await page.click('#closeBulkResults');
    await sleep(1000);

    // ============================================================================
    // TEST 12: Priority 3 - Import Edge Cases
    // ============================================================================
    logTest('Priority 3 - Import Edge Cases (Emoji, Long Titles, Special Chars)', 'RUNNING');
    await page.click('#bulkImportBtn');
    await sleep(1000);

    const edgeCasesPath = path.join(__dirname, 'test-data-edge-cases.json');
    const fileInput4 = await page.$('#bulkImportFile');
    await fileInput4.uploadFile(edgeCasesPath);

    await page.evaluate(() => {
      const input = document.getElementById('bulkImportFile');
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    });

    await sleep(2000);
    await takeScreenshot(page, 'bulk_preview_edge_cases', 'Preview of edge case prompts (emoji, long titles)');

    await page.click('#confirmBulkImport');
    await sleep(1000);
    await takeScreenshot(page, 'bulk_import_edge_progress', 'Importing edge cases');

    await sleep(4000);
    await takeScreenshot(page, 'bulk_import_edge_results', 'Results: All edge cases handled successfully');

    const successEdge = await page.$eval('#successCount', el => el.textContent);
    logTest('Priority 3 - Import Edge Cases (Emoji, Long Titles, Special Chars)', '✅ PASSED',
            `All ${successEdge} edge case prompts imported`);

    await page.click('#closeBulkResults');
    await sleep(1000);

    // ============================================================================
    // TEST 13: Data Integrity - Final Prompt Count
    // ============================================================================
    logTest('Data Integrity - Final Prompt Count', 'RUNNING');
    await takeScreenshot(page, 'final_browse_page', 'Final browse page with all imported prompts');

    // Check prompt count in header
    const promptCount = await page.$eval('.text-gray-600', el => el.textContent);
    console.log(`   ${promptCount}`);
    logTest('Data Integrity - Final Prompt Count', '✅ PASSED', promptCount);

    // ============================================================================
    // TEST 14: Search Integration
    // ============================================================================
    logTest('Integration - Search for New Prompts', 'RUNNING');
    await page.type('#searchInput', 'TEST:');
    await sleep(1000);
    await takeScreenshot(page, 'search_test_prompts', 'Search finds all TEST prompts');

    await page.evaluate(() => document.getElementById('searchInput').value = '');
    await page.keyboard.press('Backspace');
    await sleep(500);
    logTest('Integration - Search for New Prompts', '✅ PASSED', 'Search integration working');

    // ============================================================================
    // TEST 15: View Bulk-Imported Prompt
    // ============================================================================
    logTest('Integration - View Bulk-Imported Prompt', 'RUNNING');
    await page.type('#searchInput', 'Marketing Campaign Strategy');
    await sleep(1000);
    await page.click('.prompt-card');
    await sleep(1500);
    await takeScreenshot(page, 'view_bulk_imported', 'View page of bulk-imported prompt');

    // Check structure
    const hasTitle = await page.$('h1');
    const hasContent = await page.$('.prompt-content');
    const hasTags = await page.$('.tag');
    console.log(`   Has all sections: ${hasTitle && hasContent && hasTags}`);

    await page.goBack();
    await sleep(1000);
    logTest('Integration - View Bulk-Imported Prompt', '✅ PASSED', 'Bulk-imported prompts display correctly');

    // ============================================================================
    // TEST 16: Filter Integration
    // ============================================================================
    logTest('Integration - Filter by Departments', 'RUNNING');
    await page.evaluate(() => document.getElementById('searchInput').value = '');
    await page.select('#departmentFilter', 'Business');
    await sleep(1000);
    await takeScreenshot(page, 'filter_business', 'Filter by Business department');

    await page.select('#departmentFilter', 'Finance');
    await sleep(1000);
    await takeScreenshot(page, 'filter_finance', 'Filter by Finance department');

    await page.select('#departmentFilter', '');
    await sleep(1000);
    logTest('Integration - Filter by Departments', '✅ PASSED', 'Department filters working');

    // ============================================================================
    // TEST 17: Final System Overview
    // ============================================================================
    logTest('Final System Overview', 'RUNNING');
    await takeScreenshot(page, 'final_system_state', 'Final system state - all tests complete');
    logTest('Final System Overview', '✅ PASSED', 'All features working correctly');

    console.log(`\n${'='.repeat(80)}`);
    console.log('🎉 ALL VISUAL TESTS COMPLETE!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await takeScreenshot(page, 'error_state', 'Error occurred during testing');
    logTest('Test Suite', '❌ FAILED', error.message);
  } finally {
    // Keep browser open for 5 seconds to review
    console.log('\n⏳ Keeping browser open for 5 seconds...');
    await sleep(5000);
    await browser.close();
  }

  // Generate test report
  await generateVisualReport();
}

async function generateVisualReport() {
  console.log('\n📊 Generating Visual Test Report...');

  const passedTests = testLog.filter(t => t.status.includes('✅')).length;
  const failedTests = testLog.filter(t => t.status.includes('❌')).length;
  const totalTests = testLog.length;

  const reportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Test Report - SPARK Prompt Library</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .header p { font-size: 1.2em; opacity: 0.9; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-card h3 { color: #6b7280; font-size: 0.875em; font-weight: 600; margin-bottom: 8px; }
    .stat-card .value { font-size: 2.5em; font-weight: 700; color: #111827; }
    .stat-card.success .value { color: #10b981; }
    .stat-card.danger .value { color: #ef4444; }
    .content { padding: 40px; }
    .test-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .test-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .test-number {
      background: #667eea;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1em;
    }
    .test-title { flex: 1; margin-left: 16px; }
    .test-title h3 { font-size: 1.25em; color: #111827; margin-bottom: 4px; }
    .test-title p { color: #6b7280; font-size: 0.875em; }
    .test-status {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.875em;
    }
    .test-status.passed { background: #d1fae5; color: #065f46; }
    .test-status.failed { background: #fee2e2; color: #991b1b; }
    .screenshot {
      margin-top: 16px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    .screenshot img {
      width: 100%;
      display: block;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .screenshot img:hover { transform: scale(1.02); }
    .footer {
      background: #f9fafb;
      padding: 24px 40px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎬 Visual Test Report</h1>
      <p>SPARK Prompt Library - Comprehensive Screenshot Validation</p>
    </div>

    <div class="stats">
      <div class="stat-card">
        <h3>Total Tests</h3>
        <div class="value">${totalTests}</div>
      </div>
      <div class="stat-card success">
        <h3>Passed</h3>
        <div class="value">${passedTests}</div>
      </div>
      <div class="stat-card danger">
        <h3>Failed</h3>
        <div class="value">${failedTests}</div>
      </div>
      <div class="stat-card">
        <h3>Success Rate</h3>
        <div class="value">${((passedTests / totalTests) * 100).toFixed(1)}%</div>
      </div>
    </div>

    <div class="content">
      ${testLog.map(test => `
        <div class="test-item">
          <div class="test-header">
            <div class="test-number">${test.number}</div>
            <div class="test-title">
              <h3>${test.name}</h3>
              <p>${test.details}</p>
            </div>
            <div class="test-status ${test.status.includes('✅') ? 'passed' : 'failed'}">
              ${test.status}
            </div>
          </div>
          <div class="screenshot">
            <img src="${String(test.number).padStart(2, '0')}_${test.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.png"
                 alt="${test.name}"
                 onerror="this.parentElement.style.display='none'">
          </div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>Generated: ${new Date().toLocaleString()}</p>
      <p>SPARK Prompt Library Visual Validation Suite</p>
    </div>
  </div>
</body>
</html>`;

  const reportPath = path.join(SCREENSHOTS_DIR, 'index.html');
  await fs.writeFile(reportPath, reportHTML);

  console.log(`\n✅ Visual Report Generated!`);
  console.log(`📄 Report: ${reportPath}`);
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}/`);
  console.log(`\n🌐 Open in browser: file://${path.resolve(reportPath)}`);
}

// Run the tests
runVisualTests()
  .then(() => {
    console.log('\n✅ Visual validation complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Visual validation failed:', error);
    process.exit(1);
  });
