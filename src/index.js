const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;
const functions = require("firebase-functions");

// CS5356 TODO #2
// Uncomment this next line after you've created
// serviceAccountKey.json
const serviceAccount = require("./../config/HealthLine_Service_Account.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");

// CS5356 TODO #2
// Uncomment this next block after you've created serviceAccountKey.json
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

app.get("/sign_in", function (req, res) {
  res.render("pages/sign_in");
});

app.get("/sign_up", function (req, res) {
  res.render("pages/sign_up");
});

app.get("/client_dashboard", authMiddleware, async function (req, res) {
  const feed = await userFeed.get();
  res.render("pages/Client_Dashboard", { user: req.user, feed });
});

app.get("/FAQ", function (req, res) {
  res.render("pages/FAQ");
});

app.get("/owner_dashboard", function (req, res) {
  res.render("pages/Owner_Dashboard");
});

app.get("/About_Us", function (req, res) {
  res.render("pages/About_Us");
});

app.post("/sessionLogin", async (req, res) => {
  // CS5356 TODO #4
  // Get the ID token from the request body
  // Create a session cookie using the Firebase Admin SDK
  // Set that cookie with the name 'session'
  // And then return a 200 status code instead of a 501
  console.log("in sessionLogin")
  console.log(req.body)
  //res.sendStatus(501)

  const idToken = req.body.idToken.toString();

  // Set session expiration to 1 hr.
  const expiresIn = 60 * 60  * 1000;
  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.

  admin.auth().createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        // Set cookie policy for session cookie.
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie('__session', sessionCookie, options);
        //res.sendStatus(200).send(JSON.stringify({ status: 'success' }));
        res.status(200).send(JSON.stringify({ status: 'success' }));
      },
      (error) => {
        res.status(401).send('UNAUTHORIZED REQUEST!');
      }
  );
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/sign_in");
});

//app.listen(port);
exports.helloWorld = functions.https.onRequest(app);
console.log("Server started at http://localhost:" + port);