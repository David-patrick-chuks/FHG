/**
 * Utility functions for email tracking
 */

export class TrackingUtils {
  /**
   * Generate tracking URL for email open tracking
   */
  public static generateTrackingUrl(campaignId: string, emailId: string): string {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/track/open?cid=${campaignId}&tid=${emailId}`;
  }

  /**
   * Generate click tracking URL (for future use)
   */
  public static generateClickTrackingUrl(
    campaignId: string, 
    emailId: string, 
    originalUrl: string
  ): string {
    const baseUrl = process.env.API_BASE_UR || 'http://localhost:5000';
    const encodedUrl = encodeURIComponent(originalUrl);
    return `${baseUrl}/track/click?cid=${campaignId}&tid=${emailId}&url=${encodedUrl}`;
  }

  /**
   * Add tracking pixel to email content
   */
  public static addTrackingPixel(htmlContent: string, trackingUrl: string): string {
    // Check if the content already has a tracking pixel
    if (htmlContent.includes('tracking-pixel')) {
      return htmlContent;
    }

    // Add tracking pixel at the end of the email
    const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" class="tracking-pixel" alt="" />`;
    
    // If the content has a closing body tag, insert before it
    if (htmlContent.includes('</body>')) {
      return htmlContent.replace('</body>', `${trackingPixel}</body>`);
    }
    
    // If the content has a closing html tag, insert before it
    if (htmlContent.includes('</html>')) {
      return htmlContent.replace('</html>', `${trackingPixel}</html>`);
    }
    
    // Otherwise, just append to the end
    return htmlContent + trackingPixel;
  }

  /**
   * Replace links in email content with tracked links
   */
  public static addClickTracking(htmlContent: string, campaignId: string, emailId: string): string {
    // Replace href attributes with tracked URLs
    return htmlContent.replace(/href="([^"]+)"/g, (match, url) => {
      // Skip if it's already a tracking URL or a mailto link
      if (url.includes('/track/') || url.startsWith('mailto:')) {
        return match;
      }
      
      const trackedUrl = this.generateClickTrackingUrl(campaignId, emailId, url);
      return `href="${trackedUrl}"`;
    });
  }

  /**
   * Calculate open rate percentage
   */
  public static calculateOpenRate(opened: number, delivered: number): number {
    if (delivered === 0) return 0;
    return Math.round((opened / delivered) * 100);
  }

  /**
   * Calculate delivery rate percentage
   */
  public static calculateDeliveryRate(delivered: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((delivered / total) * 100);
  }

  /**
   * Calculate reply rate percentage
   */
  public static calculateReplyRate(replied: number, opened: number): number {
    if (opened === 0) return 0;
    return Math.round((replied / opened) * 100);
  }

  /**
   * Format tracking statistics for display
   */
  public static formatTrackingStats(stats: {
    total: number;
    delivered: number;
    opened: number;
    replied: number;
    failed: number;
  }): {
    total: number;
    delivered: number;
    opened: number;
    replied: number;
    failed: number;
    deliveryRate: number;
    openRate: number;
    replyRate: number;
  } {
    return {
      ...stats,
      deliveryRate: this.calculateDeliveryRate(stats.delivered, stats.total),
      openRate: this.calculateOpenRate(stats.opened, stats.delivered),
      replyRate: this.calculateReplyRate(stats.replied, stats.opened)
    };
  }

  /**
   * Validate tracking parameters
   */
  public static validateTrackingParams(campaignId: string, emailId: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!campaignId || campaignId.trim() === '') {
      errors.push('Campaign ID is required');
    }

    if (!emailId || emailId.trim() === '') {
      errors.push('Email ID is required');
    }

    // Validate campaign ID format (assuming it should be a valid MongoDB ObjectId or similar)
    if (campaignId && campaignId.length < 3) {
      errors.push('Campaign ID format is invalid');
    }

    // Validate email ID format
    if (emailId && emailId.length < 3) {
      errors.push('Email ID format is invalid');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate tracking pixel HTML
   */
  public static generateTrackingPixelHtml(trackingUrl: string): string {
    return `<img src="${trackingUrl}" width="1" height="1" style="display:none;" class="tracking-pixel" alt="" />`;
  }

  /**
   * Extract tracking parameters from URL
   */
  public static extractTrackingParams(url: string): {
    campaignId?: string;
    emailId?: string;
    originalUrl?: string;
  } {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      return {
        campaignId: params.get('cid') || undefined,
        emailId: params.get('tid') || undefined,
        originalUrl: params.get('url') || undefined
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Check if URL is a tracking URL
   */
  public static isTrackingUrl(url: string): boolean {
    return url.includes('/track/');
  }

  /**
   * Sanitize email content for tracking
   */
  public static sanitizeEmailContent(content: string): string {
    // Remove any existing tracking pixels to avoid duplicates
    return content.replace(/<img[^>]*class="tracking-pixel"[^>]*>/gi, '');
  }

  /**
   * Get tracking pixel base64 data
   */
  public static getTrackingPixelData(): Buffer {
    return Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
      'base64'
    );
  }

  /**
   * Generate unique tracking ID
   */
  public static generateTrackingId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Parse tracking query parameters
   */
  public static parseTrackingQuery(query: any): {
    campaignId?: string;
    emailId?: string;
    originalUrl?: string;
  } {
    return {
      campaignId: query.cid,
      emailId: query.tid,
      originalUrl: query.url
    };
  }
}

export default TrackingUtils;
