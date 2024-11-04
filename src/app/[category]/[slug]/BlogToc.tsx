"use client";
import { useEffect, useState } from "react";
import styles from "./blog.module.css";

// 各TOCエントリの型を定義
interface TocEntry {
  text: string;
  id: string;
}

// BlogTocコンポーネントのプロパティの型を定義
interface BlogTocProps {
  toc: TocEntry[];
}
const BlogToc = ({toc}:BlogTocProps) => {
  const [activeSection, setActiveSection] = useState('toc0');
  useEffect(() => {
    const handleScroll = () => {
      let currentSection = activeSection;
      toc.forEach((section: { id: string; }) => {
        const element = document.getElementById(section.id);
        if (element && window.scrollY >= element.offsetTop - 10) {
          currentSection = section.id;
        }
      });
      setActiveSection(currentSection);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      // クリーンアップ関数：
      // スクロールイベントリスナーを削除するために使われます。
      window.removeEventListener('scroll', handleScroll);
    };
  }, [toc, activeSection]);

  return (
    <div className={`${styles.sideContentWrap}`}>
      <div className={styles.sideToc}>
        {/* <p className={styles.tocTitle}>記事の内容</p> */}
        <ul>
          <li className={activeSection === `toc0` ? `${styles.tocActive}` : ''}>
            <a href="#">TOP</a>
          </li>
          {
            toc.map((item,key)=>(
              <li key={key} className={activeSection === `toc${key+1}` ? `${styles.tocActive}` : ''}>
              <a href={`#toc${key + 1}`}>{item.text}</a>
            </li>

            ))
          }
        </ul>
      </div>
    </div>
  )
}
export default BlogToc