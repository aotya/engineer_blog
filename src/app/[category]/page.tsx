import dayjs from 'dayjs';
import Link from "next/link";
import Image from 'next/image';
import Profile from '../../components/elements/Profile';
import styles from "./styles.module.css";
import { getArticleBySlug, getAllSlugs, GetCategoryBySlug, GetPostsByCategory, getAllCategories } from '../../lib/helpers/WpApiList';
import React from 'react';
import { Metadata } from 'next';
import { notFound } from '../../../node_modules/next/navigation';

// 記事データの型定義
type ArticleData = {
  title: string;
  content: string;
  date: string;
  featuredImage: {
    node: {
      link: string;
    };
  };
};

type Props = {
  params: {
    category: string;
  };
};

// スラッグを取得するための型定義
type SlugNode = {
  node: {
    slug: string;
  };
};


// 動的メタデータを生成する関数
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data: any = await GetCategoryBySlug(params.category); // APIからカテゴリデータを取得
  if (!data) {
    notFound(); // データが見つからない場合に404ページを表示
  }
    return {
      title: `${data.name} | Lv1 Start ! Front End Engineer Blog`,  // カテゴリ名をタイトルに反映
      description: `すべての${data.name}に関する記事を表示しています。`,
      alternates: {
        canonical: `https://www.front-end-engineer-blog.com/${params.category}`,
      },

    };
  }

// 記事ページコンポーネント
const BlogArticleList = async ({ params }: Props) => {
  const data: any = await GetCategoryBySlug(params.category);
  if (!data) {
    notFound(); // データが見つからない場合に404ページを表示
  }
  const listData: any = await GetPostsByCategory(data.categoryId);
  const title: string = data.name;
  const slug: string = data.slug;
  const list = listData.posts.edges;

  // 日付フォーマットの変更
  const changeDateFormat = (date: string) => {
    return dayjs(date).format('YYYY年MM月DD日');
  };

  return (

    <main>
      <section className={styles.articleTitle}>
        <div>
          <h1>{title}</h1>
          <p>記事一覧</p>
        </div>
      </section>
      <section className={styles.blogCardsListContainer}>
          <ul className={styles.blogCardsList}>
          {list.map((item:any, index:any) => (
            <li className={styles.blogCardContainer} key={item.node.id}>
              <Link href={`/${slug}/${item.node.slug}/`}>
                <div>
                  <Image 
                    src={item.node.featuredImage.node.sourceUrl}
                    width={500}
                    height={500}
                    alt="profile_icon"
                    className={styles.cardItemImage}
                  />
                </div>
                <div>
                  <div className={styles.tagContainer}>
                    <p className={styles.cardTag}><span className={styles.cardTagName}>{item.node.categories.nodes[0].name}</span></p>
                    <p className={styles.cardDate}>{changeDateFormat(item.node.date)}</p>
                  </div>
                  <p className={styles.cardTitle}>{item.node.title}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>


      </section>
    </main>
  );
};

export default BlogArticleList;

// 静的パスを生成する関数
export async function generateStaticParams() {
  // カテゴリースラッグを取得する関数（WPGraphQLのAPIを使ってカテゴリー情報を取得）
  const slugs = await getAllCategories(); // WPGraphQLのAPIからすべてのカテゴリーを取得

  // すべてのカテゴリーのスラッグを元に、パスを生成
  const paths = slugs?.categories?.edges.map((category: { node: { slug: string } }) => ({
    category: category.node.slug, // カテゴリーごとのパス
  })) || [];

  return paths; // 必ず配列を返す
}