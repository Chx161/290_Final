var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var mysql = require('mysql');
var bodyParser = require('body-parser');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
// app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())

//Database credentials
var dbconn = mysql.createConnection({
   connectionLimit : 10,
   host: "classmysql.engr.oregonstate.edu",
   user: "cs290_liuchenx",
   password: "2887",
   database: "cs290_liuchenx"
});

//Create connection
dbconn.connect(function(err) {
   if (err) 
     throw err;
   console.log("Database connected successfully!");
});


app.get('/', function(req, res) {
     var context = {};
     res.render('home', context);
});

app.get('/getTable', function(req, res) {
     dbconn.query('SELECT * FROM workouts', function(err, rows, fields){
      if(err) 
        throw err;
      else
        res.send(JSON.stringify(rows));
      });
});

//Form submit button clicked, post request made to root dir, new row added to database
//Reference: https://www.opentechguides.com/how-to/article/nodejs/124/express-mysql-json.html
//Reference: https://www.tutorialkart.com/nodejs/nodejs-mysql-insert-into/
//Reference: https://www.sitepoint.com/using-node-mysql-javascript-client/
app.post('/insert', function(req, res) {
  var jsondata = req.body;
  var num = Number(jsondata.unit);
  var values = [[jsondata.name, jsondata.reps, jsondata.weight, jsondata.date, num]];
  dbconn.query("INSERT INTO workouts (name, reps, weight, date, lbs) VALUES ?", [values], function(err,result) {
    if(err) {
     console.log("Error intsert.");
     res.send('Error');
     }
    else {
     res.send('Success');
     console.log("In insert Success.");
    }
  });
});


app.post('/delete', function(req, res, next){
    //Delete entry
    dbconn.query("DELETE FROM workouts WHERE id = ?", [req.body.id], function(err, result){
    if(err)  throw err;
    //Delete successful
    else 
    {
      //Return updated table
      dbconn.query('SELECT * FROM workouts', function(err, rows, fields){
      if(err) 
        throw err;
      //The server can respond JSON data to a post request
      else
        res.send(JSON.stringify(rows));
      });
    }
  });
});

// Update an entry in the database with new input from client
app.post('/edit',function(req,res,next){
  dbconn.query("UPDATE workouts SET name=?, date=?, reps=?, weight=?, lbs=? WHERE id = ?", [req.body.name, req.body.date, req.body.reps, req.body.weight, req.body.unit, req.body.id], function(err, result){
    if(err){
      throw(err);
    }
    //Update success, send updated table
    else
    {
      dbconn.query('SELECT * FROM workouts', function(err, rows, fields){
      if(err) 
        throw err;
      else
        res.send(JSON.stringify(rows));
      });
    }
  });
});


//Go to reset-table first to create table
app.get('/reset-table',function(req,res,next){
    var context = {};
    dbconn.query("DROP TABLE IF EXISTS workouts", function(err){ 
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    dbconn.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

//Error handling
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});