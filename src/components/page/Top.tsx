
import React from "react";
import TopTitle from "../layout/top/TopTitle";
import BlogLists from "../layout/top/BlogLists";
import { getArticlesList } from "../../lib/helpers/WpApiList";
import Profile from "../elements/Profile";
import { GetPostsEdgesResult } from '../../../src/lib/helpers/apiType'; // 型定義ファイルのパスを指定してください

export default async function Top() {
  let data: GetPostsEdgesResult | undefined;

  try {
    data = await getArticlesList();
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return (
      <>
        <TopTitle />
        <div>Error loading blog posts.</div>
        <div className={`space`}><Profile /></div>
      </>
    );
  }

  if (!data) {
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
      {/* <LinkCardsContainer /> */}
      <BlogLists topData={data} />
      <div className={`space`}><Profile /></div>
    </>
  );
}
