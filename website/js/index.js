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

const app = firebase.initializeApp(firebaseConfig);
window.addEventListener('load', () => {
  // if user is logged in, direct to homepage
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      window.location.href = "overview.html"
    }
  });

  // const analytics = getAnalytics(app);

  const ui = new firebaseui.auth.AuthUI(firebase.auth());

  const uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        return true;
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
        // document.getElementById('loader').style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'overview.html',
    signInOptions: [
      // r.e. email signin with email/password instead of email link:
      // https://github.com/firebase/firebaseui-web/issues/1040
      // https://cloud.google.com/identity-platform/docs/admin/email-enumeration-protection#disable
      // probably opens up some attack vectors but I don't care enough right now
      // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    // Terms of service url.
    tosUrl: '<your-tos-url>',
    // Privacy policy url.
    privacyPolicyUrl: '<your-privacy-policy-url>'
  };

  ui.start('#firebaseui-auth-container', uiConfig);
});