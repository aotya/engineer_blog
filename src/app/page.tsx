// PostServiceをインポート
import styles from "./page.module.css";
import Top from "../components/page/Top"


export default async function Home() {


  return (
    <main className={styles.main}>
      <Top/>
      {/* <h1 className="text-3xl font-bold underline">Hello world!</h1>
      {data.data.posts.edges.map((item:any) => (
        <p>{item.node.title}</p>
      ))} */}
    </main>
  );
}
