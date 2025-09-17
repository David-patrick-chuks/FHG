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
      const response = await axios.get(url, {
        timeout: this.REQUEST_TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error: any) {
      // Only log errors that are not common/expected failures
      const errorMessage = error?.message || 'Unknown error';
      const statusCode = error?.response?.status;
      
      // Don't log 404s, DNS failures, or timeouts as warnings - these are common
      if (statusCode === 404 || 
          errorMessage.includes('EAI_AGAIN') || 
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('ECONNREFUSED')) {
        // These are common failures, just return null silently
        return null;
      }
      
      // Log other errors as warnings
      HtmlFetcher.logger.warn('Failed to fetch HTML', { 
        url, 
        error: errorMessage,
        statusCode 
      });
      return null;
    }
  }
}
