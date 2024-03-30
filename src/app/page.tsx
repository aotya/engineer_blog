// PostServiceをインポート
import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";
import PostService from "../../services/PostService";


async function fetchAPI(query = "", { variables }: Record<string, any> = {}) {
  const headers = { "Content-Type": "application/json" };

  // WPGraphQL Plugin must be enabled
  const res = await fetch("http://localhost:8000/graphql", {
    headers,
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }
  return json.data;
}

export default function Home() {
  fetchAPI(
    `
    query GetPostsEdges {
      posts {
        edges {
          node {
            id
            title
            date
            content
          }
        }
      }
    }`
  ).then((data) => {console.log(JSON.stringify(data))});


  return (
    <main className={styles.main}>
      {/* コンテンツ */}
    </main>
  );
}
