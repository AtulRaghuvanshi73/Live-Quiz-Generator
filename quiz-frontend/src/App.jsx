import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/login';
import Register from './components/auth/register';
import Home from './components/home';
import { useAuth } from './authContext';

function App() {
  const { userLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/home" 
        element={userLoggedIn ? <Home /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={userLoggedIn ? "/home" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default App;
