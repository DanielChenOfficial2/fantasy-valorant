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
  let leagueHeader = document.querySelector("#leagueHeader");
  leagueHeader.innerHTML = sessionStorage.getItem("name");
  
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
      let draftHeader = document.querySelector("h2#draftHeader");
      let lastDraftedHeader = document.querySelector("h2#lastDraftedHeader");
      // Initialize Cloud Firestore and get a reference to the service
      const db = firebase.firestore();
      
      const leagueName = sessionStorage.getItem("shorthandName");
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
              playerRole.innerHTML = playerData['role'] ?? "TBD";

              const playerAgents = row.insertCell(3);
              playerAgents.innerHTML = playerData['agents'] !== undefined
                                       ? playerData['agents'].join(", ")
                                       : "N/A";
  
              const addToRosterCell = row.insertCell(4);
              const addToRosterButton = document.createElement("button");
              addToRosterButton.innerHTML = "Add to Roster"
              addToRosterButton.id = playerData['shorthandTeamName'] + "_" + doc.id + "_addToRoster"
              addToRosterButton.classList.add("add_to_roster");
              addToRosterButton.addEventListener("click", async function () {
                try {
                  // 1. Assign player to the user
                  await playersDb.doc(doc.id).update({ owner: user.uid });

                  // 2. Get current draft state
                  const leagueDocRef = db.collection("fantasy_leagues").doc(leagueName);
                  const leagueDoc = await leagueDocRef.get();

                  if (!leagueDoc.exists) return;

                  const data = leagueDoc.data();
                  if (!data.draftStarted) return;

                  let draftRound = data.draftRound;
                  let draftTurn = data.draftTurn;
                  const numUsers = data.numUsers;
                  const rosterLimit = data.rosterLimit;

                  // 3. Compute next turn
                  let nextDraftTurn = draftTurn + 1;
                  let nextDraftRound = draftRound;

                  if (nextDraftTurn > numUsers) {
                    nextDraftTurn = 1;
                    nextDraftRound++;
                  }

                  console.log("draftTurn:", draftTurn);
                  console.log("nextDraftTurn:", nextDraftTurn);
                  console.log("draftRound:", draftRound);
                  console.log("nextDraftRound:", nextDraftRound);

                  // 4. Check if draft should end
                  if (nextDraftRound > rosterLimit) {
                    await leagueDocRef.update({
                      draftStarted: 0,
                      draftEnded: 1,
                    });
                    return;
                  }

                  // 5. Update draft state
                  await leagueDocRef.update({
                    draftTurn: nextDraftTurn,
                    draftRound: nextDraftRound,
                  });

                  if (draftRound % 2 == 1) {
                    lastDraftedHeader.innerHTML = `${data.shuffledUserNames[draftTurn - 1]} picked ${doc.id}.`;

                    await leagueDocRef.update({
                      lastDraftedUserName: data.shuffledUserNames[draftTurn - 1],
                      lastDraftedPlayer: doc.id
                    });
                  }
                  else {
                    lastDraftedHeader.innerHTML = `${data.shuffledUserNames[numUsers - draftTurn]} picked ${doc.id}.`;
                    await leagueDocRef.update({
                      lastDraftedUserName: data.shuffledUserNames[numUsers - draftTurn],
                      lastDraftedPlayer: doc.id
                    });
                  }

                  // 6. Update UI
                  if (nextDraftRound % 2 === 1) {
                    draftHeader.innerHTML = `It is round ${nextDraftRound}. ${data.shuffledUserNames[nextDraftTurn - 1]}'s turn to pick.`;
                    
                    if (user.uid !== data.shuffledUserUIDs[nextDraftTurn - 1]) {
                      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
                    }
                    else {
                      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
                    }
                  }
                  else {
                    draftHeader.innerHTML = `It is round ${nextDraftRound}. ${data.shuffledUserNames[numUsers - nextDraftTurn]}'s turn to pick.`;
                    if (user.uid !== data.shuffledUserUIDs[numUsers - nextDraftTurn]) {
                      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
                    }
                    else {
                      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
                    }
                  }
                } catch (error) {
                  console.error("Error handling draft pick:", error);
                }
              });
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
              playerRole.innerHTML = playerData['role'] ?? "TBD";

              const playerAgents = row.insertCell(3);
              playerAgents.innerHTML = playerData['agents'] !== undefined
                                       ? playerData['agents'].join(", ")
                                       : "N/A";
  
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
            console.log(playerId);
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
              playerRole.innerHTML = playerData['role'] ?? "TBD";

              const playerAgents = row.insertCell(3);
              playerAgents.innerHTML = playerData['agents'] !== undefined
                                       ? playerData['agents'].join(", ")
                                       : "N/A";
  
              const addToRosterCell = row.insertCell(4);
              const addToRosterButton = document.createElement("button");
              addToRosterButton.innerHTML = "Add to Roster"
              addToRosterButton.id = playerData['shorthandTeamName'] + "_" + doc.id + "_addToRoster"
              addToRosterButton.classList.add("add_to_roster");
              addToRosterButton.addEventListener("click", async function () {
                try {
                  // 1. Assign player to the user
                  await playersDb.doc(doc.id).update({ owner: user.uid });

                  // 2. Get current draft state
                  const leagueDocRef = db.collection("fantasy_leagues").doc(leagueName);
                  const leagueDoc = await leagueDocRef.get();

                  if (!leagueDoc.exists) return;

                  const data = leagueDoc.data();
                  if (!data.draftStarted) return;

                  let draftRound = data.draftRound;
                  let draftTurn = data.draftTurn;
                  const numUsers = data.numUsers;
                  const rosterLimit = data.rosterLimit;

                  // 3. Compute next turn
                  let nextDraftTurn = draftTurn + 1;
                  let nextDraftRound = draftRound;

                  if (nextDraftTurn > numUsers) {
                    nextDraftTurn = 1;
                    nextDraftRound++;
                  }

                  console.log("draftTurn:", draftTurn);
                  console.log("nextDraftTurn:", nextDraftTurn);
                  console.log("draftRound:", draftRound);
                  console.log("nextDraftRound:", nextDraftRound);

                  // 4. Check if draft should end
                  if (nextDraftRound > rosterLimit) {
                    await leagueDocRef.update({
                      draftStarted: 0,
                      draftEnded: 1,
                    });
                    return;
                  }

                  // 5. Update draft state
                  await leagueDocRef.update({
                    draftTurn: nextDraftTurn,
                    draftRound: nextDraftRound
                  });

                  if (draftRound % 2 == 1) {
                    lastDraftedHeader.innerHTML = `${data.shuffledUserNames[draftTurn - 1]} picked ${doc.id}.`;
                    await leagueDocRef.update({
                      lastDraftedUserName: data.shuffledUserNames[draftTurn - 1],
                      lastDraftedPlayer: doc.id
                    });
                  }
                  else {
                    lastDraftedHeader.innerHTML = `${data.shuffledUserNames[draftTurn - 1]} picked ${doc.id}.`;
                    await leagueDocRef.update({
                      lastDraftedUserName: data.shuffledUserNames[numUsers - draftTurn],
                      lastDraftedPlayer: doc.id
                    });
                  }

                  // 6. Update UI
                  if (nextDraftRound % 2 === 1) {
                    draftHeader.innerHTML = `It is round ${nextDraftRound}. ${data.shuffledUserNames[nextDraftTurn - 1]}'s turn to pick.`;
                    if (user.uid !== data.shuffledUserUIDs[nextDraftTurn - 1]) {
                      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
                    }
                    else {
                      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
                    }
                  }
                  else {
                    draftHeader.innerHTML = `It is round ${nextDraftRound}. ${data.shuffledUserNames[numUsers - nextDraftTurn]}'s turn to pick.`;
                    if (user.uid !== data.shuffledUserUIDs[numUsers - nextDraftTurn]) {
                      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
                    }
                    else {
                      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
                    }
                  }
                } catch (error) {
                  console.error("Error handling draft pick:", error);
                }
              });
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
              playerRole.innerHTML = playerData['role'] ?? "TBD";

              const playerAgents = row.insertCell(3);
              playerAgents.innerHTML = playerData['agents'] !== undefined
                                       ? playerData['agents'].join(", ")
                                       : "N/A";
  
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
            console.log(playerId);
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

      // Disable all add to roster buttons if applicable
      // Disable start/end draft buttons if current user is not owner
      // Disable either start or end draft button if current user is owner
      // Odd number rounds go from "first" to "last" in the shuffled users
      // Even number rounds go from "last" to "first"
      db.collection("fantasy_leagues").doc(leagueName).onSnapshot((doc) => {
        if (doc.exists) {
          let startDraftButton = document.querySelector("button#startDraftButton");
          let endDraftButton = document.querySelector("button#endDraftButton");
          
          if (!doc.data().draftStarted && !doc.data().draftEnded) {
            document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
          }

          if (doc.data().draftStarted) {
            const curRound = doc.data().draftRound;
            const curDraftTurn = doc.data().draftTurn;
            const numUsers = doc.data().numUsers;
            if (curRound !== 1 || curDraftTurn !== 1)
              lastDraftedHeader.innerHTML = `${doc.data().lastDraftedUserName} picked ${doc.data().lastDraftedPlayer}.`;
            else
              lastDraftedHeader.innerHTML = ``;
            if (doc.data().draftRound % 2 === 1) {
              draftHeader.innerHTML = `It is round ${curRound}. ${doc.data().shuffledUserNames[curDraftTurn - 1]}'s turn to pick.`;
              if (user.uid !== doc.data().shuffledUserUIDs[curDraftTurn - 1]) {
                document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
              }
              else {
                document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
              }
            }
            else {
              draftHeader.innerHTML = `It is round ${curRound}. ${doc.data().shuffledUserNames[numUsers - curDraftTurn]}'s turn to pick.`;
              if (user.uid !== doc.data().shuffledUserUIDs[numUsers - curDraftTurn]) {
                document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
              }
              else {
                document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
              }
            }
          }

          if (doc.data().draftEnded) {
            lastDraftedHeader.innerHTML = ``;
            draftHeader.innerHTML = `Draft Has Ended`;
            document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
          }

          if (user.uid !== doc.data().ownerUID) {
            if (startDraftButton !== null)
              startDraftButton.remove();
            if (endDraftButton !== null)
              endDraftButton.remove();
          }
          else {
            if (!doc.data().draftStarted) {
              startDraftButton.addEventListener("click", function() {
                const userUIDs = doc.data().userUIDs;
                const userNames = doc.data().userNames;
                const [shuffledUserUIDs, shuffledUserNames] = shuffleArrays(userUIDs, userNames);
                doc.ref.update({
                  draftStarted: 1,
                  draftEnded: 0,
                  draftRound: 1,
                  draftTurn: 1,
                  lastDraftedUserName: "",
                  lastDraftedPlayer: "",
                  shuffledUserUIDs: shuffledUserUIDs,
                  shuffledUserNames: shuffledUserNames
                }).then(() => {
                  console.log("Draft started!");
                }).catch((error) => {
                  console.error("Error starting draft:", error);
                });
              });
              endDraftButton.disabled = true;
            }
            else {
              endDraftButton.addEventListener("click", function() {
                doc.ref.update({
                  draftStarted: 0,
                  draftEnded: 1,
                }).then(() => {
                  console.log("Draft ended!");
                }).catch((error) => {
                  console.error("Error ending draft:", error);
                });
              })

              startDraftButton.disabled = true;

              if (!doc.data().draftEnded) {
                endDraftButton.disabled = false;
              }
              else {
                endDraftButton.disabled = true;
              }
            }
          }
        } else {
          console.log("No such document!");
        }
      });

      // const leagueDb = db.collection("fantasy_leagues").doc(leagueName);
      // leagueDb.onSnapshot((querySnapshot) => {
      //   querySnapshot.docChanges().forEach((change) => {
      //     const doc = change.doc;
      //     const leagueData = doc.data();

      //     // Note that relative to the first page load, all documents retrieved from
      //     // the collection are considered to be "added"
      //     if (change.type === "modified") {

      //     }
      //   });
      // });
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

function shuffleArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    throw new Error("Arrays must be of the same length");
  }

  for (let i = arr1.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    // Swap in both arrays
    [arr1[i], arr1[j]] = [arr1[j], arr1[i]];
    [arr2[i], arr2[j]] = [arr2[j], arr2[i]];
  }

  return [arr1, arr2];
}