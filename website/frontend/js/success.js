const firebaseConfig = {
  apiKey: "AIzaSyDiZli11fN1qlg8qoJvntycALm9eyS9Iwk",
  authDomain: "fantasy-valorant-d2588.firebaseapp.com",
  projectId: "fantasy-valorant-d2588",
  storageBucket: "fantasy-valorant-d2588.appspot.com",
  messagingSenderId: "419164409115",
  appId: "1:419164409115:web:3172a1aa23ccc3c99317be",
  measurementId: "G-GK0SLGNZ1E"
};

window.addEventListener('load', () => {
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);

  // const analytics = getAnalytics(app);
  
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const username = urlParams.get('username');
  console.log('username', username);

  // Display the username on the page
  document.getElementById("userDisplay").textContent = `Welcome ${username}!`;
});