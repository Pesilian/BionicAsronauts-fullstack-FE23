import React, { useState } from 'react';
import { Order } from '../../types/orderTypes';
import ActionButtons from './actionButtons';
import styles from '../../styles/admin/orderItem.module.css';

interface OrderItemProps {
  order: Order;
}

const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDetails = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={styles.orderItem}>
      {/* Order Header - Collapsible */}
      <div className={styles.orderHeader} onClick={toggleDetails}>
        <p>
          <strong>Order ID:</strong> {order.orderId}
        </p>
        <p>
          <strong>Customer:</strong> {order.customerName}
        </p>
      </div>

      {/* Collapsible Details */}
      {isExpanded && (
        <div className={styles.orderDetails}>
          <p>
            <strong>Status:</strong> {order.orderStatus}
          </p>
          <p>
            <strong>Total Price:</strong> ${order.totalPrice}
          </p>
          <div className={styles.items}>
            <p>
              <strong>Order Items:</strong>
            </p>
            {order.orderItems.map((items, index) => (
              <p key={index}>{items.join(', ')}</p>
            ))}
          </div>
          {order.specials.length > 0 && (
            <div className={styles.specials}>
              <p>
                <strong>Specials:</strong> {order.specials.join(', ')}
              </p>
            </div>
          )}
          <ActionButtons orderId={order.orderId} />
        </div>
      )}
    </div>
  );
};

export default OrderItem;
