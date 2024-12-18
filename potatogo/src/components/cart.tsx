import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/cart.css';

interface CartItem {
  customerName: string;
  updatedAt: string;
  cartId: string;
  [key: string]: string | string[] | undefined;
}

interface CartPopupProps {
  onClose: () => void;
  cartId: string | null;
}

const CartPopup: React.FC<CartPopupProps> = ({ onClose, cartId }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [cartIdState, setCartIdState] = useState<string | null>(cartId);
  const [nickname, setNickname] = useState<string>(''); // State for nickname

  const fetchData = async () => {
    if (!cartIdState) {
      console.log('No cartId provided');
      return;
    }
    console.log('Fetching data for cartId:', cartIdState);

    setIsLoading(true);
    setError(null);

    try {
      const cartResponse = await axios.get(
        `https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart`,
        {
          params: { cartId: cartIdState },
        }
      );

      console.log('Full cart response:', cartResponse);

      const cartData = cartResponse.data;
      const customerName = cartData.customerName;

      if (cartData && cartData.cartItems && cartData.cartItems.length > 0) {
        setCartItems(cartData.cartItems);
      } else {
        console.log('No valid cart data found.');
        setError('No valid cart data found.');
      }
    } catch (error: unknown) {
      setError('Cant load data');
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userDetails = localStorage.getItem('user');
    if (userDetails) {
      const parsedUserDetails = JSON.parse(userDetails);
      setNickname(parsedUserDetails.nickname || 'Guest');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [cartIdState]);

  const handleDeleteSubItem = async (
    itemKey: string,
    itemToRemoveKey: string
  ) => {
    if (!cartIdState) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.delete(
        `https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart`,
        {
          data: { cartId: cartIdState, itemToRemoveKey },
        }
      );

      const responseData = JSON.parse(response.data.body);

      if (
        responseData &&
        responseData.message &&
        responseData.message.includes('removed successfully')
      ) {
        console.log('Item removed successfully, fetching updated cart...');
        fetchData();
      } else {
        setError(`Failed to remove item: ${responseData.message}`);
      }
    } catch (error) {
      setError('Kunde inte ta bort objektet.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePlaceOrder = async () => {
    if (!cartIdState) return;

    try {
      setIsLoading(true);
      setError(null);

      const customerName = cartItems[0]?.customerName || 'Unknown';

      const response = await axios.post(
        `https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/order`,
        { cartId: cartIdState, customerName: customerName, orderNote }
      );

      if (response.status === 200) {
        console.log('Order placed successfully!', response);

        await axios.delete(
          `https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart`,
          { data: { cartId: cartIdState } }
        );

        const clearCartId = () => {
          setCartIdState(null);
          localStorage.removeItem('cartId');
          console.log('cartId removed from localStorage');
        };

        alert('Order placed and cart removed successfully!');
        clearCartId();
        onClose();
      } else {
        setError('Kunde inte lägga beställningen');
      }
    } catch (error) {
      setError('Kunde inte lägga beställningen');
      console.error('Error placing order or removing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cart-popup-overlay" onClick={handleOverlayClick}>
      <div className="cart-popup-content" onClick={e => e.stopPropagation()}>
        {isLoading ? (
          <p>Loading...</p>
        ) : cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div className="cart-popup-itemContainer" key={index}>
              {/* Replace customerName with nickname */}
              <p className="cart-popup-item">Customer: {nickname}</p>

              {/* rendera cartItems */}
              {Object.keys(item).map((key, idx) => {
                if (
                  key === 'customerName' ||
                  key === 'updatedAt' ||
                  key === 'cartId' ||
                  key === 'totalPrice'
                ) {
                  return null;
                }

                const value = item[key];

                if (Array.isArray(value)) {
                  return (
                    <div key={idx}>
                      {/* <h3>{key}:</h3> */}
                      {value.map((subItem, subIdx) => (
                        <div key={subIdx} className="cart-item">
                          <p className="cart-item">{subItem}</p>
                          <button
                            className="remove-cartItem"
                            onClick={() =>
                              handleDeleteSubItem(item.cartId, key)
                            }
                          >
                            Remove {subItem}
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <div key={idx} className="cart-item">
                      <p className="cart-item">{value}</p>
                      <button
                        className="remove-cartItem"
                        onClick={() => handleDeleteSubItem(item.cartId, key)}
                      >
                        Remove {key}
                      </button>
                    </div>
                  );
                }
              })}
            </div>
          ))
        ) : (
          <p>No items in cart</p>
        )}

        <div className="cart-popup-input-container">
          <label htmlFor="order-note">Order Note:</label>
          <textarea
            className="order-note"
            value={orderNote}
            onChange={e => setOrderNote(e.target.value)}
            placeholder="Leave a special note for your order..."
          />
        </div>

        {error && <p>{error}</p>}

        <div className="cart-popup-actions">
          <button className="place-orderBtn" onClick={handlePlaceOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPopup;
