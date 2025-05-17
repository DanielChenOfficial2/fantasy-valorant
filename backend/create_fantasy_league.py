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
fantasy_league_name = "2025split1"
fantasy_leagues_collection_ref = db.collection("fantasyleagues")
# doc_ref = fantasy_leagues_collection_ref.document(fantasy_league_name)
# doc_ref.set({"numUsers": 0, "name": "VCT 2025 Split 1 (Global)", "userUIDs": []})

applicable_tournament_urls = ["https://www.vlr.gg/event/2347/champions-tour-2025-americas-stage-1",
                              "https://www.vlr.gg/event/2379/champions-tour-2025-pacific-stage-1",
                              "https://www.vlr.gg/event/2380/champions-tour-2025-emea-stage-1"]
playerInfoArr = []
for applicable_tournament_url in applicable_tournament_urls:
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(applicable_tournament_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    event_teams_containers = soup.select("div.event-teams-container div.wf-card.event-team")
    for event_team_container in event_teams_containers:
        event_team_name = event_team_container.select_one("a.wf-module-item.event-team-name").text.strip()
        print(event_team_name)

        event_team_url = "https://www.vlr.gg" + event_team_container.select_one('a.wf-module-item.event-team-name')['href']
        # print(event_team_url)
        event_team_response = requests.get(event_team_url)
        event_team_soup = BeautifulSoup(event_team_response.content, "html.parser")
        event_team_shorthand_name = (
            event_team_soup.select_one("h2.wf-title.team-header-tag").text.strip()
            if event_team_soup.select_one("h2.wf-title.team-header-tag") 
            else event_team_name
        )
        # print(event_team_shorthand_name)

        event_team_players_items = event_team_container.select(".event-team-players-item")
        # print(event_team_players_items)
        for event_team_players_item in event_team_players_items:
            event_player_name = event_team_players_item.text.strip()
            players_collection_ref = fantasy_leagues_collection_ref.document(fantasy_league_name).collection("players")
            player_doc_ref = players_collection_ref.document(event_player_name)
            player_doc_ref.set({"teamName": event_team_name, "shorthandTeamName": event_team_shorthand_name, "owner": None,})

# docs = fantasy_leagues_collection_ref.stream()
# for doc in docs:
#     print(f"{doc.id} => {doc.to_dict()}")