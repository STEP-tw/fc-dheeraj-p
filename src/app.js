const fs = require('fs');
const Sheeghra = require('./sheeghra');
const ERROR_404 = '404: File Not Found';
const ERROR_500 = '500: Internal Server Error';
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

app.use(logRequests);
app.use(serveFile);

// Export a function that can act as a handler
module.exports = app.handleRequest.bind(app);
