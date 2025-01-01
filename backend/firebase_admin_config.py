import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin with your service account
cred = credentials.Certificate("./live-quiz-application-firebase-adminsdk-n73lv-6cf002f5f2.json")
firebase_admin.initialize_app(cred)

db = firestore.client()
