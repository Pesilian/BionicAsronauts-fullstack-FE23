import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './cart.css';

interface CartItem {
  customerName: string;
  updatedAt: string;
  cartId: string;
  [key: string]: string | string[] | undefined; // Dynamiskt antal cartItems och specials
}

interface CartPopupProps {
  onClose: () => void;
  cartId: string | null;
}

const CartPopup: React.FC<CartPopupProps> = ({ onClose, cartId }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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

        const cartData = JSON.parse(cartResponse.data.body); // Parse JSON body

        console.log('Parsed cart data:', cartData);

        if (cartData && cartData.cartItems && cartData.cartItems.length > 0) {
          setCartItems(cartData.cartItems); // Sätt cartItems här om det finns
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

    fetchData();
  }, [cartId]);

  const handleCheckboxChange = (item: CartItem, isChecked: boolean) => {
    if (isChecked) {
      setSelectedItems(prevItems => [...prevItems, item]);
    } else {
      setSelectedItems(prevItems =>
        prevItems.filter(selectedItem => selectedItem !== item)
      );
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
                // Exkludera customerName, updatedAt och cartId från rendering
                if (
                  key === 'customerName' ||
                  key === 'updatedAt' ||
                  key === 'cartId'
                ) {
                  return null;
                }

                const value = item[key];

                if (Array.isArray(value)) {
                  // Om det är en array (cartItems), rendera varje item i arrayen
                  return (
                    <div key={idx}>
                      <h3>{key}:</h3>
                      {value.map((subItem, subIdx) => (
                        <p key={subIdx} className="cart-popup-item">
                          {subItem}
                        </p>
                      ))}
                    </div>
                  );
                } else {
                  // Om det är en sträng (specials)
                  return (
                    <p key={idx} className="cart-popup-item">
                      {key}: {value}
                    </p>
                  );
                }
              })}

              <input
                className="menu-popup-checkbox"
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={e => handleCheckboxChange(item, e.target.checked)}
              />
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
