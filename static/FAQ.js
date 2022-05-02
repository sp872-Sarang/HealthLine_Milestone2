// const admin = require("firebase-admin");
// const serviceAccount = require("./../../config/serviceAccountKey.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();

// async function storeData (name, email, query){  
//     var inputName = document.getElementById('inputName').value;
//     var inputEmail = document.getElementById('inputEmail').value;
//     var inputQuery = document.getElementById('inputQuery').value;

//     const docRef = db.collection('queries').doc(id)
//     await docRef.set({
//     name: inputName,
//     email: inputEmail,
//     query: inputQuery,
//     })

//     }