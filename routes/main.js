module.exports = function(app) {    
    
    /////////////////
    // View Rendering
    /////////////////

    app.get("/",function(req, res){
        res.render("index.ejs")
    });
    app.get("/about",function(req, res) {
        res.render("about.ejs");
    });
    app.get("/calorie-counter",function(req, res) {
        let sqlquery =  "SELECT * FROM food ORDER BY name ASC";
        
        //query database
        db.query(sqlquery, (err, result) => {
            if (err) {
                return console.error("No food found" + "error: "+ err.message);
            }
            console.log(result)
            res.render("calorie-counter.ejs", {foundFood: result});
        });
    });

    app.get("/food-add",function(req, res) {
        res.render("food-add.ejs");
    });
    app.get("/food-delete",function(req, res) {
        res.render("food-delete.ejs");
    });
    app.get("/food-search",function(req, res) {
        res.render("food-search.ejs");
    });
    app.get("/food-update",function(req, res) {
        res.render("food-update.ejs");
    });

    //////////
    // Create
    //////////

    // Add new food to database
    app.post("/add", (req, res) => {
        // //build query
        let entry = [req.body.name, req.body.unit, req.body.calories, 
                       req.body.carbs, req.body.fat, req.body.protein, 
                       req.body.salt, req.body.sugar];
        let sqlquery = "INSERT INTO food VALUES (DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?)"
                                     
        db.query(sqlquery, entry, (err, result)=>{
            if(err) {
                res.redirect("/");
            }
            console.log(result);
            res.render("add-results.ejs", {food: req.body});
        });
    });
    /////////
    // Read
    /////////

    //search
    app.get("/search-db", function(req, res) {
        //build query from search term
        let keyword = '%' + [req.query.keyword] + '%';
        let sqlquery =  "SELECT * FROM food WHERE name like ?";
        
        //query database
        db.query(sqlquery, keyword, (err, result) => {
            if (err) {
                return console.error("No food found with the keyword you have entered" + keyword + "error: "+ err.message);
            }
            console.log(result)
            res.render ('display-results.ejs',{ foundFood: result});
        });
    });

    //display list
    app.get("/display-list", function(req, res) {
        let sqlquery =  "SELECT * FROM food ORDER BY name ASC";
        
        //query database
        db.query(sqlquery, (err, result) => {
            if (err) {
                return console.error("No food found" + "error: "+ err.message);
            }
            console.log(result)
            res.render ('display-results.ejs',{foundFood: result});
        });
    });

    //////////
    // Update
    //////////

    //1 - return template with form with fields filled in - that template will need to submit the changes
    app.get("/search-update", function(req, res) {
        //build query from search term
        let keyword = [req.query.keyword];
        let sqlquery =  "SELECT * FROM food WHERE name like ?";
        
        //query database
        db.query(sqlquery, keyword, (err, result) => {
            if (err) {
                return console.error("No food found with the keyword you have entered" + keyword + "error: "+ err.message);
            }
            console.log(result);
            res.render ('update-search.ejs',{ foundFood: result});
            return
        });
    });
    
    //2 - submit the change prepared in 1 here
    app.put("/update", (req, res) => {
        let entry = [req.body.name, req.body.unit, req.body.calories, 
                     req.body.carbs, req.body.fat, req.body.protein, 
                     req.body.salt, req.body.sugar, req.body.name,];
        let sqlquery = `UPDATE food SET name = ?, 
                                        unit = ?, 
                                        calories = ?, 
                                        carbs = ?, 
                                        fat = ?, 
                                        protein = ?, 
                                        salt = ?, 
                                        sugar = ? 
                                        WHERE name = ?`;

        //query database
        db.query(sqlquery, entry, (err, result)=>{
            if(err) {
                res.redirect("/");
            }
            res.render("update-results.ejs", {food: req.body});
            return
        });
    });

    //////////
    // Delete
    //////////

    //1 - search for item to delete and return template with item and delete button
    app.get("/search-delete", function(req, res) {
        //build query from search term
        let keyword = [req.query.keyword];
        let sqlquery =  "SELECT * FROM food WHERE name like ?";
        
        //query database
        db.query(sqlquery, keyword, (err, result) => {
            if (err) {
                return console.error("No food found with the keyword you have entered" + keyword + "error: "+ err.message);
            }
            console.log(result)
            res.render ('delete-search.ejs',{foundFood: result});
            return
        });
    });

    app.delete("/delete", function(req, res) {
        let name = [req.body.food];
        let sqlquery =  "DELETE FROM food WHERE name = ?";
        db.query(sqlquery, name, (err, result)=>{
            if (err) throw err;
            console.log(result);
            res.render("delete-results.ejs", {deletedFoodName: name[0]});
        });
    });

    //////////////////
    // Calorie Counter
    //////////////////

    app.post("/calorie-counter-add",function(req, res) {
        let names = [req.body.name].flat();
        // let names = [req.body.name];
        console.log(names)
        let sqlquery = `SELECT SUM(calories) as calories,
                               SUM(carbs) as carbs,
                               SUM(fat) as fat,
                               SUM(protein) as protein,
                               SUM(salt) as salt,
                               SUM(sugar) as sugar
                               FROM food where name in (?)`;
        
        // query database
        db.query(sqlquery, [names], (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            console.log(result)
            console.log(`names are ${names}`)
            console.log(`type of names is ${typeof names}`)
            console.log(`type of req.body.name is ${typeof req.body.name}`)
            console.log({names: names, total: result[0]})
            res.render("calorie-counter-result.ejs", {names: names, total: result[0]});
        });
    });
}