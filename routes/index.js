var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('employees', { title: 'Express' });
});

router.get('/main', function (req, res) {
  res.render('main', { title: 'Express' });
});

router.get('/restaurant', function (req, res) {
  res.render('restaurant', { title: 'Express' });
});

router.get('/employees', function (req, res) {
  res.render('employees', { title: 'Express' });
});

router.post('/ingredient', function (req, res) {
  console.log("View Ingredients");
  res.redirect('/employees');
});

router.post('/pay', function (req, res) {
  console.log("View Average Pay");
  res.redirect('/employees');
});

router.post('/expiry', function (req, res) {
  console.log("View Expiry Date of Ingredients");
  res.redirect('/employees');
});

router.post('/purchase', function (req, res) {
  console.log(req.body.name + " " + req.body.amount + "purchase");
  res.redirect('/employees');
});

router.post('/use', function (req, res) {
  console.log(req.body.name + " " + req.body.amount + "use");
  res.redirect('/employees');
});


router.post('/name', function (req, res) {
  console.log(req.body.name + " name ");
  res.redirect('/restaurant');
});

router.post('/type', function (req, res) {
  console.log(req.body.type + " type ");
  res.redirect('/restaurant');
});

router.post('/rating', function (req, res) {
  console.log(req.body.rating + " rating ");
  res.redirect('/restaurant');
});

router.post('/review', function (req, res) {
  console.log(req.body.review + " review ");
  res.redirect('/restaurant');
});

router.post('/allergy', function (req, res) {
  console.log(req.body.review + " allergy ");
  res.redirect('/restaurant');
});

router.post('/cuisine', function (req, res) {
  console.log(req.body.cuisine + " cuisine ");
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
