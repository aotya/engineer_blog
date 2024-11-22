import { HighlightAutoCord, renderToc } from '../../../lib/helpers/pullOutTags';
import styles from './blog.module.css';
import dayjs from 'dayjs';
import Image from 'next/image';
import 'highlight.js/styles/hybrid.css';
import BlogToc from './BlogToc';
import Profile from '../../../components/elements/Profile';
import { getArticleBySlug, getAllSlugs } from '../../../lib/helpers/WpApiList';
import Link from "next/link";
import { Metadata } from 'next';

// 記事データの型定義
type ArticleData = {
  title: string;
  content: string;
  date: string;
  featuredImage: {
    node: {
      sourceUrl: string;
    };
  };
  terms: {
    nodes: category[];
  };
};

type category = {
  id: string;
  name: string;
  slug: string;
}

type Props = {
  params: {
    slug: string;
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
  const data: ArticleData = await getArticleBySlug(params.slug); // APIからカテゴリデータを取得
  return {
    title: `${data.title} | Lv1 Start ! Front End Engineer Blog`,  // カテゴリ名をタイトルに反映
    description: `${data.title}に関する説明をしている記事になります`,
    alternates: {
      canonical: `https://www.front-end-engineer-blog.com/${params.category}/${params.slug}`,
    },
  };
}

// 記事ページコンポーネント
const BlogArticlePage = async ({ params }: Props) => {
  const data: ArticleData = await getArticleBySlug(params.slug);

  const renderPankuzu = () => {
    const list =  data.terms.nodes.reverse();
    return(
      <>
        {list.map((item)=>(
            <li key={item.id}><Link href={`/${item.slug}/`}>{item.name}</Link></li>
          
        ))}
      </>
    )
  }

  // コンテンツのハイライトと目次の生成
  const body = HighlightAutoCord(data.content);
  const toc = renderToc(data.content);

  // 日付フォーマットの変更
  const changeDateFormat = (date: string) => {
    return dayjs(date).format('YYYY年MM月DD日');
  };

  return (
    <main className="globalMainBlogWrap">
      <div className={`${styles.mainBlogWrap}`}>
        <div className={`${styles.blogArticleContainer} blogMainArticle`}>
          <ul className={styles.breadcrumb}>
            <li><a href="/">ホーム</a></li>
            {renderPankuzu()}
            <li>{data.title}</li>
          </ul>
          <Link className={styles.tagLink} href={`/${data.terms.nodes[1].slug}/`}><p className={styles.categoryBlock}><span className={styles.categoryName}>{data.terms.nodes[1].name}</span></p></Link>
          <h1 id="toc0" className={styles.blogTitle}>{data.title}</h1>
          <div className={styles.timeContainer}>
            <Image
                src="/clock.webp"
                width={30}
                height={30}
                alt="投稿日アイコン"
              />
            <time dateTime={data.date} className={styles.blogDate}>{changeDateFormat(data.date)}</time>
          </div>
          <div className={styles.articleMainImageContainer}>
            <Image
              src={data.featuredImage.node.sourceUrl}
              width={720}
              height={400}
              alt={data.title}
              className={styles.thumbnail}
            />
          </div>
          <div dangerouslySetInnerHTML={{ __html: body }} />
          <div className={styles.ProfileContainer}>
            <Profile />
          </div>
        </div>
        <BlogToc toc={toc} />
      </div>
    </main>
  );
};

export default BlogArticlePage;

// 静的パスを生成する関数
export async function generateStaticParams() {
  const slugs = await getAllSlugs();

  // すべてのスラッグを取得し、存在しない場合は空の配列を返す
  const paths = slugs?.posts?.edges.map((edge:SlugNode) => ({
    slug: edge.node.slug,
  })) || [];
  return paths; // 必ず配列を返す
}