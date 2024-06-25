"use client"

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styles from "./top.module.css";
import dayjs from 'dayjs';  // day.js をインポート



export default function BlogLists({topData=[]}) {

const [tabNum, setTabNum] = useState(0);
const blogDataList = topData?.data?.posts?.edges;
console.log(topData.data.posts.edges[0].node)
const changeDateFormat = (date:string) => {
  const formattedDate = dayjs(date).format('YYYY-MM-DD');  // YYYYMMDD 形式にフォーマット
  return formattedDate;
}


// useEffect(()=>{
//   console.log("=======TESUTO======")
//   console.log(tabNum)
// },[tabNum])

  return (
    <>
      <section className={`${styles.blogLists} pcWidth`}>
        <div>
          <div className={styles.tabItems}>
            <p className={styles.tabItem} onClick={()=>{setTabNum(3)}}>記事一覧</p> 
          </div>  
        </div>
        
        {blogDataList.length > 0 ? (
          <ul className={styles.blogCardsList}>
            {blogDataList.map((item: any, index: any) => (
              <li className={styles.blogCardContainer} key={item.node.id}>
                <Link href={`/cord/${item.node.slug}/`}>
                  <div>
                    <Image 
                      src={item.node.featuredImage.node.link}
                      width={320}
                      height={114}
                      alt="profile_icon"
                      className={styles.cardItemImage}
                    />
                  </div>
                  <div>
                    <p className={styles.cardTag}>{item.node.categories.nodes[0].name}</p>
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