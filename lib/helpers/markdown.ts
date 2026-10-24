import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import type { Root, Element, ElementContent } from 'hast';

// Markdown記法で書いた要素に、ブログ用のクラスを付与する
// （rehypeRawより前に実行するので、記事内に直接書いたHTMLには影響しない）
function rehypeBlogClasses() {
  const walk = (node: Root | Element) => {
    for (const child of node.children as ElementContent[]) {
      if (child.type !== 'element') continue;
      // インラインコード → <span class="code">
      if (child.tagName === 'code' && !(node.type === 'element' && node.tagName === 'pre')) {
        child.tagName = 'span';
        child.properties = { className: ['code'] };
      }
      // トップレベルのリスト → <ul class="blogList">
      if (child.tagName === 'ul' && node.type === 'root') {
        child.properties = { ...child.properties, className: ['blogList'] };
      }
      // リンク → <a class="link">（外部リンクは別タブ）
      if (child.tagName === 'a') {
        const href = String(child.properties?.href ?? '');
        child.properties = {
          ...child.properties,
          className: ['link'],
          ...(/^https?:\/\//.test(href) ? { target: '_blank', rel: ['noopener'] } : {}),
        };
      }
      walk(child);
    }
  };
  return (tree: Root) => walk(tree);
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeBlogClasses)
  .use(rehypeRaw)
  .use(rehypeStringify);

export function markdownToHtml(markdown: string): string {
  return String(processor.processSync(markdown));
}
