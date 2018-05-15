'use strict';

const express = require('express');
const db = require('../models');
const stored = express.Router();

stored.get('/simple', (req, res) => {
  db.post
    .all()
    .then((posts) => {
      res.render('stored/simple', {
        posts,
      });
    })
    .catch((err) => res.json(err));
});
stored.post('/simple', (req, res) => {
  db.post
    .create({
      data: req.body.data,
    })
    .then(() => db.post.all())
    .then((posts) => res.render('stored/simple', {
      posts,
    }))
    .catch((err) => res.status(500).json(err));
});
stored.get('/attribute', (req, res) => {
  db.attribute
    .all()
    .then((posts) => {
      res.render('stored/attribute', {
        posts,
      });
    })
    .catch((err) => res.json(err));
});
stored.post('/attribute', (req, res) => {
  db.attribute
    .create({
      data: req.body.data,
    })
    .then(() => db.attribute.all())
    .then((posts) => res.render('stored/attribute', {
      posts,
    }))
    .catch((err) => res.status(500).json(err));
});
stored.get('/json', (req, res) => {
  db.json
    .all()
    .then((posts) => {
      res.render('stored/json', {
        posts,
      });
    })
    .catch((err) => res.json(err));
});
stored.post('/json', (req, res) => {
  db.json
    .create({
      data: req.body.data,
    })
    .then(() => db.json.all())
    .then((posts) => res.render('stored/json', {
      posts,
    }))
    .catch((err) => res.status(500).json(err));
}); 
stored.get('/script', (req, res) => {
  db.inscript
    .all()
    .then((posts) => {
      res.render('stored/inscript', {
        posts,
      });
    })
    .catch((err) => res.json(err));
});
stored.post('/script', (req, res) => {
  db.inscript
    .create({
      data: req.body.data,
    })
    .then(() => db.inscript.all())
    .then((posts) => res.render('stored/inscript', {
      posts,
    }))
    .catch((err) => res.status(500).json(err));
}); 



module.exports = stored;
