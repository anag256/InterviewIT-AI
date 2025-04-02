// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIQP3qS1fh2Yy_FlBl9TYjfEqg-RLuqMw",
  authDomain: "interviewit-a00c7.firebaseapp.com",
  projectId: "interviewit-a00c7",
  storageBucket: "interviewit-a00c7.firebasestorage.app",
  messagingSenderId: "24540408388",
  appId: "1:24540408388:web:07642ba056d32aa3e66a11",
  measurementId: "G-81MNM8XXFT"
};

// Initialize Firebase
const app =!getApps.length ?  initializeApp(firebaseConfig) : getApp();
export const auth=getAuth(app);
export const db=getFirestore(app);