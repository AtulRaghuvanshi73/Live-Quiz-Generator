from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os
from typing import Dict, List
import uuid
from models import Quiz, QuizParticipant
from firebase_admin_config import db

# Load environment variables
load_dotenv()

# Initialize GenAI with your API key
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=API_KEY)

# FastAPI instance
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, you can specify your frontend URL instead of "*"
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, quiz_id: str):
        await websocket.accept()
        if quiz_id not in self.active_connections:
            self.active_connections[quiz_id] = []
        self.active_connections[quiz_id].append(websocket)

    async def disconnect(self, websocket: WebSocket, quiz_id: str):
        self.active_connections[quiz_id].remove(websocket)

    async def broadcast(self, message: dict, quiz_id: str):
        for connection in self.active_connections.get(quiz_id, []):
            await connection.send_json(message)

manager = ConnectionManager()

# Pydantic model for input
class Query(BaseModel):
    prompt: str

QUIZ_PROMPT_TEMPLATE = """Generate exactly 15 multiple choice questions about {topic}. 
Format each question as follows:
Q1. [Question]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
Correct Answer: [A/B/C/D]

Make sure to:
- Include exactly 15 questions
- Provide 4 options for each question
- Clearly mark the correct answer
- Keep questions engaging and educational
"""

@app.post("/generate")
async def generate_content(query: Query):
    try:
        # Generate content using the formatted prompt
        model = genai.GenerativeModel("gemini-1.5-flash")
        formatted_prompt = QUIZ_PROMPT_TEMPLATE.format(topic=query.prompt)
        response = model.generate_content(formatted_prompt)
        
        # Parse the response into structured format
        quiz_text = response.text
        questions = quiz_text.split('\n\n')  # Split by double newline to separate questions
        
        return {"generated_content": questions[:15]}  # Ensure only 15 questions are returned
    except Exception as e:
        print("Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Error occurred: {str(e)}")

# Quiz CRUD operations
@app.post("/quiz/create")
async def create_quiz(quiz: Quiz):
    quiz.id = str(uuid.uuid4())
    quiz.join_code = str(uuid.uuid4())[:6].upper()
    db.collection('quizzes').document(quiz.id).set(quiz.dict())
    return {"quiz_id": quiz.id, "join_code": quiz.join_code}

@app.get("/quiz/{quiz_id}")
async def get_quiz(quiz_id: str):
    quiz_ref = db.collection('quizzes').document(quiz_id)
    quiz = quiz_ref.get()
    if not quiz.exists:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz.to_dict()

@app.post("/quiz/join/{join_code}")
async def join_quiz(join_code: str, participant: QuizParticipant):
    quiz_ref = db.collection('quizzes').where('join_code', '==', join_code).limit(1)
    quiz_docs = quiz_ref.get()
    
    if not quiz_docs:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz = quiz_docs[0]
    participant_ref = db.collection('quizzes').document(quiz.id).collection('participants')
    participant_ref.document(participant.user_id).set(participant.dict())
    return {"quiz_id": quiz.id}

@app.websocket("/ws/quiz/{quiz_id}")
async def websocket_endpoint(websocket: WebSocket, quiz_id: str):
    await manager.connect(websocket, quiz_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data, quiz_id)
    except WebSocketDisconnect:
        await manager.disconnect(websocket, quiz_id)

