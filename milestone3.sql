CREATE TABLE Users (
	UserID serial, 
	AccountName varchar(255) UNIQUE NOT NULL,
	UserName varchar(255) DEFAULT 'Anonymous',
	UserPassword varchar(16) NOT NULL,
	PRIMARY KEY(UserID)
);

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
	RestaurantName varchar(40)
);

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
	FOREIGN KEY(RestaurantID) REFERENCES Restaurant ON DELETE CASCADE,
	PRIMARY KEY(Position, YearsExperience, RestaurantID)
);

CREATE TABLE BonusPay(
	Position varchar(255),
	BonusPay int,
	RestaurantID int,
	PRIMARY KEY(Position, RestaurantID),
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

CREATE TABLE Purchases (
	IngredientID int,
	UserID int,
	Amount int,
	PurchaseDate date,
	PRIMARY KEY(IngredientID, UserID)
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

INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2018-10-10', 'good', 4, 'yolo', 1, 2);
INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2018-01-10', 'very good', 5, 'yoyo', 1, 4);
INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2019-01-10', 'super good', 5, 'lolo', 1, 5);
INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2018-11-10', 'bad', 2, 'anonymous', 3, 2);
INSERT INTO Reviews (ReviewDate, ReviewDescription, Rating, CustomerName, RestaurantID, UserID ) VALUES ('2018-12-10', 'super bad', 1, 'someone', 5, 2);


CREATE TABLE Dish (
	DishID serial PRIMARY KEY ,
	RestaurantID int NOT NULL,
	DishName varchar(255) NOT NULL,
	Price int,
	AvailableUntil date,
	FOREIGN KEY (RestaurantID) REFERENCES Restaurant
);

INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil) VALUES (1, 'Pasta', 40, '2020-01-01');
INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil)  VALUES (2, 'Salad', 20, '2019-10-10');
INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil)  VALUES (4, 'Rice', 3, '2222-01-01');
INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil)  VALUES (4, 'Soup', 10, '2099-01-01');
INSERT INTO Dish (RestaurantID, DishName, Price ,  AvailableUntil) VALUES (3, 'Burger', 30, '2020-01-01');

CREATE TABLE IngredientsUsed (
	IngredientID int,
	DishID int,
	AmountUsed int,
	PRIMARY KEY (IngredientID, DishID),
	FOREIGN KEY (IngredientID) REFERENCES Ingredient,
	FOREIGN KEY (DishID) REFERENCES Dish
);


CREATE TABLE Images (
	RestaurantID int,
	TAG varchar(255),
	Link varchar(255) NOT NULL,
	PRIMARY KEY (RestaurantID, TAG),
	FOREIGN KEY (RestaurantID) REFERENCES Restaurant ON DELETE CASCADE
);



INSERT INTO Employee VALUES (7, 'Bartender', 1, 2);
INSERT INTO Employee VALUES (2, 'Head Chef', 5, 1);
INSERT INTO Employee VALUES (3, 'Sous Chef', 2, 2);
INSERT INTO Employee VALUES (4, 'Waiter', 3, 3);
INSERT INTO Employee VALUES (5, 'Dishwasher', 1, 3);

INSERT INTO HourlyPay VALUES ('Head Chef', 40.50, 5, 1);
INSERT INTO HourlyPay VALUES ('Sous Chef', 35.50, 2, 2);
INSERT INTO HourlyPay VALUES ('Waiter', 25.50, 3, 3);
INSERT INTO HourlyPay VALUES ('Dishwasher', 20.50, 1, 3);
INSERT INTO HourlyPay VALUES ('Bartender', 90.50, 1, 2);

INSERT INTO BonusPay VALUES ('Head Chef',100, 1);
INSERT INTO BonusPay VALUES ('Sous Chef', 50, 2);
INSERT INTO BonusPay VALUES ('Waiter', 30, 3);
INSERT INTO BonusPay VALUES ('Dishwasher', 20, 3);
INSERT INTO BonusPay VALUES ('Bartender',150, 2);

