import Image from "next/image";
import React from "react";
import styles from "./Top.module.scss"; 
import Link from "next/link";
import { getArticlesListByCategory, GetChildCategoriesBySlug } from "../../../lib/helpers/wpApiList";
import { PostEdge } from "../../../lib/helpers/apiType";
import Card from "../elements/topCard";

export default function Top() {

  const DataByCategory = async (num: number, word: string) => {
    const data = await getArticlesListByCategory({ first: num, category: word });
    const dataByCategoryList = data?.posts.edges;
    return dataByCategoryList
  };

  const renderProgrammingList = async () => {
    try {
      const dataByCoadingList = await DataByCategory(3, "coding");
      return (
        <ul className={styles.articleListContainer}>
          {dataByCoadingList?.map((item: PostEdge) => (
            <Card key={item.node.id} item={item} />
          ))}
        </ul>
      )
    } catch {
      return <p>エラーが発生しました</p>
    }
  }

  const renderMagazineList = async () => {
    try {
      const dataByMagazineList = await DataByCategory(3, "magazine");
      return (
      <ul className={styles.articleListContainer}>
        {dataByMagazineList?.map((item: PostEdge, index: number) => (
          <Card key={item.node.id} item={item} />
        ))}
      </ul>
      )
    } catch {
      return <p>エラーが発生しました</p>
    }
  }

  const renderCordList = async () => {
    const data = await GetChildCategoriesBySlug("coding");
    return (
      <ul className={styles.ProgrammingListContainerInner}>
        {data?.nodes.map((item) => (
          <li key={item.slug}>
            <Link href={`/${item.slug}`}>
              <div className={styles.ProgrammingListItem}>
              <p>{item.name}</p>
              </div>
            </Link>
          </li>
        ))}
    </ul>
    );
  }



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
          <p>デモが多いので、コードストックに最適です</p>
        </div>
        <div className={styles.ProgrammingListContainer}>
          {renderCordList()}
        </div>
        <h3 className={styles.latestArticleTitle}>最新の記事</h3>
        {renderProgrammingList()}
      </div>
      <a className={styles.moreLink} href="/coding/">
        <p>もっと見る</p>
      </a>
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
        {renderMagazineList()}
      </div>
      <a className={styles.moreLink} href="/magazine/">
        <p>もっと見る</p>
      </a>
    </section>
    </>
  );
}