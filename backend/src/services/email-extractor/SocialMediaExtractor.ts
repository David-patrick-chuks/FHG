import { Logger } from '../../utils/Logger';
import { EmailParser } from './EmailParser';
import { HtmlFetcher } from './HtmlFetcher';

export class SocialMediaExtractor {
  private static logger: Logger = new Logger();

  /**
   * Extract emails from social media and common patterns
   */
  public static async extractEmailsFromSocialMedia(url: string): Promise<string[]> {
    const emails: string[] = [];
    
    try {
      const domain = new URL(url).hostname;
      const baseDomain = domain.replace('www.', '');
      
      // Try common social media patterns
      const socialPatterns = [
        `https://www.facebook.com/${baseDomain}`,
        `https://www.instagram.com/${baseDomain}`,
        `https://www.twitter.com/${baseDomain}`,
        `https://www.linkedin.com/company/${baseDomain}`,
        `https://www.youtube.com/c/${baseDomain}`,
        `https://${baseDomain}/facebook`,
        `https://${baseDomain}/instagram`,
        `https://${baseDomain}/twitter`,
        `https://${baseDomain}/linkedin`
      ];

      for (const socialUrl of socialPatterns) {
        try {
          const html = await HtmlFetcher.fetchHtml(socialUrl);
          if (html) {
            const extractedEmails = EmailParser.extractEmailsFromHtml(html);
            if (extractedEmails && Array.isArray(extractedEmails)) {
              extractedEmails.forEach(email => emails.push(email));
            }
          }
        } catch (error) {
          // Social media page not found, continue
        }
      }
    } catch (error) {
      SocialMediaExtractor.logger.warn('Error extracting emails from social media', { url, error });
    }

    return [...new Set(emails)];
  }
}
