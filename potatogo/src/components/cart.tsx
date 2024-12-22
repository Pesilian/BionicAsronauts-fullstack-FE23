import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/cart.css';
import OrderConfirmation from './confirmationPopUp';

interface SubItem {
  name: string;
  price: number;
}

interface CartItem {
  customerName: string;
  updatedAt: string;
  cartId: string;
  [key: string]: string | SubItem[] | undefined;
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
  const [nickname, setNickname] = useState<string>('Guest');
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderId: string;
    items: CartItem[];
    totalPrice: number;
  } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isPaymentChosen, setIsPaymentChosen] = useState<boolean>(false); 

  const fetchData = async () => {
    if (!cartIdState) {
      console.log('No cartId provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart`,
        {
          params: { cartId: cartIdState },
        }
      );

      const cartData = response.data;

      if (cartData && cartData.cartItems && cartData.cartItems.length > 0) {
        setCartItems(cartData.cartItems);
      } else {
        console.log('No valid cart data found.');
        setError('No valid cart data found.');
      }
    } catch (error) {
      setError('Cannot load data');
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

  const handleDeleteSubItem = async (
    itemKey: string,
    itemToRemoveKey: string
  ) => {
    if (!cartIdState) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.delete(
        'https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart',
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

  const calculateTotalPrice = (): number => {
    return cartItems.reduce((total, item) => {
      return (
        total +
        Object.keys(item).reduce((subTotal, key) => {
          const value = item[key];
          if (Array.isArray(value)) {
            return (
              subTotal +
              value.reduce((sum, subItem) => {
                return sum + (subItem as SubItem).price;
              }, 0)
            );
          }
          return subTotal;
        }, 0)
      );
    }, 0);
  };

  useEffect(() => {
    fetchData();
  }, [cartIdState]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPaymentMethod = e.target.value;
    setPaymentMethod(selectedPaymentMethod);
    if (selectedPaymentMethod) {
      setIsPaymentChosen(true);
    } else {
      setIsPaymentChosen(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cartIdState || !paymentMethod) return; 

    try {
      setIsLoading(true);
      setError(null);

      const customerName = cartItems[0]?.customerName || 'Guest';
      const totalPrice = calculateTotalPrice(); 

      const response = await axios.post(
        `https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/order`,
        { 
          cartId: cartIdState, 
          customerName, 
          orderNote, 
          totalPrice,
          paymentMethod 
        }
      );

      if (response.status === 200) {
        const responseBody = JSON.parse(response.data.body);
        const orderId = responseBody.orderId;

        setOrderConfirmation({
          orderId,
          items: cartItems,
          totalPrice: responseBody.totalPrice, 
        });

        await axios.delete(
          `https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart`,
          { data: { cartId: cartIdState } }
        );

        setCartIdState(null);
        localStorage.removeItem('cartId');
      } else {
        setError('Error placing order');
      }
    } catch (error) {
      setError('Error placing order or removing cart');
      console.error('Error placing order or removing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cart-popup-overlay" onClick={handleOverlayClick}>
      <div className="cart-popup-content" onClick={(e) => e.stopPropagation()}>
        {orderConfirmation ? (
          <OrderConfirmation
            orderId={orderConfirmation.orderId}
            onClose={onClose}
          />
        ) : (
          <>
            {isLoading ? (
              <p>Loading...</p>
            ) : cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div className="cart-popup-itemContainer" key={index}>
                  <p className="customer">Customer: {nickname}</p>

                  {Object.keys(item).map((key) => {
                    if (
                      key === 'customerName' ||
                      key === 'updatedAt' ||
                      key === 'cartId'
                    ) {
                      return null;
                    }

                    const value = item[key];

                    if (Array.isArray(value)) {
                      return (
                        <div key={key}>
                          {value.map((subItem, subIdx) => (
                            <div key={subIdx} className="cart-item">
                              <p>{(subItem as SubItem).name}</p>
                              <p>Price: {(subItem as SubItem).price} SEK</p>
                              <button
                                className="remove-cartItem"
                                onClick={() =>
                                  handleDeleteSubItem(item.cartId, key)
                                }
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              ))
            ) : (
              <p>No items in cart</p>
            )}

            <div className="cart-popup-total">
              <h3>Total Price: {calculateTotalPrice()} SEK</h3>
            </div>

            <form>
              <div>
                <label htmlFor="paymentMethod">Payment Method: </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <option value="">Select a method</option>
                  <option value="payInHouse">Pay at pick up</option>
                  <option value="creditCard">Credit Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {isPaymentChosen && <p>Payment Chosen: {paymentMethod}</p>}
            </form>

            <div className="cart-popup-input-container">
              <label className="order-note-header" htmlFor="order-note">
                Leave a message to the kitchen:
              </label>
              <textarea
                className="order-note"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Leave a special note for your order..."
              />
            </div>

            {error && <p>{error}</p>}

            <div className="cart-popup-actions">
              <button className="place-orderBtn" onClick={handlePlaceOrder}>
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPopup;
