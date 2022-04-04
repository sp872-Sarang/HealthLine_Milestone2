const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;
const functions = require("firebase-functions");

const serviceAccount = require("../HealthLine_Service_Account.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static("static/"));

// index page
app.get("/", function (req, res) {
  res.render("pages/index");
});


app.listen(port);
console.log("Server started at http://localhost:" + port);