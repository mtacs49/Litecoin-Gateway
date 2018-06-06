// Required Modules
var litecoin = require('node-litecoin');
var express = require("express");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
var app = express();

var client = new litecoin.Client({
    host: 'localhost',
    port: 16001,
    user: 'user',
    pass: 'pass'
  });

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.listen(3000);

app.get("/", function(req, res){
    res.render('home');
});

app.get("/products.html", function(req, res){
    res.render('pages/products');
});

app.get("/payment.html", function(req, res){
    client.cmd('getaddressesbyaccount', 'shop', function(err, result) {
        if (err) return res.send(err);
        if (result == []){
            client.cmd('getnewaddress', 'shop', function(err, result) {
                if (err) return res.send(err);
                res.render('pages/payment', {address: result});
            });
        }else{
            res.render('pages/payment', {address: result[0]});
        }
    });
});

app.get("/account.html/:account", function(req, res){
    var name = req.params.account;
    client.cmd('getbalance', name, function(err, result) {
        if (err) return res.send(err);
        var balance = result;
        client.cmd('getaddressesbyaccount', name, function(err, result) {
            if (err) return res.send(err);
            var addresses = result;
            client.cmd('listtransactions', name, 10, function(err, result) {
                if (err) return res.send(err);
                var transactions = result;
                
                res.render('pages/account', {
                    name: name,
                    balance: balance,
                    addresses: addresses,
                    transactions: transactions
                });
            }); 
        });  
    });
    
});

app.get("/api/accounts", function(req, res){
    client.cmd('listaccounts', function(err, result) {
        if (err) return res.send(err);
        res.send({data: result});
    });
	
});

app.get("/balance/root", function(req, res){
    client.cmd('getbalance', '', function(err, result) {
        if (err) return res.send(err);
        res.send({data: result, account: ''});
    });
	
});

app.get("/balance/:account", function(req, res){
    var account = req.params.account
    client.cmd('getbalance', account, function(err, result) {
        if (err) return res.send(err);
        res.send({data: result, account: account});
    });
	
});

app.get("/transaction/:txhash", function(req, res){
    var txhash = req.params.txhash
    client.cmd('gettransaction', txhash, function(err, result) {
        if (err) return res.send(err);
        res.send({data: result});
    });
	
});

app.get("/block/:blockhash", function(req, res){
    var blockhash = req.params.blockhash
    client.cmd('getblock', blockhash, function(err, result) {
        if (err) return res.send(err);
        res.send({data: result});
    });
	
});

app.get("/blockhash/:id", function(req, res){
    var id = parseInt(req.params.id, 10);
    client.cmd('getblockhash', id, function(err, result) {
        if (err) return res.send(err);
        res.send({data: result});
    });
	
});

app.get("/api/getbestblockhash", function(req, res){
    client.cmd('getbestblockhash', function(err, result) {
        if (err) return res.send(err);
        res.send({data: result});
    });
	
});



app.get("/api/getnewaddress/:account", function(req, res){
    var account = req.params.account
    client.cmd('getnewaddress', account, function(err, result) {
        if (err) return res.send(err);
        res.send({data: result});
    });
	
});


app.get("/api/getaddressesbyaccount/:account", function(req, res){
    var account = req.params.account
    client.cmd('getaddressesbyaccount', account, function(err, result) {
        if (err) return res.send(err);
        res.send({data: result});
    });
	
});

app.get("/listaddressgroupings", function(req, res){
    client.cmd('listaddressgroupings', function(err, result) {
        if (err) return res.send(err);
        res.send({data: result});
    });
	
});

app.post('/api/sendfrom', parser, function(req, res){
    var account = req.body.account;
    var address = req.body.address;
    var amount = parseInt(req.body.amount, 10);
    console.log('Send from '+ account + ' to ' + address + ' ' + amount + 'LTE');
    client.cmd('sendfrom', account, address, amount, function(err, result) {
        if (err) return res.send(err);
        console.log(result);
        res.send({txid: result}); 
    });
	
});

app.get('/listreceivedbyaccount', function(req, res){
    client.cmd('listreceivedbyaccount',  function(err, result) {
        if (err) return res.send(err);
        res.send({data: result});
    });
	
});
 