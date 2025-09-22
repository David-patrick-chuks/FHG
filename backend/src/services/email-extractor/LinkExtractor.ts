import * as cheerio from 'cheerio';
import { Logger } from '../../utils/Logger';
import { UrlUtils } from './UrlUtils';

export class LinkExtractor {
  private static logger: Logger = new Logger();

  /**
   * Extract all internal links from HTML
   */
  public static extractAllInternalLinks(baseUrl: string, html: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];
    const seen = new Set<string>();

    try {
      const baseDomain = new URL(baseUrl).hostname;

      $("a[href]").each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          const normalizedUrl = UrlUtils.normalizeUrl(baseUrl, href);
          if (normalizedUrl && !seen.has(normalizedUrl)) {
            try {
              const linkDomain = new URL(normalizedUrl).hostname;
              // Only include internal links
              if (linkDomain === baseDomain || linkDomain.endsWith('.' + baseDomain)) {
                links.push(normalizedUrl);
                seen.add(normalizedUrl);
              }
            } catch (error) {
              // Invalid URL, skip
            }
          }
        }
      });
    } catch (error) {
      LinkExtractor.logger.warn('Error extracting internal links', { baseUrl, error });
    }

    return links;
  }

  /**
   * Extract contact-related URLs from homepage
   */
  public static extractContactUrls(baseUrl: string, html: string): string[] {
    const $ = cheerio.load(html);
    const contactUrls: string[] = [];
    const seen = new Set<string>();

    $("a[href]").each((_, element) => {
      const href = $(element).attr('href');
      if (href && /contact|about|support|help/i.test(href)) {
        const normalizedUrl = UrlUtils.normalizeUrl(baseUrl, href);
        if (normalizedUrl && !seen.has(normalizedUrl)) {
          contactUrls.push(normalizedUrl);
          seen.add(normalizedUrl);
        }
      }
    });

    return contactUrls.slice(0, 5); // Limit to 5 contact pages
  }
}
