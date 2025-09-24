'use client';

import Script from 'next/script';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

// Pre-built structured data components
export function OrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MailQuill',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'AI-powered email marketing platform that helps businesses create, automate, and optimize email campaigns for maximum engagement and ROI.',
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
  };

  return <JsonLd data={organizationData} />;
}

export function WebsiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  const websiteData = {
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
  };

  return <JsonLd data={websiteData} />;
}

export function SoftwareApplicationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  const softwareData = {
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
    releaseNotes: 'Initial release of MailQuill AI-powered email marketing platform',
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
  };

  return <JsonLd data={softwareData} />;
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };

  return <JsonLd data={breadcrumbData} />;
}

export function FAQJsonLd({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const faqData = {
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

  return <JsonLd data={faqData} />;
}

export function ArticleJsonLd({ 
  title, 
  description, 
  author = 'MailQuill Team',
  datePublished,
  dateModified,
  image,
  url 
}: {
  title: string;
  description: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  url?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  
  const articleData = {
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
  };

  return <JsonLd data={articleData} />;
}
