// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZZhUrD_kj9Nd56qrA1T6UmuUkOR-oX6s",
  authDomain: "live-quiz-application.firebaseapp.com",
  projectId: "live-quiz-application",
  storageBucket: "live-quiz-application.firebasestorage.app",
  messagingSenderId: "859326628125",
  appId: "1:859326628125:web:783e42ab02a18cfeb6a1f4",
  measurementId: "G-7YYGVKYDKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app);

export { app, auth };
