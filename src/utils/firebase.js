import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: "AIzaSyAFn614q6SXvpNBGTqxwWBUiXiK1sId9FY",
    authDomain: "zalo-web.firebaseapp.com",
    projectId: "zalo-web",
    storageBucket: "zalo-web.appspot.com",
    messagingSenderId: "397340346509",
    appId: "1:397340346509:web:bcbd80745003ae254dbac4",
    measurementId: "G-WGVDH2K1EN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)




