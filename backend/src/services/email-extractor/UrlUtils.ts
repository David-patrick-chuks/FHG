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
   * Check if a domain is valid (has proper TLD)
   */
  public static isValidDomain(domain: string): boolean {
    if (!domain || domain.trim().length === 0) return false;
    
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').trim();
    
    // Check if it has a valid domain pattern with TLD
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    return domainRegex.test(cleanDomain);
  }

  /**
   * Normalize and validate URLs - automatically add https:// if no protocol
   * Also validates that URLs have proper domain structure
   */
  public static validateUrls(urls: string[]): string[] {
    const validUrls: string[] = [];
    
    for (const url of urls) {
      try {
        let normalizedUrl = url.trim();
        
        // First check if it's a valid domain
        if (!this.isValidDomain(normalizedUrl)) {
          UrlUtils.logger.warn('Invalid domain provided', { url });
          continue;
        }
        
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
