import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, browserSessionPersistence ,setPersistence,  signInWithPopup ,createUserWithEmailAndPassword,fetchSignInMethodsForEmail, onAuthStateChanged, signInWithEmailAndPassword  } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';


var firebaseDATA = null
await $.post('/firebaseApp', (data)=>{
    firebaseDATA = data
})

// var url = new URL(window.location.href);
// var params = new URLSearchParams(url.search);

const firebaseApp = initializeApp(firebaseDATA);
const provider = new GoogleAuthProvider();

const auth = getAuth();

let data ={
    auth:auth,
    firebaseApp:firebaseApp,
    provider:provider
}

export default data