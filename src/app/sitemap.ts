import { getAllPageSlug, getAllCategories } from '@/lib/helpers/WpApiList';
import type { MetadataRoute } from 'next';
import {getAllPageSlugType, categoryAllSlugResult} from "../lib/helpers//apiType"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    let articlesData:getAllPageSlugType | undefined = await getAllPageSlug();
    let sitemapArticlesData = articlesData?.data.posts.edges;

    let categoriesData:categoryAllSlugResult | undefined = await getAllCategories();
    let sitemapCategoriesData = categoriesData?.categories.edges;

    // 固定記事
    const createSitemapArticles:any = () => {
      if(sitemapArticlesData) {
        const blogPages: MetadataRoute.Sitemap = sitemapArticlesData.map((post) => ({
          url: `https://www.front-end-engineer-blog.com/${post.node.categories.nodes[0].slug}/${post.node.slug}`,
          lastModified: new Date(post.node.date),
          changeFrequency: 'weekly',
        }));
        return blogPages;
      }
      return [];
    }

    // カテゴリー記事一覧
    const createSitemapCategories:any = () => {
      if(sitemapCategoriesData) {
        const blogPages: MetadataRoute.Sitemap = sitemapCategoriesData.map((post) => ({
          url: `https://www.front-end-engineer-blog.com/${post.node.slug}`,
          changeFrequency: 'monthly',
        }));
        return blogPages;
      }
      return [];
    }

    const defaultPages: MetadataRoute.Sitemap = [
      {
        url: 'https://www.front-end-engineer-blog.com/',
        changeFrequency: 'monthly',
      },
    ];

  return [...defaultPages, ...createSitemapCategories(), ...createSitemapArticles()];
}