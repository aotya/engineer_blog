import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./Footer.module.scss"; //

export const Footer = () => {
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
              <Link className={styles.footerProgramingItem} href="/html">
                  <p>HTML</p>
              </Link>
            </div>
          </div>
          <div className={styles.footerContent}>
            <p className={styles.footerContentTitle}>コンテンツ</p>
            <div className={styles.footerContentList}>
              <Link className={styles.footerContentItem} href="/html">
                  <p>HTML</p>
              </Link>
            </div>
          </div>
        </div>
        <p className={styles.footerCopyright}>© 2025 Lv1 Start ! Front End Engineer Blog</p>
      </div>
    </footer>
  );
};
