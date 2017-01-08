var express = require("express");
var fs = require("fs");
var app = express();

var html_dir = __dirname + '/html/';

app.get("/", (req,res) => {
	res.sendFile("index.html", {root:html_dir});
});

app.get("/old", (req,res) => {
	res.sendFile("oldindex.html", {root:html_dir});
});

app.use('/public', express.static(__dirname + '/public'));

app.listen(8080, () => {
	console.log("Listening in port 8080");
});