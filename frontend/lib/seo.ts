import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: 'website' | 'article' | 'product';
    url?: string;
    siteName?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    images?: string[];
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
    googleBot?: {
      index?: boolean;
      follow?: boolean;
      'max-video-preview'?: number;
      'max-image-preview'?: 'none' | 'standard' | 'large';
      'max-snippet'?: number;
    };
  };
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
  verification?: {
    google?: string;
    yandex?: string;
    yahoo?: string;
    other?: Record<string, string>;
  };
}

const defaultSEO: Partial<SEOConfig> = {
  openGraph: {
    type: 'website',
    siteName: 'MailQuill',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MailQuill - AI-Powered Email Marketing Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mailquill',
    creator: '@mailquill',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    canonical,
    openGraph,
    twitter,
    robots,
    alternates,
    verification,
  } = { ...defaultSEO, ...config };

  const fullTitle = title.includes('MailQuill') ? title : `${title} | MailQuill`;
  const fullDescription = description || 'AI-powered email marketing platform that helps businesses create, automate, and optimize email campaigns for maximum engagement and ROI.';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';

  return {
    title: {
      default: fullTitle,
      template: '%s | MailQuill',
    },
    description: fullDescription,
    keywords: keywords?.join(', '),
    authors: [{ name: 'MailQuill Team', url: baseUrl }],
    creator: 'MailQuill',
    publisher: 'MailQuill',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonical,
      ...alternates,
    },
    openGraph: {
      title: openGraph?.title || fullTitle,
      description: openGraph?.description || fullDescription,
      type: openGraph?.type || 'website',
      url: openGraph?.url || canonical,
      siteName: openGraph?.siteName || 'MailQuill',
      images: openGraph?.images || defaultSEO.openGraph?.images,
      locale: 'en_US',
      countryName: 'United States',
    },
    twitter: {
      card: twitter?.card || 'summary_large_image',
      site: twitter?.site || '@mailquill',
      creator: twitter?.creator || '@mailquill',
      title: twitter?.title || fullTitle,
      description: twitter?.description || fullDescription,
      images: twitter?.images || ['/og-image.png'],
    },
    robots: robots,
    verification: verification,
    category: 'technology',
    classification: 'Email Marketing Software',
    applicationName: 'MailQuill',
    referrer: 'origin-when-cross-origin',
    colorScheme: 'dark light',
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    },
    other: {
      'application-name': 'MailQuill',
      'apple-mobile-web-app-title': 'MailQuill',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#2563eb',
      'theme-color': '#2563eb',
      'msapplication-config': '/browserconfig.xml',
      'apple-touch-icon': '/apple-touch-icon.png',
      'icon': '/favicon.ico',
    },
  };
}

// Predefined SEO configurations for common pages
export const seoConfigs = {
  home: {
    title: 'MailQuill - AI-Powered Email Marketing Platform',
    description: 'Transform your email marketing with AI technology. Create, automate, and optimize email campaigns that deliver results. Start your free trial today.',
    keywords: [
      'email marketing',
      'AI email marketing',
      'email automation',
      'email campaigns',
      'marketing automation',
      'email marketing software',
      'AI marketing tools',
      'email marketing platform',
      'automated emails',
      'email marketing solutions',
    ],
    openGraph: {
      type: 'website' as const,
      url: '/',
    },
  },
  pricing: {
    title: 'Pricing - Affordable Email Marketing Plans',
    description: 'Choose the perfect email marketing plan for your business. Start free or upgrade to unlock advanced AI features, automation, and analytics.',
    keywords: [
      'email marketing pricing',
      'email marketing plans',
      'email marketing cost',
      'affordable email marketing',
      'email marketing subscription',
      'email marketing pricing plans',
    ],
    openGraph: {
      type: 'website' as const,
      url: '/pricing',
    },
  },
  features: {
    title: 'Features - Advanced Email Marketing Tools',
    description: 'Discover powerful email marketing features including AI content generation, automation workflows, analytics, and more to grow your business.',
    keywords: [
      'email marketing features',
      'AI email features',
      'email automation features',
      'email marketing tools',
      'marketing automation features',
      'email analytics',
    ],
    openGraph: {
      type: 'website' as const,
      url: '/features',
    },
  },
  about: {
    title: 'About Us - MailQuill Team',
    description: 'Learn about MailQuill\'s mission to revolutionize email marketing with AI technology. Meet our team and discover our story.',
    keywords: [
      'about mailquill',
      'email marketing company',
      'AI marketing company',
      'mailquill team',
      'email marketing mission',
    ],
    openGraph: {
      type: 'website' as const,
      url: '/about',
    },
  },
  contact: {
    title: 'Contact Us - Get in Touch',
    description: 'Get in touch with the MailQuill team. We\'re here to help you succeed with your email marketing campaigns.',
    keywords: [
      'contact mailquill',
      'email marketing support',
      'mailquill help',
      'customer support',
      'contact us',
    ],
    openGraph: {
      type: 'website' as const,
      url: '/contact',
    },
  },
  login: {
    title: 'Sign In - MailQuill Dashboard',
    description: 'Sign in to your MailQuill account to access your email marketing dashboard and start creating campaigns.',
    keywords: [
      'mailquill login',
      'sign in',
      'email marketing dashboard',
      'account login',
    ],
    robots: {
      index: false,
      follow: true,
    },
  },
  signup: {
    title: 'Sign Up - Start Your Free Trial',
    description: 'Join thousands of businesses using MailQuill for their email marketing. Start your free trial today and see the difference AI can make.',
    keywords: [
      'mailquill signup',
      'free trial',
      'email marketing signup',
      'create account',
      'start free trial',
    ],
  },
  privacy: {
    title: 'Privacy Policy - MailQuill',
    description: 'Learn how MailQuill protects your privacy and handles your data. Our commitment to data security and privacy.',
    keywords: [
      'privacy policy',
      'data protection',
      'privacy',
      'data security',
      'GDPR compliance',
    ],
    robots: {
      index: true,
      follow: true,
    },
  },
  terms: {
    title: 'Terms of Service - MailQuill',
    description: 'Read MailQuill\'s terms of service and understand your rights and responsibilities when using our platform.',
    keywords: [
      'terms of service',
      'terms and conditions',
      'user agreement',
      'legal terms',
    ],
    robots: {
      index: true,
      follow: true,
    },
  },
  help: {
    title: 'Help Center - MailQuill Support',
    description: 'Find answers to common questions, tutorials, and guides to help you get the most out of MailQuill\'s email marketing features.',
    keywords: [
      'help center',
      'support',
      'tutorials',
      'guides',
      'FAQ',
      'email marketing help',
    ],
    openGraph: {
      type: 'website' as const,
      url: '/help-center',
    },
  },
  apiDocs: {
    title: 'API Documentation - MailQuill Developer Hub',
    description: 'Comprehensive API documentation for MailQuill\'s email marketing platform. Integrate with your applications using our REST API.',
    keywords: [
      'API documentation',
      'developer API',
      'email marketing API',
      'REST API',
      'developer tools',
      'API integration',
    ],
    openGraph: {
      type: 'website' as const,
      url: '/api-docs',
    },
  },
  systemStatus: {
    title: 'System Status - MailQuill Uptime',
    description: 'Check the current status of MailQuill\'s services and systems. Real-time monitoring of our email marketing platform.',
    keywords: [
      'system status',
      'uptime',
      'service status',
      'mailquill status',
      'monitoring',
    ],
    openGraph: {
      type: 'website' as const,
      url: '/system-status',
    },
  },
};

