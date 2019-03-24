var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/search', function (req, res) {
  console.log(req.body.search + " searched ");
  res.redirect('/');
});

module.exports = router;
