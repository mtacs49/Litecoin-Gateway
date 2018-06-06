var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "hacker",
  database: "LiteCoinGateWay"
});

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });


con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("SELECT * FROM USER", function (err, result) {
      if (err) throw err;
      console.log(result);
    });
  }); 

  
