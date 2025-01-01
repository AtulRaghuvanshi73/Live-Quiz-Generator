from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Question(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class Quiz(BaseModel):
    id: Optional[str] = None
    creator_id: str
    title: str
    questions: List[Question]
    created_at: datetime = datetime.now()
    is_active: bool = False
    join_code: str

class QuizResponse(BaseModel):
    user_id: str
    quiz_id: str
    answers: dict
    score: Optional[float] = None

class QuizParticipant(BaseModel):
    quiz_id: str
    user_id: str
    join_time: datetime = datetime.now()
