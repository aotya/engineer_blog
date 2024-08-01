// PostServiceをインポート
import styles from "./page.module.css";
import Top from "../components/page/Top";
import { getArticlesList } from "../../src/lib/helpers/WpApiList";
import { GetPostsEdgesResult } from '../../src/lib/helpers/apiType'; // 型定義ファイルのパスを指定してください


export default async function Home() {
  let data: GetPostsEdgesResult | undefined;


  try {
    data = await getArticlesList();
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    data = undefined;
  }

  return (
    <main className={styles.main}>
      <Top topData={data} />
    </main>
  );
}
