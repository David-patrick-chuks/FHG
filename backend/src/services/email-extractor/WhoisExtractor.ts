import { Logger } from '../../utils/Logger';
import { EmailParser } from './EmailParser';
import { HtmlFetcher } from './HtmlFetcher';

export class WhoisExtractor {
  private static logger: Logger = new Logger();

  /**
   * Extract emails from WHOIS data
   */
  public static async extractEmailsFromWhois(url: string): Promise<string[]> {
    const emails: string[] = [];
    
    try {
      const domain = new URL(url).hostname;
      
      // Try WHOIS lookup services with better error handling
      const whoisUrls = [
        `https://whois.net/whois/${domain}`,
        `https://www.whois.com/whois/${domain}`,
        `https://whois.domaintools.com/${domain}`
      ];

      let successfulLookups = 0;
      for (const whoisUrl of whoisUrls) {
        try {
          const html = await HtmlFetcher.fetchHtml(whoisUrl);
          if (html) {
            const foundEmails = EmailParser.extractEmailsFromHtml(html);
            foundEmails.forEach(email => emails.push(email));
            successfulLookups++;
            
            // If we found emails, we can stop trying other services
            if (foundEmails.length > 0) {
              break;
            }
          }
        } catch (error) {
          // WHOIS service not accessible, continue silently
          continue;
        }
      }
      
      // Only log if all WHOIS services failed and it's not a common issue
      if (successfulLookups === 0) {
        WhoisExtractor.logger.info('All WHOIS services unavailable for domain', { domain });
      }
    } catch (error) {
      // Only log unexpected errors, not URL parsing issues
      if (error instanceof TypeError && error.message.includes('Invalid URL')) {
        WhoisExtractor.logger.info('Invalid URL for WHOIS lookup', { url });
      } else {
        WhoisExtractor.logger.warn('Error extracting emails from WHOIS', { url, error });
      }
    }

    return [...new Set(emails)];
  }
}
