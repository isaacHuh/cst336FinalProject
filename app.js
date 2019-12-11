const express = require("express");
const mysql   = require("mysql");
const app = express();
const session = require('express-session');

app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
app.use(express.urlencoded()); //use to parse data sent using the POST method
app.use(session({ secret: 'any word', cookie: { maxAge: 60000 }}));

app.get("/", async function(req, res){
    res.render("index");
});//root

app.get("/login", async function(req, res){
    res.render("login");
    
}); // login

app.get("/search", async function(req, res){
    //let rows = await getPlanets(req.query);
    //res.render("quotes", {"records":rows});
    res.render("search");
}); // search

app.get("/cart", async function(req, res){
    let rows = await getCart();
    //let rows = await getPlanets(req.query);
    //res.render("quotes", {"records":rows});
    res.render("cart", {"cart":rows});
});

app.get("/clearCart", async function(req, res){
    clearCart();
    let rows = await getCart();
    res.render("cart", {"cart":rows});
});

app.get("/results", async function(req, res){
    let rows = await getPlanets(req.query);
    console.log(rows);
    //res.render("quotes", {"records":rows});
    res.render("results", {"planets":rows});
}); // results


app.post("/addToCart", async function(req, res){
    insertToCart(req.body.planetName, req.body.planetPrice);
    res.send(true);
}); // results


app.get("/admin", async function(req, res){
    
   console.log("authenticated: ", req.session.authenticated);    
   
   if (req.session.authenticated) { //if user hasn't authenticated, sending them to login screen
       
     let planetList = await getPlanetList();  
       res.render("admin", {"planetList":planetList});  
       
   }  else { 
    
       res.render("login"); 
   
   }
});

app.post("/loginProcess", function(req, res) {
    if ( req.body.username == "admin" && req.body.password == "secret") {
       req.session.authenticated = true;
       res.send({"loginSuccess":true});
    } else {
       res.send(false);
    }

    
}); // loginProcess

app.get("/logout", function(req, res){    
    if (req.session) {
        req.logout();
        res.redirects("/login");
  }
}); // logout

app.get("/addPlanet", function(req, res){
  res.render("newPlanet");
});


app.post("/addPlanet", async function(req, res){
  let rows = await insertPlanet(req.body);
  console.log(rows);
  
  let message = "Planet WAS NOT added to the database!";
  if (rows.affectedRows > 0) {
      message= "Planet successfully added!";
  }
  res.render("newPlanet", {"message":message});
    
});

app.get("/updatePlanet", async function(req, res){

  let planetInfo = await getPlanetInfo(req.query.name);    
  //console.log(authorInfo);
  res.render("updatePlanet", {"planetInfo":planetInfo});
});

app.post("/updatePlanet", async function(req, res){
  let rows = await updatePlanet(req.body);
  
  let planetInfo = req.body;
  console.log(rows);

  let message = "Planet WAS NOT updated!";
  if (rows.affectedRows > 0) {
      message= "Planet successfully updated!";
  }
  res.render("updatePlanet", {"message":message, "planetInfo":planetInfo});
    
});

app.get("/deletePlanet", async function(req, res){
 let rows = await deletePlanet(req.query.name);
 console.log(rows);
  let message = "Planet WAS NOT deleted!";
  
  if (rows.affectedRows > 0) {
      message= "Planet successfully deleted!";
  }    
    
   let planetList = await getPlanetList();  
   res.render("admin", {"planetList":planetList});
});



// functions //

function insertPlanet(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO planets
                        (name, price)
                         VALUES (?,?)`;
        
           let params = [body.name, body.price];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
} // insertPlanet

function updatePlanet(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `UPDATE planets
                      SET name = ?, 
                          price = ?
                     WHERE name = ?`;
        
           let params = [body.name, body.price];
        
           console.log(sql);
           
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
} // updatePlanet


function deletePlanet(name){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `DELETE FROM planets
                      WHERE name = ?`;
        
           conn.query(sql, [name], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function insertToCart(name, price){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO cart
                        (name, price)
                         VALUES (?,?)`;
        
           let params = [name, price];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function getPlanetInfo(name){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                      FROM planets
                      WHERE name = ?`;
        
           conn.query(sql, [name], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows[0]); //Query returns only ONE record
           });
        
        });//connect
    });//promise 
} // getPlanetList

function getPlanetList(){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT name
                        FROM planets
                        ORDER BY name`;
        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}


function getPlanets(query){
    
    let keyword = query.keyword;
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
            
            let params = [];
            
           let sql = `SELECT *
                      FROM planets
                      WHERE 
                      name LIKE '%${keyword}%' `;
                      
            if (query.size) { //user selected a category
              sql += "AND size < ? ";
              params.push(query.size);
           }
           
           if (query.budget) { //user selected a Name
              sql += "AND price < ? ";
              params.push(query.budget);
           }
        
           console.log("SQL:", sql)
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}


function getCart(){
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
            
            let params = [];
            
           let sql = `SELECT * FROM cart NATURAL JOIN planets`;
        
           console.log("SQL:", sql)
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}

function clearCart(){
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
            
            let params = [];
            
           let sql = `DELETE FROM cart`;
        
           console.log("SQL:", sql)
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}

//values in red must be updated
function dbConnection(){

   let conn = mysql.createConnection({
                 host: "cst336db.space",
                 user: "cst336_dbUser32",
             password: "bz0olr",
             database: "cst336_db32"
       }); //createConnection

return conn;

}


//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});