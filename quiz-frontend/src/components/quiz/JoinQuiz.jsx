import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { db } from '../../firebase/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

const JoinQuiz = ({ quizId, userId }) => {
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        // Real-time quiz subscription
        const quizRef = doc(db, 'quizzes', quizId);
        const unsubscribe = onSnapshot(quizRef, (doc) => {
            if (doc.exists()) {
                setQuiz(doc.data());
            }
        });

        return () => unsubscribe();
    }, [quizId]);

    const submitAnswer = async (questionId, answer) => {
        const newAnswers = { ...answers, [questionId]: answer };
        setAnswers(newAnswers);

        // Update user's answers in Firestore
        await updateDoc(doc(db, 'quizzes', quizId, 'participants', userId), {
            answers: newAnswers
        });
    };

    return (
        <div className="join-quiz">
            {quiz && (
                <>
                    <h2>{quiz.title}</h2>
                    {quiz.questions.map((question) => (
                        <div key={question.id} className="question">
                            <h3>{question.text}</h3>
                            {question.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => submitAnswer(question.id, option)}
                                    className={answers[question.id] === option ? 'selected' : ''}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

JoinQuiz.propTypes = {
    quizId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired
};

export default JoinQuiz;
