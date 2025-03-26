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
        UID: ${user.uid || 'N/A'}<br>
        Email: ${user.email || 'N/A'}<br>
        Display Name: ${user.displayName || 'N/A'}<br>
      `;
      document.querySelector("#userInfo").innerHTML = userInfo;
      
      // Initialize Cloud Firestore and get a reference to the service
      const db = firebase.firestore();
      db.collection("players").get().then((querySnapshot) => {
        const playersInfo = document.querySelector("#playersInfo > tbody");
        querySnapshot.forEach((doc) => {
          console.log(doc.id, "=>", JSON.stringify(doc.data(), null, 2));
          let playerData = doc.data();
          let row = playersInfo.insertRow();
          let playerName = row.insertCell(0);
          playerName.innerHTML = doc.id; 
          
          let playerTeam = row.insertCell(1);
          playerTeam.innerHTML = playerData['team'];
          
          let playerACS = row.insertCell(2);
          playerACS.innerHTML = playerData['ACS'];
        });
      });

      // Bind logout event to logout button
      document.querySelector("#logout").addEventListener("click", logoutUser);
    } else {
      // User is not signed in, redirect back to login
      // console.log("user not signed in")
      window.location.href = "index.html";
    }
  });
});

function logoutUser() {
  firebase.auth().signOut().then(() => {
    // console.log("User logged out");
    window.location.href = "index.html"; // Redirect to login page after logout
  }).catch((error) => {
    console.error("Error logging out:", error.message);
  });
}