import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]); // State for orders
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  // Fetch profile and orders when the page loads
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setProfileData(parsedUser); // Set the profile data from localStorage
      setIsLoggedIn(true);

      // Fetch orders based on the nickname from localStorage
      const { nickname } = parsedUser;

      // API call to fetch orders
      fetch('https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/order')
        .then(response => response.json())
        .then(data => {
          console.log('Fetched orders:', data); // Log the fetched orders

          // Ensure body is correctly parsed (check if the body is a string and needs parsing)
          let parsedData = data.body ? JSON.parse(data.body) : data;

          if (
            parsedData &&
            parsedData.items &&
            Array.isArray(parsedData.items)
          ) {
            // Filter orders based on customerName (nickname)
            const userOrders = parsedData.items.filter(
              (order: any) => order.customerName === nickname
            );
            setOrders(userOrders); // Set orders based on customerName
          } else {
            console.error(
              'No orders found or invalid response structure:',
              parsedData
            );
          }
        })
        .catch(error => {
          console.error('Error fetching orders:', error);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  if (!profileData) {
    return <div>Loading...</div>; // Wait until profile data is loaded
  }

  // Ensure all fields exist before rendering
  const {
    name,
    email,
    phone,
    address,
    cardName,
    surname,
    cardNumber,
    cardExpiryMonth,
    cardExpiryYear,
    cvc,
  } = profileData || {};

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
          <button onClick={handleLogout} className="logout-button">
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
              <input type="text" value={name || 'N/A'} readOnly />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email || 'N/A'} readOnly />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" value={phone || 'N/A'} readOnly />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" value={address || 'N/A'} readOnly />
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
              <input type="text" value={cardName || 'N/A'} readOnly />
            </div>
            <div className="form-group">
              <label>First name</label>
              <input type="text" value={surname || 'N/A'} readOnly />
            </div>
            <div className="form-group">
              <label>Card number</label>
              <input type="text" value={cardNumber || 'N/A'} readOnly />
            </div>
            <div className="card-expiry">
              <div className="form-group">
                <label>Month</label>
                <select value={cardExpiryMonth || 'N/A'} disabled>
                  <option>Select</option>
                  <option>01</option>
                  <option>02</option>
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select value={cardExpiryYear || 'N/A'} disabled>
                  <option>Select</option>
                  <option>2024</option>
                  <option>2025</option>
                </select>
              </div>
              <div className="form-group">
                <label>CVC</label>
                <input type="text" value={cvc || 'N/A'} readOnly />
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
