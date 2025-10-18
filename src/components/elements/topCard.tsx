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
  const sanitizedHtml = React.useMemo(() => {
    const html = item.node.content || "";
    // Unwrap anchor tags to avoid nested <a> inside outer Link
    return html.replace(/<\/?a(?:\s[^>]*)?>/gi, "");
  }, [item.node.content]);
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
                <p className={isPickup ? styles.datePickup : styles.date}>{(item.node.date || '').split('T')[0]}</p>
              </div>
              <p className={isPickup ? styles.articleTitlePickup : styles.articleTitle}>{item.node.title}</p>
              {isPickup && (
                <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
              )}
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default Card;
