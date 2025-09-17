import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Logger } from '../../utils/Logger';
import { EmailParser } from './EmailParser';

// Use stealth plugin to avoid detection
puppeteerExtra.use(StealthPlugin());

export class PuppeteerExtractor {
  private static logger: Logger = new Logger();
  private static readonly PUPPETEER_TIMEOUT = 30000; // Increased for thorough extraction
  private static readonly CRAWL_DELAY_MS = 1500; // Delay between requests
  private static readonly MAX_PAGES = 50; // Maximum pages to crawl
  private static readonly MAX_DEPTH = 5; // Maximum crawl depth
  
  private static readonly CONTACT_PATHS = [
    '/contact', '/contact-us', '/about', '/about-us', '/support', '/help',
    '/pages/contact-us', '/pages/contact', '/pages/about-us', '/pages/about',
    '/policies', '/policies/refund-policy', '/policies/privacy-policy', '/policies/shipping-policy',
    '/pages/privacy-policy', '/pages/terms-of-service', '/team', '/pages/team',
    '/faq', '/pages/faq', '/blog', '/collections/all', '/search', '/account/login'
  ];
  
  private static readonly BUSINESS_PATHS = [
    '/business', '/team', '/company', '/leadership', '/staff', '/employees'
  ];
  
  private static readonly COMMON_CHECKOUT_PATHS = [
    '/checkout', '/cart', '/payment', '/billing', '/shipping', '/order'
  ];
  
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
  ];

  /**
   * Extract emails using Puppeteer - Enhanced deep scanning with comprehensive crawling
   */
  public static async extractEmailsWithPuppeteer(url: string): Promise<string[]> {
    let browser;
    const found = new Set<string>();
    const visited = new Set<string>();
    const queue: Array<{ url: string; depth: number }> = [{ url, depth: 0 }];
    let pagesCrawled = 0;

    try {
      browser = await puppeteerExtra.launch({
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
          '--disable-features=VizDisplayCompositor',
          '--disable-blink-features=AutomationControlled'
        ]
      });
      
      const page = await browser.newPage();
      await page.setUserAgent(this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)]);
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Remove webdriver property to avoid detection
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty((globalThis as any).navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      let noEmailsYet = true;
      
      while (queue.length > 0 && (pagesCrawled < this.MAX_PAGES || (noEmailsYet && pagesCrawled < this.MAX_PAGES * 2))) {
        const { url: currentUrl, depth } = queue.shift()!;
        
        if (visited.has(currentUrl) || depth > this.MAX_DEPTH) continue;
        visited.add(currentUrl);

        try {
          PuppeteerExtractor.logger.info('Crawling URL', { url: currentUrl, depth, pagesCrawled });
          
          await page.goto(currentUrl, { 
            waitUntil: 'networkidle0', 
            timeout: this.PUPPETEER_TIMEOUT 
          });
          
          // Wait for dynamic content
          await page.waitForTimeout(3000);
          
          // Extract emails using enhanced method
          const pageEmails = await EmailParser.extractEmailsFromPuppeteerPage(page);
          pageEmails.forEach(email => found.add(email));
          
          if (pageEmails.length > 0) {
            noEmailsYet = false;
            PuppeteerExtractor.logger.info('Found emails', { url: currentUrl, count: pageEmails.length });
          }

          // If this is the first page and we found emails, try to discover more pages
          if (depth === 0) {
            // Get all links from the page
            const links = await page.evaluate(() => {
              const domain = (globalThis as any).window.location.hostname;
              const links: string[] = [];
              (globalThis as any).document.querySelectorAll('a[href]').forEach((link: any) => {
                const href = link.getAttribute('href');
                if (href) {
                  try {
                    const url = new URL(href, (globalThis as any).window.location.href);
                    if (url.hostname === domain && url.href.startsWith('http') && !url.href.match(/\.(pdf|jpg|png|gif|zip)$/i)) {
                      links.push(url.href);
                    }
                  } catch (e) {
                    // Invalid URL, skip
                  }
                }
              });
              return links;
            });

            // Add common paths
            const allPaths = [
              ...this.CONTACT_PATHS,
              ...this.BUSINESS_PATHS,
              ...this.COMMON_CHECKOUT_PATHS
            ];

            allPaths.forEach(path => {
              try {
                const testUrl = new URL(path, currentUrl).href;
                if (!visited.has(testUrl)) {
                  queue.push({ url: testUrl, depth: depth + 1 });
                }
              } catch (e) {
                // Invalid URL, skip
              }
            });

            // Add discovered links (prioritize contact-related ones)
            links
              .filter(link => !visited.has(link))
              .sort((a, b) => {
                const aScore = a.includes('contact') || a.includes('about') || a.includes('support') ? -1 : 0;
                const bScore = b.includes('contact') || b.includes('about') || b.includes('support') ? -1 : 0;
                return aScore - bScore;
              })
              .slice(0, 20) // Limit to 20 new links
              .forEach(link => {
                queue.push({ url: link, depth: depth + 1 });
              });
          }

          pagesCrawled++;
          
          // Add delay between requests
          if (queue.length > 0) {
            await page.waitForTimeout(this.CRAWL_DELAY_MS + Math.random() * 1000);
          }

        } catch (error: any) {
          const errorMessage = error?.message || 'Unknown error';
          if (!errorMessage.includes('404') && 
              !errorMessage.includes('timeout') && 
              !errorMessage.includes('net::ERR_NAME_NOT_RESOLVED') &&
              !errorMessage.includes('net::ERR_CONNECTION_REFUSED')) {
            PuppeteerExtractor.logger.warn('Error crawling URL', { url: currentUrl, error: errorMessage });
          }
        }
      }

      PuppeteerExtractor.logger.info('Puppeteer extraction completed', { 
        totalEmails: found.size, 
        pagesCrawled, 
        urlsVisited: visited.size 
      });

      return Array.from(found);
    } catch (error: any) {
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
