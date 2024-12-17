import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import LoginPopup from './LoginPopup';
import lppotato from '../assets/lppotato.svg';
import howto1 from '../assets/howto1.svg';
import howto2 from '../assets/howto2.svg';
import howto3 from '../assets/howto3.svg';
import chef from '../assets/chef.svg';

import cart from '../assets/cart.svg';
import sousteam from '../assets/sousteam.svg';
import potatoes from '../assets/potatoes.svg';
import MenuPopup from './menu';
import CartPopup from './cart';
import ContactPopup from './contactPopUp';

const LandingPage: React.FC = () => {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [isCartPopupOpen, setIsCartPopupOpen] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setNickname(user.nickname);
    }
  }, []);

  useEffect(() => {
    const cachedCartId = localStorage.getItem('cartId');
    console.log(cachedCartId);
    if (cachedCartId) {
      setSelectedCartId(cachedCartId);
    }
  }, []);

  const [showContactPopup, setShowContactPopup] = useState(false);

  const handleShowCartPopup = () => {
    if (selectedCartId) {
      setIsCartPopupOpen(true);
    } else {
      alert('No cart found. Please add items to the cart first.');
    }
  };

  const handleCloseCartPopup = () => {
    setIsCartPopupOpen(false);
  };

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
    })
      .then(res => res.json())
      .then(data => {
        console.log('Response from API:', data); // Log the full response to check the structure

        if (data.message === 'Login successful') {
          // After successful login, store user details in localStorage
          const userDetails = {
            nickname,
            name: data.name || 'N/A', // Ensure these fields are returned from the API
            address: data.address || 'N/A',
            phone: data.phone || 'N/A',
            email: data.email || 'N/A',
            role: data.role || 'N/A',
          };

          localStorage.setItem('user', JSON.stringify(userDetails)); // Save user data

          setIsLoggedIn(true);
          setNickname(nickname);
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

  const handleLogout = () => {
    localStorage.removeItem('user'); // Ta bort användardata från localStorage
    setIsLoggedIn(false); // Uppdatera statusen
    setNickname(null);
    alert('You have been logged out.');
  };

  const handleProfileNavigation = () => {
    navigate('/profile'); // Navigera till /profile när användaren klickar på sitt nickname
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="header-left">
          <h1 className="main-title">POTA-TO-GO</h1>
          <p className="subtitle">Fast Food, Done the Potato Way</p>
        </div>
        <div className="header-right">
          <p className="nav-item" onClick={() => setShowContactPopup(true)}>
            Contact
          </p>
          {isLoggedIn ? (
            <>
              <p className="nav-item" onClick={handleProfileNavigation}>
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
          <img
            src={cart}
            alt="Cart"
            className="cart-btn"
            onClick={handleShowCartPopup}
          />
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

      {showContactPopup && (
        <ContactPopup onClose={() => setShowContactPopup(false)} />
      )}

      {isLoginPopupOpen && (
        <LoginPopup
          onClose={() => setIsLoginPopupOpen(false)}
          onLogin={handleLogin}
        />
      )}

      {isCartPopupOpen && (
        <CartPopup onClose={handleCloseCartPopup} cartId={selectedCartId} />
      )}

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
