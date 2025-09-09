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
    
    const isValid = domainRegex.test(cleanDomain);
    UrlUtils.logger.info('Domain validation', { domain: cleanDomain, isValid });
    
    return isValid;
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
        
        // If no protocol is provided, try adding https://
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
          normalizedUrl = `https://${normalizedUrl}`;
        }
        
        // Extract domain from URL for validation
        let domain = '';
        try {
          const urlObj = new URL(normalizedUrl);
          domain = urlObj.hostname;
        } catch (urlError) {
          // If URL parsing fails, try to extract domain manually
          const match = normalizedUrl.match(/^https?:\/\/([^\/]+)/);
          if (match) {
            domain = match[1];
          } else {
            UrlUtils.logger.warn('Could not extract domain from URL', { url: normalizedUrl, error: urlError });
            continue;
          }
        }
        
        // Check if the domain is valid
        if (!this.isValidDomain(domain)) {
          UrlUtils.logger.warn('Invalid domain provided', { url, domain });
          continue;
        }
        
        // Final validation - try to create URL object again
        try {
          const finalUrl = new URL(normalizedUrl);
          if (finalUrl.protocol === 'http:' || finalUrl.protocol === 'https:') {
            validUrls.push(normalizedUrl);
            UrlUtils.logger.info('Valid URL added', { originalUrl: url, normalizedUrl, domain });
          }
        } catch (finalError) {
          UrlUtils.logger.warn('Final URL validation failed', { url: normalizedUrl, error: finalError });
        }
      } catch (error) {
        UrlUtils.logger.warn('Invalid URL provided', { url, error });
      }
    }
    
    return validUrls;
  }
}
