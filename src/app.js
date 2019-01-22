const fs = require('fs');
const Sheeghra = require('./sheeghra');
const {
  ERROR_404,
  ERROR_500,
  COMMENTS_FILE,
  UTF8_ENCODING,
  REDIRECTS,
  MIME_TYPES,
  MIME_TEXT_PLAIN
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

const saveComment = function(comment, res, next) {
  comments.unshift(comment);
  fs.writeFile(COMMENTS_FILE, JSON.stringify(comments), err => {
    if (err) {
      return send(res, 500, ERROR_500);
    }
    next();
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

const postComment = function(req, res, next) {
  const comment = readArgs(req.body);
  comment.date = new Date();
  saveComment(comment, res, next);
};

const serveComments = function(req, res) {
  send(res, 200, JSON.stringify(comments), resolveMIMEType('json'));
};

app.use(logRequests);
app.use(readPostBody);
app.get('/comments', serveComments);
app.post('/guest_book.html', postComment);
app.use(serveFile);

// Export a function that can act as a handler
module.exports = app.handleRequest.bind(app);
