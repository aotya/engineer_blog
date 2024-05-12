import Image from "next/image";
import React from "react";
import Link from "next/link";
import styles from "./common.module.css";

// Props の型定義
type LinkCardProps = {
  url: String;
}

export default function LinkCard({url}:LinkCardProps) {
  return (
  <Link href={`${url}`} className={styles.linkCardContainer}>
    <div className={styles.linkCardColum}>
      <div>
        <Image 
          src="/icon_study.svg"
          alt="profile_icon"
          width={31}
          height={23}
        />
      </div>
      <p className={styles.linkCardTitle}>勉強方法</p>
    </div>
    <p className={styles.linkCardSub}>Lv1から技術の<br/>学び方</p>
  </Link>
  )  
}