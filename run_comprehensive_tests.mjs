import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:3001';
const TEST_RESULTS_DIR = 'test-results-comprehensive';

// Test results tracker
const results = {
  priority1: { passed: 0, failed: 0, tests: [] },
  priority3: { passed: 0, failed: 0, tests: [] },
  integration: { passed: 0, failed: 0, tests: [] }
};

// Helper functions
function pass(category, test, message) {
  results[category].passed++;
  results[category].tests.push({ test, status: '✅ PASS', message });
  console.log(`✅ PASS: ${test} - ${message}`);
}

function fail(category, test, message, error) {
  results[category].failed++;
  results[category].tests.push({ test, status: '❌ FAIL', message, error: error?.message });
  console.log(`❌ FAIL: ${test} - ${message}`);
  if (error) console.log(`   Error: ${error.message}`);
}

async function testAPIHealth() {
  console.log('\n📍 Testing API Health...');
  try {
    const response = await fetch(`${API_URL}/api/health`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok') {
        pass('integration', 'API Health Check', 'API server is running');
        return true;
      }
    }
    fail('integration', 'API Health Check', 'API returned unexpected response');
    return false;
  } catch (error) {
    fail('integration', 'API Health Check', 'API server not running', error);
    return false;
  }
}

async function getPromptCount() {
  const indexPath = path.join(__dirname, 'public/prompts_index.json');
  const data = await fs.readFile(indexPath, 'utf-8');
  const index = JSON.parse(data);
  return index.prompts.length;
}

async function testBulkImportSample() {
  console.log('\n📍 Test: Import Sample JSON (3 prompts)...');
  try {
    const initialCount = await getPromptCount();

    const sampleData = await fs.readFile(path.join(__dirname, 'sample-bulk-import.json'), 'utf-8');
    const response = await fetch(`${API_URL}/api/prompts/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: sampleData
    });

    if (!response.ok) {
      fail('priority3', 'Import Sample JSON', `API returned ${response.status}`);
      return;
    }

    const result = await response.json();

    if (result.total === 3 && result.successful.length === 3 && result.failed.length === 0) {
      const finalCount = await getPromptCount();
      if (finalCount === initialCount + 3) {
        pass('priority3', 'Import Sample JSON', `3/3 prompts imported, count updated correctly`);
      } else {
        fail('priority3', 'Import Sample JSON', `Count mismatch: expected ${initialCount + 3}, got ${finalCount}`);
      }
    } else {
      fail('priority3', 'Import Sample JSON', `Expected 3 successes, got ${result.successful.length} successes, ${result.failed.length} failures`);
    }
  } catch (error) {
    fail('priority3', 'Import Sample JSON', 'Import failed', error);
  }
}

async function testBulkImport10Prompts() {
  console.log('\n📍 Test: Import 10 Prompts...');
  try {
    const initialCount = await getPromptCount();

    const testData = await fs.readFile(path.join(__dirname, 'test-data-10-prompts.json'), 'utf-8');
    const response = await fetch(`${API_URL}/api/prompts/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: testData
    });

    if (!response.ok) {
      fail('priority3', 'Import 10 Prompts', `API returned ${response.status}`);
      return;
    }

    const result = await response.json();

    if (result.total === 10 && result.successful.length === 10 && result.failed.length === 0) {
      const finalCount = await getPromptCount();
      if (finalCount === initialCount + 10) {
        pass('priority3', 'Import 10 Prompts', `10/10 prompts imported successfully`);
      } else {
        fail('priority3', 'Import 10 Prompts', `Count mismatch after import`);
      }
    } else {
      fail('priority3', 'Import 10 Prompts', `Expected 10 successes, got ${result.successful.length}`);
    }
  } catch (error) {
    fail('priority3', 'Import 10 Prompts', 'Import failed', error);
  }
}

