"use client";
import React, { useState, useEffect } from "react";
import styles from "../layout/Header.module.scss";
import Link from "next/link";
import Image from "next/image";
type CategoryNode = {
  slug: string;
  name: string;
};

// Propsの型を定義
type HamburgerButtonProps = {
  data?: CategoryNode[]; // dataはオプショナルにするか、Header側でundefinedチェックを確実に行う
};

const HamburgerButton = ({ data }: HamburgerButtonProps) => { // propsオブジェクトを受け取るように変更

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleMenu = ( flag: boolean ) => {
    setIsOpen(flag);
  };
  if (!data || data.length === 0) {
  }
  
  return (
    <>
    <Link href="/" onClick={() => toggleMenu(false)}>
      <div className={styles.logoContainer}>
        <Image
          width={67}
          height={67}
          alt="profile_icon"
          src={"/logo.svg"}
        />
      </div>
    </Link>
    <button 
    className={`${styles.hamburgerButton} ${isOpen ? styles.open : ''}`}
    onClick={() => toggleMenu(!isOpen)}
    >
    <div className={styles.iconWrapper}>
      <span />
      <span />
      <span />
    </div>
    <span className={styles.menuText}>Menu</span>
    </button>
    <div className={`${styles.spMenuContainer} ${isOpen ? styles.open : ''}`}>
      <div className={styles.codingIcon}>
        <Image src="/cordWhite.svg" alt="cord" width={50} height={50} />
      </div>
      <Link href="/coding/" className={styles.spCodingLink} onClick={() => toggleMenu(false)}>
        <p>Programming</p>
      </Link>
      <ul className={styles.spMenuList}>
        {/* data を使用してリスト項目をレンダリング */}
        {data && data.map(item => (
          <li key={item.slug} >
            <div className={styles.spMenuCordLinkWrapper}>
              <Link href={`/${item.slug}/`} className={styles.spMenuCordLink} onClick={() => toggleMenu(!isOpen)}>
                <div className={styles.ProgrammingListItem}>
                  <p>{item.name}</p>
              </div>
            </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.codingIcon}>
        <Image src="/infoWhite.svg" alt="cord" width={50} height={50} />
      </div>
      <Link href="/magazine/" className={styles.spCodingLink} onClick={() => toggleMenu(false)}>
        <p>Magazine</p>
      </Link>
      <ul className={styles.spMenuList}>
        {/* data を使用してリスト項目をレンダリング */}
          <li >
            <div className={styles.spMenuCordLinkWrapper}>
              <Link href="/seo/" className={styles.spMenuCordLink}  onClick={() => toggleMenu(!isOpen)}>
                <div className={styles.ProgrammingListItem}>
                  <p>SEO</p>
              </div>
            </Link>
            </div>
          </li>
      </ul>
    </div>
  </>
  );
};

export default HamburgerButton;