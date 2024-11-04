import Image from "next/image";
import React from "react";
import styles from "./header.module.css";
import HamburgerMenu from "../elements/HamburerMenu";


export default function Header() {

  return (
    <nav className="bgColor">
      <div className={`${styles.headerContainer} pcWidth`}>
        <a href="/">
          <div className={styles.headerLogoContainer}>
            <Image
              width={67}
              height={67}
              alt="profile_icon"
              src={"/logo.png"}
            />
            <p>Lv1 Start ! Front End Engineer Blog</p>
          </div>
        </a>
        {/* TODO:コンテンツが増えたら */}
        {/* <div className={styles.headerMenu}>
          <p>勉強方法</p>
          <p>転職</p>
          <p>技術の備忘録</p>
          <p>雑記</p>
        </div> */}
        {/* <div className={styles.openbtn5}><span></span><span>Menu</span><span></span></div> */}
        {/* TODO:コンテンツが増えたら */}
        {/* <HamburgerMenu /> */}
      </div>
    </nav>
  )  
}