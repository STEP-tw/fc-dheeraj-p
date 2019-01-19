const fs = require('fs');
const Sheeghra = require('./sheeghra');
const ERROR_404 = '404: Resource Not Found';
const ERROR_500 = '500: Internal Server Error';
const COMMENTS_PLACEHOLDER = '######COMMENTS_GOES_HERE######';
const COMMENTS_FILE = './private/comments.json';
const REDIRECTS = { './public_html/': './public_html/index.html' };

const app = new Sheeghra();

const loadComments = function() {
  const commentsJSON = fs.readFileSync(COMMENTS_FILE, 'utf-8');
  return JSON.parse(commentsJSON);
};

//Server won't be ready until comments get ready
const comments = loadComments();

const resolveRequestedFile = function(url) {
  let requestedFile = `./public_html${url}`;
  return REDIRECTS[requestedFile] || requestedFile;
};

const isFileNotFoundError = function(errorCode) {
  return errorCode == 'ENOENT';
};

const serveFile = (req, res, next) => {
  const requestedFile = resolveRequestedFile(req.url);
  fs.readFile(requestedFile, (err, content) => {
    if (!err) {
      send(res, 200, content);
      return;
    }
    if (isFileNotFoundError(err.code)) {
      send(res, 404, ERROR_404);
      return;
    }
    send(res, 500, ERROR_500);
  });
};

const send = function(res, statusCode, content) {
  res.statusCode = statusCode;
  res.write(content);
  res.end();
};

const logRequests = function(req, res, next) {
  console.log(req.url, req.method);
  console.log('Headers=> \n', req.headers);
  next();
};

const saveComment = function(comment, req, res) {
  comments.unshift(comment);
  fs.writeFile(COMMENTS_FILE, JSON.stringify(comments), err => {
    if (err) {
      return send(res, 500, ERROR_500);
    }
    serveGuestBookPage(req, res);
  });
};

const readArgs = text => {
  let args = {};
  const splitKeyValue = pair => pair.split('=');
  const assignKeyValueToArgs = ([key, value]) => {
    args[key] = unescape(unescape(value));
  };
  text
    .split('&')
    .map(splitKeyValue)
    .forEach(assignKeyValueToArgs);
  return args;
};

const readPostBody = (req, res, next) => {
  let content = '';
  req.on('data', chunk => (content += chunk));
  req.on('end', () => {
    req.body = content;
    next();
  });
};

const postComment = function(req, res) {
  const comment = readArgs(req.body);
  const date = new Date().toLocaleString();
  comment.date = date;
  saveComment(comment, req, res);
};

const createCommentsHTML = function(commentsData) {
  const commentsHTML = commentsData.map(({ date, name, comment }) => {
    return `<p>${date}: <strong>${name}</strong> : ${comment}</p>`;
  });
  return commentsHTML.join('\n');
};

const serveGuestBookPage = function(req, res) {
  fs.readFile('private/guest_book.html', (err, data) => {
    if (err) {
      send(res, 500, ERROR_500);
      return;
    }
    const commentsHTML = createCommentsHTML(comments);
    const guestBookPage = data
      .toString()
      .replace(COMMENTS_PLACEHOLDER, commentsHTML);

    send(res, 200, guestBookPage);
  });
};

// app.use(logRequests);
app.use(readPostBody);
app.get('/guest_book', serveGuestBookPage);
app.post('/guest_book', postComment);
app.use(serveFile);

// Export a function that can act as a handler
module.exports = app.handleRequest.bind(app);
