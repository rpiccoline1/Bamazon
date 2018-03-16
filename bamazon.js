var mysql = require("mysql");
var inquirer = require("inquirer");
var validator = require("validator");

let connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Boarder@14",
  database: "bamazonDB"
});

userPrompt();

function userPrompt() {
  inquirer.prompt({
    type: "list",
    name: "shop",
    choices: ["Yes", "No"],
    message: "Would you like to purchase an item?"
  }).then(function (result) {
    if (result.shop === "Yes") {
      displayProducts();
    } else {
      console.log("Maybe next time.")
      connection.end();
    }
  });
}

function displayProducts() {

  connection.query("SELECT * FROM products", function (err, res) {

    for (i = 0; i < res.length; i++) {

      console.log("Item Number: " + res[i].item_id);
      console.log("Product: " + res[i].product_name);
      console.log("Department: " + res[i].department_name);
      console.log("Price: " + res[i].price);
      console.log("------------------");
    }
    productChoice();
  });
}

function productChoice() {
  inquirer.prompt([{
    name: "item",
    message: "Select an Item Number of the product you wish to purchase.",
    type: "input",
    validate: function (custChoice) {

      if (isNaN(custChoice) === false) {
        return true;

      } else {
        console.log("Error: Please input a valid item number.  Thank you.");
        return false;
      }
    }

  }, {

    name: "quantity",
    message: "How many of this item would you like to purchase?",
    type: "input",
    validate: function (custChoice) {

      if (isNaN(custChoice) === false) {
        return true;

      } else {
        console.log("Error: Please input a valid quantity.  Thank you.");
        return false;
      }
    }
  }]).then(function (answer) {
    console.log(answer);
    return new Promise(function (resolve, reject) {
      connection.query("SELECT * FROM products WHERE ?", { item_id: answer.item }, function (err, res) {
        if (err) reject(err);
        resolve(res);
      });

    }).then(function (result) {

      var storedInfo = {};


      if (parseInt(answer.quantity) <= parseInt(result[0].stock_quantity)) {

        storedInfo.answer = answer;
        storedInfo.result = result;

        console.log(storedInfo);

      } else if (parseInt(answer.quantity) > parseInt(result[0].stock_quantity)) {
        console.log("Insufficient quantity!");
      } else {
        console.log("An error occurred. Your order is not complete.");
      }
      return storedInfo;

    }).then(function (storedInfo) {

      if (storedInfo.answer) {

        var newQuantity = parseInt(storedInfo.result[0].stock_quantity) - parseInt(storedInfo.answer.quantity);
        var itemId = storedInfo.answer.item;
        var totalCost = parseInt(storedInfo.result[0].price) * parseInt(storedInfo.answer.quantity);

        connection.query("UPDATE products SET ? WHERE ?", [{
          stock_quantity: newQuantity
        }, {

          item_id: itemId

        }], function (err, res) {

          console.log("Order Total: $" + totalCost + ". Thank you!");
          restartPrompt();
        });
        function restartPrompt() {
          inquirer.prompt({
            type: "list",
            name: "shop",
            choices: ["Yes", "No"],
            message: "Would you like to continue shopping?"
          }).then(function (result) {
            if (result.shop === "Yes") {
              userPrompt();
            } else {
              console.log("Thank you for shopping with Bamazon!!")
              connection.end();
            }
          });
        }
      }
    })
  })
}