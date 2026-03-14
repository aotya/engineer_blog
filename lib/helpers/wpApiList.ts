import { cache } from 'react';
import {GetChildCategoriesBySlugResultData, GetPostsEdgesResult} from "./apiType";
import {CategoryBySlugResult} from "./apiType";
import {GetPostsByCategoryResult} from "./apiType";
import {GetArticleBySlugResult} from "./apiType";
import { TOP_CODING_ITEMS_PER_PAGE } from "../constants";

export async function getWpData(query = "", { variables }: Record<string, unknown> = {}) {
  const url = process.env.GRAPHQL_ENDPOINT;
  
  if (!url) {
    throw new Error('GRAPHQL_ENDPOINT is not defined');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error(data.errors);
      throw new Error('Failed to fetch API');
    }
    
    return data;

  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}


// TOPページで使用：カテゴリーごとの記事一覧取得
export const getArticlesListByCategory = cache(async function({ first = TOP_CODING_ITEMS_PER_PAGE, after = null, category = null }: { first?: number; after?: string | null; category?: string | null } = {}) {
  try {
    const articles = await getWpData(`
      query GetPostsEdges($first: Int!, $after: String, $category: String) {
        posts(first: $first, after: $after, where: { categoryName: $category }) {
          edges {
            node {
              id
              title
              date
              content
              slug
              categories {
                nodes {
                  name
                  uri
                  slug
                }
              }
              featuredImage {
                node {
                  sourceUrl
                }
              }
              postId
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `, {
      variables: { first, after, category }
    });
    
    return articles.data as GetPostsEdgesResult;
  } catch (error) {
    console.error("Articles fetching failed:", error);
    return undefined;
  }
});


// スラッグからカテゴリーIDを取得
export const GetCategoryBySlug = cache(async function(slug: string) {
  try {
    const slugs = await getWpData(`
    query GetCategoryBySlug {
      category(id: "${slug}", idType: SLUG) {
        categoryId
        name
        slug
        count
      }
    }`);
    // データ構造の確認ログ
    if (!slugs?.data?.category) {
      // console.error("GetCategoryBySlug: Category not found or structure mismatch", slugs);
      return undefined;
    }
    return slugs.data.category as CategoryBySlugResult['category'];
  } catch (error) {
    console.error("Slug fetching failed:", error);
    return undefined;
  }
});

// カテゴリーIDから該当カテゴリ記事一覧取得（全件取得：最大100件）
export const GetPostsByCategory = cache(async function(categoryId: string): Promise<GetPostsByCategoryResult | undefined> {
  const variables: Record<string, any> = { 
    categoryId: Number(categoryId),
    first: 100 // 十分な数を指定して全件取得
  };

  try {
    const slugs = await getWpData(`
    query GetPostsByCategory($categoryId: Int!, $first: Int) {
      posts(where: {categoryId: $categoryId}, first: $first) {
        edges {
          node {
            id
            title
            date
            content
            slug
            categories {
              nodes {
                name
              }
            }
            featuredImage {
              node {
                sourceUrl
              }
            }
          }
        }
      }
    }`, { variables });

    return slugs.data;
  } catch (error) {
    console.error("Slug fetching failed:", error);
    return undefined;
  }
});



// 記事をスラッグで取得
export const getArticleBySlug = cache(async function(slug: string): Promise<GetArticleBySlugResult | undefined> {
  try {
    const result = await getWpData(`
      query GetPostBySlug {
        postBy(slug: "${slug}") {
          title
          content
          date
          featuredImage {
            node {
              sourceUrl
            }
          }
          terms {
            nodes {
              ... on Category {
                id
                name
                slug
                categoryId
              }
            }
          }
          excerpt
        }
      }`);

    return result.data.postBy as GetArticleBySlugResult;
  } catch (error) {
    console.error("Articles fetching failed:", error);
    return undefined;
  }
});



// generateStaticParams 用：全カテゴリ一覧を取得
export const getAllCategories = cache(async function(): Promise<{ slug: string }[]> {
  try {
    const result = await getWpData(`
      query GetAllCategories {
        categories(first: 100) {
          nodes {
            slug
          }
        }
      }
    `);
    return result.data.categories.nodes as { slug: string }[];
  } catch (error) {
    console.error("getAllCategories failed:", error);
    return [];
  }
});

// generateStaticParams 用：全記事のカテゴリスラッグとスラッグを取得
export const getAllPostSlugs = cache(async function(): Promise<{ category: string; slug: string }[]> {
  try {
    const result = await getWpData(`
      query GetAllPostSlugs {
        posts(first: 1000) {
          nodes {
            slug
            categories {
              nodes {
                slug
              }
            }
          }
        }
      }
    `);
    const posts = result.data.posts.nodes as {
      slug: string;
      categories: { nodes: { slug: string }[] };
    }[];
    return posts.flatMap((post) =>
      post.categories.nodes.map((cat) => ({
        category: cat.slug,
        slug: post.slug,
      }))
    );
  } catch (error) {
    console.error("getAllPostSlugs failed:", error);
    return [];
  }
});

// スラッグから子カテゴリーを取得(TOPページで使用)
export const GetChildCategoriesBySlug = cache(async function(parentSlug: string) {
  try {
    const slugs = await getWpData(`
      query GetChildCategoriesBySlug {
        category(id: "${parentSlug}", idType: SLUG) {
          children {
            nodes {
              name
              slug
            }
          }
        }
      }
  `);
    return slugs.data.category.children as GetChildCategoriesBySlugResultData['children'];
  } catch (error) {
    console.error("Slug fetching failed:", error);
    return undefined;
  }
});
