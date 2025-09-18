import axios from 'axios';
import { Logger } from '../../utils/Logger';

export class HtmlFetcher {
  private static logger: Logger = new Logger();
  private static readonly REQUEST_TIMEOUT = 8000; // Reduced from 15s to 8s for faster extraction

  /**
   * Fetch HTML content from URL
   */
  public static async fetchHtml(url: string): Promise<string | null> {
    try {
      HtmlFetcher.logger.info('Fetching HTML content', { url });
      
      const response = await axios.get(url, {
        timeout: this.REQUEST_TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        validateStatus: (status) => status < 500 // Don't throw for 4xx errors
      });
      
      if (response.status >= 400) {
        HtmlFetcher.logger.warn('HTTP error response', { 
          url, 
          status: response.status,
          statusText: response.statusText 
        });
        return null;
      }
      
      HtmlFetcher.logger.info('HTML content fetched successfully', { 
        url, 
        contentLength: response.data?.length || 0,
        status: response.status 
      });
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      const statusCode = error?.response?.status;
      const errorCode = error?.code;
      
      // Log all errors with detailed information for debugging
      HtmlFetcher.logger.warn('Failed to fetch HTML', { 
        url, 
        error: errorMessage,
        statusCode,
        errorCode,
        stack: error?.stack?.split('\n').slice(0, 3).join('\n')
      });
      
      // Still return null, but now we have proper logging
      return null;
    }
  }
}
