import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ProfilePage.module.css';
import CartPopup from '../components/cart';
import { SubItem } from '../types/cartTypes';
import { numberedOrderItemsIntoCartItems, numberedOrderItemsIntoMenuSelectedItems, selectedItemsIntoMenuItem } from '../utils/parseOrder';
import axios from 'axios';
import { Order } from '../types/orderTypes';
import OrderEditOverlay from '../components/OrderEditOverlay';
import { fetchOrders } from '../api/ordersApi';

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showCartPopup, setShowCartPopup] = useState<boolean>(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  //Added for edit order
  const [isEditOverlayOpen, setIsEditOverlayOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleEditOrder = (order: Order) => {
    console.log("Editing order:", order);
    setSelectedOrder(order);
    setIsEditOverlayOpen(true);
  };

  // Fetch profile and orders when the page loads
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setProfileData(parsedUser);
      setIsLoggedIn(true);

      // Correct API call (previously used fetch)
      const { nickname } = parsedUser;

      fetchOrders({ customerName: nickname })
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
    <div className={styles.profilePage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.mainTitle}>POTA-TO-GO</h1>
          <p className={styles.subtitle}>Fast Food, Done the Potato Way</p>
        </div>
        <div className={styles.headerRight}>
          <p className={styles.navItem}>Contact</p>
          <p className={styles.navItem}>{profileData.nickname}</p>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Log out
          </button>
        </div>
      </header>

      <div className={styles.profileContainer}>
        <div className={styles.profileCardContainer}>
          <div className={styles.profileSection}>
            <h2>Profile</h2>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input type="text" value={name || 'N/A'} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" value={email || 'N/A'} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input type="text" value={phone || 'N/A'} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>Address</label>
              <input type="text" value={address || 'N/A'} readOnly />
            </div>
            <button>Edit Profile</button>
            <div className={styles.deleteAccount}>
              <button className={styles.deleteButton}>Delete Account</button>
            </div>
          </div>

          <div className={styles.cardSection}>
            <h2>Card Information</h2>
            <div className={styles.formGroup}>
              <label>Card name</label>
              <input type="text" value={cardName || 'N/A'} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>First name</label>
              <input type="text" value={surname || 'N/A'} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>Card number</label>
              <input type="text" value={cardNumber || 'N/A'} readOnly />
            </div>
            <div className={styles.cardExpiry}>
              <div className={styles.formGroup}>
                <label>Month</label>
                <select value={cardExpiryMonth || 'N/A'} disabled>
                  <option>Select</option>
                  <option>01</option>
                  <option>02</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Year</label>
                <select value={cardExpiryYear || 'N/A'} disabled>
                  <option>Select</option>
                  <option>2024</option>
                  <option>2025</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>CVC</label>
                <input type="text" value={cvc || 'N/A'} readOnly />
              </div>
            </div>
            <button>Change Card</button>
          </div>
        </div>

        <div className={styles.ordersSection}>
          <h2>My Orders</h2>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map((order, index) => (
              <div key={index} className={styles.orderItem}>
                <div className={styles.orderStatus}>
                  <p>{order.orderStatus}</p>
                  <div className={styles.orderDetails}>
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
