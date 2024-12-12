import React, { useState } from "react";
import "./LoginPopup.css";

interface LoginPopupProps {
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ onClose, onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const apiEndpoint =
      "https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/register";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration successful!");
        setIsLoginMode(true); // Växlar tillbaka till Log In
        setUsername("");
        setEmail("");
        setPassword("");
      } else {
        alert(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="login-popup">
      <div className="login-popup-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <div className="tab-switch">
          <button
            className={`tab ${isLoginMode ? "active" : ""}`}
            onClick={() => setIsLoginMode(true)}
          >
            Log In
          </button>
          <button
            className={`tab ${!isLoginMode ? "active" : ""}`}
            onClick={() => setIsLoginMode(false)}
          >
            Register
          </button>
        </div>
        {isLoginMode ? (
          <form onSubmit={handleLoginSubmit}>
            <h2>Log In</h2>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">
              Log In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <h2>Register</h2>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPopup;
