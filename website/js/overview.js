const firebaseConfig = {
  apiKey: "AIzaSyDiZli11fN1qlg8qoJvntycALm9eyS9Iwk",
  authDomain: "fantasy-valorant-d2588.firebaseapp.com",
  projectId: "fantasy-valorant-d2588",
  storageBucket: "fantasy-valorant-d2588.appspot.com",
  messagingSenderId: "419164409115",
  appId: "1:419164409115:web:3172a1aa23ccc3c99317be",
  measurementId: "G-GK0SLGNZ1E"
};

const FANTASY_LEAGUES_COLLECTION_STRING = "fantasy_leagues";

window.addEventListener('load', () => {
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);

  // const analytics = getAnalytics(app);

  // Check if the user is signed in
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      document.querySelector("#userInfo").innerHTML = `Welcome ${user.displayName}!`;
      
      // Initialize Cloud Firestore and get a reference to the service
      const db = firebase.firestore();

      const availableLeaguesDb = db.collection(FANTASY_LEAGUES_COLLECTION_STRING);
      availableLeaguesDb.onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          const doc = change.doc;
          const availableLeagueData = doc.data();
          
          // Note that relative to the first page load, all documents retrieved from
          // the collection are considered to be "added"
          if (change.type === "added") {
            console.log("New league added to fantasy leagues database:", doc.data());
            console.log(availableLeagueData);
            const leagueUserUIDs = availableLeagueData["userUIDs"];
            if (leagueUserUIDs.includes(user.uid)) { // if user is in the league, show in "your leagues"
              const row = userLeaguesInfo.insertRow();
              row.id = doc.id;

              const leagueName = row.insertCell(0);
              leagueName.innerHTML = availableLeagueData["name"];
              
              const leagueNumUsers = row.insertCell(1);
              leagueNumUsers.innerHTML = availableLeagueData["numUsers"];

              const viewLeagueDetailsCell = row.insertCell(2);
              const viewLeagueDetailsButton = document.createElement("button");
              viewLeagueDetailsButton.innerHTML = "View League Details"
              viewLeagueDetailsButton.id = doc.id + "_viewLeagueDetails"
              viewLeagueDetailsButton.addEventListener("click", function() {
                sessionStorage.setItem("shorthandName", `${row.id}`);
                sessionStorage.setItem("name", availableLeagueData["name"]);
                window.location.href = "league.html";
              })
              viewLeagueDetailsCell.append(viewLeagueDetailsButton);

              // const leaveLeagueCell = row.insertCell(2);
              // const leaveLeagueButton = document.createElement("button");
              // leaveLeagueButton.innerHTML = "Leave League"
              // leaveLeagueButton.id = doc.id + "_leaveLeague"
              // leaveLeagueButton.addEventListener("click", function() {
              //   const newLeagueUserUIDs = availableLeagueData["userUIDs"].filter(item => item !== user.uid)
              //   db.collection(FANTASY_LEAGUES_COLLECTION_STRING).doc("2025_americas_split1").update({"numUsers": availableLeagueData["numUsers"] - 1, "userUIDs": newLeagueUserUIDs})
              // })

              // leaveLeagueCell.append(leaveLeagueButton);
            }
            else { // if user is not in the league, show in "available leagues"
              const row = availableLeaguesInfo.insertRow();
              row.id = doc.id;

              const leagueName = row.insertCell(0);
              leagueName.innerHTML = availableLeagueData["name"];
              
              const leagueNumUsers = row.insertCell(1);
              leagueNumUsers.innerHTML = availableLeagueData["numUsers"];

              const joinLeagueCell = row.insertCell(2);
              const joinLeagueButton = document.createElement("button");
              joinLeagueButton.innerHTML = "Join League"
              joinLeagueButton.id = doc.id + "_joinLeague"
              joinLeagueButton.addEventListener("click", function() {
                const fantasyLeagueName = this.id.substring(0, this.id.indexOf("_joinLeague"));
                availableLeagueData["userUIDs"].push(user.uid);
                availableLeagueData["userNames"].push(user.displayName.split(" ")[0]);
                db.collection(FANTASY_LEAGUES_COLLECTION_STRING).doc(fantasyLeagueName).update({"numUsers": availableLeagueData["numUsers"] + 1, "userUIDs": availableLeagueData["userUIDs"], "userNames": availableLeagueData["userNames"]})
              })

              joinLeagueCell.append(joinLeagueButton);
            }
          }
          else if (change.type === "modified") {
            // triggers when user joins/leaves league
            // leaving the league is a particularly complicated process due to releasing all of user's players back into the pool
            console.log("League modified in fantasy leagues database:", doc.data());

            const leagueUserUIDs = availableLeagueData["userUIDs"];
            if (leagueUserUIDs.includes(user.uid)) { // if user is in the league, show in "your leagues"
              const availableLeaguesRow = document.getElementById(doc.id);
              availableLeaguesRow.remove();

              const row = userLeaguesInfo.insertRow();
              row.id = doc.id;

              const leagueName = row.insertCell(0);
              leagueName.innerHTML = availableLeagueData["name"];
              
              const leagueNumUsers = row.insertCell(1);
              leagueNumUsers.innerHTML = availableLeagueData["numUsers"];
              
              const viewLeagueDetailsCell = row.insertCell(2);
              const viewLeagueDetailsButton = document.createElement("button");
              viewLeagueDetailsButton.innerHTML = "View League Details"
              viewLeagueDetailsButton.id = doc.id + "_viewLeagueDetails"
              viewLeagueDetailsButton.addEventListener("click", function() {
                sessionStorage.setItem("shorthandName", `${row.id}`);
                sessionStorage.setItem("name", availableLeagueData["name"]);
                window.location.href = "league.html";
              })
              viewLeagueDetailsCell.append(viewLeagueDetailsButton);

              // const leaveLeagueCell = row.insertCell(2);
              // const leaveLeagueButton = document.createElement("button");
              // leaveLeagueButton.innerHTML = "Leave League"
              // leaveLeagueButton.id = doc.id + "_leaveLeague"
              // leaveLeagueButton.addEventListener("click", function() {
              //   const fantasyLeagueName = this.id.substring(0, this.id.indexOf("_leaveLeague"));
              //   const newLeagueUserUIDs = availableLeagueData["userUIDs"].filter(item => item !== user.uid)
              //   db.collection(FANTASY_LEAGUES_COLLECTION_STRING).doc(fantasyLeagueName).update({"numUsers": availableLeagueData["numUsers"] - 1, "userUIDs": newLeagueUserUIDs})
              // })

              // leaveLeagueCell.append(leaveLeagueButton);
            }
            else { // if user is not in the league, show in "available leagues"
              const userLeaguesRow = document.getElementById(doc.id);
              userLeaguesRow.remove();

              const row = availableLeaguesInfo.insertRow();
              row.id = doc.id;

              const leagueName = row.insertCell(0);
              leagueName.innerHTML = availableLeagueData["name"];
              
              const leagueNumUsers = row.insertCell(1);
              leagueNumUsers.innerHTML = availableLeagueData["numUsers"];

              const joinLeagueCell = row.insertCell(2);
              const joinLeagueButton = document.createElement("button");
              joinLeagueButton.innerHTML = "Join League"
              joinLeagueButton.id = doc.id + "_joinLeague"
              joinLeagueButton.addEventListener("click", function() {
                const fantasyLeagueName = this.id.substring(0, this.id.indexOf("_joinLeague"));
                availableLeagueData["userUIDs"].push(user.uid);
                availableLeagueData["userNames"].push(user.displayName);
                db.collection(FANTASY_LEAGUES_COLLECTION_STRING).doc(fantasyLeagueName).update({"numUsers": availableLeagueData["numUsers"] + 1, "userUIDs": availableLeagueData["userUIDs"], "userNames": availableLeagueData["userNames"]})
              })

              joinLeagueCell.append(joinLeagueButton);
            }
          }
          else if (change.type === "removed") {
            // should probably never trigger
            console.log("New league removed from fantasy leagues database:", doc.data());
          }
          else {
            console.error("unexpected change type for server database")
          }
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