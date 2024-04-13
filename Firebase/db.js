try {
  const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
  const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
  var admin = require("firebase-admin");


  var serviceAccount = require('../config/index-config').serviceAccount


  initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL,
  });

  const db = getFirestore();

  module.exports = db
  module.exports.status = 'OK' 
} catch (error) {
  module.exports.status = 'ERROR'
}