const express = require("express");
const mysql   = require("mysql");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js

app.get("/", async function(req, res){
    res.render("index");
});//root

app.get("/search", async function(req, res){
    //let rows = await getPlanets(req.query);
    //res.render("quotes", {"records":rows});
    res.render("search");
});

app.get("/cart", async function(req, res){
    let rows = await getCart();
    //let rows = await getPlanets(req.query);
    //res.render("quotes", {"records":rows});
    res.render("cart", {"cart":rows});
});

app.get("/results", async function(req, res){
    let rows = await getPlanets(req.query);
    //res.render("quotes", {"records":rows});
    res.render("results", {"planets":rows});
});

function getPlanets(query){
    
    let keyword = query.keyword;
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
            
            let params = [];
            
           let sql = `SELECT name, price, image
                      FROM planets
                      WHERE 
                      name LIKE '%${keyword}%'`;
        
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
            
           let sql = `SELECT product, price
                      FROM cart`;
        
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