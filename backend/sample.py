# This file aims to add a sample set of data to the google firebase database
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
doc_ref = db.collection("players").document("xenom")
doc_ref.set({"name": "xenom", "team_abbrev": "MIBR", "agents": ['astra', 'viper'], "ACS": 231.5})

doc_ref = db.collection("players").document("s0m")
doc_ref.set({"name": "s0m", "team": "NRG", "agents": ['omen', 'brimstone', 'astra'], "ACS": 257.3})

doc_ref = db.collection("players").document("bang")
doc_ref.set({"name": "bang", "team": "SEN", "agents": ['astra', 'omen'], "ACS": 222.0})

# sample collection output
users_ref = db.collection("players")
docs = users_ref.stream()

for doc in docs:
    print(f"{doc.id} => {doc.to_dict()}")