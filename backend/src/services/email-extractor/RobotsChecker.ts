import { Logger } from '../../utils/Logger';

export class RobotsChecker {
  private static logger: Logger = new Logger();

  /**
   * Check if URL is allowed by robots.txt
   */
  public static async isUrlAllowed(url: string, userAgent: string = 'EmailExtractorBot/1.0'): Promise<boolean> {
    try {
      const robotsUrl = new URL('/robots.txt', url).href;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(robotsUrl, {
        headers: {
          'User-Agent': userAgent
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const robotsContent = await response.text();
        return this.parseRobotsTxt(robotsContent, url, userAgent);
      }

      // If robots.txt doesn't exist or is not accessible, assume allowed
      return true;

    } catch (error: any) {
      RobotsChecker.logger.warn('Could not check robots.txt', { 
        url, 
        error: error?.message || 'Unknown error' 
      });
      // If we can't check robots.txt, assume allowed
      return true;
    }
  }

  /**
   * Simple robots.txt parser
   */
  private static parseRobotsTxt(robotsContent: string, url: string, userAgent: string): boolean {
    const lines = robotsContent.split('\n');
    let currentUserAgent = '';
    let isRelevantSection = false;
    const disallowedPaths: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('User-agent:')) {
        const agent = trimmedLine.substring(11).trim();
        currentUserAgent = agent;
        isRelevantSection = agent === '*' || agent.toLowerCase() === userAgent.toLowerCase();
      } else if (trimmedLine.startsWith('Disallow:') && isRelevantSection) {
        const path = trimmedLine.substring(9).trim();
        if (path) {
          disallowedPaths.push(path);
        }
      } else if (trimmedLine.startsWith('Allow:') && isRelevantSection) {
        // For simplicity, we'll focus on disallow rules
        // Allow rules are more complex to implement correctly
      }
    }

    // Check if the URL path is disallowed
    const urlPath = new URL(url).pathname;
    
    for (const disallowedPath of disallowedPaths) {
      if (this.isPathDisallowed(urlPath, disallowedPath)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a path is disallowed by a robots.txt rule
   */
  private static isPathDisallowed(urlPath: string, disallowedPath: string): boolean {
    // Handle wildcard patterns
    if (disallowedPath.includes('*')) {
      const regexPattern = disallowedPath
        .replace(/\*/g, '.*')
        .replace(/\?/g, '\\?')
        .replace(/\./g, '\\.');
      
      const regex = new RegExp(`^${regexPattern}`);
      return regex.test(urlPath);
    }

    // Handle exact matches and prefix matches
    if (disallowedPath === '/') {
      return true; // Disallow everything
    }

    if (disallowedPath.endsWith('$')) {
      // Exact match required
      const exactPath = disallowedPath.slice(0, -1);
      return urlPath === exactPath;
    }

    // Prefix match
    return urlPath.startsWith(disallowedPath);
  }
}
