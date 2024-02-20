import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: "AIzaSyBxQ8NDoqY2N4RkMoIQj7ht2VQCjqfefVg",
    authDomain: "zalo-project-f6a4d.firebaseapp.com",
    projectId: "zalo-project-f6a4d",
    storageBucket: "zalo-project-f6a4d.appspot.com",
    messagingSenderId: "317974607476",
    appId: "1:317974607476:web:0be560642c5e486eb68321",
    measurementId: "G-VVPXHJ1ET9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)




