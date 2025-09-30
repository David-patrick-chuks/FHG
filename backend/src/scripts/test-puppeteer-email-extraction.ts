import { PuppeteerExtractor } from '../services/email-extractor/PuppeteerExtractor';
import { Logger } from '../utils/Logger';

/**
 * Test script for Puppeteer URL email extraction functionality
 * This script tests the existing modularized email extraction logic on real URLs
 */
class PuppeteerUrlEmailExtractionTester {
  private static logger: Logger = new Logger();

  /**
   * Test URLs for real-world extraction
   */
  private static readonly TEST_URLS = [
    'https://www.bzenpaws.com', // E-commerce site with checkout
    // Add your test URLs here
  ];

  /**
   * Run URL email extraction tests
   */
  public static async runUrlTests(): Promise<void> {
    console.log('🧪 Starting Puppeteer URL Email Extraction Tests...\n');
    
    try {
      // Test checkout extraction first (priority)
      await this.testCheckoutExtraction();
      
      // Test regular URL extraction
      await this.testUrlExtraction();
      
      console.log('\n✅ All URL tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }

  /**
   * Test URL email extraction using Puppeteer
   */
  private static async testUrlExtraction(): Promise<void> {
    console.log('🌐 Testing URL Email Extraction with Puppeteer...\n');
    
    for (const url of this.TEST_URLS) {
      try {
        console.log(`Testing URL: ${url}`);
        const startTime = Date.now();
        
        const extractedEmails = await PuppeteerExtractor.extractEmailsWithPuppeteer(url);
        const duration = Date.now() - startTime;
        
        console.log(`  📧 Found ${extractedEmails.length} emails:`, extractedEmails);
        console.log(`  ⏱️  Extraction time: ${duration}ms`);
        console.log('');
        
      } catch (error) {
        console.error(`  ❌ Error testing URL ${url}:`, error);
      }
    }
  }

  /**
   * Test checkout extraction specifically
   */
  public static async testCheckoutExtraction(): Promise<void> {
    console.log('🛒 Testing Checkout Email Extraction...\n');
    
    for (const url of this.TEST_URLS) {
      try {
        console.log(`Testing Checkout Extraction for: ${url}`);
        const startTime = Date.now();
        
        // Import PuppeteerExtractor to access the private method
        const { PuppeteerExtractor } = await import('../services/email-extractor/PuppeteerExtractor');
        
        // We'll need to create a new method that only does checkout extraction
        const extractedEmails = await this.testCheckoutOnly(url);
        const duration = Date.now() - startTime;
        
        console.log(`  📧 Found ${extractedEmails.length} emails via checkout:`, extractedEmails);
        console.log(`  ⏱️  Checkout extraction time: ${duration}ms`);
        console.log('');
        
      } catch (error) {
        console.error(`  ❌ Error testing checkout for ${url}:`, error);
      }
    }
  }

  /**
   * Test checkout extraction only (bypassing regular crawling)
   */
  private static async testCheckoutOnly(url: string): Promise<string[]> {
    console.log('  🛍️ Running checkout-only extraction...');
    return await PuppeteerExtractor.extractEmailsFromCheckoutOnly(url);
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
    process.env.LOG_LEVEL = 'debug';
    
    console.log('🚀 Starting Puppeteer URL Email Extraction Test...\n');
    
    // Check for special flags
    const args = process.argv.slice(2);
    const checkoutOnly = args.includes('--checkout-only');
    const customUrls = args.filter(arg => !arg.startsWith('--'));
    
    if (customUrls.length > 0) {
      console.log('Using custom URLs from command line:');
      customUrls.forEach(url => {
        PuppeteerUrlEmailExtractionTester.addTestUrl(url);
      });
    }
    
    if (checkoutOnly) {
      console.log('🛒 Running CHECKOUT-ONLY tests...\n');
      await PuppeteerUrlEmailExtractionTester.testCheckoutExtraction();
    } else {
      // Run full URL tests
      await PuppeteerUrlEmailExtractionTester.runUrlTests();
    }
    
    console.log('\n🎉 URL tests completed successfully!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  }
}

export { PuppeteerUrlEmailExtractionTester };

// Direct checkout test - uncomment to run immediately
async function testCheckoutDirectly() {
  console.log('🛒 Testing checkout extraction directly...\n');
  
  try {
    const url = 'https://www.bzenpaws.com';
    console.log(`Testing checkout extraction for: ${url}`);
    
    const startTime = Date.now();
    const emails = await PuppeteerExtractor.extractEmailsFromCheckoutOnly(url);
    const duration = Date.now() - startTime;
    
    console.log(`📧 Found ${emails.length} emails:`, emails);
    console.log(`⏱️  Extraction time: ${duration}ms`);
    
  } catch (error) {
    console.error('❌ Direct checkout test failed:', error);
  }
}

// Uncomment the line below to run direct checkout test
testCheckoutDirectly();

