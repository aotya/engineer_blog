// 変換後のMarkdownの表示結果が、WordPress時代の表示結果と一致するか確認する
// 使い方: node scripts/verify-md.mts
import fs from 'node:fs';
import * as cheerio from 'cheerio';
import matter from 'gray-matter';
import { markdownToHtml } from '../lib/helpers/markdown.ts';
import { HighlightAutoCord } from '../lib/helpers/pullOutTags.ts';
// @ts-expect-error 型定義のないスクリプト
import { fixSource } from './wp-to-md.mjs';

const SELECTORS = [
  'h1', 'h2', 'h3', 'p', 'pre', 'table', 'tr', 'li', 'img', 'iframe', 'strong', 'a',
  '.code', '.marker', '.link', '.singleCode', '.red', '.blogList', '.pointContainer', '.cautionContainer',
];

function summarize(html: string) {
  const $ = cheerio.load(html);
  // 表示に影響しない要素は比較対象から外す
  $('iframe').empty();
  $('code').filter((_, el) => !$(el).closest('pre').length && !$(el).text().trim()).remove();
  $('p').filter((_, el) => !$(el).text().trim() && !$(el).children().length).remove();
  const counts = Object.fromEntries(SELECTORS.map((s) => [s, $(s).length]));
  const text = $('body').text().replace(/\s+/g, '');
  const srcs = $('img').map((_, el) => $(el).attr('src')).get().join(',');
  return { counts, text, srcs };
}

const posts = JSON.parse(fs.readFileSync('wp-backup/posts.json', 'utf8'));
let ng = 0;
for (const post of posts) {
  // 比較元は「元のHTMLの崩れを補正したもの」（補正自体の差分は対象外）
  const before = summarize(HighlightAutoCord(fixSource(post.content)));
  const { content } = matter(fs.readFileSync(`content/posts/${post.slug}.md`, 'utf8'));
  const after = summarize(HighlightAutoCord(markdownToHtml(content)));

  const diffs: string[] = [];
  for (const s of SELECTORS) {
    if (before.counts[s] !== after.counts[s]) diffs.push(`${s}: ${before.counts[s]} -> ${after.counts[s]}`);
  }
  if (before.srcs !== after.srcs) diffs.push('img src mismatch');
  if (before.text !== after.text) {
    let i = 0;
    while (before.text[i] === after.text[i]) i++;
    diffs.push(`text differs at ${i}:\n    before: ${before.text.slice(i - 30, i + 50)}\n    after:  ${after.text.slice(i - 30, i + 50)}`);
  }
  if (diffs.length) {
    ng++;
    console.log(`✗ ${post.slug}\n  ${diffs.join('\n  ')}`);
  }
}
console.log(`${posts.length - ng}/${posts.length} posts match`);
