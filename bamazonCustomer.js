var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon",
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
});

function start() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;

        var choiceArray = [];
        for (var i = 0; i < results.length; i++) {
            console.log(`ID#: ${results[i].item_id} |Item name: ${results[i].product_name} |Price: $${results[i].price}`);
        }
        askItem(results);
    })

}

function runItBack() {
    inquirer.
        prompt([
            {
                name: "again",
                type: "confirm",
                message: "Would you like to buy something else?"
            },
        ])
        .then(function (answer) {
            if (answer.again === true) {
                start()
            }
            else (console.log(`Thank you for shopping with Bamazon.`),
        connection.end())
        })
};

function askItem() {
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "What is the ID# you would like to buy?"
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like to buy?"
            },
        ])
        .then(function (answer) {
            connection.query("SELECT * FROM products WHERE ?",
                { item_id: answer.item }, function (err, results) {
                    var totalPrice = (results[0].price * answer.quantity).toFixed(2);

                    var newInventory = (results[0].stock_quantity - answer.quantity)
                    

                    if (err) throw err;
                    else if (answer.quantity > results[0].stock_quantity) {
                        console.log("Insufficient quantity!")
                    }
                    else (

                        console.log(`ID#: ${results[0].item_id} |Item name: ${results[0].product_name} |Price: $${(results[0].price).toFixed(2)} each

                    Total price: $${totalPrice}
                    `))

                    connection.query("UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: newInventory
                            },
                            {
                                item_id: answer.item
                            }
                        ], )

                    runItBack();
                })

        })
}

// function inventory(){

// }
start()
