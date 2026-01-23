const firebaseConfig = {
    apiKey: "AIzaSyDiZli11fN1qlg8qoJvntycALm9eyS9Iwk",
    authDomain: "fantasy-valorant-d2588.firebaseapp.com",
    projectId: "fantasy-valorant-d2588",
    storageBucket: "fantasy-valorant-d2588.appspot.com",
    messagingSenderId: "419164409115",
    appId: "1:419164409115:web:3172a1aa23ccc3c99317be",
    measurementId: "G-GK0SLGNZ1E"
};

let _sortDirection = 1;

function staticInit() {
  let leagueHeader = document.querySelector("#leagueHeader");
  leagueHeader.innerHTML = sessionStorage.getItem("name");
  
  let playersTableCols = document.querySelectorAll("table#playersTable th")
  for (let i = 0; i < playersTableCols.length - 1; i++) {
    let curPlayerTableCol = playersTableCols[i];
    curPlayerTableCol.addEventListener("click", () => sortTable("playersTable", `${i}`, true));
  }

  let userPlayersTableCols = document.querySelectorAll("table#userPlayersTable th")
  for (let i = 0; i < userPlayersTableCols.length - 1; i++) {
    let curPlayerTableCol = userPlayersTableCols[i];
    curPlayerTableCol.addEventListener("click", () => sortTable("userPlayersTable", `${i}`, true));
  }
}

function initPlayersCollectionListener(db, leagueName, userUID) {
  const playersDb = db.collection("fantasy_leagues").doc(leagueName).collection("players");
  const leagueDocRef = db.collection("fantasy_leagues").doc(leagueName);
  playersDb.onSnapshot((querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      const doc = change.doc;
      const playerData = doc.data();
      if (change.type === "added") {
        // console.log("New player added to server database:", doc.data());
        if (playerData["owner"] === null) // if player does not belong to anyone, add to available players
          appendPlayerRowToTable("playersTable", playersDb, playerData, leagueDocRef, doc.id, userUID, true, false);
        else {
          if (playerData["active"] === true) {
            appendPlayerRowToTable(`userPlayersTable_${playerData["owner"]}_active`, playersDb, playerData, leagueDocRef, doc.id, userUID, false, userUID === playerData["owner"]);
          }
          else {
            appendPlayerRowToTable(`userPlayersTable_${playerData["owner"]}_reserve`, playersDb, playerData, leagueDocRef, doc.id, userUID, false, userUID === playerData["owner"]);
          }

          if (playerData["owner"] === userUID) { // player belongs to current user
            leagueDocRef.get().then((leagueDoc) => {
              enforceTotalRosterLimit(leagueDoc.data().totalRosterLimit, userUID);
              enforceActiveRosterLimit(leagueDoc.data().activeRosterLimit, userUID);
            }).catch((error) => {
              console.error("Error getting document:", error);
            });
          }
        }
      }
      else if (change.type === "modified") {
        // will proc on stat updates, if a user took a player, etc.
        // currently just naively deletes and re-inserts any changed row
        // console.log("Player data modified on server database:", doc.data());
        
        const playerId = "_" + playerData['shorthandTeamName'] + "_" + doc.id;
        console.log("Modifying player:", playerId);
        removeElementById(playerId);

        // if player does not belong to anyone, add to available players
        if (playerData["owner"] === null) // if player does not belong to anyone, add to available players
          appendPlayerRowToTable("playersTable", playersDb, playerData, leagueDocRef, doc.id, userUID, true, false);
        else if (playerData["owner"] === userUID) { // player belongs to current user
          if (playerData["active"] === true) {
            appendPlayerRowToTable(`userPlayersTable_${playerData["owner"]}_active`, playersDb, playerData, leagueDocRef, doc.id, userUID, false, userUID === playerData["owner"]);
          }
          else {
            appendPlayerRowToTable(`userPlayersTable_${playerData["owner"]}_reserve`, playersDb, playerData, leagueDocRef, doc.id, userUID, false, userUID === playerData["owner"]);
          }

          if (playerData["owner"] === userUID) { // player belongs to current user
            leagueDocRef.get().then((leagueDoc) => {
              enforceTotalRosterLimit(leagueDoc.data().totalRosterLimit, userUID);
              enforceActiveRosterLimit(leagueDoc.data().activeRosterLimit, userUID);
            }).catch((error) => {
              console.error("Error getting document:", error);
            });
          }
        }
      }
      else if (change.type === "removed") {
        // should probably never proc
        console.log("Player removed from server database:", doc.data());
        const playerId = "_" + playerData['shorthandTeamName'] + "_" + doc.id;
        removeElementById(playerId);
      }
      else {
        console.error("unexpected change type for server database")
      }
    });
  });
}

