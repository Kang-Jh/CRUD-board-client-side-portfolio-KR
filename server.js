/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

/**
 * This file must be used for development
 * This file only intend server to run on HTTPS
 */

// server.js
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const devcert = require('devcert');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const ssl = await devcert.certificateFor('localhost');
  createServer(ssl, (req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (pathname === '/a') {
      app.render(req, res, '/a', query);
    } else if (pathname === '/b') {
      app.render(req, res, '/b', query);
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
