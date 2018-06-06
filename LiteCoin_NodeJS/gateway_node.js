// Required Modules
var litecoin = require('node-litecoin');
var express = require("express");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
var app = express();
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "hacker",
  database: "LiteCoinGateWay"
});

var client = new litecoin.Client({
    host: 'localhost',
    port: 16001,
    user: 'user',
    pass: 'pass'
  });

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.listen(3001);

app.get("/addaccount.html", function(req, res){
    res.render('pages/addaccount');
});

app.get("/createrawtransaction.html", function(req, res){
    res.render('pages/createrawtransaction');
});


app.post("/api/addaccount", parser, function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var account = username;
    var query = "INSERT INTO `USER`(`username`, `password`, `account`) VALUES ('"+username+"','"+password+"','"+account+"')";
    console.log(query);
    con.query(query, function (err, result) {
        if (err) throw err;
        console.log('Created username: '+ username +' on DB');
        client.cmd('getnewaddress', account, function(err, result) {
            if (err) return res.send(err);
            var address = result;
            addaddress(account, address);
            res.send({address: result}); 
        });
    });
  
});


app.post("/api/createrawtransaction", parser,async function(req, res){
    //var txid = req.body.txid;
    var address = req.body.address;
    var toaddress = req.body.toaddress;
    var amount = parseInt(req.body.amount);

    var lsUnspent = [];
    var sc
    var sum = 0;
    var fee = 0.02;

    client.cmd("listunspent", await function(err,result){
        if(err) return res.send(err);
        var i = amount;
        result.forEach(item => {
            if(item.address == address && i > 0){
                lsUnspent.push({"txid": item.txid, "vout": item.vout, "scriptPubKey": item.scriptPubKey});
                i = i - item.amount;
                sum += item.amount;
            }   
        });
        if(sum >= amount){
            console.log(lsUnspent);
            console.log(sum);
            var outputs = JSON.parse('{"'+toaddress+'":'+amount+', "'+address+'":'+(sum-amount-fee)+'}');
            console.log(outputs);
            client.cmd("createrawtransaction", lsUnspent, outputs, function(err,result){
                if(err) return res.send(err);
                console.log(result);
                signrawtransaction(result, lsUnspent, address, res);
            });
        }
        else{
            res.send({data:null});
        }
    });

    
});

function addaccount(username, password){
    con.query("INSERT INTO 'ADDRESS'('account', 'address', 'privatekey') VALUES ('"+account+"','"+address+"','"+privkey+"')", function (err, result) {
        if (err) throw err;
        console.log('Created username: '+ username +' with address: '+address+' on DB');
    });
}

function addaddress(account, address){
    client.cmd('dumpprivkey', address, function(err, result) {
        //if (err) throw err;
        var privkey = result;
        console.log(privkey, account, address);
        con.query("INSERT INTO `ADDRESS`(`account`, `address`, `privatekey`) VALUES ('"+account+"','"+address+"','"+privkey+"')", function (err, result) {
            if (err) throw err;
            console.log('Created account: '+ account +' with address: '+address+'on DB');
        });
    });
}

function signrawtransaction(hexstring, lsUnspent, address, res){
    var query = "SELECT `privatekey` FROM `ADDRESS` WHERE address = '"+address+"'";
    //console.log(query);
    con.query(query, function (err, result) {
        if (err) res.send({data: null});
        var privkey = result[0].privatekey;

        client.cmd("signrawtransaction", hexstring, lsUnspent, [privkey], function (err, result) {
            if(err) return res.send(err);
            console.log(result);
            client.cmd("sendrawtransaction", result.hex, function(err, result){
                if(err) return res.send(err);
                console.log(result);
                res.send({txid: result});
            });
            
        });
    });

}


