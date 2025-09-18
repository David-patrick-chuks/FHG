import * as cheerio from 'cheerio';
import * as validator from 'validator';

// Declare document for browser context
declare const document: any;

// EmailParser class for extracting emails from HTML content
export class EmailParser {
  private static readonly EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  private static readonly OBFUSCATED_EMAIL_REGEX = /[a-zA-Z0-9._%+-]+\s*\[at\]|\(at\)\s*[a-zA-Z0-9.-]+\s*\[dot\]|\(dot\)\s*[a-zA-Z]{2,}/g;
  private static readonly OBFUSCATED_PATTERNS = [
    /\[at\]/gi, /\(at\)/gi, /AT/gi, / at /gi,
    /\[dot\]/gi, /\(dot\)/gi, /DOT/gi, / \. /gi,
    /[\u200B-\u200D\uFEFF]/g,
  ];
  private static readonly EMAIL_PATTERNS = [
    this.EMAIL_REGEX,
    /[\w\.-]+@[\w\.-]+\.\w+/g,
  ];

  /**
   * Decode obfuscated emails
   */
  private static decodeObfuscatedEmail(text: string): string {
    return text
      .replace(/\[at\]|\(at\)/g, '@')
      .replace(/\[dot\]|\(dot\)/g, '.')
      .trim();
  }

