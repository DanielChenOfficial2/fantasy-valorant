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

def delete_collection(coll_ref, batch_size=10):
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        print(f'Deleting document {doc.id}')
        doc.reference.delete()
        deleted += 1

    if deleted >= batch_size:
        return delete_collection(coll_ref, batch_size)

# Application Default credentials are automatically created (with above gcloud commands)
# simple firebase initialization
app = firebase_admin.initialize_app()
db = firestore.client()

# think of the collection as the database and a document as an entry in that database
# bunch of sample document setting
fantasy_leagues_collection_ref = db.collection("fantasy_leagues").document("2025_americas_split1").collection("players")
delete_collection(fantasy_leagues_collection_ref)