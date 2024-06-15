import axios from 'axios';
import sanitizeContent from "./Sanitize";
// WPに連携するベースとなるapi
export async function getWpData(query = "", { variables }: Record<string, any> = {}) {
  const url = process.env.GRAPHQL_ENDPOINT;
  try {
    const response = await axios.post(`${url}`, {
      query,
      variables,
    });

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

export async function getArticlesList({ variables }: Record<string, any> = {}) {
  try {
    const articles = await getWpData(`
    query GetPostsEdges {
      posts {
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
              }
            }
            featuredImage {
              node {
                link
              }
            }
            postId
          }
        }
      }
    }`, { variables: variables });
    return articles;
  } catch (error) {
    console.error("Articles fetching failed:", error);
  }
}


// 記事をスラッグで取得し、サニタイズして返す関数
export async function getArticleBySlug(slug:any,{ variables }: Record<string, any> = {}) {
  try {
    const articles = await getWpData(`
    query GetPostBySlug {
      postBy(slug: "${slug}") {
        title
        content
        date
        terms {
          nodes {
            ... on Category {
              id
              name
            }
          }
        }
      }
    }`, { variables: variables });
    const articlesData = articles?.data?.postBy;

    // コンテンツをサニタイズする
    if (articlesData && articlesData.content) {
      articlesData.content = articlesData.content.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
      articlesData.content = sanitizeContent(articlesData.content);
    }

    return articlesData;
  } catch (error) {
    console.error("Articles fetching failed:", error);
  }
}


