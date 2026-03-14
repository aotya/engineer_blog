"use client";
import { useEffect, useRef, useState } from "react";
import styles from './blog.module.scss';

interface TocEntry {
  text: string;
  id: string;
}

interface BlogTocProps {
  toc: TocEntry[];
}

const BlogToc = ({ toc }: BlogTocProps) => {
  const [activeSection, setActiveSection] = useState('toc0');
  const activeSectionRef = useRef('toc0');

  useEffect(() => {
    const handleScroll = () => {
      let currentSection = 'toc0';
      toc.forEach((section: { id: string }) => {
        const element = document.getElementById(section.id);
        if (element && window.scrollY >= element.offsetTop - 10) {
          currentSection = section.id;
        }
      });
      if (currentSection !== activeSectionRef.current) {
        activeSectionRef.current = currentSection;
        setActiveSection(currentSection);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [toc]);

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