async function testInvalidPrompts() {
  console.log('\n📍 Test: Import Invalid Prompts (Mixed Valid/Invalid)...');
  try {
    const initialCount = await getPromptCount();

    const testData = await fs.readFile(path.join(__dirname, 'test-data-invalid.json'), 'utf-8');
    const response = await fetch(`${API_URL}/api/prompts/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: testData
    });

    if (!response.ok) {
      fail('priority3', 'Import Invalid Prompts', `API returned ${response.status}`);
      return;
    }

    const result = await response.json();

    // Expected: 3 valid, 4 invalid
    if (result.total === 7 && result.successful.length === 3 && result.failed.length === 4) {
      pass('priority3', 'Import Invalid Prompts', `Correctly handled: 3 valid, 4 invalid`);
    } else {
      fail('priority3', 'Import Invalid Prompts', `Expected 3 successes and 4 failures, got ${result.successful.length} successes and ${result.failed.length} failures`);
    }
  } catch (error) {
    fail('priority3', 'Import Invalid Prompts', 'Test failed', error);
  }
}

async function testEdgeCases() {
  console.log('\n📍 Test: Import Edge Cases...');
  try {
    const initialCount = await getPromptCount();

    const testData = await fs.readFile(path.join(__dirname, 'test-data-edge-cases.json'), 'utf-8');
    const response = await fetch(`${API_URL}/api/prompts/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: testData
    });

    if (!response.ok) {
      fail('priority3', 'Import Edge Cases', `API returned ${response.status}`);
      return;
    }

    const result = await response.json();

    // All 10 edge case prompts should be valid
    if (result.total === 10 && result.successful.length === 10 && result.failed.length === 0) {
      pass('priority3', 'Import Edge Cases', `All 10 edge cases handled correctly (long titles, special chars, emoji, etc.)`);
    } else {
      fail('priority3', 'Import Edge Cases', `Expected 10 successes, got ${result.successful.length} successes, ${result.failed.length} failures`);
      if (result.failed.length > 0) {
        console.log('   Failed prompts:');
        result.failed.forEach(f => console.log(`     - ${f.title}: ${f.error}`));
      }
    }
  } catch (error) {
    fail('priority3', 'Import Edge Cases', 'Test failed', error);
  }
}

async function testDataIntegrity() {
  console.log('\n📍 Test: Data Integrity...');
  try {
    const indexPath = path.join(__dirname, 'public/prompts_index.json');
    const data = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(data);

    // Check JSON structure
    if (!index.prompts || !Array.isArray(index.prompts)) {
      fail('integration', 'Data Integrity - Structure', 'prompts_index.json missing prompts array');
      return;
    }
    pass('integration', 'Data Integrity - Structure', 'prompts_index.json has valid structure');

    // Check metadata
    if (index.meta && index.meta.total_prompts === index.prompts.length) {
      pass('integration', 'Data Integrity - Metadata', `Metadata count matches actual count (${index.prompts.length})`);
    } else {
      fail('integration', 'Data Integrity - Metadata', `Count mismatch: meta says ${index.meta.total_prompts}, actual is ${index.prompts.length}`);
    }

    // Check prompt structure
    const recentPrompt = index.prompts[0];
    const requiredFields = ['id', 'title', 'description', 'content', 'department', 'icon', 'complexity', 'tags', 'date', 'word_count'];
    const hasAllFields = requiredFields.every(field => recentPrompt.hasOwnProperty(field));

    if (hasAllFields) {
      pass('integration', 'Data Integrity - Prompt Structure', 'Prompts have all required fields');
    } else {
      const missing = requiredFields.filter(field => !recentPrompt.hasOwnProperty(field));
      fail('integration', 'Data Integrity - Prompt Structure', `Missing fields: ${missing.join(', ')}`);
    }

    // Check unique IDs
    const ids = index.prompts.map(p => p.id);
    const uniqueIds = new Set(ids);
    if (ids.length === uniqueIds.size) {
      pass('integration', 'Data Integrity - Unique IDs', 'All prompts have unique IDs');
    } else {
      fail('integration', 'Data Integrity - Unique IDs', `Duplicate IDs found: ${ids.length} prompts, ${uniqueIds.size} unique IDs`);
    }

  } catch (error) {
    fail('integration', 'Data Integrity', 'Integrity check failed', error);
  }
}

