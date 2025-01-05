import React, { useState, useEffect } from 'react';
import { Order } from '../../types/orderTypes';
import { updateOrders } from '../../api/ordersApi';
import ActionButtons from './actionButtons';
import styles from '../../styles/admin/orderItem.module.css';
import {fetchMenu} from '../../api/ordersApi'
import AddItemsOverlay from './addItemsOverlay';

interface MenuItem {//add import later
  menuItem: string;
  category: string;
  price?: number | null;
}

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
  const [checkedToppings, setCheckedToppings] = useState<Record<string, string[]>>({});
  const [newStatus, setNewStatus] = useState(order.orderStatus);

  useEffect(() => {
    if (isHighlighted) {
      setIsExpanded(true);
    }
  }, [isHighlighted]);

  const toggleCheckbox = (item: string, isTopping: boolean = false, parentItemId?: string) => {
    if (isTopping && parentItemId) {
      setCheckedToppings((prev) => {
        const currentToppings = prev[parentItemId] || [];
        return {
          ...prev,
          [parentItemId]: currentToppings.includes(item)
            ? currentToppings.filter((topping) => topping !== item)
            : [...currentToppings, item],
        };
      });
    } else {
      setCheckedItems((prev) =>
        prev.includes(item)
          ? prev.filter((checkedItem) => checkedItem !== item)
          : [...prev, item]
      );
    }
  };
  
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [toppingsUpdates, setToppingsUpdates] = useState<Record<string, { add: string[]; remove: string[] }>>({});


  const openOverlay = async (itemId: string) => {
    console.log('Button clicked, itemId:', itemId); // Debug log
    try {
      const { Menu } = await fetchMenu();
      setMenu(Menu);
      setCurrentItemId(itemId);
      setIsOverlayOpen(true);
      console.log('isOverlayOpen set to true');
      console.log('Fetched menu:', Menu);

    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };
  
  
  const handleAddItems = (selectedItems: MenuItem[]) => {
    const newToppings = selectedItems.map((item) => item.menuItem);
  
    // Update the toppings for the specific item in numberedOrderItems
    const updatedOrderItems = order.numberedOrderItems.map((item) => {
      if (item.id === currentItemId) {
        return {
          ...item,
          toppings: [...item.toppings, ...newToppings], // Add new toppings
        };
      }
      return item;
    });
  
    // Ensure the key is properly prefixed with "orderItem" only once
    const currentKey = currentItemId?.startsWith("orderItem")
      ? currentItemId
      : `orderItem${currentItemId}`;
  
    // Track added toppings for payload preparation
    setToppingsUpdates((prev) => {
      const current = prev[currentKey] || { add: [], remove: [] }; // Ensure both add and remove exist
      return {
        ...prev,
        [currentKey]: {
          add: [...current.add, ...newToppings],
          remove: current.remove, // Keep the existing remove array
        },
      };
    });
  
    // Update the local order object
    order.numberedOrderItems = updatedOrderItems;
    setIsOverlayOpen(false); // Close the overlay after adding
  };
  
  
  
  
  
  
  // const handleAddToppings = (newToppings: string[], itemId: string) => {
  //   const updatedOrderItems = order.numberedOrderItems.map((item) => {
  //     if (item.id === itemId) {
  //       // Merge existing toppings with new ones, avoiding duplicates
  //       const updatedToppings = Array.from(new Set([...item.toppings, ...newToppings]));
  //       console.log(`Updated toppings for item ${itemId}:`, updatedToppings); // Log changes
  //       return { ...item, toppings: updatedToppings };
  //     }
  //     return item;
  //   });
  
  //   // Update the state with the updated order items
  //   const updatedOrder = { ...order, numberedOrderItems: updatedOrderItems };
  //   console.log('Updated order:', updatedOrder);
  // };
  
  

  const handleOrderUpdate = async () => {
    try {
      const updates: Record<string, any> = {};
      const remove: string[] = [];
  
      // Process toppings additions and removals
      Object.keys(toppingsUpdates).forEach((key) => {
        const { add, remove: removeToppings } = toppingsUpdates[key];
      
        // Only add changes if there are additions or removals
        if (add.length > 0 || removeToppings.length > 0) {
          if (!updates[key]) {
            updates[key] = {};
          }
          updates[key].toppings = {
            ...(add.length > 0 ? { add } : {}),
            ...(removeToppings.length > 0 ? { remove: removeToppings } : {}),
          };
        }        
      });
      
      console.log('Toppings Updates:', toppingsUpdates);
      
      // Handle fully removed items (checked items)
      checkedItems.forEach((itemId) => {
        remove.push(`orderItem${itemId}`);
      });
  
      // Add order-level updates (status, note)
      if (newStatus !== order.orderStatus) {
        updates.orderStatus = newStatus;
      }
      if (order.orderNote) {
        updates.orderNote = order.orderNote;
      }
  
      // Create the payload
      console.log('Toppings Updates Before Payload:', toppingsUpdates);

      const payload = {
        orderId: order.orderId,
        updates,
        remove,
      };
      console.log('Payload Being Prepared:', {
        orderId: order.orderId,
        updates,
        remove,
      });
     
  
      // Send the update request
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
  
  
  
  
  
  const handleRemoveMarkedToppings = () => {
    const updatedOrderItems = order.numberedOrderItems.filter((item) => {
      if (checkedItems.includes(item.id)) {
        // Entire item is marked for removal
        console.log(`Removing entire item ${item.id}`);
  
        // Remove its entry from toppingsUpdates
        setToppingsUpdates((prev) => {
          const updated = { ...prev };
          delete updated[`orderItem${item.id}`];
          return updated;
        });
  
        return false; // Exclude the item from the updated list
      }
  
      if (checkedToppings[item.id]?.length) {
        const removedToppings = checkedToppings[item.id];
  
        // Update toppingsUpdates with the removed toppings
        setToppingsUpdates((prev) => {
          const current = prev[`orderItem${item.id}`] || { add: [], remove: [] };
          return {
            ...prev,
            [`orderItem${item.id}`]: {
              ...current,
              remove: [...current.remove, ...removedToppings],
            },
          };
        });
  
        // Remove marked toppings from the item
        const updatedToppings = item.toppings.filter(
          (topping) => !removedToppings.includes(topping)
        );
  
        console.log(`Removed toppings for item ${item.id}:`, removedToppings);
  
        // Update the item with the filtered toppings
        item.toppings = updatedToppings;
      }
  
      return true; // Keep the item if it’s not fully removed
    });
  
    // Clear marked items and toppings after processing
    setCheckedItems([]);
    setCheckedToppings({});
  
    // Update the local order object
    order.numberedOrderItems = updatedOrderItems;
  
    // Log updated state
    console.log('Updated order items locally:', updatedOrderItems);
    console.log('Updated toppingsUpdates:', toppingsUpdates);
  };
  
  
  
  


  return (
    <div
      className={`${styles.orderItem} ${isHighlighted ? styles.highlighted : ''}`}
    >
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
  
      {isExpanded && (
        <div className={styles.orderDetails}>
          <div className={styles.items}>
            <div className={styles.cardContainer}>
                {order.numberedOrderItems.map((item, index) => (
                  <div key={index} className={styles.itemCard}>
                    <p><strong>{item.name}</strong> - ${item.price}</p>
                    <input className={styles.itemCheckbox}
                      type="checkbox"
                      checked={checkedItems.includes(item.id)}
                      onChange={() => toggleCheckbox(item.id)}
                    />
                    <ul title="Toppings:" className={styles.toppings}>
                      {item.toppings.map((topping, idx) => (
                        <li key={idx} className={styles.topping}>
                          <input className={styles.toppingCheckbox}
                            type="checkbox"
                            checked={(checkedToppings[item.id] || []).includes(topping)}
                            onChange={() => toggleCheckbox(topping, true, item.id)}
                          />
                          <span>{topping}</span>
                        </li>
                      ))}
                    </ul>

                    <button onClick={() => openOverlay(item.id)} className={styles.addToppingButton}>
                      Add More
                    </button>

                    <button onClick={handleRemoveMarkedToppings}>Log Marked Toppings</button>
                  </div>
                ))}
            </div>            
          </div>
          {/* <button onClick={handleRemoveMarkedItems}>Log Marked Items</button> */}
          <div className={styles.orderNote}>
            <textarea
              value={order.orderNote || ''}
              readOnly
              placeholder="No notes added."
            />
          </div>
  
          <div className={styles.actionButtonsRow}>
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
            <button
              onClick={handleOrderUpdate}
              className={styles.updateOrderButton}
            >
              Update Order
            </button>
          </div>
        </div>
      )}
            {isOverlayOpen && (
        <AddItemsOverlay
          menu={menu}
          onAddItems={handleAddItems}
          onClose={() => setIsOverlayOpen(false)}
        />
      )}

    </div>
  );  
};

export default OrderItem;
