import { MetadataRoute } from 'next';

// This could be replaced with actual data fetching from your CMS/API
async function getBlogPosts() {
  // Mock data - replace with actual API call
  return [
    { slug: 'ai-email-marketing-tips', lastModified: new Date('2024-01-15') },
    { slug: 'email-automation-best-practices', lastModified: new Date('2024-01-10') },
    { slug: 'improve-email-open-rates', lastModified: new Date('2024-01-05') },
  ];
}

async function getHelpArticles() {
  // Mock data - replace with actual API call
  return [
    { slug: 'getting-started', lastModified: new Date('2024-01-20') },
    { slug: 'creating-email-campaigns', lastModified: new Date('2024-01-18') },
    { slug: 'automation-workflows', lastModified: new Date('2024-01-16') },
    { slug: 'analytics-dashboard', lastModified: new Date('2024-01-14') },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mailquill.com';
  const currentDate = new Date();

  // Get dynamic content
  const blogPosts = await getBlogPosts();
  const helpArticles = await getHelpArticles();

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help-center`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/api-docs`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/system-status`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/app-password-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/reset-password`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ];

  // Blog posts
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Help articles
  const helpPages = helpArticles.map((article) => ({
    url: `${baseUrl}/help-center/${article.slug}`,
    lastModified: article.lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...helpPages];
}
