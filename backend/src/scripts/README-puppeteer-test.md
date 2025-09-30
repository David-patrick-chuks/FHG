# Puppeteer Email Extraction Test Script

This script tests the existing modularized Puppeteer email extraction functionality in your backend services.

## Overview

The test script (`test-puppeteer-email-extraction.ts`) validates the email extraction logic using your existing services:

- `PuppeteerExtractor` - For browser-based email extraction
- `EmailParser` - For HTML content email parsing
- `HtmlFetcher` - For fetching HTML content

## Features

### Test Categories

1. **HTML Email Extraction Tests**
   - Tests various HTML patterns with embedded emails
   - Validates obfuscated email detection
   - Tests JSON-LD structured data extraction
   - Business email pattern recognition

2. **Puppeteer Email Extraction Tests**
   - Tests browser-based email extraction
   - Validates JavaScript-obfuscated emails
   - Tests form input extraction
   - Meta tag email extraction

3. **Performance Tests**
   - Measures extraction speed
   - Tests multiple iterations
   - Provides performance metrics

4. **Real URL Tests** (Optional)
   - Tests extraction from real websites
   - Validates against live content

### Test Cases

The script includes comprehensive test cases for:

- Simple HTML with emails
- Obfuscated emails (`[at]`, `(at)`, `[dot]`, `(dot)`)
- JavaScript-obfuscated emails
- JSON-LD structured data
- Business email patterns
- International domains
- Plus signs in emails
- False positive filtering

## Usage

### Run Basic Tests
```bash
npm run test:puppeteer
```

### Run Tests with Real URLs
```bash
npm run test:puppeteer:urls
```

### Run from Backend Directory
```bash
cd backend
npm run test:puppeteer
```

## Environment Variables

- `TEST_REAL_URLS=true` - Enable real URL testing
- `LOG_LEVEL=debug` - Enable debug logging

## Output

The script provides detailed output including:

- ✅ Test results for each category
- 📧 Found emails with counts
- ⏱️ Performance metrics
- 📊 Performance analysis
- 📋 Test report generation

## Example Output

```
🧪 Starting Puppeteer Email Extraction Tests...

📋 Testing HTML Email Extraction...

Testing: Simple HTML with emails
  📧 Found 5 emails: ['contact@example.com', 'support@company.org', ...]
  ⏱️  Extraction time: 15ms
  ✅ Found 5/5 expected emails

🤖 Testing Puppeteer Email Extraction...

Testing Puppeteer with HTML content...
  📧 Found 6 emails: ['contact@example.com', 'support@company.org', ...]
  ⏱️  Extraction time: 1250ms

⚡ Testing Performance Metrics...

Running 10 iterations for performance testing...
  📊 Performance Results:
    Average time: 12.5ms
    Min time: 8ms
    Max time: 18ms
    Total time: 125ms

✅ All tests completed successfully!
```

## Integration

This test script integrates seamlessly with your existing backend services and uses the same modularized architecture. It doesn't require any additional dependencies beyond what's already in your `package.json`.

## Troubleshooting

If tests fail:

1. Ensure Puppeteer dependencies are installed
2. Check that Chrome/Chromium is available
3. Verify environment variables are set correctly
4. Check network connectivity for real URL tests

## Extending Tests

To add new test cases:

1. Add new test cases to `TEST_CASES` array
2. Add new URLs to `TEST_URLS` array
3. Create new test methods following the existing pattern
4. Update the main test runner to include new tests
