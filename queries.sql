select username,count from test,u where test.userid = u.userid;

select * from restaurant where restaurantid = 1;

select to_char(reviewdate, 'YYYY-MM-DD') as reviewdate, reviewdescription, rating, customername from reviews where restaurantid = 1;

select dishid, dishname, price, to_char(availableuntil, 'YYYY-MM-DD') as availableuntil from dish where restaurantid = 1;

select * from images where restaurantid = 1;

create view newi as (select IU.dishid,count(*) from ingredientsused IU where IU.dishid in (select D.dishid from dish D where D.restaurantid= ${restaurantid} )group by IU.dishid);

(select d2.dishname, price, null as dishid , null as count, null as ingredientname, null as amountused, null as ingredientid from dish d2, restaurant r2 where d2.restaurantid = ${restaurantid} and d2.dishid not in (select dishid from ingredientsused)) union (select dish.dishname, dish.price, newi.*, i.ingredientname, iu.amountused, i.ingredientid from dish, newi, ingredientsused IU, ingredient i where newi.dishid=dish.dishid and iu.dishid=dish.dishid and i.ingredientid=iu.ingredientid) order by dishname;

drop view newi;
select i.ingredientid, ie.ingredientname, to_char( ie.dateproduced, 'DD/MM/YYYY') as dateproduced,  
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
      select userid from employee where restaurantid=$1)) order by expirydate des;

select e.*, r.restaurantname as restaurantname from employee e, restaurant r where e.userid = $1 and e.restaurantid = r.restaurantid;

select h.position, avg(h.hourlypay) as avg from hourlypay h where h.position = $1 group by h.position;

select * from customer where userid = $1;

select * from users where userid = $1;

select * from yearlyexpensereport where restaurantid=$1;

INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil) values($1,$2,$3,$4);

select * from dish where lower(dishname) like '%$1%' and restaurantid = $2;

update dish set price = $1,availableuntil = $2 where lower(dishname) like $3 and restaurantid = $4

select * from dish where lower(dishname) like '%$1%' and restaurantid = $2;

delete from dish where lower(dishname) like $1 and restaurantid = $2;

insert into ingredientexpireon values($1,$2,$3);

insert into ingredient(IngredientName, Amount, DateProduced) values($1,$2,$3);

select max(ingredientid) from ingredient;

insert into purchases (IngredientID, UserID, Amount, totalprice, PurchaseDate) values($1,$2,$3,$4, $5);

insert into ingredientsused (ingredientid, amountused, dishid) values($1, $2, (select dishid from dish where lower(dishname)=$3 and restaurantid=$4 limit 1));

delete from ingredientsused where ingredientid=$1 and dishid=(select dishid from dish where lower(dishname)=$2 and restaurantid=$3 limit 1);

update ingredientsused set ingredientid=$1, amountused=$2 where ingredientid=$3 and dishid=(select dishid from dish where lower(dishname)=$4 and restaurantid=$5 limit 1);

select * from restaurant where LOWER(restaurantname) like $1;

select * from restaurant where lower(restauranttype) like $1;

select * from restaurant order by rating desc limit 10;

insert into reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID) values(now(),$1,$2,$3,$4,$5);

create view rest_dish_ingr as (select r1.restaurantid, count(*) from restaurant r1, 
  dish d, ingredientsused iu, ingredient i where r1.restaurantid = d.restaurantid and d.dishid = iu.dishid 
  and iu.ingredientid = i.ingredientid and LOWER(i.ingredientname) like \'${allergy}\' group by r1.restaurantid 
  union select r2.restaurantid, 0 from restaurant r2 where r2.restaurantid not in (select r3.restaurantid from 
    restaurant r3, dish d, ingredientsused iu, ingredient i where r3.restaurantid = d.restaurantid and 
    d.dishid = iu.dishid and iu.ingredientid = i.ingredientid and LOWER(i.ingredientname) like \'${allergy}\';

select * from restaurant where restaurantid in (select restaurantid from rest_dish_ingr order by count limit 10);

update customer set preference = $1 where userid = $2;

select userid,accountname,userpassword from users where accountname = $1;

select userid from users where accountname= $1 and userid in (select userid from employee);

INSERT INTO Users (AccountName, UserName, UserPassword) VALUES ($1, $2, $3);

select userid from users where accountName=$1;

insert into customer (userid,numreviews) values ($1,0);

insert into images values($1,$2,$3);

