import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/confirmationPopUp.css';


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
        <h2 className='header'>Order Confirmation</h2>
        <p className='post-header'>Thank you for your order!</p>

        {orderDetails ? (
          <>
            <p>Order Number: {orderDetails.orderId}</p>
            <h2>Your order:</h2>
            <ul>
              <li className='order-list'>
                <div>Customer Name: {orderDetails.customerName}</div>
                <div>Order Status:{orderDetails.orderStatus}</div>

                <h2>Order Items:</h2>
                {Object.keys(orderDetails).map((key) => {
                  if (key.startsWith('orderItem')) {
                    const items = orderDetails[key]; 
                    return (
                      <div key={key}>
                        {items?.map((orderItem: any, idx: number) => (
                          <div key={idx}>
                            {orderItem.name}:{orderItem.price} SEK
                            {orderItem.toppings && orderItem.toppings.length > 0 && (
                              <div>Toppings:
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
                <div className='priceCont'>
                <p>Total Price:</p><div className='totalPrice'>  {orderDetails.totalPrice} SEK</div></div>
                <div className='noteCont'>
                <p>Order Note:</p><div className='orderNote'>{orderDetails.orderNote}</div></div>
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
