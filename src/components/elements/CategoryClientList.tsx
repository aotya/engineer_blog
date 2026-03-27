import React from 'react';
import Link from 'next/link';
import { PostEdge } from "../../../lib/helpers/apiType";
import Card from "./CategoryCard";
import styles from "../../app/[category]/category.module.scss";

interface CategoryClientListProps {
  posts: PostEdge[]; // 表示する記事のリスト
  totalPosts: number; // 全記事数（ページネーション計算用）
  currentPage: number; // 現在のページ番号
  categorySlug: string; // カテゴリスラッグ（URL生成用）
  itemsPerPage?: number; // 1ページあたりの表示件数
}

/**
 * カテゴリー記事一覧を表示するコンポーネント
 * ページネーションはURLベース（Linkコンポーネント）で実装
 */
export default function CategoryClientList({ 
  posts, 
  totalPosts,
  currentPage,
  categorySlug, 
  itemsPerPage = 9 
}: CategoryClientListProps) {
  
  // 総ページ数を計算
  const totalPages = Math.ceil(totalPosts / itemsPerPage);
  
  // ページネーションの表示範囲を計算するロジック
  // 現在のページを中心に、前後2ページ分を表示する
  const getPaginationRange = (current: number, total: number) => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    
    if (current - delta > 2) {
      range.unshift("...");
    }
    if (current + delta < total - 1) {
      range.push("...");
    }
    
    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }
    
    return range;
  };

  const paginationRange = getPaginationRange(currentPage, totalPages);

  // ページ番号からURLを生成する関数
  // 1ページ目はカテゴリートップ、2ページ目以降は /page/[page] とする
  const getPageUrl = (page: number) => {
    return page === 1 ? `/${categorySlug}` : `/${categorySlug}/page/${page}`;
  };

  return (
    <section className={styles.cardList}>
      <ul className={styles.articleListContainer}>
        {posts.map((post) => (
          <Card 
            categorySlug={categorySlug}
            key={post.node.id} 
            item={post} 
          />
        ))}
      </ul>
      
      {/* ページネーション */}
      {totalPages > 1 && (
        <div className={styles.pagination || "pagination"} style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
            
            {/* 前へボタン */}
            {currentPage > 1 ? (
              <Link 
                href={getPageUrl(currentPage - 1)}
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  background: 'transparent',
                  color: '#333',
                  textDecoration: 'none'
                }}
              >
                &lt;
              </Link>
            ) : (
              <span 
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  background: '#f5f5f5',
                  color: '#ccc',
                  cursor: 'not-allowed'
                }}
              >
                &lt;
              </span>
            )}

            {/* 数字ボタン */}
            {paginationRange.map((page, index) => {
              if (page === "...") {
                return <span key={`dots-${index}`} style={{ padding: '0 5px' }}>...</span>;
              }
              
              const pageNum = page as number;
              const isCurrent = pageNum === currentPage;
              
              if (isCurrent) {
                return (
                  <span
                    key={`page-${pageNum}`}
                    style={{ 
                      padding: '8px 16px', 
                      border: '1px solid #333',
                      background: '#333',
                      color: '#fff',
                      borderRadius: '4px',
                    }}
                  >
                    {pageNum}
                  </span>
                );
              }

              return (
                <Link 
                  key={`page-${pageNum}`} 
                  href={getPageUrl(pageNum)}
                  style={{ 
                    padding: '8px 16px', 
                    border: '1px solid #ddd',
                    background: 'transparent',
                    color: '#333',
                    borderRadius: '4px',
                    textDecoration: 'none'
                  }}
                >
                  {pageNum}
                </Link>
              );
            })}

            {/* 次へボタン */}
            {currentPage < totalPages ? (
              <Link 
                href={getPageUrl(currentPage + 1)}
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  background: 'transparent',
                  color: '#333',
                  textDecoration: 'none'
                }}
              >
                &gt;
              </Link>
            ) : (
              <span 
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  background: '#f5f5f5',
                  color: '#ccc',
                  cursor: 'not-allowed'
                }}
              >
                &gt;
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
