import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
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
    '/contact', '/contact-us', '/about', '/about-us',
    '/pages/contact-us', '/pages/contact', '/pages/about-us', '/pages/about',
    '/policies', '/policies/refund-policy', '/policies/privacy-policy', '/policies/shipping-policy',
    '/policies/terms-of-service', '/pages/privacy-policy', '/pages/terms-of-service'
  ];

  private static readonly BUSINESS_PATHS = [
     '/company'
  ];

  private static readonly COMMON_CHECKOUT_PATHS = [
    '/shipping'
  ];

  private static readonly PRODUCT_PATHS = [
    '/collections/all',
    '/collections',
    '/products',
    '/shop',
    '/catalog'
  ];

  /**
   * Generate a random user agent using the user-agents library
   */
  private static getRandomUserAgent(): string {
    const userAgent = new UserAgent();
    return userAgent.toString();
  }

  /**
   * Attempt to extract emails from checkout pages by adding products to cart
   */
  private static async extractEmailsFromCheckout(page: any, baseUrl: string): Promise<string[]> {
    const checkoutEmails = new Set<string>();

    try {
      PuppeteerExtractor.logger.info('🛒 Attempting checkout email extraction...', { baseUrl });

      // First, try to find product pages
      const productUrls = await this.findProductPages(page, baseUrl);

      this.logger.info('🔍 Product URLs found for checkout extraction', { 
        baseUrl, 
        productUrlsCount: productUrls.length, 
        productUrls: productUrls 
      });

      if (productUrls.length === 0) {
        PuppeteerExtractor.logger.info('❌ No product pages found for checkout extraction', { baseUrl });
        return Array.from(checkoutEmails);
      }

      // Try to add a product to cart and navigate to checkout
      for (const productUrl of productUrls.slice(0, 3)) { // Try up to 3 products
        try {
          PuppeteerExtractor.logger.info('🛍️ Attempting to add product to cart...', { productUrl });

          await page.goto(productUrl, { waitUntil: 'networkidle0', timeout: this.PUPPETEER_TIMEOUT });
          await page.waitForTimeout(2000);
          
          // Debug: Save HTML content to file
          const htmlContent = await page.content();
          const fs = require('fs');
          const path = require('path');
          const debugDir = path.join(process.cwd(), 'debug');
          if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir, { recursive: true });
          }
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const debugFile = path.join(debugDir, `debug-${timestamp}-${productUrl.split('/').pop()}.html`);
          fs.writeFileSync(debugFile, htmlContent);
          this.logger.info('🐛 Debug HTML saved', { debugFile, productUrl });

          // Debug: Take screenshot of product page
          const screenshotFile = path.join(debugDir, `screenshot-${timestamp}-product-page.png`);
          await page.screenshot({ path: screenshotFile, fullPage: true });
          this.logger.info('📸 Product page screenshot saved', { screenshotFile, productUrl });
          
          // Look for add to cart button with more comprehensive selectors
          const addToCartSelectors = [
            // Shopify specific selectors - try both button types
            'button.quick-add__button--add',
            'button.quick-add__button--choose',
            'button[name="add"]',
            'button[type="submit"][name="add"]',
            'button[class*="quick-add"]',
            'button[class*="add-to-cart"]',
            // Web component selectors
            'add-to-cart-component button',
            'add-to-cart-component button[name="add"]',
            'add-to-cart-component button[type="submit"]',
            // Generic selectors
            'button[data-testid*="cart"]',
            'button[class*="cart"]',
            'button[class*="add"]',
            '.add-to-cart',
            '[data-action="add-to-cart"]',
            'input[type="submit"][value*="Add"]',
            'button[aria-label*="cart"]',
            'button[aria-label*="add"]'
          ];

          let addToCartButton = null;
          let foundSelector: string | null = null;
          for (const selector of addToCartSelectors) {
            try {
              addToCartButton = await page.$(selector);
              if (addToCartButton) {
                foundSelector = selector;
                this.logger.info('🎯 Found add to cart button', { selector, productUrl });
                break;
              }
            } catch (e) {
              // Continue to next selector
            }
          }
          
          if (!addToCartButton) {
            this.logger.warn('❌ No add to cart button found with selectors', { productUrl, selectorsTried: addToCartSelectors });
            
            // Try to find any button with "add" in class or text
            try {
              addToCartButton = await page.$('button:has-text("Add"), button:has-text("add"), button[class*="add"], button[name*="add"]');
              if (addToCartButton) {
                foundSelector = 'fallback-add-button';
                this.logger.info('🎯 Found fallback add button', { productUrl });
              }
            } catch (e) {
              // Fallback failed
            }
            
            // Debug: Get all buttons on the page
            const allButtons = await page.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], a[role="button"]'));
              return buttons.map(btn => ({
                tagName: btn.tagName,
                className: btn.className,
                textContent: btn.textContent?.trim().substring(0, 50),
                id: btn.id,
                name: btn.getAttribute('name'),
                type: btn.getAttribute('type'),
                'data-testid': btn.getAttribute('data-testid'),
                'data-action': btn.getAttribute('data-action')
              }));
            });
            this.logger.info('🔍 All buttons found on page', { productUrl, buttons: allButtons });
          }

          if (addToCartButton) {
            // Debug: Highlight and screenshot the add to cart button
            await page.evaluate((selector) => {
              const button = document.querySelector(selector);
              if (button) {
                (button as HTMLElement).style.border = '3px solid red';
                (button as HTMLElement).style.backgroundColor = 'yellow';
              }
            }, foundSelector || 'button[name="add"]');
            
            const highlightScreenshot = path.join(debugDir, `screenshot-${timestamp}-add-to-cart-button.png`);
            await page.screenshot({ path: highlightScreenshot, fullPage: true });
            this.logger.info('📸 Add to cart button highlighted and screenshot saved', { highlightScreenshot, productUrl });

            try {
              // For Shopify sites, try form submission first
              const formSubmitted = await page.evaluate(() => {
                const form = document.querySelector('form[action="/cart/add"]');
                if (form) {
                  (form as HTMLFormElement).submit();
                  return true;
                }
                return false;
              });

              if (!formSubmitted) {
                // Fallback to button click methods
            await (addToCartButton as any).click();
              }
            } catch (clickError) {
              try {
                // Alternative: Use page.click with selector
                await page.click(foundSelector || 'button[name="add"]');
              } catch (pageClickError) {
                try {
                  // Alternative: Use evaluate to trigger click event
                  await page.evaluate((selector) => {
                    const button = document.querySelector(selector);
                    if (button) {
                      (button as HTMLElement).click();
                    }
                  }, foundSelector || 'button[name="add"]');
                } catch (evaluateError) {
                  this.logger.warn('All click methods failed', { 
                    productUrl, 
                    selector: foundSelector,
                    clickError: clickError instanceof Error ? clickError.message : String(clickError),
                    pageClickError: pageClickError instanceof Error ? pageClickError.message : String(pageClickError),
                    evaluateError: evaluateError instanceof Error ? evaluateError.message : String(evaluateError)
                  });
                  continue; // Skip to next product
                }
              }
            }
            await page.waitForTimeout(2000);

            // Debug: Screenshot after click attempt
            const afterClickScreenshot = path.join(debugDir, `screenshot-${timestamp}-after-click.png`);
            await page.screenshot({ path: afterClickScreenshot, fullPage: true });
            this.logger.info('📸 Screenshot after click attempt saved', { afterClickScreenshot, productUrl });

            // Try to navigate to cart/checkout with more comprehensive selectors
            const cartSelectors = [
              // Direct navigation to cart/checkout URLs
              'a[href*="/cart"]',
              'a[href*="/checkout"]',
              'a[href*="cart"]',
              'a[href*="checkout"]',
              // Cart icon/button selectors
              '.cart-link',
              '[data-testid*="cart"]',
              'button[class*="cart"]',
              'a[class*="cart"]',
              // Text-based selectors (will need to be handled differently)
              'a[aria-label*="cart"]',
              'button[aria-label*="cart"]'
            ];

            let cartButton = null;
            for (const selector of cartSelectors) {
              try {
                cartButton = await page.$(selector);
                if (cartButton) break;
              } catch (e) {
                // Continue to next selector
              }
            }

            if (cartButton) {
              // Debug: Highlight cart button and screenshot
              await page.evaluate((selector) => {
                const button = document.querySelector(selector);
                if (button) {
                  (button as HTMLElement).style.border = '3px solid blue';
                  (button as HTMLElement).style.backgroundColor = 'lightblue';
                }
              }, 'a[href*="/cart"], a[href*="/checkout"]');
              
              const cartButtonScreenshot = path.join(debugDir, `screenshot-${timestamp}-cart-button.png`);
              await page.screenshot({ path: cartButtonScreenshot, fullPage: true });
              this.logger.info('📸 Cart button highlighted and screenshot saved', { cartButtonScreenshot, productUrl });

              await (cartButton as any).click();
              await page.waitForTimeout(3000);
            } else {
              // Fallback: Try to navigate directly to cart URL
              this.logger.info('🔄 No cart button found, trying direct navigation to cart...', { productUrl });
              try {
                const cartUrl = new URL('/cart', new URL(productUrl).origin).href;
                await page.goto(cartUrl, { waitUntil: 'networkidle0', timeout: this.PUPPETEER_TIMEOUT });
                await page.waitForTimeout(2000);
              } catch (e) {
                this.logger.warn('Failed to navigate to cart URL', { productUrl, error: e });
              }
            }

            // Debug: Save HTML content of cart page
            const cartHtmlContent = await page.content();
            const cartHtmlFile = path.join(debugDir, `cart-debug-${timestamp}.html`);
            fs.writeFileSync(cartHtmlFile, cartHtmlContent);
            this.logger.info('🐛 Cart page HTML saved', { cartHtmlFile, productUrl, currentUrl: page.url() });

            // Debug: Screenshot of final cart/checkout page
            const finalScreenshot = path.join(debugDir, `screenshot-${timestamp}-final-cart.png`);
            await page.screenshot({ path: finalScreenshot, fullPage: true });
            this.logger.info('📸 Final cart/checkout page screenshot saved', { finalScreenshot, productUrl, currentUrl: page.url() });

            // Debug: Check if cart has items
            const cartItems = await page.evaluate(() => {
              const cartCount = document.querySelector('.cart-count, .cart-item-count, [data-cart-count]');
              const cartEmpty = document.querySelector('.cart-empty, .empty-cart');
              const cartItems = document.querySelectorAll('.cart-item, .cart-line-item');
              return {
                cartCount: cartCount?.textContent || '0',
                isEmpty: !!cartEmpty,
                itemCount: cartItems.length,
                cartText: document.body.textContent?.includes('cart') ? 'Cart mentioned' : 'No cart text'
              };
            });
            this.logger.info('🛒 Cart status check', { productUrl, cartItems });

            // Look for checkout button and try to click it
            const checkoutButton = await page.evaluate(() => {
              // First try specific selectors based on actual HTML structure
              const specificSelectors = [
                '#checkout',
                'button[id="checkout"]',
                'button.cart__checkout-button',
                'button[name="checkout"]',
                '.cart__checkout-button',
                'button[type="submit"][name="checkout"]'
              ];
              
              for (const selector of specificSelectors) {
                const button = document.querySelector(selector);
                if (button) {
                  return {
                    found: true,
                    selector: selector,
                    text: button.textContent?.trim(),
                    tagName: button.tagName,
                    className: button.className,
                    id: button.id,
                    name: button.getAttribute('name'),
                    type: button.getAttribute('type')
                  };
                }
              }
              
              // Fallback: Look for buttons with checkout-related text
              const allButtons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
              for (const button of allButtons) {
                const text = button.textContent?.trim().toLowerCase() || '';
                if (text.includes('check out') || text.includes('checkout') || text.includes('proceed to checkout')) {
                  // Create a working selector based on button attributes
                  let workingSelector = '';
                  if (button.id) {
                    workingSelector = `#${button.id}`;
                  } else if (button.className) {
                    const firstClass = button.className.split(' ')[0];
                    workingSelector = `.${firstClass}`;
                  } else if (button.getAttribute('name')) {
                    workingSelector = `button[name="${button.getAttribute('name')}"]`;
                  } else if (button.getAttribute('type')) {
                    workingSelector = `button[type="${button.getAttribute('type')}"]`;
                  } else {
                    workingSelector = `button:nth-child(${Array.from(button.parentNode?.children || []).indexOf(button) + 1})`;
                  }
                  
                  return {
                    found: true,
                    selector: workingSelector,
                    text: button.textContent?.trim(),
                    tagName: button.tagName,
                    className: button.className,
                    id: button.id,
                    name: button.getAttribute('name'),
                    type: button.getAttribute('type')
                  };
                }
              }
              
              // Final fallback: generic checkout-related selectors
              const fallbackSelectors = [
                'a[href*="checkout"]',
                '.checkout-button',
                '.btn-checkout',
                '[data-testid*="checkout"]',
                'button[type="submit"]'
              ];
              
              for (const selector of fallbackSelectors) {
                const button = document.querySelector(selector);
                if (button) {
                  return {
                    found: true,
                    selector: selector,
                    text: button.textContent?.trim(),
                    tagName: button.tagName,
                    className: button.className,
                    id: button.id,
                    name: button.getAttribute('name'),
                    type: button.getAttribute('type')
                  };
                }
              }
              
              return { found: false };
            });

            this.logger.info('🔍 Checkout button search result', { productUrl, checkoutButton });

            if (checkoutButton.found) {
              try {
                // Highlight and screenshot the checkout button
                await page.evaluate((selector) => {
                  const button = document.querySelector(selector);
                  if (button) {
                    (button as HTMLElement).style.border = '3px solid green';
                    (button as HTMLElement).style.backgroundColor = 'lightgreen';
                  }
                }, checkoutButton.selector);

                const checkoutButtonScreenshot = path.join(debugDir, `screenshot-${timestamp}-checkout-button.png`);
                await page.screenshot({ path: checkoutButtonScreenshot, fullPage: true });
                this.logger.info('📸 Checkout button highlighted and screenshot saved', { checkoutButtonScreenshot, productUrl });

                // Try multiple click methods for better reliability
                let clickSuccess = false;
                
                // Method 1: Direct page.click
                try {
                  await page.click(checkoutButton.selector);
                  clickSuccess = true;
                  this.logger.info('✅ Checkout button clicked successfully (method 1)', { productUrl, selector: checkoutButton.selector });
                } catch (clickError) {
                  this.logger.warn('❌ Method 1 failed', { productUrl, error: clickError instanceof Error ? clickError.message : String(clickError) });
                }
                
                // Method 2: Element handle click (if method 1 failed)
                if (!clickSuccess) {
                  try {
                    const buttonElement = await page.$(checkoutButton.selector);
                    if (buttonElement) {
                      await buttonElement.click();
                      clickSuccess = true;
                      this.logger.info('✅ Checkout button clicked successfully (method 2)', { productUrl, selector: checkoutButton.selector });
                    }
                  } catch (clickError) {
                    this.logger.warn('❌ Method 2 failed', { productUrl, error: clickError instanceof Error ? clickError.message : String(clickError) });
                  }
                }
                
                // Method 3: JavaScript click (if previous methods failed)
                if (!clickSuccess) {
                  try {
                    await page.evaluate((selector) => {
                      const button = document.querySelector(selector);
                      if (button) {
                        (button as HTMLElement).click();
                        return true;
                      }
                      return false;
                    }, checkoutButton.selector);
                    clickSuccess = true;
                    this.logger.info('✅ Checkout button clicked successfully (method 3)', { productUrl, selector: checkoutButton.selector });
                  } catch (clickError) {
                    this.logger.warn('❌ Method 3 failed', { productUrl, error: clickError instanceof Error ? clickError.message : String(clickError) });
                  }
                }
                
                // Method 4: Form submission (for submit buttons)
                if (!clickSuccess && (checkoutButton.type === 'submit' || checkoutButton.tagName === 'INPUT')) {
                  try {
                    await page.evaluate((selector) => {
                      const form = document.querySelector(selector)?.closest('form');
                      if (form) {
                        (form as HTMLFormElement).submit();
                        return true;
                      }
                      return false;
                    }, checkoutButton.selector);
                    clickSuccess = true;
                    this.logger.info('✅ Checkout form submitted successfully (method 4)', { productUrl, selector: checkoutButton.selector });
                  } catch (clickError) {
                    this.logger.warn('❌ Method 4 failed', { productUrl, error: clickError instanceof Error ? clickError.message : String(clickError) });
                  }
                }
                
                if (!clickSuccess) {
                  this.logger.error('❌ All checkout button click methods failed', { productUrl, selector: checkoutButton.selector });
                }
                
                await page.waitForTimeout(3000);

                // Screenshot after checkout button click
                const afterCheckoutScreenshot = path.join(debugDir, `screenshot-${timestamp}-after-checkout.png`);
                await page.screenshot({ path: afterCheckoutScreenshot, fullPage: true });
                this.logger.info('📸 Screenshot after checkout button click saved', { afterCheckoutScreenshot, productUrl, newUrl: page.url() });

              } catch (checkoutError) {
                this.logger.warn('❌ Error clicking checkout button', { 
                  productUrl, 
                  error: checkoutError instanceof Error ? checkoutError.message : String(checkoutError) 
                });
              }
            } else {
              this.logger.warn('❌ No checkout button found on cart page', { productUrl });
            }

            // Extract emails from cart/checkout page
            const emails = await EmailParser.extractEmailsFromPuppeteerPage(page);
            if (emails && emails.length > 0) {
              emails.forEach(email => checkoutEmails.add(email));
              PuppeteerExtractor.logger.info('✅ Found emails on checkout page', {
                productUrl,
                emails: emails,
                checkoutUrl: page.url()
              });
              break; // Found emails, no need to try more products
            }
          }
        } catch (error: any) {
          PuppeteerExtractor.logger.warn('Error during checkout extraction for product', {
            productUrl,
            error: error?.message || 'Unknown error'
          });
        }
      }

    } catch (error: any) {
      PuppeteerExtractor.logger.warn('Error during checkout email extraction', {
        baseUrl,
        error: error?.message || 'Unknown error'
      });
    }

    return Array.from(checkoutEmails);
  }

  /**
   * Find product pages on the website
   */
  private static async findProductPages(page: any, baseUrl: string): Promise<string[]> {
    const productUrls: string[] = [];

    try {
      // Check common product paths
      for (const path of this.PRODUCT_PATHS) {
        try {
          const testUrl = new URL(path, baseUrl).href;
          this.logger.info('🔍 Attempting to access collections page', { testUrl, path, baseUrl });
          await page.goto(testUrl, { waitUntil: 'networkidle0', timeout: 10000 });
          this.logger.info('✅ Successfully loaded collections page', { testUrl, currentUrl: page.url() });

          // Debug: Save HTML content to file for collections page
          const htmlContent = await page.content();
          const fs = require('fs');
          const pathModule = require('path');
          const debugDir = pathModule.join(process.cwd(), 'debug');
          if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir, { recursive: true });
          }
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const debugFile = pathModule.join(debugDir, `collections-debug-${timestamp}.html`);
          fs.writeFileSync(debugFile, htmlContent);
          this.logger.info('🐛 Collections page HTML saved', { debugFile, testUrl });

          // Debug: Screenshot of collections page
          const collectionsScreenshot = pathModule.join(debugDir, `screenshot-${timestamp}-collections.png`);
          await page.screenshot({ path: collectionsScreenshot, fullPage: true });
          this.logger.info('📸 Collections page screenshot saved', { collectionsScreenshot, testUrl });

          // Look for product links with more comprehensive selectors
          const productLinks = await page.evaluate(() => {
            const links: string[] = [];
            // Try multiple selectors for product links
            const selectors = [
              'a[href*="/product"]',
              'a[href*="/collections"]', 
              'a[href*="/shop"]',
              'a[href*="/products"]',
              '.product-item a',
              '.product-card a',
              '.product a',
              '[data-product-url]',
              'a[class*="product"]',
              '.resource-card a',
              '.resource-card__link',
              'a[href*="/products/"]'
            ];
            
            selectors.forEach(selector => {
              const linkElements = document.querySelectorAll(selector);
            linkElements.forEach(link => {
              const href = link.getAttribute('href');
                if (href && (href.includes('/product') || href.includes('/products') || href.includes('/collections') || href.includes('/shop'))) {
                try {
                  const url = new URL(href, window.location.href);
                  links.push(url.href);
                } catch (e) {
                  // Invalid URL, skip
                }
              }
            });
            });
            
            return links.slice(0, 10); // Limit to 10 product links
          });

          this.logger.info('🔍 Product links found on collections page', { 
            testUrl, 
            linksFound: productLinks.length, 
            links: productLinks 
          });

          if (productLinks.length > 0) {
            productUrls.push(...productLinks);
            this.logger.info('✅ Found product links, adding to productUrls', { 
              testUrl, 
              productUrls: productUrls 
            });
            break; // Found products, no need to check other paths
          } else {
            this.logger.warn('❌ No product links found on collections page', { testUrl });
          }
        } catch (e) {
          this.logger.warn('❌ Error accessing collections page', { 
            path, 
            testUrl: new URL(path, baseUrl).href, 
            error: e instanceof Error ? e.message : String(e) 
          });
          // Continue to next path
        }
      }

    } catch (error: any) {
      PuppeteerExtractor.logger.warn('Error finding product pages', {
        baseUrl,
        error: error?.message || 'Unknown error'
      });
    }

    this.logger.info('🔍 Final productUrls result', { 
      baseUrl, 
      totalProductUrls: productUrls.length, 
      productUrls: productUrls 
    });

    return productUrls;
  }

  /**
   * Extract emails using only checkout method (for testing)
   */
  public static async extractEmailsFromCheckoutOnly(url: string): Promise<string[]> {
    let browser;
    const found = new Set<string>();

    try {
      // Determine the correct executable path based on environment
      let executablePath: string | undefined;
      
      if (process.env.NODE_ENV === "production") {
        executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      } else {
        // Development environment - try to find Chrome/Chromium
        const { execSync } = require('child_process');
        try {
          // Try to find Chrome on Windows
          if (process.platform === 'win32') {
            const chromePaths = [
              'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
              'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
              process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
            ];
            
            for (const path of chromePaths) {
              try {
                execSync(`"${path}" --version`, { stdio: 'ignore' });
                executablePath = path;
                break;
              } catch (e) {
                // Continue to next path
              }
            }
          } else {
            // Try to find Chrome/Chromium on macOS/Linux
            try {
              const chromePath = execSync('which google-chrome-stable || which google-chrome || which chromium-browser || which chromium', { encoding: 'utf8' }).trim();
              executablePath = chromePath;
            } catch (e) {
              // Fall back to default Puppeteer bundled Chromium
              executablePath = undefined;
            }
          }
        } catch (e) {
          // Fall back to default Puppeteer bundled Chromium
          executablePath = undefined;
        }
      }

      // Log the executable path being used
      this.logger.info(`Puppeteer executable path: ${executablePath || 'default bundled Chromium'}`);

      browser = await puppeteerExtra.launch({
        headless: true,
        executablePath,
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
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Remove webdriver property to avoid detection
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty((globalThis as any).navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      // Go to the main page first
      await page.goto(url, { waitUntil: 'networkidle0', timeout: this.PUPPETEER_TIMEOUT });
      await page.waitForTimeout(2000);

      // Debug: Screenshot of homepage
      const fs = require('fs');
      const path = require('path');
      const debugDir = path.join(process.cwd(), 'debug');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const homepageScreenshot = path.join(debugDir, `screenshot-${timestamp}-homepage.png`);
      await page.screenshot({ path: homepageScreenshot, fullPage: true });
      this.logger.info('📸 Homepage screenshot saved', { homepageScreenshot, url });

      // Extract emails using checkout method only
      const checkoutEmails = await this.extractEmailsFromCheckout(page, url);
      checkoutEmails.forEach(email => found.add(email));

      this.logger.info('🎉 Checkout-only extraction completed', { 
        totalEmails: found.size, 
        finalEmails: Array.from(found)
      });

      return Array.from(found);
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      if (!errorMessage.includes('Could not find browser') && 
          !errorMessage.includes('Failed to launch')) {
        this.logger.error('Checkout-only extraction failed', { url, error: errorMessage });
      }
      return Array.from(found);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

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
      // Determine the correct executable path based on environment
      let executablePath: string | undefined;

      if (process.env.NODE_ENV === "production") {
        executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      } else {
        // Development environment - try to find Chrome/Chromium
        const { execSync } = require('child_process');
        try {
          // Try to find Chrome on Windows
          if (process.platform === 'win32') {
            const chromePaths = [
              'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
              'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
              process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
            ];

            for (const path of chromePaths) {
              try {
                execSync(`"${path}" --version`, { stdio: 'ignore' });
                executablePath = path;
                break;
              } catch (e) {
                // Continue to next path
              }
            }
          } else {
            // Try to find Chrome/Chromium on macOS/Linux
            try {
              const chromePath = execSync('which google-chrome-stable || which google-chrome || which chromium-browser || which chromium', { encoding: 'utf8' }).trim();
              executablePath = chromePath;
            } catch (e) {
              // Fall back to default Puppeteer bundled Chromium
              executablePath = undefined;
            }
          }
        } catch (e) {
          // Fall back to default Puppeteer bundled Chromium
          executablePath = undefined;
        }
      }

      // Log the executable path being used
      this.logger.info(`Puppeteer executable path: ${executablePath || 'default bundled Chromium'}`);

      browser = await puppeteerExtra.launch({
        headless: true,
        executablePath,
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
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      // Remove webdriver property to avoid detection
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty((globalThis as any).navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      let noEmailsYet = true;
      let checkoutEmailsAttempted = false;

      while (queue.length > 0 && (pagesCrawled < this.MAX_PAGES || (noEmailsYet && pagesCrawled < this.MAX_PAGES * 2))) {
        const { url: currentUrl, depth } = queue.shift()!;

        if (visited.has(currentUrl) || depth > this.MAX_DEPTH) continue;
        visited.add(currentUrl);

        try {
          PuppeteerExtractor.logger.info('🌐 Crawling URL', { url: currentUrl, depth, pagesCrawled });

          await page.goto(currentUrl, {
            waitUntil: 'networkidle0',
            timeout: this.PUPPETEER_TIMEOUT
          });

          // Wait for dynamic content
          PuppeteerExtractor.logger.info('⏳ Waiting for dynamic content to load...', { url: currentUrl });
          await page.waitForTimeout(3000);

          // Extract emails using enhanced method
          PuppeteerExtractor.logger.info('🔍 Extracting emails from page...', { url: currentUrl });
          const pageEmails = await EmailParser.extractEmailsFromPuppeteerPage(page);

          PuppeteerExtractor.logger.info('📧 Email extraction result', {
            url: currentUrl,
            emailsFound: pageEmails?.length || 0,
            emails: pageEmails || []
          });

          if (pageEmails && Array.isArray(pageEmails)) {
            pageEmails.forEach(email => found.add(email));
          }

          if (pageEmails && Array.isArray(pageEmails) && pageEmails.length > 0) {
            noEmailsYet = false;
            PuppeteerExtractor.logger.info('✅ Found emails on page', { url: currentUrl, count: pageEmails.length, emails: pageEmails });
          } else {
            PuppeteerExtractor.logger.info('❌ No emails found on page', { url: currentUrl });
          }

          // If no emails found yet and we haven't tried checkout extraction, attempt it
          if (noEmailsYet && !checkoutEmailsAttempted && depth === 0) {
            PuppeteerExtractor.logger.info('🛒 No emails found on main pages, attempting checkout extraction...', { url: currentUrl });
            checkoutEmailsAttempted = true;

            try {
              const checkoutEmails = await this.extractEmailsFromCheckout(page, currentUrl);
              if (checkoutEmails && checkoutEmails.length > 0) {
                checkoutEmails.forEach(email => found.add(email));
                noEmailsYet = false;
                PuppeteerExtractor.logger.info('✅ Found emails via checkout extraction', {
                  url: currentUrl,
                  count: checkoutEmails.length,
                  emails: checkoutEmails
                });
              } else {
                PuppeteerExtractor.logger.info('❌ No emails found via checkout extraction', { url: currentUrl });
              }
            } catch (error: any) {
              PuppeteerExtractor.logger.warn('Error during checkout email extraction', {
                url: currentUrl,
                error: error?.message || 'Unknown error'
              });
            }
          }

          // If this is the first page and we found emails, try to discover more pages
          if (depth === 0) {
            PuppeteerExtractor.logger.info('🔗 Discovering links from main page...', { url: currentUrl });

            // Get all links from the page
            const links = await page.evaluate(() => {
              const domain = (globalThis as any).window.location.hostname;
              const links: string[] = [];
              const linkElements = (globalThis as any).document.querySelectorAll('a[href]');
              if (linkElements && linkElements.length > 0) {
                linkElements.forEach((link: any) => {
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
              }
              return links;
            });

            PuppeteerExtractor.logger.info('🔗 Found internal links', {
              url: currentUrl,
              linksFound: links?.length || 0,
              links: links?.slice(0, 10) || [] // Show first 10 links
            });

            // Add common paths
            PuppeteerExtractor.logger.info('📋 Adding common contact paths...', { url: currentUrl });
            const allPaths = [
              ...this.CONTACT_PATHS,
              ...this.BUSINESS_PATHS,
              ...this.COMMON_CHECKOUT_PATHS,
              ...this.PRODUCT_PATHS
            ];

            let pathsAdded = 0;
            if (allPaths && Array.isArray(allPaths)) {
              allPaths.forEach(path => {
                try {
                  const testUrl = new URL(path, currentUrl).href;
                  if (!visited.has(testUrl)) {
                    queue.push({ url: testUrl, depth: depth + 1 });
                    pathsAdded++;
                  }
                } catch (e) {
                  // Invalid URL, skip
                }
              });
            }

            PuppeteerExtractor.logger.info('📋 Added common paths to queue', {
              url: currentUrl,
              pathsAdded,
              totalPaths: allPaths?.length || 0
            });

            // Add discovered links (prioritize contact-related ones)
            let linksAdded = 0;
            if (links && Array.isArray(links)) {
              const prioritizedLinks = links
                .filter(link => !visited.has(link))
                .sort((a, b) => {
                  const aScore = a.includes('contact') || a.includes('about') || a.includes('support') ? -1 : 0;
                  const bScore = b.includes('contact') || b.includes('about') || b.includes('support') ? -1 : 0;
                  return aScore - bScore;
                })
                .slice(0, 20); // Limit to 20 new links

              prioritizedLinks.forEach(link => {
                queue.push({ url: link, depth: depth + 1 });
                linksAdded++;
              });
            }

            PuppeteerExtractor.logger.info('🔗 Added discovered links to queue', {
              url: currentUrl,
              linksAdded,
              totalLinks: links?.length || 0,
              queueSize: queue.length
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

      PuppeteerExtractor.logger.info('🎉 Puppeteer extraction completed', {
        totalEmails: found.size,
        pagesCrawled,
        urlsVisited: visited.size,
        finalEmails: Array.from(found)
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
