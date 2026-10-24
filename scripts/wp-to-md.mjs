// wp-backup/ のWordPressデータを content/ のMarkdownに変換し、画像を public/images/ にコピーする
// 使い方: node scripts/wp-to-md.mjs （事前に scripts/wp-backup.mjs を実行しておく）
import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import matter from 'gray-matter';
import TurndownService from 'turndown';
import { tables } from 'turndown-plugin-gfm';

const BACKUP_DIR = path.resolve('wp-backup');
const POSTS_DIR = path.resolve('content/posts');
const IMAGE_HOST = 'https://images-front-engineer-92e5c41a-17172.s3.ap-northeast-1.amazonaws.com';
const IMAGE_DIR = path.resolve('public/images/uploads');
const toLocalImage = (s) => s.replaceAll(`${IMAGE_HOST}/wp-content/uploads/`, '/images/uploads/');

// Markdown記法に変換するクラス（それ以外のクラス付き要素はHTMLのまま残す）
const MARKDOWN_CLASSES = { span: ['code'], code: ['code'], ul: ['blogList'], a: ['link'] };
const RAW_TAGS = ['DIV', 'SECTION', 'IFRAME', 'SCRIPT', 'STYLE', 'IMG'];
const PUNCT_OR_SPACE = /^[\p{P}\p{S}\s]|[\p{P}\p{S}\s]$/u;

// 元記事で < > がエスケープされておらず、表示が崩れていた箇所
const SOURCE_FIXES = [['JavaScriptの<script>タグは</body>の直前', 'JavaScriptの&lt;script&gt;タグは&lt;/body&gt;の直前']];

const decodeEntities = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&vert;/g, '|')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&');
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 元のHTMLの崩れを補正する
// コードブロック内はエスケープ有無が混在していて、閉じタグ</code>の欠落もあるため、生の文字列をそのままコードとして扱う
export function fixSource(html) {
  let fixed = SOURCE_FIXES.reduce((s, [from, to]) => s.replaceAll(from, to), html);
  fixed = fixed.replace(
    /<pre><code>([\s\S]*?)(?:<\/code>\s*)?<\/pre>/g,
    (_, code) => `<pre><code>${escapeHtml(decodeEntities(code.replace(/\r\n/g, '\n')))}</code></pre>`,
  );
  return toLocalImage(fixed);
}

function preprocess(html) {
  const $ = cheerio.load(fixSource(html));
  // 段落末尾の<br>は表示に影響しないので削除（Markdownでは「\」が残ってしまう）
  $('p > br:last-child').each((_, el) => {
    if (!(el.next?.data ?? '').trim()) $(el).remove();
  });
  // コード外の空の<code>（元記事のHTML崩れ）は表示されないので削除
  $('code').each((_, el) => {
    if (!$(el).closest('pre').length && !$(el).text().trim() && !$(el).children().length) $(el).remove();
  });
  return $('body').html() ?? '';
}

function isRaw(node) {
  if (RAW_TAGS.includes(node.nodeName)) return true;
  // 画像・埋め込みを含む段落は<p>ごとHTMLで残す（Markdownだと<p>で囲まれなくなるため）
  if (node.nodeName === 'P' && node.querySelector('img, iframe')) return true;
  if (node.nodeName === 'CODE' && node.parentNode?.nodeName !== 'PRE' && !node.getAttribute('class')) return true;
  if (node.nodeName === 'TABLE' && node.querySelector('td br, td p, td ul, td pre, th br')) return true;
  const cls = node.getAttribute?.('class');
  if (!cls) return false;
  const allowed = MARKDOWN_CLASSES[node.nodeName.toLowerCase()] ?? [];
  return !cls.split(/\s+/).every((c) => allowed.includes(c));
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  br: '\\',
});
turndown.use(tables);
// 本文中の「<tag>」や「&lt;」などの文字がHTMLとして解釈されないようにエスケープ
const defaultEscape = turndown.escape.bind(turndown);
turndown.escape = (text) =>
  defaultEscape(text).replace(/</g, '\\<').replace(/&(?=#?[a-zA-Z0-9]+;)/g, '\\&');
turndown.addRule('inlineCode', {
  filter: (node) => ['SPAN', 'CODE'].includes(node.nodeName) && node.getAttribute('class') === 'code',
  replacement: (_, node) => {
    // コード内のタグ（例: '<strong>強調</strong>'）は文字列として表示する
    const text = decodeEntities(node.innerHTML);
    const fence = text.includes('`') ? '``' : '`';
    const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
    return `${fence}${pad}${text}${pad}${fence}`;
  },
});
// 日本語では「**」の前後が記号だと太字にならないため、その場合はHTMLで残す
turndown.addRule('strong', {
  filter: (node) => node.nodeName === 'STRONG' && !node.getAttribute('class'),
  replacement: (content) => (PUNCT_OR_SPACE.test(content) ? `<strong>${content}</strong>` : `**${content}**`),
});
// 優先度を最も高くするため最後に追加（addRuleは先頭に追加される）
turndown.addRule('raw', {
  filter: isRaw,
  replacement: (_, node) => (node.isBlock ? `\n\n${node.outerHTML}\n\n` : node.outerHTML),
});

const stripTags = (html) =>
  cheerio.load(html).text().replace(/\s+/g, ' ').trim();

async function main() {
  const posts = JSON.parse(await fs.readFile(path.join(BACKUP_DIR, 'posts.json'), 'utf8'));
  const categories = JSON.parse(await fs.readFile(path.join(BACKUP_DIR, 'categories.json'), 'utf8'));

  await fs.mkdir(POSTS_DIR, { recursive: true });
  for (const post of posts) {
    const body = turndown.turndown(preprocess(post.content ?? '')).trim() + '\n';
    const frontmatter = {
      title: post.title,
      date: post.date,
      modified: post.modified,
      categories: post.categories.nodes.map((c) => c.slug),
      excerpt: stripTags(post.excerpt ?? ''),
      eyecatch: toLocalImage(post.featuredImage?.node?.sourceUrl ?? ''),
    };
    await fs.writeFile(path.join(POSTS_DIR, `${post.slug}.md`), matter.stringify(body, frontmatter));
  }

  // カテゴリ（WordPressと同じく名前順。並び替えたい場合はファイルの順番を変更する）
  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name, 'ja', { sensitivity: 'base' }));
  const categoryList = sorted.map((c) => ({
    id: c.databaseId,
    slug: c.slug,
    name: c.name,
    parent: c.parent?.node?.slug ?? null,
  }));
  await fs.writeFile(path.resolve('content/categories.json'), JSON.stringify(categoryList, null, 2) + '\n');

  await fs.cp(path.join(BACKUP_DIR, 'images', new URL(IMAGE_HOST).hostname, 'wp-content/uploads'), IMAGE_DIR, {
    recursive: true,
  });
  console.log(`posts: ${posts.length}, categories: ${categoryList.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
