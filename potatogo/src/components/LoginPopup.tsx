import React, { useState } from 'react';
import '../styles/LoginPopup.css';

interface LoginPopupProps {
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-popup">
      <div className="login-popup-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Log In</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;
