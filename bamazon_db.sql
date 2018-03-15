DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
  id INT(10) NOT NULL auto_increment,
  item_id INT(10) NOT NULL,
  product_name VARCHAR(80) NOT NULL,
  department_name VARCHAR(80) NOT NULL,
  price INT(10) NOT NULL,
  stock_quantity INT(10) NOT NULL,
)