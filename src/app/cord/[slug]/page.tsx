// "use client"//TODO:テスト用　削除忘れない
import { title } from "process";
import {getArticleBySlug,getArticlesList} from "../../../lib/helpers/WpApiList";
import styles from "./blog.module.css";


const BlogArticlePage = async ({ params }: { params: { slug: string } }) => {
  const data = await getArticleBySlug(params.slug);
  // console.log("data")
  // console.log(data.content)
  return (
    <main className={styles.mainBlogWrap}>
      <ul className={styles.breadcrumb}><li>ホーム ></li><li>コーディング</li></ul>
      <p className="">{data.title}</p>
      <div dangerouslySetInnerHTML={{ __html: data.content}} />
    </main>
  )
}

export default BlogArticlePage