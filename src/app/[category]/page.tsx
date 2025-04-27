import styles from "./category.module.scss";
import React from 'react';
import { notFound } from '../../../node_modules/next/navigation';
import { GetCategoryBySlug, GetPostsByCategory } from "../../../lib/helpers/wpApiList";
import Card from "../../components/elements/categoryCard";
import { PostEdge } from "../../../lib/helpers/apiType";

export default async function CategoryArticleList({ 
  params 
}: { 
  params: { category: string } 
}) {
  
  try {
    const data = await GetCategoryBySlug(params.category);
    // stringに変換して渡す
    const posts = await GetPostsByCategory(data?.categoryId ? String(data.categoryId) : '');
    
    if (!data) {
      notFound(); // データが見つからない場合に404ページを表示
    }
    
    return (
      <>
      <section className={styles.categoryList}>
        <div className={styles.categoryListTitleWrapper}>
          <h1>{data?.name || "不明なカテゴリー"}<br/><span>記事一覧</span></h1>
        </div>
      </section>
      <section className={styles.cardList}>
        <ul className={styles.articleListContainer}>
          {posts?.posts.edges.map((post) => {
            // 必要なカテゴリー情報を準備
            const categoryNodes = post.node.categories.nodes.map(cat => ({
              name: cat.name,
              uri: `/categories/${cat.name.toLowerCase()}`, // 仮のURI
              slug: data.slug // カテゴリースラッグを使用
            }));
            
            const postEdge: PostEdge = {
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
            
            return (
              <Card 
                categorySlug={data.slug}
                key={post.node.id} 
                item={postEdge} 
              />
            );
          })}
        </ul>
      </section>
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