  /**
   * Extract emails from HTML content - Enhanced with multiple techniques
   */
  public static extractEmailsFromHtml(html: string): string[] {
    const emails: string[] = [];
    
    // Return empty array if html is null or undefined
    if (!html || typeof html !== 'string') {
      return emails;
    }
    
    // Method 1: Standard regex extraction
    const matches = html.match(this.EMAIL_REGEX);
    if (matches) {
      emails.push(...matches);
    }

    // Method 2: Extract from mailto links with base64 decoding
    const $1 = cheerio.load(html);
    $1("a[href^='mailto:']").each((_, element) => {
      let mailto = $1(element).attr('href')?.replace('mailto:', '').trim() || '';
      
      // Try base64 decoding if it looks like base64
      if (mailto.length % 4 === 0 && !mailto.includes('@')) {
        try {
          mailto = Buffer.from(mailto, 'base64').toString('utf-8').trim();
        } catch (e) {
          // Not valid base64, continue with original
        }
      }
      
      const email = mailto.split('?')[0].split('&')[0];
      if (validator.isEmail(email)) {
        emails.push(email);
      }
    });

    // Method 3: Look for emails in data attributes
    $1("[data-email], [data-contact], [data-mail]").each((_, element) => {
      const email = $1(element).attr('data-email') || 
                   $1(element).attr('data-contact') || 
                   $1(element).attr('data-mail');
      if (email && email.includes('@')) {
        emails.push(email);
      }
    });

    // Method 4: Look for emails in title attributes
    $1("[title*='@']").each((_, element) => {
      const title = $1(element).attr('title');
      if (title) {
        const titleMatches = title.match(this.EMAIL_REGEX);
        if (titleMatches) {
          emails.push(...titleMatches);
        }
      }
    });

    // Method 5: Look for emails in alt attributes
    $1("[alt*='@']").each((_, element) => {
      const alt = $1(element).attr('alt');
      if (alt) {
        const altMatches = alt.match(this.EMAIL_REGEX);
        if (altMatches) {
          emails.push(...altMatches);
        }
      }
    });

    // Method 6: Look for emails in JavaScript variables
    const jsMatches = html.match(/['"`]([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})['"`]/g);
    if (jsMatches) {
      jsMatches.forEach(match => {
        const email = match.replace(/['"`]/g, '');
        emails.push(email);
      });
    }

    // Method 7: Look for emails in JSON data
    const jsonMatches = html.match(/"email":\s*"([^"]+)"/g);
    if (jsonMatches) {
      jsonMatches.forEach(match => {
        const emailMatch = match.match(/"email":\s*"([^"]+)"/);
        if (emailMatch && emailMatch[1].includes('@')) {
          emails.push(emailMatch[1]);
        }
      });
    }

    // Method 8: Look for emails in meta tags
    $1('meta[name*="email"], meta[property*="email"], meta[content*="@"]').each((_, element) => {
      const content = $1(element).attr('content');
      if (content) {
        const metaMatches = content.match(this.EMAIL_REGEX);
        if (metaMatches) {
          emails.push(...metaMatches);
        }
      }
    });

    // Method 9: Look for emails in comments
    const commentMatches = html.match(/<!--[\s\S]*?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})[\s\S]*?-->/g);
    if (commentMatches) {
      commentMatches.forEach(comment => {
        const commentEmailMatches = comment.match(this.EMAIL_REGEX);
        if (commentEmailMatches) {
          emails.push(...commentEmailMatches);
        }
      });
    }

    // Method 10: Look for emails in hidden elements
    $1('input[type="email"], input[name*="email"], input[id*="email"]').each((_, element) => {
      const value = $1(element).attr('value') || $1(element).attr('placeholder');
      if (value && value.includes('@')) {
        emails.push(value);
      }
    });

    // Method 11: Look for common business email patterns in text content
    const businessEmailPatterns = [
      /contact\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /email\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /reach\s*us\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /write\s*to\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /send\s*to\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /info\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /sales\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /support\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /help\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /business\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /refund\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /return\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /policy\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /complaint\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /feedback\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /warranty\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /shipping\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi,
      /delivery\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/gi
    ];

    businessEmailPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const emailMatch = match.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/);
          if (emailMatch) {
            emails.push(emailMatch[1]);
          }
        });
      }
    });

    // Method 12: Look for emails in structured data (JSON-LD, microdata)
    $1('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonContent = $1(element).html();
        if (jsonContent) {
          const data = JSON.parse(jsonContent);
          const extractEmailsFromObject = (obj: any): string[] => {
            const foundEmails: string[] = [];
            if (typeof obj === 'string' && obj.includes('@')) {
              const emailMatches = obj.match(this.EMAIL_REGEX);
              if (emailMatches) foundEmails.push(...emailMatches);
            } else if (typeof obj === 'object' && obj !== null) {
              Object.values(obj).forEach(value => {
                foundEmails.push(...extractEmailsFromObject(value));
              });
            }
            return foundEmails;
          };
          emails.push(...extractEmailsFromObject(data));
        }
      } catch (error) {
        // Invalid JSON, skip
      }
    });

    // Method 13: Look for emails in microdata attributes
    $1('[itemprop*="email"], [itemprop*="contact"], [itemprop*="mail"]').each((_, element) => {
      const content = $1(element).attr('content') || $1(element).text();
      if (content) {
        const microdataMatches = content.match(this.EMAIL_REGEX);
        if (microdataMatches) {
          emails.push(...microdataMatches);
        }
      }
    });

    // Method 14: Advanced text processing for obfuscated emails
    const $2 = cheerio.load(html);
    let textContent = $2('body').text();
    
    // Process obfuscated patterns
    this.OBFUSCATED_PATTERNS.forEach(pattern => {
      textContent = textContent.replace(pattern, match => {
        const low = match.toLowerCase();
        if (low.includes('at')) return '@';
        if (low.includes('dot')) return '.';
        return '';
      });
    });
    
    // Decode obfuscated emails
    textContent = this.decodeObfuscatedEmail(textContent);
    
    // Check for reversed text emails
    const reversed = textContent.split('').reverse().join('');
    const reversedMatches = reversed.match(this.EMAIL_REGEX);
    if (reversedMatches) {
      reversedMatches.forEach(email => {
        const revEmail = email.split('').reverse().join('');
        if (validator.isEmail(revEmail)) {
          emails.push(revEmail);
        }
      });
    }
    
    // Apply all email patterns to processed text
    this.EMAIL_PATTERNS.forEach(pattern => {
      const textMatches = textContent.match(pattern);
      if (textMatches) {
        textMatches.forEach(email => {
          if (validator.isEmail(email)) {
            emails.push(email);
          }
        });
      }
    });
    
    // Method 15: Extract from specific hotspots (footer, header, contact sections)
    const hotspotSelectors = [
      'footer', 'header', '.contact-info', '.site-footer', '#contact', 
      '.email', '[data-email]', 'address', '.contact-form', '.contact',
      '.footer', '.header', '.support', '.help', '.about'
    ];
    
    hotspotSelectors.forEach(selector => {
      const sectionText = $1(selector).text();
      const decodedSectionText = this.decodeObfuscatedEmail(sectionText);
      const sectionMatches = decodedSectionText.match(this.EMAIL_REGEX);
      if (sectionMatches) {
        sectionMatches.forEach(email => {
          if (validator.isEmail(email)) {
            emails.push(email);
          }
        });
      }
    });

    // Clean and normalize emails
    const cleanedEmails = emails
      .map(email => email.toLowerCase().trim())
      .filter(email => {
        // Basic validation
        if (!email.includes('@') || !email.includes('.') || email.length < 5 || email.length > 100) {
          return false;
        }

        // Filter out obvious fake/test emails but keep legitimate business emails
        const fakePatterns = [
          'example.com',
          'test.com',
          'sample.com',
          'demo.com',
          'placeholder.com',
          'your-email.com',
          'yourdomain.com',
          'example.org',
          'test.org',
          'sample.org'
        ];

        // Check if it's a fake domain
        const domain = email.split('@')[1];
        if (fakePatterns.some(pattern => domain.includes(pattern))) {
          return false;
        }

        // Filter out common non-business email patterns but keep business ones
        const nonBusinessPatterns = [
          'noreply@',
          'no-reply@',
          'donotreply@',
          'do-not-reply@',
          'automated@',
          'system@',
          'admin@localhost',
          'root@localhost',
          'postmaster@',
          'abuse@',
          'spam@'
        ];

        // Only filter out if it's clearly a system email, not a business contact
        if (nonBusinessPatterns.some(pattern => email.startsWith(pattern))) {
          return false;
        }

        // Keep all other emails including domain emails (contact@storename.com, info@business.com, etc.)
        return true;
      });

    return [...new Set(cleanedEmails)];
  }

  /**
   * Extract emails from Puppeteer page with advanced JavaScript execution
   */
  public static async extractEmailsFromPuppeteerPage(page: any): Promise<string[]> {
    const emails = new Set<string>();

    try {
      // Execute JavaScript to find hidden/obfuscated emails
      const textContent = await page.evaluate(() => {
        // Inject script to de-obfuscate common JS patterns
        const deobfuscate = () => {
          let fullText = '';
          
          const doc = document as any;
          doc.querySelectorAll('*').forEach((el: any) => {
            if (el.style.display === 'none' || el.hidden) return;
            let text = el.innerText || el.textContent || '';
            
            // Decode base64
            const base64Match = text.match(/atob\(['"]([A-Za-z0-9+/=]+)['"]\)/g);
            if (base64Match) {
              base64Match.forEach(match => {
                try {
                  const encoded = match.replace(/atob\(['"]|['"]\)/g, '');
                  text += ' ' + atob(encoded);
                } catch (e) {
                  // Invalid base64, continue
                }
              });
            }
            
            // ROT13 decode
            text = text.replace(/[a-zA-Z]/g, c => 
              String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)
            );
            
            fullText += ' ' + text;
          });
          return fullText;
        };
        return deobfuscate();
      });

      // Process the extracted text
      const processedEmails = this.extractEmailsFromHtml(textContent);
      if (processedEmails && Array.isArray(processedEmails)) {
        processedEmails.forEach(email => emails.add(email));
      }

      // Extract from form inputs
      const formEmails = await page.evaluate(() => {
        const doc = document as any;
        return Array.from(doc.querySelectorAll('input[type="email"], input[placeholder*="email"], input[value*="email"]'))
          .map((input: any) => input.value || input.placeholder || '')
          .filter(v => v.includes('@'));
      });
      if (formEmails && Array.isArray(formEmails)) {
        formEmails.forEach(email => {
          if (validator.isEmail(email)) emails.add(email);
        });
      }

      // Extract from meta tags
      const metaEmails = await page.evaluate(() => {
        const doc = document as any;
        return Array.from(doc.querySelectorAll('meta[name*="email"], meta[property*="email"], meta[content*="email"]'))
          .map((meta: any) => meta.content || '')
          .filter(content => /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(content));
      });
      if (metaEmails && Array.isArray(metaEmails)) {
        metaEmails.forEach(content => {
          const matches = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
          if (matches) matches.forEach(email => emails.add(email));
        });
      }

      // Extract from JSON-LD
      const jsonLd = await page.evaluate(() => {
        const doc = document as any;
        const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
        let emails: string[] = [];
        scripts.forEach(script => {
          try {
            const data = JSON.parse((script as any).innerHTML);
            function findEmails(obj: any) {
              if (typeof obj === 'string' && /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(obj)) {
                emails.push(obj);
              }
              if (typeof obj === 'object' && obj) {
                Object.values(obj).forEach(findEmails);
              }
            }
            findEmails(data);
          } catch (e) {
            // Invalid JSON, skip
          }
        });
        return emails;
      });
      if (jsonLd && Array.isArray(jsonLd)) {
        jsonLd.forEach(email => {
          if (validator.isEmail(email)) emails.add(email);
        });
      }

      // Extract from specific hotspots
      const hotspotEmails = await page.evaluate(() => {
        const selectors = [
          'footer', 'header', '.contact-info', '.site-footer', '#contact', 
          '.email', '[data-email]', 'address', '.contact-form', '.contact',
          '.footer', '.header', '.support', '.help', '.about'
        ];
        let emails: string[] = [];
        selectors.forEach(sel => {
          const doc = document as any;
          const els = doc.querySelectorAll(sel);
          els.forEach(el => {
            let text = el.innerText;
            text = text.replace(/\[at\]/g, '@').replace(/\[dot\]/g, '.');
            const matches = text.match(/[\w\.-]+@[\w\.-]+\.\w+/g);
            if (matches) emails.push(...matches);
          });
        });
        return emails;
      });
      if (hotspotEmails && Array.isArray(hotspotEmails)) {
        hotspotEmails.forEach((email : any) => {
          if (validator.isEmail(email)) emails.add(email);
        });
      }

    } catch (error) {
      console.error('Error extracting emails from Puppeteer page:', error);
    }

    return Array.from(emails);
  }
}
