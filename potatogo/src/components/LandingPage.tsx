import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LandingPage.module.css';
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

  const updateCartId = (newCartId: string) => {
    setSelectedCartId(newCartId);
    localStorage.setItem('cartId', newCartId);
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
    <div className={styles.landingPage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.mainTitle}>POTA-TO-GO</h1>
          <p className={styles.subtitle}>Fast Food, Done the Potato Way</p>
        </div>
        <div className={styles.headerRight}>
          <p className={styles.navItem} onClick={() => setShowContactPopup(true)}>
            Contact
          </p>
          {isLoggedIn ? (
            <>
              <p className={styles.navItem} onClick={handleProfileNavigation}>
                {nickname}
              </p>
              <button onClick={handleLogout} className={styles.navItem}>
                Log Out
              </button>
            </>
          ) : (
            <p className={styles.navItem} onClick={() => setIsLoginPopupOpen(true)}>
              Log in
            </p>
          )}
          <img
            src={cart}
            alt="Cart"
            className={styles.cartBtn}
            onClick={handleShowCartPopup}
          />
        </div>
      </header>
      <section className={styles.contentSection}>
        <div className={styles.textContent}>
          <p className={styles.mainText}>
            Crispy potatoes, <br />
            creamy toppings, <br />
            savory sides, <br />
            great vibes.
          </p>
          <p className={styles.secondaryText}>
            From spuds to smiles, our menu is crafted
            <br />
            to satisfy your cravings with every delicious bite.
            <br />
            Let’s turn your day into a potato-powered adventure!
          </p>
          <p className={styles.orderText}>Order your potato</p>
        </div>
        <div className={styles.imageContent}>
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

      {showMenuPopup && (
        <MenuPopup onClose={handleClosePopup} onCartIdChange={updateCartId} />
      )}

      <section className={styles.howtoSection}>
        <div className={styles.howtoTitle}>
          <p>The Potato Process</p>
        </div>
        <div className={styles.howtoImages}>
          <div className={styles.howtoImage}>
            <img src={howto1} alt="How to 1" />
          </div>
          <div className={styles.howtoImage}>
            <img src={howto2} alt="How to 2" />
          </div>
          <div className={styles.howtoImage}>
            <img src={howto3} alt="How to 3" />
          </div>
        </div>
        <button className={styles.customizeButton} onClick={handleShowMenuPopup}>
          Start customizing Your Baked Bliss
        </button>
      </section>
      <section className={styles.aboutUsSection}>
        <p className={styles.aboutUsTitle}>About Us</p>
        <p className={styles.aboutUsDescription}>
          At POTA-TO-GO, we’re more than just a fast-food brand—we’re a
          community fueled by a love for great food and even better company. Our
          mission is to deliver an unforgettable dining experience, one potato
          at a time.
        </p>
        <div className={styles.aboutUsDetails}>
          <div className={styles.detail}>
            <h3 className={styles.detailTitle}>Our Story</h3>
            <p className={styles.detailText}>
              Our journey began with a simple idea: to redefine fast food by
              celebrating the humble potato. From our first crispy creation to
              the vibrant menu we offer today, every bite tells a story of
              passion, creativity, and a love for great flavors.
            </p>
          </div>
          <div className={styles.detail}>
            <h3 className={styles.detailTitle}>Our Vision</h3>
            <p className={styles.detailText}>
              We envision a world where fast food is not just quick, but also
              wholesome and delightful. At POTA-TO-GO, we strive to bring people
              together over meals that are as fun to customize as they are
              delicious to enjoy.
            </p>
          </div>
          <div className={styles.detail}>
            <h3 className={styles.detailTitle}>Ingredients & Quality</h3>
            <p className={styles.detailText}>
              Every dish starts with the freshest ingredients, carefully sourced
              and thoughtfully prepared. We believe in delivering quality you
              can taste, from our creamy toppings to the perfectly crisp
              potatoes.
            </p>
          </div>
        </div>

        <div className={styles.aboutUsImages}>
          <img src={chef} alt="Chef" className={styles.aboutUsImage} />
          <img src={sousteam} alt="Sous Team" className={styles.aboutUsImage} />
          <img src={potatoes} alt="Potatoes" className={styles.aboutUsImage} />
        </div>
      </section>
      <footer className={styles.footer}>
        <div className={styles.footerLine}></div>
        <div className={styles.footerContent}>
          <h1 className={styles.footerLogo}>POTA-TO-GO</h1>
          <p className={styles.footerTitle}>OPENING HOURS</p>
          <p className={styles.footerHours}>
            Monday - Friday: 11:00 AM - 10:00 PM <br />
            Saturday - Sunday: 12:00 PM - 11:00 PM
          </p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;