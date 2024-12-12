import React, { useState } from 'react';
import './LandingPage.css';
import lppotato from '../assets/lppotato.svg';
import howto1 from '../assets/howto1.svg';
import howto2 from '../assets/howto2.svg';
import howto3 from '../assets/howto3.svg';
import chef from '../assets/chef.svg';
import sousteam from '../assets/sousteam.svg';
import potatoes from '../assets/potatoes.svg';
import LoginPopup from './LoginPopup';
import MenuPopup from './menu'; // Ensure this is correctly imported

const LandingPage: React.FC = () => {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [showMenuPopup, setShowMenuPopup] = useState(false);

  const handleShowMenuPopup = () => {
    setShowMenuPopup(true);
  };

  const handleClosePopup = () => {
    setShowMenuPopup(false);
  };

  const handleLogin = (nickname: string, password: string) => {
    const apiEndpoint =
      'https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/login';

    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname, password }),
      mode: 'cors',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        console.log('Response from API:', data);
        if (data.message === 'Login successful') {
          alert('Login successful!');
          setIsLoginPopupOpen(false);
        } else {
          alert('Invalid credentials!');
        }
      })
      .catch(error => {
        console.error('Login failed:', error);
        alert('An error occurred during login.');
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
            From spuds to smiles, our menu is crafted
            <br />
            to satisfy your cravings with every delicious bite.
            <br />
            Let’s turn your day into a potato-powered adventure!
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

      {/* Menu Popup Trigger */}
      {showMenuPopup && <MenuPopup onClose={handleClosePopup} />}

      <section className="howto-section">
        <div className="howto-title">
          <p>The Potato Process</p>
        </div>
        <div className="howto-images">
          <div className="howto-image">
            <img src={howto1} alt="How to 1" />
          </div>
          <div className="howto-image">
            <img src={howto2} alt="How to 2" />
          </div>
          <div className="howto-image">
            <img src={howto3} alt="How to 3" />
          </div>
        </div>
        <button className="customize-button" onClick={handleShowMenuPopup}>
          Start customizing Your Baked Bliss
        </button>
      </section>
      <section className="about-us-section">
        <p className="about-us-title">About Us</p>
        <p className="about-us-description">
          At POTA-TO-GO, we’re more than just a fast-food brand—we’re a
          community fueled by a love for great food and even better company. Our
          mission is to deliver an unforgettable dining experience, one potato
          at a time.
        </p>
        <div className="about-us-details">
          <div className="detail">
            <h3 className="detail-title">Our Story</h3>
            <p className="detail-text">
              Our journey began with a simple idea: to redefine fast food by
              celebrating the humble potato. From our first crispy creation to
              the vibrant menu we offer today, every bite tells a story of
              passion, creativity, and a love for great flavors.
            </p>
          </div>
          <div className="detail">
            <h3 className="detail-title">Our Vision</h3>
            <p className="detail-text">
              We envision a world where fast food is not just quick, but also
              wholesome and delightful. At POTA-TO-GO, we strive to bring people
              together over meals that are as fun to customize as they are
              delicious to enjoy.
            </p>
          </div>
          <div className="detail">
            <h3 className="detail-title">Ingredients & Quality</h3>
            <p className="detail-text">
              Every dish starts with the freshest ingredients, carefully sourced
              and thoughtfully prepared. We believe in delivering quality you
              can taste, from our creamy toppings to the perfectly crisp
              potatoes.
            </p>
          </div>
        </div>
        <div className="about-us-images">
          <img src={chef} alt="Chef" className="about-us-image" />
          <img src={sousteam} alt="Sous Team" className="about-us-image" />
          <img src={potatoes} alt="Potatoes" className="about-us-image" />
        </div>
      </section>
      <footer className="footer">
        <div className="footer-line"></div>
        <div className="footer-content">
          <h1 className="footer-logo">POTA-TO-GO</h1>
          <p className="footer-title">OPENING HOURS</p>
          <p className="footer-hours">
            Monday - Friday: 11:00 AM - 10:00 PM <br />
            Saturday - Sunday: 12:00 PM - 11:00 PM
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