function initLeagueCollectionListener(db, leagueName, userUID) {
  db.collection("fantasy_leagues").doc(leagueName).onSnapshot((doc) => {
    if (doc.exists) {
      let lastDraftedHeader = document.querySelector("h2#lastDraftedHeader");
      let draftHeader = document.querySelector("h2#draftHeader");
      let startDraftButton = document.querySelector("button#startDraftButton");
      let endDraftButton = document.querySelector("button#endDraftButton");

      renderUserTables(doc.data().userNames, doc.data().userUIDs, userUID);

      if (!doc.data().draftStarted && !doc.data().draftEnded)
        document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);

      if (doc.data().draftStarted)
        handleDraftStarted(doc, lastDraftedHeader, draftHeader, userUID);
      else if (doc.data().draftEnded)
        handleDraftEnded(lastDraftedHeader, draftHeader);

      if (userUID !== doc.data().ownerUID) {
        startDraftButton?.remove();
        endDraftButton?.remove();
      }
      else { // user is owner
        if (!doc.data().draftStarted)
          handleDraftUnstartedForOwner(doc, startDraftButton, endDraftButton);
        else // draft has started
          handleDraftStartedForOwner(doc, startDraftButton, endDraftButton);
      }
    }
    else
      console.log("No such document!");
  });
}

function initScoreboardCollectionListener(db, leagueName, userUID) {
  db.collection("fantasy_leagues").doc(leagueName).collection("scoreboard").doc("users").onSnapshot((doc) => {
    if (doc.exists) {
      console.log(doc.data())
      const scoreboardTable = document.querySelector("table#scoreboardTable");
      const row = scoreboardTable.insertRow();

      const userName = row.insertCell(0);
      userName.innerHTML = "asd"; 
      
      const userFantasyScore = row.insertCell(1);
      userFantasyScore.innerHTML = "891.26";

      const userSnowflakes = row.insertCell(2);
      userSnowflakes.innerHTML = "3";

      const row2 = scoreboardTable.insertRow();

      const userName2 = row2.insertCell(0);
      userName2.innerHTML = "Your"; 

      const userFantasyScore2 = row2.insertCell(1);
      userFantasyScore2.innerHTML = "762.1999999999999";

      const userSnowflakes2 = row2.insertCell(2);
      userSnowflakes2.innerHTML = "2";

      const row3 = scoreboardTable.insertRow();

      const userName3 = row3.insertCell(0);
      userName3.innerHTML = "J"; 

      const userFantasyScore3 = row3.insertCell(1);
      userFantasyScore3.innerHTML = "581.9";

      const userSnowflakes3 = row3.insertCell(2);
      userSnowflakes3.innerHTML = "1";

    }
    else
      console.log("No such document!");
  });
}

