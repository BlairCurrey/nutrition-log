const express = require ("express");
const body_parser = require("body-parser");
const method_override = require("method-override");
const mysql = require ("mysql");
const app = express();
const port = process.env.PORT || 8089;

//database connection configs for dev and production
var db_config = {
    production: {
        host     : process.env.HOST,
        user     : process.env.USER,
        password : process.env.PASSWORD,
        database : process.env.DATABASE,
        name     : 'production'
    },
    development: {
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        database : 'nutrition_log',
        name     : 'development'
    }
};

//detect if production or development
var config;
if (process.env.NODE_ENV == 'production'){
    config = db_config.production;
} else {
    config = db_config.development;
}

//Solution for handling disconnects found here
//https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
var db;
function handleDisconnect() {
    db = mysql.createConnection(config); // Recreate the connection, since
                                         // the old one cannot be reused.

    db.connect(function(err) {                        // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log(`error when connecting to db ${config.name}:`, err);
            setTimeout(handleDisconnect, 2000);       // We introduce a delay before attempting to reconnect,
        }
        console.log(`Database connection established (${config.name})`)// to avoid a hot loop, and to allow our node script to
    });                                               // process asynchronous requests in the meantime.
                                                      // If you're also serving http, display a 503 error.
    db.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                       // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                // server variable configures this)
        }
    });
    global.db = db; //Reset global variable upon reconnect (routes will use old connection)
}

handleDisconnect();

// Ping MySQL to keep connection open
// Alternative to handleDisconnect()

// setInterval(function () {
//     console.log("pinging mysql server");
//     db.query('SELECT 1');
// }, 10000);

app.use(body_parser.urlencoded({ extended: true }));
app.use(method_override('_method'));
require("./routes/main.js")(app);
app.use(express.static(__dirname + '/public'));
app.set("views",__dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));