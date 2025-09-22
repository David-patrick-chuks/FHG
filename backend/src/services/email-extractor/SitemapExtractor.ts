import * as xml2js from 'xml2js';
import { Logger } from '../../utils/Logger';

export class SitemapExtractor {
  private static logger: Logger = new Logger();

  /**
   * Extract URLs from sitemap.xml for comprehensive crawling
   */
  public static async extractUrlsFromSitemap(baseUrl: string): Promise<string[]> {
    const urls = new Set<string>();
    
    try {
      const sitemapUrl = new URL('/sitemap.xml', baseUrl).href;
      SitemapExtractor.logger.info('Fetching sitemap', { sitemapUrl });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(sitemapUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const xmlContent = await response.text();
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlContent);

        if (result.urlset && result.urlset.url && Array.isArray(result.urlset.url)) {
          result.urlset.url.forEach((entry: any) => {
            if (entry.loc && entry.loc[0]) {
              const url = entry.loc[0].trim();
              if (this.isValidUrl(url)) {
                urls.add(url);
              }
            }
          });
        }

        SitemapExtractor.logger.info('Sitemap parsing completed', { 
          urlsFound: urls.size,
          sitemapUrl 
        });
      } else {
        SitemapExtractor.logger.warn('Sitemap not accessible', { 
          sitemapUrl, 
          status: response.status 
        });
      }

    } catch (error: any) {
      SitemapExtractor.logger.warn('Sitemap extraction failed', { 
        baseUrl, 
        error: error?.message || 'Unknown error' 
      });
    }

    // Sort URLs by priority (contact/about pages first)
    return Array.from(urls).sort((a, b) => {
      const aScore = this.getUrlPriority(a);
      const bScore = this.getUrlPriority(b);
      return aScore - bScore;
    });
  }

  /**
   * Check if URL is valid and should be crawled
   */
  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Only allow HTTP/HTTPS
      if (!urlObj.protocol.startsWith('http')) {
        return false;
      }

      // Skip file extensions that are unlikely to contain emails
      const skipExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.css', '.js', '.xml', '.zip', '.rar', '.tar', '.gz'];
      if (skipExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get priority score for URL (lower = higher priority)
   */
  private static getUrlPriority(url: string): number {
    const urlLower = url.toLowerCase();
    
    // High priority pages (likely to contain contact info)
    if (urlLower.includes('contact') || urlLower.includes('about') || urlLower.includes('support')) {
      return 0;
    }
    
    // Medium priority pages
    if (urlLower.includes('team') || urlLower.includes('staff') || urlLower.includes('company') || 
        urlLower.includes('help') || urlLower.includes('faq') || urlLower.includes('policies')) {
      return 1;
    }
    
    // Lower priority pages
    if (urlLower.includes('blog') || urlLower.includes('news') || urlLower.includes('products') || 
        urlLower.includes('services') || urlLower.includes('portfolio')) {
      return 2;
    }
    
    // Default priority
    return 3;
  }
}
