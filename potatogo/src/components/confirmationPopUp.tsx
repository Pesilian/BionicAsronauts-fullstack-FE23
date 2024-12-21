import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div className="order-confirmation-overlay">
      <div className="order-confirmation-content">
        <h2>Order Confirmation</h2>
        <p>Thank you for your order!</p>

        {orderDetails ? (
          <>
            <p>Order Number: <strong>{orderDetails.orderId}</strong></p>
            <h3>Your order:</h3>
            <ul>
              <li>
                <div><strong>Customer Name:</strong> {orderDetails.customerName}</div>
                <div><strong>Order Status:</strong> {orderDetails.orderStatus}</div>

                <h4>Order Items:</h4>
                {Object.keys(orderDetails).map((key) => {
                  if (key.startsWith('orderItem')) {
                    const items = orderDetails[key]; 
                    return (
                      <div key={key}>
                        {items?.map((orderItem: any, idx: number) => (
                          <div key={idx}>
                            <strong>{orderItem.name}:</strong> {orderItem.price} SEK
                            {orderItem.toppings && orderItem.toppings.length > 0 && (
                              <div>
                                <strong>Toppings:</strong>
                                {orderItem.toppings.map((topping: string, toppingIdx: number) => (
                                  <div key={toppingIdx}>{topping}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })}
                <div><strong>Total Price:</strong> {orderDetails.totalPrice} SEK</div>
                <div><strong>Order Note:</strong> {orderDetails.orderNote}</div>
              </li>
            </ul>
          </>
        ) : (
          <p>No order details found.</p>
        )}

        <button onClick={onClose} className="close-confirmationBtn">
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
