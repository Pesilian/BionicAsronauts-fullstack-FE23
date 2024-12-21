import React, { useState } from 'react';
import { Order } from '../../types/orderTypes';
import ActionButtons from './actionButtons';
import styles from '../../styles/admin/orderItem.module.css';

interface OrderItemProps {
  order: Order;
  onDelete: () => void; 
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onDelete }) => {
  console.log('Order received in OrderItem:', order); // Logs the entire order object
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheckbox = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item)
        ? prev.filter((checkedItem) => checkedItem !== item)
        : [...prev, item]
    );
  };

  const handleRemoveMarked = () => {
    console.log('Items to remove:', checkedItems); // Logs the items to be removed
    setCheckedItems([]);
  };

  const handleAddItem = () => {
    console.log('Add item functionality triggered'); // Placeholder for adding item
  };

  return (
    <div className={styles.orderItem}>
      {/* Collapsed View */}
      <div className={styles.orderHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p>
          <strong>Order ID:</strong>{' '}
          <span className={styles.truncated} title={order.orderId}>
            {order.orderId.length > 5 ? `${order.orderId.slice(0, 5)}...` : order.orderId}
          </span>
        </p>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className={styles.orderDetails}>
          {/* Order Items with Checkboxes */}
          <div className={styles.items}>
            <p><strong>Order Items:</strong></p>
            <ul>
              {order.orderItems?.length ? (
                order.orderItems.map((itemGroup, index) => {
                  console.log(`Item group ${index}:`, itemGroup); // Logs each group of items
                  return (
                    <li key={index}>
                      {itemGroup.map((item, idx) => {
                        console.log(`Item in group ${index}, item ${idx}:`, item); // Logs each item in the group
                        return (
                          <div key={`${item}-${idx}`}>
                            <input
                              type="checkbox"
                              checked={checkedItems.includes(item)}
                              onChange={() => toggleCheckbox(item)}
                            />
                            <span>{item}</span>
                          </div>
                        );
                      })}
                    </li>
                  );
                })
              ) : (
                <li>None</li>
              )}
            </ul>

            <button onClick={handleRemoveMarked}>Remove Marked</button>
            <button onClick={handleAddItem}>Add to Items</button>
          </div>

          {/* Specials */}
          <div className={styles.specials}>
            <p><strong>Specials:</strong></p>
            <ul>
              {order.specials?.length ? (
                order.specials.map((special, index) => {
                  console.log(`Special ${index}:`, special); // Logs each special item
                  return <li key={index}>{special}</li>;
                })
              ) : (
                <li>None</li>
              )}
            </ul>
          </div>

          <ActionButtons orderId={order.orderId} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
};

export default OrderItem;
