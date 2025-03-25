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

  // Check if the user is signed in
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, display user information
      const userInfo = `
        <strong>User Info:</strong><br>
        UID: ${user.uid}<br>
        Email: ${user.email}<br>
        Display Name: ${user.displayName || 'N/A'}<br>
        Photo URL: <img src="${user.photoURL || 'https://www.gstatic.com/webp/gallery/1.jpg'}" alt="User Photo" width="50" />
      `;
      document.querySelector("#userInfo").innerHTML = userInfo;
    } else {
      // User is not signed in, redirect back to login
      // console.log("user not signed in")
      window.location.href = "login.html";
    }
  });
});

// Bind logout event to logout button
document.querySelector("#logout").addEventListener("click", logoutUser);

function logoutUser() {
  firebase.auth().signOut().then(() => {
    // console.log("User logged out");
    window.location.href = "login.html"; // Redirect to login page after logout
  }).catch((error) => {
    console.error("Error logging out:", error.message);
  });
}