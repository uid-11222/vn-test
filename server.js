'use strict';

const express = require(`express`);
const server = express();

server.set(`port`, 3000);

const port = server.get(`port`);

server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});
server.use(`/`, express.static(__dirname));

server.listen(port, () => {
  console.log(`Start server on port ${port}.`);
});
