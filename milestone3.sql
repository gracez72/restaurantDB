CREATE TABLE Users (
	UserID serial, 
	AccountName varchar(255) UNIQUE NOT NULL,
	UserName varchar(255) DEFAULT 'Anonymous',
	UserPassword varchar(16) NOT NULL,
	PRIMARY KEY(UserID)
);

-- Replace invalid UserNames
CREATE OR REPLACE FUNCTION clean_userName()
  RETURNS trigger AS
$$
BEGIN
	NEW.UserName = LTRIM(NEW.UserName);
	RETURN NEW;
END;

$$
LANGUAGE 'plpgsql';

CREATE TRIGGER check_User
  AFTER INSERT
  ON Users
  FOR EACH ROW
  EXECUTE PROCEDURE clean_userName();

INSERT INTO Users (AccountName, UserName, UserPassword) VALUES ('Dianna', 'Dianna', 'hi');
INSERT INTO Users (AccountName, UserName, UserPassword) VALUES ('Alice', 'Alice', 'password');
INSERT INTO Users  (AccountName, UserName, UserPassword) VALUES ('Bob', 'Bob', 'password');
INSERT INTO Users  (AccountName, UserName, UserPassword) VALUES ('carol', 'Carol', 'password5');
INSERT INTO Users  (AccountName, UserName, UserPassword) VALUES ('ethan', 'Ethan', 'passwords');
INSERT INTO Users (AccountName, UserName, UserPassword) VALUES ('fred', 'Fred', 'strongpassword');
INSERT INTO Users (AccountName, UserName, UserPassword) VALUES ('gargantuan', 'Gargantuan', 'passwords');

CREATE TABLE Restaurant (
	RestaurantID serial PRIMARY KEY,
	RestaurantType varchar(20),
	RestaurantDescription varchar(255),
	RestaurantAddress varchar(255) NOT NULL UNIQUE,
	rating int DEFAULT 0,
	RestaurantName varchar(40)
);

INSERT INTO Restaurant (RestaurantType,RestaurantDescription, RestaurantAddress, RestaurantName) VALUES ('Korean', 'good food', '1234 BBQ Street', 'BBQueue Up');
INSERT INTO Restaurant (RestaurantType,RestaurantDescription, RestaurantAddress, RestaurantName) VALUES ('Australia', 'kangaroo', '1234 Kangaroo Street', 'The Kangaroo Chef');
INSERT INTO Restaurant (RestaurantType,RestaurantDescription, RestaurantAddress, RestaurantName) VALUES ('Chinese', 'good food', '1234 Wok Street', 'Wok You Looking At');
INSERT INTO Restaurant (RestaurantType,RestaurantDescription, RestaurantAddress, RestaurantName) VALUES ('Western', 'good food', '1234 Wild West Street', 'Old Saloon');
INSERT INTO Restaurant (RestaurantType,RestaurantDescription, RestaurantAddress, RestaurantName) VALUES ('Fusion', 'good food', '1234 Lemonade Street', 'Just Lemonade');


CREATE TABLE YearlyExpenseReport (
	TotalEmployeeWages float DEFAULT 0.0,
	TotalIngredientPrices float DEFAULT 0.0,
	TotalEmployees int DEFAULT 0,
	TotalBonusWages float DEFAULT 0.0,
	RestaurantID int PRIMARY KEY,
	FOREIGN KEY(RestaurantID) REFERENCES Restaurant ON DELETE CASCADE
);


INSERT INTO YearlyExpenseReport(RestaurantID) VALUES (1);
INSERT INTO YearlyExpenseReport(RestaurantID) VALUES (2);
INSERT INTO YearlyExpenseReport(RestaurantID) VALUES (3);
INSERT INTO YearlyExpenseReport(RestaurantID) VALUES (4);
INSERT INTO YearlyExpenseReport(RestaurantID) VALUES (5);

CREATE TABLE Employee(
	UserID int,
	Position varchar(50),
	YearsExperience int,
	RestaurantID int NOT NULL,
	PRIMARY KEY(UserID),
	FOREIGN KEY (UserID) REFERENCES Users ON DELETE CASCADE,
	FOREIGN KEY (RestaurantID) REFERENCES Restaurant ON DELETE CASCADE
);

