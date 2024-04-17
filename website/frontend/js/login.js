// import * as firebase from 'firebase/auth';
// import 'firebase/auth';
// import * as firebaseui from 'firebaseui'

// import { initializeApp } from "firebase/app";

// import { getAnalytics } from "firebase/analytics";

// Import the functions you need from the SDKs you need

// import { initializeApp } from "firebase/app";

// import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyDiZli11fN1qlg8qoJvntycALm9eyS9Iwk",

  authDomain: "fantasy-valorant-d2588.firebaseapp.com",

  projectId: "fantasy-valorant-d2588",

  storageBucket: "fantasy-valorant-d2588.appspot.com",

  messagingSenderId: "419164409115",

  appId: "1:419164409115:web:3172a1aa23ccc3c99317be",

  measurementId: "G-GK0SLGNZ1E"

};

;
window.addEventListener('load', () => {
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);

  // const analytics = getAnalytics(app);

  const ui = new firebaseui.auth.AuthUI(firebase.auth());

  ui.start('#firebaseui-auth-container', {
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    signInSuccessUrl: '../html/success.html',
    // emailLinkSignIn: function() {
    //   return {
    //     url: '../html/success.html',
    //   }
    // },

    // Other config options...
  });

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is already signed in, redirect to appropriate page
      console.log('User already signed in:', user);
      window.location.href = '../html/success.html';
      // Your redirection logic here (e.g., welcome page)
    } else {
      // User is not signed in, proceed with FirebaseUI login flow
      const uiConfig = {
          signInSuccessUrl: '/success.html',
          signInOptions: [
              firebase.auth.EmailAuthProvider.PROVIDER_ID
          ]
      };
      // Start FirebaseUI with the configuration
    }
  });
  

  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const loginUsername = document.getElementById('loginUsername');
    console.log(loginUsername.value);

    const loginPassword = document.getElementById('loginPassword');
    console.log(loginPassword.value)
  })
  
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const registerUsername = document.getElementById('registerUsername');
    console.log(registerUsername.value);

    const registerPassword = document.getElementById('registerPassword');
    console.log(registerPassword.value)
  })
});