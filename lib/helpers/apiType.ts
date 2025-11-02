//getArticlesListByCategory ===================
export interface CategoryNode {
  name: string;
  uri: string;
  slug: string;
}

export interface FeaturedImageNode {
  sourceUrl: string;
}

export interface PostNode {
  id: string;
  title: string;
  date: string;
  content: string;
  slug: string;
  categories: {
    nodes: CategoryNode[];
  };
  featuredImage: {
    node: FeaturedImageNode;
  };
  postId: string;
}

export interface PostEdge {
  node: PostNode;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}


export interface GetPostsEdgesResult {
  posts: {
    edges: PostEdge[];
    pageInfo: PageInfo;
  };
}
//===========getArticlesListByCategory


// スラッグからカテゴリーIDを取得
export interface SlugResult {
  posts: {
    edges: {
      node: {
        slug: string;
      };
    }[];
  };
};

// カテゴリー情報の型定義
export interface CategoryBySlugResult {
  category: {
    categoryId: number;
    name: string;
    slug: string;
    
  };
}

// カテゴリーIDから記事一覧を取得する際の戻り値の型
export interface GetPostsByCategoryResult {
  posts: {
    edges: {
      node: {
        id: string;
        title: string;
        date: string;
        content: string;
        slug: string;
        categories: {
          nodes: {
            name: string;
          }[];
        };
        featuredImage: {
          node: {
            sourceUrl: string;
          };
        };
      };
    }[];
  };
}

// getArticleBySlugの戻り値の型定義
export interface GetArticleBySlugResult {
  data: {
    postBy: {
      title: string;
      content: string;
      date: string;
      excerpt: string;
      featuredImage: {
    node: {
      sourceUrl: string;
    };
  };
  terms: {
    nodes: {
          id: string;
          name: string;
          slug: string;
          categoryId: number;
        }[];
      };
    };
  };
}

// GetChildCategoriesBySlug ===================
// 子カテゴリのノード情報
export interface ChildCategoryNode {
  name: string;
  slug: string;
}

// 親カテゴリに含まれる子カテゴリのリスト
export interface CategoryChildren {
  nodes: ChildCategoryNode[];
}

// GetChildCategoriesBySlug クエリの category フィールドの型 (関数が返す部分)
export interface GetChildCategoriesBySlugResultData {
  children: CategoryChildren;
}
//===========GetChildCategoriesBySlug
