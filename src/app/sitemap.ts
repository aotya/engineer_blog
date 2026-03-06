import type { MetadataRoute } from 'next';
import { getWpData } from '../../lib/helpers/wpApiList';

const siteUrl = process.env.SITE_URL ?? 'https://example.com';

type CategoryEdge = {
  node: {
    slug: string;
  };
};

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

type CategoriesResponse = {
  categories: {
    edges: CategoryEdge[];
    pageInfo: PageInfo;
  };
};

type PostEdge = {
  node: {
    slug: string;
    date?: string;
    terms?: {
      nodes: Array<{
        // Discriminated union not necessary here; we only read slug if Category
        slug?: string;
        __typename?: string;
      }>;
    };
  };
};

type PostsResponse = {
  posts: {
    edges: PostEdge[];
    pageInfo: PageInfo;
  };
};

async function fetchAllCategorySlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let after: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const result = await getWpData(
      `
      query AllCategories($first: Int!, $after: String) {
        categories(first: $first, after: $after) {
          edges {
            node {
              slug
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
      { variables: { first: 100, after } }
    );

    const data = (result?.data ?? {}) as CategoriesResponse;
    for (const edge of data.categories?.edges ?? []) {
      if (edge?.node?.slug) slugs.push(edge.node.slug);
    }
    hasNext = Boolean(data.categories?.pageInfo?.hasNextPage);
    after = data.categories?.pageInfo?.endCursor ?? null;
  }
  return Array.from(new Set(slugs));
}

async function fetchAllPostEntries(): Promise<
  Array<{ slug: string; categorySlug: string | null; lastModified?: string }>
> {
  const entries: Array<{ slug: string; categorySlug: string | null; lastModified?: string }> = [];
  let after: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const result = await getWpData(
      `
      query AllPosts($first: Int!, $after: String) {
        posts(first: $first, after: $after) {
          edges {
            node {
              slug
              date
              terms {
                nodes {
                  __typename
                  ... on Category {
                    slug
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
      { variables: { first: 100, after } }
    );

    const data = (result?.data ?? {}) as PostsResponse;
    for (const edge of data.posts?.edges ?? []) {
      const postSlug = edge?.node?.slug;
      if (!postSlug) continue;
      const categories = edge.node.terms?.nodes?.filter((n) => n.__typename === 'Category') ?? [];
      const primaryCategorySlug = (categories[0]?.slug as string | undefined) ?? null;
      entries.push({
        slug: postSlug,
        categorySlug: primaryCategorySlug,
        lastModified: edge.node.date,
      });
    }
    hasNext = Boolean(data.posts?.pageInfo?.hasNextPage);
    after = data.posts?.pageInfo?.endCursor ?? null;
  }
  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [categorySlugs, posts] = await Promise.all([
      fetchAllCategorySlugs(),
      fetchAllPostEntries(),
    ]);

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
      .filter((p) => Boolean(p.categorySlug))
      .map((p) => ({
        url: `${siteUrl}/${p.categorySlug}/${p.slug}`,
        lastModified: p.lastModified ? new Date(p.lastModified) : now,
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


