import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "../page/Top.module.scss";
import { PostEdge } from "../../../lib/helpers/apiType";

interface CardProps {
  item: PostEdge;
  isPickup?: boolean;
}

const Card: React.FC<CardProps> = ({ item, isPickup = false }) => {
  return (
    <li key={item.node.id} className={styles.articleListItem}>
      <Link href={`${item.node.categories.nodes[0].slug}/${item.node.slug}`} className={styles.cardLink}>
        <div>
          <div className={styles.cardLinkInner}>
            <div className={styles.cardLinkImage}>
              <Image src={item.node.featuredImage.node.sourceUrl} alt="" width={1000} height={1000} />
            </div>
            <div className={styles.cardLinkInfo}>
              <div className={isPickup ? styles.cardLinkInfHeadPickup : styles.cardLinkInfHead}>
                <p className={isPickup ? styles.categoryNamePickup : styles.categoryName}>{item.node.categories.nodes[0].name}</p>
                <p className={isPickup ? styles.datePickup : styles.date}>{new Date(item.node.date).toISOString().split('T')[0]}</p>
              </div>
              <p className={isPickup ? styles.articleTitlePickup : styles.articleTitle}>{item.node.title}</p>
              {isPickup && (
                <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: item.node.content }} />
              )}
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default Card;
