import { HighlightAutoCord, renderToc } from '../../../lib/helpers/pullOutTags';
import styles from './blog.module.css';
import dayjs from 'dayjs';
import Image from 'next/image';
import 'highlight.js/styles/hybrid.css';
import BlogToc from './BlogToc';
import Profile from '../../../components/elements/Profile';
import { getArticleBySlug, getAllSlugs } from '../../../lib/helpers/WpApiList';

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
    slug: string;
  };
};

// スラッグを取得するための型定義
type SlugNode = {
  node: {
    slug: string;
  };
};

// 記事ページコンポーネント
const BlogArticlePage = async ({ params }: Props) => {
  const data: ArticleData = await getArticleBySlug(params.slug);

  // コンテンツのハイライトと目次の生成
  const body = HighlightAutoCord(data.content);
  const toc = renderToc(data.content);

  // 日付フォーマットの変更
  const changeDateFormat = (date: string) => {
    return dayjs(date).format('YYYY年MM月DD日');
  };

  return (
    <main className="globalMainBlogWrap">
      <div className={styles.mainBlogWrap}>
        <div className={styles.blogArticleContainer}>
          <ul className={styles.breadcrumb}>
            <li>ホーム ＞</li>
            <li>HTML</li>
          </ul>
          <p className={styles.categoryBlock}>HTML</p>
          <p className={styles.blogTitle}>{data.title}</p>
          <p className={styles.blogDate}>{changeDateFormat(data.date)}</p>
          <div>
            <Image
              src={data.featuredImage.node.link}
              width={720}
              height={400}
              alt="profile_icon"
              className={styles.thumbnail}
            />
          </div>
          <div dangerouslySetInnerHTML={{ __html: body.html() }} />
          <Profile />
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