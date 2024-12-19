import React from 'react';

interface OrderConfirmationProps {
  orderId: string;
  items: any[];
  onClose: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId, items, onClose }) => {
  return (
    <div className="order-confirmation-overlay">
      <div className="order-confirmation-content">
        <h2>Order Confirmation</h2>
        <p>Thank you for your order!</p>
        <p>Order Number: <strong>{orderId}</strong></p>
        
        <h3>Ordered Items:</h3>
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              {Object.keys(item)
                .filter(key => !['customerName', 'updatedAt', 'cartId'].includes(key))
                .map(key => (
                  <span key={key}>{`${item[key]}`}</span>
                ))}
            </li>
          ))}
        </ul>
        
        <button onClick={onClose} className="close-confirmationBtn">
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
