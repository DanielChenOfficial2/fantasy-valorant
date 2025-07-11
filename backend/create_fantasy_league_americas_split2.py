# This file aims to create a fantasy league
# Run the following commands to setup:
# python3 -m venv venv
# venv/bin/pip3 install firebase-admin
# source venv/bin/activate
# pip3 install --upgrade firebase-admin
# sudo apt update && sudo apt upgrade -y
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
fantasy_league_name = "2025_americas_split2"
fantasy_leagues_collection_ref = db.collection("fantasy_leagues")
doc_ref = fantasy_leagues_collection_ref.document(fantasy_league_name)
doc_ref.set({"numUsers": 0, "name": "VCT 2025: Americas Stage 2 (Group Stage)", "userUIDs": []})

applicable_tournament_urls = ["https://www.vlr.gg/event/2501/vct-2025-americas-stage-2"]
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
        if event_team_name == "100 Thieves":
            players = ["Asuna", "Boostio", "eeiu", "Cryocells", "zander"]
        elif event_team_name == "Cloud9": 
            players = ["mitch", "neT", "Xeppaa", "v1c", "OXY"]
        elif event_team_name == "Evil Geniuses":
            players = ["supamen", "yay", "Derrek", "NaturE", "icy"]
        elif event_team_name == "FURIA":
            players = ["tuyz", "Urango", "heat", "Loss"]
        elif event_team_name == "VISA KRÜ":
            players = ["Melser", "keznit", "adverso", "Mazino", "Shyy"]
        elif event_team_name == "LEVIATÁN":
            players = ["C0M", "tex", "Okeanos", "kiNgg", "Sato"]
        elif event_team_name == "LOUD":
            players = ["pANcada", "Virtyy", "RobbieBk", "cauanzin"]
        elif event_team_name == "MIBR":
            players = ["cortezia", "artzin", "aspas", "xenom", "Verno"]
        elif event_team_name == "NRG":
            players = ["brawk", "s0m", "mada", "skuba", "Ethan"]
        elif event_team_name == "Sentinels":
            players = ["Zellsis", "johnqt", "bang", "zekken", "N4RRATE"]
        elif event_team_name == "G2 Esports":
            players = ["valyn", "jawgemo", "JonahP", "leaf", "trent"]
        elif event_team_name == "2Game Esports":
            players = ["lz", "silentzz", "gobera", "spike"]   
        else:
            raise AttributeError("Team name not found: " + event_team_name)
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