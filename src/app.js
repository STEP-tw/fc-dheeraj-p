const fs = require('fs');
const Sheeghra = require('./sheeghra');
const ERROR_404 = '404: Resource Not Found';
const ERROR_500 = '500: Internal Server Error';
const COMMENTS_PLACEHOLDER = '######COMMENTS_GOES_HERE######';
const REDIRECTS = { './public_html/': './public_html/index.html' };

const app = new Sheeghra();

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
  fs.appendFile(
    './private/comments.part_json',
    JSON.stringify(comment) + ',',
    err => {
      if (err) return send(res, 500, ERROR_500);
      serveGuestBookPage(req, res);
    }
  );
};

const readArgs = text => {
  let args = {};
  const splitKeyValue = pair => pair.split('=');
  const assignKeyValueToArgs = ([key, value]) => (args[key] = value);
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
  const commentData = readArgs(req.body);
  const date = new Date().toLocaleString();
  commentData.date = date;
  saveComment(commentData, req, res);
};

const createCommentsHTML = function(commentsData) {
  const commentsHTML = commentsData.map(({ date, name, comment }) => {
    return `<p>${date}: <strong>${name}</strong> : ${comment}</p>`;
  });
  return commentsHTML.join('\n');
};

const serveGuestBookPage = function(req, res) {
  fs.readFile('private/comments.part_json', (err, data) => {
    const commentsData = JSON.parse('[' + data.slice(0, -1) + ']');
    fs.readFile('private/guest_book.html', (err, data) => {
      if (err) return send(res, 500, ERROR_500);
      const commentsOrderedByDate = commentsData.reverse();
      const commentsHTML = createCommentsHTML(commentsOrderedByDate);
      const guestBookPage = data
        .toString()
        .replace(COMMENTS_PLACEHOLDER, commentsHTML);

      send(res, 200, guestBookPage);
    });
  });
};

app.use(logRequests);
app.use(readPostBody);
app.get('/guest_book', serveGuestBookPage);
app.post('/guest_book', postComment);
app.use(serveFile);

// Export a function that can act as a handler
module.exports = app.handleRequest.bind(app);
