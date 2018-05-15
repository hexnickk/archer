'use strict';

const express = require('express');
const dom = express.Router();

dom.get('/hash', (req, res) => {
  res.render('dom/hash');
});

const mock_ajax_user = {
  name: 'Some post about jQuery security',
  data: 'Blah, blah, it\'s very insecure...',
  comments: [
    'Wow, so cool',
    'Really, do not use eval!'
  ]
};

dom.get('/ajax', (req, res) => {
  res.render('dom/ajax');
});

dom.get('/ajax/api/user', (req, res) => {
  res.json(mock_ajax_user);
});

dom.post('/ajax', (req, res) => {
  mock_ajax_user.comments.push(req.body.comment);
  res.render('dom/ajax');
});


dom.get('/redirect', (req, res) => {
  res.render('dom/redirect');
});

module.exports = dom;