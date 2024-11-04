import axios from 'axios';
import sanitizeContent from "./Sanitize";
import {categoryAllSlugResult, GetPostsEdgesResult, SlugResult} from "./apiType";
// WPに連携するベースとなるapi
export async function getWpData(query = "", { variables }: Record<string, any> = {}) {
  const url = process.env.GRAPHQL_ENDPOINT;
  // const refreshToken = process.env.WORDPRESS_AUTH_REFRESH_TOKEN;
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

export async function getArticlesList({ first = 10, after = null }: { first?: number; after?: string | null } = {}) {
  try {
    const articles = await getWpData(`
      query GetPostsEdges($first: Int!, $after: String) {
        posts(first: $first, after: $after) {
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
      variables: { first, after }
    });
    
    return articles.data as GetPostsEdgesResult;
  } catch (error) {
    console.error("Articles fetching failed:", error);
    return undefined;
  }
}


const preserveTags = (content:string, tagName:String) => {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  let placeholders: string[] = [];
  let index = 0;
  content = content.replace(regex, (match: any, p1: any) => {
    placeholders.push(p1);
    return `<${tagName}-placeholder-${index++}></${tagName}-placeholder>`;
  });
  return { content, placeholders };
};

const restoreTags = (content: string, tagName: string, placeholders: any[]) => {
  placeholders.forEach((text: any, index: any) => {
    content = content.replace(
      new RegExp(`<${tagName}-placeholder-${index}></${tagName}-placeholder>`, 'gi'),
      `<${tagName}>${text}</${tagName}>`
    );
  });
  return content;
};



// 記事をスラッグで取得し、サニタイズして返す関数
export async function getArticleBySlug(slug:any,{ variables }: Record<string, any> = {}) {
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
            }
          }
        }
      }
    }`, { variables: variables });
    const articlesData = articles?.data?.postBy;

// コンテンツをサニタイズする
if (articlesData && articlesData.content) {
  let preData = preserveTags(articlesData.content, 'pre');
  let codeData = preserveTags(preData.content, 'code');
  
  let contentWithBreaks = codeData.content;
  
  contentWithBreaks = restoreTags(contentWithBreaks, 'code', codeData.placeholders);
  contentWithBreaks = restoreTags(contentWithBreaks, 'pre', preData.placeholders);
  articlesData.content = sanitizeContent(contentWithBreaks);
}

    return articlesData;
  } catch (error) {
    console.error("Articles fetching failed:", error);
  }
}


// スラッグのみを取得する関数
export async function getAllSlugs(): Promise<SlugResult | undefined> {
  try {
    const slugs = await getWpData(`
    query GetSlugs {
      posts {
        edges {
          node {
            slug
          }
        }
      }
    }`);

    return slugs.data as SlugResult;
  } catch (error) {
    console.error("Slug fetching failed:", error);
    return undefined;
  }
}
// スラッグのみを取得する関数
export async function getAllCategories(): Promise<categoryAllSlugResult | undefined> {
  try {
    const slugs = await getWpData(`
    query GetAllCategories {
      categories {
        edges {
          node {
            slug
          }
        }
      }
    }
    `);

    return slugs.data as categoryAllSlugResult;
  } catch (error) {
    console.error("Slug fetching failed:", error);
    return undefined;
  }
}


// スラッグからカテゴリーIDを取得
export async function GetCategoryBySlug(slug: any): Promise<SlugResult | undefined> {
  try {
    const slugs = await getWpData(`
    query GetCategoryBySlug {
      category(id: "${slug}", idType: SLUG) {
        categoryId
        name
        slug
      }
    }`);

    return slugs.data.category ;
  } catch (error) {
    console.error("Slug fetching failed:", error);
    return undefined;
  }
}

// スカテゴリーIDから該当カテゴリ記事一覧取得
export async function GetPostsByCategory(categoryId: any): Promise<SlugResult | undefined> {
  try {
    const slugs = await getWpData(`
    query GetPostsByCategory {
      posts(where: {categoryId: ${categoryId}}) {
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
    }`);

    return slugs.data;
  } catch (error) {
    console.error("Slug fetching failed:", error);
    return undefined;
  }
}



export async function getArticlesCategoryList({categoryId, first = 10, after = null }: {categoryId?: string, first?: number; after?: string | null } = {}) {
  try {
    const articles = await getWpData(`
      query GetPostsEdges($first: Int!, $after: String) {
        posts(first: $first, after: $after) {
          edges {
            node {
              id
              title
              date
              slug
              categories {
                nodes {
                  name
                  uri
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
      variables: { first, after }
    });
    
    return articles.data as GetPostsEdgesResult;
  } catch (error) {
    console.error("Articles fetching failed:", error);
    return undefined;
  }
}