INSERT INTO Employee VALUES (7, 'Bartender', 1, 2);
INSERT INTO Employee VALUES (2, 'Head Chef', 5, 1);
INSERT INTO Employee VALUES (3, 'Sous Chef', 2, 2);
INSERT INTO Employee VALUES (4, 'Waiter', 3, 3);
INSERT INTO Employee VALUES (5, 'Dishwasher', 1, 3);


CREATE TABLE HourlyPay(
	Position varchar(50) ,
	HourlyPay int NOT NULL,
	YearsExperience int,
	RestaurantID int, 	
	UserID int,
	FOREIGN KEY(UserID) REFERENCES Users ON DELETE CASCADE,
	FOREIGN KEY(RestaurantID) REFERENCES Restaurant ON DELETE CASCADE,
	PRIMARY KEY(UserID)
);

CREATE TABLE BonusPay(
	Position varchar(255),
	BonusPay int,
	RestaurantID int,
	UserID int,
	PRIMARY KEY(UserID),
	FOREIGN KEY(RestaurantID) REFERENCES Restaurant ON DELETE CASCADE
);

CREATE TABLE Customer (
	UserID int PRIMARY KEY,
	NumReviews int DEFAULT 0,
	Preference varchar(255),
	FOREIGN KEY (UserID) REFERENCES Users ON DELETE CASCADE
);


CREATE TABLE IngredientExpireOn(
	IngredientName varchar(255) NOT NULL, 
	ExpiryDate Date, 
	DateProduced Date,
	PRIMARY KEY (IngredientName, DateProduced)
);

CREATE TABLE Ingredient(
	IngredientID serial PRIMARY KEY,
	IngredientName varchar(255) NOT NULL,
	Amount int,
	DateProduced Date,
	FOREIGN KEY (IngredientName, DateProduced) REFERENCES IngredientExpireOn ON DELETE CASCADE
);

CREATE TABLE Dish (
	DishID serial PRIMARY KEY ,
	RestaurantID int NOT NULL,
	DishName varchar(255) NOT NULL,
	Price int,
	AvailableUntil date,
	FOREIGN KEY (RestaurantID) REFERENCES Restaurant
);

CREATE TABLE IngredientsUsed (
	IngredientID int,
	DishID int,
	AmountUsed int,
	PRIMARY KEY (IngredientID, DishID),
	FOREIGN KEY (IngredientID) REFERENCES Ingredient,
	FOREIGN KEY (DishID) REFERENCES Dish
);

CREATE TABLE Purchases (
	ID serial primary key,
	IngredientID int,
	UserID int,
	Amount int,
	totalprice int,
	PurchaseDate date,
	RestaurantID int,
	foreign key (UserID) references Users(UserID) on delete cascade,
	foreign key (RestaurantID) references Restaurant(RestaurantID) on delete cascade,
	foreign key (IngredientID) references Ingredient on delete CASCADE

);


CREATE TABLE Reviews (
	ID serial PRIMARY KEY,
	ReviewDate date,
	ReviewDescription varchar(255),
	Rating int, 
	CustomerName varchar(255),
	RestaurantID int NOT NULL,
	UserID int NOT NULL,
	FOREIGN KEY (RestaurantID) REFERENCES Restaurant ON DELETE CASCADE,
	FOREIGN KEY(UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE Images (
	RestaurantID int,
	TAG varchar(255),
	Link varchar(255) NOT NULL,
	PRIMARY KEY (RestaurantID, TAG),
	FOREIGN KEY (RestaurantID) REFERENCES Restaurant ON DELETE CASCADE
);

INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2018-10-10', 'good', 4, 'yolo', 1, 2);
INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2018-01-10', 'very good', 5, 'yoyo', 1, 4);
INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2019-01-10', 'super good', 5, 'lolo', 1, 5);
INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2018-11-10', 'bad', 2, 'anonymous', 3, 2);
INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2018-12-10', 'super bad', 1, 'someone', 5, 2);
INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2018-12-10', 'super bad', 1, 'someone', 5, 3);


INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil) VALUES (1, 'Pasta', 40, '2020-01-01');
INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil)  VALUES (2, 'Salad', 20, '2019-10-10');
INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil)  VALUES (4, 'Rice', 3, '2222-01-01');
INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil)  VALUES (4, 'Soup', 10, '2099-01-01');
INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil) VALUES (3, 'Burger', 30, '2020-01-01');
INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil) VALUES (1, 'Soup', 30, '2020-01-01');
INSERT INTO IngredientsUsed VALUES (6, 6, 5);


