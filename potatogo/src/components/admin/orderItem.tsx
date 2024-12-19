import React, { useState } from 'react';
import { Order } from '../../types/orderTypes';
import ActionButtons from './actionButtons';
import styles from '../../styles/admin/orderItem.module.css';

interface OrderItemProps {
  order: Order;
  onDelete: () => void; // Accept onDelete as a prop
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.orderItem}>
      {/* Collapsed View */}
      <div className={styles.orderHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Customer:</strong> {order.customerName}</p>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className={styles.orderDetails}>
          {/* Order Items */}
          <div className={styles.items}>
            <p><strong>Order Items:</strong></p>
            <ul>
              {order.orderItems?.map((itemGroup, index) => (
                <li key={index}>{itemGroup.join(', ')}</li>
              )) || <li>None</li>}
            </ul>
          </div>
          
          {/* Specials */}
          <div className={styles.specials}>
            <p><strong>Specials:</strong></p>
            <ul>
              {order.specials?.map((special, index) => (
                <li key={index}>{special}</li>
              )) || <li>None</li>}
            </ul>
          </div>

          <ActionButtons orderId={order.orderId} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
};



export default OrderItem;
