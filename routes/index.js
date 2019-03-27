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

  // client.query("select * from users u where not exists ((select r.restaurantid from restaurant r) except (select re.restaurantid from reviews re where re.userid = u.userid))",
  client.query("select username,count from test,u where test.userid = u.userid",
  [],(error,result)=>{
    if(error) console.log(error);
    else{
      res.render('main', { user: result.rows });
    }
  })
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
        client.query("select * from images where restaurantid = $1", [req.query.rid],(err4,result4)=>{
          if(err4) throw err4;
          res.render('restaurant',{
            rid: req.query.rid,
            name:result.rows[0].restaurantname,
            type:result.rows[0].restauranttype,
            addr:result.rows[0].restaurantaddress,
            desc:result.rows[0].restaurantdescription,
            rating:result.rows[0].rating,
            review:result2.rows,
            dish:result3.rows,
            image:result4.rows,
            status: req.query.status,
          })
        })
      })
    })
  })
});

router.get('/employees', function (req, res) {

  res.render('employees', { id: 2, position: 'chef', yearsexperience:2, avgsalary: 1000});
});

router.get('/chef', function (req, res) {

  res.render('chef', { id: 2, position: 'chef', yearsexperience: 2, avgsalary: 1000 });
});

router.get('/ingredient', function (req, res) {

  client.query(`create view newi as (select IU.dishid,count(*) from ingredientsused IU where IU.dishid in (select D.dishid from dish D where D.restaurantid= ${restaurantid} )group by IU.dishid)`,(err,result)=>{
    if(err) throw err;
    client.query(`(select d2.dishname, price, null as dishid , null as count, null as ingredientname, null as amountused, null as ingredientid from dish d2, restaurant r2 where d2.restaurantid = ${restaurantid} and d2.dishid not in (select dishid from ingredientsused)) union (select dish.dishname, dish.price, newi.*, i.ingredientname, iu.amountused, i.ingredientid from dish, newi, ingredientsused IU, ingredient i where newi.dishid=dish.dishid and iu.dishid=dish.dishid and i.ingredientid=iu.ingredientid) order by dishname`,(err2,result2)=>{
      if(err2) throw err2;
      client.query("drop view newi",(err3,result3)=>{
        if(err3) throw err3;
        // console.log(result2.rows);
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
                count: result2.rows[i-1].count,
                ingredient:newsub,
                price: result2.rows[i-1].price
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
          // console.log(newsub);
        }
        // console.log(array);
        client.query(`select i.ingredientid, ie.ingredientname, to_char( ie.dateproduced, 'DD/MM/YYYY') as dateproduced,  
        to_char( ie.expirydate, 'YYYY-MM-DD') as expirydate, i.amount from 
        ingredientexpireon ie, ingredient i where (ie.ingredientname, ie.dateproduced, i.ingredientid) in 
        (select i.ingredientname, i.dateproduced, i.ingredientid from ingredient i where i.ingredientid in 
          (Select iu.ingredientid from dish d, ingredientsused iu where d.restaurantid=$1 and iu.dishid=d.dishid 
          group by iu.ingredientid))
      union select distinct i2.ingredientid, ie2.ingredientname, to_char( ie2.dateproduced, 'DD/MM/YYYY') as dateproduced, 
      to_char( ie2.expirydate, 'YYYY-MM-DD') as expirydate, i2.amount from ingredientexpireon ie2, ingredient i2,
      purchases p 
      where i2.dateproduced=ie2.dateproduced and i2.ingredientname=ie2.ingredientname and i2.ingredientid in 
      (select p.ingredientid from purchases p where p.userid in (
      select userid from employee where restaurantid=$1)) order by expirydate desc`,
        [restaurantid],(err,result)=>{
            if(err){
              throw err;
            }
            else{
              res.render('ingredient', {dish: array, data:result.rows});
            }
        });        
      })
        // res.render('ingredient', {dish: array});
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
        // console.log(result.rows[0])
        // console.log(result2.rows[0])
        var string = result.rows[0].position;

        if (string.indexOf("Chef") != -1 || string.indexOf("chef") != -1) {
          res.render('chef', {
            restaurantname: result.rows[0].restaurantname,
            position: result.rows[0].position,
            avgsalary: Math.round(result2.rows[0].avg),
            yearsexperience: result.rows[0].yearsexperience,
          })
        }
        else {
          res.render('employees', {
            restaurantname: result.rows[0].restaurantname,
            position: result.rows[0].position,
            avgsalary: Math.round(result2.rows[0].avg),
            yearsexperience: result.rows[0].yearsexperience,
          })
        }
      })
    })
  }
  else{
    client.query("select * from customer where userid = $1",[userid],(err,result)=>{
      if(err) throw err;
      // console.log(result.rows[0]);
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
  client.query("select * from yearlyexpensereport",
  (error,result)=>{
      if(error) throw error;
      console.log(result.rows[0]);
      res.render('report', {data: result.rows[0]});
    }) 
});

router.post('/adddish', function (req, res) {
  var d = new Date(req.body.avail);

  console.log("add new dish" + " " + req.body.dish + " " + req.body.price + " " + req.body.avail);
  client.query("INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil) values($1,$2,$3,$4)",
    [restaurantid, req.body.dish, req.body.price, d], (error, result) => {
      if (error) {
        console.log(error)
      }
      else {
        res.redirect('/profile');
      }
    })
});

router.post('/updatedish', function (req, res) {
  var d = new Date(req.body.avail);
  console.log("update dish " + req.body.dish + " " + req.body.price + " " + req.body.avail);

  var name = '%' + req.body.dish.toLowerCase() + '%';

  client.query("select * from dish where lower(dishname) like '%$1%' and restaurantid = $2",
    [name, restaurantid], (result1, error1) => {
      if (error1) {
        console.log(error1);
        res.render('disherr', { msg: "Dish isn't exist." });
      }
      // else if (result1.rows.length === 0) {
      //   res.render('disherr', { msg: "Dish isn't exist." });
      // }
      else {
        client.query("update dish set price = $1,availableuntil = $2 where dishname = $3 and restaurantid = $4",
          [req.body.price, d, req.body.dish, restaurantid], (error, result) => {
            if (error) {
              console.log(error)
              res.render('disherr', { msg: "Dish isn't exist." });
              res.status(401);
            }
            else {
              res.redirect('/profile');
            }
          })
      }
    })
});

router.post('/deletedish', function (req, res) {
  console.log("delete dish" + req.body.dish);
  var name = '%' + req.body.dish.toLowerCase() + '%';
  
  client.query("select * from dish where lower(dishname) like '%$1%' and restaurantid = $2",
    [name.toLowerCase(), restaurantid], (result1, error1) => {
      if (error1) {
        console.log(error1);
        res.render('disherr', { msg: "Dish isn't exist." });
      }
      // else if (result1.rows.length() === 0) {
      //   res.render('disherr', { msg: "Dish isn't exist." });
      // }
      else {
        client.query("delete from dish where lower(dishname) like $1 and restaurantid = $2",
          [req.body.dish, restaurantid], (error, result) => {
            if (error) {
              console.log(error)
              res.render('disherr', { msg: "Dish isn't exist." });
              res.status(401);
            }
            else {
              res.redirect('/profile');
            }
          })
      }
    });
});

router.get('/expiry', function (req, res) {
    console.log("View Expiry Date of Ingredients");
  client.query(`select i.ingredientid, ie.ingredientname, to_char( ie.dateproduced, 'DD/MM/YYYY') as dateproduced,  
  to_char( ie.expirydate, 'YYYY-MM-DD') as expirydate, i.amount from 
  ingredientexpireon ie, ingredient i where (ie.ingredientname, ie.dateproduced, i.ingredientid) in 
  (select i.ingredientname, i.dateproduced, i.ingredientid from ingredient i where i.ingredientid in 
    (Select iu.ingredientid from dish d, ingredientsused iu where d.restaurantid=$1 and iu.dishid=d.dishid 
    group by iu.ingredientid))
union select distinct i2.ingredientid, ie2.ingredientname, to_char( ie2.dateproduced, 'DD/MM/YYYY') as dateproduced, 
to_char( ie2.expirydate, 'YYYY-MM-DD') as expirydate, i2.amount from ingredientexpireon ie2, ingredient i2,
purchases p 
where i2.dateproduced=ie2.dateproduced and i2.ingredientname=ie2.ingredientname and i2.ingredientid in 
(select p.ingredientid from purchases p where p.userid in (
select userid from employee where restaurantid=$1)) order by expirydate desc`,
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


});


router.post('/purchase', function (req, res) {
  console.log(req.body.name + " " + req.body.amount + req.body.expire + "purchase");
  var expireDate = new Date(req.body.expire);
  var d = new Date();

  client.query("insert into ingredientexpireon values($1,$2,$3)",
    [req.body.name, expireDate, d], (error3, result3) => {

      client.query("insert into ingredient(IngredientName, Amount, DateProduced) values($1,$2,$3)",
        [req.body.name, req.body.amount, d], (error, result) => {
          if (error) throw error;
          else {
            client.query("select max(ingredientid) from ingredient",
              (error1, result1) => {
                if (error1) throw error1;
                else {
                  var id = result1.rows[0].max;
                  console.log(id + " " + userid);
                  client.query("insert into purchases (IngredientID, UserID, Amount, totalprice, PurchaseDate) values($1,$2,$3,$4, $5)",
                    [id, userid, req.body.amount, req.body.price, d], (error2, result2) => {
                      if (error2) throw error2;
                      res.redirect('/profile');
                    })
                }
              })
          }
        })
    })
});

router.post('/use', function (req, res) {
  console.log(req.body.before + " " + req.body.amount + req.body.dish +"use");
  if(req.body.before == '-1'){
    client.query("insert into ingredientsused (ingredientid, amountused, dishid) values($1, $2, (select dishid from dish where lower(dishname)=$3 and restaurantid=$4 limit 1))",
    [req.body.after, req.body.amount, req.body.dish.toLowerCase(), restaurantid],(error,result)=>{
      if(error) throw error;
      else{
        res.redirect('/ingredient');
      }
    })
  } else if(req.body.after == '-1'){
    client.query("delete from ingredientsused where ingredientid=$1 and dishid=(select dishid from dish where lower(dishname)=$2 and restaurantid=$3 limit 1)",
    [req.body.before, req.body.dish.toLowerCase(), restaurantid],(error,result)=>{
      if(error) throw error;
      else{
        res.redirect('/ingredient');
      }
    })
  } else {
    client.query("update ingredientsused set ingredientid=$1, amountused=$2 where ingredientid=$3 and dishid=(select dishid from dish where lower(dishname)=$4 and restaurantid=$5 limit 1)",
      [req.body.after, req.body.amount, req.body.before, req.body.dish.toLowerCase(), restaurantid],(error,result)=>{
          res.redirect('/ingredient');
      })
  }
});


router.post('/name', function (req, res) {
  client.query("select * from restaurant where LOWER(restaurantname) like $1",['%'+req.body.name.toLowerCase()+'%'],(err,result)=>{
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
  console.log(req.body.review + req.body.rating + "  "+ req.query.rid);

  client.query("insert into reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID) values(now(),$1,$2,$3,$4,$5)",
  [req.body.review,req.body.rating,req.body.name,req.query.rid,userid]
  ,(error,result)=>{
      if(error)  throw error;
      else {
        console.log(result.rows);
        res.redirect('/restaurant?rid='+req.query.rid);
      }
  });
});

router.post('/allergy', function (req, res) {
  //req.body.allergy
  var allergy = req.body.allergy.toLowerCase();
  console.log(allergy);
  client.query(`create view rest_dish_ingr as (select r1.restaurantid, count(*) from restaurant r1, 
  dish d, ingredientsused iu, ingredient i where r1.restaurantid = d.restaurantid and d.dishid = iu.dishid 
  and iu.ingredientid = i.ingredientid and LOWER(i.ingredientname) like \'${allergy}\' group by r1.restaurantid 
  union select r2.restaurantid, 0 from restaurant r2 where r2.restaurantid not in (select r3.restaurantid from 
    restaurant r3, dish d, ingredientsused iu, ingredient i where r3.restaurantid = d.restaurantid and 
    d.dishid = iu.dishid and iu.ingredientid = i.ingredientid and LOWER(i.ingredientname) like \'${allergy}\'))`,
    (err,result)=>{
    if (err) throw err;
    client.query("select * from restaurant where restaurantid in (select restaurantid from rest_dish_ingr order by count limit 10)",(err2,result2)=>{
      if(err2) throw err2;
      client.query("drop view rest_dish_ingr",(err3,result3)=>{
        if(err3) throw err3;
        res.render('restlist',{data:result2.rows})
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
  res.redirect('/profile');
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
        res.render('loginerr',{msg:'Sorry, this account name already exists, try another one'})
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


router.post('/image', function (req, res) {
  console.log(req.query.rid);
  client.query(`insert into images values($1,$2,$3)`, [req.query.rid, req.body.tag, req.body.url]
    ,(err,result)=>{
    if (err) {
      res.redirect('/restaurant?status=-1&rid='+req.query.rid);
    }
    else res.redirect('/restaurant?rid='+req.query.rid);
  })
});

module.exports = router;
