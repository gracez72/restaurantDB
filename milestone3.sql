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

INSERT INTO Images VALUES (1, 'place', 'http://iamafoodblog.com/wp-content/uploads/2018/06/china-poblano_1877.jpg');
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
										purchases p  where p.restaurantid=RestaurantID
									);
		
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


-- select i.ingredientid, ie.ingredientname, ie.dateproduced, ie.expirydate, i.amount from 
--         ingredientexpireon ie, ingredient i where (ie.ingredientname, ie.dateproduced, i.ingredientid) in 
--         (select i.ingredientname, i.dateproduced, i.ingredientid from ingredient i where i.ingredientid in 
--           (Select iu.ingredientid from dish d, ingredientsused iu where d.restaurantid=$1 and iu.dishid=d.dishid 
--           group by iu.ingredientid))
-- 		  union select p.price from ingredientexpireon ie, ingredient i,
-- purchases p 
-- where i.dateproduced=ie.dateproduced and i.ingredientname=ie.ingredientname and i.ingredientid in 
-- (select sum(p.totalprice) from purchases p where p.userid in (
-- select userid from employee where restaurantid=2)
-- );

-- insert into purchases (IngredientID, UserID, Amount, totalprice, PurchaseDate) values(29,2,100,1000, now())


create view u as  select * from users u 
where not exists ((select r.restaurantid from restaurant r) 
except (select re.restaurantid from reviews re where re.userid = u.userid));

create view test as select count(*),r2.userid from reviews r2 group by r2.userid;

