# Email Extraction Test Suite

This comprehensive test suite allows you to test the complete email extraction functionality locally, including all the new specific methods we've implemented.

## 🚀 Quick Start

### Run Complete Test Suite
```bash
# Test all methods for all URLs
npm run test:extraction

# Or run directly with Node
npx ts-node src/scripts/test-puppeteer-email-extraction.ts
```

### Test Specific Methods
```bash
# Test only checkout extraction
npm run test:extraction -- --method=checkout --url=https://www.bzenpaws.com

# Test only homepage analysis
npm run test:extraction -- --method=homepage --url=https://example.com

# Test only contact page discovery
npm run test:extraction -- --method=contact --url=https://example.com

# Test only deep crawling
npm run test:extraction -- --method=deep --url=https://example.com

# Test only WHOIS lookup
npm run test:extraction -- --method=whois --url=https://example.com
```

### Test Different Scopes
```bash
# Test individual methods only (no complete flow)
npm run test:extraction -- --individual-only

# Test complete flow only (no individual method testing)
npm run test:extraction -- --complete-only

# Test with custom URLs
npm run test:extraction -- https://example.com https://another-site.com
```

## 📋 Available Test Methods

| Method | Description | Command |
|--------|-------------|---------|
| **checkout** | E-commerce checkout extraction | `--method=checkout` |
| **homepage** | Homepage analysis | `--method=homepage` |
| **contact** | Contact page discovery | `--method=contact` |
| **deep** | Deep site crawling | `--method=deep` |
| **whois** | WHOIS database lookup | `--method=whois` |

## 🎯 Test Flow

### Individual Method Testing
Each method is tested independently:
1. **Browser Initialization** - Tests browser setup
2. **E-commerce Checkout** - Tests checkout extraction
3. **Homepage Analysis** - Tests homepage scanning
4. **Contact Page Discovery** - Tests contact page crawling
5. **Deep Site Crawling** - Tests comprehensive crawling
6. **WHOIS Lookup** - Tests domain registration lookup

### Complete Flow Testing
Simulates the real extraction job:
1. Initialize browser once
2. Run all extraction methods in sequence
3. Aggregate results from all methods
4. Show final email count and efficiency
5. Clean up browser resources

## 📊 Sample Output

```
🧪 Starting Complete Email Extraction Test Suite...

🔧 Testing Individual Extraction Methods...

📋 Testing URL: https://www.bzenpaws.com
════════════════════════════════════════════════════════════════════════════

🌐 Testing Browser Initialization...
  ✅ Browser initialized successfully in 1234ms

🛒 Testing E-commerce Checkout Extraction...
  📧 Found 2 emails via checkout: ["support@bzenpaws.com", "orders@bzenpaws.com"]
  ⏱️  Checkout extraction time: 5678ms

🏠 Testing Homepage Analysis...
  📧 Found 1 emails on homepage: ["info@bzenpaws.com"]
  ⏱️  Homepage analysis time: 2345ms

📞 Testing Contact Page Discovery...
  📧 Found 0 emails from contact pages: []
  ⏱️  Contact discovery time: 1234ms

🔍 Testing Deep Site Crawling...
  📧 Found 0 emails via deep crawling: []
  ⏱️  Deep crawling time: 4567ms

🌍 Testing WHOIS Database Lookup...
  📧 Found 0 emails via WHOIS: []
  ⏱️  WHOIS lookup time: 890ms

🎯 Testing Complete Email Extraction Flow...

📋 Complete Flow Test for: https://www.bzenpaws.com
════════════════════════════════════════════════════════════════════════════

🌐 Step 1: Browser Initialization
🛒 Step 2: E-commerce Checkout Extraction
  Found 2 emails via checkout
🏠 Step 3: Homepage Analysis
  Found 1 emails on homepage
📞 Step 4: Contact Page Discovery
  Found 0 emails from contact pages
🔍 Step 5: Deep Site Crawling (skipped - emails already found)
🌍 Step 6: WHOIS Database Lookup
  Found 0 emails via WHOIS

📊 Final Results:
  📧 Total unique emails found: 3
  📧 Emails: support@bzenpaws.com, orders@bzenpaws.com, info@bzenpaws.com
  ⏱️  Total extraction time: 15234ms
  🎯 Extraction efficiency: SUCCESS

🔒 Browser closed successfully
✅ All email extraction tests completed successfully!
```

## 🐳 Docker Testing

### Local Docker Testing
```bash
# Build the Docker image
docker build -f Dockerfile -t email-extractor-test .

# Run the test suite in Docker
docker run --rm email-extractor-test npm run test:extraction

# Test specific method in Docker
docker run --rm email-extractor-test npm run test:extraction -- --method=checkout --url=https://www.bzenpaws.com
```

### Production-like Testing
```bash
# Build with production settings
docker build -f Dockerfile -t email-extractor-prod --build-arg NODE_ENV=production .

# Run with production environment
docker run --rm -e NODE_ENV=production email-extractor-prod npm run test:extraction
```

## 🔧 Environment Configuration

The test suite automatically configures:
- **Development Mode**: `NODE_ENV=development` (visible browser)
- **Log Level**: `LOG_LEVEL=info` (detailed logging)
- **Browser Reuse**: Single browser instance across all tests
- **Auto Cleanup**: Browser closed after tests complete

## 🚨 Troubleshooting

### Browser Launch Issues
If you see browser launch errors:
```bash
# Test browser initialization only
npm run test:extraction -- --method=checkout --url=https://example.com
```

### Memory Issues
For large-scale testing:
```bash
# Test individual methods to reduce memory usage
npm run test:extraction -- --individual-only
```

### Network Issues
For slow networks:
```bash
# Test with timeout-friendly methods
npm run test:extraction -- --method=whois --url=https://example.com
```

## 📝 Adding New Test URLs

Edit the test file to add permanent URLs:
```typescript
private static readonly TEST_URLS = [
  'https://www.bzenpaws.com', // E-commerce site with checkout
  'https://example.com', // Basic test site
  'https://your-new-site.com', // Add your URL here
];
```

Or use command line:
```bash
npm run test:extraction -- https://your-new-site.com
```

## 🎯 Performance Expectations

| Method | Expected Time | Success Rate |
|--------|---------------|--------------|
| Browser Init | 1-3 seconds | 95%+ |
| Checkout | 5-15 seconds | 70%+ |
| Homepage | 2-5 seconds | 80%+ |
| Contact Pages | 10-30 seconds | 60%+ |
| Deep Crawling | 30-120 seconds | 50%+ |
| WHOIS Lookup | 1-3 seconds | 90%+ |

## 🔍 Debugging

Enable debug logging:
```bash
LOG_LEVEL=debug npm run test:extraction
```

Check browser paths:
```bash
# The test will show which Chrome/Chromium path was found
npm run test:extraction -- --method=checkout
```

Monitor resource usage:
```bash
# Watch memory and CPU usage during tests
top -p $(pgrep -f "test-puppeteer-email-extraction")
```
