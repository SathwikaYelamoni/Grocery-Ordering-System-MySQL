create database GroceryOrder;

use GroceryOrder;

CREATE USER 'sathwikayelamoni' IDENTIFIED BY '12345678';



GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, RELOAD, PROCESS, REFERENCES, INDEX, ALTER, SHOW DATABASES, CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, REPLICATION SLAVE, REPLICATION CLIENT, CREATE VIEW, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, CREATE USER, EVENT, TRIGGER ON *.* TO 'codecraftersadmin' WITH GRANT OPTION;



-- Create Categories table
CREATE TABLE Categories (
    category_id INT,
    category_name VARCHAR(50) NOT NULL,
    category_description VARCHAR(255) NOT NULL,
    PRIMARY KEY (category_id)
);

-- Create Suppliers table
CREATE TABLE Suppliers (
    supplier_id INT,
    supplier_name VARCHAR(50) NOT NULL,
    contact_person VARCHAR(50),
    PRIMARY KEY (supplier_id)
);

-- Create Products table
CREATE TABLE Products (
    product_id INT,
    product_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    supplier_id INT,
    PRIMARY KEY (product_id),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id)
);





-- Insert data into Categories
INSERT INTO Categories VALUES (1, 'Fruits', 'All Kind of Fruits only can be considered under this Category');
INSERT INTO Categories VALUES (2, 'Vegetables', 'All Kind of fresh Vegetables only can be considered under this Category');
INSERT INTO Categories VALUES (3, 'Dairy', 'All Kind of Dairy products only can be considered under this Category');

-- Insert data into Suppliers
INSERT INTO Suppliers VALUES (1, 'Farm Fresh', 'John Doe');
INSERT INTO Suppliers VALUES (2, 'Green Fields', 'Jane Smith');
INSERT INTO Suppliers VALUES (3, 'Dairy Delight', 'Bob Johnson');

-- Insert data into Products
INSERT INTO Products VALUES (1, 'Apple', 2.50, 1, 1);
INSERT INTO Products VALUES (2, 'Carrot', 1.20, 2, 2);
INSERT INTO Products VALUES (3, 'Milk', 3.00, 3, 3);
INSERT INTO Products VALUES (4, 'Banana', 1.80, 1, 1);
INSERT INTO Products VALUES (5, 'Broccoli', 1.75, 2, 2);