INSERT INTO Customer VALUES (1, 500, 'Edible Food');
INSERT INTO Customer VALUES (2, 98, 'Chinese');
INSERT INTO Customer VALUES (3, 3, 'BBQ');
INSERT INTO Customer VALUES (4, 45, 'Any');
INSERT INTO Customer VALUES (7, 1, 'Quantity');

INSERT INTO Images VALUES (1, 'place', 'data:image/jpeg;base64,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');
INSERT INTO Images VALUES (1, 'food', 'https://file.videopolis.com/D/9dc9f4ba-0b2d-4cbb-979f-fee7be8a4198/8485.11521.brussels.the-hotel-brussels.amenity.restaurant-AD3WAP2L-13000-853x480.jpeg');
INSERT INTO Images VALUES (4, 'food', 'http://iamafoodblog.com/wp-content/uploads/2018/06/china-poblano_1877.jpg');
INSERT INTO Images VALUES (5, 'place', 'https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/02/07/15/chinese.jpg?w968h681');
INSERT INTO Images VALUES (3, 'place', 'http://iamafoodblog.com/wp-content/uploads/2018/06/china-poblano_1877.jpg');

INSERT INTO HourlyPay VALUES ('Head Chef', 40.50, 5, 1, 2);
INSERT INTO HourlyPay VALUES ('Sous Chef', 35.50, 2, 2, 3);
INSERT INTO HourlyPay VALUES ('Waiter', 25.50, 3, 3, 4);
INSERT INTO HourlyPay VALUES ('Dishwasher', 20.50, 1, 3,5);
INSERT INTO HourlyPay VALUES ('Bartender', 90.50, 1, 2, 7);

INSERT INTO BonusPay VALUES ('Head Chef',100, 1, 2);
INSERT INTO BonusPay VALUES ('Sous Chef', 50, 2, 3);
INSERT INTO BonusPay VALUES ('Waiter', 30, 3, 4);
INSERT INTO BonusPay VALUES ('Dishwasher', 20, 3, 5);
INSERT INTO BonusPay VALUES ('Bartender',150, 2, 7);

INSERT INTO Ingredient (IngredientName, Amount, DateProduced) VALUES ( 'Carrot', 5, '2019-02-25');
INSERT INTO Ingredient  (IngredientName, Amount, DateProduced)  VALUES ( 'Apple', 20, '2019-03-25');
INSERT INTO Ingredient  ( IngredientName, Amount, DateProduced) VALUES ( 'Chicken', 5000, '2019-02-25');
INSERT INTO Ingredient  ( IngredientName, Amount, DateProduced)  VALUES ( 'Noodles', 14, '2020-02-25');
INSERT INTO Ingredient  (IngredientName, Amount, DateProduced) VALUES ('Beef', 7, '2019-02-25');

INSERT INTO IngredientExpireOn VALUES ('Carrot',  '2019-01-25', '2019-02-25');
INSERT INTO IngredientExpireOn VALUES ('Apple',  '2019-03-01', '2019-03-25');
INSERT INTO IngredientExpireOn VALUES ('Chicken',  '2019-12-25', '2019-02-25');
INSERT INTO IngredientExpireOn VALUES ('Noodles',  '2019-11-25', '2020-02-25');
INSERT INTO IngredientExpireOn VALUES ('Beef',  '2019-12-20', '2019-02-25');

INSERT INTO IngredientsUsed VALUES (6, 2, 3);
INSERT INTO IngredientsUsed VALUES (7, 3, 4);
INSERT INTO IngredientsUsed VALUES (8, 1, 3);
INSERT INTO IngredientsUsed VALUES (7, 2, 1);
INSERT INTO IngredientsUsed VALUES (6, 4, 5);

