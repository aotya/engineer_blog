import React from 'react';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticlesListByCategory, getAllPostSlugs } from '../../../../lib/helpers/wpApiList';
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
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts;
}

// 動的なメタデータを生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, category } = await params;
  const data = await getArticleBySlug(slug);
  
  if (!data) {
    return {
      title: '記事が見つかりません',
      description: 'お探しの記事は見つかりませんでした。',
    };
  }

  const description = data.excerpt
    ? data.excerpt.replace(/<[^>]*>/g, '')
    : '';
  
  return {
    title: data.title,
    description: description,
    openGraph: {
      title: data.title,
      description: description,
      url: `/${category}/${slug}`,
      siteName: 'Lv1 Up! Front End Engineer Blog',
      type: 'article',
      images: data.featuredImage?.node?.sourceUrl ? [data.featuredImage.node.sourceUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: description,
      images: data.featuredImage?.node?.sourceUrl ? [data.featuredImage.node.sourceUrl] : [],
    },
    alternates: {
      canonical: `/${category}/${slug}`,
    },
  };
}

const BlogArticlePage = async ({ params }: Props) => {
  const { slug, category } = await params;

  // 記事データと関連記事を並列で取得
  const [data, relatedData] = await Promise.all([
    getArticleBySlug(slug),
    getArticlesListByCategory({ first: 3, category }),
  ]);
  
  if (!data) {
    notFound();
  }

  const body = HighlightAutoCord(data.content);
  const toc = renderToc(data.content);
  const relatedArticles = relatedData?.posts.edges ?? [];
  const categorySlug = data.terms?.nodes?.[0]?.slug ?? category;

  const pankuzu = () => {
    if (data.terms?.nodes?.length > 0) {
      if (data.terms.nodes[0].categoryId === categoriesIdList.CODING || data.terms.nodes[0].categoryId === categoriesIdList.MAGAZINE) {
        return (
          <div className={styles.articleTerms}>
            {data.terms.nodes.slice().map((term, index) => (
              <Link key={term.id} href={`/${term.slug}`} className="">
                {term.name}{index === 0 && ' >'}
              </Link>
            ))}
          </div>
        );
      } else {
        return (
          <div className={styles.articleTerms}>
            {data.terms.nodes.slice().reverse().map((term, index) => (
              <Link key={term.id} href={`/${term.slug}`} className="">
                {term.name}{index === 0 && ' >'}
              </Link>
            ))}
          </div>
        );
      }
    }
  };

  return (
    <main className={styles.blogArticlePage + " globalMainBlog"}>
      <article className={styles.article}>
        <div className={styles.articleHeader}>
          <div className={styles.eyecatchBlurContainer}>
            <Image 
              src={data.featuredImage.node.sourceUrl} 
              alt={data.title}
              className="" 
              width={1000}
              height={400}
            />
          </div>
          {data.featuredImage?.node?.sourceUrl && (
            <div className={styles.articleMainImageContainer}>
              <Image 
                src={data.featuredImage.node.sourceUrl} 
                alt={data.title}
                className="" 
                width={1000}
                height={400}
              />
            </div>
          )}
        </div>
        {pankuzu()}
        <h1 className={styles.articleTitle}>{data.title}</h1>
        <div className={styles.articleDateContainer}>
          <Image className={styles.articleDateIcon} src="/clock.svg" alt="時計" width={20} height={20} />
          <div className={styles.articleDate}>
            {new Date(data.date).toLocaleDateString('ja-JP')}
          </div>
        </div>

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
          <ul className={styles.articleListContainer}>
            {relatedArticles.map((article) => (
              <Card key={article.node.id} item={article} categorySlug={categorySlug} />
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default BlogArticlePage;