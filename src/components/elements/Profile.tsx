
import Image from "next/image";
import React from "react";
import styles from "./common.module.css";


const Profile = () => {

return (
  <section className={styles.profileContainer}>
    <div className={styles.profileImage}>
      <Image 
        src="/profileIcon.jpg"
        alt="profile_icon"
        width={75}
        height={75}
      />
    </div>
    <div className={styles.profileText}>
      <p className={styles.profileName}>青茶</p>
      <p>デザインを形にするのが好きで、30代から実務未経験のコーダからのスタートで就職しました。
      HTML・CSS・JSのコーティングをしたり、Reactで開発をしたり、スマホアプリの開発をしたりしています。
      自分の技術のストック先として、このブログで発信し、成長していく・・・予定！
      （30代から1からコーダーや、フロントエンドエンジアを目指す人に役立つ情報も発信したいな）
      </p>
    </div>
  </section>
)

}

export default Profile;