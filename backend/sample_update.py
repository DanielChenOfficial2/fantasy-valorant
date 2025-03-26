# This file aims to update data in/to the google firebase database
# One new piece of data is added, and another is updated
import firebase_admin
from firebase_admin import firestore

# Application Default credentials are automatically created (with above gcloud commands)
# simple firebase initialization
app = firebase_admin.initialize_app()
db = firestore.client()

isAdd = True
isUpdate = False

# think of the collection as the database and a document as an entry in that database
# sample new addition
if isAdd:
    doc_ref = db.collection("players").document("leaf2")
    doc_ref.set({"name": "leaf", "team": "G2", "agents": ['viper', 'vyse'], "ACS": 245.0})

# sample new update
if isUpdate:
    doc_ref = db.collection("players").document("xenom")
    doc_ref.update({"ACS": 62.0})

# sample collection output
users_ref = db.collection("players")
docs = users_ref.stream()

for doc in docs:
    print(f"{doc.id} => {doc.to_dict()}")