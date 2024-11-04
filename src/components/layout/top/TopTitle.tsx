import Image from "next/image";
import React from "react";
import styles from "./top.module.css";


export default function TopTitle() {

  return (
    <section className={styles.topTitleBg}>
      <div className={styles.topTitleLogo}>
        <Image 
        src={"/topLogo.png"}
        width={114}
        height={114}
        alt="profile_icon"
        className={styles.topLogo}
        />
      </div>
      <h1 className={styles.topTitle}><span>Lv1</span> Start <span>!</span> Front <span>E</span>nd Engineer <span>B</span>log</h1>
      {/* <p className={styles.topLeadText}>〜30代で未経験からフロントエンドエンジニアになった男の足跡〜</p> */}
      <p className={styles.topLeadText}>コーダ・フロントエンドエンジニア向けの情報発信</p>

    </section>

  )  
}