function initRosterLock() {
  // Target time in UTC
  const target = new Date('2026-01-23T22:00:00Z');

  // If current time is before target, enable a persistent lock
  let rosterLocked = (new Date() >= target);

  function applyLock() {
    if (!rosterLocked) return;
    document.querySelectorAll("button.add_to_roster, button.remove_from_roster, button.move_to_active, button.move_to_reserve")
      .forEach(btn => btn.disabled = true);
  }

  // Apply immediately
  applyLock();

  if (!rosterLocked) return;

  // Observe DOM for new buttons being added or attribute changes that try to re-enable buttons
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return; // only element nodes
          // If the added node itself is a button of interest
          try {
            if (node.matches && node.matches("button.add_to_roster, button.remove_from_roster, button.move_to_active, button.move_to_reserve")) {
              node.disabled = true;
            }
            // Also enforce on any matching descendants
            node.querySelectorAll && node.querySelectorAll("button.add_to_roster, button.remove_from_roster, button.move_to_active, button.move_to_reserve").forEach(b => b.disabled = true);
          } catch (e) {
            // ignore nodes that don't support matches/querySelectorAll
          }
        });
      }
      else if (m.type === 'attributes' && m.attributeName === 'disabled') {
        const targetNode = m.target;
        try {
          if (targetNode.matches && targetNode.matches("button.add_to_roster, button.remove_from_roster, button.move_to_active, button.move_to_reserve")) {
            // If something re-enabled the button while lock is active, re-disable it
            if (!targetNode.disabled && rosterLocked) targetNode.disabled = true;
          }
        } catch (e) {
          // ignore
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });

  // Periodically re-apply lock until the target time is reached
  const intervalId = setInterval(() => {
    if (new Date() >= target) {
      rosterLocked = false;
      observer.disconnect();
      clearInterval(intervalId);
      return;
    }
    applyLock();
  }, 1000);
}

function logoutUser() {
  firebase.auth().signOut().then(() => {
    // console.log("User logged out");
    window.location.href = "index.html"; // Redirect to login page after logout
  }).catch((error) => {
    console.error("Error logging out:", error.message);
  });
}

// helper function for initPlayersCollectionListener()
function appendPlayerRowToTable(playersTableId, playersDb, playerData, leagueDocRef, docID, userUID, needsAddToRosterFunc, needsRemoveFromRosterFunc) {
  const playersTable = document.querySelector(`#${playersTableId}`);
  const row = playersTable.insertRow();
  console.log(playerData)
  row.id = "_" + playerData['shorthandTeamName'] + "_" + docID;

  const playerName = row.insertCell(0);
  playerName.innerHTML = docID; 
            
  const playerTeam = row.insertCell(1);
  playerTeam.innerHTML = playerData['shorthandTeamName'];
    
  const playerRole = row.insertCell(2);
  playerRole.innerHTML = playerData['role'] ?? "TBD";
  const playerFantasyScore = row.insertCell(3);
  playerFantasyScore.innerHTML = playerData['fantasyScore'] ?? 0.0;

  if (needsAddToRosterFunc) {
    const addToRosterCell = row.insertCell(4);
    const addToRosterButton = document.createElement("button");
    addToRosterButton.innerHTML = "Add to Roster";
    addToRosterButton.id = playerData['shorthandTeamName'] + "_" + docID + "_addToRoster";
    addToRosterButton.classList.add("add_to_roster");

    addToRosterButton.addEventListener("click", async function () {
      try {
        // 1. Assign player to the user
        await playersDb.doc(docID).update({ owner: userUID });

        // 2. Get current draft state
        const leagueDoc = await leagueDocRef.get();
        if (!leagueDoc.exists) return;
        const data = leagueDoc.data();
        if (!data.draftStarted) return;
        document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
        handleDraftPick(data, leagueDocRef, docID, userUID);
      } 
      catch (error) {
        console.error("Error handling draft pick:", error);
      }
    });

    leagueDocRef.get().then((leagueDoc) => {
      const totalRows = document.querySelectorAll(`#userPlayersTable_${userUID}_active tr`).length + document.querySelectorAll(`#userPlayersTable_${userUID}_reserve tr`).length - 2;
      if (totalRows === leagueDoc.data().rosterLimit) {
        document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
      }
    }).catch((error) => {
      console.error("Error getting document:", error);
    });

    addToRosterCell.append(addToRosterButton);
  }
  else if (needsRemoveFromRosterFunc) {
    const moveRosterCell = row.insertCell(4);
    const moveRosterButton = document.createElement("button");
    if (playersTableId.includes("active")) {
      moveRosterButton.innerHTML = "Move to Reserve";
      moveRosterButton.id = playerData['shorthandTeamName'] + "_" + docID + "_moveToReserve";
      moveRosterButton.classList.add("move_to_reserve");
      moveRosterButton.addEventListener("click", function() {
        // Move player to reserve
        playersDb.doc(docID).update({"active": false});
      });
       moveRosterCell.append(moveRosterButton);
    }
    else if (playersTableId.includes("reserve")) {
      moveRosterButton.innerHTML = "Move to Active";
      moveRosterButton.id = playerData['shorthandTeamName'] + "_" + docID + "_moveToActive";
      moveRosterButton.classList.add("move_to_active");
      moveRosterButton.addEventListener("click", function() {
        // Move player to active
        playersDb.doc(docID).update({"active": true});
        if (playerData["owner"] === userUID) { // player belongs to current user
          leagueDocRef.get().then((leagueDoc) => {
            enforceActiveRosterLimit(leagueDoc.data().activeRosterLimit, userUID);
          }).catch((error) => {
            console.error("Error getting document:", error);
          });
        }
      });
      moveRosterCell.append(moveRosterButton);
    }
    
    const removeFromRosterButton = document.createElement("button");
    removeFromRosterButton.innerHTML = "Remove from Roster";
    removeFromRosterButton.id = playerData['shorthandTeamName'] + "_" + docID + "_removeFromRoster";
    removeFromRosterButton.classList.add("remove_from_roster");
    removeFromRosterButton.addEventListener("click", function() {
      // if the player doesn't currently have an owner, change the owner to this user
      playersDb.doc(docID).update({"owner": null});
      playersDb.doc(docID).update({"active": false});
      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
      hideElementByID("totalRosterLimitHit");
    });

    leagueDocRef.get().then((leagueDoc) => {
      if (leagueDoc.data().draftStarted)
        removeFromRosterButton.disabled = true;
    }).catch((error) => {
      console.error("Error getting document:", error);
    });

    moveRosterCell.append(removeFromRosterButton);
  }

  sortTable(playersTableId, 0, _sortDirection !== 1);
}

