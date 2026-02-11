import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "../page/Top.module.scss";
import { PostEdge } from "../../../lib/helpers/apiType";

interface CardProps {
  item: PostEdge;
}

const Card: React.FC<CardProps> = ({ item }) => {
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
              <div className={styles.cardLinkInfHead}>
                <p className={styles.categoryName}>{item.node.categories.nodes[0].name}</p>
              </div>
              <p className={styles.articleTitle}>{item.node.title}</p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default Card;
