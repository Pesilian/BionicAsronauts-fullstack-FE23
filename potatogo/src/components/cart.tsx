import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './cart.css';

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

  const fetchData = async () => {
    if (!cartId) {
      console.log('No cartId provided');
      return;
    }
    console.log('Fetching data for cartId:', cartId);

    setIsLoading(true);
    setError(null);

    try {
      const cartResponse = await axios.post(
        `https://c7d8k8kv2g.execute-api.eu-north-1.amazonaws.com/default/linasTest`,
        { cartId }
      );

      const cartData = JSON.parse(cartResponse.data.body);

      console.log('Parsed cart data:', cartData);

      if (cartData && cartData.cartItems && cartData.cartItems.length > 0) {
        setCartItems(cartData.cartItems);
      } else {
        console.log('No valid cart data found.');
        setError('No valid cart data found.');
      }
    } catch (error: unknown) {
      setError('Kunde inte ladda data.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cartId]);

  const handleDeleteSubItem = async (
    itemKey: string,
    itemToRemoveKey: string
  ) => {
    if (!cartId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.delete(
        `https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart`,
        {
          data: { cartId, itemToRemoveKey },
        }
      );

      console.log('Delete response:', response.data);

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

  return (
    <div className="cart-popup-overlay" onClick={handleOverlayClick}>
      <div className="cart-popup-content" onClick={e => e.stopPropagation()}>
        {isLoading ? (
          <p>Loading...</p>
        ) : cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div className="cart-popup-itemContainer" key={index}>
              <p className="cart-popup-item">Customer: {item.customerName}</p>
              <p className="cart-popup-item">Updated At: {item.updatedAt}</p>

              {/* Dynamiskt rendera cartItems */}
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
                      <h3>{key}:</h3>
                      {value.map((subItem, subIdx) => (
                        <div
                          key={subIdx}
                          className="cart-popup-subItemContainer"
                        >
                          <p className="cart-popup-item">{subItem}</p>
                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDeleteSubItem(item.cartId, key)
                            }
                          >
                            Ta bort {subItem}
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <div key={idx} className="cart-popup-subItemContainer">
                      <p className="cart-popup-item">
                        {key}: {value}
                      </p>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteSubItem(item.cartId, key)}
                      >
                        Ta bort {key}
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

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default CartPopup;
