const admin = require('firebase-admin');
const serviceAccount = require('./login-system-114fe-firebase-adminsdk-fbsvc-1908753cba.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };
