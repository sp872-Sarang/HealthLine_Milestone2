const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;
const functions = require("firebase-functions");

// app.engine('html', require('ejs').renderFile);
// app.set('views','./views');
// app.set('view engine','ejs');

// CS5356 TODO #2
// Uncomment this next line after you've created
// serviceAccountKey.json
// const serviceAccount = require("./../config/HealthLine_Service_Account.json");
const serviceAccount = require("./../config/serviceAccountKey.json");
const userFeed = require("./app/user-feed"); 
const UserService = require("./app/user-service"); 
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

app.get("/patient_sign_up", function (req, res) {
  res.render("pages/sign_up", { type: 'patient' });
});

app.get("/owner_sign_up", function (req, res) {
  res.render("pages/sign_up", { type: 'owner' });
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

app.post("/sessionLogin", authMiddleware, async (req, res) => {
  // CS5356 TODO #4
  // Get the ID token from the request body
  // Create a session cookie using the Firebase Admin SDK
  // Set that cookie with the name 'session'
  // And then return a 200 status code instead of a 501
  console.log("in sessionLogin")
  console.log(req.body)
  //res.sendStatus(501)

  const idToken = req.body.idToken.toString();
  const role = req.body.role;
  const signInType = req.body.signInType;

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
        admin.auth()
        .verifySessionCookie(sessionCookie, true /** checkRevoked */)
        .then(userData => {
          console.log("Logged in:", userData.email);
          const id = userData.sub;
          const email = userData.email;
          if (signInType === 'register') {
            UserService.createUser(id, email, role)
            .then(() => {
              res.status(200).send(JSON.stringify({ status: 'success' }));
            })
          } else {
            res.status(200).send(JSON.stringify({ status: 'success' }));
          }

          
        })
       
        //res.sendStatus(200).send(JSON.stringify({ status: 'success' }));
       
      },
      (error) => {
        res.status(401).send('UNAUTHORIZED REQUEST!');
      }
  );
});

app.post('/insert_data', async (request,response) =>{
  var insert = await storeData(request);
  response.sendStatus(200);
  });

app.get('/owner_dashboard',async (req,res) =>{
  var db_result = await getFirestore();
  // var db_result = await getUserById();
  res.render('pages/Owner_Dashboard', {
    db_result: db_result
    });
  });

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("__session");
  res.redirect("/sign_in");
});

// app.get('/', function(req, res, next) {
//   let usersData = db.collection('faq_form_data');
//   let query = usersData.get()
//     .then(snapshot => {
//       if (snapshot.empty) {
//         console.log('No matching documents.');
//         return;
//       }  

//       snapshot.forEach(doc => {
//         console.log(doc.data())
//       });
//     })
//     .catch(err => {
//       console.log('Error getting documents', err);
//     });

//     res.render('pages/Owner_Dashboard', {
//       faq_form_data: faq_form_data // Array of all the users.
//     });
// });

const db = admin.firestore();


  // async function createQuery (name, email, query){
  //     const docRef = db.collection('queries').doc('query')
  //     await docRef.set({
  //         name: name,
  //         email: email,
  //         query: query,
  //     })
  // }

  async function getData(req, res) {
    const faq_form_data = [];
    const querySnapshot = await firestore.collection('faq_form_data').get();
    querySnapshot.forEach(doc => {
     console.log(doc.id, ' => ', doc.data());
     faq_form_data.push(doc.data());
    });
   
    res.render('pages/Owner_Dashboard', {faq_form_data});
   }

  async function storeData(request){
    const writeResult = await 
    db.collection('faq_form_data').add({
    name: request.body.inputName,
    email: request.body.inputEmail,
    query: request.body.inputQuery,
    })
    .then(function() {console.log("Document successfully written!");})
    .catch(function(error) {console.error("Error writing document: ", error);});
    }

    async function getFirestore(){
      // const firestore_con  = await admin.firestore();
      const writeResult = await db.collection('faq_form_data').doc(id).get().then(doc => {
      if (!doc.exists) { console.log('No such document!'); }
      else {return doc.data();}})
      .catch(err => { console.log('Error getting document', err);});
      return writeResult
      }

    async function getUserById (id) {
          const snapshot = await db.collection('faq_form_data').get()
          console.error(snapshot.docs)
          return snapshot.docs[0].data()
      }

    // const faq_query = document.querySelector('#FAQ-list')

    // function renderQuery(doc){
    //   let qu = document.createElement('qu')
    //   let question = document.createElement('span')
    //   let p_name = document.createElement('span')

    //   qu.setAttribute('data-id', doc.id)
    //   question.textContent = doc.data().query
    //   p_name.textContent = doc.data().name

    //   qu.appendChild(question)
    //   qu.appendChild(p_name)

    //   faq_query.appendChild(qu)
    // }

    // db.collection('faq_form_data').get().then((snapshot) => {
    //   snapshot.docs.forEach(doc => {
    //     renderQuery(doc)
    //   })
    // })

  // async function storeData (name, email, query){  
  //   var inputName = document.getElementById('inputName').value;
  //   var inputEmail = document.getElementById('inputEmail').value;
  //   var inputQuery = document.getElementById('inputQuery').value;

  //   const docRef = db.collection('queries').doc(id)
  //   await docRef.set({
  //   name: inputName,
  //   email: inputEmail,
  //   query: inputQuery,
  //   })

  //   }

    // db.collection("queries").doc('query').set({
    //     name: 'THIS',
    //     email: 'IS',
    //     query: 'Test',
    // })


    // function storeData() {

    //     var inputName = document.getElementById('inputName').value;
    //     var inputEmail = document.getElementById('inputEmail').value;
    //     var inputQuery = document.getElementById('inputQuery').value;

    //     db.collection("queries").doc('query').set({
    //       name: inputName,
    //       email: inputEmail,
    //       query: inputQuery,
    //   })

    // }


//app.listen(port);
// exports.helloWorld = functions.https.onRequest(app);
exports.app = functions.https.onRequest(app);
console.log("Server started at http://localhost:" + port);