// helper function for initPlayersCollectionListener()
function enforceTotalRosterLimit(totalRosterLimit, userUID) {
  const activeRows = document.querySelectorAll(`#userPlayersTable_${userUID}_active tr`).length - 1;
  const reserveRows = document.querySelectorAll(`#userPlayersTable_${userUID}_reserve tr`).length - 1;
  const totalRows = activeRows + reserveRows;

  if (totalRows === totalRosterLimit) {
    document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
    showElementByID("totalRosterLimitHit");
  }  
  else {
    document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
    hideElementByID("totalRosterLimitHit");
  }
}

function enforceActiveRosterLimit(activeRosterLimit, userUID) {
  const activeRows = document.querySelectorAll(`#userPlayersTable_${userUID}_active tr`).length - 1;

  if (activeRows === activeRosterLimit) {
    document.querySelectorAll("button.move_to_active").forEach(btn => btn.disabled = true);
    showElementByID("activeRosterLimitHit");
  }  
  else {
    document.querySelectorAll("button.move_to_active").forEach(btn => btn.disabled = false);
    hideElementByID("activeRosterLimitHit");
  }
}

// helper function for initLeagueCollectionListener()
function renderUserTables(allUserNames, allUserUIDs, curUserUID) {
  for (let i = 0; i < allUserNames.length; i++) {
    const userName = allUserNames[i];
    const userUID = allUserUIDs[i];
    
    if (document.querySelector(`#userPlayersTable_${userUID}_active`) || document.querySelector(`#userPlayersTable_${userUID}_reserve`)) {
      return;
    }
    
    const section = document.createElement("section");

    const totalRosterLimitHitHeader = document.createElement("h2");
    totalRosterLimitHitHeader.id="totalRosterLimitHit";
    totalRosterLimitHitHeader.classList.add("hidden");
    totalRosterLimitHitHeader.classList.add("warning");
    totalRosterLimitHitHeader.textContent = "Total Roster Limit Hit, Cannot Add New Players to Roster";

    const activeRosterLimitHitHeader = document.createElement("h2");
    activeRosterLimitHitHeader.id=`activeRosterLimitHit`;
    activeRosterLimitHitHeader.classList.add("hidden");
    activeRosterLimitHitHeader.classList.add("warning");
    activeRosterLimitHitHeader.textContent = "Active Roster Limit Hit, Cannot Add Players to Active Roster";

    const activePlayersHeading = document.createElement("h2");
    if (userUID !== curUserUID) {
      activePlayersHeading.textContent = `${userName}'s Active Players`;
    }
    else {
      activePlayersHeading.textContent = `Your (${userName})'s Active Players`;
    }

    const reservePlayersHeading = document.createElement("h2");
    if (userUID !== curUserUID) {
      reservePlayersHeading.textContent = `${userName}'s Reserve Players`;
    }
    else {
      reservePlayersHeading.textContent = `Your (${userName})'s Reserve Players`;
    }
    
    const activePlayersTable = document.createElement("table");
    activePlayersTable.id = `userPlayersTable_${userUID}_active`;

    const reservePlayersTable = document.createElement("table");
    reservePlayersTable.id = `userPlayersTable_${userUID}_reserve`;

    const tbody = document.createElement("tbody");
    // Add header row
    const headerRow = document.createElement("tr");
    ["Player", "Team", "Role", "Fantasy Score"].forEach(text => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = text;
      headerRow.appendChild(th);
    });
    tbody.appendChild(headerRow);
    activePlayersTable.appendChild(tbody);
    reservePlayersTable.appendChild(tbody.cloneNode(true));

    if (userUID === curUserUID) {
      section.appendChild(totalRosterLimitHitHeader);
      section.appendChild(activeRosterLimitHitHeader);
    }
    section.appendChild(activePlayersHeading);
    section.appendChild(activePlayersTable);
    section.appendChild(reservePlayersHeading);
    section.appendChild(reservePlayersTable);
    // Append to container
    document.getElementById("userPlayersInfo").appendChild(section);
  }
}

