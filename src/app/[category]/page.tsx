import styles from "./category.module.scss";
import React from 'react';
import { notFound } from 'next/navigation';
import { GetCategoryBySlug, GetPostsByCategory, getAllCategories } from "../../../lib/helpers/wpApiList";
import { PostEdge } from "../../../lib/helpers/apiType";
import CategoryClientList from "../../components/elements/CategoryClientList";
import { Metadata } from "next";
import { CATEGORY_ITEMS_PER_PAGE } from "../../../lib/constants";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}): Promise<Metadata> {
  const { category } = await params;
  const data = await GetCategoryBySlug(category);
  
  if (!data) {
    return {
      title: 'カテゴリーが見つかりません',
    };
  }

  return {
    title: `${data.name}の記事一覧`,
    description: `${data.name}に関する記事一覧ページです。`,
    openGraph: {
      title: `${data.name}の記事一覧`,
      description: `${data.name}に関する記事一覧ページです。`,
      url: `/${data.slug}`,
    },
    alternates: {
      canonical: `/${data.slug}`,
    },
  };
}

export default async function CategoryArticleList({ 
  params,
}: { 
  params: Promise<{ category: string }>
}) {
  const itemsPerPage = CATEGORY_ITEMS_PER_PAGE; // 1ページあたりの表示件数
  const { category } = await params;
  
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

    // 1ページ目に表示する記事のみを抽出
    const displayPosts = formattedPosts.slice(0, itemsPerPage);

    return (
      <>
      <section className={styles.categoryList}>
        <div className={styles.categoryListTitleWrapper}>
          <h1>{data?.name || "不明なカテゴリー"}<br/><span>記事一覧</span></h1>
        </div>
      </section>
      
      {/* ページネーション対応コンポーネント */}
      {/* 1ページ目なので currentPage={1} を指定 */}
      <CategoryClientList 
        posts={displayPosts} 
        totalPosts={formattedPosts.length}
        currentPage={1}
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
