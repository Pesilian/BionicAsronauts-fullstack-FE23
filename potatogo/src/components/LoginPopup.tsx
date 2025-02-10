import React, { useState } from 'react';
import styles from '../styles/LoginPopup.module.css';

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
    <div className={styles.loginPopup}>
      <div className={styles.loginPopupContent}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
        <h2>Log In</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.loginBtn}>
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;