// Enhanced structured data generators
export function generateStructuredData(type: 'organization' | 'website' | 'product' | 'article' | 'faq' | 'breadcrumb', data?: any) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  switch (type) {
    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'MailQuill',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'AI-powered email marketing platform that helps businesses create, automate, and optimize email campaigns.',
        foundingDate: '2024',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-555-0123',
          contactType: 'customer service',
          email: 'support@mailquill.com',
          availableLanguage: 'English',
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'US',
          addressLocality: 'San Francisco',
          addressRegion: 'CA',
        },
        sameAs: [
          'https://twitter.com/mailquill',
          'https://linkedin.com/company/mailquill',
          'https://facebook.com/mailquill',
          'https://github.com/mailquill',
        ],
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
        ...data,
      };
    
    case 'website':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'MailQuill',
        url: baseUrl,
        description: 'AI-powered email marketing platform',
        publisher: {
          '@type': 'Organization',
          name: 'MailQuill',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
        ...data,
      };
    
    case 'product':
      return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MailQuill',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: 'AI-powered email marketing platform that helps businesses create, automate, and optimize email campaigns.',
        url: baseUrl,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2025-12-31',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '1250',
          bestRating: '5',
          worstRating: '1',
        },
        author: {
          '@type': 'Organization',
          name: 'MailQuill',
        },
        publisher: {
          '@type': 'Organization',
          name: 'MailQuill',
        },
        datePublished: '2024-01-01',
        dateModified: new Date().toISOString(),
        version: '1.0',
        softwareVersion: '1.0',
        featureList: [
          'AI-powered email content generation',
          'Email automation workflows',
          'Advanced analytics and reporting',
          'A/B testing capabilities',
          'Email template library',
          'Contact management',
          'Campaign scheduling',
          'Performance optimization',
        ],
        ...data,
      };
    
    case 'article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data?.title || 'MailQuill Article',
        description: data?.description || 'Article about email marketing',
        author: {
          '@type': 'Organization',
          name: 'MailQuill',
        },
        publisher: {
          '@type': 'Organization',
          name: 'MailQuill',
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
          },
        },
        datePublished: data?.datePublished || new Date().toISOString(),
        dateModified: data?.dateModified || new Date().toISOString(),
        image: data?.image ? `${baseUrl}${data.image}` : `${baseUrl}/og-image.png`,
        url: data?.url ? `${baseUrl}${data.url}` : baseUrl,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data?.url ? `${baseUrl}${data.url}` : baseUrl,
        },
        ...data,
      };
    
    case 'faq':
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data?.faqs?.map((faq: any) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })) || [],
        ...data,
      };
    
    case 'breadcrumb':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data?.items?.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${baseUrl}${item.url}`,
        })) || [],
        ...data,
      };
    
    default:
      return null;
  }
}

// Utility function to generate page-specific metadata
export function generatePageMetadata(pageType: keyof typeof seoConfigs, customData?: Partial<SEOConfig>): Metadata {
  const baseConfig = seoConfigs[pageType];
  return generateMetadata({ ...baseConfig, ...customData });
}

// Function to generate dynamic metadata for blog posts
export function generateBlogPostMetadata(post: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  tags?: string[];
  image?: string;
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  return generateMetadata({
    title: post.title,
    description: post.description,
    keywords: post.tags || [],
    canonical: `/blog/${post.slug}`,
    openGraph: {
      type: 'article',
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : undefined,
    },
  });
}

// Function to generate metadata for help articles
export function generateHelpArticleMetadata(article: {
  title: string;
  description: string;
  slug: string;
  category?: string;
  lastModified?: string;
}): Metadata {
  return generateMetadata({
    title: article.title,
    description: article.description,
    keywords: ['help', 'support', 'tutorial', 'guide', article.category || ''],
    canonical: `/help-center/${article.slug}`,
    openGraph: {
      type: 'article',
      url: `/help-center/${article.slug}`,
    },
  });
}