INSERT INTO Purchases (ingredientid, userid, amount, totalprice, purchasedate, restaurantid) VALUES (3,7,1000,1000,'2019-02-25', 2);
INSERT INTO Purchases (ingredientid, userid, amount, totalprice, purchasedate, restaurantid) VALUES (1, 7, 2, 30, '2019-02-25', 2);
INSERT INTO Purchases (ingredientid, userid, amount, totalprice, purchasedate, restaurantid) VALUES (2, 7, 10, 30, '2019-02-25', 2);
INSERT INTO Purchases (ingredientid, userid, amount, totalprice, purchasedate, restaurantid) VALUES (4, 7, 5, 100, '2019-02-25', 2);
INSERT INTO Purchases (ingredientid, userid, amount, totalprice, purchasedate, restaurantid) VALUES (5, 6, 2, 50, '2019-02-25', 4);

INSERT INTO Purchases (ingredientid, userid, amount, totalprice, purchasedate) VALUES (6, 6, 2, 50, '2019-03-25');

-- Update Restaurant Rating
CREATE OR REPLACE FUNCTION update_rating()
RETURNS trigger AS $update_rating$
BEGIN
	UPDATE Restaurant
		SET rating = (SELECT AVG(Rating)
					  FROM Reviews
					  WHERE RestaurantID = NEW.RestaurantID)
			WHERE RestaurantID = NEW.RestaurantID;
	RETURN NEW;
END;
$update_rating$ LANGUAGE 'plpgsql';



CREATE TRIGGER rating_updated
	AFTER INSERT
	ON Reviews
	FOR EACH ROW
	EXECUTE PROCEDURE update_rating();



-- Update Customer Rating Count
CREATE OR REPLACE FUNCTION update_rating_count()
RETURNS trigger AS $update_rating_count$
BEGIN
	UPDATE Customer
		SET numReviews = (SELECT COUNT(*)
							FROM Reviews
							WHERE UserID = NEW.UserID)
			WHERE UserID = NEW.UserID;
	RETURN NEW;
END;
$update_rating_count$ LANGUAGE 'plpgsql';

CREATE TRIGGER rating_count_updated
	AFTER INSERT
	ON Reviews
	FOR EACH ROW
	EXECUTE PROCEDURE update_rating_count();


-- Update Yearly Expense Report
CREATE OR REPLACE FUNCTION update_bonus_wages()
RETURNS trigger AS $update_bonus_wages$
BEGIN
	UPDATE YearlyExpenseReport
		SET TotalBonusWages = (SELECT sum(bp.bonuspay)
									FROM Employee e, BonusPay bp, Restaurant r
									WHERE e.Position = bp.Position and 
									r.restaurantid = e.restaurantid and 
									e.restaurantid = bp.restaurantid and 
									r.restaurantid = NEW.Restaurantid and
									bp.userid = e.userid)
			WHERE RestaurantID = NEW.RestaurantID;
	RETURN NEW;
END;
$update_bonus_wages$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_bonus_wages_bp
	AFTER INSERT
	ON BonusPay
	FOR EACH ROW
	EXECUTE PROCEDURE update_bonus_wages();

	
CREATE TRIGGER update_bonus_wages_e
	AFTER INSERT
	ON Employee
	FOR EACH ROW
	EXECUTE PROCEDURE update_bonus_wages();


CREATE OR REPLACE FUNCTION update_total_employee_wages()
RETURNS trigger AS $update_total_employee_wages$
BEGIN
	UPDATE YearlyExpenseReport
		SET TotalEmployeeWages = (SELECT SUM(hp.HourlyPay * 2880)
									FROM Employee e, HourlyPay hp, Restaurant r
									WHERE e.Position = hp.Position and 
									hp.userid = e.userid and
									e.yearsexperience = hp.yearsexperience and 
									r.restaurantid = e.restaurantid and 
									r.restaurantid = NEW.restaurantid)
			WHERE RestaurantID = NEW.RestaurantID;
	RETURN NEW;
END;
$update_total_employee_wages$ LANGUAGE 'plpgsql';


CREATE TRIGGER employee_wage_update_e
	AFTER INSERT
	ON Employee
	FOR EACH ROW
	EXECUTE PROCEDURE update_total_employee_wages();

