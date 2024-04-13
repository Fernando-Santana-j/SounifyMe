import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signOut} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';


var firebaseDATA = null
await $.post('/firebaseApp', (data)=>{
    firebaseDATA = data
})

const firebaseApp = initializeApp(firebaseDATA);
const auth = getAuth();


signOut(auth).then(() => {
    location.href = '/login'
})
