import React from 'react';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticlesListByCategory } from '../../../../lib/helpers/wpApiList';
import { Metadata } from 'next';
import { HighlightAutoCord, renderToc } from '../../../../lib/helpers/pullOutTags';
import 'highlight.js/styles/hybrid.css';
import BlogToc from './BlogToc';
import styles from './blog.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { categoriesIdList } from '../../../../categoriesIdList';
import Card from '@/components/elements/relatedCard';
type Props = {
  params: {
    category: string;
    slug: string;
  };
};

// 動的なメタデータを生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const data = await getArticleBySlug(resolvedParams.slug);
  
  if (!data) {
    return {
      title: '記事が見つかりません',
      description: 'お探しの記事は見つかりませんでした。',
    };
  }



  // HTMLタグを除去してプレーンテキストを取得
  const description = data.data.postBy.content
    .replace(/<[^>]*>/g, '') // HTMLタグを削除
    .substring(0, 160); // 最初の160文字を取得
  
  return {
    title: data.data.postBy.title,
    description: description,
    openGraph: {
      title: data.data.postBy.title,
      description: description,
      images: data.data.postBy.featuredImage?.node?.sourceUrl ? [data.data.postBy.featuredImage.node.sourceUrl] : [],
    },
  };
}

const BlogArticlePage = async ({ params }: Props) => {
  const resolvedParams = await Promise.resolve(params);
  const data = await getArticleBySlug(resolvedParams.slug);
  if (!data) {
    notFound(); // データが見つからない場合に404ページを表示
  }

  // コンテンツのハイライトと目次の生成
  const body = HighlightAutoCord(data.data.postBy.content);
  const toc = renderToc(data.data.postBy.content);

  const pankuzu = () => {
    if (data.data.postBy.terms?.nodes?.length > 0) {
      if (data.data.postBy.terms.nodes[0].categoryId === categoriesIdList.CODING || data.data.postBy.terms.nodes[0].categoryId === categoriesIdList.MAGAZINE) {
        return (
          <div className={styles.articleTerms}>
            {data.data.postBy.terms.nodes.slice().map((term, index) => (
              <Link  key={term.id} href={`/${term.slug}`} className="">
                {term.name}{index === 0 && ' >'}
              </Link>
            ))}
          </div>
      )} else {
        return (
          <div className={styles.articleTerms}>
            {data.data.postBy.terms.nodes.slice().reverse().map((term, index) => (
              <Link  key={term.id} href={`/${term.slug}`} className="">
                {term.name}{index === 0 && ' >'}
              </Link>
            ))}
          </div>
        )
      }
    }
  }

  const DataByCategory = async (num: number, word: string) => {
    const data = await getArticlesListByCategory({ first: num, category: word });
    const dataByCategoryList = data?.posts.edges;
    return dataByCategoryList
  };

  const renderRelatedArticles = async () => {
    try {
      const relatedArticles = await DataByCategory(3, data.data.postBy.terms.nodes[0].slug);
      return (
        <ul className={styles.articleListContainer}>
          {relatedArticles?.map((article) => (
            <Card key={article.node.id} item={article} categorySlug={data.data.postBy.terms.nodes[0].slug} />
          ))}
        </ul>
      );
    } catch {
      return <p>エラーが発生しました</p>
    }
  }
  

  return (
    <main className={styles.blogArticlePage + " globalMainBlog"}>
      <article className={styles.article}>
        <div className={styles.articleHeader}>
          <div className={styles.eyecatchBlurContainer}>
            <Image 
              src={data.data.postBy.featuredImage.node.sourceUrl} 
              alt={data.data.postBy.title}
              className="" 
              width={1000}
              height={400}
            />
          </div>
          {data.data.postBy.featuredImage?.node?.sourceUrl && (
            <div className={styles.articleMainImageContainer}>
            <Image 
            src={data.data.postBy.featuredImage.node.sourceUrl} 
            alt={data.data.postBy.title}
            className="" 
            width={1000}
            height={400}
          />
          </div>
          )}
        </div>
        {pankuzu()}
        <h1 className={styles.articleTitle}>{data.data.postBy.title}</h1>
        <div className={styles.articleDateContainer}>

          <Image className={styles.articleDateIcon} src="/clock.svg" alt="時計" width={20} height={20} />
          <div className={styles.articleDate}>
            {new Date(data.data.postBy.date).toLocaleDateString('ja-JP')}
          </div>
        </div>

        {/* 整形済みのHTMLを表示 */}
        <div className={styles.articleContent}>
          <div 
            className={styles.articleContentBody}
            dangerouslySetInnerHTML={{ __html: body }}
          >
          </div>
          <BlogToc toc={toc} />
        </div>
      </article>

      <div className={styles.articleRelatedContainer}>
        <h2 className={styles.articleRelatedTitle}>関連記事</h2>
        <div className={styles.cardList}>
          {renderRelatedArticles()}
        </div>
      </div>
    </main>
  );
};

export default BlogArticlePage;