import React from "react";
import TopTitle from "../layout/top/TopTitle";
import BlogLists from "../layout/top/BlogLists";
import Profile from "../elements/Profile";
import { GetPostsEdgesResult } from '../../../src/lib/helpers/apiType'; // 型定義ファイルのパスを指定してください

interface TopProps {
  topData?: GetPostsEdgesResult;
}

const Top: React.FC<TopProps> = ({ topData }) => {
  if (!topData) {
    return (
      <>
        <TopTitle />
        <div>Error loading blog posts.</div>
        <div className={`space`}><Profile /></div>
      </>
    );
  }

  return (
    <>
      <TopTitle />
      <BlogLists topData={topData} />
      <div className={`space`}><Profile /></div>
    </>
  );
};

export default Top;
