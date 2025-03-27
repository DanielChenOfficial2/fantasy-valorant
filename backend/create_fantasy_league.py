# This file aims to create a fantasy league
# Run the following commands to setup:
# pip3 install --upgrade firebase-admin ()
# sudo snap install --classic google-cloud-cli
# gcloud init 
# gcloud auth application-default login
# see https://firebase.google.com/docs/firestore/quickstart#python and https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment
import firebase_admin
from firebase_admin import firestore

# Application Default credentials are automatically created (with above gcloud commands)
# simple firebase initialization
app = firebase_admin.initialize_app()
db = firestore.client()

# think of the collection as the database and a document as an entry in that database
# bunch of sample document setting
fantasy_league_name = "2025split1"
fantasy_leagues_collection_ref = db.collection("fantasyleagues")
doc_ref = fantasy_leagues_collection_ref.document(fantasy_league_name)
doc_ref.set({"numUsers": 0, "name": "VCT 2025 Split 1 (Global)", "userUIDs": []})

docs = fantasy_leagues_collection_ref.stream()
for doc in docs:
    print(f"{doc.id} => {doc.to_dict()}")