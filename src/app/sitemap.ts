import type { MetadataRoute } from 'next';
import { getAllCategories, getAllPostEntries } from '../../lib/helpers/contentApi';

const siteUrl = process.env.SITE_URL ?? 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [categories, posts] = await Promise.all([
      getAllCategories(),
      getAllPostEntries(),
    ]);
    const categorySlugs = categories.map((c) => c.slug);

    const now = new Date();
    const staticEntries: MetadataRoute.Sitemap = [
      {
        url: `${siteUrl}/`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 1,
      },
    ];

    const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
      url: `${siteUrl}/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const postEntries: MetadataRoute.Sitemap = posts
      .filter((p) => Boolean(p.category))
      .map((p) => ({
        url: `${siteUrl}/${p.category}/${p.slug}`,
        lastModified: p.date ? new Date(p.date) : now,
        changeFrequency: 'monthly',
        priority: 0.8,
      }));

    return [...staticEntries, ...categoryEntries, ...postEntries];
  } catch (e) {
    // フォールバック（最低限のサイトマップ）
    return [
      {
        url: `${siteUrl}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
    ];
  }
}


