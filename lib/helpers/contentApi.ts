// content/ 配下のMarkdown記事・カテゴリを読み込む
// 戻り値の形は、WordPress（WPGraphQL）時代の各関数と同じにしている
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { markdownToHtml } from './markdown';
import {
  CategoryBySlugResult,
  CategoryChildren,
  GetArticleBySlugResult,
  GetPostsByCategoryResult,
  GetPostsEdgesResult,
} from './apiType';
import { TOP_CODING_ITEMS_PER_PAGE } from '../constants';

const CONTENT_DIR = path.join(process.cwd(), 'content');

interface Category {
  id: number;
  slug: string;
  name: string;
  parent: string | null;
}

interface Post {
  slug: string;
  title: string;
  date: string;
  modified?: string;
  categories: string[];
  excerpt: string;
  eyecatch: string;
  content: string;
}

// 本番ビルド時のみキャッシュする（next dev では記事の編集をすぐ反映させるため毎回読み込む）
const USE_CACHE = process.env.NODE_ENV === 'production';
let categoriesCache: Category[] | undefined;
let postsCache: Post[] | undefined;

function loadCategories(): Category[] {
  if (USE_CACHE && categoriesCache) return categoriesCache;
  categoriesCache = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'categories.json'), 'utf8')) as Category[];
  return categoriesCache;
}

// 公開記事を新しい順で取得（frontmatterに draft: true がある記事は除外）
function loadPosts(): Post[] {
  if (USE_CACHE && postsCache) return postsCache;
  const dir = path.join(CONTENT_DIR, 'posts');
  postsCache = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      return { ...data, slug: file.replace(/\.md$/, ''), content: markdownToHtml(content) } as Post & { draft?: boolean };
    })
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return postsCache;
}

const findCategory = (slug: string) => loadCategories().find((c) => c.slug === slug);

// WordPressと同じ形式のURI（例: /category/coding/js/）。getChildCategoryで階層の深さ判定に使用
function categoryUri(slug: string): string {
  const chain: string[] = [];
  for (let c = findCategory(slug); c; c = c.parent ? findCategory(c.parent) : undefined) chain.unshift(c.slug);
  return `/category/${chain.join('/')}/`;
}

// 指定カテゴリと、その子孫カテゴリのslug一覧（WordPressのカテゴリ絞り込みと同様に子カテゴリの記事も含める）
function descendantSlugs(slug: string): Set<string> {
  // categories.json の並び順に依存しないよう、親から順に子をたどる
  const categories = loadCategories();
  const result = new Set<string>();
  const queue = [slug];
  for (let current = queue.shift(); current; current = queue.shift()) {
    result.add(current);
    queue.push(...categories.filter((c) => c.parent === current && !result.has(c.slug)).map((c) => c.slug));
  }
  return result;
}

function postsInCategory(slug: string): Post[] {
  const slugs = descendantSlugs(slug);
  return loadPosts().filter((post) => post.categories.some((c) => slugs.has(c)));
}

const postCategories = (post: Post) =>
  post.categories.map(findCategory).filter((c): c is Category => Boolean(c));

// TOPページで使用：カテゴリーごとの記事一覧取得
export async function getArticlesListByCategory({
  first = TOP_CODING_ITEMS_PER_PAGE,
  after = null,
  category = null,
}: { first?: number; after?: string | null; category?: string | null } = {}): Promise<GetPostsEdgesResult | undefined> {
  const posts = category ? postsInCategory(category) : loadPosts();
  // 存在しないカーソルが渡された場合は、先頭に戻さず空を返す
  const afterIndex = after ? posts.findIndex((p) => p.slug === after) : -1;
  const start = after ? (afterIndex === -1 ? posts.length : afterIndex + 1) : 0;
  const page = posts.slice(start, start + first);
  return {
    posts: {
      edges: page.map((post) => ({
        node: {
          id: post.slug,
          title: post.title,
          date: post.date,
          content: post.content,
          slug: post.slug,
          categories: {
            nodes: postCategories(post).map((c) => ({ name: c.name, uri: categoryUri(c.slug), slug: c.slug })),
          },
          featuredImage: { node: { sourceUrl: post.eyecatch } },
          postId: post.slug,
        },
        cursor: post.slug,
      })),
      pageInfo: {
        hasNextPage: start + first < posts.length,
        endCursor: page.at(-1)?.slug ?? null,
      },
    },
  };
}

// スラッグからカテゴリー情報を取得
export async function GetCategoryBySlug(slug: string): Promise<CategoryBySlugResult['category'] | undefined> {
  const category = findCategory(slug);
  if (!category) return undefined;
  return {
    categoryId: category.id,
    name: category.name,
    slug: category.slug,
    count: loadPosts().filter((p) => p.categories.includes(slug)).length,
  };
}

// カテゴリーIDから該当カテゴリ記事一覧取得（全件）
export async function GetPostsByCategory(categoryId: string): Promise<GetPostsByCategoryResult | undefined> {
  const category = loadCategories().find((c) => c.id === Number(categoryId));
  const posts = category ? postsInCategory(category.slug) : [];
  return {
    posts: {
      edges: posts.map((post) => ({
        node: {
          id: post.slug,
          title: post.title,
          date: post.date,
          content: post.content,
          slug: post.slug,
          categories: { nodes: postCategories(post).map((c) => ({ name: c.name })) },
          featuredImage: { node: { sourceUrl: post.eyecatch } },
        },
        cursor: post.slug,
      })),
      pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
    },
  };
}

// 記事をスラッグで取得
export async function getArticleBySlug(slug: string): Promise<GetArticleBySlugResult | undefined> {
  const post = loadPosts().find((p) => p.slug === slug);
  if (!post) return undefined;
  return {
    title: post.title,
    content: post.content,
    date: post.date,
    excerpt: post.excerpt,
    featuredImage: { node: { sourceUrl: post.eyecatch } },
    terms: {
      nodes: postCategories(post).map((c) => ({ id: c.slug, name: c.name, slug: c.slug, categoryId: c.id })),
    },
  };
}

// generateStaticParams 用：全カテゴリ一覧を取得
export async function getAllCategories(): Promise<{ slug: string }[]> {
  return loadCategories().map((c) => ({ slug: c.slug }));
}

// generateStaticParams 用：全記事のカテゴリスラッグとスラッグを取得
export async function getAllPostSlugs(): Promise<{ category: string; slug: string }[]> {
  return loadPosts().flatMap((post) => post.categories.map((category) => ({ category, slug: post.slug })));
}

// sitemap 用：全記事の先頭カテゴリ（canonical）と更新日時を取得
export async function getAllPostEntries(): Promise<{ slug: string; category: string; date: string; modified?: string }[]> {
  return loadPosts().map((post) => ({
    slug: post.slug,
    category: post.categories[0],
    date: post.date,
    modified: post.modified,
  }));
}

// スラッグから子カテゴリーを取得(TOPページで使用)
export async function GetChildCategoriesBySlug(parentSlug: string): Promise<CategoryChildren | undefined> {
  if (!findCategory(parentSlug)) return undefined;
  return {
    nodes: loadCategories()
      .filter((c) => c.parent === parentSlug)
      .map((c) => ({ name: c.name, slug: c.slug })),
  };
}
