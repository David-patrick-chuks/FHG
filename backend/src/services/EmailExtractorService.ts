
import { EmailExtractorCore } from './email-extractor/EmailExtractorCore';

export class EmailExtractorService {
  /**
   * Start email extraction job
   */
  public static async startExtraction(
    userId: string,
    urls: string[]
  ) {
    return EmailExtractorCore.startExtraction(userId, urls);
  }

  /**
   * Process email extraction job
   */
  public static async processExtractionJob(jobData: {
    jobId: string;
    userId: string;
    urls: string[];
  }) {
    return EmailExtractorCore.processExtractionJob(jobData);
  }

  /**
   * Get user's extraction history
   */
  public static async getUserExtractions(
    userId: string,
    limit: number = 20,
    skip: number = 0
  ) {
    return EmailExtractorCore.getUserExtractions(userId, limit, skip);
  }

  /**
   * Get extraction by job ID
   */
  public static async getExtractionByJobId(jobId: string) {
    return EmailExtractorCore.getExtractionByJobId(jobId);
  }
}
