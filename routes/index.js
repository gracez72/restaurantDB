var express = require('express');
var router = express.Router();

const conString = "postgres://cs304:cs304Sucks!@aa1onyymqdx5d9z.ckro3kbffcpb.us-west-1.rds.amazonaws.com:5432/postgres";
var pg = require('pg');

var userid;
var username;
var restaurantid;
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

router.get('/ingredientExpiry', function (req, res) {
  res.render('ingredientExpiry', { title: 'Express' });
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

  client.query(`create view new as (select IU.dishid,count(*) from ingredientsused IU where IU.dishid in (select D.dishid from dish D where D.restaurantid= ${restaurantid} )group by IU.dishid)`,(err,result)=>{
    if(err) throw err;
    client.query("select dish.dishname, new.*, i.ingredientname, iu.amountused, i.ingredientid from dish, new, ingredientsused IU, ingredient i where new.dishid=dish.dishid and iu.dishid=dish.dishid and i.ingredientid=iu.ingredientid",(err2,result2)=>{
      if(err2) throw err2;

      client.query("drop view new", (err3,result3)=>{
        if(err3) throw err3;
        if(result2.rows.length === 0){

        }
        else{
          var temp = result2.rows[0].dishname;
          var array = [];
          var sub = {};
          var newsub = [];
          var i;
          for(i = 0; i < result2.rows.length; i++){
            if(result2.rows[i].dishname != temp){
              var x = {
                dishname:temp,
                count: result2.rows[i].count,
                ingredient:newsub,
              }
              array.push(x);
              newsub = [{ingredientname:result2.rows[i].ingredientname,amount:result2.rows[i].amountused, ingredientid:result2.rows[i].ingredientid}];
              temp = result2.rows[i].dishname;
            }
            else{
              sub = {ingredientname:result2.rows[i].ingredientname,amount:result2.rows[i].amountused,  ingredientid:result2.rows[i].ingredientid};
              newsub.push(sub);
            }
          }

          var x = {
            dishname:temp,
            count: result2.rows[i-1].count,
            ingredient:newsub
          }
          array.push(x);
          console.log(newsub);
        }
        console.log(array);
        client.query("select i.ingredientid, ie.ingredientname, ie.dateproduced, ie.expirydate, i.amount from ingredientexpireon ie, ingredient i where (ie.ingredientname, ie.dateproduced, i.ingredientid) in (select i.ingredientname, i.dateproduced, i.ingredientid from ingredient i where i.ingredientid in (Select iu.ingredientid from dish d, ingredientsused iu where d.restaurantid=$1 and iu.dishid=d.dishid group by iu.ingredientid))",
        [restaurantid],(err,result)=>{
            if(err){
              throw err;
            }
            else{
              res.render('ingredient', {dish: array, data:result.rows});
              // res.render('ingredientExpiry',{
              //   data: result.rows
              // })
            }
        });
        // res.render('ingredient', {dish: array});
      })
    })
  });
});


