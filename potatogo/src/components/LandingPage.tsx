import React, { useState } from "react";
import "./LandingPage.css";
import lppotato from "../assets/lppotato.svg";
import LoginPopup from "./LoginPopup";

const LandingPage: React.FC = () => {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  const handleLogin = (nickname: string, password: string) => {
    const apiEndpoint =
      "https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/login";

    fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname, password }),
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from API:", data);
        if (data.message === "Login successful") {
          alert("Login successful!");
          setIsLoginPopupOpen(false);
        } else {
          alert("Invalid credentials!");
        }
      })
      .catch((error) => {
        console.error("Login failed:", error);
        alert("An error occurred during login.");
      });
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="header-left">
          <h1 className="main-title">POTA-TO-GO</h1>
          <p className="subtitle">Fast Food, Done the Potato Way</p>
        </div>
        <div className="header-right">
          <p className="nav-item">Orders</p>
          <p className="nav-item">Contact</p>
          <p className="nav-item" onClick={() => setIsLoginPopupOpen(true)}>
            Log in
          </p>
        </div>
      </header>
      <section className="content-section">
        <div className="text-content">
          <p className="main-text">
            Crispy potatoes, <br />
            creamy toppings, <br />
            savory sides, <br />
            great vibes.
          </p>
          <p className="secondary-text">
            Lorem ipsum dolor sit amet, consectetur <br />
            adipiscing elit,sed do eiusmod tempor <br />
            incididunt ut labore et dolore magna aliqua.
          </p>
          <p className="order-text">Order your potato</p>
        </div>
        <div className="image-content">
          <img src={lppotato} alt="Potato" />
        </div>
      </section>

      {isLoginPopupOpen && (
        <LoginPopup
          onClose={() => setIsLoginPopupOpen(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
};

export default LandingPage;
