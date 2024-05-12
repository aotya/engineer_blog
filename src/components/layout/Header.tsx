import Image from "next/image";
import React from "react";
import styles from "./header.module.css";


export default function Header() {

  return (
    <nav className="bgColor">
      <div className={`${styles.headerContainer} pcWidth`}>
        <div>
        <Image
          width={67}
          height={67}
          alt="profile_icon"
          src={"/logo.png"}
        />
        </div>
        <div className="flex strongColor gap-10">
          <p>勉強方法</p>
          <p>転職</p>
          <p>技術の備忘録</p>
          <p>雑記</p>
        </div>
      </div>
    </nav>
  )  
}