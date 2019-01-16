const fs = require('fs');
const REDIRECTS = { './public_html/': './public_html/index.html' };

const resolveRequestedFile = function(url) {
  let requestedFile = `./public_html${url}`;
  return REDIRECTS[requestedFile] || requestedFile;
};

const app = (req, res) => {
  const requestedFile = resolveRequestedFile(req.url);
  fs.readFile(requestedFile, (err, content) => {
    if (!err) {
      send(res, 200, content);
      return;
    }
    if (err.code == 'ENOENT') {
      send(res, 404, '404: File Not Found');
      return;
    }
    send(res, 500, '500: Internal Server Error');
  });
};

const send = function(res, statusCode, content) {
  res.statusCode = statusCode;
  res.write(content);
  res.end();
};
// Export a function that can act as a handler

module.exports = app;
