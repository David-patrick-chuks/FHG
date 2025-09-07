import * as cheerio from 'cheerio';

export class EmailParser {
  private static readonly EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;

  /**
   * Extract emails from HTML content - Enhanced with multiple techniques
   */
  public static extractEmailsFromHtml(html: string): string[] {
    const emails: string[] = [];
    
    // Method 1: Standard regex extraction
    const matches = html.match(this.EMAIL_REGEX);
    if (matches) {
      emails.push(...matches);
    }

    // Method 2: Extract from mailto links
    const $ = cheerio.load(html);
    $("a[href^='mailto:']").each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const email = href.replace('mailto:', '').split('?')[0].split('&')[0];
        emails.push(email);
      }
    });

    // Method 3: Look for emails in data attributes
    $("[data-email], [data-contact], [data-mail]").each((_, element) => {
      const email = $(element).attr('data-email') || 
                   $(element).attr('data-contact') || 
                   $(element).attr('data-mail');
      if (email && email.includes('@')) {
        emails.push(email);
      }
    });

    // Method 4: Look for emails in title attributes
    $("[title*='@']").each((_, element) => {
      const title = $(element).attr('title');
      if (title) {
        const titleMatches = title.match(this.EMAIL_REGEX);
        if (titleMatches) {
          emails.push(...titleMatches);
        }
      }
    });

    // Method 5: Look for emails in alt attributes
    $("[alt*='@']").each((_, element) => {
      const alt = $(element).attr('alt');
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
    $('meta[name*="email"], meta[property*="email"], meta[content*="@"]').each((_, element) => {
      const content = $(element).attr('content');
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
    $('input[type="email"], input[name*="email"], input[id*="email"]').each((_, element) => {
      const value = $(element).attr('value') || $(element).attr('placeholder');
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
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonContent = $(element).html();
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
    $('[itemprop*="email"], [itemprop*="contact"], [itemprop*="mail"]').each((_, element) => {
      const content = $(element).attr('content') || $(element).text();
      if (content) {
        const microdataMatches = content.match(this.EMAIL_REGEX);
        if (microdataMatches) {
          emails.push(...microdataMatches);
        }
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
}
