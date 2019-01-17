const fs = require('fs');
const ERROR_404 = '404: File Not Found';
const ERROR_500 = '500: Internal Server Error';
const REDIRECTS = { './public_html/': './public_html/index.html' };

const resolveRequestedFile = function(url) {
  let requestedFile = `./public_html${url}`;
  return REDIRECTS[requestedFile] || requestedFile;
};

const isFileNotFoundError = function(errorCode) {
  return errorCode == 'ENOENT';
};

const app = (req, res) => {
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
// Export a function that can act as a handler

module.exports = app;
