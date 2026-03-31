import { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const url = `http://localhost:3000/${mode}`;
    const body = isRegister ? { username, email, password } : { email, password };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    sessionStorage.setItem('isAuthenticated', 'true');
    onLogin();
  };

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setError('');
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h1>{isRegister ? 'Register' : 'Login'}</h1>

        {isRegister && (
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        <button type="submit">{isRegister ? 'Register' : 'Log In'}</button>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={switchMode}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Log in' : 'Register'}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;