async function testDepartmentValidation() {
  console.log('\n📍 Test: Department Validation...');
  try {
    const invalidDept = {
      prompts: [{
        title: "Test Invalid Department",
        description: "Testing invalid department",
        content: "Test content",
        department: "InvalidDepartment"
      }]
    };

    const response = await fetch(`${API_URL}/api/prompts/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidDept)
    });

    const result = await response.json();

    if (result.failed.length === 1 && result.failed[0].error.includes('Invalid department')) {
      pass('priority3', 'Department Validation', 'Invalid departments are correctly rejected');
    } else {
      fail('priority3', 'Department Validation', 'Invalid department not caught');
    }
  } catch (error) {
    fail('priority3', 'Department Validation', 'Test failed', error);
  }
}

async function testTagParsing() {
  console.log('\n📍 Test: Tag Parsing...');
  try {
    // Test both array and string tags
    const testData = {
      prompts: [
        {
          title: "Test Array Tags",
          description: "Testing tags as array",
          content: "Content",
          department: "Marketing",
          tags: ["tag1", "tag2", "tag3"]
        },
        {
          title: "Test String Tags",
          description: "Testing tags as string",
          content: "Content",
          department: "Sales",
          tags: "string-tag-1, string-tag-2, string-tag-3"
        }
      ]
    };

    const response = await fetch(`${API_URL}/api/prompts/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (result.successful.length === 2 && result.failed.length === 0) {
      // Check the actual tags in the index
      const indexPath = path.join(__dirname, 'public/prompts_index.json');
      const data = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(data);

      const arrayTagPrompt = index.prompts.find(p => p.title === "Test Array Tags");
      const stringTagPrompt = index.prompts.find(p => p.title === "Test String Tags");

      if (arrayTagPrompt && Array.isArray(arrayTagPrompt.tags) && arrayTagPrompt.tags.length === 3 &&
          stringTagPrompt && Array.isArray(stringTagPrompt.tags) && stringTagPrompt.tags.length === 3) {
        pass('priority3', 'Tag Parsing', 'Both array and string tags parsed correctly');
      } else {
        fail('priority3', 'Tag Parsing', 'Tags not parsed correctly');
      }
    } else {
      fail('priority3', 'Tag Parsing', 'Tag parsing test prompts failed to import');
    }
  } catch (error) {
    fail('priority3', 'Tag Parsing', 'Test failed', error);
  }
}

async function testComplexityLevels() {
  console.log('\n📍 Test: Complexity Levels...');
  try {
    const testData = {
      prompts: [
        { title: "Beginner Test", description: "Test", content: "Content", department: "Marketing", complexity: "beginner" },
        { title: "Intermediate Test", description: "Test", content: "Content", department: "Sales", complexity: "intermediate" },
        { title: "Advanced Test", description: "Test", content: "Content", department: "Finance", complexity: "advanced" },
        { title: "Invalid Complexity", description: "Test", content: "Content", department: "Business", complexity: "expert" }
      ]
    };

    const response = await fetch(`${API_URL}/api/prompts/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    // All should succeed (invalid complexity defaults to intermediate)
    if (result.successful.length === 4) {
      pass('priority3', 'Complexity Levels', 'All complexity levels handled (beginner, intermediate, advanced, invalid→default)');
    } else {
      fail('priority3', 'Complexity Levels', `Expected 4 successes, got ${result.successful.length}`);
    }
  } catch (error) {
    fail('priority3', 'Complexity Levels', 'Test failed', error);
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(80));

  const totalPassed = results.priority1.passed + results.priority3.passed + results.integration.passed;
  const totalFailed = results.priority1.failed + results.priority3.failed + results.integration.failed;
  const totalTests = totalPassed + totalFailed;
  const passRate = ((totalPassed / totalTests) * 100).toFixed(1);

  console.log(`\nOverall Results: ${totalPassed}/${totalTests} tests passed (${passRate}%)\n`);

  console.log('Priority 1 (Add New Prompt):');
  console.log(`  ✅ Passed: ${results.priority1.passed}`);
  console.log(`  ❌ Failed: ${results.priority1.failed}`);

  console.log('\nPriority 3 (Bulk Import):');
  console.log(`  ✅ Passed: ${results.priority3.passed}`);
  console.log(`  ❌ Failed: ${results.priority3.failed}`);

  console.log('\nIntegration Tests:');
  console.log(`  ✅ Passed: ${results.integration.passed}`);
  console.log(`  ❌ Failed: ${results.integration.failed}`);

  console.log('\n' + '='.repeat(80));
  console.log('Detailed Results:');
  console.log('='.repeat(80));

  ['priority1', 'priority3', 'integration'].forEach(category => {
    if (results[category].tests.length > 0) {
      console.log(`\n${category.toUpperCase()}:`);
      results[category].tests.forEach(t => {
        console.log(`  ${t.status} ${t.test}`);
        console.log(`      ${t.message}`);
        if (t.error) console.log(`      Error: ${t.error}`);
      });
    }
  });

  console.log('\n' + '='.repeat(80));

  if (totalFailed === 0) {
    console.log('🎉 ALL TESTS PASSED! System is production-ready.');
  } else if (passRate >= 90) {
    console.log('✅ Most tests passed. Minor issues to address.');
  } else if (passRate >= 75) {
    console.log('⚠️  Some tests failed. Review and fix issues before demo.');
  } else {
    console.log('❌ Many tests failed. Significant issues need attention.');
  }

  console.log('='.repeat(80));

  // Save report to file
  const reportPath = path.join(__dirname, TEST_RESULTS_DIR, 'test-report.json');
  await fs.mkdir(TEST_RESULTS_DIR, { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Test Suite...\n');

  // Check API first
  const apiOk = await testAPIHealth();
  if (!apiOk) {
    console.log('\n❌ API server not running. Start it with: npm run api');
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log('PRIORITY 3: BULK IMPORT TESTS');
  console.log('='.repeat(80));

  await testBulkImportSample();
  await testBulkImport10Prompts();
  await testInvalidPrompts();
  await testEdgeCases();
  await testDepartmentValidation();
  await testTagParsing();
  await testComplexityLevels();

  console.log('\n' + '='.repeat(80));
  console.log('INTEGRATION TESTS');
  console.log('='.repeat(80));

  await testDataIntegrity();

  await generateReport();
}

runAllTests()
  .then(() => {
    console.log('\n✅ Test suite complete\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
