import React from 'react';
import { Order } from '../../types/orderTypes';
import ActionButtons from './actionButtons'; // Placeholder for action buttons
import styles from '../../styles/admin/orderItem.module.css';

interface OrderItemProps {
  order: Order;
}

const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  return (
    <div className={styles.orderItem}>
      <div className={styles.orderHeader}>
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Status:</strong> {order.orderStatus}</p>
      </div>
      <p><strong>Customer:</strong> {order.customerName}</p>
      <p><strong>Total Price:</strong> ${order.totalPrice}</p>
      <div className={styles.items}>
        <p><strong>Order Items:</strong></p>
        {order.orderItems.map((items, index) => (
          <p key={index}>{items.join(', ')}</p>
        ))}
      </div>
      <div className={styles.specials}>
        {order.specials.length > 0 && (
          <>
            <p><strong>Specials:</strong></p>
            <p>{order.specials.join(', ')}</p>
          </>
        )}
      </div>
      <ActionButtons orderId={order.orderId} />
    </div>
  );
};

export default OrderItem;
