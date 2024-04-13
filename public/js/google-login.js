import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, GoogleAuthProvider,onAuthStateChanged, browserSessionPersistence ,setPersistence,   signInWithRedirect } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';



var firebaseDATA = null
await $.post('/firebaseApp', (data)=>{
    firebaseDATA = data
})


const firebaseApp = initializeApp(firebaseDATA);
const provider = new GoogleAuthProvider();

const auth = getAuth();
auth.onAuthStateChanged(function(user) {
    if (user) {
        window.location.href = location.origin + "/home";
    } 
});
document.getElementById('cancelar').addEventListener('click',()=>{
    window.location.href = location.origin + "/login";
})
document.getElementById('aceitar').addEventListener('click',()=>{
    signInWithRedirect(auth,provider)    
})
