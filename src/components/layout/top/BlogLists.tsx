"use client"

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styles from "./top.module.css";



export default function BlogLists({topData}) {

const [tabNum, setTabNum] = useState(0);
const blogDataList = topData.data.posts.edges

// useEffect(()=>{
//   console.log("=======TESUTO======")
//   console.log(tabNum)
// },[tabNum])
// console.log("===TEST======")
// console.log(topData.data.posts.edges)

  return (
    <>
      <section className={`${styles.blogLists} pcWidth`}>
        <div>
          <div className={styles.tabItems}>
            <p className={styles.tabItem} onClick={()=>{setTabNum(3)}}>記事一覧</p> 
          </div>  
        </div>
        <ul className={styles.blogCardsList}>
          {blogDataList.map((item:any)=>(
            <li className={styles.blogCardContainer}>
              <a href="/">
                <div>
                  <Image 
                    src={"/topLogo.png"}
                    width={114}
                    height={114}
                    alt="profile_icon"
                    className={styles.cardItemImage}
                    />
                </div>
                <div>
                  <p className={styles.cardTag}>css</p>
                  <p className={styles.cardTitle}>タイトル</p>
                  <p className={styles.cardDate}>日付</p>
                </div>
              </a>
            </li>
          ))}
    
        </ul>


      </section>
    </>
  )  
}