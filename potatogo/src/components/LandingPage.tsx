import React from 'react';
import './LandingPage.css';
import lppotato from '../assets/lppotato.svg';

const LandingPage: React.FC = () => {
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
          <p className="nav-item">Log in</p>
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
          <p className="order-text">
            Order your potato
        </p>
        </div>
        <div className="image-content">
          <img src={lppotato} alt="Potato" />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
