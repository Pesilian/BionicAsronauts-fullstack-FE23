import React, { useState } from 'react';
import { Order } from '../../types/orderTypes';
import { updateOrders } from '../../api/ordersApi'; // Import your update API
import ActionButtons from './actionButtons';
import styles from '../../styles/admin/orderItem.module.css';

interface OrderItemProps {
  order: Order;
  onDelete: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checkedToppings, setCheckedToppings] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState(order.orderStatus);
  const [loading, setLoading] = useState(false);

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

  const handleRemoveMarkedItems = () => {
    console.log('Order items to remove:', checkedItems);
    setCheckedItems([]);
  };

  const handleRemoveMarkedToppings = () => {
    console.log('Toppings to remove:', checkedToppings);
    setCheckedToppings([]);
  };

  const handleAddToItem = () => {
    console.log('Add to item functionality triggered');
  };

  const handleUpdateStatus = async () => {
    setLoading(true); // Start loading
    try {
      console.log('Updating status to:', newStatus);

      // Call the updateOrders API
      const updatedOrder = await updateOrders(order.orderId, {
        orderStatus: newStatus,
        orderItems: order.orderItems, // Preserve current items
        totalPrice: order.totalPrice, // Preserve total price
        orderNote: order.orderNote, // Preserve order note
      });

      console.log('Order updated successfully:', updatedOrder);

      // Update the local order status
      order.orderStatus = newStatus;
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Error updating order status. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      onDelete();
    }
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
          {/* Order Items with Toppings and Checkboxes */}
          <div className={styles.items}>
            <p><strong>Order Items:</strong></p>
            <ul>
              {order.orderItems.map((item, itemIndex) => (
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
            <button onClick={handleRemoveMarkedToppings}>Remove Marked Toppings</button>
            <button onClick={handleAddToItem}>Add to Item</button>
            <button onClick={handleRemoveMarkedItems}>Remove Marked Items</button>
          </div>

          {/* Order Note */}
          {order.orderNote && (
            <div className={styles.orderNote}>
              <p><strong>Note:</strong> {order.orderNote}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <ActionButtons orderId={order.orderId} onDelete={handleDelete} />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className={styles.statusDropdown}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button onClick={handleUpdateStatus} disabled={loading}>
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItem;
