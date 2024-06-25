"use client"
import { useEffect, useState } from "react";
import styles from "./blog.module.css";

const BlogToc = ({toc}) => {
  const [activeSection, setActiveSection] = useState('toc1');
  useEffect(() => {
    const handleScroll = () => {
      let currentSection = activeSection;
      toc.forEach(section => {
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
  }, [toc]);

  return (
    <div className={`${styles.sideContentWrap}`}>
      <div className={styles.sideToc}>
        <p className={styles.tocTitle}>記事の内容</p>
        <ul>
          {
            toc.map((item:any,key:any)=>(
              <li key={key} className={activeSection === `toc${key+1}` ? `${styles.tocActive}` : ''}>
              <a href={`#${key}`}>{key + 1}. {item.text}</a>
            </li>

            ))
          }
        </ul>
      </div>
    </div>
  )
}
export default BlogToc