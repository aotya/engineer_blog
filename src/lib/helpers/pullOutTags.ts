import hljs from 'highlight.js'
import cheerio from 'cheerio';

// コードのハイライト
export const HighlightAutoCord = (body:any) =>{
  const data = cheerio.load(body);
  data('pre code').each((_, elm) => {
    const result = hljs.highlightAuto(data(elm).text());
    data(elm).html(result.value);
    data(elm).addClass('hljs');
  });

    // h1、h2タグに動的なIDを付与する処理
    data('h1, h2, h3').each((index, elem) => {
      const dynamicId = `toc${index + 1}`;
      data(elem).attr('id', dynamicId);
    });

  return  data
}

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
