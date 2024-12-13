import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./ProfilePage.css";

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);  // State for orders
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  // Hämta användardata från localStorage vid sidladdning
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setProfileData(JSON.parse(user));
      setIsLoggedIn(true);
    }
  
    // Fetch orders based on the nickname from localStorage
    if (user) {
      const { nickname } = JSON.parse(user);
  
      // API call to fetch orders
      fetch("https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/order")
        .then((response) => response.json())
        .then((data) => {
          // Log the response data to check if it's properly parsed
          console.log("Fetched orders:", data);
  
          // Check if the body is a string and needs to be parsed
          let parsedData = data.body ? JSON.parse(data.body) : data; // Parse body if it's a string
  
          // Ensure that items exist and are in array format
          if (parsedData && parsedData.items && Array.isArray(parsedData.items)) {
            // Filter orders based on customerName
            const userOrders = parsedData.items.filter((order: any) => order.customerName === nickname);
            setOrders(userOrders);
          } else {
            console.error("No orders found or invalid response structure:", parsedData);
          }
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
        });
    }
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  if (!profileData) {
    return <div>Loading...</div>; // Vänta tills användardata är laddad
  }

  return (
    <div className="profile-page">
      <header className="header">
        <div className="header-left">
          <h1 className="main-title">POTA-TO-GO</h1>
          <p className="subtitle">Fast Food, Done the Potato Way</p>
        </div>
        <div className="header-right">
          <p className="nav-item">Contact</p>
          <p className="nav-item">{profileData.nickname}</p>
          <button onClick={handleLogout} className="nav-item">
            Log out
          </button>
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
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map((order, index) => (
              <div key={index} className="order-item">
                <div className="order-status">
                  <p>{order.orderStatus}</p>
                  <div className="order-details">
                    <p>Order #{order.orderId}</p>
                    <p>Order date: {order.updatedAt}</p>
                  </div>
                  <button>Receipt</button>
                  <button>Order Again</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
