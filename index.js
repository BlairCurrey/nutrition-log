const express = require ("express");
const body_parser = require("body-parser");
const method_override = require("method-override");
const mysql = require ("mysql");
const app = express();
const port = process.env.PORT || 8089;

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database: 'nutrition_log'
});

//Connect to MySQL database
db.connect((err)=> {
    if(err) throw err;
    console.log('Database connection established')
});
global.db = db;

app.use(body_parser.urlencoded({ extended: true }));
app.use(method_override('_method'));
require("./routes/main.js")(app);
app.use(express.static('public'));
app.set("views",__dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));