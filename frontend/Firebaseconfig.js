// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyChQKvQEKS37ojTfB03Yy-dEVLG75vNcZA",
    authDomain: "chatbot-eb827.firebaseapp.com",
    projectId: "chatbot-eb827",
    storageBucket: "chatbot-eb827.firebasestorage.app",
    messagingSenderId: "426689128610",
    appId: "1:426689128610:web:047b635ff2c71bce450ffb",
    measurementId: "G-KYCT81FXMF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

