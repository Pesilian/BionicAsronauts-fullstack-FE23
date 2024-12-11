import React, { useState } from "react";
import "./ProfilePage.css";

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState({
    name: "Potato Customer",
    email: "example@mail.com",
    phone: "1234567890",
    city: "City",
    cardName: "Name on card",
    surname: "Surname on card",
    cardNumber: "**** **** **** 1234",
    cardExpiryMonth: "Select",
    cardExpiryYear: "Select",
    cvc: "***",
  });

  return (
    <div className="profile-page">
      <header className="header">
        <div className="header-left">
          <h1 className="main-title">POTA-TO-GO</h1>
          <p className="subtitle">Fast Food, Done the Potato Way</p>
        </div>
        <div className="header-right">
          <p className="nav-item">Orders</p>
          <p className="nav-item">Contact</p>
          <p className="nav-item">Profile</p>
        </div>
      </header>

      <div className="profile-container">
        <div className="profile-card-container">
          <div className="profile-section">
            <h2>Profile</h2>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={profileData.name} readOnly />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={profileData.email} readOnly />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" value={profileData.phone} readOnly />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" value={profileData.city} readOnly />
            </div>
            <button>Edit Profile</button>
            <div className="delete-account">
              <button className="delete-button">Delete Account</button>
            </div>
          </div>

          <div className="card-section">
            <h2>Card Information</h2>
            <div className="form-group">
              <label>Card name</label>
              <input type="text" value={profileData.cardName} readOnly />
            </div>
            <div className="form-group">
              <label>First name</label>
              <input type="text" value={profileData.surname} readOnly />
            </div>
            <div className="form-group">
              <label>Card number</label>
              <input type="text" value={profileData.cardNumber} readOnly />
            </div>
            <div className="card-expiry">
              <div className="form-group">
                <label>Month</label>
                <select value={profileData.cardExpiryMonth} disabled>
                  <option>Select</option>
                  <option>01</option>
                  <option>02</option>
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select value={profileData.cardExpiryYear} disabled>
                  <option>Select</option>
                  <option>2024</option>
                  <option>2025</option>
                </select>
              </div>
              <div className="form-group">
                <label>CVC</label>
                <input type="text" value={profileData.cvc} readOnly />
              </div>
            </div>
            <button>Change Card</button>
          </div>
        </div>

        <div className="orders-section">
          <h2>My Orders</h2>
          <div className="order-item">
            <div className="order-status">
              <p>Upcoming</p>
              <div className="order-details">
                <p>Order #251100</p>
                <p>Order date: 2024-10-23</p>
              </div>
              <button>Receipt</button>
              <button>Order Again</button>
            </div>
          </div>
          <div className="order-item">
            <div className="order-status">
              <p>History</p>
              <div className="order-details">
                <p>Order #251101</p>
                <p>Order date: 2024-10-20</p>
              </div>
              <button>Receipt</button>
              <button>Order Again</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
