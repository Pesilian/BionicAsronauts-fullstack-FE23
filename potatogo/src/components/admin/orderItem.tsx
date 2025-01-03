import React, { useState, useEffect } from 'react';
import { Order } from '../../types/orderTypes';
import { updateOrders } from '../../api/ordersApi';
import ActionButtons from './actionButtons';
import styles from '../../styles/admin/orderItem.module.css';

interface OrderItemProps {
  order: Order;
  onDelete: () => void;
  isHighlighted?: boolean;
  onStatusUpdate?: (newStatus: string, orderId: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({
  order,
  onDelete,
  isHighlighted = false,
  onStatusUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checkedToppings, setCheckedToppings] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState(order.orderStatus);

  useEffect(() => {
    if (isHighlighted) {
      setIsExpanded(true);
    }
  }, [isHighlighted]);

  const toggleCheckbox = (item: string, isTopping: boolean = false) => {
    if (isTopping) {
      setCheckedToppings((prev) =>
        prev.includes(item)
          ? prev.filter((checkedItem) => checkedItem !== item)
          : [...prev, item]
      );
    } else {
      setCheckedItems((prev) =>
        prev.includes(item)
          ? prev.filter((checkedItem) => checkedItem !== item)
          : [...prev, item]
      );
    }
  };

  const handleOrderUpdate = async () => {
    try {
      // Map numberedOrderItems to backend-compatible keys and remove `id`
      const orderItemsMapped: Record<string, { name: string; price: number; toppings: string[] }> = {};
      order.numberedOrderItems.forEach((item, index) => {
        const { id, ...rest } = item; // Exclude `id` here
        orderItemsMapped[`orderItem${index + 1}`] = rest;
      });
  
      const payload = {
        orderId: order.orderId,
        updates: {
          orderStatus: newStatus,
          ...orderItemsMapped,
          totalPrice: order.totalPrice,
          orderNote: order.orderNote,
        },
        remove: checkedItems,
      };
  
      console.log('Prepared payload:', payload);
  
      const updatedOrder = await updateOrders(payload);
  
      console.log('Order updated successfully:', updatedOrder);
  
      if (onStatusUpdate) {
        onStatusUpdate(newStatus, order.orderId);
      }
  
      alert('Order updated successfully.');
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Error updating order. Please try again.');
    }
  };
  
  
  // Placeholder functions for marked items and toppings
  const handleRemoveMarkedItems = () => {
    console.log('Selected items to remove:', checkedItems);
  };

  const handleRemoveMarkedToppings = () => {
    console.log('Selected toppings to remove:', checkedToppings);
  };

  return (
    <div
      className={`${styles.orderItem} ${isHighlighted ? styles.highlighted : ''}`}
    >
      {/* Collapsed View */}
      <div className={styles.orderHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <span title={order.orderId}>
          {order.orderId.length > 5 ? `${order.orderId.slice(0, 5)}...` : order.orderId}
        </span>
        <span>{order.customerName}</span>
        <span title={new Date(order.createdAt).toLocaleString()}>
          @: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span title={order.modifiedAt ? new Date(order.modifiedAt).toLocaleString() : ''}>
          @: {order.modifiedAt ? new Date(order.modifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </span>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className={styles.orderDetails}>
          {/* Order Items with Checkboxes */}
          <div className={styles.items}>
            <p><strong>Order Items:</strong></p>
            <ul>
              {order.numberedOrderItems.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <p>
                    <strong>{item.name}</strong> - ${item.price}
                  </p>
                  <ul>
                    {item.toppings.map((topping, toppingIndex) => (
                      <li key={`${itemIndex}-${toppingIndex}`}>
                        <input
                          type="checkbox"
                          checked={checkedToppings.includes(topping)}
                          onChange={() => toggleCheckbox(topping, true)}
                        />
                        <span>{topping}</span>
                      </li>
                    ))}
                  </ul>
                  <input
                    type="checkbox"
                    checked={checkedItems.includes(item.name)}
                    onChange={() => toggleCheckbox(item.name)}
                  />
                  <span>Mark this item</span>
                </li>
              ))}
            </ul>
            <button onClick={handleRemoveMarkedToppings}>Log Marked Toppings</button>
            <button onClick={handleRemoveMarkedItems}>Log Marked Items</button>
          </div>

          {/* Order Note */}
          {order.orderNote && (
            <div className={styles.orderNote}>
              <p><strong>Note:</strong> {order.orderNote}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <ActionButtons orderId={order.orderId} onDelete={onDelete} />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className={styles.statusDropdown}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button onClick={handleOrderUpdate}>
              Update Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItem;
