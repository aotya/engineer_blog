import Image from "next/image";
import React from "react";
import styles from "./footer.module.css";


export default function Footer() {

  return (
    <footer className="bgColor">
      <div className="pcWidth">
        <div className={styles.footerContainer}>
        <a className={styles.linkText} href="/">TOP</a>
          <p className={styles.copyText}>© 2024 Lv1 Start ! Engineer Blog</p>
        </div>
      </div>
    </footer>
  )  
}