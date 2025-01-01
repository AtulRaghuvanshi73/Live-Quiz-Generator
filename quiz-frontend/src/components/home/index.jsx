import { useNavigate } from 'react-router-dom';
import { doSignOut } from '../../firebase/auth';
import { useAuth } from '../../authContext';
import { useState } from 'react';

const Home = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [topic, setTopic] = useState('');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogout = async () => {
        try {
            await doSignOut();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!topic.trim()) {
            setError('Please provide a topic for the quiz.');
            return;
        }
        setError('');
        setLoading(true);
    
        try {
            const response = await fetch('http://127.0.0.1:8000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: topic })
            });
    
            if (!response.ok) {
                throw new Error('Failed to generate quiz questions.');
            }
    
            const data = await response.json();
            setQuizQuestions(data.generated_content);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold">Welcome, {currentUser?.email}</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto py-10 px-4">
                <h2 className="text-2xl font-bold mb-4">AI-Generated Quiz</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Enter quiz topic..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 w-full"
                    />
                </div>
                <button
                    onClick={handleGenerateQuiz}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Quiz'}
                </button>
                {error && <p className="text-red-500 mt-4">{error}</p>}

                {quizQuestions.length > 0 && (
                    <div className="mt-6 space-y-6">
                        <h3 className="text-xl font-semibold mb-4">Quiz Questions:</h3>
                        <div className="space-y-8">
                            {quizQuestions.map((question, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow">
                                    <pre className="whitespace-pre-wrap font-sans">
                                        {question}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
