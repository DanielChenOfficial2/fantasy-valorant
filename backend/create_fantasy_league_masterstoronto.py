# This file aims to create a fantasy league
# Run the following commands to setup:
# pip3 install --upgrade firebase-admin ()
# sudo snap install --classic google-cloud-cli
# gcloud init 
# gcloud auth application-default login
# see https://firebase.google.com/docs/firestore/quickstart#python and https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment
import firebase_admin
from firebase_admin import firestore

import requests
from bs4 import BeautifulSoup

# Application Default credentials are automatically created (with above gcloud commands)
# simple firebase initialization
app = firebase_admin.initialize_app()
db = firestore.client()

# think of the collection as the database and a document as an entry in that database
# bunch of sample document setting
fantasy_league_name = "2025_toronto_groups"
fantasy_leagues_collection_ref = db.collection("fantasy_leagues")
doc_ref = fantasy_leagues_collection_ref.document(fantasy_league_name)
doc_ref.set({"numUsers": 0, "name": "Champions Tour 2025: Masters Toronto (Group Stage)", "userUIDs": []})

applicable_tournament_urls = ["https://www.vlr.gg/event/2282/champions-tour-2025-masters-toronto/swiss-stage"]
playerInfoArr = []
for applicable_tournament_url in applicable_tournament_urls:
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(applicable_tournament_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    event_teams_containers = soup.select("div.event-teams-container div.wf-card.event-team")
    for event_team_container in event_teams_containers:
        event_team_name = event_team_container.select_one("a.wf-module-item.event-team-name").text.strip()
        print("Event Team Name: " + event_team_name)

        event_team_url = "https://www.vlr.gg" + event_team_container.select_one('a.wf-module-item.event-team-name')['href']
        # print("Event Team URL: " + event_team_url)
        event_team_response = requests.get(event_team_url)
        event_team_soup = BeautifulSoup(event_team_response.content, "html.parser")
        event_team_shorthand_name = (
            event_team_soup.select_one("h2.wf-title.team-header-tag").text.strip()
            if event_team_soup.select_one("h2.wf-title.team-header-tag") 
            else event_team_name
        )
        # print(event_team_shorthand_name)
        players_collection_ref = fantasy_leagues_collection_ref.document(fantasy_league_name).collection("players")
        if event_team_name == "Sentinels":
            players = ["johnqt", "N4RRATE", "bang", "Zellsis", "zekken"]
        elif event_team_name == "MIBR": 
            players = ["artzin", "xenom", "cortezia", "Verno", "aspas"]
        elif event_team_name == "Bilibili Gaming":
            players = ["whzy", "Levius", "rushia", "nephh", "Knight"]
        elif event_team_name == "Wolves Esports":
            players = ["Spring", "Lysoar", "Yuicaw", "Juicy", "SiuFatBB"]
        elif event_team_name == "Gen.G":
            players = ["Munchkin", "Foxy9", "Ash", "t3xture", "Karon"]
        elif event_team_name == "Paper Rex":
            players = ["Jinggg", "f0rsakeN", "d4v41", "something", "PatMen"]
        elif event_team_name == "Team Heretics":
            players = ["Boo", "MiniBoo", "Wo0t", "RieNs", "benjyfishy"]
        elif event_team_name == "Team Liquid":
            players = ["nAts", "paTiTek", "Keiko", "kamo", "Serial"]
        else:
            raise AttributeError("Team name not found")
        for player_name in players:
            player_data = {
                "teamName": event_team_name,
                "shorthandTeamName": event_team_shorthand_name,
                "owner": None
            }
            player_doc_ref = players_collection_ref.document(player_name)
            player_doc_ref.set(player_data)

# docs = fantasy_leagues_collection_ref.stream()
# for doc in docs:
#     print(f"{doc.id} => {doc.to_dict()}")