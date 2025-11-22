'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PostEdge } from "../../../lib/helpers/apiType";
import Card from "../../components/elements/categoryCard";
import styles from "../../app/[category]/category.module.scss";

interface CategoryClientListProps {
  allPosts: PostEdge[];
  categorySlug: string;
  itemsPerPage?: number;
}

export default function CategoryClientList({ 
  allPosts, 
  categorySlug, 
  itemsPerPage = 9 
}: CategoryClientListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(allPosts.length / itemsPerPage);
  
  const getCurrentPagePosts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allPosts.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // ページ上部へスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ページネーションの範囲計算
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

  return (
    <section className={styles.cardList}>
      <ul className={styles.articleListContainer}>
        {getCurrentPagePosts().map((post) => (
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
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ 
                padding: '8px 16px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                background: currentPage === 1 ? '#f5f5f5' : 'transparent',
                color: currentPage === 1 ? '#ccc' : '#333',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              &lt;
            </button>

            {/* 数字ボタン */}
            {paginationRange.map((page, index) => {
              if (page === "...") {
                return <span key={`dots-${index}`} style={{ padding: '0 5px' }}>...</span>;
              }
              
              const pageNum = page as number;
              const isCurrent = pageNum === currentPage;
              return (
                <button 
                  key={`page-${pageNum}`} 
                  onClick={() => handlePageChange(pageNum)}
                  style={{ 
                    padding: '8px 16px', 
                    border: isCurrent ? '1px solid #333' : '1px solid #ddd',
                    background: isCurrent ? '#333' : 'transparent',
                    color: isCurrent ? '#fff' : '#333',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* 次へボタン */}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ 
                padding: '8px 16px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                background: currentPage === totalPages ? '#f5f5f5' : 'transparent',
                color: currentPage === totalPages ? '#ccc' : '#333',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

