import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin with your service account
cred = credentials.Certificate("FIREBASE_DATABASE_URL")
firebase_admin.initialize_app(cred)

db = firestore.client()
