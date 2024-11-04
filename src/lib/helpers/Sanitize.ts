// lib/helpers/sanitize.js
import sanitizeHtml from 'sanitize-html';

const sanitizeContent = (content: string) => {
  return sanitizeHtml(content, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'br', 'ul', 'ol', 'li', 
      'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'div', 'span',
      'iframe', 'p', 'button'  // <p>タグを許可
    ],
    allowedAttributes: {
      'a': ['href', 'name', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
      'table': ['width', 'border', 'cellspacing', 'cellpadding'],
      'th': ['rowspan', 'colspan'],
      'td': ['rowspan', 'colspan'],
      '*': ['style', 'class', 'onclick', 'id'] // すべてのタグでstyle属性とclass属性を許可
    },
    allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com', 'codepen.io']
  });
};

export default sanitizeContent;
