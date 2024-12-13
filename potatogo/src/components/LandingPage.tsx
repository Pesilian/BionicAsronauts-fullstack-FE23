import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importera useNavigate
import "./LandingPage.css";
import lppotato from "../assets/lppotato.svg";
import LoginPopup from "./LoginPopup";

const LandingPage: React.FC = () => {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const navigate = useNavigate(); // För att navigera till /profile när användaren klickar på sitt nickname

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setNickname(user.nickname); // Sätt användarnamn
    }
  }, []);

  const handleLogin = (nickname: string, password: string) => {
    const apiEndpoint =
      "https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/login";
  
    fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from API:", data);
        if (data.message === "Login successful") {
          // Fetch user details from DynamoDB after login success
          const userDetailsEndpoint = `https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/user/${nickname}`;
          fetch(userDetailsEndpoint)
            .then((response) => response.json())
            .then((userData) => {
              // Save complete user info in localStorage
              localStorage.setItem(
                "user",
                JSON.stringify({
                  nickname,
                  name: userData.name,
                  address: userData.address,
                  phone: userData.phone,
                  role: data.role,
                })
              );
              setIsLoggedIn(true);
              setNickname(nickname); // Set nickname
              alert("Login successful!");
              setIsLoginPopupOpen(false);
            })
            .catch((error) => {
              console.error("Error fetching user details:", error);
              alert("An error occurred fetching user details.");
            });
        } else {
          alert("Invalid credentials!");
        }
      })
      .catch((error) => {
        console.error("Login failed:", error);
        alert("An error occurred during login.");
      });
  };
  

  const handleLogout = () => {
    localStorage.removeItem("user"); // Ta bort användardata från localStorage
    setIsLoggedIn(false); // Uppdatera statusen
    setNickname(null);
    alert("You have been logged out.");
  };

  const handleProfileNavigation = () => {
    navigate("/profile"); // Navigera till /profile när användaren klickar på sitt nickname
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="header-left">
          <h1 className="main-title">POTA-TO-GO</h1>
          <p className="subtitle">Fast Food, Done the Potato Way</p>
        </div>
        <div className="header-right">
          <p className="nav-item">Contact</p>
          {isLoggedIn ? (
            <>
              <p
                className="nav-item"
                onClick={handleProfileNavigation}
              >
                {nickname}
              </p>
              <button onClick={handleLogout} className="nav-item">
                Log Out
              </button>
            </>
          ) : (
            <p className="nav-item" onClick={() => setIsLoginPopupOpen(true)}>
              Log in
            </p>
          )}
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