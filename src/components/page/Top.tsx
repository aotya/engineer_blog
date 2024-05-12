import Image from "next/image";
import React from "react";
import TopTitle from "../layout/top/TopTitle";
import LinkCardsContainer from "../layout/top/LinkCardsContainer";
import BlogLists from "../layout/top/BlogLists";
import {getArticlesList} from "../../lib/helpers/WpApiList";

export default async function Top() {
  const data = await getArticlesList();
  return (
    <>
    <TopTitle/>
    <LinkCardsContainer/>
    <BlogLists topData={data}/>

    </>
  )  
}