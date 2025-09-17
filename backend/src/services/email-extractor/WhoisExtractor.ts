import { Logger } from '../../utils/Logger';
import { EmailParser } from './EmailParser';
import whoiser from 'whoiser';

export class WhoisExtractor {
  private static logger: Logger = new Logger();

  /**
   * Extract emails from WHOIS data using the whoiser library
   */
  public static async extractEmailsFromWhois(url: string): Promise<string[]> {
    const emails = new Set<string>();
    
    try {
      const domain = new URL(url).hostname;
      WhoisExtractor.logger.info('Extracting WHOIS emails', { domain });

      // Use whoiser library for WHOIS lookup
      const whoisData = await this.performWhoisLookup(domain);
      
      if (whoisData) {
        // Extract emails from WHOIS data
        const whoisEmails = this.extractEmailsFromWhoisData(whoisData);
        whoisEmails.forEach(email => emails.add(email));

        WhoisExtractor.logger.info('WHOIS extraction completed', { 
          domain, 
          emailsFound: emails.size 
        });
      }

    } catch (error: any) {
      WhoisExtractor.logger.warn('WHOIS extraction failed', { 
        url, 
        error: error?.message || 'Unknown error' 
      });
    }

    return Array.from(emails);
  }

  /**
   * Perform WHOIS lookup using the whoiser library
   */
  private static async performWhoisLookup(domain: string): Promise<any> {
    try {
      // Use whoiser library for domain WHOIS lookup
      const whoisData = await whoiser(domain, {
        timeout: 10000,
        follow: 2, // Query both registry and registrar servers
        raw: true, // Include raw data
        ignorePrivacy: false // Include privacy-protected data
      });

      return whoisData;

    } catch (error) {
      WhoisExtractor.logger.warn('WHOIS lookup failed', { 
        domain, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }

  /**
   * Extract emails from WHOIS data structure
   */
  private static extractEmailsFromWhoisData(whoisData: any): string[] {
    const emails = new Set<string>();

    try {
      // Convert WHOIS data to string for email extraction
      const whoisText = JSON.stringify(whoisData);
      
      // Use EmailParser to extract emails from the text
      const extractedEmails = EmailParser.extractEmailsFromHtml(whoisText);
      extractedEmails.forEach(email => emails.add(email));

      // Also look for specific WHOIS fields that commonly contain emails
      const emailFields = [
        'Registrant Email',
        'Admin Email',
        'Tech Email',
        'Billing Email',
        'Registrant Contact Email',
        'Administrative Contact Email',
        'Technical Contact Email',
        'Registrant E-mail',
        'Admin E-mail',
        'Tech E-mail',
        'Billing E-mail',
        'Email',
        'E-mail',
        'Contact Email',
        'Contact E-mail'
      ];

      // Search through all WHOIS servers' data
      Object.values(whoisData).forEach((serverData: any) => {
        if (typeof serverData === 'object' && serverData !== null) {
          emailFields.forEach(field => {
            const value = serverData[field];
            if (value && typeof value === 'string' && value.includes('@')) {
              // Extract email from the field value
              const emailMatches = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
              if (emailMatches) {
                emailMatches.forEach(email => emails.add(email.toLowerCase()));
              }
            }
          });

          // Also check for email patterns in any field value
          Object.values(serverData).forEach((value: any) => {
            if (typeof value === 'string' && value.includes('@')) {
              const emailMatches = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
              if (emailMatches) {
                emailMatches.forEach(email => emails.add(email.toLowerCase()));
              }
            }
          });
        }
      });

    } catch (error) {
      WhoisExtractor.logger.warn('Error extracting emails from WHOIS data', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    return Array.from(emails);
  }
}