CREATE TRIGGER employee_wage_update_hp
	AFTER INSERT
	ON HourlyPay
	FOR EACH ROW
	EXECUTE PROCEDURE update_total_employee_wages();



CREATE OR REPLACE FUNCTION update_employee_count()
RETURNS trigger AS $update_employee_count$
BEGIN
	UPDATE YearlyExpenseReport
		SET TotalEmployees = (SELECT COUNT(*)
									FROM Employee
									WHERE restaurantid = NEW.restaurantid)
			WHERE RestaurantID = NEW.RestaurantID;
	RETURN NEW;
END;
$update_employee_count$ LANGUAGE 'plpgsql';


CREATE TRIGGER update_employee_count
	AFTER INSERT
	ON Employee
	FOR EACH ROW
	EXECUTE PROCEDURE update_employee_count();



	

CREATE OR REPLACE FUNCTION update_ingredient_price()
RETURNS trigger AS $update_ingredient_price$
BEGIN
	UPDATE YearlyExpenseReport
		SET TotalIngredientPrices = (select sum(p.totalprice) from 
										purchases p where p.userid in (
											select e.userid from employee e where e.restaurantid=RestaurantID)
									)
		
	RETURN NEW;
END;
$update_ingredient_price$ LANGUAGE 'plpgsql';


			-- SELECT result.totalprice from 
			-- 							(SELECT SUM(p.totalprice)
			-- 							FROM Purchases p, Employee e, Restaurant r
			-- 							WHERE  r.restaurantid = e.restaurantid and p.userid = e.userid
			-- 							GROUP BY e.restaurantid) as result
			-- 							WHERE result.restaurantid = RestaurantID); 

CREATE TRIGGER update_ingredient_price_p
	AFTER INSERT
	ON Purchases
	FOR EACH ROW
	EXECUTE PROCEDURE update_ingredient_price();

-- update ingredientsused set ingredientid=6, amountused=3 where ingredientid=8 and 
-- dishid=(select dishid from dish where dishname='Pasta' and restaurantid=1 limit 1)


SELECT * FROM Users;
SELECT * FROM Employee;
SELECT * FROM HourlyPay;
SELECT * FROM BonusPay;
SELECT * FROM Restaurant;
SELECT * FROM Customer;
SELECT * FROM Purchases;
SELECT * FROM Dish;
SELECT * FROM Images;
SELECT * FROM Reviews;
SELECT * FROM IngredientExpireOn;
SELECT * FROM Ingredient;
SELECT * FROM IngredientsUsed;


-- select distinct ie.ingredientname, ie.dateproduced, ie.expirydate, i.amount from ingredientexpireon ie, ingredient i
-- where (ie.ingredientname, ie.dateproduced, i.ingredientid) in (
-- select i.ingredientname, i.dateproduced, i.ingredientid from ingredient i where i.ingredientid in
-- (Select iu.ingredientid from dish d, ingredientsused iu where d.restaurantid=1 and iu.dishid=d.dishid group by iu.ingredientid)
-- )


select i.ingredientid, ie.ingredientname, ie.dateproduced, ie.expirydate, i.amount from 
        ingredientexpireon ie, ingredient i where (ie.ingredientname, ie.dateproduced, i.ingredientid) in 
        (select i.ingredientname, i.dateproduced, i.ingredientid from ingredient i where i.ingredientid in 
          (Select iu.ingredientid from dish d, ingredientsused iu where d.restaurantid=$1 and iu.dishid=d.dishid 
          group by iu.ingredientid))
		  union select p.price from ingredientexpireon ie, ingredient i,
purchases p 
where i.dateproduced=ie.dateproduced and i.ingredientname=ie.ingredientname and i.ingredientid in 
(select sum(p.totalprice) from purchases p where p.userid in (
select userid from employee where restaurantid=2)
);

-- insert into purchases (IngredientID, UserID, Amount, totalprice, PurchaseDate) values(29,2,100,1000, now())


create view u as  select * from users u 
where not exists ((select r.restaurantid from restaurant r) 
except (select re.restaurantid from reviews re where re.userid = u.userid));

create view test as select count(*),r2.userid from reviews r2 group by r2.userid;

