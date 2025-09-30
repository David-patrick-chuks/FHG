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
   * Enhanced email validation to filter out false positives
   */
  private static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    
    // Basic validation using validator
    if (!validator.isEmail(email)) return false;
    
    // Additional checks to filter out common false positives
    const lowercaseEmail = email.toLowerCase();
    
    // Filter out JavaScript variables and React components
    if (lowercaseEmail.includes('react') || 
        lowercaseEmail.includes('component') ||
        lowercaseEmail.includes('modal') ||
        lowercaseEmail.includes('dialog') ||
        lowercaseEmail.includes('form') ||
        lowercaseEmail.includes('input') ||
        lowercaseEmail.includes('button') ||
        lowercaseEmail.includes('state') ||
        lowercaseEmail.includes('props') ||
        lowercaseEmail.includes('hook') ||
        lowercaseEmail.includes('context') ||
        lowercaseEmail.includes('provider') ||
        lowercaseEmail.includes('facebook') ||
        lowercaseEmail.includes('sso') ||
        lowercaseEmail.includes('window') ||
        lowercaseEmail.includes('location') ||
        lowercaseEmail.includes('origin') ||
        lowercaseEmail.includes('alloy') ||
        lowercaseEmail.includes('sbydre') ||
        lowercaseEmail.includes('xst') ||
        lowercaseEmail.includes('init') ||
        lowercaseEmail.includes('navigator') ||
        lowercaseEmail.includes('sendbeacon') ||
        lowercaseEmail.includes('useragent') ||
        lowercaseEmail.includes('search') ||
        lowercaseEmail.includes('bind') ||
        lowercaseEmail.includes('self.') ||
        lowercaseEmail.includes('loc@ion') ||
        lowercaseEmail.includes('navig@or')) {
      return false;
    }
    
    // Filter out malformed URLs that contain @
    if (lowercaseEmail.startsWith('www.') || 
        lowercaseEmail.startsWith('http') ||
        lowercaseEmail.includes('cdn') ||
        lowercaseEmail.includes('static') ||
        lowercaseEmail.includes('assets') ||
        lowercaseEmail.includes('js') ||
        lowercaseEmail.includes('css') ||
        lowercaseEmail.includes('.min.') ||
        lowercaseEmail.includes('bundle') ||
        lowercaseEmail.includes('chunk')) {
      return false;
    }
    
    // Filter out common false patterns
    if (lowercaseEmail.includes('@') && 
        (lowercaseEmail.includes('.js') || 
         lowercaseEmail.includes('.ts') || 
         lowercaseEmail.includes('.tsx') || 
         lowercaseEmail.includes('.jsx') ||
         lowercaseEmail.includes('.min') ||
         lowercaseEmail.includes('.bundle'))) {
      return false;
    }
    
    // Filter out very short local parts (likely not real emails)
    const localPart = email.split('@')[0];
    if (localPart.length < 2) return false;
    
    // Filter out emails with suspicious patterns
    if (localPart.includes('.') && localPart.split('.').length > 3) return false;
    
    // Filter out emails that look like variable names
    if (/^[a-z_]+$/.test(localPart) && localPart.length > 10) return false;
    
    // Filter out emails that look like JavaScript/CSS artifacts
    if (localPart.includes('.') && localPart.split('.').some(part => 
        part.length <= 2 || 
        /^[a-z]{1,3}$/.test(part) ||
        part.includes('sso') ||
        part.includes('init') ||
        part.includes('loc') ||
        part.includes('origin')
    )) {
      return false;
    }
    
    // Filter out emails with suspicious domain patterns
    const domain = email.split('@')[1];
    if (domain && (
        domain.includes('.init') ||
        domain.includes('.origin') ||
        domain.includes('asite.com') ||
        domain.includes('or.com') ||
        domain.includes('sbydre.com') ||
        domain.includes('e.init')
    )) {
      return false;
    }
    
    // Filter out emails that are too short overall (likely artifacts)
    if (email.length < 8) return false;
    
    return true;
  }

  /**
   * Extract emails from HTML content - Enhanced with multiple techniques
   */
  public static extractEmailsFromHtml(html: string): string[] {
    const emails: Set<string> = new Set();
    
    // Return empty array if html is null or undefined
    if (!html || typeof html !== 'string') {
      return [];
    }
    
    // Method 1: Standard regex extraction with validation
    const matches = html.match(this.EMAIL_REGEX);
    if (matches) {
      matches.forEach(email => {
        if (EmailParser.isValidEmail(email)) {
          emails.add(email.toLowerCase());
        }
      });
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
      if (EmailParser.isValidEmail(email)) {
        emails.add(email.toLowerCase());
      }
    });

    // Method 3: Look for emails in data attributes
    $1("[data-email], [data-contact], [data-mail]").each((_, element) => {
      const email = $1(element).attr('data-email') || 
                   $1(element).attr('data-contact') || 
                   $1(element).attr('data-mail');
      if (email && EmailParser.isValidEmail(email)) {
        emails.add(email.toLowerCase());
      }
    });

    // Method 4: Look for emails in title attributes
    $1("[title*='@']").each((_, element) => {
      const title = $1(element).attr('title');
      if (title) {
        const titleMatches = title.match(this.EMAIL_REGEX);
        if (titleMatches) {
          titleMatches.forEach(email => {
            if (EmailParser.isValidEmail(email)) {
              emails.add(email.toLowerCase());
            }
          });
        }
      }
    });

    // Method 5: Look for emails in alt attributes
    $1("[alt*='@']").each((_, element) => {
      const alt = $1(element).attr('alt');
      if (alt) {
        const altMatches = alt.match(this.EMAIL_REGEX);
        if (altMatches) {
          altMatches.forEach(email => {
            if (EmailParser.isValidEmail(email)) {
              emails.add(email.toLowerCase());
            }
          });
        }
      }
    });

    // Method 6: Look for emails in JavaScript variables
    const jsMatches = html.match(/['"`]([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})['"`]/g);
    if (jsMatches && Array.isArray(jsMatches)) {
      jsMatches.forEach(match => {
        const email = match.replace(/['"`]/g, '');
        if (EmailParser.isValidEmail(email)) {
          emails.add(email.toLowerCase());
        }
      });
    }

    // Method 7: Look for emails in JSON data
    const jsonMatches = html.match(/"email":\s*"([^"]+)"/g);
    if (jsonMatches && Array.isArray(jsonMatches)) {
      jsonMatches.forEach(match => {
        const emailMatch = match.match(/"email":\s*"([^"]+)"/);
        if (emailMatch && EmailParser.isValidEmail(emailMatch[1])) {
          emails.add(emailMatch[1].toLowerCase());
        }
      });
    }

    // Method 8: Look for emails in meta tags
    $1('meta[name*="email"], meta[property*="email"], meta[content*="@"]').each((_, element) => {
      const content = $1(element).attr('content');
      if (content) {
        const metaMatches = content.match(this.EMAIL_REGEX);
        if (metaMatches) {
          metaMatches.forEach(email => {
            if (EmailParser.isValidEmail(email)) {
              emails.add(email.toLowerCase());
            }
          });
        }
      }
    });

    // Method 9: Look for emails in comments
    const commentMatches = html.match(/<!--[\s\S]*?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})[\s\S]*?-->/g);
    if (commentMatches && Array.isArray(commentMatches)) {
      commentMatches.forEach(comment => {
        const commentEmailMatches = comment.match(this.EMAIL_REGEX);
        if (commentEmailMatches) {
          commentEmailMatches.forEach(email => {
            if (EmailParser.isValidEmail(email)) {
              emails.add(email.toLowerCase());
            }
          });
        }
      });
    }

    // Method 10: Look for emails in hidden elements
    $1('input[type="email"], input[name*="email"], input[id*="email"]').each((_, element) => {
      const value = $1(element).attr('value') || $1(element).attr('placeholder');
      if (value && EmailParser.isValidEmail(value)) {
        emails.add(value.toLowerCase());
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

    if (businessEmailPatterns && Array.isArray(businessEmailPatterns)) {
      businessEmailPatterns.forEach(pattern => {
        const matches = html.match(pattern);
        if (matches && Array.isArray(matches)) {
          matches.forEach(match => {
            const emailMatch = match.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/);
            if (emailMatch && EmailParser.isValidEmail(emailMatch[1])) {
              emails.add(emailMatch[1].toLowerCase());
            }
          });
        }
      });
    }

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
              const values = Object.values(obj);
              if (values && Array.isArray(values)) {
                values.forEach(value => {
                  foundEmails.push(...extractEmailsFromObject(value));
                });
              }
            }
            return foundEmails;
          };
          const extractedEmails = extractEmailsFromObject(data);
          extractedEmails.forEach(email => {
            if (EmailParser.isValidEmail(email)) {
              emails.add(email.toLowerCase());
            }
          });
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
          microdataMatches.forEach(email => {
            if (EmailParser.isValidEmail(email)) {
              emails.add(email.toLowerCase());
            }
          });
        }
      }
    });

    // Method 14: Advanced text processing for obfuscated emails
    const $2 = cheerio.load(html);
    let textContent = $2('body').text();
    
    // Process obfuscated patterns
    if (this.OBFUSCATED_PATTERNS && Array.isArray(this.OBFUSCATED_PATTERNS)) {
      this.OBFUSCATED_PATTERNS.forEach(pattern => {
        textContent = textContent.replace(pattern, match => {
          const low = match.toLowerCase();
          if (low.includes('at')) return '@';
          if (low.includes('dot')) return '.';
          return '';
        });
      });
    }
    
    // Decode obfuscated emails
    textContent = EmailParser.decodeObfuscatedEmail(textContent);
    
    // Check for reversed text emails
    const reversed = textContent.split('').reverse().join('');
    const reversedMatches = reversed.match(this.EMAIL_REGEX);
    if (reversedMatches && Array.isArray(reversedMatches)) {
      reversedMatches.forEach(email => {
        const revEmail = email.split('').reverse().join('');
        if (EmailParser.isValidEmail(revEmail)) {
          emails.add(revEmail.toLowerCase());
        }
      });
    }
    
    // Apply all email patterns to processed text
    if (this.EMAIL_PATTERNS && Array.isArray(this.EMAIL_PATTERNS)) {
      this.EMAIL_PATTERNS.forEach(pattern => {
        const textMatches = textContent.match(pattern);
        if (textMatches && Array.isArray(textMatches)) {
          textMatches.forEach(email => {
            if (EmailParser.isValidEmail(email)) {
              emails.add(email.toLowerCase());
            }
          });
        }
      });
    }
    
    // Method 15: Extract from specific hotspots (footer, header, contact sections)
    const hotspotSelectors = [
      'footer', 'header', '.contact-info', '.site-footer', '#contact', 
      '.email', '[data-email]', 'address', '.contact-form', '.contact',
      '.footer', '.header', '.support', '.help', '.about'
    ];
    
    if (hotspotSelectors && Array.isArray(hotspotSelectors)) {
      hotspotSelectors.forEach(selector => {
        const sectionText = $1(selector).text();
        const decodedSectionText = EmailParser.decodeObfuscatedEmail(sectionText);
        const sectionMatches = decodedSectionText.match(this.EMAIL_REGEX);
        if (sectionMatches && Array.isArray(sectionMatches)) {
          sectionMatches.forEach(email => {
            if (EmailParser.isValidEmail(email)) {
              emails.add(email.toLowerCase());
            }
          });
        }
      });
    }

    // Clean and normalize emails
    const cleanedEmails = Array.from(emails)
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
        // Simple text extraction without complex functions
        let fullText = '';
        
        const doc = document;
        const elements = doc.querySelectorAll('*');
        
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (el.style.display === 'none' || el.hidden) continue;
          
          let text = el.innerText || el.textContent || '';
          
          // Simple base64 decode
          const base64Matches = text.match(/atob\(['"]([A-Za-z0-9+/=]+)['"]\)/g);
          if (base64Matches) {
            for (let j = 0; j < base64Matches.length; j++) {
              try {
                const match = base64Matches[j];
                const encoded = match.replace(/atob\(['"]|['"]\)/g, '');
                text += ' ' + atob(encoded);
              } catch (e) {
                // Invalid base64, continue
              }
            }
          }
          
          fullText += ' ' + text;
        }
        
        return fullText;
      });

      // Process the extracted text
      const processedEmails = this.extractEmailsFromHtml(textContent);
      if (processedEmails && Array.isArray(processedEmails)) {
        processedEmails.forEach(email => emails.add(email));
      }

      // Extract from form inputs
      const formEmails = await page.evaluate(() => {
        try {
          const doc = document;
          if (!doc || !doc.querySelectorAll) return [];
          const inputs = doc.querySelectorAll('input[type="email"], input[placeholder*="email"], input[value*="email"]');
          if (!inputs || !inputs.length) return [];
          const results: string[] = [];
          for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const value = input.value || input.placeholder || '';
            if (value && value.includes('@')) {
              results.push(value);
            }
          }
          return results;
        } catch (e) {
          return [];
        }
      });
      if (formEmails && Array.isArray(formEmails)) {
        formEmails.forEach(email => {
          if (email && validator.isEmail(email)) emails.add(email);
        });
      }

      // Extract from meta tags
      const metaEmails = await page.evaluate(() => {
        try {
          const doc = document;
          if (!doc || !doc.querySelectorAll) return [];
          const metas = doc.querySelectorAll('meta[name*="email"], meta[property*="email"], meta[content*="email"]');
          if (!metas || !metas.length) return [];
          const results: string[] = [];
          for (let i = 0; i < metas.length; i++) {
            const meta = metas[i];
            const content = meta.content || '';
            if (content && /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(content)) {
              results.push(content);
            }
          }
          return results;
        } catch (e) {
          return [];
        }
      });
      if (metaEmails && Array.isArray(metaEmails)) {
        metaEmails.forEach(content => {
          if (content) {
            const matches = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            if (matches && Array.isArray(matches)) matches.forEach(email => emails.add(email));
          }
        });
      }

      // Extract from JSON-LD
      const jsonLd = await page.evaluate(() => {
        try {
          const doc = document;
          if (!doc || !doc.querySelectorAll) return [];
          const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
          if (!scripts || !scripts.length) return [];
          const emails: string[] = [];
          for (let i = 0; i < scripts.length; i++) {
            try {
              const script = scripts[i];
              const data = JSON.parse(script.innerHTML || '{}');
              const findEmails = (obj) => {
                if (typeof obj === 'string' && /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(obj)) {
                  emails.push(obj.toLowerCase());
                }
                if (typeof obj === 'object' && obj) {
                  const values = Object.values(obj);
                  if (values && Array.isArray(values)) {
                    for (let j = 0; j < values.length; j++) {
                      findEmails(values[j]);
                    }
                  }
                }
              };
              findEmails(data);
            } catch (e) {
              // Invalid JSON, skip
            }
          }
          return emails;
        } catch (e) {
          return [];
        }
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
        const emails: string[] = [];
        const doc = document;
        
        for (let i = 0; i < selectors.length; i++) {
          const sel = selectors[i];
          const els = doc.querySelectorAll(sel);
          for (let j = 0; j < els.length; j++) {
            const el = els[j];
            let text = el.innerText;
            text = text.replace(/\[at\]/g, '@').replace(/\[dot\]/g, '.');
            const matches = text.match(/[\w\.-]+@[\w\.-]+\.\w+/g);
            if (matches && Array.isArray(matches)) {
              for (let k = 0; k < matches.length; k++) {
                const email = matches[k];
                emails.push(email.toLowerCase());
              }
            }
          }
        }
        return emails;
      });
      if (hotspotEmails && Array.isArray(hotspotEmails)) {
        hotspotEmails.forEach((email: string) => {
          if (validator.isEmail(email)) emails.add(email);
        });
      }

    } catch (error) {
      console.error('Error extracting emails from Puppeteer page:', error);
    }

    return Array.from(emails);
  }
}
