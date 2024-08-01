// "use client"//TODO:テスト用　削除忘れない
import { title } from "process";
import {getArticleBySlug} from "../../../lib/helpers/WpApiList";
import {HighlightAutoCord, renderToc} from "../../../lib/helpers/pullOutTags";
import styles from "./blog.module.css";
import dayjs from 'dayjs';  // day.js をインポート
import Image from "next/image";
import cheerio from 'cheerio';
import hljs from 'highlight.js'
import 'highlight.js/styles/hybrid.css';
import BlogToc from  './BlogToc'
import Profile from '../../../components/elements/Profile'

const BlogArticlePage = async ({ params }: { params: { slug: string } }) => {
  const data = await getArticleBySlug(params.slug);
  console.log("=================TEST1==============")
  const body = HighlightAutoCord(data.content)
  console.log("=================TEST2==============")
  const toc = renderToc(data.content)
  const changeDateFormat = (date:string) => {
    const formattedDate = dayjs(date).format('YYYY年MM月DD日');  // YYYYMMDD 形式にフォーマット
    return formattedDate;
  }
  return (
    <main className={`globalMainBlogWrap`}>
      <div className={`${styles.mainBlogWrap}`}>
        <div>
          <ul className={styles.breadcrumb}><li>ホーム ＞</li><li>HTML</li></ul>
          <p className={styles.categoryBlock}>HTML</p>
          <p className={styles.blogTitle}>{data.title}</p>
          <p className={styles.blogDate}>{changeDateFormat(data.date)}</p>
          <div>
            <Image 
              src={data.featuredImage.node.link}
              width={600}
              height={600}
              alt="profile_icon"
              className={styles.thumbnail}
            />
          </div>
          <div dangerouslySetInnerHTML={{ __html: body.html()}} />
          <Profile />
        </div>
        <BlogToc toc={toc}/>
      </div>
    </main>
  )
}

export default BlogArticlePage