// helper function for initLeagueCollectionListener()
function handleDraftStarted(doc, lastDraftedHeader, draftHeader, userUID) {
  const curRound = doc.data().draftRound;
  const curDraftTurn = doc.data().draftTurn;
  const numUsers = doc.data().numUsers;
  
  console.log("remove buttons disabled");
  document.querySelectorAll("button.remove_from_roster").forEach(btn => btn.disabled = true);
  
  if (curRound !== 1 || curDraftTurn !== 1)
    lastDraftedHeader.innerHTML = `${doc.data().lastDraftedUserName} picked ${doc.data().lastDraftedPlayer}.`;
  else
    lastDraftedHeader.innerHTML = ``;
      
  if (doc.data().draftRound % 2 === 1) {
    draftHeader.innerHTML = `It is round ${curRound}. ${doc.data().shuffledUserNames[curDraftTurn - 1]}'s turn to pick.`;
    if (userUID !== doc.data().shuffledUserUIDs[curDraftTurn - 1])
      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
    else
      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
    }
  else {
    draftHeader.innerHTML = `It is round ${curRound}. ${doc.data().shuffledUserNames[numUsers - curDraftTurn]}'s turn to pick.`;
    if (userUID !== doc.data().shuffledUserUIDs[numUsers - curDraftTurn]) {
      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
    }
    else {
      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
    }
  }
}

// helper function for initLeagueCollectionListener()
function handleDraftEnded(lastDraftedHeader, draftHeader) {
  lastDraftedHeader.innerHTML = ``;
  draftHeader.innerHTML = `Draft Has Ended`;
  document.querySelectorAll("button.remove_from_roster").forEach(btn => btn.disabled = false);
}

// helper function for initLeagueCollectionListener()
function handleDraftUnstartedForOwner(doc, startDraftButton, endDraftButton) {
  endDraftButton.disabled = true;

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
}

