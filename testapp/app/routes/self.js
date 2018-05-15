'use strict';

const express = require('express');
const self = express.Router();

self.get('/cookie', (req, res) => {
  let username = 'John Doe';
  if (req.cookies.username === undefined) {
    res.cookie('username', username);
  } else {
    username = req.cookies.username;
  }
  res.render('self/cookie', {
    username,
  });
});

self.get('/input', (req, res) => {
  res.render('self/input');
});

module.exports = self;