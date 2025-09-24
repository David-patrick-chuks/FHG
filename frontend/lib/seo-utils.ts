/**
 * SEO utility functions for better search engine optimization
 */

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

// Generate Open Graph URL
export function generateOGUrl(path: string): string {
  return generateCanonicalUrl(path);
}

// Generate Twitter URL
export function generateTwitterUrl(path: string): string {
  return generateCanonicalUrl(path);
}

// Truncate text for meta descriptions
export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Generate keywords from content
export function generateKeywords(content: string, additionalKeywords: string[] = []): string[] {
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word));
  
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedWords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  return [...new Set([...sortedWords, ...additionalKeywords])];
}

// Generate reading time estimate
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Generate excerpt from content
export function generateExcerpt(content: string, maxLength: number = 160): string {
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return truncateText(plainText, maxLength);
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Generate structured data for breadcrumbs
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

// Generate FAQ structured data
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Generate article structured data
export function generateArticleStructuredData({
  title,
  description,
  author = 'MailQuill Team',
  datePublished,
  dateModified,
  image,
  url,
  wordCount,
  readingTime,
}: {
  title: string;
  description: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  url?: string;
  wordCount?: number;
  readingTime?: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Organization',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MailQuill',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
    image: image ? `${baseUrl}${image}` : `${baseUrl}/og-image.png`,
    url: url ? `${baseUrl}${url}` : baseUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url ? `${baseUrl}${url}` : baseUrl,
    },
    ...(wordCount && { wordCount }),
    ...(readingTime && { timeRequired: `PT${readingTime}M` }),
  };
}

// Generate product structured data
export function generateProductStructuredData({
  name,
  description,
  price,
  currency = 'USD',
  availability = 'InStock',
  brand = 'MailQuill',
  category,
  image,
  url,
  rating,
  reviewCount,
}: {
  name: string;
  description: string;
  price?: number;
  currency?: string;
  availability?: string;
  brand?: string;
  category?: string;
  image?: string;
  url?: string;
  rating?: number;
  reviewCount?: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    ...(category && { category }),
    ...(image && { image: `${baseUrl}${image}` }),
    ...(url && { url: `${baseUrl}${url}` }),
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
      },
    }),
    ...(rating && reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toString(),
        reviewCount: reviewCount.toString(),
      },
    }),
  };
}

// Generate local business structured data
export function generateLocalBusinessStructuredData({
  name = 'MailQuill',
  description = 'AI-powered email marketing platform',
  address,
  phone,
  email,
  website,
  openingHours,
  priceRange,
}: {
  name?: string;
  description?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string[];
  priceRange?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    url: website || baseUrl,
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.street,
        addressLocality: address.city,
        addressRegion: address.state,
        postalCode: address.zipCode,
        addressCountry: address.country,
      },
    }),
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    ...(openingHours && { openingHours }),
    ...(priceRange && { priceRange }),
  };
}

// Generate event structured data
export function generateEventStructuredData({
  name,
  description,
  startDate,
  endDate,
  location,
  organizer,
  url,
  image,
}: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: {
    name: string;
    address?: string;
  };
  organizer?: string;
  url?: string;
  image?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    startDate,
    ...(endDate && { endDate }),
    ...(location && {
      location: {
        '@type': 'Place',
        name: location.name,
        ...(location.address && { address: location.address }),
      },
    }),
    ...(organizer && {
      organizer: {
        '@type': 'Organization',
        name: organizer,
      },
    }),
    ...(url && { url: `${baseUrl}${url}` }),
    ...(image && { image: `${baseUrl}${image}` }),
  };
}
