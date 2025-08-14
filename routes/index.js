var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('home', { title: 'Inicio' });
});

router.get('/acerca', function(req, res) {
  res.render('acerca', { title: 'Acerca' });
});

module.exports = router;
