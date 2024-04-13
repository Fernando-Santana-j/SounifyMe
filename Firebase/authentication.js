



try {
    const { initializeApp } = require('firebase/app')
    const { getAuth, GoogleAuthProvider,sendPasswordResetEmail, updateCurrentUser, browserSessionPersistence,setPersistence, signInWithPopup ,createUserWithEmailAndPassword,fetchSignInMethodsForEmail, onAuthStateChanged, signInWithEmailAndPassword, signOut } = require('firebase/auth')
    var functions = require('../functions')
    const db = require('./models')

    const firebaseDATA = require('../config/index-config').firebaseConfig


    const firebaseApp = initializeApp(firebaseDATA);
    const provider = new GoogleAuthProvider();

    const auth = getAuth();
    async function createDb(user) {
        await db.findOne({colecao:"users",doc:user.uid}).then(async(result2)=>{
            if (result2) {
                return
            }else{
                let displayName = user.displayName == null || user.displayName == undefined ? user.email.split('@')[0] : user.displayName
                let displayNameModify = await require('../functions').stringLimit(displayName,16)
                let idCount = await db.findOne({colecao:"statistics",doc:'users'})
                await db.create('users',user.uid,{
                    id: idCount.userCount,
                    uid:user.uid,
                    displayName: displayNameModify,
                    profilePic: user.photoURL == undefined || user.photoURL == null ? 'https://res.cloudinary.com/dgcnfudya/image/upload/v1689452893/j4tfvjlyp1ssspbefzg9.png' : user.photoURL,
                    email: user.email,
                    emailVerificad: user.emailVerified == undefined ? null : user.emailVerified,
                    phoneNumber: user.phoneNumber == undefined ? null : user.phoneNumber,
                    accessToken: user.stsTokenManager.accessToken,
                    provider: user.providerId == undefined? null : user.providerId,
                    banda: false,
                    banner: {
                        type: 'color',
                        content: '7000FF'
                    },
                    folowInfo:{
                        seguidores: [],
                        seguindo: []
                    },
                    joinroom:null,
                    blockedUsers:[]
                }).then(()=>{
                    
                })
            }
        })
        
    }
    
    module.exports = {
        resetPass: async (email)=>{
            return sendPasswordResetEmail(auth,email).then(() => {
                return {
                    success:true,
                    mensage:'E-mail de redefinição de senha enviado!'
                }

            }).catch((error) => {
                return {
                    success:false,
                    mensage:`Erro ao enviar o e-mail de redefinição de senha verifique se o email esta correto ou atualize a pagina!`
                } 
            });
        },
        googleLogin: async (req,res)=>{
            let userdata = JSON.parse(req.body.user)
            if (req.session.uid) {
                return
            }
            if (userdata.uid) {
                let accessToken = userdata.stsTokenManager.accessToken
                await require('../functions').verifyAuthToken(accessToken).then(async(result)=>{
                    if (result) {
                        req.session.uid = result
                        req.session.accesstoken = accessToken
                        await createDb(userdata)
                    }
                    return
                })
            }
        },
        singInEmail: async (req,res)=>{
            setPersistence(auth, browserSessionPersistence).then(() => {
                signInWithEmailAndPassword(auth, req.body.email, req.body.senha).then(async(userCredential) => {
                    const user = userCredential.user;

                    if (user) {
                        let accessToken = user.stsTokenManager.accessToken
                        await require('../functions').verifyAuthToken(accessToken).then((result)=>{
                            if (result) {
                                req.session.uid = result
                                req.session.accesstoken = accessToken
                                return res.redirect('/home')
                            }
                        })
                    }
                }).catch((error)=>{
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(error);
                    if (errorCode == 'auth/wrong-password') {
                        return res.redirect('/login?pass=invalid')
                    }
    
                })
            })
    
        },
        singUpEmail: async (req,res)=>{
            setPersistence(auth, browserSessionPersistence).then(() => {
                createUserWithEmailAndPassword(auth,req.body.email, req.body.senha).then(async(userCredential) => {
                    const user = userCredential.user;
                    if (user) {
                        user.displayName = req.body.username
                        let accessToken = user.stsTokenManager.accessToken
                        await require('../functions').verifyAuthToken(accessToken).then(async(result)=>{
                            if (result) {
                                req.session.uid = result
                                req.session.accesstoken = accessToken
                                await createDb(user)
                                return res.redirect('/home')
                            }
                        })
                    }
                })
            })
        },
        authenticateSpotify: async()=>{
            const clientId = require('../config/index-config').spotifyClientId;
            const clientSecret = require('../config/index-config').spotifyClientSecret;
            const response = await fetch('https://accounts.spotify.com/api/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
              },
              body: 'grant_type=client_credentials',
            });
            const data = await response.json();
            return data.access_token
    
          }
    }
    module.exports.status = 'OK' 
} catch (error) {
    module.exports.status = 'ERROR' 
}
