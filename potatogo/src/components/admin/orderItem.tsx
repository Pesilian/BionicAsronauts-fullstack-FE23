import React, { useState } from 'react';
import { Order } from '../../types/orderTypes';
import ActionButtons from './actionButtons';
import styles from '../../styles/admin/orderItem.module.css';

interface OrderItemProps {
  order: Order;
  onDelete: () => void; // Accept onDelete as a prop
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false); // Toggle dropdown visibility

  return (
    <div className={styles.orderItem}>
      {/* Header Section - Toggle Dropdown */}
      <div className={styles.orderHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Customer:</strong> {order.customerName}</p>
      </div>

      {/* Collapsible Section */}
      {isExpanded && (
        <div className={styles.orderDetails}>
          <p><strong>Status:</strong> {order.orderStatus}</p>
          <p><strong>Specials:</strong> {order.specials?.join(', ') || 'None'}</p>
          <p><strong>Created At:</strong> {order.createdAt}</p>

          {/* Action Buttons */}
          <ActionButtons orderId={order.orderId} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
};

export default OrderItem;
