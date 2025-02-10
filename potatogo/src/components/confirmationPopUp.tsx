import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/confirmationPopUp.module.css';

interface OrderConfirmationProps {
  orderId: string;
  onClose: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId, onClose }) => {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/order?orderId=${orderId}`
        );
        console.log('API Response:', response.data);  

        const parsedData = response.data.body;
        const order = parsedData.items[0]; 
        const orderDetails = order;
        console.log(Object.keys(orderDetails));
        Object.keys(orderDetails).map((key) => {
          const items = orderDetails[key];
          console.log("items in order:", items);
          if (key.startsWith('orderItem')) {
            if (Array.isArray(items)) {
              items.forEach((item: any) => {
                console.log("item in items:", item);
              });
            } else if (items && typeof items === 'object') {
              console.log("item in items:", items);
            }
          }
        });
        console.log('Parsed Order:', order);
        setOrderDetails(order); 
        setIsLoading(false);
      } catch (error) {
        setError('Failed to fetch order details');
        setIsLoading(false); 
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.orderConfirmationOverlay}>
      <div className={styles.orderConfirmationContent}>
        <h2 className={styles.header}>Order Confirmation</h2>
        <p className={styles.postHeader}>Thank you for your order!</p>

        {orderDetails ? (
          <>
            <p>Order Number: {orderDetails.orderId}</p>
            <h2>Your order:</h2>
            <ul>
              <li className={styles.orderList}>
                <div>Customer Name: {orderDetails.customerName}</div>
                <div>Order Status:{orderDetails.orderStatus}</div>

                <h2>Order Items:</h2>
                {Object.keys(orderDetails).map((key) => {
                  if (key.startsWith('orderItem')) {
                    const item = orderDetails[key]; 
                    return (
                      <div key={key}>
                        {
                          <div>
                            {item.name}:{item.price} SEK
                            {item.toppings && item.toppings.length > 0 && (
                              <div>Toppings:
                                {item.toppings.map((topping: string, toppingIdx: number) => (
                                  <div key={toppingIdx}>{topping}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        }
                      </div>
                    );
                  }
                  return null;
                })}
                <div className={styles.priceCont}>
                  <p>Total Price:</p><div className={styles.totalPrice}>  {orderDetails.totalPrice} SEK</div>
                </div>
                <div className={styles.noteCont}>
                  <p>Order Note:</p><div className={styles.orderNote}>{orderDetails.orderNote}</div>
                </div>
              </li>
            </ul>
          </>
        ) : (
          <p>No order details found.</p>
        )}

        <button onClick={onClose} className={styles.closeConfirmationBtn}>
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
