let sortDirection = 1;

function sortTable(tableId, columnIndex, toggleDirection) {
  const table = document.getElementById(`${tableId}`);
  const rows = Array.from(table.rows).slice(1); // Skip header row
  const tbody = table.tBodies[0];

  // Toggle sort direction
  if (toggleDirection)
    sortDirection = -sortDirection;

  rows.sort((a, b) => {
    let cellA = a.cells[columnIndex].innerText;
    let cellB = b.cells[columnIndex].innerText;

    // Try to compare as numbers if possible
    const numA = parseFloat(cellA);
    const numB = parseFloat(cellB);
    const isNumeric = !isNaN(numA) && !isNaN(numB);

    if (isNumeric) {
      return sortDirection * (numA - numB);
    } else {
      return sortDirection * cellA.localeCompare(cellB);
    }
  });

  // Re-append sorted rows
  for (let row of rows) {
    tbody.appendChild(row);
  }
}

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
  let playersInfoCols = document.querySelectorAll("table#playersInfo th")
  for (let i = 0; i < playersInfoCols.length - 1; i++) {
    let curPlayerInfoCol = playersInfoCols[i];
    curPlayerInfoCol.addEventListener("click", () => sortTable("playersInfo", `${i}`, true));
  }

  let userPlayersInfoCols = document.querySelectorAll("table#userPlayersInfo th")
  for (let i = 0; i < userPlayersInfoCols.length - 1; i++) {
    let curPlayerInfoCol = userPlayersInfoCols[i];
    curPlayerInfoCol.addEventListener("click", () => sortTable("userPlayersInfo", `${i}`, true));
  }
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);

  // const analytics = getAnalytics(app);

  // Check if the user is signed in
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // Initialize Cloud Firestore and get a reference to the service
      const db = firebase.firestore();
      
      const leagueName = sessionStorage.getItem("name");
      const playersDb = db.collection("fantasy_leagues").doc(leagueName).collection("players");
      playersDb.onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          const doc = change.doc;
          const playerData = doc.data();
          // console.log(doc.id, "=>", JSON.stringify(doc.data(), null, 2));

          // Note that relative to the first page load, all documents retrieved from
          // the collection are considered to be "added"
          if (change.type === "added") {
            console.log("New player added to server database:", doc.data());
            
            // if player does not belong to anyone, add to available players
            if (playerData["owner"] === null) {
              const row = playersInfo.insertRow();
              row.id = "_" + playerData['shorthandTeamName'] + "_" + doc.id;
  
              const playerName = row.insertCell(0);
              playerName.innerHTML = doc.id; 
              
              const playerTeam = row.insertCell(1);
              playerTeam.innerHTML = playerData['shorthandTeamName'];
              
              const playerRole = row.insertCell(2);
              playerRole.innerHTML = playerData["role"] ?? "undefined";

              const playerAgents = row.insertCell(3);
              playerAgents.innerHTML = playerData['agents'].join(", ");
  
              const addToRosterCell = row.insertCell(4);
              const addToRosterButton = document.createElement("button");
              addToRosterButton.innerHTML = "Add to Roster"
              addToRosterButton.id = playerData['shorthandTeamName'] + "_" + doc.id + "_addToRoster"
              addToRosterButton.addEventListener("click", function() {
                  // if the player doesn't currently have an owner, change the owner to this user
                  playersDb.doc(doc.id).update({"owner": user.uid});
              })
              addToRosterCell.append(addToRosterButton);

              sortTable("playersInfo", 0, sortDirection !== 1);
            }
            else if (playerData["owner"] === user.uid) {
              const row = userPlayersInfo.insertRow();
              row.id = "_" + playerData['shorthandTeamName'] + "_" + doc.id;
  
              const playerName = row.insertCell(0);
              playerName.innerHTML = doc.id; 
              
              const playerTeam = row.insertCell(1);
              playerTeam.innerHTML = playerData['shorthandTeamName'];
              
              const playerRole = row.insertCell(2);
              playerRole.innerHTML = "TBD";

              const playerAgents = row.insertCell(3);
              playerAgents.innerHTML = playerData['agents'];
  
              const removeFromRosterCell = row.insertCell(4);
              const removeFromRosterButton = document.createElement("button");
              removeFromRosterButton.innerHTML = "Remove from Roster"
              removeFromRosterButton.id = playerData['shorthandTeamName'] + "_" + doc.id + "_removeFromRoster"
              removeFromRosterButton.addEventListener("click", function() {
                  // if the player doesn't currently have an owner, change the owner to this user
                  playersDb.doc(doc.id).update({"owner": null});
              })
              removeFromRosterCell.append(removeFromRosterButton);

              sortTable("userPlayersInfo", 0, sortDirection !== 1);
            }
          }
          else if (change.type === "modified") {
            // will proc on stat updates, if a user took a player, etc.
            // currently just naively deletes and re-inserts any changed row
            // smart solution: store owners of all players in localStorage, only delete and re-insert if necessary
            console.log("Player data modified on server database:", doc.data());
            
            // delete old row
            const playerId = "_" + playerData['shorthandTeamName'] + "_" + doc.id;
            const playerRow = document.querySelector(`#${playerId}`);
            playerRow.remove();

            // if player does not belong to anyone, add to available players
            if (playerData["owner"] === null) {
              const row = playersInfo.insertRow();
              row.id = "_" + playerData['shorthandTeamName'] + "_" + doc.id;
  
              const playerName = row.insertCell(0);
              playerName.innerHTML = doc.id; 
              
              const playerTeam = row.insertCell(1);
              playerTeam.innerHTML = playerData['shorthandTeamName'];
              
              const playerRole = row.insertCell(2);
              playerRole.innerHTML = "TBD";

              const playerAgents = row.insertCell(3);
              playerAgents.innerHTML = playerData['agents'];
  
              const addToRosterCell = row.insertCell(4);
              const addToRosterButton = document.createElement("button");
              addToRosterButton.innerHTML = "Add to Roster"
              addToRosterButton.id = playerData['shorthandTeamName'] + "_" + doc.id + "_addToRoster"
              addToRosterButton.addEventListener("click", function() {
                  // if the player doesn't currently have an owner, change the owner to this user
                  playersDb.doc(doc.id).update({"owner": user.uid});
              })
              addToRosterCell.append(addToRosterButton);

              sortTable("playersInfo", 0, sortDirection !== 1);
            }
            else if (playerData["owner"] === user.uid) {
              const row = userPlayersInfo.insertRow();
              row.id = "_" + playerData['shorthandTeamName'] + "_" + doc.id;
  
              const playerName = row.insertCell(0);
              playerName.innerHTML = doc.id; 
              
              const playerTeam = row.insertCell(1);
              playerTeam.innerHTML = playerData['shorthandTeamName'];
              
              const playerRole = row.insertCell(2);
              playerRole.innerHTML = "TBD";

              const playerAgents = row.insertCell(3);
              playerAgents.innerHTML = playerData['agents'];
  
              const removeFromRosterCell = row.insertCell(4);
              const removeFromRosterButton = document.createElement("button");
              removeFromRosterButton.innerHTML = "Remove from Roster"
              removeFromRosterButton.id = playerData['shorthandTeamName'] + "_" + doc.id + "_removeFromRoster"
              removeFromRosterButton.addEventListener("click", function() {
                  // if the player doesn't currently have an owner, change the owner to this user
                  playersDb.doc(doc.id).update({"owner": null});
              })
              removeFromRosterCell.append(removeFromRosterButton);

              sortTable("userPlayersInfo", 0, sortDirection !== 1);
            }
          }
          else if (change.type === "removed") {
            // should probably never proc
            console.log("Player removed from server database:", doc.data());
            const playerId = "_" + playerData['shorthandTeamName'] + "_" + doc.id;
            const playerRow = document.querySelector(`#${playerId}`);
            playerRow.remove();
          }
          else {
            console.error("unexpected change type for server database")
          }
        });
      });

      // Bind back to overview event to overview button
      document.querySelector("#overview").addEventListener("click", function() {
          window.location.href = "overview.html";
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