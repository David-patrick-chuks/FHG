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
   * Normalize and validate URLs - automatically add https:// if no protocol
   */
  public static validateUrls(urls: string[]): string[] {
    const validUrls: string[] = [];
    
    for (const url of urls) {
      try {
        let normalizedUrl = url.trim();
        
        // If no protocol is provided, try adding https://
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
          normalizedUrl = `https://${normalizedUrl}`;
        }
        
        const urlObj = new URL(normalizedUrl);
        if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
          validUrls.push(normalizedUrl);
        }
      } catch (error) {
        UrlUtils.logger.warn('Invalid URL provided', { url, error });
      }
    }
    
    return validUrls;
  }
}
