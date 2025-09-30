import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use stealth plugin to avoid detection
puppeteerExtra.use(StealthPlugin());

/**
 * Simple Puppeteer email extraction test
 * This bypasses the complex EmailParser and tests basic extraction
 */
class SimplePuppeteerTester {
  /**
   * Test URLs for real-world extraction
   */
  public static readonly TEST_URLS: string[] = [];

  /**
   * Simple email extraction using basic regex
   */
  private static extractEmailsFromText(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Test URL email extraction using Puppeteer
   */
  private static async testUrlExtraction(): Promise<void> {
    console.log('🌐 Testing URL Email Extraction with Simple Puppeteer...\n');
    
    let browser;
    
    try {
      // Launch browser
      browser = await puppeteerExtra.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-blink-features=AutomationControlled'
        ]
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      for (const url of this.TEST_URLS) {
        try {
          console.log(`Testing URL: ${url}`);
          const startTime = Date.now();
          
          // Navigate to URL
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
          
          // Wait for content to load
          await page.waitForTimeout(3000);
          
          // Extract all text content
          const textContent = await page.evaluate(() => {
            return document.body.innerText || document.body.textContent || '';
          });
          
          // Extract emails from text
          const extractedEmails = this.extractEmailsFromText(textContent);
          const duration = Date.now() - startTime;
          
          console.log(`  📧 Found ${extractedEmails.length} emails:`, extractedEmails);
          console.log(`  ⏱️  Extraction time: ${duration}ms`);
          console.log('');
          
        } catch (error) {
          console.error(`  ❌ Error testing URL ${url}:`, error);
        }
      }
      
    } catch (error) {
      console.error('❌ Browser setup failed:', error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Run URL tests
   */
  public static async runUrlTests(): Promise<void> {
    console.log('🧪 Starting Simple Puppeteer URL Email Extraction Tests...\n');
    
    try {
      await this.testUrlExtraction();
      console.log('\n✅ All URL tests completed successfully!');
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }
}

// Main execution function
async function main() {
  try {
    console.log('🚀 Starting Simple Puppeteer URL Email Extraction Test...\n');
    
    // Check if custom URLs are provided via command line
    const customUrls = process.argv.slice(2);
    if (customUrls.length > 0) {
      console.log('Using custom URLs from command line:');
      customUrls.forEach(url => {
        SimplePuppeteerTester.TEST_URLS.push(url);
      });
    } else {
      console.log('❌ No URLs provided. Please specify URLs as arguments.');
      console.log('Usage: npm run test:puppeteer:simple https://example.com');
      process.exit(1);
    }
    
    // Run URL tests
    await SimplePuppeteerTester.runUrlTests();
    
    console.log('\n🎉 URL tests completed successfully!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { SimplePuppeteerTester };
