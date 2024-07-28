import axios from 'axios';
import sanitizeContent from "./Sanitize";
import {GetPostsEdgesResult} from "./apiType";
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

export async function getArticlesList({ variables }: Record<string, any> = {}): Promise<GetPostsEdgesResult | undefined> {
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
    return articles as GetPostsEdgesResult;
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
            link
          }
        }
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
  let preData = preserveTags(articlesData.content, 'pre');
  let codeData = preserveTags(preData.content, 'code');
  
  let contentWithBreaks = codeData.content.replace(/(?:\r\n|\r|\n)/g, '<br />');
  
  contentWithBreaks = restoreTags(contentWithBreaks, 'code', codeData.placeholders);
  contentWithBreaks = restoreTags(contentWithBreaks, 'pre', preData.placeholders);
  
  articlesData.content = sanitizeContent(contentWithBreaks);
}

    return articlesData;
  } catch (error) {
    console.error("Articles fetching failed:", error);
  }
}


