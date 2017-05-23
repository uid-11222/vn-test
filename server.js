'use strict';

const express = require(`express`);
const server = express();

server.set(`port`, 3000);

server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});
server.use(`/`, express.static(__dirname));

server.listen(3000, () => {
  console.log(`Start server.`);
});
