// PostServiceをインポート
import styles from "./page.module.css";
import Top from "../components/page/Top"


export default async function Home() {


  return (
    <main className={styles.main}>
      <Top/>
    </main>
  );
}
