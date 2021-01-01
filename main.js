const express = require("express");
const fs = require("fs");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

//static directory
app.use(express.static("static"));

//Home Page :index.html
app.get("/", (req, res) => {
  res.sendFile("./static/app.html");
});

port = 3000;
app.listen(port, (err) => {
  console.log(`listening on port ${port}...`);
});
