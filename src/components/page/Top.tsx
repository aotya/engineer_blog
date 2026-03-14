import Image from "next/image";
import styles from "./Top.module.scss"; 
import Link from "next/link";
import { getArticlesListByCategory, GetChildCategoriesBySlug } from "../../../lib/helpers/wpApiList";
import Card from "../elements/topCard";
import { TOP_CODING_ITEMS_PER_PAGE, TOP_MAGAZINE_ITEMS_PER_PAGE } from "../../../lib/constants";

export default async function Top() {
  // データを並列で取得（SSG時にビルド時に実行される）
  const [codingData, magazineData, cordData] = await Promise.all([
    getArticlesListByCategory({ first: TOP_CODING_ITEMS_PER_PAGE, category: "coding" }),
    getArticlesListByCategory({ first: TOP_MAGAZINE_ITEMS_PER_PAGE, category: "magazine" }),
    GetChildCategoriesBySlug("coding"),
  ]);

  const codingList = codingData?.posts.edges;
  const magazineList = magazineData?.posts.edges;

  return (
    <>
    <section className={styles.fvContainer}>
      <h1>
        <div className={`${styles.fvTitle}`}>
          <Image src="/fvLogo.svg" alt="Lv1 Up" width={260} height={100} />
          <p>Front End Engineer Blog</p>
        </div>
      </h1>
      <p className={styles.fvSubTitle}>
        コーダー・フロントエンドのLVを１UPさせる情報を発信していきます
      </p>
    </section>
    <section className={styles.ProgrammingContainer}>
      <div className={styles.ProgrammingContainerInner}>
        <div className={styles.midashiLogo}>
          <Image src="/cord.svg" alt="cord" width={50} height={50} />
        </div>
        <h2 className={styles.h2}>Programming</h2>
        <div className={styles.ProgrammingContainerInnerText}>
          <p>プログラミング/マークアップ言語</p>
        </div>
        <div className={styles.ProgrammingListContainer}>
          <ul className={styles.ProgrammingListContainerInner}>
            {cordData?.nodes.map((item) => (
              <li key={item.slug}>
                <Link href={`/${item.slug}`}>
                  <div className={styles.ProgrammingListItem}>
                    <p>{item.name}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <h3 className={styles.latestArticleTitle}>最新の記事</h3>
        <ul className={styles.articleListContainer}>
          {codingList?.map((item) => (
            <Card key={item.node.id} item={item} />
          ))}
        </ul>
      </div>
      <Link className={styles.moreLink} href="/coding/">
        <p>もっと見る</p>
      </Link>
    </section>
    <section className={styles.magazineContainer}>
      <div className={styles.magazineContainerInner}>
      <div className={styles.midashiLogo}>
          <Image src="/info.svg" alt="cord" width={50} height={50} />
        </div>
        <h2 className={styles.h2}>Magazine</h2>
        <div className={styles.magazineContainerInnerText}>
          <p>最近のフロントエンドの動向、コーティングの役に立つツールなどの紹介</p>
        </div>
        <ul className={styles.articleListContainer}>
          {magazineList?.map((item) => (
            <Card key={item.node.id} item={item} />
          ))}
        </ul>
      </div>
      <Link className={styles.moreLink} href="/magazine/">
        <p>もっと見る</p>
      </Link>
    </section>
    </>
  );
}