INSERT INTO Restaurant (RestaurantType,RestaurantDescription, RestaurantAddress, RestaurantName) VALUES ('Korean', 'good food', '1234 BBQ Street', 'BBQueue Up');
INSERT INTO Restaurant (RestaurantType,RestaurantDescription, RestaurantAddress, RestaurantName) VALUES ('Australia', 'kangaroo', '1234 Kangaroo Street', 'The Kangaroo Chef');
INSERT INTO Restaurant (RestaurantType,RestaurantDescription, RestaurantAddress, RestaurantName) VALUES ('Chinese', 'good food', '1234 Wok Street', 'Wok You Looking At');
INSERT INTO Restaurant (RestaurantType,RestaurantDescription, RestaurantAddress, RestaurantName) VALUES ('Western', 'good food', '1234 Wild West Street', 'Old Saloon');
INSERT INTO Restaurant (RestaurantType,RestaurantDescription, RestaurantAddress, RestaurantName) VALUES ('Fusion', 'good food', '1234 Lemonade Street', 'Just Lemonade');

INSERT INTO Customer VALUES (1, 500, 'Edible Food');
INSERT INTO Customer VALUES (2, 98, 'Chinese');
INSERT INTO Customer VALUES (3, 3, 'BBQ');
INSERT INTO Customer VALUES (4, 45, 'Any');
INSERT INTO Customer VALUES (7, 1, 'Quantity');

INSERT INTO Purchases VALUES (3, 7, 5000, '2019-02-25');
INSERT INTO Purchases VALUES (1, 7, 2, '2019-02-25');
INSERT INTO Purchases VALUES (2, 7, 10, '2019-02-25');
INSERT INTO Purchases VALUES (4, 7, 5, '2019-02-25');
INSERT INTO Purchases VALUES (5, 6, 2, '2019-02-25');

INSERT INTO Images VALUES (1, 'place', 'https://www.google.com/url?9');
INSERT INTO Images VALUES (1, 'food', 'https://www.google.com/url');
INSERT INTO Images VALUES (4, 'food', 'https://www.google.com/urlFst=1551206871672509');
INSERT INTO Images VALUES (5, 'place', 'https://www.google.com/psig=AO1206838649659');
INSERT INTO Images VALUES (3, 'place', 'https://www.google.com/t=1551206838649659');

INSERT INTO IngredientsUsed VALUES (6, 2, 3);
INSERT INTO IngredientsUsed VALUES (7, 3, 4);
INSERT INTO IngredientsUsed VALUES (8, 1, 3);
INSERT INTO IngredientsUsed VALUES (7, 2, 1);
INSERT INTO IngredientsUsed VALUES (6, 4, 5);

INSERT INTO Dish VALUES (1, 'Pasta', 40, '2020-01-01');
INSERT INTO Dish VALUES (2, 'Salad', 20, '2019-10-10');
INSERT INTO Dish VALUES (4, 'Rice', 3, '2222-01-01');
INSERT INTO Dish VALUES (4, 'Soup', 10, '2099-01-01');
INSERT INTO Dish VALUES (3, 'Burger', 30, '2020-01-01');

INSERT INTO Ingredient (IngredientName, Amount, DateProduced) VALUES ('Carrot', 5, '2019-02-25');
INSERT INTO Ingredient  (IngredientName, Amount, DateProduced)  VALUES ('Apple', 20, '2019-03-25');
INSERT INTO Ingredient  (IngredientName, Amount, DateProduced) VALUES ('Chicken', 5000, '2019-02-25');
INSERT INTO Ingredient  (IngredientName, Amount, DateProduced)  VALUES ('Noodles', 14, '2020-02-25');
INSERT INTO Ingredient  (IngredientName, Amount, DateProduced) VALUES ('Beef', 7, '2019-02-25');

INSERT INTO IngredientExpireOn VALUES ('Carrot',  '2019-01-25', '2019-02-25');
INSERT INTO IngredientExpireOn VALUES ('Apple',  '2019-03-01', '2019-03-25');
INSERT INTO IngredientExpireOn VALUES ('Chicken',  '2019-12-25', '2019-02-25');
INSERT INTO IngredientExpireOn VALUES ('Noodles',  '2019-11-25', '2020-02-25');
INSERT INTO IngredientExpireOn VALUES ('Beef',  '2019-12-20', '2019-02-25');

INSERT INTO Reviews (ReviewDate) VALUES ('2018-10-10', 'good', 4, 'yolo', 1, 2);
INSERT INTO Reviews VALUES ('2018-01-10', 'very good', 5, 'yoyo', 1, 4);
INSERT INTO Reviews VALUES ('2019-01-10', 'super good', 5, 'lolo', 1, 5);
INSERT INTO Reviews VALUES ('2018-11-10', 'bad', 2, 'anonymous', 3, 2);
INSERT INTO Reviews VALUES ('2018-12-10', 'super bad', 1, 'someone', 5, 2);


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

