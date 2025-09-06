import { Logger } from '../../utils/Logger';

export class UrlUtils {
  private static logger: Logger = new Logger();

  /**
   * Normalize URL
   */
  public static normalizeUrl(base: string, link: string): string | null {
    if (!link) return null;
    
    try {
      if (link.startsWith('/')) {
        const baseUrl = new URL(base);
        return `${baseUrl.protocol}//${baseUrl.host}${link}`;
      }
      if (link.startsWith('http')) {
        return link;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate URLs
   */
  public static validateUrls(urls: string[]): string[] {
    const validUrls: string[] = [];
    
    for (const url of urls) {
      try {
        const urlObj = new URL(url);
        if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
          validUrls.push(url);
        }
      } catch (error) {
        UrlUtils.logger.warn('Invalid URL provided', { url, error });
      }
    }
    
    return validUrls;
  }
}
