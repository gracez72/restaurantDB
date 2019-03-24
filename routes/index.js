var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/main', function (req, res) {
  res.render('main', { title: 'Express' });
});
router.post('/search', function (req, res) {
  console.log(req.body.search + " searched ");
  res.redirect('/main');
});


router.post('/login', function (req, res) {
  console.log(req.body.AccName+ " "+ req.body.Name +" " + req.body.password);
  res.redirect('/main');
});
router.post('/register', function (req, res) {
  console.log(req.body.AccName+ " "+ req.body.Name +" " + req.body.password);
  res.redirect('/main');
});
module.exports = router;
