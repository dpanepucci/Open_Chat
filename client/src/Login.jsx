import { useState } from 'react';
import './Login.css';

const TEST_ACCOUNTS = [
  { email: 'test@openchat.com', password: 'Password123!', username: 'TestAccount' },
  { email: 'dylan@openchat.com', password: 'ChatTester456!', username: 'DPooch' },
];

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    const isValid = TEST_ACCOUNTS.some(
      (account) =>
        account.email.toLowerCase() === normalizedEmail &&
        account.password === password
    );

    if (!isValid) {
      setError('Invalid email or password');
      return;
    }

    // fake auth success
    sessionStorage.setItem('isAuthenticated', 'true');
    onLogin();
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>

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

        <div>
            <label>Username:</label>
            <input 
            type="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        <button type="submit">Log In</button>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Test login 1: {TEST_ACCOUNTS[0].email} / {TEST_ACCOUNTS[0].password}
          <br />
          Test login 2: {TEST_ACCOUNTS[1].email} / {TEST_ACCOUNTS[1].password}
        </p>
      </form>
    </div>
  );
}

export default Login;