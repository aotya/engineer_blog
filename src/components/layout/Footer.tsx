import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./Footer.module.scss"; //
import { GetChildCategoriesBySlug } from "../../../lib/helpers/wpApiList";

type CategoryChildren = {
  nodes: {
    slug: string;
    name: string;
  }[];
};
export const Footer = async () => {
  

  const data: CategoryChildren | undefined = await GetChildCategoriesBySlug("coding");
  const list = data?.nodes;
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <Link className={styles.footerLogo} href="/">
            <Image src="/footerLogo.svg" alt="logo" width={100} height={90} />
          </Link>
          <div className={styles.footerContent}>
            <p className={styles.footerPrograming}>Programing</p>
            <div className={styles.footerProgramingList}>
              {list && list.map((item) => (
                <Link key={item.slug} className={styles.footerProgramingItem} href={`/${item.slug}/`}>
                  <p>{item.name}</p>
              </Link>
              ))}
            </div>
          </div>
          <div className={styles.footerContent}>
            <p className={styles.footerContentTitle}>コンテンツ</p>
            <div className={styles.footerContentList}>
              <Link className={styles.footerContentItem} href="/magazine">
                  <p>Magazine</p>
              </Link>
            </div>
          </div>
        </div>
        <p className={styles.footerCopyright}>© 2025 Lv1 Start ! Front End Engineer Blog</p>
      </div>
    </footer>
  );
};