router.get('/profile', function (req, res) {
  if(userType == 'employee'){
    client.query("select e.*, r.restaurantname as restaurantname from employee e, restaurant r where e.userid = $1 and e.restaurantid = r.restaurantid",[userid],(err,result)=>{
      if(err) throw err;
      client.query("select h.position, avg(h.hourlypay) as avg from hourlypay h where h.position = $1 group by h.position",[result.rows[0].position],
      (err2,result2)=>{
        if(err2) throw err2;
        restaurantid = result.rows[0].restaurantid;
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

router.post('/report',function(req,res){
  
});

router.post('/Back',function(req,res){
  res.redirect('/employee');
});

router.post('/add',function(req,res){
  var d = new Date(req.body.avail);
  
  console.log("add new dish" + req.body.dish + " " +  req.body.price + " "  + req.body.avail);
  client.query("INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil) values($1,$2,$3,$4)",
    [restaurantid,req.body.dish,req.body.price,d],(error,result)=>{
      if(error){
        console.log(error)
      }
      else{
        res.redirect('/employee');
      }
    })  
});

router.post('/update',function(req,res){
  var d = new Date(req.body.avail);

  console.log("update dish" + req.body.dish + " " +  req.body.price + " "  + req.body.avail);
  
  client.query("update dish set price = $1,availableuntil = $2 where dishname = $3 and restaurantid = $4",
    [req.body.price,d,req.body.dish,restaurantid],(error,result)=>{
      if(error){
        console.log(error)
        res.render('/disherr',{msg: "Dish isn't exist."});
        res.status(401);
      }
      else{
        res.redirect('/employee')
      }
    })
});

router.post('/delete',function(req,res){
  console.log("delete dish" + req.body.dish + " " +  req.body.price + " "  + req.body.avail);
  
  client.query("delete from dish where dishname = $1 and restaurantid = $2",
  [req.body.dish,restaurantid],(error,result)=>{
    if(error){
      console.log(error)
      res.render('/disherr',{msg: "Dish isn't exist."});
      res.status(401);
    }
    else{
      res.redirect('/employee');
    }
  })
});

router.get('/expiry', function (req, res) {
    console.log("View Expiry Date of Ingredients");
  client.query("select ie.ingredientname, ie.dateproduced, ie.expirydate, i.amount from ingredientexpireon ie, ingredient i where (ie.ingredientname, ie.dateproduced, i.ingredientid) in (select i.ingredientname, i.dateproduced, i.ingredientid from ingredient i where i.ingredientid in (Select iu.ingredientid from dish d, ingredientsused iu where d.restaurantid=$1 and iu.dishid=d.dishid group by iu.ingredientid))",
  [restaurantid],(err,result)=>{
      if(err){
        throw err;
      }
      else{
        res.render('ingredientExpiry',{
          data: result.rows
        })
      }
  });

  // var d=[
  //   {ingredientname: "potato", amount: 100, expirydate: '2017-2-2'},
  //   {ingredientname: "potato", amount: 100, expirydate: '2017-2-2'},
  // ];

  // res.render('ingredientExpiry', {data: d});
});

router.post('/purchase', function (req, res) {
  console.log(req.body.name + " " + req.body.amount + req.body.expire +"purchase");
  var expireDate = new Date(req.body.expire);
  var d = new Date();

  client.query("insert into ingredientexpireon values($1,$2,$3)",
    [req.body.name,expireDate,d],(error3,result3)=>{
      if(error3) throw error3;

      client.query("insert into ingredient(IngredientName, Amount, DateProduced) values($1,$2,$3)",
      [req.body.name,req.body.amount,d],(error,result)=>{
        if(error) throw error;
        else{
          client.query("select max(ingredientid) from ingredient",
            [],(error1,result1)=>{
              if(error1) throw error1;
              else{
                var id = result1.rows[0].ingredientid;
                client.query("insert into purchases (IngredientID, UserID, Amount, totalprice, PurchaseDate) values($1,$2,$3,$4, $5)",
                  [id,userid,req.body.amount,req.body.price,d],(error2,result2)=>{
                    if(error2) throw error2;
                })
              }
          })
        }
    })
  })
  res.redirect('/profile');
});


router.post('/use', function (req, res) {
  console.log(req.body.ingredient + " " + req.body.amount + req.body.dish +"use");
  client.query("update ingredientsused set ingredientid=$1, amountused=$2 where ingredientid=$3 and dishid=(select dishid from dish where dishname=$4 and restaurantid=$5 limit 1)",
    [req.body.after, req.body.amount, req.body.before, req.body.dish, restaurantid],(error,result)=>{
      if(error) throw error;
      else{
        res.redirect('/ingredient');
      }
    })
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
  client.query("select * from restaurant where lower(restauranttype) like $1",
    ['%' + req.body.type.toLowerCase() + '%'],(error,result)=>{
      if(error)  throw error;
      else {
        console.log(result.rows)
        res.status(200).render("restlist",{data:result.rows});
      }
  });
});

router.post('/rating', function (req, res) {
  console.log(req.body.rating + " rating ");
  client.query("select * from restaurant order by rating desc limit 10"
  ,(error,result)=>{
      if(error)  throw error;
      else {
        console.log(result.rows)
        res.status(200).render("restlist",{data:result.rows});
      }
  });
});

router.post('/review', function (req, res) {
  console.log(req.body.review + req.body.rating + " review ");
  var d = new Date();

  client.query("insert into reviews(ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID) values($1,$2,$3,$4,$5,$6)",
  [d,req.body.review,req.body.rating,username,restaurantid,userid]
  ,(error,result)=>{
      if(error)  throw error;
      else {
        console.log(result.rows);
      }
  });
});

router.post('/allergy', function (req, res) {
  //req.body.allergy
  var allergy = req.body.allergy.toLowerCase();
  console.log(allergy);
  client.query(`create view rest_dish_ingr as (select r1.restaurantid, count(*) from restaurant r1, dish d, ingredientsused iu, ingredient i where r1.restaurantid = d.restaurantid and d.dishid = iu.dishid and iu.ingredientid = i.ingredientid and LOWER(i.ingredientname) like ${allergy} group by r1.restaurantid union select r2.restaurantid, 0 from restaurant r2 where r2.restaurantid not in (select r3.restaurantid from restaurant r3, dish d, ingredientsused iu, ingredient i where r3.restaurantid = d.restaurantid and d.dishid = iu.dishid and iu.ingredientid = i.ingredientid and LOWER(i.ingredientname) like ${allergy}))`,(err,result)=>{
    if (err) throw err;
    client.query("select * from restaurant where restaurantid in (select restaurantid from rest_dish_ingr order by count limit 10)",(err2,result2)=>{
      if(err2) throw err2;
      client.query("drop view rest_dish_ingr",(err3,result3)=>{
        if(err3) throw err3;
        res.render('restlist',result2.rows)
      })
    })
  })
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
  client.query("select userid,accountname,userpassword from users where accountname = $1",[req.body.AccName], (error, results) =>{
    if(error) {
      res.render('loginerr',{msg:'User does not exist'});

    }
    else if(results.rows.length === 0){
      res.render('loginerr',{msg:'Account Does Not Exist'})
      res.status(401);
    }
    else if(results.rows[0].userpassword !=req.body.password){
      console.log("password incorrect");
      res.render('loginerr',{msg:'password incorrect'})
      res.status(401);
    }
    else //"password matches"
    {
      userid = results.rows[0].userid;
      username = results.rows[0].accountname;
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
              username = req.body.AccName;
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
