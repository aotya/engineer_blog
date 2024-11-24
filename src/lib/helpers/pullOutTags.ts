import hljs from 'highlight.js';
import cheerio from 'cheerio';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);

export const HighlightAutoCord = (body: any) => {
  // HTML bodyを読み込み
  const data = cheerio.load(body, { xmlMode: false });
  
  // コードブロックにハイライトを適用
  data('pre code').each((_:any, elm:any) => {
    // HTMLとしてコードを取得し、&amp;を&に置換
    let codeHtml = data(elm).html();
  // codeHtml が null でないかを確認
  if (codeHtml !== null) {
    codeHtml = codeHtml
      .replace(/&amp;/g, '&')   // &amp; を &
      .replace(/&lt;/g, '<')    // &lt; を <
      .replace(/&gt;/g, '>')    // &gt; を >
      .replace(/&vert;/g, '|'); // &vert; を |

      const result = hljs.highlightAuto(codeHtml, ['javascript', 'xml']); // 使用する言語を指定

      // ハイライトされたHTMLを適用
      data(elm).html(result.value);  // エスケープ処理後のHTMLを設定
      data(elm).addClass('hljs');  // ハイライトクラスを追加
    } else {
    }
  });

  // h1, h2, h3タグに動的なIDを付与
  data('h1, h2, h3').each((index:any, elem:any) => {
    const dynamicId = `toc${index + 1}`;
    data(elem).attr('id', dynamicId);
  });
  
  // 修正されたHTML文字列を返す
  return data.html();  // HTMLの文字列を返す
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