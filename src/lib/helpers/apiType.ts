// カテゴリのノード型
interface CategoryNode {
  name: string;
  uri: string;
  slug: string;
}

// カテゴリの型
interface Categories {
  nodes: CategoryNode[];
}

// 画像のノード型
interface FeaturedImageNode {
  sourceUrl: string;
}

// 画像の型
interface FeaturedImage {
  node: FeaturedImageNode;
}

// ポストのノード型
interface PostNode {
  id: string;
  title: string;
  date: string;
  content: string;
  slug: string;
  categories: Categories;
  featuredImage: FeaturedImage;
  postId: number;
}

// エッジ型
interface PostEdge {
  node: PostNode;
}

// ポストの型
interface Edges {
  edges: PostEdge[];
}

// クエリ結果の型
export interface GetPostsEdgesResult {
  posts: Edges;
}



export interface SlugResult {
  posts: {
    edges: {
      node: {
        slug: string;
      };
    }[];
  };
};

export interface categoryAllSlugResult {
  categories: {
    edges: {
      node: {
        slug: string;
      };
    }[];
  };
};