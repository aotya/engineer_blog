import hljs from 'highlight.js'
import cheerio from 'cheerio';
import javascript from 'highlight.js/lib/languages/javascript'; // 必要な言語のみをインポート
import xml from 'highlight.js/lib/languages/xml'; // 追加の必要な言語
// 必要な言語を登録
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);

export const HighlightAutoCord = (body:any) => {
  // Load the HTML body
  const data = cheerio.load(body);

  // Highlight code blocks
  data('pre code').each((_, elm) => {
    const codeText = data(elm).text();
    const result = hljs.highlightAuto(codeText, ['javascript', 'xml']); // 使用する言語を指定
    data(elm).html(result.value);
    data(elm).addClass('hljs');
  });

  // Add dynamic IDs to h1, h2, h3 tags
  data('h1, h2, h3').each((index, elem) => {
    const dynamicId = `toc${index + 1}`;
    data(elem).attr('id', dynamicId);
  });

  return data;
};


// 目次処理
export const renderToc = (body: any) => {
  const $ = cheerio.load(body);
  const headings = $('h1, h2, h3').toArray();
  const toc = headings.map((item, index) => ({
    text: $(item).text(),
    id: `toc${index + 1}`
  }));
  return toc;
};
