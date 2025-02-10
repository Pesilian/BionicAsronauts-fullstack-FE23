import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';
import CartPopup from './cart';
import { SubItem } from '../types/cartTypes';
import { numberedOrderItemsIntoCartItems, numberedOrderItemsIntoMenuSelectedItems, selectedItemsIntoMenuItem } from '../utils/parseOrder';
import axios from 'axios';
import { Order } from '../types/orderTypes';
import OrderEditOverlay from './OrderEditOverlay';
import { fetchOrders } from '../api/ordersApi'; // ✅ Correct API call

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showCartPopup, setShowCartPopup] = useState<boolean>(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // ✅ Added for edit order
  const [isEditOverlayOpen, setIsEditOverlayOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleEditOrder = (order: Order) => {
    console.log("Editing order:", order);
    setSelectedOrder(order);
    setIsEditOverlayOpen(true);
  };

  // ✅ Fetch profile and orders when the page loads (RESTORED ORIGINAL LOGIC)
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setProfileData(parsedUser);
      setIsLoggedIn(true);

      // ✅ Correct API call (previously used fetch)
      const { nickname } = parsedUser;

      fetchOrders({ customerName: nickname }) // ✅ Only change here
        .then(response => {
          setOrders(response.items);
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

  const generateCartId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  };

  const handleOrderAgain = async (order: any) => {
    try {
      const selectedItems = numberedOrderItemsIntoMenuSelectedItems(order);
      const mainItem = selectedItemsIntoMenuItem(selectedItems);

      const newCart = {
        customerName: profileData.nickname,
        menuItems: {
          mainItem,
        },
      };

      const response = await fetch('https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCart),
      });

      if (!response.ok) {
        throw new Error('Failed to create cart');
      }

      const data = await response.json();
      const bodyObject = JSON.parse(data.body);
  
      const updatedCartId = bodyObject.cartId;
  
      if (updatedCartId) {
        setCartId(updatedCartId);
        localStorage.setItem('cartId', updatedCartId);
      }

      setCartId(updatedCartId);
      setShowCartPopup(true);
    } catch (error) {
      console.error('Error creating new cart:', error);
    }
  };

  if (!profileData) {
    return <div>Loading...</div>; 
  }

  // ✅ RESTORED ORIGINAL PROFILE INFO LOGIC
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
                    <p>Order date: {order.createdAt}</p>
                    { order.updatedAt && <p>Order updated: {order.updatedAt}</p> }
                  </div>
                  <button>Receipt</button>
                  {order.orderStatus === 'pending' && (
                    <>
                      <button onClick={() => handleOrderAgain(order)}>Cancel Order</button>
                      <button onClick={() => handleEditOrder(order)}>Edit Order</button>
                    </>
                  )}
                  <button onClick={() => handleOrderAgain(order)}>Order Again</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCartPopup && <CartPopup onClose={() => setShowCartPopup(false)} cartId={cartId} />}
      {isEditOverlayOpen && selectedOrder && (
        <OrderEditOverlay order={selectedOrder} onClose={() => setIsEditOverlayOpen(false)} />
      )}
    </div>
  );
};

export default ProfilePage;
