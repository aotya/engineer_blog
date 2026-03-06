import axios from 'axios';
import {GetChildCategoriesBySlugResultData, GetPostsEdgesResult} from "./apiType";
import {CategoryBySlugResult} from "./apiType";
import {GetPostsByCategoryResult} from "./apiType";
import {GetArticleBySlugResult} from "./apiType";

export async function getWpData(query = "", { variables }: Record<string, unknown> = {}) {
  const url = process.env.GRAPHQL_ENDPOINT;
  try {
    const response = await axios.post(`${url}`, {
      query,
      variables,
    },
    {
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${refreshToken}`,
      },
    }
    );

    const { data } = response;
    if (data.errors) {
      console.error(data.errors);
      throw new Error('Failed to fetch API');
    }
    return data;

  } catch (error) {
    // Axiosのエラーをキャッチしてログに出力
    console.error('An error occurred:', error);
    throw error;
  }
}


// TOPページで使用：カテゴリーごとの記事一覧取得
export async function getArticlesListByCategory({ first = 3, after = null, category = null }: { first?: number; after?: string | null; category?: string | null } = {}) {
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
}


// スラッグからカテゴリーIDを取得
export async function GetCategoryBySlug(slug: string) {
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
      console.error("GetCategoryBySlug: Category not found or structure mismatch", slugs);
    }
    return slugs.data.category as CategoryBySlugResult['category'];
  } catch (error) {
    console.error("Slug fetching failed:", error);
    return undefined;
  }
}

// カテゴリーIDから該当カテゴリ記事一覧取得（全件取得：最大100件）
export async function GetPostsByCategory(categoryId: string): Promise<GetPostsByCategoryResult | undefined> {
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
}



// 記事をスラッグで取得し、サニタイズして返す関数
export async function getArticleBySlug(slug: string, { variables }: Record<string, unknown> = {}): Promise<GetArticleBySlugResult | undefined> {
  try {
    const articles = await getWpData(`
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
      }`, { variables: variables });

  if (articles && articles.content) {
    const preData = preserveTags(articles.content, 'pre');
    const codeData = preserveTags(preData.content, 'code');
    
    let contentWithBreaks = codeData.content;
    
    contentWithBreaks = restoreTags(contentWithBreaks, 'code', codeData.placeholders);
    contentWithBreaks = restoreTags(contentWithBreaks, 'pre', preData.placeholders);
    articles.content = contentWithBreaks;
  }
    return articles;
  } catch (error) {
    console.error("Articles fetching failed:", error);
  }
}

const preserveTags = (content: string, tagName: string) => {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const placeholders: string[] = [];
  let index = 0;
  content = content.replace(regex, (match: string, p1: string) => {
    placeholders.push(p1);
    return `<${tagName}-placeholder-${index++}></${tagName}-placeholder>`;
  });
  return { content, placeholders };
};

const restoreTags = (content: string, tagName: string, placeholders: string[]) => {
  placeholders.forEach((text: string, index: number) => {
    content = content.replace(
      new RegExp(`<${tagName}-placeholder-${index}></${tagName}-placeholder>`, 'gi'),
      `<${tagName}>${text}</${tagName}>`
    );
  });
  return content;
};



// スラッグから子カテゴリーを取得(TOPページで使用)
export async function GetChildCategoriesBySlug(parentSlug: string) {
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
}
