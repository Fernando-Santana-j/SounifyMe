const { json } = require('body-parser')

require('dotenv').config()
let serviceAccount = JSON.parse(process.env.SERVICEACCOUNT)
let firebaseConfig = JSON.parse(process.env.FIREBASECONFIG)

module.exports = {
    session:{
        secret: process.env.SECRET || "290j15mpjn0nf09wnf9032hbt30ng093bg209gn9320gh092ng302hg29bg30",
        resave: false, 
        saveUninitialized: false,
    },
    port: process.env.PORT || 3000,
    serviceAccount: serviceAccount,
    firebaseConfig:firebaseConfig,
    lastFmKey: process.env.LASTFMKEY,
    spotifyClientId:  process.env.SPOTIFYCLIENTID,
    spotifyClientSecret: process.env.SPOTIFYCLIENTSECRET,
    googleYoutubeToken: process.env.GOOGLEYOUTUBETOKEN
}