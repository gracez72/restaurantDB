var express = require('express');
var router = express.Router();

const conString = "postgres://cs304:cs304Sucks!@aa1onyymqdx5d9z.ckro3kbffcpb.us-west-1.rds.amazonaws.com:5432/postgres";
var pg = require('pg');

var userid;
var userType;
var client = new pg.Client(conString);
client.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }

  console.log('Connected to database.');
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/main', function (req, res) {
  res.render('main', { title: 'Express' });
});

router.get('/restlist', function (req, res) {
  var d= [
    { id: 1, name: "Rest 1", type: "estern", addr: "1234 rd", desc: "good", rating:4 },
    { id: 2, name: "Mcd", type: "fast", addr: "123333 rd", desc: "bad", rating: 3 },
    { id: 3, name: "ANW", type: "western", addr: "1444 rd", desc: "fair", rating: 2 }
  ];

  res.render('restlist', { data: d });
});


router.get('/restaurant', function (req, res) {
  console.log("here " + req.query.rid);
  client.query("select * from restaurant where restaurantid = $1", [req.query.rid],(err,result)=>{
    if(err) throw err;
    client.query("select * from reviews where restaurantid = $1", [req.query.rid],(err2,result2)=>{
      if(err2) throw err2;
      client.query("select * from dish where restaurantid = $1",[req.query.rid],(err3,result3)=>{
        if(err3) throw err3;
        res.render('restaurant',{
          name:result.rows[0].restaurantname,
          type:result.rows[0].restauranttype,
          addr:result.rows[0].restaurantaddress,
          desc:result.rows[0].restaurantdescription,
          rating:result.rows[0].rating,
          review:result2.rows,
          dish:result3.rows,
        })
      })
    })
  })
});

router.get('/employees', function (req, res) {

  res.render('employees', { id: 2, position: 'chef', yearsexperience:2, avgsalary: 1000});
});

router.get('/ingredient', function (req, res) {
  d=[
    {dishname: 'Fries', ingredient:[{ingredientname: 'potato', amount: 100}]},
    {dishname: 'Coke', ingredient:[{ingredientname: 'potato', amount: 100}, {ingredientname: 'potato', amount: 100}]},
  ];
  res.render('ingredient', {dish: d});
});

router.post('/pay', function (req, res) {
  console.log("View Average Pay");
  res.redirect('/employees');
});

router.get('/profile', function (req, res) {
  if(userType == 'employee'){
    client.query("select e.*, r.restaurantname as restaurantname from employee e, restaurant r where e.userid = $1 and e.restaurantid = r.restaurantid ",[userid],(err,result)=>{
      if(err) throw err;
      client.query("select h.position, avg(h.hourlypay) as avg from hourlypay h where h.position = $1 group by h.position",[result.rows[0].position],
      (err2,result2)=>{
        if(err2) throw err2;
        console.log(result.rows[0])
        console.log(result2.rows[0])

        res.render('employees', {
          restaurantname: result.rows[0].restaurantname,
          position: result.rows[0].position,
          avgsalary: Math.round(result2.rows[0].avg),
          yearsexperience: result.rows[0].yearsexperience,
        })
      })
    })
  }
  else{
    client.query("select * from customer where userid = $1",[userid],(err,result)=>{
      if(err) throw err;
      console.log(result.rows[0]);
      client.query("select * from users where userid = $1",[userid],
      (err2,result2)=>{
        if(err2) throw err2;
        res.render('customer', {
          preference: result.rows[0].preference,
          numreviews: result.rows[0].numreviews,
          username: result2.rows[0].username,
          accountname:result2.rows[0].accountname,
        })
      })
    })
  }
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
  client.query("select * from restaurant where restaurantname like $1",['%'+req.body.name+'%'],(err,result)=>{
    if(err) throw err;
    else {
      console.log(result.rows)
      res.status(200).render("restlist",{data:result.rows});
    }
  })
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
  client.query("update customer set preference = $1 where userid = $2",
    [req.body.cuisine,userid],(error,results)=>{
      if(error){
        console.log("error");
      }
    }
  );
  res.redirect('/main');
});


router.post('/login', function (req, res) {
  client.query("select userid,userpassword from users where accountname = $1",[req.body.AccName], (error, results) =>{
    if(error) {
      res.render('loginError',{msg:'User does not exist'});

    }
    else if(results.rows[0].userpassword !=req.body.password){
      console.log("password incorrect");
      res.render('loginError',{msg:'password incorrect'})
      res.status(401);
    }
    else //"password matches"
    {
      userid = results.rows[0].userid;
      client.query("select userid from users where accountname= $1 and userid in (select userid from employee)",[req.body.AccName],
      (error, results) =>{
        if(error) throw error;
        else if(results.rows.length == 1)
        {
          //this is a employee
          userType = 'employee';
          res.status(200).redirect("/main");

        }
        else //user
        {
          userType = 'user';
          res.status(200).redirect("/main");
          
        }
      })
    }
  })
});

router.post('/register', function (req, res) {
  client.query("INSERT INTO Users (AccountName, UserName, UserPassword) VALUES ($1, $2, $3)",
    [req.body.AccName,req.body.Name,req.body.password],(error,results)=>{
      if(error) {
        res.render('loginError',{msg:'Sorry, this account name already exists, try another one'})
      }
      else{
        client.query("select userid from users where accountName=$1",[req.body.AccName],(error2,result2)=>{
          if(error2) throw error2;
          else{
            client.query("insert into customer (userid,numreviews) values ($1,0)",[result2.rows[0].userid],
            (error3,results3)=>{
              userid = result2.rows[0].userid;
              if(error3) throw error3;
              else{
                userType = 'user';
                res.status(200).redirect("/main");
              }
            })
          }
        });
      }
    }
  );
});
module.exports = router;
