import whoiser from 'whoiser';
import { Logger } from '../../utils/Logger';
import { EmailParser } from './EmailParser';

export class WhoisExtractor {
  private static logger: Logger = new Logger();

  // Common privacy service domains to filter out
  private static readonly PRIVACY_DOMAINS = [
    'withheldforprivacy.com',
    'domainsbyproxy.com',
    'whoisguard.com',
    'whoisguard.org',
    'privacyprotect.org',
    'privacyprotect.com',
    'whoisprivacyprotect.com',
    'whoisprivacyprotect.org',
    'proxy-protection.com',
    'proxy-protection.org',
    'whoisproxy.com',
    'whoisproxy.org',
    'privacyprotect.net',
    'whoisprotect.com',
    'whoisprotect.org',
    'namecheap.com', // Registrar abuse emails
    'godaddy.com',
    'enom.com',
    'tucows.com',
    'register.com'
  ];

  // Common non-business email patterns to filter out
  private static readonly NON_BUSINESS_PATTERNS = [
    /^abuse@/i,
    /^noc@/i,
    /^postmaster@/i,
    /^hostmaster@/i,
    /^webmaster@/i,
    /^admin@/i,
    /^root@/i,
    /^support@/i,
    /^help@/i,
    /^info@/i,
    /^contact@/i,
    /^registrar@/i,
    /^dns@/i,
    /^ns@/i,
    /^mx@/i,
    /^mail@/i,
    /^smtp@/i,
    /^pop@/i,
    /^imap@/i,
    /^ftp@/i,
    /^www@/i,
    /^ftp@/i,
    /^test@/i,
    /^demo@/i,
    /^example@/i,
    /^sample@/i,
    /^temp@/i,
    /^temporary@/i,
    /^placeholder@/i,
    /^default@/i,
    /^null@/i,
    /^none@/i,
    /^no-reply@/i,
    /^noreply@/i,
    /^donotreply@/i,
    /^no-reply@/i,
    /^unsubscribe@/i,
    /^bounce@/i,
    /^bounces@/i,
    /^return@/i,
    /^returns@/i,
    /^undeliverable@/i,
    /^undeliverables@/i,
    /^mailer-daemon@/i,
    /^mailerdaemon@/i,
    /^daemon@/i,
    /^system@/i,
    /^automated@/i,
    /^automatic@/i,
    /^robot@/i,
    /^robots@/i,
    /^bot@/i,
    /^bots@/i,
    /^nobody@/i,
    /^noreply@/i,
    /^no-reply@/i,
    /^donotreply@/i,
    /^unsubscribe@/i,
    /^bounce@/i,
    /^bounces@/i,
    /^return@/i,
    /^returns@/i,
    /^undeliverable@/i,
    /^undeliverables@/i,
    /^mailer-daemon@/i,
    /^mailerdaemon@/i,
    /^daemon@/i,
    /^system@/i,
    /^automated@/i,
    /^automatic@/i,
    /^robot@/i,
    /^robots@/i,
    /^bot@/i,
    /^bots@/i,
    /^nobody@/i
  ];

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
        if (whoisEmails && Array.isArray(whoisEmails)) {
          // Filter out privacy service emails and non-business emails
          const filteredEmails = whoisEmails.filter(email => this.isValidBusinessEmail(email));
          filteredEmails.forEach(email => emails.add(email));
          
          WhoisExtractor.logger.info('WHOIS extraction completed with filtering', { 
            domain, 
            totalEmails: whoisEmails.length,
            filteredEmails: filteredEmails.length,
            emailsFound: emails.size 
          });
        } else {
          WhoisExtractor.logger.info('WHOIS extraction completed', { 
            domain, 
            emailsFound: emails.size 
          });
        }
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
   * Check if an email is a valid business email (not privacy service or system email)
   */
  private static isValidBusinessEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    
    // Extract domain from email
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    // Check if domain is a privacy service domain
    if (this.PRIVACY_DOMAINS.includes(domain.toLowerCase())) {
      return false;
    }
    
    // Check if email matches non-business patterns
    for (const pattern of this.NON_BUSINESS_PATTERNS) {
      if (pattern.test(email)) {
        return false;
      }
    }
    
    // Additional checks for common privacy service patterns
    if (email.includes('protect@') || 
        email.includes('privacy@') || 
        email.includes('proxy@') ||
        email.includes('withheld@') ||
        email.includes('whois@') ||
        email.includes('abuse@') ||
        email.includes('noc@') ||
        email.includes('postmaster@')) {
      return false;
    }
    
    return true;
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
      if (extractedEmails && Array.isArray(extractedEmails)) {
        extractedEmails.forEach(email => emails.add(email));
      }

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
      const whoisValues = Object.values(whoisData);
      if (whoisValues && Array.isArray(whoisValues)) {
        whoisValues.forEach((serverData: any) => {
          if (typeof serverData === 'object' && serverData !== null) {
            if (emailFields && Array.isArray(emailFields)) {
              emailFields.forEach(field => {
                const value = serverData[field];
                if (value && typeof value === 'string' && value.includes('@')) {
                  // Extract email from the field value
                  const emailMatches = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
                  if (emailMatches && Array.isArray(emailMatches)) {
                    emailMatches.forEach(email => emails.add(email.toLowerCase()));
                  }
                }
              });
            }

            // Also check for email patterns in any field value
            const serverValues = Object.values(serverData);
            if (serverValues && Array.isArray(serverValues)) {
              serverValues.forEach((value: any) => {
                if (typeof value === 'string' && value.includes('@')) {
                  const emailMatches = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
                  if (emailMatches && Array.isArray(emailMatches)) {
                    emailMatches.forEach(email => emails.add(email.toLowerCase()));
                  }
                }
              });
            }
          }
        });
      }

    } catch (error) {
      WhoisExtractor.logger.warn('Error extracting emails from WHOIS data', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    return Array.from(emails);
  }
}