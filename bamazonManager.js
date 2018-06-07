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

function managerMenu() {
    inquirer
        .prompt([
            {
                name: "view",
                message: "What would you like to do?",
                type: "list",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Products"]
            },
        ])
        .then(function (answer) {
            switch (answer.view) {
                case "View Products for Sale":
                    saleProducts();
                    break;

                case "View Low Inventory":
                    lowInventory();
                    break;

                case "Add to Inventory":
                    addInventory();
                    break;

                case "Add New Products":
                    addNew();
                    break;
            }
        })
}

function runItBack() {
    inquirer.
        prompt([
            {
                name: "again",
                type: "confirm",
                message: "Would you like to do anything else?"
            },
        ])
        .then(function (answer) {
            if (answer.again === true) {
                managerMenu()
            }
            else (console.log(`Thank you for working for Bamazon.`),
                connection.end())
        })
};

function saleProducts() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;

        var choiceArray = [];
        for (var i = 0; i < results.length; i++) {
            console.log(`ID#: ${results[i].item_id} |Item name: ${results[i].product_name} |Price: $${results[i].price} |Quantity: ${results[i].stock_quantity}`);
        }
        runItBack();
    })
}

function lowInventory() {
    var query = "SELECT * FROM products WHERE stock_quantity < 5";
    connection.query(query, function (err, results) {
        for (var i = 0; i < results.length; i++) {
            console.log(`
        ID#: ${results[i].item_id} |Item name: ${results[i].product_name} |Price: $${results[i].price} |Quantity: ${results[i].stock_quantity}
        -----------------------------------------------------`);
        }
        runItBack();
    });
}

function addNew() {
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "What is the item you would like to add?"
            },
            {
                name: "department",
                type: "input",
                message: "What department would you like to add this to?"
            },
            {
                name: "itemPrice",
                type: "input",
                message: "What is the item's price?"
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like to add?"
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.item,
                    department_name: answer.department,
                    price: answer.itemPrice,
                    stock_quantity: answer.quantity
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your item was successfully added!");

                    runItBack()
                })
        })
}

function addInventory() {
    inquirer
        .prompt([
            {
                name: "itemAdd",
                type: "input",
                message: "What is the item you would like to add inventory to?"
            },
            {
                name: "quantityAdd",
                type: "input",
                message: "How many units would you like to add to inventory?"
            }
        ])
        .then(function (answer) {
            connection.query("SELECT * FROM products WHERE ?",
                { item_id: answer.itemAdd }, function (err, results) {

                    var addInventory = (parseInt(results[0].stock_quantity) + parseInt(answer.quantityAdd))

                    console.log(`Item: ${results[0].product_name} |New quantity: ${addInventory}`)
                    if (err) throw err;
                    
                    connection.query("UPDATE products SET ? WHERE ?",
                        [
                        {
                            stock_quantity: addInventory
                        },
                        {
                            item_id: answer.itemAdd
                        }],
                        function (err, results) {

                            if (err) throw err;
                            else {
                                console.log("The inventory was successfully updated!");
                            }
                            runItBack()
                        })
                    
                })

        })
}


managerMenu();