// helper function for initLeagueCollectionListener()
function handleDraftStartedForOwner(doc, startDraftButton, endDraftButton) {
  startDraftButton.disabled = true;

  if (!doc.data().draftEnded) 
    endDraftButton.disabled = false;
  else // draft has ended
    endDraftButton.disabled = true;
          
    endDraftButton.addEventListener("click", function() {
    doc.ref.update({
      draftStarted: 0,
      draftEnded: 1,
    }).then(() => {
      console.log("Draft ended!");
    }).catch((error) => {
      console.error("Error ending draft:", error);
    });
  });
}

// helper function for appendPlayerRowToTable()
async function handleDraftPick(data, leagueDocRef, docID, userUID) {
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
    lastDraftedHeader.innerHTML = `${data.shuffledUserNames[draftTurn - 1]} picked ${docID}.`;
    await leagueDocRef.update({
      lastDraftedUserName: data.shuffledUserNames[draftTurn - 1],
      lastDraftedPlayer: docID
    });
  }
  else {
    lastDraftedHeader.innerHTML = `${data.shuffledUserNames[numUsers - draftTurn]} picked ${docID}.`;
    await leagueDocRef.update({
      lastDraftedUserName: data.shuffledUserNames[numUsers - draftTurn],
      lastDraftedPlayer: docID
    });
  }
  // 6. Update UI
  if (nextDraftRound % 2 === 1) {
    draftHeader.innerHTML = `It is round ${nextDraftRound}. ${data.shuffledUserNames[nextDraftTurn - 1]}'s turn to pick.`;
  
    if (userUID !== data.shuffledUserUIDs[nextDraftTurn - 1]) {
      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
    }
    else {
      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
    }
  }
  else {
    draftHeader.innerHTML = `It is round ${nextDraftRound}. ${data.shuffledUserNames[numUsers - nextDraftTurn]}'s turn to pick.`;
    if (userUID !== data.shuffledUserUIDs[numUsers - nextDraftTurn]) {
      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = true);
    }
    else {
      document.querySelectorAll("button.add_to_roster").forEach(btn => btn.disabled = false);
    }
  }
}

// helper function for handleDraftUnstartedForOwner()
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

// general helper function
function sortTable(tableId, columnIndex, toggleDirection) {
  const table = document.getElementById(`${tableId}`);
  const rows = Array.from(table.rows).slice(1); // Skip header row
  const tbody = table.tBodies[0];

  // Toggle sort direction
  if (toggleDirection)
    _sortDirection = -_sortDirection;

  rows.sort((a, b) => {
    let cellA = a.cells[columnIndex].innerText;
    let cellB = b.cells[columnIndex].innerText;

    // Try to compare as numbers if possible
    const numA = parseFloat(cellA);
    const numB = parseFloat(cellB);
    const isNumeric = !isNaN(numA) && !isNaN(numB);

    if (isNumeric) {
      return _sortDirection * (numA - numB);
    } else {
      return _sortDirection * cellA.localeCompare(cellB);
    }
  });

  // Re-append sorted rows
  for (let row of rows) {
    tbody.appendChild(row);
  }
}

// general helper function
function removeElementById(id) {
  document.querySelector(`#${id}`).remove();
}

// general helper function
function showElementByID(id) {
  document.querySelector(`#${id}`).classList.remove("hidden");
}

// general helper function
function hideElementByID(id) {
    document.querySelector(`#${id}`).classList.add("hidden");
}

window.addEventListener('load', () => {
  staticInit();
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);

  // const analytics = getAnalytics(app);

  // Check if the user is signed in
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const db = firebase.firestore();
      const leagueName = sessionStorage.getItem("shorthandName");

      // Bind back to overview event to overview button
      document.querySelector("#overview").addEventListener("click", function() {
          window.location.href = "overview.html";
      });

      // Bind logout event to logout button
      document.querySelector("#logout").addEventListener("click", logoutUser);
      
      // Initialize collection listeners
      initScoreboardCollectionListener(db, leagueName, user.uid);
      initLeagueCollectionListener(db, leagueName, user.uid);
      initPlayersCollectionListener(db, leagueName, user.uid);
      initRosterLock();
    } else {
      // User is not signed in, redirect back to login
      // console.log("user not signed in")
      window.location.href = "index.html";
    }
  });
});