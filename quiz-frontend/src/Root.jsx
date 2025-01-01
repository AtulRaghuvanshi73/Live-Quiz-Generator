import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './authContext';
import App from './App';

function Root() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

export default Root;
