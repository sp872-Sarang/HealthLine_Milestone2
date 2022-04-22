const admin = require("firebase-admin");
const serviceAccount = require("./../../config/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


module.exports = {
    createUser: async (id, email, role) => {
            const docRef = db.collection('users').doc(id)
            await docRef.set({
              email: email,
              role: role,

            })
    },

    getUserById: async (id) => {
        const snapshot = await db.collection('users').get()
        console.error(snapshot.docs)
        return snapshot.docs[0].data()
    }
}