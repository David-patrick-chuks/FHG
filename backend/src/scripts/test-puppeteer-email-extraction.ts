import { PuppeteerExtractor } from '../services/email-extractor/PuppeteerExtractor';
import { WhoisExtractor } from '../services/email-extractor/WhoisExtractor';
import { Logger } from '../utils/Logger';

/**
 * Comprehensive Email Extraction Test Suite
 * Tests the complete email extraction flow with all methods
 */
class EmailExtractionTester {
  private static logger: Logger = new Logger();

  /**
   * Test URLs for real-world extraction
   */
  private static readonly TEST_URLS = [
    'https://www.bzenpaws.com', // E-commerce site with checkout
 
  ];

  /**
   * Run complete email extraction tests
   */
  public static async runCompleteTests(): Promise<void> {
    console.log('🧪 Starting Complete Email Extraction Test Suite...\n');
    
    try {
      // Test individual methods
      await this.testIndividualMethods();
      
      // Test complete extraction flow
      await this.testCompleteFlow();
      
      console.log('\n✅ All email extraction tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    } finally {
      // Clean up browser
      try {
        await PuppeteerExtractor.closeBrowser();
        console.log('🔒 Browser closed successfully');
      } catch (error) {
        console.warn('⚠️ Failed to close browser:', error);
      }
    }
  }

  /**
   * Test individual extraction methods
   */
  public static async testIndividualMethods(): Promise<void> {
    console.log('🔧 Testing Individual Extraction Methods...\n');
    
    for (const url of this.TEST_URLS) {
      console.log(`\n📋 Testing URL: ${url}`);
      console.log('═'.repeat(80));
      
      try {
        // Test 1: Browser Initialization
        await this.testBrowserInitialization(url);
        
        // Test 2: E-commerce Checkout Extraction
        await this.testEcommerceCheckout(url);
        
        // Test 3: Homepage Analysis
        await this.testHomepageAnalysis(url);
        
        // Test 4: Contact Page Discovery
        await this.testContactPageDiscovery(url);
        
        // Test 5: Deep Crawling (only if no emails found yet)
        await this.testDeepCrawling(url);
        
        // Test 6: WHOIS Lookup
        await this.testWhoisLookup(url);
        
      } catch (error) {
        console.error(`  ❌ Error testing URL ${url}:`, error);
      }
    }
  }

  /**
   * Test browser initialization
   */
  private static async testBrowserInitialization(url: string): Promise<void> {
    console.log('\n🌐 Testing Browser Initialization...');
    try {
      const startTime = Date.now();
      await PuppeteerExtractor.initializeBrowserForExtraction();
      const duration = Date.now() - startTime;
      console.log(`  ✅ Browser initialized successfully in ${duration}ms`);
    } catch (error) {
      console.error(`  ❌ Browser initialization failed:`, error);
      throw error;
    }
  }

  /**
   * Test e-commerce checkout extraction
   */
  private static async testEcommerceCheckout(url: string): Promise<void> {
    console.log('\n🛒 Testing E-commerce Checkout Extraction...');
    try {
      const startTime = Date.now();
      const emails = await PuppeteerExtractor.extractEmailsFromEcommerceCheckout(url);
      const duration = Date.now() - startTime;
      console.log(`  📧 Found ${emails.length} emails via checkout:`, emails);
      console.log(`  ⏱️  Checkout extraction time: ${duration}ms`);
    } catch (error) {
      console.error(`  ❌ Checkout extraction failed:`, error);
    }
  }

  /**
   * Test homepage analysis
   */
  private static async testHomepageAnalysis(url: string): Promise<void> {
    console.log('\n🏠 Testing Homepage Analysis...');
    try {
      const startTime = Date.now();
      const emails = await PuppeteerExtractor.extractEmailsFromHomepage(url);
      const duration = Date.now() - startTime;
      console.log(`  📧 Found ${emails.length} emails on homepage:`, emails);
      console.log(`  ⏱️  Homepage analysis time: ${duration}ms`);
    } catch (error) {
      console.error(`  ❌ Homepage analysis failed:`, error);
    }
  }

  /**
   * Test contact page discovery
   */
  private static async testContactPageDiscovery(url: string): Promise<void> {
    console.log('\n📞 Testing Contact Page Discovery...');
    try {
      const startTime = Date.now();
      const emails = await PuppeteerExtractor.extractEmailsFromContactPages(url);
      const duration = Date.now() - startTime;
      console.log(`  📧 Found ${emails.length} emails from contact pages:`, emails);
      console.log(`  ⏱️  Contact discovery time: ${duration}ms`);
    } catch (error) {
      console.error(`  ❌ Contact page discovery failed:`, error);
    }
  }

  /**
   * Test deep crawling
   */
  private static async testDeepCrawling(url: string): Promise<void> {
    console.log('\n🔍 Testing Deep Site Crawling...');
    try {
      const startTime = Date.now();
      const emails = await PuppeteerExtractor.extractEmailsFromDeepCrawling(url);
      const duration = Date.now() - startTime;
      console.log(`  📧 Found ${emails.length} emails via deep crawling:`, emails);
      console.log(`  ⏱️  Deep crawling time: ${duration}ms`);
    } catch (error) {
      console.error(`  ❌ Deep crawling failed:`, error);
    }
  }

  /**
   * Test WHOIS lookup
   */
  private static async testWhoisLookup(url: string): Promise<void> {
    console.log('\n🌍 Testing WHOIS Database Lookup...');
    try {
      const startTime = Date.now();
      const emails = await WhoisExtractor.extractEmailsFromWhois(url);
      const duration = Date.now() - startTime;
      console.log(`  📧 Found ${emails.length} emails via WHOIS:`, emails);
      console.log(`  ⏱️  WHOIS lookup time: ${duration}ms`);
    } catch (error) {
      console.error(`  ❌ WHOIS lookup failed:`, error);
    }
  }

  /**
   * Test complete extraction flow (simulating real job)
   */
  public static async testCompleteFlow(): Promise<void> {
    console.log('\n🎯 Testing Complete Email Extraction Flow...\n');
    
    for (const url of this.TEST_URLS) {
      console.log(`\n📋 Complete Flow Test for: ${url}`);
      console.log('═'.repeat(80));
      
      try {
        // Simulate the complete extraction process
        const startTime = Date.now();
        
        // Step 1: Browser Initialization
        console.log('\n🌐 Step 1: Browser Initialization');
        await PuppeteerExtractor.initializeBrowserForExtraction();
        
        // Step 2: E-commerce Checkout (Most effective)
        console.log('\n🛒 Step 2: E-commerce Checkout Extraction');
        let allEmails = new Set<string>();
        const checkoutEmails = await PuppeteerExtractor.extractEmailsFromEcommerceCheckout(url);
        checkoutEmails.forEach(email => allEmails.add(email));
        console.log(`  Found ${checkoutEmails.length} emails via checkout`);
        
        // Step 3: Homepage Analysis
        console.log('\n🏠 Step 3: Homepage Analysis');
        const homepageEmails = await PuppeteerExtractor.extractEmailsFromHomepage(url);
        homepageEmails.forEach(email => allEmails.add(email));
        console.log(`  Found ${homepageEmails.length} emails on homepage`);
        
        // Step 4: Contact Page Discovery
        console.log('\n📞 Step 4: Contact Page Discovery');
        const contactEmails = await PuppeteerExtractor.extractEmailsFromContactPages(url);
        contactEmails.forEach(email => allEmails.add(email));
        console.log(`  Found ${contactEmails.length} emails from contact pages`);
        
        // Step 5: Deep Crawling (only if no emails found)
        if (allEmails.size === 0) {
          console.log('\n🔍 Step 5: Deep Site Crawling (no emails found yet)');
          const crawlEmails = await PuppeteerExtractor.extractEmailsFromDeepCrawling(url);
          crawlEmails.forEach(email => allEmails.add(email));
          console.log(`  Found ${crawlEmails.length} emails via deep crawling`);
        } else {
          console.log('\n🔍 Step 5: Deep Site Crawling (skipped - emails already found)');
        }
        
        // Step 6: WHOIS Lookup
        console.log('\n🌍 Step 6: WHOIS Database Lookup');
        const whoisEmails = await WhoisExtractor.extractEmailsFromWhois(url);
        whoisEmails.forEach(email => allEmails.add(email));
        console.log(`  Found ${whoisEmails.length} emails via WHOIS`);
        
        // Step 7: Final Results
        const finalEmails = Array.from(allEmails);
        const duration = Date.now() - startTime;
        
        console.log('\n📊 Final Results:');
        console.log(`  📧 Total unique emails found: ${finalEmails.length}`);
        console.log(`  📧 Emails: ${finalEmails.join(', ')}`);
        console.log(`  ⏱️  Total extraction time: ${duration}ms`);
        console.log(`  🎯 Extraction efficiency: ${finalEmails.length > 0 ? 'SUCCESS' : 'NO EMAILS FOUND'}`);
        
      } catch (error) {
        console.error(`  ❌ Complete flow test failed for ${url}:`, error);
      }
    }
  }

  /**
   * Test specific method only
   */
  public static async testSpecificMethod(method: string, url?: string): Promise<void> {
    const testUrl = url || this.TEST_URLS[0];
    
    console.log(`🧪 Testing ${method} method for: ${testUrl}\n`);
    
    try {
      await PuppeteerExtractor.initializeBrowserForExtraction();
      
      switch (method.toLowerCase()) {
        case 'checkout':
          await this.testEcommerceCheckout(testUrl);
          break;
        case 'homepage':
          await this.testHomepageAnalysis(testUrl);
          break;
        case 'contact':
          await this.testContactPageDiscovery(testUrl);
          break;
        case 'deep':
          await this.testDeepCrawling(testUrl);
          break;
        case 'whois':
          await this.testWhoisLookup(testUrl);
          break;
        default:
          console.error(`❌ Unknown method: ${method}`);
          console.log('Available methods: checkout, homepage, contact, deep, whois');
      }
    } catch (error) {
      console.error(`❌ Method test failed:`, error);
    } finally {
      await PuppeteerExtractor.closeBrowser();
    }
  }

  /**
   * Add a custom URL to test
   */
  public static addTestUrl(url: string): void {
    this.TEST_URLS.push(url);
    console.log(`Added test URL: ${url}`);
  }

  /**
   * Clear all test URLs
   */
  public static clearTestUrls(): void {
    this.TEST_URLS.length = 0;
    console.log('Cleared all test URLs');
  }

  /**
   * List current test URLs
   */
  public static listTestUrls(): void {
    console.log('Current test URLs:');
    this.TEST_URLS.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
  }
}

// Main execution function
async function main() {
  try {
    // Set environment variables for testing
    process.env.LOG_LEVEL = 'info';
    process.env.NODE_ENV = 'development'; // Use development mode for testing
    
    console.log('🚀 Starting Comprehensive Email Extraction Test Suite...\n');
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const method = args.find(arg => arg.startsWith('--method='))?.split('=')[1];
    const url = args.find(arg => arg.startsWith('--url='))?.split('=')[1];
    const individualOnly = args.includes('--individual-only');
    const completeOnly = args.includes('--complete-only');
    const customUrls = args.filter(arg => !arg.startsWith('--') && !arg.includes('='));
    
    // Add custom URLs if provided
    if (customUrls.length > 0) {
      console.log('Using custom URLs from command line:');
      customUrls.forEach(url => {
        EmailExtractionTester.addTestUrl(url);
      });
    }
    
    // Add URL from --url parameter
    if (url) {
      EmailExtractionTester.addTestUrl(url);
    }
    
    // Run specific test based on arguments
    if (method) {
      await EmailExtractionTester.testSpecificMethod(method, url);
    } else if (individualOnly) {
      console.log('🔧 Running INDIVIDUAL METHOD tests only...\n');
      await EmailExtractionTester.testIndividualMethods();
    } else if (completeOnly) {
      console.log('🎯 Running COMPLETE FLOW tests only...\n');
      await EmailExtractionTester.testCompleteFlow();
    } else {
      // Run complete test suite
      await EmailExtractionTester.runCompleteTests();
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  }
}

export { EmailExtractionTester };

// Command line usage examples:
// npm run test:extraction -- --method=checkout --url=https://example.com
// npm run test:extraction -- --individual-only
// npm run test:extraction -- --complete-only
// npm run test:extraction -- https://example.com https://another-site.com

// Run main function if this script is executed directly
if (require.main === module) {
  main();
}

