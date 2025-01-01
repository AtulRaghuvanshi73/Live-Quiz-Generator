import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const Leaderboard = ({ quizId }) => {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        // Real-time leaderboard updates
        const participantsRef = collection(db, 'quizzes', quizId, 'participants');
        const q = query(participantsRef, orderBy('score', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const participantsData = [];
            snapshot.forEach((doc) => {
                participantsData.push({ id: doc.id, ...doc.data() });
            });
            setParticipants(participantsData);
        });

        return () => unsubscribe();
    }, [quizId]);

    return (
        <div className="leaderboard">
            <h2>Leaderboard</h2>
            <div className="leaderboard-list">
                {participants.map((participant, index) => (
                    <div key={participant.id} className="leaderboard-item">
                        <span className="rank">{index + 1}</span>
                        <span className="name">{participant.name}</span>
                        <span className="score">{participant.score}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

Leaderboard.propTypes = {
    quizId: PropTypes.string.isRequired
};

export default Leaderboard;
