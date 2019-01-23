const fs = require('fs');
const Sheeghra = require('./sheeghra');
const {
  ERROR_404,
  ERROR_500,
  COMMENTS_FILE,
  UTF8_ENCODING,
  REDIRECTS,
  MIME_TYPES,
  MIME_TEXT_PLAIN,
  LOGIN_FORM_TEMPLATE_PATH,
  COMMENT_FORM_TEMPLATE_PATH,
  FORM_PLACEHOLDER,
  GUEST_BOOK_PAGE_TEMPLATE_PATH,
  USERNAME_PLACEHOLDER
} = require('./constants');

const app = new Sheeghra();

const loadComments = function() {
  if (!fs.existsSync('./private')) {
    fs.mkdirSync('./private');
  }
  if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, '[]', UTF8_ENCODING);
  }
  const commentsJSON = fs.readFileSync(COMMENTS_FILE, UTF8_ENCODING);
  return JSON.parse(commentsJSON);
};

//Server won't be ready until comments get ready
const comments = loadComments();

const resolveRequestedFile = function(url) {
  let requestedFile = `./public_html${url}`;
  return REDIRECTS[requestedFile] || requestedFile;
};

const resolveMIMEType = function(fileExtension) {
  return MIME_TYPES[fileExtension] || MIME_TEXT_PLAIN;
};

const getFileExtension = function(fileName) {
  return fileName.split('.').pop();
};

const isFileNotFoundError = function(errorCode) {
  return errorCode == 'ENOENT';
};

const serveFile = (req, res, next) => {
  const requestedFile = resolveRequestedFile(req.url);
  fs.readFile(requestedFile, (err, content) => {
    if (!err) {
      const fileExtension = getFileExtension(requestedFile);
      const contentType = resolveMIMEType(fileExtension);
      send(res, 200, content, contentType);
      return;
    }
    if (isFileNotFoundError(err.code)) {
      send(res, 404, ERROR_404);
      return;
    }
    send(res, 500, ERROR_500);
  });
};

const send = function(res, statusCode, content, contentType = MIME_TEXT_PLAIN) {
  res.setHeader('Content-Type', contentType);
  res.statusCode = statusCode;
  res.write(content);
  res.end();
};

const logRequests = function(req, res, next) {
  console.log(req.url, req.method);
  console.log('Headers=> \n', req.headers);
  next();
};

const saveComment = function(req, res, comment) {
  comments.unshift(comment);
  fs.writeFile(COMMENTS_FILE, JSON.stringify(comments), err => {
    if (err) {
      return send(res, 500, ERROR_500);
    }
    serveGuestBookPage(req, res);
  });
};

const splitKeyValue = pair => pair.split('=');

const assignKeyValue = (parameters, [key, value]) => {
  parameters[key] = unescape(unescape(value));
  return parameters;
};

const readParameters = requestBody => {
  return requestBody
    .split('&')
    .map(splitKeyValue)
    .reduce(assignKeyValue, {});
};

const readPostBody = (req, res, next) => {
  let content = '';
  req.on('data', chunk => (content += chunk));
  req.on('end', () => {
    req.body = content;
    next();
  });
};

const postComment = function(req, res, next) {
  const { username } = readCookies(req.headers.cookie);
  const comment = readParameters(req.body);
  comment.name = username;
  comment.date = new Date();
  saveComment(req, res, comment);
};

const serveComments = function(req, res) {
  send(res, 200, JSON.stringify(comments), resolveMIMEType('json'));
};

const loggedInUsers = [];

const readCookies = function(cookieHeader) {
  return cookieHeader
    .split(';')
    .map(splitKeyValue)
    .reduce(assignKeyValue, {});
};

const isUserLoggedIn = function(cookieHeader) {
  if (!cookieHeader) {
    return false;
  }
  const cookies = readCookies(cookieHeader);
  return loggedInUsers.includes(cookies.username);
};

const LOGIN_FORM_HTML = fs.readFileSync(
  LOGIN_FORM_TEMPLATE_PATH,
  UTF8_ENCODING
);
const COMMENT_FORM_HTML = fs.readFileSync(
  COMMENT_FORM_TEMPLATE_PATH,
  UTF8_ENCODING
);
const GUEST_BOOK_TEMPLATE = fs.readFileSync(
  GUEST_BOOK_PAGE_TEMPLATE_PATH,
  UTF8_ENCODING
);

const getCommentsFormPage = function(username) {
  return GUEST_BOOK_TEMPLATE
    .replace(FORM_PLACEHOLDER, COMMENT_FORM_HTML)
    .replace(USERNAME_PLACEHOLDER, username);
};

const getLoginFormPage = function() {
  return GUEST_BOOK_TEMPLATE.replace(FORM_PLACEHOLDER, LOGIN_FORM_HTML);
};

const serveGuestBookPage = function(req, res, next) {
  let guestBookPageHTML = getLoginFormPage();
  if (isUserLoggedIn(req.headers.cookie)) {
    const { username } = readCookies(req.headers.cookie);
    guestBookPageHTML = getCommentsFormPage(username);
  }
  send(res, 200, guestBookPageHTML, resolveMIMEType('html'));
};

const doLogin = function(req, res) {
  const { username } = readParameters(req.body);
  loggedInUsers.push(username);
  res.setHeader('Set-Cookie', `username=${username}`);
  res.statusCode = 302;
  res.setHeader('location', '/guest_book.html');
  res.end();
};

const doLogout = function(req, res){
  res.setHeader('Set-Cookie', `username=deleted; expires=Thu, Jan 01 1970 00:00:00 UTC;`);
  res.statusCode = 302;
  res.setHeader('location', '/guest_book.html');
  res.end();
}

app.use(logRequests);
app.use(readPostBody);
app.get('/comments', serveComments);
app.get('/guest_book.html', serveGuestBookPage);
app.post('/guest_book.html', postComment);
app.post('/login', doLogin);
app.post('/logout', doLogout);
app.use(serveFile);

// Export a function that can act as a handler
module.exports = app.handleRequest.bind(app);
