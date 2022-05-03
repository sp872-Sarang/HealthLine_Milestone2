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

//firestore

const db = admin.firestore()

// module.exports = {
//   createUser: async (id, email, role) => {
//           const docRef = db.collection('users').doc(id)
//           await docRef.set({
//             email: email,
//             role: role,

//           })
//   },

//   getUserById: async (id) => {
//       const snapshot = await db.collection('users').get()
//       console.error(snapshot.docs)
//       return snapshot.docs[0].data()
//   }
// }

async function storeData(req){

  // const docRef = db.collection('users').doc(id)
  //         await docRef.set({
  //           email: email,
  //           role: role,

  //         })

  uuid = req.body.inputEmail.toString()

  const writeResult = await 
  db.collection('faq').doc(uuid).set({
  name: req.body.inputName.toString(),
  email: req.body.inputEmail.toString(),
  query: req.body.inputQuery.toString(),
  })
  .then(function() {console.log("Document successfully written!");})
  .catch(function(error) {console.error("Error writing document: ", error);});
  }

app.post('/insert_data', async (request,response) =>{
  var insert = await storeData(request);
  response.sendStatus(200);
  });

async function getFirestore(req){

  const collection_name = req.body.collectionName.toString()
  const document_id = req.body.documentId.toString()
  // const firestore_con  = await admin.firestore();
  const writeResult = await db.collection(collection_name).doc(document_id).get().then(doc => {
  if (!doc.exists) { console.log('No such document!'); }
  else {return doc.data();}})
  .catch(err => { console.log('Error getting document', err);});
  return writeResult
  }

async function getUserById (id) {
      const snapshot = await db.collection('faq').get()
      console.error(snapshot.docs)
      return snapshot.docs[0].data()
  }

app.post('/get_data', async (request,response) =>{
  var data = await getFirestore(request);
  console.log("Before Request");
  console.log(request.body.collectionName.toString());
  console.log(request.body.documentId.toString());
  console.log(data);
  console.log("Request is Incoming");

      
  const responseData = {
    collection_name : request.body.collectionName.toString(),
    document_id : request.body.documentId.toString(),
    req_data :data,
    status : 200
  }
  response.setHeader('Content-Type', 'application/json');
  
  // body: JSON.stringify({
  //   collectionName : 'faq',//'TEST',
  //   documentId : 'test23', //'justanotheremail@email.com',
  //   }
  const jsonContent = JSON.stringify(responseData);
  response.send(jsonContent);

  });

//app.listen(port);
exports.helloWorld = functions.https.onRequest(app);
console.log("Server started at http://localhost:" + port);