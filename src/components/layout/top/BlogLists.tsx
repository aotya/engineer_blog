import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styles from "./top.module.css";
import dayjs from 'dayjs';  // day.js をインポート
import {GetPostsEdgesResult} from '../../../lib/helpers/apiType'

interface BlogListsProps {
  topData: GetPostsEdgesResult;
}

export default function BlogLists({ topData }: BlogListsProps) {

const blogDataList = topData?.posts?.edges ? topData?.posts?.edges : [];
  const changeDateFormat = (date:string) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');  // YYYYMMDD 形式にフォーマット
    return formattedDate;
  }

  return (
    <>
      <section className={`${styles.blogLists} pcWidth`}>
        <div>
          <div className={styles.tabItems}>
            <p className={styles.tabItem}>記事一覧</p> 
          </div>  
        </div>
        
        {blogDataList.length > 0 ? (
          <ul className={styles.blogCardsList}>
            {blogDataList.map((item, index) => (
              <li className={styles.blogCardContainer} key={item.node.id}>
                <Link href={`/${item.node.categories.nodes[0].slug}/${item.node.slug}/`}>
                  <div>
                    {
                      item.node.featuredImage && (
                    <Image 
                      src={item.node.featuredImage.node.sourceUrl}
                      width={500}
                      height={500}
                      alt="profile_icon"
                      className={styles.cardItemImage}
                      />
                      )
                      }
                  </div>
                  <div>
                    <p className={styles.cardTag}><span className={styles.cardTagName}>{item.node.categories.nodes[0].name}</span></p>
                    <p className={styles.cardTitle}>{item.node.title}</p>
                    <p className={styles.cardDate}>{changeDateFormat(item.node.date)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <></>
        )}
      </section>
    </>
  )  
}