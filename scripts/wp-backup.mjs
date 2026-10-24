// WordPress（WPGraphQL）から全記事・カテゴリ・画像をバックアップし、公開URL一覧を出力する
// 使い方: node scripts/wp-backup.mjs [GRAPHQL_ENDPOINT] [SITE_URL]
import fs from 'node:fs/promises';
import path from 'node:path';

const ENDPOINT = process.argv[2] ?? 'https://backend-cms-api91.front-end-engineer-blog.com/graphql';
const SITE_URL = process.argv[3] ?? 'https://www.front-end-engineer-blog.com';
const OUT_DIR = path.resolve('wp-backup');

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// カーソルで全件取得
async function fetchAll(field, query) {
  const nodes = [];
  let after = null;
  for (;;) {
    const data = await gql(query, { after });
    nodes.push(...data[field].nodes);
    if (!data[field].pageInfo.hasNextPage) return nodes;
    after = data[field].pageInfo.endCursor;
  }
}

const POSTS_QUERY = `
  query ($after: String) {
    posts(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        databaseId slug uri status title date modified excerpt content
        categories { nodes { databaseId slug name } }
        tags { nodes { slug name } }
        featuredImage { node { sourceUrl altText } }
      }
    }
  }`;

const CATEGORIES_QUERY = `
  query ($after: String) {
    categories(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { databaseId slug name description count uri parent { node { slug } } }
    }
  }`;

const PAGES_QUERY = `
  query ($after: String) {
    pages(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { databaseId slug uri status title date modified content }
    }
  }`;

function extractImageUrls(html) {
  const urls = new Set();
  for (const m of html.matchAll(/(?:src|href)="([^"]+\.(?:png|jpe?g|gif|webp|svg|avif))"/gi)) urls.add(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/gi)) {
    for (const part of m[1].split(',')) urls.add(part.trim().split(/\s+/)[0]);
  }
  return [...urls].filter((u) => /^https?:\/\//.test(u));
}

async function downloadImage(url) {
  const { hostname, pathname } = new URL(url);
  const dest = path.join(OUT_DIR, 'images', hostname, decodeURIComponent(pathname));
  try {
    await fs.access(dest);
    return { url, ok: true, skipped: true };
  } catch {}
  const res = await fetch(url);
  if (!res.ok) return { url, ok: false, status: res.status };
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return { url, ok: true };
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

async function main() {
  await fs.mkdir(path.join(OUT_DIR, 'posts'), { recursive: true });

  const [posts, categories, pages] = await Promise.all([
    fetchAll('posts', POSTS_QUERY),
    fetchAll('categories', CATEGORIES_QUERY),
    fetchAll('pages', PAGES_QUERY),
  ]);
  console.log(`posts: ${posts.length}, categories: ${categories.length}, pages: ${pages.length}`);

  await fs.writeFile(path.join(OUT_DIR, 'posts.json'), JSON.stringify(posts, null, 2));
  await fs.writeFile(path.join(OUT_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
  await fs.writeFile(path.join(OUT_DIR, 'pages.json'), JSON.stringify(pages, null, 2));
  for (const post of posts) {
    await fs.writeFile(path.join(OUT_DIR, 'posts', `${post.slug}.html`), post.content ?? '');
  }

  // 公開URL一覧（Next.js側は記事の全カテゴリ分のURLが生成されている。canonicalは先頭カテゴリ）
  const rows = [['type', 'url', 'canonical', 'slug', 'category', 'wp_uri', 'date', 'title']];
  rows.push(['top', `${SITE_URL}/`, 'yes', '', '', '', '', '']);
  for (const cat of categories) {
    rows.push(['category', `${SITE_URL}/${cat.slug}`, 'yes', '', cat.slug, cat.uri, '', cat.name]);
  }
  for (const post of posts) {
    post.categories.nodes.forEach((cat, i) => {
      rows.push([
        'post', `${SITE_URL}/${cat.slug}/${post.slug}`, i === 0 ? 'yes' : 'no',
        post.slug, cat.slug, post.uri, post.date, post.title,
      ]);
    });
  }
  await fs.writeFile(path.join(OUT_DIR, 'urls.csv'), rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n');

  // 現行サイトのsitemapも保存
  const sitemap = await fetch(`${SITE_URL}/sitemap.xml`).then((r) => r.text()).catch(() => '');
  if (sitemap) await fs.writeFile(path.join(OUT_DIR, 'sitemap.xml'), sitemap);

  // 画像（アイキャッチ＋本文内）
  const imageUrls = new Set();
  for (const p of [...posts, ...pages]) {
    if (p.featuredImage?.node?.sourceUrl) imageUrls.add(p.featuredImage.node.sourceUrl);
    for (const u of extractImageUrls(p.content ?? '')) imageUrls.add(u);
  }
  const results = [];
  for (const url of imageUrls) {
    results.push(await downloadImage(url).catch((e) => ({ url, ok: false, error: String(e) })));
  }
  const failed = results.filter((r) => !r.ok);
  await fs.writeFile(path.join(OUT_DIR, 'images.json'), JSON.stringify(results, null, 2));
  console.log(`images: ${results.length - failed.length}/${results.length} ok`);
  for (const f of failed) console.log('  failed:', f.url, f.status ?? f.error);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
