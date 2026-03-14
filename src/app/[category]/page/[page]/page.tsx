import styles from "../../category.module.scss";
import React from 'react';
import { notFound } from 'next/navigation';
import { GetCategoryBySlug, GetPostsByCategory, getAllCategories } from "../../../../../lib/helpers/wpApiList";
import { PostEdge } from "../../../../../lib/helpers/apiType";
import CategoryClientList from "../../../../components/elements/CategoryClientList";
import { Metadata } from "next";
import { CATEGORY_ITEMS_PER_PAGE } from "../../../../../lib/constants";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  const params: { category: string; page: string }[] = [];

  await Promise.all(
    categories.map(async (cat) => {
      const catData = await GetCategoryBySlug(cat.slug);
      if (!catData?.categoryId) return;
      const posts = await GetPostsByCategory(String(catData.categoryId));
      const total = posts?.posts.edges.length ?? 0;
      const totalPages = Math.ceil(total / CATEGORY_ITEMS_PER_PAGE);
      for (let p = 2; p <= totalPages; p++) {
        params.push({ category: cat.slug, page: String(p) });
      }
    })
  );

  return params;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string, page: string }> 
}): Promise<Metadata> {
  const { category, page: pageParam } = await params;
  const data = await GetCategoryBySlug(category);
  const page = Number(pageParam);
  
  if (!data) {
    return {
      title: 'カテゴリーが見つかりません',
    };
  }

  // ページ番号が不正な場合はデフォルトのタイトルを返す
  if (isNaN(page) || page < 1) {
    return {
      title: `${data.name}の記事一覧`,
      description: `${data.name}に関する記事一覧ページです。`,
    };
  }

  return {
    title: `${data.name}の記事一覧 (${page}ページ目)`,
    description: `${data.name}に関する記事一覧ページです。${page}ページ目。`,
    openGraph: {
      title: `${data.name}の記事一覧 (${page}ページ目)`,
      description: `${data.name}に関する記事一覧ページです。${page}ページ目。`,
      url: `/${data.slug}/page/${page}`,
    },
    alternates: {
      canonical: `/${data.slug}/page/${page}`,
    },
  };
}

export default async function CategoryArticleListPage({ 
  params,
}: { 
  params: Promise<{ category: string, page: string }>
}) {
  const itemsPerPage = CATEGORY_ITEMS_PER_PAGE;
  const { category, page: pageParam } = await params;
  const currentPage = Number(pageParam);

  // ページ番号が不正な場合は404
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }
  
  const data = await GetCategoryBySlug(category);
  if (!data) {
    notFound();
  }

  try {
    // 全記事を取得（SSG用に一度に全て取得）
    const posts = await GetPostsByCategory(
      data.categoryId ? String(data.categoryId) : ''
    );
    
    // 全記事データを整形
    const formattedPosts: PostEdge[] = posts?.posts.edges.map((post) => {
      const categoryNodes = post.node.categories.nodes.map(cat => ({
        name: cat.name,
        uri: `/categories/${cat.name.toLowerCase()}`,
        slug: data.slug
      }));
      
      return {
        node: {
          id: post.node.id,
          title: post.node.title,
          date: post.node.date,
          content: post.node.content,
          slug: post.node.slug,
          categories: {
            nodes: categoryNodes
          },
          featuredImage: post.node.featuredImage,
          postId: post.node.id
        },
        cursor: ''
      };
    }) || [];

    // 総ページ数を計算
    const totalPages = Math.ceil(formattedPosts.length / itemsPerPage);

    // ページ番号が範囲外の場合は404
    // ただし、記事が0件でページ番号が1の場合は表示を許可
    if (currentPage > totalPages && !(formattedPosts.length === 0 && currentPage === 1)) {
      notFound();
    }

    // 表示する記事を抽出
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayPosts = formattedPosts.slice(startIndex, endIndex);

    return (
      <>
      <section className={styles.categoryList}>
        <div className={styles.categoryListTitleWrapper}>
          <h1>{data?.name || "不明なカテゴリー"}<br/><span>記事一覧</span></h1>
        </div>
      </section>
      
      {/* ページネーション対応コンポーネント */}
      <CategoryClientList 
        posts={displayPosts} 
        totalPosts={formattedPosts.length}
        currentPage={currentPage}
        categorySlug={data.slug} 
        itemsPerPage={itemsPerPage}
      />
      </>
    );
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    return (
      <div>
        <h1>カテゴリーの取得に失敗しました</h1>
        <p>エラーが発生しました。詳細はコンソールを確認してください。</p>
      </div>
    );
  }
}
