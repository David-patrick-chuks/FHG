import puppeteer from 'puppeteer';
import { Logger } from '../../utils/Logger';
import { EmailParser } from './EmailParser';
import { UrlUtils } from './UrlUtils';

export class PuppeteerExtractor {
  private static logger: Logger = new Logger();
  private static readonly PUPPETEER_TIMEOUT = 15000; // Reduced from 30s to 15s for faster extraction
  private static readonly CONTACT_PATHS = [
    '/contact', '/contact-us', '/about', '/about-us', '/support'
  ];
  private static readonly BUSINESS_PATHS = [
    '/business', '/team', '/company'
  ];
  private static readonly COMMON_CHECKOUT_PATHS = [
    '/checkout', '/cart', '/payment'
  ];

  /**
   * Extract emails using Puppeteer - Enhanced deep scanning
   */
  public static async extractEmailsWithPuppeteer(url: string): Promise<string[]> {
    let browser;
    const found = new Set<string>();
    const scannedUrls = new Set<string>();

    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.NODE_ENV === "production" 
          ? process.env.PUPPETEER_EXECUTABLE_PATH 
          : undefined,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Visit main page
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: this.PUPPETEER_TIMEOUT 
      });
      
      // Wait for dynamic content to load
      await page.waitForTimeout(3000);
      
      const content = await page.content();
      EmailParser.extractEmailsFromHtml(content).forEach(email => found.add(email));
      scannedUrls.add(url);

      // Try to click on contact/email related elements
      try {
        const contactSelectors = [
          'a[href*="contact"]',
          'a[href*="about"]',
          'a[href*="support"]',
          'a[href*="help"]',
          'a[href*="mailto"]',
          '[data-email]',
          '[data-contact]',
          '.contact',
          '.email',
          '.support'
        ];

        for (const selector of contactSelectors) {
          try {
            const elements = await page.$$(selector);
            for (const element of elements.slice(0, 3)) { // Limit to 3 elements per selector
              try {
                await element.click();
                await page.waitForTimeout(2000);
                const newContent = await page.content();
                EmailParser.extractEmailsFromHtml(newContent).forEach(email => found.add(email));
              } catch (error) {
                // Element not clickable, continue
              }
            }
          } catch (error) {
            // Selector not found, continue
          }
        }
      } catch (error) {
        PuppeteerExtractor.logger.warn('Error clicking contact elements', { url, error });
      }

      // Try all predefined paths with Puppeteer
      const allPaths = [
        ...this.CONTACT_PATHS,
        ...this.BUSINESS_PATHS,
        ...this.COMMON_CHECKOUT_PATHS
      ];

      for (const path of allPaths.slice(0, 10)) { // Limit to 10 paths
        const testUrl = UrlUtils.normalizeUrl(url, path);
        if (testUrl && !scannedUrls.has(testUrl)) {
          try {
            PuppeteerExtractor.logger.info('Puppeteer visiting path', { url: testUrl });
            await page.goto(testUrl, { 
              waitUntil: 'networkidle2', 
              timeout: this.PUPPETEER_TIMEOUT 
            });
            await page.waitForTimeout(2000);
            
            const html = await page.content();
            EmailParser.extractEmailsFromHtml(html).forEach(email => found.add(email));
            scannedUrls.add(testUrl);
          } catch (error: any) {
            // Only log unexpected errors, not common failures like 404s or timeouts
            const errorMessage = error?.message || 'Unknown error';
            if (!errorMessage.includes('404') && 
                !errorMessage.includes('timeout') && 
                !errorMessage.includes('net::ERR_NAME_NOT_RESOLVED')) {
              PuppeteerExtractor.logger.warn('Puppeteer failed to access path', { url: testUrl, error: errorMessage });
            }
          }
        }
      }

      // Try to extract emails from JavaScript execution
      try {
        const jsEmails = await page.evaluate(() => {
          const emails: string[] = [];
          // Look for emails in global variables
          const globalWindow = (globalThis as any).window || (globalThis as any);
          for (const key in globalWindow) {
            if (typeof globalWindow[key] === 'string' && globalWindow[key].includes('@')) {
              const matches = globalWindow[key].match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g);
              if (matches) emails.push(...matches);
            }
          }
          return emails;
        });
        jsEmails.forEach(email => found.add(email));
      } catch (error) {
        PuppeteerExtractor.logger.warn('Error extracting emails from JavaScript', { url, error });
      }

      return Array.from(found);
    } catch (error: any) {
      // Only log unexpected errors, not common browser launch failures
      const errorMessage = error?.message || 'Unknown error';
      if (!errorMessage.includes('Could not find browser') && 
          !errorMessage.includes('Failed to launch')) {
        PuppeteerExtractor.logger.error('Puppeteer extraction failed', { url, error: errorMessage });
      }
      return Array.from(found);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
