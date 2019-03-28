var express = require('express');
var router = express.Router();

const conString = "postgres://cs304:cs304Sucks!@aa1onyymqdx5d9z.ckro3kbffcpb.us-west-1.rds.amazonaws.com:5432/postgres";
var pg = require('pg');

var userid;
var username;
var restaurantid;
var userType;
var client = new pg.Client(conString);

//Conect to Postsql Database
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

/*Main Page after login/resgiter */
router.get('/main', function (req, res) {

  /*PROJECTION*/
  //Users who have written reviews for all restaurants are top users
  client.query("select * from topusers",
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


/*
* Render a List of Restaurants
* @param: Restaurant ID
* @param: Restaurant Type
* @param: Restaurant Address
* @param: Restaurant Description
* @param: Restaurant Ratings 
*/
router.get('/restlist', function (req, res) {
  var d= [
    { id: 1, name: "Rest 1", type: "estern", addr: "1234 rd", desc: "good", rating:4 },
    { id: 2, name: "Mcd", type: "fast", addr: "123333 rd", desc: "bad", rating: 3 },
    { id: 3, name: "ANW", type: "western", addr: "1444 rd", desc: "fair", rating: 2 }
  ];

  res.render('restlist', { data: d });
});

/*
* Render Specific Restaurant  
* @param: Restaurant ID
* @param: Restaurant Type
* @param: Restaurant Address
* @param: Restaurant Description
* @param: Restaurant Ratings 
* @param: Restaurant Dish
* @param: Restaurant Image
* @param: Restaurant Status
*/
router.get('/restaurant', function (req, res) {
  console.log("here " + req.query.rid);
  /*SELECTION*/
  client.query("select * from restaurant where restaurantid = $1", [req.query.rid],(err,result)=>{
    if(err) throw err;
    client.query("select to_char(reviewdate, 'YYYY-MM-DD') as reviewdate, reviewdescription, rating, customername from reviews where restaurantid = $1", [req.query.rid],(err2,result2)=>{
      if(err2) throw err2;
      client.query("select dishid, dishname, price, to_char(availableuntil, 'YYYY-MM-DD') as availableuntil from dish where restaurantid = $1",[req.query.rid],(err3,result3)=>{
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

//render employees pages who isn't chef 
router.get('/employees', function (req, res) {

  res.render('employees', { id: 2, position: 'chef', yearsexperience:2, avgsalary: 1000});
});

//render employees who is chef 
router.get('/chef', function (req, res) {

  res.render('chef', { id: 2, position: 'chef', yearsexperience: 2, avgsalary: 1000 });
});

/*
* Render Dish ingredients and All Ingredients for Employees
*
* Dish Ingredients:
* @param: Dish Name
* @param: Dish Price
* @param: Count of Ingredient Used
* @param: Ingredient Used Name  
* @param: Ingredient Used Amount 
*
* All Ingredients the restaurant have
* @param: Ingredient Name 
* @param: Ingredient ID 
* @param: Amount 
* @param: Date Produced
* @param: Date Expired
*/
router.get('/ingredient', function (req, res) {

  client.query(`create view newi as (select IU.dishid,count(*) from ingredientsused IU where IU.dishid in (select D.dishid from dish D where D.restaurantid= ${restaurantid} )group by IU.dishid)`,(err,result)=>{
    if(err) throw err;
    client.query(`(select d2.dishname, price, null as dishid , null as count, null as ingredientname, null as amountused, null as ingredientid from dish d2, restaurant r2 where d2.restaurantid = ${restaurantid} and d2.dishid not in (select dishid from ingredientsused)) union (select dish.dishname, dish.price, newi.*, i.ingredientname, iu.amountused, i.ingredientid from dish, newi, ingredientsused IU, ingredient i where newi.dishid=dish.dishid and iu.dishid=dish.dishid and i.ingredientid=iu.ingredientid) order by dishname`,(err2,result2)=>{
      if(err2) throw err2;
      client.query("drop view newi",(err3,result3)=>{
        if(err3) throw err3;
        console.log(result2.rows);
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
            ingredient:newsub,
            price: result2.rows[i-1].price
          }
          array.push(x);
          // console.log(newsub);
        }
        // console.log(array);
        /*JOIN QUERY*/
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

/*
* Render corresponding Profile page for employee or customer
*
* Employees
* @param: Restaurant Name 
* @param: Positiong
* @param: Average Salary of Restaurant
* @param: Years of Experiences
*
* Customer:
* @param: Preference
* @param: Number of Reviews they write 
* @param: User Name 
* @param: Account Name 
*/
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

        //check whether the employee is chef or not 
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

/*
* Generate Expense Report for Restaurant
* @param: Total Number of Employees
* @param: Total Employee Wages
* @param: Total Bonus Wages 
* @param: Total Ingredient Prices
*/
router.post('/report',function(req,res){
  client.query("select * from yearlyexpensereport where restaurantid=$1", [restaurantid],
  (error,result)=>{
      if(error) throw error;
      console.log(result.rows[0]);
      res.render('report', {data: result.rows[0]});
    }) 
});

/*
* Chef Adds Dish 
* @param: Dish Name 
* @param: Dish Price 
* @param: Available Date 
*/
router.post('/adddish', function (req, res) {
  var d = new Date(req.body.avail);

  console.log("add new dish" + " " + req.body.dish + " " + req.body.price + " " + req.body.avail);
  /*INSERT OPERATION*/
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

/*
* Chef Updates Dish 
* @param: Dish Name 
* @param: Dish Price 
* @param: Available Date 
*/
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
      else {
        /*UPDATE OPERATION*/
        client.query("update dish set price = $1,availableuntil = $2 where lower(dishname) like $3 and restaurantid = $4",
          [req.body.price, d, req.body.dish.toLowerCase(), restaurantid], (error, result) => {
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

/*
* Chef Deletes Dish 
* @param: Dish Name 
*/
router.post('/deletedish', function (req, res) {
  console.log("delete dish" + req.body.dish);
  var name = '%' + req.body.dish.toLowerCase() + '%';
  
  client.query("select * from dish where lower(dishname) like '%$1%' and restaurantid = $2",
    [name.toLowerCase(), restaurantid], (result1, error1) => {
      if (error1) {
        console.log(error1);
        res.render('disherr', { msg: "Dish isn't exist." });
      }
      else {
        /*DELETE OPERATION*/
        client.query("delete from dish where lower(dishname) like $1 and restaurantid = $2",
          [req.body.dish.toLowerCase(), restaurantid], (error, result) => {
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

/*
* Employees View Expiry Date of Ingredients
* @param: Ingredient Name 
* @param: Ingredient ID 
* @param: Amount 
* @param: Date Produced
* @param: Date Expired
*/
router.get('/expiry', function (req, res) {
    console.log("View Expiry Date of Ingredients");
    /*JOIN QUERY*/
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


/*
* Employees Update Ingredient Purchased
* @param: Ingredient  Name 
* @param: Amount
* @param: Expiry Date
* @param: Price
*/ 
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
            /*Aggregate Operation*/
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

/*
* Employee Updates Ingredient Used 
* @param: Dish Name 
* @param: Ingredient ID Before
* @param: Ingredient ID After
* @param: Used Amount
*/
router.post('/use', function (req, res) {
  console.log(req.body.before + " " + req.body.amount + req.body.dish +"use");
  if(req.body.before == '-1'){
    /*Insert OPeration*/
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

//Users Search Restaurant by Name 
router.post('/name', function (req, res) {
  client.query("select * from restaurant where LOWER(restaurantname) like $1",['%'+req.body.name.toLowerCase()+'%'],(err,result)=>{
    if(err) throw err;
    else {
      console.log(result.rows)
      res.status(200).render("restlist",{data:result.rows});
    }
  })
});


//Users Search Restaurant by Type 
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

//Users Search Restaurant By Rating 
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

/*
* Users Writes Reviews for Specific Restaurant
* @param: Name 
* @param: Rating 
* @param: Review Description
*/
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

//Users Search Restuarant Based on Allergy 
router.post('/allergy', function (req, res) {
  //req.body.allergy
  var allergy = req.body.allergy.toLowerCase();
  console.log(allergy);

  /*NESTED AGGREGATION WITH GROUP BY*/
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

//Customers Update Preferred Cuisine 
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

/*
* Login page 
* @param: Account Name 
* @param: Password 
*/
router.post('/login', function (req, res) {
  client.query("select userid,accountname,userpassword from users where accountname = $1",[req.body.AccName], (error, results) =>{
    if(error) {
      res.render('loginerr',{msg:'User does not exist'});

    }
    //account does not exists
    else if(results.rows.length === 0){
      res.render('loginerr',{msg:'Account Does Not Exist'})
      res.status(401);
    }
    //password incorrect 
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
        else if(results.rows.length === 1)
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

/*
* Register page 
* @param: Account Name 
* @param: User Name 
* @param: Password 
*/ 
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

/*
* Users Insert Image to Restaurant
* @param: Tage 
* @param: Image URL
*/
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
