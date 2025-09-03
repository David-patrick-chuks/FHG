import csv from 'csv-parser';
import { Readable } from 'stream';
import { Logger } from '../utils/Logger';

export interface ParsedEmailResult {
  emails: string[];
  totalCount: number;
  validCount: number;
  invalidEmails: string[];
}

export class FileUploadService {
  private static logger: Logger = new Logger();

  /**
   * Parse CSV file and extract email addresses
   */
  public static async parseCSVFile(fileBuffer: Buffer): Promise<ParsedEmailResult> {
    return new Promise((resolve, reject) => {
      const emails: string[] = [];
      const invalidEmails: string[] = [];
      
      const stream = Readable.from(fileBuffer);
      
      stream
        .pipe(csv())
        .on('data', (row) => {
          // Try to find email in any column
          const email = this.extractEmailFromRow(row);
          if (email) {
            if (this.isValidEmail(email)) {
              emails.push(email.toLowerCase().trim());
            } else {
              invalidEmails.push(email);
            }
          }
        })
        .on('end', () => {
          const uniqueEmails = [...new Set(emails)];
          resolve({
            emails: uniqueEmails,
            totalCount: emails.length,
            validCount: uniqueEmails.length,
            invalidEmails
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Parse text file and extract email addresses
   */
  public static async parseTextFile(fileBuffer: Buffer): Promise<ParsedEmailResult> {
    const content = fileBuffer.toString('utf-8');
    const lines = content.split('\n');
    const emails: string[] = [];
    const invalidEmails: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Extract emails from the line (supports multiple emails per line)
        const emailMatches = trimmedLine.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatches) {
          for (const email of emailMatches) {
            if (this.isValidEmail(email)) {
              emails.push(email.toLowerCase().trim());
            } else {
              invalidEmails.push(email);
            }
          }
        }
      }
    }

    const uniqueEmails = [...new Set(emails)];
    return {
      emails: uniqueEmails,
      totalCount: emails.length,
      validCount: uniqueEmails.length,
      invalidEmails
    };
  }

  /**
   * Extract email from CSV row
   */
  private static extractEmailFromRow(row: any): string | null {
    // Common email column names
    const emailColumns = ['email', 'e-mail', 'mail', 'address', 'email_address', 'e_mail'];
    
    for (const column of emailColumns) {
      if (row[column] && typeof row[column] === 'string') {
        return row[column];
      }
    }

    // If no email column found, try to find any value that looks like an email
    for (const key in row) {
      const value = row[key];
      if (value && typeof value === 'string' && value.includes('@')) {
        return value;
      }
    }

    return null;
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Parse file based on its type
   */
  public static async parseFile(fileBuffer: Buffer, mimeType: string): Promise<ParsedEmailResult> {
    try {
      this.logger.info('Parsing file', { mimeType, size: fileBuffer.length });

      if (mimeType === 'text/csv') {
        return await this.parseCSVFile(fileBuffer);
      } else if (mimeType === 'text/plain') {
        return await this.parseTextFile(fileBuffer);
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      this.logger.error('File parsing error:', error);
      throw error;
    }
  }
}
