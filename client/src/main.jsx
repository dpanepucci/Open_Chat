import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Login from './Login.jsx';
import App from './App.jsx';

function Root() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  return isAuthenticated ? (
    <App />
  ) : (
    <Login onLogin={() => setIsAuthenticated(true)} />
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
