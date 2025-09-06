import { Logger } from '../../utils/Logger';
import { HtmlFetcher } from './HtmlFetcher';
import { EmailParser } from './EmailParser';

export class WhoisExtractor {
  private static logger: Logger = new Logger();

  /**
   * Extract emails from WHOIS data
   */
  public static async extractEmailsFromWhois(url: string): Promise<string[]> {
    const emails: string[] = [];
    
    try {
      const domain = new URL(url).hostname;
      
      // Try WHOIS lookup services
      const whoisUrls = [
        `https://whois.net/whois/${domain}`,
        `https://www.whois.com/whois/${domain}`,
        `https://whois.domaintools.com/${domain}`
      ];

      for (const whoisUrl of whoisUrls) {
        try {
          const html = await HtmlFetcher.fetchHtml(whoisUrl);
          if (html) {
            EmailParser.extractEmailsFromHtml(html).forEach(email => emails.push(email));
          }
        } catch (error) {
          // WHOIS service not accessible, continue
        }
      }
    } catch (error) {
      WhoisExtractor.logger.warn('Error extracting emails from WHOIS', { url, error });
    }

    return [...new Set(emails)];
  }
}
