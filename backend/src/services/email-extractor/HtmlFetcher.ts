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
    } catch (error) {
      HtmlFetcher.logger.warn('Failed to fetch HTML', { url, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }
}
