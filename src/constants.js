const ERROR_404 = '404: Resource Not Found';
const ERROR_500 = '500: Internal Server Error';
const COMMENTS_FILE = './private/comments.json';
const UTF8_ENCODING = 'utf-8';
const REDIRECTS = { './public_html/': './public_html/index.html' };
const LOGIN_FORM_TEMPLATE_PATH = './private/login_form.template.html';
const COMMENT_FORM_TEMPLATE_PATH = './private/comment_form.template.html';
const GUEST_BOOK_PAGE_TEMPLATE_PATH = './private/guest_book.template.html';
const FORM_PLACEHOLDER = '___FORM_GOES_HERE___';
const USERNAME_PLACEHOLDER = '___USERNAME___';
const MIME_TEXT_PLAIN = 'text/plain';
const MIME_TYPES = {
  css: 'text/css',
  html: 'text/html',
  js: 'text/javascript',
  csv: 'text/csv',
  gif: 'image/gif',
  htm: 'text/html',
  html: 'text/html',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  json: 'application/json',
  png: 'image/png',
  xml: 'text/xml',
  pdf: 'application/pdf'
};

module.exports = {
  ERROR_404,
  ERROR_500,
  COMMENTS_FILE,
  UTF8_ENCODING,
  REDIRECTS,
  MIME_TYPES,
  MIME_TEXT_PLAIN,
  LOGIN_FORM_TEMPLATE_PATH,
  COMMENT_FORM_TEMPLATE_PATH,
  GUEST_BOOK_PAGE_TEMPLATE_PATH,
  FORM_PLACEHOLDER,
  USERNAME_PLACEHOLDER
};
