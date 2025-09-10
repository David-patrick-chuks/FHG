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
    try {
      // UrlUtils.logger.info('isValidDomain called', { domain });
      
      if (!domain || domain.trim().length === 0) {
        // UrlUtils.logger.info('Domain is empty or null', { domain });
        return false;
      }
      
      // Remove protocol if present
      const cleanDomain = domain.replace(/^https?:\/\//, '').trim();
      // UrlUtils.logger.info('Domain cleaned', { originalDomain: domain, cleanDomain });
      
      // Simple domain validation - just check for basic structure
      // Must have at least one dot and be at least 3 characters long
      const hasDot = cleanDomain.includes('.');
      const hasValidLength = cleanDomain.length >= 3;
      const hasValidChars = /^[a-zA-Z0-9.-]+$/.test(cleanDomain);
      const endsWithTLD = /\.[a-zA-Z]{2,}$/.test(cleanDomain);
      
      const isValid = hasDot && hasValidLength && hasValidChars && endsWithTLD;
      
      // UrlUtils.logger.info('Domain validation result', { 
      //   domain: cleanDomain, 
      //   isValid,
      //   hasDot,
      //   hasValidLength,
      //   hasValidChars,
      //   endsWithTLD
      // });
      
      return isValid;
    } catch (error: any) {
      UrlUtils.logger.error('Exception in isValidDomain', { 
        domain, 
        error: error?.message || String(error), 
        stack: error?.stack 
      });
      return false;
    }
  }

  /**
   * Normalize and validate URLs - automatically add https:// if no protocol
   * Also validates that URLs have proper domain structure
   */
  public static validateUrls(urls: string[]): string[] {
    const validUrls: string[] = [];
    
    // UrlUtils.logger.info('Starting URL validation', { inputUrls: urls, count: urls.length });
    
    for (const url of urls) {
      // UrlUtils.logger.info('Processing URL', { url });
      
      try {
        let normalizedUrl = url.trim();
        // UrlUtils.logger.info('URL trimmed', { originalUrl: url, trimmedUrl: normalizedUrl });
        
        // If no protocol is provided, try adding https://
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
          normalizedUrl = `https://${normalizedUrl}`;
          // UrlUtils.logger.info('Added https protocol', { normalizedUrl });
        } else {
          // UrlUtils.logger.info('URL already has protocol', { normalizedUrl });
        }
        
        // Extract domain from URL for validation
        let domain = '';
        try {
          // UrlUtils.logger.info('Attempting to parse URL', { normalizedUrl });
          const urlObj = new URL(normalizedUrl);
          domain = urlObj.hostname;
          // UrlUtils.logger.info('URL parsed successfully', { domain, hostname: urlObj.hostname });
        } catch (urlError) {
          // UrlUtils.logger.warn('URL parsing failed, trying manual extraction', { url: normalizedUrl, error: urlError });
          // If URL parsing fails, try to extract domain manually
          const match = normalizedUrl.match(/^https?:\/\/([^\/]+)/);
          if (match) {
            domain = match[1];
            // UrlUtils.logger.info('Domain extracted manually', { domain });
          } else {
            // UrlUtils.logger.warn('Could not extract domain from URL', { url: normalizedUrl, error: urlError });
            continue;
          }
        }
        
        // Check if the domain is valid - simplified for now
        // UrlUtils.logger.info('Checking domain validity', { domain });
        
        // Simple domain check - just ensure it has a dot and is not empty
        if (!domain || !domain.includes('.') || domain.length < 3) {
          // UrlUtils.logger.warn('Invalid domain provided', { url, domain });
          continue;
        }
        
        // UrlUtils.logger.info('Domain is valid', { domain });
        
        // Final validation - try to create URL object again
        try {
          // UrlUtils.logger.info('Final URL validation', { normalizedUrl });
          const finalUrl = new URL(normalizedUrl);
          if (finalUrl.protocol === 'http:' || finalUrl.protocol === 'https:') {
            validUrls.push(normalizedUrl);
            // UrlUtils.logger.info('Valid URL added to results', { originalUrl: url, normalizedUrl, domain });
          } else {
            // UrlUtils.logger.warn('Invalid protocol', { protocol: finalUrl.protocol });
          }
        } catch (finalError) {
          // UrlUtils.logger.warn('Final URL validation failed', { url: normalizedUrl, error: finalError });
        }
      } catch (error: any) {
        UrlUtils.logger.error('Exception in URL processing', { url, error: error?.message || String(error), stack: error?.stack });
      }
    }
    
    // UrlUtils.logger.info('URL validation completed', { 
    //   inputCount: urls.length, 
    //   validCount: validUrls.length, 
    //   validUrls 
    // });
    
    return validUrls;
  }
}
